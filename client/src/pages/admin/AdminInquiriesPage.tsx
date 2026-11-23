import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { adminApi } from '../../services/adminApi';
import type { InquiryDto, InquiryStatus } from '../../types';
import styles from './AdminInquiriesPage.module.css';

const STATUS_TABS: Array<{ label: string; value?: InquiryStatus }> = [
  { label: 'All Correspondence', value: undefined },
  { label: 'New', value: 'New' },
  { label: 'In Review', value: 'InReview' },
  { label: 'Contacted', value: 'Contacted' },
  { label: 'Completed', value: 'Completed' },
  { label: 'Archived', value: 'Archived' },
];

export const AdminInquiriesPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedStatus = (searchParams.get('status') as InquiryStatus) || undefined;
  const targetIdParam = searchParams.get('id');

  const [inquiries, setInquiries] = useState<InquiryDto[]>([]);
  const [selectedInquiry, setSelectedInquiry] = useState<InquiryDto | null>(null);
  const [mobileActiveView, setMobileActiveView] = useState<'list' | 'detail'>('list');
  const [artistNotes, setArtistNotes] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loadInquiries = useCallback(async () => {
    try {
      setIsLoading(true);
      setErrorMsg(null);
      const res = await adminApi.getInquiries({
        status: selectedStatus,
        pageSize: 50,
      });

      setInquiries(res.items);

      // Select first item or matching id
      if (res.items.length > 0) {
        let match = res.items[0];
        if (targetIdParam) {
          const found = res.items.find((i) => i.id === Number(targetIdParam));
          if (found) match = found;
        }
        setSelectedInquiry(match);
        setArtistNotes(match.artistNotes || '');
      } else {
        setSelectedInquiry(null);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load inquiries.';
      setErrorMsg(msg);
    } finally {
      setIsLoading(false);
    }
  }, [selectedStatus, targetIdParam]);

  useEffect(() => {
    loadInquiries();
  }, [loadInquiries]);

  const handleSelectTab = (statusVal?: InquiryStatus) => {
    const next = new URLSearchParams(searchParams);
    if (statusVal) {
      next.set('status', statusVal);
    } else {
      next.delete('status');
    }
    next.delete('id');
    setSearchParams(next);
    setMobileActiveView('list');
  };

  const handleSelectInquiry = (inq: InquiryDto) => {
    setSelectedInquiry(inq);
    setArtistNotes(inq.artistNotes || '');
    setMobileActiveView('detail');
    const next = new URLSearchParams(searchParams);
    next.set('id', String(inq.id));
    setSearchParams(next);
  };

  const handleStatusChange = async (newStatus: InquiryStatus) => {
    if (!selectedInquiry) return;
    try {
      const updated = await adminApi.updateInquiryStatus(selectedInquiry.id, newStatus);
      setSelectedInquiry(updated);
      setInquiries((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error updating inquiry status.';
      setErrorMsg(msg);
    }
  };

  const handleSaveNotes = async () => {
    if (!selectedInquiry) return;
    try {
      setIsSavingNotes(true);
      const updated = await adminApi.updateInquiryNotes(selectedInquiry.id, artistNotes);
      setSelectedInquiry(updated);
      setInquiries((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error saving private artist notes.';
      setErrorMsg(msg);
    } finally {
      setIsSavingNotes(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.eyebrow}>Collector Communications</div>
        <h1 className={styles.title}>Inquiries Inbox</h1>
      </div>

      {errorMsg && (
        <div className={styles.errorAlert}>
          {errorMsg}
        </div>
      )}

      {/* Filter Tabs */}
      <div className={styles.tabsBar}>
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.label}
            type="button"
            className={`${styles.tabBtn} ${
              selectedStatus === tab.value ? styles.activeTabBtn : ''
            }`}
            onClick={() => handleSelectTab(tab.value)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Mobile Master-Detail View Switcher */}
      <div className={styles.mobileViewToggle} role="group" aria-label="Mobile View Toggle">
        <button
          type="button"
          className={`${styles.mobileToggleBtn} ${mobileActiveView === 'list' ? styles.mobileToggleBtnActive : ''}`}
          onClick={() => setMobileActiveView('list')}
        >
          <span>✉️ Inbox ({inquiries.length})</span>
        </button>
        <button
          type="button"
          className={`${styles.mobileToggleBtn} ${mobileActiveView === 'detail' ? styles.mobileToggleBtnActive : ''}`}
          onClick={() => setMobileActiveView('detail')}
          disabled={!selectedInquiry}
        >
          <span>📄 Dossier {selectedInquiry ? `(${selectedInquiry.clientName.slice(0, 10)})` : ''}</span>
        </button>
      </div>

      {/* Split View: List on Left, Detail on Right */}
      <div className={`${styles.splitView} ${mobileActiveView === 'list' ? styles.showMobileList : styles.showMobileDetail}`}>
        {/* Inbox List */}
        <div className={styles.inboxList}>
          {inquiries.length > 0 ? (
            inquiries.map((inq) => (
              <div
                key={inq.id}
                className={`${styles.inquiryItem} ${
                  selectedInquiry?.id === inq.id ? styles.selectedItem : ''
                }`}
                onClick={() => handleSelectInquiry(inq)}
              >
                <div className={styles.itemHeader}>
                  <span className={styles.clientName}>{inq.clientName}</span>
                  <span className={styles.date}>
                    {new Date(inq.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div className={styles.subjectLine}>
                  {inq.artworkTitle ? `Inquiry: ${inq.artworkTitle}` : inq.inquiryType}
                </div>

                <div className={styles.snippet}>{inq.message}</div>
              </div>
            ))
          ) : (
            <div className={styles.emptyInbox}>
              {isLoading ? 'Accessing correspondence...' : 'No correspondence matching active status filter.'}
            </div>
          )}
        </div>

        {/* Detail Panel */}
        {selectedInquiry ? (
          <div className={styles.detailCard}>
            <button
              type="button"
              className={styles.mobileBackBtn}
              onClick={() => setMobileActiveView('list')}
              aria-label="Back to inquiries list"
            >
              <ChevronLeft size={13} />
              <span>Back to Inquiries List</span>
            </button>

            <div className={styles.detailHeader}>
              <div>
                <h2 className={styles.detailClientName}>
                  {selectedInquiry.clientName}
                </h2>
                <div className={styles.clientContactRow}>
                  <a href={`mailto:${selectedInquiry.email}`} className={styles.clientEmailLink}>
                    {selectedInquiry.email}
                  </a>
                  {selectedInquiry.phone && <span>• {selectedInquiry.phone}</span>}
                </div>
              </div>

              {/* Status Selector */}
              <div>
                <label className="sr-only" htmlFor="inquiry-status-select">
                  Inquiry Status
                </label>
                <select
                  id="inquiry-status-select"
                  value={selectedInquiry.status}
                  onChange={(e) => handleStatusChange(e.target.value as InquiryStatus)}
                  className={styles.statusSelect}
                >
                  <option value="New">Status: New</option>
                  <option value="InReview">Status: In Review</option>
                  <option value="Contacted">Status: Contacted</option>
                  <option value="Completed">Status: Completed</option>
                  <option value="Archived">Status: Archived</option>
                </select>
              </div>
            </div>

            {/* Linked Artwork Snippet if contextual */}
            {selectedInquiry.artworkTitle && (
              <div className={styles.artworkSnippet}>
                {selectedInquiry.artworkThumbnailUrl && (
                  <img
                    src={selectedInquiry.artworkThumbnailUrl}
                    alt={selectedInquiry.artworkTitle}
                    className={styles.artworkThumb}
                  />
                )}
                <div>
                  <div className={styles.artworkLabel}>
                    Inquired Specimen
                  </div>
                  <div className={styles.artworkTitle}>
                    {selectedInquiry.artworkTitle}
                  </div>
                  {selectedInquiry.artworkSlug && (
                    <Link
                      to={`/gallery/${selectedInquiry.artworkSlug}`}
                      target="_blank"
                      className={styles.artworkLink}
                    >
                      View in Public Gallery &rarr;
                    </Link>
                  )}
                </div>
              </div>
            )}

            {/* Metadata Grid */}
            <div className={styles.metaGrid}>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Inquiry Type</span>
                <span>{selectedInquiry.inquiryType}</span>
              </div>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Date Received</span>
                <span>{new Date(selectedInquiry.createdAt).toLocaleString()}</span>
              </div>
              {selectedInquiry.clientLocation && (
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>Client Location</span>
                  <span>{selectedInquiry.clientLocation}</span>
                </div>
              )}
              {selectedInquiry.mediumPreference && (
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>Medium Preference</span>
                  <span>{selectedInquiry.mediumPreference}</span>
                </div>
              )}
              {selectedInquiry.desiredDimensions && (
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>Desired Dimensions</span>
                  <span>{selectedInquiry.desiredDimensions}</span>
                </div>
              )}
              {selectedInquiry.desiredTimeline && (
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>Target Timeline</span>
                  <span>{selectedInquiry.desiredTimeline}</span>
                </div>
              )}
            </div>

            {/* Full Message */}
            <div className={styles.messageSection}>
              <div className={styles.sectionLabel}>
                Collector Correspondence
              </div>
              <div className={styles.messageBox}>{selectedInquiry.message}</div>
            </div>

            {/* Private Artist Notes */}
            <div className={styles.notesBox}>
              <div className={styles.sectionLabel}>
                Private Atelier Notes (Not visible to collector)
              </div>
              <textarea
                className={styles.notesInput}
                value={artistNotes}
                onChange={(e) => setArtistNotes(e.target.value)}
                placeholder="Log private notes, telephone discussions, crating quotes, or viewing arrangements..."
              />
              <button
                type="button"
                className={styles.notesSaveBtn}
                onClick={handleSaveNotes}
                disabled={isSavingNotes}
              >
                {isSavingNotes ? 'Saving Notes...' : 'Save Notes'}
              </button>
            </div>
          </div>
        ) : (
          <div className={styles.emptyDossier}>
            Select a collector inquiry from the left to examine dossier.
          </div>
        )}
      </div>
    </div>
  );
};
