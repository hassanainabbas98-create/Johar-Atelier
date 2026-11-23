using Johar.Services.DTOs;

namespace Johar.Services.Interfaces;

public interface IAuthService
{
    Task<UserDto> ValidateCredentialsAsync(string email, string password);
    Task<UserDto> GetUserByIdAsync(int id);
    Task RecordLoginAsync(int id);
}
