export interface Project {
  title: string;
  summary: string;
  tags: string[];
  githubUrl?: string;
  caseStudyUrl?: string;
  status?: 'ongoing';
}

export const projects: Project[] = [
  {
    title: 'Academiq',
    summary:
      'Native Android application that centralizes course management, assignment tracking, and study scheduling using MVVM architecture with a modular multi-screen UI and scalable structure for future RoomDB and Firebase integration.',
    tags: ['Kotlin', 'Jetpack Compose', 'Android', 'MVVM'],
    githubUrl: 'https://github.com/merjem-alic',
  },
  {
    title: 'Car Dealership Platform',
    summary:
      'Full-stack single-page platform simulating a modern dealership with a three-tier architecture, RESTful APIs, JWT authentication, full CRUD operations, a PDO-based DAO data layer, and production deployment on DigitalOcean.',
    tags: ['JavaScript', 'PHP', 'FlightPHP', 'MySQL', 'DigitalOcean'],
    githubUrl: 'https://github.com/merjem-alic',
  },
  {
    title: 'Synapse',
    summary:
      'Python-based Discord bot with interactive commands, community automation, polls, uptime tracking, and external quote data pipelines. Features hot-reload development tooling and secure environment configuration.',
    tags: ['Python', 'Discord API'],
    githubUrl: 'https://github.com/merjem-alic',
  },
  {
    title: 'Vibe Guard',
    summary:
      'Asynchronous Reddit moderation platform integrating the OpenAI Moderation API for real-time toxicity detection. Uses a Redis-backed state machine to track user behavior history and apply tiered enforcement policies.',
    tags: ['TypeScript', 'Hono', 'OpenAI API', 'Redis', 'Devvit'],
    githubUrl: 'https://github.com/merjem-alic',
    status: 'ongoing',
  },
  {
    title: 'Atlas Trader',
    summary:
      'Prototype trading system focused on backtesting and simulation of stock market strategies. Validates trading logic against historical data with emphasis on correctness, deterministic behavior, and edge-case handling in financial inputs.',
    tags: ['Backtesting', 'Simulation', 'Finance'],
    githubUrl: 'https://github.com/merjem-alic',
    status: 'ongoing',
  },
];
