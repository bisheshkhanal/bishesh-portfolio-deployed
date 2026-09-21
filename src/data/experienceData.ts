export type ExperienceEntry = {
  id: string;
  type: 'work' | 'education';
  organization: string;
  role: string;       // job title or degree name
  period: string;     // e.g. "2021 - Present"
  description: string;
};

export const experienceData: ExperienceEntry[] = [
  {
    id: 'upzoids',
    type: 'work',
    organization: 'Upzoids Ltd.',
    role: 'Power Platform Developer',
    period: 'July 2025 - Present',
    description: 'I build Power Platform solutions for enterprise clients. A good chunk of my work is business development now. I put AI agents into our internal sales process and build pipelines that take the manual steps out of it.',
  },
  {
    id: 'ucalgary',
    type: 'education',
    organization: 'University of Calgary',
    role: 'B.Sc. Natural Sciences (Co-op)',
    period: '2020 - June 2027',
    description: 'A multi-disciplinary natural sciences degree. My concentrations are computer science and biological sciences, and the program carries a co-op designation.',
  },
];
