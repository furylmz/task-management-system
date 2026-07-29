using Microsoft.EntityFrameworkCore;

namespace TaskManagement.API.Data;

public class OracleDbContext : ApplicationDbContext
{
    public OracleDbContext(DbContextOptions<OracleDbContext> options)
        : base(options)
    {
    }
}
