using System.ComponentModel.DataAnnotations;

namespace Johar.Services.DTOs;

public class CollectionDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string? CuratorNote { get; set; }
    public string? CoverImageUrl { get; set; }
    public int DisplayOrder { get; set; }
    public bool IsPublished { get; set; }
    public DateTime CreatedAt { get; set; }
    public int ArtworkCount { get; set; }
}

public class CollectionUpsertDto
{
    [Required]
    [MaxLength(150)]
    public string Title { get; set; } = string.Empty;

    [MaxLength(170)]
    public string? Slug { get; set; }

    public string? CuratorNote { get; set; }

    [MaxLength(500)]
    public string? CoverImageUrl { get; set; }

    public int DisplayOrder { get; set; } = 0;
    public bool IsPublished { get; set; } = true;
}
