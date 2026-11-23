using Johar.Data;
using Johar.Data.Entities;
using Johar.Services.Common;
using Johar.Services.DTOs;
using Johar.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Johar.Services.Implementations;

public class InquiryService : IInquiryService
{
    private readonly ApplicationDbContext _db;

    public InquiryService(ApplicationDbContext db)
    {
        _db = db;
    }

    public async Task<InquiryDto> SubmitInquiryAsync(CreateInquiryRequest request)
    {
        // 1. Anti-bot honeypot check
        if (!string.IsNullOrWhiteSpace(request.Honeypot))
        {
            // Bot detected. Return early or reject.
            throw new AtelierValidationException("Honeypot", "Bot submission detected.");
        }

        // 2. Validate email format
        if (string.IsNullOrWhiteSpace(request.Email) || !request.Email.Contains('@'))
        {
            throw new AtelierValidationException("Email", "A valid email address is required.");
        }

        // 3. Validate Artwork reference if provided
        Artwork? artwork = null;
        if (request.ArtworkId.HasValue)
        {
            artwork = await _db.Artworks
                .Include(a => a.Images)
                .FirstOrDefaultAsync(a => a.Id == request.ArtworkId.Value);

            if (artwork == null)
            {
                throw new AtelierValidationException("ArtworkId", $"Artwork ID {request.ArtworkId.Value} does not exist.");
            }
        }

        // 4. Validate ClientLocation length
        if (request.ClientLocation != null && request.ClientLocation.Length > 150)
        {
            throw new AtelierValidationException("ClientLocation", "Client location cannot exceed 150 characters.");
        }

        var inquiry = new Inquiry
        {
            InquiryType = request.InquiryType,
            ArtworkId = request.ArtworkId,
            ClientName = request.ClientName.Trim(),
            Email = request.Email.Trim().ToLowerInvariant(),
            Phone = request.Phone?.Trim(),
            ClientLocation = request.ClientLocation?.Trim(),
            MediumPreference = request.MediumPreference?.Trim(),
            DesiredDimensions = request.DesiredDimensions?.Trim(),
            DesiredTimeline = request.DesiredTimeline?.Trim(),
            Message = request.Message.Trim(),
            Status = InquiryStatus.New,
            CreatedAt = DateTime.UtcNow
        };

        await _db.Inquiries.AddAsync(inquiry);
        await _db.SaveChangesAsync();

        return MapToDto(inquiry, artwork);
    }

    public async Task<PagedResult<InquiryDto>> GetInquiriesAsync(InquiryQueryParameters query)
    {
        var baseQuery = _db.Inquiries
            .AsNoTracking()
            .Include(i => i.Artwork!)
                .ThenInclude(a => a.Images)
            .AsQueryable();

        if (query.Status.HasValue)
        {
            baseQuery = baseQuery.Where(i => i.Status == query.Status.Value);
        }

        if (query.Type.HasValue)
        {
            baseQuery = baseQuery.Where(i => i.InquiryType == query.Type.Value);
        }

        var totalCount = await baseQuery.CountAsync();
        var page = query.Page > 0 ? query.Page : 1;
        var pageSize = query.PageSize > 0 && query.PageSize <= 100 ? query.PageSize : 20;

        var items = await baseQuery
            .OrderByDescending(i => i.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(i => MapToDto(i, i.Artwork))
            .ToListAsync();

        return new PagedResult<InquiryDto>(items, totalCount, page, pageSize);
    }

    public async Task<InquiryDto> GetInquiryByIdAsync(int id)
    {
        var inquiry = await _db.Inquiries
            .AsNoTracking()
            .Include(i => i.Artwork!)
                .ThenInclude(a => a.Images)
            .FirstOrDefaultAsync(i => i.Id == id);

        if (inquiry == null)
            throw new AtelierNotFoundException($"Inquiry with ID {id} was not found.");

        return MapToDto(inquiry, inquiry.Artwork);
    }

    public async Task<InquiryDto> UpdateStatusAsync(int id, InquiryStatus status)
    {
        var inquiry = await _db.Inquiries
            .Include(i => i.Artwork!)
                .ThenInclude(a => a.Images)
            .FirstOrDefaultAsync(i => i.Id == id);

        if (inquiry == null)
            throw new AtelierNotFoundException($"Inquiry with ID {id} was not found.");

        inquiry.Status = status;
        await _db.SaveChangesAsync();

        return MapToDto(inquiry, inquiry.Artwork);
    }

    public async Task<InquiryDto> UpdateNotesAsync(int id, string? notes)
    {
        var inquiry = await _db.Inquiries
            .Include(i => i.Artwork!)
                .ThenInclude(a => a.Images)
            .FirstOrDefaultAsync(i => i.Id == id);

        if (inquiry == null)
            throw new AtelierNotFoundException($"Inquiry with ID {id} was not found.");

        inquiry.ArtistNotes = notes?.Trim();
        await _db.SaveChangesAsync();

        return MapToDto(inquiry, inquiry.Artwork);
    }

    private static InquiryDto MapToDto(Inquiry i, Artwork? artwork)
    {
        var primaryImage = artwork?.Images?.FirstOrDefault(img => img.IsPrimary) 
            ?? artwork?.Images?.OrderBy(img => img.DisplayOrder).FirstOrDefault();

        return new InquiryDto
        {
            Id = i.Id,
            InquiryType = i.InquiryType,
            ArtworkId = i.ArtworkId,
            ArtworkTitle = artwork?.Title,
            ArtworkSlug = artwork?.Slug,
            ArtworkThumbnailUrl = primaryImage?.SecureUrl,
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
        };
    }
}
