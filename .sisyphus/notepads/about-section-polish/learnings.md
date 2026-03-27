# Learnings — about-section-polish

## [2026-03-27] Initial Analysis

### Current AboutSection.tsx
- 27-line file with a `grid grid-cols-1 lg:grid-cols-2 gap-12` layout
- Text block (greeting + paragraphs) on left, `<ScenePortal />` on right
- `section id="about-section"` with `py-24 lg:py-32`
- Uses `bio.greeting` and `bio.paragraphs` from `src/data/bioData.ts`

### Current ScenePortal.tsx (183 lines)
- Manages expand/collapse via `isOpen` + `isFullscreen` state
- `placeholderRef` div: `w-full h-[220px] md:w-[400px] md:h-[280px]` — this needs to change to `w-full h-[400px] md:h-[450px]`
- `frameloop={isOpen ? "always" : "demand"}` — needs to become `"always"`
- Already has `cursor-pointer` class when `!isOpen`
- Body scroll lock via `document.body.style.overflow = 'hidden'`
- Uses `portalRef` for `onTransitionEnd` handler — `setIsOpen(false)` when transition ends after collapse
- ESC key collapse handler exists
- `100vh` for fullscreen height — should be `100dvh` for mobile
- Return button: `right: calc(var(--sidebar-width) + 1.5rem)`, `top-6`

### Current TopologyScene.tsx (92 lines)
- `TopologyContent` calls `useTopologyScrollState()` — a hook that uses `useScroll()` from ScrollControls
- `previewMode` prop doesn't exist yet — needs to be added
- `TopologySceneInner` wraps in `<ScrollControls pages={4} damping={0.1}>`
- The `ScrollControls` is CRITICAL — `useScroll()` only works inside `<ScrollControls>`. If we add `previewMode` to bypass scroll, we need to be careful that `useScroll()` still has its context.

### Current useTopologyScrollState.ts (79 lines)
- Uses `useScroll()` hook from `@react-three/drei` — requires `<ScrollControls>` context
- `computeScrollState(offset)` maps 0-1 scroll to beat weights
- Beat 1 (helix) = offset=0 → beatWeights = Vector4(1,0,0,0)
- When previewMode=true, we want to return beat 1 state regardless of scroll
- Approach: add `previewMode?: boolean` param; when true, return `computeScrollState(0)` instead of `computeScrollState(scroll.offset)`

### Key Insight: TopologyContent calls useTopologyScrollState
- `TopologyContent` lives inside `ScrollControls`, so `useScroll()` will always have context
- We need to pass `previewMode` from `TopologyScene` down to `TopologyContent` → `useTopologyScrollState`
- Chain: `TopologyScene(previewMode)` → `TopologySceneInner(previewMode)` → `TopologyContent(previewMode)` → `useTopologyScrollState(previewMode)`

### DNA Sidebar
- Already has `data-testid="dna-canvas"` for pointer-events override in index.css
- T5: Add `.portal-open [data-testid="dna-canvas"]` rule to hide when portal opens
- Toggle `portal-open` class on `document.body` in ScenePortal's `useEffect` for `isOpen`

### Wave Execution Plan
- Wave 1: T1 (visual-engineering) + T2 (quick) — PARALLEL
- Wave 2: T3 (deep) + T4 (quick) + T5 (visual-engineering) — PARALLEL, blocked by Wave 1
- Wave 3: T6 (deep) + T7 (visual-engineering) — PARALLEL, blocked by Wave 2
- Wave 4: T8 (unspecified-high) — blocked by Wave 3
- Final: F1 (oracle) + F2 + F3 + F4 — all parallel, blocked by T8

## Task 1: Vertical Stack Layout Refactor
- Converted `AboutSection` from a side-by-side grid to a vertical stack layout.
- Used `max-w-2xl` for the text block to ensure readability.
- Added a 1px horizontal divider (`border-t border-[var(--cyan)]`) between the text block and the scene panel.
- Updated `ScenePortal` placeholder div sizing to `w-full h-[400px] md:h-[450px]` to fit the new vertical layout.
- Maintained the existing `id="about-section"` and section padding.
- Successfully ran `npx tsc --noEmit` and committed the changes.
- Took a Playwright screenshot of the updated layout.
  - ScenePortal already had the conditional `cursor-pointer` class on the portal div, so only `frameloop` needed to change to keep the topology scene animating in both preview and expanded states.

## [2026-03-27] T3 Preview Mode Beat Lock

- Added `previewMode?: boolean` to `useTopologyScrollState(previewMode)` and kept `useScroll()` unconditional to preserve hooks/context correctness under `<ScrollControls>`.
- Implemented the preview bypass inside `useFrame`: when `previewMode` is true, state now uses `computeScrollState(0)` every frame, which yields beat-1 weights (`Vector4(1,0,0,0)`) while keeping animation live.
- Threaded `previewMode` through `TopologyScene` → `TopologySceneInner` → `TopologyContent` to keep `/about` unchanged (prop omitted there, so scroll-driven behavior remains default).
- Updated `ScenePortal` to pass `previewMode={!isOpen}` so the collapsed panel always renders beat 1 and expanded mode restores normal scroll-driven beats.

## [2026-03-27] ScenePortal Rapid-Click Guard

- Added `isTransitioning` ref guard to `ScenePortal` so expand/collapse clicks are ignored while a CSS transition is in flight.
- `handleExpand` and `handleCollapse` now set the guard before starting state changes, and `handleTransitionEnd` clears it when the portal element finishes transitioning.
- This prevents the portal from getting stuck in mixed states during rapid click/tap sequences.

## ScenePortal DNA Sidebar Hiding
- Added `portal-open` class toggle to `document.body` in `ScenePortal.tsx` when `isOpen` changes.
- Added CSS rule in `src/index.css` to set `visibility: hidden` on `[data-testid="dna-canvas"]`. This hides the DNA sidebar visually without unmounting it or causing layout reflows.

## [2026-03-27] T6 Verification — Collapse Returns to Beat 1 (No-op)

- Verified collapse flow in `ScenePortal`: `handleCollapse()` sets `setIsFullscreen(false)` and waits for portal transition end before `setIsOpen(false)`.
- Confirmed `TopologyScene` is rendered with `previewMode={!isOpen}` in `ScenePortal`, so `previewMode` flips to `true` exactly when collapse completes (`isOpen=false`).
- Confirmed `useTopologyScrollState(previewMode)` snaps state to `computeScrollState(0)` whenever `previewMode` is true; this yields beat-1 weights immediately on the next frame.
- Result: Beat reset on return from fullscreen is already covered by T3; no additional code change required for T6.
- Validation: `npx tsc --noEmit` exits successfully.

## Mobile Responsiveness Fixes
- Updated `ScenePortal.tsx` placeholder div height to `h-[300px] md:h-[450px]` to fit better on mobile screens.
- Changed fullscreen portal height from `100vh` to `100dvh` to account for mobile browser chrome (address bar).
- Added `min-h-[44px] min-w-[44px] flex items-center justify-center` to the Return button to ensure a proper touch target size (Apple HIG minimum).
- Verified `AboutSection.tsx` text block layout at 375px; the `max-w-2xl` class handles mobile widths gracefully without horizontal overflow.

## [2026-03-27] T8 About Section Polish E2E Coverage

- Added `e2e/about-section-polish.spec.ts` with 8 `@desktop` tests covering vertical layout, no-subheader regression, pointer cursor, DNA hide/show during fullscreen, fullscreen expand/collapse, rapid-click stability, mobile 375px layout, and mobile expand behavior.
- Reused the `gotoHomeAbout()` + `__DNA_E2E__` initialization pattern from `portal-dna-nav.spec.ts` so the spec runs against `/` and can assert on the DNA sidebar reliably.
- The initial no-subheaders assertion failed because the text still exists in `Hero`; scoping those assertions to `#about-section` fixed the regression intent without changing app code.
- Verified with `npm run build` and `npx playwright test e2e/about-section-polish.spec.ts --project=desktop`; final result was 8/8 passing.
- Saved the Playwright run log to `.sisyphus/evidence/polish-task-T8-playwright-output.txt`.
