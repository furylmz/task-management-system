using System.ComponentModel.DataAnnotations;
using TaskManagement.API.Enums;

namespace TaskManagement.API.DTOs.Tasks;

public class UpdateTaskDto
{
    [Required]
    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    public string? Description { get; set; }

    public Priority Priority { get; set; }

    public TaskItemStatus Status { get; set; }

    public DateTime? DueDate { get; set; }

    public Guid? CategoryId { get; set; }
}