import { BrowserRouter, NavLink, Outlet, Route, Routes } from 'react-router-dom';
import Contact from '../components/Contact';
import DNAHelix from '../components/DNAHelix/DNAHelix';
import { MainLayout } from '../layouts/MainLayout';
import { ImmersiveLayout } from '../layouts/ImmersiveLayout';
import HomeRoute from '../routes/HomeRoute';
import WorkRoute from '../routes/WorkRoute';
import ExperimentsRoute from '../routes/ExperimentsRoute';
import AboutRoute from '../routes/AboutRoute';
import WritingRoute from '../routes/WritingRoute';

const shellLinks: ReadonlyArray<{ to: string; label: string; end?: boolean }> = [
  { to: '/', label: 'Home', end: true },
  { to: '/work', label: 'Work' },
  { to: '/experiments', label: 'Experiments' },
  { to: '/writing', label: 'Writing' },
  { to: '/about', label: 'About' },
];

function ShellNavigation() {
  return (
    <nav aria-label="Primary" className="flex flex-wrap items-center gap-3 text-sm uppercase tracking-[0.28em] text-white/45">
      {shellLinks.map(({ to, label, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            [
              'rounded-full border px-4 py-2 transition-colors',
              isActive ? 'border-white/30 text-white' : 'border-white/10 text-white/45 hover:border-white/20 hover:text-white/75',
            ].join(' ')
          }
        >
          {label}
        </NavLink>
      ))}
    </nav>
  );
}

function ShellLayout() {
  return (
    <MainLayout dnaSlot={<DNAHelix />} navSlot={<ShellNavigation />}>
      <Outlet />
    </MainLayout>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<ShellLayout />}>
          <Route index element={<HomeRoute />} />
          <Route path="work" element={<WorkRoute />} />
          <Route path="experiments" element={<ExperimentsRoute />} />
          <Route path="writing" element={<WritingRoute />} />
        </Route>
        <Route element={<ImmersiveLayout><Outlet /></ImmersiveLayout>}>
          <Route path="about" element={<AboutRoute />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
