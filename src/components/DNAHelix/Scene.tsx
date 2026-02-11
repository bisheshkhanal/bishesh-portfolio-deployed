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

const MOBILE_SCALE = {
  widthThresholdPx: 120,
  minWidthPx: 60,
  minScale: 0.5,
  maxScale: 1
} as const;

const DESKTOP_BASELINE = {
  fov: 50,
  z: 28
} as const;

const NARROW_RAIL = {
  widthThresholdPx: 120,
  minFov: 50,
  maxFov: 70,
  minZ: 28,
  maxZ: 45,
  helixHalfWidthWorld: 3,
  fitMarginWorld: 0.4,
  fovSafetyDeg: 2
} as const;

const getHelixScale = (canvasWidth: number): number => {
  if (canvasWidth >= MOBILE_SCALE.widthThresholdPx) {
    return MOBILE_SCALE.maxScale;
  }

  const narrowness = Math.max(
    0,
    Math.min(
      1,
      (MOBILE_SCALE.widthThresholdPx - canvasWidth) /
        (MOBILE_SCALE.widthThresholdPx - MOBILE_SCALE.minWidthPx)
    )
  );

  return THREE.MathUtils.lerp(MOBILE_SCALE.maxScale, MOBILE_SCALE.minScale, narrowness);
};

function CameraManager({ helixScale }: { helixScale: number }) {
  const { camera, size, viewport } = useThree();
  const lastUpdateRef = useRef<number>(0);
  const currentFovRef = useRef<number>(DESKTOP_BASELINE.fov);
  const currentZRef = useRef<number>(DESKTOP_BASELINE.z);
  const isNarrowRef = useRef<boolean>(false);

  useEffect(() => {
    const { width: canvasWidth } = size;
    const aspect = viewport.aspect || (canvasWidth / size.height) || 1;

    const isNarrow = canvasWidth < NARROW_RAIL.widthThresholdPx;
    isNarrowRef.current = isNarrow;

    let targetFov: number;
    let targetZ: number;

    if (isNarrow) {
      const narrowness = Math.max(
        0,
        Math.min(1, (NARROW_RAIL.widthThresholdPx - canvasWidth) / NARROW_RAIL.widthThresholdPx)
      );

      targetFov = THREE.MathUtils.lerp(NARROW_RAIL.minFov, 62, narrowness);
      targetZ = THREE.MathUtils.lerp(NARROW_RAIL.minZ, NARROW_RAIL.maxZ, narrowness);

      const fitHalfWidth =
        (NARROW_RAIL.helixHalfWidthWorld + NARROW_RAIL.fitMarginWorld) * helixScale;
      const safeAspect = Math.max(aspect, 0.01);
      const requiredFovAtTargetZ = THREE.MathUtils.radToDeg(
        2 * Math.atan(fitHalfWidth / (Math.max(targetZ, 0.01) * safeAspect))
      ) + NARROW_RAIL.fovSafetyDeg;

      targetFov = Math.max(targetFov, requiredFovAtTargetZ);

      if (targetFov > NARROW_RAIL.maxFov) {
        targetFov = NARROW_RAIL.maxFov;

        const requiredZAtMaxFov = fitHalfWidth / (
          Math.tan(THREE.MathUtils.degToRad(targetFov / 2)) * safeAspect
        );
        targetZ = Math.max(targetZ, requiredZAtMaxFov);
      }
    } else {
      targetFov = DESKTOP_BASELINE.fov;
      targetZ = DESKTOP_BASELINE.z;
    }

    targetFov = Math.max(NARROW_RAIL.minFov, Math.min(NARROW_RAIL.maxFov, targetFov));
    targetZ = Math.max(NARROW_RAIL.minZ, Math.min(120, targetZ));

    const fovChanged = Math.abs(targetFov - currentFovRef.current) > 0.1;
    const zChanged = Math.abs(targetZ - currentZRef.current) > 0.1;

    if (fovChanged || zChanged) {
      if (camera instanceof THREE.PerspectiveCamera) {
        camera.fov = targetFov;
        camera.position.z = targetZ;
        camera.updateProjectionMatrix();
      }
      currentFovRef.current = targetFov;
      currentZRef.current = targetZ;
      lastUpdateRef.current = performance.now();
    }

    if (typeof window !== 'undefined' && (window as any).__DNA_DEBUG__) {
      const debug = (window as any).__DNA_DEBUG__;
      debug.cameraFov = currentFovRef.current;
      debug.cameraZ = currentZRef.current;
      debug.canvasPx = Math.round(canvasWidth);
      debug.aspect = parseFloat(aspect.toFixed(3));
      debug.isNarrow = isNarrowRef.current;
      if (!debug.markers || !debug.markers.projects || !debug.markers.skills) {
        debug.markers = {
          hero: { x: 0, y: 0, visible: false },
          projects: { x: 0, y: 0, visible: false },
          skills: { x: 0, y: 0, visible: false }
        };
      }
    }
  }, [camera, helixScale, size, viewport]);

  return null;
}

function SceneContent({ scrollProgress, onNavigate, activeSection, isE2E, markerTs }: Omit<SceneProps, 'className' | 'style'>) {
  const { size } = useThree();
  const helixScale = getHelixScale(size.width);

  return (
    <>
      <CameraManager helixScale={helixScale} />

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
          scale={helixScale}
        />
      </Suspense>
    </>
  );
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
        <SceneContent
          scrollProgress={scrollProgress}
          onNavigate={onNavigate}
          activeSection={activeSection}
          isE2E={isE2E}
          markerTs={markerTs}
        />
      </Canvas>
    </div>
  );
}
