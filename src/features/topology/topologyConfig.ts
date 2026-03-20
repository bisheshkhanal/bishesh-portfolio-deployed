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
    copy: 'In agentic engineering, tokens are the DNA of language models. They don\'t create semantic meaning from nothing. They encode potential into discrete, computational units — a lattice of vectors waiting to be transformed.',
  },
  {
    scrollStart: 0.50,
    scrollEnd: 0.75,
    label: 'Maya',
    copy: 'Beyond code and biology, this is how I view existence. The multiplicity of life — the chaos, the separate objects, the distinct events — is an encoding. An illusion. What the Vedantic tradition calls Maya.',
  },
  {
    scrollStart: 0.75,
    scrollEnd: 1.00,
    label: 'Brahman',
    copy: 'Underneath the DNA, underneath the tokens, underneath the movement of life, is a single, continuous potentiality. What Vedanta calls Brahman. I am grounded by the realization that I am, ultimately, the underlying canvas.',
  },
];

// Helix geometry constants
export const HELIX_CONFIG = {
  ROTATIONS: 8,
  RADIUS: 3.0,
  HEIGHT: 20.0,
} as const;
