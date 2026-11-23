using System.Text.RegularExpressions;

namespace Johar.Services.Common;

/// <summary>
/// URL slug normalization utility.
/// </summary>
public static partial class SlugHelper
{
    public static string GenerateSlug(string text)
    {
        if (string.IsNullOrWhiteSpace(text))
            return string.Empty;

        // Convert to lowercase and trim
        var str = text.ToLowerInvariant().Trim();

        // Replace accented characters or ampersands
        str = str.Replace("&", "and");

        // Remove invalid characters
        str = Regex.Replace(str, @"[^a-z0-9\s-]", "");

        // Convert multiple spaces into one space
        str = Regex.Replace(str, @"\s+", " ").Trim();

        // Cut and trim
        str = str.Substring(0, str.Length <= 100 ? str.Length : 100).Trim();

        // Replace spaces with hyphens
        str = Regex.Replace(str, @"\s", "-");

        // Remove multiple hyphens
        str = Regex.Replace(str, @"-+", "-");

        return str;
    }
}
