namespace TaskManagement.API.DTOs.Comments;

public class TaskCommentDto
{
    public Guid Id { get; set; }

    public Guid TaskId { get; set; }

    public Guid UserId { get; set; }

    public string Comment { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; }
}