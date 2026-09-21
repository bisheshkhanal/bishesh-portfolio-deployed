import { useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { EffectComposer } from '@react-three/postprocessing';
import { BlendFunction, BloomEffect, ChromaticAberrationEffect } from 'postprocessing';
import { Vector2 } from 'three';
import type { RefObject } from 'react';
import type { TopologyScrollState } from './topologyTypes';

interface TopologyEffectsProps {
  scrollStateRef: RefObject<TopologyScrollState>;
}

export function TopologyEffects({ scrollStateRef }: TopologyEffectsProps) {
  const bloomEffect = useMemo(
    () =>
      new BloomEffect({
        intensity: 0.3,
        luminanceThreshold: 0.6,
        luminanceSmoothing: 0.9,
        blendFunction: BlendFunction.ADD,
      }),
    [],
  );

  const chromaticEffect = useMemo(
    () =>
      new ChromaticAberrationEffect({
        offset: new Vector2(0, 0),
        blendFunction: BlendFunction.NORMAL,
        radialModulation: false,
        modulationOffset: 0.15,
      }),
    [],
  );

  useEffect(() => {
    return () => {
      bloomEffect.dispose();
      chromaticEffect.dispose();
    };
  }, [bloomEffect, chromaticEffect]);

  useFrame(() => {
    const state = scrollStateRef.current;
    if (!state) return;

    bloomEffect.intensity = state.bloomIntensity;

    const offset = state.chromaticOffset;
    chromaticEffect.offset.set(offset, offset);
  });

  return (
    <EffectComposer>
      <primitive object={bloomEffect} />
      <primitive object={chromaticEffect} />
    </EffectComposer>
  );
}
