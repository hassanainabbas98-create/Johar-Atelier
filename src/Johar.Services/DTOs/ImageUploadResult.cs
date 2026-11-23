namespace Johar.Services.DTOs;

public class AtelierImageUploadResult
{
    public string PublicId { get; set; } = string.Empty;
    public string SecureUrl { get; set; } = string.Empty;
    public int Width { get; set; }
    public int Height { get; set; }
    public string? Format { get; set; }
    public decimal AspectRatio { get; set; }
    public bool IsFallbackLocal { get; set; }
}
