namespace Johar.Data.Entities;

/// <summary>
/// Status of physical artwork availability in the inquiry model.
/// </summary>
public enum AvailabilityStatus
{
    Available = 0,
    Reserved = 1,
    Sold = 2,
    PrivateCollection = 3 // Not for Sale (NFS)
}

/// <summary>
/// Core catalog entity representing an individual artwork piece.
/// Price and commercial fields are strictly excluded in accordance with the pure inquiry model.
/// </summary>
public class Artwork
{
    public int Id { get; set; }
    public int CategoryId { get; set; }
    public int? CollectionId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string Medium { get; set; } = string.Empty;
    public decimal DimensionsHeight { get; set; }
    public decimal DimensionsWidth { get; set; }
    public decimal? DimensionsDepth { get; set; }
    public string DimensionUnit { get; set; } = "cm";
    public int YearCreated { get; set; }
    public string? CatalogReference { get; set; } // Optional unique atelier archival reference
    public AvailabilityStatus AvailabilityStatus { get; set; } = AvailabilityStatus.Available;
    public bool IsFramed { get; set; } = false;
    public bool IsFeatured { get; set; } = false;
    public bool IsPublished { get; set; } = false;
    public int DisplayOrder { get; set; } = 0;
    public string? Story { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public Category Category { get; set; } = null!;
    public Collection? Collection { get; set; }
    public ICollection<ArtworkImage> Images { get; set; } = new List<ArtworkImage>();
    public ICollection<Inquiry> Inquiries { get; set; } = new List<Inquiry>();
}
