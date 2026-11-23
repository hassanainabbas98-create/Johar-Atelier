import React, { useState, useEffect } from 'react';
import { X, Feather, Check } from 'lucide-react';
import styles from './AtelierGuestbookModal.module.css';

interface GuestbookEntry {
  id: string;
  name: string;
  city: string;
  impression: string;
  date: string;
}

interface AtelierGuestbookModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DEFAULT_IMPRESSIONS: GuestbookEntry[] = [
  {
    id: '1',
    name: 'Elena Rostova',
    city: 'Zurich',
    impression: 'The poetic stillness in the watercolor compositions is utterly sublime. A true sanctuary of light.',
    date: '2026',
  },
  {
    id: '2',
    name: 'Julian Vance',
    city: 'London',
    impression: 'Standing in this digital hall feels like a private evening at the Courtauld. The framing and atmosphere are perfection.',
    date: '2026',
  },
  {
    id: '3',
    name: 'Henrietta De Clermont',
    city: 'Paris',
    impression: 'Johar’s mastery of the brush and the dignified archival pacing honor the finest European atelier traditions.',
    date: '2026',
  },
];

export const AtelierGuestbookModal: React.FC<AtelierGuestbookModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [entries, setEntries] = useState<GuestbookEntry[]>(DEFAULT_IMPRESSIONS);
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [impression, setImpression] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('johar_atelier_guestbook');
      if (stored) {
        setEntries(JSON.parse(stored));
      }
    } catch {
      // fallback to defaults
    }
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !impression.trim()) return;

    const newEntry: GuestbookEntry = {
      id: Date.now().toString(),
      name: name.trim(),
      city: city.trim() || 'Collector',
      impression: impression.trim(),
      date: '2026',
    };

    const updated = [newEntry, ...entries];
    setEntries(updated);
    try {
      localStorage.setItem('johar_atelier_guestbook', JSON.stringify(updated));
    } catch {
      // ignore
    }

    setName('');
    setCity('');
    setImpression('');
    setIsSubmitted(true);
    setTimeout(() => setIsSubmitted(false), 3000);
  };

  return (
    <div className={styles.modalBackdrop} onClick={onClose} role="dialog" aria-modal="true">
      <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.modalHeader}>
          <div className={styles.headerTitleGroup}>
            <span className={styles.headerSubtitle}>Atelier Sanctuary Register</span>
            <h2 className={styles.headerTitle}>Curatorial Guestbook & Impressions</h2>
          </div>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Close Guestbook"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className={styles.modalContent}>
          {/* Sign Form */}
          <form className={styles.guestbookForm} onSubmit={handleSubmit}>
            <div className={styles.formRow}>
              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>Your Name / Collector Reference</label>
                <input
                  type="text"
                  className={styles.inputField}
                  placeholder="e.g. Lord Alexander M."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>City / Atelier Residence</label>
                <input
                  type="text"
                  className={styles.inputField}
                  placeholder="e.g. Vienna, Milan, New York"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.inputLabel}>Your Archival Impression</label>
              <textarea
                className={styles.textareaField}
                placeholder="Share a reflection on Johar's works or the sanctuary atmosphere..."
                value={impression}
                onChange={(e) => setImpression(e.target.value)}
                required
              />
            </div>

            <button type="submit" className={styles.submitBtn}>
              {isSubmitted ? (
                <>
                  <Check size={13} />
                  <span>Impression Inscribed</span>
                </>
              ) : (
                <>
                  <Feather size={13} />
                  <span>Inscribe in Register</span>
                </>
              )}
            </button>
          </form>

          {/* Past Impressions List */}
          <div className={styles.impressionsSection}>
            <h4 className={styles.sectionHeading}>Atelier Chronicle & Visitor Entries</h4>
            <div className={styles.impressionsList}>
              {entries.map((entry) => (
                <div key={entry.id} className={styles.impressionCard}>
                  <p className={styles.impressionQuote}>"{entry.impression}"</p>
                  <span className={styles.impressionAuthor}>
                    — {entry.name} · {entry.city} · {entry.date}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
