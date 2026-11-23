import React, { useState, useEffect, useRef } from 'react';
import { X, Check } from 'lucide-react';
import { useInquiry } from '../context/InquiryContext';
import { publicApi } from '../services/publicApi';
import type { CreateInquiryRequest, InquiryType } from '../types';
import styles from './InquiryDrawer.module.css';

export const InquiryDrawer: React.FC = () => {
  const { isOpen, contextData, closeInquiry } = useInquiry();
  const drawerRef = useRef<HTMLDivElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  const [clientName, setClientName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [clientLocation, setClientLocation] = useState('');
  const [message, setMessage] = useState('');
  const [honeypot, setHoneypot] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successReference, setSuccessReference] = useState<number | null>(null);

  // Reset form when drawer opens or closes
  useEffect(() => {
    if (isOpen) {
      setErrorMsg(null);
      setSuccessReference(null);

      // Pre-fill message based on context
      if (contextData?.artworkTitle) {
        setMessage(
          `Dear Atelier,\n\nI am writing to inquire regarding the availability and acquisition details of "${contextData.artworkTitle}"${
            contextData.catalogReference ? ` (Ref. ${contextData.catalogReference})` : ''
          }.\n\nPlease let me know the provenance, current availability, and potential viewing arrangements.`
        );
      } else if (contextData?.inquiryType === 'CommissionRequest') {
        setMessage(
          `Dear Atelier,\n\nI would like to discuss a potential bespoke artwork commission. My vision involves...`
        );
      } else {
        setMessage('');
      }

      // Auto-focus first input
      setTimeout(() => {
        nameInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen, contextData]);

  // Trap Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        closeInquiry();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closeInquiry]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Anti-bot check
    if (honeypot) {
      closeInquiry();
      return;
    }

    if (!clientName.trim() || !email.trim() || !message.trim()) {
      setErrorMsg('Please complete all required fields.');
      return;
    }

    const payload: CreateInquiryRequest = {
      inquiryType: (contextData?.inquiryType as InquiryType) || 'GeneralContact',
      artworkId: contextData?.artworkId || null,
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
      const msg = err instanceof Error ? err.message : 'An error occurred while transmitting your inquiry.';
      setErrorMsg(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className={`${styles.backdrop} ${isOpen ? styles.backdropOpen : ''}`}
      onClick={(e) => {
        if (e.target === e.currentTarget) closeInquiry();
      }}
      aria-hidden={!isOpen}
    >
      <div
        ref={drawerRef}
        className={`${styles.drawer} ${isOpen ? styles.drawerOpen : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Atelier Inquiry Form"
      >
        {/* Header */}
        <div className={styles.header}>
          <h2 className={styles.title}>
            {contextData?.artworkTitle ? 'Artwork Inquiry' : 'Studio Correspondence'}
          </h2>
          <button
            type="button"
            className={styles.closeButton}
            onClick={closeInquiry}
            aria-label="Close Inquiry Drawer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Body */}
        <div className={styles.body}>
          {successReference ? (
            <div className={styles.successView}>
              <div className={styles.successIconBadge}>
                <Check size={28} />
              </div>
              <h3 className={styles.successTitle}>Inquiry Recorded</h3>
              <p className={styles.successText}>
                Your inquiry has been safely transmitted to the atelier. The artist or curatorial
                representative will personally review your correspondence and respond directly.
              </p>
              <div className={styles.refBadge}>Reference #{successReference}</div>
              <button
                type="button"
                className={styles.submitBtn}
                style={{ marginTop: 'var(--space-6)' }}
                onClick={closeInquiry}
              >
                Return to Gallery
              </button>
            </div>
          ) : (
            <>
              {/* Contextual Artwork Header if inquiring about specific piece */}
              {contextData?.artworkTitle && (
                <div className={styles.artworkContext}>
                  <div className={styles.artworkContextLabel}>Selected Piece</div>
                  <div className={styles.artworkContextTitle}>{contextData.artworkTitle}</div>
                  {contextData.catalogReference && (
                    <div className={styles.artworkContextRef}>
                      Catalog Ref: {contextData.catalogReference}
                    </div>
                  )}
                </div>
              )}

              {errorMsg && <div className={styles.errorMessage}>{errorMsg}</div>}

              <form className={styles.form} onSubmit={handleSubmit} noValidate>
                {/* Honeypot field for spam prevention */}
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

                <div className={styles.field}>
                  <label className={styles.label} htmlFor="inquiry-name">
                    Full Name *
                  </label>
                  <input
                    ref={nameInputRef}
                    id="inquiry-name"
                    type="text"
                    required
                    className={styles.input}
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="e.g. Eleanor Vance"
                  />
                </div>

                <div className={styles.field}>
                  <label className={styles.label} htmlFor="inquiry-email">
                    Email Address *
                  </label>
                  <input
                    id="inquiry-email"
                    type="email"
                    required
                    className={styles.input}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. eleanor@collection.com"
                  />
                </div>

                <div className={styles.field}>
                  <label className={styles.label} htmlFor="inquiry-phone">
                    Telephone (Optional)
                  </label>
                  <input
                    id="inquiry-phone"
                    type="tel"
                    className={styles.input}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                  />
                </div>

                <div className={styles.field}>
                  <label className={styles.label} htmlFor="inquiry-location">
                    Location / City (Optional)
                  </label>
                  <input
                    id="inquiry-location"
                    type="text"
                    className={styles.input}
                    value={clientLocation}
                    onChange={(e) => setClientLocation(e.target.value)}
                    placeholder="e.g. London, United Kingdom"
                  />
                </div>

                <div className={styles.field}>
                  <label className={styles.label} htmlFor="inquiry-message">
                    Message / Inquiry Details *
                  </label>
                  <textarea
                    id="inquiry-message"
                    required
                    className={styles.textarea}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={5}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={styles.submitBtn}
                >
                  {isSubmitting ? 'Transmitting...' : 'Send Inquiry to Atelier'}
                </button>

                <p className={styles.disclaimer}>
                  Every artwork acquisition is handled directly through direct artist correspondence.
                  No financial or credit transactions take place on this platform.
                </p>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
