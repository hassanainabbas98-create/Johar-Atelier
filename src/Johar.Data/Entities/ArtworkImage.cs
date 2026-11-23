namespace Johar.Data.Entities;

/// <summary>
/// Photographic asset associated with an artwork, hosted on Cloudinary.
/// AltText is nullable in the database to allow saving in-progress drafts,
/// but strictly enforced by backend services before an artwork can be published.
/// </summary>
public class ArtworkImage
{
    public int Id { get; set; }
    public int ArtworkId { get; set; }
    public string CloudinaryPublicId { get; set; } = string.Empty;
    public string SecureUrl { get; set; } = string.Empty;
    public int Width { get; set; }
    public int Height { get; set; }
    public string? Format { get; set; }
    public decimal? AspectRatio { get; set; }
    public bool IsPrimary { get; set; } = false;
    public int DisplayOrder { get; set; } = 0;
    public string? AltText { get; set; }

    // Navigation property
    public Artwork Artwork { get; set; } = null!;
}
