namespace Johar.Data.Entities;

/// <summary>
/// Singleton configuration entity storing artist profile, portfolio identity,
/// and global settings. ArtistStatement and AboutBiography are maintained strictly separate.
/// </summary>
public class SiteSettings
{
    public int Id { get; set; } = 1;
    public string ArtistName { get; set; } = string.Empty;
    public string? ProfilePictureUrl { get; set; }
    public string? ProfilePicturePublicId { get; set; }
    public string? ProfilePictureAlt { get; set; }
    public string? HomeIntroText { get; set; }
    public string? ArtistStatement { get; set; } // Independent creative philosophy and intent
    public string? AboutBiography { get; set; }  // Full career milestones, training, and biographical narrative
    public string? TechniquesAndMaterials { get; set; } // Optional structured narrative on artistic methods
    public string? ExhibitionHighlights { get; set; }   // Formatted exhibition and milestone history for About page
    public string ContactEmail { get; set; } = string.Empty;
    public string? StudioLocation { get; set; }
    public string? InstagramHandle { get; set; }
    public string? SocialLinksJson { get; set; } // Optional JSON array of social handles/links
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
