import { WorkspaceTask, WorkspaceNote, SyncConfig, SyncLogEntry, GoogleDriveFile } from '../types';
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
};

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
