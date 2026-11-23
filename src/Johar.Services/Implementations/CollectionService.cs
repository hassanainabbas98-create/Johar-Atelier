using Johar.Data;
using Johar.Data.Entities;
using Johar.Services.Common;
using Johar.Services.DTOs;
using Johar.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Johar.Services.Implementations;

public class CollectionService : ICollectionService
{
    private readonly ApplicationDbContext _db;

    public CollectionService(ApplicationDbContext db)
    {
        _db = db;
    }

    public async Task<IReadOnlyList<CollectionDto>> GetPublishedCollectionsAsync()
    {
        return await _db.Collections
            .AsNoTracking()
            .Where(c => c.IsPublished)
            .OrderBy(c => c.DisplayOrder)
            .ThenByDescending(c => c.CreatedAt)
            .Select(c => new CollectionDto
            {
                Id = c.Id,
                Title = c.Title,
                Slug = c.Slug,
                CuratorNote = c.CuratorNote,
                CoverImageUrl = c.CoverImageUrl,
                DisplayOrder = c.DisplayOrder,
                IsPublished = c.IsPublished,
                CreatedAt = c.CreatedAt,
                ArtworkCount = c.Artworks.Count(a => a.IsPublished)
            })
            .ToListAsync();
    }

    public async Task<IReadOnlyList<CollectionDto>> GetAllCollectionsAsync()
    {
        return await _db.Collections
            .AsNoTracking()
            .OrderBy(c => c.DisplayOrder)
            .ThenByDescending(c => c.CreatedAt)
            .Select(c => new CollectionDto
            {
                Id = c.Id,
                Title = c.Title,
                Slug = c.Slug,
                CuratorNote = c.CuratorNote,
                CoverImageUrl = c.CoverImageUrl,
                DisplayOrder = c.DisplayOrder,
                IsPublished = c.IsPublished,
                CreatedAt = c.CreatedAt,
                ArtworkCount = c.Artworks.Count
            })
            .ToListAsync();
    }

    public async Task<CollectionDto> GetCollectionByIdAsync(int id)
    {
        var collection = await _db.Collections
            .AsNoTracking()
            .Include(c => c.Artworks)
            .FirstOrDefaultAsync(c => c.Id == id);

        if (collection == null)
            throw new AtelierNotFoundException($"Collection with ID {id} was not found.");

        return new CollectionDto
        {
            Id = collection.Id,
            Title = collection.Title,
            Slug = collection.Slug,
            CuratorNote = collection.CuratorNote,
            CoverImageUrl = collection.CoverImageUrl,
            DisplayOrder = collection.DisplayOrder,
            IsPublished = collection.IsPublished,
            CreatedAt = collection.CreatedAt,
            ArtworkCount = collection.Artworks.Count
        };
    }

    public async Task<CollectionDto> CreateCollectionAsync(CollectionUpsertDto dto)
    {
        var slug = string.IsNullOrWhiteSpace(dto.Slug)
            ? SlugHelper.GenerateSlug(dto.Title)
            : SlugHelper.GenerateSlug(dto.Slug);

        if (await _db.Collections.AnyAsync(c => c.Slug == slug))
            throw new AtelierValidationException("Slug", $"A collection with slug '{slug}' already exists.");

        var collection = new Collection
        {
            Title = dto.Title.Trim(),
            Slug = slug,
            CuratorNote = dto.CuratorNote?.Trim(),
            CoverImageUrl = dto.CoverImageUrl?.Trim(),
            DisplayOrder = dto.DisplayOrder,
            IsPublished = dto.IsPublished,
            CreatedAt = DateTime.UtcNow
        };

        await _db.Collections.AddAsync(collection);
        await _db.SaveChangesAsync();

        return new CollectionDto
        {
            Id = collection.Id,
            Title = collection.Title,
            Slug = collection.Slug,
            CuratorNote = collection.CuratorNote,
            CoverImageUrl = collection.CoverImageUrl,
            DisplayOrder = collection.DisplayOrder,
            IsPublished = collection.IsPublished,
            CreatedAt = collection.CreatedAt,
            ArtworkCount = 0
        };
    }

    public async Task<CollectionDto> UpdateCollectionAsync(int id, CollectionUpsertDto dto)
    {
        var collection = await _db.Collections
            .Include(c => c.Artworks)
            .FirstOrDefaultAsync(c => c.Id == id);

        if (collection == null)
            throw new AtelierNotFoundException($"Collection with ID {id} was not found.");

        var slug = string.IsNullOrWhiteSpace(dto.Slug)
            ? SlugHelper.GenerateSlug(dto.Title)
            : SlugHelper.GenerateSlug(dto.Slug);

        if (await _db.Collections.AnyAsync(c => c.Slug == slug && c.Id != id))
            throw new AtelierValidationException("Slug", $"Another collection with slug '{slug}' already exists.");

        collection.Title = dto.Title.Trim();
        collection.Slug = slug;
        collection.CuratorNote = dto.CuratorNote?.Trim();
        collection.CoverImageUrl = dto.CoverImageUrl?.Trim();
        collection.DisplayOrder = dto.DisplayOrder;
        collection.IsPublished = dto.IsPublished;

        await _db.SaveChangesAsync();

        return new CollectionDto
        {
            Id = collection.Id,
            Title = collection.Title,
            Slug = collection.Slug,
            CuratorNote = collection.CuratorNote,
            CoverImageUrl = collection.CoverImageUrl,
            DisplayOrder = collection.DisplayOrder,
            IsPublished = collection.IsPublished,
            CreatedAt = collection.CreatedAt,
            ArtworkCount = collection.Artworks.Count
        };
    }

    public async Task DeleteCollectionAsync(int id)
    {
        var collection = await _db.Collections.FirstOrDefaultAsync(c => c.Id == id);
        if (collection == null)
            throw new AtelierNotFoundException($"Collection with ID {id} was not found.");

        _db.Collections.Remove(collection);
        await _db.SaveChangesAsync();
    }
}
