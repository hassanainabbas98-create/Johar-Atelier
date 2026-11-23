using Johar.Data;
using Johar.Data.Entities;
using Johar.Services.Common;
using Johar.Services.DTOs;
using Johar.Services.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;

namespace Johar.Services.Implementations;

public class ArtworkService : IArtworkService
{
    private readonly ApplicationDbContext _db;
    private readonly ICloudinaryService _cloudinaryService;

    public ArtworkService(ApplicationDbContext db, ICloudinaryService cloudinaryService)
    {
        _db = db;
        _cloudinaryService = cloudinaryService;
    }

    public async Task<PagedResult<ArtworkSummaryDto>> GetPublicArtworksAsync(ArtworkQueryParameters query)
    {
        var baseQuery = _db.Artworks
            .AsNoTracking()
            .Include(a => a.Category)
            .Include(a => a.Collection)
            .Include(a => a.Images)
            .Where(a => a.IsPublished); // Strictly published artworks only

        if (!string.IsNullOrWhiteSpace(query.CategorySlug))
        {
            var catSlug = query.CategorySlug.Trim().ToLowerInvariant();
            baseQuery = baseQuery.Where(a => a.Category.Slug.ToLower() == catSlug);
        }

        if (!string.IsNullOrWhiteSpace(query.CollectionSlug))
        {
            var colSlug = query.CollectionSlug.Trim().ToLowerInvariant();
            baseQuery = baseQuery.Where(a => a.Collection != null && a.Collection.Slug.ToLower() == colSlug);
        }

        if (query.AvailableOnly == true)
        {
            baseQuery = baseQuery.Where(a => a.AvailabilityStatus == AvailabilityStatus.Available);
        }

        if (query.FeaturedOnly == true)
        {
            baseQuery = baseQuery.Where(a => a.IsFeatured);
        }

        if (!string.IsNullOrWhiteSpace(query.Search))
        {
            var term = query.Search.Trim().ToLowerInvariant();
            baseQuery = baseQuery.Where(a =>
                a.Title.ToLower().Contains(term) ||
                a.Medium.ToLower().Contains(term) ||
                (a.Story != null && a.Story.ToLower().Contains(term)));
        }

        var totalCount = await baseQuery.CountAsync();

        var page = query.Page > 0 ? query.Page : 1;
        var pageSize = query.PageSize > 0 && query.PageSize <= 100 ? query.PageSize : 12;

        var items = await baseQuery
            .OrderBy(a => a.DisplayOrder)
            .ThenByDescending(a => a.YearCreated)
            .ThenByDescending(a => a.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(a => MapToSummaryDto(a, _cloudinaryService))
            .ToListAsync();

        return new PagedResult<ArtworkSummaryDto>(items, totalCount, page, pageSize);
    }

    public async Task<ArtworkDetailDto> GetPublicArtworkBySlugAsync(string slug)
    {
        var normalizedSlug = slug.Trim().ToLowerInvariant();
        var artwork = await _db.Artworks
            .AsNoTracking()
            .Include(a => a.Category)
            .Include(a => a.Collection)
            .Include(a => a.Images)
            .FirstOrDefaultAsync(a => a.Slug.ToLower() == normalizedSlug && a.IsPublished);

        if (artwork == null)
            throw new AtelierNotFoundException($"Artwork with slug '{slug}' was not found or is unpublished.");

        return MapToDetailDto(artwork, _cloudinaryService);
    }

    public async Task<PagedResult<AdminArtworkDto>> GetAdminArtworksAsync(ArtworkQueryParameters query)
    {
        var baseQuery = _db.Artworks
            .AsNoTracking()
            .Include(a => a.Category)
            .Include(a => a.Collection)
            .Include(a => a.Images)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(query.CategorySlug))
        {
            var catSlug = query.CategorySlug.Trim().ToLowerInvariant();
            baseQuery = baseQuery.Where(a => a.Category.Slug.ToLower() == catSlug);
        }

        if (query.FeaturedOnly == true)
        {
            baseQuery = baseQuery.Where(a => a.IsFeatured);
        }

        if (!string.IsNullOrWhiteSpace(query.Search))
        {
            var term = query.Search.Trim().ToLowerInvariant();
            baseQuery = baseQuery.Where(a =>
                a.Title.ToLower().Contains(term) ||
                a.Medium.ToLower().Contains(term) ||
                (a.CatalogReference != null && a.CatalogReference.ToLower().Contains(term)));
        }

        var totalCount = await baseQuery.CountAsync();
        var page = query.Page > 0 ? query.Page : 1;
        var pageSize = query.PageSize > 0 && query.PageSize <= 100 ? query.PageSize : 20;

        var items = await baseQuery
            .OrderBy(a => a.DisplayOrder)
            .ThenByDescending(a => a.UpdatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(a => MapToAdminDto(a, _cloudinaryService))
            .ToListAsync();

        return new PagedResult<AdminArtworkDto>(items, totalCount, page, pageSize);
    }

    public async Task<AdminArtworkDto> GetAdminArtworkByIdAsync(int id)
    {
        var artwork = await _db.Artworks
            .AsNoTracking()
            .Include(a => a.Category)
            .Include(a => a.Collection)
            .Include(a => a.Images)
            .FirstOrDefaultAsync(a => a.Id == id);

        if (artwork == null)
            throw new AtelierNotFoundException($"Artwork with ID {id} was not found.");

        return MapToAdminDto(artwork, _cloudinaryService);
    }

    public async Task<AdminArtworkDto> CreateArtworkAsync(CreateArtworkDto dto)
    {
        if (!await _db.Categories.AnyAsync(c => c.Id == dto.CategoryId))
            throw new AtelierValidationException("CategoryId", $"Category ID {dto.CategoryId} does not exist.");

        if (dto.CollectionId.HasValue && !await _db.Collections.AnyAsync(c => c.Id == dto.CollectionId.Value))
            throw new AtelierValidationException("CollectionId", $"Collection ID {dto.CollectionId.Value} does not exist.");

        // AltText Publishing Gate Enforcement
        if (dto.IsPublished)
        {
            throw new AtelierValidationException("IsPublished",
                "Cannot create a new artwork directly as Published without images. Please create as Draft first, upload photographs with AltText, and then publish.");
        }

        var slug = string.IsNullOrWhiteSpace(dto.Slug)
            ? SlugHelper.GenerateSlug(dto.Title)
            : SlugHelper.GenerateSlug(dto.Slug);

        // Ensure unique slug
        slug = await EnsureUniqueArtworkSlugAsync(slug);

        var artwork = new Artwork
        {
            CategoryId = dto.CategoryId,
            CollectionId = dto.CollectionId,
            Title = dto.Title.Trim(),
            Slug = slug,
            Medium = dto.Medium.Trim(),
            DimensionsHeight = dto.DimensionsHeight,
            DimensionsWidth = dto.DimensionsWidth,
            DimensionsDepth = dto.DimensionsDepth,
            DimensionUnit = string.IsNullOrWhiteSpace(dto.DimensionUnit) ? "cm" : dto.DimensionUnit.Trim(),
            YearCreated = dto.YearCreated,
            CatalogReference = dto.CatalogReference?.Trim(),
            AvailabilityStatus = dto.AvailabilityStatus,
            IsFramed = dto.IsFramed,
            IsFeatured = dto.IsFeatured,
            IsPublished = false, // Enforced draft on creation
            DisplayOrder = dto.DisplayOrder,
            Story = dto.Story?.Trim(),
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        await _db.Artworks.AddAsync(artwork);
        await _db.SaveChangesAsync();

        return await GetAdminArtworkByIdAsync(artwork.Id);
    }

    public async Task<AdminArtworkDto> UpdateArtworkAsync(int id, UpdateArtworkDto dto)
    {
        var artwork = await _db.Artworks
            .Include(a => a.Images)
            .FirstOrDefaultAsync(a => a.Id == id);

        if (artwork == null)
            throw new AtelierNotFoundException($"Artwork with ID {id} was not found.");

        if (!await _db.Categories.AnyAsync(c => c.Id == dto.CategoryId))
            throw new AtelierValidationException("CategoryId", $"Category ID {dto.CategoryId} does not exist.");

        if (dto.CollectionId.HasValue && !await _db.Collections.AnyAsync(c => c.Id == dto.CollectionId.Value))
            throw new AtelierValidationException("CollectionId", $"Collection ID {dto.CollectionId.Value} does not exist.");

        // AltText Publishing Gate Enforcement
        if (dto.IsPublished)
        {
            ValidatePublishGate(artwork.Images);
        }

        var slug = string.IsNullOrWhiteSpace(dto.Slug)
            ? SlugHelper.GenerateSlug(dto.Title)
            : SlugHelper.GenerateSlug(dto.Slug);

        slug = await EnsureUniqueArtworkSlugAsync(slug, id);

        artwork.CategoryId = dto.CategoryId;
        artwork.CollectionId = dto.CollectionId;
        artwork.Title = dto.Title.Trim();
        artwork.Slug = slug;
        artwork.Medium = dto.Medium.Trim();
        artwork.DimensionsHeight = dto.DimensionsHeight;
        artwork.DimensionsWidth = dto.DimensionsWidth;
        artwork.DimensionsDepth = dto.DimensionsDepth;
        artwork.DimensionUnit = string.IsNullOrWhiteSpace(dto.DimensionUnit) ? "cm" : dto.DimensionUnit.Trim();
        artwork.YearCreated = dto.YearCreated;
        artwork.CatalogReference = dto.CatalogReference?.Trim();
        artwork.AvailabilityStatus = dto.AvailabilityStatus;
        artwork.IsFramed = dto.IsFramed;
        artwork.IsFeatured = dto.IsFeatured;
        artwork.IsPublished = dto.IsPublished;
        artwork.DisplayOrder = dto.DisplayOrder;
        artwork.Story = dto.Story?.Trim();
        artwork.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();

        return await GetAdminArtworkByIdAsync(artwork.Id);
    }

    public async Task<AdminArtworkDto> TogglePublishStatusAsync(int id, bool isPublished)
    {
        var artwork = await _db.Artworks
            .Include(a => a.Images)
            .FirstOrDefaultAsync(a => a.Id == id);

        if (artwork == null)
            throw new AtelierNotFoundException($"Artwork with ID {id} was not found.");

        if (isPublished)
        {
            ValidatePublishGate(artwork.Images);
        }

        artwork.IsPublished = isPublished;
        artwork.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();

        return await GetAdminArtworkByIdAsync(artwork.Id);
    }

    public async Task<AdminArtworkDto> ToggleFeaturedStatusAsync(int id, bool isFeatured)
    {
        var artwork = await _db.Artworks.FirstOrDefaultAsync(a => a.Id == id);
        if (artwork == null)
            throw new AtelierNotFoundException($"Artwork with ID {id} was not found.");

        artwork.IsFeatured = isFeatured;
        artwork.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();

        return await GetAdminArtworkByIdAsync(artwork.Id);
    }

    public async Task DeleteArtworkAsync(int id)
    {
        var artwork = await _db.Artworks
            .Include(a => a.Images)
            .FirstOrDefaultAsync(a => a.Id == id);

        if (artwork == null)
            throw new AtelierNotFoundException($"Artwork with ID {id} was not found.");

        // Clean up all Cloudinary assets before removing database records
        foreach (var image in artwork.Images)
        {
            if (!string.IsNullOrWhiteSpace(image.CloudinaryPublicId))
            {
                await _cloudinaryService.DeleteAssetAsync(image.CloudinaryPublicId);
            }
        }

        _db.Artworks.Remove(artwork);
        await _db.SaveChangesAsync();
    }

    public async Task<ArtworkImageDto> AddImageAsync(int artworkId, IFormFile file, string? altText, bool isPrimary = false)
    {
        var artwork = await _db.Artworks
            .Include(a => a.Images)
            .FirstOrDefaultAsync(a => a.Id == artworkId);

        if (artwork == null)
            throw new AtelierNotFoundException($"Artwork with ID {artworkId} was not found.");

        // Upload through Cloudinary service (strictly preserving native aspect ratio, c_limit only)
        var uploadResult = await _cloudinaryService.UploadArtworkImageAsync(file);

        // Auto-assign primary if this is the first image
        var shouldBePrimary = isPrimary || !artwork.Images.Any();

        if (shouldBePrimary)
        {
            foreach (var existing in artwork.Images)
            {
                existing.IsPrimary = false;
            }
        }

        var nextOrder = artwork.Images.Any() ? artwork.Images.Max(i => i.DisplayOrder) + 1 : 0;

        var image = new ArtworkImage
        {
            ArtworkId = artworkId,
            CloudinaryPublicId = uploadResult.PublicId,
            SecureUrl = uploadResult.SecureUrl,
            Width = uploadResult.Width,
            Height = uploadResult.Height,
            Format = uploadResult.Format,
            AspectRatio = uploadResult.AspectRatio,
            IsPrimary = shouldBePrimary,
            DisplayOrder = nextOrder,
            AltText = altText?.Trim()
        };

        artwork.Images.Add(image);
        artwork.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();

        return new ArtworkImageDto
        {
            Id = image.Id,
            ArtworkId = image.ArtworkId,
            CloudinaryPublicId = image.CloudinaryPublicId,
            SecureUrl = image.SecureUrl,
            Width = image.Width,
            Height = image.Height,
            Format = image.Format,
            AspectRatio = image.AspectRatio,
            IsPrimary = image.IsPrimary,
            DisplayOrder = image.DisplayOrder,
            AltText = image.AltText
        };
    }

    public async Task<ArtworkImageDto> ReplaceImageAsync(int artworkId, int imageId, IFormFile file, string? altText)
    {
        var artwork = await _db.Artworks
            .Include(a => a.Images)
            .FirstOrDefaultAsync(a => a.Id == artworkId);

        if (artwork == null)
            throw new AtelierNotFoundException($"Artwork with ID {artworkId} was not found.");

        var image = artwork.Images.FirstOrDefault(i => i.Id == imageId);
        if (image == null)
            throw new AtelierNotFoundException($"Image with ID {imageId} does not belong to Artwork {artworkId}.");

        // Clean up old Cloudinary asset
        if (!string.IsNullOrWhiteSpace(image.CloudinaryPublicId))
        {
            await _cloudinaryService.DeleteAssetAsync(image.CloudinaryPublicId);
        }

        // Upload new replacement image
        var uploadResult = await _cloudinaryService.UploadArtworkImageAsync(file);

        image.CloudinaryPublicId = uploadResult.PublicId;
        image.SecureUrl = uploadResult.SecureUrl;
        image.Width = uploadResult.Width;
        image.Height = uploadResult.Height;
        image.Format = uploadResult.Format;
        image.AspectRatio = uploadResult.AspectRatio;

        if (!string.IsNullOrWhiteSpace(altText))
        {
            image.AltText = altText.Trim();
        }

        // If artwork is published, ensure AltText is not empty
        if (artwork.IsPublished && string.IsNullOrWhiteSpace(image.AltText))
        {
            throw new AtelierValidationException("AltText",
                "Cannot replace image on a published artwork without providing accessibility AltText.");
        }

        artwork.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        return new ArtworkImageDto
        {
            Id = image.Id,
            ArtworkId = image.ArtworkId,
            CloudinaryPublicId = image.CloudinaryPublicId,
            SecureUrl = image.SecureUrl,
            Width = image.Width,
            Height = image.Height,
            Format = image.Format,
            AspectRatio = image.AspectRatio,
            IsPrimary = image.IsPrimary,
            DisplayOrder = image.DisplayOrder,
            AltText = image.AltText
        };
    }

    public async Task<ArtworkImageDto> UpdateImageMetadataAsync(int artworkId, int imageId, UpdateArtworkImageDto dto)
    {
        var artwork = await _db.Artworks
            .Include(a => a.Images)
            .FirstOrDefaultAsync(a => a.Id == artworkId);

        if (artwork == null)
            throw new AtelierNotFoundException($"Artwork with ID {artworkId} was not found.");

        var image = artwork.Images.FirstOrDefault(i => i.Id == imageId);
        if (image == null)
            throw new AtelierNotFoundException($"Image with ID {imageId} does not belong to Artwork {artworkId}.");

        // If artwork is currently published, AltText cannot be cleared
        if (artwork.IsPublished && string.IsNullOrWhiteSpace(dto.AltText))
        {
            throw new AtelierValidationException("AltText",
                "Cannot remove AltText from an image belonging to a published artwork. Unpublish the artwork first or provide replacement AltText.");
        }

        image.AltText = dto.AltText?.Trim();
        image.DisplayOrder = dto.DisplayOrder;

        if (dto.IsPrimary)
        {
            foreach (var img in artwork.Images)
            {
                img.IsPrimary = (img.Id == imageId);
            }
        }
        else
        {
            image.IsPrimary = false;
        }

        artwork.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        return new ArtworkImageDto
        {
            Id = image.Id,
            ArtworkId = image.ArtworkId,
            CloudinaryPublicId = image.CloudinaryPublicId,
            SecureUrl = image.SecureUrl,
            Width = image.Width,
            Height = image.Height,
            Format = image.Format,
            AspectRatio = image.AspectRatio,
            IsPrimary = image.IsPrimary,
            DisplayOrder = image.DisplayOrder,
            AltText = image.AltText
        };
    }

    public async Task DeleteImageMetadataAsync(int artworkId, int imageId)
    {
        var artwork = await _db.Artworks
            .Include(a => a.Images)
            .FirstOrDefaultAsync(a => a.Id == artworkId);

        if (artwork == null)
            throw new AtelierNotFoundException($"Artwork with ID {artworkId} was not found.");

        var image = artwork.Images.FirstOrDefault(i => i.Id == imageId);
        if (image == null)
            throw new AtelierNotFoundException($"Image with ID {imageId} does not belong to Artwork {artworkId}.");

        // If this was the only image on a published piece, block deletion or require unpublishing
        if (artwork.IsPublished && artwork.Images.Count <= 1)
        {
            throw new AtelierValidationException("Images",
                "Cannot delete the only photograph of an active published artwork. Unpublish the artwork first.");
        }

        // Clean up Cloudinary asset
        if (!string.IsNullOrWhiteSpace(image.CloudinaryPublicId))
        {
            await _cloudinaryService.DeleteAssetAsync(image.CloudinaryPublicId);
        }

        artwork.Images.Remove(image);
        artwork.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();
    }

    // --- Private Helpers ---

    /// <summary>
    /// Mandatory AltText Publishing Gate:
    /// Rejects publishing if the artwork has no images or any image lacks non-empty AltText.
    /// </summary>
    private static void ValidatePublishGate(ICollection<ArtworkImage> images)
    {
        if (images == null || images.Count == 0)
        {
            throw new AtelierValidationException("IsPublished",
                "Cannot publish artwork without imagery. Please upload at least one photograph before publishing.");
        }

        var missingAltCount = images.Count(i => string.IsNullOrWhiteSpace(i.AltText));
        if (missingAltCount > 0)
        {
            throw new AtelierValidationException("AltText",
                $"Cannot publish artwork because {missingAltCount} image(s) lack accessibility AltText. Please provide descriptive AltText for every image before publishing.");
        }
    }

    private async Task<string> EnsureUniqueArtworkSlugAsync(string baseSlug, int? excludeId = null)
    {
        var slug = baseSlug;
        var counter = 1;

        while (await _db.Artworks.AnyAsync(a => a.Slug == slug && (!excludeId.HasValue || a.Id != excludeId.Value)))
        {
            slug = $"{baseSlug}-{counter}";
            counter++;
        }

        return slug;
    }

    private static ArtworkSummaryDto MapToSummaryDto(Artwork a, ICloudinaryService cloudinary)
    {
        var primaryImg = a.Images.FirstOrDefault(i => i.IsPrimary) ?? a.Images.OrderBy(i => i.DisplayOrder).FirstOrDefault();

        return new ArtworkSummaryDto
        {
            Id = a.Id,
            Title = a.Title,
            Slug = a.Slug,
            Medium = a.Medium,
            DimensionsHeight = a.DimensionsHeight,
            DimensionsWidth = a.DimensionsWidth,
            DimensionsDepth = a.DimensionsDepth,
            DimensionUnit = a.DimensionUnit,
            YearCreated = a.YearCreated,
            CatalogReference = a.CatalogReference,
            AvailabilityStatus = a.AvailabilityStatus,
            IsFramed = a.IsFramed,
            IsFeatured = a.IsFeatured,
            IsPublished = a.IsPublished,
            DisplayOrder = a.DisplayOrder,
            CategoryId = a.CategoryId,
            CategoryName = a.Category?.Name ?? string.Empty,
            CategorySlug = a.Category?.Slug ?? string.Empty,
            CollectionId = a.CollectionId,
            CollectionTitle = a.Collection?.Title,
            CollectionSlug = a.Collection?.Slug,
            PrimaryImage = primaryImg == null ? null : new ArtworkImageDto
            {
                Id = primaryImg.Id,
                ArtworkId = primaryImg.ArtworkId,
                CloudinaryPublicId = primaryImg.CloudinaryPublicId,
                SecureUrl = cloudinary.GetArtworkThumbnailUrl(primaryImg.SecureUrl),
                Width = primaryImg.Width,
                Height = primaryImg.Height,
                Format = primaryImg.Format,
                AspectRatio = primaryImg.AspectRatio,
                IsPrimary = primaryImg.IsPrimary,
                DisplayOrder = primaryImg.DisplayOrder,
                AltText = primaryImg.AltText
            }
        };
    }

    private static ArtworkDetailDto MapToDetailDto(Artwork a, ICloudinaryService cloudinary)
    {
        var summary = MapToSummaryDto(a, cloudinary);
        return new ArtworkDetailDto
        {
            Id = summary.Id,
            Title = summary.Title,
            Slug = summary.Slug,
            Medium = summary.Medium,
            DimensionsHeight = summary.DimensionsHeight,
            DimensionsWidth = summary.DimensionsWidth,
            DimensionsDepth = summary.DimensionsDepth,
            DimensionUnit = summary.DimensionUnit,
            YearCreated = summary.YearCreated,
            CatalogReference = summary.CatalogReference,
            AvailabilityStatus = summary.AvailabilityStatus,
            IsFramed = summary.IsFramed,
            IsFeatured = summary.IsFeatured,
            IsPublished = summary.IsPublished,
            DisplayOrder = summary.DisplayOrder,
            CategoryId = summary.CategoryId,
            CategoryName = summary.CategoryName,
            CategorySlug = summary.CategorySlug,
            CollectionId = summary.CollectionId,
            CollectionTitle = summary.CollectionTitle,
            CollectionSlug = summary.CollectionSlug,
            PrimaryImage = summary.PrimaryImage,
            Story = a.Story,
            CreatedAt = a.CreatedAt,
            UpdatedAt = a.UpdatedAt,
            Images = a.Images
                .OrderBy(i => i.DisplayOrder)
                .Select(i => new ArtworkImageDto
                {
                    Id = i.Id,
                    ArtworkId = i.ArtworkId,
                    CloudinaryPublicId = i.CloudinaryPublicId,
                    SecureUrl = cloudinary.GetArtworkMasterUrl(i.SecureUrl),
                    Width = i.Width,
                    Height = i.Height,
                    Format = i.Format,
                    AspectRatio = i.AspectRatio,
                    IsPrimary = i.IsPrimary,
                    DisplayOrder = i.DisplayOrder,
                    AltText = i.AltText
                })
                .ToList()
        };
    }

    private static AdminArtworkDto MapToAdminDto(Artwork a, ICloudinaryService cloudinary)
    {
        var detail = MapToDetailDto(a, cloudinary);
        var totalImages = a.Images.Count;
        var missingAlt = a.Images.Count(i => string.IsNullOrWhiteSpace(i.AltText));

        return new AdminArtworkDto
        {
            Id = detail.Id,
            Title = detail.Title,
            Slug = detail.Slug,
            Medium = detail.Medium,
            DimensionsHeight = detail.DimensionsHeight,
            DimensionsWidth = detail.DimensionsWidth,
            DimensionsDepth = detail.DimensionsDepth,
            DimensionUnit = detail.DimensionUnit,
            YearCreated = detail.YearCreated,
            CatalogReference = detail.CatalogReference,
            AvailabilityStatus = detail.AvailabilityStatus,
            IsFramed = detail.IsFramed,
            IsFeatured = detail.IsFeatured,
            IsPublished = detail.IsPublished,
            DisplayOrder = detail.DisplayOrder,
            CategoryId = detail.CategoryId,
            CategoryName = detail.CategoryName,
            CategorySlug = detail.CategorySlug,
            CollectionId = detail.CollectionId,
            CollectionTitle = detail.CollectionTitle,
            CollectionSlug = detail.CollectionSlug,
            PrimaryImage = detail.PrimaryImage,
            Story = detail.Story,
            CreatedAt = detail.CreatedAt,
            UpdatedAt = detail.UpdatedAt,
            Images = detail.Images,
            TotalImagesCount = totalImages,
            MissingAltTextCount = missingAlt
        };
    }
}
