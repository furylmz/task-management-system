using System.ComponentModel.DataAnnotations;
using TaskManagement.API.Enums;

namespace TaskManagement.API.DTOs.Tasks;

public class TaskFilterDto
{
    public string? SearchTerm { get; set; }

    public Priority? Priority { get; set; }

    public TaskItemStatus? Status { get; set; }

    public Guid? CategoryId { get; set; }

    public DateTime? DueDate { get; set; }


    [Range(1, int.MaxValue)]
    public int PageNumber { get; set; } = 1;


    [Range(1, 100)]
    public int PageSize { get; set; } = 10;
}