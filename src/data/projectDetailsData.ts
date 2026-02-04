export const projectDetails = {
  "indie-bunny": {
    overview: "Indie Bunny is a full-stack game marketplace designed to uplift indie game developers through a unique tipping and mystery reward system. Players can support developers directly, browse listings with region-adjusted pricing, and receive surprise games from the Mystery Pool.",
    features: [
      {
        title: "Tipping System",
        description: "Players tip developers and get access to a mystery pool of games."
      },
      {
        title: "Three Roles",
        description: "Players, Developers (auto-upgrade after approval), and Admins."
      },
      {
        title: "Dynamic Listings",
        description: "Includes regular and temporary game promotions with time windows."
      },
      {
        title: "Secure Auth",
        description: "Firebase-managed login tied to role-specific views and Django logic."
      },
      {
        title: "Database",
        description: "Supabase-hosted PostgreSQL with full normalization, including wishlists, purchases, and tips."
      }
    ],
    conclusion: "The project combines cloud deployment (Render, Vercel, Supabase), a Django API, and a React interface to create a developer-first, player-friendly indie ecosystem. It showcases scalable full-stack architecture, thoughtful data modeling, and real-world marketplace logic."
  },
  "quiplash-chat-game": {
    overview: "The Chat Game was built from scratch using core distributed systems principles: fault tolerance, replication, and decentralized coordination. It features a custom architecture with multiple servers, proxies, and browser clients. Proxies perform health checks and load balancing. Clients store local game state and serve as active recovery agents.",
    features: [
      {
        title: "Client-Server Sync",
        description: "Each client polls the server every second to sync game state, achieving near-real-time consistency using a client-server model."
      },
      {
        title: "Fault Recovery",
        description: "Leader clients (hosts) control transitions, but the system self-recovers from crashes by reassigning server roles and syncing from the most recent state."
      },
      {
        title: "Proxy Architecture",
        description: "Proxies store active game snapshots and reroute clients when necessary."
      }
    ],
    conclusion: "All recovery and transitions are handled gracefully using heartbeat protocols, replicated game state, and leader timeouts. The result is a multiplayer system resilient to network failures, with decentralized redundancy built-in."
  },
  "securewebsuite": {
    overview: "SecureWebSuite is a Java-based secure networking application that provides both HTTP and reliable UDP-based file transfer services. It features a multithreaded server capable of handling concurrent clients and authenticates all users using SHA-256 hashing.",
    features: [
      {
        title: "Authenticator",
        description: "Validates user credentials using SHA-256 digests."
      },
      {
        title: "HttpServer & Client",
        description: "Classic socket-based HTTP server with multithreaded request handling."
      },
      {
        title: "Stop-and-Wait File Transfer",
        description: "Custom UDP protocol to ensure packet reliability for larger files."
      },
      {
        title: "FileDownloader & FileUtils",
        description: "Modular utilities for secure download and file management operations."
      }
    ],
    conclusion: "This suite demonstrates secure socket programming, custom protocol design, and fault-tolerant networking behavior — making it a robust model for building low-level secure communications."
  },
  "flappy-bird-clone": {
    overview: "This Flappy Bird remake is a pure HTML/CSS/JavaScript browser game built from scratch without any frameworks. It features smooth gravity simulation, randomized obstacles, collision detection, and responsive jump controls.",
    features: [
      {
        title: "Gravity & Jump",
        description: "Object falls naturally and jumps on click using `setInterval`-based physics."
      },
      {
        title: "Obstacle Logic",
        description: "Pipes and gaps animate from right to left, with gap position randomized every cycle."
      },
      {
        title: "Collision Detection",
        description: "JS checks if the object hits a pipe or falls off-screen and triggers a reset."
      },
      {
        title: "Sound Feedback",
        description: "Howler.js provides distinct sound cues for success and game over."
      }
    ],
    conclusion: "Despite being a small project, it demonstrates a great blend of animation, input handling, and simple physics — making it a fun and clean coding experiment."
  },
  "portfolio-website": {
    overview: "This personal website showcases my technical projects, skills, and professional background. Built with React and custom CSS, it features animated navigation, interactive project cards, and responsive design optimized for desktop and mobile devices.",
    features: [
      {
        title: "Stack",
        description: "React, CSS, Vercel"
      },
      {
        title: "Highlights",
        description: "Custom animations, dynamic project sections, skill badges, and contact integration"
      },
      {
        title: "Deployment",
        description: "Deployed on Vercel."
      }
    ],
    conclusion: "The site is regularly updated with new projects and improvements as I continue to learn and grow as a developer."
  }
};
