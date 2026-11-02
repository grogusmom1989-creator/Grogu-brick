export type AppTab = 
  | 'overview' 
  | 'projects'
  | 'bridges'
  | 'drive' 
  | 'github' 
  | 'tasks' 
  | 'notes' 
  | 'timeline' 
  | 'sync' 
  | 'ai'
  | 'one_d_world'
  | 'kikis_world'
  | 'kikios'
  | 'remix'
  | 'earnings';

export type BridgeModule = 
  | 'drive' 
  | 'github' 
  | 'one_d_world' 
  | 'kikis_world' 
  | 'remix' 
  | 'earnings' 
  | 'projects' 
  | 'tasks' 
  | 'notes' 
  | 'webhook';

export interface ProjectBridge {
  id: string;
  name: string;
  sourceModule: BridgeModule;
  targetModule: BridgeModule;
  title: string;
  description: string;
  status: 'active' | 'syncing' | 'idle' | 'paused';
  syncMode: 'realtime' | 'event_driven' | 'poll' | 'manual';
  latencyMs: number;
  packetsCount: number;
  lastEventAt?: string;
  config: Record<string, any>;
  enabled: boolean;
  category: 'media' | 'code' | 'audio' | 'payment' | 'data' | 'webhook';
}

export interface BridgeEvent {
  id: string;
  bridgeId: string;
  bridgeName: string;
  source: string;
  target: string;
  timestamp: string;
  type: string;
  summary: string;
  payload?: any;
  status: 'delivered' | 'processing' | 'failed';
}

export type ProjectSource = 'github' | 'drive' | 'custom' | 'internal' | 'upload';
export type ProjectStatus = 'active' | 'in_progress' | 'deployed' | 'archived' | 'concept';

export interface WorkspaceProject {
  id: string;
  name: string;
  description: string;
  source: ProjectSource;
  status: ProjectStatus;
  url?: string;
  previewUrl?: string;
  repoFullName?: string;
  driveFolderId?: string;
  driveViewUrl?: string;
  language?: string;
  stars?: number;
  forks?: number;
  openIssues?: number;
  tags: string[];
  techStack: string[];
  lastSyncedAt?: string;
  updatedAt: string;
  createdAt: string;
  isPinned?: boolean;
  notes?: string;
  version?: string;
}

export interface GoogleDriveFile {
  id: string;
  name: string;
  mimeType: string;
  modifiedTime: string;
  size?: string;
  webViewLink?: string;
  iconLink?: string;
  thumbnailLink?: string;
  starred?: boolean;
  owners?: Array<{
    displayName: string;
    emailAddress?: string;
    photoLink?: string;
  }>;
  description?: string;
  shared?: boolean;
}

export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  language: string | null;
  updated_at: string;
  private: boolean;
  default_branch: string;
  topics?: string[];
}

export interface GitHubIssue {
  id: number;
  number: number;
  title: string;
  body: string | null;
  html_url: string;
  state: 'open' | 'closed';
  created_at: string;
  updated_at: string;
  repository_url: string;
  repo_name?: string;
  comments: number;
  labels: Array<{
    name: string;
    color: string;
  }>;
  pull_request?: object;
}

export interface GitHubEvent {
  id: string;
  type: string;
  repo: {
    name: string;
    url: string;
  };
  created_at: string;
  payload?: any;
}

export interface WorkspaceTask {
  id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  createdAt: string;
  source: 'manual' | 'github' | 'drive' | 'ai';
  sourceUrl?: string;
  sourceTitle?: string;
  tags: string[];
}

export interface WorkspaceNote {
  id: string;
  title: string;
  content: string;
  tags: string[];
  updatedAt: string;
  linkedDriveId?: string;
  linkedRepoName?: string;
  pinned?: boolean;
}

export interface OutboxItem {
  id: string;
  entityType: 'task' | 'note' | 'project' | 'bridge';
  action: 'upsert' | 'delete';
  entityId: string;
  entityTitle: string;
  payload?: any;
  queuedAt: string;
  attempts: number;
  lastError?: string;
}

export interface SyncLogEntry {
  id: string;
  timestamp: string;
  source: 'drive' | 'github' | 'all' | 'tasks' | 'notes' | 'outbox';
  status: 'success' | 'warning' | 'error';
  itemCount: number;
  message: string;
  durationMs: number;
}

export interface SyncConfig {
  autoSync: boolean;
  intervalMinutes: number; // 1, 5, 15, 30, 60
  lastSyncDrive?: string;
  lastSyncGitHub?: string;
  lastSyncAll?: string;
  githubUsername?: string;
  githubToken?: string;
}

export interface UnifiedItem {
  id: string;
  type: 'drive' | 'github_repo' | 'github_issue' | 'task' | 'note' | 'one_d';
  title: string;
  subtitle: string;
  date: string;
  url?: string;
  iconType: string;
  raw: any;
}

export interface OneDEntity {
  id: string;
  x: number; // 0 to 1000
  vx: number; // velocity
  energy: number; // 0 to 100
  frequency: number; // Hz (e.g. 528, 432, 639)
  type: 'carrier' | 'healer' | 'pulse' | 'resonator';
  color: string;
  label: string;
}

export interface OneDHealingNode {
  id: string;
  name: string;
  sanskrit: string;
  frequency: number; // Hz
  position: number; // 0 to 100 along the meridian
  color: string;
  description: string;
  affirmation: string;
  alignment: number; // 0 to 100%
}

export interface OneDAutomataConfig {
  rule: number; // 0 to 255 (e.g. 30, 90, 110, 184)
  width: number;
  steps: number;
}

export interface CrystalNode {
  id: string;
  name: string;
  stone: string;
  x: number; // 0 to 100%
  y: number; // 0 to 100%
  frequency: number;
  color: string;
  glowColor: string;
  chakra: string;
  property: string;
  activated: boolean;
}

export interface OracleCard {
  id: string;
  title: string;
  subtitle: string;
  glyph: string;
  color: string;
  frequency: number;
  guidance: string;
  affirmation: string;
  alignmentAction: string;
}

export interface AmbientTrack {
  id: string;
  name: string;
  frequency: number;
  type: 'carrier' | 'binaural' | 'drone' | 'chime';
  volume: number;
  active: boolean;
  color: string;
}

export interface RemixedApp {
  id: string;
  name: string;
  tagline: string;
  version: string;
  baseApp: string; // e.g. "Kiki's World 2.0", "OmniSync Hub", "1D Universe"
  themeColor: string;
  category: 'wellness' | 'developer' | 'media' | 'generative' | 'custom';
  tags: string[];
  config: {
    ambientFrequency?: number;
    visualizerTheme?: string;
    autoSyncEnabled?: boolean;
    syncIntervalMinutes?: number;
    customCodeSnippet?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface PayPalConfig {
  paypalHandle: string; // e.g. "kikireiki" or email
  isEmail: boolean;
  currency: string; // USD, EUR, GBP, CAD
  thankYouMessage: string;
  customTiers: Array<{
    id: string;
    label: string;
    amount: number;
    description: string;
    popular?: boolean;
  }>;
}

export interface HubEarningRecord {
  id: string;
  donorName: string;
  amount: number;
  currency: string;
  date: string;
  source: 'paypal' | 'tip_jar' | 'reiki_session' | 'remix_unlock';
  note?: string;
}




