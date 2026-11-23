import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useSettings } from '../context/SettingsContext';
import { useInquiry } from '../context/InquiryContext';
import {
  cleanArtistName,
  cleanBioText,
  cleanStatementText,
  cleanLocation,
} from '../utils/textUtils';
import styles from './AboutPage.module.css';

export const AboutPage: React.FC = () => {
  const { settings } = useSettings();
  const { openInquiry } = useInquiry();
  const shouldReduceMotion = useReducedMotion();

  const artistName = cleanArtistName(settings?.artistName);
  const location = cleanLocation(settings?.studioLocation);
  const statement = cleanStatementText(settings?.artistStatement);
  const biography = cleanBioText(settings?.aboutBiography);
  const monogram = artistName
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'JA';

  const easeMuseum = [0.22, 1, 0.36, 1] as const;

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        {/* Header */}
        <motion.header
          className={styles.header}
          initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.85, ease: easeMuseum }}
        >
          <div className={styles.eyebrow}>
            <span className={styles.hairline} />
            03 / CURATORIAL BIOGRAPHY
          </div>
          <h1 className={styles.name}>{artistName}</h1>
          {location && (
            <div className={styles.studioMeta}>Working Studio • {location}</div>
          )}
        </motion.header>

        {/* Studio Portrait Anchor */}
        <motion.div
          className={styles.portraitWrapper}
          initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.85, ease: easeMuseum, delay: 0.1 }}
        >
          <div className={styles.portraitFrame}>
            {settings?.profilePictureUrl ? (
              <img
                src={settings.profilePictureUrl}
                alt={settings.profilePictureAlt || `Portrait of ${artistName}`}
                className={styles.portraitImg}
              />
            ) : (
              <div className={styles.monogramBox}>{monogram}</div>
            )}
          </div>
        </motion.div>

        {/* Strictly Separate Artist Statement */}
        {statement && (
          <motion.section
            className={styles.statementSection}
            aria-labelledby="statement-title"
            initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.85, ease: easeMuseum }}
          >
            <div id="statement-title" className={styles.statementLabel}>
              Artist Statement
            </div>
            <p className={styles.statementText}>&ldquo;{statement}&rdquo;</p>
          </motion.section>
        )}

        {/* Biography Narrative */}
        <motion.section
          className={styles.bioSection}
          aria-labelledby="bio-title"
          initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.85, ease: easeMuseum }}
        >
          <h2 id="bio-title" className={styles.sectionHeading}>
            Artistic Journey &amp; Studio Practice
          </h2>
          <div className={styles.narrativeText}>
            {biography}
          </div>
        </motion.section>

        {/* Configurable Optional Block: Techniques & Materials */}
        {settings?.techniquesAndMaterials && !settings.techniquesAndMaterials.includes('[Illustrative') && (
          <motion.section
            className={styles.optionalBlock}
            aria-labelledby="techniques-title"
            initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.85, ease: easeMuseum }}
          >
            <h2 id="techniques-title" className={styles.blockTitle}>
              Techniques &amp; Archival Materials
            </h2>
            <div className={styles.blockContent}>{settings.techniquesAndMaterials}</div>
          </motion.section>
        )}

        {/* Configurable Optional Block: Exhibition Highlights */}
        {settings?.exhibitionHighlights && !settings.exhibitionHighlights.includes('[Illustrative') && (
          <motion.section
            className={styles.optionalBlock}
            aria-labelledby="exhibitions-title"
            initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.85, ease: easeMuseum }}
          >
            <h2 id="exhibitions-title" className={styles.blockTitle}>
              Selected Exhibitions &amp; Presentations
            </h2>
            <div className={styles.blockContent}>{settings.exhibitionHighlights}</div>
          </motion.section>
        )}

        {/* Studio Visit & Direct Inquiry CTA */}
        <motion.div
          className={styles.studioCta}
          initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.85, ease: easeMuseum }}
        >
          <h2 className={styles.studioCtaTitle}>Studio Appointments &amp; Consultations</h2>
          <p className={styles.studioCtaDesc}>
            Collectors and curators are welcome to arrange private studio viewings or discuss bespoke
            commissions directly with the artist.
          </p>
          <button
            type="button"
            className={styles.ctaBtn}
            onClick={() => openInquiry({ inquiryType: 'GeneralContact' })}
          >
            Arrange Studio Consultation
          </button>
        </motion.div>
      </div>
    </div>
  );
};
