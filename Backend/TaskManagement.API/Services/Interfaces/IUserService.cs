using TaskManagement.API.DTOs.Users;

namespace TaskManagement.API.Services.Interfaces;

public interface IUserService
{
    Task<UserDto?> GetByIdAsync(Guid id);

    Task<UserDto?> GetByUsernameAsync(string username);

    Task<UserDto> CreateAsync(CreateUserDto createUserDto);

    Task<UserDto?> UpdateAsync(Guid id, UpdateUserDto updateUserDto);

    Task<bool> DeleteAsync(Guid id);
}