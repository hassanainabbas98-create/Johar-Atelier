import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div
      style={{
        padding: '120px 24px',
        textAlign: 'center',
        maxWidth: '640px',
        margin: '0 auto',
        minHeight: '60vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '9px',
          color: 'var(--color-eclipse-gold)',
          letterSpacing: '2.5px',
          textTransform: 'uppercase',
          marginBottom: '16px',
        }}
      >
        Folio 404 · Signal Lost
      </div>

      <h1
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(36px, 5vw, 64px)',
          fontWeight: 400,
          color: 'var(--color-eclipse-ink)',
          marginBottom: '20px',
          letterSpacing: '-0.03em',
        }}
      >
        Archival Folio Not Located
      </h1>

      <p
        style={{
          color: 'var(--color-eclipse-muted)',
          fontFamily: 'var(--font-sans)',
          fontSize: '14px',
          lineHeight: 1.8,
          marginBottom: '36px',
        }}
      >
        The requested archival catalog entry or folio does not exist in the collection.
        Please return to the main sanctuary or explore the curatorial archive.
      </p>

      <Link
        to="/"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 12,
          fontFamily: 'var(--font-sans)',
          fontSize: '10px',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '2px',
          color: 'var(--color-eclipse-ink)',
          background: 'linear-gradient(110deg, rgba(213, 184, 123, 0.12), transparent)',
          border: '1px solid var(--color-eclipse-gold)',
          padding: '16px 28px',
          textDecoration: 'none',
          transition: 'all 0.25s ease',
        }}
      >
        <ArrowLeft size={15} /> Return to Atelier Sanctuary
      </Link>
    </div>
  );
};
