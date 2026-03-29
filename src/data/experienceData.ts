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
    id: 'ucalgary',
    type: 'education',
    organization: 'University of Calgary',
    role: 'B.Sc. Computer Science & Biology',
    period: '2021 — Present',
    description: 'Dual degree focusing on computational systems and biological sciences.',
  },
  // Add work experience entries below — replace this comment with real entries
];
