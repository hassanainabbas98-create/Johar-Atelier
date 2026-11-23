using Johar.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace Johar.Api.Controllers;

[ApiController]
[Route("api/public/categories")]
public class PublicCategoriesController : ControllerBase
{
    private readonly ICategoryService _categoryService;

    public PublicCategoriesController(ICategoryService categoryService)
    {
        _categoryService = categoryService;
    }

    [HttpGet]
    public async Task<IActionResult> GetCategories()
    {
        var categories = await _categoryService.GetActiveCategoriesAsync();
        return Ok(categories);
    }
}
