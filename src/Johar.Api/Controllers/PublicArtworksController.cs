using Johar.Services.DTOs;
using Johar.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace Johar.Api.Controllers;

[ApiController]
[Route("api/public/artworks")]
public class PublicArtworksController : ControllerBase
{
    private readonly IArtworkService _artworkService;

    public PublicArtworksController(IArtworkService artworkService)
    {
        _artworkService = artworkService;
    }

    [HttpGet]
    public async Task<IActionResult> GetArtworks([FromQuery] ArtworkQueryParameters query)
    {
        var result = await _artworkService.GetPublicArtworksAsync(query);
        return Ok(result);
    }

    [HttpGet("{slug}")]
    public async Task<IActionResult> GetArtworkBySlug(string slug)
    {
        var artwork = await _artworkService.GetPublicArtworkBySlugAsync(slug);
        return Ok(artwork);
    }
}
