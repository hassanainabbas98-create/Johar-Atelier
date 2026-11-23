# Open Questions & Discovery Questionnaire for the Artist

## 1. Overview
To ensure the website authentically reflects the artist's identity and works within their business preferences, the following questions must be answered by the artist or their representative.

Items are marked by urgency:
* **[Critical - Pre-Launch]:** Required to finalize copy, branding, and production launch.
* **[Informational - Architectural]:** Clarifies default behaviors in the system.

---

## 2. Category 1: Artist Identity & Media Assets

1. **Artist Profile Photograph [Critical - Pre-Launch]**
   * *Question:* Do you have an existing high-resolution photograph of yourself (e.g., in the studio, working on a canvas, or a formal portrait) ready to be used as your official profile picture?
   * *Context:* The system requires a high-resolution file (JPEG/PNG/WebP, minimum 1200x1200px) which will be featured on the homepage introduction and About page.

2. **Artist Biography & Statement [Critical - Pre-Launch]**
   * *Question:* Will you provide the final biographical copy (artistic background, education, technique evolution) and your personal artist statement (creative philosophy and intent), or should we prepare an editorial draft based on bullet points or an interview with you?
   * *Context:* The system provides two independent fields in the admin dashboard for the Artist Statement and Biography. To honor the rule against synthetic copy, the system will use clean placeholder outlines until your authentic text is supplied.

3. **Curriculum Vitae & Exhibitions [Informational]**
   * *Question:* Do you have a list of past solo or group exhibitions, art fairs, residencies, or awards that you would like structured on your About page?

---

## 3. Category 2: Artwork Catalog & Taxonomy

4. **Catalog Launch Inventory [Critical - Pre-Launch]**
   * *Question:* Approximately how many initial artworks do you plan to showcase at launch across your mediums (Oil, Watercolors, Calligraphy, Pencil Sketches, Portraits, Visual Artwork)?
   * *Context:* Helps determine initial pagination limits, grid density, and whether certain mediums should be grouped together initially.

5. **Pricing Transparency Policy [Critical - Architectural]**
   * *Question:* Do you prefer to display prices publicly for available original pieces, or do you prefer all artworks to state *"Inquire for Price"*?
   * *Default System Design:* The database supports both options via a per-piece toggle (`IsPriceVisible`), defaulting to showing price only if explicitly entered.

6. **Artwork Availability Terminology [Informational]**
   * *Question:* Which availability labels best match your studio practices?
     * Standard options: `Available`, `Reserved`, `Sold`, `Private Collection / Not for Sale (NFS)`.

---

## 4. Category 3: Commission Process & Business Policies

7. **Commission Types & Boundaries [Critical - Content]**
   * *Question:* Which mediums are you actively accepting commissions for (e.g., custom oil portraits, architectural pencil sketches, bespoke calligraphy)? Are there sizes or subjects you do not accept?
   * *Context:* This will be explicitly stated on the `/commissions` page to guide client expectations.

8. **Commission Deposit & Financial Terms [Informational]**
   * *Question:* What are your typical deposit and payment terms for bespoke commissions (e.g., 50% non-refundable deposit upon concept sketch approval, 50% balance prior to shipment)?
   * *Context:* These details will be outlined in the commission process guide.

9. **Client Reference Materials [Informational]**
   * *Question:* For custom portraits or sketches, do you require prospective clients to email reference photos, or do you prefer a discovery call first?

---

## 5. Category 4: Inquiries, Logistics & Studio Contact

10. **Inquiry Notification Routing [Critical - Architectural]**
    * *Question:* What email address should receive notifications whenever a collector submits an inquiry or commission request? Should multiple recipients (e.g., artist + studio assistant) be notified?

11. **Framing & Shipping Practices [Informational]**
    * *Question:* Are artworks generally sold framed or unframed? Do you arrange international fine art shipping, or is shipping calculated individually per inquiry?

12. **Studio Visit Policy [Informational]**
    * *Question:* Is your studio open for private collector viewings by appointment, or do you operate strictly online/via gallery representation?

---

## 6. Category 5: Domain, Cloud & Hosting Infrastructure

13. **Custom Domain Name [Critical - Deployment]**
    * *Question:* Do you already own a custom domain (e.g., `artistname.com`), or do you need assistance selecting and registering one?

14. **Cloudinary & Cloud Accounts [Informational]**
    * *Question:* Would you prefer the Cloudinary media account and hosting infrastructure to be set up under your own studio credentials, or managed by the development team?
    * *Context:* Cloudinary offers a generous free tier that will easily accommodate several hundred high-resolution artwork images and profile photographs.
