using Johar.Data.Entities;
using Microsoft.EntityFrameworkCore;

namespace Johar.Data;

/// <summary>
/// Entity Framework Core database context for the L'Archive Vivante platform.
/// Manages entity sets, relational constraints, performance indexes, and seed configurations.
/// </summary>
public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Collection> Collections => Set<Collection>();
    public DbSet<Artwork> Artworks => Set<Artwork>();
    public DbSet<ArtworkImage> ArtworkImages => Set<ArtworkImage>();
    public DbSet<Inquiry> Inquiries => Set<Inquiry>();
    public DbSet<SiteSettings> SiteSettings => Set<SiteSettings>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Discovers and applies all IEntityTypeConfiguration classes in Johar.Data
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(ApplicationDbContext).Assembly);
    }
}
