import React from 'react';
import { Link } from 'react-router-dom';
import { useSettings } from '../context/SettingsContext';
import { cleanArtistName, cleanLocation } from '../utils/textUtils';
import styles from './Footer.module.css';

export const Footer: React.FC = () => {
  const { settings } = useSettings();
  const currentYear = new Date().getFullYear();

  const artistName = cleanArtistName(settings?.artistName);
  const contactEmail = settings?.contactEmail && !settings.contactEmail.includes('placeholder')
    ? settings.contactEmail
    : 'inquiries@johar-atelier.com';
  const studioLocation = cleanLocation(settings?.studioLocation);
  const instagramHandle = settings?.instagramHandle && !settings.instagramHandle.includes('placeholder')
    ? settings.instagramHandle
    : '@m.ba_shir';

  return (
    <footer className={styles.footer} role="contentinfo">
      <div className={styles.inner}>
        {/* Brand & Studio Location */}
        <div className={styles.brandCol}>
          <div className={styles.brandName}>{artistName}</div>
          <p className={styles.brandDesc}>
            A dedicated sanctuary and archival catalog for original oil paintings, watercolor studies,
            classical and modern calligraphy, tonal pencil sketches, and bespoke commissioned works.
          </p>
          <div className={styles.studioMeta}>
            {studioLocation && <span>Studio: {studioLocation}</span>}
            <span>Inquiries: {contactEmail}</span>
          </div>
        </div>

        {/* Gallery Directory */}
        <div className={styles.navCol}>
          <div className={styles.colTitle}>Navigation</div>
          <Link to="/gallery" className={styles.footerLink}>
            The Collection
          </Link>
          <Link to="/about" className={styles.footerLink}>
            Artist &amp; Biography
          </Link>
          <Link to="/commissions" className={styles.footerLink}>
            Bespoke Commissions
          </Link>
          <Link to="/contact" className={styles.footerLink}>
            Studio Correspondence
          </Link>
        </div>

        {/* Studio Connect */}
        <div className={styles.connectCol}>
          <div className={styles.colTitle}>Connect</div>
          <a
            href={`mailto:${contactEmail}`}
            className={styles.footerLink}
            aria-label={`Send inquiry email to ${contactEmail}`}
          >
            {contactEmail}
          </a>
          {instagramHandle && (
            <a
              href={`https://instagram.com/${instagramHandle.replace('@', '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.footerLink}
              aria-label={`Artist Instagram: ${instagramHandle}`}
            >
              Artist Instagram: {instagramHandle.startsWith('@') ? instagramHandle : `@${instagramHandle}`}
            </a>
          )}
          <span className={styles.inquiryModelPill}>
            Pure Inquiry Model • Direct Studio Acquisition
          </span>
        </div>
      </div>

      {/* Bottom Bar with Copyright, Creator Credit & Admin Portal */}
      <div className={styles.bottomBar}>
        <div className={styles.copyrightText}>
          &copy; {currentYear} {artistName}. All rights reserved. Archival cataloging by L&apos;Archive Vivante.
        </div>

        <div className={styles.creatorCredit}>
          <span className={styles.creatorLabel}>Created by </span>
          <a
            href="https://instagram.com/abbas_hasnain5"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.creatorLink}
            title="Visit Hassanain Abbas on Instagram (@abbas_hasnain5)"
          >
            <span className={styles.creatorName}>Hassanain Abbas</span>
            <span className={styles.creatorHandle}> • @abbas_hasnain5</span>
          </a>
        </div>

        <div>
          <Link to="/admin" className={styles.adminLink}>
            Atelier CMS Portal
          </Link>
        </div>
      </div>
    </footer>
  );
};
