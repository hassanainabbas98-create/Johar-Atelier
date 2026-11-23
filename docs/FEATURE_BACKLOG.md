# Feature Backlog & MoSCoW Prioritization

## 1. Overview
This backlog delineates all product features, establishing a strict boundary between the **Minimum Viable Product (MVP)** and future expansion phases.

Prioritization uses the **MoSCoW** framework:
* **Must Have (M):** Critical for launch. Non-negotiable core functionality.
* **Should Have (S):** High priority, scheduled for Phase 2 immediately after MVP stabilization.
* **Could Have (C):** Desirable enhancements if time and resources permit (e.g., 3D visualization, deep zoom).
* **Won't Have for Now (W):** Explicitly excluded from initial development until the client confirms business readiness (e.g., online payment processing, shopping cart).

---

## 2. Must Have (MVP Scope)

| Feature ID | Feature Name | Description | Acceptance Criteria |
| :--- | :--- | :--- | :--- |
| **M-01** | **Artist Profile Picture Display** | Display the artist's professional portrait on the Homepage introduction and About page. | • Homepage shows portrait in artist intro section.<br>• About page displays portrait alongside full biography and artist statement.<br>• Responsive cropping with face-detection centering (`g_face, c_fill`) permitted strictly for portrait.<br>• Fully responsive across mobile and desktop. |
| **M-02** | **Admin Profile Picture Management** | Allow the artist to upload, preview, and replace their profile photograph in the admin panel. | • Admin can upload single high-res image via Cloudinary.<br>• Automatic optimization and CDN delivery.<br>• Instant preview before and after saving.<br>• Updates both Homepage and About page dynamically. |
| **M-03** | **Responsive Gallery & Filters** | Filterable grid of artworks organized by medium and collection. | • Supports Oil, Watercolor, Calligraphy, Sketches, Portraits, Visual Design, and Curated Collections.<br>• Instant client-side or fast API filtering.<br>• Fast image lazy loading with blur-up placeholders. |
| **M-04** | **Artwork Detail View** | Comprehensive view of an individual artwork. | • Displays high-res photography strictly preserving full composition (Artwork Integrity Policy: no cropping).<br>• Lists title, medium, dimensions, year, framing status, and availability.<br>• Operates on pure inquiry model (prices strictly excluded from MVP).<br>• Prominent "Inquire" button. |
| **M-05** | **Contextual Artwork Inquiry** | Acquisition inquiry form linked to specific artwork. | • Pre-populates artwork title and ID.<br>• Captures name, email, phone, client location (City/Country), and inquiry message.<br>• Validates inputs and sends email alert to artist.<br>• Persists record in SQL database. |
| **M-06** | **Commission Request Form** | Structured request form for custom artwork. | • Fields for preferred medium, dimensions, budget range, timeline, and description.<br>• Confirmation message displayed upon submission.<br>• Persists in database and categorized as `Commission`. |
| **M-07** | **Artist Biography & Statement (About Page)** | Showcase independent artist statement, biographical narrative, and heritage. | • Features artist portrait and editorial typography.<br>• Independent fields for Artist Statement (creative philosophy) and Biography.<br>• Curated exhibition history structured narrative.<br>• Fully responsive and readable. |
| **M-08** | **General Contact Page** | General inquiry form and studio contact information. | • Name, email, subject, message fields.<br>• Studio city and email links.<br>• Spam protection via honeypot and rate limiting. |
| **M-09** | **Secure Artist Admin Login** | Single-user authentication for the artist. | • Secure password verification using ASP.NET Core password hashing.<br>• Protected JWT or secure cookie session.<br>• Unauthorized requests blocked with HTTP 401/403. |
| **M-10** | **Artwork Management (CRUD)** | Full catalog management for the artist. | • Form to Add, Edit, Delete artworks.<br>• Toggle "Featured" and "Published" status.<br>• Form validation: AltText is mandatory before setting to Published (drafts permitted without AltText). |
| **M-11** | **Cloudinary Media Upload** | Simple server-side image upload pipeline. | • Admin uploads images via backend endpoint.<br>• Strict enforcement of the Artwork Integrity Transformation Policy (`c_limit`, 100% full composition preserved, no auto-cropping).<br>• Multiple images per artwork (primary thumbnail + detail shots). |
| **M-12** | **Inquiry Inbox & Triage** | Admin interface to review customer messages. | • Table view showing all inquiries with status pills.<br>• Captures Client Location for international fine art shipping assessment.<br>• Filter by type: Artwork vs. Commission vs. General.<br>• Status transitions: `New`, `InReview`, `Contacted`, `Completed`, `Archived`. |

---

## 3. Should Have (Phase 2 - Post-MVP Enhancements)

| Feature ID | Feature Name | Description | Benefit |
| :--- | :--- | :--- | :--- |
| **S-01** | **Dynamic Exhibitions & CV Manager** | Dynamic timeline activating the pre-modeled `Exhibitions` database entity with admin CRUD screens (in MVP, exhibitions are managed as formatted text). | Allows the artist to maintain an up-to-date CV without editing code. |
| **S-02** | **Collector Testimonials Engine** | Curated quote management activating the pre-modeled `Testimonials` database entity. | Builds trust and social proof for high-value commission inquiries. |
| **S-03** | **Social Media Open Graph Sharing** | Dynamic preview cards when artwork links are shared on WhatsApp, Instagram, or Pinterest. | Enhances virality and professional presentation when sharing works. |
| **S-04** | **Studio Newsletter Subscription** | Simple email capture for exhibition invites and new series announcements. | Builds a private collector mailing list. |
| **S-05** | **Export Inquiries to CSV** | Button in admin to export client inquiries for offline CRM or accounting. | Simplifies record-keeping for taxes and client tracking. |

---

## 4. Could Have (Phase 3 - Exploratory & Advanced Features)

| Feature ID | Feature Name | Description | Feasibility & Notes |
| :--- | :--- | :--- | :--- |
| **C-01** | **"View in Virtual Room" (3D / 2.5D)** | Interactive tool displaying the artwork to scale on a curated gallery wall or living room interior. | Deferred from MVP to protect performance and launch velocity. Can be built using Three.js / React Three Fiber. |
| **C-02** | **Deep-Zoom Canvas Inspector** | Interactive high-resolution magnifying viewer for inspecting brushstrokes and ink textures. | Requires OpenSeadragon or deep zoom image tiling. Useful for calligraphy and textured oils. |
| **C-03** | **Subtle 3D Parallax & Tilt Effects** | Mouse-tracking perspective tilt on featured canvas cards. | Subtle interactive polish using Framer Motion 3D transforms with mobile fallbacks. |
| **C-04** | **Multi-Language Support** | Internationalization (e.g., English + French / Arabic / Mandarin). | Useful if the artist has significant international or regional collector bases. |

---

## 5. Won't Have for Now (Explicitly Excluded from MVP)

| Feature ID | Excluded Feature | Reason for Exclusion |
| :--- | :--- | :--- |
| **W-01** | **Online Shopping Cart & Checkout** | Original fine art is rarely sold via self-service shopping carts. Direct inquiry preserves personal relationship and customized shipping. |
| **W-02** | **Payment Gateway Integration (Stripe/PayPal)** | High-value artwork transactions frequently involve bank transfers, bespoke framing, or staged commission deposits. Deferred until client specifically requests. |
| **W-03** | **Customer Account Registration** | Creates unnecessary barrier to entry for prospective art buyers; inquiries should require zero account creation. |
| **W-04** | **Automated Shipping & Customs Calculators** | Fine art crating and international insurance vary heavily based on medium, weight, and destination; automated tools frequently misquote. |
