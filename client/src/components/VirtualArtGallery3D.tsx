import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import * as THREE from 'three';
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  Volume2,
  VolumeX,
  Maximize,
  RotateCcw,
  Footprints,
  Sparkles,
  Sun,
  Sunset,
  Moon,
  Smartphone,
  BookOpen,
  Search,
  X,
} from 'lucide-react';
import { getOptimizedImageUrl } from '../utils/watermark';
import { useInquiry } from '../context/InquiryContext';
import { ViewOnWallModal } from './ViewOnWallModal';
import { AtelierGuestbookModal } from './AtelierGuestbookModal';
import type { ArtworkSummaryDto } from '../types';
import styles from './VirtualArtGallery3D.module.css';

interface VirtualArtGallery3DProps {
  artworks: ArtworkSummaryDto[];
  onSelectArtwork?: (artwork: ArtworkSummaryDto) => void;
}

interface ArtworkSpot {
  artwork: ArtworkSummaryDto;
  index: number;
  position: THREE.Vector3;
  rotation: THREE.Euler;
  cameraPosition: THREE.Vector3;
  cameraLookAt: THREE.Vector3;
  mesh?: THREE.Mesh;
  group?: THREE.Group;
  outerFrameMesh?: THREE.Mesh;
  innerBevelMesh?: THREE.Mesh;
  matboardMesh?: THREE.Mesh;
  canvasMat?: THREE.MeshStandardMaterial;
}

// -----------------------------------------------------------------------------
// Procedural Textures (Instant In-Memory Generation - Zero Network Latency)
// -----------------------------------------------------------------------------

/**
 * High-definition fine art canvas placeholder with warm archival linen weave
 * and gold emblem. Displayed instantly so frames are NEVER black while loading.
 */
function createArchivalCanvasPlaceholder(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Warm luminous primed linen canvas ground (museum archival quality)
  ctx.fillStyle = '#ded5c5';
  ctx.fillRect(0, 0, 512, 512);

  // Subtle linen weave cross-hatching in soft warm sepia
  ctx.strokeStyle = 'rgba(90, 62, 43, 0.12)';
  ctx.lineWidth = 1;
  for (let i = 0; i < 512; i += 6) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, 512);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, i);
    ctx.lineTo(512, i);
    ctx.stroke();
  }

  // Archival double border
  ctx.strokeStyle = 'rgba(90, 62, 43, 0.35)';
  ctx.lineWidth = 2;
  ctx.strokeRect(28, 28, 456, 456);

  ctx.strokeStyle = 'rgba(213, 133, 31, 0.3)';
  ctx.lineWidth = 1;
  ctx.strokeRect(36, 36, 440, 440);

  // Center Archival Atelier Seal
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  ctx.font = '600 24px "Cinzel", "Cormorant Garamond", Georgia, serif';
  ctx.fillStyle = '#4a3220';
  ctx.fillText('J O H A R', 256, 234);

  ctx.font = '600 9px sans-serif';
  ctx.fillStyle = '#8b5a2b';
  ctx.fillText('ATELIER ARCHIVAL SANCTUARY', 256, 268);

  ctx.font = '500 8px sans-serif';
  ctx.fillStyle = '#6e5a4e';
  ctx.fillText('FINE ART MASTERWORK', 256, 288);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/**
 * Rich herringbone parquet floor texture with warm walnut grain and amber seams.
 */
function createParquetTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#3a2616';
  ctx.fillRect(0, 0, 1024, 1024);

  const plankSize = 128;
  for (let y = 0; y < 1024; y += plankSize) {
    for (let x = 0; x < 1024; x += plankSize) {
      const isAlt = (Math.floor(x / plankSize) + Math.floor(y / plankSize)) % 2 === 0;
      const shade = 68 + Math.floor(Math.sin(x * 17 + y * 23) * 10);
      ctx.fillStyle = isAlt
        ? `rgb(${shade + 22}, ${shade + 10}, ${shade - 6})`
        : `rgb(${shade + 12}, ${shade + 4}, ${shade - 12})`;
      ctx.fillRect(x, y, plankSize, plankSize);

      ctx.strokeStyle = 'rgba(0, 0, 0, 0.35)';
      ctx.lineWidth = 1;
      for (let g = 0; g < plankSize; g += 14) {
        ctx.beginPath();
        if (isAlt) {
          ctx.moveTo(x + g, y);
          ctx.lineTo(x + g, y + plankSize);
        } else {
          ctx.moveTo(x, y + g);
          ctx.lineTo(x + plankSize, y + g);
        }
        ctx.stroke();
      }

      ctx.strokeStyle = 'rgba(18, 10, 5, 0.75)';
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, plankSize, plankSize);

      ctx.strokeStyle = 'rgba(213, 133, 31, 0.22)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, y + plankSize);
      ctx.lineTo(x + plankSize, y + plankSize);
      ctx.stroke();
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 16);
  return texture;
}

/**
 * Atmospheric golden dust motes particle texture.
 */
function createMoteTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d')!;

  const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  gradient.addColorStop(0, 'rgba(255, 240, 205, 1.0)');
  gradient.addColorStop(0.25, 'rgba(244, 217, 160, 0.7)');
  gradient.addColorStop(0.6, 'rgba(213, 133, 31, 0.25)');
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 64, 64);

  return new THREE.CanvasTexture(canvas);
}

// -----------------------------------------------------------------------------
// Component Implementation
// -----------------------------------------------------------------------------

export const VirtualArtGallery3D: React.FC<VirtualArtGallery3DProps> = ({
  artworks,
  onSelectArtwork,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasMountRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { openInquiry } = useInquiry();

  // Architectural Dimensions: 3.8m spacing between artworks along Left & Right walls
  const totalBays = Math.max(4, Math.ceil(artworks.length / 2));
  const baySpacing = 3.8;
  const hallLength = Math.max(36, totalBays * baySpacing + 18);
  const hallWidth = 12.0;
  const hallHeight = 6.8;

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isAudioActive, setIsAudioActive] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Creative Modes State
  const [lightingMood, setLightingMood] = useState<'daylight' | 'goldenHour' | 'nocturne'>('daylight');
  const [frameStyle, setFrameStyle] = useState<'gilded' | 'walnut' | 'oak' | 'obsidian'>('gilded');
  const [isInspectMode, setIsInspectMode] = useState<boolean>(false);
  const [isViewOnWallOpen, setIsViewOnWallOpen] = useState<boolean>(false);
  const [isGuestbookOpen, setIsGuestbookOpen] = useState<boolean>(false);

  // Three.js internal mutable refs
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const spotsRef = useRef<ArtworkSpot[]>([]);
  const animFrameIdRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioGainRef = useRef<GainNode | null>(null);

  // Lighting Three.js refs for dynamic transitions
  const ambientLightRef = useRef<THREE.AmbientLight | null>(null);
  const hemiLightRef = useRef<THREE.HemisphereLight | null>(null);
  const skylightSunRef = useRef<THREE.DirectionalLight | null>(null);
  const wallWasherLeftRef = useRef<THREE.DirectionalLight | null>(null);
  const wallWasherRightRef = useRef<THREE.DirectionalLight | null>(null);
  const bayLanternsRef = useRef<THREE.PointLight[]>([]);
  const focusSpotlightRef = useRef<THREE.SpotLight | null>(null);
  const spotlightTargetObjectRef = useRef<THREE.Object3D | null>(null);
  const loadTextureRef = useRef<((idx: number) => void) | null>(null);

  // Camera animation & smoothing targets
  const targetCamPosRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 2.0, hallLength / 2 - 4.5));
  const targetLookAtRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 2.0, 0));
  const currentLookAtRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 2.0, 0));

  // Smart Momentum & Inertia Controls
  const isDraggingRef = useRef<boolean>(false);
  const touchPinchDistRef = useRef<number | null>(null);
  const dragStartPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const previousMousePosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const cameraYawRef = useRef<number>(0);
  const cameraPitchRef = useRef<number>(0);
  const yawVelocityRef = useRef<number>(0);
  const pitchVelocityRef = useRef<number>(0);
  const keysPressedRef = useRef<{ [key: string]: boolean }>({});
  const isGuidedTourRef = useRef<boolean>(true);
  const idleTimeRef = useRef<number>(0);

  // Floor Reticle & Click-to-Walk
  const floorReticleMeshRef = useRef<THREE.Mesh | null>(null);
  const floorPlaneMeshRef = useRef<THREE.Mesh | null>(null);
  const reticlePulseRef = useRef<number>(0);
  const guestbookPedestalRef = useRef<THREE.Mesh | null>(null);

  // Texture Cache
  const textureCacheRef = useRef<Map<string, THREE.Texture>>(new Map());

  // Active artwork
  const activeArtwork = artworks[currentIndex] || null;

  // 1. Move camera smoothly to specific artwork waypoint
  const goToArtwork = useCallback((index: number) => {
    if (spotsRef.current.length === 0) return;
    const total = spotsRef.current.length;
    const clampedIndex = ((index % total) + total) % total;
    setCurrentIndex(clampedIndex);

    const spot = spotsRef.current[clampedIndex];
    if (spot) {
      targetCamPosRef.current.copy(spot.cameraPosition);
      targetLookAtRef.current.copy(spot.cameraLookAt);
      isGuidedTourRef.current = true;
      idleTimeRef.current = 0;
      setIsInspectMode(false);

      // Align orbital yaw & pitch with the artwork so manual drag starts smoothly looking at it
      const isLeft = clampedIndex % 2 === 0;
      cameraYawRef.current = isLeft ? -Math.PI / 2 : Math.PI / 2;
      cameraPitchRef.current = 0;
      yawVelocityRef.current = 0;
      pitchVelocityRef.current = 0;

      // Lock dedicated target object for Three.js spotlight tracking
      if (spotlightTargetObjectRef.current) {
        spotlightTargetObjectRef.current.position.copy(spot.position);
      }
      if (focusSpotlightRef.current) {
        const lightPos = spot.position.clone();
        lightPos.y += 1.4;
        lightPos.x += isLeft ? 1.4 : -1.4;
        focusSpotlightRef.current.position.copy(lightPos);
      }

      // Preload active masterpiece and nearest neighbors immediately
      if (loadTextureRef.current) {
        loadTextureRef.current(clampedIndex);
        loadTextureRef.current((clampedIndex + 1) % total);
        loadTextureRef.current((clampedIndex + 2) % total);
        loadTextureRef.current(((clampedIndex - 1) % total + total) % total);
        loadTextureRef.current(((clampedIndex - 2) % total + total) % total);
      }
    }
  }, []);

  const handlePrev = () => goToArtwork(currentIndex - 1);
  const handleNext = () => goToArtwork(currentIndex + 1);

  // 2. Ambient Museum Acoustic Sound (Peaceful harmonic drone)
  const toggleAmbientSound = () => {
    if (!audioContextRef.current) {
      try {
        const AudioCtx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        const ctx = new AudioCtx();
        audioContextRef.current = ctx;

        const masterGain = ctx.createGain();
        masterGain.gain.setValueAtTime(0.001, ctx.currentTime);
        masterGain.gain.exponentialRampToValueAtTime(0.045, ctx.currentTime + 2.5);
        masterGain.connect(ctx.destination);
        audioGainRef.current = masterGain;

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(160, ctx.currentTime);
        filter.connect(masterGain);

        // Drone Harmonics (C-G-E pure calm chords)
        [55, 110, 164.81].forEach((freq, i) => {
          const osc = ctx.createOscillator();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, ctx.currentTime);
          const g = ctx.createGain();
          g.gain.setValueAtTime(0.5 / (i + 1), ctx.currentTime);
          osc.connect(g);
          g.connect(filter);
          osc.start();
        });

        setIsAudioActive(true);
      } catch (err) {
        console.warn('AudioContext requires user gesture', err);
      }
    } else {
      if (isAudioActive) {
        audioGainRef.current?.gain.setValueAtTime(0, audioContextRef.current.currentTime);
        setIsAudioActive(false);
      } else {
        audioGainRef.current?.gain.setValueAtTime(0.045, audioContextRef.current.currentTime);
        setIsAudioActive(true);
      }
    }
  };

  // 3. Fullscreen Toggle
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // 4. Dynamic Lighting Mood Updates
  useEffect(() => {
    if (!sceneRef.current || !hemiLightRef.current || !skylightSunRef.current) return;

    const scene = sceneRef.current;
    const hemi = hemiLightRef.current;
    const sun = skylightSunRef.current;
    const amb = ambientLightRef.current;
    const washerL = wallWasherLeftRef.current;
    const washerR = wallWasherRightRef.current;

    if (lightingMood === 'daylight') {
      if (amb) {
        amb.color.setHex(0xfffaec);
        amb.intensity = 1.35;
      }

      hemi.color.setHex(0xfff5e6);
      hemi.groundColor.setHex(0x5a483a);
      hemi.intensity = 0.95;

      sun.color.setHex(0xfff0dd);
      sun.intensity = 0.85;

      if (washerL) {
        washerL.color.setHex(0xfff2e0);
        washerL.intensity = 1.25;
      }
      if (washerR) {
        washerR.color.setHex(0xfff2e0);
        washerR.intensity = 1.25;
      }

      scene.background = new THREE.Color(0x1a1510);
      if (scene.fog && scene.fog instanceof THREE.Fog) {
        scene.fog.color.setHex(0x1a1510);
        scene.fog.near = 65;
        scene.fog.far = 240;
      }

      bayLanternsRef.current.forEach((l) => {
        l.color.setHex(0xffecd0);
        l.intensity = 1.8;
      });

      if (focusSpotlightRef.current) {
        focusSpotlightRef.current.color.setHex(0xfffaea);
        focusSpotlightRef.current.intensity = 3.6;
      }
    } else if (lightingMood === 'goldenHour') {
      if (amb) {
        amb.color.setHex(0xffdcb5);
        amb.intensity = 1.25;
      }

      hemi.color.setHex(0xffaa55);
      hemi.groundColor.setHex(0x552814);
      hemi.intensity = 0.9;

      sun.color.setHex(0xff7722);
      sun.intensity = 1.6;

      if (washerL) {
        washerL.color.setHex(0xff9944);
        washerL.intensity = 1.4;
      }
      if (washerR) {
        washerR.color.setHex(0xff9944);
        washerR.intensity = 1.4;
      }

      scene.background = new THREE.Color(0x221308);
      if (scene.fog && scene.fog instanceof THREE.Fog) {
        scene.fog.color.setHex(0x221308);
        scene.fog.near = 60;
        scene.fog.far = 230;
      }

      bayLanternsRef.current.forEach((l) => {
        l.color.setHex(0xff9933);
        l.intensity = 2.2;
      });

      if (focusSpotlightRef.current) {
        focusSpotlightRef.current.color.setHex(0xffb866);
        focusSpotlightRef.current.intensity = 3.8;
      }
    } else if (lightingMood === 'nocturne') {
      if (amb) {
        amb.color.setHex(0x586a8a);
        amb.intensity = 0.85;
      }

      hemi.color.setHex(0x243250);
      hemi.groundColor.setHex(0x182030);
      hemi.intensity = 0.55;

      sun.color.setHex(0x304468);
      sun.intensity = 0.45;

      if (washerL) {
        washerL.color.setHex(0x556e9c);
        washerL.intensity = 0.9;
      }
      if (washerR) {
        washerR.color.setHex(0x556e9c);
        washerR.intensity = 0.9;
      }

      scene.background = new THREE.Color(0x0a101a);
      if (scene.fog && scene.fog instanceof THREE.Fog) {
        scene.fog.color.setHex(0x0a101a);
        scene.fog.near = 50;
        scene.fog.far = 200;
      }

      bayLanternsRef.current.forEach((l) => {
        l.color.setHex(0xd5851f);
        l.intensity = 1.6;
      });

      if (focusSpotlightRef.current) {
        focusSpotlightRef.current.color.setHex(0xffe2aa);
        focusSpotlightRef.current.intensity = 5.2;
      }
    }
  }, [lightingMood]);

  // 5. Dynamic Frame Style Updates
  useEffect(() => {
    spotsRef.current.forEach((spot) => {
      if (!spot.outerFrameMesh || !spot.innerBevelMesh || !spot.matboardMesh) return;

      const outerMat = spot.outerFrameMesh.material as THREE.MeshStandardMaterial;
      const innerMat = spot.innerBevelMesh.material as THREE.MeshStandardMaterial;
      const matMat = spot.matboardMesh.material as THREE.MeshStandardMaterial;

      if (frameStyle === 'gilded') {
        outerMat.color.setHex(0xd5851f);
        outerMat.metalness = 0.88;
        outerMat.roughness = 0.22;
        innerMat.color.setHex(0x5a3e2b);
        innerMat.metalness = 0.2;
        innerMat.roughness = 0.5;
        matMat.color.setHex(0x06080d);
      } else if (frameStyle === 'walnut') {
        outerMat.color.setHex(0x3a2518);
        outerMat.metalness = 0.12;
        outerMat.roughness = 0.36;
        innerMat.color.setHex(0x1f140c);
        innerMat.metalness = 0.1;
        innerMat.roughness = 0.6;
        matMat.color.setHex(0x101318);
      } else if (frameStyle === 'oak') {
        outerMat.color.setHex(0xd8b589);
        outerMat.metalness = 0.05;
        outerMat.roughness = 0.45;
        innerMat.color.setHex(0xf0e6d6);
        innerMat.metalness = 0.05;
        innerMat.roughness = 0.7;
        matMat.color.setHex(0xf7f5f0);
      } else if (frameStyle === 'obsidian') {
        outerMat.color.setHex(0x0a0c10);
        outerMat.metalness = 0.45;
        outerMat.roughness = 0.18;
        innerMat.color.setHex(0x050608);
        innerMat.metalness = 0.3;
        innerMat.roughness = 0.3;
        matMat.color.setHex(0x000000);
      }
    });
  }, [frameStyle]);

  // 6. Enter / Exit 3D Inspection Mode
  const toggleInspectMode = () => {
    if (!isInspectMode) {
      if (spotsRef.current[currentIndex]) {
        const spot = spotsRef.current[currentIndex];
        const inspectPos = spot.cameraPosition.clone().lerp(spot.cameraLookAt, 0.55);
        targetCamPosRef.current.copy(inspectPos);
        targetLookAtRef.current.copy(spot.cameraLookAt);
        isGuidedTourRef.current = true;
      }
      setIsInspectMode(true);
    } else {
      if (spotsRef.current[currentIndex]) {
        const spot = spotsRef.current[currentIndex];
        targetCamPosRef.current.copy(spot.cameraPosition);
        targetLookAtRef.current.copy(spot.cameraLookAt);
        isGuidedTourRef.current = true;
      }
      setIsInspectMode(false);
    }
  };

  // 7. Main Three.js Scene Setup & Render Loop
  useEffect(() => {
    const mountEl = canvasMountRef.current;
    if (!mountEl) return;

    const width = mountEl.clientWidth || window.innerWidth;
    const height = mountEl.clientHeight || 700;

    // --- Scene ---
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x1a1510);
    // Linear gentle museum atmosphere (illuminated and warm, never black)
    scene.fog = new THREE.Fog(0x1a1510, 65, 240);

    // --- Camera (220m far plane to encompass the whole 92m hall without clipping) ---
    const camera = new THREE.PerspectiveCamera(52, width / height, 0.1, 220);
    camera.position.set(0, 2.0, hallLength / 2 - 4.5);
    cameraRef.current = camera;
    currentLookAtRef.current.set(0, 2.0, 0);

    // --- Renderer ---
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
      alpha: false,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    mountEl.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // --- Lighting Architecture (Balanced, Warm, Museum-Grade) ---
    // 1. Omnipresent Museum Gallery Ambient Light (Guarantees zero black voids!)
    const ambientLight = new THREE.AmbientLight(0xfffaec, 1.35);
    scene.add(ambientLight);
    ambientLightRef.current = ambientLight;

    // 2. Warm Archival Hemisphere Ambient Light
    const hemiLight = new THREE.HemisphereLight(0xfff5e6, 0x5a483a, 0.95);
    scene.add(hemiLight);
    hemiLightRef.current = hemiLight;

    // 3. Directional Wall-Washer Lights (Angled illumination sweeping along all paintings)
    const wallWasherLeft = new THREE.DirectionalLight(0xfff2e0, 1.25);
    wallWasherLeft.position.set(2.0, 6.0, 0);
    const washerTargetL = new THREE.Object3D();
    washerTargetL.position.set(-hallWidth / 2, 2.5, 0);
    scene.add(washerTargetL);
    wallWasherLeft.target = washerTargetL;
    scene.add(wallWasherLeft);
    wallWasherLeftRef.current = wallWasherLeft;

    const wallWasherRight = new THREE.DirectionalLight(0xfff2e0, 1.25);
    wallWasherRight.position.set(-2.0, 6.0, 0);
    const washerTargetR = new THREE.Object3D();
    washerTargetR.position.set(hallWidth / 2, 2.5, 0);
    scene.add(washerTargetR);
    wallWasherRight.target = washerTargetR;
    scene.add(wallWasherRight);
    wallWasherRightRef.current = wallWasherRight;

    // 4. Coffered Skylight Directional Sun
    const skylightSun = new THREE.DirectionalLight(0xfff0dd, 0.85);
    skylightSun.position.set(0, 16, 0);
    skylightSun.castShadow = true;
    skylightSun.shadow.mapSize.width = 1024;
    skylightSun.shadow.mapSize.height = 1024;
    skylightSun.shadow.camera.near = 1;
    skylightSun.shadow.camera.far = 32;
    skylightSun.shadow.camera.left = -10;
    skylightSun.shadow.camera.right = 10;
    skylightSun.shadow.camera.top = hallLength / 2 + 5;
    skylightSun.shadow.camera.bottom = -hallLength / 2 - 5;
    skylightSun.shadow.bias = -0.0004;
    scene.add(skylightSun);
    skylightSunRef.current = skylightSun;

    // 5. Multi-zone Bay Downlights (Distributed down the length of the hall)
    const bayLanterns: THREE.PointLight[] = [];
    const numLanterns = Math.max(3, Math.ceil(hallLength / 18));
    for (let l = 0; l < numLanterns; l++) {
      const lanternZ = -hallLength / 2 + 10 + (l / (numLanterns - 1)) * (hallLength - 20);
      const lantern = new THREE.PointLight(0xffecd0, 1.8, 28, 1.6);
      lantern.position.set(0, hallHeight - 0.6, lanternZ);
      scene.add(lantern);
      bayLanterns.push(lantern);
    }
    bayLanternsRef.current = bayLanterns;

    // --- Architectural Materials ---
    const upperWallMat = new THREE.MeshStandardMaterial({
      color: 0x483a2f, // Warm Archival Museum Plaster & Stone
      roughness: 0.82,
      metalness: 0.05,
    });
    const wainscotMat = new THREE.MeshStandardMaterial({
      color: 0x3d2719, // Deep French Walnut Wainscoting
      roughness: 0.42,
      metalness: 0.12,
    });
    const brassRailMat = new THREE.MeshStandardMaterial({
      color: 0xd5851f, // Polished brass trim
      roughness: 0.25,
      metalness: 0.85,
    });
    const pilasterMat = new THREE.MeshStandardMaterial({
      color: 0x2e251e,
      roughness: 0.5,
      metalness: 0.1,
    });

    // 1. Herringbone Parquet Floor
    const parquetTex = createParquetTexture();
    const floorGeo = new THREE.PlaneGeometry(hallWidth, hallLength);
    const floorMat = new THREE.MeshStandardMaterial({
      map: parquetTex,
      roughness: 0.32,
      metalness: 0.18,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);
    floorPlaneMeshRef.current = floor;

    // 2. Vaulted Ceiling & Skylight
    const ceilingGeo = new THREE.PlaneGeometry(hallWidth, hallLength);
    const ceilingMat = new THREE.MeshStandardMaterial({
      color: 0x1d1814,
      roughness: 0.85,
    });
    const ceiling = new THREE.Mesh(ceilingGeo, ceilingMat);
    ceiling.position.y = hallHeight;
    ceiling.rotation.x = Math.PI / 2;
    scene.add(ceiling);

    const skylightGeo = new THREE.PlaneGeometry(3.6, hallLength - 4);
    const skylightMat = new THREE.MeshBasicMaterial({
      color: 0xfff6e8,
      transparent: true,
      opacity: 0.88,
    });
    const skylightMesh = new THREE.Mesh(skylightGeo, skylightMat);
    skylightMesh.position.set(0, hallHeight - 0.05, 0);
    skylightMesh.rotation.x = Math.PI / 2;
    scene.add(skylightMesh);

    // 3. Walls
    const createMuseumWall = (w: number, x: number, z: number, rotY: number) => {
      const wallGroup = new THREE.Group();
      wallGroup.position.set(x, 0, z);
      wallGroup.rotation.y = rotY;

      const lowerGeo = new THREE.PlaneGeometry(w, 1.35);
      const lowerMesh = new THREE.Mesh(lowerGeo, wainscotMat);
      lowerMesh.position.set(0, 1.35 / 2, 0);
      lowerMesh.receiveShadow = true;
      wallGroup.add(lowerMesh);

      const dadoGeo = new THREE.BoxGeometry(w, 0.08, 0.05);
      const dadoMesh = new THREE.Mesh(dadoGeo, brassRailMat);
      dadoMesh.position.set(0, 1.35, 0.025);
      dadoMesh.castShadow = true;
      wallGroup.add(dadoMesh);

      const upperGeo = new THREE.PlaneGeometry(w, hallHeight - 1.35);
      const upperMesh = new THREE.Mesh(upperGeo, upperWallMat);
      upperMesh.position.set(0, 1.35 + (hallHeight - 1.35) / 2, 0);
      upperMesh.receiveShadow = true;
      wallGroup.add(upperMesh);

      const pictureRailGeo = new THREE.BoxGeometry(w, 0.04, 0.04);
      const pictureRail = new THREE.Mesh(pictureRailGeo, brassRailMat);
      pictureRail.position.set(0, 4.4, 0.02);
      wallGroup.add(pictureRail);

      const baseboardGeo = new THREE.BoxGeometry(w, 0.22, 0.06);
      const baseboard = new THREE.Mesh(baseboardGeo, wainscotMat);
      baseboard.position.set(0, 0.11, 0.03);
      wallGroup.add(baseboard);

      scene.add(wallGroup);
    };

    createMuseumWall(hallLength, -hallWidth / 2, 0, Math.PI / 2);
    createMuseumWall(hallLength, hallWidth / 2, 0, -Math.PI / 2);
    createMuseumWall(hallWidth, 0, -hallLength / 2, 0);
    createMuseumWall(hallWidth, 0, hallLength / 2, Math.PI);

    // 4. Neoclassical Pilasters Framing Each Bay
    for (let b = 0; b <= totalBays; b++) {
      const pilasterZ = -hallLength / 2 + 8 + (b - 0.5) * baySpacing;

      const createPilaster = (pilasterX: number, isLeftWall: boolean) => {
        const pGroup = new THREE.Group();
        pGroup.position.set(pilasterX, 0, pilasterZ);
        if (!isLeftWall) pGroup.rotation.y = Math.PI;

        const plinth = new THREE.Mesh(new THREE.BoxGeometry(0.18, 1.4, 0.65), pilasterMat);
        plinth.position.set(0.09, 0.7, 0);
        plinth.receiveShadow = true;
        pGroup.add(plinth);

        const shaft = new THREE.Mesh(
          new THREE.BoxGeometry(0.12, hallHeight - 1.8, 0.55),
          pilasterMat
        );
        shaft.position.set(0.06, 1.4 + (hallHeight - 1.8) / 2, 0);
        shaft.receiveShadow = true;
        pGroup.add(shaft);

        const cap = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.12, 0.68), brassRailMat);
        cap.position.set(0.08, hallHeight - 0.45, 0);
        pGroup.add(cap);

        scene.add(pGroup);
      };

      createPilaster(-hallWidth / 2, true);
      createPilaster(hallWidth / 2, false);
    }

    // 5. Curatorial Classical Portals / Archways Dividing Salons
    // Salon 1: Neoclassical Grand Hall (Bays 1-6)
    // Salon 2: Luminist & Portrait Atrium (Bays 7-12)
    // Salon 3: Calligraphy & Archival Studies (Bays 13+)
    const createCuratorialArchway = (archZ: number, titleText: string) => {
      const archGroup = new THREE.Group();
      archGroup.position.set(0, 0, archZ);

      // Left column
      const colL = new THREE.Mesh(new THREE.BoxGeometry(1.2, hallHeight, 0.4), pilasterMat);
      colL.position.set(-hallWidth / 2 + 0.6, hallHeight / 2, 0);
      archGroup.add(colL);

      // Right column
      const colR = new THREE.Mesh(new THREE.BoxGeometry(1.2, hallHeight, 0.4), pilasterMat);
      colR.position.set(hallWidth / 2 - 0.6, hallHeight / 2, 0);
      archGroup.add(colR);

      // Transverse Beam / Entablature
      const beam = new THREE.Mesh(new THREE.BoxGeometry(hallWidth, 0.6, 0.45), pilasterMat);
      beam.position.set(0, hallHeight - 0.5, 0);
      archGroup.add(beam);

      // Brass arch trim
      const trim = new THREE.Mesh(new THREE.BoxGeometry(hallWidth, 0.08, 0.5), brassRailMat);
      trim.position.set(0, hallHeight - 0.8, 0);
      archGroup.add(trim);

      // Archival salon plaque with embossed golden lettering
      const plaqueCanvas = document.createElement('canvas');
      plaqueCanvas.width = 512;
      plaqueCanvas.height = 64;
      const pctx = plaqueCanvas.getContext('2d')!;
      pctx.fillStyle = '#26180e';
      pctx.fillRect(0, 0, 512, 64);
      pctx.strokeStyle = '#d5851f';
      pctx.lineWidth = 3;
      pctx.strokeRect(4, 4, 504, 56);
      pctx.font = '600 20px "Cinzel", Georgia, serif';
      pctx.fillStyle = '#f4d9a0';
      pctx.textAlign = 'center';
      pctx.textBaseline = 'middle';
      pctx.fillText(titleText, 256, 32);

      const plaqueTex = new THREE.CanvasTexture(plaqueCanvas);
      plaqueTex.colorSpace = THREE.SRGBColorSpace;
      const plaqueMat = new THREE.MeshStandardMaterial({
        map: plaqueTex,
        roughness: 0.35,
        metalness: 0.4,
      });

      const plaque = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.36, 0.52), plaqueMat);
      plaque.position.set(0, hallHeight - 0.5, 0);
      archGroup.add(plaque);

      scene.add(archGroup);
    };

    if (totalBays >= 12) {
      const arch1Z = -hallLength / 2 + 8 + 5.5 * baySpacing;
      const arch2Z = -hallLength / 2 + 8 + 11.5 * baySpacing;
      createCuratorialArchway(arch1Z, 'SALON II · LUMINIST ATRIUM');
      createCuratorialArchway(arch2Z, 'SALON III · ARCHIVAL ROTUNDA');
    }

    // 6. Velvet Ottoman Benches in Hall Center
    const createBench = (benchZ: number) => {
      const benchGroup = new THREE.Group();
      benchGroup.position.set(0, 0, benchZ);

      const cushionMat = new THREE.MeshStandardMaterial({
        color: 0x1a212d,
        roughness: 0.92,
        metalness: 0.02,
      });
      const cushion = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.24, 2.8), cushionMat);
      cushion.position.y = 0.52;
      cushion.castShadow = true;
      benchGroup.add(cushion);

      const benchPlinth = new THREE.Mesh(new THREE.BoxGeometry(1.05, 0.38, 2.6), wainscotMat);
      benchPlinth.position.y = 0.2;
      benchPlinth.castShadow = true;
      benchGroup.add(benchPlinth);

      const benchTrim = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.04, 2.65), brassRailMat);
      benchTrim.position.y = 0.4;
      benchGroup.add(benchTrim);
      scene.add(benchGroup);
    };

    createBench(0);
    if (hallLength > 60) {
      createBench(-22);
      createBench(22);
    }

    // 7. Neoclassical Entrance Plinth with Guestbook
    const pedestalGroup = new THREE.Group();
    pedestalGroup.position.set(0, 0, hallLength / 2 - 3.2);

    const stonePedestal = new THREE.Mesh(
      new THREE.CylinderGeometry(0.38, 0.44, 1.1, 24),
      pilasterMat
    );
    stonePedestal.position.y = 0.55;
    stonePedestal.castShadow = true;
    stonePedestal.receiveShadow = true;
    pedestalGroup.add(stonePedestal);

    // Leather Guestbook
    const bookGeo = new THREE.BoxGeometry(0.48, 0.06, 0.34);
    const bookMat = new THREE.MeshStandardMaterial({
      color: 0x4a2c1d,
      roughness: 0.7,
      metalness: 0.1,
    });
    const bookMesh = new THREE.Mesh(bookGeo, bookMat);
    bookMesh.position.set(0, 1.13, 0);
    bookMesh.rotation.y = -Math.PI / 12;
    bookMesh.userData = { isGuestbook: true };
    pedestalGroup.add(bookMesh);
    guestbookPedestalRef.current = bookMesh;

    // Brass Feather Quill
    const quillMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.008, 0.002, 0.28),
      brassRailMat
    );
    quillMesh.position.set(0.16, 1.22, 0);
    quillMesh.rotation.z = Math.PI / 6;
    pedestalGroup.add(quillMesh);

    scene.add(pedestalGroup);

    // 8. Floating Golden Dust Motes
    const particleCount = 180;
    const particleGeo = new THREE.BufferGeometry();
    const particlePos = new Float32Array(particleCount * 3);
    const particleSpeeds = new Float32Array(particleCount);

    for (let p = 0; p < particleCount; p++) {
      particlePos[p * 3] = (Math.random() - 0.5) * (hallWidth - 2);
      particlePos[p * 3 + 1] = 0.3 + Math.random() * (hallHeight - 1);
      particlePos[p * 3 + 2] = (Math.random() - 0.5) * (hallLength - 4);
      particleSpeeds[p] = 0.15 + Math.random() * 0.35;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));
    const moteTex = createMoteTexture();
    const particleMat = new THREE.PointsMaterial({
      size: 0.16,
      map: moteTex,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const dustMotes = new THREE.Points(particleGeo, particleMat);
    scene.add(dustMotes);

    // 9. Floor Reticle for Click-to-Walk
    const reticleGroup = new THREE.Group();
    reticleGroup.position.set(0, 0.02, 0);
    reticleGroup.visible = false;

    const reticleOuter = new THREE.Mesh(
      new THREE.RingGeometry(0.38, 0.44, 32),
      new THREE.MeshBasicMaterial({
        color: 0xd5851f,
        transparent: true,
        opacity: 0.85,
        side: THREE.DoubleSide,
      })
    );
    reticleOuter.rotation.x = -Math.PI / 2;
    reticleGroup.add(reticleOuter);

    const reticleInner = new THREE.Mesh(
      new THREE.RingGeometry(0.02, 0.1, 24),
      new THREE.MeshBasicMaterial({
        color: 0xffe6b8,
        transparent: true,
        opacity: 0.95,
        side: THREE.DoubleSide,
      })
    );
    reticleInner.rotation.x = -Math.PI / 2;
    reticleGroup.add(reticleInner);
    scene.add(reticleGroup);
    floorReticleMeshRef.current = reticleOuter;

    // --- Mount ALL Artworks in 3D (No slicing!) ---
    const spots: ArtworkSpot[] = [];
    const textureLoader = new THREE.TextureLoader();
    const placeholderTex = createArchivalCanvasPlaceholder();

    const outerGoldMat = new THREE.MeshStandardMaterial({
      color: 0xd5851f,
      metalness: 0.88,
      roughness: 0.22,
    });
    const innerBevelMat = new THREE.MeshStandardMaterial({
      color: 0x5a3e2b,
      metalness: 0.2,
      roughness: 0.5,
    });
    const matboardMat = new THREE.MeshStandardMaterial({
      color: 0x06080d,
      roughness: 0.94,
    });
    const brassPlaqueMat = new THREE.MeshStandardMaterial({
      color: 0xd9af75,
      metalness: 0.85,
      roughness: 0.25,
    });
    const backCanvasMat = new THREE.MeshStandardMaterial({
      color: 0x241c14,
      roughness: 0.85,
    });

    artworks.forEach((art, idx) => {
      const isLeft = idx % 2 === 0;
      const bayIndex = Math.floor(idx / 2);
      const z = -hallLength / 2 + 8 + bayIndex * baySpacing;
      const x = isLeft ? -hallWidth / 2 + 0.08 : hallWidth / 2 - 0.08;
      const rotationY = isLeft ? Math.PI / 2 : -Math.PI / 2;

      const artGroup = new THREE.Group();
      artGroup.position.set(x, 2.35, z);
      artGroup.rotation.y = rotationY;

      const rawAspect = art.primaryImage?.aspectRatio || 1.25;
      const aspect =
        typeof rawAspect === 'number' ? rawAspect : parseFloat(String(rawAspect)) || 1.25;

      const frameH = 1.95;
      const frameW = frameH * Math.min(2.0, Math.max(0.65, aspect));
      const frameDepth = 0.09;

      // 1. Outer Gilded Molding
      const outerFrame = new THREE.Mesh(
        new THREE.BoxGeometry(frameW + 0.32, frameH + 0.32, frameDepth),
        outerGoldMat.clone()
      );
      outerFrame.castShadow = true;
      artGroup.add(outerFrame);

      // 2. Secondary Walnut Wood Bevel
      const innerBevel = new THREE.Mesh(
        new THREE.BoxGeometry(frameW + 0.22, frameH + 0.22, frameDepth + 0.015),
        innerBevelMat.clone()
      );
      artGroup.add(innerBevel);

      // 3. Matboard
      const matboard = new THREE.Mesh(
        new THREE.BoxGeometry(frameW + 0.12, frameH + 0.12, frameDepth + 0.025),
        matboardMat.clone()
      );
      artGroup.add(matboard);

      // 4. Stretched Fine Art Canvas (Starts with instant warm linen placeholder!)
      const canvasGeo = new THREE.PlaneGeometry(frameW, frameH);
      const canvasMat = new THREE.MeshStandardMaterial({
        map: placeholderTex,
        roughness: 0.38,
        metalness: 0.02,
      });

      const canvasMesh = new THREE.Mesh(canvasGeo, canvasMat);
      canvasMesh.position.z = frameDepth / 2 + 0.02;
      canvasMesh.castShadow = true;
      canvasMesh.userData = { artwork: art, index: idx };
      artGroup.add(canvasMesh);

      // Back of Canvas Archival Seal for 3D Inspection Mode
      const backMesh = new THREE.Mesh(new THREE.PlaneGeometry(frameW, frameH), backCanvasMat);
      backMesh.position.z = -frameDepth / 2 - 0.005;
      backMesh.rotation.y = Math.PI;
      artGroup.add(backMesh);

      // Crimson Wax Seal on Back
      const sealMesh = new THREE.Mesh(
        new THREE.CylinderGeometry(0.1, 0.1, 0.02, 16),
        new THREE.MeshStandardMaterial({ color: 0x8a1c14, roughness: 0.3, metalness: 0.2 })
      );
      sealMesh.rotation.x = Math.PI / 2;
      sealMesh.position.set(0, 0, -frameDepth / 2 - 0.015);
      artGroup.add(sealMesh);

      // 5. Engraved Brass Title Plaque
      const plaqueMesh = new THREE.Mesh(
        new THREE.BoxGeometry(Math.min(0.8, frameW * 0.85), 0.18, 0.02),
        brassPlaqueMat
      );
      plaqueMesh.position.set(0, -frameH / 2 - 0.24, frameDepth / 2);
      artGroup.add(plaqueMesh);

      // 6. Picture Sconce Lamp with Focused Artwork Spotlight
      const sconceGroup = new THREE.Group();
      sconceGroup.position.set(0, frameH / 2 + 0.32, 0);

      const armMesh = new THREE.Mesh(
        new THREE.CylinderGeometry(0.015, 0.015, 0.38),
        brassRailMat
      );
      armMesh.rotation.x = Math.PI / 2.3;
      armMesh.position.set(0, 0, 0.18);
      sconceGroup.add(armMesh);

      const shadeWidth = Math.min(1.3, frameW * 0.65);
      const shadeMesh = new THREE.Mesh(
        new THREE.CylinderGeometry(0.038, 0.038, shadeWidth, 16),
        brassRailMat
      );
      shadeMesh.rotation.z = Math.PI / 2;
      shadeMesh.position.set(0, 0.04, 0.35);
      sconceGroup.add(shadeMesh);

      const glowStrip = new THREE.Mesh(
        new THREE.PlaneGeometry(shadeWidth * 0.9, 0.03),
        new THREE.MeshBasicMaterial({ color: 0xfff0d4 })
      );
      glowStrip.rotation.x = Math.PI / 2;
      glowStrip.position.set(0, 0.01, 0.35);
      sconceGroup.add(glowStrip);

      artGroup.add(sconceGroup);
      scene.add(artGroup);

      const camX = isLeft ? -hallWidth / 2 + 3.4 : hallWidth / 2 - 3.4;
      const cameraPosition = new THREE.Vector3(camX, 2.1, z);
      const cameraLookAt = new THREE.Vector3(x, 2.15, z);

      spots.push({
        artwork: art,
        index: idx,
        position: new THREE.Vector3(x, 2.35, z),
        rotation: new THREE.Euler(0, rotationY, 0),
        cameraPosition,
        cameraLookAt,
        mesh: canvasMesh,
        group: artGroup,
        outerFrameMesh: outerFrame,
        innerBevelMesh: innerBevel,
        matboardMesh: matboard,
        canvasMat,
      });
    });

    spotsRef.current = spots;
    setIsLoading(false);

    // Dedicated Focus Spotlight for Active Artwork
    const spotlightTargetObj = new THREE.Object3D();
    scene.add(spotlightTargetObj);
    spotlightTargetObjectRef.current = spotlightTargetObj;

    const focusSpotlight = new THREE.SpotLight(0xfffaea, 3.6);
    focusSpotlight.angle = Math.PI / 2.8;
    focusSpotlight.penumbra = 0.6;
    focusSpotlight.decay = 1.4;
    focusSpotlight.distance = 10.0;
    focusSpotlight.castShadow = false;
    focusSpotlight.target = spotlightTargetObj;
    scene.add(focusSpotlight);
    focusSpotlightRef.current = focusSpotlight;

    // Initial viewpoint: First artwork
    if (spots.length > 0) {
      targetCamPosRef.current.copy(spots[0].cameraPosition);
      targetLookAtRef.current.copy(spots[0].cameraLookAt);
      camera.position.copy(spots[0].cameraPosition);
      currentLookAtRef.current.copy(spots[0].cameraLookAt);
      camera.lookAt(spots[0].cameraLookAt);

      // Pre-align orbit yaw with first masterpiece so mouse/touch drag orbits smoothly
      const isLeft = true;
      cameraYawRef.current = isLeft ? -Math.PI / 2 : Math.PI / 2;
      cameraPitchRef.current = 0;
      yawVelocityRef.current = 0;
      pitchVelocityRef.current = 0;

      spotlightTargetObj.position.copy(spots[0].position);
      const lightPos = spots[0].position.clone();
      lightPos.y += 1.4;
      lightPos.x += 1.4;
      focusSpotlight.position.copy(lightPos);
    }

    // --- Progressive Texture Ingestion (Lightweight Web-Optimized, Zero Latency) ---
    const loadTextureForSpot = (spotIndex: number) => {
      const targetSpot = spots[spotIndex];
      if (!targetSpot || !targetSpot.canvasMat) return;

      const rawUrl = targetSpot.artwork.primaryImage?.secureUrl;
      const imgUrl = getOptimizedImageUrl(rawUrl, 'thumb');
      if (!imgUrl) return;

      if (textureCacheRef.current.has(imgUrl)) {
        const cachedTex = textureCacheRef.current.get(imgUrl)!;
        targetSpot.canvasMat.map = cachedTex;
        targetSpot.canvasMat.needsUpdate = true;
        return;
      }

      textureLoader.load(
        imgUrl,
        (tex) => {
          tex.colorSpace = THREE.SRGBColorSpace;
          tex.generateMipmaps = true;
          tex.minFilter = THREE.LinearMipmapLinearFilter;
          textureCacheRef.current.set(imgUrl, tex);
          if (targetSpot.canvasMat) {
            targetSpot.canvasMat.map = tex;
            targetSpot.canvasMat.needsUpdate = true;
          }
        },
        undefined,
        (err) => console.warn('Texture fallback for', targetSpot.artwork.title, err)
      );
    };

    loadTextureRef.current = loadTextureForSpot;

    // Immediately load the active artwork and entire first salon in parallel (<60KB each, instantaneous!)
    for (let i = 0; i < Math.min(8, spots.length); i++) {
      loadTextureForSpot(i);
    }

    // Smoothly queue remaining artworks in rapid micro-batches (3 every 70ms)
    let queueIdx = 8;
    const batchInterval = window.setInterval(() => {
      if (queueIdx >= spots.length) {
        clearInterval(batchInterval);
        return;
      }
      for (let k = 0; k < 3 && queueIdx < spots.length; k++, queueIdx++) {
        loadTextureForSpot(queueIdx);
      }
    }, 70);

    // --- Interaction & Pointer Events ---
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let cachedRect = mountEl.getBoundingClientRect();

    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      isDraggingRef.current = true;
      idleTimeRef.current = 0;
      cachedRect = mountEl.getBoundingClientRect();

      if ('touches' in e && e.touches.length === 2) {
        touchPinchDistRef.current = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        return;
      }

      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      dragStartPosRef.current = { x: clientX, y: clientY };
      previousMousePosRef.current = { x: clientX, y: clientY };
      yawVelocityRef.current = 0;
      pitchVelocityRef.current = 0;
    };

    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      if ('touches' in e && e.touches.length === 2 && touchPinchDistRef.current !== null) {
        const currentDist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        const deltaPinch = currentDist - touchPinchDistRef.current;
        touchPinchDistRef.current = currentDist;

        const dir = new THREE.Vector3();
        camera.getWorldDirection(dir);
        const zoomDelta = deltaPinch * 0.012;
        const newPos = targetCamPosRef.current.clone().addScaledVector(dir, zoomDelta);
        if (Math.abs(newPos.x) < hallWidth / 2 - 1.2 && Math.abs(newPos.z) < hallLength / 2 - 2) {
          targetCamPosRef.current.copy(newPos);
          isGuidedTourRef.current = false;
        }
        return;
      }

      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

      mouse.x = ((clientX - cachedRect.left) / cachedRect.width) * 2 - 1;
      mouse.y = -((clientY - cachedRect.top) / cachedRect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      if (floorPlaneMeshRef.current && reticleGroup) {
        const floorHits = raycaster.intersectObject(floorPlaneMeshRef.current);
        if (floorHits.length > 0) {
          reticleGroup.position.x = floorHits[0].point.x;
          reticleGroup.position.z = floorHits[0].point.z;
          reticleGroup.visible = true;
        } else {
          reticleGroup.visible = false;
        }
      }

      if (!isDraggingRef.current) return;

      const deltaX = clientX - previousMousePosRef.current.x;
      const deltaY = clientY - previousMousePosRef.current.y;
      previousMousePosRef.current = { x: clientX, y: clientY };

      // On mobile devices, ignore predominantly vertical swipes so users can scroll the webpage freely
      if ('touches' in e && Math.abs(deltaY) > Math.abs(deltaX) * 1.5 && Math.abs(deltaX) < 6) {
        return;
      }

      isGuidedTourRef.current = false;
      const sensitivity = 0.0032;
      cameraYawRef.current -= deltaX * sensitivity;
      cameraPitchRef.current = Math.max(
        -0.55,
        Math.min(0.55, cameraPitchRef.current - deltaY * (sensitivity * 0.75))
      );

      yawVelocityRef.current = -deltaX * 0.0006;
      pitchVelocityRef.current = -deltaY * 0.00045;
    };

    const handlePointerUp = (e: MouseEvent | TouchEvent) => {
      touchPinchDistRef.current = null;
      if (!isDraggingRef.current) return;
      isDraggingRef.current = false;

      const clientX = 'changedTouches' in e ? e.changedTouches[0].clientX : e.clientX;
      const clientY = 'changedTouches' in e ? e.changedTouches[0].clientY : e.clientY;

      const distDragged = Math.hypot(
        clientX - dragStartPosRef.current.x,
        clientY - dragStartPosRef.current.y
      );

      if (distDragged < 6) {
        mouse.x = ((clientX - cachedRect.left) / cachedRect.width) * 2 - 1;
        mouse.y = -((clientY - cachedRect.top) / cachedRect.height) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);

        // 1. Check if clicked guestbook on entrance pedestal
        if (guestbookPedestalRef.current) {
          const bookHits = raycaster.intersectObject(guestbookPedestalRef.current);
          if (bookHits.length > 0) {
            setIsGuestbookOpen(true);
            return;
          }
        }

        // 2. Check if clicked artwork
        const meshes = spotsRef.current
          .map((s) => s.mesh)
          .filter((m): m is THREE.Mesh => Boolean(m));
        const artIntersects = raycaster.intersectObjects(meshes);

        if (artIntersects.length > 0) {
          const hitIdx = artIntersects[0].object.userData.index;
          if (typeof hitIdx === 'number') {
            goToArtwork(hitIdx);
            return;
          }
        }

        // 3. Click floor -> "Click-to-Walk"
        if (floorPlaneMeshRef.current) {
          const floorHits = raycaster.intersectObject(floorPlaneMeshRef.current);
          if (floorHits.length > 0) {
            const hitPoint = floorHits[0].point;
            const targetX = Math.max(-hallWidth / 2 + 1.8, Math.min(hallWidth / 2 - 1.8, hitPoint.x));
            const targetZ = Math.max(-hallLength / 2 + 3, Math.min(hallLength / 2 - 3, hitPoint.z));

            targetCamPosRef.current.set(targetX, 2.0, targetZ);
            reticlePulseRef.current = 1.0;
            isGuidedTourRef.current = false;
          }
        }
      }
    };

    // Dolly / Scroll Zoom
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      idleTimeRef.current = 0;
      const zoomFactor = e.deltaY * 0.0035;

      const dir = new THREE.Vector3();
      camera.getWorldDirection(dir);

      const newPos = targetCamPosRef.current.clone().addScaledVector(dir, -zoomFactor);
      if (Math.abs(newPos.x) < hallWidth / 2 - 1.2 && Math.abs(newPos.z) < hallLength / 2 - 2) {
        targetCamPosRef.current.copy(newPos);
        isGuidedTourRef.current = false;
      }
    };

    mountEl.addEventListener('mousedown', handlePointerDown);
    window.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('mouseup', handlePointerUp);
    mountEl.addEventListener('wheel', handleWheel, { passive: false });

    mountEl.addEventListener('touchstart', handlePointerDown, { passive: true });
    window.addEventListener('touchmove', handlePointerMove, { passive: true });
    window.addEventListener('touchend', handlePointerUp);

    // Keyboard (WASD / Arrows)
    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressedRef.current[e.key.toLowerCase()] = true;
      idleTimeRef.current = 0;
      if (e.key === 'ArrowRight' || e.key === 'd') handleNext();
      if (e.key === 'ArrowLeft' || e.key === 'a') handlePrev();
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressedRef.current[e.key.toLowerCase()] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // --- Render Loop (Zero-Allocation 60 FPS for Smooth Mobile/Desktop Experience) ---
    const clock = new THREE.Clock();
    const forwardVec = new THREE.Vector3();
    const rightVec = new THREE.Vector3();
    const lookDirVec = new THREE.Vector3();
    const targetPosWithBreathing = new THREE.Vector3();
    const tempLookTarget = new THREE.Vector3();
    const upVec = new THREE.Vector3(0, 1, 0);
    let frameCount = 0;

    const animate = () => {
      animFrameIdRef.current = requestAnimationFrame(animate);
      frameCount++;
      const delta = clock.getDelta();
      const elapsedTime = clock.getElapsedTime();

      const speed = 4.8 * delta;
      camera.getWorldDirection(forwardVec);
      forwardVec.y = 0;
      forwardVec.normalize();
      rightVec.crossVectors(forwardVec, upVec).normalize();

      if (keysPressedRef.current['w']) {
        targetCamPosRef.current.addScaledVector(forwardVec, speed);
        isGuidedTourRef.current = false;
      }
      if (keysPressedRef.current['s']) {
        targetCamPosRef.current.addScaledVector(forwardVec, -speed);
        isGuidedTourRef.current = false;
      }
      if (keysPressedRef.current['a']) {
        targetCamPosRef.current.addScaledVector(rightVec, -speed);
        isGuidedTourRef.current = false;
      }
      if (keysPressedRef.current['d']) {
        targetCamPosRef.current.addScaledVector(rightVec, speed);
        isGuidedTourRef.current = false;
      }

      if (!isDraggingRef.current) {
        yawVelocityRef.current *= 0.91;
        pitchVelocityRef.current *= 0.91;
        cameraYawRef.current += yawVelocityRef.current;
        cameraPitchRef.current = Math.max(
          -0.65,
          Math.min(0.65, cameraPitchRef.current + pitchVelocityRef.current)
        );
      }

      idleTimeRef.current += delta;
      let idleDriftY = 0;
      if (idleTimeRef.current > 2.0 && !isDraggingRef.current) {
        idleDriftY = Math.sin(elapsedTime * 0.8) * 0.012;
      }

      targetPosWithBreathing.copy(targetCamPosRef.current);
      targetPosWithBreathing.y += idleDriftY;
      camera.position.lerp(targetPosWithBreathing, 0.055);

      if (isGuidedTourRef.current) {
        currentLookAtRef.current.lerp(targetLookAtRef.current, 0.065);
        camera.lookAt(currentLookAtRef.current);
      } else {
        lookDirVec.set(
          Math.sin(cameraYawRef.current) * Math.cos(cameraPitchRef.current),
          Math.sin(cameraPitchRef.current),
          -Math.cos(cameraYawRef.current) * Math.cos(cameraPitchRef.current)
        );
        tempLookTarget.copy(camera.position).add(lookDirVec);
        camera.lookAt(tempLookTarget);
      }

      if (dustMotes && frameCount % 2 === 0) {
        const positions = dustMotes.geometry.attributes.position.array as Float32Array;
        for (let i = 0; i < particleCount; i++) {
          positions[i * 3 + 1] += particleSpeeds[i] * delta * 0.6;
          positions[i * 3] += Math.sin(elapsedTime + i) * 0.005;
          if (positions[i * 3 + 1] > hallHeight - 0.5) {
            positions[i * 3 + 1] = 0.4;
          }
        }
        dustMotes.geometry.attributes.position.needsUpdate = true;
      }

      if (reticlePulseRef.current > 0.01) {
        reticlePulseRef.current *= 0.94;
        if (floorReticleMeshRef.current) {
          const scale = 1.0 + (1.0 - reticlePulseRef.current) * 0.8;
          floorReticleMeshRef.current.scale.set(scale, scale, 1);
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!mountEl) return;
      cachedRect = mountEl.getBoundingClientRect();
      const newW = mountEl.clientWidth;
      const newH = mountEl.clientHeight;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      clearInterval(batchInterval);
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
      window.removeEventListener('resize', handleResize);
      mountEl.removeEventListener('mousedown', handlePointerDown);
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('mouseup', handlePointerUp);
      mountEl.removeEventListener('wheel', handleWheel);
      mountEl.removeEventListener('touchstart', handlePointerDown);
      window.removeEventListener('touchmove', handlePointerMove);
      window.removeEventListener('touchend', handlePointerUp);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);

      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {});
      }

      renderer.dispose();
      if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
    };
  }, [artworks, hallLength, hallWidth, hallHeight, totalBays, baySpacing, goToArtwork]);

  return (
    <div
      ref={containerRef}
      className={styles.galleryWrapper}
      aria-label="Atelier Archival Sanctuary 3D Exhibition"
    >
      <div ref={canvasMountRef} className={styles.canvasContainer} />
      <div className={styles.vignetteOverlay} />

      {isLoading && (
        <div className={styles.loadingOverlay}>
          <div className={styles.loadingSpinner} />
          <div className={styles.loadingText}>Awakening Archival Sanctuary 3D</div>
          <div className={styles.loadingSub}>Curating Neoclassical Exhibition Hall</div>
        </div>
      )}

      {/* Top HUD Bar */}
      <div className={styles.topHud}>
        <div className={styles.sanctuaryBadge}>
          <span className={styles.statusDot} />
          <div className={styles.badgeTextGroup}>
            <span className={styles.badgeTitle}>3D VR Sanctuary Exhibition</span>
            <span className={styles.badgeSubtitle}>
              Room I · Neoclassical Hall · {artworks.length} Masterpieces
            </span>
          </div>
        </div>

        {/* Center HUD: Lighting Mood Selector & Tour Stepper */}
        <div className={styles.centerHudGroup}>
          <div className={styles.lightingMoodSelector} role="group" aria-label="Atmospheric Lighting">
            <button
              type="button"
              className={`${styles.moodBtn} ${lightingMood === 'daylight' ? styles.moodBtnActive : ''}`}
              onClick={() => setLightingMood('daylight')}
              title="Curatorial Daylight Museum Lighting"
            >
              <Sun size={11} />
              <span>Daylight</span>
            </button>
            <button
              type="button"
              className={`${styles.moodBtn} ${lightingMood === 'goldenHour' ? styles.moodBtnActive : ''}`}
              onClick={() => setLightingMood('goldenHour')}
              title="Atelier Golden Hour Sunbeams"
            >
              <Sunset size={11} />
              <span>Golden Hour</span>
            </button>
            <button
              type="button"
              className={`${styles.moodBtn} ${lightingMood === 'nocturne' ? styles.moodBtnActive : ''}`}
              onClick={() => setLightingMood('nocturne')}
              title="Nocturne Candlelit & Jewel Spotlight Mood"
            >
              <Moon size={11} />
              <span>Nocturne</span>
            </button>
          </div>

          <div className={styles.hudTourNav}>
            <button
              type="button"
              className={styles.hudTourBtn}
              onClick={handlePrev}
              aria-label="Previous Masterwork"
            >
              <ChevronLeft size={16} />
            </button>
            <span className={styles.hudTourCounter}>
              {currentIndex + 1} / {artworks.length}
            </span>
            <button
              type="button"
              className={styles.hudTourBtn}
              onClick={handleNext}
              aria-label="Next Masterwork"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* HUD Quick Actions */}
        <div className={styles.hudActions}>
          <button
            type="button"
            className={`${styles.hudBtn} ${isAudioActive ? styles.hudBtnActive : ''}`}
            onClick={toggleAmbientSound}
            aria-label="Toggle Museum Ambient Acoustics"
          >
            {isAudioActive ? (
              <>
                <Volume2 size={13} />
                <span className={styles.soundWaves}>
                  <span className={styles.soundBar} />
                  <span className={styles.soundBar} />
                  <span className={styles.soundBar} />
                </span>
                <span>Sanctuary Audio</span>
              </>
            ) : (
              <>
                <VolumeX size={13} />
                <span>Ambient Sound</span>
              </>
            )}
          </button>

          <button
            type="button"
            className={styles.hudBtn}
            onClick={() => setIsGuestbookOpen(true)}
            aria-label="Open Atelier Guestbook"
          >
            <BookOpen size={12} />
            <span>Guestbook</span>
          </button>

          <button
            type="button"
            className={styles.hudBtn}
            onClick={() => {
              targetCamPosRef.current.set(0, 2.0, hallLength / 2 - 4.5);
              targetLookAtRef.current.set(0, 2.0, 0);
              cameraYawRef.current = 0;
              cameraPitchRef.current = 0;
              yawVelocityRef.current = 0;
              pitchVelocityRef.current = 0;
              isGuidedTourRef.current = true;
              setIsInspectMode(false);
            }}
            aria-label="Reset Viewpoint to Grand Entrance"
          >
            <RotateCcw size={12} />
            <span>Grand Entrance</span>
          </button>

          <button
            type="button"
            className={styles.hudBtn}
            onClick={toggleFullscreen}
            aria-label="Toggle Fullscreen Exhibition"
          >
            <Maximize size={12} />
            <span>{isFullscreen ? 'Exit' : 'Fullscreen'}</span>
          </button>
        </div>
      </div>

      {/* Controls Hint Pill */}
      {!isInspectMode && (
        <div className={styles.instructionsPill}>
          <span>Drag to Orbit 360°</span>
          <span>•</span>
          <span>
            <span className={styles.keyTag}>W</span> <span className={styles.keyTag}>A</span>{' '}
            <span className={styles.keyTag}>S</span> <span className={styles.keyTag}>D</span> to Walk
          </span>
          <span>•</span>
          <span>Scroll to Zoom</span>
          <span>•</span>
          <span>Click Floor to Glide</span>
        </div>
      )}

      {/* 3D Inspect Mode Indicator Pill */}
      {isInspectMode && (
        <div className={styles.inspectModeOverlay}>
          <Search size={14} color="#f4d9a0" />
          <span className={styles.inspectModeText}>3D Archival Inspection · Drag to Examine Canvas</span>
          <button
            type="button"
            className={styles.inspectCloseBtn}
            onClick={toggleInspectMode}
            aria-label="Exit 3D Inspection"
          >
            <X size={12} />
          </button>
        </div>
      )}

      {/* Interactive Frame Switcher */}
      <div className={styles.frameSwitcherBar} role="group" aria-label="Bespoke Frame Style">
        <span className={styles.frameSwitcherLabel}>Frame Atelier:</span>
        <button
          type="button"
          className={`${styles.frameSwitchBtn} ${frameStyle === 'gilded' ? styles.frameSwitchBtnActive : ''}`}
          onClick={() => setFrameStyle('gilded')}
        >
          Gilded Gold
        </button>
        <button
          type="button"
          className={`${styles.frameSwitchBtn} ${frameStyle === 'walnut' ? styles.frameSwitchBtnActive : ''}`}
          onClick={() => setFrameStyle('walnut')}
        >
          Walnut
        </button>
        <button
          type="button"
          className={`${styles.frameSwitchBtn} ${frameStyle === 'oak' ? styles.frameSwitchBtnActive : ''}`}
          onClick={() => setFrameStyle('oak')}
        >
          Natural Oak
        </button>
        <button
          type="button"
          className={`${styles.frameSwitchBtn} ${frameStyle === 'obsidian' ? styles.frameSwitchBtnActive : ''}`}
          onClick={() => setFrameStyle('obsidian')}
        >
          Obsidian Float
        </button>
      </div>

      {/* Masterpiece Quick-Jump Rail */}
      {artworks.length > 1 && (
        <div className={styles.filmstripRail}>
          {artworks.map((art, idx) => (
            <button
              key={art.id}
              type="button"
              className={`${styles.filmstripNode} ${idx === currentIndex ? styles.filmstripNodeActive : ''}`}
              onClick={() => goToArtwork(idx)}
              aria-label={`Jump to ${art.title}`}
            >
              <span className={styles.nodeDot} />
              <span>{art.title.slice(0, 18)}</span>
            </button>
          ))}
        </div>
      )}

      {/* Bottom Archival Plaque */}
      {activeArtwork && (
        <div className={styles.bottomNav}>
          <div className={styles.activeArtworkPlaque}>
            <div className={styles.plaqueInfo}>
              <span className={styles.plaqueCat}>
                Masterwork {currentIndex + 1} of {artworks.length} · {activeArtwork.medium}
              </span>
              <h3 className={styles.plaqueTitle}>{activeArtwork.title}</h3>
              <span className={styles.plaqueMeta}>
                {activeArtwork.dimensionsHeight && activeArtwork.dimensionsWidth
                  ? `${activeArtwork.dimensionsHeight} × ${activeArtwork.dimensionsWidth} ${activeArtwork.dimensionUnit} • ${activeArtwork.yearCreated}`
                  : `Atelier Collection • ${activeArtwork.yearCreated}`}
              </span>
            </div>

            <div className={styles.plaqueActions}>
              <button
                type="button"
                className={styles.examineBtn}
                onClick={toggleInspectMode}
                aria-label="Inspect in 3D"
                title="3D Close-Up Inspection"
              >
                <Search size={12} />
                <span>{isInspectMode ? 'Normal View' : 'Inspect 3D'}</span>
              </button>

              <button
                type="button"
                className={styles.viewWallBtn}
                onClick={() => setIsViewOnWallOpen(true)}
                aria-label="View on Your Wall Simulator"
                title="Interior Wall Visualizer & AR"
              >
                <Smartphone size={12} />
                <span>View on Wall</span>
              </button>

              <button
                type="button"
                className={styles.examineBtn}
                onClick={() => {
                  if (onSelectArtwork) {
                    onSelectArtwork(activeArtwork);
                  } else {
                    navigate(`/gallery/${activeArtwork.slug}`);
                  }
                }}
                aria-label={`Examine ${activeArtwork.title} dossier`}
              >
                <Eye size={12} />
                <span>Dossier</span>
              </button>

              <button
                type="button"
                className={styles.inquireBtn}
                onClick={() =>
                  openInquiry({
                    artworkId: activeArtwork.id,
                    artworkTitle: activeArtwork.title,
                    catalogReference: activeArtwork.catalogReference || undefined,
                    inquiryType: 'ArtworkInquiry',
                  })
                }
                aria-label={`Inquire about ${activeArtwork.title}`}
              >
                <Sparkles size={12} />
                <span>Inquire ✧</span>
              </button>
            </div>
          </div>

          <div className={styles.navArrows}>
            <button
              type="button"
              className={styles.navArrowBtn}
              onClick={handlePrev}
              aria-label="Glide to Previous Masterpiece"
            >
              <ChevronLeft size={22} />
            </button>

            <button
              type="button"
              className={styles.navArrowBtn}
              onClick={handleNext}
              aria-label="Glide to Next Masterpiece"
            >
              <ChevronRight size={22} />
            </button>
          </div>
        </div>
      )}

      <div className={styles.floorHint}>
        <Footprints size={12} />
        <span>Click floor to walk</span>
      </div>

      {/* View on Wall & AR Visualizer Modal */}
      {activeArtwork && (
        <ViewOnWallModal
          artwork={activeArtwork}
          initialFrame={frameStyle}
          isOpen={isViewOnWallOpen}
          onClose={() => setIsViewOnWallOpen(false)}
        />
      )}

      {/* Atelier Archival Guestbook Modal */}
      <AtelierGuestbookModal
        isOpen={isGuestbookOpen}
        onClose={() => setIsGuestbookOpen(false)}
      />
    </div>
  );
};
