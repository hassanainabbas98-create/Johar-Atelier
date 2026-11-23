namespace Johar.Services.Common;

/// <summary>
/// Strongly-typed configuration options for Cloudinary asset delivery.
/// Credentials remain strictly server-side and are never exposed to the client.
/// </summary>
public class CloudinaryOptions
{
    public const string SectionName = "Cloudinary";

    public string CloudName { get; set; } = string.Empty;
    public string ApiKey { get; set; } = string.Empty;
    public string ApiSecret { get; set; } = string.Empty;
    public string FolderPrefix { get; set; } = "atelier";

    /// <summary>
    /// Returns true if valid, non-placeholder credentials have been supplied.
    /// In local development without credentials, a local file fallback is activated.
    /// </summary>
    public bool IsConfigured =>
        !string.IsNullOrWhiteSpace(CloudName) &&
        !string.Equals(CloudName, "placeholder", StringComparison.OrdinalIgnoreCase) &&
        !string.IsNullOrWhiteSpace(ApiKey) &&
        !string.IsNullOrWhiteSpace(ApiSecret);
}
