using Johar.Services.DTOs;
using Johar.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Johar.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/admin/inquiries")]
public class AdminInquiriesController : ControllerBase
{
    private readonly IInquiryService _inquiryService;

    public AdminInquiriesController(IInquiryService inquiryService)
    {
        _inquiryService = inquiryService;
    }

    [HttpGet]
    public async Task<IActionResult> GetInquiries([FromQuery] InquiryQueryParameters query)
    {
        var result = await _inquiryService.GetInquiriesAsync(query);
        return Ok(result);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var inquiry = await _inquiryService.GetInquiryByIdAsync(id);
        return Ok(inquiry);
    }

    [HttpPatch("{id:int}/status")]
    public async Task<IActionResult> UpdateStatus(int id, [FromBody] UpdateInquiryStatusDto dto)
    {
        var result = await _inquiryService.UpdateStatusAsync(id, dto.Status);
        return Ok(result);
    }

    [HttpPatch("{id:int}/notes")]
    public async Task<IActionResult> UpdateNotes(int id, [FromBody] UpdateInquiryNotesDto dto)
    {
        var result = await _inquiryService.UpdateNotesAsync(id, dto.ArtistNotes);
        return Ok(result);
    }
}
