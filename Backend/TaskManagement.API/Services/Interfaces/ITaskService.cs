using TaskManagement.API.DTOs.Tasks;

namespace TaskManagement.API.Services.Interfaces;

public interface ITaskService
{
    Task<List<TaskItemDto>> GetAllByUserIdAsync(Guid userId);

    Task<TaskItemDto?> GetByIdAsync(Guid id, Guid userId);

    Task<TaskItemDto> CreateAsync(Guid userId, CreateTaskDto createTaskDto);

    Task<TaskItemDto?> UpdateAsync(Guid id, Guid userId, UpdateTaskDto updateTaskDto);

    Task<bool> DeleteAsync(Guid id, Guid userId);

    Task<List<TaskItemDto>> FilterAsync(Guid userId, TaskFilterDto filterDto);
}