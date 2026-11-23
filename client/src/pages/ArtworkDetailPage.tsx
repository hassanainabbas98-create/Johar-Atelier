import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Maximize2, ArrowLeft } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { publicApi } from '../services/publicApi';
import { useInquiry } from '../context/InquiryContext';
import { Lightbox } from '../components/Lightbox';
import { getWatermarkedImageUrl } from '../utils/watermark';
import type { ArtworkDetailDto, AvailabilityStatus } from '../types';
import styles from './ArtworkDetailPage.module.css';

export const ArtworkDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { openInquiry } = useInquiry();
  const shouldReduceMotion = useReducedMotion();

  const [artwork, setArtwork] = useState<ArtworkDetailDto | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);
  const [lightboxOpen, setLightboxOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;

    async function loadArtwork() {
      try {
        setIsLoading(true);
        setError(null);
        const data = await publicApi.getArtworkBySlug(slug!);
        setArtwork(data);
        setSelectedImageIndex(0);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'The requested artwork could not be found.';
        setError(msg);
      } finally {
        setIsLoading(false);
      }
    }

    loadArtwork();
  }, [slug]);

  if (isLoading) {
    return (
      <div className={styles.page}>
        <div className={styles.inner} style={{ textAlign: 'center', padding: 'var(--space-20) 0' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: '1.5rem', color: 'var(--color-brand-mocha)' }}>
            Retrieving curatorial archive...
          </div>
        </div>
      </div>
    );
  }

  if (error || !artwork) {
    return (
      <div className={styles.page}>
        <div className={styles.inner} style={{ textAlign: 'center', padding: 'var(--space-20) 0' }}>
          <h1 className={styles.title} style={{ marginBottom: 'var(--space-4)' }}>
            Artwork Not Found
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-8)' }}>
            {error || 'This catalog piece is not present or has been retired from the active collection.'}
          </p>
          <Link
            to="/gallery"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              fontFamily: 'var(--font-sans)',
              fontSize: 'var(--font-size-sm)',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: 'var(--color-eclipse-gold)',
            }}
          >
            <ArrowLeft size={16} /> Return to Exhibition Gallery
          </Link>
        </div>
      </div>
    );
  }

  const images = artwork.images && artwork.images.length > 0 ? artwork.images : artwork.primaryImage ? [artwork.primaryImage] : [];
  const currentImage = images[selectedImageIndex] || artwork.primaryImage;

  const getStatusDisplay = (status: AvailabilityStatus) => {
    switch (status) {
      case 'Available':
        return { label: 'Available for Acquisition', color: '#87A96B' }; /* Sage Green */
      case 'Reserved':
        return { label: 'Reserved for Collector', color: '#D5851F' }; /* Amber Glow */
      case 'Sold':
        return { label: 'Acquired / Private Collection', color: '#9ca9b2' };
      case 'PrivateCollection':
        return { label: 'Permanent Archive / Not for Sale', color: '#9ca9b2' };
      default:
        return { label: status, color: '#87A96B' };
    }
  };

  const statusInfo = getStatusDisplay(artwork.availabilityStatus);
  const easeMuseum = [0.22, 1, 0.36, 1] as const;

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        {/* Breadcrumbs */}
        <nav aria-label="Breadcrumbs" className={styles.breadcrumbs}>
          <Link to="/" className={styles.breadcrumbLink}>
            Home
          </Link>
          <span>/</span>
          <Link to="/gallery" className={styles.breadcrumbLink}>
            Works
          </Link>
          <span>/</span>
          <Link to={`/gallery?category=${artwork.categorySlug}`} className={styles.breadcrumbLink}>
            {artwork.categoryName}
          </Link>
          <span>/</span>
          <span className={styles.breadcrumbCurrent}>{artwork.title}</span>
        </nav>

        {/* 60/40 Asymmetric Presentation */}
        <div className={styles.layout}>
          {/* Left Column: Visual Presentation */}
          <motion.div
            className={styles.visualColumn}
            initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85, ease: easeMuseum }}
          >
            <div className={styles.matboard}>
              {currentImage ? (
                <>
                  <div className={styles.mainImageContainer}>
                    <img
                      src={getWatermarkedImageUrl(currentImage.secureUrl)}
                      alt={currentImage.altText || `${artwork.title} — ${artwork.medium}`}
                      className={styles.mainImage}
                      draggable={false}
                      onContextMenu={(e) => e.preventDefault()}
                      onClick={() => setLightboxOpen(true)}
                      style={{
                        aspectRatio: currentImage.aspectRatio ? `${currentImage.aspectRatio}` : 'auto',
                      }}
                    />
                    <span className={styles.watermarkBadge}>Art By Johar</span>
                  </div>
                  <button
                    type="button"
                    className={styles.zoomTrigger}
                    onClick={() => setLightboxOpen(true)}
                    aria-label="Inspect artwork in full-screen high resolution"
                  >
                    <Maximize2 size={14} />
                    <span>Examine Detail</span>
                  </button>
                </>
              ) : (
                <div style={{ padding: 'var(--space-16)', fontStyle: 'italic' }}>
                  No photograph cataloged for this piece.
                </div>
              )}
            </div>

            {/* Graceful Single-Photo Rule: Render secondary thumbnails ONLY if images.length > 1 */}
            {images.length > 1 && (
              <div className={styles.thumbnailsTray} role="group" aria-label="Artwork detail photographs">
                {images.map((img, idx) => (
                  <button
                    key={img.id}
                    type="button"
                    className={`${styles.thumbnailBtn} ${
                      idx === selectedImageIndex ? styles.activeThumbnail : ''
                    }`}
                    onClick={() => setSelectedImageIndex(idx)}
                    aria-label={`View photo ${idx + 1} of ${images.length}`}
                  >
                    <img
                      src={getWatermarkedImageUrl(img.secureUrl)}
                      alt={img.altText || `View ${idx + 1}`}
                      className={styles.thumbnailImg}
                      draggable={false}
                      onContextMenu={(e) => e.preventDefault()}
                    />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Right Column: Curatorial Dossier */}
          <motion.aside
            className={styles.dossierColumn}
            initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85, ease: easeMuseum, delay: 0.1 }}
          >
            <div>
              <div className={styles.mediumBadge}>{artwork.medium}</div>
              <h1 className={styles.title}>{artwork.title}</h1>
            </div>

            <div className={styles.statusRow}>
              <span className={styles.statusDot} style={{ backgroundColor: statusInfo.color }} />
              <span style={{ color: statusInfo.color, fontWeight: 600 }}>{statusInfo.label}</span>
            </div>

            {/* Specifications Matrix */}
            <div className={styles.specsMatrix}>
              <div className={styles.specItem}>
                <span className={styles.specLabel}>Dimensions</span>
                <span className={styles.specValue}>
                  {artwork.dimensionsHeight} × {artwork.dimensionsWidth} {artwork.dimensionUnit}
                  {artwork.dimensionsDepth
                    ? ` × ${artwork.dimensionsDepth} ${artwork.dimensionUnit}`
                    : ''}
                </span>
              </div>

              <div className={styles.specItem}>
                <span className={styles.specLabel}>Year Created</span>
                <span className={styles.specValue}>{artwork.yearCreated}</span>
              </div>

              <div className={styles.specItem}>
                <span className={styles.specLabel}>Framing</span>
                <span className={styles.specValue}>
                  {artwork.isFramed ? 'Framed / Exhibition Ready' : 'Unframed / Studio Archival Mount'}
                </span>
              </div>

              <div className={styles.specItem}>
                <span className={styles.specLabel}>Medium</span>
                <span className={styles.specValue}>{artwork.medium}</span>
              </div>

              {artwork.catalogReference && (
                <div className={styles.specItem}>
                  <span className={styles.specLabel}>Catalog Ref</span>
                  <span className={styles.specValue} style={{ fontFamily: 'var(--font-mono)' }}>
                    {artwork.catalogReference}
                  </span>
                </div>
              )}

              {artwork.collectionTitle && (
                <div className={styles.specItem}>
                  <span className={styles.specLabel}>Series</span>
                  <Link
                    to={`/gallery?collection=${artwork.collectionSlug}`}
                    className={styles.specValue}
                    style={{ color: 'var(--color-eclipse-gold)', textDecoration: 'underline' }}
                  >
                    {artwork.collectionTitle}
                  </Link>
                </div>
              )}
            </div>

            {/* Story / Curatorial Notes */}
            {artwork.story && (
              <div className={styles.storySection}>
                <div className={styles.storyTitle}>Curatorial Concept &amp; Story</div>
                <div className={styles.storyBody}>{artwork.story}</div>
              </div>
            )}

            {/* Inquire Action */}
            <div className={styles.actions}>
              <button
                type="button"
                className={styles.inquirePrimaryBtn}
                onClick={() =>
                  openInquiry({
                    artworkId: artwork.id,
                    artworkTitle: artwork.title,
                    catalogReference: artwork.catalogReference || undefined,
                    inquiryType: 'ArtworkInquiry',
                  })
                }
              >
                Inquire for Acquisition ✧
              </button>
              <p className={styles.inquireNote}>
                Direct studio acquisition. Inquiries receive personal confirmation regarding provenance,
                crating, and viewing appointments.
              </p>
            </div>
          </motion.aside>
        </div>
      </div>

      {/* High-Resolution Full-Screen Lightbox */}
      <Lightbox
        isOpen={lightboxOpen}
        images={images}
        currentIndex={selectedImageIndex}
        artworkTitle={artwork.title}
        onClose={() => setLightboxOpen(false)}
        onIndexChange={(idx) => setSelectedImageIndex(idx)}
      />
    </div>
  );
};
