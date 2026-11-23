using Johar.Data;
using Johar.Data.Entities;
using Johar.Services.DTOs;
using Johar.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Johar.Services.Implementations;

public class DashboardService : IDashboardService
{
    private readonly ApplicationDbContext _db;

    public DashboardService(ApplicationDbContext db)
    {
        _db = db;
    }

    public async Task<DashboardSummaryDto> GetSummaryAsync()
    {
        var totalArtworks = await _db.Artworks.CountAsync();
        var publishedArtworks = await _db.Artworks.CountAsync(a => a.IsPublished);
        var draftArtworks = totalArtworks - publishedArtworks;
        var availableArtworks = await _db.Artworks.CountAsync(a => a.AvailabilityStatus == AvailabilityStatus.Available);

        var totalCategories = await _db.Categories.CountAsync();
        var totalCollections = await _db.Collections.CountAsync();

        var newInquiries = await _db.Inquiries.CountAsync(i => i.Status == InquiryStatus.New);
        var activeInquiries = await _db.Inquiries.CountAsync(i => 
            i.Status == InquiryStatus.New || 
            i.Status == InquiryStatus.InReview || 
            i.Status == InquiryStatus.Contacted);

        var recentInquiries = await _db.Inquiries
            .AsNoTracking()
            .Include(i => i.Artwork!)
                .ThenInclude(a => a.Images)
            .OrderByDescending(i => i.CreatedAt)
            .Take(5)
            .Select(i => new InquiryDto
            {
                Id = i.Id,
                InquiryType = i.InquiryType,
                ArtworkId = i.ArtworkId,
                ArtworkTitle = i.Artwork != null ? i.Artwork.Title : null,
                ArtworkSlug = i.Artwork != null ? i.Artwork.Slug : null,
                ArtworkThumbnailUrl = i.Artwork != null && i.Artwork.Images.Any()
                    ? i.Artwork.Images.OrderBy(img => img.DisplayOrder).First().SecureUrl
                    : null,
                ClientName = i.ClientName,
                Email = i.Email,
                Phone = i.Phone,
                ClientLocation = i.ClientLocation,
                MediumPreference = i.MediumPreference,
                DesiredDimensions = i.DesiredDimensions,
                DesiredTimeline = i.DesiredTimeline,
                Message = i.Message,
                Status = i.Status,
                ArtistNotes = i.ArtistNotes,
                CreatedAt = i.CreatedAt
            })
            .ToListAsync();

        return new DashboardSummaryDto
        {
            TotalArtworks = totalArtworks,
            PublishedArtworks = publishedArtworks,
            DraftArtworks = draftArtworks,
            AvailableArtworks = availableArtworks,
            TotalCategories = totalCategories,
            TotalCollections = totalCollections,
            NewInquiriesCount = newInquiries,
            ActiveInquiriesCount = activeInquiries,
            RecentInquiries = recentInquiries
        };
    }
}
