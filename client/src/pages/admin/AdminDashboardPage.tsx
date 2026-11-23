import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, ArrowRight, User, Mail } from 'lucide-react';
import { adminApi } from '../../services/adminApi';
import type { DashboardSummaryDto } from '../../types';
import styles from './AdminDashboardPage.module.css';

export const AdminDashboardPage: React.FC = () => {
  const [summary, setSummary] = useState<DashboardSummaryDto | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadSummary() {
      try {
        setIsLoading(true);
        const data = await adminApi.getDashboardSummary();
        setSummary(data);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Unable to load dashboard summary.';
        setError(msg);
      } finally {
        setIsLoading(false);
      }
    }
    loadSummary();
  }, []);

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <div className={styles.eyebrow}>Atelier CMS Overview</div>
          <h1 className={styles.title}>Curatorial Dashboard</h1>
        </div>

        {/* Quick Actions */}
        <div className={styles.quickActions}>
          <Link to="/admin/artworks?action=new" className={`${styles.actionBtn} ${styles.actionBtnPrimary}`}>
            <Plus size={15} />
            <span>Add New Artwork</span>
          </Link>
          <Link to="/admin/profile" className={`${styles.actionBtn} ${styles.actionBtnSecondary}`}>
            <User size={15} />
            <span>Artist Portrait &amp; Bio</span>
          </Link>
          <Link to="/admin/inquiries" className={`${styles.actionBtn} ${styles.actionBtnSecondary}`}>
            <Mail size={15} />
            <span>Review Inquiries</span>
          </Link>
        </div>
      </div>

      {error && (
        <div className={styles.errorAlert}>
          {error}
        </div>
      )}

      {/* Dynamic Calculated Stat Cards */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Total Works in Catalog</div>
          <div className={styles.statValue}>{isLoading ? '...' : summary?.totalArtworks ?? 0}</div>
          <div className={styles.statSub}>
            Across {summary?.totalCategories ?? 0} Medium Categories
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statLabel}>Published / Active</div>
          <div className={styles.statValue}>{isLoading ? '...' : summary?.publishedArtworks ?? 0}</div>
          <div className={styles.statSub}>
            {summary?.draftArtworks ?? 0} Works Remaining in Draft
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statLabel}>Available Pieces</div>
          <div className={styles.statValue}>{isLoading ? '...' : summary?.availableArtworks ?? 0}</div>
          <div className={styles.statSub}>Open for Collector Acquisition</div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statLabel}>New / Active Inquiries</div>
          <div className={`${styles.statValue} ${(summary?.newInquiriesCount ?? 0) > 0 ? styles.statValueHighlight : ''}`}>
            {isLoading ? '...' : summary?.newInquiriesCount ?? 0}
          </div>
          <div className={styles.statSub}>
            {summary?.activeInquiriesCount ?? 0} Total Active in Pipeline
          </div>
        </div>
      </div>

      {/* Recent Inquiries Preview Table */}
      <section className={styles.sectionCard} aria-labelledby="recent-inquiries-title">
        <div className={styles.sectionHeader}>
          <h2 id="recent-inquiries-title" className={styles.sectionTitle}>
            Recent Collector Correspondence
          </h2>
          <Link to="/admin/inquiries" className={styles.sectionLink}>
            <span>All Inquiries</span>
            <ArrowRight size={13} />
          </Link>
        </div>

        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.th}>Date</th>
                <th className={styles.th}>Collector</th>
                <th className={styles.th}>Type</th>
                <th className={styles.th}>Subject / Artwork</th>
                <th className={styles.th}>Status</th>
                <th className={styles.th}>Action</th>
              </tr>
            </thead>
            <tbody>
              {summary?.recentInquiries && summary.recentInquiries.length > 0 ? (
                summary.recentInquiries.map((inq) => (
                  <tr key={inq.id} className={styles.tr}>
                    <td className={`${styles.td} ${styles.dateCell}`}>
                      {new Date(inq.createdAt).toLocaleDateString()}
                    </td>
                    <td className={styles.td}>
                      <div className={styles.clientName}>{inq.clientName}</div>
                      <div className={styles.clientEmail}>
                        {inq.email}
                      </div>
                    </td>
                    <td className={styles.td}>
                      {inq.inquiryType}
                    </td>
                    <td className={styles.td}>
                      {inq.artworkTitle ? <em>{inq.artworkTitle}</em> : 'General Inquiry'}
                    </td>
                    <td className={styles.td}>
                      <span
                        className={`${styles.statusBadge} ${
                          inq.status === 'New'
                            ? styles.statusNew
                            : inq.status === 'InReview'
                            ? styles.statusInReview
                            : inq.status === 'Contacted'
                            ? styles.statusContacted
                            : inq.status === 'Completed'
                            ? styles.statusCompleted
                            : styles.statusArchived
                        }`}
                      >
                        {inq.status}
                      </span>
                    </td>
                    <td className={styles.td}>
                      <Link
                        to={`/admin/inquiries?id=${inq.id}`}
                        className={styles.examineLink}
                      >
                        <span>Examine</span>
                        <ArrowRight size={11} />
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className={styles.emptyText}>
                    No correspondence currently recorded in the atelier inbox.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
