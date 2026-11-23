import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { InquiryDrawer } from './InquiryDrawer';
import styles from './PublicLayout.module.css';

export const PublicLayout: React.FC = () => {
  return (
    <div className={styles.layout}>
      <Header />
      <main className={styles.main}>
        <Outlet />
      </main>
      <Footer />
      <InquiryDrawer />
    </div>
  );
};
