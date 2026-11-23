using Johar.Data.Entities;
using Microsoft.EntityFrameworkCore;

namespace Johar.Data.Seed;

/// <summary>
/// Idempotent database seeder for initial administrative access, taxonomy categories,
/// and neutral site settings placeholders. Strictly adheres to client content neutrality.
/// </summary>
public static class DatabaseSeeder
{
    public const string DefaultAdminEmail = "admin@atelier.local";
    public const string DefaultAdminPassword = "AtelierDev2026!";

    public static async Task SeedAsync(
        ApplicationDbContext context,
        string? adminEmail = null,
        string? adminPassword = null,
        bool isDevelopment = true)
    {
        // 1. Seed Core Categories (Medium Taxonomy)
        if (!await context.Categories.AnyAsync())
        {
            var categories = new List<Category>
            {
                new()
                {
                    Name = "Oil Paintings",
                    Slug = "oil-paintings",
                    Description = "Traditional and contemporary oil works on canvas and archival panel.",
                    DisplayOrder = 1,
                    IsActive = true
                },
                new()
                {
                    Name = "Watercolors",
                    Slug = "watercolors",
                    Description = "Luminous watercolor studies and finished compositions on archival 300gsm cold-press cotton paper.",
                    DisplayOrder = 2,
                    IsActive = true
                },
                new()
                {
                    Name = "Calligraphy",
                    Slug = "calligraphy",
                    Description = "Traditional, modern, and expressive calligraphic letterforms and classical scripts.",
                    DisplayOrder = 3,
                    IsActive = true
                },
                new()
                {
                    Name = "Pencil Sketches",
                    Slug = "pencil-sketches",
                    Description = "Detailed graphite and charcoal sketches, tonal figure studies, and preliminary drawings.",
                    DisplayOrder = 4,
                    IsActive = true
                },
                new()
                {
                    Name = "Portraits",
                    Slug = "portraits",
                    Description = "Figurative and intimate portraiture exploring character, light, and anatomical form.",
                    DisplayOrder = 5,
                    IsActive = true
                },
                new()
                {
                    Name = "Visual Artwork",
                    Slug = "visual-artwork",
                    Description = "Mixed media, textural experiments, and multidisciplinary visual expressions.",
                    DisplayOrder = 6,
                    IsActive = true
                }
            };

            await context.Categories.AddRangeAsync(categories);
            await context.SaveChangesAsync();
        }

        // 2. Seed Neutral SiteSettings (Singleton Record, Id = 1)
        if (!await context.SiteSettings.AnyAsync())
        {
            var settings = new SiteSettings
            {
                Id = 1,
                ArtistName = "[Illustrative Placeholder: Artist Name]",
                ProfilePictureUrl = null, // Strictly neutral: no fabricated URL; uploaded via admin
                ProfilePicturePublicId = null,
                ProfilePictureAlt = "[Illustrative Placeholder: Portrait of the artist in the atelier]",
                HomeIntroText = "[Illustrative Placeholder: Welcome to the online atelier and archival gallery showcasing selected original works.]",
                ArtistStatement = "[Illustrative Placeholder: Independent artist statement detailing creative philosophy, material explorations, and thematic focus. Real statement to be supplied by the artist.]",
                AboutBiography = "[Illustrative Placeholder: Chronological narrative detailing artistic background, training, studio practice, and creative milestones. Real biography to be supplied by the artist.]",
                TechniquesAndMaterials = "[Illustrative Placeholder: Notes on traditional techniques, archival preparations, pigments, and studio craftsmanship.]",
                ExhibitionHighlights = "[Illustrative Placeholder: Curated selection of solo exhibitions, group showcases, and residency highlights.]",
                ContactEmail = "inquiries@atelier.local",
                StudioLocation = "[Illustrative Placeholder: Studio City, Country]",
                InstagramHandle = "@m.ba_shir",
                SocialLinksJson = "[]",
                UpdatedAt = DateTime.UtcNow
            };

            await context.SiteSettings.AddAsync(settings);
            await context.SaveChangesAsync();
        }

        // 3. Seed Initial Administrator User (strictly idempotent, never overwrites existing users)
        if (!await context.Users.AnyAsync())
        {
            var effectiveEmail = !string.IsNullOrWhiteSpace(adminEmail)
                ? adminEmail.Trim()
                : (isDevelopment ? DefaultAdminEmail : null);

            var effectivePassword = !string.IsNullOrWhiteSpace(adminPassword)
                ? adminPassword.Trim()
                : (isDevelopment ? DefaultAdminPassword : null);

            if (!string.IsNullOrWhiteSpace(effectiveEmail) && !string.IsNullOrWhiteSpace(effectivePassword))
            {
                var adminUser = new User
                {
                    Email = effectiveEmail,
                    FullName = "Atelier Administrator",
                    PasswordHash = PasswordHasher.HashPassword(effectivePassword),
                    CreatedAt = DateTime.UtcNow
                };

                await context.Users.AddAsync(adminUser);
                await context.SaveChangesAsync();
            }
        }
    }
}
