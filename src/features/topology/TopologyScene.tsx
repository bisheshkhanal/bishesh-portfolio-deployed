import { useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { ScrollControls } from '@react-three/drei';
import { BufferGeometry, BufferAttribute } from 'three';
import { TopologyOverlay } from './TopologyOverlay';
import { TopologyCameraRig } from './TopologyCameraRig';
import { TopologyEffects } from './TopologyEffects';
import { useTopologyMaterial } from './TopologyMaterial';
import { useTopologyScrollState } from './useTopologyScrollState';
import { generateParticleBuffers, PARTICLE_COUNTS } from './particleData';
import type { TopologyScrollState } from './topologyTypes';
import type { RefObject } from 'react';

interface ParticlesProps {
  scrollStateRef: RefObject<TopologyScrollState>;
  particleCount: number;
}

function TopologyParticles({ scrollStateRef, particleCount }: ParticlesProps) {
  const { material, uniforms } = useTopologyMaterial();

  // Build geometry once from deterministic buffers
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

  // Sync scroll state → shader uniforms each frame
  useFrame(() => {
    const state = scrollStateRef.current;
    if (!state) return;
    uniforms.uScroll.value = state.scroll;
    uniforms.uBeatWeights.value = state.beatWeights;
    uniforms.uNoiseAmplitude.value = state.noiseAmplitude;
    uniforms.uCameraProgress.value = state.cameraProgress;
  });

  return (
    <>
      <TopologyCameraRig scrollStateRef={scrollStateRef} />
      <points geometry={geometry} material={material} frustumCulled={false} />
    </>
  );
}

function TopologyContent({ particleCount }: { particleCount: number }) {
  const scrollStateRef = useTopologyScrollState();

  return (
    <>
      <TopologyParticles scrollStateRef={scrollStateRef} particleCount={particleCount} />
      <TopologyEffects scrollStateRef={scrollStateRef} />
      <TopologyOverlay />
    </>
  );
}

function TopologySceneInner({ particleCount }: { particleCount: number }) {
  return (
    <ScrollControls pages={4} damping={0.1}>
      <TopologyContent particleCount={particleCount} />
    </ScrollControls>
  );
}

export interface TopologySceneProps {
  particleCount?: number;
}

export function TopologyScene({ particleCount = PARTICLE_COUNTS.high }: TopologySceneProps) {
  return (
    <Canvas
      camera={{ position: [8, 5, 12], fov: 50 }}
      style={{ width: '100%', height: '100%' }}
      gl={{ antialias: false }}
    >
      <TopologySceneInner particleCount={particleCount} />
    </Canvas>
  );
}
