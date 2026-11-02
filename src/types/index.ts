export type AppTab = 
  | 'overview' 
  | 'drive' 
  | 'github' 
  | 'tasks' 
  | 'notes' 
  | 'timeline' 
  | 'sync' 
  | 'ai';

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

export interface SyncLogEntry {
  id: string;
  timestamp: string;
  source: 'drive' | 'github' | 'all' | 'tasks' | 'notes';
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
  type: 'drive' | 'github_repo' | 'github_issue' | 'task' | 'note';
  title: string;
  subtitle: string;
  date: string;
  url?: string;
  iconType: string;
  raw: any;
}
