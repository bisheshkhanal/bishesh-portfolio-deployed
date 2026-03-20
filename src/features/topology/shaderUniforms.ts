import { Vector4, Color } from 'three';

export function createTopologyUniforms() {
  return {
    uTime:            { value: 0.0 },
    uScroll:          { value: 0.0 },
    uBeatWeights:     { value: new Vector4(1, 0, 0, 0) },

    // Beat 1 — Bio
    // Lower intensity to survive additive blending without blowing out to white
    uColorBioStrand1: { value: new Color('#0044ff') }, // Deep Blue/Cyan
    uColorBioStrand2: { value: new Color('#ff1100') }, // Deep Red/Orange
    uColorBioRung:    { value: new Color('#ffffff') }, // Pure White for contrast

    // Beat 2 — Lattice
    uColorLatticeSlate: { value: new Color('#000000') }, // Pure black base
    uColorLatticeCyan:  { value: new Color('#00ffff') }, // Bright cyan pulse
    uColorLatticeGreen: { value: new Color('#00ff00') }, // Bright green pulse

    // Beat 4 — Plane
    uColorPlaneObsidian:  { value: new Color('#000000') }, // Pure black
    uColorPlaneSilver:    { value: new Color('#223344') }, // Very dim silver
    uColorPlaneMoonlight: { value: new Color('#112233') }, // Very dim moonlight

    // Scene
    uCameraProgress:  { value: 0.0 },
    uNoiseAmplitude:  { value: 0.0 },
    uPointScale:      { value: 1.0 },
  };
}

export type TopologyUniforms = ReturnType<typeof createTopologyUniforms>;
