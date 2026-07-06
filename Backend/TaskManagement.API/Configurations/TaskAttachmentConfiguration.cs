using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TaskManagement.API.Models;

namespace TaskManagement.API.Configurations;

public class TaskAttachmentConfiguration : IEntityTypeConfiguration<TaskAttachment>
{
    public void Configure(EntityTypeBuilder<TaskAttachment> builder)
    {
        builder.HasKey(x => x.Id);

        builder.Property(x => x.FileName)
               .IsRequired()
               .HasMaxLength(255);

        builder.Property(x => x.FilePath)
               .IsRequired()
               .HasMaxLength(500);

        builder.Property(x => x.ContentType)
               .IsRequired()
               .HasMaxLength(100);

        builder.Property(x => x.UploadedAt)
               .HasDefaultValueSql("CURRENT_TIMESTAMP");

        builder.HasOne(x => x.TaskItem)
               .WithMany(x => x.Attachments)
               .HasForeignKey(x => x.TaskId)
               .OnDelete(DeleteBehavior.Cascade);
    }
}