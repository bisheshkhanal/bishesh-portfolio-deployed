# PROJECT KNOWLEDGE BASE

**Generated:** 2026-03-29T06:00:00Z
**Updated:** 2026-05-25
**Commit:** 07afeae
**Branch:** dev

## OVERVIEW
Personal portfolio / digital garden built on React 19 + Vite + TypeScript, with Tailwind for layout and React Three Fiber for cinematic 3D layers. Two specialized visual systems — the sidebar DNA helix and the shader-driven topology scene — sit alongside standard routed UI pages.

## STRUCTURE
```text
./
├── src/                    # app shell, routes, content, visual systems
├── e2e/                    # Playwright regression coverage (desktop + reduced-motion)
├── public/                 # static assets (resume, robots)
├── .sisyphus/              # planning notes, evidence, learnings; treat as task memory
├── .opencode/skills/       # agent skill packs (frontend-design)
└── test-results/           # generated Playwright artifacts (gitignored)
```

## WHERE TO LOOK
| Task | Location | Notes |
|------|----------|-------|
| Home route section contract | `src/routes/HomeRoute.tsx` | Required order: `Hero → Projects → Skills → Experience → Contact`; DNA helix depends on exact section IDs/order |
| Intro overlay | `src/features/topology/IntroOverlay.tsx` | Fullscreen intro gate with skip button; wraps AboutExperience |
| Intro session gate | `src/features/topology/useIntroGate.ts` | sessionStorage-backed hook: shouldShowIntro, markIntroDone, resetIntro |
| Routing and layout split | `src/app/App.tsx`, `src/layouts/` | All routes use `MainLayout` + `ShellLayout`; `ImmersiveLayout` exists but is not currently wired |
| Portfolio copy / structured content | `src/data/*.ts` | Keep content here instead of hardcoding inside components |
| Sidebar 3D navigation | `src/components/DNAHelix/` | Own local AGENTS.md; math + debug hooks + E2E behavior |
| About-page topology scene | `src/features/topology/` | Own local AGENTS.md; shaders + beat blending + quality gating + reduced-motion fallback |
| Shared browser behavior hooks | `src/hooks/` | Own local AGENTS.md; observers, RAF scheduling, reduced motion |
| Global tokens and layout constants | `src/index.css` | CSS vars, `--sidebar-width`, clickable DNA canvas overrides |
| E2E verification | `e2e/`, `playwright.config.ts` | Desktop + reduced-motion projects; dev server runs on port 4173 |

## CODE MAP
| Symbol | Type | Location | Role |
|--------|------|----------|------|
| `App` | function | `src/app/App.tsx` | Router root; `ShellLayout` wraps all routes with `MainLayout` + DNA helix + nav |
| `shellLinks` | const | `src/app/App.tsx` | Canonical nav labels: Home, Work, Writing |
| `DNAHelix` | function | `src/components/DNAHelix/DNAHelix.tsx` | Persistent sidebar navigation + debug telemetry |
| `IntroOverlay` | function | `src/features/topology/IntroOverlay.tsx` | Fullscreen intro gate: wraps AboutExperience, skip button, CSS fade-out exit |
| `useIntroGate` | function | `src/features/topology/useIntroGate.ts` | sessionStorage hook: shouldShowIntro, markIntroDone, resetIntro |
| `AboutExperience` | function | `src/features/topology/AboutExperience.tsx` | Quality-gated entry: routes to `TopologyScene` or `ReducedMotionTopology` |
| `TopologyScene` | function | `src/features/topology/TopologyScene.tsx` | R3F canvas orchestrator for the About experience |
| `useTopologyScrollState` | function | `src/features/topology/useTopologyScrollState.ts` | Scroll → beat weights / bloom / camera state (ref-based) |
| `useTopologyQuality` | function | `src/features/topology/useTopologyQuality.ts` | Device tier detection + reduced-motion gate |
| `TopologyScrollState` | interface | `src/features/topology/topologyTypes.ts` | Shared scroll state shape; high-fan-in type module |
| `useActiveSection` | function | `src/hooks/useActiveSection.ts` | IntersectionObserver-based active section tracking |
| `useDNAMarkerAnchors` | function | `src/hooks/useDNAMarkerAnchors.ts` | DOM measurement for helix marker placement |
| `MainLayout` | component | `src/layouts/MainLayout.tsx` | Shell with `dnaSlot` + `navSlot` pattern |

## CONVENTIONS
- `src/app` owns router composition; `src/routes` stays thin and page-level.
- Static portfolio content lives in `src/data`; components render data instead of owning copy.
- Motion-aware UI uses `usePrefersReducedMotion()` instead of unconditional smooth scroll / animation.
- Complex R3F work is isolated into dedicated folders (`src/components/DNAHelix`, `src/features/topology`) rather than mixed into ordinary page components.
- Package scripts call local binaries through `node ./node_modules/...`; keep that convention when adjusting scripts.
- Home section order is a contract, not a suggestion: `Hero → Projects → Skills → Experience → Contact`.
- The DNA helix reads those exact section IDs/order; if this changes, update `src/components/DNAHelix/AGENTS.md` alongside the route structure.
- Route pages use default exports; shared hooks/layouts use named exports. No barrel `index.ts` files.

## ANTI-PATTERNS (THIS PROJECT)
- Do not change `--sidebar-width` casually; layout spacing and DNA rail behavior depend on it.
- Do not use `react-router-hash-link`; the repo uses direct DOM scrolling helpers instead.
- Do not move portfolio copy into JSX when it belongs in `src/data`.
- Do not treat R3F changes as purely visual polish; verify reduced motion, mobile behavior, and Playwright stability.
- Do not run Playwright files through raw `tsc`; use Playwright CLI / configured scripts.
- Do not use `Math.random()` for particle/geometry generation; deterministic patterns are required for quality tiers and E2E stability.
- Do not push React state updates through per-frame animation paths; use refs.

## UNIQUE STYLES
- Dark, cinematic baseline with CSS vars: `--bg-black`, `--cyan`, `--orange`, `--green`, `--border`.
- The sidebar DNA canvas intentionally re-enables pointer events through global CSS selectors on `[data-testid="dna-canvas"]`.
- Development and E2E flows expose debug state on `window.__DNA_DEBUG__` / `window.__DNA_E2E__` for visual systems.
- `vite-plugin-glsl` enables direct `.glsl` imports for shader sources.
- Vite build uses custom `copyPublicDirManually()` plugin; `build.copyPublicDir` is disabled.

## COMMANDS
```bash
npm install
npm run dev          # Vite dev server
npm run build        # Production build → dist/
npm test             # Vitest (--passWithNoTests)
npm run test:e2e     # Install browsers + run Playwright
```

## GIT & VERSION CONTROL

### Branch Strategy

| Branch | Purpose | Deploy Trigger |
|--------|---------|---------------|
| `main` | Production — stable, deployed to live site | Yes — Vercel auto-deploys on push |
| `dev` | Integration — all feature branches merge here first | No |
| `feature/*` | Active work — branched off `dev`, merged back when ready | No |

### Rules for Agents

1. **Never commit directly to `main` or `dev`.** Always create or checkout a `feature/*` branch.
2. **Branch new work off `dev`:** `git checkout -b feature/<name> dev`
3. **Commit messages** follow conventional commits (`feat:`, `fix:`, `refactor:`, `test:`, `docs:`, `style:`, `chore:`). Match the existing history style.
4. **Atomic commits** — one logical change per commit. If touching 3+ files across modules, split into separate commits.
5. **Never force-push `main` or `dev`.** Force-push (`--force-with-lease`) is only acceptable on `feature/*` branches.
6. **Before starting work**, confirm you're on the right branch. Run `git branch --show-current`.
7. **Merging to `main`** triggers a live deploy. Only do this when the user explicitly asks to deploy.
8. **Push feature branches to origin** so work is backed up: `git push -u origin feature/<name>`.

### Vercel Config
- Project: `bishesh-portfolio-deployed` (linked via `.vercel/project.json`)
- Production branch: `main` (default — not explicitly overridden)
- Framework: Vite, Node 24.x
- Deploy trigger: push to `main` on GitHub

## NOTES
- Current routes: `/` (Home), `/work`, `/experiments` (→ redirects to `/work`), `/writing`. No `/about` route is currently wired.
- `ImmersiveLayout` exists but is unused; do not assume it drives any route.
- `playwright.config.ts` uses port `4173`; some ad-hoc helper scripts may target `5174`, so check before assuming a port.
- No checked-in CI workflow; Vercel config is present via `.vercel/` and production build output is `dist/`.
- Read `src/AGENTS.md` before editing app code, then descend into local AGENTS files for the visual hotspots.
- `src/components/AboutSection/` is an empty directory — do not assume it has content.
- Topology scene is now the fullscreen intro gate (see `src/features/topology/IntroOverlay.tsx`); `TopologySection` is no longer on the home page.
