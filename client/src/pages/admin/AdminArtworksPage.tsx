import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus, Search, Edit2, Trash2, X, Star, Upload, RefreshCw } from 'lucide-react';
import { adminApi } from '../../services/adminApi';
import { watermarkImageFile, getWatermarkedImageUrl } from '../../utils/watermark';
import type {
  ArtworkSummaryDto,
  AdminArtworkDto,
  CategoryDto,
  CollectionDto,
  CreateArtworkDto,
  UpdateArtworkDto,
  AvailabilityStatus,
} from '../../types';
import styles from './AdminArtworksPage.module.css';

export const AdminArtworksPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [artworks, setArtworks] = useState<ArtworkSummaryDto[]>([]);
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [collections, setCollections] = useState<CollectionDto[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Editor Modal State
  const [isEditorOpen, setIsEditorOpen] = useState<boolean>(false);
  const [editingArtworkId, setEditingArtworkId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'meta' | 'images'>('meta');
  const [artworkDetail, setArtworkDetail] = useState<AdminArtworkDto | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [modalError, setModalError] = useState<string | null>(null);

  // Form Fields State
  const [title, setTitle] = useState('');
  const [medium, setMedium] = useState('');
  const [categoryId, setCategoryId] = useState<number>(1);
  const [collectionId, setCollectionId] = useState<number | ''>('');
  const [dimHeight, setDimHeight] = useState<number>(100);
  const [dimWidth, setDimWidth] = useState<number>(80);
  const [dimDepth, setDimDepth] = useState<number | ''>('');
  const [dimUnit, setDimUnit] = useState<string>('cm');
  const [yearCreated, setYearCreated] = useState<number>(new Date().getFullYear());
  const [catalogRef, setCatalogRef] = useState('');
  const [isFramed, setIsFramed] = useState<boolean>(false);
  const [availStatus, setAvailStatus] = useState<AvailabilityStatus>('Available');
  const [displayOrder, setDisplayOrder] = useState<number>(0);
  const [isFeatured, setIsFeatured] = useState<boolean>(false);
  const [isPublished, setIsPublished] = useState<boolean>(false);
  const [autoPublishAfterUpload, setAutoPublishAfterUpload] = useState<boolean>(true);
  const [story, setStory] = useState('');

  // Image Upload State
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadAltText, setUploadAltText] = useState('');
  const [uploadIsPrimary, setUploadIsPrimary] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [replacingImageId, setReplacingImageId] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load Artworks and Taxonomies
  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      setErrorMsg(null);
      const [artRes, cats, cols] = await Promise.all([
        adminApi.getArtworks({
          search: searchQuery || undefined,
          categorySlug: selectedCategory || undefined,
          pageSize: 50,
        }),
        adminApi.getCategories(),
        adminApi.getCollections(),
      ]);

      setArtworks(artRes.items);
      setTotalCount(artRes.totalCount);
      setCategories(cats);
      setCollections(cols);
      if (cats.length > 0 && !categoryId) {
        setCategoryId(cats[0].id);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load catalog data.';
      setErrorMsg(msg);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, selectedCategory]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Open modal if action=new is in URL
  useEffect(() => {
    if (searchParams.get('action') === 'new') {
      openCreateModal();
      searchParams.delete('action');
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const openCreateModal = () => {
    setEditingArtworkId(null);
    setArtworkDetail(null);
    setActiveTab('meta');
    setModalError(null);

    setTitle('');
    setMedium('');
    setCategoryId(categories.length > 0 ? categories[0].id : 1);
    setCollectionId('');
    setDimHeight(100);
    setDimWidth(80);
    setDimDepth('');
    setDimUnit('cm');
    setYearCreated(new Date().getFullYear());
    setCatalogRef('');
    setIsFramed(false);
    setAvailStatus('Available');
    setDisplayOrder(0);
    setIsFeatured(false);
    setIsPublished(false);
    setAutoPublishAfterUpload(true);
    setStory('');
    setUploadFile(null);
    setUploadAltText('');
    if (fileInputRef.current) fileInputRef.current.value = '';

    setIsEditorOpen(true);
  };

  const openEditModal = async (id: number) => {
    try {
      setModalError(null);
      setIsLoading(true);
      const detail = await adminApi.getArtworkById(id);
      setArtworkDetail(detail);
      setEditingArtworkId(id);
      setActiveTab('meta');

      setTitle(detail.title);
      setMedium(detail.medium);
      setCategoryId(detail.categoryId);
      setCollectionId(detail.collectionId ?? '');
      setDimHeight(detail.dimensionsHeight);
      setDimWidth(detail.dimensionsWidth);
      setDimDepth(detail.dimensionsDepth ?? '');
      setDimUnit(detail.dimensionUnit || 'cm');
      setYearCreated(detail.yearCreated);
      setCatalogRef(detail.catalogReference || '');
      setIsFramed(detail.isFramed);
      setAvailStatus(detail.availabilityStatus);
      setDisplayOrder(detail.displayOrder);
      setIsFeatured(detail.isFeatured);
      setIsPublished(detail.isPublished);
      setStory(detail.story || '');

      setIsEditorOpen(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unable to load artwork detail.';
      setErrorMsg(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveArtwork = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);

    if (!title.trim() || !medium.trim()) {
      setModalError('Title and Medium are required.');
      return;
    }

    const payload: CreateArtworkDto = {
      categoryId,
      collectionId: collectionId ? Number(collectionId) : null,
      title: title.trim(),
      medium: medium.trim(),
      dimensionsHeight: Number(dimHeight),
      dimensionsWidth: Number(dimWidth),
      dimensionsDepth: dimDepth ? Number(dimDepth) : null,
      dimensionUnit: dimUnit,
      yearCreated: Number(yearCreated),
      catalogReference: catalogRef.trim() || null,
      availabilityStatus: availStatus,
      isFramed,
      isFeatured,
      // Enforce Draft (false) on initial creation to satisfy the AltText gate
      isPublished: editingArtworkId ? isPublished : false,
      displayOrder: Number(displayOrder),
      story: story.trim() || null,
    };

    try {
      setIsSaving(true);
      if (editingArtworkId) {
        const updated = await adminApi.updateArtwork(editingArtworkId, payload as UpdateArtworkDto);
        setArtworkDetail(updated);
        setIsEditorOpen(false);
      } else {
        const created = await adminApi.createArtwork(payload);
        setArtworkDetail(created);
        setEditingArtworkId(created.id);

        // If the user attached an image during creation, apply "Art By Johar" security watermark and upload
        if (uploadFile) {
          try {
            const secureFile = await watermarkImageFile(uploadFile, 'Art By Johar');
            await adminApi.uploadImage(
              created.id,
              secureFile,
              uploadAltText.trim() || `${created.title} - ${created.medium}`,
              true
            );
            let refreshed = await adminApi.getArtworkById(created.id);
            if (autoPublishAfterUpload && refreshed.canBePublished) {
              try {
                await adminApi.togglePublish(created.id, true);
                refreshed = await adminApi.getArtworkById(created.id);
              } catch {
                // ignore publish toggle error
              }
            }
            setArtworkDetail(refreshed);
            setUploadFile(null);
            setUploadAltText('');
            if (fileInputRef.current) fileInputRef.current.value = '';
          } catch (uploadErr) {
            console.error('Initial photograph upload error:', uploadErr);
          }
        }

        setActiveTab('images'); // Switch to Photographs tab
      }
      await loadData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error saving artwork.';
      setModalError(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleTogglePublish = async (id: number, currentVal: boolean) => {
    try {
      setErrorMsg(null);
      await adminApi.togglePublish(id, !currentVal);
      await loadData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update publication status.';
      setErrorMsg(msg);
    }
  };

  const handleToggleFeature = async (id: number, currentVal: boolean) => {
    try {
      setErrorMsg(null);
      await adminApi.toggleFeatured(id, !currentVal);
      await loadData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update featured status.';
      setErrorMsg(msg);
    }
  };

  const handleDeleteArtwork = async (id: number, titleName: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${titleName}" and all its photographs?`)) {
      return;
    }

    try {
      await adminApi.deleteArtwork(id);
      await loadData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete artwork.';
      setErrorMsg(msg);
    }
  };

  // --- Image Operations ---
  const handleUploadImage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingArtworkId || !uploadFile) return;

    try {
      setIsUploadingImage(true);
      setModalError(null);
      const secureFile = await watermarkImageFile(uploadFile, 'Art By Johar');
      await adminApi.uploadImage(
        editingArtworkId,
        secureFile,
        uploadAltText.trim() || undefined,
        uploadIsPrimary
      );

      // Refresh detail
      let refreshed = await adminApi.getArtworkById(editingArtworkId);

      // Auto-publish if user opted in and artwork is now eligible
      if (autoPublishAfterUpload && !refreshed.isPublished && refreshed.canBePublished) {
        try {
          await adminApi.togglePublish(editingArtworkId, true);
          refreshed = await adminApi.getArtworkById(editingArtworkId);
        } catch {
          // ignore publish toggle error
        }
      }

      setArtworkDetail(refreshed);
      setUploadFile(null);
      setUploadAltText('');
      setUploadIsPrimary(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
      await loadData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to upload photograph.';
      setModalError(msg);
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleUpdateImageMetadata = async (
    imageId: number,
    altText: string,
    isPrimary: boolean,
    displayOrder: number
  ) => {
    if (!editingArtworkId) return;
    try {
      setModalError(null);
      await adminApi.updateImageMetadata(editingArtworkId, imageId, {
        altText: altText.trim(),
        isPrimary,
        displayOrder,
      });
      const refreshed = await adminApi.getArtworkById(editingArtworkId);
      setArtworkDetail(refreshed);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update image metadata.';
      setModalError(msg);
    }
  };

  const handleDeleteImage = async (imageId: number) => {
    if (!editingArtworkId) return;
    if (!window.confirm('Delete this photograph from storage?')) return;

    try {
      setModalError(null);
      await adminApi.deleteImage(editingArtworkId, imageId);
      const refreshed = await adminApi.getArtworkById(editingArtworkId);
      setArtworkDetail(refreshed);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete photograph.';
      setModalError(msg);
    }
  };

  const handleReplaceImage = async (
    imageId: number,
    file: File,
    currentAltText?: string
  ) => {
    if (!editingArtworkId) return;

    try {
      setReplacingImageId(imageId);
      setModalError(null);
      const secureFile = await watermarkImageFile(file, 'Art By Johar');
      await adminApi.replaceImage(editingArtworkId, imageId, secureFile, currentAltText);
      const refreshed = await adminApi.getArtworkById(editingArtworkId);
      setArtworkDetail(refreshed);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to replace photograph.';
      setModalError(msg);
    } finally {
      setReplacingImageId(null);
    }
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <div className={styles.eyebrow}>Inventory &amp; Archival Management</div>
          <h1 className={styles.title}>Artworks Catalog</h1>
        </div>

        <button type="button" className={styles.createBtn} onClick={openCreateModal}>
          <Plus size={15} />
          <span>New Artwork</span>
        </button>
      </div>

      {errorMsg && (
        <div className={styles.errorAlert}>
          {errorMsg}
        </div>
      )}

      {/* Filter Bar */}
      <div className={styles.filterBar}>
        <div className={styles.searchBox}>
          <Search size={15} color="var(--color-eclipse-muted)" />
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search by title, medium, catalog ref..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <select
          className={styles.filterSelect}
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="">All Categories ({categories.length})</option>
          {categories.map((c) => (
            <option key={c.id} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>

        <span className={styles.resultCount}>
          Showing {artworks.length} of {totalCount} records
        </span>
      </div>

      {/* Table */}
      <div className={styles.tableCard}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.th}>Image</th>
              <th className={styles.th}>Artwork Title &amp; Medium</th>
              <th className={styles.th}>Category</th>
              <th className={styles.th}>Availability</th>
              <th className={styles.th}>Published</th>
              <th className={styles.th}>Featured</th>
              <th className={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {artworks.length > 0 ? (
              artworks.map((art) => (
                <tr key={art.id} className={styles.tr}>
                  <td className={styles.td}>
                    <div className={styles.thumbBox}>
                      {art.primaryImage ? (
                        <img
                          src={getWatermarkedImageUrl(art.primaryImage.secureUrl)}
                          alt={art.primaryImage.altText || art.title}
                          className={styles.thumbImg}
                        />
                      ) : (
                        <span className={styles.noPhoto}>No Photo</span>
                      )}
                    </div>
                  </td>
                  <td className={styles.td}>
                    <div className={styles.artTitle}>{art.title}</div>
                    <div className={styles.artMeta}>
                      {art.medium} • {art.dimensionsHeight}×{art.dimensionsWidth} {art.dimensionUnit} • {art.yearCreated}
                      {art.catalogReference ? ` • Ref: ${art.catalogReference}` : ''}
                    </div>
                  </td>
                  <td className={styles.td}>
                    <div className={styles.categoryCell}>{art.categoryName}</div>
                    {art.collectionTitle && (
                      <div className={styles.collectionSub}>
                        {art.collectionTitle}
                      </div>
                    )}
                  </td>
                  <td className={styles.td}>
                    <span className={styles.availabilityBadge}>
                      {art.availabilityStatus}
                    </span>
                  </td>
                  <td className={styles.td}>
                    <button
                      type="button"
                      className={`${styles.toggleBtn} ${
                        art.isPublished ? styles.toggleActive : styles.toggleInactive
                      }`}
                      onClick={() => handleTogglePublish(art.id, art.isPublished)}
                      title="Click to toggle publish (enforces AltText gate)"
                    >
                      {art.isPublished ? '✓ Published' : 'Draft'}
                    </button>
                  </td>
                  <td className={styles.td}>
                    <button
                      type="button"
                      className={`${styles.toggleBtn} ${
                        art.isFeatured ? styles.toggleFeaturedActive : styles.toggleInactive
                      }`}
                      onClick={() => handleToggleFeature(art.id, art.isFeatured)}
                    >
                      {art.isFeatured ? '★ Featured' : 'Standard'}
                    </button>
                  </td>
                  <td className={styles.td}>
                    <div className={styles.actionsCell}>
                      <button
                        type="button"
                        className={styles.actionIconBtn}
                        onClick={() => openEditModal(art.id)}
                        title="Edit Artwork & Photographs"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        type="button"
                        className={`${styles.actionIconBtn} ${styles.deleteBtn}`}
                        onClick={() => handleDeleteArtwork(art.id, art.title)}
                        title="Delete Artwork"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className={styles.emptyState}>
                  {isLoading ? 'Accessing archives...' : 'No artworks found matching criteria.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Create / Edit Modal */}
      {isEditorOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsEditorOpen(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className={styles.modalHeader}>
              <div className={styles.modalTitleGroup}>
                <span className={styles.modalEyebrow}>
                  {editingArtworkId ? `Catalog Specimen #${editingArtworkId}` : 'Curatorial Ingestion'}
                </span>
                <h2 className={styles.modalTitle}>
                  {editingArtworkId ? (artworkDetail?.title || 'Edit Artwork') : 'New Artwork Entry'}
                </h2>
              </div>
              <button
                type="button"
                className={styles.closeBtn}
                onClick={() => setIsEditorOpen(false)}
                title="Close"
              >
                <X size={18} />
              </button>
            </div>

            {/* Navigation Tabs (Metadata vs Photographs) */}
            <div className={styles.tabsContainer}>
              <div className={styles.tabsBar}>
                <button
                  type="button"
                  className={`${styles.tabBtn} ${activeTab === 'meta' ? styles.activeTabBtn : ''}`}
                  onClick={() => setActiveTab('meta')}
                >
                  1. Artwork Specifications
                </button>
                <button
                  type="button"
                  className={`${styles.tabBtn} ${activeTab === 'images' ? styles.activeTabBtn : ''}`}
                  onClick={() => {
                    if (!editingArtworkId) {
                      const form = document.getElementById('artwork-form') as HTMLFormElement;
                      if (form) form.requestSubmit();
                    } else {
                      setActiveTab('images');
                    }
                  }}
                  title={!editingArtworkId ? 'Saves draft and proceeds to photo upload' : undefined}
                >
                  <span>2. Photographs &amp; AltText</span>
                  <span className={styles.tabCountBadge}>
                    {artworkDetail?.images.length || 0}
                  </span>
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className={styles.modalBody}>
              {modalError && (
                <div className={styles.modalError}>
                  {modalError}
                </div>
              )}

              {/* AltText Publishing Gate Indicator (shown on both tabs) */}
              {editingArtworkId && artworkDetail && (
                <div
                  className={`${styles.gateAlert} ${
                    artworkDetail.canBePublished ? styles.gateSuccess : styles.gateWarning
                  }`}
                >
                  <div style={{ flexGrow: 1 }}>
                    <strong>Accessibility &amp; Publishing Gate Status: </strong>
                    {artworkDetail.canBePublished ? (
                      <span>
                        ✓ Artwork is compliant and eligible for public display ({artworkDetail.totalImagesCount} photograph(s) cataloged with valid AltText).
                      </span>
                    ) : (
                      <span>
                        ⚠ Cannot be published ({artworkDetail.totalImagesCount === 0 ? '0 photographs uploaded' : `${artworkDetail.missingAltTextCount} photograph(s) lack AltText`}). Provide AltText for all images to unlock publishing.
                      </span>
                    )}
                  </div>

                  {artworkDetail.canBePublished && (
                    <button
                      type="button"
                      className={artworkDetail.isPublished ? styles.unpublishBtn : styles.publishNowBtn}
                      onClick={async () => {
                        try {
                          await adminApi.togglePublish(editingArtworkId, !artworkDetail.isPublished);
                          const refreshed = await adminApi.getArtworkById(editingArtworkId);
                          setArtworkDetail(refreshed);
                          await loadData();
                        } catch (err) {
                          setModalError(err instanceof Error ? err.message : 'Failed to toggle publication.');
                        }
                      }}
                    >
                      {artworkDetail.isPublished ? 'Unpublish to Draft' : '★ Publish Artwork Now'}
                    </button>
                  )}
                </div>
              )}

              {activeTab === 'meta' ? (
                /* Metadata Form */
                <form id="artwork-form" onSubmit={handleSaveArtwork} className={styles.formGrid}>
                  <div className={`${styles.field} ${styles.fullCol}`}>
                    <label className={styles.label}>
                      Artwork Title <span className={styles.reqStar}>*</span>
                    </label>
                    <input
                      type="text"
                      required
                      className={styles.input}
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Nocturne in Cerulean & Umber"
                    />
                  </div>

                  <div className={styles.field}>
                    <label className={styles.label}>
                      Medium Category <span className={styles.reqStar}>*</span>
                    </label>
                    <select
                      className={styles.select}
                      value={categoryId}
                      onChange={(e) => setCategoryId(Number(e.target.value))}
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className={styles.field}>
                    <label className={styles.label}>Curated Series / Collection (Optional)</label>
                    <select
                      className={styles.select}
                      value={collectionId}
                      onChange={(e) => setCollectionId(e.target.value ? Number(e.target.value) : '')}
                    >
                      <option value="">No Collection Assigned</option>
                      {collections.map((col) => (
                        <option key={col.id} value={col.id}>
                          {col.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className={`${styles.field} ${styles.fullCol}`}>
                    <label className={styles.label}>
                      Medium &amp; Substrate Description <span className={styles.reqStar}>*</span>
                    </label>
                    <input
                      type="text"
                      required
                      className={styles.input}
                      value={medium}
                      onChange={(e) => setMedium(e.target.value)}
                      placeholder="e.g. Oil on Belgian linen, natural shellac glaze"
                    />
                  </div>

                  {/* Physical Dimensions Group */}
                  <div className={`${styles.field} ${styles.fullCol}`}>
                    <label className={styles.label}>
                      Physical Dimensions (H × W × D &amp; Unit) <span className={styles.reqStar}>*</span>
                    </label>
                    <div className={styles.dimensionsRow}>
                      <div className={styles.dimFieldWrapper}>
                        <span className={styles.dimPrefixTag}>H</span>
                        <input
                          type="number"
                          step="0.1"
                          required
                          className={`${styles.input} ${styles.dimInputWithPrefix}`}
                          value={dimHeight}
                          onChange={(e) => setDimHeight(Number(e.target.value))}
                          placeholder="Height"
                        />
                      </div>
                      <div className={styles.dimFieldWrapper}>
                        <span className={styles.dimPrefixTag}>W</span>
                        <input
                          type="number"
                          step="0.1"
                          required
                          className={`${styles.input} ${styles.dimInputWithPrefix}`}
                          value={dimWidth}
                          onChange={(e) => setDimWidth(Number(e.target.value))}
                          placeholder="Width"
                        />
                      </div>
                      <div className={styles.dimFieldWrapper}>
                        <span className={styles.dimPrefixTag}>D</span>
                        <input
                          type="number"
                          step="0.1"
                          className={`${styles.input} ${styles.dimInputWithPrefix}`}
                          value={dimDepth}
                          onChange={(e) => setDimDepth(e.target.value ? Number(e.target.value) : '')}
                          placeholder="Depth (opt)"
                        />
                      </div>
                      <select
                        className={styles.select}
                        value={dimUnit}
                        onChange={(e) => setDimUnit(e.target.value)}
                      >
                        <option value="cm">Centimeters (cm)</option>
                        <option value="in">Inches (in)</option>
                      </select>
                    </div>
                  </div>

                  <div className={styles.field}>
                    <label className={styles.label}>Year Created</label>
                    <input
                      type="number"
                      className={styles.input}
                      value={yearCreated}
                      onChange={(e) => setYearCreated(Number(e.target.value))}
                    />
                  </div>

                  <div className={styles.field}>
                    <label className={styles.label}>Archival Catalog Reference</label>
                    <input
                      type="text"
                      className={styles.input}
                      value={catalogRef}
                      onChange={(e) => setCatalogRef(e.target.value)}
                      placeholder="e.g. AT-2026-08"
                    />
                  </div>

                  <div className={styles.field}>
                    <label className={styles.label}>Availability Status</label>
                    <select
                      className={styles.select}
                      value={availStatus}
                      onChange={(e) => setAvailStatus(e.target.value as AvailabilityStatus)}
                    >
                      <option value="Available">Available for Acquisition</option>
                      <option value="Reserved">Reserved for Collector</option>
                      <option value="Sold">Sold / Acquired</option>
                      <option value="PrivateCollection">Permanent Archive / Not for Sale</option>
                    </select>
                  </div>

                  <div className={styles.field}>
                    <label className={styles.label}>Display Order</label>
                    <input
                      type="number"
                      className={styles.input}
                      value={displayOrder}
                      onChange={(e) => setDisplayOrder(Number(e.target.value))}
                    />
                  </div>

                  {/* Exhibition and Publication Options */}
                  <div className={`${styles.field} ${styles.fullCol}`}>
                    <div className={styles.checkboxGroup}>
                      <label className={styles.checkboxLabel}>
                        <input
                          type="checkbox"
                          className={styles.checkboxInput}
                          checked={isFramed}
                          onChange={(e) => setIsFramed(e.target.checked)}
                        />
                        <span>Framed / Exhibition Ready</span>
                      </label>

                      <label className={styles.checkboxLabel}>
                        <input
                          type="checkbox"
                          className={styles.checkboxInput}
                          checked={isFeatured}
                          onChange={(e) => setIsFeatured(e.target.checked)}
                        />
                        <span>Feature on Homepage Spotlight</span>
                      </label>

                      {!editingArtworkId ? (
                        <label className={styles.checkboxLabel}>
                          <input
                            type="checkbox"
                            className={styles.checkboxInput}
                            checked={autoPublishAfterUpload}
                            onChange={(e) => setAutoPublishAfterUpload(e.target.checked)}
                          />
                          <span>Publish automatically once photograph is uploaded (Step 2)</span>
                        </label>
                      ) : (
                        <label className={`${styles.checkboxLabel} ${!artworkDetail?.canBePublished ? styles.checkboxDisabled : ''}`}>
                          <input
                            type="checkbox"
                            className={styles.checkboxInput}
                            checked={isPublished}
                            disabled={!artworkDetail?.canBePublished}
                            onChange={(e) => setIsPublished(e.target.checked)}
                          />
                          <span>
                            {artworkDetail?.canBePublished
                              ? 'Publish to Public Gallery'
                              : 'Publish Locked (Requires photograph with AltText)'}
                          </span>
                        </label>
                      )}
                    </div>
                  </div>

                  <div className={`${styles.field} ${styles.fullCol}`}>
                    <label className={styles.label}>Curatorial Concept &amp; Story (Optional)</label>
                    <textarea
                      className={styles.textarea}
                      value={story}
                      onChange={(e) => setStory(e.target.value)}
                      rows={4}
                      placeholder="Notes on composition, thematic origins, historical pigment preparation, or provenance..."
                    />
                  </div>

                  {/* Optional Direct Photo Selection on Step 1 */}
                  {!editingArtworkId && (
                    <div className={`${styles.field} ${styles.fullCol}`}>
                      <div className={styles.initialUploadBox}>
                        <div className={styles.initialUploadHeader}>
                          <Upload size={14} color="var(--color-eclipse-gold)" />
                          <span className={styles.initialUploadTitle}>
                            Initial Photograph (Optional — can also be uploaded in Step 2)
                          </span>
                        </div>
                        <div className={styles.uploadGrid}>
                          <div className={styles.field}>
                            <label className={styles.label}>Image File (.jpg, .jpeg, .png, .webp)</label>
                            <input
                              ref={fileInputRef}
                              type="file"
                              accept=".jpg,.jpeg,.png,.webp"
                              className={styles.input}
                              onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                            />
                          </div>
                          <div className={styles.field}>
                            <label className={styles.label}>Accessibility AltText</label>
                            <input
                              type="text"
                              className={styles.input}
                              placeholder="e.g. Fine art oil painting on Belgian linen"
                              value={uploadAltText}
                              onChange={(e) => setUploadAltText(e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </form>
              ) : (
                /* Photographs & AltText Tab */
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  {/* Upload Form */}
                  <form onSubmit={handleUploadImage} className={styles.uploadCard}>
                    <div className={styles.uploadCardHeader}>
                      <div className={styles.uploadTitle}>
                        <Upload size={14} />
                        <span>Upload Archival Photograph</span>
                      </div>
                      <span style={{ fontSize: '11px', color: 'var(--color-eclipse-muted)', fontFamily: 'var(--font-mono)' }}>
                        Max 15MB: JPG, PNG, WebP
                      </span>
                    </div>

                    <div className={styles.uploadGrid}>
                      <div className={styles.field}>
                        <label className={styles.label}>
                          Image File <span className={styles.reqStar}>*</span>
                        </label>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept=".jpg,.jpeg,.png,.webp"
                          required
                          onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                          className={styles.input}
                        />
                      </div>

                      <div className={styles.field}>
                        <label className={styles.label}>
                          Accessibility AltText <span className={styles.reqStar}>*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={uploadAltText}
                          onChange={(e) => setUploadAltText(e.target.value)}
                          placeholder="e.g. Luminous oil study showing deep azure glazes"
                          className={styles.input}
                        />
                      </div>
                    </div>

                    <div className={styles.uploadBottomRow}>
                      <label className={styles.checkboxLabel}>
                        <input
                          type="checkbox"
                          className={styles.checkboxInput}
                          checked={uploadIsPrimary}
                          onChange={(e) => setUploadIsPrimary(e.target.checked)}
                        />
                        <span>Set as Primary Catalog Photograph</span>
                      </label>

                      <button
                        type="submit"
                        disabled={isUploadingImage || !uploadFile}
                        className={styles.saveBtn}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                      >
                        <Upload size={13} />
                        <span>{isUploadingImage ? 'Uploading & Verifying...' : 'Upload Specimen'}</span>
                      </button>
                    </div>
                  </form>

                  {/* List of existing photographs */}
                  <div className={styles.imagesGrid}>
                    {artworkDetail?.images.map((img) => (
                      <div key={img.id} className={styles.imageCard}>
                        <div className={styles.imagePreview}>
                          <img src={getWatermarkedImageUrl(img.secureUrl)} alt={img.altText || ''} className={styles.previewImg} />
                        </div>

                        <div className={styles.imageSpecRow}>
                          <span>{img.width}×{img.height} ({img.aspectRatio ? `${img.aspectRatio} aspect` : 'auto'})</span>
                          {img.isPrimary && (
                            <span className={styles.primaryBadge}>★ Primary View</span>
                          )}
                        </div>

                        {/* Editable AltText */}
                        <div className={styles.field}>
                          <label className={styles.label}>
                            AltText (A11y Gate)
                          </label>
                          <input
                            type="text"
                            defaultValue={img.altText || ''}
                            onBlur={(e) =>
                              handleUpdateImageMetadata(
                                img.id,
                                e.target.value,
                                img.isPrimary,
                                img.displayOrder
                              )
                            }
                            className={styles.input}
                            style={{ fontSize: '11px', padding: '8px 10px' }}
                          />
                        </div>

                        <div className={styles.imageCardActions}>
                          {!img.isPrimary ? (
                            <button
                              type="button"
                              onClick={() => handleUpdateImageMetadata(img.id, img.altText || '', true, img.displayOrder)}
                              className={styles.setPrimaryBtn}
                            >
                              <Star size={11} />
                              <span>Set Primary</span>
                            </button>
                          ) : (
                            <span className={styles.primaryConfirmed}>✓ Primary</span>
                          )}

                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <label
                              htmlFor={`replace-file-${img.id}`}
                              className={styles.replaceLabel}
                              title="Replace file while preserving AltText and display order"
                            >
                              <RefreshCw size={11} className={replacingImageId === img.id ? styles.spinning : undefined} />
                              <span>{replacingImageId === img.id ? 'Replacing...' : 'Replace'}</span>
                            </label>
                            <input
                              id={`replace-file-${img.id}`}
                              type="file"
                              accept="image/jpeg,image/png,image/webp"
                              style={{ display: 'none' }}
                              disabled={replacingImageId !== null}
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  handleReplaceImage(img.id, file, img.altText || undefined);
                                  e.target.value = '';
                                }
                              }}
                            />

                            <button
                              type="button"
                              onClick={() => handleDeleteImage(img.id)}
                              className={styles.deleteImageBtn}
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className={styles.modalFooter}>
              <button
                type="button"
                className={styles.cancelBtn}
                onClick={() => setIsEditorOpen(false)}
              >
                {activeTab === 'images' ? 'Done & Return' : 'Close'}
              </button>
              {activeTab === 'meta' ? (
                <button
                  type="submit"
                  form="artwork-form"
                  disabled={isSaving}
                  className={styles.saveBtn}
                >
                  {isSaving ? 'Recording...' : editingArtworkId ? 'Save Changes' : 'Create & Proceed to Photos →'}
                </button>
              ) : (
                artworkDetail?.canBePublished && !artworkDetail.isPublished && (
                  <button
                    type="button"
                    className={styles.saveBtn}
                    onClick={async () => {
                      if (!editingArtworkId) return;
                      try {
                        await adminApi.togglePublish(editingArtworkId, true);
                        await loadData();
                        setIsEditorOpen(false);
                      } catch (err) {
                        setModalError(err instanceof Error ? err.message : 'Failed to publish.');
                      }
                    }}
                  >
                    ★ Publish &amp; Finish
                  </button>
                )
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
