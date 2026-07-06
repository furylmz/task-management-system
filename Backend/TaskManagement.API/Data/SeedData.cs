using Microsoft.EntityFrameworkCore;
using TaskManagement.API.Models;

namespace TaskManagement.API.Data;

public static class SeedData
{
    public static async Task InitializeAsync(IServiceProvider serviceProvider)
    {
        using var scope = serviceProvider.CreateScope();

        var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

        if (await context.Users.AnyAsync(x => x.Username == "demo"))
            return;

        var demoUser = new User
        {
            Id = Guid.Parse("11111111-1111-1111-1111-111111111111"),
            Username = "demo",
            Email = "demo@taskmanagement.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Demo123!"),
            FirstName = "Demo",
            LastName = "User",
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
            IsActive = true
        };

        context.Users.Add(demoUser);
        await context.SaveChangesAsync();
    }
}