namespace TaskManagement.API.Services.Interfaces;

public interface IJwtService
{
    string GenerateToken(Guid userId, string username);
}