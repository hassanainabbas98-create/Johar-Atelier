using Johar.Data.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Johar.Data.Configurations;

public class InquiryConfiguration : IEntityTypeConfiguration<Inquiry>
{
    public void Configure(EntityTypeBuilder<Inquiry> builder)
    {
        builder.ToTable("Inquiries");

        builder.HasKey(i => i.Id);

        builder.Property(i => i.InquiryType)
            .HasConversion<string>()
            .HasMaxLength(30)
            .IsRequired();

        builder.Property(i => i.ClientName)
            .IsRequired()
            .HasMaxLength(150);

        builder.Property(i => i.Email)
            .IsRequired()
            .HasMaxLength(256);

        builder.Property(i => i.Phone)
            .HasMaxLength(50);

        builder.Property(i => i.ClientLocation)
            .HasMaxLength(150);

        builder.Property(i => i.MediumPreference)
            .HasMaxLength(100);

        builder.Property(i => i.DesiredDimensions)
            .HasMaxLength(100);

        builder.Property(i => i.DesiredTimeline)
            .HasMaxLength(100);

        builder.Property(i => i.Message)
            .IsRequired();

        builder.Property(i => i.Status)
            .HasConversion<string>()
            .HasMaxLength(30)
            .IsRequired()
            .HasDefaultValue(InquiryStatus.New);

        builder.Property(i => i.ArtistNotes);

        builder.Property(i => i.CreatedAt)
            .IsRequired();

        // Performance index for inbox filtering and chronological sorting
        builder.HasIndex(i => new { i.Status, i.CreatedAt });

        // Relational constraint: inquiry remains even if referenced artwork is deleted
        builder.HasOne(i => i.Artwork)
            .WithMany(a => a.Inquiries)
            .HasForeignKey(i => i.ArtworkId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}
