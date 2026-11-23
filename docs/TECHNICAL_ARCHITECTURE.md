# Technical Architecture Specification

## 1. Architectural Philosophy & Principles
This system is architected around **simplicity, reliability, and visual craftsmanship**. It deliberately eschews complex enterprise patterns (such as CQRS, MediatR, event sourcing, or microservices) in favor of a clean, maintainable **3-Tier Monolith** that is easy to understand, test, deploy, and maintain.

```
┌─────────────────────────────────────────────────────────────┐
│                    Client Layer (SPA)                       │
│        React 19 + Vite + TypeScript + Framer Motion         │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTPS / JSON REST API
┌──────────────────────────────▼──────────────────────────────┐
│             Presentation Layer (ASP.NET Core API)           │
│    Controllers, DTOs, Auth Middleware, Fluent Validation    │
├─────────────────────────────────────────────────────────────┤
│               Business Service Layer (Services)             │
│   ArtworkService, InquiryService, ProfileService, ImageService
├─────────────────────────────────────────────────────────────┤
│               Data Access Layer (EF Core + SQL)             │
│     AppDbContext, Entity Configurations, Migrations         │
└──────────────┬──────────────────────────────┬───────────────┘
               │                              │
        ┌──────▼──────┐                ┌──────▼──────┐
        │ SQL Server  │                │ Cloudinary  │
        │  Database   │                │   CDN/API   │
        └─────────────┘                └─────────────┘
```

---

## 2. Frontend Architecture (React + Vite + TypeScript)

### A. Tech Stack
* **Build Tool:** Vite (fast HMR, optimized production rollup).
* **Framework:** React 19 with TypeScript in strict mode.
* **Routing:** React Router (v6/v7) with separated public and protected admin route trees.
* **Animation Engine:** Framer Motion (page transitions, fluid modal entrances, scroll-triggered reveals).
* **State Management:** 
  * *Server State:* TanStack React Query (efficient caching, background refetching, optimistic UI for admin).
  * *Client State:* Lightweight React Context (theme tokens, mobile navigation state, notification toast system).

### B. Styling Strategy Evaluation: CSS Modules vs. Tailwind CSS
We evaluate two viable styling strategies for this project rather than imposing a single assumption:

| Consideration | Option A: CSS Modules with Design Tokens | Option B: Tailwind CSS |
| :--- | :--- | :--- |
| **Aesthetic Fit** | **Superior for Fine Art.** Gives total bespoke control over custom editorial typography, fluid spacing formulas (`clamp()`), and subtle transitions without cluttering JSX with dozens of utility classes. | **Good.** Can achieve high fidelity, but requires extensive `tailwind.config.js` extension for bespoke art font families, custom easing curves, and fine grid layouts. |
| **Bundle Footprint** | Extremely lightweight; only the CSS imported by active components is loaded. | Near-zero unused CSS after PurgeCSS/JIT, but generates larger HTML class lists. |
| **Maintainability** | Scoped CSS prevents global namespace collisions; clean separation between structure (TSX) and styling. | Rapid to tweak in-place, but long class strings can reduce code readability for non-specialists. |
| **Recommendation** | **Recommended Option A (CSS Modules + CSS Variables):** Fine art portfolios rely heavily on refined typography, subtle border treatments, and bespoke grid alignments. Combining CSS Modules with a structured `:root` design token file (`tokens.css`) offers the highest aesthetic precision and cleanest long-term maintainability. | **Viable Alternative:** If the development team prioritizes rapid prototyping speed, Tailwind CSS can be configured with strict design system extensions. |

---

## 3. Backend Architecture (ASP.NET Core Web API)

The backend follows a classic, pragmatic **3-Layer Architecture** without unnecessary indirection:

### Layer 1: Presentation Layer (`Johar.Api`)
* **Role:** Handles HTTP transport, parses incoming requests, enforces CORS policies, and validates security tokens.
* **Components:**
  * **Controllers:** `ArtworksController`, `CategoriesController`, `InquiriesController`, `ProfileController`, `AuthController`.
  * **DTOs (Data Transfer Objects):** Strictly decoupled request and response contracts (e.g., `CreateArtworkRequest`, `ArtworkDetailResponse`, `UpdateProfilePictureRequest`).
  * **Global Exception Handler:** Middleware intercepting unhandled errors and returning RFC 7807 standard Problem Details.

### Layer 2: Business Service Layer (`Johar.Services`)
* **Role:** Implements core business logic, orchestrates data persistence, and coordinates external services.
* **Components:**
  * `ArtworkService`: Manages catalog business rules (e.g., ensuring featured status limits, slug generation, AltText enforcement upon publishing, archiving).
  * `InquiryService`: Handles inquiry processing, captures client location, dispatches notifications, and tracks status transitions.
  * `ProfileService`: Manages artist identity, independent artist statement, full biographical narrative, and profile photograph updates.
  * `CloudinaryImageService`: Encapsulates Cloudinary SDK calls for upload, deletion, and responsive URL construction enforcing the Artwork Integrity Policy.

### Layer 3: Data Access Layer (`Johar.Data`)
* **Role:** Manages database interaction using Entity Framework Core.
* **Components:**
  * `AppDbContext`: Entity definitions and relationship configurations via Fluent API.
  * **Entity Models:** `Artwork`, `ArtworkImage`, `Category`, `Collection`, `Inquiry`, `SiteSettings`, `User`.
  * **EF Core Migrations:** Version-controlled database schema evolutions.

*Why this design succeeds:*
* **No MediatR / CQRS Overhead:** Every request follows a straightforward, debuggable path: `Controller` $\rightarrow$ `Service` $\rightarrow$ `DbContext`.
* **Testable:** Services can be unit tested against in-memory or mock databases without complex mediator plumbing.

---

## 4. Image Management & Cloudinary Integration

### A. Core Architecture: Server-Side Stream via Cloudinary .NET SDK
To guarantee security and eliminate client-side token exposure, image uploads pass through the authenticated ASP.NET Core backend:

```
[Admin Browser] 
      │ 1. POST /api/admin/profile/photo (multipart/form-data)
      ▼
[ASP.NET Core API]
      │ 2. Validate file type (JPG/PNG/WebP), size (< 15MB)
      │ 3. Stream file directly to Cloudinary via CloudinaryDotNet SDK
      ▼
[Cloudinary Cloud Storage]
      │ 4. Store master asset securely in cloud
      │ 5. Return Public ID, Secure URL, Width, Height
      ▼
[ASP.NET Core API]
      │ 6. Update `SiteSettings.ProfilePictureUrl` and `PublicId` in SQL Server
      │ 7. Return updated Profile DTO to Admin UI
```

### B. Cloudinary Transformations & The Artwork Integrity Transformation Policy

The system enforces a strict architectural boundary between personal branding photographs and physical artworks:

#### 1. Artist Profile Portrait (Personal Photograph Only)
* *Transformation Rule:* `c_fill,g_face,w_800,h_800,q_auto,f_auto`
* *Purpose:* Centers on the artist's face and crops cleanly to square or circular UI components across the Homepage intro and About page. Face detection is permitted **solely** for this specific asset.

#### 2. Artwork Images (The Artwork Integrity Policy)
> [!IMPORTANT]
> **Strict Prohibition of Face Detection & Auto-Cropping on Artwork:**
> Fine art—especially human portraits, figurative watercolors, and sketches—must **never** undergo face-detection cropping (`g_face`) or aspect-ratio filling (`c_fill`). Doing so would cause Cloudinary to automatically zoom into the painted subject's face, destroying the artist's canvas margins, background texture, composition, and framing.

* *Transformation Rule (Detail View):* `c_limit,w_1800,q_auto,f_auto` (Preserves 100% of original aspect ratio and full composition with zero cropping).
* *Transformation Rule (Thumbnails):* `c_limit,w_600,q_auto,f_auto` (Preserves original proportions within responsive gallery cards).
* *Low-Quality Image Placeholder (LQIP):* `w_50,e_blur:1000,q_auto:low,f_auto` for zero-layout-shift preview loading.

---

## 5. Authentication & Security Architecture

### A. Artist Admin Authentication
* **Model:** Secure cookie-based authentication using **ASP.NET Core Cookie Authentication** (`CookieAuthenticationDefaults.AuthenticationScheme`).
* **Cookie Configuration:** `HttpOnly = true`, `Secure = true`, `SameSite = SameSiteMode.Lax` (or `Strict`), and sliding expiration. This ensures zero JavaScript access to authentication credentials in the React SPA.
* **Storage:** Single administrator record stored in the `Users` table with a cryptographically salted password hash (via `IPasswordHasher<User>`).
* **Session Lifecycle:** 24-hour sliding session refreshed on active admin requests.

### B. Security Safeguards
* **CORS & Antiforgery:** Strict origin allowlist restricting API access to the verified frontend domain, with `credentials: include` enabled for secure cookie transport.
* **Input Sanitization:** Public inquiry fields are sanitized to prevent stored XSS attacks.
* **Rate Limiting:** IP-based rate limiting on public endpoints (`/api/inquiries`) to prevent spam flooding.
* **Honeypot Trap:** Hidden form fields on public forms to immediately reject automated bot submissions.

---

## 6. Extensibility for Future Phases

The system is deliberately designed to allow future enhancements to integrate seamlessly:
* **E-Commerce Expansion (Phase 2+):** The `Artwork` entity contains an `AvailabilityStatus` enum. A future `Price` field, `PaymentService` (Stripe/PayPal), and `Order` entity can be added to `Johar.Services` and `Johar.Data` without breaking the core catalog schema.
* **3D Virtual Room (Phase 3):** The frontend artwork detail page is structured to allow a `<VirtualRoomViewer artwork={artwork} />` component (built with React Three Fiber) to be toggled on without altering the standard 2D image gallery.
