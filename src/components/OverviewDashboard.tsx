import React, { useState, useMemo } from 'react';
import {
  Cloud,
  Github,
  CheckSquare,
  FileText,
  Star,
  ExternalLink,
  RefreshCw,
  Search,
  Sparkles,
  ArrowRight,
  Plus,
  FolderGit2,
  Share2,
  HardDriveDownload,
  Upload,
  Clock,
  Calendar,
  Globe,
  CheckCircle2,
} from 'lucide-react';
import {
  GoogleDriveFile,
  GitHubRepo,
  GitHubIssue,
  GitHubEvent,
  WorkspaceTask,
  WorkspaceNote,
  SocialPost,
  SocialAccount,
  AppTab,
} from '../types';
import { GoogleSignInButton } from './GoogleSignInButton';
import { User } from 'firebase/auth';
import { GitHubUser } from '../services/github';

interface OverviewDashboardProps {
  onSelectTab: (tab: AppTab) => void;
  onOpenCommand: () => void;
  onSyncAll: () => void;
  onExportWorkspace?: () => void;
  onImportWorkspace?: (file: File) => void;
  isSyncing: boolean;
  googleUser: User | null;
  onGoogleSignIn: () => void;
  githubUser: GitHubUser | null;
  onConfigureGitHub: () => void;
  driveFiles: GoogleDriveFile[];
  githubRepos: GitHubRepo[];
  githubIssues: GitHubIssue[];
  githubEvents?: GitHubEvent[];
  socialPosts?: SocialPost[];
  socialAccounts?: SocialAccount[];
  tasks: WorkspaceTask[];
  notes: WorkspaceNote[];
  pinnedIds: string[];
  projectsCount?: number;
  bridgesCount?: number;
  onOpenNewTaskModal: () => void;
  onUpdateTaskStatus: (id: string, status: any) => void;
}

export const OverviewDashboard: React.FC<OverviewDashboardProps> = ({
  onSelectTab,
  onOpenCommand,
  onSyncAll,
  onExportWorkspace,
  onImportWorkspace,
  isSyncing,
  googleUser,
  onGoogleSignIn,
  githubUser,
  onConfigureGitHub,
  driveFiles,
  githubRepos,
  githubIssues,
  githubEvents = [],
  socialPosts = [],
  socialAccounts = [],
  tasks,
  notes,
  pinnedIds,
  projectsCount = 0,
  onOpenNewTaskModal,
  onUpdateTaskStatus,
}) => {
  const [digestFilter, setDigestFilter] = useState<'all' | 'github' | 'drive' | 'social'>('all');

  // Pinned items
  const pinnedDriveFiles = driveFiles.filter((f) => pinnedIds.includes(`drive-${f.id}`));
  const pinnedRepos = githubRepos.filter((r) => pinnedIds.includes(`repo-${r.id}`));
  const totalPinned = pinnedDriveFiles.length + pinnedRepos.length;

  const pendingTasks = tasks.filter((t) => t.status !== 'done').slice(0, 5);

  // Compute 24-Hour Daily Digest across GitHub, Google Drive, and Social Media
  const dailyDigest = useMemo(() => {
    const cutoff = Date.now() - 24 * 60 * 60 * 1000;

    // 1. GitHub changes in last 24h (or recent fallback so digest is always informative)
    const recentRepos = githubRepos.filter((r) => new Date(r.updated_at).getTime() >= cutoff);
    const recentEvents = githubEvents.filter((e) => new Date(e.created_at).getTime() >= cutoff);
    const recentIssues = githubIssues.filter((i) => new Date(i.updated_at).getTime() >= cutoff);

    const githubItems = [
      ...recentEvents.slice(0, 4).map((e) => ({
        id: `gh-evt-${e.id}`,
        source: 'github' as const,
        title: `${e.type.replace('Event', '')} in ${e.repo.name}`,
        subtitle: e.payload?.commits?.[0]?.message || 'Repository activity recorded',
        timestamp: e.created_at,
        url: `https://github.com/${e.repo.name}`,
      })),
      ...(recentRepos.length > 0 ? recentRepos : githubRepos.slice(0, 3)).map((r) => ({
        id: `gh-repo-${r.id}`,
        source: 'github' as const,
        title: `Repo Updated: ${r.name}`,
        subtitle: r.description || `${r.language || 'Code'} repository synced`,
        timestamp: r.updated_at,
        url: r.html_url,
      })),
      ...recentIssues.slice(0, 2).map((i) => ({
        id: `gh-issue-${i.id}`,
        source: 'github' as const,
        title: `Issue #${i.number}: ${i.title}`,
        subtitle: `State: ${i.state.toUpperCase()}`,
        timestamp: i.updated_at,
        url: i.html_url,
      })),
    ].slice(0, 6);

    // 2. Google Drive changes in last 24h (or top recent files)
    const recentDrive = driveFiles.filter((f) => new Date(f.modifiedTime).getTime() >= cutoff);
    const driveItems = (recentDrive.length > 0 ? recentDrive : driveFiles.slice(0, 4))
      .slice(0, 5)
      .map((f) => ({
        id: `drive-digest-${f.id}`,
        source: 'drive' as const,
        title: f.name,
        subtitle: `Drive File • Modified ${new Date(f.modifiedTime).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        })}`,
        timestamp: f.modifiedTime,
        url: f.webViewLink,
      }));

    // 3. Social Media changes in last 24h (posts & synced accounts)
    const recentSocialPosts = socialPosts.filter(
      (p) => new Date(p.createdAt).getTime() >= cutoff
    );
    const syncedAccounts = socialAccounts.filter(
      (a) => a.connected && a.lastSyncedAt && new Date(a.lastSyncedAt).getTime() >= cutoff
    );

    const socialItems = [
      ...(recentSocialPosts.length > 0 ? recentSocialPosts : socialPosts.slice(0, 3)).map((p) => ({
        id: `social-post-${p.id}`,
        source: 'social' as const,
        title: p.title || p.content.slice(0, 60),
        subtitle: `Syndicated to ${p.platforms.join(', ')} • ${p.status.toUpperCase()}`,
        timestamp: p.createdAt,
        url: undefined,
      })),
      ...syncedAccounts.slice(0, 2).map((a) => ({
        id: `social-acc-${a.id}`,
        source: 'social' as const,
        title: `${a.name} (${a.handle}) Synced`,
        subtitle: `${a.followersCount.toLocaleString()} followers • Feed backed up`,
        timestamp: a.lastSyncedAt || new Date().toISOString(),
        url: a.profileUrl,
      })),
    ].slice(0, 5);

    const allItems = [...githubItems, ...driveItems, ...socialItems].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    return {
      githubItems,
      driveItems,
      socialItems,
      allItems,
    };
  }, [githubRepos, githubEvents, githubIssues, driveFiles, socialPosts, socialAccounts]);

  const displayedDigestItems =
    digestFilter === 'all'
      ? dailyDigest.allItems
      : digestFilter === 'github'
      ? dailyDigest.githubItems
      : digestFilter === 'drive'
      ? dailyDigest.driveItems
      : dailyDigest.socialItems;

  return (
    <div className="space-y-6">
      {/* Kiki Sync Personal Backup Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          <div className="space-y-1.5 max-w-xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Kiki Sync • Personal Backup &amp; Sync Station</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Back up and sync your notes, tasks, code repositories &amp; files in one place.
            </h1>
            <p className="text-xs text-slate-400">
              Instant local snapshots, offline-first storage, and continuous backup across your connected accounts.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {onExportWorkspace && (
              <button
                onClick={onExportWorkspace}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md shadow-emerald-600/20"
              >
                <HardDriveDownload className="w-3.5 h-3.5" />
                <span>Download Backup (.JSON)</span>
              </button>
            )}

            {onImportWorkspace && (
              <label className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs font-medium text-slate-200 flex items-center gap-1.5 cursor-pointer transition-all shadow-sm">
                <Upload className="w-3.5 h-3.5 text-cyan-400" />
                <span>Restore Backup</span>
                <input
                  type="file"
                  accept=".json"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) onImportWorkspace(file);
                  }}
                />
              </label>
            )}

            <button
              onClick={onSyncAll}
              disabled={isSyncing}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium flex items-center gap-2 shadow-md shadow-indigo-600/25 transition-all"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Syncing...' : 'Sync All Backups'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Pillars Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Google Drive Card */}
        <div
          onClick={() => onSelectTab('drive')}
          className="bg-slate-900/90 hover:bg-slate-900 border border-slate-800 hover:border-cyan-500/40 rounded-xl p-4 cursor-pointer transition-all shadow-sm group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 rounded-lg bg-cyan-500/10 text-cyan-400 group-hover:scale-110 transition-transform">
              <Cloud className="w-5 h-5" />
            </div>
            <span
              className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                googleUser ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-500'
              }`}
            >
              {googleUser ? 'Backed Up' : 'Local Cache'}
            </span>
          </div>
          <div className="text-xl font-bold text-white">{driveFiles.length}</div>
          <div className="text-xs text-slate-400 flex items-center justify-between mt-1">
            <span>Cloud Drive Files</span>
            <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-cyan-400" />
          </div>
        </div>

        {/* GitHub Repos Card */}
        <div
          onClick={() => onSelectTab('github')}
          className="bg-slate-900/90 hover:bg-slate-900 border border-slate-800 hover:border-indigo-500/40 rounded-xl p-4 cursor-pointer transition-all shadow-sm group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 rounded-lg bg-indigo-500/10 text-indigo-400 group-hover:scale-110 transition-transform">
              <Github className="w-5 h-5" />
            </div>
            <span
              className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                githubUser ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-500'
              }`}
            >
              {githubUser ? `@${githubUser.login}` : 'Cached'}
            </span>
          </div>
          <div className="text-xl font-bold text-white">{githubRepos.length}</div>
          <div className="text-xs text-slate-400 flex items-center justify-between mt-1">
            <span>GitHub Repositories</span>
            <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-indigo-400" />
          </div>
        </div>

        {/* Action Items Card */}
        <div
          onClick={() => onSelectTab('tasks')}
          className="bg-slate-900/90 hover:bg-slate-900 border border-slate-800 hover:border-emerald-500/40 rounded-xl p-4 cursor-pointer transition-all shadow-sm group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400 group-hover:scale-110 transition-transform">
              <CheckSquare className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400">
              {tasks.filter((t) => t.status === 'done').length}/{tasks.length} Done
            </span>
          </div>
          <div className="text-xl font-bold text-white">{tasks.filter((t) => t.status !== 'done').length}</div>
          <div className="text-xs text-slate-400 flex items-center justify-between mt-1">
            <span>Backed Up Tasks</span>
            <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-emerald-400" />
          </div>
        </div>

        {/* Knowledge & Notes Card */}
        <div
          onClick={() => onSelectTab('notes')}
          className="bg-slate-900/90 hover:bg-slate-900 border border-slate-800 hover:border-purple-500/40 rounded-xl p-4 cursor-pointer transition-all shadow-sm group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 rounded-lg bg-purple-500/10 text-purple-400 group-hover:scale-110 transition-transform">
              <FileText className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400">
              Markdown
            </span>
          </div>
          <div className="text-xl font-bold text-white">{notes.length}</div>
          <div className="text-xs text-slate-400 flex items-center justify-between mt-1">
            <span>Backed Up Notes</span>
            <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-purple-400" />
          </div>
        </div>
      </div>

      {/* Kiki Sync Central Portal — All Modules & Backups in One Unified Portal */}
      <div className="bg-slate-900 border border-indigo-500/30 rounded-2xl p-5 space-y-4 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3.5">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Kiki Sync Central Portal • All Modules &amp; Backups
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Unified Portal
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Everything in Kiki Sync organized into one central portal — click any tile to open or manage your backups.
            </p>
          </div>
          <button
            onClick={onOpenCommand}
            className="px-3 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-700 text-xs text-slate-300 flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Search className="w-3.5 h-3.5 text-indigo-400" />
            <span>Quick Jump (⌘K)</span>
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {[
            {
              id: 'sync' as AppTab,
              title: 'Backup & Sync Vault',
              subtitle: 'Bulk export, conflict resolver & logs',
              badge: 'Core Vault',
              color: 'border-cyan-500/30 hover:border-cyan-400 bg-cyan-950/15 text-cyan-300',
              icon: RefreshCw,
            },
            {
              id: 'notes' as AppTab,
              title: 'Notes & Knowledge',
              subtitle: `${notes.length} markdown notes backed up`,
              badge: `${notes.length} Notes`,
              color: 'border-purple-500/30 hover:border-purple-400 bg-purple-950/15 text-purple-300',
              icon: FileText,
            },
            {
              id: 'tasks' as AppTab,
              title: 'Tasks & Checklist',
              subtitle: `${tasks.length} total tasks saved`,
              badge: `${tasks.filter((t) => t.status !== 'done').length} Active`,
              color: 'border-emerald-500/30 hover:border-emerald-400 bg-emerald-950/15 text-emerald-300',
              icon: CheckSquare,
            },
            {
              id: 'github' as AppTab,
              title: 'GitHub Repositories',
              subtitle: `${githubRepos.length} repos & ${githubIssues.length} issues`,
              badge: githubUser ? `@${githubUser.login}` : 'GitHub',
              color: 'border-indigo-500/30 hover:border-indigo-400 bg-indigo-950/15 text-indigo-300',
              icon: Github,
            },
            {
              id: 'drive' as AppTab,
              title: 'Google Drive Files',
              subtitle: `${driveFiles.length} cloud files indexed`,
              badge: googleUser ? 'Connected' : 'Local Cache',
              color: 'border-sky-500/30 hover:border-sky-400 bg-sky-950/15 text-sky-300',
              icon: Cloud,
            },
            {
              id: 'projects' as AppTab,
              title: 'Saved Projects Archive',
              subtitle: `${projectsCount} projects & manifests`,
              badge: `${projectsCount} Saved`,
              color: 'border-blue-500/30 hover:border-blue-400 bg-blue-950/15 text-blue-300',
              icon: FolderGit2,
            },
            {
              id: 'social' as AppTab,
              title: 'Social & Creator Hub',
              subtitle: `${socialPosts.length} posts & ${socialAccounts.filter((a) => a.connected).length} accounts`,
              badge: 'Social Vault',
              color: 'border-fuchsia-500/30 hover:border-fuchsia-400 bg-fuchsia-950/15 text-fuchsia-300',
              icon: Globe,
            },
            {
              id: 'timeline' as AppTab,
              title: 'Activity History',
              subtitle: 'Chronological backup event stream',
              badge: '24/7 Log',
              color: 'border-amber-500/30 hover:border-amber-400 bg-amber-950/15 text-amber-300',
              icon: Clock,
            },
          ].map((portal) => {
            const Icon = portal.icon;
            return (
              <button
                key={portal.id}
                onClick={() => onSelectTab(portal.id)}
                className={`p-3.5 rounded-xl border text-left transition-all flex flex-col justify-between gap-2.5 group hover:scale-[1.01] ${portal.color}`}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="p-2 rounded-lg bg-slate-950/80 border border-slate-800">
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-950/80 border border-slate-800/80">
                    {portal.badge}
                  </span>
                </div>
                <div>
                  <div className="text-xs font-bold text-white group-hover:underline flex items-center justify-between">
                    <span>{portal.title}</span>
                    <ArrowRight className="w-3 h-3 opacity-70 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{portal.subtitle}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* NEW: Daily Digest (Last 24 Hours Summary across GitHub, Drive & Social Media) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-cyan-400" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Daily Digest • Last 24 Hours Backup Summary
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                24h Window
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Consolidated summary of all changes across GitHub repositories, Google Drive files, and Social Media from the previous 24 hours.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs self-start sm:self-auto">
            <button
              onClick={() => setDigestFilter('all')}
              className={`px-2.5 py-1 rounded-md font-medium transition ${
                digestFilter === 'all'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All ({dailyDigest.allItems.length})
            </button>
            <button
              onClick={() => setDigestFilter('github')}
              className={`px-2.5 py-1 rounded-md font-medium transition flex items-center gap-1 ${
                digestFilter === 'github'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Github className="w-3 h-3" />
              <span>GitHub ({dailyDigest.githubItems.length})</span>
            </button>
            <button
              onClick={() => setDigestFilter('drive')}
              className={`px-2.5 py-1 rounded-md font-medium transition flex items-center gap-1 ${
                digestFilter === 'drive'
                  ? 'bg-cyan-600 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Cloud className="w-3 h-3" />
              <span>Drive ({dailyDigest.driveItems.length})</span>
            </button>
            <button
              onClick={() => setDigestFilter('social')}
              className={`px-2.5 py-1 rounded-md font-medium transition flex items-center gap-1 ${
                digestFilter === 'social'
                  ? 'bg-fuchsia-600 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Globe className="w-3 h-3" />
              <span>Social ({dailyDigest.socialItems.length})</span>
            </button>
          </div>
        </div>

        {/* 3-Column Digest Summary Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                <Github className="w-3.5 h-3.5 text-indigo-400" />
                <span>GitHub Changes (24h)</span>
              </div>
              <div className="text-base font-bold text-white">
                {dailyDigest.githubItems.length} updates
              </div>
              <div className="text-[10px] text-slate-500">Commits, repo pushes &amp; issues</div>
            </div>
            <button
              onClick={() => onSelectTab('github')}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-medium"
            >
              View →
            </button>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                <Cloud className="w-3.5 h-3.5 text-cyan-400" />
                <span>Drive Documents (24h)</span>
              </div>
              <div className="text-base font-bold text-white">
                {dailyDigest.driveItems.length} files synced
              </div>
              <div className="text-[10px] text-slate-500">Indexed &amp; cached snapshots</div>
            </div>
            <button
              onClick={() => onSelectTab('drive')}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-medium"
            >
              View →
            </button>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                <Share2 className="w-3.5 h-3.5 text-fuchsia-400" />
                <span>Social Media Activity (24h)</span>
              </div>
              <div className="text-base font-bold text-white">
                {dailyDigest.socialItems.length} posts &amp; syncs
              </div>
              <div className="text-[10px] text-slate-500">Backed up social dispatches</div>
            </div>
            <button
              onClick={() => onSelectTab('social')}
              className="text-xs text-fuchsia-400 hover:text-fuchsia-300 font-medium"
            >
              View →
            </button>
          </div>
        </div>

        {/* Digest Feed List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-1">
          {displayedDigestItems.slice(0, 8).map((item) => (
            <div
              key={item.id}
              className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/90 hover:border-slate-700 flex items-center justify-between gap-3 transition"
            >
              <div className="flex items-start gap-2.5 min-w-0">
                <div
                  className={`p-2 rounded-lg shrink-0 mt-0.5 ${
                    item.source === 'github'
                      ? 'bg-indigo-500/10 text-indigo-400'
                      : item.source === 'drive'
                      ? 'bg-cyan-500/10 text-cyan-400'
                      : 'bg-fuchsia-500/10 text-fuchsia-400'
                  }`}
                >
                  {item.source === 'github' ? (
                    <Github className="w-3.5 h-3.5" />
                  ) : item.source === 'drive' ? (
                    <Cloud className="w-3.5 h-3.5" />
                  ) : (
                    <Globe className="w-3.5 h-3.5" />
                  )}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-slate-100 truncate">{item.title}</div>
                  <div className="text-[11px] text-slate-400 truncate">{item.subtitle}</div>
                  <div className="text-[10px] text-slate-500 font-mono flex items-center gap-1 mt-0.5">
                    <Clock className="w-2.5 h-2.5" />
                    <span>{new Date(item.timestamp).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {item.url && (
                <a
                  href={item.url}
                  target="_blank"
                  rel="noreferrer"
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 shrink-0"
                  title="Open source item"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Main Grid: Pinned Backups & Priority Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (8 cols): Pinned Board & Saved Projects */}
        <div className="lg:col-span-8 space-y-6">
          {/* Pinned Items Board */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-200">
                  Pinned Backup Items ({totalPinned})
                </h3>
              </div>
              <span className="text-[11px] text-slate-400">Star items in Drive or GitHub to pin here</span>
            </div>

            {totalPinned === 0 ? (
              <div className="py-8 text-center border border-dashed border-slate-800 rounded-lg text-slate-500 text-xs space-y-1">
                <p>No pinned items yet.</p>
                <p className="text-[11px]">
                  Click the star icon next to any Google Drive file or GitHub repo to keep it handy.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {pinnedDriveFiles.map((file) => (
                  <div
                    key={file.id}
                    className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg hover:border-slate-700 flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <Cloud className="w-4 h-4 text-cyan-400 shrink-0" />
                      <span className="text-xs text-slate-200 truncate font-medium">{file.name}</span>
                    </div>
                    {file.webViewLink && (
                      <a
                        href={file.webViewLink}
                        target="_blank"
                        rel="noreferrer"
                        className="text-slate-400 hover:text-white p-1"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                ))}

                {pinnedRepos.map((repo) => (
                  <div
                    key={repo.id}
                    className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg hover:border-slate-700 flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <Github className="w-4 h-4 text-indigo-400 shrink-0" />
                      <span className="text-xs text-slate-200 truncate font-medium">{repo.name}</span>
                    </div>
                    <a
                      href={repo.html_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-slate-400 hover:text-white p-1"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Saved Projects Backup Card */}
          <div className="bg-gradient-to-r from-indigo-950/40 via-slate-900 to-cyan-950/30 border border-indigo-500/30 rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-mono border border-indigo-500/30">
                  {projectsCount} Saved Projects
                </span>
              </div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-white flex items-center gap-1.5">
                <FolderGit2 className="w-4 h-4 text-indigo-400" />
                <span>Saved Projects &amp; Repositories Archive</span>
              </h3>
              <p className="text-xs text-slate-300">
                Keep a complete catalog of your GitHub repositories, Drive folders, and custom project manifests.
              </p>
            </div>

            <button
              onClick={() => onSelectTab('projects')}
              className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white rounded-lg text-xs font-semibold whitespace-nowrap shadow-md shadow-indigo-600/20 flex items-center gap-1.5 transition-all"
            >
              <span>Open Projects ({projectsCount})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right Column (4 cols): Active Action Items & Connection Hub */}
        <div className="lg:col-span-4 space-y-6">
          {/* Priority Action Items */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
                <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />
                <span>Active Tasks &amp; Checklist</span>
              </h3>
              <button
                onClick={onOpenNewTaskModal}
                className="text-slate-400 hover:text-white p-1 rounded"
                title="New Task"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              {pendingTasks.map((t) => (
                <div
                  key={t.id}
                  className="p-2.5 bg-slate-950/60 border border-slate-800 rounded-lg flex items-start gap-2.5"
                >
                  <input
                    type="checkbox"
                    checked={t.status === 'done'}
                    onChange={() => onUpdateTaskStatus(t.id, t.status === 'done' ? 'todo' : 'done')}
                    className="mt-0.5 accent-indigo-600 cursor-pointer rounded"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-medium text-slate-200 line-clamp-1">{t.title}</div>
                    <div className="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5">
                      <span className="capitalize">{t.source}</span>
                      <span>•</span>
                      <span className="text-amber-400">{t.priority}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => onSelectTab('tasks')}
              className="w-full text-center text-xs text-indigo-400 hover:text-indigo-300 font-medium pt-1"
            >
              View all tasks ({tasks.length}) →
            </button>
          </div>

          {/* Quick Connect Helper if disconnected */}
          {(!googleUser || !githubUser) && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                Backup Sources Setup
              </h3>

              {!googleUser && (
                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-2">
                  <div className="text-xs font-medium text-slate-200">Google Drive Backup</div>
                  <GoogleSignInButton onClick={onGoogleSignIn} />
                </div>
              )}

              {!githubUser && (
                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-2">
                  <div className="text-xs font-medium text-slate-200">GitHub Backup</div>
                  <button
                    onClick={onConfigureGitHub}
                    className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-xs font-medium text-white rounded-lg flex items-center justify-center gap-2 border border-slate-700"
                  >
                    <Github className="w-3.5 h-3.5" />
                    <span>Connect GitHub Account</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
