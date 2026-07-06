using System.ComponentModel.DataAnnotations;

namespace TaskManagement.API.DTOs.Users;

public class UpdateUserDto
{
    [Required]
    [MaxLength(50)]
    public string Username { get; set; } = string.Empty;


    [Required]
    [MaxLength(50)]
    public string FirstName { get; set; } = string.Empty;


    [Required]
    [MaxLength(50)]
    public string LastName { get; set; } = string.Empty;
}