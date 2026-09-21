import type { BeatConfig } from './topologyTypes';

export const BEAT_RANGES = {
  beat1: { start: 0.00, end: 0.25 },
  beat2: { start: 0.25, end: 0.50 },
  beat3: { start: 0.50, end: 0.75 },
  beat4: { start: 0.75, end: 1.00 },
} as const;

export const BEAT_CONFIGS: BeatConfig[] = [
  {
    scrollStart: 0.00,
    scrollEnd: 0.25,
    label: 'Biology',
    copy: 'DNA gets written as four letters. The molecule itself is one continuous run of chemistry, and the letters are notation we put on top of it. Read them three at a time and you get amino acids. The chain folds, and the fold is what does the work.',
  },
  {
    scrollStart: 0.25,
    scrollEnd: 0.50,
    label: 'Computation',
    copy: 'A language model works the same way. Tokens are notation too, a grid laid over text so a machine can index it. Inside, everything is vectors, and the meaning sits in how those vectors fall relative to each other.',
  },
  {
    scrollStart: 0.50,
    scrollEnd: 0.75,
    label: 'Maya',
    copy: 'Vedanta has a name for this. Maya. Perspective is what cuts a continuous thing into separate pieces. The apparent multiplicity of life is an illusion created by this encoding.',
  },
  {
    scrollStart: 0.75,
    scrollEnd: 1.00,
    label: 'Brahman',
    copy: 'Under all of it there is one continuous thing. Vedanta calls it Brahman. I find that steadying. Whatever layer I\'m looking at, I\'m the substrate it runs on.',
  },
];

// Helix geometry constants
// These values MUST match the hardcoded constants in topology.vert.glsl lines ~105-107
export const HELIX_CONFIG = {
  ROTATIONS: 3.5,
  RADIUS: 5.0,
  HEIGHT: 45.0,
} as const;

// Torus geometry constants for Beat 4 (Brahman)
export const TORUS_CONFIG = {
  MAJOR_RADIUS: 12.0,  // R - distance from center of tube to center of torus
  MINOR_RADIUS: 4.0,   // r - radius of the tube
} as const;
