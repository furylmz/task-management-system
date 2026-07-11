using System.ComponentModel.DataAnnotations;

namespace TaskManagement.API.DTOs.Comments;

public class UpdateTaskCommentDto
{
    [Required]
    [MaxLength(1000)]
    public string Comment { get; set; } = string.Empty;
}