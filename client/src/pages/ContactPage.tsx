import React, { useState } from 'react';
import { Check } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { useSettings } from '../context/SettingsContext';
import { publicApi } from '../services/publicApi';
import { cleanArtistName, cleanLocation } from '../utils/textUtils';
import type { CreateInquiryRequest } from '../types';
import styles from './ContactPage.module.css';

export const ContactPage: React.FC = () => {
  const { settings } = useSettings();
  const shouldReduceMotion = useReducedMotion();

  const [clientName, setClientName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [clientLocation, setClientLocation] = useState('');
  const [message, setMessage] = useState('');
  const [honeypot, setHoneypot] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successReference, setSuccessReference] = useState<number | null>(null);

  const artistName = cleanArtistName(settings?.artistName);
  const contactEmail = settings?.contactEmail && !settings.contactEmail.includes('placeholder')
    ? settings.contactEmail
    : 'inquiries@johar-atelier.com';
  const studioLocation = cleanLocation(settings?.studioLocation);
  const instagramHandle = settings?.instagramHandle && !settings.instagramHandle.includes('placeholder')
    ? settings.instagramHandle
    : '@m.ba_shir';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Anti-bot check
    if (honeypot) {
      return;
    }

    if (!clientName.trim() || !email.trim() || !message.trim()) {
      setErrorMsg('Please complete all required fields (Name, Email, and Message).');
      return;
    }

    const payload: CreateInquiryRequest = {
      inquiryType: 'GeneralContact',
      artworkId: null,
      clientName: clientName.trim(),
      email: email.trim(),
      phone: phone.trim() || null,
      clientLocation: clientLocation.trim() || null,
      message: message.trim(),
      honeypot: honeypot || null,
    };

    try {
      setIsSubmitting(true);
      const res = await publicApi.submitInquiry(payload);
      setSuccessReference(res.id);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An error occurred while transmitting your correspondence.';
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
            05 / STUDIO CORRESPONDENCE
          </div>
          <h1 className={styles.title}>Contact the Atelier</h1>
          <p className={styles.subtitle}>
            Direct inquiries from collectors, curators, institutions, and architects are welcomed. Please
            use the secure correspondence form below or reach the studio directly.
          </p>
        </motion.header>

        {/* Two-Column Grid */}
        <div className={styles.grid}>
          {/* Info Column */}
          <motion.aside
            className={styles.infoColumn}
            initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85, ease: easeMuseum }}
          >
            <div className={styles.infoCard}>
              <h2 className={styles.infoTitle}>Atelier Information</h2>

              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Direct Email</span>
                <a href={`mailto:${contactEmail}`} className={styles.infoLink}>
                  {contactEmail}
                </a>
              </div>

              {studioLocation && (
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Studio Location</span>
                  <span className={styles.infoValue}>{studioLocation}</span>
                </div>
              )}

              {instagramHandle && (
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Instagram / Social</span>
                  <a
                    href={`https://instagram.com/${instagramHandle.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.infoLink}
                  >
                    {instagramHandle.startsWith('@') ? instagramHandle : `@${instagramHandle}`}
                  </a>
                </div>
              )}

              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Acquisitions Model</span>
                <span className={styles.infoValue}>
                  Inquiry-based direct acquisition. No automated checkout or third-party cart processing.
                </span>
              </div>
            </div>

            <div className={styles.appointmentsNotice}>
              <strong>Private Studio Appointments:</strong> In-person viewings of works in progress
              and finished pieces are scheduled individually for collectors and curatorial delegates.
            </div>
          </motion.aside>

          {/* Form Column */}
          <motion.div
            className={styles.formCard}
            initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85, ease: easeMuseum, delay: 0.1 }}
          >
            {successReference ? (
              <div className={styles.successView}>
                <div className={styles.successIconBadge}>
                  <Check size={32} />
                </div>
                <h2 className={styles.successTitle}>Correspondence Transmitted</h2>
                <p className={styles.successText}>
                  Your message has been safely delivered to {artistName}. We appreciate your interest
                  and will reply to your inquiry shortly.
                </p>
                <div className={styles.refBadge}>Inquiry Ref #{successReference}</div>
              </div>
            ) : (
              <>
                <div className={styles.formHeader}>
                  <h2 className={styles.formTitle}>Transmit Message</h2>
                  <p className={styles.formDesc}>
                    Please provide your contact details and message for the studio.
                  </p>
                </div>

                {errorMsg && <div className={styles.errorMessage}>{errorMsg}</div>}

                <form className={styles.form} onSubmit={handleSubmit} noValidate>
                  {/* Honeypot anti-bot */}
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
                      <label className={styles.label} htmlFor="contact-name">
                        Full Name *
                      </label>
                      <input
                        id="contact-name"
                        type="text"
                        required
                        className={styles.input}
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                        placeholder="e.g. Clara Oswald"
                      />
                    </div>

                    <div className={styles.field}>
                      <label className={styles.label} htmlFor="contact-email">
                        Email Address *
                      </label>
                      <input
                        id="contact-email"
                        type="email"
                        required
                        className={styles.input}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="e.g. clara@gallery.org"
                      />
                    </div>
                  </div>

                  <div className={styles.twoCol}>
                    <div className={styles.field}>
                      <label className={styles.label} htmlFor="contact-phone">
                        Telephone (Optional)
                      </label>
                      <input
                        id="contact-phone"
                        type="tel"
                        className={styles.input}
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+1 (555) 000-0000"
                      />
                    </div>

                    <div className={styles.field}>
                      <label className={styles.label} htmlFor="contact-location">
                        Location / City (Optional)
                      </label>
                      <input
                        id="contact-location"
                        type="text"
                        className={styles.input}
                        value={clientLocation}
                        onChange={(e) => setClientLocation(e.target.value)}
                        placeholder="e.g. Paris, France"
                      />
                    </div>
                  </div>

                  <div className={styles.field}>
                    <label className={styles.label} htmlFor="contact-message">
                      Message / Correspondence *
                    </label>
                    <textarea
                      id="contact-message"
                      required
                      className={styles.textarea}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      rows={6}
                      placeholder="Share your inquiry, exhibition invitation, or collection interest..."
                    />
                  </div>

                  <button type="submit" disabled={isSubmitting} className={styles.submitBtn}>
                    {isSubmitting ? 'Transmitting...' : 'Send Message'}
                  </button>
                </form>
              </>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};
