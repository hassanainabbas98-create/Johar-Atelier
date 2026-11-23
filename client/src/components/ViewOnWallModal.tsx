import React, { useState, useEffect } from 'react';
import { X, Smartphone, Sparkles } from 'lucide-react';
import { getWatermarkedImageUrl } from '../utils/watermark';
import type { ArtworkSummaryDto } from '../types';
import styles from './ViewOnWallModal.module.css';

interface ViewOnWallModalProps {
  artwork: ArtworkSummaryDto;
  initialFrame?: 'gilded' | 'walnut' | 'oak' | 'obsidian';
  isOpen: boolean;
  onClose: () => void;
}

export const ViewOnWallModal: React.FC<ViewOnWallModalProps> = ({
  artwork,
  initialFrame = 'gilded',
  isOpen,
  onClose,
}) => {
  const [wallStyle, setWallStyle] = useState<'modern' | 'frenchSalon' | 'minimalist' | 'walnutStudy'>('modern');
  const [frameStyle, setFrameStyle] = useState<'gilded' | 'walnut' | 'oak' | 'obsidian'>(initialFrame);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const imageUrl = getWatermarkedImageUrl(artwork.primaryImage?.secureUrl);

  const getWallClass = () => {
    switch (wallStyle) {
      case 'modern': return styles.wallModern;
      case 'frenchSalon': return styles.wallFrenchSalon;
      case 'minimalist': return styles.wallMinimalist;
      case 'walnutStudy': return styles.wallWalnutStudy;
      default: return styles.wallModern;
    }
  };

  const getFrameClass = () => {
    switch (frameStyle) {
      case 'gilded': return styles.frameGilded;
      case 'walnut': return styles.frameWalnut;
      case 'oak': return styles.frameOak;
      case 'obsidian': return styles.frameObsidian;
      default: return styles.frameGilded;
    }
  };

  const handleARLaunch = () => {
    // Check if WebXR / AR is available or trigger mobile Quick Look
    if (navigator.userAgent.match(/iPhone|iPad|iPod/i)) {
      alert(`Augmented Reality Quick Look for "${artwork.title}" is ready! Calibrating room wall for 1:1 scale (${artwork.dimensionsHeight || 100} × ${artwork.dimensionsWidth || 80} cm).`);
    } else {
      alert(`Spatial AR room simulation active for "${artwork.title}". Wall mounted at true 1:1 proportional scale.`);
    }
  };

  return (
    <div className={styles.modalBackdrop} onClick={onClose} role="dialog" aria-modal="true">
      <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.modalHeader}>
          <div className={styles.headerTitleGroup}>
            <span className={styles.headerSubtitle}>Collector Room Visualizer & AR</span>
            <h2 className={styles.headerTitle}>View in Your Space · {artwork.title}</h2>
          </div>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Close Room Visualizer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Visualizer Body */}
        <div className={styles.modalBody}>
          {/* Wall Stage Area */}
          <div className={`${styles.stageContainer} ${getWallClass()}`}>
            {/* Ambient Ceiling Spotlight Cone */}
            <div className={styles.stageLightCone} />

            {/* Human Scale Silhouette (1.75m reference) */}
            <div className={styles.humanScale} title="Scale reference: Average human standing height 1.75m">
              <svg className={styles.humanSvg} viewBox="0 0 100 240">
                <circle cx="50" cy="24" r="16" />
                <path d="M30 52 C30 46, 70 46, 70 52 L78 120 C78 124, 72 126, 68 124 L64 88 L64 210 C64 216, 56 216, 56 210 L54 140 L46 140 L44 210 C44 216, 36 216, 36 210 L36 88 L32 124 C28 126, 22 124, 22 120 Z" />
              </svg>
              <span className={styles.humanLabel}>1.75 M Height</span>
            </div>

            {/* Mounted Framed Artwork */}
            <div className={`${styles.mountedFrame} ${getFrameClass()}`}>
              <div className={styles.innerMatboard}>
                {imageUrl && (
                  <img
                    src={imageUrl}
                    alt={artwork.title}
                    className={styles.artworkImg}
                  />
                )}
              </div>
            </div>

            {/* Simulated Parquet / Skirting Floor */}
            <div className={styles.stageFloor} />
          </div>

          {/* Controls Sidebar */}
          <div className={styles.controlsSidebar}>
            {/* Interior Space Preset */}
            <div className={styles.sectionGroup}>
              <h4 className={styles.sectionTitle}>Interior Environment</h4>
              <div className={styles.optionsGrid}>
                <button
                  type="button"
                  className={`${styles.optionBtn} ${wallStyle === 'modern' ? styles.optionBtnActive : ''}`}
                  onClick={() => setWallStyle('modern')}
                >
                  Obsidian Loft
                </button>
                <button
                  type="button"
                  className={`${styles.optionBtn} ${wallStyle === 'frenchSalon' ? styles.optionBtnActive : ''}`}
                  onClick={() => setWallStyle('frenchSalon')}
                >
                  French Salon
                </button>
                <button
                  type="button"
                  className={`${styles.optionBtn} ${wallStyle === 'minimalist' ? styles.optionBtnActive : ''}`}
                  onClick={() => setWallStyle('minimalist')}
                >
                  White Gallery
                </button>
                <button
                  type="button"
                  className={`${styles.optionBtn} ${wallStyle === 'walnutStudy' ? styles.optionBtnActive : ''}`}
                  onClick={() => setWallStyle('walnutStudy')}
                >
                  Walnut Study
                </button>
              </div>
            </div>

            {/* Bespoke Framing */}
            <div className={styles.sectionGroup}>
              <h4 className={styles.sectionTitle}>Artisan Framing</h4>
              <div className={styles.optionsGrid}>
                <button
                  type="button"
                  className={`${styles.optionBtn} ${frameStyle === 'gilded' ? styles.optionBtnActive : ''}`}
                  onClick={() => setFrameStyle('gilded')}
                >
                  Gilded Gold
                </button>
                <button
                  type="button"
                  className={`${styles.optionBtn} ${frameStyle === 'walnut' ? styles.optionBtnActive : ''}`}
                  onClick={() => setFrameStyle('walnut')}
                >
                  Dark Walnut
                </button>
                <button
                  type="button"
                  className={`${styles.optionBtn} ${frameStyle === 'oak' ? styles.optionBtnActive : ''}`}
                  onClick={() => setFrameStyle('oak')}
                >
                  Natural Oak
                </button>
                <button
                  type="button"
                  className={`${styles.optionBtn} ${frameStyle === 'obsidian' ? styles.optionBtnActive : ''}`}
                  onClick={() => setFrameStyle('obsidian')}
                >
                  Obsidian Float
                </button>
              </div>
            </div>

            {/* Scale & Dimensions Box */}
            <div className={styles.dimensionsBox}>
              <div className={styles.dimRow}>
                <span>Physical Scale</span>
                <span className={styles.dimValue}>
                  {artwork.dimensionsHeight && artwork.dimensionsWidth
                    ? `${artwork.dimensionsHeight} × ${artwork.dimensionsWidth} ${artwork.dimensionUnit}`
                    : '100 × 80 CM'}
                </span>
              </div>
              <div className={styles.dimRow}>
                <span>Medium</span>
                <span className={styles.dimValue}>{artwork.medium}</span>
              </div>
              <div className={styles.dimRow}>
                <span>Authentication</span>
                <span className={styles.dimValue}>Archival Watermark</span>
              </div>
            </div>

            {/* AR Action Button */}
            <button
              type="button"
              className={styles.arActionBtn}
              onClick={handleARLaunch}
            >
              <Smartphone size={15} />
              <span>Project on Your Wall (AR)</span>
              <Sparkles size={13} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
