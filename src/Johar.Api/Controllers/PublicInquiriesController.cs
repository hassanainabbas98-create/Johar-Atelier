using Johar.Services.DTOs;
using Johar.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace Johar.Api.Controllers;

[ApiController]
[Route("api/public/inquiries")]
public class PublicInquiriesController : ControllerBase
{
    private readonly IInquiryService _inquiryService;

    public PublicInquiriesController(IInquiryService inquiryService)
    {
        _inquiryService = inquiryService;
    }

    [HttpPost]
    public async Task<IActionResult> SubmitInquiry([FromBody] CreateInquiryRequest request)
    {
        var result = await _inquiryService.SubmitInquiryAsync(request);
        return StatusCode(StatusCodes.Status201Created, result);
    }
}
