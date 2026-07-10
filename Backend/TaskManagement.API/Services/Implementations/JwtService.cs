using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using TaskManagement.API.Services.Interfaces;
using TaskManagement.API.Exceptions;

namespace TaskManagement.API.Services.Implementations;

public class JwtService : IJwtService
{
    private readonly IConfiguration _configuration;

    public JwtService(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public string GenerateToken(Guid userId, string username)
    {
        var secretKey = _configuration["Jwt:SecretKey"]
            ?? throw new ConfigurationException("JWT secret key is missing.");

        var issuer = _configuration["Jwt:Issuer"]
            ?? throw new ConfigurationException("JWT issuer is missing.");

        var audience = _configuration["Jwt:Audience"]
            ?? throw new ConfigurationException("JWT audience is missing.");

        var expiryInMinutes = _configuration.GetValue<int>("Jwt:ExpiryInMinutes");

        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, userId.ToString()),
            new(ClaimTypes.NameIdentifier, userId.ToString()),
            new(ClaimTypes.Name, username),
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        var key = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(secretKey));

        var credentials = new SigningCredentials(
            key,
            SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: issuer,
            audience: audience,
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(expiryInMinutes),
            signingCredentials: credentials);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}