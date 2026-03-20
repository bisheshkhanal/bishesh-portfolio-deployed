import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { EffectComposer, Bloom, ChromaticAberration } from '@react-three/postprocessing';
import { BlendFunction, BloomEffect, ChromaticAberrationEffect } from 'postprocessing';
import { Vector2 } from 'three';
import type { RefObject } from 'react';
import type { TopologyScrollState } from './topologyTypes';

interface TopologyEffectsProps {
  scrollStateRef: RefObject<TopologyScrollState>;
}

export function TopologyEffects({ scrollStateRef }: TopologyEffectsProps) {
  const bloomRef = useRef<BloomEffect>(null);
  const chromaticRef = useRef<ChromaticAberrationEffect>(null);

  useFrame(() => {
    const state = scrollStateRef.current;
    if (!state) return;

    if (bloomRef.current) {
      bloomRef.current.intensity = state.bloomIntensity;
    }

    if (chromaticRef.current) {
      const offset = state.chromaticOffset;
      chromaticRef.current.offset.set(offset, offset);
    }
  });

  return (
    <EffectComposer>
      <Bloom
        ref={bloomRef}
        intensity={0.3}
        luminanceThreshold={0.6}
        luminanceSmoothing={0.9}
        blendFunction={BlendFunction.ADD}
      />
      <ChromaticAberration
        ref={chromaticRef}
        offset={new Vector2(0, 0)}
        blendFunction={BlendFunction.NORMAL}
      />
    </EffectComposer>
  );
}
