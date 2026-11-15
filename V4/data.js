// ALL portfolio content lives here. Every screen (Overview, Projects,
// Experience, About), the hotbar and the Quick CV scroll render from these
// arrays, so a new job / project / skill is one entry here, never an edit
// in several places.
//
// Art, gifs and the 3D model are shared with V3 (not copied) — see ASSET.

export const ASSET = '../V3/';

export const PROFILE = {
  name: 'Shon Saadon',
  title: 'Backend + UE5 Developer',
  location: 'Israel',
  email: 'SaadonShon@gmail.com',
  // Set to a PDF path/URL (e.g. 'Shon-Saadon-CV.pdf') to add a "Download CV" button.
  // Empty = the Quick CV still offers "Save as PDF" (browser print).
  cvUrl: '',
};

// Hotbar slots, left to right; key = keyboard shortcut. A link with an empty
// href is skipped. 'cv' is special: opens the Quick CV scroll.
export const LINKS = [
  { key: '1', id: 'cv', icon: '📜', label: 'Quick CV' },
  { key: '2', id: 'email', icon: '✉️', label: 'Email', href: 'mailto:SaadonShon@gmail.com' },
  { key: '3', id: 'linkedin', icon: '💼', label: 'LinkedIn', href: 'https://www.linkedin.com/in/shon-saadon-a71077217/' },
  { key: '4', id: 'github', icon: '🐙', label: 'GitHub', href: 'https://github.com/Ss12Dark' },
  { key: '5', id: 'youtube', icon: '▶️', label: 'Videos', href: 'https://www.youtube.com/channel/UC5xQic2_Pf9E9gQMgsCfifQ' },
];

// "Equipment" on the Overview + "Skills" in the Quick CV. Real keywords,
// grouped; recruiters scan for these.
export const STACK = [
  { group: 'Backend', items: ['PHP', 'SQL', 'Couchbase', 'REST endpoints'] },
  { group: 'Games', items: ['Unreal Engine 5', 'C++', 'Multiplayer', 'Level design'] },
  { group: 'Web', items: ['JavaScript', 'React', 'HTML / CSS'] },
  { group: 'AI', items: ['Claude Code', 'MCP & Skills', 'AI workflows'] },
];

export const VITALS = [
  { label: 'Level', value: '5', caption: 'Years of Experience', color: 'green' },
  { label: 'Health', value: '29', caption: 'Years of Age', color: 'red' },
  { label: 'Mana', value: '∞', caption: 'Always learning. Always building.', color: 'blue' },
];

export const SPECIALIZATIONS = ['UE 5', 'Backend', 'Level Design', 'AI Knowledge', 'MCP & Skills'];

// About tab: shown with their description inline (no hover needed).
export const STATS = [
  { icon: '⚔', name: 'Engineering', grade: 'S', desc: 'Turns problems into working systems, from backend architecture to gameplay mechanics.' },
  { icon: '⚔', name: 'Game Development', grade: 'A', desc: '4+ years of building games with Unreal Engine, from quick prototypes to multiplayer systems.' },
  { icon: '🧠', name: 'Problem Solving', grade: 'S', desc: 'Enjoys digging into difficult bugs, understanding how things actually work, and finding a way forward.' },
  { icon: '✨', name: 'Creativity', grade: 'A+', desc: 'Likes experimenting, building unusual mechanics, and turning ideas into playable experiences.' },
  { icon: '🤖', name: 'AI & Automation', grade: 'A+', desc: 'Uses AI as a development partner with Claude Code, MCP, custom tools, and AI-assisted workflows.' },
  { icon: '🤝', name: 'Teamwork', grade: 'S', desc: 'Comfortable working with programmers, artists, designers, and figuring things out together.' },
];

// Work history, NEWEST FIRST (that is the display order everywhere).
// current: the "Current Quest" (Overview) and the "You are here" map marker.
// side: listed after the main jobs as a side quest.
// map: marker position as % of the Experience map image (aligned to map.png's path nodes).
export const JOBS = [
  {
    id: 'sciplay',
    company: 'Sciplay',
    role: 'Backend Engineer',
    start: '09/2024',
    end: 'Present',
    current: true,
    desc: 'Creating features & game logic, endpoints, tools, and handling SQL / Couchbase documents.',
    map: { x: 76.5, y: 31.6 },
  },
  {
    id: 'bylith',
    company: 'Bylith',
    role: 'Backend Developer',
    start: '02/2022',
    end: '09/2024',
    desc: 'PHP backend developer. Handled databases, server logic, and application integration.',
    map: { x: 61.9, y: 39.6 },
  },
  {
    id: 'afcon',
    company: 'Afcon',
    role: 'Simplex Programmer',
    start: '11/2021',
    end: '02/2022',
    desc: 'Building equations for handling fire sensors and flow switches to activate auto extinguishers.',
    map: { x: 45.7, y: 43.5 },
  },
  {
    id: 'machava-tova',
    company: 'Machava Tova',
    role: 'EcoTech Teacher',
    start: '12/2020',
    end: '08/2021',
    desc: 'Teaching 15–18 year old students JavaScript, HTML and CSS (Ecommerce).',
    map: { x: 29.7, y: 55.3 },
  },
  {
    id: 'technion',
    company: 'Technion',
    role: 'Software Practitioner',
    start: '10/2020',
    end: '09/2021',
    desc: 'Private lessons in various courses, including Java, React and Boolean.',
    map: { x: 17.5, y: 73 },
  },
  {
    id: 'creator',
    company: 'Creator',
    role: 'Independent UE5 Developer',
    start: '2020',
    end: 'Present',
    side: true,
    desc: 'Creating what I love: my own games and game jams (see Projects).',
    map: { x: 72.4, y: 73.6 },
  },
];

// The "?" stop on the map: whatever comes next.
export const NEXT_QUEST = {
  title: 'Unknown Territory',
  desc: "Unknown chapter — maybe it's with you. I'd love to hear it.",
  map: { x: 88.6, y: 20 },
};

// Filter runes on the Projects screen (a project matches if its tags include it).
export const PROJECT_FILTERS = ['Own project', 'Game Jam', 'Multiplayer', 'Game AI'];

// Said once on the Projects screen and in the Quick CV instead of tagging every project.
export const PROJECTS_NOTE = 'All games made in Unreal Engine';

// Projects (skill tree). x/y: node position as % of the tree area.
// parents: ids this node connects to. legendary: flagship project — bigger
// gold node with its tags always visible, listed first in the Journal, the
// Overview's "Legendary Loot" (first OVERVIEW_LOOT_COUNT of them, in this
// order) and the Quick CV.
// media: gif path (relative to ASSET). tags: shown as chips + used by filters;
// put the most important first (the tree shows 2 under legendary nodes, the Overview 2).
export const OVERVIEW_LOOT_COUNT = 3;

export const PROJECTS = [
  {
    id: 'gs',
    x: 88,
    y: 40,
    parents: ['n12'],
    legendary: true,
    title: 'Goblin Season',
    years: '2026',
    icon: '👺',
    description: 'Goblin Season: The Great Trophy Raid. A multiplayer UE 5.8 game of co-op goblin raids, PvP, Siege and Dungeon Crawl, built with Claude Code as my development partner, driving the Unreal editor through MCP. (my own project)',
    bullets: ['Built with Claude Code + Unreal MCP', 'Co-op raids, PvP, Siege & Dungeon Crawl', 'GAS abilities + Steam multiplayer', 'Data-driven content pipelines'],
    tags: ['Made with AI', 'Multiplayer', 'C++', 'Own project'],
    media: 'gifs/goblin-season.gif',
  },
  {
    id: 'n12',
    x: 72,
    y: 40,
    parents: ['n8'],
    legendary: true,
    title: 'Ore 2 War',
    years: '2025 - 2026',
    icon: '⛏️',
    description: 'Ore2War is a 2–4 player multiplayer game where you gather resources and craft weapons to sell to warring factions, most points wins. (my own project)',
    bullets: ['Multiplayer networking', 'Resource gathering & crafting', 'Deep Faction economy system', 'Hexagon random map generation'],
    tags: ['Multiplayer', 'C++', 'Own project'],
    media: 'gifs/ore2war.gif',
  },
  {
    id: 'n8',
    x: 57,
    y: 40,
    parents: ['n4'],
    legendary: true,
    title: 'The Greatest Adventurer',
    years: '2022 - 2024',
    icon: '🗺️',
    description: 'RPG-like game with growing world eco system and AI NPCs that react to the player. (My own project)',
    bullets: ['Drops system', 'True AI NPC behavior', 'Fast save & load system', 'Attribute system'],
    tags: ['RPG', 'Game AI', 'Own project'],
    media: 'gifs/tga.gif',
  },
  {
    id: 'n1',
    x: 12,
    y: 60,
    parents: [],
    legendary: true,
    title: 'The Return Of Rakshasa',
    years: '2020',
    icon: '⚔️',
    description: 'My First game, a fantasy action game created end-to-end include logic and level design. (Practical engineering end project)',
    bullets: ['Game Narrative', 'Dynamic magic system', 'Full Game Development'],
    tags: ['Action', 'Final project', 'Own project'],
    media: 'gifs/rakshasa.gif',
  },
  {
    id: 'n2',
    x: 27,
    y: 40,
    parents: ['n1'],
    title: 'Mini projects',
    years: '2020',
    icon: '🎮',
    description: 'Testing my skills in game development with small projects. (my own project)',
    bullets: ['Shooting game', 'Environment design', 'Four legs movement & animation'],
    tags: ['Prototypes', 'Own project'],
    media: 'gifs/mini.gif',
  },
  {
    id: 'n4',
    x: 42,
    y: 40,
    parents: ['n2'],
    title: 'Worlds clicker',
    years: '2021',
    icon: '🖱️',
    description: 'A mobile clicker game with unique 3D worlds and a dynamic upgrade system. (my own project)',
    bullets: ['Resources system', 'Upgrade mechanics', 'Android Studio development'],
    tags: ['Mobile', 'Own project'],
    media: 'gifs/clicker.gif',
  },
  {
    id: 'n3',
    x: 30,
    y: 60,
    parents: ['n1'],
    title: 'Final Reversal',
    years: '2023',
    icon: '👹',
    description: 'The main hero fight against a Demon boss that each time you get to a certain threshold, the game functionally graded down to the past. From Third person until Text based (GGJ project)',
    bullets: ['2 Days project', 'Mechanical changes', 'Text-based storytelling'],
    tags: ['Game Jam', 'GGJ'],
    media: 'gifs/reversal.gif',
  },
  {
    id: 'n5',
    x: 50,
    y: 60,
    parents: ['n3'],
    title: 'Guns N Ropses',
    years: '2024',
    icon: '🪢',
    description: '1V1 Battle game, while balancing on ropes trying to avoid enemy attacks. The first to the top wins. (GGJ project)',
    bullets: ['2 Days project', 'Chaotic rope physics', 'AOE Damage and knockback'],
    tags: ['Game Jam', 'GGJ', 'Multiplayer'],
    media: 'gifs/ropes.gif',
  },
  {
    id: 'n7',
    x: 70,
    y: 60,
    parents: ['n5'],
    title: 'Home Sailors',
    years: '2025',
    icon: '⛵',
    description: 'A tiny paper boat navigating a bathroom tub, collecting 15 fish in under 100 seconds. (GGJ project)',
    bullets: ['2 Days project', 'Real-time water physics', 'Full steering controls', 'Obstacle spawning system'],
    tags: ['Game Jam', 'GGJ', 'Physics'],
    media: 'gifs/bubble.gif',
  },
  {
    id: 'n9',
    x: 90,
    y: 60,
    parents: ['n7'],
    title: 'The Mask Tester',
    years: '2026',
    icon: '🎭',
    description: 'A platformer game where you can test different masks that give you different POV on the world and reveals hidden platforms. (GGJ project)',
    bullets: ['2 Days project', 'Level design', 'Hidden platform system'],
    tags: ['Game Jam', 'GGJ', 'Level design'],
    media: 'gifs/mask.gif',
  },
  {
    id: 'n6',
    x: 35,
    y: 80,
    parents: ['n1'],
    title: 'Patrol no more',
    years: '2023',
    icon: '🤖',
    description: 'outsmart patrolling robots, use a powerful scaling gun to shrink enemies and consume them to grow stronger. (GMTK project)',
    bullets: ['Smart Patrol AI', 'Scaling mechanics', 'Consumption system'],
    tags: ['Game Jam', 'GMTK', 'Game AI'],
    media: 'gifs/patrol.gif',
  },
  {
    id: 'n10',
    x: 62,
    y: 80,
    parents: ['n6'],
    title: 'SoundShift',
    years: '2025',
    icon: '🎵',
    description: 'A deck builder rhythm game where you can create your own music and play it. (GMTK project)',
    bullets: ['2 Days project', 'Deck building mechanics', 'Music creation system'],
    tags: ['Game Jam', 'GMTK', 'Music'],
    media: 'gifs/soundshift.gif',
  },
  {
    id: 'n11',
    x: 90,
    y: 80,
    parents: ['n10'],
    title: 'Flipped Ghost',
    years: '2026',
    icon: '👻',
    description: 'A puzzle-platformer game where the timer flips the world and you solve puzzles in ghost form. (GMTK project)',
    bullets: ['2 Days project', 'Gravity flipping mechanics', '2D pixel art', 'Puzzle design'],
    tags: ['Game Jam', 'GMTK', 'Puzzle'],
    media: 'gifs/flipped.gif',
  },
];

// Quick CV (quick-cv.js): a curated, one-page resume. Only what a recruiter
// needs; the game screens keep the full detail. Jobs / projects are picked by
// id from JOBS / PROJECTS (dates, titles, company come from there); the
// bullets here are the CV wording. Keep it to ONE printed A4 page.
export const CV = {
  headline: 'Backend Engineer · Unreal Engine 5 Developer',
  // Contact line, in order (ids from LINKS). Printed as readable URLs.
  links: ['email', 'linkedin', 'github'],
  summary:
    'Backend engineer building game features, REST endpoints and data models in PHP, SQL and Couchbase. ' +
    'Unreal Engine 5 / C++ developer since 2020, from multiplayer games to game jams, ' +
    'working daily with AI tools (Claude Code, MCP).',
  skills: [
    { group: 'Languages', items: ['C++', 'PHP', 'SQL', 'JavaScript', 'Java'] },
    { group: 'Backend', items: ['REST APIs', 'SQL databases', 'Couchbase (NoSQL)'] },
    { group: 'Game dev', items: ['Unreal Engine 5', 'Gameplay Ability System', 'Multiplayer networking', 'Level design'] },
    { group: 'AI tools', items: ['Claude Code', 'MCP servers', 'Custom skills & automation'] },
    { group: 'Web', items: ['React', 'HTML', 'CSS'] },
  ],
  jobs: [
    {
      id: 'sciplay',
      bullets: [
        'Build new game features and server-side game logic',
        'Develop and maintain REST endpoints and internal tools',
        'Model and manage game data in SQL and Couchbase documents',
      ],
    },
    {
      id: 'bylith',
      bullets: [
        'Developed PHP server logic and backend features',
        'Managed databases and SQL queries',
        'Integrated backend services with client applications',
      ],
    },
  ],
  // Older roles: one compact line each, no bullets.
  earlier: [
    { id: 'afcon', note: 'fire-safety control logic' },
    { id: 'machava-tova', note: 'taught JavaScript, HTML & CSS' },
    { id: 'technion', note: 'private tutor, Java & React' },
  ],
  projectsTitle: 'Game Development',
  projectsNote: 'Own projects in Unreal Engine 5 / C++, 2020 – Present',
  projects: [
    {
      id: 'gs',
      stack: 'UE 5.8 · C++ · GAS · Steam · Claude Code + MCP',
      bullets: [
        'Multiplayer co-op and PvP game: goblin raids, Siege and Dungeon Crawl modes',
        'Gameplay Ability System, Steam multiplayer and data-driven content pipelines',
        'Built with Claude Code as my development partner, driving the Unreal editor through MCP',
      ],
    },
    {
      id: 'n12',
      stack: 'UE5 · C++ · Multiplayer',
      bullets: [
        '2–4 player online game: gather resources, craft weapons, sell to warring factions',
        'Faction economy system and random hexagon map generation',
      ],
    },
    {
      id: 'n8',
      stack: 'UE5 · Game AI',
      bullets: ['RPG with a growing world ecosystem and AI NPCs that react to the player'],
    },
  ],
  // One summary line for every project tagged jamTag ({n} and {years} filled in).
  jamTag: 'Game Jam',
  jamLine: '{n} game jam games, 48 hours each (Global Game Jam, GMTK Game Jam), {years}',
  // { degree, school, years } entries; empty = no Education section.
  education: [],
};

export const projectLabel = (p) => `${p.title} (${p.years})`;
export const jobDates = (j) => `${j.start} – ${j.end}`;
// Short form for the Quest Log rows: years only ("2022 – 2024", "2024 – now").
const year = (d) => (d === 'Present' ? 'now' : d.split('/').pop());
export const jobYears = (j) => `${year(j.start)} – ${year(j.end)}`;
