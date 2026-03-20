import { useScroll } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import { Vector4 } from 'three';
import type { TopologyScrollState } from './topologyTypes';

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

function easeInExpo(t: number): number {
  return t === 0 ? 0 : Math.pow(2, 10 * t - 10);
}

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

// Maps raw scroll offset (0-1) to beat weights and derived values
function computeScrollState(offset: number): TopologyScrollState {
  // Beat ranges: 0-0.25, 0.25-0.5, 0.5-0.75, 0.75-1.0
  const TRANSITION = 0.04; // overlap fraction for smooth blending

  // Local progress within each beat (0-1)
  const b1 = smoothstep(0.00, 0.25, offset);
  const b2 = smoothstep(0.25, 0.50, offset);
  const b3 = smoothstep(0.50, 0.75, offset);
  const b4 = smoothstep(0.75, 1.00, offset);

  // Beat weights: helix fades out as lattice fades in, etc.
  const helixW  = Math.max(0, 1 - smoothstep(0.25 - TRANSITION, 0.25 + TRANSITION, offset));
  const latticeW = Math.max(0, smoothstep(0.25 - TRANSITION, 0.25 + TRANSITION, offset)
                            - smoothstep(0.50 - TRANSITION, 0.50 + TRANSITION, offset));
  const chaosW  = Math.max(0, smoothstep(0.50 - TRANSITION, 0.50 + TRANSITION, offset)
                            - smoothstep(0.75 - TRANSITION, 0.75 + TRANSITION, offset));
  const planeW  = Math.max(0, smoothstep(0.75 - TRANSITION, 0.75 + TRANSITION, offset));

  // Normalize weights so they always sum to 1
  const total = helixW + latticeW + chaosW + planeW || 1;
  const beatWeights = new Vector4(helixW / total, latticeW / total, chaosW / total, planeW / total);

  // Noise amplitude: ramps 0 → 6 during beat 3, back to 0 at beat 4
  const noiseAmplitude = chaosW * 6.0;

  // Camera progress: 0-1 within current beat
  const cameraProgress = offset;

  // Post-processing intensities
  const bloomIntensity = 0.2 + helixW * 0.15 + latticeW * 0.1 + planeW * 0.05;
  const chromaticOffset = chaosW * 0.008;

  return {
    scroll: offset,
    beatWeights,
    cameraProgress,
    noiseAmplitude,
    bloomIntensity,
    chromaticOffset,
  };
}

export function useTopologyScrollState() {
  const scroll = useScroll();
  const stateRef = useRef<TopologyScrollState>({
    scroll: 0,
    beatWeights: new Vector4(1, 0, 0, 0),
    cameraProgress: 0,
    noiseAmplitude: 0,
    bloomIntensity: 1,
    chromaticOffset: 0,
  });

  useFrame(() => {
    stateRef.current = computeScrollState(scroll.offset);
  });

  return stateRef;
}
