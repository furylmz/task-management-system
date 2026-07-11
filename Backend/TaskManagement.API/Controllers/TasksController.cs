using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TaskManagement.API.DTOs.Common;
using TaskManagement.API.DTOs.Tasks;
using TaskManagement.API.Exceptions;
using TaskManagement.API.Services.Interfaces;

namespace TaskManagement.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class TasksController : ControllerBase
{
    private readonly ITaskService _taskService;

    public TasksController(ITaskService taskService)
    {
        _taskService = taskService;
    }

    [HttpGet]
    public async Task<ActionResult<List<TaskItemDto>>> GetAll()
    {
        var userId = GetUserId();

        var tasks = await _taskService.GetAllByUserIdAsync(userId);

        return Ok(tasks);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<TaskItemDto>> GetById(Guid id)
    {
        var userId = GetUserId();

        var task = await _taskService.GetByIdAsync(id, userId);

        if (task == null)
        {
            return NotFound(new { message = "Task not found." });
        }

        return Ok(task);
    }

    [HttpGet("overdue")]
    public async Task<ActionResult<List<TaskItemDto>>> GetOverdue()
    {
        var userId = GetUserId();

        var tasks = await _taskService.GetOverdueAsync(userId);

        return Ok(tasks);
    }

    [HttpGet("statistics")]
    public async Task<ActionResult<TaskStatisticsDto>> GetStatistics()
    {
        var userId = GetUserId();

        var statistics = await _taskService.GetStatisticsAsync(userId);

        return Ok(statistics);
    }

    [HttpPost]
    public async Task<ActionResult<TaskItemDto>> Create(
        CreateTaskDto createTaskDto)
    {
        var userId = GetUserId();

        var task = await _taskService.CreateAsync(
            userId,
            createTaskDto);

        return Ok(task);
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<TaskItemDto>> Update(
        Guid id,
        UpdateTaskDto updateTaskDto)
    {
        var userId = GetUserId();

        var task = await _taskService.UpdateAsync(
            id,
            userId,
            updateTaskDto);

        if (task == null)
        {
            return NotFound(new { message = "Task not found." });
        }

        return Ok(task);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var userId = GetUserId();

        var deleted = await _taskService.DeleteAsync(id, userId);

        if (!deleted)
        {
            return NotFound(new { message = "Task not found." });
        }

        return NoContent();
    }

    [HttpGet("filter")]
    public async Task<ActionResult<PagedResult<TaskItemDto>>> Filter(
    [FromQuery] TaskFilterDto filterDto)
    {
        var userId = GetUserId();

        var result = await _taskService.FilterAsync(
            userId,
            filterDto);

        return Ok(result);
    }

    private Guid GetUserId()
    {
        var userIdValue = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (!Guid.TryParse(userIdValue, out var userId))
        {
            throw new UnauthorizedException("User identifier is missing or invalid.");
        }

        return userId;
    }
}