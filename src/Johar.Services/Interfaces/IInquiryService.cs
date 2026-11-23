using Johar.Data.Entities;
using Johar.Services.Common;
using Johar.Services.DTOs;

namespace Johar.Services.Interfaces;

public interface IInquiryService
{
    Task<InquiryDto> SubmitInquiryAsync(CreateInquiryRequest request);
    Task<PagedResult<InquiryDto>> GetInquiriesAsync(InquiryQueryParameters query);
    Task<InquiryDto> GetInquiryByIdAsync(int id);
    Task<InquiryDto> UpdateStatusAsync(int id, InquiryStatus status);
    Task<InquiryDto> UpdateNotesAsync(int id, string? notes);
}
