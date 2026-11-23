import React, { useEffect, useState, useCallback } from 'react';
import { Plus, Edit2, Trash2, X } from 'lucide-react';
import { adminApi } from '../../services/adminApi';
import type { CategoryDto, CategoryUpsertDto } from '../../types';
import styles from './AdminCategoriesPage.module.css';

export const AdminCategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [displayOrder, setDisplayOrder] = useState<number>(0);
  const [isActive, setIsActive] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  const loadCategories = useCallback(async () => {
    try {
      setIsLoading(true);
      setErrorMsg(null);
      const data = await adminApi.getCategories();
      setCategories(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load categories.';
      setErrorMsg(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const openCreateModal = () => {
    setEditingId(null);
    setName('');
    setSlug('');
    setDescription('');
    setDisplayOrder(0);
    setIsActive(true);
    setModalError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (cat: CategoryDto) => {
    setEditingId(cat.id);
    setName(cat.name);
    setSlug(cat.slug);
    setDescription(cat.description || '');
    setDisplayOrder(cat.displayOrder);
    setIsActive(cat.isActive);
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);

    if (!name.trim()) {
      setModalError('Category name is required.');
      return;
    }

    const payload: CategoryUpsertDto = {
      name: name.trim(),
      slug: slug.trim() || null,
      description: description.trim() || null,
      displayOrder: Number(displayOrder),
      isActive,
    };

    try {
      setIsSaving(true);
      if (editingId) {
        await adminApi.updateCategory(editingId, payload);
      } else {
        await adminApi.createCategory(payload);
      }
      setIsModalOpen(false);
      await loadCategories();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error saving category.';
      setModalError(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: number, catName: string) => {
    if (!window.confirm(`Delete the medium category "${catName}"?`)) {
      return;
    }

    try {
      setErrorMsg(null);
      await adminApi.deleteCategory(id);
      await loadCategories();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error deleting category.';
      setErrorMsg(msg);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <div className={styles.eyebrow}>Artistic Medium Taxonomy</div>
          <h1 className={styles.title}>Categories Manager</h1>
        </div>

        <button type="button" className={styles.createBtn} onClick={openCreateModal}>
          <Plus size={15} />
          <span>New Category</span>
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
              <th className={styles.th}>Medium Name &amp; Slug</th>
              <th className={styles.th}>Description</th>
              <th className={styles.th}>Cataloged Pieces</th>
              <th className={styles.th}>Order</th>
              <th className={styles.th}>Status</th>
              <th className={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.length > 0 ? (
              categories.map((cat) => (
                <tr key={cat.id} className={styles.tr}>
                  <td className={styles.td}>
                    <div className={styles.catName}>{cat.name}</div>
                    <div className={styles.catSlug}>
                      /{cat.slug}
                    </div>
                  </td>
                  <td className={`${styles.td} ${styles.descCell}`}>
                    {cat.description || <span style={{ opacity: 0.4, fontStyle: 'italic' }}>None recorded</span>}
                  </td>
                  <td className={styles.td}>
                    <span style={{ fontWeight: 600, color: 'var(--color-eclipse-ink)' }}>{cat.artworkCount} Works</span>
                  </td>
                  <td className={styles.td} style={{ fontFamily: 'var(--font-mono)' }}>
                    {cat.displayOrder}
                  </td>
                  <td className={styles.td}>
                    <span
                      className={`${styles.statusBadge} ${
                        cat.isActive ? styles.statusActive : styles.statusHidden
                      }`}
                    >
                      {cat.isActive ? '✓ Active' : 'Hidden'}
                    </span>
                  </td>
                  <td className={styles.td}>
                    <div className={styles.actionsCell}>
                      <button
                        type="button"
                        onClick={() => openEditModal(cat)}
                        className={styles.actionIconBtn}
                        title="Edit Category"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(cat.id, cat.name)}
                        className={`${styles.actionIconBtn} ${styles.deleteBtn}`}
                        title="Delete Category"
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
                  {isLoading ? 'Accessing categories...' : 'No categories found.'}
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
                  {editingId ? `Medium Specimen #${editingId}` : 'Medium Classification'}
                </span>
                <h2 className={styles.modalTitle}>
                  {editingId ? 'Edit Medium Category' : 'Create New Medium Category'}
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
                <label className={styles.label}>Category Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Oil Paintings, Ink Wash, Tempera"
                  className={styles.input}
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label}>URL Slug (Optional — auto-generated from name)</label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="e.g. oil-paintings"
                  className={styles.input}
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className={styles.textarea}
                  placeholder="Artworks created with traditional linseed and walnut oil pigments..."
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
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                    />
                    <span>Active in Public Filter</span>
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
                  {isSaving ? 'Saving...' : editingId ? 'Save Changes' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
