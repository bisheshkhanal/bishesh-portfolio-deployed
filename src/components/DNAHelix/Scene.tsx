import { Canvas, useThree } from '@react-three/fiber';
import { Helix } from './Helix';
import { DNAMarkerId } from '../../hooks/useDNAMarkerAnchors';
import { Suspense, CSSProperties, useCallback, useState, useEffect, useRef } from 'react';
import * as THREE from 'three';

interface SceneProps {
  scrollProgress: any;
  onNavigate?: (sectionId: string) => void;
  activeSection?: string;
  isE2E?: boolean;
  markerTs: Record<DNAMarkerId, number>;
  className?: string;
  style?: CSSProperties;
}

const DESKTOP_BASELINE = {
  fov: 50,
  z: 28
} as const;

const NARROW_RAIL = {
  widthThresholdPx: 120,
  minFov: 45,
  maxFov: 55,
  minZ: 28,
  maxZ: 28
} as const;

function CameraManager() {
  const { camera, size, viewport } = useThree();
  const lastUpdateRef = useRef<number>(0);
  const currentFovRef = useRef<number>(DESKTOP_BASELINE.fov);
  const isNarrowRef = useRef<boolean>(false);

  useEffect(() => {
    const { width: canvasWidth } = size;
    const aspect = viewport.aspect || (canvasWidth / size.height) || 1;

    const isNarrow = canvasWidth < NARROW_RAIL.widthThresholdPx;
    isNarrowRef.current = isNarrow;

    let targetFov: number;

    if (isNarrow) {
      const narrowness = Math.max(0, Math.min(1,
        (NARROW_RAIL.widthThresholdPx - canvasWidth) / NARROW_RAIL.widthThresholdPx
      ));
      targetFov = THREE.MathUtils.lerp(NARROW_RAIL.minFov, NARROW_RAIL.maxFov, narrowness);
    } else {
      targetFov = DESKTOP_BASELINE.fov;
    }

    targetFov = Math.max(NARROW_RAIL.minFov, Math.min(NARROW_RAIL.maxFov, targetFov));

    const fovChanged = Math.abs(targetFov - currentFovRef.current) > 0.1;

    if (fovChanged) {
      if (camera instanceof THREE.PerspectiveCamera) {
        camera.fov = targetFov;
        camera.updateProjectionMatrix();
      }
      currentFovRef.current = targetFov;
      lastUpdateRef.current = performance.now();
    }

    if (typeof window !== 'undefined' && (window as any).__DNA_DEBUG__) {
      const debug = (window as any).__DNA_DEBUG__;
      debug.cameraFov = currentFovRef.current;
      debug.cameraZ = DESKTOP_BASELINE.z;
      debug.canvasPx = Math.round(canvasWidth);
      debug.aspect = parseFloat(aspect.toFixed(3));
      debug.isNarrow = isNarrowRef.current;
    }
  }, [camera, size, viewport]);

  return null;
}

export function Scene({ scrollProgress, onNavigate, activeSection, isE2E, markerTs, className, style }: SceneProps) {
  const [eventSource, setEventSource] = useState<HTMLDivElement | null>(null);
  const setEventSourceRef = useCallback((node: HTMLDivElement | null) => {
    setEventSource(node);
  }, []);

  return (
    <div ref={setEventSourceRef} data-testid="dna-canvas" className={className} style={style}>
      <Canvas
        key={eventSource ? 'event-source-ready' : 'event-source-pending'}
        eventSource={eventSource ?? undefined}
        camera={{ position: [0, 0, DESKTOP_BASELINE.z], fov: DESKTOP_BASELINE.fov }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
        onPointerMissed={() => {
          if (typeof window !== 'undefined' && (window as any).__DNA_DEBUG__) {
            const debug = (window as any).__DNA_DEBUG__;
            debug.pointerMissedCount = (debug.pointerMissedCount ?? 0) + 1;
          }
        }}
      >
        <CameraManager />

        <ambientLight intensity={0.4} />
        <pointLight position={[5, 0, 10]} intensity={0.6} />
        <pointLight position={[-5, 0, 10]} intensity={0.4} />

        <Suspense fallback={null}>
          <Helix
            scrollProgress={scrollProgress}
            onNavigate={onNavigate}
            activeSection={activeSection}
            isE2E={isE2E}
            markerTs={markerTs}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
