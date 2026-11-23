import React, { useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import type { ArtworkImageDto } from '../types';
import { getWatermarkedImageUrl } from '../utils/watermark';
import styles from './Lightbox.module.css';

interface LightboxProps {
  isOpen: boolean;
  images: ArtworkImageDto[];
  currentIndex: number;
  artworkTitle: string;
  onClose: () => void;
  onIndexChange: (index: number) => void;
}

export const Lightbox: React.FC<LightboxProps> = ({
  isOpen,
  images,
  currentIndex,
  artworkTitle,
  onClose,
  onIndexChange,
}) => {
  const currentImage = images[currentIndex];
  const hasMultiple = images.length > 1;

  const handlePrev = useCallback(() => {
    if (!hasMultiple) return;
    onIndexChange((currentIndex - 1 + images.length) % images.length);
  }, [currentIndex, images.length, hasMultiple, onIndexChange]);

  const handleNext = useCallback(() => {
    if (!hasMultiple) return;
    onIndexChange((currentIndex + 1) % images.length);
  }, [currentIndex, images.length, hasMultiple, onIndexChange]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, handlePrev, handleNext]);

  if (!isOpen || !currentImage) return null;

  return (
    <div
      className={`${styles.backdrop} ${isOpen ? styles.backdropOpen : ''}`}
      role="dialog"
      aria-modal="true"
      aria-label={`High-resolution view of ${artworkTitle}`}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Top Bar */}
      <div className={styles.topBar}>
        <div>{artworkTitle}</div>
        <div className={styles.counter}>
          {currentIndex + 1} of {images.length}
        </div>
        <button
          type="button"
          className={styles.closeButton}
          onClick={onClose}
          aria-label="Close high-resolution viewer"
        >
          <X size={22} />
        </button>
      </div>

      {/* Main Stage */}
      <div className={styles.stage}>
        {hasMultiple && (
          <button
            type="button"
            className={`${styles.navButton} ${styles.prevButton}`}
            onClick={handlePrev}
            aria-label="Previous artwork photograph"
          >
            <ChevronLeft size={28} />
          </button>
        )}

        <div className={styles.imageContainer}>
          <img
            src={getWatermarkedImageUrl(currentImage.secureUrl)}
            alt={currentImage.altText || artworkTitle}
            className={styles.image}
            draggable={false}
            onContextMenu={(e) => e.preventDefault()}
            style={{
              aspectRatio: currentImage.aspectRatio ? `${currentImage.aspectRatio}` : 'auto',
            }}
          />
          <span className={styles.watermarkBadge}>Art By Johar</span>
        </div>

        {hasMultiple && (
          <button
            type="button"
            className={`${styles.navButton} ${styles.nextButton}`}
            onClick={handleNext}
            aria-label="Next artwork photograph"
          >
            <ChevronRight size={28} />
          </button>
        )}
      </div>

      {/* Caption Bar */}
      <div className={styles.captionBar}>
        {currentImage.altText || `${artworkTitle} — High-resolution studio archival inspection`}
      </div>
    </div>
  );
};
