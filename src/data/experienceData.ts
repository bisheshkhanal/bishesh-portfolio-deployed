export type ExperienceEntry = {
  id: string;
  type: 'work' | 'education';
  organization: string;
  role: string;       // job title or degree name
  period: string;     // e.g. "2021 — Present"
  description: string;
};

export const experienceData: ExperienceEntry[] = [
  {
    id: 'upzoids',
    type: 'work',
    organization: 'Upzoids Ltd.',
    role: 'Power Platform Developer (COOP)',
    period: '2024 — Present',
    description: 'Co-op placement building Power Platform solutions for enterprise clients.',
  },
  {
    id: 'ucalgary',
    type: 'education',
    organization: 'University of Calgary',
    role: 'B.Sc. Computer Science & Biology',
    period: '2021 — Present',
    description: 'Dual degree focusing on computational systems and biological sciences.',
  },
  // Add work experience entries below — replace this comment with real entries
];
