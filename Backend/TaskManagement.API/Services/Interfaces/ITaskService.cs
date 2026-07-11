using TaskManagement.API.DTOs.Common;
using TaskManagement.API.DTOs.Tasks;

namespace TaskManagement.API.Services.Interfaces;

public interface ITaskService
{
    Task<TaskItemDto?> GetByIdAsync(Guid id, Guid userId);

    Task<TaskItemDto> CreateAsync(Guid userId, CreateTaskDto createTaskDto);

    Task<TaskItemDto?> UpdateAsync(Guid id, Guid userId, UpdateTaskDto updateTaskDto);

    Task<bool> DeleteAsync(Guid id, Guid userId);

    Task<PagedResultDto<TaskItemDto>> FilterAsync(Guid userId, TaskFilterDto filterDto);

    Task<List<TaskItemDto>> GetOverdueAsync(Guid userId);

    Task<TaskStatisticsDto> GetStatisticsAsync(Guid userId);
}