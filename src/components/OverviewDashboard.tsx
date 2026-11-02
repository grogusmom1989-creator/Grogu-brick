import React from 'react';
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
  Activity,
  Layers,
  CircleDot,
  FileCheck,
  Compass,
  Heart,
  Film,
  Code2,
  DollarSign,
  FolderGit2,
  Share2,
  Zap,
} from 'lucide-react';
import { GoogleDriveFile, GitHubRepo, GitHubIssue, WorkspaceTask, WorkspaceNote, AppTab } from '../types';
import { GoogleSignInButton } from './GoogleSignInButton';
import { User } from 'firebase/auth';
import { GitHubUser } from '../services/github';

interface OverviewDashboardProps {
  onSelectTab: (tab: AppTab) => void;
  onOpenCommand: () => void;
  onSyncAll: () => void;
  isSyncing: boolean;
  googleUser: User | null;
  onGoogleSignIn: () => void;
  githubUser: GitHubUser | null;
  onConfigureGitHub: () => void;
  driveFiles: GoogleDriveFile[];
  githubRepos: GitHubRepo[];
  githubIssues: GitHubIssue[];
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
  isSyncing,
  googleUser,
  onGoogleSignIn,
  githubUser,
  onConfigureGitHub,
  driveFiles,
  githubRepos,
  githubIssues,
  tasks,
  notes,
  pinnedIds,
  projectsCount = 0,
  bridgesCount = 10,
  onOpenNewTaskModal,
  onUpdateTaskStatus,
}) => {
  // Pinned items
  const pinnedDriveFiles = driveFiles.filter((f) => pinnedIds.includes(`drive-${f.id}`));
  const pinnedRepos = githubRepos.filter((r) => pinnedIds.includes(`repo-${r.id}`));
  const totalPinned = pinnedDriveFiles.length + pinnedRepos.length;

  const pendingTasks = tasks.filter((t) => t.status !== 'done').slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          <div className="space-y-1.5 max-w-xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Unified Workspace Command Center</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              All your Drive files, GitHub repos, notes & tasks in one continuous sync.
            </h1>
            <p className="text-xs text-slate-400">
              Integrated real-time synchronization with instant global search, AI briefing, and keyboard shortcuts.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={() => onSelectTab('social')}
              className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-emerald-500/20"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Meta &amp; App Stores</span>
            </button>

            <button
              onClick={onOpenCommand}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs font-medium text-slate-200 flex items-center gap-2 transition-all shadow-sm"
            >
              <Search className="w-3.5 h-3.5 text-indigo-400" />
              <span>Omnibar (Cmd+K)</span>
            </button>

            <button
              onClick={onSyncAll}
              disabled={isSyncing}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium flex items-center gap-2 shadow-md shadow-indigo-600/25 transition-all"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Syncing...' : 'Sync Everything'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Instant Meta, Social Media & Every App Store Shortcut Bar */}
      <div className="bg-gradient-to-r from-blue-950/60 via-indigo-950/50 to-emerald-950/50 border border-indigo-500/30 rounded-2xl p-4 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-[10px] font-bold uppercase tracking-wider">
              Background Daemon Active
            </span>
            <span className="text-xs font-bold text-white">
              Meta Ecosystem, Social Media &amp; Universal App Store Shortcuts
            </span>
          </div>
          <p className="text-[11px] text-slate-300">
            1-click access to Google Play Store, Apple App Store, Meta Business Suite, Instagram, Threads, Facebook, WhatsApp, TikTok, YouTube &amp; 25+ apps.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <a
            href="https://play.google.com/store/apps"
            target="_blank"
            rel="noreferrer"
            className="px-3 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-1"
          >
            <span>Google Play</span>
            <ExternalLink className="w-3 h-3" />
          </a>
          <a
            href="https://www.apple.com/app-store/"
            target="_blank"
            rel="noreferrer"
            className="px-3 py-1.5 rounded-lg bg-blue-500/15 hover:bg-blue-500/25 border border-blue-500/30 text-blue-300 text-xs font-semibold flex items-center gap-1"
          >
            <span>App Store</span>
            <ExternalLink className="w-3 h-3" />
          </a>
          <a
            href="https://business.facebook.com/latest/home"
            target="_blank"
            rel="noreferrer"
            className="px-3 py-1.5 rounded-lg bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-500/30 text-indigo-300 text-xs font-semibold flex items-center gap-1"
          >
            <span>Meta Suite</span>
            <ExternalLink className="w-3 h-3" />
          </a>
          <button
            onClick={() => onSelectTab('social')}
            className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-pink-600 hover:from-blue-500 hover:to-pink-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm"
          >
            <span>Open All 25+ App Shortcuts</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
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
              {googleUser ? 'Active' : 'Offline'}
            </span>
          </div>
          <div className="text-xl font-bold text-white">{driveFiles.length}</div>
          <div className="text-xs text-slate-400 flex items-center justify-between mt-1">
            <span>Google Drive Files</span>
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
              {githubUser ? `@${githubUser.login}` : 'Offline'}
            </span>
          </div>
          <div className="text-xl font-bold text-white">{githubRepos.length}</div>
          <div className="text-xs text-slate-400 flex items-center justify-between mt-1">
            <span>Repositories ({githubIssues.length} issues)</span>
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
            <span>Pending Action Items</span>
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
            <span>Knowledge Base Notes</span>
            <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-purple-400" />
          </div>
        </div>
      </div>

      {/* Main Grid: Pinned Workspaces & Priority Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (8 cols): Pinned Board & Quick AI Briefing */}
        <div className="lg:col-span-8 space-y-6">
          {/* Pinned Items Board */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-200">
                  Pinned Workspace Board ({totalPinned})
                </h3>
              </div>
              <span className="text-[11px] text-slate-400">Star items in Drive or GitHub to pin here</span>
            </div>

            {totalPinned === 0 ? (
              <div className="py-8 text-center border border-dashed border-slate-800 rounded-lg text-slate-500 text-xs space-y-1">
                <p>No pinned items yet.</p>
                <p className="text-[11px]">Click the star icon next to any Google Drive file or GitHub repo to keep it handy.</p>
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

          {/* Quick AI Workspace Intelligence Card */}
          <div className="bg-gradient-to-r from-indigo-950/40 via-purple-950/20 to-slate-900 border border-indigo-500/20 rounded-xl p-5 flex items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-indigo-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>AI Workspace Intelligence</span>
              </h3>
              <p className="text-xs text-slate-300">
                Ready to review your recent code commits, issues, and Drive documents with Gemini 3.8 Flash.
              </p>
            </div>

            <button
              onClick={() => onSelectTab('ai')}
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium whitespace-nowrap shadow-sm flex items-center gap-1.5"
            >
              <span>Open Copilot</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* My Projects & Repositories Portfolio Card */}
          <div className="bg-gradient-to-r from-indigo-950/40 via-slate-900 to-cyan-950/30 border border-indigo-500/30 rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-mono border border-indigo-500/30">
                  {projectsCount} Projects in Hub
                </span>
              </div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-white flex items-center gap-1.5">
                <FolderGit2 className="w-4 h-4 text-indigo-400" />
                <span>My Projects & Repositories Portfolio</span>
              </h3>
              <p className="text-xs text-slate-300">
                Pull in all your own projects from GitHub, Google Drive, and custom manifests into your centralized portfolio with live in-app preview.
              </p>
            </div>

            <button
              onClick={() => onSelectTab('projects')}
              className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white rounded-lg text-xs font-semibold whitespace-nowrap shadow-md shadow-indigo-600/20 flex items-center gap-1.5 transition-all"
            >
              <span>View Projects ({projectsCount})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* 1D World & Kiki Reiki HQ Portal Card */}
          <div className="bg-gradient-to-r from-cyan-950/30 via-slate-900 to-indigo-950/30 border border-cyan-500/20 rounded-xl p-5 flex items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-cyan-300 flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-cyan-400" />
                <span>1D World & Kiki 1D Network Healing Reiki HQ</span>
              </h3>
              <p className="text-xs text-slate-300">
                Continuous 1D particle physics simulator, 7-node Solfeggio sound meridian alignment, and Wolfram 1D automata.
              </p>
            </div>

            <button
              onClick={() => onSelectTab('one_d_world')}
              className="px-3.5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-medium whitespace-nowrap shadow-sm flex items-center gap-1.5"
            >
              <span>Enter 1D World</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Kiki's World 2.0 Content Theater & Media Card */}
          <div className="bg-gradient-to-r from-purple-950/30 via-slate-900 to-pink-950/30 border border-purple-500/25 rounded-xl p-5 flex items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
                <Film className="w-3.5 h-3.5 text-pink-400" />
                <span>Kiki's World 2.0 • Content Theater & Media Player</span>
              </h3>
              <p className="text-xs text-slate-300">
                Play your Google Drive videos and music, stream Solfeggio soundscapes, view all content, and activate the 2.0 Crystal Grid.
              </p>
            </div>

            <button
              onClick={() => onSelectTab('kikis_world')}
              className="px-3.5 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-lg text-xs font-semibold whitespace-nowrap shadow-md shadow-purple-500/20 flex items-center gap-1.5"
            >
              <span>Enter 2.0 Theater</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* 3-Column Subgrid: Connectors & Bridges, Remixed App Studio & PayPal Earnings */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Connectors & Bridges Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between space-y-3">
              <div>
                <h4 className="text-xs font-bold text-white flex items-center gap-1.5 uppercase tracking-wider">
                  <Share2 className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Connectors & Bridges</span>
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                  Active data pipes and event buses bridging Drive, GitHub, 1D Sound, Kiki 2.0, and PayPal.
                </p>
                <div className="mt-2 inline-flex items-center gap-1.5 text-[10px] font-mono text-cyan-400 bg-cyan-950/40 border border-cyan-800/40 px-2 py-0.5 rounded">
                  <Zap className="w-3 h-3 text-cyan-300" />
                  <span>{bridgesCount} Active Bridges</span>
                </div>
              </div>

              <button
                onClick={() => onSelectTab('bridges')}
                className="w-full py-2 bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/30 text-xs font-medium rounded-lg flex items-center justify-center gap-1 transition-colors"
              >
                <span>Open Bridges Hub</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Remixed App Studio Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between space-y-3">
              <div>
                <h4 className="text-xs font-bold text-white flex items-center gap-1.5 uppercase tracking-wider">
                  <Code2 className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Remixed App Studio</span>
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                  Customize and launch remixed codebases, applet extensions, and live sandbox presets.
                </p>
              </div>

              <button
                onClick={() => onSelectTab('remix')}
                className="w-full py-2 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-medium rounded-lg flex items-center justify-center gap-1 transition-colors"
              >
                <span>Open Remixer Studio</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* PayPal Creator Earnings Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between space-y-3">
              <div>
                <h4 className="text-xs font-bold text-white flex items-center gap-1.5 uppercase tracking-wider">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                  <span>PayPal Creator Earnings</span>
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                  Monetize your hub with PayPal tips, Reiki session energy exchanges, and sponsorships.
                </p>
              </div>

              <button
                onClick={() => onSelectTab('earnings')}
                className="w-full py-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-medium rounded-lg flex items-center justify-center gap-1 transition-colors"
              >
                <span>View PayPal Revenue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Column (4 cols): Active Action Items & Connection Hub */}
        <div className="lg:col-span-4 space-y-6">
          {/* Priority Action Items */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
                <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />
                <span>Active Priorities</span>
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
                Setup Next Workspaces
              </h3>

              {!googleUser && (
                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-2">
                  <div className="text-xs font-medium text-slate-200">Google Drive Disconnected</div>
                  <GoogleSignInButton onClick={onGoogleSignIn} />
                </div>
              )}

              {!githubUser && (
                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-2">
                  <div className="text-xs font-medium text-slate-200">GitHub Disconnected</div>
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
