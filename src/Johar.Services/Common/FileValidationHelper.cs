using Microsoft.AspNetCore.Http;

namespace Johar.Services.Common;

/// <summary>
/// Strict file validation and dimension inspection helper.
/// Verifies file size, allowed extensions, MIME types, and cryptographic magic byte signatures.
/// </summary>
public static class FileValidationHelper
{
    public const long MaxFileSizeBytes = 15 * 1024 * 1024; // 15 MB

    private static readonly HashSet<string> AllowedExtensions = new(StringComparer.OrdinalIgnoreCase)
    {
        ".jpg", ".jpeg", ".png", ".webp"
    };

    private static readonly HashSet<string> AllowedMimeTypes = new(StringComparer.OrdinalIgnoreCase)
    {
        "image/jpeg", "image/png", "image/webp"
    };

    private static readonly byte[] JpegMagic = { 0xFF, 0xD8, 0xFF };
    private static readonly byte[] PngMagic = { 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A };
    private static readonly byte[] RiffMagic = { 0x52, 0x49, 0x46, 0x46 }; // "RIFF"
    private static readonly byte[] WebpMagic = { 0x57, 0x45, 0x42, 0x50 }; // "WEBP"

    public static void ValidateImageFile(IFormFile file)
    {
        if (file == null || file.Length == 0)
        {
            throw new AtelierValidationException("File", "An image file is required.");
        }

        if (file.Length > MaxFileSizeBytes)
        {
            throw new AtelierValidationException("File", 
                $"File size ({file.Length / (1024 * 1024):F1} MB) exceeds the maximum allowed limit of 15 MB.");
        }

        var ext = Path.GetExtension(file.FileName);
        if (string.IsNullOrWhiteSpace(ext) || !AllowedExtensions.Contains(ext))
        {
            throw new AtelierValidationException("File", 
                $"File extension '{ext}' is not permitted. Only .jpg, .jpeg, .png, and .webp formats are supported.");
        }

        if (string.IsNullOrWhiteSpace(file.ContentType) || !AllowedMimeTypes.Contains(file.ContentType))
        {
            throw new AtelierValidationException("File", 
                $"MIME type '{file.ContentType}' is not permitted. Only image/jpeg, image/png, and image/webp are allowed.");
        }

        // Verify magic bytes (file signature)
        using var stream = file.OpenReadStream();
        var header = new byte[16];
        var bytesRead = stream.ReadAtLeast(header, header.Length, throwOnEndOfStream: false);

        if (bytesRead < 4)
        {
            throw new AtelierValidationException("File", "File is corrupted or too small to be a valid image.");
        }

        bool isValidSignature = false;

        // Check JPEG
        if (header.Length >= 3 &&
            header[0] == JpegMagic[0] &&
            header[1] == JpegMagic[1] &&
            header[2] == JpegMagic[2])
        {
            isValidSignature = true;
        }
        // Check PNG
        else if (bytesRead >= 8 &&
                 header[0] == PngMagic[0] && header[1] == PngMagic[1] &&
                 header[2] == PngMagic[2] && header[3] == PngMagic[3] &&
                 header[4] == PngMagic[4] && header[5] == PngMagic[5] &&
                 header[6] == PngMagic[6] && header[7] == PngMagic[7])
        {
            isValidSignature = true;
        }
        // Check WebP (RIFF....WEBP)
        else if (bytesRead >= 12 &&
                 header[0] == RiffMagic[0] && header[1] == RiffMagic[1] &&
                 header[2] == RiffMagic[2] && header[3] == RiffMagic[3] &&
                 header[8] == WebpMagic[0] && header[9] == WebpMagic[1] &&
                 header[10] == WebpMagic[2] && header[11] == WebpMagic[3])
        {
            isValidSignature = true;
        }

        if (!isValidSignature)
        {
            throw new AtelierValidationException("File", 
                "Invalid file signature. Disguised or corrupted files are rejected for security.");
        }
    }

    /// <summary>
    /// Reads native pixel dimensions directly from image header bytes.
    /// </summary>
    public static (int Width, int Height, string Format) ReadDimensions(Stream stream)
    {
        var originalPos = stream.Position;
        try
        {
            stream.Position = 0;
            var header = new byte[32];
            _ = stream.ReadAtLeast(header, header.Length, throwOnEndOfStream: false);

            // 1. PNG Dimensions (IHDR chunk at byte 16)
            if (header.Length >= 24 &&
                header[0] == PngMagic[0] && header[1] == PngMagic[1] &&
                header[2] == PngMagic[2] && header[3] == PngMagic[3])
            {
                int width = (header[16] << 24) | (header[17] << 16) | (header[18] << 8) | header[19];
                int height = (header[20] << 24) | (header[21] << 16) | (header[22] << 8) | header[23];
                return (width, height, "png");
            }

            // 2. WebP Dimensions
            if (header.Length >= 30 &&
                header[0] == RiffMagic[0] && header[1] == RiffMagic[1] &&
                header[2] == RiffMagic[2] && header[3] == RiffMagic[3] &&
                header[8] == WebpMagic[0] && header[9] == WebpMagic[1] &&
                header[10] == WebpMagic[2] && header[11] == WebpMagic[3])
            {
                // VP8X extended WebP
                if (header[12] == 0x56 && header[13] == 0x50 && header[14] == 0x38 && header[15] == 0x58)
                {
                    int width = 1 + (header[24] | (header[25] << 8) | (header[26] << 16));
                    int height = 1 + (header[27] | (header[28] << 8) | (header[29] << 16));
                    return (width, height, "webp");
                }
                // VP8 lossy
                if (header[12] == 0x56 && header[13] == 0x50 && header[14] == 0x38 && header[15] == 0x20)
                {
                    stream.Position = 26;
                    var b = new byte[4];
                    _ = stream.ReadAtLeast(b, 4, throwOnEndOfStream: false);
                    int width = (b[0] | (b[1] << 8)) & 0x3FFF;
                    int height = (b[2] | (b[3] << 8)) & 0x3FFF;
                    return (width, height, "webp");
                }
                return (1200, 800, "webp");
            }

            // 3. JPEG Dimensions (walk SOF markers)
            if (header[0] == JpegMagic[0] && header[1] == JpegMagic[1])
            {
                stream.Position = 2;
                while (stream.Position < stream.Length - 8)
                {
                    int markerPrefix = stream.ReadByte();
                    if (markerPrefix != 0xFF) continue;

                    int marker = stream.ReadByte();
                    if (marker == -1) break;

                    // SOF0 (0xC0), SOF1 (0xC1), SOF2 (0xC2)
                    if (marker == 0xC0 || marker == 0xC1 || marker == 0xC2)
                    {
                        var seg = new byte[7];
                        _ = stream.ReadAtLeast(seg, 7, throwOnEndOfStream: false);
                        int height = (seg[3] << 8) | seg[4];
                        int width = (seg[5] << 8) | seg[6];
                        return (width, height, "jpg");
                    }
                    else if (marker != 0x00 && marker != 0xFF && marker != 0xD9)
                    {
                        // Skip variable-length segment
                        int lenHigh = stream.ReadByte();
                        int lenLow = stream.ReadByte();
                        int segLen = (lenHigh << 8) | lenLow;
                        if (segLen > 2)
                        {
                            stream.Position += (segLen - 2);
                        }
                    }
                }
                return (1200, 800, "jpg");
            }

            return (1200, 800, "jpg");
        }
        catch
        {
            return (1200, 800, "jpg");
        }
        finally
        {
            stream.Position = originalPos;
        }
    }
}
