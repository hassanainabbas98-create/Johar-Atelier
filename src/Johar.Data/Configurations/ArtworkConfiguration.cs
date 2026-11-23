using Johar.Data.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Johar.Data.Configurations;

public class ArtworkConfiguration : IEntityTypeConfiguration<Artwork>
{
    public void Configure(EntityTypeBuilder<Artwork> builder)
    {
        builder.ToTable("Artworks");

        builder.HasKey(a => a.Id);

        builder.Property(a => a.Title)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(a => a.Slug)
            .IsRequired()
            .HasMaxLength(220);

        builder.HasIndex(a => a.Slug)
            .IsUnique();

        builder.Property(a => a.Medium)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(a => a.DimensionsHeight)
            .HasPrecision(6, 2)
            .IsRequired();

        builder.Property(a => a.DimensionsWidth)
            .HasPrecision(6, 2)
            .IsRequired();

        builder.Property(a => a.DimensionsDepth)
            .HasPrecision(6, 2);

        builder.Property(a => a.DimensionUnit)
            .IsRequired()
            .HasMaxLength(10)
            .HasDefaultValue("cm");

        builder.Property(a => a.YearCreated)
            .IsRequired();

        builder.Property(a => a.CatalogReference)
            .HasMaxLength(50);

        builder.Property(a => a.AvailabilityStatus)
            .HasConversion<string>()
            .HasMaxLength(30)
            .IsRequired()
            .HasDefaultValue(AvailabilityStatus.Available);

        builder.Property(a => a.IsFramed)
            .HasDefaultValue(false);

        builder.Property(a => a.IsFeatured)
            .HasDefaultValue(false);

        builder.Property(a => a.IsPublished)
            .HasDefaultValue(false);

        builder.Property(a => a.DisplayOrder)
            .HasDefaultValue(0);

        builder.Property(a => a.Story);

        builder.Property(a => a.CreatedAt)
            .IsRequired();

        builder.Property(a => a.UpdatedAt)
            .IsRequired();

        // Performance query composite indexes
        builder.HasIndex(a => new { a.IsPublished, a.IsFeatured });
        builder.HasIndex(a => new { a.CategoryId, a.IsPublished });

        // Relational constraints
        builder.HasOne(a => a.Category)
            .WithMany(c => c.Artworks)
            .HasForeignKey(a => a.CategoryId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(a => a.Collection)
            .WithMany(c => c.Artworks)
            .HasForeignKey(a => a.CollectionId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}
