using Johar.Data.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Johar.Data.Configurations;

public class ArtworkImageConfiguration : IEntityTypeConfiguration<ArtworkImage>
{
    public void Configure(EntityTypeBuilder<ArtworkImage> builder)
    {
        builder.ToTable("ArtworkImages");

        builder.HasKey(i => i.Id);

        builder.Property(i => i.CloudinaryPublicId)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(i => i.SecureUrl)
            .IsRequired()
            .HasMaxLength(500);

        builder.Property(i => i.Width)
            .IsRequired();

        builder.Property(i => i.Height)
            .IsRequired();

        builder.Property(i => i.Format)
            .HasMaxLength(20);

        builder.Property(i => i.AspectRatio)
            .HasPrecision(5, 2);

        builder.Property(i => i.IsPrimary)
            .HasDefaultValue(false);

        builder.Property(i => i.DisplayOrder)
            .HasDefaultValue(0);

        // AltText is nullable in DB to allow saving incomplete drafts,
        // but validated as strictly required before publishing.
        builder.Property(i => i.AltText)
            .HasMaxLength(255)
            .IsRequired(false);

        // Cascade delete: deleting artwork removes all child image records
        builder.HasOne(i => i.Artwork)
            .WithMany(a => a.Images)
            .HasForeignKey(i => i.ArtworkId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
