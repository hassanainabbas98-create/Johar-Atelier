using System.Security.Cryptography;

namespace Johar.Data.Seed;

/// <summary>
/// Cryptographic password hasher utilizing PBKDF2 (RFC 2898) with HMAC-SHA256,
/// 100,000 iterations, and constant-time verification.
/// </summary>
public static class PasswordHasher
{
    private const int SaltSize = 16; // 128-bit salt
    private const int HashSize = 32; // 256-bit subkey
    private const int Iterations = 100_000;
    private static readonly HashAlgorithmName Algorithm = HashAlgorithmName.SHA256;

    public static string HashPassword(string password)
    {
        byte[] salt = RandomNumberGenerator.GetBytes(SaltSize);
        byte[] hash = Rfc2898DeriveBytes.Pbkdf2(password, salt, Iterations, Algorithm, HashSize);
        return $"{Convert.ToBase64String(salt)}:{Convert.ToBase64String(hash)}:{Iterations}";
    }

    public static bool VerifyPassword(string password, string storedHash)
    {
        var parts = storedHash.Split(':');
        if (parts.Length != 3) return false;

        byte[] salt = Convert.FromBase64String(parts[0]);
        byte[] expectedHash = Convert.FromBase64String(parts[1]);
        if (!int.TryParse(parts[2], out int iterations)) return false;

        byte[] actualHash = Rfc2898DeriveBytes.Pbkdf2(password, salt, iterations, Algorithm, expectedHash.Length);
        return CryptographicOperations.FixedTimeEquals(actualHash, expectedHash);
    }
}
