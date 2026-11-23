namespace Johar.Data.Entities;

/// <summary>
/// Type of inquiry submitted by a collector or client.
/// </summary>
public enum InquiryType
{
    ArtworkInquiry = 0,
    CommissionRequest = 1,
    GeneralContact = 2
}

/// <summary>
/// Processing lifecycle status for inquiries in the artist admin inbox.
/// </summary>
public enum InquiryStatus
{
    New = 0,
    InReview = 1,
    Contacted = 2,
    Completed = 3,
    Archived = 4
}

/// <summary>
/// Represents an acquisition inquiry, bespoke commission brief, or studio correspondence.
/// </summary>
public class Inquiry
{
    public int Id { get; set; }
    public InquiryType InquiryType { get; set; }
    public int? ArtworkId { get; set; }
    public string ClientName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string? ClientLocation { get; set; }
    public string? MediumPreference { get; set; }
    public string? DesiredDimensions { get; set; }
    public string? DesiredTimeline { get; set; }
    public string Message { get; set; } = string.Empty;
    public InquiryStatus Status { get; set; } = InquiryStatus.New;
    public string? ArtistNotes { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation property
    public Artwork? Artwork { get; set; }
}
