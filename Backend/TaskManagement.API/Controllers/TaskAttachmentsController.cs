using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TaskManagement.API.DTOs.Attachments;
using TaskManagement.API.Exceptions;
using TaskManagement.API.Services.Interfaces;

namespace TaskManagement.API.Controllers;

[ApiController]
[Route("api")]
[Authorize]
public class TaskAttachmentsController : ControllerBase
{
    private readonly ITaskAttachmentService _attachmentService;

    public TaskAttachmentsController(
        ITaskAttachmentService attachmentService)
    {
        _attachmentService = attachmentService;
    }

    [HttpGet("tasks/{taskId:guid}/attachments")]
    public async Task<ActionResult<List<TaskAttachmentDto>>> GetAll(
        Guid taskId)
    {
        var userId = GetUserId();

        var attachments = await _attachmentService
            .GetAllByTaskIdAsync(taskId, userId);

        return Ok(attachments);
    }

    [HttpPost("tasks/{taskId:guid}/attachments")]
    [Consumes("multipart/form-data")]
    public async Task<ActionResult<TaskAttachmentDto>> Upload(
        Guid taskId,
        [FromForm] TaskAttachmentUploadDto uploadDto)
    {
        var userId = GetUserId();

        var attachment = await _attachmentService.UploadAsync(
            taskId,
            userId,
            uploadDto);

        return Ok(attachment);
    }

    [HttpGet("attachments/{attachmentId:guid}/download")]
    public async Task<IActionResult> Download(Guid attachmentId)
    {
        var userId = GetUserId();

        var download = await _attachmentService.DownloadAsync(
            attachmentId,
            userId);

        return File(
            download.FileStream,
            download.ContentType,
            download.FileName);
    }

    [HttpDelete("attachments/{attachmentId:guid}")]
    public async Task<IActionResult> Delete(Guid attachmentId)
    {
        var userId = GetUserId();

        var deleted = await _attachmentService.DeleteAsync(
            attachmentId,
            userId);

        if (!deleted)
        {
            return NotFound(new
            {
                message = "Attachment not found."
            });
        }

        return NoContent();
    }

    private Guid GetUserId()
    {
        var userIdValue = User.FindFirstValue(
            ClaimTypes.NameIdentifier);

        if (!Guid.TryParse(userIdValue, out var userId))
        {
            throw new UnauthorizedException(
                "User identifier is missing or invalid.");
        }

        return userId;
    }
}