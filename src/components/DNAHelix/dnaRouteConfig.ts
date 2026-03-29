/**
 * Route-aware DNA helix marker configuration.
 *
 * This is the single source of truth for which sections appear as markers
 * on each route. All three DNA layers (hook, Helix, DNAHelix) read from
 * this config — never hardcode section IDs elsewhere.
 */

export interface DNASectionConfig {
  id: string;
  selector: string;
  color: string;
  label: string;
}

export interface DNARouteConfig {
  sectionIds: string[];
  sections: DNASectionConfig[];
  scrollBoundarySelector: string | null;
}

/** Canonical color palette — consistent per section type across all routes. */
export const SECTION_COLORS: Record<string, string> = {
  hero:        '#4ea2ff',
  projects:    '#ff9500',
  skills:      '#00d9ff',
  experience:  '#9b59b6',
  writing:     '#4ea2ff',
  experiments: '#ff9500',
  fallback:    '#e0e0e0',
};

export const DNA_ROUTE_CONFIG: Record<string, DNARouteConfig> = {
  '/': {
    sectionIds: ['hero', 'projects', 'skills', 'experience'],
    sections: [
      { id: 'hero',       selector: '#hero h1',       color: SECTION_COLORS.hero,       label: 'Hero' },
      { id: 'projects',   selector: '#projects h2',   color: SECTION_COLORS.projects,   label: 'Projects' },
      { id: 'skills',     selector: '#skills h2',     color: SECTION_COLORS.skills,     label: 'Skills' },
      { id: 'experience', selector: '#experience',    color: SECTION_COLORS.experience, label: 'Experience' },
    ],
    scrollBoundarySelector: '#contact',
  },
  '/work': {
    sectionIds: ['skills', 'projects'],
    sections: [
      { id: 'skills',   selector: '#skills h2',   color: SECTION_COLORS.skills,   label: 'Skills' },
      { id: 'projects', selector: '#projects h2', color: SECTION_COLORS.projects, label: 'Projects' },
    ],
    scrollBoundarySelector: null,
  },
  '/writing': {
    sectionIds: ['writing'],
    sections: [
      { id: 'writing', selector: '#writing h1', color: SECTION_COLORS.writing, label: 'Writing' },
    ],
    scrollBoundarySelector: null,
  },
};

export const FALLBACK_ROUTE_CONFIG: DNARouteConfig = {
  sectionIds: [],
  sections: [],
  scrollBoundarySelector: null,
};
