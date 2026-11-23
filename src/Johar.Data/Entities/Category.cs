namespace Johar.Data.Entities;

/// <summary>
/// Represents an artistic medium taxonomy category (e.g. Oil Paintings, Watercolors, Calligraphy).
/// </summary>
public class Category
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int DisplayOrder { get; set; } = 0;
    public bool IsActive { get; set; } = true;

    // Navigation properties
    public ICollection<Artwork> Artworks { get; set; } = new List<Artwork>();
}
