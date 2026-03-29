import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { DNARouteConfig } from '../components/DNAHelix/dnaRouteConfig';

const clamp01 = (value: number) => Math.min(Math.max(value, 0), 1);

type MarkerMap = Record<string, number>;

const getAnchorY = (element: HTMLElement | null) => {
  if (!element) return null;
  const rect = element.getBoundingClientRect();
  return window.scrollY + rect.top + rect.height / 2;
};

function buildDefaults(config: DNARouteConfig): { defaultTs: MarkerMap; defaultYs: MarkerMap } {
  const defaultTs: MarkerMap = {};
  const defaultYs: MarkerMap = {};
  const count = config.sections.length;
  config.sections.forEach((section, i) => {
    defaultTs[section.id] = count > 1 ? i / (count - 1) : 0;
    defaultYs[section.id] = 0;
  });
  return { defaultTs, defaultYs };
}

export function useDNAMarkerAnchors(config: DNARouteConfig): { markerTs: MarkerMap; viewportYs: MarkerMap } {
  const { defaultTs, defaultYs } = buildDefaults(config);
  const [markerTs, setMarkerTs] = useState<MarkerMap>(defaultTs);
  const [viewportYs, setViewportYs] = useState<MarkerMap>(defaultYs);
  const measureRafRef = useRef<number | null>(null);
  const scrollRafRef = useRef<number | null>(null);
  const anchorYsRef = useRef<MarkerMap | null>(null);

  const measure = useCallback(() => {
    const sectionAnchors: MarkerMap = {};
    const anchors: MarkerMap = {};
    let scrollStartY = 0;

    for (let i = 0; i < config.sections.length; i++) {
      const section = config.sections[i];
      const el = document.querySelector(section.selector) as HTMLElement | null;
      const anchorY = getAnchorY(el);
      if (anchorY === null) return;
      sectionAnchors[section.id] = anchorY;
      anchors[section.id] = anchorY;
      if (i === 0) scrollStartY = anchorY;
    }

    let scrollEndY: number;
    if (config.scrollBoundarySelector) {
      const boundaryEl = document.querySelector(config.scrollBoundarySelector) as HTMLElement | null;
      if (!boundaryEl) return;
      const boundaryRect = boundaryEl.getBoundingClientRect();
      scrollEndY = window.scrollY + boundaryRect.bottom - window.innerHeight;
    } else {
      scrollEndY = document.documentElement.scrollHeight - window.innerHeight;
    }

    const range = Math.max(1, scrollEndY - scrollStartY);
    const nextMarkerTs: MarkerMap = {};
    for (const section of config.sections) {
      nextMarkerTs[section.id] = clamp01((sectionAnchors[section.id] - scrollStartY) / range);
    }

    anchorYsRef.current = anchors;
    setMarkerTs(nextMarkerTs);

    const currentScrollY = window.scrollY;
    const nextViewportYs: MarkerMap = {};
    for (const section of config.sections) {
      nextViewportYs[section.id] = anchors[section.id] - currentScrollY;
    }
    setViewportYs(nextViewportYs);
  }, [config]);

  const scheduleMeasure = useCallback(() => {
    if (measureRafRef.current !== null) return;
    measureRafRef.current = window.requestAnimationFrame(() => {
      measureRafRef.current = null;
      measure();
    });
  }, [measure]);

  useLayoutEffect(() => {
    const { defaultTs: freshDefaults, defaultYs: freshYs } = buildDefaults(config);
    setMarkerTs(freshDefaults);
    setViewportYs(freshYs);
    anchorYsRef.current = null;

    scheduleMeasure();

    const resizeObserver = new ResizeObserver(() => scheduleMeasure());
    if (document.body) resizeObserver.observe(document.body);
    resizeObserver.observe(document.documentElement);

    window.addEventListener('resize', scheduleMeasure);

    if (document.fonts) {
      document.fonts.ready.then(() => scheduleMeasure());
    }

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', scheduleMeasure);
      if (measureRafRef.current !== null) {
        cancelAnimationFrame(measureRafRef.current);
      }
    };
  }, [config, scheduleMeasure]);

  const scheduleViewportUpdate = useCallback(() => {
    if (scrollRafRef.current !== null) return;
    scrollRafRef.current = window.requestAnimationFrame(() => {
      scrollRafRef.current = null;
      const anchors = anchorYsRef.current;
      if (!anchors) return;
      const scrollY = window.scrollY;
      const nextYs: MarkerMap = {};
      for (const key of Object.keys(anchors)) {
        nextYs[key] = anchors[key] - scrollY;
      }
      setViewportYs(nextYs);
    });
  }, []);

  useEffect(() => {
    const handleScroll = () => scheduleViewportUpdate();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollRafRef.current !== null) {
        cancelAnimationFrame(scrollRafRef.current);
      }
    };
  }, [scheduleViewportUpdate]);

  return { markerTs, viewportYs };
}
