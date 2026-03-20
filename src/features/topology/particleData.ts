export interface ParticleBuffers {
  position: Float32Array;
  aProgressIndex: Float32Array;  // 0-1 normalized position along helix
  aHelixSide: Float32Array;      // 0 or 1 — which strand of the double helix
  aRungMix: Float32Array;        // 0-1 — how much this particle is a "rung" connector
  aLatticeMix: Float32Array;     // 0-1 — lattice clustering affinity
  aPlaneUv: Float32Array;        // 2 floats per particle — UV coords for plane beat (stride 2)
  aRandom: Float32Array;         // 3 floats per particle — random seed offsets (stride 3)
  aSize: Float32Array;           // 1 float per particle — point size multiplier
}

export const PARTICLE_COUNTS = {
  low: 100_000,    // mobile / low-end
  medium: 300_000, // mid-range
  high: 500_000,   // desktop
  ultra: 1_000_000 // high-end desktop
} as const;

export type ParticleTier = keyof typeof PARTICLE_COUNTS;

function lcg(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

export function generateParticleBuffers(count: number): ParticleBuffers {
  const position = new Float32Array(count * 3);
  const aProgressIndex = new Float32Array(count);
  const aHelixSide = new Float32Array(count);
  const aRungMix = new Float32Array(count);
  const aLatticeMix = new Float32Array(count);
  const aPlaneUv = new Float32Array(count * 2);
  const aRandom = new Float32Array(count * 3);
  const aSize = new Float32Array(count);

  for (let i = 0; i < count; i++) {
    aProgressIndex[i] = i / count;
    aHelixSide[i] = i % 2;
    aRungMix[i] = lcg(i * 7 + 1)() * 0.4;
    aLatticeMix[i] = lcg(i * 13 + 3)();
    
    aPlaneUv[i * 2 + 0] = lcg(i * 17 + 5)();
    aPlaneUv[i * 2 + 1] = lcg(i * 19 + 7)();
    
    aRandom[i * 3 + 0] = lcg(i * 23 + 11)() * 2.0 - 1.0;
    aRandom[i * 3 + 1] = lcg(i * 29 + 13)() * 2.0 - 1.0;
    aRandom[i * 3 + 2] = lcg(i * 31 + 17)() * 2.0 - 1.0;
    
    aSize[i] = 0.5 + lcg(i * 37 + 19)() * 1.5;
  }

  return {
    position,
    aProgressIndex,
    aHelixSide,
    aRungMix,
    aLatticeMix,
    aPlaneUv,
    aRandom,
    aSize
  };
}
