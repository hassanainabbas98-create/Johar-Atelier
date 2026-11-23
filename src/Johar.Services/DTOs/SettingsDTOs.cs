using System.ComponentModel.DataAnnotations;

namespace Johar.Services.DTOs;

public class PublicProfileDto
{
    public string ArtistName { get; set; } = string.Empty;
    public string? ProfilePictureUrl { get; set; }
    public string? ProfilePictureAlt { get; set; }
    public string? HomeIntroText { get; set; }
    public string? ArtistStatement { get; set; }
    public string? AboutBiography { get; set; }
    public string? TechniquesAndMaterials { get; set; }
    public string? ExhibitionHighlights { get; set; }
    public string ContactEmail { get; set; } = string.Empty;
    public string? StudioLocation { get; set; }
    public string? InstagramHandle { get; set; }
    public string? SocialLinksJson { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class UpdateSiteSettingsDto
{
    [Required]
    [MaxLength(150)]
    public string ArtistName { get; set; } = string.Empty;

    [MaxLength(1000)]
    public string? HomeIntroText { get; set; }

    public string? ArtistStatement { get; set; }

    public string? AboutBiography { get; set; }

    public string? TechniquesAndMaterials { get; set; }

    public string? ExhibitionHighlights { get; set; }

    [Required]
    [EmailAddress]
    [MaxLength(255)]
    public string ContactEmail { get; set; } = string.Empty;

    [MaxLength(200)]
    public string? StudioLocation { get; set; }

    [MaxLength(100)]
    public string? InstagramHandle { get; set; }

    public string? SocialLinksJson { get; set; }

    [MaxLength(200)]
    public string? ProfilePictureAlt { get; set; }
}
