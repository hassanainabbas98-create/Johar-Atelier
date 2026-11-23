using Johar.Services.DTOs;
using Johar.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Johar.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/admin/artworks")]
public class AdminArtworksController : ControllerBase
{
    private readonly IArtworkService _artworkService;

    public AdminArtworksController(IArtworkService artworkService)
    {
        _artworkService = artworkService;
    }

    [HttpGet]
    public async Task<IActionResult> GetArtworks([FromQuery] ArtworkQueryParameters query)
    {
        var result = await _artworkService.GetAdminArtworksAsync(query);
        return Ok(result);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetArtworkById(int id)
    {
        var artwork = await _artworkService.GetAdminArtworkByIdAsync(id);
        return Ok(artwork);
    }

    [HttpPost]
    public async Task<IActionResult> CreateArtwork([FromBody] CreateArtworkDto dto)
    {
        var artwork = await _artworkService.CreateArtworkAsync(dto);
        return StatusCode(StatusCodes.Status201Created, artwork);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> UpdateArtwork(int id, [FromBody] UpdateArtworkDto dto)
    {
        var artwork = await _artworkService.UpdateArtworkAsync(id, dto);
        return Ok(artwork);
    }

    [HttpPatch("{id:int}/publish")]
    public async Task<IActionResult> TogglePublish(int id, [FromBody] bool isPublished)
    {
        var artwork = await _artworkService.TogglePublishStatusAsync(id, isPublished);
        return Ok(artwork);
    }

    [HttpPatch("{id:int}/feature")]
    public async Task<IActionResult> ToggleFeature(int id, [FromBody] bool isFeatured)
    {
        var artwork = await _artworkService.ToggleFeaturedStatusAsync(id, isFeatured);
        return Ok(artwork);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteArtwork(int id)
    {
        await _artworkService.DeleteArtworkAsync(id);
        return NoContent();
    }

    // --- Image Upload, Replacement & Deletion ---

    [HttpPost("{artworkId:int}/images")]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> UploadImage(
        int artworkId,
        IFormFile file,
        [FromForm] string? altText,
        [FromForm] bool isPrimary = false)
    {
        var result = await _artworkService.AddImageAsync(artworkId, file, altText, isPrimary);
        return StatusCode(StatusCodes.Status201Created, result);
    }

    [HttpPut("{artworkId:int}/images/{imageId:int}/replace")]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> ReplaceImage(
        int artworkId,
        int imageId,
        IFormFile file,
        [FromForm] string? altText)
    {
        var result = await _artworkService.ReplaceImageAsync(artworkId, imageId, file, altText);
        return Ok(result);
    }

    [HttpPut("{artworkId:int}/images/{imageId:int}")]
    public async Task<IActionResult> UpdateImageMetadata(int artworkId, int imageId, [FromBody] UpdateArtworkImageDto dto)
    {
        var result = await _artworkService.UpdateImageMetadataAsync(artworkId, imageId, dto);
        return Ok(result);
    }

    [HttpDelete("{artworkId:int}/images/{imageId:int}")]
    public async Task<IActionResult> DeleteImage(int artworkId, int imageId)
    {
        await _artworkService.DeleteImageMetadataAsync(artworkId, imageId);
        return NoContent();
    }
}
