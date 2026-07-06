using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TaskManagement.API.Models;

namespace TaskManagement.API.Configurations;

public class TaskCommentConfiguration : IEntityTypeConfiguration<TaskComment>
{
       public void Configure(EntityTypeBuilder<TaskComment> builder)
       {
              builder.HasKey(x => x.Id);

              builder.Property(x => x.Comment)
                     .IsRequired();

              builder.Property(x => x.CreatedAt)
                     .HasDefaultValueSql("CURRENT_TIMESTAMP");

              builder.HasOne(x => x.TaskItem)
                     .WithMany(x => x.Comments)
                     .HasForeignKey(x => x.TaskId)
                     .OnDelete(DeleteBehavior.Cascade);

              builder.HasOne(x => x.User)
                     .WithMany(x => x.Comments)
                     .HasForeignKey(x => x.UserId)
                     .OnDelete(DeleteBehavior.Cascade);
       }
}