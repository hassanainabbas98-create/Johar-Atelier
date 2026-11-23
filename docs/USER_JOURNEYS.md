# User Journeys & Experience Flows

## 1. Overview
The platform addresses four distinct personas with targeted user journeys:
1. **The Art Collector:** Looking to discover and acquire an existing original masterpiece.
2. **The Commission Client:** Looking to commission a custom portrait or bespoke visual piece.
3. **The Curator / Press Contact:** Researching the artist's credentials, biography, and exhibitions.
4. **The Artist / Administrator:** Curating the portfolio, updating their professional profile portrait, and tracking incoming inquiries.

---

## 2. Journey 1: The Art Collector (Acquiring an Original Piece)

**Goal:** Browse high-resolution artwork, appreciate medium craftsmanship, and initiate an acquisition inquiry without high-friction checkouts.

```
[Arrival] 
   └── Lands on Homepage (immersed in hero featured work & artist intro)
        │
[Exploration]
   └── Clicks "Gallery" -> Selects filter "Oil Paintings"
        │
[Engagement]
   └── Scans curated grid -> Selects a textured landscape painting
        │
[Evaluation (Artwork Detail Page)]
   └── Inspects high-resolution photography & close-up shots
   └── Reads dimensions (e.g., 90x120 cm), medium, and framing condition
   └── Observes availability status: "Available"
        │
[Acquisition Action]
   └── Clicks "Inquire for Acquisition"
   └── Modal opens pre-populated with Artwork Title, ID, and Thumbnail
   └── Enters: Name, Email, Phone (optional), Delivery City/Country (saved as ClientLocation), Message
   └── Submits form (validated via client & server rate limiting)
        │
[Confirmation]
   └── Receives immediate elegant confirmation screen: "Inquiry received. The artist will contact you within 24 hours."
   └── Background: Email notification dispatched to artist; inquiry stored in database.
```

---

## 3. Journey 2: The Private Commission Client (Custom Portrait / Calligraphy)

**Goal:** Understand the custom creation process, assess feasibility, and submit a detailed commission brief.

```
[Discovery]
   └── Arrives via direct link or clicks "Commissions" in public navigation
        │
[Orientation]
   └── Reads "The Commission Process":
        1. Consultation & Concept Discussion
        2. Reference Material / Initial Sketches
        3. Studio Execution & Progress Updates
        4. Framing & Secure Fine Art Delivery
   └── Reviews showcase of past bespoke portraits and calligraphy pieces
        │
[Brief Submission]
   └── Scrolls to "Request a Commission" form
   └── Selects Desired Medium: [x] Oil Portrait  [ ] Watercolor  [ ] Calligraphy  [ ] Pencil Sketch
   └── Enters Estimated Dimensions (e.g., "Medium (~60x80cm)")
   └── Selects Desired Completion Timeline (e.g., "Within 2-3 months")
   └── Enters Narrative Description (subject matter, occasion, sentimental meaning)
   └── Submits inquiry
        │
[Resolution]
   └── Receives tailored confirmation message with next steps.
   └── Artist receives categorized "Commission Request" in Admin Inbox.
```

---

## 4. Journey 3: The Curator or Press Representative

**Goal:** Verify the artist's authenticity, background, credentials, and review press-ready visual assets.

```
[Arrival]
   └── Clicks "About" from main menu
        │
[Visual Connection & Pedigree]
   └── Immediately views the artist's professional profile photograph (studio environment)
   └── Reads the Artist Statement (creative philosophy, conceptual vision, and intent)
   └── Reads the Biography (background, training, and technique mastery)
   └── Scans the curated summary of Selected Exhibitions, Solo Shows, and Honors (structured text narrative for MVP)
        │
[Press / Representation Outreach]
   └── Clicks "Contact Studio" button at the bottom of the About page
   └── Submits institutional inquiry regarding an upcoming group exhibition
```

---

## 5. Journey 4: The Artist / Admin (Catalog & Profile Maintenance)

**Goal:** Effortlessly replace the profile photograph and publish a newly completed artwork.

### Sub-Flow A: Updating the Artist Profile Picture
```
[Authentication]
   └── Navigates to /admin/login
   └── Enters credentials -> System validates password hash -> Issues secure session
        │
[Profile Management]
   └── Clicks "Artist Profile" in sidebar navigation
   └── Current profile picture is displayed alongside current bio copy
   └── Clicks "Upload New Photograph"
   └── Selects high-resolution studio portrait from computer/device
   └── Frontend previews image locally
   └── Clicks "Save & Publish"
        │
[Processing & Cloudinary Storage]
   └── Backend receives file stream -> Uploads to Cloudinary
   └── Cloudinary generates responsive profile transformations (face-detect crop `g_face, c_fill` strictly restricted to the artist profile)
   └── Backend saves new Cloudinary public ID and URL to `SiteSettings` table
   └── Instant confirmation notification: "Profile photograph updated successfully."
   └── Home and About pages immediately reflect the new portrait with zero layout shift.
```

### Sub-Flow B: Publishing a New Artwork
```
[Catalog Management]
   └── Navigates to /admin/artworks -> Clicks "Add Artwork"
   └── Fills in form:
        * Title: "Nocturne in Charcoal"
        * Medium: "Pencil sketch and charcoal on archival paper"
        * Category: "Pencil Sketches"
        * Collection: (Optional series assignment)
        * Dimensions: 42 x 59.4 cm (A2)
        * Year: 2026
        * Status: "Available"
        * Price: (Optional, e.g., $850 or left hidden)
        * Description: Inspiration, technique, framing notes
   └── Drag-and-drops 2 photos: primary shot and a close-up texture shot
   └── Selects primary thumbnail
   └── Enters descriptive Alternative Text (AltText) for each image:
        * Rule: AltText is mandatory before the artwork can be Published (drafts can be saved without it)
   └── Clicks "Publish" (System verifies AltText completeness and Artwork Integrity non-cropping policy)
        │
[Live Verification]
   └── Images processed in Cloudinary using `c_limit` (preserving 100% full original composition, zero auto-cropping)
   └── Artwork saved to SQL Server database with related `ArtworkImages` records
   └── New artwork appears at top of Gallery and on Homepage featured carousel.
```

### Sub-Flow C: Reviewing and Responding to Inquiries
```
[Inbox Review]
   └── Admin clicks "Inquiries" in navigation
   └── Sees badge indicating "2 New Inquiries"
   └── Clicks on an inquiry regarding "Nocturne in Charcoal"
   └── Reviews buyer's message, location, and contact information
   └── Updates inquiry status from `New` -> `In Review`
   └── Clicks email link to respond directly via standard email client
   └── Once communication begins, updates status to `Contacted`
```
