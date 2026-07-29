using Microsoft.EntityFrameworkCore;
using TaskManagement.API.Models;
using TaskManagement.API.Configurations;

namespace TaskManagement.API.Data;

public class ApplicationDbContext : DbContext
{
    protected ApplicationDbContext(DbContextOptions options)
        : base(options)
    {
    }
    public DbSet<User> Users { get; set; }
    public DbSet<Category> Categories { get; set; }
    public DbSet<TaskItem> Tasks { get; set; }
    public DbSet<TaskAttachment> Attachments { get; set; }
    public DbSet<TaskComment> Comments { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.ApplyConfiguration(new UserConfiguration());
        modelBuilder.ApplyConfiguration(new CategoryConfiguration());
        modelBuilder.ApplyConfiguration(new TaskItemConfiguration());
        modelBuilder.ApplyConfiguration(new TaskAttachmentConfiguration());
        modelBuilder.ApplyConfiguration(new TaskCommentConfiguration());
    }
}