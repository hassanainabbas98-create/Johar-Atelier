using Johar.Services.Common;
using Johar.Services.DTOs;
using Microsoft.AspNetCore.Http;

namespace Johar.Services.Interfaces;

public interface IArtworkService
{
    Task<PagedResult<ArtworkSummaryDto>> GetPublicArtworksAsync(ArtworkQueryParameters query);
    Task<ArtworkDetailDto> GetPublicArtworkBySlugAsync(string slug);
    Task<PagedResult<AdminArtworkDto>> GetAdminArtworksAsync(ArtworkQueryParameters query);
    Task<AdminArtworkDto> GetAdminArtworkByIdAsync(int id);
    Task<AdminArtworkDto> CreateArtworkAsync(CreateArtworkDto dto);
    Task<AdminArtworkDto> UpdateArtworkAsync(int id, UpdateArtworkDto dto);
    Task<AdminArtworkDto> TogglePublishStatusAsync(int id, bool isPublished);
    Task<AdminArtworkDto> ToggleFeaturedStatusAsync(int id, bool isFeatured);
    Task DeleteArtworkAsync(int id);

    // Image operations
    Task<ArtworkImageDto> AddImageAsync(int artworkId, IFormFile file, string? altText, bool isPrimary = false);
    Task<ArtworkImageDto> ReplaceImageAsync(int artworkId, int imageId, IFormFile file, string? altText);
    Task<ArtworkImageDto> UpdateImageMetadataAsync(int artworkId, int imageId, UpdateArtworkImageDto dto);
    Task DeleteImageMetadataAsync(int artworkId, int imageId);
}
