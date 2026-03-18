# The Topology of Potential Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use `superpowers/executing-plans` to implement this plan task-by-task.

**Goal:** Build a full-screen, scroll-driven About experience where one massive particle field tells a four-beat story by changing shader rules, camera choreography, post-processing, and text overlays as scroll progresses.

**Architecture:** Use a dedicated immersive route layout that bypasses `MainLayout` so the About page owns the full viewport and does not inherit the DNA rail or `BackgroundEffects`. Use `@react-three/drei` `ScrollControls` + `useScroll` as the single source of truth for scroll progress, with one custom particle system rendered as `THREE.Points` + `ShaderMaterial` driven by deterministic attribute buffers and uniforms. Start with shader-driven procedural morphing rather than FBO simulation; the design beats are deterministic and scroll-bound, so this is lower-risk and still supports 500K-1M desktop particles.

**Tech Stack:** React 19, Vite 7, TypeScript, React Router 7, `@react-three/fiber` 9.5, `@react-three/drei` 10.7, `three` 0.182, Framer Motion 6 only for non-scroll microcopy if needed, `@react-three/postprocessing` for Bloom and Chromatic Aberration, Playwright + Vitest.

---

**Core Decisions**
- `Layout`: use a separate immersive route layout in `src/app/App.tsx`; do not try to hide `MainLayout` from inside `AboutRoute`.
- `Scroll`: use `ScrollControls` / `useScroll`; avoid Framer Motion `useScroll` to prevent dual scroll sources.
- `Particle Engine`: use precomputed `Float32Array` attributes + one custom `ShaderMaterial`; no FBO in v1.
- `Postprocessing`: add `@react-three/postprocessing`; beat-driven Bloom and Chromatic Aberration.
- `Text Overlay`: use `<Scroll html>` for DOM copy tied to the same scroll container.
- `Performance`: fixed particle counts by device tier, adaptive DPR/effect quality, reduced-motion static mode.
- `Testing`: TDD for routing, scene state mapping, particle buffer generation, reduced-motion behavior, and E2E beat transitions.

**Visual Constants**
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

### Task 1: Create immersive route layout split

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

---

### Task 2: Scaffold About experience module structure

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

---

### Task 3: Install postprocessing and verify build compatibility

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`

**Step 1: Install dependency**
Run `npm install @react-three/postprocessing`

**Step 2: Verify build**
Run `npm run build` to ensure no peer dependency issues with React 19 / Three 0.182.

**Step 3: Commit**
`git add package.json package-lock.json`
`git commit -m "build: add postprocessing support for topology scene"`

---

### Task 4: Build deterministic particle data generator

**Files:**
- Create: `src/features/topology/particleData.ts`

**Step 1: Implement generator**
Create a function that generates `Float32Array` buffers for `aProgressIndex`, `aHelixSide`, `aRungMix`, `aLatticeMix`, `aPlaneUv`, `aRandom`, and `aSize` based on a target particle count.

**Step 2: Commit**
`git add src/features/topology/particleData.ts`
`git commit -m "feat: add deterministic particle buffer generator"`

---

### Task 5: Implement shader material shell and uniform contract

**Files:**
- Create: `src/features/topology/shaders/topology.vert.glsl`
- Create: `src/features/topology/shaders/topology.frag.glsl`
- Create: `src/features/topology/TopologyMaterial.tsx`
- Create: `src/features/topology/shaderUniforms.ts`

**Step 1: Define uniforms**
Create `shaderUniforms.ts` with the required uniform shapes (time, scroll, beat weights, colors).

**Step 2: Create shader files**
Create basic vertex and fragment shaders that compile and render points.

**Step 3: Create React wrapper**
Create `TopologyMaterial.tsx` that uses `shaderMaterial` from drei or a custom `useMemo` material.

**Step 4: Commit**
`git add src/features/topology/shaders/ src/features/topology/TopologyMaterial.tsx src/features/topology/shaderUniforms.ts`
`git commit -m "feat: add topology shader material and uniform contract"`

---

### Task 6: Implement Beat 1 + Beat 2 position math

**Files:**
- Modify: `src/features/topology/shaders/topology.vert.glsl`
- Modify: `src/features/topology/topologyConfig.ts`

**Step 1: Update vertex shader**
Add GLSL logic to compute the biological helix position and the quantized lattice position, blending between them based on beat weights.

**Step 2: Commit**
`git add src/features/topology/shaders/topology.vert.glsl src/features/topology/topologyConfig.ts`
`git commit -m "feat: encode biological and computational particle states"`

---

### Task 7: Implement Beat 3 + Beat 4 position math

**Files:**
- Modify: `src/features/topology/shaders/topology.vert.glsl`
- Modify: `src/features/topology/topologyConfig.ts`
- Create: `src/features/topology/noise.glsl.ts` (or embed in vert)

**Step 1: Add noise and plane math**
Update the vertex shader to inject simplex noise for Beat 3 and flatten to a plane for Beat 4.

**Step 2: Commit**
`git add src/features/topology/shaders/topology.vert.glsl src/features/topology/topologyConfig.ts src/features/topology/noise.glsl.ts`
`git commit -m "feat: encode chaos fracture and grounding plane states"`

---

### Task 8: Build scroll state bridge and camera choreography

**Files:**
- Create: `src/features/topology/useTopologyScrollState.ts`
- Create: `src/features/topology/TopologyCameraRig.tsx`
- Modify: `src/features/topology/TopologyScene.tsx`

**Step 1: Implement scroll hook**
Create `useTopologyScrollState.ts` to map `useScroll().offset` to beat weights and camera targets.

**Step 2: Implement camera rig**
Create `TopologyCameraRig.tsx` to animate the camera in `useFrame` based on the scroll state.

**Step 3: Update scene**
Wire the scroll state into `TopologyScene.tsx` and pass uniforms to the material.

**Step 4: Commit**
`git add src/features/topology/useTopologyScrollState.ts src/features/topology/TopologyCameraRig.tsx src/features/topology/TopologyScene.tsx`
`git commit -m "feat: drive topology camera and uniforms from scroll"`

---

### Task 9: Add post-processing beat orchestration

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

---

### Task 10: Build overlay typography and narrative timing

**Files:**
- Modify: `src/features/topology/TopologyOverlay.tsx`
- Modify: `src/features/topology/topologyConfig.ts`

**Step 1: Implement text panels**
Update `TopologyOverlay.tsx` to render the four text beats using `<Scroll html>`, styling them to match the site's design system.

**Step 2: Commit**
`git add src/features/topology/TopologyOverlay.tsx src/features/topology/topologyConfig.ts`
`git commit -m "feat: add topology narrative overlay"`

---

### Task 11: Implement adaptive quality and reduced-motion fallback

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

---

### Task 12: Add E2E verification for route, scroll beats, and fallback behavior

**Files:**
- Create: `e2e/about-topology.spec.ts`

**Step 1: Write E2E tests**
Create Playwright tests to verify the `/about` route loads, the overlay text is visible, and reduced motion is respected.

**Step 2: Commit**
`git add e2e/about-topology.spec.ts`
`git commit -m "test: cover topology about experience end to end"`
