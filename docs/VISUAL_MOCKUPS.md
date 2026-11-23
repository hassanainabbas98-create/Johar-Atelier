# Visual Mockups & Page Concepts Specification

**Project:** Master Fine Art Portfolio & Curatorial Gallery  
**Design Direction:** *The Archival Sanctuary (L'Archive Vivante)*  
**Status:** Visual Page Concepts for Core Screens (Pre-Coding Verification)  

---

## Overview & Inspection Guide
This document details the visual layouts, spatial proportions, component arrangements, and responsive behaviors for the **5 Core Screens** of the platform:
1. **Screen 1: Homepage (`/`)** — Editorial hero, 50/50 artist intro, multi-medium highlights, collection spotlight, inquiry CTA.
2. **Screen 2: Exhibition Gallery (`/gallery` & `/gallery?collection=:slug`)** — Sticky filter bar, adaptive multi-aspect grid (zero cropping), accessible pagination.
3. **Screen 3: Artwork Detail Page (`/gallery/:slug`)** — 60/40 curatorial split, uncropped primary work on warm matboard, absence of secondary images handled cleanly, inquiry drawer.
4. **Screen 4: About Page (`/about`)** — Studio portrait, independent statement & biography, optional technique and exhibition blocks.
5. **Screen 5: Atelier Admin CMS (`/admin/*`)** — Operational dashboard, artwork management (AltText mandate, NO prices), category & collection navigation, artist profile editor, and inquiry inbox.

---

# Screen 1: Homepage (`/`)

### 1.1. Spatial Schematic & Layout Structure
```
┌──────────────────────────────────────────────────────────────────────────────────┐
│ [Brand Signature: Artist Name]         Works   About   Commissions   Contact   [Inquire] │
├──────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│   FEATURED WORK — 2026                                                           │
│   "Nocturne in Ochre & Gold"                                                     │
│   Oil on Belgian linen · 120 × 160 cm · [● Available for Acquisition]             │
│                                                                                  │
│   ┌──────────────────────────────────────────────────────────────────────────┐   │
│   │                                                                          │   │
│   │                                                                          │   │
│   │                      MASTER OIL PAINTING CANVAS                          │   │
│   │                      (Full 4:3 Composition Uncropped)                    │   │
│   │                      Mounted on Linen Matboard (#F4F1EA)                 │   │
│   │                                                                          │   │
│   │                                                                          │   │
│   └──────────────────────────────────────────────────────────────────────────┘   │
│                                                                                  │
│                                [ Explore Artwork Details → ]                     │
│                                                                                  │
├──────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│   THE ARTIST & STUDIO (50/50 Asymmetric Split)                                   │
│                                                                                  │
│   ┌─────────────────────────────┐   "A dialogue between disciplined ink          │
│   │                             │    and untamed pigment."                       │
│   │   ARTIST STUDIO PORTRAIT    │                                                │
│   │   (Smart face-centering     │   [Illustrative Placeholder: 2 curated         │
│   │    crop: g_face, c_fill)    │    paragraphs introducing the artist's         │
│   │                             │    training, mastery of traditional media,     │
│   │   Linen Matboard (#F4F1EA)  │    and dedication to physical craft.]          │
│   │   Control Border (#948E84)  │                                                │
│   │                             │   Read Complete Biography & Statement →        │
│   └─────────────────────────────┘                                                │
│                                                                                  │
├──────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│   SELECTED WORKS ACROSS MEDIUMS                                                  │
│   "Exploring the breadth of traditional and contemporary disciplines"            │
│                                                                                  │
│   ┌──────────────────┐   ┌───────────────────────┐   ┌───────────────────────┐   │
│   │  CALLIGRAPHY     │   │  WATERCOLOR           │   │  PENCIL SKETCH        │   │
│   │  TALL SCROLL     │   │  WIDE LANDSCAPE       │   │  SQUARE STUDY         │   │
│   │  (1:2 Ratio)     │   │  (16:9 Ratio)         │   │  (1:1 Ratio)          │   │
│   │  Ink on Rice     │   │  Pure White Matboard  │   │  Graphite on Cotton   │   │
│   │  Paper           │   │  Arches Cold-Press    │   │  Archival Paper       │   │
│   └──────────────────┘   └───────────────────────┘   └───────────────────────┘   │
│                                                                                  │
├──────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│   SERIES SPOTLIGHT: [Illustrative Placeholder: Thematic Series Title]            │
│   A curated thematic exploration of silence, mineral pigments, and light.        │
│   [ View This Collection in Gallery (/gallery?collection=series-slug-placeholder) → ] │
│                                                                                  │
├──────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│   ┌──────────────────────────────────────────────────────────────────────────┐   │
│   │   PRIVATE ACQUISITIONS & BESPOKE COMMISSIONS                             │   │
│   │   "Bringing original, tactile art into distinguished living spaces."      │   │
│   │                                                                          │   │
│   │          [ Request a Commission ]        [ Contact the Studio ]          │   │
│   └──────────────────────────────────────────────────────────────────────────┘   │
│                                                                                  │
├──────────────────────────────────────────────────────────────────────────────────┤
│ Studio: City, Country · Direct Inquiries · © 2026 Artist Name · All Rights Res. │
└──────────────────────────────────────────────────────────────────────────────────┘
```

### 1.2. Design Decisions & Spacing Details
* **Hero Section:** Features a `min-height: 88vh` breathing canvas. The masterpiece image uses `max-height: 65vh` and `width: auto` inside a soft linen matboard container (`#F4F1EA`) with an ambient radial glow (`radial-gradient(circle at 50% 30%, rgba(244, 241, 234, 0.9) 0%, rgba(251, 251, 249, 0) 75%)`).
* **Artist Introduction:** A 50/50 grid on desktop collapsing into a single stacked column on mobile. The artist portrait container maintains a 4:5 vertical proportion (`aspect-ratio: 4/5`) with Cloudinary `g_face, c_fill` centering.
* **Medium Rhythm:** Rather than a uniform 3-card row, the layout staggers a vertical calligraphy scroll next to a wide landscape watercolor, demonstrating natural aspect ratios right on the homepage.

---

# Screen 2: Exhibition Gallery (`/gallery` & `/gallery?collection=:slug`)

### 2.1. Spatial Schematic & Layout Structure
```
┌──────────────────────────────────────────────────────────────────────────────────┐
│ [Brand Signature]                      Works   About   Commissions   Contact     │
├──────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│   Exhibition Catalog                                                             │
│   An archive of original visual works across traditional & contemporary mediums  │
│                                                                                  │
│ ┌──────────────────────────────────────────────────────────────────────────────┐ │
│ │ STICKY FILTER BAR                                                            │ │
│ │                                                                              │ │
│ │ Medium: [ ALL ] [ Oil Paintings ] [ Watercolors ] [ Calligraphy ]            │ │
│ │         [ Pencil Sketches ] [ Portraits ] [ Visual Artwork ]                 │ │
│ │                                                                              │ │
│ │ Collection: [ All Thematic Collections ▾ ]   Availability: [● Available Only]│ │
│ └──────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                  │
│ ADAPTIVE MULTI-ASPECT ARTWORK GRID (Zero Cropping · Natural Proportions)         │
│                                                                                  │
│ ┌─────────────────────────┐  ┌─────────────────────────┐  ┌────────────────────┐ │
│ │ ┌─────────────────────┐ │  │ ┌─────────────────────┐ │  │ ┌────────────────┐ │ │
│ │ │                     │ │  │ │                     │ │  │ │                │ │ │
│ │ │  WIDE LANDSCAPE     │ │  │ │  TALL PORTRAIT      │ │  │ │  TALL          │ │ │
│ │ │  OIL PAINTING       │ │  │ │  WATERCOLOR         │ │  │ │  CALLIGRAPHY   │ │ │
│ │ │  (16:9 Native)      │ │  │ │  (3:4 Native)       │ │  │ │  SCROLL        │ │ │
│ │ │                     │ │  │ │                     │ │  │ │  (1:2 Native)   │ │ │
│ │ └─────────────────────┘ │  │ │                     │ │  │ │                │ │ │
│ │ [● Available]           │  │ └─────────────────────┘ │  │ │                │ │ │
│ │ Title in Italic Serif   │  │ [● Available]           │  │ └────────────────┘ │ │
│ │ Medium · 90 × 140 cm    │  │ Title in Italic Serif   │  │ [○ Private Coll.]  │ │
│ │ Inquire About Piece →   │  │ Medium · 70 × 50 cm     │  │ Title in Italic    │ │
│ └─────────────────────────┘  │ Inquire About Piece →   │  │ Ink · 120 × 40 cm  │ │
│                              └─────────────────────────┘  │ Inquire →          │ │
│                                                           └────────────────────┘ │
│ ┌─────────────────────────┐  ┌─────────────────────────┐                         │
│ │ ┌─────────────────────┐ │  │ ┌─────────────────────┐ │                         │
│ │ │  SQUARE CHARCOAL    │ │  │ │  PORTRAIT STUDY     │ │                         │
│ │ │  SKETCH             │ │  │ │  OIL ON CANVAS      │ │                         │
│ │ │  (1:1 Native)       │ │  │ │  (4:5 Native)       │ │                         │
│ │ └─────────────────────┘ │  │ └─────────────────────┘ │                         │
│ │ [● Available]           │  │ [● Available]           │                         │
│ │ Title in Italic Serif   │  │ Title in Italic Serif   │                         │
│ │ Graphite · 45 × 45 cm   │  │ Oil · 60 × 48 cm        │                         │
│ └─────────────────────────┘  └─────────────────────────┘                         │
│                                                                                  │
│                     ┌────────────────────────────────────┐                       │
│                     │      Load Additional Works         │                       │
│                     └────────────────────────────────────┘                       │
│               [Dynamic Pagination: Displaying 12 of 36 Artworks]                 │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

### 2.2. Interactive Filter & Border Boundaries
* **Distinct Interactive Boundaries:** Inactive filter pills and resting form controls use `border: 1px solid #948E84` (3.15:1 contrast against canvas `#FBFBF9`), completely satisfying WCAG 2.2 AA non-text contrast requirements.
* **Active Filter Pill:** Filled with `#181716` and text `#FBFBF9`.
* **Zero Image Cropping:** Cards do not force images into square aspect ratios. Each image is wrapped in a container with `background: #F4F1EA`, `padding: 16px`, and uses `object-fit: contain`. A landscape piece renders wide; a calligraphy scroll renders tall and slender.
* **Accessible Pagination:** The "Load Additional Works" button is a full-width or centered accessible control with `aria-live="polite"` announcing new items loaded.

---

# Screen 3: Artwork Detail Page (`/gallery/:slug`)

### 3.1. Spatial Schematic & Layout Structure (60/40 Curatorial Split)
```
┌──────────────────────────────────────────────────────────────────────────────────┐
│ [Brand Signature]             < Return to Gallery / Oil Paintings                │
├──────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│   PRIMARY ARTWORK DISPLAY (60%)          CURATORIAL SPECIFICATIONS (40% STICKY) │
│                                                                                  │
│ ┌──────────────────────────────────────┐  Gallery / Oil Paintings / Untitled     │
│ │                                      │                                         │
│ │                                      │  [Illustrative Placeholder: Title]      │
│ │                                      │  Cormorant Garamond, 36px, Italic       │
│ │                                      │                                         │
│ │       FULL ORIGINAL MASTERPIECE      │  STATUS                                 │
│ │         (100% Native Aspect)         │  [● Available for Acquisition]          │
│ │                                      │                                         │
│ │        object-fit: contain           │  SPECIFICATIONS                         │
│ │       Cloudinary c_limit Mode        │  ─────────────────────────────────────  │
│ │                                      │  Medium:   Oil & natural pigment on     │
│ │                                      │            Belgian linen                │
│ │                                      │  Dimensions: 100.0 × 140.0 cm           │
│ │                                      │  Framing:  Bespoke raw oak frame        │
│ │                                      │  Year:     2026                         │
│ │                                      │  Ref Code: REF #2026-OIL-002            │
│ │                                      │                                         │
│ └──────────────────────────────────────┘  THE STORY BEHIND THE PIECE             │
│   [ ⛶ Click to inspect in Fullscreen ]    ─────────────────────────────────────  │
│                                           [Illustrative Placeholder: Curatorial  │
│   (Optional secondary thumbnails tray     narrative explaining brush technique,  │
│    appears ONLY if provided by artist;    pigment grinding, and concept...]      │
│    cleanly omitted when only 1 photo)                                            │
│                                           ┌───────────────────────────────────┐  │
│                                           │    INQUIRE ABOUT THIS ARTWORK     │  │
│                                           └───────────────────────────────────┘  │
│                                           No obligation · Direct artist dialogue │
├──────────────────────────────────────────────────────────────────────────────────┤
│ RELATED WORKS IN THIS MEDIUM / SERIES                                            │
│ [Card 1: Landscape]       [Card 2: Study]          [Card 3: Composition]         │
└──────────────────────────────────────────────────────────────────────────────────┘
```

### 3.2. Absence of Optional Secondary Images & Acquisition Drawer
* **Graceful Degradation:** If the artist uploads only one master photograph, the left column simply presents the single framed master asset. No empty thumbnail boxes or blank sliders are rendered.
* **Contextual Acquisition Drawer:** Clicking `[ INQUIRE ABOUT THIS ARTWORK ]` triggers a smooth Framer Motion drawer from the right edge (`width: min(520px, 100vw)`). It displays a micro-thumbnail of the piece, the title, and fields: Name, Email, Phone, Client Location (`City, Country`), and Message. No price in USD is shown.

---

# Screen 4: About the Artist (`/about`)

### 4.1. Spatial Schematic & Layout Structure
```
┌──────────────────────────────────────────────────────────────────────────────────┐
│ [Brand Signature]                      Works   About   Commissions   Contact     │
├──────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│   THE ARTIST & PRACTICE                                                          │
│                                                                                  │
│ ┌──────────────────────────────────────────────────────────────────────────────┐ │
│ │                                                                              │ │
│ │   ┌──────────────────────────────┐   THE ARTIST STATEMENT                    │ │
│ │   │                              │   (Independent Managed Field)             │ │
│ │   │   LARGE STUDIO PORTRAIT      │                                           │ │
│ │   │   (Working at the easel /    │   "My practice explores the quiet         │ │
│ │   │    ink table in natural      │    convergence between physical resistance│ │
│ │   │    studio light)             │    and poetic intent. Each medium         │ │
│ │   │                              │    imposes its own discipline..."         │ │
│ │   │   Cloudinary: g_face, c_fill │                                           │ │
│ │   │   Warm Matboard (#F4F1EA)    │   — [Illustrative Placeholder: Artist]    │ │
│ │   │                              │                                           │ │
│ │   └──────────────────────────────┘   BIOGRAPHY & BACKGROUND                  │ │
│ │                                      (Independent Managed Field)             │ │
│ │                                      [Illustrative Placeholder: Comprehensive│ │
│ │                                       narrative detailing the artist's early │ │
│ │                                       classical training, mastery across     │ │
│ │                                       six traditional mediums, and modern    │ │
│ │                                       explorations.]                         │ │
│ └──────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                  │
│   STUDIO DISCIPLINES & TECHNIQUES (Optional Configurable Section)                │
│   ────────────────────────────────────────────────────────────────────────────   │
│   ┌──────────────────────┐  ┌──────────────────────┐  ┌──────────────────────┐   │
│   │ PIGMENT & OIL        │  │ WATER & GRAIN        │  │ INK & CALLIGRAPHY    │   │
│   │ Layered glazes on    │  │ Unpredictable washes │  │ Single-breath brush  │   │
│   │ Belgian linen.       │  │ on Arches paper.     │  │ precision.           │   │
│   └──────────────────────┘  └──────────────────────┘  └──────────────────────┘   │
│                                                                                  │
│   SELECTED EXHIBITIONS & HONORS (Optional Structured-Text Narrative)             │
│   ────────────────────────────────────────────────────────────────────────────   │
│   2026   Contemporary Ink & Form        National Arts Gallery, London (Group)    │
│   2025   Solitude & Horizon (Solo)      Atelier Gallery, Paris                   │
│   2024   The Discipline of Charcoal     Fine Arts Pavilion, Kyoto                │
│                                                                                  │
│   ┌──────────────────────────────────────────────────────────────────────────┐   │
│   │ INITIATE A STUDIO DIALOGUE                                               │   │
│   │ Inquiries regarding gallery representation, exhibitions, or acquisitions │   │
│   │                     [ Contact Studio Management ]                        │   │
│   └──────────────────────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────────────────────┘
```

### 4.2. Uninvented Credentials & Decoupled Fields
* **Decoupled Architecture:** The **Artist Statement** (creative philosophy) and the **Biography** (career narrative) sit in independent typographic blocks.
* **Collapsible Optionality:** If the artist does not provide exhibition history or technical blurbs, these sections cleanly collapse without leaving visual gaps.

---

# Screen 5: Atelier Admin CMS (`/admin/*`)

### 5.1. Spatial Schematic: Dashboard & Catalog Management
```
┌──────────────────────────────────────────────────────────────────────────────────┐
│  ATELIER CMS   │  Dashboard   Artworks   Collections   Categories   Inquiries   Profile  │ [Logout]
├──────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│   ATELIER OVERVIEW                                              [ + Add Artwork ]│
│                                                                                  │
│   ┌─────────────────────────┐  ┌─────────────────────────┐  ┌─────────────────┐ │
│   │ TOTAL ARTWORKS          │  │ ACTIVE INQUIRIES        │  │ AVAILABLE WORKS │ │
│   │ [Dynamic Count: 42]     │  │ [Dynamic Count: 3 New]  │  │ [Dynamic: 18]   │ │
│   └─────────────────────────┘  └─────────────────────────┘  └─────────────────┘ │
│                                                                                  │
│   ARTWORK CATALOG                                                                │
│   Search: [ Search by title...      ]  Category: [ All ▾ ]  Status: [ All ▾ ]    │
│                                                                                  │
│   ┌─────┬──────────────────────┬──────────────┬─────────────┬───────────┬──────┐ │
│   │ THM │ TITLE                │ CATEGORY     │ DIMENSIONS  │ STATUS    │ ACT. │ │
│   ├─────┼──────────────────────┼──────────────┼─────────────┼───────────┼──────┤ │
│   │ [■] │ Nocturne in Charcoal │ Sketches     │ 42 × 59 cm  │ Available │ Edit │ │
│   │ [■] │ Solitude in Ochre    │ Oil Painting │ 120 × 160 cm│ Reserved  │ Edit │ │
│   │ [■] │ Breath of the Brush  │ Calligraphy  │ 140 × 45 cm │ Available │ Edit │ │
│   └─────┴──────────────────────┴──────────────┴─────────────┴───────────┴──────┘ │
│                                                                                  │
├──────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│   MODAL / SCREEN: [ ADD / EDIT ARTWORK ]                                         │
│                                                                                  │
│   Title:       [ Nocturne in Charcoal                              ]             │
│   Category:    [ Pencil Sketches ▾ ]    Collection: [ Series Placeholder ▾ ]          │
│   Dimensions:  Height: [ 42.0 ] Width: [ 59.4 ] Depth: [ — ] Unit: [ cm ▾ ]      │
│   Framing:     [x] Framed by Artist     Year: [ 2026 ]                           │
│   Status:      [ Available ▾ ] (Available / Reserved / Sold / NFS)               │
│                                                                                  │
│   CLOUDINARY IMAGE UPLOAD (Strict Non-Cropping Rule Enforced)                    │
│   ┌──────────────────────────────────────────────────────────────────────────┐   │
│   │  [+] Drag & drop master photographs (Max 15MB · JPG, PNG, WebP)          │   │
│   └──────────────────────────────────────────────────────────────────────────┘   │
│   Primary Photo: [ Thumbnail A ] [Set as Primary]                                │
│   * AltText:     [ Detailed graphite sketch on toothy archival cotton paper]     │
│                  (MANDATORY BEFORE PUBLISHING · May save as draft without)       │
│                                                                                  │
│   Curatorial Story / Narrative:                                                  │
│   [ Enter background story regarding creation, inspiration, and technique...  ]  │
│                                                                                  │
│   Visibility:  ( ) Save as Draft    (•) Publish to Live Gallery                  │
│                                                                                  │
│                [ Cancel ]                 [ Save & Publish Artwork ]             │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

### 5.2. Admin Profile & Inquiry Management Screens
* **Artist Profile Editor (`/admin/profile`):**
  * Displays current profile picture alongside side-by-side previews of Homepage and About page crops.
  * Drag-and-drop Cloudinary uploader with `g_face, c_fill` preview (restricted to portrait).
  * Independent rich-text editors for: (1) Short Homepage Intro, (2) Artist Statement, and (3) Full Biography.
* **Inquiry Management Inbox (`/admin/inquiries`):**
  * Triage tabs aligned with approved database design: `All`, `New`, `InReview`, `Contacted`, `Completed`, `Archived`.
  * Detail View shows: Client Name, Email, Phone, Client Location (`City, Country`), Associated Artwork thumbnail and reference code, Client Brief, and Internal Artist Notes field.
* **Absolute Exclusion of Price:** There are **zero price fields or USD currency inputs** on the Add/Edit artwork screen.
