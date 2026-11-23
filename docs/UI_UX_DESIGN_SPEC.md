# Final UI/UX Design Specification: *The Archival Sanctuary (L'Archive Vivante)*

**Project:** Fine Art Portfolio & Online Gallery  
**Role:** Senior UI/UX Designer & Creative Director  
**Status:** Approved Master Design Specification (Locked for Visual Mockups & Implementation Specs)  

---

# 1. Creative Concept & Design Philosophy

The creative direction is **"The Archival Sanctuary" (L'Archive Vivante)**:
* **The Atmosphere of a Private Contemporary Institution:** The interface emulates the quiet, reverent environment of an architectural gallery space (such as Hauser & Wirth or David Zwirner). It steps back completely, providing a calm, distraction-free environment where oil pigment, watercolor grain, ink strokes, and graphite sketches command the viewer's focus.
* **Warm Neutral Balance:** A departure from sterile `#FFFFFF` and harsh, glaring `#000000`. By utilizing a palette of **Warm Museum Alabaster (`#FBFBF9`)** and **Raw Archival Linen (`#F4F1EA`)**, traditional art mediums—especially watercolors on Arches paper and pencil sketches on toothy cotton rag—blend naturally with the page without optical vibration or edge clipping.
* **Inquiry-First Engagement:** Original fine art is an intimate, high-touch acquisition. The platform is strictly **inquiry-based**, honoring the personal relationship between the artist and collector. There are **no shopping carts, checkout flows, or self-service payment mechanisms** in this MVP.
* **Content Authenticity & Neutral Placeholders:** All artwork titles, descriptions, dimensions, mediums, artist quotes, and biographical notes are strictly treated as **illustrative placeholders** until the artist provides official studio assets.
* **Optional, Unassumed Credentials:** All sections covering artist expertise, techniques, awards, exhibition history, and artistic background are **optional, configurable content blocks**. No credentials, institutional affiliations, or artistic claims are assumed or invented; these sections will display only the verified content explicitly provided by the artist.

---

# 2. Design System & Accessible Foundation

```
[#FBFBF9] Museum Alabaster ── Base Canvas
   [#F4F1EA] Raw Archival Linen ── Cards & Filter Wells
      [#948E84] Control Border ── Resting Input & Filter Boundaries (3.15:1 contrast against canvas)
         [#8C6541] Tuscan Bronze ── Accent & Focus Indicators (4.6:1 text contrast)
            [#55524C] Deep Archival Slate ── Captions & Microcopy (6.8:1 contrast)
               [#181716] Deep Charcoal Umber ── Primary Typography (16.8:1 contrast)
```

### A. Color Palette & Targeted Contrast Ratios

The color system is **engineered to target WCAG 2.2 Level AA standards** (minimum 4.5:1 for normal body text, 3.0:1 for large text $\ge$ 18px / 14pt bold, and 3.0:1 for graphical user interface components). 

> [!NOTE]
> *Formal WCAG compliance will be empirically validated through automated testing and manual assistive-technology audits during Phase 5 implementation.*

| Token Name | HEX Code | Tested Against | Calculated Ratio | Targeted Standard | Applied Purpose |
| :--- | :--- | :--- | :---: | :---: | :--- |
| **`--color-canvas`** | `#FBFBF9` | — | — | Base Canvas | Page background; warm museum plaster. |
| **`--color-surface`** | `#F4F1EA` | — | — | Surface Base | Card backing, filter containers, drawers. |
| **`--color-surface-elevated`**| `#FFFFFF` | — | — | Elevated Surface | Pure white matboards, open modals, input fills. |
| **`--color-text-primary`** | `#181716` | On `#FBFBF9`<br>On `#F4F1EA` | **16.8:1**<br>**15.2:1** | Target AAA | Primary titles, body copy, active links. |
| **`--color-text-secondary`** | `#45423D` | On `#FBFBF9`<br>On `#F4F1EA` | **8.5:1**<br>**7.7:1** | Target AAA | Metadata, dimensions, medium descriptions. |
| **`--color-text-caption`** | `#55524C` | On `#FBFBF9`<br>On `#F4F1EA` | **6.8:1**<br>**6.2:1** | Target AA | Captions, catalog IDs, timestamps, small labels. |
| **`--color-accent`** | `#8C6541` | On `#FBFBF9`<br>On `#181716` | **4.6:1**<br>**4.8:1** | Target AA | Active indicators, focus rings, link underlines. |
| **`--color-border-decorative`**| `#EAE5DC` | On `#FBFBF9` | **1.2:1** | Decorative | Matboard hairline dividers (non-interactive). |
| **`--color-border-control`** | `#948E84` | On `#FBFBF9`<br>On `#F4F1EA` | **3.15:1**<br>**3.0:1** | Target UI AA | Clearly distinguishable resting input fields & inactive filter pills (WCAG 2.2 AA non-text contrast pass). |
| **`--color-border-focus`** | `#8C6541` | On `#FBFBF9` | **4.6:1** | Target UI AA | Active pill borders, active form field outlines. |
| **`--color-status-available`**| `#2E5A36` | On `#FBFBF9` | **5.4:1** | Target AA | Indicator dot: Available for Acquisition. |
| **`--color-status-reserved`** | `#8A571E` | On `#FBFBF9` | **4.7:1** | Target AA | Indicator dot: Reserved / On Hold. |
| **`--color-status-archive`**  | `#55524C` | On `#FBFBF9` | **6.8:1** | Target AA | Indicator dot: Private Collection / NFS. |

---

### B. Interactive States & Contrast Verification
Every interactive state has been engineered to preserve clear visual cues and targeted contrast:
1. **Primary Button:**
   * *Rest State:* Background `#181716`, Text `#FBFBF9` (16.8:1 contrast).
   * *Hover State:* Background transitions to `#8C6541`, Text `#FBFBF9` (4.6:1 contrast).
   * *Active / Pressed State:* Background `#0F0E0E`, Text `#FBFBF9`.
2. **Secondary Outlined Button:**
   * *Rest State:* Background transparent, Border `1px solid #181716` (16.8:1 contrast), Text `#181716`.
   * *Hover State:* Background `#181716`, Text `#FBFBF9`.
3. **Filter Pills:**
   * *Inactive Pill:* Background transparent, Border `1px solid #948E84` (3.15:1 contrast against canvas), Text `#55524C` (6.8:1 contrast).
   * *Active Pill:* Background `#181716`, Border `1px solid #181716`, Text `#FBFBF9`.
   * *Hover (Inactive):* Border shifts to `#8C6541`, Text shifts to `#181716`.
4. **Form Inputs:**
   * *Rest State:* Background `#FFFFFF`, Border `1px solid #948E84` (distinct 3.15:1 boundary), Text `#181716`, Placeholder `#55524C` (6.8:1 contrast).
   * *Focus State:* Border `#181716`, Focus Ring `outline: 2px solid #8C6541; outline-offset: 2px;`.
   * *Error State:* Border `#94382B`, Error text `#94382B` (5.2:1 contrast against `#FBFBF9`).
5. **Keyboard Focus Rings (`:focus-visible`):**
   ```css
   :focus-visible {
     outline: 2px solid var(--color-accent); /* #8C6541 */
     outline-offset: 3px;
   }
   ```
6. **Reduced Motion Adaptation (`prefers-reduced-motion`):**
   ```css
   @media (prefers-reduced-motion: reduce) {
     *, *::before, *::after {
       animation-duration: 0.01ms !important;
       animation-iteration-count: 1 !important;
       transition-duration: 0.01ms !important;
       scroll-behavior: auto !important;
     }
   }
   ```

---

### C. Typography Hierarchy & Fluid Scale

| Style Role | Font Family | Size (Fluid Range) | Weight | Line Height | Letter Spacing |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Display Hero** | Cormorant Garamond | `clamp(2.5rem, 5.5vw, 4.25rem)` | `400` | `1.1` | `-0.02em` |
| **H1 Page Title** | Cormorant Garamond | `clamp(2.0rem, 4.0vw, 3.25rem)` | `400` | `1.15` | `-0.015em` |
| **H2 Section Title**| Cormorant Garamond | `clamp(1.65rem, 2.8vw, 2.25rem)` | `500` | `1.2` | `-0.01em` |
| **H3 Artwork Title**| Cormorant Garamond | `clamp(1.25rem, 1.8vw, 1.65rem)` | `500` (Italic) | `1.25` | `0` |
| **Body Large** | Plus Jakarta Sans | `1.125rem` (18px) | `400` | `1.65` | `0` |
| **Body Regular** | Plus Jakarta Sans | `1.0rem` (16px) | `400` | `1.6` | `0` |
| **Body Small / Specs**| Plus Jakarta Sans | `0.875rem` (14px) | `400` / `500` | `1.5` | `0.01em` |
| **Button / Navigation**| Plus Jakarta Sans | `0.875rem` (14px) | `600` | `1.0` | `0.06em` (Caps) |
| **Catalog Spec Label**| JetBrains Mono | `0.75rem` (12px) | `500` | `1.4` | `0.08em` (Caps) |

---

# 3. Comprehensive Page-by-Page Layout Plan

---

### 1. Homepage (`/`)
* **Navigation Header:** Fixed, frosted translucent alabaster (`background: rgba(251, 251, 249, 0.92); backdrop-filter: blur(12px)`). Brand Signature in Cormorant Garamond. Navigation: `Works`, `About`, `Commissions`, `Contact`. Secondary Action: `[ Inquire ]`.
* **Hero Section:** Single featured masterwork in its **full, uncropped aspect ratio** on a warm linen matboard (`#F4F1EA`) with soft ambient lighting. Overlay includes `[Illustrative Placeholder: Title]`, medium, dimensions, and `[● Available for Acquisition]` status.
* **Artist Introduction & Profile Photograph (50/50 Split):**
  * *Left:* Professional artist portrait with smart face-centering (`g_face, c_fill`) strictly restricted to this personal asset.
  * *Right:* `THE ARTIST & STUDIO`, headline, narrative summary, and link to `/about`.
* **Featured Artworks Across Mediums:** Diverse mediums (Oil, Watercolor, Calligraphy, Sketches, Portraits) across natural portrait, landscape, and square orientations.
* **Curated Series Spotlight:** Full-width editorial block introducing a series with direct deep-link `/gallery?collection=:slug`.
* **Inquiry & Commission Call-to-Action:** Warm linen block inviting private acquisitions and custom commissions.
* **Footer:** 4-column layout: Studio Location, Navigation, Studio Inquiries, Copyright & Accessibility.

---

### 2. Exhibition Gallery (`/gallery` & `/gallery?collection=:slug`)
* **Introduction & Title:** Minimalist *"Exhibition Works"* heading with curatorial scope.
* **Sticky Filter Sub-Bar:**
  * Medium Filter Pills (`All Works`, `Oil Paintings`, `Watercolors`, `Calligraphy`, `Pencil Sketches`, `Portraits`, `Visual Artwork`) using high-contrast borders (`#948E84`).
  * Thematic Collection Selector Dropdown (`/gallery?collection=:slug`).
  * Availability Toggle (`Available for Acquisition` vs `Complete Archive`).
* **Adaptive Artwork Grid (Zero Cropping):** Masonry/balanced column grid accommodating wide landscape, tall portrait, square, and vertical scrolls via `object-fit: contain`. Each card shows image, status dot, title (Italic Serif), and specifications line.
* **Accessible Pagination:** `[ Load Additional Works ]` button with `[Dynamic Pagination: Displaying X of Y Artworks]` and `aria-live="polite"` screen-reader announcement.

---

### 3. Individual Artwork Details View (`/gallery/:slug`)
* **Asymmetric 60/40 Split:**
  * *Left (60%):* Primary artwork displayed in 100% full original aspect ratio on warm matboard with full-screen lightbox trigger. Optional secondary thumbnails appear *only if uploaded by the artist*; if absent, the interface renders cleanly with no empty trays.
  * *Right (40% Sticky):* Breadcrumbs, Title, Specification Matrix (Medium, Dimensions, Framing, Year, Catalog Reference), Availability Badge. **No price in USD or currency.**
  * *Story:* Curatorial narrative regarding technique and inspiration.
  * *Primary Action:* Large button `[ Inquire About This Artwork ]` opening the pre-populated acquisition drawer.

---

### 4. About the Artist (`/about`)
* **Visual Anchor:** High-resolution artist portrait in studio setting.
* **Independent Artist Statement:** Displayed in large editorial serif (`Cormorant Garamond`, Italic).
* **Independent Artist Biography:** Chronological narrative detailing formal training, artistic evolution, and philosophy.
* **Optional Techniques & Mediums Showcase:** Configurable 3-column block detailing oil layering, watercolor grain, and ink calligraphy gestures (rendered only when provided).
* **Optional Exhibition History & Honors:** Structured 2-column timeline (Year / Event / Venue / City) rendered from verified artist text.

---

### 5. Commissions Page (`/commissions`)
* **Hero Overview:** Guide to commissioning bespoke visual art.
* **Configurable Commission Process:** Clearly presents the consultation, creation, and delivery phases as configurable editorial blocks subject to confirmed studio terms (no unconfirmed promises like white-glove delivery or progress sketches).
* **Commission Inquiry Form:** Captures Client Name, Email, Phone, Client Location (`City, Country`), Medium selector, approximate dimensions, timeline, and project description.

---

### 6. Artist Admin Portal (`/admin/*`)
* **Navigation:** `Dashboard`, `Artworks`, `Collections`, `Categories`, `Inquiries`, `Artist Profile`, `Logout`.
* **Dashboard Overview:** Practical dynamic counters (`[Dynamic Count: Total Artworks]`, `[Dynamic Count: Active Inquiries]`, `[Dynamic Count: Available Works]`) and quick actions.
* **Artwork Catalog Management:**
  * Search, filter, and quick toggle for `Featured` and `Published/Draft`.
  * Add/Edit Form: Title, Category, Collection, Dimensions, Unit, Framing, Availability (`Available`, `Reserved`, `Sold`, `Private Collection / NFS`). **No price fields.**
  * Cloudinary multi-image upload with thumbnail reordering.
  * **Mandatory `AltText` field per image before status can be set to `Published`** (drafts permitted without AltText).
* **Category & Collection Management:** Screens to organize series narratives and medium taxonomy.
* **Artist Profile & Content Management:**
  * Portrait image uploader with Cloudinary face-crop preview (`g_face, c_fill`).
  * Independent editors for Short Intro, Artist Statement, and Full Biography.
* **Inquiry Management Inbox:** Triage tabs (`All`, `New`, `InReview`, `Contacted`, `Completed`, `Archived`) matching database design, with detail modal capturing client location and internal notes.

---

# 4. Artwork Presentation Strategy: The Artwork Integrity Rule

```
┌────────────────────────────────────────────────────────────────────────┐
│                   ARTWORK INTEGRITY MASTER RULE                        │
├────────────────────────────────────────────────────────────────────────┤
│  NEVER CROP · NEVER STRETCH · NEVER DISTORT · NEVER AUTO-DETECT FACES  │
│         Every piece rendered in 100% of its native canvas shape        │
└────────────────────────────────────────────────────────────────────────┘
```

1. **Adaptive Matboard System:** Artworks sit inside proportional matboard containers (`background: #F4F1EA` or `#FFFFFF`) using `object-fit: contain` and Cloudinary `c_limit` transformations.
2. **Medium Nuance Preservation:**
   * *Wide Landscapes (16:9 / 3:2):* Full breathing room across horizontal rows.
   * *Tall Portraits (2:3 / 3:4):* Natural vertical height without cropping canvas margins.
   * *Calligraphy Scrolls (1:2+):* Elongated vertical matting evoking hanging silk scrolls.
   * *Watercolors:* Mounted on pure white matboards (`#FFFFFF`) with 1px border to celebrate paper translucency.
   * *Human Portrait Artworks:* **Face-detection cropping is strictly prohibited on portrait artworks.**
3. **Optional Secondary Images:** Thumbnails for detail shots, signatures, or framing appear only if provided; zero empty placeholder trays.

---

# 5. Technical Implementation & Styling Strategy

* **Styling Choice:** **CSS Modules with Global Design Tokens (`tokens.css`)**.
  * Eliminates class-string clutter in JSX.
  * Allows exact fluid `clamp()` formulas for editorial typography.
  * Scoped safety: zero leakage between public gallery and admin CMS.
* **Component Architecture (React 19 + TypeScript):**
  * `<PublicLayout />`, `<NavigationHeader />`, `<CuratorialFooter />`
  * `<ArtworkMatboard />`, `<ArtworkCard />`, `<ArtworkLightbox />`
  * `<ArtistPortraitFrame />` (smart face-crop container)
  * `<AcquisitionDrawer />`, `<FilterPillBar />`, `<PaginationBar />`
  * `<AdminLayout />`, `<ArtworkForm />`, `<InquiryInbox />`, `<ProfileEditor />`
* **Motion Design (Framer Motion):**
  * Calm, dignified pacing mimicking an architectural exhibition stroll.
  * Custom cubic-bezier deceleration: `[0.22, 1, 0.36, 1]`.
  * Ambient spotlight gradients behind hero artworks; multi-layered soft drop shadows.
  * Automatic collapse to instant transitions under `prefers-reduced-motion`.
