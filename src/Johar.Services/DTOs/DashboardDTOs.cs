namespace Johar.Services.DTOs;

public class DashboardSummaryDto
{
    public int TotalArtworks { get; set; }
    public int PublishedArtworks { get; set; }
    public int DraftArtworks { get; set; }
    public int AvailableArtworks { get; set; }
    public int TotalCategories { get; set; }
    public int TotalCollections { get; set; }
    public int NewInquiriesCount { get; set; }
    public int ActiveInquiriesCount { get; set; }
    public List<InquiryDto> RecentInquiries { get; set; } = new();
}
