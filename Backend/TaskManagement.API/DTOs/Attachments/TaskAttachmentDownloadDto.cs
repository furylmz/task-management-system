namespace TaskManagement.API.DTOs.Attachments;

public class TaskAttachmentDownloadDto
{
    public Stream FileStream { get; set; } = Stream.Null;

    public string FileName { get; set; } = string.Empty;

    public string ContentType { get; set; } =
        "application/octet-stream";
}