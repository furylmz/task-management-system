using System.ComponentModel.DataAnnotations;

namespace TaskManagement.API.DTOs.Comments;

public class CreateTaskCommentDto
{
    [Required]
    [MaxLength(1000)]
    public string Comment { get; set; } = string.Empty;
}