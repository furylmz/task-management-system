using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TaskManagement.API.DTOs.Tasks;
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

    [HttpPost]
    public async Task<ActionResult<TaskItemDto>> Create(
        CreateTaskDto createTaskDto)
    {
        var userId = GetUserId();

        try
        {
            var task = await _taskService.CreateAsync(
                userId,
                createTaskDto);

            return Ok(task);
        }
        catch (InvalidOperationException exception)
        {
            return BadRequest(new { message = exception.Message });
        }
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<TaskItemDto>> Update(
        Guid id,
        UpdateTaskDto updateTaskDto)
    {
        var userId = GetUserId();

        try
        {
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
        catch (InvalidOperationException exception)
        {
            return BadRequest(new { message = exception.Message });
        }
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
    public async Task<ActionResult<List<TaskItemDto>>> Filter(
        [FromQuery] TaskFilterDto filterDto)
    {
        var userId = GetUserId();

        var tasks = await _taskService.FilterAsync(userId, filterDto);

        return Ok(tasks);
    }

    private Guid GetUserId()
    {
        var userIdValue = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (!Guid.TryParse(userIdValue, out var userId))
        {
            throw new UnauthorizedAccessException(
                "User identifier is missing or invalid.");
        }

        return userId;
    }
}