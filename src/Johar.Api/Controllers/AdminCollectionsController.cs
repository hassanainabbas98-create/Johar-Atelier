using Johar.Services.DTOs;
using Johar.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Johar.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/admin/collections")]
public class AdminCollectionsController : ControllerBase
{
    private readonly ICollectionService _collectionService;

    public AdminCollectionsController(ICollectionService collectionService)
    {
        _collectionService = collectionService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var collections = await _collectionService.GetAllCollectionsAsync();
        return Ok(collections);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var collection = await _collectionService.GetCollectionByIdAsync(id);
        return Ok(collection);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CollectionUpsertDto dto)
    {
        var collection = await _collectionService.CreateCollectionAsync(dto);
        return StatusCode(StatusCodes.Status201Created, collection);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] CollectionUpsertDto dto)
    {
        var collection = await _collectionService.UpdateCollectionAsync(id, dto);
        return Ok(collection);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        await _collectionService.DeleteCollectionAsync(id);
        return NoContent();
    }
}
