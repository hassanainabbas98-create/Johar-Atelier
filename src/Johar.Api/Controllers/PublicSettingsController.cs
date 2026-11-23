using Johar.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace Johar.Api.Controllers;

[ApiController]
[Route("api/public/settings")]
public class PublicSettingsController : ControllerBase
{
    private readonly ISiteSettingsService _settingsService;

    public PublicSettingsController(ISiteSettingsService settingsService)
    {
        _settingsService = settingsService;
    }

    [HttpGet]
    public async Task<IActionResult> GetSettings()
    {
        var settings = await _settingsService.GetPublicProfileAsync();
        return Ok(settings);
    }
}
