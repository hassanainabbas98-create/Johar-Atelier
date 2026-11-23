# Database Design & Entity Framework Core Specification

## 1. Overview & Principles
The database is built on **Microsoft SQL Server** managed via **Entity Framework Core (EF Core)** migrations. The schema is purposefully normalized, highly readable, and free of over-engineered abstraction tables.

Key Design Tenets:
* **Strong Typing:** Proper data types (e.g., `decimal(18,2)` for financial figures, `nvarchar` with explicit lengths to conserve index footprint).
* **Integrity & Cascade Rules:** Foreign keys protect relational consistency (e.g., deleting an artwork cascades to its images, but deleting a category is restricted if artworks belong to it).
* **Auditability:** Core business tables track `CreatedAt` and `UpdatedAt` timestamps.
* **Extensibility:** E-commerce readiness is built-in (`Price`, `IsPriceVisible`, `AvailabilityStatus`) without requiring database restructuring later.

---

## 2. Entity Relationship Diagram (ERD)

```
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│   Categories    │       │   Collections   │       │      Users      │
│ ────────────────│       │ ────────────────│       │ ────────────────│
│ PK CategoryId   │       │ PK CollectionId │       │ PK UserId       │
│    Name         │       │    Title        │       │    Email        │
│    Slug         │       │    Slug         │       │    PasswordHash │
│    DisplayOrder │       │    Description  │       │    FullName     │
└────────┬────────┘       └────────┬────────┘       └─────────────────┘
         │ 1                       │ 0..1
         │                         │
         │          ┌──────────────┘
         ▼ N        ▼ N
┌───────────────────────────────────────────┐       ┌─────────────────┐
│                 Artworks                  │       │  SiteSettings   │
│ ───────────────────────────────────────── │       │ ────────────────│
│ PK ArtworkId                              │       │ PK SettingId    │
│ FK CategoryId                             │       │    ArtistName   │
│ FK CollectionId (Nullable)                │       │    ProfilePicUrl│
│    Title                                  │       │    ProfilePicId │
│    Slug                                   │       │    HomeIntro    │
│    Medium                                 │       │    ArtistStatement
│    DimensionsHeight                       │       │    AboutBio     │
│    DimensionsWidth                        │       │    ContactEmail │
│    DimensionsDepth (Nullable)             │       └─────────────────┘
│    DimensionUnit ('cm' / 'in')            │
│    YearCreated                            │       ┌─────────────────┐
│    AvailabilityStatus                     │       │   Exhibitions   │
│    IsFramed                               │       │[Phase 2 Ext.]   │
│    IsFeatured                             │       │ ────────────────│
│    IsPublished                            │       │ PK ExhibitionId │
│    Story / Description                    │       │    Title        │
│    CreatedAt, UpdatedAt                   │       │    Venue        │
│    (Price/Commerce excluded from MVP)     │       │    City         │
└────────┬─────────────────────────┬────────┘       │    StartDate    │
         │ 1                       │ 0..1
         │                         │                ┌─────────────────┐
         ▼ N                       ▼ N              │  Testimonials   │
┌─────────────────┐       ┌─────────────────┐       │[Phase 2 Ext.]   │
│  ArtworkImages  │       │    Inquiries    │       │ ────────────────│
│ ────────────────│       │ ────────────────│       │ PK TestimonialId│
│ PK ImageId      │       │ PK InquiryId    │       │    ClientName   │
│ FK ArtworkId    │       │ FK ArtworkId    │       │    Quote        │
│    CloudinaryId │       │    Name, Email  │       │    IsPublished  │
│    SecureUrl    │       │    Phone        │       └─────────────────┘
│    Width, Height│       │    ClientLocation
│    IsPrimary    │       │    InquiryType  │
│    DisplayOrder │       │    Status       │
│    AltText      │       │    Message      │
│                 │       │    CreatedAt    │
└─────────────────┘       └─────────────────┘
```

---

## 3. Data Dictionary & Table Schemas

### 3.1. `SiteSettings` (Artist Profile & Site Configuration)
Stores global site metadata, the independent artist statement, and the **confirmed artist profile picture** details.

| Column | Data Type | Nullable | Description |
| :--- | :--- | :--- | :--- |
| `Id` | `int` (PK, Identity) | No | Primary key (Single record, ID = 1). |
| `ArtistName` | `nvarchar(150)` | No | Professional name of the artist. |
| `ProfilePictureUrl`| `nvarchar(500)` | Yes | Cloudinary secure delivery URL for the artist portrait. |
| `ProfilePicturePublicId` | `nvarchar(200)` | Yes | Cloudinary public ID for asset replacement/deletion. |
| `ProfilePictureAlt`| `nvarchar(200)` | Yes | Accessibility alt text (e.g., "Portrait of the artist in studio"). |
| `HomeIntroText` | `nvarchar(1000)`| Yes | Concise artist introduction displayed on the homepage. |
| `ArtistStatement`| `nvarchar(max)` | Yes | Independent artist statement detailing creative philosophy and intent. |
| `AboutBiography` | `nvarchar(max)` | Yes | Full artist biography, background, and career milestones for About page. |
| `ContactEmail` | `nvarchar(255)` | No | Recipient email for inquiry alerts. |
| `StudioLocation` | `nvarchar(200)` | Yes | City / Country of the artist's studio. |
| `InstagramHandle`| `nvarchar(100)` | Yes | Social link. |
| `UpdatedAt` | `datetime2` | No | Timestamp of latest profile modification. |

### 3.2. `Users` (Artist Administrator)
Stores administrative credentials for the artist.

| Column | Data Type | Nullable | Description |
| :--- | :--- | :--- | :--- |
| `Id` | `int` (PK, Identity) | No | Unique identifier. |
| `Email` | `nvarchar(256)` | No | Unique login email address (Indexed). |
| `PasswordHash` | `nvarchar(max)` | No | PBKDF2/Argon2 secure password hash. |
| `FullName` | `nvarchar(150)` | No | Artist display name. |
| `LastLoginAt` | `datetime2` | Yes | Audit timestamp. |
| `CreatedAt` | `datetime2` | No | Account creation timestamp. |

### 3.3. `Categories` (Medium Taxonomy)
Represents art mediums: Oil Paintings, Watercolors, Calligraphy, Pencil Sketches, Portraits, Visual Artwork.

| Column | Data Type | Nullable | Description |
| :--- | :--- | :--- | :--- |
| `Id` | `int` (PK, Identity) | No | Unique identifier. |
| `Name` | `nvarchar(100)` | No | Display name (e.g., "Watercolors"). |
| `Slug` | `nvarchar(120)` | No | URL-friendly slug (e.g., "watercolors", Unique Index). |
| `Description` | `nvarchar(500)` | Yes | Brief description of medium characteristics. |
| `DisplayOrder` | `int` | No | Sort order in navigation menus. |
| `IsActive` | `bit` | No | Visibility flag (Default: 1). |

### 3.4. `Collections` (Thematic Series / Exhibition Groups)
Optional groupings of artworks created under a shared theme or series.

| Column | Data Type | Nullable | Description |
| :--- | :--- | :--- | :--- |
| `Id` | `int` (PK, Identity) | No | Unique identifier. |
| `Title` | `nvarchar(150)` | No | Title of the collection (e.g., "Desert Solitude Series"). |
| `Slug` | `nvarchar(170)` | No | Unique URL-friendly slug. |
| `CuratorNote` | `nvarchar(max)` | Yes | Thematic narrative explaining the series concept. |
| `CoverImageUrl` | `nvarchar(500)` | Yes | Banner or featured piece thumbnail. |
| `DisplayOrder` | `int` | No | Ordering priority. |
| `IsPublished` | `bit` | No | Visibility flag. |
| `CreatedAt` | `datetime2` | No | Creation timestamp. |

### 3.5. `Artworks` (Core Catalog Entity)
The primary portfolio entity representing individual physical pieces.

| Column | Data Type | Nullable | Description |
| :--- | :--- | :--- | :--- |
| `Id` | `int` (PK, Identity) | No | Unique identifier. |
| `CategoryId` | `int` (FK) | No | Relates to `Categories.Id` (Restricted delete). |
| `CollectionId` | `int` (FK) | Yes | Relates to `Collections.Id` (Nullable, Set null on delete). |
| `Title` | `nvarchar(200)` | No | Title of the artwork. |
| `Slug` | `nvarchar(220)` | No | Unique URL slug (Indexed). |
| `Medium` | `nvarchar(200)` | No | Specific medium details (e.g., "Winsor & Newton watercolor on 300gsm Arches cold-press paper"). |
| `DimensionsHeight` | `decimal(6,2)` | No | Height in specified unit. |
| `DimensionsWidth` | `decimal(6,2)` | No | Width in specified unit. |
| `DimensionsDepth` | `decimal(6,2)` | Yes | Depth in specified unit (for framed/canvas depth). |
| `DimensionUnit` | `nvarchar(10)` | No | Measurement unit (`cm` or `in`, Default: 'cm'). |
| `YearCreated` | `int` | No | Year completed (e.g., 2026). |
| `AvailabilityStatus`| `nvarchar(30)` | No | Status: `Available`, `Reserved`, `Sold`, `NFS` (Default: 'Available'). |
| `IsFramed` | `bit` | No | Whether framing is included. |
| `IsFeatured` | `bit` | No | Spotlighted on Homepage (Indexed). |
| `IsPublished` | `bit` | No | Publicly visible vs. internal draft (Indexed). |
| `Story` | `nvarchar(max)` | Yes | Curatorial story, inspiration, or process details. |
| `CreatedAt` | `datetime2` | No | Timestamp of creation. |
| `UpdatedAt` | `datetime2` | No | Timestamp of latest update. |
*(Note: Price storage and commercial fields are strictly excluded from the MVP schema to enforce the pure inquiry model.)*

### 3.6. `ArtworkImages` (Asset Registry)
Stores photography assets hosted on Cloudinary associated with an artwork.

| Column | Data Type | Nullable | Description |
| :--- | :--- | :--- | :--- |
| `Id` | `int` (PK, Identity) | No | Unique identifier. |
| `ArtworkId` | `int` (FK) | No | Relates to `Artworks.Id` (Cascade delete). |
| `CloudinaryPublicId` | `nvarchar(200)`| No | Cloudinary identifier for asset operations. |
| `SecureUrl` | `nvarchar(500)` | No | Cloudinary HTTPS direct link. |
| `Width` | `int` | No | Original pixel width. |
| `Height` | `int` | No | Original pixel height. |
| `IsPrimary` | `bit` | No | Flag indicating the primary thumbnail (Default: 0). |
| `DisplayOrder` | `int` | No | Display sorting order for multiple detail images. |
| `AltText` | `nvarchar(255)` | Yes | Accessible description for screen readers. Nullable in database to support saving in-progress 'Draft' artworks; strictly required by backend service before an artwork can be 'Published'. |

### 3.7. `Inquiries` (Lead & Commission Tracking)
Stores client acquisition inquiries, commission briefs, and general studio contacts.

| Column | Data Type | Nullable | Description |
| :--- | :--- | :--- | :--- |
| `Id` | `int` (PK, Identity) | No | Unique identifier. |
| `InquiryType` | `nvarchar(30)` | No | `ArtworkInquiry`, `CommissionRequest`, `GeneralContact`. |
| `ArtworkId` | `int` (FK) | Yes | Optional link to `Artworks.Id` if inquiring about a specific piece. |
| `ClientName` | `nvarchar(150)` | No | Full name of inquirer. |
| `Email` | `nvarchar(256)` | No | Contact email. |
| `Phone` | `nvarchar(50)` | Yes | Phone / WhatsApp number. |
| `ClientLocation` | `nvarchar(150)`| Yes | City, Region, or Country of the inquirer for shipping assessment. |
| `MediumPreference` | `nvarchar(100)`| Yes | Preferred medium for commission requests. |
| `EstimatedBudget` | `nvarchar(100)`| Yes | Budget range indicated by client. |
| `DesiredTimeline` | `nvarchar(100)`| Yes | Target delivery window. |
| `Message` | `nvarchar(max)` | No | Inquirer's message or brief details. |
| `Status` | `nvarchar(30)` | No | `New`, `InReview`, `Contacted`, `Completed`, `Archived`. |
| `ArtistNotes` | `nvarchar(max)` | Yes | Internal private notes written by the artist. |
| `CreatedAt` | `datetime2` | No | Submission timestamp. |

### 3.8. `Exhibitions` (Phase 2 Schema Extension)
*Note: In the MVP, exhibition history is managed as formatted narrative text within the About page (`SiteSettings.AboutBiography`). This table schema is prepared for Phase 2 dynamic CV management.*

| Column | Data Type | Nullable | Description |
| :--- | :--- | :--- | :--- |
| `Id` | `int` (PK, Identity) | No | Unique identifier. |
| `Title` | `nvarchar(200)` | No | Name of exhibition. |
| `Venue` | `nvarchar(200)` | No | Gallery, museum, or art fair venue. |
| `City` | `nvarchar(100)` | No | Location city. |
| `Country` | `nvarchar(100)` | No | Location country. |
| `StartDate` | `date` | No | Opening date. |
| `EndDate` | `date` | Yes | Closing date. |
| `IsSolo` | `bit` | No | 1 = Solo Exhibition, 0 = Group Exhibition. |
| `DisplayOrder` | `int` | No | Display sorting. |

### 3.9. `Testimonials` (Phase 2 Schema Extension)
*Note: Collector testimonials are scheduled for Phase 2. This schema is defined to ensure forward compatibility without requiring subsequent structural redesign.*

| Column | Data Type | Nullable | Description |
| :--- | :--- | :--- | :--- |
| `Id` | `int` (PK, Identity) | No | Unique identifier. |
| `ClientName` | `nvarchar(150)` | No | Client or curator name. |
| `ClientLocation` | `nvarchar(150)` | Yes | City, Country or institutional affiliation. |
| `Quote` | `nvarchar(1000)`| No | Testimonial text. |
| `ArtworkTitle` | `nvarchar(200)` | Yes | Name of artwork acquired / commissioned. |
| `IsPublished` | `bit` | No | Visibility flag. |
| `DisplayOrder` | `int` | No | Display sequence. |

---

## 4. Indexing Strategy & Performance Considerations

1. **`Artworks.Slug` (Unique Index):** Guarantees instant $O(1)$ lookups for public `/gallery/:slug` detail pages.
2. **`Artworks.IsPublished, Artworks.IsFeatured` (Composite Index):** Optimizes the high-frequency homepage query for featured published artworks.
3. **`Artworks.CategoryId, Artworks.IsPublished` (Composite Index):** Accelerates medium-based filtering in the public gallery.
4. **`Inquiries.Status, Inquiries.CreatedAt` (Composite Index):** Powers fast sorting and filtering in the artist's admin inbox.
