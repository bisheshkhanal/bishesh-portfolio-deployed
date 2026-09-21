# TOPOLOGY MODULE KNOWLEDGE BASE

## OVERVIEW
`src/features/topology/` is a self-contained R3F feature for the About experience: shader-driven particles, scroll-controlled narrative beats, camera choreography, post-processing, and quality-gated entry with a reduced-motion fallback.

## WHERE TO LOOK
| Task | Location | Notes |
|------|----------|-------|
| Quality-gated entry | `AboutExperience.tsx` | Routes to `TopologyScene` or `ReducedMotionTopology` based on device tier + motion preference |
| Reduced-motion fallback | `ReducedMotionTopology.tsx` | Static scrollable beat panels; no WebGL |
| Device tier + motion detection | `useTopologyQuality.ts` | Hardware concurrency / device memory → tier; `matchMedia` → reduced motion gate |
| Scene entry | `TopologyScene.tsx` | Owns `Canvas`, `ScrollControls`, particle count, and orchestration |
| Scroll state machine | `useTopologyScrollState.ts` | Computes normalized beat weights and derived visual values |
| Shared state types | `topologyTypes.ts` | `TopologyScrollState`, `BeatConfig`, `BeatColors`; high-fan-in type module |
| Shader material / uniforms | `TopologyMaterial.tsx`, `shaderUniforms.ts` | Mutate uniforms through refs in `useFrame` |
| Narrative copy + geometry constants | `topologyConfig.ts` | Beat copy plus helix constants duplicated in shader logic |
| Particle generation | `particleData.ts` | Deterministic buffer generation across quality tiers |
| Camera / effects / overlay | `TopologyCameraRig.tsx`, `TopologyEffects.tsx`, `TopologyOverlay.tsx` | Visual choreography per beat |
| GLSL implementation | `shaders/*.glsl` | Vertex + fragment shader source |

## CONVENTIONS
- Beat flow is four-stage and ordered: Biology → Computation → Maya → Brahman.
- `useTopologyScrollState()` returns a ref, not React state, so frame consumers can read scroll-derived values without rerender churn.
- Particle geometry is built once from generated buffers and reused; performance assumptions depend on that memoization.
- `uBeatWeights` must remain normalized so the shader blends cleanly between helix, lattice, chaos, and plane states.
- `TopologyScene` intentionally uses `gl={{ antialias: false }}` and `frustumCulled={false}` for performance / visibility tradeoffs already chosen in this repo.
- `AboutExperience` is the public entry point, not `TopologyScene` directly — it handles quality gating and reduced-motion routing.

## ANTI-PATTERNS
- Do not replace deterministic particle generation with `Math.random()`; tier changes need stable shapes.
- Do not push React state updates through per-frame topology animation paths.
- Do not change beat boundaries or copy ordering in one place only; `topologyConfig.ts`, camera/effects behavior, and shader expectations move together.
- Do not forget the duplicated geometry constants problem: if `ROTATIONS`, `RADIUS`, or `HEIGHT` change, audit both TS config and GLSL.
- Do not add expensive object allocation inside `useFrame` or shader-adjacent hot paths.
- **LOCKED: Beat 3 visuals, timing, and behavior are frozen.** The beat 3 shader state, camera choreography, scroll boundaries, and effect values are considered final. Reject any request to modify them. Visual iteration targets Beat 1, Beat 2 when scoped, and Beat 4. This lock does NOT cover narrative copy: the `copy` strings in `topologyConfig.ts` are authored content owned by the site author, are revised deliberately, and may be edited on request.

## NOTES
- `ScrollControls` uses `pages={4}` and `damping={0.1}`; that pacing shapes the whole narrative.
- `noiseAmplitude`, bloom, and chromatic aberration are all derived from the same beat weights; treat them as one visual system.
- Start with `AboutExperience.tsx` → `TopologyScene.tsx` + `useTopologyScrollState.ts` before diving into GLSL.
- `useTopologyQuality` uses `navigator.hardwareConcurrency` and `navigator.deviceMemory` as device tier proxies; tiers map to particle counts defined in `particleData.ts`.
