import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useReducedMotion } from 'framer-motion';
import { useSettings } from '../context/SettingsContext';
import { useInquiry } from '../context/InquiryContext';
import { publicApi } from '../services/publicApi';
import { FlipText } from '../components/FlipText';
import { EclipseArchiveDialog } from '../components/EclipseArchiveDialog';
import { cleanArtistName, cleanStatementText, cleanBioText } from '../utils/textUtils';
import { getWatermarkedImageUrl } from '../utils/watermark';
import type { ArtworkSummaryDto } from '../types';
import styles from './HomePage.module.css';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { settings } = useSettings();
  const { openInquiry } = useInquiry();
  const shouldReduceMotion = useReducedMotion();
  const videoRef = useRef<HTMLVideoElement>(null);

  const [featuredArtworks, setFeaturedArtworks] = useState<ArtworkSummaryDto[]>([]);
  const [allArtworks, setAllArtworks] = useState<ArtworkSummaryDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [activeChapter, setActiveChapter] = useState(0);

  // Load artworks
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        setIsLoading(true);
        const res = await publicApi.getArtworks({ pageSize: 24 });
        if (isMounted) {
          setAllArtworks(res.items);
          setFeaturedArtworks(res.items.slice(0, 6));
        }
      } catch (err) {
        console.error('Error loading artworks for homepage:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Track active chapter on scroll
  useEffect(() => {
    const handleScroll = () => {
      const chapters = ['awakening', 'archive', 'sanctum', 'commissions'];
      const windowHeight = window.innerHeight;

      for (let i = chapters.length - 1; i >= 0; i--) {
        const el = document.getElementById(chapters[i]);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= windowHeight * 0.45) {
            setActiveChapter(i);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToChapter = (index: number) => {
    const chapterIds = ['awakening', 'archive', 'sanctum', 'commissions'];
    const el = document.getElementById(chapterIds[index]);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
      setActiveChapter(index);
    }
  };

  const toggleSound = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const artistName = cleanArtistName(settings?.artistName);
  const artistStatement = cleanStatementText(settings?.artistStatement);
  const bioPreview = cleanBioText(settings?.aboutBiography);

  const progressPercent = useMemo(() => {
    const steps = [12, 40, 70, 100];
    return steps[activeChapter] ?? 12;
  }, [activeChapter]);

  const formatCatNum = (index: number) => {
    return `CAT. ${(index + 1).toString().padStart(3, '0')}`;
  };

  const formatDimensions = (art: ArtworkSummaryDto) => {
    if (!art.dimensionsHeight || !art.dimensionsWidth) return 'Archival Scale';
    return `${art.dimensionsHeight} × ${art.dimensionsWidth} ${art.dimensionUnit}`;
  };

  return (
    <div className={styles.page}>
      {/* 1. CINEMATIC BACKGROUND VIDEO AT TOP OF SCREEN */}
      <div className={styles.cinema} aria-hidden="true">
        <video
          ref={videoRef}
          src="/media/Animation_Video.mp4"
          autoPlay={!shouldReduceMotion}
          loop
          muted={isMuted}
          playsInline
          className={styles.videoBackground}
        />
        <div className={styles.vignette} />
        <div className={styles.grain} />
        <div className={styles.exposureOverlay} />
      </div>

      {/* 2. MAIN STAGE — CHAPTER FLOW */}
      <main className={styles.stage} aria-label="Atelier Archival Journey">
        {/* CHAPTER 01: THE AWAKENING */}
        <section
          id="awakening"
          className={styles.chapter}
          aria-labelledby="chapter-01-heading"
        >
          <div className={styles.eyebrow}>
            <span className={styles.hairline} />
            01 / THE AWAKENING
          </div>

          <h1 id="chapter-01-heading" className={styles.monumentalHeading}>
            <span className={styles.headingLinePrimary}>
              <FlipText duration={2.4} delay={0.1}>
                THE LIVING POETRY
              </FlipText>
            </span>
            <span className={styles.headingLineSecondary}>
              <span className={styles.lineOutline}>IS NOT</span>{' '}
              <span className={styles.lineWarm}>
                <FlipText duration={2.4} delay={0.3}>
                  FORGOTTEN.
                </FlipText>
              </span>
            </span>
          </h1>

          <p className={styles.introCopy}>
            An intimate exploration of studio craft, material preparations, and observational discipline.
            Preserving classical fine art techniques in oil, linen, and pure gold leaf.
          </p>

          <div className={styles.heroActionsRow}>
            <button
              type="button"
              className={styles.journeyButton}
              onClick={() => scrollToChapter(1)}
              aria-label="Descend to exhibition archive"
            >
              <span>EXPLORE THE COLLECTION</span>
              <span className={styles.buttonArrow} aria-hidden="true">↘</span>
            </button>

            <button
              type="button"
              className={styles.journeyButton}
              onClick={() => openInquiry({ inquiryType: 'GeneralContact' })}
              aria-label="Open Studio Inquiry Drawer"
            >
              <span>STUDIO INQUIRY</span>
              <span className={styles.buttonArrow} aria-hidden="true">✧</span>
            </button>
          </div>

          <div className={styles.heroMicroNote}>
            BEYOND THE EPHEMERAL · AN ARCHIVAL SANCTUARY AWAKENS
          </div>
        </section>

        {/* CHAPTER 02: CURATED WORKS & ARCHIVE */}
        <section
          id="archive"
          className={styles.chapter}
          aria-labelledby="chapter-02-heading"
        >
          <div className={styles.eyebrow}>
            <span className={styles.hairline} />
            02 / CURATED WORKS &amp; ARCHIVE
          </div>

          <h2 id="chapter-02-heading" className={styles.monumentalHeading}>
            <span className={styles.headingLinePrimary}>PRESERVING</span>
            <span className={styles.headingLineSecondary}>
              <span className={styles.lineOutline}>THE ORIGINAL</span>{' '}
              <span className={styles.lineWarm}>VISION.</span>
            </span>
          </h2>

          <p className={styles.introCopy}>
            Original masterworks cataloged directly from the easel. Each composition adheres strictly to archival longevity,
            museum matboard spacing, and uncropped native form.
          </p>

          {featuredArtworks.length > 0 ? (
            <div className={styles.archiveGrid}>
              {featuredArtworks.map((art, idx) => (
                <article key={art.id} className={styles.artworkCard}>
                  <div className={styles.artworkThumbWrapper}>
                    <span className={styles.catBadge}>{formatCatNum(idx)}</span>
                    <img
                      src={getWatermarkedImageUrl(art.primaryImage?.secureUrl) || '/media/placeholder_artwork.jpg'}
                      alt={art.primaryImage?.altText || art.title}
                      className={styles.artworkImg}
                      loading="lazy"
                      draggable={false}
                      onContextMenu={(e) => e.preventDefault()}
                    />
                    <span className={styles.watermarkBadge}>Art By Johar</span>
                  </div>

                  <div className={styles.artworkInfo}>
                    <h3 className={styles.artworkTitle}>{art.title}</h3>
                    <p className={styles.artworkMeta}>
                      {art.medium} · {art.yearCreated} · {formatDimensions(art)}
                    </p>

                    <div className={styles.artworkActions}>
                      <button
                        type="button"
                        className={styles.inspectLink}
                        onClick={() => setArchiveOpen(true)}
                        aria-label={`Inspect ${art.title} in archive`}
                      >
                        Inspect ↗
                      </button>

                      <button
                        type="button"
                        className={styles.inspectLink}
                        onClick={() =>
                          openInquiry({
                            artworkId: art.id,
                            artworkTitle: art.title,
                            catalogReference: art.catalogReference || undefined,
                            inquiryType: 'ArtworkInquiry',
                          })
                        }
                        aria-label={`Inquire about ${art.title}`}
                      >
                        Inquire ✧
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : !isLoading ? (
            <p className={styles.introCopy}>Currently cataloging recent pieces.</p>
          ) : null}

          <div style={{ marginTop: 24 }}>
            <button
              type="button"
              className={styles.journeyButton}
              onClick={() => setArchiveOpen(true)}
              aria-label="Open complete field archive"
            >
              <span>OPEN FIELD ARCHIVE</span>
              <span className={styles.buttonArrow} aria-hidden="true">↗</span>
            </button>
          </div>
        </section>

        {/* CHAPTER 03: THE QUIET SANCTUM */}
        <section
          id="sanctum"
          className={styles.chapter}
          aria-labelledby="chapter-03-heading"
        >
          <div className={styles.eyebrow}>
            <span className={styles.hairline} />
            03 / THE QUIET SANCTUM
          </div>

          <h2 id="chapter-03-heading" className={styles.monumentalHeading}>
            <span className={styles.headingLinePrimary}>THE TRUTH</span>
            <span className={styles.headingLineSecondary}>
              <span className={styles.lineOutline}>IS NEVER</span>{' '}
              <span className={styles.lineWarm}>DORMANT.</span>
            </span>
          </h2>

          <div className={styles.sanctumGrid}>
            <div>
              {artistStatement && (
                <blockquote className={styles.sanctumQuote}>
                  &ldquo;{artistStatement}&rdquo;
                </blockquote>
              )}
              <p className={styles.sanctumText}>
                {bioPreview ||
                  'The atelier exists as an uncompromising sanctuary for observational discipline. We do not manufacture haste; we cultivate tactile permanence through traditional glazing, pure earth pigments, and natural resin varnishes.'}
              </p>
              <Link to="/about" className={styles.journeyButton}>
                <span>READ FULL BIOGRAPHY &amp; STATEMENT</span>
                <span className={styles.buttonArrow} aria-hidden="true">↗</span>
              </Link>
            </div>

            <div className={styles.materialDisciplines}>
              <div className={styles.disciplineItem}>
                <span className={styles.disciplineName}>01 / PRIMED BELGIAN LINEN</span>
                <p className={styles.disciplineDesc}>
                  Heavyweight loom-woven Belgian flax prepared with lead-free oil grounds to ensure deep luminous light reflection across generations.
                </p>
              </div>

              <div className={styles.disciplineItem}>
                <span className={styles.disciplineName}>02 / PURE EARTH PIGMENTS</span>
                <p className={styles.disciplineDesc}>
                  Hand-milled minerals, natural umbers, lapis lazuli, and cold-pressed linseed oils formulated without chemical extenders or drying accelerants.
                </p>
              </div>

              <div className={styles.disciplineItem}>
                <span className={styles.disciplineName}>03 / 24-KARAT WATER GILDING</span>
                <p className={styles.disciplineDesc}>
                  Genuine beaten leaf laid over traditional clay bole, creating sacred focal points that shift dynamically under natural ambient daylight.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CHAPTER 04: BESPOKE COMMISSIONS */}
        <section
          id="commissions"
          className={styles.chapter}
          aria-labelledby="chapter-04-heading"
        >
          <div className={styles.commissionBox}>
            <div className={styles.eyebrow}>
              <span className={styles.hairline} />
              04 / PRIVATE &amp; ARCHITECTURAL COMMISSIONS
            </div>

            <h2 id="chapter-04-heading" className={styles.monumentalHeading}>
              <span className={styles.headingLinePrimary}>EVERY ACQUISITION</span>
              <span className={styles.headingLineSecondary}>
                <span className={styles.lineOutline}>BEGINS</span>{' '}
                <span className={styles.lineWarm}>WITH A VISION.</span>
              </span>
            </h2>

            <p className={styles.introCopy}>
              Collaborate directly with {artistName} on bespoke architectural commissions, private residence acquisitions,
              or site-specific textural masterpieces crafted to precise dimensions.
            </p>

            <div className={styles.commissionActionsRow}>
              <button
                type="button"
                className={styles.journeyButton}
                onClick={() => navigate('/commissions')}
                aria-label="Navigate to Bespoke Commissions inquiry page"
              >
                <span>DISCUSS A COMMISSION</span>
                <span className={styles.buttonArrow} aria-hidden="true">↘</span>
              </button>

              <button
                type="button"
                className={styles.journeyButton}
                onClick={() => openInquiry({ inquiryType: 'GeneralContact' })}
                aria-label="Open Studio Inquiry Drawer"
              >
                <span>STUDIO INQUIRY</span>
                <span className={styles.buttonArrow} aria-hidden="true">✧</span>
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* 3. FIXED BOTTOM HUD */}
      <footer className={styles.bottomHud} aria-label="Cinematic Bottom HUD">
        {/* Left: Travel Hint with animated scroll mouse indicator */}
        <button
          type="button"
          className={styles.travelHint}
          onClick={() => scrollToChapter((activeChapter + 1) % 4)}
          aria-label="Scroll to next journey chapter"
        >
          <span className={styles.scrollMouse} aria-hidden="true" />
          <span>SCROLL TO DISCOVER</span>
        </button>

        {/* Center: Journey Chapter Progress Route */}
        <nav className={styles.chapterNav} aria-label="Journey Chapters">
          <div className={styles.routeTrack}>
            <div
              className={styles.routeProgress}
              style={{ width: `${progressPercent}%` }}
              aria-hidden="true"
            />
          </div>

          <button
            type="button"
            className={styles.navStepBtn}
            onClick={() => scrollToChapter(0)}
            aria-current={activeChapter === 0 ? 'step' : undefined}
          >
            <span className={styles.navStepNum}>01</span>
            <span className={styles.navStepLabel}>Awakening</span>
          </button>

          <button
            type="button"
            className={styles.navStepBtn}
            onClick={() => scrollToChapter(1)}
            aria-current={activeChapter === 1 ? 'step' : undefined}
          >
            <span className={styles.navStepNum}>02</span>
            <span className={styles.navStepLabel}>Works</span>
          </button>

          <button
            type="button"
            className={styles.navStepBtn}
            onClick={() => scrollToChapter(2)}
            aria-current={activeChapter === 2 ? 'step' : undefined}
          >
            <span className={styles.navStepNum}>03</span>
            <span className={styles.navStepLabel}>Sanctum</span>
          </button>

          <button
            type="button"
            className={styles.navStepBtn}
            onClick={() => scrollToChapter(3)}
            aria-current={activeChapter === 3 ? 'step' : undefined}
          >
            <span className={styles.navStepNum}>04</span>
            <span className={styles.navStepLabel}>Commissions</span>
          </button>
        </nav>

        {/* Right: Ambient Sound Equalizer & Accessibility */}
        <div className={styles.utilities}>
          <button
            type="button"
            id="sound"
            className={styles.utilBtn}
            onClick={toggleSound}
            aria-label={isMuted ? 'Unmute studio atmosphere' : 'Mute studio atmosphere'}
            aria-pressed={!isMuted}
          >
            <span
              className={`${styles.soundBars} ${!isMuted ? styles.soundBarsActive : ''}`}
              aria-hidden="true"
            >
              <i />
              <i />
              <i />
              <i />
            </span>
            <span>{isMuted ? 'SOUND OFF' : 'SOUND ON'}</span>
          </button>
        </div>
      </footer>

      {/* Field Archive Dialog */}
      <EclipseArchiveDialog
        isOpen={archiveOpen}
        onClose={() => setArchiveOpen(false)}
        artworks={allArtworks}
      />
    </div>
  );
};
