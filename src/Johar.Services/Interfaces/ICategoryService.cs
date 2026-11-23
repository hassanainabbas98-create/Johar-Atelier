using Johar.Services.DTOs;

namespace Johar.Services.Interfaces;

public interface ICategoryService
{
    Task<IReadOnlyList<CategoryDto>> GetActiveCategoriesAsync();
    Task<IReadOnlyList<CategoryDto>> GetAllCategoriesAsync();
    Task<CategoryDto> GetCategoryByIdAsync(int id);
    Task<CategoryDto> CreateCategoryAsync(CategoryUpsertDto dto);
    Task<CategoryDto> UpdateCategoryAsync(int id, CategoryUpsertDto dto);
    Task DeleteCategoryAsync(int id);
}
