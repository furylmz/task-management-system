using System.ComponentModel.DataAnnotations;

namespace TaskManagement.API.DTOs.Categories;

public class UpdateCategoryDto
{
    [Required]
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;

    public string? Description { get; set; }


    [Required]
    [MaxLength(7)]
    public string Color { get; set; } = "#007bff";
}