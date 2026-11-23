import React from 'react';
import { NavLink, Link, Outlet, useNavigate } from 'react-router-dom';
import { ExternalLink, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import styles from './AdminLayout.module.css';

export const AdminLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await logout();
    navigate('/admin/login');
  };

  return (
    <div className={styles.layout}>
      {/* Top Archival CMS Navigation */}
      <header className={styles.navBar} role="banner">
        <div className={styles.navInner}>
          {/* Brand */}
          <Link to="/admin/dashboard" className={styles.brandGroup}>
            <span className={styles.brandBadge}>CMS</span>
            <span className={styles.brandName}>L&apos;Archive Vivante</span>
          </Link>

          {/* Core Navigation Links */}
          <nav className={styles.navLinks} aria-label="Atelier CMS Management">
            <NavLink
              to="/admin/dashboard"
              className={({ isActive }) =>
                `${styles.navLink} ${isActive ? styles.activeNavLink : ''}`
              }
            >
              Dashboard
            </NavLink>
            <NavLink
              to="/admin/artworks"
              className={({ isActive }) =>
                `${styles.navLink} ${isActive ? styles.activeNavLink : ''}`
              }
            >
              Artworks
            </NavLink>
            <NavLink
              to="/admin/collections"
              className={({ isActive }) =>
                `${styles.navLink} ${isActive ? styles.activeNavLink : ''}`
              }
            >
              Collections
            </NavLink>
            <NavLink
              to="/admin/categories"
              className={({ isActive }) =>
                `${styles.navLink} ${isActive ? styles.activeNavLink : ''}`
              }
            >
              Categories
            </NavLink>
            <NavLink
              to="/admin/inquiries"
              className={({ isActive }) =>
                `${styles.navLink} ${isActive ? styles.activeNavLink : ''}`
              }
            >
              Inquiries
            </NavLink>
            <NavLink
              to="/admin/profile"
              className={({ isActive }) =>
                `${styles.navLink} ${isActive ? styles.activeNavLink : ''}`
              }
            >
              Artist Profile
            </NavLink>
          </nav>

          {/* Right Actions */}
          <div className={styles.rightGroup}>
            <Link to="/" target="_blank" rel="noopener noreferrer" className={styles.publicLink}>
              <span>Public Gallery</span>
              <ExternalLink size={12} />
            </Link>

            {user?.email && <span className={styles.userEmail}>{user.email}</span>}

            <button
              type="button"
              className={styles.signOutBtn}
              onClick={handleSignOut}
              title="Sign Out of CMS"
            >
              <LogOut size={13} style={{ marginRight: 4, verticalAlign: 'middle' }} />
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main CMS View Area */}
      <main className={styles.mainContent}>
        <Outlet />
      </main>
    </div>
  );
};
