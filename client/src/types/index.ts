/**
 * The Archival Sanctuary (L'Archive Vivante) — Frontend TypeScript Type Definitions
 * Strictly aligned with backend DTOs (Johar.Services.DTOs) & Pure Inquiry Model (Zero Price/Budget Fields).
 */

export type AvailabilityStatus = 'Available' | 'Reserved' | 'Sold' | 'PrivateCollection';

export type InquiryType = 'ArtworkInquiry' | 'CommissionRequest' | 'GeneralContact';

export type InquiryStatus = 'New' | 'InReview' | 'Contacted' | 'Completed' | 'Archived';

export interface PublicProfileDto {
  artistName: string;
  profilePictureUrl?: string | null;
  profilePictureAlt?: string | null;
  homeIntroText?: string | null;
  artistStatement?: string | null;
  aboutBiography?: string | null;
  techniquesAndMaterials?: string | null;
  exhibitionHighlights?: string | null;
  contactEmail: string;
  studioLocation?: string | null;
  instagramHandle?: string | null;
  socialLinksJson?: string | null;
  updatedAt: string;
}

export interface CategoryDto {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  displayOrder: number;
  isActive: boolean;
  artworkCount: number;
}

export interface CollectionDto {
  id: number;
  title: string;
  slug: string;
  curatorNote?: string | null;
  coverImageUrl?: string | null;
  displayOrder: number;
  isPublished: boolean;
  createdAt: string;
  artworkCount: number;
}

export interface ArtworkImageDto {
  id: number;
  artworkId: number;
  cloudinaryPublicId: string;
  secureUrl: string;
  width: number;
  height: number;
  format?: string | null;
  aspectRatio?: number | null;
  isPrimary: boolean;
  displayOrder: number;
  altText?: string | null;
}

export interface ArtworkSummaryDto {
  id: number;
  title: string;
  slug: string;
  medium: string;
  dimensionsHeight: number;
  dimensionsWidth: number;
  dimensionsDepth?: number | null;
  dimensionUnit: string;
  yearCreated: number;
  catalogReference?: string | null;
  availabilityStatus: AvailabilityStatus;
  isFramed: boolean;
  isFeatured: boolean;
  isPublished: boolean;
  displayOrder: number;
  categoryId: number;
  categoryName: string;
  categorySlug: string;
  collectionId?: number | null;
  collectionTitle?: string | null;
  collectionSlug?: string | null;
  primaryImage?: ArtworkImageDto | null;
}

export interface ArtworkDetailDto extends ArtworkSummaryDto {
  story?: string | null;
  createdAt: string;
  updatedAt: string;
  images: ArtworkImageDto[];
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasMore: boolean;
  hasPrevious: boolean;
}

export interface ArtworkQueryParameters {
  categorySlug?: string;
  collectionSlug?: string;
  availableOnly?: boolean;
  featuredOnly?: boolean;
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface CreateInquiryRequest {
  inquiryType: InquiryType;
  artworkId?: number | null;
  clientName: string;
  email: string;
  phone?: string | null;
  clientLocation?: string | null;
  mediumPreference?: string | null;
  desiredDimensions?: string | null;
  desiredTimeline?: string | null;
  message: string;
  honeypot?: string | null; // Anti-bot honeypot
}

export interface InquiryDto {
  id: number;
  inquiryType: InquiryType;
  artworkId?: number | null;
  artworkTitle?: string | null;
  artworkSlug?: string | null;
  artworkThumbnailUrl?: string | null;
  clientName: string;
  email: string;
  phone?: string | null;
  clientLocation?: string | null;
  mediumPreference?: string | null;
  desiredDimensions?: string | null;
  desiredTimeline?: string | null;
  message: string;
  status: InquiryStatus;
  artistNotes?: string | null;
  createdAt: string;
}

export interface HealthResponse {
  status: string;
  environment: string;
  timestamp: string;
}

// --- Admin DTOs & Interfaces ---

export interface UserDto {
  id: number;
  email: string;
  fullName: string;
  createdAt: string;
  lastLoginAt?: string | null;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface DashboardSummaryDto {
  totalArtworks: number;
  publishedArtworks: number;
  draftArtworks: number;
  availableArtworks: number;
  totalCategories: number;
  totalCollections: number;
  newInquiriesCount: number;
  activeInquiriesCount: number;
  recentInquiries: InquiryDto[];
}

export interface AdminArtworkDto extends ArtworkDetailDto {
  totalImagesCount: number;
  missingAltTextCount: number;
  canBePublished: boolean;
}

export interface CreateArtworkDto {
  categoryId: number;
  collectionId?: number | null;
  title: string;
  slug?: string | null;
  medium: string;
  dimensionsHeight: number;
  dimensionsWidth: number;
  dimensionsDepth?: number | null;
  dimensionUnit?: string;
  yearCreated: number;
  catalogReference?: string | null;
  availabilityStatus: AvailabilityStatus;
  isFramed: boolean;
  isFeatured?: boolean;
  isPublished?: boolean;
  displayOrder?: number;
  story?: string | null;
}

export type UpdateArtworkDto = CreateArtworkDto;

export interface UpdateArtworkImageDto {
  altText?: string | null;
  isPrimary: boolean;
  displayOrder: number;
}

export interface CategoryUpsertDto {
  name: string;
  slug?: string | null;
  description?: string | null;
  displayOrder: number;
  isActive: boolean;
}

export interface CollectionUpsertDto {
  title: string;
  slug?: string | null;
  curatorNote?: string | null;
  coverImageUrl?: string | null;
  displayOrder: number;
  isPublished: boolean;
}

export interface UpdateInquiryStatusDto {
  status: InquiryStatus;
}

export interface UpdateInquiryNotesDto {
  artistNotes: string;
}

export interface InquiryQueryParameters {
  status?: InquiryStatus;
  artworkId?: number;
  page?: number;
  pageSize?: number;
}

export interface UpdateSiteSettingsDto {
  artistName: string;
  homeIntroText?: string | null;
  artistStatement?: string | null;
  aboutBiography?: string | null;
  techniquesAndMaterials?: string | null;
  exhibitionHighlights?: string | null;
  contactEmail: string;
  studioLocation?: string | null;
  instagramHandle?: string | null;
  socialLinksJson?: string | null;
  profilePictureAlt?: string | null;
}
