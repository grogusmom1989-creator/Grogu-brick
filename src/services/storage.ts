import {
  WorkspaceTask,
  WorkspaceNote,
  SyncConfig,
  SyncLogEntry,
  GoogleDriveFile,
  WorkspaceProject,
  ProjectBridge,
  BridgeEvent,
  OutboxItem,
  SyncConflict,
  SocialAccount,
  SocialPost,
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
  OUTBOX: 'omnisync_outbox_v1',
  CONFLICTS: 'omnisync_conflicts_v1',
  SOCIAL_ACCOUNTS: 'omnisync_social_accounts_v1',
  SOCIAL_POSTS: 'omnisync_social_posts_v1',
};

export const DEFAULT_PROJECTS: WorkspaceProject[] = [
  {
    id: 'proj-metamuse-store',
    name: 'Meta Muse — Creator App Store & Social OS',
    description:
      'Flagship personal Creator App Store (@grogusmom1989), Meta ecosystem command center, and universal Google Play / App Store shortcut launcher.',
    source: 'internal',
    status: 'deployed',
    url: 'https://ais-pre-kbnunw7227i4imww2q3pcc-139265478135.us-west2.run.app/?tab=social',
    previewUrl: 'https://ais-pre-kbnunw7227i4imww2q3pcc-139265478135.us-west2.run.app/?tab=social',
    language: 'TypeScript',
    stars: 128,
    forks: 24,
    tags: ['Meta-Muse', 'App-Store', 'Meta-Ecosystem', 'Google-Play'],
    techStack: ['React 19', 'TypeScript', 'Tailwind CSS', 'Firestore', 'PWA TWA'],
    updatedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    isPinned: true,
    version: '3.2.0',
    notes: 'Central storefront for all @grogusmom1989 apps plus 12 global app stores and 48+ app shortcuts.',
  },
  {
    id: 'proj-omnisync',
    name: 'OmniSync Hub',
    description:
      'Central continuous background sync workspace connecting GitHub, Google Drive, Action Items, Notes, Offline Outbox, and AI.',
    source: 'internal',
    status: 'deployed',
    url: 'https://github.com/grogusmom1989',
    previewUrl: 'https://ais-pre-kbnunw7227i4imww2q3pcc-139265478135.us-west2.run.app',
    language: 'TypeScript',
    stars: 96,
    forks: 18,
    tags: ['Productivity', 'Cloud-Sync', 'Command-Center', 'PWA'],
    techStack: ['React', 'TypeScript', 'Tailwind CSS', 'Vite', 'Firebase Auth'],
    updatedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    isPinned: true,
    version: '2.8.0',
    notes: 'The master hub coordinating all connected projects, conflict resolution, and cloud drives.',
  },
  {
    id: 'proj-1d-world',
    name: '1D World & Reiki HQ',
    description:
      '1-Dimensional Cellular Automata simulation, Solfeggio 528Hz sound therapy engine, and Quantum Reiki meridian alignment field.',
    source: 'internal',
    status: 'deployed',
    url: 'https://ais-pre-kbnunw7227i4imww2q3pcc-139265478135.us-west2.run.app/?tab=one_d_world',
    language: 'TypeScript',
    stars: 84,
    forks: 15,
    tags: ['Reiki', 'Sound-Therapy', 'Wolfram-Automata', '528Hz'],
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
    description:
      'Immersive media cinema, Solfeggio ambient sound generator, interactive Crystal Healing grid, and Daily Divine Oracle deck.',
    source: 'internal',
    status: 'deployed',
    url: 'https://ais-pre-kbnunw7227i4imww2q3pcc-139265478135.us-west2.run.app/?tab=kikis_world',
    language: 'TypeScript',
    stars: 112,
    forks: 29,
    tags: ['Cinema', 'Audio-Visualizer', 'Crystals', 'Oracle-Deck'],
    techStack: ['HTML5 Video/Audio', 'Canvas', 'Web Audio API', 'React'],
    updatedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    isPinned: true,
    version: '2.0.5',
    notes: 'Multi-screen streaming, binaural beats, chakra alignment crystal nodes.',
  },
  {
    id: 'proj-kikios-deck',
    name: 'KikiOS Cyber-Deck Spatial Desktop',
    description:
      'Full-screen multi-window cyber-deck operating system with polyphonic Solfeggio synth, command terminal, and cloud file explorer.',
    source: 'internal',
    status: 'deployed',
    url: 'https://ais-pre-kbnunw7227i4imww2q3pcc-139265478135.us-west2.run.app/?tab=kikios',
    language: 'TypeScript',
    stars: 77,
    forks: 14,
    tags: ['Cyber-Deck', 'Desktop-OS', 'Window-Manager', 'Synth'],
    techStack: ['React Window Manager', 'Web Audio Synth', 'Terminal Emulator'],
    updatedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    isPinned: true,
    version: '1.9.0',
    notes: 'Interactive desktop OS built right inside the OmniSync & Meta Muse suite.',
  },
  {
    id: 'proj-remix-studio',
    name: 'Remixed App Studio & APK Builder',
    description:
      'Interactive app remixing sandbox with code injection forge, live preview runner, custom theme presets, and Android TWA packager.',
    source: 'internal',
    status: 'deployed',
    url: 'https://ais-pre-kbnunw7227i4imww2q3pcc-139265478135.us-west2.run.app/?tab=remix',
    language: 'TypeScript',
    stars: 64,
    forks: 11,
    tags: ['Remix', 'Code-Forge', 'APK-Builder', 'Generative'],
    techStack: ['TypeScript', 'Tailwind', 'Bubblewrap TWA', 'Dynamic Components'],
    updatedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    isPinned: true,
    version: '1.7.2',
    notes: 'Used for prototyping rapid adaptations and packaging apps for Google Play Store.',
  },
  {
    id: 'proj-paypal-hub',
    name: 'Creator Earnings & PayPal Hub',
    description:
      'Monetization dashboard with direct PayPal payment links, QR code generator, Reiki session booking tiers, and revenue ledger.',
    source: 'internal',
    status: 'deployed',
    url: 'https://ais-pre-kbnunw7227i4imww2q3pcc-139265478135.us-west2.run.app/?tab=earnings',
    language: 'TypeScript',
    stars: 59,
    forks: 9,
    tags: ['Monetization', 'PayPal', 'Creator-Economy', 'Bookings'],
    techStack: ['PayPal.me API', 'React', 'SVG QR Engine', 'Ledger'],
    updatedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    isPinned: false,
    version: '2.1.0',
    notes: 'Direct payout to grogusmom1989@gmail.com / PayPal handle.',
  },
  {
    id: 'proj-quantum-tarot',
    name: 'Meta Muse Quantum Oracle & Tarot Deck',
    description:
      '78-card holographic Sacred Geometry & Divine Feminine Oracle deck with daily pulls, spread journal, and Instagram Reel export.',
    source: 'custom',
    status: 'deployed',
    url: 'https://ais-pre-kbnunw7227i4imww2q3pcc-139265478135.us-west2.run.app/?tab=kikis_world',
    language: 'TypeScript',
    stars: 91,
    forks: 19,
    tags: ['Oracle', 'Tarot', 'Meta-Muse', 'Spiritual'],
    techStack: ['React', 'Canvas Shaders', 'Firestore Sync'],
    updatedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    isPinned: true,
    version: '1.4.0',
    notes: 'Integrated with Kiki’s World 2.0 and Meta Muse Social Broadcast composer.',
  },
  {
    id: 'proj-solfeggio-synth',
    name: 'Solfeggio 9-Frequency Healing Synthesizer',
    description:
      'Complete 174Hz–963Hz Solfeggio oscillator bank with 6Hz theta binaural beat generator and chakra resonance meter.',
    source: 'custom',
    status: 'deployed',
    url: 'https://ais-pre-kbnunw7227i4imww2q3pcc-139265478135.us-west2.run.app/?tab=one_d_world',
    language: 'TypeScript',
    stars: 88,
    forks: 16,
    tags: ['Solfeggio', '528Hz', '432Hz', 'Binaural-Beats'],
    techStack: ['Web Audio API', 'BiquadFilterNode', 'AnalyserNode'],
    updatedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    isPinned: false,
    version: '2.2.0',
    notes: 'Streams audio directly over the 1D Solfeggio ⇄ Kiki Sound Lab bridge.',
  },
  {
    id: 'proj-crystal-grid',
    name: 'Sacred Geometry Crystal Grid Architect',
    description:
      'Interactive Metatron’s Cube & Flower of Life crystal placement studio with Amethyst, Rose Quartz, Moldavite, and Selenite nodes.',
    source: 'custom',
    status: 'deployed',
    url: 'https://ais-pre-kbnunw7227i4imww2q3pcc-139265478135.us-west2.run.app/?tab=kikis_world',
    language: 'TypeScript',
    stars: 73,
    forks: 12,
    tags: ['Crystal-Grid', 'Sacred-Geometry', 'Energy-Healing'],
    techStack: ['SVG Vector Engine', 'Harmonic Resonance', 'React'],
    updatedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    isPinned: false,
    version: '1.6.0',
    notes: 'Saves custom crystal layouts directly to Firestore and Google Drive.',
  },
  {
    id: 'proj-reels-automator',
    name: 'Meta Muse Reels & Shorts Syndication Engine',
    description:
      'One-click multi-network video & caption dispatcher for Facebook Reels, Instagram, Threads, TikTok, and YouTube Shorts.',
    source: 'custom',
    status: 'deployed',
    url: 'https://ais-pre-kbnunw7227i4imww2q3pcc-139265478135.us-west2.run.app/?tab=social',
    language: 'TypeScript',
    stars: 105,
    forks: 22,
    tags: ['Meta-Reels', 'TikTok', 'YouTube-Shorts', 'Automation'],
    techStack: ['Background Sync Daemon', 'Offline Outbox', 'Meta Suite Bridge'],
    updatedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    isPinned: true,
    version: '3.0.0',
    notes: 'Queues posts in localStorage Outbox when offline and auto-flushes when online.',
  },
  {
    id: 'proj-playstore-packager',
    name: 'Bubblewrap Android TWA & Play Store Builder',
    description:
      'Automated Android App Bundle (.aab) & Digital Asset Links generator for publishing web apps directly to Google Play Store.',
    source: 'internal',
    status: 'deployed',
    url: 'https://ais-pre-kbnunw7227i4imww2q3pcc-139265478135.us-west2.run.app/build-playstore.sh',
    language: 'Shell',
    stars: 94,
    forks: 21,
    tags: ['Google-Play', 'Android-AAB', 'Bubblewrap', 'TWA'],
    techStack: ['Bubblewrap CLI', 'twa-manifest.json', 'assetlinks.json'],
    updatedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    isPinned: true,
    version: '1.5.0',
    notes: 'Includes 1-click downloadable build-playstore.sh script for app.omnisync.hub.',
  },
];

const DEFAULT_CONFIG: SyncConfig = {
  autoSync: true,
  intervalMinutes: 1,
  autoResolveConflicts: false,
  githubUsername: 'grogusmom1989',
};

const DEFAULT_TASKS: WorkspaceTask[] = [
  {
    id: 'task-1',
    title: 'Publish Meta Muse Creator App Store & OmniSync Hub to Google Play (.aab)',
    description:
      'Run ./build-playstore.sh via Bubblewrap CLI and upload app-release-bundle.aab to Google Play Console under app.omnisync.hub.',
    status: 'in_progress',
    priority: 'high',
    dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    source: 'manual',
    tags: ['MetaMuse', 'GooglePlay', 'Android'],
  },
  {
    id: 'task-2',
    title: 'Broadcast 528Hz Miracle Tone & Reiki Healing Reel across Meta & TikTok',
    description:
      'Use the Meta Muse Social Broadcast Composer to syndicate the latest 528Hz sound bath session to Instagram Reels, Facebook, Threads, and YouTube Shorts.',
    status: 'in_progress',
    priority: 'high',
    dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    source: 'manual',
    tags: ['MetaMuse', 'Reels', '528Hz', 'Reiki'],
  },
  {
    id: 'task-3',
    title: 'Sync Google Drive Media Folder with Kiki’s World 2.0 Cinema',
    description:
      'Sign in with Google Drive to index all MP4 visualizers, WAV frequency tracks, and Oracle deck artwork into Kiki’s World 2.0.',
    status: 'todo',
    priority: 'high',
    dueDate: new Date(Date.now() + 172800000).toISOString().split('T')[0],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    source: 'drive',
    tags: ['Drive', 'KikisWorld', 'Cinema'],
  },
  {
    id: 'task-4',
    title: 'Auto-Import @grogusmom1989 GitHub Repositories into Meta Muse Store',
    description:
      'Verify all public and starred GitHub repositories appear as launchable creator apps inside the Meta Muse App Store matrix.',
    status: 'done',
    priority: 'high',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    source: 'github',
    tags: ['GitHub', 'MetaMuse', 'Portfolio'],
  },
  {
    id: 'task-5',
    title: 'Calibrate 7-Chakra Meridian Nodes in 1D World & Reiki HQ',
    description:
      'Align Root (396Hz), Heart (639Hz), Third Eye (852Hz), and Crown (963Hz) resonators in the 1D Cellular Automata field.',
    status: 'done',
    priority: 'medium',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    source: 'manual',
    tags: ['1DWorld', 'Reiki', 'Solfeggio'],
  },
  {
    id: 'task-6',
    title: 'Verify Offline Outbox & Conflict Resolution Engine in Sync Center',
    description:
      'Test two-way Firestore cloud sync and side-by-side local vs. cloud conflict resolution in Sync Engine & Logs.',
    status: 'done',
    priority: 'high',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    source: 'manual',
    tags: ['Firestore', 'ConflictResolution', 'BackgroundSync'],
  },
  {
    id: 'task-7',
    title: 'Pin Favorite Google Play & Meta Apps in Universal Shortcut Dock',
    description:
      'Review all 48+ pre-loaded app shortcuts across Meta Muse, Google Play, Apple App Store, and Meta Horizon Store.',
    status: 'todo',
    priority: 'medium',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    source: 'manual',
    tags: ['AppStores', 'Shortcuts', 'MetaMuse'],
  },
  {
    id: 'task-8',
    title: 'Review PayPal Creator Earnings & Distance Reiki Booking Tiers',
    description:
      'Check PayPal checkout links and QR codes for 30-min Chakra Tune-Up ($25), 60-min Quantum Reiki ($55), and Creator VIP Pass ($111).',
    status: 'todo',
    priority: 'medium',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    source: 'manual',
    tags: ['PayPal', 'Earnings', 'CreatorEconomy'],
  },
];

const DEFAULT_NOTES: WorkspaceNote[] = [
  {
    id: 'note-1',
    title: 'Meta Muse Creator App Store & Universal Social OS Blueprint',
    content: `# Meta Muse — Official Creator App Store (@grogusmom1989)\n\nWelcome to **Meta Muse**, your personal App Store and universal social media command center built directly inside **OmniSync Hub**.\n\n### Flagship Apps Included in Your Meta Muse Store\n1. **Meta Muse Store & Social OS** (\`app.metamuse.store\`) — Cross-platform Meta & Social broadcaster + 12 Global App Stores.\n2. **OmniSync Workspace & Cloud Hub** (\`app.omnisync.hub\`) — 24/7 autonomous background sync for Google Drive, GitHub & Firestore.\n3. **1D World & Quantum Reiki HQ** (\`app.metamuse.onedworld\`) — 528Hz Miracle Tone synth, cellular automata & meridian alignment.\n4. **Kiki's World 2.0** (\`app.metamuse.kikisworld\`) — Daily Divine Oracle deck, sacred crystal grid & audio-reactive cinema.\n5. **KikiOS Cyber-Deck** (\`app.metamuse.kikios\`) — Multi-window spatial desktop environment.\n6. **Remixed App Studio & APK Builder** (\`app.metamuse.remixstudio\`) — Rapid app prototyping & Google Play packager.\n7. **Creator Earnings & PayPal Hub** (\`app.metamuse.earnings\`) — Direct creator payouts & session bookings.`,
    tags: ['MetaMuse', 'AppStore', 'Architecture', 'Flagship'],
    updatedAt: new Date().toISOString(),
    pinned: true,
  },
  {
    id: 'note-2',
    title: 'Google Play Store (.aab) & Android TWA Release Guide',
    content: `# Google Play Store Packaging Guide (\`app.omnisync.hub\`)\n\n### 1-Click Automated Build\nDownload **\`build-playstore.sh\`** from the Home screen or Google Play Packager modal and run:\n\`\`\`bash\nchmod +x build-playstore.sh\n./build-playstore.sh\n\`\`\`\n\n### Live Configuration Files\n- **TWA Manifest**: \`/twa-manifest.json\`\n- **Digital Asset Links**: \`/.well-known/assetlinks.json\`\n- **Production URL**: \`https://ais-pre-kbnunw7227i4imww2q3pcc-139265478135.us-west2.run.app\``,
    tags: ['GooglePlay', 'Android', 'Bubblewrap', 'TWA'],
    updatedAt: new Date(Date.now() - 1800000).toISOString(),
    pinned: true,
  },
  {
    id: 'note-3',
    title: '528Hz Solfeggio Frequencies & Quantum Reiki Field Reference',
    content: `# Solfeggio Frequency & Chakra Alignment Reference\n\n- **174 Hz** — Foundation & Physical Comfort\n- **285 Hz** — Quantum Field & Tissue Restoration\n- **396 Hz** — Root Chakra (Muladhara) Liberation\n- **417 Hz** — Sacral Chakra (Svadhisthana) Creative Flow\n- **432 Hz** — Universal Natural Harmonic Tuning\n- **528 Hz** — Solar Plexus / Heart Miracle Tone & DNA Repair\n- **639 Hz** — Heart Chakra (Anahata) Harmonious Relationships\n- **741 Hz** — Throat Chakra (Vishuddha) Pure Expression\n- **852 Hz** — Third Eye (Ajna) Intuitive Awakening\n- **963 Hz** — Crown Chakra (Sahasrara) Divine Connection`,
    tags: ['528Hz', 'Solfeggio', 'Reiki', '1DWorld'],
    updatedAt: new Date(Date.now() - 3600000).toISOString(),
    pinned: true,
  },
  {
    id: 'note-4',
    title: "Kiki's World 2.0 — Crystal Healing Grid & Oracle Card Meanings",
    content: `# Kiki's World 2.0 Spiritual Companion\n\n### Master Crystal Nodes\n- **Amethyst**: Crown & Third Eye protection, transmutation, and intuitive clarity.\n- **Rose Quartz**: Unconditional love, heart meridian soothing, and emotional peace.\n- **Clear Quartz**: Master amplifier programmable for distance Reiki broadcasting.\n- **Citrine**: Solar plexus abundance, creator manifestation, and vitality.\n- **Selenite**: High-vibrationetheric cord cleansing and grid activation.`,
    tags: ['KikisWorld', 'Crystals', 'Oracle', 'Healing'],
    updatedAt: new Date(Date.now() - 5400000).toISOString(),
    pinned: false,
  },
  {
    id: 'note-5',
    title: 'Meta Reels, Instagram, Threads & TikTok Content Calendar',
    content: `# Meta Muse Cross-Platform Content Strategy\n\n- **Daily Morning Drop**: Pull a Daily Divine Oracle Card in Kiki's World 2.0 and broadcast caption + visual to Instagram Stories, Threads & Pinterest.\n- **Midday Build-in-Public**: Share new apps published in the **Meta Muse Creator App Store** & GitHub commits to X, Threads & LinkedIn.\n- **Evening Sound Bath**: Stream 528Hz / 432Hz visualizer from 1D World to YouTube Shorts, TikTok & Facebook Reels.`,
    tags: ['MetaMuse', 'SocialMedia', 'Reels', 'ContentCalendar'],
    updatedAt: new Date(Date.now() - 7200000).toISOString(),
    pinned: false,
  },
];

export const getStoredTasks = (): WorkspaceTask[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TASKS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(DEFAULT_TASKS));
      return DEFAULT_TASKS;
    }
    const parsed: WorkspaceTask[] = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) return DEFAULT_TASKS;
    const existingIds = new Set(parsed.map((t) => t.id));
    const missingDefaults = DEFAULT_TASKS.filter((d) => !existingIds.has(d.id));
    if (missingDefaults.length > 0) {
      const merged = [...parsed, ...missingDefaults];
      localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(merged));
      return merged;
    }
    return parsed;
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
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(DEFAULT_NOTES));
      return DEFAULT_NOTES;
    }
    const parsed: WorkspaceNote[] = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) return DEFAULT_NOTES;
    const existingIds = new Set(parsed.map((n) => n.id));
    const missingDefaults = DEFAULT_NOTES.filter((d) => !existingIds.has(d.id));
    if (missingDefaults.length > 0) {
      const merged = [...parsed, ...missingDefaults];
      localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(merged));
      return merged;
    }
    return parsed;
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
    if (!raw) return DEFAULT_CONFIG;
    const parsed = JSON.parse(raw);
    if (!parsed.githubUsername || parsed.githubUsername === 'torvalds') {
      parsed.githubUsername = 'grogusmom1989';
      localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify({ ...DEFAULT_CONFIG, ...parsed }));
    }
    return { ...DEFAULT_CONFIG, ...parsed };
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
    const parsed: WorkspaceProject[] = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) return DEFAULT_PROJECTS;
    const existingIds = new Set(parsed.map((p) => p.id));
    const missingDefaults = DEFAULT_PROJECTS.filter((d) => !existingIds.has(d.id));
    if (missingDefaults.length > 0) {
      const merged = [...missingDefaults, ...parsed];
      localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(merged));
      return merged;
    }
    return parsed;
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
    id: 'bridge-meta-social-omni',
    name: 'meta_social_media_syndicator',
    sourceModule: 'social',
    targetModule: 'projects',
    title: 'Meta (Facebook, IG, Threads) & Social Media ⇄ OmniSync Hub',
    description: 'Background daemon syncing Meta Business Suite, Instagram Reels, Threads, TikTok, YouTube Shorts, and X posts with Drive media & Portfolio.',
    status: 'active',
    syncMode: 'realtime',
    latencyMs: 9,
    packetsCount: 1248,
    lastEventAt: new Date().toISOString(),
    config: {
      autoCrossPostReels: true,
      metaBusinessSuiteSync: true,
      backgroundOutboxQueue: true,
    },
    enabled: true,
    category: 'media',
  },
  {
    id: 'bridge-omnisync-bus',
    name: 'omnisync_universal_event_bus',
    sourceModule: 'webhook',
    targetModule: 'tasks',
    title: 'OmniSync Universal Event Bus & Webhook Bridge',
    description: 'Central broker dispatching live events, webhook triggers, and notifications across all project workspaces.',
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

// ============================================================================
// Persistent Offline Outbox Queue (localStorage)
// ============================================================================

export const getOutboxItems = (): OutboxItem[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.OUTBOX);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const saveOutboxItems = (items: OutboxItem[]) => {
  try {
    localStorage.setItem(STORAGE_KEYS.OUTBOX, JSON.stringify(items));
  } catch (e) {
    console.error('Failed to save outbox items', e);
  }
};

/**
 * Enqueues a user mutation (task creation/update, note edit, project update, bridge update, or deletion)
 * into the persistent localStorage Outbox. Coalesces repeated updates to the same entity ID so the
 * queue stays compact and ordered chronologically.
 */
export const enqueueOutboxAction = (item: {
  entityType: OutboxItem['entityType'];
  action: OutboxItem['action'];
  entityId: string;
  entityTitle: string;
  payload?: any;
}): OutboxItem[] => {
  try {
    const current = getOutboxItems();
    const existingIndex = current.findIndex(
      (q) => q.entityType === item.entityType && q.entityId === item.entityId
    );

    const nextEntry: OutboxItem = {
      id: `outbox-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      entityType: item.entityType,
      action: item.action,
      entityId: item.entityId,
      entityTitle: item.entityTitle,
      payload: item.payload,
      queuedAt: new Date().toISOString(),
      attempts: 0,
    };

    let updated: OutboxItem[];
    if (existingIndex !== -1) {
      // Coalesce with existing queued mutation for the same entity
      updated = [...current];
      updated[existingIndex] = {
        ...updated[existingIndex],
        action: item.action,
        entityTitle: item.entityTitle,
        payload: item.payload,
        queuedAt: new Date().toISOString(),
      };
    } else {
      updated = [...current, nextEntry];
    }

    saveOutboxItems(updated);
    return updated;
  } catch (e) {
    console.error('Failed to enqueue outbox action', e);
    return getOutboxItems();
  }
};

export const removeOutboxItem = (id: string): OutboxItem[] => {
  const current = getOutboxItems();
  const updated = current.filter((item) => item.id !== id);
  saveOutboxItems(updated);
  return updated;
};

export const markOutboxItemFailed = (id: string, errorMsg: string): OutboxItem[] => {
  const current = getOutboxItems();
  const updated = current.map((item) =>
    item.id === id
      ? {
          ...item,
          attempts: (item.attempts || 0) + 1,
          lastError: errorMsg,
        }
      : item
  );
  saveOutboxItems(updated);
  return updated;
};

export const clearOutbox = (): OutboxItem[] => {
  try {
    localStorage.removeItem(STORAGE_KEYS.OUTBOX);
  } catch (e) {
    console.error('Failed to clear outbox', e);
  }
  return [];
};

// ============================================================================
// Persistent Sync Conflicts Queue (localStorage)
// ============================================================================

export const getSyncConflicts = (): SyncConflict[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CONFLICTS);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const saveSyncConflicts = (conflicts: SyncConflict[]) => {
  try {
    localStorage.setItem(STORAGE_KEYS.CONFLICTS, JSON.stringify(conflicts));
  } catch (e) {
    console.error('Failed to save sync conflicts', e);
  }
};

export const upsertSyncConflict = (conflict: SyncConflict): SyncConflict[] => {
  const current = getSyncConflicts();
  const existingIdx = current.findIndex(
    (c) => c.entityType === conflict.entityType && c.entityId === conflict.entityId
  );
  let updated: SyncConflict[];
  if (existingIdx !== -1) {
    updated = [...current];
    updated[existingIdx] = conflict;
  } else {
    updated = [conflict, ...current];
  }
  saveSyncConflicts(updated);
  return updated;
};

export const removeSyncConflict = (conflictId: string): SyncConflict[] => {
  const current = getSyncConflicts();
  const updated = current.filter((c) => c.id !== conflictId);
  saveSyncConflicts(updated);
  return updated;
};

export const clearSyncConflicts = (): SyncConflict[] => {
  try {
    localStorage.removeItem(STORAGE_KEYS.CONFLICTS);
  } catch (e) {
    console.error('Failed to clear conflicts', e);
  }
  return [];
};

// ============================================================================
// Meta & Universal Social Media Hub Persistence
// ============================================================================

export const DEFAULT_SOCIAL_ACCOUNTS: SocialAccount[] = [
  {
    id: 'meta_facebook',
    name: 'Meta Facebook Page & Groups',
    networkGroup: 'Meta Ecosystem',
    handle: '@grogusmom1989',
    profileUrl: 'https://www.facebook.com',
    studioUrl: 'https://business.facebook.com/latest/home',
    connected: true,
    autoSyncBackground: true,
    followersCount: 'Connected',
    lastSyncedAt: new Date().toISOString(),
    accentColor: 'text-blue-400',
    badgeText: 'Meta Business',
  },
  {
    id: 'meta_instagram',
    name: 'Meta Instagram & Reels',
    networkGroup: 'Meta Ecosystem',
    handle: '@grogusmom1989',
    profileUrl: 'https://www.instagram.com',
    studioUrl: 'https://business.facebook.com/latest/composer',
    connected: true,
    autoSyncBackground: true,
    followersCount: 'Reels & Grid',
    lastSyncedAt: new Date().toISOString(),
    accentColor: 'text-pink-400',
    badgeText: 'IG Creator',
  },
  {
    id: 'meta_threads',
    name: 'Meta Threads',
    networkGroup: 'Meta Ecosystem',
    handle: '@grogusmom1989',
    profileUrl: 'https://www.threads.net',
    studioUrl: 'https://www.threads.net',
    connected: true,
    autoSyncBackground: true,
    followersCount: 'Live Feed',
    lastSyncedAt: new Date().toISOString(),
    accentColor: 'text-slate-200',
    badgeText: 'Threads API',
  },
  {
    id: 'meta_whatsapp',
    name: 'Meta WhatsApp & Broadcast',
    networkGroup: 'Meta Ecosystem',
    handle: 'grogusmom1989@gmail.com',
    profileUrl: 'https://web.whatsapp.com',
    studioUrl: 'https://business.facebook.com',
    connected: true,
    autoSyncBackground: true,
    followersCount: 'Direct Hub',
    lastSyncedAt: new Date().toISOString(),
    accentColor: 'text-emerald-400',
    badgeText: 'Meta Messaging',
  },
  {
    id: 'tiktok',
    name: 'TikTok Creator Studio',
    networkGroup: 'Video & Reels',
    handle: '@grogusmom1989',
    profileUrl: 'https://www.tiktok.com',
    studioUrl: 'https://www.tiktok.com/creator-center',
    connected: true,
    autoSyncBackground: true,
    followersCount: 'Short Video',
    lastSyncedAt: new Date().toISOString(),
    accentColor: 'text-cyan-400',
    badgeText: 'TikTok Sync',
  },
  {
    id: 'youtube',
    name: 'YouTube Channel & Shorts',
    networkGroup: 'Video & Reels',
    handle: '@grogusmom1989',
    profileUrl: 'https://www.youtube.com',
    studioUrl: 'https://studio.youtube.com',
    connected: true,
    autoSyncBackground: true,
    followersCount: '4K & Shorts',
    lastSyncedAt: new Date().toISOString(),
    accentColor: 'text-rose-400',
    badgeText: 'YT Studio',
  },
  {
    id: 'x_twitter',
    name: 'X (Twitter) Creator Feed',
    networkGroup: 'Community & Network',
    handle: '@grogusmom1989',
    profileUrl: 'https://x.com',
    studioUrl: 'https://x.com/compose/post',
    connected: true,
    autoSyncBackground: true,
    followersCount: 'Real-time',
    lastSyncedAt: new Date().toISOString(),
    accentColor: 'text-sky-400',
    badgeText: 'X Stream',
  },
  {
    id: 'pinterest',
    name: 'Pinterest Visual Boards',
    networkGroup: 'Community & Network',
    handle: '@grogusmom1989',
    profileUrl: 'https://www.pinterest.com',
    studioUrl: 'https://www.pinterest.com/pin-builder/',
    connected: true,
    autoSyncBackground: true,
    followersCount: 'Visual Pins',
    lastSyncedAt: new Date().toISOString(),
    accentColor: 'text-red-400',
    badgeText: 'Pin Sync',
  },
  {
    id: 'discord',
    name: 'Discord Community Server',
    networkGroup: 'Community & Network',
    handle: 'grogusmom1989',
    profileUrl: 'https://discord.com/app',
    studioUrl: 'https://discord.com/developers/applications',
    connected: true,
    autoSyncBackground: true,
    followersCount: 'Webhook Bus',
    lastSyncedAt: new Date().toISOString(),
    accentColor: 'text-indigo-400',
    badgeText: 'Discord Bot',
  },
  {
    id: 'linkedin',
    name: 'LinkedIn Creator Portfolio',
    networkGroup: 'Community & Network',
    handle: 'grogusmom1989',
    profileUrl: 'https://www.linkedin.com',
    studioUrl: 'https://www.linkedin.com/feed/',
    connected: true,
    autoSyncBackground: true,
    followersCount: 'Pro Network',
    lastSyncedAt: new Date().toISOString(),
    accentColor: 'text-blue-300',
    badgeText: 'LinkedIn',
  },
];

export const DEFAULT_SOCIAL_POSTS: SocialPost[] = [
  {
    id: 'social-post-1',
    title: 'Meta Muse Creator App Store — Official Launch on Meta & Google Play',
    content:
      "🌟 Pulled from Meta Business Suite & Meta Muse Store: All @grogusmom1989 creator apps (OmniSync Hub, 1D World & 528Hz Reiki HQ, Kiki's World 2.0, KikiOS, Remixed App Studio) are now live in one unified app store with 48+ Google Play & App Store shortcuts!",
    platforms: ['meta_facebook', 'meta_instagram', 'meta_threads', 'meta_whatsapp', 'tiktok', 'youtube'],
    mediaFileName: 'MetaMuse_CreatorStore_Launch_Reel.mp4',
    linkedProjectName: 'Meta Muse — Creator App Store & Social OS',
    sourceModule: 'social',
    autoSyncBackground: true,
    status: 'published',
    createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    tags: ['MetaMuse', 'Meta', 'CreatorAppStore', 'GooglePlay', 'Reels'],
  },
  {
    id: 'social-post-2',
    title: '528Hz Miracle Tone & Quantum Reiki Sound Bath (Meta Reels & Shorts)',
    content:
      "✨ Live from OmniSync Hub & Kiki's World 2.0: 528Hz Solfeggio DNA Repair sound bath & Crystal Healing Grid now streaming! Connect via our Play Store & PWA app.",
    platforms: ['meta_facebook', 'meta_instagram', 'meta_threads', 'tiktok', 'youtube'],
    mediaFileName: 'Kiki_528Hz_Visualizer_Reel.mp4',
    linkedProjectName: "Kiki's World 2.0",
    sourceModule: 'social',
    autoSyncBackground: true,
    status: 'published',
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    tags: ['Meta', 'Reels', '528Hz', 'Reiki', 'KikisWorld'],
  },
  {
    id: 'social-post-3',
    title: 'Zero-Trust Background Sync Daemon & Conflict Resolution Engine',
    content:
      '🚀 Syncing all @grogusmom1989 Meta channels, GitHub repositories, Google Drive folders, and 1D World cellular automata directly in the background with Zero-Trust Firestore cloud backup.',
    platforms: ['meta_threads', 'meta_facebook', 'x_twitter', 'linkedin', 'discord'],
    linkedProjectName: 'OmniSync Hub',
    sourceModule: 'social',
    autoSyncBackground: true,
    status: 'published',
    createdAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
    tags: ['OmniSync', 'MetaThreads', 'GitHub', 'Builder', 'PlayStore'],
  },
  {
    id: 'social-post-4',
    title: 'Daily Divine Feminine Oracle Pull — Sacred Geometry & Moldavite Grid',
    content:
      '🔮 Pulled from Meta Instagram & Pinterest Boards: Today’s Oracle transmission activates the 963Hz Crown Chakra & Metatron’s Cube crystal grid inside Kiki’s World 2.0.',
    platforms: ['meta_instagram', 'meta_facebook', 'pinterest', 'tiktok'],
    mediaFileName: 'Oracle_CrownChakra_963Hz_Grid.png',
    linkedProjectName: 'Meta Muse Quantum Oracle & Tarot Deck',
    sourceModule: 'social',
    autoSyncBackground: true,
    status: 'published',
    createdAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    tags: ['InstagramReels', 'OracleDeck', '963Hz', 'CrystalGrid', 'MetaMuse'],
  },
  {
    id: 'social-post-5',
    title: 'KikiOS Cyber-Deck v1.9 & Remixed App Studio APK Packager',
    content:
      '💻 Multi-window spatial cyber-deck OS with built-in polyphonic frequency synth and 1-click Android Bubblewrap (.aab) Play Store builder now live in Meta Muse!',
    platforms: ['meta_facebook', 'meta_threads', 'youtube', 'x_twitter', 'discord'],
    mediaFileName: 'KikiOS_CyberDeck_Demo.mp4',
    linkedProjectName: 'KikiOS Cyber-Deck Spatial Desktop',
    sourceModule: 'social',
    autoSyncBackground: true,
    status: 'published',
    createdAt: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
    tags: ['KikiOS', 'AndroidAAB', 'GooglePlay', 'MetaHorizon'],
  },
  {
    id: 'social-post-6',
    title: 'Distance Reiki Healing Bookings & Creator VIP Tiers Open',
    content:
      '💖 Book 1-on-1 Quantum Reiki & 528Hz Meridian Alignment sessions or support our open-source Meta Muse creator apps directly via PayPal (@grogusmom1989)!',
    platforms: ['meta_facebook', 'meta_instagram', 'meta_whatsapp', 'meta_threads'],
    linkedProjectName: 'Creator Earnings & PayPal Hub',
    sourceModule: 'social',
    autoSyncBackground: true,
    status: 'published',
    createdAt: new Date(Date.now() - 1000 * 60 * 320).toISOString(),
    tags: ['PayPal', 'ReikiHealing', 'MetaWhatsApp', 'CreatorEconomy'],
  },
];

export const getSocialAccounts = (): SocialAccount[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SOCIAL_ACCOUNTS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.SOCIAL_ACCOUNTS, JSON.stringify(DEFAULT_SOCIAL_ACCOUNTS));
      return DEFAULT_SOCIAL_ACCOUNTS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_SOCIAL_ACCOUNTS;
  } catch {
    return DEFAULT_SOCIAL_ACCOUNTS;
  }
};

export const saveSocialAccounts = (accounts: SocialAccount[]) => {
  try {
    localStorage.setItem(STORAGE_KEYS.SOCIAL_ACCOUNTS, JSON.stringify(accounts));
  } catch (e) {
    console.error('Failed to save social accounts', e);
  }
};

export const getSocialPosts = (): SocialPost[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SOCIAL_POSTS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.SOCIAL_POSTS, JSON.stringify(DEFAULT_SOCIAL_POSTS));
      return DEFAULT_SOCIAL_POSTS;
    }
    const parsed: SocialPost[] = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) return DEFAULT_SOCIAL_POSTS;
    const existingIds = new Set(parsed.map((p) => p.id));
    const missingDefaults = DEFAULT_SOCIAL_POSTS.filter((d) => !existingIds.has(d.id));
    if (missingDefaults.length > 0) {
      const merged = [...parsed, ...missingDefaults];
      localStorage.setItem(STORAGE_KEYS.SOCIAL_POSTS, JSON.stringify(merged));
      return merged;
    }
    return parsed;
  } catch {
    return DEFAULT_SOCIAL_POSTS;
  }
};

export const saveSocialPosts = (posts: SocialPost[]) => {
  try {
    localStorage.setItem(STORAGE_KEYS.SOCIAL_POSTS, JSON.stringify(posts));
  } catch (e) {
    console.error('Failed to save social posts', e);
  }
};





