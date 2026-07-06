using System.ComponentModel.DataAnnotations;

namespace TaskManagement.API.DTOs.Users;

public class CreateUserDto
{
    [Required]
    [MaxLength(50)]
    public string Username { get; set; } = string.Empty;


    [Required]
    [MaxLength(100)]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;


    [Required]
    [MinLength(6)]
    [MaxLength(100)]
    public string Password { get; set; } = string.Empty;


    [Required]
    [MaxLength(50)]
    public string FirstName { get; set; } = string.Empty;


    [Required]
    [MaxLength(50)]
    public string LastName { get; set; } = string.Empty;
}