# Curatorial Component Patterns Reference
**Skill:** `premium-artist-ui`  
**Stack:** React 19, TypeScript, CSS Modules, `framer-motion`  

---

## Pattern 1: Atelier Video Showcase (`AtelierVideoShowcase`)

Designed for presenting custom studio process animations (such as `/media/Animation_Video.mp4`) in an archival museum frame with accessible controls and zero distraction.

### Implementation Structure
```tsx
// AtelierVideoShowcase.tsx
import React, { useRef, useState, useEffect } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';
import styles from './AtelierVideoShowcase.module.css';

interface AtelierVideoShowcaseProps {
  src: string;
  poster?: string;
  title?: string;
  subtitle?: string;
}

export const AtelierVideoShowcase: React.FC<AtelierVideoShowcaseProps> = ({
  src,
  poster,
  title = "In the Atelier",
  subtitle = "Observational rigor, pigment synthesis & studio practice"
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (shouldReduceMotion && videoRef.current) {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  }, [shouldReduceMotion]);

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

  return (
    <section className={styles.showcaseSection} aria-label="Atelier studio motion showcase">
      <div className={styles.frameContainer}>
        {/* Archival Matboard Hairline Border */}
        <div className={styles.videoMatte}>
          <video
            ref={videoRef}
            src={src}
            poster={poster}
            autoPlay={!shouldReduceMotion}
            muted={isMuted}
            loop
            playsInline
            className={styles.videoPlayer}
          />
          
          {/* Subtle Studio Overlay Controls */}
          <div className={styles.controlBar}>
            <button
              type="button"
              onClick={togglePlay}
              className={styles.controlBtn}
              aria-label={isPlaying ? "Pause studio process animation" : "Play studio process animation"}
            >
              {isPlaying ? <Pause size={14} /> : <Play size={14} />}
              <span className={styles.btnLabel}>{isPlaying ? "Pause" : "Play"}</span>
            </button>

            <button
              type="button"
              onClick={toggleMute}
              className={styles.controlBtn}
              aria-label={isMuted ? "Unmute audio" : "Mute audio"}
            >
              {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
              <span className={styles.btnLabel}>{isMuted ? "Muted" : "Audio"}</span>
            </button>
          </div>
        </div>

        {/* Curatorial Caption */}
        <div className={styles.captionArea}>
          <span className={styles.eyebrow}>Studio Monograph</span>
          <h3 className={styles.title}>{title}</h3>
          <p className={styles.subtitle}>{subtitle}</p>
        </div>
      </div>
    </section>
  );
};
```

### CSS Modules Styling
```css
/* AtelierVideoShowcase.module.css */
.showcaseSection {
  background-color: var(--color-surface);
  border-top: 1px solid var(--color-border-hairline);
  border-bottom: 1px solid var(--color-border-hairline);
  padding: var(--space-20) var(--space-8);
  display: flex;
  justify-content: center;
}

.frameContainer {
  max-width: var(--container-max-width);
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.videoMatte {
  position: relative;
  background-color: var(--color-brand-mocha);
  border: 1px solid var(--color-border-control);
  box-shadow: 0 16px 48px -8px rgba(24, 23, 22, 0.12);
  border-radius: 2px;
  overflow: hidden;
  aspect-ratio: 16 / 9;
  display: flex;
  align-items: center;
  justify-content: center;
}

.videoPlayer {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.controlBar {
  position: absolute;
  bottom: var(--space-4);
  right: var(--space-4);
  display: flex;
  align-items: center;
  gap: var(--space-2);
  background-color: rgba(91, 70, 50, 0.85); /* Mocha Brown 85% */
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid var(--color-accent-champagne);
  padding: 6px 12px;
  border-radius: 2px;
}

.controlBtn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: transparent;
  border: none;
  color: var(--color-accent-champagne);
  font-family: var(--font-sans);
  font-size: var(--font-size-xs);
  cursor: pointer;
  padding: 4px 6px;
  transition: color var(--transition-fast);
}

.controlBtn:hover {
  color: #FFFFFF;
}

.btnLabel {
  letter-spacing: 0.08em;
  text-transform: uppercase;
  font-size: 0.7rem;
}

.captionArea {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.eyebrow {
  font-family: var(--font-sans);
  font-size: var(--font-size-xs);
  font-weight: 600;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--color-accent-amber);
}

.title {
  font-family: var(--font-display);
  font-size: var(--font-size-2xl);
  font-weight: 400;
  color: var(--color-text-primary);
}

.subtitle {
  font-family: var(--font-sans);
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}
```

---

## Pattern 2: Expanding Artwork Dossier (`MorphingDialog` Pattern)

Smoothly transitions an artwork card into an expanded modal dossier using `framer-motion`'s `layoutId`.

### Rules:
1. Wrap the card image in `<motion.div layoutId={`artwork-img-${artwork.id}`} />`.
2. Do not distort proportions: wrap with an uncropped image container (`object-fit: contain`).
3. Backdrop animates with `opacity: 0 -> 1` and `backdrop-filter: blur(8px)`.
4. Escape key closes the overlay via window keyboard listener.
