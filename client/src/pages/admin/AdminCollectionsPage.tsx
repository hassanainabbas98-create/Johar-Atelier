import React, { useEffect, useState, useCallback } from 'react';
import { Plus, Edit2, Trash2, X } from 'lucide-react';
import { adminApi } from '../../services/adminApi';
import type { CollectionDto, CollectionUpsertDto } from '../../types';
import styles from './AdminCollectionsPage.module.css';

export const AdminCollectionsPage: React.FC = () => {
  const [collections, setCollections] = useState<CollectionDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [curatorNote, setCuratorNote] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [displayOrder, setDisplayOrder] = useState<number>(0);
  const [isPublished, setIsPublished] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  const loadCollections = useCallback(async () => {
    try {
      setIsLoading(true);
      setErrorMsg(null);
      const data = await adminApi.getCollections();
      setCollections(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load collections.';
      setErrorMsg(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCollections();
  }, [loadCollections]);

  const openCreateModal = () => {
    setEditingId(null);
    setTitle('');
    setSlug('');
    setCuratorNote('');
    setCoverImageUrl('');
    setDisplayOrder(0);
    setIsPublished(true);
    setModalError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (col: CollectionDto) => {
    setEditingId(col.id);
    setTitle(col.title);
    setSlug(col.slug);
    setCuratorNote(col.curatorNote || '');
    setCoverImageUrl(col.coverImageUrl || '');
    setDisplayOrder(col.displayOrder);
    setIsPublished(col.isPublished);
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);

    if (!title.trim()) {
      setModalError('Title is required.');
      return;
    }

    const payload: CollectionUpsertDto = {
      title: title.trim(),
      slug: slug.trim() || null,
      curatorNote: curatorNote.trim() || null,
      coverImageUrl: coverImageUrl.trim() || null,
      displayOrder: Number(displayOrder),
      isPublished,
    };

    try {
      setIsSaving(true);
      if (editingId) {
        await adminApi.updateCollection(editingId, payload);
      } else {
        await adminApi.createCollection(payload);
      }
      setIsModalOpen(false);
      await loadCollections();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error saving collection.';
      setModalError(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!window.confirm(`Are you sure you want to delete the collection "${name}"?`)) {
      return;
    }

    try {
      setErrorMsg(null);
      await adminApi.deleteCollection(id);
      await loadCollections();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error deleting collection.';
      setErrorMsg(msg);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <div className={styles.eyebrow}>Thematic Series Taxonomy</div>
          <h1 className={styles.title}>Collections Manager</h1>
        </div>

        <button type="button" className={styles.createBtn} onClick={openCreateModal}>
          <Plus size={15} />
          <span>New Collection</span>
        </button>
      </div>

      {errorMsg && (
        <div className={styles.errorAlert}>
          {errorMsg}
        </div>
      )}

      <div className={styles.tableCard}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.th}>Title &amp; Slug</th>
              <th className={styles.th}>Curator Note</th>
              <th className={styles.th}>Works Count</th>
              <th className={styles.th}>Order</th>
              <th className={styles.th}>Status</th>
              <th className={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {collections.length > 0 ? (
              collections.map((col) => (
                <tr key={col.id} className={styles.tr}>
                  <td className={styles.td}>
                    <div className={styles.colTitle}>{col.title}</div>
                    <div className={styles.colSlug}>
                      /{col.slug}
                    </div>
                  </td>
                  <td className={`${styles.td} ${styles.curatorNoteCell}`}>
                    {col.curatorNote || <span style={{ opacity: 0.4, fontStyle: 'italic' }}>None recorded</span>}
                  </td>
                  <td className={styles.td}>
                    <span style={{ fontWeight: 600, color: 'var(--color-eclipse-ink)' }}>{col.artworkCount} Pieces</span>
                  </td>
                  <td className={styles.td} style={{ fontFamily: 'var(--font-mono)' }}>
                    {col.displayOrder}
                  </td>
                  <td className={styles.td}>
                    <span
                      className={`${styles.statusBadge} ${
                        col.isPublished ? styles.statusActive : styles.statusDraft
                      }`}
                    >
                      {col.isPublished ? '✓ Published' : 'Draft'}
                    </span>
                  </td>
                  <td className={styles.td}>
                    <div className={styles.actionsCell}>
                      <button
                        type="button"
                        onClick={() => openEditModal(col)}
                        className={styles.actionIconBtn}
                        title="Edit Collection"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(col.id, col.title)}
                        className={`${styles.actionIconBtn} ${styles.deleteBtn}`}
                        title="Delete Collection"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className={styles.emptyText}>
                  {isLoading ? 'Accessing collections...' : 'No collections configured. Click "New Collection" to create one.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsModalOpen(false)}>
          <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div className={styles.modalTitleGroup}>
                <span className={styles.modalEyebrow}>
                  {editingId ? `Series Specimen #${editingId}` : 'Thematic Taxonomy'}
                </span>
                <h2 className={styles.modalTitle}>
                  {editingId ? 'Edit Thematic Collection' : 'Create New Collection'}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className={styles.closeBtn}
                title="Close"
              >
                <X size={18} />
              </button>
            </div>

            {modalError && (
              <div className={styles.modalError}>
                {modalError}
              </div>
            )}

            <form onSubmit={handleSave} className={styles.form}>
              <div className={styles.field}>
                <label className={styles.label}>Collection Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Nocturnes &amp; Solitude"
                  className={styles.input}
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label}>URL Slug (Optional — auto-generated from title)</label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="e.g. nocturnes-and-solitude"
                  className={styles.input}
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Curator Note / Theme Overview</label>
                <textarea
                  value={curatorNote}
                  onChange={(e) => setCuratorNote(e.target.value)}
                  rows={3}
                  className={styles.textarea}
                  placeholder="A series of meditative studies exploring luminosity and shadow..."
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', alignItems: 'center' }}>
                <div className={styles.field}>
                  <label className={styles.label}>Display Order</label>
                  <input
                    type="number"
                    value={displayOrder}
                    onChange={(e) => setDisplayOrder(Number(e.target.value))}
                    className={styles.input}
                  />
                </div>

                <div className={styles.field} style={{ marginTop: '16px' }}>
                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      className={styles.checkboxInput}
                      checked={isPublished}
                      onChange={(e) => setIsPublished(e.target.checked)}
                    />
                    <span>Publish in Gallery Filter</span>
                  </label>
                </div>
              </div>

              <div className={styles.modalFooter}>
                <button
                  type="button"
                  className={styles.cancelBtn}
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" disabled={isSaving} className={styles.saveBtn}>
                  {isSaving ? 'Saving...' : editingId ? 'Save Changes' : 'Create Collection'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
