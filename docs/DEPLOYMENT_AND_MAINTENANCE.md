# Deployment, Production Readiness & Handover Manual
**Project:** *L'Archive Vivante (The Living Archive)* — Fine Art Portfolio & Atelier CMS  
**Audience:** System Administrators, DevOps Engineers, and the Atelier Artist / Studio Manager  
**Version:** 1.0 (Production Release)  
**Date:** November 2026  

---

## 1. Architectural Overview & Hosting Architectures

*L'Archive Vivante* is built on a decoupled, modern architecture:
- **Backend API:** ASP.NET Core 9.0 Web API (`Johar.Api`), Entity Framework Core 9.0, and Microsoft SQL Server.
- **Frontend SPA:** React 19, TypeScript, Vite, and CSS Modules adhering to "The Archival Sanctuary" design tokens.
- **Media Asset Pipeline:** Cloudinary REST SDK for secure HTTPS delivery, responsive breakpoints, and uncropped aspect ratio preservation.
- **Authentication:** First-party, stateful, encrypted `HttpOnly` session cookie (`.Atelier.Session`) with zero third-party auth dependencies.

### Option A: Unified Single-Origin Hosting (Recommended)
In this topology, both the compiled React frontend and the ASP.NET Core Web API are hosted behind a single reverse proxy (or within a single app service), eliminating cross-origin CORS complexity and enabling seamless first-party cookie handling.

```
+-------------------------------------------------------------+
|                Reverse Proxy (Nginx / Cloudflare / IIS)      |
|             https://atelier-gallery.com                      |
+-------------------------------------------------------------+
               |                                 |
        /api/* |                                 | All Other Routes (/*)
               v                                 v
+-------------------------------+ +---------------------------+
| ASP.NET Core API (:5051)      | | Compiled React Static SPA |
| (Johar.Api on Kestrel)        | | (client/dist -> static)   |
+-------------------------------+ +---------------------------+
               |
               +---> SQL Server (Azure SQL / Managed Instance)
               +---> Cloudinary Cloud (Image Assets)
```

**Recommended Platforms:**
- Azure App Service (Linux / Windows)
- Linux VPS (Ubuntu 24.04 LTS + Nginx + Systemd + .NET 9 Runtime)
- Windows Server 2022 with IIS and ASP.NET Core Hosting Bundle

---

### Option B: Decoupled Multi-Host Deployment
In this topology, the React SPA is hosted on a global static CDN (such as Vercel, Netlify, or Cloudflare Pages) and the ASP.NET Core Web API is hosted on a containerized or managed platform (such as Azure App Service or AWS ECS).

```
+-----------------------------+        +------------------------------+
| Client: React Static SPA    |  CORS  | API: ASP.NET Core Web API    |
| https://atelier-gallery.com | -----> | https://api.atelier-gallery.com|
| (Vercel / Netlify / CDN)    |        | (Azure / VPS / Containers)   |
+-----------------------------+        +------------------------------+
                                                      |
                                       +--------------+---------------+
                                       |                              |
                                       v                              v
                               SQL Server Database            Cloudinary CDN
```

**Key Configuration for Option B:**
1. In `client/.env.production`, set `VITE_API_BASE_URL=https://api.atelier-gallery.com/api`.
2. In the backend's environment variables, configure `Cors__AllowedOrigins=https://atelier-gallery.com`.
3. In `Program.cs`, ensure cookies use `SameSiteMode.None` if cross-site origin calls are made, or keep the API on a subdomain (`api.atelier-gallery.com`) sharing the same parent domain cookie.

---

## 2. Production Database Setup & Migrations

### A. SQL Server Prerequisites
- Microsoft SQL Server 2019, 2022, or Azure SQL Database (General Purpose or Hyperscale).
- Dedicated database (e.g., `AtelierGalleryDb_Prod`).
- Dedicated least-privilege SQL login (e.g., `atelier_app_user`) with `db_datareader`, `db_datawriter`, and `db_ddladmin` permissions on the database.

### B. Applying Migrations Safely
Never rely on `context.Database.EnsureCreated()` in production. Instead, apply Entity Framework Core migrations using one of the two industry-standard approaches:

#### Method 1: Idempotent SQL Script (Recommended for DBA / CI/CD Pipelines)
Generate an idempotent SQL script that can be audited before execution and safely rerun:
```powershell
dotnet ef migrations script --idempotent --project src/Johar.Data --startup-project src/Johar.Api -o docs/migrations_prod.sql
```
Apply `docs/migrations_prod.sql` against your production SQL database using Azure Portal Query Editor, SQL Server Management Studio (SSMS), or Azure DevOps pipeline.

#### Method 2: Self-Contained Migration Bundle
Generate a self-contained cross-platform migration executable:
```powershell
dotnet ef migrations bundle --project src/Johar.Data --startup-project src/Johar.Api --output bin/bundle/efbundle
```
Execute on the server:
```bash
./efbundle --connection "Server=...;Database=AtelierGalleryDb_Prod;User ID=...;Password=...;Encrypt=True;"
```

### C. Safe Production Admin Seeding
When the API boots for the first time against an empty database, `DatabaseSeeder.SeedAsync` automatically and idempotently seeds:
1. The 6 core artistic medium taxonomy categories (*Oil Paintings, Watercolors, Calligraphy, Pencil Sketches, Portraits, Visual Artwork*).
2. The initial `SiteSettings` record with neutral placeholders.
3. The initial administrator account, reading credentials from `AdminSeed__Email` and `AdminSeed__Password`.

> [!IMPORTANT]
> If any user already exists in the `Users` table, the seeder **immediately skips user creation**, guaranteeing that existing admin passwords and roles are never overwritten on application restart.

---

## 3. Cloudinary Production Configuration & Artwork Integrity

### A. Environment Configuration
Obtain your API credentials from your [Cloudinary Console](https://cloudinary.com/console) and configure the following environment variables on your hosting platform:

| Variable Key | Description | Example Value |
|--------------|-------------|---------------|
| `Cloudinary__CloudName` | Your production Cloudinary cloud identifier | `atelier-archive-prod` |
| `Cloudinary__ApiKey` | Cloudinary API Key | `184920394819238` |
| `Cloudinary__ApiSecret` | Cloudinary API Secret (Keep strictly confidential) | `xK9_mQpL28sZ1...` |
| `Cloudinary__FolderPrefix` | Root asset folder namespace in Cloudinary | `atelier_archive` |

### B. Production Cloudinary Guard
To prevent accidental data loss, the backend contains a strict production safety guard in `CloudinaryService.cs`:
- If `ASPNETCORE_ENVIRONMENT=Production` and Cloudinary credentials are missing or set to `"placeholder"`, the service will **throw an `InvalidOperationException` at startup**.
- This fails fast and prevents cloud servers with ephemeral filesystems (such as Docker containers or Azure App Service) from writing artwork scans to local temporary disk that would be erased upon container restart.

### C. The Artwork Image Integrity Rule
- **Artworks (`/artworks/*`):** Never cropped. The backend never requests `c_fill`, `c_crop`, or `g_face` for artwork photographs. It strictly serves the artist's full composition utilizing `c_limit` for responsive bandwidth scaling.
- **Artist Portrait (`/profile/*`):** Facial centering (`c_fill,g_face`) is isolated strictly to the artist's headshot in `AdminSettingsController.cs` and `PublicProfileDto`.

---

## 4. HTTPS, Domain & Security Hardening Checklist

- [x] **Enforce HTTPS:** Managed SSL/TLS certificates installed. In production, ASP.NET Core enforces `app.UseHttpsRedirection()` and `app.UseHsts()` with HTTP Strict Transport Security headers.
- [x] **Secure Cookie Flags:** The `.Atelier.Session` authentication cookie enforces:
  - `HttpOnly = true` (Inaccessible to client-side JavaScript / XSS protection)
  - `SecurePolicy = CookieSecurePolicy.Always` in production (Transmitted only over HTTPS)
  - `SameSite = SameSiteMode.Lax` (Protects against CSRF while permitting top-level navigation)
  - `SlidingExpiration = true` (Extended automatically during active administrative curation)
- [x] **Configurable CORS:** Allowed origins are loaded from `Cors__AllowedOrigins` and can be set to the exact production domain (e.g. `https://atelier-gallery.com,https://www.atelier-gallery.com`) via environment variables without recompiling code.
- [x] **Error Sanitization (RFC 7807):** In production, raw stack traces and database internal error messages are replaced with sanitized `problem+json` error responses.
- [x] **Anti-Bot Honeypot:** Public inquiry forms include a hidden `honeypot` trap field. Human users leave it empty; automated bot submissions that populate this field are rejected with HTTP 400 Bad Request.
- [x] **AltText Publication Gate:** Artworks cannot be published without descriptive accessibility `AltText` on every photograph.

---

## 5. Backup & Maintenance Procedures

### A. Database Backup Strategy
1. **Automated Point-In-Time Restore (PITR):** If using Azure SQL or AWS RDS, verify that automated backups are enabled with a 14-day or 35-day retention window.
2. **Weekly Full Backup Export:** Export a monthly `.bacpac` database backup to secure offline archival storage.
```powershell
# Example Azure CLI SQL export
az sql db export --resource-group Atelier-RG --server sqlserver-atelier --name AtelierGalleryDb_Prod --admin-user dbadmin --admin-password "..." --storage-key "..." --storage-uri "https://atelierbackups.blob.core.windows.net/backups/atelier_db_$(Get-Date -Format 'yyyyMMdd').bacpac"
```

### B. Cloudinary Media Asset Backup
1. Enable Cloudinary's built-in **Automatic Cloud Backup** to automatically sync all master original uploads to a private Amazon S3 bucket or Google Cloud Storage bucket in your organization.
2. Ensure master uploads are stored with full lossless resolution (`fl_lossy` is only applied on edge delivery transformations, never on master assets).

---

## 6. Day-1 Artist & Client Onboarding Checklist

Once production deployment is completed, walk the artist through this step-by-step checklist to take full ownership of *The Archival Sanctuary*:

### Step 1: Initial Administrative Sign-in
1. Navigate to `https://your-domain.com/admin/login`.
2. Enter the initial seeded email and password configured in `AdminSeed__Email` and `AdminSeed__Password`.
3. Confirm successful login and landing on the **Atelier Studio Dashboard**.

### Step 2: Replace Neutral Profile Placeholders
Navigate to **Studio Profile & Narrative** (`/admin/profile`):
1. **Artist Portrait:** Upload a professional, high-resolution portrait photograph of the artist in the studio. Enter meaningful accessibility AltText (e.g., *"Portrait of the visual artist holding an oil palette in the studio"*).
2. **Artist Name:** Replace `[Illustrative Placeholder: Artist Name]` with the artist's full name or professional moniker.
3. **Artist Statement:** Replace the placeholder text with the artist's genuine, curated artist statement (philosophical manifesto, medium focus, thematic explorations).
4. **Studio Biography:** Replace the placeholder narrative with the artist's genuine training, background, and career highlights.
5. **Archival Techniques & Materials (Optional):** Enter genuine notes regarding traditional pigments, Belgian linen preparations, Japanese sumi ink, or hand-made paper. If left empty, this section collapses cleanly on the public About page.
6. **Exhibition Highlights (Optional):** Enter solo exhibitions, museum loans, residencies, and awards. If left empty, this section collapses cleanly.
7. **Direct Contact & Studio Channel:** Enter the studio inquiry email, studio city/country, and Instagram handle.
8. Click **`[ Save Atelier Narrative ]`**.

### Step 3: Review Medium Taxonomies & Thematic Collections
1. Navigate to **Taxonomy Categories** (`/admin/categories`): Review the 6 active mediums (*Oil Paintings, Watercolors, Calligraphy, Pencil Sketches, Portraits, Visual Artwork*). Add or customize descriptions as desired.
2. Navigate to **Collections** (`/admin/collections`): Click **`+ Create Archival Collection`** to create thematic series (e.g., *"The Mediterranean Studies"*, *"Vespers Calligraphy Series"*).

### Step 4: Catalog & Publish Initial Artworks
Navigate to **Artworks Catalog** (`/admin/artworks`):
1. Click **`+ Record New Artwork`**.
2. **Tab 1 (Curatorial Metadata):**
   - Title, medium, taxonomy category, and optional collection assignment.
   - Physical dimensions (Height, Width, Depth in cm or inches).
   - Creation year, catalog reference code (e.g., `AT-2026-001`), framing status, and availability (*Available, In Private Collection, Reserved, Archive Only*).
   - Curatorial story/notes explaining the genesis and technique of the piece.
   - Click **`[ Create & Proceed to Photos ]`**.
3. **Tab 2 (Photographs & Archival Views):**
   - Upload the primary full-composition photograph.
   - Enter descriptive accessibility AltText (e.g., *"Impasto oil painting of twilight dunes with ochre and violet horizon"*). Check *"Set as Primary Catalog Photograph"*.
   - Upload optional secondary macro detail photographs or framed installation shots.
   - If an image file needs color correction or a higher-resolution scan later, use the **`[ Replace File ]`** control to update the image while preserving its AltText and display order.
4. **Publish Artwork:**
   - In the artworks table, toggle the publication switch to **Published**. (Remember: The system will verify that all uploaded photos have descriptive AltText before publication is permitted).
   - Toggle **Featured** for pieces you wish to showcase on the homepage hero or highlight grid.

### Step 5: Test the Collector Inquiry Workflow
1. Open an incognito browser window and navigate to the public website (`https://your-domain.com`).
2. Verify that your real portrait, artist statement, and published artworks render uncropped.
3. On an artwork detail page, click **`[ Inquire for Acquisition ]`**.
4. Submit a test inquiry with your personal contact email.
5. In your admin tab, navigate to **Inquiry Inbox** (`/admin/inquiries`):
   - Confirm the new inquiry appears in the inbox.
   - Update its status to **In Review** or **Contacted**.
   - Add a private artist note (e.g., *"Sent provenance dossier and private viewing appointment options."*).

---

*L'Archive Vivante is now fully initialized, secured, and ready for public exhibition.*
