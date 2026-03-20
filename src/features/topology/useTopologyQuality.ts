import { useState, useEffect } from 'react';
import { PARTICLE_COUNTS, ParticleTier } from './particleData';

export interface TopologyQuality {
  particleCount: number;
  tier: ParticleTier;
  prefersReducedMotion: boolean;
  enableEffects: boolean;
}

function detectTier(): ParticleTier {
  // Use hardware concurrency as a proxy for device capability
  const cores = navigator.hardwareConcurrency ?? 4;
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 4;

  if (cores >= 8 && memory >= 8) return 'high';
  if (cores >= 4 && memory >= 4) return 'medium';
  return 'low';
}

export function useTopologyQuality(): TopologyQuality {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  const [tier] = useState<ParticleTier>(() => {
    if (typeof window === 'undefined') return 'medium';
    return detectTier();
  });

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  return {
    particleCount: PARTICLE_COUNTS[tier],
    tier,
    prefersReducedMotion,
    enableEffects: !prefersReducedMotion && tier !== 'low',
  };
}
