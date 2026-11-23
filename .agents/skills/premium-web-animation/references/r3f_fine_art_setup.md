# React Three Fiber (R3F) & Drei: Fine Art 3D Setup (Opt-In Modular Architecture)

This reference outlines the architecture for integrating React Three Fiber (`@react-three/fiber`) and Drei (`@react-three/drei`) as a progressive enhancement for fine art inspection (e.g., 3D framed canvas viewing, linen canvas texture shaders, studio lighting simulation, and "View in Room" perspective).

> [!IMPORTANT]
> **Zero Core Overhead:** R3F and Three.js are **not** bundled into the initial page load or standard gallery grids. They must always be lazy-loaded on demand via dynamic `React.lazy()` / `import()` only when a user explicitly chooses to enter an interactive 3D inspection modal.

---

## 1. When to Use R3F in an Atelier Experience

- **Interactive Canvas Depth & Relief:** Inspecting the bevel, floater frame profile, and edge-wrapped canvas depth of an original physical oil painting.
- **Dynamic Atelier Lighting Simulation:** Simulating warm directional gallery spotlights (3000K tungsten / warm halogen) across simulated impasto/varnish specular maps.
- **Wall Mounting Scale Preview ("View in Room"):** Rendering the artwork in realistic architectural scale against interior walls (neutral alabaster matboard, dark mocha exhibition wall).

---

## 2. Dependencies (When Opting In)

Install only when ready to enable 3D features:
```bash
npm install three @react-three/fiber @react-three/drei
npm install -D @types/three
```

---

## 3. Strict Fine Art Safeguards

1. **Aspect Ratio Preservation:**
   - 3D meshes must derive their geometry dimensions strictly from the artwork's native aspect ratio (`width / height`).
   - Never stretch UV mapping; enforce `THREE.SRGBColorSpace` for authentic color reproduction matching the artist's original palette.

2. **No Uncanny Distortions:**
   - Camera FOV must remain tight and realistic (e.g., FOV 35°–45°) to prevent wide-angle fisheye distortion of paintings.
   - Constrain orbit controls: limit azimuth and polar angles so the user cannot flip the artwork upside down or look behind empty meshes.

3. **Performance & Fallbacks:**
   - Always provide a standard WebGL fallback (high-resolution 2D archival zoom via standard CSS/Canvas) if WebGL context creation fails or device memory is constrained.
   - Set `dpr={[1, 1.5]}` on the R3F `<Canvas>` to avoid mobile GPU thermal throttling.

---

## 4. Reference Implementation Pattern

```tsx
// client/src/components/common/FramedCanvas3D.tsx (Lazy-Loaded)
import React, { Suspense, useRef } from 'react';
import { Canvas, useLoader } from '@react-three/fiber';
import { OrbitControls, Center, Environment } from '@react-three/drei';
import * as THREE from 'three';

interface FramedCanvasProps {
  imageUrl: string;
  aspectRatio: number; // width / height
  depthCm?: number;
}

function CanvasMesh({ imageUrl, aspectRatio }: FramedCanvasProps) {
  const texture = useLoader(THREE.TextureLoader, imageUrl);
  texture.colorSpace = THREE.SRGBColorSpace;

  // Base canvas dimensions: height = 1.0 unit, width = aspectRatio units, depth = 0.04 units (4cm wrap)
  const height = 1.0;
  const width = 1.0 * aspectRatio;
  const depth = 0.04;

  return (
    <Center>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial attach="material-4" map={texture} roughness={0.65} metalness={0.05} />
        {/* Frame sides (subtle warm mocha wood wrap) */}
        <meshStandardMaterial attach="material-0" color="#3B2D20" roughness={0.8} />
        <meshStandardMaterial attach="material-1" color="#3B2D20" roughness={0.8} />
        <meshStandardMaterial attach="material-2" color="#3B2D20" roughness={0.8} />
        <meshStandardMaterial attach="material-3" color="#3B2D20" roughness={0.8} />
        <meshStandardMaterial attach="material-5" color="#2A2421" roughness={0.9} />
      </mesh>
    </Center>
  );
}

export const FramedCanvasViewer: React.FC<FramedCanvasProps> = (props) => {
  return (
    <div style={{ width: '100%', height: '600px', backgroundColor: '#181716' }}>
      <Canvas camera={{ position: [0, 0, 2.2], fov: 38 }} dpr={[1, 1.5]}>
        <ambientLight intensity={0.8} />
        <directionalLight position={[2, 3, 2]} intensity={1.4} castShadow color="#FFF4E0" />
        <directionalLight position={[-2, 1, 1]} intensity={0.4} color="#E8DED1" />
        <Suspense fallback={null}>
          <CanvasMesh {...props} />
        </Suspense>
        <OrbitControls
          enablePan={false}
          minDistance={1.4}
          maxDistance={3.5}
          maxPolarAngle={Math.PI / 2 + 0.15}
          minPolarAngle={Math.PI / 2 - 0.15}
        />
      </Canvas>
    </div>
  );
};
```
