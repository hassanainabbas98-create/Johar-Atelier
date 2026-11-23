using Johar.Data.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Johar.Data.Configurations;

public class SiteSettingsConfiguration : IEntityTypeConfiguration<SiteSettings>
{
    public void Configure(EntityTypeBuilder<SiteSettings> builder)
    {
        builder.ToTable("SiteSettings");

        builder.HasKey(s => s.Id);
        builder.Property(s => s.Id).ValueGeneratedNever();

        builder.Property(s => s.ArtistName)
            .IsRequired()
            .HasMaxLength(150);

        builder.Property(s => s.ProfilePictureUrl)
            .HasMaxLength(500);

        builder.Property(s => s.ProfilePicturePublicId)
            .HasMaxLength(200);

        builder.Property(s => s.ProfilePictureAlt)
            .HasMaxLength(200);

        builder.Property(s => s.HomeIntroText)
            .HasMaxLength(1000);

        builder.Property(s => s.ArtistStatement);

        builder.Property(s => s.AboutBiography);

        builder.Property(s => s.TechniquesAndMaterials);

        builder.Property(s => s.ExhibitionHighlights);

        builder.Property(s => s.ContactEmail)
            .IsRequired()
            .HasMaxLength(255);

        builder.Property(s => s.StudioLocation)
            .HasMaxLength(200);

        builder.Property(s => s.InstagramHandle)
            .HasMaxLength(100);

        builder.Property(s => s.SocialLinksJson);

        builder.Property(s => s.UpdatedAt)
            .IsRequired();
    }
}
