export type ChapterId =
  | 'arrival'
  | 'academy'
  | 'spellbook'
  | 'quests'
  | 'alchemy'
  | 'owlpost'
  | 'achievement';

export type SkillMetaphorIcon =
  | 'runes'
  | 'orb'
  | 'portal'
  | 'artifact'
  | 'puzzle'
  | 'scroll'
  | 'engine'
  | 'compass';

export type QuestEnvironment =
  | 'forest-quest'
  | 'castle-workshop'
  | 'mountain-observatory';

export type AlchemyVessel = 'potion' | 'machine' | 'crystal' | 'scroll';

export interface SkillArtifact {
  id: string;
  name: string;
  metaphor: string;
  icon: SkillMetaphorIcon;
  description: string;
  arcaneNote: string;
}

export type ProjectStatus =
  | 'IN DEVELOPMENT'
  | 'COMING SOON'
  | 'SOURCE AVAILABLE'
  | 'LIVE';

export interface QuestProject {
  id: string;
  questCode: string;
  environmentLabel: string;
  environment: QuestEnvironment;
  status: ProjectStatus | string;
  title: string;
  description: string;
  problemSolved: string;
  technologies: string[];
  contribution: string;
  liveUrl?: string | null;
  githubUrl?: string | null;
}

export interface AlchemyExperiment {
  id: string;
  title: string;
  vessel: AlchemyVessel;
  summary: string;
  outcome: string;
  tags: string[];
}

export interface RealmLandmark {
  id: ChapterId;
  shortLabel: string;
  title: string;
  x: number; // percentage 10..90 on the interactive realm map
  y: number; // percentage 15..85 on the interactive realm map
  prompt: string;
}

/* ============================================================================
   CENTRALIZED PORTFOLIO CONTENT — RATNODEEP: THE LOST REALM
   Edit any text, biography, skills, quests, experiments, dialogue, or links.
   ============================================================================ */

export const CONTENT = {
  meta: {
    realmName: 'THE LOST REALM',
    playerName: 'RATNODEEP',
    roleLine: 'Student. Engineer. Builder.',
    greetingSpeech: 'Welcome, traveler. A new world awaits.',
  },

  arrival: {
    headline: 'Welcome to the Lost Realm.',
    subline: 'Your journey begins here.',
    storyButton: 'Start Adventure',
    quickButton: 'Quick Portfolio',
    howToPlayButton: 'How to Play',
    introBannerText:
      'Beyond the moss-covered gates lies an engineering world shaped by curiosity, code, and craft.',
  },

  tutorial: {
    title: 'TRAVELER GUIDE',
    steps: [
      'Tap landmarks on the map or use Arrow Keys / D-Pad to walk around the realm.',
      'Use the Game Menu (BIO, SKILLS, PROJECTS, STORY, CONTACT) to jump anywhere.',
      'Open the Spellbook to discover and collect magical skill artifacts.',
      'Inspect Quest Rooms to read project details, tech stacks, and code links.',
      'Visit the Achievement Shrine at the end to claim your Player Card.',
    ],
    continueLabel: 'Continue',
    skipLabel: 'Skip Tutorial',
  },

  academy: {
    chapterTitle: 'Chapter 2 · The Academy',
    characterClass: 'Arcane Systems Builder',
    levelLabel: 'LVL 03',
    bio: 'I am Ratnodeep, an engineering student who treats every software challenge like an uncharted region on a map. I love building responsive web experiences, clean developer tools, and fast interactive systems.',
    interests: [
      'Full-Stack Web Engineering',
      'Human-Centered UI & Retro Craft',
      'Applied AI & Developer Tooling',
      'Algorithms & Interactive Simulations',
    ],
    journey:
      'Started by sketching small browser experiments and learning how systems work under the hood. Today I focus on bridging thoughtful design with reliable engineering — shipping projects that feel clear, tactile, and genuinely useful.',
    attributes: [
      { label: 'Focus', value: 'Full-Stack & UI' },
      { label: 'Craft', value: 'Clean Architecture' },
      { label: 'Mode', value: 'Always Learning' },
    ],
  },

  spellbook: {
    chapterTitle: 'Chapter 3 · The Spellbook',
    subtitle:
      'My engineering skills encoded as arcane artifacts. Inspect any tome anytime, or collect them to level up your journey.',
    skills: [
      {
        id: 'programming-runes',
        name: 'TypeScript & JavaScript',
        metaphor: 'Enchanted Runes',
        icon: 'runes',
        description:
          'Strongly typed application logic, modular components, and predictable browser state.',
        arcaneNote: 'Rune Lore: Type safety catches half the realm’s bugs before runtime.',
      },
      {
        id: 'web-portal',
        name: 'React & Frontend Craft',
        metaphor: 'Enchanted Portal',
        icon: 'portal',
        description:
          'Accessible, mobile-first interfaces built with React, semantic HTML, and modern CSS.',
        arcaneNote: 'Portal Lore: Smooth 60fps transitions keep travelers immersed.',
      },
      {
        id: 'ai-orb',
        name: 'AI & Machine Learning',
        metaphor: 'Crystal Orb',
        icon: 'orb',
        description:
          'Prompt engineering, structured inference workflows, and intelligent user-facing features.',
        arcaneNote: 'Orb Lore: Clarity comes from pairing model capability with crisp UX.',
      },
      {
        id: 'engineering-artifact',
        name: 'Node.js & API Systems',
        metaphor: 'Mechanical Artifact',
        icon: 'artifact',
        description:
          'RESTful backends, data validation, webhook tooling, and clean service boundaries.',
        arcaneNote: 'Artifact Lore: Simple interfaces scale further than clever hacks.',
      },
      {
        id: 'problem-puzzle',
        name: 'Algorithms & Problem Solving',
        metaphor: 'Ancient Puzzle',
        icon: 'puzzle',
        description:
          'Graph traversal, time-complexity awareness, debugging, and breaking down hard problems.',
        arcaneNote: 'Puzzle Lore: Draw the state space before writing the first line.',
      },
      {
        id: 'python-scroll',
        name: 'Python & Automation',
        metaphor: 'Alchemist Scroll',
        icon: 'scroll',
        description:
          'Rapid prototyping, data processing scripts, and clean backend utilities.',
        arcaneNote: 'Scroll Lore: Automate repetitive tasks to save energy for design.',
      },
      {
        id: 'tailwind-compass',
        name: 'Responsive UI & CSS',
        metaphor: 'Wayfinder Compass',
        icon: 'compass',
        description:
          'Mobile-first layouts, design tokens, accessible contrast, and pixel-sharp spacing.',
        arcaneNote: 'Compass Lore: Test at 360px first; desktop always benefits.',
      },
      {
        id: 'git-engine',
        name: 'Git & Shipping Workflow',
        metaphor: 'Clockwork Engine',
        icon: 'engine',
        description:
          'Version control, clean commits, build pipelines, and reliable static deployments.',
        arcaneNote: 'Engine Lore: Small, verifiable iterations ship faster.',
      },
    ] satisfies SkillArtifact[],
  },

  quests: {
    chapterTitle: 'Chapter 4 · The Quest Rooms',
    subtitle:
      'Three engineering quests across the realm. Set liveUrl or githubUrl only when a real deployment or public repository is live; otherwise cards safely display their development status.',
    items: [
      {
        id: 'quest-forest',
        questCode: 'QUEST 01',
        environmentLabel: 'Forest Quest',
        environment: 'forest-quest',
        status: 'IN DEVELOPMENT',
        title: 'Canopy Study & Habit Compass',
        description:
          'A calm, mobile-first daily sprint and habit companion designed for students juggling coursework and side projects.',
        problemSolved:
          'Eliminates bloated dashboard fatigue by turning daily focus blocks into a clear, low-friction trail with instant local responsiveness.',
        technologies: ['React', 'TypeScript', 'Tailwind CSS', 'Web APIs'],
        contribution:
          'Designed the mobile-first UX, built the state engine and accessible keyboard shortcuts, and crafted custom SVG iconography.',
        liveUrl: null,
        githubUrl: null,
      },
      {
        id: 'quest-workshop',
        questCode: 'QUEST 02',
        environmentLabel: 'Castle Workshop',
        environment: 'castle-workshop',
        status: 'IN DEVELOPMENT',
        title: 'Forge Payload & API Inspector',
        description:
          'A lightweight developer workbench for capturing, inspecting, and replaying JSON webhook payloads during fast hackathon builds.',
        problemSolved:
          'Cuts API integration debugging time by formatting nested payloads clearly, highlighting status timings, and exporting one-click curl tests.',
        technologies: ['Node.js', 'TypeScript', 'Python', 'REST'],
        contribution:
          'Architected the request parser, built the interactive diff/timing viewer, and implemented safe client-side snippet export.',
        liveUrl: null,
        githubUrl: null,
      },
      {
        id: 'quest-observatory',
        questCode: 'QUEST 03',
        environmentLabel: 'Mountain Observatory',
        environment: 'mountain-observatory',
        status: 'COMING SOON',
        title: 'Starlight Pathfinding Sandbox',
        description:
          'An interactive browser grid lab that lets learners draw terrain walls and compare graph search algorithms step by step.',
        problemSolved:
          'Makes abstract pathfinding heuristics tangible by visualizing open/closed frontier nodes, path cost, and step-by-step execution speed.',
        technologies: ['TypeScript', 'HTML5 Canvas', 'Algorithms', 'CSS'],
        contribution:
          'Implemented A*, Dijkstra, and BFS visualizers, touch-friendly grid painting, and frame-rate-independent playback controls.',
        liveUrl: null,
        githubUrl: null,
      },
    ] as QuestProject[],
  },

  alchemy: {
    enabled: true, // Set to false to hide the Alchemy Laboratory cleanly
    chapterTitle: 'Chapter 5 · The Alchemy Laboratory',
    subtitle:
      'Technical prototypes, UI experiments, and weekend engineering curiosities simmering in the lab.',
    experiments: [
      {
        id: 'exp-potion',
        title: 'Zero-Dependency Pixel Sprite Renderer',
        vessel: 'potion',
        summary:
          'Tested crisp integer-scaled SVG sprite matrices that stay razor-sharp on retina phones at < 2 KB.',
        outcome: 'Powers the animated traveler character and artifact icons in this realm.',
        tags: ['SVG', 'Pixel Art', 'Performance'],
      },
      {
        id: 'exp-machine',
        title: 'Adaptive Touch D-Pad Controller',
        vessel: 'machine',
        summary:
          'Prototyped hybrid pointer + keyboard movement with boundary clamping and zero layout shift on mobile.',
        outcome: 'Enables smooth thumb-zone exploration alongside arrow/WASD navigation.',
        tags: ['Touch UX', 'Accessibility', 'Input'],
      },
      {
        id: 'exp-crystal',
        title: 'Deterministic Quest State Engine',
        vessel: 'crystal',
        summary:
          'Built a lightweight Set-backed progress tracker with duplicate prevention and instant mode switching.',
        outcome: 'Keeps Story Mode and Quick Portfolio synchronized with zero backend cost.',
        tags: ['TypeScript', 'State', 'Architecture'],
      },
      {
        id: 'exp-scroll',
        title: 'Parchment Contrast & Type Scale Study',
        vessel: 'scroll',
        summary:
          'Balanced 8-bit display headings with >=16px humanist sans prose for high readability outdoors.',
        outcome: 'Delivers retro charm without sacrificing recruiter scannability.',
        tags: ['Typography', 'WCAG AA', 'Design'],
      },
    ] satisfies AlchemyExperiment[],
  },

  owlPost: {
    chapterTitle: 'Chapter 6 · Owl Post',
    subtitle:
      'Dispatch an enchanted letter across the realm. Always open for collaborations, internships, and engineering conversations.',
    email: 'bhattacharjeeratnodeep@gmail.com',
    githubUrl: 'https://github.com/bhattacharjeeratnodeep-cloud',
    messengerNote: 'Seal broken · Direct mail & code guild links ready.',
  },

  achievement: {
    chapterTitle: 'Final Chapter · The Achievement',
    signOff:
      'Every great system starts with one curious step. Thank you for exploring The Lost Realm.',
    shareLabel: 'Share Card',
    replayLabel: 'Replay Adventure',
    titles: {
      novice: 'Novice Explorer',
      apprentice: 'Apprentice Builder',
      discoverer: 'Realm Discoverer',
      master: 'Master Engineer',
    },
  },

  landmarks: [
    {
      id: 'arrival',
      shortLabel: 'GATE',
      title: 'Realm Gate',
      x: 18,
      y: 74,
      prompt: 'The mossy stone archway where your journey begins.',
    },
    {
      id: 'academy',
      shortLabel: 'BIO',
      title: 'The Academy',
      x: 34,
      y: 34,
      prompt: 'Meet Ratnodeep inside the ancient Academy tower.',
    },
    {
      id: 'spellbook',
      shortLabel: 'SKILLS',
      title: 'Spellbook Shrine',
      x: 66,
      y: 28,
      prompt: 'Collect 8 enchanted skill artifacts in the library.',
    },
    {
      id: 'quests',
      shortLabel: 'PROJECTS',
      title: 'Quest Rooms',
      x: 50,
      y: 54,
      prompt: 'Enter the Forest, Castle Workshop, and Observatory quests.',
    },
    {
      id: 'alchemy',
      shortLabel: 'LAB',
      title: 'Alchemy Lab',
      x: 80,
      y: 56,
      prompt: 'Inspect simmering engineering prototypes and experiments.',
    },
    {
      id: 'owlpost',
      shortLabel: 'CONTACT',
      title: 'Owl Post',
      x: 24,
      y: 52,
      prompt: 'Dispatch an enchanted letter via Email or visit GitHub.',
    },
    {
      id: 'achievement',
      shortLabel: 'CARD',
      title: 'Player Card',
      x: 74,
      y: 78,
      prompt: 'Claim your Player Title and review realm progress.',
    },
  ] satisfies RealmLandmark[],
};
