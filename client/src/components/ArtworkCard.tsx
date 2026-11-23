import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Image as ImageIcon } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import type { ArtworkSummaryDto, AvailabilityStatus } from '../types';
import { useInquiry } from '../context/InquiryContext';
import { getOptimizedImageUrl } from '../utils/watermark';
import styles from './ArtworkCard.module.css';

interface ArtworkCardProps {
  artwork: ArtworkSummaryDto;
}

export const ArtworkCard: React.FC<ArtworkCardProps> = ({ artwork }) => {
  const { openInquiry } = useInquiry();
  const shouldReduceMotion = useReducedMotion();

  const getStatusDisplay = (status: AvailabilityStatus) => {
    switch (status) {
      case 'Available':
        return { label: 'Available', dotClass: styles.statusAvailable };
      case 'Reserved':
        return { label: 'Reserved', dotClass: styles.statusReserved };
      case 'Sold':
        return { label: 'Sold', dotClass: styles.statusSold };
      case 'PrivateCollection':
        return { label: 'Private Collection', dotClass: styles.statusSold };
      default:
        return { label: status, dotClass: styles.statusAvailable };
    }
  };

  const statusInfo = getStatusDisplay(artwork.availabilityStatus);
  const primaryImg = artwork.primaryImage;

  const handleInquireClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    openInquiry({
      artworkId: artwork.id,
      artworkTitle: artwork.title,
      catalogReference: artwork.catalogReference || undefined,
      inquiryType: 'ArtworkInquiry',
    });
  };

  return (
    <motion.article
      className={styles.card}
      aria-label={`${artwork.title}, ${artwork.medium}`}
      initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Warm Matboard Frame for Uncropped Artwork Rendering */}
      {primaryImg ? (
        <div className={styles.matboardFrame}>
          <Link
            to={`/gallery/${artwork.slug}`}
            className={styles.imageLink}
            aria-label={`View details of ${artwork.title}`}
          >
            <div className={styles.imageContainer}>
              <img
                src={getOptimizedImageUrl(primaryImg.secureUrl, 'thumb')}
                alt={primaryImg.altText || `${artwork.title} — ${artwork.medium}`}
                className={styles.artworkImage}
                loading="lazy"
                draggable={false}
                onContextMenu={(e) => e.preventDefault()}
                style={{
                  // Enforces native aspect ratio without any CSS cropping or stretching
                  aspectRatio: primaryImg.aspectRatio ? `${primaryImg.aspectRatio}` : 'auto',
                }}
              />
              <span className={styles.watermarkBadge}>Art By Johar</span>
            </div>
          </Link>
        </div>
      ) : (
        <div className={styles.placeholderMatboard}>
          <ImageIcon size={32} strokeWidth={1.5} />
          <span>Curatorial Study</span>
        </div>
      )}

      {/* Archival Metadata Panel */}
      <div className={styles.metaPanel}>
        <div className={styles.topRow}>
          <span className={styles.medium}>{artwork.medium}</span>
          <div className={styles.statusWrapper}>
            <span className={`${styles.statusDot} ${statusInfo.dotClass}`} />
            <span>{statusInfo.label}</span>
          </div>
        </div>

        <h3 className={styles.title}>
          <Link to={`/gallery/${artwork.slug}`} className={styles.titleLink}>
            {artwork.title}
          </Link>
        </h3>

        <div className={styles.specs}>
          <span>
            {artwork.dimensionsHeight} × {artwork.dimensionsWidth} {artwork.dimensionUnit}
            {artwork.dimensionsDepth ? ` × ${artwork.dimensionsDepth} ${artwork.dimensionUnit}` : ''}
          </span>
          <span> • {artwork.yearCreated}</span>
          {artwork.catalogReference && <span> • Ref. {artwork.catalogReference}</span>}
        </div>

        <div className={styles.cardFooter}>
          <Link to={`/gallery/${artwork.slug}`} className={styles.detailLink}>
            Examine Piece
          </Link>

          <button
            type="button"
            className={styles.inquireTrigger}
            onClick={handleInquireClick}
            aria-label={`Inquire about ${artwork.title}`}
          >
            <span>Inquire</span>
            <ArrowRight size={13} />
          </button>
        </div>
      </div>
    </motion.article>
  );
};
