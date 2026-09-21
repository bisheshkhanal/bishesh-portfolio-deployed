export type ProjectFeature = { title: string; description: string };
export type ProjectDetails = { overview: string; features?: ProjectFeature[] };
export type Project = {
  id: string; title: string; description: string;
  technologies: string[]; images: string[];
  demoLink: string | null; repoLink: string | null;
  featured: boolean; isExperiment: boolean;
  status: 'live' | 'in-progress';
  details?: ProjectDetails;
};

export const projects: Project[] = [
  {
    id: 'ragebaiter',
    title: 'RageBaiter',
    description:
      'A Manifest V3 Chrome extension that scores tweets for political bias and logical fallacies using LLM-powered vectors. It nudges you out of echo chambers. Still in progress.',
    technologies: ['React 19', 'Tailwind CSS', 'Chrome Extension MV3', 'Vite', 'LLMs'],
    images: ['/projects/ragebaiter.jpg'],
    demoLink: null,
    repoLink: 'https://github.com/bisheshkhanal/RageBaiter',
    featured: true,
    isExperiment: false,
    status: 'in-progress',
    details: {
      overview:
        'RageBaiter watches your feed without you doing anything. It scores each tweet for political bias and logical fallacies, then compares it against your political compass. When the content just confirms what you already believe, it adds a Socratic prompt to the page.',
      features: [
        {
          title: 'Real-time Tweet Analysis',
          description: 'Reads tweets from the DOM as they load.',
        },
        {
          title: 'Political Compass Mapping',
          description: 'Compares each tweet against your political compass baseline.',
        },
        {
          title: 'Socratic Interventions',
          description: 'Adds a prompt to the page that asks you to reconsider.',
        },
      ],
    },
  },
  {
    id: 'securewebsuite',
    title: 'Secure File Transfer Platform',
    description:
      'A backend project with JWT-authenticated file management. It also has a custom UDP protocol that makes transfers reliable.',
    technologies: ['Node.js', 'Express', 'JWT', 'UDP', 'Stop-and-Wait Protocol'],
    images: ['/projects/securewebsuite.jpg'],
    demoLink: null,
    repoLink: 'https://github.com/bisheshkhanal/SecureWebSuite',
    featured: true,
    isExperiment: false,
    status: 'in-progress',
    details: {
      overview:
        'Two independent components. One is a REST API that handles JWT-authenticated file upload, listing, and download. The other is a UDP Transfer Demo running a stop-and-wait protocol with checksums, ACKs, and bounded retries.',
      features: [
        {
          title: 'Authenticated REST API',
          description: 'JWT-authenticated upload, listing, and download endpoints.',
        },
        {
          title: 'Custom UDP Protocol',
          description: 'Stop-and-wait protocol with checksums, ACKs, and bounded retries.',
        },
      ],
    },
  },
  {
    id: 'onepiecedle',
    title: 'OnePiecedle',
    description:
      'A Wordle-style game where you guess a One Piece character. Six tries, attribute clues.',
    technologies: ['React', 'TypeScript', 'Tailwind CSS'],
    images: ['/projects/onepiecedle.jpg'],
    demoLink: 'https://onepiecedle-nine.vercel.app',
    repoLink: 'https://github.com/bisheshkhanal/opdle',
    featured: true,
    isExperiment: false,
    status: 'live',
    details: {
      overview:
        'Two modes: a daily puzzle and an infinite one. Autocomplete searches by name or alias, and attribute clues show up as color-coded arrows.',
      features: [
        {
          title: 'Daily & Infinite Modes',
          description: 'Play once a day, or keep going in infinite mode.',
        },
        {
          title: 'Name Autocomplete',
          description: 'Search by character name or alias.',
        },
        {
          title: 'Attribute Clues',
          description: 'Color-coded clues with arrow indicators.',
        },
      ],
    },
  },
  {
    id: 'betterimpostor',
    title: 'BetterImpostor',
    description:
      'A free, offline word deduction party game built in Flutter. Everyone gets a secret word except the impostor. Describe yours, talk it over, and vote someone out before time runs out.',
    technologies: ['Flutter', 'Dart', 'Riverpod', 'GoRouter'],
    images: [],
    demoLink: null,
    repoLink: 'https://github.com/bisheshkhanal/better-imposter',
    featured: true,
    isExperiment: false,
    status: 'in-progress',
    details: {
      overview:
        'Runs on iOS, Android, and web with 25 bundled word categories. Fully offline. No backend, no accounts, and nothing gets tracked.',
    },
  },
];
