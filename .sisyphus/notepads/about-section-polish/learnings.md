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
