using Johar.Services.DTOs;
using Johar.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Johar.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/admin/settings")]
public class AdminSettingsController : ControllerBase
{
    private readonly ISiteSettingsService _settingsService;

    public AdminSettingsController(ISiteSettingsService settingsService)
    {
        _settingsService = settingsService;
    }

    [HttpGet]
    public async Task<IActionResult> GetSettings()
    {
        var settings = await _settingsService.GetAdminSettingsAsync();
        return Ok(settings);
    }

    [HttpPut]
    public async Task<IActionResult> UpdateSettings([FromBody] UpdateSiteSettingsDto dto)
    {
        var settings = await _settingsService.UpdateSettingsAsync(dto);
        return Ok(settings);
    }

    [HttpPost("portrait")]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> UploadPortrait(IFormFile file, [FromForm] string? profilePictureAlt)
    {
        var result = await _settingsService.UploadPortraitAsync(file, profilePictureAlt);
        return Ok(result);
    }

    [HttpDelete("portrait")]
    public async Task<IActionResult> DeletePortrait()
    {
        var result = await _settingsService.DeletePortraitAsync();
        return Ok(result);
    }
}
