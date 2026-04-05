import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { BufferGeometry, BufferAttribute, Vector4 } from 'three';
import { useTopologyMaterial } from './TopologyMaterial';
import { TopologyEffects } from './TopologyEffects';
import { generateParticleBuffers } from './particleData';
import type { TopologyScrollState } from './topologyTypes';

// Fixed beat-1 scroll state — pure helix, no scroll dependency
const BEAT1_STATE: TopologyScrollState = {
  scroll: 0,
  beatWeights: new Vector4(1, 0, 0, 0),
  cameraProgress: 0,
  noiseAmplitude: 0,
  bloomIntensity: 0.35, // 0.2 + 1*0.15 (helix weight at beat 1)
  chromaticOffset: 0,
};

function PreviewContent({ particleCount }: { particleCount: number }) {
  const { material, uniforms } = useTopologyMaterial();
  const scrollStateRef = useRef<TopologyScrollState>(BEAT1_STATE);

  const geometry = useMemo(() => {
    const buffers = generateParticleBuffers(particleCount);
    const geo = new BufferGeometry();
    geo.setAttribute('position',       new BufferAttribute(buffers.position, 3));
    geo.setAttribute('aProgressIndex', new BufferAttribute(buffers.aProgressIndex, 1));
    geo.setAttribute('aHelixSide',     new BufferAttribute(buffers.aHelixSide, 1));
    geo.setAttribute('aRungMix',       new BufferAttribute(buffers.aRungMix, 1));
    geo.setAttribute('aLatticeMix',    new BufferAttribute(buffers.aLatticeMix, 1));
    geo.setAttribute('aPlaneUv',       new BufferAttribute(buffers.aPlaneUv, 2));
    geo.setAttribute('aRandom',        new BufferAttribute(buffers.aRandom, 3));
    geo.setAttribute('aSize',          new BufferAttribute(buffers.aSize, 1));
    geo.setDrawRange(0, particleCount);
    return geo;
  }, [particleCount]);

  // Drive shader with fixed beat-1 values every frame
  useFrame(() => {
    uniforms.uScroll.value = 0;
    uniforms.uBeatWeights.value = BEAT1_STATE.beatWeights;
    uniforms.uNoiseAmplitude.value = 0;
    uniforms.uCameraProgress.value = 0;
  });

  return (
    <>
      <points geometry={geometry} material={material} frustumCulled={false} />
      <TopologyEffects scrollStateRef={scrollStateRef} />
    </>
  );
}

export interface TopologyPreviewProps {
  particleCount: number;
}

export function TopologyPreview({ particleCount }: TopologyPreviewProps) {
  return (
    <Canvas
      camera={{ position: [8, 5, 12], fov: 50 }}
      style={{ width: '100%', height: '100%' }}
      gl={{ antialias: false }}
    >
      <PreviewContent particleCount={particleCount} />
    </Canvas>
  );
}
