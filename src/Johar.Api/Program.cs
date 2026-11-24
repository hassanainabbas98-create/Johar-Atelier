using System.Text.Json.Serialization;
using Johar.Data;
using Johar.Data.Seed;
using Johar.Services;
using Johar.Services.Common;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// 1. Database Context (Supports SQLite out of the box for free cloud hosting, or SQL Server)
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
bool isLocalDb = !string.IsNullOrWhiteSpace(connectionString) && connectionString.Contains("(localdb)", StringComparison.OrdinalIgnoreCase);
bool isNonWindows = !System.Runtime.InteropServices.RuntimeInformation.IsOSPlatform(System.Runtime.InteropServices.OSPlatform.Windows);

if (string.IsNullOrWhiteSpace(connectionString) ||
    (isLocalDb && isNonWindows) ||
    connectionString.Contains(".db", StringComparison.OrdinalIgnoreCase) ||
    (connectionString.Contains("Data Source=", StringComparison.OrdinalIgnoreCase) && !connectionString.Contains("Server=", StringComparison.OrdinalIgnoreCase)))
{
    var dbSource = (string.IsNullOrWhiteSpace(connectionString) || (isLocalDb && isNonWindows))
        ? "Data Source=atelier.db"
        : connectionString;
    builder.Services.AddDbContext<ApplicationDbContext>(options =>
        options.UseSqlite(dbSource));
}
else
{
    builder.Services.AddDbContext<ApplicationDbContext>(options =>
        options.UseSqlServer(connectionString));
}

// 2. Cloudinary Options Configuration
builder.Services.Configure<CloudinaryOptions>(builder.Configuration.GetSection(CloudinaryOptions.SectionName));

// 3. Register Application Business Services
builder.Services.AddJoharServices();

// 4. Configurable CORS for React SPA (Supports Array or Delimited String in Environment Variables)
var corsConfigStr = builder.Configuration["Cors:AllowedOrigins"];
var corsList = new List<string> { "http://localhost:5173", "http://localhost:3000" };

if (!string.IsNullOrWhiteSpace(corsConfigStr))
{
    var splits = corsConfigStr.Split(new[] { ',', ';' }, StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
    corsList.AddRange(splits);
}
else
{
    var arrayConfig = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>();
    if (arrayConfig != null && arrayConfig.Length > 0)
    {
        corsList.AddRange(arrayConfig);
    }
}
var allowedOrigins = corsList.Distinct(StringComparer.OrdinalIgnoreCase).ToArray();

builder.Services.AddCors(options =>
{
    options.AddPolicy("SpaCorsPolicy", policy =>
    {
        policy.SetIsOriginAllowed(_ => true)
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// 5. Cookie Authentication Shell
builder.Services.AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme)
    .AddCookie(options =>
    {
        options.Cookie.Name = builder.Configuration["Authentication:CookieName"] ?? ".Atelier.Session";
        options.Cookie.HttpOnly = true;
        options.Cookie.SameSite = SameSiteMode.Lax;
        options.Cookie.SecurePolicy = builder.Environment.IsDevelopment()
            ? CookieSecurePolicy.SameAsRequest
            : CookieSecurePolicy.Always;

        var expireMinutes = builder.Configuration.GetValue<int?>("Authentication:ExpireTimeSpanMinutes") ?? 1440;
        options.ExpireTimeSpan = TimeSpan.FromMinutes(expireMinutes);
        options.SlidingExpiration = true;

        // Return 401 / 403 status codes instead of redirecting to login page (SPA friendly)
        options.Events.OnRedirectToLogin = context =>
        {
            context.Response.StatusCode = StatusCodes.Status401Unauthorized;
            return Task.CompletedTask;
        };
        options.Events.OnRedirectToAccessDenied = context =>
        {
            context.Response.StatusCode = StatusCodes.Status403Forbidden;
            return Task.CompletedTask;
        };
    });

builder.Services.AddAuthorization();

// 6. Controllers & ProblemDetails (RFC 7807)
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
    });
builder.Services.AddProblemDetails();
builder.Services.AddOpenApi();

var app = builder.Build();

// 7. Automatic Database Seeding (Idempotent for Dev and Initialized Production)
using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    var adminSeedEmail = app.Configuration["AdminSeed:Email"];
    var adminSeedPassword = app.Configuration["AdminSeed:Password"];
    await DatabaseSeeder.SeedAsync(dbContext, adminSeedEmail, adminSeedPassword, app.Environment.IsDevelopment());
}

// 8. Global RFC 7807 Exception Handler
app.UseExceptionHandler(exceptionHandlerApp =>
{
    exceptionHandlerApp.Run(async context =>
    {
        context.Response.ContentType = "application/problem+json";

        var exceptionHandlerPathFeature = context.Features.Get<IExceptionHandlerPathFeature>();
        var exception = exceptionHandlerPathFeature?.Error;

        if (exception is AtelierValidationException valEx)
        {
            context.Response.StatusCode = StatusCodes.Status400BadRequest;
            var problemDetails = new HttpValidationProblemDetails(valEx.Errors)
            {
                Type = "https://tools.ietf.org/html/rfc7231#section-6.5.1",
                Title = "One or more validation errors occurred.",
                Status = StatusCodes.Status400BadRequest,
                Detail = valEx.Message,
                Instance = context.Request.Path
            };
            await context.Response.WriteAsJsonAsync(problemDetails);
            return;
        }

        if (exception is AtelierNotFoundException notFoundEx)
        {
            context.Response.StatusCode = StatusCodes.Status404NotFound;
            var problemDetails = new ProblemDetails
            {
                Type = "https://tools.ietf.org/html/rfc7231#section-6.5.4",
                Title = "Resource not found.",
                Status = StatusCodes.Status404NotFound,
                Detail = notFoundEx.Message,
                Instance = context.Request.Path
            };
            await context.Response.WriteAsJsonAsync(problemDetails);
            return;
        }

        context.Response.StatusCode = StatusCodes.Status500InternalServerError;
        var genericProblem = new ProblemDetails
        {
            Type = "https://tools.ietf.org/html/rfc7231#section-6.6.1",
            Title = "An unexpected error occurred.",
            Status = StatusCodes.Status500InternalServerError,
            Detail = app.Environment.IsDevelopment()
                ? exception?.Message
                : "A server error occurred. Please try again later.",
            Instance = context.Request.Path
        };

        await context.Response.WriteAsJsonAsync(genericProblem);
    });
});

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}
else
{
    app.UseHsts();
    app.UseHttpsRedirection();
}

app.UseCors("SpaCorsPolicy");

app.UseStaticFiles(new StaticFileOptions
{
    OnPrepareResponse = ctx =>
    {
        ctx.Context.Response.Headers.AccessControlAllowOrigin = "*";
        ctx.Context.Response.Headers.AccessControlAllowMethods = "GET, OPTIONS";
        ctx.Context.Response.Headers.AccessControlAllowHeaders = "*";

        if (ctx.Context.Request.Path.StartsWithSegments("/uploads"))
        {
            ctx.Context.Response.Headers.CacheControl = "public, max-age=86400";
        }
    }
});

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// Health check endpoint
app.MapGet("/api/health", (IWebHostEnvironment env) => Results.Ok(new
{
    status = "healthy",
    environment = env.EnvironmentName,
    timestamp = DateTime.UtcNow
}));

app.Run();
