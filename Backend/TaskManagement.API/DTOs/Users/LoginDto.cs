using System.ComponentModel.DataAnnotations;

namespace TaskManagement.API.DTOs.Users;

public class LoginDto
{
    [Required]
    [MaxLength(50)]
    public string Username { get; set; } = string.Empty;


    [Required]
    [MinLength(6)]
    [MaxLength(100)]
    public string Password { get; set; } = string.Empty;
}