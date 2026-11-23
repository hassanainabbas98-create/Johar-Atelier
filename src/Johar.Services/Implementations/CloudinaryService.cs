using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using Johar.Services.Common;
using Johar.Services.DTOs;
using Johar.Services.Interfaces;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Johar.Services.Implementations;

public class CloudinaryService : ICloudinaryService
{
    private readonly CloudinaryOptions _options;
    private readonly IWebHostEnvironment _env;
    private readonly ILogger<CloudinaryService> _logger;
    private readonly Cloudinary? _cloudinary;

    public CloudinaryService(
        IOptions<CloudinaryOptions> options,
        IWebHostEnvironment env,
        ILogger<CloudinaryService> logger)
    {
        _options = options.Value;
        _env = env;
        _logger = logger;

        if (_options.IsConfigured)
        {
            var account = new Account(_options.CloudName, _options.ApiKey, _options.ApiSecret);
            _cloudinary = new Cloudinary(account) { Api = { Secure = true } };
            _logger.LogInformation("Cloudinary client initialized for cloud '{CloudName}'.", _options.CloudName);
        }
        else
        {
            _logger.LogWarning("Cloudinary credentials not configured or set to placeholder. Operating in local file fallback mode.");
        }
    }

    public async Task<AtelierImageUploadResult> UploadArtworkImageAsync(IFormFile file, string subFolder = "artworks")
    {
        // 1. Strict File Validation (Size, Extension, MIME, Magic Bytes)
        FileValidationHelper.ValidateImageFile(file);

        // 2. Live Cloudinary Upload Pipeline
        if (_cloudinary != null)
        {
            await using var stream = file.OpenReadStream();
            var uploadParams = new ImageUploadParams
            {
                File = new FileDescription(file.FileName, stream),
                Folder = $"{_options.FolderPrefix}/{subFolder}",
                UseFilename = false,
                UniqueFilename = true,
                Overwrite = false,
                // CRITICAL ARTWORK INTEGRITY: Never apply c_fill, c_crop, or g_face
                Transformation = null
            };

            var uploadResult = await _cloudinary.UploadAsync(uploadParams);
            if (uploadResult.Error != null)
            {
                _logger.LogError("Cloudinary upload failed: {Error}", uploadResult.Error.Message);
                throw new AtelierValidationException("Upload", $"Image upload failed: {uploadResult.Error.Message}");
            }

            var width = uploadResult.Width;
            var height = uploadResult.Height;
            var aspectRatio = height > 0 ? Math.Round((decimal)width / height, 2) : 1.0m;

            return new AtelierImageUploadResult
            {
                PublicId = uploadResult.PublicId,
                SecureUrl = uploadResult.SecureUrl?.ToString() ?? uploadResult.Url?.ToString() ?? string.Empty,
                Width = width,
                Height = height,
                Format = uploadResult.Format,
                AspectRatio = aspectRatio,
                IsFallbackLocal = false
            };
        }

        // 3. Development-Only Local File Fallback
        return await SaveLocalFallbackImageAsync(file, subFolder, isPortrait: false);
    }

    public async Task<AtelierImageUploadResult> UploadArtistPortraitAsync(IFormFile file)
    {
        // 1. Strict File Validation
        FileValidationHelper.ValidateImageFile(file);

        // 2. Live Cloudinary Upload Pipeline (Isolated to Artist Portrait: allows g_face face-aware crop)
        if (_cloudinary != null)
        {
            await using var stream = file.OpenReadStream();
            var uploadParams = new ImageUploadParams
            {
                File = new FileDescription(file.FileName, stream),
                Folder = $"{_options.FolderPrefix}/profile",
                UseFilename = false,
                UniqueFilename = true,
                Overwrite = false,
                // Face-aware cropping isolated strictly to artist portrait
                Transformation = new Transformation()
                    .Width(800)
                    .Height(800)
                    .Crop("fill")
                    .Gravity("face")
                    .Quality("auto")
                    .FetchFormat("auto")
            };

            var uploadResult = await _cloudinary.UploadAsync(uploadParams);
            if (uploadResult.Error != null)
            {
                _logger.LogError("Cloudinary portrait upload failed: {Error}", uploadResult.Error.Message);
                throw new AtelierValidationException("Upload", $"Portrait upload failed: {uploadResult.Error.Message}");
            }

            return new AtelierImageUploadResult
            {
                PublicId = uploadResult.PublicId,
                SecureUrl = uploadResult.SecureUrl?.ToString() ?? uploadResult.Url?.ToString() ?? string.Empty,
                Width = uploadResult.Width,
                Height = uploadResult.Height,
                Format = uploadResult.Format,
                AspectRatio = 1.0m,
                IsFallbackLocal = false
            };
        }

        // 3. Development-Only Local File Fallback
        return await SaveLocalFallbackImageAsync(file, "profile", isPortrait: true);
    }

    public async Task<bool> DeleteAssetAsync(string publicId)
    {
        if (string.IsNullOrWhiteSpace(publicId))
            return false;

        if (_cloudinary != null)
        {
            var deleteParams = new DeletionParams(publicId) { Invalidate = true };
            var result = await _cloudinary.DestroyAsync(deleteParams);
            return result.Result == "ok";
        }

        // Local fallback cleanup
        try
        {
            var webRoot = _env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
            var uploadsDir = Path.Combine(webRoot, "uploads");

            if (Directory.Exists(uploadsDir))
            {
                var files = Directory.GetFiles(uploadsDir, "*.*", SearchOption.AllDirectories);
                foreach (var file in files)
                {
                    if (file.Contains(Path.GetFileName(publicId), StringComparison.OrdinalIgnoreCase))
                    {
                        File.Delete(file);
                        return true;
                    }
                }
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to delete local fallback image for publicId: {PublicId}", publicId);
        }

        return false;
    }

    public string GetArtworkMasterUrl(string originalUrl)
    {
        if (string.IsNullOrWhiteSpace(originalUrl))
            return string.Empty;

        // Cloudinary URL transformation injection
        if (originalUrl.Contains("res.cloudinary.com") && originalUrl.Contains("/upload/"))
        {
            return originalUrl.Replace("/upload/", "/upload/c_limit,w_1800,q_auto,f_auto/");
        }

        return originalUrl;
    }

    public string GetArtworkThumbnailUrl(string originalUrl)
    {
        if (string.IsNullOrWhiteSpace(originalUrl))
            return string.Empty;

        // Cloudinary URL transformation injection (strictly c_limit, zero c_fill or g_face)
        if (originalUrl.Contains("res.cloudinary.com") && originalUrl.Contains("/upload/"))
        {
            return originalUrl.Replace("/upload/", "/upload/c_limit,w_600,q_auto,f_auto/");
        }

        return originalUrl;
    }

    public string GetArtistPortraitUrl(string originalUrl, int size = 800)
    {
        if (string.IsNullOrWhiteSpace(originalUrl))
            return string.Empty;

        if (originalUrl.Contains("res.cloudinary.com") && originalUrl.Contains("/upload/"))
        {
            return originalUrl.Replace("/upload/", $"/upload/c_fill,g_face,w_{size},h_{size},q_auto,f_auto/");
        }

        return originalUrl;
    }

    private async Task<AtelierImageUploadResult> SaveLocalFallbackImageAsync(IFormFile file, string subFolder, bool isPortrait)
    {
        var webRoot = _env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
        var targetDir = Path.Combine(webRoot, "uploads", subFolder);
        Directory.CreateDirectory(targetDir);

        var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
        var uniqueName = $"{Guid.NewGuid():N}_{Path.GetFileNameWithoutExtension(file.FileName)}{ext}";
        var filePath = Path.Combine(targetDir, uniqueName);

        await using (var fileStream = new FileStream(filePath, FileMode.Create))
        {
            await file.CopyToAsync(fileStream);
        }

        // Apply archival security watermark ("Art By Johar") to artwork photographs
        if (!isPortrait)
        {
            try
            {
                var candidates = new[]
                {
                    Path.Combine(Directory.GetCurrentDirectory(), "scripts", "watermark_artworks.py"),
                    Path.Combine(AppContext.BaseDirectory, "scripts", "watermark_artworks.py"),
                    Path.Combine(_env.ContentRootPath, "scripts", "watermark_artworks.py"),
                    Path.Combine(_env.ContentRootPath, "..", "..", "scripts", "watermark_artworks.py")
                };

                var scriptPath = candidates.FirstOrDefault(File.Exists);
                if (scriptPath != null)
                {
                    var psi = new System.Diagnostics.ProcessStartInfo
                    {
                        FileName = "python",
                        Arguments = $"\"{scriptPath}\" \"{filePath}\"",
                        RedirectStandardOutput = true,
                        RedirectStandardError = true,
                        UseShellExecute = false,
                        CreateNoWindow = true
                    };
                    using var proc = System.Diagnostics.Process.Start(psi);
                    proc?.WaitForExit(10000);
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to apply server-side watermark to {FilePath}", filePath);
            }
        }

        // Inspect native dimensions
        int width, height;
        string format;
        await using (var readStream = new FileStream(filePath, FileMode.Open, FileAccess.Read))
        {
            (width, height, format) = FileValidationHelper.ReadDimensions(readStream);
        }

        var publicId = $"{_options.FolderPrefix}/{subFolder}/{Path.GetFileNameWithoutExtension(uniqueName)}";
        var relativeUrl = $"/uploads/{subFolder}/{uniqueName}";
        var aspectRatio = height > 0 ? Math.Round((decimal)width / height, 2) : 1.0m;

        return new AtelierImageUploadResult
        {
            PublicId = publicId,
            SecureUrl = relativeUrl,
            Width = width,
            Height = height,
            Format = format,
            AspectRatio = isPortrait ? 1.0m : aspectRatio,
            IsFallbackLocal = true
        };
    }
}
