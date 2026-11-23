# Master Implementation Specification (Pre-Coding Blueprint)

**Project:** Fine Art Portfolio & Online Gallery  
**Architectural Pattern:** Layered ASP.NET Core Monolith (`Api` $\rightarrow$ `Services` $\rightarrow$ `Data`) + React / Vite / TypeScript SPA  
**Status:** Approved Master Blueprint for Phase 4 Code Scaffolding  

---

# Blueprint A: Solution & Directory Structure

The project follows a pragmatic, highly maintainable **3-tier layered architecture** without unnecessary indirection (no MediatR, no CQRS, no event buses, no microservices). Every request follows an observable, debuggable path: `Controller` $\rightarrow$ `Service` $\rightarrow$ `DbContext`.

```
Johar_Project/
├── docs/                                  # Master specifications & visual mockups
│   ├── PROJECT_OVERVIEW.md
│   ├── REQUIREMENTS.md
│   ├── SITEMAP.md
│   ├── USER_JOURNEYS.md
│   ├── FEATURE_BACKLOG.md
│   ├── TECHNICAL_ARCHITECTURE.md
│   ├── DATABASE_DESIGN.md
│   ├── DEVELOPMENT_ROADMAP.md
│   ├── OPEN_QUESTIONS.md
│   ├── UI_UX_DESIGN_SPEC.md
│   ├── VISUAL_MOCKUPS.md
│   └── IMPLEMENTATION_SPEC.md             # (This document)
│
├── src/                                   # Backend .NET Solution
│   ├── Johar.sln
│   │
│   ├── Johar.Api/                         # Presentation Layer (HTTP / Hosting)
│   │   ├── Controllers/
│   │   │   ├── ArtworksController.cs      # Public catalog endpoints
│   │   │   ├── CategoriesController.cs    # Public category queries
│   │   │   ├── CollectionsController.cs   # Public collection queries
│   │   │   ├── InquiriesController.cs     # Public inquiry submissions
│   │   │   ├── ProfileController.cs       # Public site settings & bio
│   │   │   └── Admin/                     # Protected Admin Endpoints
│   │   │       ├── AdminAuthController.cs
│   │   │       ├── AdminArtworksController.cs
│   │   │       ├── AdminCategoriesController.cs
│   │   │       ├── AdminCollectionsController.cs
│   │   │       ├── AdminInquiriesController.cs
│   │   │       └── AdminProfileController.cs
│   │   ├── Middleware/
│   │   │   └── GlobalExceptionHandler.cs  # RFC 7807 ProblemDetails
│   │   ├── Program.cs                     # DI, pipeline, Cookie Auth, CORS
│   │   ├── appsettings.json
│   │   └── appsettings.Development.json
│   │
│   ├── Johar.Services/                    # Business Logic Layer
│   │   ├── Interfaces/
│   │   │   ├── IArtworkService.cs
│   │   │   ├── ICategoryService.cs
│   │   │   ├── ICollectionService.cs
│   │   │   ├── IInquiryService.cs
│   │   │   ├── IProfileService.cs
│   │   │   ├── ICloudinaryService.cs
│   │   │   └── IAuthService.cs
│   │   ├── Implementations/
│   │   │   ├── ArtworkService.cs
│   │   │   ├── CategoryService.cs
│   │   │   ├── CollectionService.cs
│   │   │   ├── InquiryService.cs
│   │   │   ├── ProfileService.cs
│   │   │   ├── CloudinaryService.cs       # CloudinaryDotNet wrapper
│   │   │   └── AuthService.cs
│   │   ├── DTOs/                          # Request / Response Contracts
│   │   │   ├── Artworks/
│   │   │   ├── Inquiries/
│   │   │   ├── Profile/
│   │   │   └── Auth/
│   │   └── Validators/                    # FluentValidation Rules
│   │       ├── CreateArtworkValidator.cs
│   │       ├── UpdateArtworkValidator.cs
│   │       └── CreateInquiryValidator.cs
│   │
│   └── Johar.Data/                        # Data Access Layer
│       ├── AppDbContext.cs
│       ├── Configurations/                # EF Core Fluent API Configurations
│       │   ├── ArtworkConfiguration.cs
│       │   ├── ArtworkImageConfiguration.cs
│       │   ├── CategoryConfiguration.cs
│       │   ├── CollectionConfiguration.cs
│       │   ├── InquiryConfiguration.cs
│       │   ├── SiteSettingsConfiguration.cs
│       │   └── UserConfiguration.cs
│       ├── Entities/                      # Core Domain Entity Models
│       │   ├── Artwork.cs
│       │   ├── ArtworkImage.cs
│       │   ├── Category.cs
│       │   ├── Collection.cs
│       │   ├── Inquiry.cs
│       │   ├── SiteSettings.cs
│       │   └── User.cs
│       └── Migrations/                    # EF Core Code-First Migrations
│
└── client/                                # Frontend React 19 + Vite + TypeScript
    ├── index.html
    ├── vite.config.ts
    ├── tsconfig.json
    ├── package.json
    └── src/
        ├── main.tsx                       # App entry point & providers
        ├── App.tsx                        # Router root & layouts
        ├── api/                           # Centralized Axios / Fetch clients
        │   ├── apiClient.ts               # credentials: 'include' client
        │   ├── artworksApi.ts
        │   ├── inquiriesApi.ts
        │   ├── profileApi.ts
        │   └── authApi.ts
        ├── components/                    # Reusable UI Components
        │   ├── common/                    # Button, Input, Modal, Drawer
        │   ├── layout/                    # NavigationHeader, CuratorialFooter
        │   ├── gallery/                   # ArtworkCard, FilterBar, Lightbox
        │   └── admin/                     # AdminNav, StatCard, ImageDropzone
        ├── pages/                         # Route Page Views
        │   ├── public/                    # Home, Gallery, Detail, About, etc.
        │   └── admin/                     # Login, Dashboard, ArtworkForm, etc.
        ├── styles/
        │   ├── tokens.css                 # Master Design Tokens (CSS Variables)
        │   ├── reset.css
        │   └── typography.css
        └── types/                         # TypeScript Domain Interfaces
```

---

# Blueprint B: Finalized EF Core Entities & SQL Server Schema

Every entity is normalized, strongly typed, and protected by appropriate database constraints. In accordance with our approved inquiry model, **commercial pricing fields (`Price`, `IsPriceVisible`) are strictly excluded from the MVP schema**.

### 1. `User.cs` (Artist Administrator)
```csharp
namespace Johar.Data.Entities;

public class User
{
    public int Id { get; set; }
    public string Email { get; set; } = string.Empty;       // nvarchar(256), Unique Index
    public string PasswordHash { get; set; } = string.Empty; // nvarchar(max), PBKDF2 / Argon2
    public string FullName { get; set; } = string.Empty;    // nvarchar(150)
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? LastLoginAt { get; set; }
}
```

### 2. `Category.cs` (Medium Taxonomy)
```csharp
namespace Johar.Data.Entities;

public class Category
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;        // nvarchar(100), e.g., "Watercolors"
    public string Slug { get; set; } = string.Empty;        // nvarchar(120), Unique Index
    public string? Description { get; set; }               // nvarchar(500)
    public int DisplayOrder { get; set; } = 0;
    public bool IsActive { get; set; } = true;

    public ICollection<Artwork> Artworks { get; set; } = new List<Artwork>();
}
```

### 3. `Collection.cs` (Thematic Curated Series)
```csharp
namespace Johar.Data.Entities;

public class Collection
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;       // nvarchar(150)
    public string Slug { get; set; } = string.Empty;        // nvarchar(170), Unique Index
    public string? CuratorNote { get; set; }                // nvarchar(max)
    public string? CoverImageUrl { get; set; }             // nvarchar(500)
    public int DisplayOrder { get; set; } = 0;
    public bool IsPublished { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<Artwork> Artworks { get; set; } = new List<Artwork>();
}
```

### 4. `Artwork.cs` (Core Portfolio Entity — Pure Inquiry Model)
```csharp
namespace Johar.Data.Entities;

public enum AvailabilityStatus
{
    Available = 0,
    Reserved = 1,
    Sold = 2,
    PrivateCollection = 3 // Not for Sale (NFS)
}

public class Artwork
{
    public int Id { get; set; }
    public int CategoryId { get; set; }                     // FK to Category
    public int? CollectionId { get; set; }                  // FK to Collection (Nullable)
    public string Title { get; set; } = string.Empty;       // nvarchar(200)
    public string Slug { get; set; } = string.Empty;        // nvarchar(220), Unique Index
    public string Medium { get; set; } = string.Empty;      // nvarchar(200)
    public decimal DimensionsHeight { get; set; }           // decimal(6,2)
    public decimal DimensionsWidth { get; set; }            // decimal(6,2)
    public decimal? DimensionsDepth { get; set; }           // decimal(6,2), Nullable
    public string DimensionUnit { get; set; } = "cm";       // nvarchar(10), 'cm' or 'in'
    public int YearCreated { get; set; }                    // e.g., 2026
    public AvailabilityStatus AvailabilityStatus { get; set; } = AvailabilityStatus.Available;
    public bool IsFramed { get; set; } = false;
    public bool IsFeatured { get; set; } = false;           // Homepage spotlight
    public bool IsPublished { get; set; } = false;          // Draft vs. Live
    public string? Story { get; set; }                      // nvarchar(max), Curatorial narrative
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation Properties
    public Category Category { get; set; } = null!;
    public Collection? Collection { get; set; }
    public ICollection<ArtworkImage> Images { get; set; } = new List<ArtworkImage>();
    public ICollection<Inquiry> Inquiries { get; set; } = new List<Inquiry>();
}
```

### 5. `ArtworkImage.cs` (Asset Registry)
```csharp
namespace Johar.Data.Entities;

public class ArtworkImage
{
    public int Id { get; set; }
    public int ArtworkId { get; set; }                      // FK to Artwork, Cascade Delete
    public string CloudinaryPublicId { get; set; } = string.Empty; // nvarchar(200)
    public string SecureUrl { get; set; } = string.Empty;   // nvarchar(500)
    public int Width { get; set; }
    public int Height { get; set; }
    public bool IsPrimary { get; set; } = false;
    public int DisplayOrder { get; set; } = 0;
    
    // Nullable in database to allow saving in-progress drafts; 
    // strictly enforced by backend service before setting Artwork.IsPublished = true.
    public string? AltText { get; set; }                    // nvarchar(255)

    public Artwork Artwork { get; set; } = null!;
}
```

### 6. `Inquiry.cs` (Lead & Commission Tracking)
```csharp
namespace Johar.Data.Entities;

public enum InquiryType
{
    ArtworkInquiry = 0,
    CommissionRequest = 1,
    GeneralContact = 2
}

public enum InquiryStatus
{
    New = 0,
    InReview = 1,
    Contacted = 2,
    Completed = 3,
    Archived = 4
}

public class Inquiry
{
    public int Id { get; set; }
    public InquiryType InquiryType { get; set; }
    public int? ArtworkId { get; set; }                     // FK to Artwork (Nullable)
    public string ClientName { get; set; } = string.Empty;  // nvarchar(150)
    public string Email { get; set; } = string.Empty;       // nvarchar(256)
    public string? Phone { get; set; }                      // nvarchar(50)
    public string? ClientLocation { get; set; }             // nvarchar(150), City/Country for logistics
    public string? MediumPreference { get; set; }           // nvarchar(100) for commission briefs
    public string? EstimatedBudget { get; set; }            // nvarchar(100)
    public string? DesiredTimeline { get; set; }            // nvarchar(100)
    public string Message { get; set; } = string.Empty;     // nvarchar(max)
    public InquiryStatus Status { get; set; } = InquiryStatus.New;
    public string? ArtistNotes { get; set; }                // nvarchar(max), Internal private notes
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Artwork? Artwork { get; set; }
}
```

### 7. `SiteSettings.cs` (Artist Identity & Global Configuration)
```csharp
namespace Johar.Data.Entities;

public class SiteSettings
{
    public int Id { get; set; } = 1;                        // Singleton record
    public string ArtistName { get; set; } = string.Empty;  // nvarchar(150)
    public string? ProfilePictureUrl { get; set; }          // nvarchar(500)
    public string? ProfilePicturePublicId { get; set; }     // nvarchar(200)
    public string? ProfilePictureAlt { get; set; }          // nvarchar(200)
    public string? HomeIntroText { get; set; }              // nvarchar(1000)
    public string? ArtistStatement { get; set; }            // nvarchar(max), Independent creative philosophy
    public string? AboutBiography { get; set; }             // nvarchar(max), Chronological career & training
    public string ContactEmail { get; set; } = string.Empty;// nvarchar(255)
    public string? StudioLocation { get; set; }             // nvarchar(200), City/Country
    public string? InstagramHandle { get; set; }            // nvarchar(100)
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
```

---

# Blueprint C: Backend API Endpoints Contract

All endpoints return standardized JSON. Error responses strictly adhere to **RFC 7807 ProblemDetails**.

### 1. Public Endpoints (Unauthenticated)

| HTTP Method | Route | Parameters / Body | Description & Response DTO |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/artworks` | Query: `category`, `collection`, `availableOnly`, `page`, `pageSize` | Returns paginated live artworks (`PagedResult<ArtworkSummaryDto>`). Enforces `IsPublished == true`. |
| `GET` | `/api/artworks/{slug}` | Route: `slug` | Returns detailed single artwork (`ArtworkDetailDto`) including full uncropped image metadata. |
| `GET` | `/api/categories` | None | Returns active categories with artwork count (`List<CategoryDto>`). |
| `GET` | `/api/collections` | None | Returns published thematic collections (`List<CollectionDto>`). |
| `GET` | `/api/profile` | None | Returns public artist profile & site settings (`PublicProfileDto`: portrait, bio, statement, contact). |
| `POST` | `/api/inquiries` | Body: `CreateInquiryDto` | Submits acquisition or commission inquiry. Protected by IP rate-limiting & honeypot. Returns `201 Created`. |

### 2. Admin Authentication Endpoints

| HTTP Method | Route | Body | Description & Response |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/admin/auth/login` | Body: `LoginDto` (`Email`, `Password`) | Validates credentials via `IPasswordHasher`. Sets secure `HttpOnly` cookie. Returns `UserDto`. |
| `POST` | `/api/admin/auth/logout` | None | Clears `.Atelier.Session` authentication cookie. Returns `204 No Content`. |
| `GET` | `/api/admin/auth/me` | None (reads cookie) | Verifies active session. Returns authenticated `UserDto` or `401 Unauthorized`. |

### 3. Admin Catalog Management Endpoints (`[Authorize]`)

| HTTP Method | Route | Body / Query | Description & Response |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/admin/artworks` | Query: `status`, `category`, `search` | Returns full inventory including drafts (`List<AdminArtworkDto>`). |
| `POST` | `/api/admin/artworks` | Body: `CreateArtworkDto` | Creates artwork record. Validates that if `IsPublished == true`, all images must have `AltText`. Returns `201 Created`. |
| `GET` | `/api/admin/artworks/{id}` | Route: `id` | Returns complete artwork for editing (`AdminArtworkDetailDto`). |
| `PUT` | `/api/admin/artworks/{id}` | Body: `UpdateArtworkDto` | Updates metadata. Validates `AltText` before allowing transition to `Published`. Returns `200 OK`. |
| `DELETE` | `/api/admin/artworks/{id}` | Route: `id` | Deletes artwork record and deletes associated assets from Cloudinary. Returns `204 No Content`. |
| `POST` | `/api/admin/artworks/{id}/images`| Form-Data: `IFormFile file`, `string? altText` | Uploads image to Cloudinary (validating MIME & size), creates `ArtworkImage` record. Returns `ArtworkImageDto`. |
| `DELETE` | `/api/admin/artworks/{id}/images/{imageId}` | Route: `id`, `imageId` | Deletes asset from Cloudinary and removes database record. Returns `204 No Content`. |
| `PUT` | `/api/admin/artworks/{id}/images/reorder` | Body: `List<int> imageIdsInOrder` | Updates `DisplayOrder` and primary status. Returns `200 OK`. |

### 4. Admin Categories & Collections Endpoints (`[Authorize]`)

| HTTP Method | Route | Body | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/admin/categories` | Body: `CategoryUpsertDto` | Creates a new art medium category. |
| `PUT` | `/api/admin/categories/{id}` | Body: `CategoryUpsertDto` | Updates category name, slug, or display order. |
| `DELETE` | `/api/admin/categories/{id}` | Route: `id` | Restricts deletion if artworks belong to category. |
| `POST` | `/api/admin/collections` | Body: `CollectionUpsertDto` | Creates a thematic series. |
| `PUT` | `/api/admin/collections/{id}` | Body: `CollectionUpsertDto` | Updates series narrative and cover image. |
| `DELETE` | `/api/admin/collections/{id}` | Route: `id` | Sets `CollectionId = null` on linked artworks upon deletion. |

### 5. Admin Inquiries Endpoints (`[Authorize]`)

| HTTP Method | Route | Body / Query | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/admin/inquiries` | Query: `status`, `type` | Retrieves inquiry inbox sorted by `CreatedAt DESC`. |
| `GET` | `/api/admin/inquiries/{id}` | Route: `id` | Returns inquiry detail with client location and linked artwork thumbnail. |
| `PUT` | `/api/admin/inquiries/{id}/status` | Body: `UpdateStatusDto` (`New`, `InReview`, `Contacted`, `Completed`, `Archived`) | Updates inquiry state. |
| `PUT` | `/api/admin/inquiries/{id}/notes` | Body: `UpdateNotesDto` | Updates private internal artist notes. |

### 6. Admin Profile & Content Endpoints (`[Authorize]`)

| HTTP Method | Route | Body / Form-Data | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/admin/profile` | None | Returns full `SiteSettings` record for editing. |
| `PUT` | `/api/admin/profile` | Body: `UpdateProfileDto` | Updates short intro, independent artist statement, bio, and contact info. |
| `POST` | `/api/admin/profile/photo` | Form-Data: `IFormFile file`, `string? altText` | Uploads portrait to Cloudinary with `g_face, c_fill` crop support; cleans up old asset. |

---

# Blueprint D: Cookie-Based Authentication & Security Specification

The platform utilizes **ASP.NET Core Cookie Authentication**, providing superior security over localStorage JWTs by eliminating cross-site scripting (XSS) token theft.

### 1. Startup Authentication Configuration (`Program.cs`)
```csharp
builder.Services.AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme)
    .AddCookie(options =>
    {
        options.Cookie.Name = ".Atelier.Session";
        options.Cookie.HttpOnly = true;
        options.Cookie.SecurePolicy = CookieSecurePolicy.Always; // HTTPS required
        options.Cookie.SameSite = SameSiteMode.Lax;             // Protects against CSRF
        options.ExpireTimeSpan = TimeSpan.FromHours(24);
        options.SlidingExpiration = true;

        // CRITICAL FOR SPAs: Return 401/403 JSON instead of redirecting to a nonexistent HTML login page
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
```

### 2. CORS Policy for Cookie Transport
```csharp
builder.Services.AddCors(options =>
{
    options.AddPolicy("SpaCorsPolicy", policy =>
    {
        policy.WithOrigins(builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? ["http://localhost:5173"])
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials(); // REQUIRED for HttpOnly cookies to pass between Vite and API
    });
});
```

### 3. Password Verification
Passwords are verified using ASP.NET Core’s built-in cryptographic hasher:
```csharp
var hasher = new PasswordHasher<User>();
var result = hasher.VerifyHashedPassword(user, user.PasswordHash, loginDto.Password);
if (result == PasswordVerificationResult.Failed)
{
    return Unauthorized(new ProblemDetails { Title = "Invalid credentials" });
}
```

---

# Blueprint E: Cloudinary Upload & Image Integrity Pipeline

All media operations pass through the authenticated backend, ensuring Cloudinary API secrets remain strictly server-side.

```
[Admin Browser]
      │ 1. POST /api/admin/artworks/{id}/images (multipart/form-data)
      ▼
[Johar.Api: File Validation]
      │ 2. Check ContentType: image/jpeg, image/png, image/webp
      │ 3. Check File Size: <= 15 MB
      ▼
[Johar.Services: CloudinaryService]
      │ 4. Stream to Cloudinary via CloudinaryDotNet SDK
      │    UploadParams: Folder = "atelier/artworks"
      ▼
[Cloudinary Cloud Storage]
      │ 5. Store master asset; return PublicId, SecureUrl, Width, Height
      ▼
[Johar.Data: SQL Server]
      │ 6. Insert ArtworkImage record linked to ArtworkId
```

### 1. The Artwork Integrity Transformation Policy
The backend builds transformation URLs strictly enforcing aspect-ratio preservation for fine art:

```csharp
public static class CloudinaryUrlBuilder
{
    // STRICT ARTWORK INTEGRITY: Zero cropping, full original composition
    public static string BuildArtworkDetailUrl(string secureUrl) =>
        InsertTransformation(secureUrl, "c_limit,w_1800,q_auto,f_auto");

    public static string BuildArtworkThumbnailUrl(string secureUrl) =>
        InsertTransformation(secureUrl, "c_limit,w_600,q_auto,f_auto");

    public static string BuildArtworkLqipUrl(string secureUrl) =>
        InsertTransformation(secureUrl, "c_limit,w_50,e_blur:1000,q_auto:low,f_auto");

    // RESTRICTED TO ARTIST PORTRAIT ONLY: Face-detection centering permitted
    public static string BuildArtistPortraitUrl(string secureUrl) =>
        InsertTransformation(secureUrl, "c_fill,g_face,w_800,h_800,q_auto,f_auto");
}
```

### 2. Asset Cleanup Rule
When an artwork image is deleted or the artist portrait is replaced, the service initiates an immediate background deletion:
```csharp
await _cloudinary.DestroyAsync(new DeletionParams(publicId));
```

---

# Blueprint F: Validation & Error Handling Rules

Validation is executed via **FluentValidation** before reaching business services.

### 1. The Draft vs. Published AltText Gate
```csharp
public class UpdateArtworkValidator : AbstractValidator<UpdateArtworkDto>
{
    public UpdateArtworkValidator()
    {
        RuleFor(x => x.Title).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Medium).NotEmpty().MaximumLength(200);
        RuleFor(x => x.DimensionsHeight).GreaterThan(0);
        RuleFor(x => x.DimensionsWidth).GreaterThan(0);

        // ENFORCED ACCESSIBILITY GATE:
        // AltText is required for every image before an artwork can be published.
        RuleFor(x => x.Images)
            .Must(images => images.All(img => !string.IsNullOrWhiteSpace(img.AltText)))
            .When(x => x.IsPublished)
            .WithMessage("Every artwork image must have descriptive Alternative Text (AltText) before the artwork can be published.");
    }
}
```

### 2. Public Inquiry Protection
```csharp
public class CreateInquiryValidator : AbstractValidator<CreateInquiryDto>
{
    public CreateInquiryValidator()
    {
        RuleFor(x => x.ClientName).NotEmpty().MaximumLength(150);
        RuleFor(x => x.Email).NotEmpty().EmailAddress().MaximumLength(256);
        RuleFor(x => x.Message).NotEmpty().MaximumLength(4000);
        RuleFor(x => x.ClientLocation).MaximumLength(150);

        // HONEYPOT TRAP: Must be empty; bots automatically fill hidden fields
        RuleFor(x => x.HoneypotTrap)
            .Empty()
            .WithMessage("Spam submission detected.");
    }
}
```

---

# Blueprint G: Frontend Architecture & Routing Map

The frontend is a **React 19 SPA** powered by **Vite** and **TypeScript**, styled via **CSS Modules + Global Design Tokens**.

### 1. Master Route Map (`App.tsx`)
```
Public Route Hierarchy:
/                      --> <HomePage />
/gallery               --> <GalleryPage /> (supports ?category= & ?collection=)
/gallery/:slug         --> <ArtworkDetailPage />
/about                 --> <AboutPage />
/commissions           --> <CommissionsPage />
/contact               --> <ContactPage />

Protected Admin Route Hierarchy (<ProtectedRoute />):
/admin/login           --> <AdminLoginPage /> (Public auth screen)
/admin/dashboard       --> <AdminDashboardPage />
/admin/artworks        --> <AdminArtworksPage />
/admin/artworks/new    --> <AdminArtworkFormPage mode="create" />
/admin/artworks/:id    --> <AdminArtworkFormPage mode="edit" />
/admin/collections     --> <AdminCollectionsPage />
/admin/categories      --> <AdminCategoriesPage />
/admin/inquiries       --> <AdminInquiriesPage />
/admin/profile         --> <AdminProfilePage />
```

### 2. Design Tokens Integration (`src/styles/tokens.css`)
```css
:root {
  /* Surfaces & Canvas */
  --color-canvas: #FBFBF9;
  --color-surface: #F4F1EA;
  --color-surface-elevated: #FFFFFF;

  /* Typography */
  --color-text-primary: #181716;    /* 16.8:1 contrast (AAA) */
  --color-text-secondary: #45423D;  /* 8.5:1 contrast (AAA) */
  --color-text-caption: #55524C;    /* 6.8:1 contrast (AA) */

  /* Borders & Controls */
  --color-border-decorative: #EAE5DC; /* Hairlines */
  --color-border-control: #948E84;    /* 3.15:1 contrast (WCAG 2.2 AA non-text pass) */
  --color-border-focus: #8C6541;      /* 4.6:1 contrast (AA) */

  /* Status Indicators */
  --color-status-available: #2E5A36;
  --color-status-reserved: #8A571E;
  --color-status-archive: #55524C;

  /* Typography Families */
  --font-display: 'Cormorant Garamond', Georgia, serif;
  --font-body: 'Plus Jakarta Sans', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
}
```

---

# Blueprint H: Environment Variables & Secrets Checklist

### 1. Backend: `appsettings.Development.json` (Server-Side Secrets)
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=AtelierGalleryDb;Trusted_Connection=True;TrustServerCertificate=True;MultipleActiveResultSets=true"
  },
  "Cloudinary": {
    "CloudName": "YOUR_CLOUDINARY_CLOUD_NAME",
    "ApiKey": "YOUR_CLOUDINARY_API_KEY",
    "ApiSecret": "YOUR_CLOUDINARY_API_SECRET"
  },
  "Cors": {
    "AllowedOrigins": [
      "http://localhost:5173"
    ]
  },
  "AdminSeed": {
    "Email": "admin@artistatelier.com",
    "InitialPassword": "TemporarySecurePassword123!"
  }
}
```

### 2. Frontend: `client/.env.development` (Public Client Configuration)
```ini
# Base URL pointing to the ASP.NET Core API
VITE_API_BASE_URL=http://localhost:5000/api

# Zero Cloudinary API secrets are exposed here.
# All uploads pass securely through http://localhost:5000/api/admin/artworks/{id}/images.
```
