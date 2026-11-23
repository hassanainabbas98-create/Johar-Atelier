using Johar.Services.Implementations;
using Johar.Services.Interfaces;
using Microsoft.Extensions.DependencyInjection;

namespace Johar.Services;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddJoharServices(this IServiceCollection services)
    {
        services.AddScoped<ICloudinaryService, CloudinaryService>();
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<ICategoryService, CategoryService>();
        services.AddScoped<ICollectionService, CollectionService>();
        services.AddScoped<IArtworkService, ArtworkService>();
        services.AddScoped<IInquiryService, InquiryService>();
        services.AddScoped<ISiteSettingsService, SiteSettingsService>();
        services.AddScoped<IDashboardService, DashboardService>();

        return services;
    }
}
