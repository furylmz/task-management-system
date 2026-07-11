using AutoMapper;
using Microsoft.EntityFrameworkCore;
using TaskManagement.API.Data;
using TaskManagement.API.DTOs.Attachments;
using TaskManagement.API.Exceptions;
using TaskManagement.API.Models;
using TaskManagement.API.Services.Interfaces;

namespace TaskManagement.API.Services.Implementations;

public class TaskAttachmentService : ITaskAttachmentService
{
    private const long MaximumFileSize = 10 * 1024 * 1024; // 10 MB

    private static readonly HashSet<string> AllowedExtensions =
    [
        ".pdf",
        ".doc",
        ".docx",
        ".xls",
        ".xlsx",
        ".txt",
        ".jpg",
        ".jpeg",
        ".png"
    ];

    private readonly ApplicationDbContext _context;
    private readonly IMapper _mapper;
    private readonly IWebHostEnvironment _environment;

    public TaskAttachmentService(
        ApplicationDbContext context,
        IMapper mapper,
        IWebHostEnvironment environment)
    {
        _context = context;
        _mapper = mapper;
        _environment = environment;
    }

    public async Task<List<TaskAttachmentDto>> GetAllByTaskIdAsync(
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

        var attachments = await _context.Attachments
            .Where(x => x.TaskId == taskId)
            .OrderByDescending(x => x.UploadedAt)
            .ToListAsync();

        return _mapper.Map<List<TaskAttachmentDto>>(attachments);
    }

    public async Task<TaskAttachmentDto> UploadAsync(
        Guid taskId,
        Guid userId,
        TaskAttachmentUploadDto uploadDto)
    {
        var taskExists = await _context.Tasks.AnyAsync(x =>
            x.Id == taskId &&
            x.UserId == userId);

        if (!taskExists)
        {
            throw new NotFoundException("Task not found.");
        }

        var file = uploadDto.File;

        if (file.Length == 0)
        {
            throw new InvalidOperationException("The uploaded file is empty.");
        }

        if (file.Length > MaximumFileSize)
        {
            throw new InvalidOperationException(
                "The file size cannot exceed 10 MB.");
        }

        var extension = Path.GetExtension(file.FileName).ToLowerInvariant();

        if (string.IsNullOrWhiteSpace(extension) ||
            !AllowedExtensions.Contains(extension))
        {
            throw new InvalidOperationException(
                "This file type is not supported.");
        }

        var uploadDirectory = Path.Combine(
            _environment.ContentRootPath,
            "Uploads",
            "Tasks",
            taskId.ToString());

        Directory.CreateDirectory(uploadDirectory);

        var storedFileName = $"{Guid.NewGuid()}{extension}";

        var physicalFilePath = Path.Combine(
            uploadDirectory,
            storedFileName);

        await using (var fileStream = new FileStream(
            physicalFilePath,
            FileMode.Create))
        {
            await file.CopyToAsync(fileStream);
        }

        var attachment = new TaskAttachment
        {
            Id = Guid.NewGuid(),
            TaskId = taskId,
            FileName = Path.GetFileName(file.FileName),
            FilePath = physicalFilePath,
            FileSize = file.Length,
            ContentType = file.ContentType,
            UploadedAt = DateTime.UtcNow
        };

        try
        {
            _context.Attachments.Add(attachment);
            await _context.SaveChangesAsync();
        }
        catch
        {
            if (File.Exists(physicalFilePath))
            {
                File.Delete(physicalFilePath);
            }

            throw;
        }

        return _mapper.Map<TaskAttachmentDto>(attachment);
    }

    public async Task<TaskAttachmentDownloadDto> DownloadAsync(
    Guid attachmentId,
    Guid userId)
    {
        var attachment = await _context.Attachments
            .Include(x => x.TaskItem)
            .FirstOrDefaultAsync(x =>
                x.Id == attachmentId &&
                x.TaskItem.UserId == userId);

        if (attachment == null)
        {
            throw new NotFoundException("Attachment not found.");
        }

        if (!File.Exists(attachment.FilePath))
        {
            throw new NotFoundException(
                "The attachment file could not be found.");
        }

        var fileStream = new FileStream(
            attachment.FilePath,
            FileMode.Open,
            FileAccess.Read,
            FileShare.Read);

        return new TaskAttachmentDownloadDto
        {
            FileStream = fileStream,
            FileName = attachment.FileName,
            ContentType = string.IsNullOrWhiteSpace(attachment.ContentType)
                ? "application/octet-stream"
                : attachment.ContentType
        };
    }

    public async Task<bool> DeleteAsync(
        Guid attachmentId,
        Guid userId)
    {
        var attachment = await _context.Attachments
            .Include(x => x.TaskItem)
            .FirstOrDefaultAsync(x =>
                x.Id == attachmentId &&
                x.TaskItem.UserId == userId);

        if (attachment == null)
        {
            return false;
        }

        _context.Attachments.Remove(attachment);
        await _context.SaveChangesAsync();

        if (File.Exists(attachment.FilePath))
        {
            File.Delete(attachment.FilePath);
        }

        return true;
    }
}