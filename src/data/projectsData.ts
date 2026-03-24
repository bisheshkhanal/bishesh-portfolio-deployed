const projects: Array<{
  id: string;
  title: string;
  description: string;
  technologies: string[];
  images: string[];
  demoLink: string | null;
  repoLink: string | null;
}> = [
  {
    id: 'ragebaiter',
    title: 'RageBaiter',
    description:
      'A Manifest V3 Chrome extension built to nudge Twitter/X users out of echo chambers using LLM-powered vectors to analyze political bias and logical fallacies.',
    technologies: ['React 19', 'Tailwind CSS', 'Chrome Extension MV3', 'Vite', 'LLMs'],
    images: ['/projects/ragebaiter.jpg'],
    demoLink: null,
    repoLink: null,
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
  },
];

export default projects;
