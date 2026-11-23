using System.Reflection;
using System.Text.Json;
using Johar.Data.Entities;
using Microsoft.EntityFrameworkCore;

namespace Johar.Data.Seed;

/// <summary>
/// Idempotent database seeder for initial administrative access, taxonomy categories,
/// neutral site settings placeholders, and automatic 38 masterpiece catalog population.
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
        // 0. Ensure schema is created
        await context.Database.EnsureCreatedAsync();

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
                ArtistName = "Muhammad Bashir (Johar)",
                ProfilePictureUrl = null,
                ProfilePicturePublicId = null,
                ProfilePictureAlt = "Portrait of the artist in the atelier",
                HomeIntroText = "Welcome to the online atelier and archival gallery showcasing original works.",
                ArtistStatement = "Exploring traditional and modern forms, light, texture, and cultural heritage.",
                AboutBiography = "A journey spanning classical academic fine art, calligraphy, and expressive portraiture.",
                TechniquesAndMaterials = "Oil on canvas, watercolor on cold-press archival paper, and classical calligraphy.",
                ExhibitionHighlights = "Solo and group exhibitions celebrating contemporary and traditional mastery.",
                ContactEmail = "inquiries@atelier.local",
                StudioLocation = "Pakistan",
                InstagramHandle = "@m.ba_shir",
                SocialLinksJson = "[]",
                UpdatedAt = DateTime.UtcNow
            };

            await context.SiteSettings.AddAsync(settings);
            await context.SaveChangesAsync();
        }

        // 3. Seed Initial Administrator User
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

        // 4. Seed 38 Catalog Masterpieces & Artwork Images (if database is brand new)
        if (!await context.Artworks.AnyAsync())
        {
            var assembly = typeof(DatabaseSeeder).Assembly;
            using var stream = assembly.GetManifestResourceStream("Johar.Data.Seed.artworks_seed.json");
            if (stream != null)
            {
                using var reader = new StreamReader(stream);
                var json = await reader.ReadToEndAsync();
                var items = JsonSerializer.Deserialize<List<ArtworkSeedDto>>(json, new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                });

                if (items != null && items.Count > 0)
                {
                    foreach (var item in items)
                    {
                        var artwork = new Artwork
                        {
                            CategoryId = item.CategoryId,
                            CollectionId = item.CollectionId,
                            Title = item.Title,
                            Slug = item.Slug,
                            Medium = item.Medium,
                            DimensionsHeight = item.DimensionsHeight,
                            DimensionsWidth = item.DimensionsWidth,
                            DimensionsDepth = item.DimensionsDepth,
                            DimensionUnit = item.DimensionUnit ?? "cm",
                            YearCreated = item.YearCreated,
                            CatalogReference = item.CatalogReference,
                            AvailabilityStatus = Enum.TryParse<AvailabilityStatus>(item.AvailabilityStatus, true, out var status) ? status : AvailabilityStatus.Available,
                            IsFramed = item.IsFramed,
                            IsFeatured = item.IsFeatured,
                            IsPublished = item.IsPublished,
                            DisplayOrder = item.DisplayOrder,
                            Story = item.Story,
                            CreatedAt = DateTime.UtcNow,
                            UpdatedAt = DateTime.UtcNow
                        };

                        if (item.Images != null)
                        {
                            foreach (var img in item.Images)
                            {
                                artwork.Images.Add(new ArtworkImage
                                {
                                    CloudinaryPublicId = img.CloudinaryPublicId ?? "",
                                    SecureUrl = img.SecureUrl,
                                    Width = img.Width,
                                    Height = img.Height,
                                    Format = img.Format,
                                    AspectRatio = img.AspectRatio,
                                    IsPrimary = img.IsPrimary,
                                    DisplayOrder = img.DisplayOrder,
                                    AltText = img.AltText
                                });
                            }
                        }

                        await context.Artworks.AddAsync(artwork);
                    }

                    await context.SaveChangesAsync();
                }
            }
        }
    }

    private class ArtworkSeedDto
    {
        public int CategoryId { get; set; }
        public int? CollectionId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Slug { get; set; } = string.Empty;
        public string Medium { get; set; } = string.Empty;
        public decimal DimensionsHeight { get; set; }
        public decimal DimensionsWidth { get; set; }
        public decimal? DimensionsDepth { get; set; }
        public string? DimensionUnit { get; set; }
        public int YearCreated { get; set; }
        public string? CatalogReference { get; set; }
        public string AvailabilityStatus { get; set; } = "Available";
        public bool IsFramed { get; set; }
        public bool IsFeatured { get; set; }
        public bool IsPublished { get; set; }
        public int DisplayOrder { get; set; }
        public string? Story { get; set; }
        public List<ArtworkImageSeedDto>? Images { get; set; }
    }

    private class ArtworkImageSeedDto
    {
        public string? CloudinaryPublicId { get; set; }
        public string SecureUrl { get; set; } = string.Empty;
        public int Width { get; set; }
        public int Height { get; set; }
        public string? Format { get; set; }
        public decimal? AspectRatio { get; set; }
        public bool IsPrimary { get; set; }
        public int DisplayOrder { get; set; }
        public string? AltText { get; set; }
    }
}
