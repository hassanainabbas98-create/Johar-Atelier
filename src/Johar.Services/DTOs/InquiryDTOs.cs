using System.ComponentModel.DataAnnotations;
using Johar.Data.Entities;

namespace Johar.Services.DTOs;

public class CreateInquiryRequest
{
    [Required]
    public InquiryType InquiryType { get; set; } = InquiryType.GeneralContact;

    public int? ArtworkId { get; set; }

    [Required]
    [MaxLength(150)]
    public string ClientName { get; set; } = string.Empty;

    [Required]
    [EmailAddress]
    [MaxLength(256)]
    public string Email { get; set; } = string.Empty;

    [MaxLength(50)]
    public string? Phone { get; set; }

    [MaxLength(150)]
    public string? ClientLocation { get; set; }

    [MaxLength(100)]
    public string? MediumPreference { get; set; }

    [MaxLength(100)]
    public string? DesiredDimensions { get; set; }

    [MaxLength(100)]
    public string? DesiredTimeline { get; set; }

    [Required]
    [MinLength(5)]
    public string Message { get; set; } = string.Empty;

    // Anti-bot honeypot field. Must be empty in legitimate human submissions.
    public string? Honeypot { get; set; }
}

public class InquiryDto
{
    public int Id { get; set; }
    public InquiryType InquiryType { get; set; }
    public int? ArtworkId { get; set; }
    public string? ArtworkTitle { get; set; }
    public string? ArtworkSlug { get; set; }
    public string? ArtworkThumbnailUrl { get; set; }

    public string ClientName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string? ClientLocation { get; set; }
    public string? MediumPreference { get; set; }
    public string? DesiredDimensions { get; set; }
    public string? DesiredTimeline { get; set; }
    public string Message { get; set; } = string.Empty;
    public InquiryStatus Status { get; set; }
    public string? ArtistNotes { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class UpdateInquiryStatusDto
{
    [Required]
    public InquiryStatus Status { get; set; }
}

public class UpdateInquiryNotesDto
{
    public string? ArtistNotes { get; set; }
}

public class InquiryQueryParameters
{
    public InquiryStatus? Status { get; set; }
    public InquiryType? Type { get; set; }
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 20;
}
