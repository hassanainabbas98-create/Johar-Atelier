import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SettingsProvider } from './context/SettingsContext';
import { InquiryProvider } from './context/InquiryContext';
import { PublicLayout } from './components/PublicLayout';

// Public Pages
import { HomePage } from './pages/HomePage';
import { GalleryPage } from './pages/GalleryPage';
import { ArtworkDetailPage } from './pages/ArtworkDetailPage';
import { AboutPage } from './pages/AboutPage';
import { CommissionsPage } from './pages/CommissionsPage';
import { ContactPage } from './pages/ContactPage';
import { NotFoundPage } from './pages/NotFoundPage';

// Admin CMS Architecture
import { AdminLoginPage } from './pages/admin/AdminLoginPage';
import { ProtectedRoute } from './components/admin/ProtectedRoute';
import { AdminLayout } from './components/admin/AdminLayout';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminArtworksPage } from './pages/admin/AdminArtworksPage';
import { AdminCollectionsPage } from './pages/admin/AdminCollectionsPage';
import { AdminCategoriesPage } from './pages/admin/AdminCategoriesPage';
import { AdminInquiriesPage } from './pages/admin/AdminInquiriesPage';
import { AdminProfilePage } from './pages/admin/AdminProfilePage';

export default function App(): React.JSX.Element {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SettingsProvider>
          <InquiryProvider>
            <Routes>
              {/* Public Sanctuary Routes */}
              <Route path="/" element={<PublicLayout />}>
                <Route index element={<HomePage />} />
                <Route path="gallery" element={<GalleryPage />} />
                <Route path="gallery/:slug" element={<ArtworkDetailPage />} />
                <Route path="about" element={<AboutPage />} />
                <Route path="commissions" element={<CommissionsPage />} />
                <Route path="contact" element={<ContactPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Route>

              {/* Admin Unauthenticated Route */}
              <Route path="/admin/login" element={<AdminLoginPage />} />

              {/* Protected Atelier Admin CMS Routes */}
              <Route element={<ProtectedRoute />}>
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<Navigate to="/admin/dashboard" replace />} />
                  <Route path="dashboard" element={<AdminDashboardPage />} />
                  <Route path="artworks" element={<AdminArtworksPage />} />
                  <Route path="collections" element={<AdminCollectionsPage />} />
                  <Route path="categories" element={<AdminCategoriesPage />} />
                  <Route path="inquiries" element={<AdminInquiriesPage />} />
                  <Route path="profile" element={<AdminProfilePage />} />
                </Route>
              </Route>
            </Routes>
          </InquiryProvider>
        </SettingsProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
