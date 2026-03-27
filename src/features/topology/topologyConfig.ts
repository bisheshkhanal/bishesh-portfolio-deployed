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
    copy: 'DNA is the language of the genome. But it doesn\'t create life from nothing. It encodes potential into structure — a double helix of instructions waiting to be read.',
  },
  {
    scrollStart: 0.25,
    scrollEnd: 0.50,
    label: 'Computation',
    copy: 'In agentic engineering, tokens are the DNA of language models. They don\'t create semantic meaning from nothing. They flow through dual processing lanes, passing through staged gates where raw potential transforms into structured output.',
  },
  {
    scrollStart: 0.50,
    scrollEnd: 0.75,
    label: 'Maya',
    copy: 'This is where the framework locks into place. Perspective and movement are the encoding mechanism that generates units of experience — what the Vedantic tradition calls Maya. The apparent multiplicity of life is an illusion created by this encoding: unity fractured into discrete units through the lens of perspective.',
  },
  {
    scrollStart: 0.75,
    scrollEnd: 1.00,
    label: 'Brahman',
    copy: 'Beneath appearance, beneath mechanism, beneath the encoding of units into multiplicity — there is a single, continuous truth, a potentiality. What Vedanta calls Brahman. I am grounded by the realization that I am, ultimately, the substrate beneath all four layers of this topology.',
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
