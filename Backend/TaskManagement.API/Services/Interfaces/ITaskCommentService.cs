using TaskManagement.API.DTOs.Comments;

namespace TaskManagement.API.Services.Interfaces;

public interface ITaskCommentService
{
    Task<List<TaskCommentDto>> GetAllByTaskIdAsync(
        Guid taskId,
        Guid userId);

    Task<TaskCommentDto> CreateAsync(
        Guid taskId,
        Guid userId,
        CreateTaskCommentDto createTaskCommentDto);

    Task<TaskCommentDto?> UpdateAsync(
        Guid commentId,
        Guid userId,
        UpdateTaskCommentDto updateTaskCommentDto);

    Task<bool> DeleteAsync(
        Guid commentId,
        Guid userId);
}