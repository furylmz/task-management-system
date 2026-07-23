using AutoMapper;
using Microsoft.EntityFrameworkCore;
using TaskManagement.API.Data;
using TaskManagement.API.DTOs.Tasks;
using TaskManagement.API.Services.Interfaces;
using TaskManagement.API.Enums;
using TaskManagement.API.Models;
using TaskManagement.API.Exceptions;
using TaskManagement.API.DTOs.Common;

namespace TaskManagement.API.Services.Implementations;

public class TaskService : ITaskService
{
    private readonly ApplicationDbContext _context;
    private readonly IMapper _mapper;

    public TaskService(ApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<TaskItemDto?> GetByIdAsync(Guid id, Guid userId)
    {
        var task = await _context.Tasks
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == id && x.UserId == userId);

        return task == null ? null : _mapper.Map<TaskItemDto>(task);
    }

    public async Task<TaskItemDto> CreateAsync(Guid userId, CreateTaskDto createTaskDto)
    {
        if (createTaskDto.CategoryId.HasValue)
        {
            var categoryExists = await _context.Categories.AnyAsync(x =>
                x.Id == createTaskDto.CategoryId &&
                x.UserId == userId);

            if (!categoryExists)
            {
                throw new NotFoundException("Category not found.");
            }
        }

        var task = _mapper.Map<TaskItem>(createTaskDto);

        task.Id = Guid.NewGuid();
        task.UserId = userId;
        task.Status = TaskItemStatus.Pending;
        task.CreatedAt = DateTime.UtcNow;
        task.UpdatedAt = DateTime.UtcNow;
        task.CompletedAt = null;

        task.DueDate = NormalizeToUtc(createTaskDto.DueDate);

        _context.Tasks.Add(task);

        await _context.SaveChangesAsync();

        return _mapper.Map<TaskItemDto>(task);
    }

    public async Task<TaskItemDto?> UpdateAsync(Guid id, Guid userId, UpdateTaskDto updateTaskDto)
    {
        var task = await _context.Tasks
            .FirstOrDefaultAsync(x => x.Id == id && x.UserId == userId);

        if (task == null)
        {
            return null;
        }

        if (updateTaskDto.CategoryId.HasValue)
        {
            var categoryExists = await _context.Categories.AnyAsync(x =>
                x.Id == updateTaskDto.CategoryId &&
                x.UserId == userId);

            if (!categoryExists)
            {
                throw new NotFoundException("Category not found.");
            }
        }

        task.Title = updateTaskDto.Title;
        task.Description = updateTaskDto.Description;
        task.Priority = updateTaskDto.Priority;
        task.CategoryId = updateTaskDto.CategoryId;

        if (task.Status != updateTaskDto.Status)
        {
            task.Status = updateTaskDto.Status;

            if (task.Status == TaskItemStatus.Completed)
            {
                task.CompletedAt = DateTime.UtcNow;
            }
            else
            {
                task.CompletedAt = null;
            }
        }

        task.UpdatedAt = DateTime.UtcNow;

        task.DueDate = NormalizeToUtc(updateTaskDto.DueDate);

        await _context.SaveChangesAsync();

        return _mapper.Map<TaskItemDto>(task);
    }

    public async Task<bool> DeleteAsync(Guid id, Guid userId)
    {
        var task = await _context.Tasks
            .FirstOrDefaultAsync(x => x.Id == id && x.UserId == userId);

        if (task == null)
        {
            return false;
        }

        _context.Tasks.Remove(task);

        await _context.SaveChangesAsync();

        return true;
    }

    public async Task<PagedResultDto<TaskItemDto>> FilterAsync(
    Guid userId,
    TaskFilterDto filterDto)
    {
        IQueryable<TaskItem> query = _context.Tasks
            .AsNoTracking()
            .Where(x => x.UserId == userId);

        if (!string.IsNullOrWhiteSpace(filterDto.SearchTerm))
        {
            var searchTerm = filterDto.SearchTerm.Trim();

            query = query.Where(x =>
                x.Title.Contains(searchTerm) ||
                (x.Description != null &&
                 x.Description.Contains(searchTerm)));
        }

        if (filterDto.Priority.HasValue)
        {
            query = query.Where(x =>
                x.Priority == filterDto.Priority.Value);
        }

        if (filterDto.Status.HasValue)
        {
            query = query.Where(x =>
                x.Status == filterDto.Status.Value);
        }

        if (filterDto.CategoryId.HasValue)
        {
            query = query.Where(x =>
                x.CategoryId == filterDto.CategoryId.Value);
        }

        if (filterDto.DueDate.HasValue)
        {
            var date = filterDto.DueDate.Value.Date;
            var nextDate = date.AddDays(1);

            query = query.Where(x =>
                x.DueDate >= date &&
                x.DueDate < nextDate);
        }

        var totalCount = await query.CountAsync();

        query = (filterDto.SortBy, filterDto.Descending) switch
        {
            (TaskSortField.Title, false) =>
                query.OrderBy(x => x.Title)
                     .ThenBy(x => x.Id),

            (TaskSortField.Title, true) =>
                query.OrderByDescending(x => x.Title)
                     .ThenBy(x => x.Id),

            (TaskSortField.Priority, false) =>
                query.OrderBy(x => x.Priority)
                     .ThenBy(x => x.Id),

            (TaskSortField.Priority, true) =>
                query.OrderByDescending(x => x.Priority)
                     .ThenBy(x => x.Id),

            (TaskSortField.Status, false) =>
                query.OrderBy(x => x.Status)
                     .ThenBy(x => x.Id),

            (TaskSortField.Status, true) =>
                query.OrderByDescending(x => x.Status)
                     .ThenBy(x => x.Id),

            (TaskSortField.DueDate, false) =>
                query.OrderBy(x => x.DueDate == null)
                    .ThenBy(x => x.DueDate)
                    .ThenBy(x => x.Id),

            (TaskSortField.DueDate, true) =>
                query.OrderBy(x => x.DueDate == null)
                     .ThenByDescending(x => x.DueDate)
                     .ThenBy(x => x.Id),

            (TaskSortField.CreatedAt, false) =>
                query.OrderBy(x => x.CreatedAt)
                     .ThenBy(x => x.Id),

            _ =>
                query.OrderByDescending(x => x.CreatedAt)
                     .ThenBy(x => x.Id)
        };

        var tasks = await query
            .Skip((filterDto.PageNumber - 1) * filterDto.PageSize)
            .Take(filterDto.PageSize)
            .ToListAsync();

        return new PagedResultDto<TaskItemDto>
        {
            Items = _mapper.Map<List<TaskItemDto>>(tasks),
            PageNumber = filterDto.PageNumber,
            PageSize = filterDto.PageSize,
            TotalCount = totalCount,
            TotalPages = (int)Math.Ceiling(
                totalCount / (double)filterDto.PageSize)
        };
    }


    //Zaman dilimi unspecified olanları UTC zaman dilimine cevirme
    private static DateTime? NormalizeToUtc(DateTime? dateTime)
    {
        if (!dateTime.HasValue)
        {
            return null;
        }

        return dateTime.Value.Kind switch
        {
            DateTimeKind.Utc => dateTime.Value,
            DateTimeKind.Local => dateTime.Value.ToUniversalTime(),
            DateTimeKind.Unspecified =>
                DateTime.SpecifyKind(dateTime.Value, DateTimeKind.Utc),
            _ => dateTime.Value
        };
    }

    public async Task<List<TaskItemDto>> GetOverdueAsync(Guid userId)
    {
        var now = DateTime.UtcNow;

        var tasks = await _context.Tasks
            .AsNoTracking()
            .Where(x =>
                x.UserId == userId &&
                x.DueDate.HasValue &&
                x.DueDate.Value < now &&
                x.Status != TaskItemStatus.Completed &&
                x.Status != TaskItemStatus.Cancelled)
            .OrderBy(x => x.DueDate)
            .ToListAsync();

        return _mapper.Map<List<TaskItemDto>>(tasks);
    }

    public async Task<TaskStatisticsDto> GetStatisticsAsync(Guid userId)
    {
        var now = DateTime.UtcNow;

        var userTasks = _context.Tasks
            .AsNoTracking()
            .Where(x => x.UserId == userId);

        var totalTasks = await userTasks.CountAsync();

        var pendingTasks = await userTasks.CountAsync(
            x => x.Status == TaskItemStatus.Pending);

        var inProgressTasks = await userTasks.CountAsync(
            x => x.Status == TaskItemStatus.InProgress);

        var completedTasks = await userTasks.CountAsync(
            x => x.Status == TaskItemStatus.Completed);

        var cancelledTasks = await userTasks.CountAsync(
            x => x.Status == TaskItemStatus.Cancelled);

        var overdueTasks = await userTasks.CountAsync(x =>
            x.DueDate.HasValue &&
            x.DueDate.Value < now &&
            x.Status != TaskItemStatus.Completed &&
            x.Status != TaskItemStatus.Cancelled);

        var completionRate = totalTasks == 0
            ? 0
            : Math.Round(
                completedTasks * 100.0 / totalTasks,
                2);

        return new TaskStatisticsDto
        {
            TotalTasks = totalTasks,
            PendingTasks = pendingTasks,
            InProgressTasks = inProgressTasks,
            CompletedTasks = completedTasks,
            CancelledTasks = cancelledTasks,
            OverdueTasks = overdueTasks,
            CompletionRate = completionRate
        };
    }
}