import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';

export type DNAMarkerId = 'hero' | 'projects' | 'skills';

const clamp01 = (value: number) => Math.min(Math.max(value, 0), 1);

type MarkerTs = Record<DNAMarkerId, number>;
type MarkerYs = Record<DNAMarkerId, number>;

const DEFAULT_MARKER_TS: MarkerTs = {
  hero: 0,
  projects: 0.5,
  skills: 1
};

const DEFAULT_VIEWPORT_YS: MarkerYs = {
  hero: 0,
  projects: 0,
  skills: 0
};

const getAnchorY = (element: HTMLElement | null) => {
  if (!element) return null;
  const rect = element.getBoundingClientRect();
  return window.scrollY + rect.top + rect.height / 2;
};

export function useDNAMarkerAnchors(): { markerTs: MarkerTs; viewportYs: MarkerYs } {
  const [markerTs, setMarkerTs] = useState<MarkerTs>(DEFAULT_MARKER_TS);
  const [viewportYs, setViewportYs] = useState<MarkerYs>(DEFAULT_VIEWPORT_YS);
  const measureRafRef = useRef<number | null>(null);
  const scrollRafRef = useRef<number | null>(null);
  const anchorYsRef = useRef<MarkerYs | null>(null);

  const measure = useCallback(() => {
    const heroHeading = document.querySelector('#hero h1') as HTMLElement | null;
    const projectsHeading = document.querySelector('#projects h2') as HTMLElement | null;
    const skillsHeading = document.querySelector('#skills h2') as HTMLElement | null;
    const contactSection = document.getElementById('contact');

    if (!heroHeading || !projectsHeading || !skillsHeading || !contactSection) return;

    const heroAnchorY = getAnchorY(heroHeading);
    const projectsAnchorY = getAnchorY(projectsHeading);
    const skillsAnchorY = getAnchorY(skillsHeading);
    const contactRect = contactSection.getBoundingClientRect();
    const contactBottomY = window.scrollY + contactRect.bottom;

    if (heroAnchorY === null || projectsAnchorY === null || skillsAnchorY === null) return;

    const scrollStartY = heroAnchorY;
    const scrollEndY = contactBottomY - window.innerHeight;
    const range = Math.max(1, scrollEndY - scrollStartY);

    const nextMarkerTs: MarkerTs = {
      hero: clamp01((heroAnchorY - scrollStartY) / range),
      projects: clamp01((projectsAnchorY - scrollStartY) / range),
      skills: clamp01((skillsAnchorY - scrollStartY) / range)
    };

    anchorYsRef.current = {
      hero: heroAnchorY,
      projects: projectsAnchorY,
      skills: skillsAnchorY
    };

    setMarkerTs(nextMarkerTs);
    setViewportYs({
      hero: heroAnchorY - window.scrollY,
      projects: projectsAnchorY - window.scrollY,
      skills: skillsAnchorY - window.scrollY
    });
  }, []);

  const scheduleMeasure = useCallback(() => {
    if (measureRafRef.current !== null) return;
    measureRafRef.current = window.requestAnimationFrame(() => {
      measureRafRef.current = null;
      measure();
    });
  }, [measure]);

  useLayoutEffect(() => {
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
  }, [scheduleMeasure]);

  const scheduleViewportUpdate = useCallback(() => {
    if (scrollRafRef.current !== null) return;
    scrollRafRef.current = window.requestAnimationFrame(() => {
      scrollRafRef.current = null;
      const anchors = anchorYsRef.current;
      if (!anchors) return;
      const scrollY = window.scrollY;
      setViewportYs({
        hero: anchors.hero - scrollY,
        projects: anchors.projects - scrollY,
        skills: anchors.skills - scrollY
      });
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
