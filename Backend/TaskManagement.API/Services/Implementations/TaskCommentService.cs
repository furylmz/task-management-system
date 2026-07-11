using AutoMapper;
using Microsoft.EntityFrameworkCore;
using TaskManagement.API.Data;
using TaskManagement.API.DTOs.Comments;
using TaskManagement.API.Exceptions;
using TaskManagement.API.Models;
using TaskManagement.API.Services.Interfaces;

namespace TaskManagement.API.Services.Implementations;

public class TaskCommentService : ITaskCommentService
{
    private readonly ApplicationDbContext _context;
    private readonly IMapper _mapper;

    public TaskCommentService(
        ApplicationDbContext context,
        IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<List<TaskCommentDto>> GetAllByTaskIdAsync(
        Guid taskId,
        Guid userId)
    {
        var taskExists = await _context.Tasks.AnyAsync(x =>
            x.Id == taskId &&
            x.UserId == userId);

        if (!taskExists)
        {
            throw new NotFoundException("Task not found.");
        }

        var comments = await _context.Comments
            .Where(x => x.TaskId == taskId)
            .OrderBy(x => x.CreatedAt)
            .ToListAsync();

        return _mapper.Map<List<TaskCommentDto>>(comments);
    }

    public async Task<TaskCommentDto> CreateAsync(
        Guid taskId,
        Guid userId,
        CreateTaskCommentDto createTaskCommentDto)
    {
        var taskExists = await _context.Tasks.AnyAsync(x =>
            x.Id == taskId &&
            x.UserId == userId);

        if (!taskExists)
        {
            throw new NotFoundException("Task not found.");
        }

        var comment = _mapper.Map<TaskComment>(
            createTaskCommentDto);

        comment.Id = Guid.NewGuid();
        comment.TaskId = taskId;
        comment.UserId = userId;
        comment.CreatedAt = DateTime.UtcNow;

        _context.Comments.Add(comment);
        await _context.SaveChangesAsync();

        return _mapper.Map<TaskCommentDto>(comment);
    }

    public async Task<TaskCommentDto?> UpdateAsync(
        Guid commentId,
        Guid userId,
        UpdateTaskCommentDto updateTaskCommentDto)
    {
        var comment = await _context.Comments
            .FirstOrDefaultAsync(x =>
                x.Id == commentId &&
                x.UserId == userId);

        if (comment == null)
        {
            return null;
        }

        comment.Comment = updateTaskCommentDto.Comment;

        await _context.SaveChangesAsync();

        return _mapper.Map<TaskCommentDto>(comment);
    }

    public async Task<bool> DeleteAsync(
        Guid commentId,
        Guid userId)
    {
        var comment = await _context.Comments
            .FirstOrDefaultAsync(x =>
                x.Id == commentId &&
                x.UserId == userId);

        if (comment == null)
        {
            return false;
        }

        _context.Comments.Remove(comment);
        await _context.SaveChangesAsync();

        return true;
    }
}