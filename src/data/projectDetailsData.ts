export const projectDetails: Record<
  string,
  {
    overview: string;
    features?: Array<{ title: string; description: string }>;
    conclusion?: string;
  }
> = {
  ragebaiter: {
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
  securewebsuite: {
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
  onepiecedle: {
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
};
