using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;

namespace TaskManagement.API.DTOs.Attachments;

public class TaskAttachmentUploadDto
{
    [Required]
    public IFormFile File { get; set; } = null!;
}