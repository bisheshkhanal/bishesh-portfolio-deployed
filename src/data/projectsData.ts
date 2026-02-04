const projects = [
  {
    id: "indie-bunny",
    title: "Indie Bunny Marketplace",
    description:
      "Full-stack game marketplace built with Django, React, and PostgreSQL. Supports tipping, mystery redemptions, user authentication, and game approval.",
    technologies: ["React", "Django", "PostgreSQL", "Firebase", "Supabase", "Render", "Vercel"],
    images: [],
    demoLink: "https://indie-bunny-marketplace.vercel.app/home",
    repoLink: "https://github.com/bisheshkhanal/Indie-Bunny-Marketplace", 
  },
  {
    id: "quiplash-chat-game",
    title: "Quiplash-inspired Chat Game",
    description:
      "Real-time multiplayer text game using FastAPI containers and React frontend, with custom master clock and proxy servers for distributed consistency.",
    technologies: ["FastAPI", "React", "Docker", "Distributed Systems Principles"],
    images: [],
    demoLink: null,
    repoLink: "https://github.com/bisheshkhanal/Distributed-Chat-Game", 
  },
  {
    id: "zenmate-app",
    title: "ZenMate Meditation App [WIP]",
    description:
      "Meditation tracking mobile app built with React Native and Django. Includes Supabase PostgreSQL, Firebase Auth, and an AWS-hosted AI chatbot using phi-2.",
    technologies: ["React Native", "Expo", "Django", "PostgreSQL", "Supabase", "AWS", "phi-2"],
    images: [], 
    demoLink: null, 
    repoLink: null, 
  },
  {
    id: "securewebsuite",
    title: "SecureWebSuite",
    description:
      "Java HTTP/HTTPS server and client with SHA256 handshake auth and multithreaded design. Includes Stop-and-Wait UDP file transfer module.",
    technologies: ["Java", "Multithreading", "TLS", "Networking", "SHA256"],
    images: [], 
    demoLink: null,
    repoLink: "https://github.com/bisheshkhanal/SecureWebSuite", 
  },
  {
    id: "flappy-bird-clone",
    title: "Mock Flappy Bird Game",
    description:
      "Web clone of Flappy Bird with HTML, CSS, and JavaScript. Developed frontend structure and game logic for an interactive gameplay experience.",
    technologies: ["HTML", "CSS", "JavaScript"],
    images: [],
    demoLink: `${import.meta.env.BASE_URL}flappy/flappy.html`, 
    repoLink: "https://github.com/pranabmainali/Flappy_Bird_Game"
  },
  {
  id: "portfolio-website",
  title: "Personal Portfolio Website",
  description:
    "You're on it! Responsive React portfolio deployed on Vercel, featuring animated navigation, skill badges, and interactive project cards.",
  technologies: ["React", "CSS", "Vercel"],
  images: [], 
  demoLink: "https://bishesh-portfolio.vercel.app/", 
  repoLink: "https://github.com/bisheshkhanal/bishesh-portfolio"
  },
  
];

export default projects;
