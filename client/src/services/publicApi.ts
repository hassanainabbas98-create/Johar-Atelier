/**
 * Public API Service for L'Archive Vivante
 * Strongly-typed endpoints connecting the public frontend to Johar.Api backend.
 */

import { apiClient } from './apiClient';
import type {
  PublicProfileDto,
  CategoryDto,
  CollectionDto,
  ArtworkSummaryDto,
  ArtworkDetailDto,
  PagedResult,
  ArtworkQueryParameters,
  CreateInquiryRequest,
  InquiryDto,
} from '../types';

export const publicApi = {
  /**
   * Fetches public artist profile and site settings
   */
  getSettings: (): Promise<PublicProfileDto> => {
    return apiClient.get<PublicProfileDto>('/public/settings');
  },

  /**
   * Fetches active medium categories with artwork count
   */
  getCategories: (): Promise<CategoryDto[]> => {
    return apiClient.get<CategoryDto[]>('/public/categories');
  },

  /**
   * Fetches published thematic collections with artwork count
   */
  getCollections: (): Promise<CollectionDto[]> => {
    return apiClient.get<CollectionDto[]>('/public/collections');
  },

  /**
   * Fetches paginated published artworks with optional medium, collection, availability filters
   */
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

    const queryString = searchParams.toString();
    return apiClient.get<PagedResult<ArtworkSummaryDto>>(`/public/artworks${queryString ? `?${queryString}` : ''}`);
  },

  /**
   * Fetches full public details and imagery for an individual published artwork by slug
   */
  getArtworkBySlug: (slug: string): Promise<ArtworkDetailDto> => {
    return apiClient.get<ArtworkDetailDto>(`/public/artworks/${encodeURIComponent(slug)}`);
  },

  /**
   * Submits a public collector inquiry, bespoke commission brief, or general message
   */
  submitInquiry: (payload: CreateInquiryRequest): Promise<InquiryDto> => {
    return apiClient.post<InquiryDto>('/public/inquiries', payload);
  },
};
