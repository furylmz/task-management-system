using TaskManagement.API.DTOs.Attachments;

namespace TaskManagement.API.Services.Interfaces;

public interface ITaskAttachmentService
{
    Task<List<TaskAttachmentDto>> GetAllByTaskIdAsync(
        Guid taskId,
        Guid userId);

    Task<TaskAttachmentDto> UploadAsync(
        Guid taskId,
        Guid userId,
        TaskAttachmentUploadDto uploadDto);

    Task<TaskAttachmentDownloadDto> DownloadAsync(
        Guid attachmentId,
        Guid userId);

    Task<bool> DeleteAsync(
        Guid attachmentId,
        Guid userId);
}