import React, { useEffect, useState, useRef } from 'react';
import { Upload, Trash2, Check } from 'lucide-react';
import { adminApi } from '../../services/adminApi';
import { useSettings } from '../../context/SettingsContext';
import type { UpdateSiteSettingsDto } from '../../types';
import styles from './AdminProfilePage.module.css';

export const AdminProfilePage: React.FC = () => {
  const { refreshSettings } = useSettings();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingPortrait, setIsUploadingPortrait] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Portrait State
  const [portraitUrl, setPortraitUrl] = useState<string | null>(null);
  const [portraitAlt, setPortraitAlt] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Content Fields
  const [artistName, setArtistName] = useState('');
  const [homeIntroText, setHomeIntroText] = useState('');
  const [artistStatement, setArtistStatement] = useState('');
  const [aboutBiography, setAboutBiography] = useState('');
  const [techniquesAndMaterials, setTechniquesAndMaterials] = useState('');
  const [exhibitionHighlights, setExhibitionHighlights] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [studioLocation, setStudioLocation] = useState('');
  const [instagramHandle, setInstagramHandle] = useState('');

  useEffect(() => {
    async function loadSettings() {
      try {
        setIsLoading(true);
        setErrorMsg(null);
        const data = await adminApi.getSettings();

        setArtistName(data.artistName);
        setPortraitUrl(data.profilePictureUrl || null);
        setPortraitAlt(data.profilePictureAlt || '');
        setHomeIntroText(data.homeIntroText || '');
        setArtistStatement(data.artistStatement || '');
        setAboutBiography(data.aboutBiography || '');
        setTechniquesAndMaterials(data.techniquesAndMaterials || '');
        setExhibitionHighlights(data.exhibitionHighlights || '');
        setContactEmail(data.contactEmail);
        setStudioLocation(data.studioLocation || '');
        setInstagramHandle(data.instagramHandle || '');
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Failed to load site settings.';
        setErrorMsg(msg);
      } finally {
        setIsLoading(false);
      }
    }

    loadSettings();
  }, []);

  const handleSaveTextSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!artistName.trim() || !contactEmail.trim()) {
      setErrorMsg('Artist Name and Contact Email are required.');
      return;
    }

    const payload: UpdateSiteSettingsDto = {
      artistName: artistName.trim(),
      homeIntroText: homeIntroText.trim() || null,
      artistStatement: artistStatement.trim() || null,
      aboutBiography: aboutBiography.trim() || null,
      techniquesAndMaterials: techniquesAndMaterials.trim() || null,
      exhibitionHighlights: exhibitionHighlights.trim() || null,
      contactEmail: contactEmail.trim(),
      studioLocation: studioLocation.trim() || null,
      instagramHandle: instagramHandle.trim() || null,
      profilePictureAlt: portraitAlt.trim() || null,
    };

    try {
      setIsSaving(true);
      await adminApi.updateSettings(payload);
      await refreshSettings();
      setSuccessMsg('Atelier profile and content successfully saved.');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error updating settings.';
      setErrorMsg(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePortraitUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingPortrait(true);
      setErrorMsg(null);
      setSuccessMsg(null);
      const res = await adminApi.uploadPortrait(file, portraitAlt.trim() || undefined);
      setPortraitUrl(res.profilePictureUrl || null);
      await refreshSettings();
      setSuccessMsg('Artist portrait updated.');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to upload artist portrait.';
      setErrorMsg(msg);
    } finally {
      setIsUploadingPortrait(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDeletePortrait = async () => {
    if (!window.confirm('Remove current artist profile portrait?')) return;

    try {
      setErrorMsg(null);
      setSuccessMsg(null);
      await adminApi.deletePortrait();
      setPortraitUrl(null);
      await refreshSettings();
      setSuccessMsg('Artist portrait removed.');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete portrait.';
      setErrorMsg(msg);
    }
  };

  if (isLoading) {
    return (
      <div className={styles.loadingBox}>
        Accessing atelier profile &amp; settings...
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.eyebrow}>Curatorial Identity &amp; Content</div>
        <h1 className={styles.title}>Artist Profile &amp; Atelier Settings</h1>
      </div>

      {successMsg && (
        <div className={styles.successAlert}>
          <Check size={16} />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className={styles.errorAlert}>
          {errorMsg}
        </div>
      )}

      {/* Artist Profile Photograph Section */}
      <section className={styles.card} aria-labelledby="portrait-section-title">
        <h2 id="portrait-section-title" className={styles.sectionTitle}>
          Artist Profile Portrait
        </h2>

        <div className={styles.portraitRow}>
          <div className={styles.portraitThumb}>
            {portraitUrl ? (
              <img src={portraitUrl} alt={portraitAlt || 'Artist portrait'} className={styles.portraitImg} />
            ) : (
              <span className={styles.noPortrait}>
                No Portrait
              </span>
            )}
          </div>

          <div className={styles.portraitActions}>
            <div className={styles.portraitNote}>
              Smart facial centering (<code>g_face, c_fill</code>) is applied exclusively to this portrait.
              Artwork images are never cropped. Max 15MB (.jpg, .png, .webp).
            </div>

            <div className={styles.portraitBtnGroup}>
              <input
                ref={fileInputRef}
                type="file"
                id="portrait-file"
                accept=".jpg,.jpeg,.png,.webp"
                style={{ display: 'none' }}
                onChange={handlePortraitUpload}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingPortrait}
                className={styles.uploadBtn}
              >
                <Upload size={14} />
                <span>{isUploadingPortrait ? 'Uploading Portrait...' : portraitUrl ? 'Replace Portrait' : 'Upload Portrait'}</span>
              </button>

              {portraitUrl && (
                <button
                  type="button"
                  onClick={handleDeletePortrait}
                  className={styles.deletePortraitBtn}
                >
                  <Trash2 size={14} />
                  <span>Remove Portrait</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Narrative & Content Form */}
      <form onSubmit={handleSaveTextSettings} className={styles.card}>
        <h2 className={styles.sectionTitle}>Curatorial Narrative &amp; Statements</h2>

        <div className={styles.formGrid}>
          <div className={styles.field}>
            <label className={styles.label}>Artist Full Name *</label>
            <input
              type="text"
              required
              className={styles.input}
              value={artistName}
              onChange={(e) => setArtistName(e.target.value)}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Contact Email *</label>
            <input
              type="email"
              required
              className={styles.input}
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Studio Working Location</label>
            <input
              type="text"
              className={styles.input}
              value={studioLocation}
              onChange={(e) => setStudioLocation(e.target.value)}
              placeholder="e.g. Kyoto, Japan / Florence, Italy"
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Instagram / Social Handle</label>
            <input
              type="text"
              className={styles.input}
              value={instagramHandle}
              onChange={(e) => setInstagramHandle(e.target.value)}
              placeholder="e.g. @artist.atelier"
            />
          </div>

          <div className={`${styles.field} ${styles.fullCol}`}>
            <label className={styles.label}>Homepage Intro Headline Text</label>
            <textarea
              rows={3}
              className={styles.textarea}
              value={homeIntroText}
              onChange={(e) => setHomeIntroText(e.target.value)}
              placeholder="A brief greeting or artistic philosophy displayed prominently on the homepage..."
            />
          </div>

          <div className={`${styles.field} ${styles.fullCol}`}>
            <label className={styles.label}>Artist Statement</label>
            <textarea
              rows={5}
              className={styles.textarea}
              value={artistStatement}
              onChange={(e) => setArtistStatement(e.target.value)}
              placeholder="Formal artistic statement for exhibitions and collectors..."
            />
          </div>

          <div className={`${styles.field} ${styles.fullCol}`}>
            <label className={styles.label}>Biography &amp; Background</label>
            <textarea
              rows={6}
              className={styles.textarea}
              value={aboutBiography}
              onChange={(e) => setAboutBiography(e.target.value)}
              placeholder="Comprehensive biographical narrative spanning early training, master ateliers..."
            />
          </div>

          <div className={`${styles.field} ${styles.fullCol}`}>
            <label className={styles.label}>Techniques, Pigments &amp; Substrates</label>
            <textarea
              rows={4}
              className={styles.textarea}
              value={techniquesAndMaterials}
              onChange={(e) => setTechniquesAndMaterials(e.target.value)}
              placeholder="Details on pigment preparation, walnut oil processing, Belgian linen priming..."
            />
          </div>

          <div className={`${styles.field} ${styles.fullCol}`}>
            <label className={styles.label}>Exhibitions &amp; Museum Inclusions</label>
            <textarea
              rows={5}
              className={styles.textarea}
              value={exhibitionHighlights}
              onChange={(e) => setExhibitionHighlights(e.target.value)}
              placeholder="Chronological exhibition list: year, venue, city..."
            />
          </div>
        </div>

        <button type="submit" disabled={isSaving} className={styles.saveBtn}>
          {isSaving ? 'Saving Atelier Profile...' : 'Save Profile & Settings'}
        </button>
      </form>
    </div>
  );
};
