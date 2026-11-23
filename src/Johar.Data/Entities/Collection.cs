namespace Johar.Data.Entities;

/// <summary>
/// Represents a thematic series or curated collection of artworks.
/// </summary>
public class Collection
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string? CuratorNote { get; set; }
    public string? CoverImageUrl { get; set; }
    public int DisplayOrder { get; set; } = 0;
    public bool IsPublished { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public ICollection<Artwork> Artworks { get; set; } = new List<Artwork>();
}
