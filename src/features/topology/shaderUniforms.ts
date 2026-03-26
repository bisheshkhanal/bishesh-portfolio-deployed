import { Vector4, Color } from 'three';

export function createTopologyUniforms() {
  return {
    uTime:            { value: 0.0 },
    uScroll:          { value: 0.0 },
    uBeatWeights:     { value: new Vector4(1, 0, 0, 0) },

    // Beat 1 — Bio
    // Lower intensity to survive additive blending without blowing out to white
    uColorBioStrand1: { value: new Color('#2C9999') }, // Teal
    uColorBioStrand2: { value: new Color('#CC9999') }, // Dusty Pink

    // Beat 2 — Lattice
    uColorLatticeSlate: { value: new Color('#000000') }, // Pure black base
    uColorLatticeCyan:  { value: new Color('#00ffff') }, // Bright cyan pulse
    uColorLatticeGreen: { value: new Color('#00ff00') }, // Bright green pulse

    // Beat 4 — Plane
    uColorPlaneObsidian:  { value: new Color('#000000') }, // Pure black
    uColorPlaneSilver:    { value: new Color('#8899aa') }, // Visible silver
    uColorPlaneMoonlight: { value: new Color('#334466') }, // Visible deep blue
    uColorPlaneGold:      { value: new Color('#443322') }, // Faint golden warmth

    // Scene
    uCameraProgress:  { value: 0.0 },
    uNoiseAmplitude:  { value: 0.0 },
    uPointScale:      { value: 1.0 },
  };
}

export type TopologyUniforms = ReturnType<typeof createTopologyUniforms>;
