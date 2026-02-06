import { Canvas } from '@react-three/fiber';
import { Helix } from './Helix';
import { DNAMarkerId } from '../../hooks/useDNAMarkerAnchors';
import { Suspense, CSSProperties, useCallback, useState } from 'react';

interface SceneProps {
  scrollProgress: any;
  onNavigate?: (sectionId: string) => void;
  activeSection?: string;
  isE2E?: boolean;
  markerTs: Record<DNAMarkerId, number>;
  className?: string;
  style?: CSSProperties;
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
        camera={{ position: [0, 0, 28], fov: 50 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
        onPointerMissed={() => {
          if (typeof window !== 'undefined' && (window as any).__DNA_DEBUG__) {
            const debug = (window as any).__DNA_DEBUG__;
            debug.pointerMissedCount = (debug.pointerMissedCount ?? 0) + 1;
          }
        }}
      >
        {/* Lighting for StandardMaterial visibility */}
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
