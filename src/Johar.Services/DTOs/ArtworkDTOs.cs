using System.ComponentModel.DataAnnotations;
using Johar.Data.Entities;

namespace Johar.Services.DTOs;

public class ArtworkImageDto
{
    public int Id { get; set; }
    public int ArtworkId { get; set; }
    public string CloudinaryPublicId { get; set; } = string.Empty;
    public string SecureUrl { get; set; } = string.Empty;
    public int Width { get; set; }
    public int Height { get; set; }
    public string? Format { get; set; }
    public decimal? AspectRatio { get; set; }
    public bool IsPrimary { get; set; }
    public int DisplayOrder { get; set; }
    public string? AltText { get; set; }
}

public class UpdateArtworkImageDto
{
    [MaxLength(255)]
    public string? AltText { get; set; }
    public bool IsPrimary { get; set; }
    public int DisplayOrder { get; set; }
}

public class ArtworkSummaryDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string Medium { get; set; } = string.Empty;
    public decimal DimensionsHeight { get; set; }
    public decimal DimensionsWidth { get; set; }
    public decimal? DimensionsDepth { get; set; }
    public string DimensionUnit { get; set; } = "cm";
    public int YearCreated { get; set; }
    public string? CatalogReference { get; set; }
    public AvailabilityStatus AvailabilityStatus { get; set; }
    public bool IsFramed { get; set; }
    public bool IsFeatured { get; set; }
    public bool IsPublished { get; set; }
    public int DisplayOrder { get; set; }

    public int CategoryId { get; set; }
    public string CategoryName { get; set; } = string.Empty;
    public string CategorySlug { get; set; } = string.Empty;

    public int? CollectionId { get; set; }
    public string? CollectionTitle { get; set; }
    public string? CollectionSlug { get; set; }

    public ArtworkImageDto? PrimaryImage { get; set; }
}

public class ArtworkDetailDto : ArtworkSummaryDto
{
    public string? Story { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public List<ArtworkImageDto> Images { get; set; } = new();
}

public class AdminArtworkDto : ArtworkDetailDto
{
    public int TotalImagesCount { get; set; }
    public int MissingAltTextCount { get; set; }
    public bool CanBePublished => TotalImagesCount > 0 && MissingAltTextCount == 0;
}

public class CreateArtworkDto
{
    [Required]
    public int CategoryId { get; set; }

    public int? CollectionId { get; set; }

    [Required]
    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    [MaxLength(220)]
    public string? Slug { get; set; }

    [Required]
    [MaxLength(200)]
    public string Medium { get; set; } = string.Empty;

    [Range(0.1, 9999.99)]
    public decimal DimensionsHeight { get; set; }

    [Range(0.1, 9999.99)]
    public decimal DimensionsWidth { get; set; }

    public decimal? DimensionsDepth { get; set; }

    [MaxLength(10)]
    public string DimensionUnit { get; set; } = "cm";

    [Range(1800, 2100)]
    public int YearCreated { get; set; } = DateTime.UtcNow.Year;

    [MaxLength(50)]
    public string? CatalogReference { get; set; }

    public AvailabilityStatus AvailabilityStatus { get; set; } = AvailabilityStatus.Available;

    public bool IsFramed { get; set; } = false;
    public bool IsFeatured { get; set; } = false;
    public bool IsPublished { get; set; } = false;
    public int DisplayOrder { get; set; } = 0;
    public string? Story { get; set; }
}

public class UpdateArtworkDto : CreateArtworkDto
{
}

public class ArtworkQueryParameters
{
    public string? CategorySlug { get; set; }
    public string? CollectionSlug { get; set; }
    public bool? AvailableOnly { get; set; }
    public bool? FeaturedOnly { get; set; }
    public string? Search { get; set; }
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 12;
}
