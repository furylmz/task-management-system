using AutoMapper;
using Microsoft.EntityFrameworkCore;
using TaskManagement.API.Data;
using TaskManagement.API.DTOs.Users;
using TaskManagement.API.Models;
using TaskManagement.API.Services.Interfaces;

namespace TaskManagement.API.Services.Implementations;

public class UserService : IUserService
{
    private readonly ApplicationDbContext _context;
    private readonly IMapper _mapper;

    public UserService(ApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<UserDto?> GetByIdAsync(Guid id)
    {
        var user = await _context.Users.FindAsync(id);

        return user == null ? null : _mapper.Map<UserDto>(user);
    }

    public async Task<UserDto?> GetByUsernameAsync(string username)
    {
        var user = await _context.Users
            .FirstOrDefaultAsync(x => x.Username == username);

        return user == null ? null : _mapper.Map<UserDto>(user);
    }

    public async Task<UserDto> CreateAsync(CreateUserDto createUserDto)
    {
        var usernameExists = await _context.Users
            .AnyAsync(x => x.Username == createUserDto.Username);

        if (usernameExists)
        {
            throw new InvalidOperationException("Username is already taken.");
        }

        var emailExists = await _context.Users
            .AnyAsync(x => x.Email == createUserDto.Email);

        if (emailExists)
        {
            throw new InvalidOperationException("Email is already taken.");
        }

        var user = _mapper.Map<User>(createUserDto);

        user.Id = Guid.NewGuid();
        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(createUserDto.Password);
        user.CreatedAt = DateTime.UtcNow;
        user.UpdatedAt = DateTime.UtcNow;
        user.IsActive = true;

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        return _mapper.Map<UserDto>(user);
    }

    public async Task<UserDto?> UpdateAsync(Guid id, UpdateUserDto updateUserDto)
    {
        var user = await _context.Users.FindAsync(id);

        if (user == null)
        {
            return null;
        }

        var usernameExists = await _context.Users
            .AnyAsync(x => x.Username == updateUserDto.Username && x.Id != id);

        if (usernameExists)
        {
            throw new InvalidOperationException("Username is already taken.");
        }

        user.Username = updateUserDto.Username;
        user.FirstName = updateUserDto.FirstName;
        user.LastName = updateUserDto.LastName;
        user.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return _mapper.Map<UserDto>(user);
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var user = await _context.Users.FindAsync(id);

        if (user == null)
        {
            return false;
        }

        _context.Users.Remove(user);

        await _context.SaveChangesAsync();

        return true;
    }

    public async Task<UserDto?> AuthenticateAsync(LoginDto loginDto)
    {
        var user = await _context.Users
            .FirstOrDefaultAsync(x => x.Username == loginDto.Username);

        if (user == null || !user.IsActive)
        {
            return null;
        }

        var passwordIsValid = BCrypt.Net.BCrypt.Verify(
            loginDto.Password,
            user.PasswordHash);

        if (!passwordIsValid)
        {
            return null;
        }

        return _mapper.Map<UserDto>(user);
    }
}