using Johar.Services.DTOs;
using Microsoft.AspNetCore.Http;

namespace Johar.Services.Interfaces;

public interface ISiteSettingsService
{
    Task<PublicProfileDto> GetPublicProfileAsync();
    Task<PublicProfileDto> GetAdminSettingsAsync();
    Task<PublicProfileDto> UpdateSettingsAsync(UpdateSiteSettingsDto dto);
    Task<PublicProfileDto> UploadPortraitAsync(IFormFile file, string? profilePictureAlt);
    Task<PublicProfileDto> DeletePortraitAsync();
}
