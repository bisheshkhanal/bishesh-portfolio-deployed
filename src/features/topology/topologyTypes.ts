import { Vector4, Color } from 'three';

export interface BeatColors {
  base: Color;
  accent: Color;
  highlight?: Color;
}

export interface BeatConfig {
  scrollStart: number;
  scrollEnd: number;
  label: string;
  copy: string;
}

export interface TopologyScrollState {
  scroll: number;          // raw 0-1 scroll progress
  beatWeights: Vector4;    // [helix, lattice, chaos, plane] weights
  cameraProgress: number;  // 0-1 camera animation progress
  noiseAmplitude: number;  // chaos noise strength
  bloomIntensity: number;  // post-processing bloom
  chromaticOffset: number; // chromatic aberration strength
}
