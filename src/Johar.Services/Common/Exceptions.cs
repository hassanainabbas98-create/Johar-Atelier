namespace Johar.Services.Common;

/// <summary>
/// Domain validation exception resulting in RFC 7807 400 Bad Request.
/// </summary>
public class AtelierValidationException : Exception
{
    public IDictionary<string, string[]> Errors { get; }

    public AtelierValidationException(string message) : base(message)
    {
        Errors = new Dictionary<string, string[]>
        {
            { "General", new[] { message } }
        };
    }

    public AtelierValidationException(string field, string message) : base(message)
    {
        Errors = new Dictionary<string, string[]>
        {
            { field, new[] { message } }
        };
    }

    public AtelierValidationException(IDictionary<string, string[]> errors) 
        : base("One or more validation failures occurred.")
    {
        Errors = errors;
    }
}

/// <summary>
/// Domain not-found exception resulting in RFC 7807 404 Not Found.
/// </summary>
public class AtelierNotFoundException : Exception
{
    public AtelierNotFoundException(string message) : base(message)
    {
    }
}
