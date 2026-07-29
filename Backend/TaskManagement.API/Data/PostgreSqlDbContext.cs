using Microsoft.EntityFrameworkCore;

namespace TaskManagement.API.Data;

public class PostgreSqlDbContext : ApplicationDbContext
{
    public PostgreSqlDbContext(DbContextOptions<PostgreSqlDbContext> options)
        : base(options)
    {
    }
}
