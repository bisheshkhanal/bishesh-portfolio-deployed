import { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, NavLink, Outlet, Route, Routes } from 'react-router-dom';
import DNAHelix from '../components/DNAHelix/DNAHelix';
import { useIntroGate } from '../features/topology/useIntroGate';
import { MainLayout } from '../layouts/MainLayout';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';
import HomeRoute from '../routes/HomeRoute';
import WorkRoute from '../routes/WorkRoute';
import WritingRoute from '../routes/WritingRoute';
import PostRoute from '../routes/PostRoute';
import NotFoundRoute from '../routes/NotFoundRoute';

const IntroOverlay = lazy(() =>
  import('../features/topology/IntroOverlay').then((m) => ({ default: m.IntroOverlay })),
);

interface ShellLink {
  to?: string;
  label: string;
  end?: boolean;
  onClick?: () => void;
}

function ShellNavigation({ resetIntro }: { resetIntro: () => void }) {
  const links: ReadonlyArray<ShellLink> = [
    { to: '/', label: 'Home', end: true },
    { to: '/work', label: 'Work' },
    { label: 'Intro', onClick: resetIntro },
  ];

  return (
    <nav aria-label="Primary" className="flex flex-wrap items-center gap-3 text-sm uppercase tracking-[0.28em] text-white/45">
      {links.map((link) => {
        if (link.onClick) {
          return (
            <button
              key={link.label}
              type="button"
              onClick={link.onClick}
              className="rounded-full border px-4 py-2 transition-colors border-white/10 text-white/45 hover:border-white/20 hover:text-white/75"
            >
              {link.label}
            </button>
          );
        }

        return (
          <NavLink
            key={link.to}
            to={link.to!}
            end={link.end}
            className={({ isActive }) =>
              [
                'rounded-full border px-4 py-2 transition-colors',
                isActive ? 'border-white/30 text-white' : 'border-white/10 text-white/45 hover:border-white/20 hover:text-white/75',
              ].join(' ')
            }
          >
            {link.label}
          </NavLink>
        );
      })}
    </nav>
  );
}

function ShellLayout({ resetIntro }: { resetIntro: () => void }) {
  return (
    <MainLayout dnaSlot={<DNAHelix />} navSlot={<ShellNavigation resetIntro={resetIntro} />}>
      <Outlet />
    </MainLayout>
  );
}

export default function App() {
  const { shouldShowIntro, markIntroDone, resetIntro } = useIntroGate();
  const prefersReducedMotion = usePrefersReducedMotion();

  return (
    <>
      {shouldShowIntro && !prefersReducedMotion && (
        <Suspense fallback={null}>
          <IntroOverlay onExit={markIntroDone} />
        </Suspense>
      )}
      <BrowserRouter>
        <Routes>
          <Route element={<ShellLayout resetIntro={resetIntro} />}>
            <Route index element={<HomeRoute />} />
            <Route path="work" element={<WorkRoute />} />
            <Route path="experiments" element={<Navigate to="/work" replace />} />
            <Route path="writing" element={<WritingRoute />} />
            <Route path="writing/:slug" element={<PostRoute />} />
            <Route path="*" element={<NotFoundRoute />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}
