import React, { useState } from 'react';
import { Check } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { publicApi } from '../services/publicApi';
import type { CreateInquiryRequest } from '../types';
import styles from './CommissionsPage.module.css';

const MEDIUM_OPTIONS = [
  'Oil on Canvas',
  'Oil on Archival Wood Panel',
  'Watercolor on 300gsm Cotton',
  'Classical Calligraphy',
  'Modern Expressive Calligraphy',
  'Pencil / Charcoal Study',
  'Figurative Portrait',
  'Open to Artist Direction',
];

export const CommissionsPage: React.FC = () => {
  const shouldReduceMotion = useReducedMotion();

  const [clientName, setClientName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [clientLocation, setClientLocation] = useState('');
  const [mediumPreference, setMediumPreference] = useState('Oil on Canvas');
  const [desiredDimensions, setDesiredDimensions] = useState('');
  const [desiredTimeline, setDesiredTimeline] = useState('');
  const [message, setMessage] = useState('');
  const [honeypot, setHoneypot] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successReference, setSuccessReference] = useState<number | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Anti-bot check
    if (honeypot) {
      return;
    }

    if (!clientName.trim() || !email.trim() || !message.trim()) {
      setErrorMsg('Please complete all required fields (Name, Email, and Project Vision).');
      return;
    }

    const payload: CreateInquiryRequest = {
      inquiryType: 'CommissionRequest',
      artworkId: null,
      clientName: clientName.trim(),
      email: email.trim(),
      phone: phone.trim() || null,
      clientLocation: clientLocation.trim() || null,
      mediumPreference,
      desiredDimensions: desiredDimensions.trim() || null,
      desiredTimeline: desiredTimeline.trim() || null,
      message: message.trim(),
      honeypot: honeypot || null,
    };

    try {
      setIsSubmitting(true);
      const res = await publicApi.submitInquiry(payload);
      setSuccessReference(res.id);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An error occurred while submitting your commission inquiry.';
      setErrorMsg(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

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
            04 / BESPOKE STUDIO ACQUISITIONS
          </div>
          <h1 className={styles.title}>Private Commissions</h1>
          <p className={styles.description}>
            The atelier accepts a limited number of bespoke commissions each year for private residences,
            curated collections, and architectural installations. Every commissioned piece is developed
            in direct dialogue with the artist.
          </p>
        </motion.header>

        {/* Configurable Commission Process Steps */}
        <motion.section
          className={styles.processSection}
          aria-labelledby="process-title"
          initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.85, ease: easeMuseum }}
        >
          <h2 id="process-title" className={styles.processHeading}>
            The Commission Dialogue
          </h2>
          <div className={styles.stepsGrid}>
            <div className={styles.stepCard}>
              <div className={styles.stepNumber}>PHASE I</div>
              <h3 className={styles.stepTitle}>Consultation &amp; Intent</h3>
              <p className={styles.stepDesc}>
                We explore the conceptual vision, spatial context, medium selection, and ideal canvas
                dimensions to ensure alignment with the artist’s aesthetic vocabulary.
              </p>
            </div>

            <div className={styles.stepCard}>
              <div className={styles.stepNumber}>PHASE II</div>
              <h3 className={styles.stepTitle}>Creation &amp; Execution</h3>
              <p className={styles.stepDesc}>
                The piece is developed in the atelier using master-grade pigments, hand-stretched Belgian
                linen, or archival cotton paper, balancing spontaneous gesture with classical refinement.
              </p>
            </div>

            <div className={styles.stepCard}>
              <div className={styles.stepNumber}>PHASE III</div>
              <h3 className={styles.stepTitle}>Completion &amp; Provenance</h3>
              <p className={styles.stepDesc}>
                Upon final curing and varnishing, the artwork is cataloged with a permanent studio
                archival reference, signed by the artist, and prepared for private collection handover.
              </p>
            </div>
          </div>
        </motion.section>

        {/* Commission Form Section */}
        <motion.section
          className={styles.formSection}
          aria-labelledby="form-heading"
          initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.85, ease: easeMuseum }}
        >
          {successReference ? (
            <div className={styles.successView}>
              <div className={styles.successIconBadge}>
                <Check size={32} />
              </div>
              <h2 className={styles.successTitle}>Commission Brief Received</h2>
              <p className={styles.successText}>
                Thank you for your interest in commissioning an original artwork. The artist will review
                your project parameters and respond with curatorial availability and schedule details.
              </p>
              <div className={styles.refBadge}>Commission Dossier #{successReference}</div>
            </div>
          ) : (
            <>
              <div className={styles.formHeader}>
                <h2 id="form-heading" className={styles.formTitle}>
                  Submit a Commission Proposal
                </h2>
                <p className={styles.formDesc}>
                  Please share your vision, intended medium, and spatial requirements below.
                </p>
              </div>

              {errorMsg && <div className={styles.errorMessage}>{errorMsg}</div>}

              <form className={styles.form} onSubmit={handleSubmit} noValidate>
                {/* Honeypot field */}
                <input
                  type="text"
                  name="atelier_honeypot"
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                  className={styles.honeypot}
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden="true"
                />

                <div className={styles.twoCol}>
                  <div className={styles.field}>
                    <label className={styles.label} htmlFor="comm-name">
                      Full Name *
                    </label>
                    <input
                      id="comm-name"
                      type="text"
                      required
                      className={styles.input}
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      placeholder="e.g. Julian Sterling"
                    />
                  </div>

                  <div className={styles.field}>
                    <label className={styles.label} htmlFor="comm-email">
                      Email Address *
                    </label>
                    <input
                      id="comm-email"
                      type="email"
                      required
                      className={styles.input}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. julian@sterling.com"
                    />
                  </div>
                </div>

                <div className={styles.twoCol}>
                  <div className={styles.field}>
                    <label className={styles.label} htmlFor="comm-phone">
                      Telephone (Optional)
                    </label>
                    <input
                      id="comm-phone"
                      type="tel"
                      className={styles.input}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>

                  <div className={styles.field}>
                    <label className={styles.label} htmlFor="comm-location">
                      Location / Architectural Context (Optional)
                    </label>
                    <input
                      id="comm-location"
                      type="text"
                      className={styles.input}
                      value={clientLocation}
                      onChange={(e) => setClientLocation(e.target.value)}
                      placeholder="e.g. Zurich, Switzerland"
                    />
                  </div>
                </div>

                {/* Medium Preference Selector */}
                <div className={styles.field}>
                  <label className={styles.label}>
                    Medium Preference
                  </label>
                  <div className={styles.mediumPills} role="radiogroup" aria-label="Medium preference">
                    {MEDIUM_OPTIONS.map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        role="radio"
                        aria-checked={mediumPreference === opt}
                        className={`${styles.mediumPill} ${
                          mediumPreference === opt ? styles.activeMediumPill : ''
                        }`}
                        onClick={() => setMediumPreference(opt)}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                <div className={styles.twoCol}>
                  <div className={styles.field}>
                    <label className={styles.label} htmlFor="comm-dimensions">
                      Desired Dimensions (Optional)
                    </label>
                    <input
                      id="comm-dimensions"
                      type="text"
                      className={styles.input}
                      value={desiredDimensions}
                      onChange={(e) => setDesiredDimensions(e.target.value)}
                      placeholder="e.g. 120 × 90 cm or site-specific"
                    />
                  </div>

                  <div className={styles.field}>
                    <label className={styles.label} htmlFor="comm-timeline">
                      Target Timeline (Optional)
                    </label>
                    <input
                      id="comm-timeline"
                      type="text"
                      className={styles.input}
                      value={desiredTimeline}
                      onChange={(e) => setDesiredTimeline(e.target.value)}
                      placeholder="e.g. Autumn exhibition or residence completion"
                    />
                  </div>
                </div>

                <div className={styles.field}>
                  <label className={styles.label} htmlFor="comm-message">
                    Project Vision &amp; Spatial Requirements *
                  </label>
                  <textarea
                    id="comm-message"
                    required
                    className={styles.textarea}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={6}
                    placeholder="Describe your aesthetic vision, color notes, interior lighting conditions, and any personal themes for the artwork..."
                  />
                </div>

                <button type="submit" disabled={isSubmitting} className={styles.submitBtn}>
                  {isSubmitting ? 'Transmitting Proposal...' : 'Submit Commission Proposal'}
                </button>

                <p className={styles.disclaimer}>
                  Every commission is governed by personal contract between artist and collector.
                  Payment milestones, crating, and delivery are arranged directly. No automated billing
                  occurs on this platform.
                </p>
              </form>
            </>
          )}
        </motion.section>
      </div>
    </div>
  );
};
