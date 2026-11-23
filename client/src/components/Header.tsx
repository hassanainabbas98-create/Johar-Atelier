import React, { useState, useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useSettings } from '../context/SettingsContext';
import { useInquiry } from '../context/InquiryContext';
import { publicApi } from '../services/publicApi';
import { EclipseMenuDialog } from './EclipseMenuDialog';
import { EclipseArchiveDialog } from './EclipseArchiveDialog';
import { cleanArtistName } from '../utils/textUtils';
import type { ArtworkSummaryDto } from '../types';
import styles from './Header.module.css';

export const Header: React.FC = () => {
  const { settings } = useSettings();
  const { openInquiry } = useInquiry();
  const [isScrolled, setIsScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [artworks, setArtworks] = useState<ArtworkSummaryDto[]>([]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch artworks for Field Archive
  useEffect(() => {
    let isMounted = true;
    publicApi
      .getArtworks({ pageSize: 30 })
      .then((res) => {
        if (isMounted) setArtworks(res.items);
      })
      .catch((err) => console.error('Error fetching artworks for header archive:', err));

    return () => {
      isMounted = false;
    };
  }, []);

  const rawArtistName = settings?.artistName;
  const artistName = cleanArtistName(rawArtistName);

  return (
    <>
      <header className={`${styles.header} ${isScrolled ? styles.scrolledHeader : ''}`}>
        <div className={styles.inner}>
          {/* Identity: Architectural Sacred Geometry Emblem */}
          <Link to="/" className={styles.identity} aria-label={`${artistName} - Atelier Sanctuary`}>
            <svg viewBox="0 0 42 42" className={styles.identitySvg} aria-hidden="true">
              <circle cx="21" cy="21" r="15" />
              <path d="M7 34 35 6M15 3l-3 9M30 30l-3 9" />
              <circle cx="21" cy="21" r="7" />
            </svg>
            <div className={styles.identityText}>
              <span className={styles.identityTitle}>JOHAR</span>
              <small className={styles.identitySub}>Atelier Archival Sanctuary</small>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className={styles.toplinks} aria-label="Primary Navigation">
            <NavLink
              to="/gallery"
              className={({ isActive }) =>
                `${styles.textLink} ${isActive ? styles.activeTextLink : ''}`
              }
            >
              Works
            </NavLink>

            <NavLink
              to="/about"
              className={({ isActive }) =>
                `${styles.textLink} ${isActive ? styles.activeTextLink : ''}`
              }
            >
              About
            </NavLink>

            <NavLink
              to="/commissions"
              className={({ isActive }) =>
                `${styles.textLink} ${isActive ? styles.activeTextLink : ''}`
              }
            >
              Commissions
            </NavLink>

            <button
              type="button"
              className={styles.textLink}
              onClick={() => setArchiveOpen(true)}
              aria-label="Open Field Archive modal"
            >
              <span>Field Archive</span>
              <span className={styles.arrowSub} aria-hidden="true">↗</span>
            </button>
          </nav>

          {/* Header Actions */}
          <div className={styles.headerActions}>
            <span className={styles.liveTag} aria-label="Studio status: Active sanctuary">
              <i className={styles.liveDot} aria-hidden="true" />
              <span>ATELIER ARCHIVAL SANCTUARY</span>
            </span>

            <button
              type="button"
              className={styles.textLink}
              onClick={() => openInquiry({ inquiryType: 'GeneralContact' })}
              style={{ color: 'var(--color-eclipse-gold)' }}
            >
              Inquire
            </button>

            {/* Menu icon button */}
            <button
              type="button"
              id="menu-open"
              className={styles.iconButton}
              onClick={() => setMenuOpen(true)}
              aria-label="Open journey chapter navigation index"
              aria-expanded={menuOpen}
            >
              <span />
              <span />
            </button>
          </div>
        </div>
      </header>

      {/* Professional Atelier Side Menu Drawer */}
      <EclipseMenuDialog
        isOpen={menuOpen}
        onClose={() => setMenuOpen(false)}
        onOpenArchive={() => {
          setMenuOpen(false);
          setArchiveOpen(true);
        }}
        onOpenInquiry={() => {
          setMenuOpen(false);
          openInquiry({ inquiryType: 'GeneralContact' });
        }}
      />

      {/* Field Archive Modal */}
      <EclipseArchiveDialog
        isOpen={archiveOpen}
        onClose={() => setArchiveOpen(false)}
        artworks={artworks}
      />
    </>
  );
};
