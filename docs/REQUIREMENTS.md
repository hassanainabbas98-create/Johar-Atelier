# System Requirements Specification

## 1. Classification of Requirements
To maintain clarity and prevent scope creep, all specifications are categorized into **Confirmed Client Requirements** vs. **Working Assumptions (Subject to Artist Approval)**.

---

## 2. Confirmed Client Requirements

### A. Artist Profile & Identity (CR-ID)
* **CR-ID-01 (Homepage Portrait):** The homepage must feature a professional artist portrait in the artist introduction section.
* **CR-ID-02 (About Page Photograph):** The About page must display the artist's profile photograph alongside the artist's biography and artist statement.
* **CR-ID-03 (Admin Profile Management):** The artist must have an administrative screen to upload, preview, replace, and crop their profile photograph.
* **CR-ID-04 (Responsive Profile Image Delivery):** The profile image must be served in responsive resolutions (AVIF/WebP) with automated face-detection centering and cropping (`g_face, c_fill`) permitted strictly and exclusively for the artist's personal photograph to adapt cleanly to round/square UI avatars.
* **CR-ID-05 (Authenticity):** No synthetic/invented portraits or mock biographical details shall be hardcoded; the actual photograph and biographical copy will be supplied by the artist.
* **CR-ID-06 (Biography vs. Artist Statement):** The system must manage the Artist Biography (formal background, artistic training, and career narrative) and the Artist Statement (creative philosophy, conceptual vision, and intent) as distinct, independently editable fields in the admin panel, presented thoughtfully on the About page.

### B. Artwork Presentation & Integrity (CR-ART)
* **CR-ART-01 (Artwork Integrity Transformation Policy):** All artwork images—including human portraits, oil paintings, sketches, and calligraphy—must **strictly preserve 100% of their complete composition, brushwork margins, and original aspect ratio**. Automated cropping, face-detection zooming (`g_face`), and bounding-box fills (`c_fill`) are strictly prohibited on all artwork assets. Artwork transformations must exclusively utilize non-destructive bounding modes (`c_limit` or `c_fit`).

### C. Visitor Experience & Public Gallery (CR-PUB)
* **CR-PUB-01 (Homepage):** Premium landing page showcasing featured artworks, artist introduction with portrait, curated collections, and an invitation to inquire or commission work.
* **CR-PUB-02 (Artwork Catalog):** Searchable and filterable gallery supporting distinct mediums: Oil paintings, Watercolors, Calligraphy, Pencil sketches, Portraits, and Visual artwork/design.
* **CR-PUB-03 (Artwork Details View):** Dedicated view for each artwork displaying high-resolution imagery, title, medium, physical dimensions (height, width, depth/unit), creation year, framing status, availability status, and narrative description.
* **CR-PUB-04 (Categories & Collections):** Ability to browse artworks by category (medium) and curated thematic collections/series integrated smoothly within the gallery.
* **CR-PUB-05 (Artist About & Bio):** A dedicated page detailing the artist's background, independent artist statement, profile photograph, and structured exhibition/career highlights.
* **CR-PUB-06 (Artwork Acquisition Inquiry):** Context-aware inquiry form directly linked to a specific artwork, automatically pre-filling the artwork title and reference ID.
* **CR-PUB-07 (Commission Request Form):** Dedicated form allowing prospective clients to request custom commissions (specifying preferred medium, desired dimensions, timeline, budget range, and project description).
* **CR-PUB-08 (General Contact Page):** General contact form and studio direct contact details.

### D. Artist Admin Dashboard (CR-ADM)
* **CR-ADM-01 (Secure Authentication):** Protected administrative portal with secure credentials (email/password) restricted to the artist.
* **CR-ADM-02 (Artwork Management - CRUD):**
  * Create new artwork with title, category, collection, medium, dimensions, year, availability status, and description (commercial pricing fields are strictly excluded from MVP).
  * Require descriptive Alternative Text (`AltText`) on images prior to setting status to `Published` (drafts may be saved without AltText to permit work-in-progress staging).
  * Edit existing artwork attributes.
  * Delete or archive artwork.
  * Toggle "Featured on Homepage" and "Published / Draft" status.
* **CR-ADM-03 (Multi-Image Management):** Upload primary and secondary/detail images per artwork via Cloudinary. Reorder images and set primary thumbnail.
* **CR-ADM-04 (Inquiry Management):**
  * Unified inbox displaying incoming inquiries (Artwork Inquiries, Commission Requests, General Messages).
  * Status tracking per inquiry: `New`, `InReview`, `Contacted`, `Completed`, `Archived`.
  * Detail view displaying client contact information, location (City/Country), message, and linked artwork details.
* **CR-ADM-05 (Profile & Site Settings):** Upload and update artist profile photograph, edit short homepage intro, edit independent artist statement, edit full biography, and manage contact email and social links.

### E. Technical Foundations (CR-TECH)
* **CR-TECH-01 (Frontend Stack):** React + Vite + TypeScript with Framer Motion for animations.
* **CR-TECH-02 (Backend Stack):** ASP.NET Core Web API using a simple, maintainable layered architecture without unnecessary design pattern overhead (no CQRS, MediatR, or microservices).
* **CR-TECH-03 (Database & ORM):** Microsoft SQL Server utilizing Entity Framework Core.
* **CR-TECH-04 (Cloud Storage):** Cloudinary utilized for image storage, optimization, and transformation via the official .NET SDK.
* **CR-TECH-05 (Commercial Scope):** Online shopping carts, payment gateways (Stripe/PayPal), and customer accounts are excluded from the MVP.

---

## 3. Working Assumptions (Pending Artist Confirmation)

| Assumption ID | Description | Default Strategy Until Artist Confirms |
| :--- | :--- | :--- |
| **WA-01** | **Pricing Exclusion in MVP** | In line with the pure inquiry model, artwork price storage and price display are strictly excluded from the MVP; all acquisitions proceed through direct high-touch inquiry. |
| **WA-02** | **Availability Statuses** | Statuses will be standardized to: `Available`, `Reserved`, `Sold`, `Private Collection / NFS`. |
| **WA-03** | **Commission Deposit Terms** | Inquiries will simply capture requests; formal contract generation and deposit collection will occur offline. |
| **WA-04** | **Dimensions & Units** | Dimensions stored as numbers with a configurable unit flag (`cm` vs. `inches`), defaulting to centimeters. |
| **WA-05** | **Exhibitions & Press** | In MVP, exhibition history, awards, and press mentions will be managed as structured narrative text within the About page / biography (`SiteSettings.AboutBiography`). Standalone relational tables and dynamic admin CRUD for `Exhibitions` and `Testimonials` are deferred to Phase 2. |
| **WA-06** | **Single Admin User** | The initial system assumes a single administrative artist user; multi-user role-based access control is not needed for MVP. |

---

## 4. Non-Functional Requirements (NFR)

### A. Performance & Core Web Vitals
* **NFR-PERF-01 (LCP):** Largest Contentful Paint under **2.0s** on standard 4G mobile connections.
* **NFR-PERF-02 (CLS):** Cumulative Layout Shift score below **0.05** by enforcing aspect-ratio placeholders and Cloudinary Low-Quality Image Placeholders (LQIP).
* **NFR-PERF-03 (Asset Optimization & Artwork Integrity):** All artwork images automatically served in AVIF/WebP formats with quality auto-tuning (`q_auto, f_auto`). In compliance with CR-ART-01, artwork images must never be cropped or filled (`c_limit`/`c_fit` only).
* **NFR-A11Y-01 (Standards):** Full compliance with **WCAG 2.1 Level AA**.
* **NFR-A11Y-02 (Screen Readers & Alt Text):** All artwork images and the artist profile photo must feature meaningful, editable alternative text fields in the CMS. Providing AltText is mandatory prior to publishing an artwork, but drafts may be saved without it.
* **NFR-A11Y-03 (Keyboard Navigation):** All interactive elements (filters, modal galleries, forms) must be fully operable via keyboard tab navigation.
* **NFR-A11Y-04 (Color Contrast):** Minimum 4.5:1 text-to-background contrast ratio across all text elements.

### C. Mobile Responsiveness
* **NFR-MOBI-01 (Fluid Breakpoints):** Fully responsive layout adapting across mobile (375px+), tablet (768px+), desktop (1024px+), and ultra-wide screens (1440px - 2560px).
* **NFR-MOBI-02 (Touch Friendly):** Touch-target sizes for buttons, filters, and form inputs of at least 44x44px.

### D. Security & Data Protection
* **NFR-SEC-01 (Admin Protection):** Admin API endpoints secured with cryptographically signed JSON Web Tokens (JWT) or secure HTTP-only cookies.
* **NFR-SEC-02 (Credential Storage):** Admin passwords hashed with PBKDF2 / Argon2 / BCrypt with salt via ASP.NET Core PasswordHasher.
* **NFR-SEC-03 (Cloudinary Secrets):** Cloudinary API credentials kept strictly on the backend server; no secret keys exposed in client bundles.
* **NFR-SEC-04 (Form Spam Protection):** Public inquiry forms protected with invisible rate-limiting and honeypot field traps.

### E. Search Engine Optimization (SEO)
* **NFR-SEO-01 (Metadata):** Dynamic Open Graph (OG) tags, Twitter cards, and structured JSON-LD (`VisualArtwork`, `Person`) metadata generated per artwork and about page.
* **NFR-SEO-02 (Semantic HTML):** Semantic HTML5 document outline (`main`, `nav`, `article`, `figure`, `figcaption`).
