# Sitemap & Information Architecture

## 1. Overview
The website architecture is divided into two distinct zones:
1. **The Public Gallery Experience:** Designed for collectors, patrons, curators, and clients. Focused on immersion, discovery, and conversion into inquiries.
2. **The Artist Admin Workspace:** A secure, streamlined management hub designed for fast catalog curation, inquiry management, and profile updates.

---

## 2. Public Site Map

```
/ (Homepage)
├── Hero Section (Featured Masterpiece Showcase & Artist Statement Hook)
├── Artist Introduction Section (Featured Artist Portrait & Brief Philosophy)
├── Curated Highlights (Featured Works across Mediums)
├── Thematic Collections Spotlight
└── Inquiries & Commissions Call-to-Action

/gallery (Full Catalog & Exhibition View)
├── Medium Filters:
│   ├── All Works
│   ├── Oil Paintings
│   ├── Watercolors
│   ├── Calligraphy
│   ├── Pencil Sketches
│   ├── Portraits
│   └── Visual Artwork & Design
├── Curated Collection Filters:
│   ├── All Series
│   └── Filter by Thematic Collection (e.g., /gallery?collection=series-slug-placeholder)
├── Status Filters:
│   ├── All
│   ├── Available for Acquisition
│   └── Archive / Private Collection
└── /gallery/:slug (Individual Artwork Details View)
    ├── High-Resolution Image Carousel (Full composition preserved, zero cropping)
    ├── Artwork Specifications (Medium, Dimensions, Year, Framing)
    ├── Narrative & Creative Process Story
    ├── Availability Status (Available, Reserved, Private Collection / NFS · pure inquiry model)
    ├── "Acquire / Inquire About This Piece" Action Modal
    └── Related Works in the Same Collection / Medium

/collections (Thematic Series Spotlight)
└── Curated collection cards linking directly to the filtered gallery view (/gallery?collection=:slug)
    with curatorial narrative and series overview

/about (Artist Profile & Heritage)
├── Artist Portrait Photograph (Prominent, High-Resolution Studio/Working Shot)
├── Artist Statement (Creative philosophy, concepts, and personal intent)
├── Biography & Background Narrative (Training, artistic evolution)
├── Mediums & Mastered Techniques
└── Selected Exhibitions & Honors (Curated structured narrative for MVP; Phase 2 dynamic timeline)

/commissions (Bespoke Commission Guide)
├── Commissioning Process Explanation (Consultation -> Concept -> Creation -> Delivery)
├── Portfolio of Past Commissions & Portraits
└── Commission Request Form (Medium selection, dimensions, budget, timeline, notes)

/contact (Studio Inquiries & Representation)
├── Studio Location / City & Working Hours
├── Direct Contact Form (General questions, press, representation)
└── Direct Email & Verified Social Channels
```

---

## 3. Artist Admin Portal Site Map

All admin routes are protected by authentication guards (`/admin/*`).

```
/admin/login (Artist Authentication)
└── Secure Email & Password Form with Rate Limiting

/admin/dashboard (Overview & Pulse)
├── Metrics Summary (Total Artworks, Active Inquiries, Available Pieces)
├── Quick Actions (Add Artwork, Update Profile Photo, Review Inquiries)
└── Recent Inquiry Notifications

/admin/artworks (Catalog Management)
├── Artwork Listing Table (Thumbnail, Title, Category, Year, Status, Featured Toggle)
├── Search, Filter by Category, and Sort by Creation Date
├── /admin/artworks/new (Add Artwork Screen)
│   ├── Basic Info (Title, Medium, Category, Collection, Year)
│   ├── Physical Specifications (Dimensions, Unit, Framing)
│   ├── Availability Status (Available, Reserved, Sold, NFS - Pricing excluded from MVP)
│   ├── Narrative Description
│   ├── Cloudinary Multi-Image Upload & Drag-and-Drop Order
│   └── Image Alt-Text Specification (Mandatory before setting status to "Published"; optional for "Drafts")
└── /admin/artworks/:id/edit (Edit Artwork Screen)
    └── Update attributes, manage AltText per image, replace images, delete artwork

/admin/collections (Collections & Series Organization)
├── Create New Collection / Series
└── Assign or reorder artworks within series

/admin/categories (Medium Taxonomy)
└── Manage primary medium tags (Oil, Watercolor, Calligraphy, etc.)

/admin/inquiries (Inquiry Inbox)
├── Filter by Type (Artwork Inquiries, Commission Requests, General)
├── Filter by Status (`New`, `In Review`, `Contacted`, `Completed`, `Archived`)
└── /admin/inquiries/:id (Inquiry Detail View)
    ├── Client Name, Email, Phone Number, Client Location (City/Country)
    ├── Associated Artwork Reference (if applicable)
    ├── Full Message & Commission Parameters
    └── Status Update Controls & Internal Artist Notes

/admin/profile (Artist Identity & Media Management)
├── Artist Profile Picture Management:
│   ├── Current Profile Image Display (Home & About preview)
│   ├── Upload / Replace Photograph via Cloudinary
│   ├── Automated Face-Detection Cropping (`g_face, c_fill`) Preview (Restricted solely to portrait)
│   └── Profile Image Alt Text Specification
├── Short Homepage Intro Editing
├── Independent Artist Statement Editing (Creative philosophy & vision)
├── Full Biography & Background Narrative Editing (Training, CV narrative)
└── Studio Contact Details & Social Media Links
```

---

## 4. Key Navigation Elements & Interaction Patterns

### A. Public Navigation Bar (Desktop & Mobile)
* **Desktop Header:** Fixed/translucent header with subtle blur backdrop (`backdrop-filter`).
  * Links: `Gallery`, `Collections`, `About`, `Commissions`, `Contact`.
  * Secondary Action: High-visibility "Inquire" button.
* **Mobile Drawer Navigation:** Full-screen overlay triggered by hamburger icon with smooth Framer Motion stagger transitions, keeping touch targets generous (minimum 48px).

### B. Contextual In-Page Modals
1. **Acquire Piece Modal:** When clicked on `/gallery/:slug`, opens a lightweight inquiry drawer/modal pre-loaded with the artwork title, reference ID, and thumbnail.
2. **Commission Request Drawer:** Accessible from the header or dedicated commissions page, streamlining the client brief submission.
3. **Artwork Image Lightbox:** Full-screen minimal viewing mode to examine details without UI distractions.

### C. Admin Workspace Usability
* **Persistent Sidebar:** Quick switching between `Dashboard`, `Artworks`, `Collections`, `Inquiries`, and `Artist Profile`.
* **Sticky Action Headers:** "Save Changes", "Publish Draft", and "Cancel" buttons remain accessible during long artwork edits.
