using Johar.Data;
using Johar.Data.Entities;
using Johar.Services.Common;
using Johar.Services.DTOs;
using Johar.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Johar.Services.Implementations;

public class CategoryService : ICategoryService
{
    private readonly ApplicationDbContext _db;

    public CategoryService(ApplicationDbContext db)
    {
        _db = db;
    }

    public async Task<IReadOnlyList<CategoryDto>> GetActiveCategoriesAsync()
    {
        return await _db.Categories
            .AsNoTracking()
            .Where(c => c.IsActive)
            .OrderBy(c => c.DisplayOrder)
            .ThenBy(c => c.Name)
            .Select(c => new CategoryDto
            {
                Id = c.Id,
                Name = c.Name,
                Slug = c.Slug,
                Description = c.Description,
                DisplayOrder = c.DisplayOrder,
                IsActive = c.IsActive,
                ArtworkCount = c.Artworks.Count(a => a.IsPublished)
            })
            .ToListAsync();
    }

    public async Task<IReadOnlyList<CategoryDto>> GetAllCategoriesAsync()
    {
        return await _db.Categories
            .AsNoTracking()
            .OrderBy(c => c.DisplayOrder)
            .ThenBy(c => c.Name)
            .Select(c => new CategoryDto
            {
                Id = c.Id,
                Name = c.Name,
                Slug = c.Slug,
                Description = c.Description,
                DisplayOrder = c.DisplayOrder,
                IsActive = c.IsActive,
                ArtworkCount = c.Artworks.Count
            })
            .ToListAsync();
    }

    public async Task<CategoryDto> GetCategoryByIdAsync(int id)
    {
        var category = await _db.Categories
            .AsNoTracking()
            .Include(c => c.Artworks)
            .FirstOrDefaultAsync(c => c.Id == id);

        if (category == null)
            throw new AtelierNotFoundException($"Category with ID {id} was not found.");

        return new CategoryDto
        {
            Id = category.Id,
            Name = category.Name,
            Slug = category.Slug,
            Description = category.Description,
            DisplayOrder = category.DisplayOrder,
            IsActive = category.IsActive,
            ArtworkCount = category.Artworks.Count
        };
    }

    public async Task<CategoryDto> CreateCategoryAsync(CategoryUpsertDto dto)
    {
        var slug = string.IsNullOrWhiteSpace(dto.Slug)
            ? SlugHelper.GenerateSlug(dto.Name)
            : SlugHelper.GenerateSlug(dto.Slug);

        if (await _db.Categories.AnyAsync(c => c.Slug == slug))
            throw new AtelierValidationException("Slug", $"A category with slug '{slug}' already exists.");

        var category = new Category
        {
            Name = dto.Name.Trim(),
            Slug = slug,
            Description = dto.Description?.Trim(),
            DisplayOrder = dto.DisplayOrder,
            IsActive = dto.IsActive
        };

        await _db.Categories.AddAsync(category);
        await _db.SaveChangesAsync();

        return new CategoryDto
        {
            Id = category.Id,
            Name = category.Name,
            Slug = category.Slug,
            Description = category.Description,
            DisplayOrder = category.DisplayOrder,
            IsActive = category.IsActive,
            ArtworkCount = 0
        };
    }

    public async Task<CategoryDto> UpdateCategoryAsync(int id, CategoryUpsertDto dto)
    {
        var category = await _db.Categories
            .Include(c => c.Artworks)
            .FirstOrDefaultAsync(c => c.Id == id);

        if (category == null)
            throw new AtelierNotFoundException($"Category with ID {id} was not found.");

        var slug = string.IsNullOrWhiteSpace(dto.Slug)
            ? SlugHelper.GenerateSlug(dto.Name)
            : SlugHelper.GenerateSlug(dto.Slug);

        if (await _db.Categories.AnyAsync(c => c.Slug == slug && c.Id != id))
            throw new AtelierValidationException("Slug", $"Another category with slug '{slug}' already exists.");

        category.Name = dto.Name.Trim();
        category.Slug = slug;
        category.Description = dto.Description?.Trim();
        category.DisplayOrder = dto.DisplayOrder;
        category.IsActive = dto.IsActive;

        await _db.SaveChangesAsync();

        return new CategoryDto
        {
            Id = category.Id,
            Name = category.Name,
            Slug = category.Slug,
            Description = category.Description,
            DisplayOrder = category.DisplayOrder,
            IsActive = category.IsActive,
            ArtworkCount = category.Artworks.Count
        };
    }

    public async Task DeleteCategoryAsync(int id)
    {
        var category = await _db.Categories
            .Include(c => c.Artworks)
            .FirstOrDefaultAsync(c => c.Id == id);

        if (category == null)
            throw new AtelierNotFoundException($"Category with ID {id} was not found.");

        if (category.Artworks.Any())
            throw new AtelierValidationException("Artworks", "Cannot delete category because it has associated artworks. Reassign or remove artworks first.");

        _db.Categories.Remove(category);
        await _db.SaveChangesAsync();
    }
}
