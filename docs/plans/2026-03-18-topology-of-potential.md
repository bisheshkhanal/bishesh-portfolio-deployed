# The Topology of Potential Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use `superpowers/executing-plans` to implement this plan task-by-task.

**Goal:** Build a full-screen, scroll-driven About experience where one massive particle field tells a four-beat story by changing shader rules, camera choreography, post-processing, and text overlays as scroll progresses.

**Architecture:** Use a dedicated immersive route layout that bypasses `MainLayout` so the About page owns the full viewport and does not inherit the DNA rail or `BackgroundEffects`. Use `@react-three/drei` `ScrollControls` + `useScroll` as the single source of truth for scroll progress, with one custom particle system rendered as `THREE.Points` + `ShaderMaterial` driven by deterministic attribute buffers and uniforms. Start with shader-driven procedural morphing rather than FBO simulation; the design beats are deterministic and scroll-bound, so this is lower-risk and still supports 500K-1M desktop particles.

**Tech Stack:** React 19, Vite 7, TypeScript, React Router 7, `@react-three/fiber` 9.5, `@react-three/drei` 10.7, `three` 0.182, Framer Motion 6 only for non-scroll microcopy if needed, `@react-three/postprocessing` for Bloom and Chromatic Aberration, Playwright + Vitest.

---

## Core Decisions
- `Layout`: use a separate immersive route layout in `src/app/App.tsx`; do not try to hide `MainLayout` from inside `AboutRoute`.
- `Scroll`: use `ScrollControls` / `useScroll`; avoid Framer Motion `useScroll` to prevent dual scroll sources.
- `Particle Engine`: use precomputed `Float32Array` attributes + one custom `ShaderMaterial`; no FBO in v1.
- `Postprocessing`: add `@react-three/postprocessing`; beat-driven Bloom and Chromatic Aberration.
- `Text Overlay`: use `<Scroll html>` for DOM copy tied to the same scroll container.
- `Performance`: fixed particle counts by device tier, adaptive DPR/effect quality, reduced-motion static mode.
- `Testing`: TDD for routing, scene state mapping, particle buffer generation, reduced-motion behavior, and E2E beat transitions.

## Visual Constants
- Beat 1 colors: deep bio blue `#06141f`, cyan glow `#00d9ff`, cool fill `#7cecff`
- Beat 2 colors: black `#050505`, white `#f5f5f5`, amber flash `#ff9500`
- Beat 3 colors: fractured spectrum using cyan `#00d9ff`, amber `#ff9500`, green `#00ff88`, white `#ffffff`
- Beat 4 colors: obsidian `#080808`, warm sweep `#d6b36a`, dim gold `#8f7440`
- Scroll beat ranges:
  - Beat 1: `0.00-0.25`
  - Beat 2: `0.25-0.50`
  - Beat 3: `0.50-0.75`
  - Beat 4: `0.75-1.00`

---

## Dependency Graph & Parallel Execution Waves

```
Wave 1 (no dependencies — launch simultaneously):
  ├── Task 1: ImmersiveLayout route split
  ├── Task 3: Install @react-three/postprocessing & vite-plugin-glsl
  └── Task 4: Particle data generator

Wave 2 (depends on Wave 1):
  ├── Task 2: Scaffold module structure (needs Task 1)
  └── Task 5: Shader material shell (needs Task 4, Task 3)

Wave 3 (depends on Wave 2):
  ├── Task 6: Beat 1+2 shader math (needs Task 5)
  ├── Task 7: Beat 3+4 shader math (needs Task 5)
  └── Task 10: Overlay typography (needs Task 2)

Wave 4 (depends on Wave 3):
  ├── Task 8: Scroll bridge + camera rig (needs Tasks 6, 7)
  └── Task 9: Post-processing (needs Tasks 6, 7, Task 3)

Wave 5 (depends on Wave 4):
  └── Task 11: Adaptive quality + reduced motion (needs Tasks 8, 9)

Wave 6 (depends on Wave 5):
  └── Task 12: E2E verification (needs everything)
```

---

### Task 1: Create immersive route layout split

**Delegation:** category="visual-engineering", load_skills=["frontend-patterns", "interactive-portfolio"]

**Files:**
- Modify: `src/app/App.tsx`
- Create: `src/layouts/ImmersiveLayout.tsx`

**Step 1: Write the failing test**
(Assume standard Vitest setup, but for brevity, we focus on the implementation steps below. The executing agent should write tests first if configured for strict TDD).

**Step 2: Implement ImmersiveLayout**
Create `src/layouts/ImmersiveLayout.tsx` that renders a full-screen container without the DNA rail or background effects.

**Step 3: Update App.tsx**
Modify `src/app/App.tsx` to use `ImmersiveLayout` for the `/about` route, keeping `ShellLayout` for the rest.

**Step 4: Commit**
`git add src/app/App.tsx src/layouts/ImmersiveLayout.tsx`
`git commit -m "feat: split immersive about route from shell layout"`

**QA:**
1. Run `npm run dev`
2. Navigate to `/about` — should render without DNA sidebar or BackgroundEffects
3. Navigate to `/` — should still have DNA sidebar and BackgroundEffects
4. Run `npm run build` — exit code 0

---

### Task 2: Scaffold About experience module structure

**Delegation:** category="visual-engineering", load_skills=["frontend-dev-guidelines", "scroll-experience"]

**Files:**
- Modify: `src/routes/AboutRoute.tsx`
- Create: `src/features/topology/AboutExperience.tsx`
- Create: `src/features/topology/TopologyScene.tsx`
- Create: `src/features/topology/TopologyOverlay.tsx`
- Create: `src/features/topology/topologyConfig.ts`
- Create: `src/features/topology/topologyTypes.ts`

**Step 1: Define config and types**
Create `topologyConfig.ts` with beat ranges and colors. Create `topologyTypes.ts` for shared interfaces.

**Step 2: Scaffold components**
Create `TopologyOverlay.tsx` (placeholder text), `TopologyScene.tsx` (placeholder Canvas), and `AboutExperience.tsx` (wraps Scene and Overlay in `ScrollControls`).

**Step 3: Update AboutRoute**
Modify `src/routes/AboutRoute.tsx` to render `<AboutExperience />`.

**Step 4: Commit**
`git add src/routes/AboutRoute.tsx src/features/topology/`
`git commit -m "feat: scaffold topology about experience module"`

**QA:**
1. Run `npm run dev`
2. Navigate to `/about` — should render the placeholder Canvas and Overlay
3. Scroll down — the page should scroll within the `ScrollControls` container
4. Run `npm run build` — exit code 0

---

### Task 3: Install postprocessing & vite-plugin-glsl

**Delegation:** category="visual-engineering", load_skills=["3d-web-experience"]

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`
- Modify: `vite.config.ts` (or `.js`)

**Step 1: Install dependencies**
Run `npm install @react-three/postprocessing vite-plugin-glsl`

**Step 2: Configure Vite**
Modify `vite.config.ts` to include the GLSL plugin:
```javascript
import glsl from 'vite-plugin-glsl';

export default defineConfig({
  plugins: [react(), glsl()],
});
```

**Step 3: Verify build**
Run `npm run build` to ensure no peer dependency issues with React 19 / Three 0.182.

**Step 4: Commit**
`git add package.json package-lock.json vite.config.ts`
`git commit -m "build: add postprocessing and glsl support for topology scene"`

**QA:**
1. Run `npm run dev` — server should start without errors
2. Run `npm run build` — exit code 0

---

### Task 4: Build deterministic particle data generator

**Delegation:** category="visual-engineering", load_skills=["3d-web-experience"]

**Files:**
- Create: `src/features/topology/particleData.ts`

**Step 1: Implement generator**
Create a function that generates `Float32Array` buffers for `aProgressIndex`, `aHelixSide`, `aRungMix`, `aLatticeMix`, `aPlaneUv`, `aRandom`, and `aSize` based on a target particle count.

**Step 2: Commit**
`git add src/features/topology/particleData.ts`
`git commit -m "feat: add deterministic particle buffer generator"`

**QA:**
1. Write a unit test to verify the generator returns the correct buffer lengths for 1M particles
2. Run `npm run test` — tests should pass
3. Run `npm run build` — exit code 0

---

### Task 5: Implement shader material shell and uniform contract

**Delegation:** category="visual-engineering", load_skills=["3d-web-experience", "threejs-skills"]

**Files:**
- Create: `src/features/topology/shaders/topology.vert.glsl`
- Create: `src/features/topology/shaders/topology.frag.glsl`
- Create: `src/features/topology/TopologyMaterial.tsx`
- Create: `src/features/topology/shaderUniforms.ts`

**Step 1: Define uniforms**
Create `shaderUniforms.ts` with the exact uniform contract:
```typescript
import { Vector4, Color } from 'three';

export const topologyUniforms = {
  uTime: { value: 0.0 },           // float — clock.elapsedTime
  uScroll: { value: 0.0 },         // float — 0.0 to 1.0 scroll progress
  uBeatWeights: { value: new Vector4(1, 0, 0, 0) }, // vec4 — [helix, lattice, chaos, plane] weights
  
  // Beat 1 colors
  uColorBioBase: { value: new Color('#06141f') },
  uColorBioCyan: { value: new Color('#00d9ff') },
  
  // Beat 2 colors  
  uColorLatticeBlack: { value: new Color('#050505') },
  uColorLatticeWhite: { value: new Color('#f5f5f5') },
  uColorLatticeAmber: { value: new Color('#ff9500') },
  
  // Beat 3 — uses chromatic aberration, no special color uniform needed
  
  // Beat 4 colors
  uColorPlaneObsidian: { value: new Color('#080808') },
  uColorPlaneGold: { value: new Color('#d6b36a') },
  
  // Camera/scene
  uCameraProgress: { value: 0.0 },  // float — camera animation progress
  uNoiseAmplitude: { value: 0.0 },  // float — chaos noise strength
  uPointScale: { value: 1.0 },      // float — adaptive point size multiplier
};
```

**Step 2: Create shader files**
Create basic vertex and fragment shaders. The fragment shader must include the beat-driven color interpolation:
```glsl
// topology.frag.glsl
uniform vec4 uBeatWeights;
uniform vec3 uColorBioBase, uColorBioCyan;
uniform vec3 uColorLatticeBlack, uColorLatticeWhite, uColorLatticeAmber;
uniform vec3 uColorPlaneObsidian, uColorPlaneGold;
uniform float uTime;

varying float vDepth; // from vertex shader — normalized Z depth
varying float vProgressIndex;

void main() {
  // Beat 1: Bio — cyan glow with depth-based luminance
  vec3 bioColor = mix(uColorBioBase, uColorBioCyan, vDepth * 0.8 + 0.2);
  
  // Beat 2: Lattice — monochrome with amber data pulses
  float pulse = step(0.95, fract(vProgressIndex * 20.0 + uTime * 2.0));
  vec3 latticeColor = mix(uColorLatticeBlack, uColorLatticeWhite, vDepth);
  latticeColor = mix(latticeColor, uColorLatticeAmber, pulse * 0.8);
  
  // Beat 3: Chaos — white/prismatic (chromatic aberration handles the rest)
  vec3 chaosColor = vec3(1.0);
  
  // Beat 4: Plane — obsidian with golden sweep
  float sweep = smoothstep(-0.5, 0.5, sin(vProgressIndex * 6.28 + uTime * 0.4));
  vec3 planeColor = mix(uColorPlaneObsidian, uColorPlaneGold, sweep * 0.3);
  
  vec3 finalColor = bioColor * uBeatWeights.x 
                  + latticeColor * uBeatWeights.y 
                  + chaosColor * uBeatWeights.z 
                  + planeColor * uBeatWeights.w;
  
  float alpha = 0.6 + vDepth * 0.4; // depth-based transparency
  gl_FragColor = vec4(finalColor, alpha);
}
```

**Step 3: Create React wrapper**
Create `TopologyMaterial.tsx` that uses `shaderMaterial` from drei or a custom `useMemo` material.

**Step 4: Commit**
`git add src/features/topology/shaders/ src/features/topology/TopologyMaterial.tsx src/features/topology/shaderUniforms.ts`
`git commit -m "feat: add topology shader material and uniform contract"`

**QA:**
1. Run `npm run dev`, navigate to `/about`
2. Canvas should render with visible points (even if positions are default)
3. Open browser console — no WebGL shader compilation errors
4. Run `npm run build` — exit code 0

---

### Task 6: Implement Beat 1 + Beat 2 position math

**Delegation:** category="visual-engineering", load_skills=["scroll-experience", "3d-web-experience"]

**Files:**
- Modify: `src/features/topology/shaders/topology.vert.glsl`
- Modify: `src/features/topology/topologyConfig.ts`

**Step 1: Update vertex shader**
Add GLSL logic to compute the biological helix position and the quantized lattice position, blending between them based on beat weights.

**Beat 1 — Helix (scroll 0.0–0.25):**
```glsl
// Each particle has aProgressIndex (0-1 along helix length) and aHelixSide (0 or 1)
float angle = aProgressIndex * ROTATIONS * 2.0 * PI;
float phaseOffset = aHelixSide * PI; // strand 2 is 180° offset
float helixX = cos(angle + phaseOffset) * RADIUS;
float helixZ = sin(angle + phaseOffset) * RADIUS;
float helixY = (aProgressIndex - 0.5) * HEIGHT;

// Rungs: particles with high aRungMix interpolate toward midpoint between strands
vec3 helixPos = vec3(helixX, helixY, helixZ);
vec3 rungMidpoint = vec3(0.0, helixY, 0.0); // center of helix at this Y
helixPos = mix(helixPos, rungMidpoint, aRungMix * 0.8);
```

**Beat 2 — Lattice (scroll 0.25–0.50):**
```glsl
// Quantize positions to grid — snap to discrete lattice nodes
float gridSize = 2.0;
vec3 latticePos;
latticePos.x = floor(helixPos.x / gridSize + 0.5) * gridSize;
latticePos.y = floor(helixPos.y / gridSize + 0.5) * gridSize;  
latticePos.z = floor(helixPos.z / gridSize + 0.5) * gridSize;

// aLatticeMix controls how much each particle "wants" to be in the lattice
// Some particles form clusters, others form connecting pathways
latticePos = mix(latticePos, latticePos + vec3(aLatticeMix * 0.5, 0.0, 0.0), step(0.7, aLatticeMix));
```

**Blending between beats:**
```glsl
// uBeatWeights.x = helix weight, uBeatWeights.y = lattice weight
vec3 pos = helixPos * uBeatWeights.x + latticePos * uBeatWeights.y;
// (chaos and plane terms added in Task 7)
```

**Step 2: Commit**
`git add src/features/topology/shaders/topology.vert.glsl src/features/topology/topologyConfig.ts`
`git commit -m "feat: encode biological and computational particle states"`

**QA:**
1. Run `npm run dev`, navigate to `/about`
2. At scroll 0% — particles should form a recognizable double helix shape
3. Scroll to 25-50% — helix should morph into grid/lattice structure
4. No console errors, 60fps on desktop

---

### Task 7: Implement Beat 3 + Beat 4 position math

**Delegation:** category="visual-engineering", load_skills=["scroll-experience", "3d-web-experience"]

**Files:**
- Modify: `src/features/topology/shaders/topology.vert.glsl`
- Modify: `src/features/topology/topologyConfig.ts`
- Create: `src/features/topology/noise.glsl.ts` (or embed in vert)

**Step 1: Add noise and plane math**
Update the vertex shader to inject simplex noise for Beat 3 and flatten to a plane for Beat 4.
Embed Ashima's `webgl-noise` (MIT licensed) 4D simplex noise function directly in the vertex shader or as a GLSL include. Source URL: https://github.com/ashima/webgl-noise

**Beat 3 — Chaos / Maya (scroll 0.50–0.75):**
```glsl
// Inject 4D simplex noise — use aRandom as seed offset per particle
// Need simplex noise function (embed Ashima's webgl-noise or similar)
float noiseScale = 0.3;
float noiseSpeed = uTime * 0.5;
vec3 noiseInput = helixPos * noiseScale + vec3(aRandom.x, aRandom.y, noiseSpeed);
float nx = snoise(vec4(noiseInput, 0.0));
float ny = snoise(vec4(noiseInput + 31.416, 0.0));
float nz = snoise(vec4(noiseInput + 62.832, 0.0));

vec3 chaosPos = helixPos + vec3(nx, ny, nz) * uNoiseAmplitude;
// uNoiseAmplitude ramps from 0 → 15.0 during Beat 3
```

**Beat 4 — Plane / Brahman (scroll 0.75–1.0):**
```glsl
// Flatten everything to Y=0 plane with gentle undulation
float planeY = sin(aPlaneUv.x * 3.0 + uTime * 0.3) * 0.15 
             + sin(aPlaneUv.y * 2.0 + uTime * 0.2) * 0.1;
vec3 planePos = vec3(
  (aPlaneUv.x - 0.5) * 40.0,  // spread across wide plane
  planeY,                        // gentle wave
  (aPlaneUv.y - 0.5) * 40.0
);
```

**Full position blend:**
```glsl
vec3 finalPos = helixPos * uBeatWeights.x 
              + latticePos * uBeatWeights.y 
              + chaosPos * uBeatWeights.z 
              + planePos * uBeatWeights.w;
```

**Step 2: Commit**
`git add src/features/topology/shaders/topology.vert.glsl src/features/topology/topologyConfig.ts src/features/topology/noise.glsl.ts`
`git commit -m "feat: encode chaos fracture and grounding plane states"`

**QA:**
1. Run `npm run dev`, navigate to `/about`
2. Scroll to 50-75% — particles should fracture into a chaotic noise field
3. Scroll to 75-100% — particles should flatten into a continuous undulating plane
4. No console errors, 60fps on desktop

---

### Task 8: Build scroll state bridge and camera choreography

**Delegation:** category="visual-engineering", load_skills=["scroll-experience"]

**Files:**
- Create: `src/features/topology/useTopologyScrollState.ts`
- Create: `src/features/topology/TopologyCameraRig.tsx`
- Modify: `src/features/topology/TopologyScene.tsx`

**Step 1: Implement scroll hook**
Create `useTopologyScrollState.ts` to map `useScroll().offset` to beat weights and camera targets.

**Step 2: Implement camera rig**
Create `TopologyCameraRig.tsx` to animate the camera in `useFrame` based on the scroll state.

| Beat | Camera Position | Look-At Target | FOV | Easing |
|------|----------------|----------------|-----|--------|
| 1 (Helix) | `(8, 5, 12)` → slowly pan to `(8, -5, 12)` | `(0, 0, 0)` | 50° | `smoothstep` |
| 2 (Lattice) | Snap to `(15, 0, 15)` — isometric angle | `(0, 0, 0)` | 45° | `step` then hold |
| 3 (Chaos) | `(0, 0, 20)` → PLUNGE to `(0, 0, 2)` | `(0, 0, -10)` — looking forward into swarm | 65° → 90° (widening) | `easeInExpo` (violent acceleration) |
| 4 (Plane) | Decelerate to `(0, 0.5, 0)` — inches above surface | `(0, 0, -50)` — distant horizon | 50° | `easeOutCubic` (gentle stop) |

**Step 3: Update scene**
Wire the scroll state into `TopologyScene.tsx` and pass uniforms to the material.

**Step 4: Commit**
`git add src/features/topology/useTopologyScrollState.ts src/features/topology/TopologyCameraRig.tsx src/features/topology/TopologyScene.tsx`
`git commit -m "feat: drive topology camera and uniforms from scroll"`

**QA:**
1. Run `npm run dev`, navigate to `/about`
2. Scroll down — camera should follow the exact choreography defined above
3. Transitions between beats should feel smooth and cinematic
4. Run `npm run build` — exit code 0

---

### Task 9: Add post-processing beat orchestration

**Delegation:** category="visual-engineering", load_skills=["3d-web-experience"]

**Files:**
- Create: `src/features/topology/TopologyEffects.tsx`
- Modify: `src/features/topology/TopologyScene.tsx`

**Step 1: Implement effects**
Create `TopologyEffects.tsx` using `EffectComposer`, `Bloom`, and `ChromaticAberration`. Drive their intensities from the scroll state.

**Step 2: Update scene**
Add `<TopologyEffects />` to `TopologyScene.tsx`.

**Step 3: Commit**
`git add src/features/topology/TopologyEffects.tsx src/features/topology/TopologyScene.tsx`
`git commit -m "feat: add beat-driven bloom and chromatic effects"`

**QA:**
1. Run `npm run dev`, navigate to `/about`
2. Beat 1 should have a soft bloom
3. Beat 3 should have a strong chromatic aberration spike
4. Beat 4 should be clean with minimal effects
5. Run `npm run build` — exit code 0

---

### Task 10: Build overlay typography and narrative timing

**Delegation:** category="visual-engineering", load_skills=["interactive-portfolio", "scroll-experience"]

**Files:**
- Modify: `src/features/topology/TopologyOverlay.tsx`
- Modify: `src/features/topology/topologyConfig.ts`

**Step 1: Implement text panels**
Update `TopologyOverlay.tsx` to render the four text beats using `<Scroll html>`, styling them to match the site's design system.
Use large serif or editorial heading for the first line of each beat, body text in the site's system font stack, white text with opacity transitions synced to scroll progress.

**Beat 1:**
> DNA is the language of the genome. But it doesn't create life from nothing. It encodes potential into structure — a double helix of instructions waiting to be read.

**Beat 2:**
> In agentic engineering, tokens are the DNA of language models. They don't create semantic meaning from nothing. They encode potential into discrete, computational units — a lattice of vectors waiting to be transformed.

**Beat 3:**
> Beyond code and biology, this is how I view existence. The multiplicity of life — the chaos, the separate objects, the distinct events — is an encoding. An illusion. What the Vedantic tradition calls Maya.

**Beat 4:**
> Underneath the DNA, underneath the tokens, underneath the movement of life, is a single, continuous potentiality. What Vedanta calls Brahman. I am grounded by the realization that I am, ultimately, the underlying canvas.

**Step 2: Commit**
`git add src/features/topology/TopologyOverlay.tsx src/features/topology/topologyConfig.ts`
`git commit -m "feat: add topology narrative overlay"`

**QA:**
1. Run `npm run dev`, navigate to `/about`
2. Scroll down — text panels should fade in and out, perfectly synced with the 3D scene beats
3. Text should be legible and styled correctly
4. Run `npm run build` — exit code 0

---

### Task 11: Implement adaptive quality and reduced-motion fallback

**Delegation:** category="visual-engineering", load_skills=["3d-web-experience"]

**Files:**
- Create: `src/features/topology/useTopologyQuality.ts`
- Create: `src/features/topology/ReducedMotionTopology.tsx`
- Modify: `src/features/topology/AboutExperience.tsx`
- Modify: `src/features/topology/TopologyScene.tsx`

**Step 1: Implement quality hook**
Create `useTopologyQuality.ts` using `PerformanceMonitor` and `usePrefersReducedMotion` to determine particle count and effect quality.

**Step 2: Implement fallback**
Create `ReducedMotionTopology.tsx` for a static/safe experience.

**Step 3: Update experience**
Wire the quality settings into `AboutExperience.tsx` and `TopologyScene.tsx`.

**Step 4: Commit**
`git add src/features/topology/useTopologyQuality.ts src/features/topology/ReducedMotionTopology.tsx src/features/topology/AboutExperience.tsx src/features/topology/TopologyScene.tsx`
`git commit -m "perf: add adaptive quality and reduced-motion topology fallback"`

**QA:**
1. Run `npm run dev`, navigate to `/about`
2. Enable "reduced motion" in OS settings — scene should switch to the static fallback
3. Disable "reduced motion" — scene should return to the animated experience
4. Run `npm run build` — exit code 0

---

### Task 12: Add E2E verification for route, scroll beats, and fallback behavior

**Delegation:** category="visual-engineering", load_skills=["verification-before-completion"]

**Files:**
- Create: `e2e/about-topology.spec.ts`

**Step 1: Write E2E tests**
Create Playwright tests to verify the `/about` route loads, the overlay text is visible, and reduced motion is respected.

**Step 2: Commit**
`git add e2e/about-topology.spec.ts`
`git commit -m "test: cover topology about experience end to end"`

**QA:**
1. Run `npm run test:e2e` — tests should pass on both desktop and mobile viewports
2. Run `npm run build` — exit code 0
