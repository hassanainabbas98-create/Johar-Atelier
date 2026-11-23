using Johar.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace Johar.Api.Controllers;

[ApiController]
[Route("api/public/collections")]
public class PublicCollectionsController : ControllerBase
{
    private readonly ICollectionService _collectionService;

    public PublicCollectionsController(ICollectionService collectionService)
    {
        _collectionService = collectionService;
    }

    [HttpGet]
    public async Task<IActionResult> GetCollections()
    {
        var collections = await _collectionService.GetPublishedCollectionsAsync();
        return Ok(collections);
    }
}
