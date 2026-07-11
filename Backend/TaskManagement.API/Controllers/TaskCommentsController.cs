using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TaskManagement.API.DTOs.Comments;
using TaskManagement.API.Exceptions;
using TaskManagement.API.Services.Interfaces;

namespace TaskManagement.API.Controllers;

[ApiController]
[Route("api")]
[Authorize]
public class TaskCommentsController : ControllerBase
{
    private readonly ITaskCommentService _taskCommentService;

    public TaskCommentsController(ITaskCommentService taskCommentService)
    {
        _taskCommentService = taskCommentService;
    }

    [HttpGet("tasks/{taskId:guid}/comments")]
    public async Task<ActionResult<List<TaskCommentDto>>> GetAll(Guid taskId)
    {
        var userId = GetUserId();

        var comments = await _taskCommentService
            .GetAllByTaskIdAsync(taskId, userId);

        return Ok(comments);
    }

    [HttpPost("tasks/{taskId:guid}/comments")]
    public async Task<ActionResult<TaskCommentDto>> Create(
        Guid taskId,
        CreateTaskCommentDto createTaskCommentDto)
    {
        var userId = GetUserId();

        var comment = await _taskCommentService.CreateAsync(
            taskId,
            userId,
            createTaskCommentDto);

        return Ok(comment);
    }

    [HttpPut("comments/{commentId:guid}")]
    public async Task<ActionResult<TaskCommentDto>> Update(
        Guid commentId,
        UpdateTaskCommentDto updateTaskCommentDto)
    {
        var userId = GetUserId();

        var comment = await _taskCommentService.UpdateAsync(
            commentId,
            userId,
            updateTaskCommentDto);

        if (comment == null)
        {
            return NotFound(new { message = "Comment not found." });
        }

        return Ok(comment);
    }

    [HttpDelete("comments/{commentId:guid}")]
    public async Task<IActionResult> Delete(Guid commentId)
    {
        var userId = GetUserId();

        var deleted = await _taskCommentService.DeleteAsync(
            commentId,
            userId);

        if (!deleted)
        {
            return NotFound(new { message = "Comment not found." });
        }

        return NoContent();
    }

    private Guid GetUserId()
    {
        var userIdValue = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (!Guid.TryParse(userIdValue, out var userId))
        {
            throw new UnauthorizedException(
                "User identifier is missing or invalid.");
        }

        return userId;
    }
}