using Johar.Services.DTOs;
using Microsoft.AspNetCore.Http;

namespace Johar.Services.Interfaces;

public interface ICloudinaryService
{
    /// <summary>
    /// Uploads an artwork image while strictly preserving 100% of the composition and aspect ratio.
    /// Strictly prohibits c_fill, c_crop, or g_face.
    /// </summary>
    Task<AtelierImageUploadResult> UploadArtworkImageAsync(IFormFile file, string subFolder = "artworks");

    /// <summary>
    /// Uploads the artist's personal portrait for SiteSettings with optional face-aware cropping.
    /// Isolated strictly to the artist profile.
    /// </summary>
    Task<AtelierImageUploadResult> UploadArtistPortraitAsync(IFormFile file);

    /// <summary>
    /// Deletes an asset by its public ID from Cloudinary (or local fallback storage).
    /// </summary>
    Task<bool> DeleteAssetAsync(string publicId);

    /// <summary>
    /// Returns the non-cropping master/detail delivery URL: c_limit,w_1800,q_auto,f_auto.
    /// </summary>
    string GetArtworkMasterUrl(string originalUrl);

    /// <summary>
    /// Returns the non-cropping gallery thumbnail URL: c_limit,w_600,q_auto,f_auto.
    /// </summary>
    string GetArtworkThumbnailUrl(string originalUrl);

    /// <summary>
    /// Returns the artist portrait URL with face-aware framing: c_fill,g_face,w_{size},h_{size},q_auto,f_auto.
    /// </summary>
    string GetArtistPortraitUrl(string originalUrl, int size = 800);
}
