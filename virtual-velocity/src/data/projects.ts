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
    title: 'FinchOS',
    summary:
      'Building a custom x86-64 operating system from scratch in C and assembly, working toward a fully functioning OS with a graphical user interface. Implemented bootloader integration, a custom GDT, a full IDT with exception handling, PIC/PIT-driven interrupt handling, a keyboard driver, memory management, and a preemptive round-robin scheduler with context switching.',
    tags: ['C', 'x86-64', 'Assembly', 'OS Dev'],
    githubUrl: 'https://github.com/alicmerjem/FinchOS',
    status: 'ongoing',
  },
  {
    title: 'QEMU MCP',
    summary:
      'C/C++ Model Context Protocol server for live kernel debugging in QEMU, built to inspect FinchOS. Speaks the GDB remote serial protocol directly over sockets, exposing tools for register/memory inspection, breakpoints, and step execution.',
    tags: ['C++', 'MCP', 'QEMU', 'GDB'],
    githubUrl: 'https://github.com/alicmerjem/qemu-mcp',
    status: 'ongoing',
  },
  {
    title: 'Academiq',
    summary:
      'Native Android application that centralizes course management, assignment tracking, and study scheduling using MVVM architecture with a modular multi-screen UI and scalable structure for future RoomDB and Firebase integration.',
    tags: ['Kotlin', 'Jetpack Compose', 'Android', 'MVVM'],
    githubUrl: 'https://github.com/alicmerjem/Academiq',
  },
  {
    title: 'Car Dealership Platform',
    summary:
      'Full-stack single-page platform simulating a modern dealership with a three-tier architecture, RESTful APIs, JWT authentication, full CRUD operations, a PDO-based DAO data layer, and production deployment on DigitalOcean.',
    tags: ['JavaScript', 'PHP', 'FlightPHP', 'MySQL', 'DigitalOcean'],
    githubUrl: 'https://github.com/alicmerjem/Ferrari-Automotive-Group',
  },
  {
    title: 'Vibe Guard',
    summary:
      'Asynchronous Reddit moderation platform integrating the OpenAI Moderation API for real-time toxicity detection. Uses a Redis-backed state machine to track user behavior history and apply tiered enforcement policies.',
    tags: ['TypeScript', 'Hono', 'OpenAI API', 'Redis', 'Devvit'],
    githubUrl: 'https://github.com/merjem-alic/vibe-guard',
    status: 'ongoing',
  },
];
