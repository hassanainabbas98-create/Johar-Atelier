# L'Archive Vivante (The Living Archive)
*The Archival Sanctuary — Fine Art Portfolio & Atelier Content Management System*

[![.NET 9](https://img.shields.io/badge/.NET-9.0-512BD4?logo=dotnet)](https://dotnet.microsoft.com/)
[![React 19](https://img.shields.io/badge/React-19.0-61DAFB?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.0-646CFF?logo=vite)](https://vitejs.dev/)
[![EF Core](https://img.shields.io/badge/EF%20Core-9.0-512BD4)](https://learn.microsoft.com/ef/core/)
[![WCAG 2.2 AA](https://img.shields.io/badge/Accessibility-WCAG%202.2%20AA-success)](https://www.w3.org/WAI/standards-guidelines/wcag/)

---

## 1. Project Overview & Vision

**L'Archive Vivante** is an editorial fine art portfolio, digital catalog raisonné, and private atelier management system designed specifically for a multidisciplinary visual artist working across oil paintings, luminous watercolors, classical and modern calligraphy, tonal pencil sketches, intimate portraits, and visual artwork.

The application rejects generic e-commerce templates, price tags, and aggressive commercial carts. In their place, it establishes an **"Archival Sanctuary"** where collectors, gallery directors, and curators can experience artworks in their pristine uncropped compositions, read deep curatorial narratives, and engage in high-touch acquisition and bespoke commission dialogues.

### Core Architectural Pillars
1. **Artwork Image Integrity:** Artwork compositions are sacred. The system strictly enforces `object-fit: contain` and uncropped URL transformations (`c_limit`). Artificial automated face-detection cropping (`c_fill`, `c_crop`, `g_face`) is strictly prohibited on artworks and isolated solely to the artist's professional portrait.
2. **Pure Inquiry Model:** Zero prices, zero currency symbols, and zero commercial cart interfaces. High-value original fine art is handled through contextual acquisition inquiries and bespoke commission proposals.
3. **The Archival Sanctuary Design System:** Museum Alabaster (`#FBFBF9`), Raw Linen (`#F4F1EA`), Hairline Matboard dividers (`#EAE5DC`), and Resting Control Borders (`#948E84` satisfying WCAG 2.2 AA 3:1 contrast), accented by Tuscan Bronze (`#8C6541`) and Obsidian Charcoal (`#181716`). Built strictly with **CSS Modules** (`.module.css`).
4. **Mandatory AltText Publication Gate:** Artworks cannot be published to the public catalog without descriptive accessibility AltText for every photograph.
5. **Double-Layer Anti-Bot Protection:** Public inquiry forms include an invisible honeypot trap field. Human collectors proceed naturally; automated spam scrapers are detected and blocked.
6. **First-Party Cookie Security:** Stateful, encrypted `HttpOnly` session cookie (`.Atelier.Session`) with zero external identity provider lock-in.

---

## 2. Technology Stack

### Backend Architecture (`src/`)
- **Runtime:** .NET 9.0 ASP.NET Core Web API (`Johar.Api`)
- **Data Access:** Entity Framework Core 9.0 with SQL Server (`Johar.Data`)
- **Business Logic & DTOs:** Strongly-typed service layer (`Johar.Services`)
- **Media Asset Pipeline:** CloudinaryDotNet SDK with zero-config local development filesystem fallback (`wwwroot/uploads/`)
- **Error Handling:** RFC 7807 `ProblemDetails` and RFC 7231 `HttpValidationProblemDetails`

### Frontend Architecture (`client/`)
- **UI Framework:** React 19 with TypeScript
- **Build Tooling:** Vite 6 with proxying for `/api` and `/uploads`
- **Routing:** React Router v7 (`BrowserRouter`, `Routes`, `Route`, `Navigate`)
- **Styling:** CSS Modules (`.module.css`) + CSS Custom Properties Design Tokens (`tokens.css`, `global.css`)
- **Icons:** Lucide React

---

## 3. Project Directory Structure

```text
Johar_Project/
├── .gitignore                                 # Production git ignore rules
├── README.md                                  # This document
│
├── client/                                    # Frontend React 19 SPA
│   ├── .env.example                           # Client environment variable template
│   ├── index.html                             # Single-page HTML shell
│   ├── package.json                           # React dependencies & scripts
│   ├── tsconfig.json                          # TypeScript configuration
│   ├── vite.config.ts                         # Vite dev server & proxy settings
│   └── src/
│       ├── components/                        # Reusable UI components & layouts
│       │   ├── admin/                         # AdminLayout, ProtectedRoute
│       │   ├── common/                        # Lightbox
│       │   ├── gallery/                       # ArtworkCard
│       │   ├── inquiry/                       # InquiryDrawer
│       │   └── layout/                        # Header, Footer, PublicLayout
│       ├── context/                           # AuthContext, InquiryContext, SettingsContext
│       ├── pages/                             # Public pages (Home, Gallery, Detail, About, etc.)
│       │   └── admin/                         # CMS pages (Dashboard, Artworks, Collections, etc.)
│       ├── services/                          # apiClient.ts, publicApi.ts, adminApi.ts
│       ├── styles/                            # tokens.css, global.css
│       └── types/                             # TypeScript DTO interfaces & enums
│
├── docs/                                      # Complete Project Documentation & Specs
│   ├── DATABASE_DESIGN.md                     # Entity relational schemas & indexes
│   ├── DEPLOYMENT_AND_MAINTENANCE.md          # Production deployment & operations manual
│   ├── DEVELOPMENT_ROADMAP.md                 # 10-Phase roadmap & exit criteria
│   ├── FEATURE_BACKLOG.md                     # Phase 1-9 scope & Phase 6 future backlog
│   ├── IMPLEMENTATION_SPEC.md                 # Locked API contracts & component specs
│   ├── OPEN_QUESTIONS.md                      # Resolved architecture decisions
│   ├── PROJECT_OVERVIEW.md                    # Core vision & business goals
│   ├── REQUIREMENTS.md                        # Functional & non-functional requirements
│   ├── SITEMAP.md                             # Public & administrative route map
│   ├── TECHNICAL_ARCHITECTURE.md              # System architecture, auth & data pipelines
│   ├── TESTING_AND_AUDIT_REPORT.md            # Phase 9 automated audit results
│   ├── UI_UX_DESIGN_SPEC.md                   # Approved Archival Sanctuary design system
│   ├── USER_JOURNEYS.md                       # Collector & artist end-to-end workflows
│   ├── VISUAL_MOCKUPS.md                      # Phase 2 visual mockups specification
│   └── mockups/visual_mockups.html            # Standalone visual preview artifact
│
└── src/                                       # Backend .NET 9 Solution
    ├── Johar.sln                              # Visual Studio / dotnet solution file
    ├── Johar.Api/                             # ASP.NET Core Web API host
    │   ├── Controllers/                       # Public and Admin REST controllers
    │   ├── Properties/launchSettings.json     # Launch profiles (ports 5051 / 5050)
    │   ├── appsettings.json                   # Base application settings
    │   ├── appsettings.Development.json       # Development overrides
    │   ├── appsettings.Production.example.json# Production configuration template
    │   ├── Program.cs                         # Pipeline, CORS, Cookies & DI setup
    │   └── wwwroot/                           # Local fallback uploads & static files
    ├── Johar.Data/                            # Persistence & Data Access
    │   ├── ApplicationDbContext.cs            # EF Core DbContext with Fluent API
    │   ├── Entities/                          # Domain entities (Artwork, Image, Inquiry, etc.)
    │   ├── Migrations/                        # EF Core SQL Server migrations
    │   └── Seed/DatabaseSeeder.cs             # Idempotent database seeder
    └── Johar.Services/                        # Business Logic & Integration
        ├── Common/                            # CloudinaryOptions, PagedResult, Exceptions
        ├── DTOs/                              # Request & response data transfer objects
        ├── Implementations/                   # Artwork, Inquiry, Settings, Cloudinary services
        └── Interfaces/                        # Service abstractions
```

---

## 4. Quick-Start Local Development

### Prerequisites
- [.NET 9.0 SDK](https://dotnet.microsoft.com/download/dotnet/9.0)
- [Node.js 20+ LTS](https://nodejs.org/) & `npm`
- Microsoft SQL Server (LocalDB, Express, or Developer Edition)

### Step 1: Clone & Restore Dependencies
```powershell
# Restore backend NuGet packages
dotnet restore src/Johar.sln

# Install frontend npm dependencies
cd client
npm install
cd ..
```

### Step 2: Initialize Database
The application automatically creates the database and seeds initial categories and default credentials upon first launch. To manually apply migrations:
```powershell
dotnet ef database update --project src/Johar.Data --startup-project src/Johar.Api
```

### Step 3: Start the Backend API
```powershell
dotnet run --project src/Johar.Api/Johar.Api.csproj --launch-profile http
# API listening on: http://localhost:5051
# Health check:    http://localhost:5051/api/health
```

### Step 4: Start the Frontend React Client
In a separate terminal:
```powershell
cd client
npm run dev
# Vite dev server running on: http://localhost:5173
```

---

## 5. Administrative Access & Credentials

- **Admin Login URL:** [http://localhost:5173/admin/login](http://localhost:5173/admin/login)
- **Default Seed Email:** `admin@atelier.local`
- **Default Seed Password:** `AtelierDev2026!`

*(Note: Production seeding credentials can be customized via the `AdminSeed__Email` and `AdminSeed__Password` environment variables).*

---

## 6. Complete Documentation Index

| Document | Path | Description |
|---|---|---|
| **Deployment & Operations** | [`docs/DEPLOYMENT_AND_MAINTENANCE.md`](file:///c:/Users/kk/Downloads/Johar_Project/docs/DEPLOYMENT_AND_MAINTENANCE.md) | Production hosting, migrations, Cloudinary setup, backups, and client onboarding checklist. |
| **Testing & Audit Report** | [`docs/TESTING_AND_AUDIT_REPORT.md`](file:///c:/Users/kk/Downloads/Johar_Project/docs/TESTING_AND_AUDIT_REPORT.md) | Permanent report of the 15-point automated verification suite, responsive audit, and WCAG AA compliance. |
| **Implementation Specs** | [`docs/IMPLEMENTATION_SPEC.md`](file:///c:/Users/kk/Downloads/Johar_Project/docs/IMPLEMENTATION_SPEC.md) | Locked REST API endpoints, DTO contracts, validation gates, and component hierarchy. |
| **UI/UX Design Specification** | [`docs/UI_UX_DESIGN_SPEC.md`](file:///c:/Users/kk/Downloads/Johar_Project/docs/UI_UX_DESIGN_SPEC.md) | Complete color tokens, typography stacks, spacing rules, and layout specifications. |
| **Database Design** | [`docs/DATABASE_DESIGN.md`](file:///c:/Users/kk/Downloads/Johar_Project/docs/DATABASE_DESIGN.md) | Relational schema, indexes, cascade behaviors, and SQL Server configurations. |
| **Technical Architecture** | [`docs/TECHNICAL_ARCHITECTURE.md`](file:///c:/Users/kk/Downloads/Johar_Project/docs/TECHNICAL_ARCHITECTURE.md) | Architecture tiers, cookie authentication, Cloudinary pipeline, and security defenses. |
| **Requirements Specification** | [`docs/REQUIREMENTS.md`](file:///c:/Users/kk/Downloads/Johar_Project/docs/REQUIREMENTS.md) | Functional requirements, business constraints, and non-functional targets. |
| **User Journeys** | [`docs/USER_JOURNEYS.md`](file:///c:/Users/kk/Downloads/Johar_Project/docs/USER_JOURNEYS.md) | Collector acquisition journey, commission workflow, and artist catalog management. |
| **Site Map & Navigation** | [`docs/SITEMAP.md`](file:///c:/Users/kk/Downloads/Johar_Project/docs/SITEMAP.md) | Hierarchical route structure and modal/drawer state navigation map. |
| **Development Roadmap** | [`docs/DEVELOPMENT_ROADMAP.md`](file:///c:/Users/kk/Downloads/Johar_Project/docs/DEVELOPMENT_ROADMAP.md) | Phased project schedule from initial planning through production release. |
| **Feature Backlog** | [`docs/FEATURE_BACKLOG.md`](file:///c:/Users/kk/Downloads/Johar_Project/docs/FEATURE_BACKLOG.md) | MVP feature scope and prospective future modular extensions (Phase 6). |
| **Open Questions & Decisions** | [`docs/OPEN_QUESTIONS.md`](file:///c:/Users/kk/Downloads/Johar_Project/docs/OPEN_QUESTIONS.md) | Architectural decision record and resolution of project boundaries. |
| **Visual Mockups Spec** | [`docs/VISUAL_MOCKUPS.md`](file:///c:/Users/kk/Downloads/Johar_Project/docs/VISUAL_MOCKUPS.md) | Narrative descriptions and visual specifications for core application screens. |
| **Visual Mockups HTML** | [`docs/mockups/visual_mockups.html`](file:///c:/Users/kk/Downloads/Johar_Project/docs/mockups/visual_mockups.html) | Standalone interactive visual mockup prototype for all 5 core screens. |

---

## 7. Production Readiness Status

- [x] **0 Build Errors, 0 Build Warnings:** Clean compilation across all `.csproj` projects and Vite TypeScript bundles.
- [x] **Artwork Integrity Enforced:** Uncropped compositions preserved (`object-fit: contain`, no face crops on artworks).
- [x] **Pure Inquiry Model:** Zero prices, commerce fields, or checkout mechanisms.
- [x] **Production Cloudinary Guard:** Automatic failure prevention on unconfigured cloud hosts.
- [x] **Configurable Production CORS:** Environment variable-driven CORS origin configuration.
- [x] **WCAG 2.2 AA Contrast Compliance:** Tested `#948E84` resting borders, `#55524C` captions, and `#8C6541` focus rings.
- [x] **Keyboard Accessibility & Reduced Motion:** Escape key modal traps, arrow navigation in lightbox, and global `prefers-reduced-motion` override.
- [x] **Clean Baseline State:** Zero dummy or orphaned test records. Database and disk storage ready for the artist's real collection.

---

*Architected and crafted with obsessive care for fine art.*
