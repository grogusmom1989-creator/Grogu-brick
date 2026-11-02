import {
  WorkspaceTask,
  WorkspaceNote,
  SyncConfig,
  SyncLogEntry,
  GoogleDriveFile,
  WorkspaceProject,
  ProjectBridge,
  BridgeEvent,
} from '../types';
import { GitHubSyncData } from './github';

const STORAGE_KEYS = {
  TASKS: 'omnisync_tasks_v1',
  NOTES: 'omnisync_notes_v1',
  CONFIG: 'omnisync_config_v1',
  LOGS: 'omnisync_logs_v1',
  CACHED_DRIVE: 'omnisync_cache_drive_v1',
  CACHED_GITHUB: 'omnisync_cache_github_v1',
  PINNED_ITEMS: 'omnisync_pinned_items_v1',
  THEME: 'omnisync_theme_v1',
  PROJECTS: 'omnisync_projects_v2',
  BRIDGES: 'omnisync_bridges_v1',
  BRIDGE_EVENTS: 'omnisync_bridge_events_v1',
};

export const DEFAULT_PROJECTS: WorkspaceProject[] = [
  {
    id: 'proj-omnisync',
    name: 'OmniSync Hub',
    description: 'Central continuous sync workspace connecting GitHub, Google Drive, Action Items, Notes, and AI.',
    source: 'internal',
    status: 'deployed',
    url: 'https://github.com/grogusmom1989',
    tags: ['Productivity', 'Cloud-Sync', 'Command-Center'],
    techStack: ['React', 'TypeScript', 'Tailwind CSS', 'Vite', 'Firebase Auth'],
    updatedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    isPinned: true,
    version: '1.5.0',
    notes: 'The master hub coordinating all connected projects and cloud drives.',
  },
  {
    id: 'proj-1d-world',
    name: '1D World & Reiki HQ',
    description: '1-Dimensional Cellular Automata simulation, Solfeggio sound therapy engine, and Quantum Reiki alignment field.',
    source: 'internal',
    status: 'deployed',
    tags: ['Reiki', 'Sound-Therapy', 'Wolfram-Automata', 'Healing'],
    techStack: ['Web Audio API', 'Canvas 2D', 'Solfeggio Frequencies', 'Physics Engine'],
    updatedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    isPinned: true,
    version: '2.4.0',
    notes: '528Hz DNA repair, 432Hz Miracle frequency, and rule 30/90/110 dynamic cellular automata.',
  },
  {
    id: 'proj-kikis-world',
    name: "Kiki's World 2.0",
    description: 'Immersive media cinema, Solfeggio ambient sound generator, interactive Crystal Healing grid, and Daily Divine Oracle deck.',
    source: 'internal',
    status: 'deployed',
    tags: ['Cinema', 'Audio-Visualizer', 'Crystals', 'Oracle-Deck'],
    techStack: ['HTML5 Video/Audio', 'Canvas', 'Web Audio API', 'React'],
    updatedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    isPinned: true,
    version: '2.0.0',
    notes: 'Multi-screen streaming, binaural beats, chakra alignment crystal nodes.',
  },
  {
    id: 'proj-remix-studio',
    name: 'Remixed App Studio',
    description: 'Interactive app remixing sandbox with code injection forge, live preview runner, and custom theme presets.',
    source: 'internal',
    status: 'active',
    tags: ['Remix', 'Code-Forge', 'Sandbox', 'Generative'],
    techStack: ['TypeScript', 'Tailwind', 'Dynamic Components'],
    updatedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    isPinned: false,
    version: '1.2.0',
    notes: 'Used for prototyping rapid adaptations and variations of core hubs.',
  },
  {
    id: 'proj-paypal-hub',
    name: 'Creator Earnings & PayPal Hub',
    description: 'Monetization dashboard with direct PayPal payment links, QR code, donation tiers, and embeddable badges.',
    source: 'internal',
    status: 'deployed',
    tags: ['Monetization', 'PayPal', 'Creator-Economy'],
    techStack: ['PayPal API / PayPal.me', 'React', 'SVG QR Engine'],
    updatedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    isPinned: false,
    version: '1.0.0',
    notes: 'Direct payout to grogusmom1989@gmail.com / PayPal handle.',
  },
];

const DEFAULT_CONFIG: SyncConfig = {
  autoSync: true,
  intervalMinutes: 5,
  githubUsername: 'torvalds',
};

const DEFAULT_TASKS: WorkspaceTask[] = [
  {
    id: 'task-1',
    title: 'Connect Google Drive & Sync active documents',
    description: 'Sign in to Google Drive to automatically index, search, and view all Docs, Sheets, and Slides in OmniSync Hub.',
    status: 'in_progress',
    priority: 'high',
    dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    createdAt: new Date().toISOString(),
    source: 'drive',
    tags: ['Setup', 'Cloud', 'Drive'],
  },
  {
    id: 'task-2',
    title: 'Configure GitHub Personal Token / Username',
    description: 'Link your GitHub account to sync repositories, pull requests, issues, and real-time commit activity.',
    status: 'todo',
    priority: 'high',
    dueDate: new Date(Date.now() + 172800000).toISOString().split('T')[0],
    createdAt: new Date().toISOString(),
    source: 'github',
    tags: ['Dev', 'GitHub'],
  },
  {
    id: 'task-3',
    title: 'Test Unified Global Search (Cmd + K)',
    description: 'Press Cmd+K or Ctrl+K anywhere to instantly query files across Drive, GitHub repos, and personal notes.',
    status: 'todo',
    priority: 'medium',
    createdAt: new Date().toISOString(),
    source: 'manual',
    tags: ['Productivity', 'Keyboard'],
  },
];

const DEFAULT_NOTES: WorkspaceNote[] = [
  {
    id: 'note-1',
    title: 'OmniSync Workspace Roadmap & Architecture',
    content: `# OmniSync Hub Architecture\n\nWelcome to your unified command center for **GitHub**, **Google Drive**, and all synced workspaces.\n\n### Core Capabilities\n- **Live Google Drive Sync**: Instant access to your Docs, Sheets, PDFs, and folders.\n- **GitHub Hub**: Keep track of repositories, assigned issues, pull requests, and commit logs.\n- **Unified Action Items**: Merge GitHub issues and Drive files into prioritized tasks.\n- **Global Omnibar (Cmd/Ctrl + K)**: Search everything in milliseconds.\n- **AI Copilot**: Synthesize daily briefing and query across all connected knowledge.`,
    tags: ['Overview', 'Architecture', 'Sync'],
    updatedAt: new Date().toISOString(),
    pinned: true,
  },
  {
    id: 'note-2',
    title: 'Meeting Notes & Project Sync Sync Checklist',
    content: `### Pre-Sync Checklist\n- [x] Enable Google Drive read access\n- [ ] Connect GitHub user repositories\n- [ ] Set auto-sync cadence (e.g. 5 minutes)\n- [ ] Review open GitHub pull requests\n\n*Synced automatically with local offline cache.*`,
    tags: ['Checklist', 'Sync'],
    updatedAt: new Date(Date.now() - 3600000).toISOString(),
    pinned: false,
  },
];

export const getStoredTasks = (): WorkspaceTask[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TASKS);
    return raw ? JSON.parse(raw) : DEFAULT_TASKS;
  } catch {
    return DEFAULT_TASKS;
  }
};

export const saveStoredTasks = (tasks: WorkspaceTask[]) => {
  try {
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
  } catch (e) {
    console.error('Failed to save tasks', e);
  }
};

export const getStoredNotes = (): WorkspaceNote[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.NOTES);
    return raw ? JSON.parse(raw) : DEFAULT_NOTES;
  } catch {
    return DEFAULT_NOTES;
  }
};

export const saveStoredNotes = (notes: WorkspaceNote[]) => {
  try {
    localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(notes));
  } catch (e) {
    console.error('Failed to save notes', e);
  }
};

export const getSyncConfig = (): SyncConfig => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CONFIG);
    return raw ? { ...DEFAULT_CONFIG, ...JSON.parse(raw) } : DEFAULT_CONFIG;
  } catch {
    return DEFAULT_CONFIG;
  }
};

export const saveSyncConfig = (config: SyncConfig) => {
  try {
    localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(config));
  } catch (e) {
    console.error('Failed to save config', e);
  }
};

export const getSyncLogs = (): SyncLogEntry[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.LOGS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const addSyncLog = (entry: Omit<SyncLogEntry, 'id' | 'timestamp'>) => {
  try {
    const current = getSyncLogs();
    const newEntry: SyncLogEntry = {
      ...entry,
      id: 'log-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      timestamp: new Date().toISOString(),
    };
    const updated = [newEntry, ...current].slice(0, 100); // keep last 100
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(updated));
    return newEntry;
  } catch (e) {
    console.error('Failed to save sync log', e);
    return null;
  }
};

export const clearSyncLogs = () => {
  try {
    localStorage.removeItem(STORAGE_KEYS.LOGS);
  } catch (e) {
    console.error('Failed to clear logs', e);
  }
};

export const getCachedDriveFiles = (): GoogleDriveFile[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CACHED_DRIVE);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const saveCachedDriveFiles = (files: GoogleDriveFile[]) => {
  try {
    localStorage.setItem(STORAGE_KEYS.CACHED_DRIVE, JSON.stringify(files));
  } catch (e) {
    console.error('Failed to cache drive files', e);
  }
};

export const getCachedGitHubData = (): GitHubSyncData | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CACHED_GITHUB);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const saveCachedGitHubData = (data: GitHubSyncData) => {
  try {
    localStorage.setItem(STORAGE_KEYS.CACHED_GITHUB, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to cache github data', e);
  }
};

export const getPinnedIds = (): string[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PINNED_ITEMS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const togglePinnedId = (id: string): string[] => {
  try {
    const pins = getPinnedIds();
    const next = pins.includes(id) ? pins.filter((p) => p !== id) : [...pins, id];
    localStorage.setItem(STORAGE_KEYS.PINNED_ITEMS, JSON.stringify(next));
    return next;
  } catch {
    return [];
  }
};

export const getStoredProjects = (): WorkspaceProject[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROJECTS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(DEFAULT_PROJECTS));
      return DEFAULT_PROJECTS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_PROJECTS;
  } catch {
    return DEFAULT_PROJECTS;
  }
};

export const saveStoredProjects = (projects: WorkspaceProject[]) => {
  try {
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
  } catch (e) {
    console.error('Failed to save projects', e);
  }
};

export const DEFAULT_BRIDGES: ProjectBridge[] = [
  {
    id: 'bridge-drive-kiki-media',
    name: 'drive_to_kikis_media',
    sourceModule: 'drive',
    targetModule: 'kikis_world',
    title: "Google Drive ⇄ Kiki's World 2.0 Media Streamer",
    description: "Streams video files (MP4/WebM) and audio files directly from Google Drive into Kiki's Cinema player and visualizer spectrum.",
    status: 'active',
    syncMode: 'realtime',
    latencyMs: 14,
    packetsCount: 382,
    lastEventAt: new Date().toISOString(),
    config: {
      autoMountMedia: true,
      allowedMimeTypes: ['video/mp4', 'audio/mpeg', 'audio/wav', 'image/jpeg'],
      directStreaming: true,
    },
    enabled: true,
    category: 'media',
  },
  {
    id: 'bridge-github-portfolio',
    name: 'github_to_projects_portfolio',
    sourceModule: 'github',
    targetModule: 'projects',
    title: 'GitHub ⇄ Projects Portfolio Pipeline',
    description: 'Auto-syncs grogusmom1989 repositories, branches, open issues, and stars into the unified project catalog.',
    status: 'active',
    syncMode: 'event_driven',
    latencyMs: 22,
    packetsCount: 468,
    lastEventAt: new Date().toISOString(),
    config: {
      account: 'grogusmom1989',
      autoIncludeStars: true,
      pullIssues: true,
    },
    enabled: true,
    category: 'code',
  },
  {
    id: 'bridge-github-tasks',
    name: 'github_issues_to_tasks',
    sourceModule: 'github',
    targetModule: 'tasks',
    title: 'GitHub Issues ⇄ Workspace Action Priorities',
    description: 'Bridges open and assigned GitHub issues into prioritized workspace action items with direct back-links.',
    status: 'active',
    syncMode: 'event_driven',
    latencyMs: 18,
    packetsCount: 154,
    lastEventAt: new Date().toISOString(),
    config: {
      autoLabelPriorities: true,
      syncClosedStatus: true,
    },
    enabled: true,
    category: 'data',
  },
  {
    id: 'bridge-1d-kiki-sound',
    name: 'one_d_solfeggio_to_kiki_sound',
    sourceModule: 'one_d_world',
    targetModule: 'kikis_world',
    title: "1D Solfeggio ⇄ Kiki's Sound Lab Audio Carrier",
    description: "Harmonic audio bus carrying 528Hz DNA repair, 432Hz Miracle, and 963Hz Crown Chakra into Kiki's Ambient Synthesizer.",
    status: 'active',
    syncMode: 'realtime',
    latencyMs: 4,
    packetsCount: 1840,
    lastEventAt: new Date().toISOString(),
    config: {
      defaultFrequency: 528,
      binauralOffsetHz: 6,
      harmonicsLevel: 0.35,
    },
    enabled: true,
    category: 'audio',
  },
  {
    id: 'bridge-1d-paypal-booking',
    name: 'one_d_reiki_to_paypal',
    sourceModule: 'one_d_world',
    targetModule: 'earnings',
    title: '1D Reiki Sessions ⇄ PayPal Checkout Gateway',
    description: 'Connects energy alignment sessions, oracle consultations, and chakra cleanses to PayPal tip jar and tier payouts.',
    status: 'active',
    syncMode: 'manual',
    latencyMs: 35,
    packetsCount: 62,
    lastEventAt: new Date().toISOString(),
    config: {
      paypalRecipient: 'grogusmom1989@gmail.com',
      reikiSessionTier: 35,
      instantReceipt: true,
    },
    enabled: true,
    category: 'payment',
  },
  {
    id: 'bridge-remix-github',
    name: 'remix_studio_to_github',
    sourceModule: 'remix',
    targetModule: 'github',
    title: 'Remixed App Studio ⇄ GitHub Code Forge',
    description: 'Exports remixed app blueprints, custom theme configurations, and Web Audio code snippets to GitHub repositories.',
    status: 'active',
    syncMode: 'event_driven',
    latencyMs: 48,
    packetsCount: 92,
    lastEventAt: new Date().toISOString(),
    config: {
      targetBranch: 'main',
      exportFormat: 'typescript_react',
    },
    enabled: true,
    category: 'code',
  },
  {
    id: 'bridge-drive-notes',
    name: 'drive_to_knowledge_notes',
    sourceModule: 'drive',
    targetModule: 'notes',
    title: 'Google Drive Docs ⇄ Knowledge Base Notes',
    description: 'Embeds and anchors Google Docs, Sheets spreadsheets, and Drive folders directly into Markdown knowledge notes.',
    status: 'active',
    syncMode: 'realtime',
    latencyMs: 16,
    packetsCount: 178,
    lastEventAt: new Date().toISOString(),
    config: {
      syncThumbnails: true,
      autoLinkDriveId: true,
    },
    enabled: true,
    category: 'data',
  },
  {
    id: 'bridge-paypal-portfolio',
    name: 'paypal_to_projects_portfolio',
    sourceModule: 'earnings',
    targetModule: 'projects',
    title: 'PayPal Earnings Gateway ⇄ Project Sponsorships',
    description: 'Attaches direct PayPal donation buttons, sponsor badges, and revenue attribution to individual project cards.',
    status: 'active',
    syncMode: 'event_driven',
    latencyMs: 28,
    packetsCount: 84,
    lastEventAt: new Date().toISOString(),
    config: {
      enableTipBadges: true,
      highlightFundedProjects: true,
    },
    enabled: true,
    category: 'payment',
  },
  {
    id: 'bridge-kiki-remix',
    name: 'kiki_visualizer_to_remix',
    sourceModule: 'kikis_world',
    targetModule: 'remix',
    title: 'Kiki Visualizer ⇄ Remixed Theme Presets',
    description: 'Transfers audio-reactive canvas color palettes, frequency tunings, and particle velocity into Remixed Apps.',
    status: 'active',
    syncMode: 'realtime',
    latencyMs: 6,
    packetsCount: 624,
    lastEventAt: new Date().toISOString(),
    config: {
      autoSyncPalettes: true,
      audioReactivitySync: true,
    },
    enabled: true,
    category: 'audio',
  },
  {
    id: 'bridge-omnisync-bus',
    name: 'omnisync_universal_event_bus',
    sourceModule: 'webhook',
    targetModule: 'tasks',
    title: 'OmniSync Universal Event Bus & Webhook Bridge',
    description: 'Central broker dispatching live events, webhook triggers, and notifications across all 8 project workspaces.',
    status: 'active',
    syncMode: 'realtime',
    latencyMs: 2,
    packetsCount: 3412,
    lastEventAt: new Date().toISOString(),
    config: {
      websocketSimulated: true,
      heartbeatIntervalSeconds: 15,
      soundFX: true,
    },
    enabled: true,
    category: 'webhook',
  },
];

export const getStoredBridges = (): ProjectBridge[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.BRIDGES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.BRIDGES, JSON.stringify(DEFAULT_BRIDGES));
      return DEFAULT_BRIDGES;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_BRIDGES;
  } catch {
    return DEFAULT_BRIDGES;
  }
};

export const saveStoredBridges = (bridges: ProjectBridge[]) => {
  try {
    localStorage.setItem(STORAGE_KEYS.BRIDGES, JSON.stringify(bridges));
  } catch (e) {
    console.error('Failed to save bridges', e);
  }
};

export const getStoredBridgeEvents = (): BridgeEvent[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.BRIDGE_EVENTS);
    if (!raw) {
      const initialEvents: BridgeEvent[] = [
        {
          id: 'evt-1',
          bridgeId: 'bridge-drive-kiki-media',
          bridgeName: "Google Drive ⇄ Kiki's World 2.0 Media Streamer",
          source: 'Google Drive',
          target: "Kiki's World 2.0",
          timestamp: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
          type: 'media_stream_mount',
          summary: 'Streamed video assets and audio index into Kiki Cinema visualizer',
          status: 'delivered',
        },
        {
          id: 'evt-2',
          bridgeId: 'bridge-github-portfolio',
          bridgeName: 'GitHub ⇄ Projects Portfolio Pipeline',
          source: 'GitHub',
          target: 'Projects Portfolio',
          timestamp: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
          type: 'repo_sync',
          summary: 'Synchronized grogusmom1989 repositories and commit manifests',
          status: 'delivered',
        },
        {
          id: 'evt-3',
          bridgeId: 'bridge-1d-kiki-sound',
          bridgeName: "1D Solfeggio ⇄ Kiki's Sound Lab Audio Carrier",
          source: '1D World & Reiki HQ',
          target: "Kiki's World 2.0",
          timestamp: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
          type: 'audio_bus_carrier',
          summary: 'Calibrated 528Hz Solfeggio carrier frequency with 6Hz theta binaural beats',
          status: 'delivered',
        },
        {
          id: 'evt-4',
          bridgeId: 'bridge-1d-paypal-booking',
          bridgeName: '1D Reiki Sessions ⇄ PayPal Checkout Gateway',
          source: '1D World & Reiki HQ',
          target: 'PayPal Creator Earnings',
          timestamp: new Date(Date.now() - 1000 * 60 * 42).toISOString(),
          type: 'payment_tier_route',
          summary: 'Bridged Reiki 60-min session energy exchange tier ($35.00) to PayPal checkout link',
          status: 'delivered',
        },
      ];
      localStorage.setItem(STORAGE_KEYS.BRIDGE_EVENTS, JSON.stringify(initialEvents));
      return initialEvents;
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
};

export const addStoredBridgeEvent = (event: BridgeEvent): BridgeEvent[] => {
  try {
    const events = getStoredBridgeEvents();
    const updated = [event, ...events].slice(0, 50);
    localStorage.setItem(STORAGE_KEYS.BRIDGE_EVENTS, JSON.stringify(updated));
    return updated;
  } catch {
    return [];
  }
};

export const clearStoredBridgeEvents = () => {
  try {
    localStorage.removeItem(STORAGE_KEYS.BRIDGE_EVENTS);
  } catch (e) {
    console.error('Failed to clear bridge events', e);
  }
};


