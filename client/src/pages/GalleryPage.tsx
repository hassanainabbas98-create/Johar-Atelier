import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { publicApi } from '../services/publicApi';
import { ArtworkCard } from '../components/ArtworkCard';
import { VirtualArtGallery3D } from '../components/VirtualArtGallery3D';
import type {
  ArtworkSummaryDto,
  CategoryDto,
  CollectionDto,
} from '../types';
import styles from './GalleryPage.module.css';

const PAGE_SIZE = 50;

export const GalleryPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const shouldReduceMotion = useReducedMotion();

  // Active query filters
  const currentCategorySlug = searchParams.get('category') || undefined;
  const currentCollectionSlug = searchParams.get('collection') || undefined;
  const currentAvailableOnly = searchParams.get('available') === 'true';

  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [collections, setCollections] = useState<CollectionDto[]>([]);
  const [artworks, setArtworks] = useState<ArtworkSummaryDto[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'3d' | 'grid'>('3d');

  // Load Categories & Collections on mount
  useEffect(() => {
    async function loadTaxonomies() {
      try {
        const [cats, cols] = await Promise.all([
          publicApi.getCategories(),
          publicApi.getCollections(),
        ]);
        setCategories(cats.filter((c) => c.isActive));
        setCollections(cols.filter((c) => c.isPublished));
      } catch (err) {
        console.error('Failed to load gallery taxonomies:', err);
      }
    }
    loadTaxonomies();
  }, []);

  // Fetch initial page of artworks whenever filters change
  const fetchArtworks = useCallback(
    async (resetPage = true) => {
      const pageToFetch = resetPage ? 1 : currentPage + 1;
      if (resetPage) {
        setIsLoading(true);
      } else {
        setIsLoadingMore(true);
      }

      try {
        const res = await publicApi.getArtworks({
          categorySlug: currentCategorySlug,
          collectionSlug: currentCollectionSlug,
          availableOnly: currentAvailableOnly ? true : undefined,
          page: pageToFetch,
          pageSize: PAGE_SIZE,
        });

        if (resetPage) {
          setArtworks(res.items);
          setCurrentPage(1);
        } else {
          setArtworks((prev) => [...prev, ...res.items]);
          setCurrentPage(pageToFetch);
        }

        setTotalCount(res.totalCount);
        setHasMore(res.hasMore);
      } catch (err) {
        console.error('Failed to load artworks:', err);
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [currentCategorySlug, currentCollectionSlug, currentAvailableOnly, currentPage]
  );

  useEffect(() => {
    fetchArtworks(true);
  }, [currentCategorySlug, currentCollectionSlug, currentAvailableOnly]);

  const handleCategoryClick = (slug?: string) => {
    const next = new URLSearchParams(searchParams);
    if (slug) {
      next.set('category', slug);
    } else {
      next.delete('category');
    }
    setSearchParams(next);
  };

  const handleCollectionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    const next = new URLSearchParams(searchParams);
    if (val) {
      next.set('collection', val);
    } else {
      next.delete('collection');
    }
    setSearchParams(next);
  };

  const handleAvailabilityToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = new URLSearchParams(searchParams);
    if (e.target.checked) {
      next.set('available', 'true');
    } else {
      next.delete('available');
    }
    setSearchParams(next);
  };

  const resetFilters = () => {
    setSearchParams({});
  };

  return (
    <div className={styles.page}>
      {/* Header Banner */}
      <section className={styles.galleryHeader} aria-labelledby="gallery-title">
        <motion.div
          className={styles.headerInner}
          initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className={styles.eyebrow}>
            <span className={styles.hairline} />
            02 / CURATORIAL ARCHIVE
          </div>
          <h1 id="gallery-title" className={styles.title}>
            The Collection
          </h1>
          <p className={styles.description}>
            Every original artwork is documented in its native, uncropped composition. Select mediums or
            thematic series to examine individual studies, major oils, classical calligraphies, and drawings.
          </p>
        </motion.div>
      </section>

      {/* Sticky Filter Sub-bar */}
      <div className={styles.filterBar} role="region" aria-label="Gallery Filters">
        <div className={styles.filterInner}>
          {/* Category Medium Pills */}
          <div className={styles.categoryPills} role="group" aria-label="Filter by Medium">
            <button
              type="button"
              className={`${styles.pill} ${!currentCategorySlug ? styles.activePill : ''}`}
              onClick={() => handleCategoryClick(undefined)}
              aria-pressed={!currentCategorySlug}
            >
              All Mediums
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                className={`${styles.pill} ${
                  currentCategorySlug === cat.slug ? styles.activePill : ''
                }`}
                onClick={() => handleCategoryClick(cat.slug)}
                aria-pressed={currentCategorySlug === cat.slug}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Collection Selector & Availability Toggle */}
          <div className={styles.filterControls}>
            {collections.length > 0 && (
              <div className={styles.selectWrapper}>
                <label htmlFor="collection-select" className="sr-only">
                  Filter by Curated Series
                </label>
                <select
                  id="collection-select"
                  className={styles.select}
                  value={currentCollectionSlug || ''}
                  onChange={handleCollectionChange}
                >
                  <option value="">All Series / Collections</option>
                  {collections.map((col) => (
                    <option key={col.id} value={col.slug}>
                      {col.title} ({col.artworkCount})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <label className={styles.availabilityToggle}>
              <input
                type="checkbox"
                className={styles.checkbox}
                checked={currentAvailableOnly}
                onChange={handleAvailabilityToggle}
              />
              <span>Available Pieces Only</span>
            </label>

            {/* View Mode Switcher: 3D Sanctuary vs Catalogue Grid */}
            <div className={styles.viewModeToggle} role="group" aria-label="Gallery Presentation Mode">
              <button
                type="button"
                className={`${styles.viewModeBtn} ${viewMode === '3d' ? styles.activeViewModeBtn : ''}`}
                onClick={() => setViewMode('3d')}
                aria-pressed={viewMode === '3d'}
              >
                <span>🏛️ 3D Sanctuary</span>
              </button>
              <button
                type="button"
                className={`${styles.viewModeBtn} ${viewMode === 'grid' ? styles.activeViewModeBtn : ''}`}
                onClick={() => setViewMode('grid')}
                aria-pressed={viewMode === 'grid'}
              >
                <span>▦ Catalogue Grid</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3D Virtual Art Gallery Walkthrough (Primary Exhibition Showcase) */}
      {viewMode === '3d' && artworks.length > 0 && (
        <VirtualArtGallery3D artworks={artworks} />
      )}

      {/* Main Gallery Area */}
      <section className={styles.galleryContent} aria-label="Catalog Grid">
        {/* Dynamic Tally Bar with aria-live */}
        <div className={styles.tallyBar} aria-live="polite">
          <span>
            Displaying {artworks.length} of {totalCount} Artworks
          </span>
          {currentCollectionSlug && (
            <span>
              Series: {collections.find((c) => c.slug === currentCollectionSlug)?.title || currentCollectionSlug}
            </span>
          )}
        </div>

        {/* Artwork Grid */}
        {artworks.length > 0 ? (
          <div className={styles.grid}>
            {artworks.map((artwork) => (
              <ArtworkCard key={artwork.id} artwork={artwork} />
            ))}
          </div>
        ) : !isLoading ? (
          <div className={styles.emptyState}>
            <h2 className={styles.emptyTitle}>No Artworks Match Current Criteria</h2>
            <p className={styles.emptyText}>
              There are no published pieces matching your active medium, series, or availability filter.
            </p>
            <button type="button" className={styles.resetBtn} onClick={resetFilters}>
              Reset All Filters
            </button>
          </div>
        ) : null}

        {/* Load More Button */}
        {hasMore && (
          <div className={styles.loadMoreContainer}>
            <button
              type="button"
              className={styles.loadMoreButton}
              onClick={() => fetchArtworks(false)}
              disabled={isLoadingMore}
            >
              {isLoadingMore ? 'Loading Additional Pieces...' : 'Load Additional Works'}
            </button>
          </div>
        )}
      </section>
    </div>
  );
};
