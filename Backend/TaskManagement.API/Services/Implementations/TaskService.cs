using AutoMapper;
using Microsoft.EntityFrameworkCore;
using TaskManagement.API.Data;
using TaskManagement.API.DTOs.Tasks;
using TaskManagement.API.Services.Interfaces;
using TaskManagement.API.Enums;
using TaskManagement.API.Models;

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

    public async Task<List<TaskItemDto>> GetAllByUserIdAsync(Guid userId)
    {
        var tasks = await _context.Tasks
            .Where(x => x.UserId == userId)
            .ToListAsync();

        return _mapper.Map<List<TaskItemDto>>(tasks);
    }

    public async Task<TaskItemDto?> GetByIdAsync(Guid id, Guid userId)
    {
        var task = await _context.Tasks
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
                throw new InvalidOperationException("Category not found.");
            }
        }

        var task = _mapper.Map<TaskItem>(createTaskDto);

        task.Id = Guid.NewGuid();
        task.UserId = userId;
        task.Status = TaskItemStatus.Pending;
        task.CreatedAt = DateTime.UtcNow;
        task.UpdatedAt = DateTime.UtcNow;
        task.CompletedAt = null;

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
                throw new InvalidOperationException("Category not found.");
            }
        }

        task.Title = updateTaskDto.Title;
        task.Description = updateTaskDto.Description;
        task.Priority = updateTaskDto.Priority;
        task.DueDate = updateTaskDto.DueDate;
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

    public async Task<List<TaskItemDto>> FilterAsync(Guid userId, TaskFilterDto filterDto)
    {
        IQueryable<TaskItem> query = _context.Tasks
            .Where(x => x.UserId == userId);

        if (!string.IsNullOrWhiteSpace(filterDto.SearchTerm))
        {
            query = query.Where(x =>
                x.Title.Contains(filterDto.SearchTerm) ||
                (x.Description != null &&
                 x.Description.Contains(filterDto.SearchTerm)));
        }

        if (filterDto.Priority.HasValue)
        {
            query = query.Where(x => x.Priority == filterDto.Priority);
        }

        if (filterDto.Status.HasValue)
        {
            query = query.Where(x => x.Status == filterDto.Status);
        }

        if (filterDto.CategoryId.HasValue)
        {
            query = query.Where(x => x.CategoryId == filterDto.CategoryId);
        }

        if (filterDto.DueDate.HasValue)
        {
            query = query.Where(x => x.DueDate == filterDto.DueDate);
        }

        var tasks = await query.ToListAsync();

        return _mapper.Map<List<TaskItemDto>>(tasks);
    }
}