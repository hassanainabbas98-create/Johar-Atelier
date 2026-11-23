import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInquiry } from '../context/InquiryContext';
import { LiquidMetalButton } from './LiquidMetalButton';
import { getWatermarkedImageUrl } from '../utils/watermark';
import type { ArtworkSummaryDto } from '../types';
import styles from './EclipseArchiveDialog.module.css';

interface EclipseArchiveDialogProps {
  isOpen: boolean;
  onClose: () => void;
  artworks: ArtworkSummaryDto[];
}

export const EclipseArchiveDialog: React.FC<EclipseArchiveDialogProps> = ({
  isOpen,
  onClose,
  artworks,
}) => {
  const { openInquiry } = useInquiry();
  const [selectedArtworkIndex, setSelectedArtworkIndex] = useState<number | null>(null);

  // Trap escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (selectedArtworkIndex !== null) {
          setSelectedArtworkIndex(null);
        } else if (isOpen) {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedArtworkIndex, onClose]);

  const selectedArtwork =
    selectedArtworkIndex !== null && artworks[selectedArtworkIndex]
      ? artworks[selectedArtworkIndex]
      : null;

  const handlePrev = () => {
    if (selectedArtworkIndex !== null && selectedArtworkIndex > 0) {
      setSelectedArtworkIndex(selectedArtworkIndex - 1);
    }
  };

  const handleNext = () => {
    if (selectedArtworkIndex !== null && selectedArtworkIndex < artworks.length - 1) {
      setSelectedArtworkIndex(selectedArtworkIndex + 1);
    }
  };

  const formatCatNum = (index: number) => {
    return `CAT. ${(index + 1).toString().padStart(3, '0')}`;
  };

  const formatDimensions = (art: ArtworkSummaryDto) => {
    if (!art.dimensionsHeight || !art.dimensionsWidth) return 'Archival Scale';
    return `${art.dimensionsHeight} × ${art.dimensionsWidth} ${art.dimensionUnit}`;
  };

  return (
    <>
      {/* 1. Main Field Archive Dialog */}
      <AnimatePresence>
        {isOpen && selectedArtworkIndex === null && (
          <div
            className={styles.overlay}
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-label="Field Archive Catalog"
          >
            <motion.div
              className={styles.archiveDialog}
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.98 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            >
              <button
                type="button"
                className={styles.closeButton}
                onClick={onClose}
                aria-label="Close field archive"
              >
                ×
              </button>

              <div className={styles.archiveHeading}>
                <span className={styles.eyebrow}>
                  TRANSMISSIONS FROM THE ATELIER
                </span>
                <h2 className={styles.archiveTitle}>
                  THE FIELD ARCHIVE
                  <span className={styles.countBadge}>{artworks.length} WORKS</span>
                </h2>
                <p className={styles.archiveSubtitle}>
                  Archival masterworks, observational studies, and classical oil examinations cataloged in the studio collection.
                </p>
              </div>

              <div className={styles.archiveGrid}>
                {artworks.map((art, idx) => (
                  <div
                    key={art.id}
                    className={styles.archiveCard}
                    onClick={() => setSelectedArtworkIndex(idx)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        setSelectedArtworkIndex(idx);
                      }
                    }}
                    aria-label={`Inspect ${art.title}`}
                  >
                    <div className={styles.thumbWrapper}>
                      <span className={styles.cardCatNum}>{formatCatNum(idx)}</span>
                      <img
                        src={getWatermarkedImageUrl(art.primaryImage?.secureUrl) || '/media/placeholder_artwork.jpg'}
                        alt={art.primaryImage?.altText || art.title}
                        className={styles.thumbImg}
                        loading="lazy"
                        draggable={false}
                        onContextMenu={(e) => e.preventDefault()}
                      />
                      <span className={styles.watermarkBadge}>Art By Johar</span>
                    </div>
                    <div className={styles.cardBody}>
                      <h3 className={styles.cardTitle}>{art.title}</h3>
                      <p className={styles.cardMeta}>
                        {art.medium} · {art.yearCreated} · {formatDimensions(art)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <footer className={styles.dialogFooter}>
                <span>ORIGINAL MASTERWORKS · UNWRITTEN ARCHIVES</span>
                <span>JOHAR ATELIER / 001—{artworks.length.toString().padStart(3, '0')}</span>
              </footer>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 2. Deep Curatorial Record Modal (When an artwork is selected) */}
      <AnimatePresence>
        {selectedArtwork && (
          <div
            className={styles.recordOverlay}
            onClick={() => setSelectedArtworkIndex(null)}
            role="dialog"
            aria-modal="true"
            aria-label={`Curatorial record: ${selectedArtwork.title}`}
          >
            <motion.div
              className={styles.recordDialog}
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              <button
                type="button"
                className={styles.closeButton}
                onClick={() => setSelectedArtworkIndex(null)}
                aria-label="Back to field archive"
              >
                ×
              </button>

              <div className={styles.recordArt}>
                <span className={styles.recordCatBadge}>
                  {formatCatNum(selectedArtworkIndex ?? 0)}
                </span>
                <img
                  src={getWatermarkedImageUrl(selectedArtwork.primaryImage?.secureUrl) || '/media/placeholder_artwork.jpg'}
                  alt={selectedArtwork.primaryImage?.altText || selectedArtwork.title}
                  className={styles.recordArtworkImg}
                  draggable={false}
                  onContextMenu={(e) => e.preventDefault()}
                />
                <span className={styles.watermarkBadge}>Art By Johar</span>
                <div className={styles.scanline} aria-hidden="true" />
              </div>

              <div className={styles.recordContent}>
                <span className={styles.eyebrow}>ARCHIVAL SPECIFICATION</span>
                <h2 className={styles.recordTitle}>{selectedArtwork.title}</h2>
                <p className={styles.recordDesc}>
                  Original composition produced under studio observation. Preserved with natural varnish and archival binding.
                </p>

                <dl className={styles.recordStats}>
                  <div className={styles.statGroup}>
                    <dt>MEDIUM</dt>
                    <dd>{selectedArtwork.medium || 'Oil on Linen'}</dd>
                  </div>
                  <div className={styles.statGroup}>
                    <dt>DIMENSIONS</dt>
                    <dd>{formatDimensions(selectedArtwork)}</dd>
                  </div>
                  <div className={styles.statGroup}>
                    <dt>CREATION YEAR</dt>
                    <dd>{selectedArtwork.yearCreated || new Date().getFullYear()}</dd>
                  </div>
                  <div className={styles.statGroup}>
                    <dt>STATUS</dt>
                    <dd>{selectedArtwork.availabilityStatus || 'Archival Sanctuary'}</dd>
                  </div>
                </dl>

                <div className={styles.inquireInRecordBtn}>
                  <LiquidMetalButton
                    size="md"
                    onClick={() => {
                      setSelectedArtworkIndex(null);
                      onClose();
                      openInquiry({
                        artworkId: selectedArtwork.id,
                        artworkTitle: selectedArtwork.title,
                        inquiryType: 'ArtworkInquiry',
                      });
                    }}
                    metalConfig={{
                      colorBack: '#5A3E2B',
                      colorTint: '#D5851F',
                      speed: 0.5,
                      repetition: 3,
                    }}
                  >
                    Inquire for Acquisition ✧
                  </LiquidMetalButton>
                </div>

                <div className={styles.recordNavRow}>
                  <button
                    type="button"
                    className={styles.navArrowBtn}
                    onClick={handlePrev}
                    disabled={selectedArtworkIndex === 0}
                    aria-label="Previous artwork record"
                  >
                    ←
                  </button>

                  <span className={styles.recordCount}>
                    {(selectedArtworkIndex ?? 0) + 1} / {artworks.length}
                  </span>

                  <button
                    type="button"
                    className={styles.navArrowBtn}
                    onClick={handleNext}
                    disabled={selectedArtworkIndex === artworks.length - 1}
                    aria-label="Next artwork record"
                  >
                    →
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
