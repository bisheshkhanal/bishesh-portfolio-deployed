export type ProjectFeature = { title: string; description: string };
export type ProjectDetails = { overview: string; features?: ProjectFeature[] };
export type Project = {
  id: string; title: string; description: string;
  technologies: string[]; images: string[];
  demoLink: string | null; repoLink: string | null;
  featured: boolean; isExperiment: boolean;
  details?: ProjectDetails;
};

export const projects: Project[] = [
  {
    id: 'ragebaiter',
    title: 'RageBaiter',
    description:
      'A Manifest V3 Chrome extension built to nudge Twitter/X users out of echo chambers using LLM-powered vectors to analyze political bias and logical fallacies.',
    technologies: ['React 19', 'Tailwind CSS', 'Chrome Extension MV3', 'Vite', 'LLMs'],
    images: ['/projects/ragebaiter.jpg'],
    demoLink: null,
    repoLink: null,
    featured: true,
    isExperiment: false,
    details: {
      overview:
        'RageBaiter passively monitors tweets, analyzes political bias and logical fallacies with LLM-powered vectors, compares them against each user\'s political compass, and surfaces Socratic interventions when bias-confirming content is detected.',
      features: [
        {
          title: 'Real-time Tweet Analysis',
          description: 'Intercepts and analyzes tweets in the DOM.',
        },
        {
          title: 'Political Compass Mapping',
          description: 'Compares content against user\'s baseline.',
        },
        {
          title: 'Socratic Interventions',
          description: 'Injects UI elements to prompt critical thinking.',
        },
      ],
    },
  },
  {
    id: 'securewebsuite',
    title: 'Secure File Transfer Platform',
    description:
      'A backend platform demonstrating authenticated file management and reliable UDP data transfer.',
    technologies: ['Node.js', 'Express', 'JWT', 'UDP', 'Stop-and-Wait Protocol'],
    images: ['/projects/securewebsuite.jpg'],
    demoLink: null,
    repoLink: null,
    featured: true,
    isExperiment: false,
    details: {
      overview:
        'Two independent components: A REST API for JWT-authenticated file upload, listing, and download, and a UDP Transfer Demo implementing a stop-and-wait protocol with checksums, ACKs, and bounded retries.',
      features: [
        {
          title: 'Authenticated REST API',
          description: 'Secure file management.',
        },
        {
          title: 'Custom UDP Protocol',
          description: 'Reliable data transfer over UDP.',
        },
      ],
    },
  },
  {
    id: 'onepiecedle',
    title: 'OnePiecedle',
    description:
      'A Wordle-like guessing game featuring One Piece characters. Guess the mystery character in 6 tries using attribute clues!',
    technologies: ['React', 'TypeScript', 'Tailwind CSS'],
    images: ['/projects/onepiecedle.jpg'],
    demoLink: null,
    repoLink: null,
    featured: true,
    isExperiment: false,
    details: {
      overview:
        'A daily and infinite mode guessing game with smart autocomplete and visual feedback for character attributes.',
      features: [
        {
          title: 'Daily & Infinite Modes',
          description: 'Play once a day or practice endlessly.',
        },
        {
          title: 'Smart Autocomplete',
          description: 'Search by character name or alias.',
        },
        {
          title: 'Visual Feedback',
          description: 'Color-coded clues with arrow indicators.',
        },
      ],
    },
  },
];
