import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, BookOpen, MessageSquare, ExternalLink } from 'lucide-react';
import styles from './EclipseMenuDialog.module.css';

interface EclipseMenuDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenArchive?: () => void;
  onNavigateChapter?: (index: number) => void;
  onOpenInquiry?: () => void;
}

export const EclipseMenuDialog: React.FC<EclipseMenuDialogProps> = ({
  isOpen,
  onClose,
  onOpenArchive,
  onNavigateChapter,
  onOpenInquiry,
}) => {
  const navigate = useNavigate();

  // Escape key handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Lock background scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  const handleChapterClick = (route: string, chapterIndex?: number) => {
    onClose();
    if (chapterIndex !== undefined && onNavigateChapter && window.location.pathname === '/') {
      onNavigateChapter(chapterIndex);
    } else {
      navigate(route);
    }
  };

  const handleArchiveClick = () => {
    onClose();
    if (onOpenArchive) {
      onOpenArchive();
    } else {
      navigate('/gallery');
    }
  };

  const handleInquiryClick = () => {
    onClose();
    if (onOpenInquiry) {
      onOpenInquiry();
    } else {
      navigate('/contact');
    }
  };

  const chapters = [
    {
      number: '01',
      title: 'The Awakening',
      subtitle: 'Studio Genesis & Observational Craft',
      route: '/',
      index: 0,
    },
    {
      number: '02',
      title: 'Curated Works & Archive',
      subtitle: 'Catalogue Raisonné & Original Paintings',
      route: '/gallery',
      index: 1,
    },
    {
      number: '03',
      title: 'The Quiet Sanctum',
      subtitle: 'Materials, Linen & Gilding Philosophy',
      route: '/about',
      index: 2,
    },
    {
      number: '04',
      title: 'Bespoke Commissions',
      subtitle: 'Private Residence & Architectural Patronage',
      route: '/commissions',
      index: 3,
    },
    {
      number: '05',
      title: 'Studio Contact & Appointments',
      subtitle: 'Direct Curatorial Correspondence',
      route: '/contact',
      index: 4,
    },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className={styles.dialogOverlay}
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label="Atelier Chapter Navigation Index"
        >
          <motion.aside
            className={styles.menuDrawer}
            onClick={(e) => e.stopPropagation()}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Drawer Header */}
            <div className={styles.drawerHeader}>
              <div className={styles.eyebrowGroup}>
                <span className={styles.eyebrowBadge}>INDEX</span>
                <span className={styles.eyebrowText}>ATELIER ARCHIVAL SANCTUARY</span>
              </div>

              <button
                type="button"
                className={styles.closeButton}
                onClick={onClose}
                aria-label="Close chapter navigation"
              >
                <X size={16} />
              </button>
            </div>

            {/* Chapters Navigation List */}
            <nav className={styles.chaptersNav} aria-label="Atelier Chapter Directory">
              {chapters.map((ch) => (
                <button
                  key={ch.number}
                  type="button"
                  className={styles.chapterItem}
                  onClick={() => handleChapterClick(ch.route, ch.index)}
                >
                  <div className={styles.chapterTopRow}>
                    <span className={styles.chapterNumber}>{ch.number}</span>
                    <span className={styles.chapterTitle}>{ch.title}</span>
                    <ArrowRight size={14} className={styles.chapterArrow} aria-hidden="true" />
                  </div>
                  <span className={styles.chapterSubtitle}>{ch.subtitle}</span>
                </button>
              ))}
            </nav>

            {/* Curatorial Quick Actions */}
            <div className={styles.actionsSection}>
              <div className={styles.actionPrompt}>CURATORIAL SERVICES</div>
              <div className={styles.actionsGrid}>
                <button
                  type="button"
                  className={styles.actionBtn}
                  onClick={handleArchiveClick}
                >
                  <BookOpen size={13} className={styles.actionIcon} />
                  <span>Field Archive</span>
                  <ExternalLink size={10} className={styles.actionMiniArrow} />
                </button>

                <button
                  type="button"
                  className={styles.actionBtnPrimary}
                  onClick={handleInquiryClick}
                >
                  <MessageSquare size={13} className={styles.actionIcon} />
                  <span>Studio Inquiry</span>
                </button>
              </div>
            </div>

            {/* Drawer Footer */}
            <div className={styles.drawerFooter}>
              <p className={styles.curatorialQuote}>
                Preserving the tactile permanence of traditional glazing, pure earth pigments, and natural resin varnishes.
              </p>
              <div className={styles.footerMeta}>
                <span>LONDON · PARIS · ATELIER DEV</span>
                <span className={styles.copyright}>© {new Date().getFullYear()} JOHAR ATELIER</span>
              </div>
            </div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
};
