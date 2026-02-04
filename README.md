# Bishesh Khanal Portfolio

A personal portfolio website featuring an interactive 3D DNA helix that serves as both a visual signature and navigation system.

## Tech Stack

- **React 19** - UI framework
- **Vite** - Build tool and dev server
- **TypeScript** - Type safety
- **Three.js** (@react-three/fiber) - 3D DNA helix rendering
- **Framer Motion** - Smooth scroll animations
- **Tailwind CSS** - Utility-first styling
- **Playwright** - End-to-end testing

## Features

- Interactive 3D DNA helix navigation with scroll tracking
- Single-page immersive scroll experience
- Expandable project cards with tech stack tags
- Fully responsive design (desktop and mobile)
- End-to-end tested with Playwright
- Clean, minimal aesthetic with focus on the DNA signature element

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run unit tests
npm test

# Run E2E tests (requires Playwright browsers)
npm run test:e2e

# Install Playwright browsers (first time only)
npm run e2e:install
```

## Project Structure

```
src/
├── app/
│   ├── App.tsx          # Main app component
│   └── app.css          # App styles
├── components/
│   ├── DNAHelix/        # DNA helix (Three.js)
│   ├── Hero.tsx         # Hero section
│   ├── Projects.tsx     # Projects grid
│   ├── Skills.tsx       # Skills grid
│   └── Contact.tsx      # Contact footer
├── data/                # Static content (TypeScript)
│   ├── bioData.ts
│   ├── projectsData.ts
│   ├── projectDetailsData.ts
│   ├── skillsData.ts
│   └── socialData.ts
├── hooks/               # Custom React hooks
│   ├── useActiveSection.ts
│   └── usePrefersReducedMotion.ts
├── layouts/
│   └── MainLayout.tsx   # Layout wrapper
└── main.tsx             # Entry point

test/
├── smoke.test.js        # Smoke tests
e2e/
├── dna-helix.spec.ts    # DNA helix interaction tests
```

## License

MIT License - feel free to use this project as a reference for your own portfolio.
