using Johar.Data;
using Johar.Data.Entities;
using Johar.Services.DTOs;
using Johar.Services.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;

namespace Johar.Services.Implementations;

public class SiteSettingsService : ISiteSettingsService
{
    private readonly ApplicationDbContext _db;
    private readonly ICloudinaryService _cloudinaryService;

    public SiteSettingsService(ApplicationDbContext db, ICloudinaryService cloudinaryService)
    {
        _db = db;
        _cloudinaryService = cloudinaryService;
    }

    public async Task<PublicProfileDto> GetPublicProfileAsync()
    {
        var settings = await GetOrCreateSettingsAsync();
        return MapToDto(settings, _cloudinaryService);
    }

    public async Task<PublicProfileDto> GetAdminSettingsAsync()
    {
        var settings = await GetOrCreateSettingsAsync();
        return MapToDto(settings, _cloudinaryService);
    }

    public async Task<PublicProfileDto> UpdateSettingsAsync(UpdateSiteSettingsDto dto)
    {
        var settings = await GetOrCreateSettingsAsync();

        settings.ArtistName = dto.ArtistName.Trim();
        settings.HomeIntroText = dto.HomeIntroText?.Trim();
        settings.ArtistStatement = dto.ArtistStatement?.Trim();
        settings.AboutBiography = dto.AboutBiography?.Trim();
        settings.TechniquesAndMaterials = dto.TechniquesAndMaterials?.Trim();
        settings.ExhibitionHighlights = dto.ExhibitionHighlights?.Trim();
        settings.ContactEmail = dto.ContactEmail.Trim().ToLowerInvariant();
        settings.StudioLocation = dto.StudioLocation?.Trim();
        settings.InstagramHandle = dto.InstagramHandle?.Trim();
        settings.SocialLinksJson = dto.SocialLinksJson?.Trim();
        settings.ProfilePictureAlt = dto.ProfilePictureAlt?.Trim();
        settings.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();

        return MapToDto(settings, _cloudinaryService);
    }

    public async Task<PublicProfileDto> UploadPortraitAsync(IFormFile file, string? profilePictureAlt)
    {
        var settings = await GetOrCreateSettingsAsync();

        // Clean up previous portrait asset if present
        if (!string.IsNullOrWhiteSpace(settings.ProfilePicturePublicId))
        {
            await _cloudinaryService.DeleteAssetAsync(settings.ProfilePicturePublicId);
        }

        // Upload portrait via Cloudinary service (isolated face-aware cropping)
        var uploadResult = await _cloudinaryService.UploadArtistPortraitAsync(file);

        settings.ProfilePictureUrl = uploadResult.SecureUrl;
        settings.ProfilePicturePublicId = uploadResult.PublicId;

        if (!string.IsNullOrWhiteSpace(profilePictureAlt))
        {
            settings.ProfilePictureAlt = profilePictureAlt.Trim();
        }

        settings.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        return MapToDto(settings, _cloudinaryService);
    }

    public async Task<PublicProfileDto> DeletePortraitAsync()
    {
        var settings = await GetOrCreateSettingsAsync();

        if (!string.IsNullOrWhiteSpace(settings.ProfilePicturePublicId))
        {
            await _cloudinaryService.DeleteAssetAsync(settings.ProfilePicturePublicId);
        }

        settings.ProfilePictureUrl = null;
        settings.ProfilePicturePublicId = null;
        settings.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();

        return MapToDto(settings, _cloudinaryService);
    }

    private async Task<SiteSettings> GetOrCreateSettingsAsync()
    {
        var settings = await _db.SiteSettings.FirstOrDefaultAsync(s => s.Id == 1);
        if (settings == null)
        {
            settings = new SiteSettings
            {
                Id = 1,
                ArtistName = "[Illustrative Placeholder: Artist Name]",
                ContactEmail = "inquiries@atelier.local",
                UpdatedAt = DateTime.UtcNow
            };
            await _db.SiteSettings.AddAsync(settings);
            await _db.SaveChangesAsync();
        }
        return settings;
    }

    private static PublicProfileDto MapToDto(SiteSettings s, ICloudinaryService cloudinary)
    {
        var portraitUrl = !string.IsNullOrWhiteSpace(s.ProfilePictureUrl)
            ? cloudinary.GetArtistPortraitUrl(s.ProfilePictureUrl)
            : null;

        return new PublicProfileDto
        {
            ArtistName = s.ArtistName,
            ProfilePictureUrl = portraitUrl,
            ProfilePictureAlt = s.ProfilePictureAlt,
            HomeIntroText = s.HomeIntroText,
            ArtistStatement = s.ArtistStatement,
            AboutBiography = s.AboutBiography,
            TechniquesAndMaterials = s.TechniquesAndMaterials,
            ExhibitionHighlights = s.ExhibitionHighlights,
            ContactEmail = s.ContactEmail,
            StudioLocation = s.StudioLocation,
            InstagramHandle = s.InstagramHandle,
            SocialLinksJson = s.SocialLinksJson,
            UpdatedAt = s.UpdatedAt
        };
    }
}
