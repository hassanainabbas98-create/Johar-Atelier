/**
 * Admin API Service for L'Archive Vivante
 * Strongly-typed endpoints connecting the Atelier Admin CMS to Johar.Api backend.
 */

import { apiClient } from './apiClient';
import type {
  UserDto,
  LoginRequest,
  DashboardSummaryDto,
  AdminArtworkDto,
  ArtworkSummaryDto,
  CreateArtworkDto,
  UpdateArtworkDto,
  ArtworkImageDto,
  UpdateArtworkImageDto,
  CategoryDto,
  CategoryUpsertDto,
  CollectionDto,
  CollectionUpsertDto,
  InquiryDto,
  InquiryStatus,
  InquiryQueryParameters,
  ArtworkQueryParameters,
  PagedResult,
  PublicProfileDto,
  UpdateSiteSettingsDto,
} from '../types';

export const adminApi = {
  // --- Authentication ---
  login: (req: LoginRequest): Promise<UserDto> => {
    return apiClient.post<UserDto>('/auth/login', req);
  },

  logout: (): Promise<void> => {
    return apiClient.post<void>('/auth/logout');
  },

  getCurrentUser: (): Promise<UserDto> => {
    return apiClient.get<UserDto>('/auth/me');
  },

  // --- Dashboard Summary ---
  getDashboardSummary: (): Promise<DashboardSummaryDto> => {
    return apiClient.get<DashboardSummaryDto>('/admin/dashboard/summary');
  },

  // --- Artworks Management ---
  getArtworks: (params: ArtworkQueryParameters = {}): Promise<PagedResult<ArtworkSummaryDto>> => {
    const searchParams = new URLSearchParams();
    if (params.categorySlug) searchParams.append('categorySlug', params.categorySlug);
    if (params.collectionSlug) searchParams.append('collectionSlug', params.collectionSlug);
    if (params.availableOnly !== undefined && params.availableOnly !== null) {
      searchParams.append('availableOnly', String(params.availableOnly));
    }
    if (params.featuredOnly !== undefined && params.featuredOnly !== null) {
      searchParams.append('featuredOnly', String(params.featuredOnly));
    }
    if (params.search) searchParams.append('search', params.search);
    if (params.page) searchParams.append('page', String(params.page));
    if (params.pageSize) searchParams.append('pageSize', String(params.pageSize));

    const qs = searchParams.toString();
    return apiClient.get<PagedResult<ArtworkSummaryDto>>(`/admin/artworks${qs ? `?${qs}` : ''}`);
  },

  getArtworkById: (id: number): Promise<AdminArtworkDto> => {
    return apiClient.get<AdminArtworkDto>(`/admin/artworks/${id}`);
  },

  createArtwork: (dto: CreateArtworkDto): Promise<AdminArtworkDto> => {
    return apiClient.post<AdminArtworkDto>('/admin/artworks', dto);
  },

  updateArtwork: (id: number, dto: UpdateArtworkDto): Promise<AdminArtworkDto> => {
    return apiClient.put<AdminArtworkDto>(`/admin/artworks/${id}`, dto);
  },

  togglePublish: (id: number, isPublished: boolean): Promise<AdminArtworkDto> => {
    return apiClient.patch<AdminArtworkDto>(`/admin/artworks/${id}/publish`, isPublished);
  },

  toggleFeatured: (id: number, isFeatured: boolean): Promise<AdminArtworkDto> => {
    return apiClient.patch<AdminArtworkDto>(`/admin/artworks/${id}/feature`, isFeatured);
  },

  deleteArtwork: (id: number): Promise<void> => {
    return apiClient.delete<void>(`/admin/artworks/${id}`);
  },

  // --- Artwork Image Management ---
  uploadImage: (
    artworkId: number,
    file: File,
    altText?: string,
    isPrimary = false
  ): Promise<ArtworkImageDto> => {
    const formData = new FormData();
    formData.append('file', file);
    if (altText) formData.append('altText', altText);
    formData.append('isPrimary', String(isPrimary));

    return apiClient.post<ArtworkImageDto>(`/admin/artworks/${artworkId}/images`, formData);
  },

  replaceImage: (
    artworkId: number,
    imageId: number,
    file: File,
    altText?: string
  ): Promise<ArtworkImageDto> => {
    const formData = new FormData();
    formData.append('file', file);
    if (altText) formData.append('altText', altText);

    return apiClient.put<ArtworkImageDto>(
      `/admin/artworks/${artworkId}/images/${imageId}/replace`,
      formData
    );
  },

  updateImageMetadata: (
    artworkId: number,
    imageId: number,
    dto: UpdateArtworkImageDto
  ): Promise<ArtworkImageDto> => {
    return apiClient.put<ArtworkImageDto>(`/admin/artworks/${artworkId}/images/${imageId}`, dto);
  },

  deleteImage: (artworkId: number, imageId: number): Promise<void> => {
    return apiClient.delete<void>(`/admin/artworks/${artworkId}/images/${imageId}`);
  },

  // --- Categories Management ---
  getCategories: (): Promise<CategoryDto[]> => {
    return apiClient.get<CategoryDto[]>('/admin/categories');
  },

  getCategoryById: (id: number): Promise<CategoryDto> => {
    return apiClient.get<CategoryDto>(`/admin/categories/${id}`);
  },

  createCategory: (dto: CategoryUpsertDto): Promise<CategoryDto> => {
    return apiClient.post<CategoryDto>('/admin/categories', dto);
  },

  updateCategory: (id: number, dto: CategoryUpsertDto): Promise<CategoryDto> => {
    return apiClient.put<CategoryDto>(`/admin/categories/${id}`, dto);
  },

  deleteCategory: (id: number): Promise<void> => {
    return apiClient.delete<void>(`/admin/categories/${id}`);
  },

  // --- Collections Management ---
  getCollections: (): Promise<CollectionDto[]> => {
    return apiClient.get<CollectionDto[]>('/admin/collections');
  },

  getCollectionById: (id: number): Promise<CollectionDto> => {
    return apiClient.get<CollectionDto>(`/admin/collections/${id}`);
  },

  createCollection: (dto: CollectionUpsertDto): Promise<CollectionDto> => {
    return apiClient.post<CollectionDto>('/admin/collections', dto);
  },

  updateCollection: (id: number, dto: CollectionUpsertDto): Promise<CollectionDto> => {
    return apiClient.put<CollectionDto>(`/admin/collections/${id}`, dto);
  },

  deleteCollection: (id: number): Promise<void> => {
    return apiClient.delete<void>(`/admin/collections/${id}`);
  },

  // --- Inquiries Inbox ---
  getInquiries: (params: InquiryQueryParameters = {}): Promise<PagedResult<InquiryDto>> => {
    const searchParams = new URLSearchParams();
    if (params.status) searchParams.append('status', params.status);
    if (params.artworkId) searchParams.append('artworkId', String(params.artworkId));
    if (params.page) searchParams.append('page', String(params.page));
    if (params.pageSize) searchParams.append('pageSize', String(params.pageSize));

    const qs = searchParams.toString();
    return apiClient.get<PagedResult<InquiryDto>>(`/admin/inquiries${qs ? `?${qs}` : ''}`);
  },

  getInquiryById: (id: number): Promise<InquiryDto> => {
    return apiClient.get<InquiryDto>(`/admin/inquiries/${id}`);
  },

  updateInquiryStatus: (id: number, status: InquiryStatus): Promise<InquiryDto> => {
    return apiClient.patch<InquiryDto>(`/admin/inquiries/${id}/status`, { status });
  },

  updateInquiryNotes: (id: number, artistNotes: string): Promise<InquiryDto> => {
    return apiClient.patch<InquiryDto>(`/admin/inquiries/${id}/notes`, { artistNotes });
  },

  // --- Settings & Portrait Management ---
  getSettings: (): Promise<PublicProfileDto> => {
    return apiClient.get<PublicProfileDto>('/admin/settings');
  },

  updateSettings: (dto: UpdateSiteSettingsDto): Promise<PublicProfileDto> => {
    return apiClient.put<PublicProfileDto>('/admin/settings', dto);
  },

  uploadPortrait: (file: File, profilePictureAlt?: string): Promise<PublicProfileDto> => {
    const formData = new FormData();
    formData.append('file', file);
    if (profilePictureAlt) formData.append('profilePictureAlt', profilePictureAlt);

    return apiClient.post<PublicProfileDto>('/admin/settings/portrait', formData);
  },

  deletePortrait: (): Promise<PublicProfileDto> => {
    return apiClient.delete<PublicProfileDto>('/admin/settings/portrait');
  },
};
