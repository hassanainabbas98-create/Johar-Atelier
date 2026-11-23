import React, { useRef, useState, useEffect } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize } from 'lucide-react';
import styles from './AtelierVideoShowcase.module.css';

interface AtelierVideoShowcaseProps {
  src?: string;
  poster?: string;
  title?: string;
  subtitle?: string;
  eyebrow?: string;
}

export const AtelierVideoShowcase: React.FC<AtelierVideoShowcaseProps> = ({
  src = '/media/Animation_Video.mp4',
  poster,
  title = 'In the Atelier — The Living Process',
  subtitle = 'An intimate glimpse into observational studies, material craftsmanship, and archival studio practice.',
  eyebrow = 'Studio Monograph in Motion'
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (shouldReduceMotion && videoRef.current) {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  }, [shouldReduceMotion]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch((err) => {
        console.warn('Fullscreen request failed:', err);
      });
    } else {
      document.exitFullscreen().catch((err) => {
        console.warn('Exit fullscreen failed:', err);
      });
    }
  };

  return (
    <motion.section
      className={styles.showcaseSection}
      aria-label="Atelier studio motion showcase"
      initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className={styles.frameContainer}>
        {/* Curatorial Header */}
        <div className={styles.captionArea}>
          <div className={styles.eyebrowContainer}>
            <span className={styles.eyebrowDot} aria-hidden="true" />
            <span className={styles.eyebrow}>{eyebrow}</span>
          </div>
          <h2 className={styles.title}>{title}</h2>
          <p className={styles.subtitle}>{subtitle}</p>
        </div>

        {/* Archival Matboard Framed Container */}
        <div
          ref={containerRef}
          className={`${styles.videoMatte} ${isFullscreen ? styles.fullscreenMatte : ''}`}
        >
          <video
            ref={videoRef}
            src={src}
            poster={poster}
            autoPlay={!shouldReduceMotion}
            muted={isMuted}
            loop
            playsInline
            className={styles.videoPlayer}
            onClick={togglePlay}
          />

          {/* Luminous Champagne & Mocha Studio Control Bar */}
          <div className={styles.controlBar}>
            <button
              type="button"
              onClick={togglePlay}
              className={styles.controlBtn}
              aria-label={isPlaying ? 'Pause studio process animation' : 'Play studio process animation'}
            >
              {isPlaying ? <Pause size={15} /> : <Play size={15} />}
              <span className={styles.btnLabel}>{isPlaying ? 'Pause' : 'Play'}</span>
            </button>

            <div className={styles.controlDivider} aria-hidden="true" />

            <button
              type="button"
              onClick={toggleMute}
              className={styles.controlBtn}
              aria-label={isMuted ? 'Unmute studio audio' : 'Mute studio audio'}
            >
              {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
              <span className={styles.btnLabel}>{isMuted ? 'Muted' : 'Sound'}</span>
            </button>

            <div className={styles.controlDivider} aria-hidden="true" />

            <button
              type="button"
              onClick={toggleFullscreen}
              className={styles.controlBtn}
              aria-label={isFullscreen ? 'Exit full screen view' : 'View full screen'}
            >
              {isFullscreen ? <Minimize size={15} /> : <Maximize size={15} />}
              <span className={styles.btnLabel}>{isFullscreen ? 'Exit' : 'Full'}</span>
            </button>
          </div>
        </div>
      </div>
    </motion.section>
  );
};
