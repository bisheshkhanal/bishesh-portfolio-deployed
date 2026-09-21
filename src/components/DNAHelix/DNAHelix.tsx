import { useEffect, useRef, useMemo, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { useMotionValue, useSpring } from 'framer-motion';
import { useActiveSection } from '../../hooks/useActiveSection';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';
import { useDNAMarkerAnchors } from '../../hooks/useDNAMarkerAnchors';
import { Scene } from './Scene';
import {
  DNA_ROUTE_CONFIG,
  FALLBACK_ROUTE_CONFIG,
  SECTION_COLORS,
} from './dnaRouteConfig';
import type { DNARouteConfig } from './dnaRouteConfig';
import { projects } from '../../data/projectsData';

declare global {
  interface Window {
    __DNA_DEBUG__?: {
      version?: number;
      scrollY: number;
      scrollRangePx: number;
      scrollProgress: number;
      activeSection?: string;
      markers?: Record<string, { x: number, y: number, visible: boolean }>;
      markerColors?: Record<string, string>;
      markerColorsOk?: boolean;
      lastMarkerClick?: string;
      triggerMarkerClick?: (sectionId: string) => void;
      pointerMissedCount?: number;
      onCreatedRan?: boolean;
      minBaseLuma?: number;
      minCurrentLuma?: number;
      minLumaOk?: boolean;
      helixWorldHeight?: number;
      viewportWorldHeight?: number;
      fitsViewport?: boolean;
      motionFrozen?: boolean;
      cameraFov?: number;
      cameraZ?: number;
      canvasPx?: number;
      aspect?: number;
      isNarrow?: boolean;
    };
    __DNA_E2E__?: boolean;
  }
}

const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max);

export default function DNAHelix() {
  const prefersReducedMotion = usePrefersReducedMotion();
  const location = useLocation();

  const routeConfig: DNARouteConfig = useMemo(() => {
    const base = DNA_ROUTE_CONFIG[location.pathname] ?? FALLBACK_ROUTE_CONFIG;

    if (location.pathname !== '/work') return base;

    const experimentProjects = projects.filter(p => p.isExperiment);
    if (experimentProjects.length === 0) return base;

    return {
      ...base,
      sectionIds: [...base.sectionIds, 'experiments'],
      sections: [
        ...base.sections,
        {
          id: 'experiments',
          selector: '#experiments h2',
          color: SECTION_COLORS.experiments,
          label: 'Experiments',
        },
      ],
    };
  }, [location.pathname]);

  const activeSection = useActiveSection(routeConfig.sectionIds);

  const { markerTs } = useDNAMarkerAnchors(routeConfig);
  const isE2E = typeof window !== 'undefined' && window.__DNA_E2E__ === true;
  
  const rawScrollProgress = useMotionValue(0);
  const smoothProgress = useSpring(rawScrollProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });
  
  const rafRef = useRef<number | null>(null);
  
  useEffect(() => {
    if (import.meta.env.DEV || window.__DNA_E2E__) {
      const existingDebug = (window.__DNA_DEBUG__ ?? {}) as NonNullable<Window['__DNA_DEBUG__']>;
      window.__DNA_DEBUG__ = {
        ...existingDebug,
        version: 1,
        scrollY: 0,
        scrollRangePx: 1,
        scrollProgress: 0,
        markers: existingDebug.markers ?? {}
      };
    }
    
    const updateScrollProgress = () => {
      const scrollY = window.scrollY;
      const scrollRangePx = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const progress = clamp(scrollY / scrollRangePx, 0, 1);
      
      rawScrollProgress.set(progress);
      
      if ((import.meta.env.DEV || window.__DNA_E2E__) && window.__DNA_DEBUG__) {
        window.__DNA_DEBUG__.scrollY = scrollY;
        window.__DNA_DEBUG__.scrollRangePx = scrollRangePx;
        window.__DNA_DEBUG__.scrollProgress = progress;
      }
      
      rafRef.current = null;
    };
    
    const scheduleUpdate = () => {
      if (rafRef.current === null) {
        rafRef.current = requestAnimationFrame(updateScrollProgress);
      }
    };
    
    const handleScroll = () => scheduleUpdate();
    
    const resizeObserver = new ResizeObserver(() => scheduleUpdate());
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    resizeObserver.observe(document.documentElement);
    
    updateScrollProgress();
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      resizeObserver.disconnect();
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
      if (import.meta.env.DEV || window.__DNA_E2E__) {
        delete window.__DNA_DEBUG__;
      }
    };
  }, [rawScrollProgress]);

  useEffect(() => {
    if ((import.meta.env.DEV || isE2E) && window.__DNA_DEBUG__) {
      window.__DNA_DEBUG__.activeSection = activeSection;
    }
  }, [activeSection, isE2E]);

  const handleNavigate = useCallback((id: string) => {
    const firstSection = routeConfig.sectionIds[0];
    if (id === firstSection) {
      window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
      return;
    }
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    }
  }, [prefersReducedMotion, routeConfig.sectionIds]);

  useEffect(() => {
    if (!(import.meta.env.DEV || isE2E)) return;
    const debug = (window.__DNA_DEBUG__ ?? {
      scrollY: 0,
      scrollRangePx: 1,
      scrollProgress: 0,
      markers: {}
    }) as NonNullable<Window['__DNA_DEBUG__']>;
    window.__DNA_DEBUG__ = debug;
    debug.triggerMarkerClick = (id: string) => {
      debug.lastMarkerClick = id;
      handleNavigate(id);
    };
  }, [handleNavigate, isE2E]);

  return (
    <nav
      aria-label="Section Navigation"
      className="w-full h-full"
    >
      <div className="w-full h-full pointer-events-auto">
        <Scene
            scrollProgress={smoothProgress}
            onNavigate={handleNavigate}
            activeSection={activeSection}
            isE2E={isE2E}
            markerTs={markerTs}
            className="w-full h-full"
        />
      </div>
    </nav>
  );
}
