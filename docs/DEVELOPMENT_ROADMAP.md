# Development Roadmap & Delivery Phases

## 1. Roadmap Overview
This roadmap organizes project delivery into structured, incremental milestones. Development follows a **backend-first / contract-driven** methodology, ensuring data contracts and Cloudinary asset pipelines are verified before assembling the public presentation layer.

```
┌────────────────────────────────────────────────────────────────────────┐
│ Phase 1: Planning & Foundation (Architecture, Database & Design System)│
└───────────────────────────────────┬────────────────────────────────────┘
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ Phase 2: Backend Core API & Cloudinary Ingestion Pipeline              │
└───────────────────────────────────┬────────────────────────────────────┘
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ Phase 3: Artist Admin CMS & Media Management (Profile & Artworks)      │
└───────────────────────────────────┬────────────────────────────────────┘
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ Phase 4: Public Gallery, Artist Narrative & Responsive UX              │
└───────────────────────────────────┬────────────────────────────────────┘
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ Phase 5: Verification, SEO, Accessibility & Production Launch          │
└───────────────────────────────────┬────────────────────────────────────┘
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ Phase 6: Post-Launch & Modular Expansions (E-Commerce, 3D Viewer)      │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Phase Breakdown & Milestones

### Phase 1: Planning, Foundation & Scaffolding
* **Objectives:** Finalize architectural contracts, establish clean repository structure, and initialize database models.
* **Deliverables:**
  * Complete `/docs` architectural specifications (Completed).
  * Monorepo/Solution scaffolding: `Johar.Api`, `Johar.Services`, `Johar.Data` (.NET 8/9) and `client/` (React + Vite + TypeScript).
  * Design tokens definition: Typography scale, color palette (museum neutrals), spacing rules, and CSS variables.
  * EF Core `DbContext` configuration and initial migration scripts for SQL Server.
* **Exit Criteria:** Database initialized in local/staging SQL Server with schema passing relational integrity checks.

---

### Phase 2: Core API & Cloudinary Ingestion Pipeline
* **Objectives:** Build and test all backend endpoints, authentication, and image processing.
* **Deliverables:**
  * **Authentication:** Secure admin login with hashed password verification and JWT/Cookie issuance.
  * **Image Pipeline:** `CloudinaryImageService` integration via Cloudinary .NET SDK supporting server-side upload, strict enforcement of the **Artwork Integrity Transformation Policy** (face-detection cropping `g_face` restricted exclusively to the artist profile portrait; all artwork assets preserve 100% full composition using `c_limit`), and asset deletion.
  * **Profile API:** Endpoints to get and update `SiteSettings` (including artist profile photo, independent artist statement, bio copy, and studio location).
  * **Catalog API:** REST endpoints for `Artworks` (CRUD, category/collection filtering, slug lookups, AltText validation).
  * **Inquiry API:** Endpoints to submit public inquiries with `ClientLocation` capture (with rate limiting and validation) and admin retrieval with status updates.
* **Exit Criteria:** All API endpoints verified via integration tests and Swagger/Postman with mock Cloudinary payloads.

---

### Phase 3: Artist Admin CMS & Asset Management
* **Objectives:** Provide the artist with a polished, intuitive dashboard to manage their identity and catalog.
* **Deliverables:**
  * **Admin Authentication Guard:** Secure login screen with session expiration handling.
  * **Profile Management Screen (Confirmed Requirement):**
    * Display current artist profile portrait.
    * Drag-and-drop file upload to replace portrait with instant Cloudinary processing preview.
    * Edit short homepage intro, independent artist statement, full biographical narrative, and studio contact details.
  * **Artwork Catalog Manager:**
    * Add Artwork multi-step form (details, physical dimensions, medium, availability status).
    * Multi-image uploader with primary thumbnail selection and drag-to-reorder.
    * Enforce mandatory Alternative Text (`AltText`) on all images before allowing status `Published` (drafts permitted without AltText).
    * Quick-toggle for "Featured on Homepage" and "Published/Draft".
  * **Inquiry Inbox:**
    * Triage table with filter tabs (`New`, `In Review`, `Contacted`, `Archived`).
    * Detailed inquiry modal displaying client information, location (City/Country), and message.
* **Exit Criteria:** Artist can log in, upload/replace their profile photograph, add a new artwork with photos and AltText, and update an inquiry status.

---

### Phase 4: Public Gallery, Artist Narrative & Responsive UX
* **Objectives:** Build the high-aesthetic public gallery and brand touchpoints.
* **Deliverables:**
  * **Homepage:**
    * Hero masterpiece showcase.
    * **Artist Introduction section featuring the artist's professional portrait** with subtle scroll reveal.
    * Curated highlights grid across mediums (Oil, Watercolor, Calligraphy, Sketches, Portraits).
  * **Exhibition Gallery (`/gallery`):**
    * Medium taxonomy and thematic collection filters with smooth layout transitions (Framer Motion).
    * Lazy-loaded artwork cards with blur-up placeholders adhering to the Artwork Integrity Policy.
  * **Artwork Details View (`/gallery/:slug`):**
    * Multi-image carousel/gallery (full composition preserved).
    * Specifications panel (dimensions, medium, year, framing).
    * Contextual "Inquire for Acquisition" modal with automatic artwork pre-fill and location field.
  * **About Page (`/about`):**
    * **Prominent artist profile photograph** alongside independent artist statement, biography, and technique showcase.
    * Curated narrative section of selected exhibitions and honors.
  * **Commissions & Contact (`/commissions`, `/contact`):**
    * Commission request form with medium and budget selectors.
    * General contact form and studio links.
* **Exit Criteria:** End-to-end user journeys function smoothly across mobile, tablet, and desktop viewports.

---

### Phase 5: Verification, SEO, Accessibility & Production Launch
* **Objectives:** Ensure site reliability, search engine prominence, and compliance with accessibility standards.
* **Deliverables:**
  * **Performance & Core Web Vitals Audit:** Optimize Largest Contentful Paint (LCP < 2.0s) and Cumulative Layout Shift (CLS < 0.05).
  * **Accessibility (a11y) Verification:** Complete WCAG 2.1 AA audit (screen reader test, keyboard navigation, color contrast validation).
  * **SEO Implementation:** Open Graph meta tags, Twitter cards, and structured JSON-LD schemas (`VisualArtwork` and `Person`).
  * **Security Hardening:** Enforce HTTPS, security response headers (CSP, HSTS), and rate limiting.
  * **Production Deployment:** Backend deployed to ASP.NET Core host; Frontend deployed to CDN; SQL Server deployed to managed cloud instance; Cloudinary production credentials verified.
* **Exit Criteria:** 90+ Lighthouse scores across Performance, Accessibility, Best Practices, and SEO.

---

### Phase 6: Post-Launch & Modular Expansions (Future Phase)
* **Trigger:** Initiated only upon explicit client request after MVP validation.
* **Potential Enhancements:**
  * **Dynamic Exhibitions & CV Manager:** Activate the pre-modeled `Exhibitions` database entity with dedicated admin CRUD screens and dynamic timeline component.
  * **Collector Testimonials Engine:** Activate the pre-modeled `Testimonials` database entity with an editorial quote carousel.
  * **Online Art Store & Payments:** Integration of Stripe checkout for instant purchase of prints or smaller original sketches.
  * **Interactive 3D / R3F "View in Room":** Virtual gallery room visualizer allowing collectors to preview artwork scaled against a simulated wall.
  * **Deep-Zoom Canvas Viewer:** Tile-based deep zoom for inspecting high-res oil textures and ink strokes.
