import React, { useState, useRef, useEffect } from 'react';
import {
  RefreshCw,
  Search,
  Cloud,
  Github,
  Menu,
  Lock,
  CheckSquare,
  FileText,
  X,
  ExternalLink,
  HardDriveDownload,
  ArrowRight,
} from 'lucide-react';
import { User } from 'firebase/auth';
import { GitHubUser } from '../services/github';
import { WorkspaceTask, WorkspaceNote, GitHubRepo, AppTab } from '../types';

interface NavbarProps {
  onOpenCommand: () => void;
  onSyncAll: () => void;
  onExportWorkspace?: () => void;
  isSyncing: boolean;
  syncCountdown: number;
  autoSyncEnabled: boolean;
  googleUser: User | null;
  githubUser: GitHubUser | null;
  onToggleSidebar: () => void;
  tasks?: WorkspaceTask[];
  notes?: WorkspaceNote[];
  githubRepos?: GitHubRepo[];
  onSelectTab?: (tab: AppTab) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenCommand,
  onSyncAll,
  onExportWorkspace,
  isSyncing,
  syncCountdown,
  autoSyncEnabled,
  googleUser,
  githubUser,
  onToggleSidebar,
  tasks = [],
  notes = [],
  githubRepos = [],
  onSelectTab,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [activeCategory, setActiveCategory] = useState<'all' | 'tasks' | 'notes' | 'github'>('all');
  const searchContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const q = searchQuery.trim().toLowerCase();

  const filteredTasks = q
    ? tasks.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          (t.description && t.description.toLowerCase().includes(q)) ||
          t.tags?.some((tag) => tag.toLowerCase().includes(q))
      )
    : [];

  const filteredNotes = q
    ? notes.filter(
        (n) =>
          n.title.toLowerCase().includes(q) ||
          n.content.toLowerCase().includes(q) ||
          n.tags?.some((tag) => tag.toLowerCase().includes(q))
      )
    : [];

  const filteredRepos = q
    ? githubRepos.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.full_name.toLowerCase().includes(q) ||
          (r.description && r.description.toLowerCase().includes(q)) ||
          (r.language && r.language.toLowerCase().includes(q))
      )
    : [];

  const totalMatches = filteredTasks.length + filteredNotes.length + filteredRepos.length;

  return (
    <header className="sticky top-0 z-30 h-14 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 flex items-center justify-between px-4 sm:px-6">
      {/* Left: Menu & Kiki Sync Logo */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg"
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 p-0.5 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[6px] flex items-center justify-center">
              <RefreshCw className="w-4 h-4 text-cyan-400 animate-[spin_10s_linear_infinite]" />
            </div>
          </div>
          <div>
            <span className="font-bold text-sm tracking-tight text-white flex items-center gap-1.5">
              Kiki Sync{' '}
              <span className="text-[10px] uppercase font-semibold tracking-wider px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                Backup Hub
              </span>
            </span>
          </div>
        </div>
      </div>

      {/* Middle: Live Global Search across Tasks, Notes & GitHub Repositories simultaneously */}
      <div ref={searchContainerRef} className="relative flex-1 max-w-xl mx-4">
        <div className="relative flex items-center">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onFocus={() => setIsSearchFocused(true)}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsSearchFocused(true);
            }}
            placeholder="Filter tasks, notes & GitHub repositories simultaneously..."
            className="w-full h-9 bg-slate-800/90 hover:bg-slate-800 focus:bg-slate-950 border border-slate-700/80 focus:border-indigo-500 rounded-lg pl-8 pr-20 text-xs text-slate-100 placeholder-slate-400 focus:outline-none transition-all shadow-inner"
          />
          <div className="absolute right-2 flex items-center gap-1">
            {searchQuery ? (
              <button
                onClick={() => setSearchQuery('')}
                className="p-1 text-slate-400 hover:text-white rounded"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={onOpenCommand}
                className="hidden md:inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-mono font-medium text-slate-400 hover:text-slate-200 bg-slate-900 border border-slate-700 rounded shadow-sm"
                title="Open Command Palette (Cmd+K)"
              >
                <span>⌘</span>K
              </button>
            )}
          </div>
        </div>

        {/* Simultaneous Search Results Popover */}
        {isSearchFocused && q.length > 0 && (
          <div className="absolute left-0 right-0 mt-2 bg-slate-900 border border-slate-700/90 rounded-xl shadow-2xl overflow-hidden z-50 max-h-[75vh] flex flex-col">
            {/* Filter Category Pills */}
            <div className="flex items-center justify-between px-3 py-2 bg-slate-950/90 border-b border-slate-800 text-[11px]">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setActiveCategory('all')}
                  className={`px-2 py-0.5 rounded font-medium transition ${
                    activeCategory === 'all'
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-400 hover:text-slate-200 bg-slate-900'
                  }`}
                >
                  All ({totalMatches})
                </button>
                <button
                  onClick={() => setActiveCategory('tasks')}
                  className={`px-2 py-0.5 rounded font-medium transition flex items-center gap-1 ${
                    activeCategory === 'tasks'
                      ? 'bg-emerald-600 text-white'
                      : 'text-slate-400 hover:text-slate-200 bg-slate-900'
                  }`}
                >
                  <CheckSquare className="w-3 h-3" />
                  <span>Tasks ({filteredTasks.length})</span>
                </button>
                <button
                  onClick={() => setActiveCategory('notes')}
                  className={`px-2 py-0.5 rounded font-medium transition flex items-center gap-1 ${
                    activeCategory === 'notes'
                      ? 'bg-purple-600 text-white'
                      : 'text-slate-400 hover:text-slate-200 bg-slate-900'
                  }`}
                >
                  <FileText className="w-3 h-3" />
                  <span>Notes ({filteredNotes.length})</span>
                </button>
                <button
                  onClick={() => setActiveCategory('github')}
                  className={`px-2 py-0.5 rounded font-medium transition flex items-center gap-1 ${
                    activeCategory === 'github'
                      ? 'bg-indigo-500 text-white'
                      : 'text-slate-400 hover:text-slate-200 bg-slate-900'
                  }`}
                >
                  <Github className="w-3 h-3" />
                  <span>GitHub ({filteredRepos.length})</span>
                </button>
              </div>
              <button
                onClick={() => {
                  setIsSearchFocused(false);
                  onOpenCommand();
                }}
                className="text-indigo-400 hover:text-indigo-300 font-mono text-[10px]"
              >
                Full Search ⌘K
              </button>
            </div>

            <div className="overflow-y-auto p-3 space-y-4 divide-y divide-slate-800/60">
              {totalMatches === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  No matching tasks, notes, or GitHub repositories found for &ldquo;{searchQuery}&rdquo;.
                </div>
              ) : (
                <>
                  {/* Tasks Section */}
                  {(activeCategory === 'all' || activeCategory === 'tasks') &&
                    filteredTasks.length > 0 && (
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-wider text-emerald-400 px-1">
                          <span className="flex items-center gap-1">
                            <CheckSquare className="w-3 h-3" /> Tasks ({filteredTasks.length})
                          </span>
                          {onSelectTab && (
                            <button
                              onClick={() => {
                                onSelectTab('tasks');
                                setIsSearchFocused(false);
                              }}
                              className="hover:underline flex items-center gap-0.5"
                            >
                              View Tasks <ArrowRight className="w-2.5 h-2.5" />
                            </button>
                          )}
                        </div>
                        <div className="space-y-1">
                          {filteredTasks.slice(0, 5).map((task) => (
                            <div
                              key={task.id}
                              onClick={() => {
                                onSelectTab?.('tasks');
                                setIsSearchFocused(false);
                              }}
                              className="p-2 rounded-lg bg-slate-950/70 hover:bg-slate-800/80 border border-slate-800/80 flex items-center justify-between gap-2 cursor-pointer transition"
                            >
                              <div className="min-w-0">
                                <div className="text-xs font-medium text-slate-100 truncate">
                                  {task.title}
                                </div>
                                <div className="text-[10px] text-slate-400 flex items-center gap-2">
                                  <span className="uppercase font-mono text-emerald-400">
                                    {task.status}
                                  </span>
                                  <span>•</span>
                                  <span>Priority: {task.priority}</span>
                                </div>
                              </div>
                              <ArrowRight className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  {/* Notes Section */}
                  {(activeCategory === 'all' || activeCategory === 'notes') &&
                    filteredNotes.length > 0 && (
                      <div className="pt-2 space-y-1.5">
                        <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-wider text-purple-400 px-1">
                          <span className="flex items-center gap-1">
                            <FileText className="w-3 h-3" /> Notes ({filteredNotes.length})
                          </span>
                          {onSelectTab && (
                            <button
                              onClick={() => {
                                onSelectTab('notes');
                                setIsSearchFocused(false);
                              }}
                              className="hover:underline flex items-center gap-0.5"
                            >
                              View Notes <ArrowRight className="w-2.5 h-2.5" />
                            </button>
                          )}
                        </div>
                        <div className="space-y-1">
                          {filteredNotes.slice(0, 5).map((note) => (
                            <div
                              key={note.id}
                              onClick={() => {
                                onSelectTab?.('notes');
                                setIsSearchFocused(false);
                              }}
                              className="p-2 rounded-lg bg-slate-950/70 hover:bg-slate-800/80 border border-slate-800/80 flex items-center justify-between gap-2 cursor-pointer transition"
                            >
                              <div className="min-w-0">
                                <div className="text-xs font-medium text-slate-100 truncate">
                                  {note.title}
                                </div>
                                <div className="text-[10px] text-slate-400 truncate">
                                  {note.content.slice(0, 80)}
                                </div>
                              </div>
                              <ArrowRight className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  {/* Connected GitHub Repositories Section */}
                  {(activeCategory === 'all' || activeCategory === 'github') &&
                    filteredRepos.length > 0 && (
                      <div className="pt-2 space-y-1.5">
                        <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-wider text-indigo-400 px-1">
                          <span className="flex items-center gap-1">
                            <Github className="w-3 h-3" /> Connected GitHub Repositories (
                            {filteredRepos.length})
                          </span>
                          {onSelectTab && (
                            <button
                              onClick={() => {
                                onSelectTab('github');
                                setIsSearchFocused(false);
                              }}
                              className="hover:underline flex items-center gap-0.5"
                            >
                              View GitHub <ArrowRight className="w-2.5 h-2.5" />
                            </button>
                          )}
                        </div>
                        <div className="space-y-1">
                          {filteredRepos.slice(0, 5).map((repo) => (
                            <div
                              key={repo.id}
                              onClick={() => {
                                onSelectTab?.('github');
                                setIsSearchFocused(false);
                              }}
                              className="p-2 rounded-lg bg-slate-950/70 hover:bg-slate-800/80 border border-slate-800/80 flex items-center justify-between gap-2 cursor-pointer transition"
                            >
                              <div className="min-w-0">
                                <div className="text-xs font-medium text-slate-100 truncate flex items-center gap-1.5">
                                  <span>{repo.name}</span>
                                  {repo.language && (
                                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 font-mono">
                                      {repo.language}
                                    </span>
                                  )}
                                </div>
                                <div className="text-[10px] text-slate-400 truncate">
                                  {repo.description || repo.full_name}
                                </div>
                              </div>
                              <a
                                href={repo.html_url}
                                target="_blank"
                                rel="noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="p-1 text-slate-400 hover:text-white shrink-0"
                                title="Open repository on GitHub"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Right: Backup & Sync Status */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        {/* Sync Countdown & Pulse */}
        <div className="hidden xl:flex items-center gap-2 text-xs text-slate-400 bg-slate-800/60 border border-slate-800 px-2.5 py-1.5 rounded-lg">
          <span className="relative flex h-2 w-2">
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                isSyncing ? 'bg-cyan-400' : 'bg-emerald-400'
              }`}
            ></span>
            <span
              className={`relative inline-flex rounded-full h-2 w-2 ${
                isSyncing ? 'bg-cyan-500' : 'bg-emerald-500'
              }`}
            ></span>
          </span>
          <span className="font-mono text-[11px]">
            {isSyncing ? 'Syncing...' : autoSyncEnabled ? `Auto: ${syncCountdown}s` : 'Manual'}
          </span>
        </div>

        {/* 1-Click Backup Button */}
        {onExportWorkspace && (
          <button
            onClick={onExportWorkspace}
            className="h-9 px-3 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-all"
            title="Download full local backup snapshot (.json)"
          >
            <HardDriveDownload className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden md:inline">Backup Now</span>
          </button>
        )}

        {/* Sync Everything Trigger Button */}
        <button
          onClick={onSyncAll}
          disabled={isSyncing}
          className={`h-9 px-3 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all shadow-sm ${
            isSyncing
              ? 'bg-slate-800 text-slate-400 cursor-wait border border-slate-700'
              : 'bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 active:scale-95 text-white shadow-indigo-600/25 shadow-md'
          }`}
          title="Sync and back up across GitHub, Drive, Notes & Tasks"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-cyan-300' : ''}`} />
          <span className="hidden sm:inline">{isSyncing ? 'Syncing...' : 'Sync Backup'}</span>
        </button>

        {/* Connected Services Quick Status */}
        <div className="flex items-center gap-1.5 border-l border-slate-800 pl-2.5">
          {/* Drive Status Badge */}
          <button
            onClick={() => onSelectTab?.('drive')}
            title={
              googleUser
                ? `Connected: ${googleUser.email}`
                : 'Click to configure Google Drive Backup'
            }
            className={`h-7 px-2 rounded-lg flex items-center gap-1 border transition-colors text-[10px] font-medium ${
              googleUser
                ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-400'
                : 'bg-slate-800/50 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Lock className="w-3 h-3" />
            <Cloud className="w-3.5 h-3.5" />
          </button>

          {/* GitHub Status Badge */}
          <button
            onClick={() => onSelectTab?.('github')}
            title={githubUser ? `GitHub: @${githubUser.login}` : 'GitHub Backup'}
            className={`w-7 h-7 rounded-lg flex items-center justify-center border transition-colors overflow-hidden ${
              githubUser
                ? 'bg-indigo-950/40 border-indigo-500/30 text-indigo-400'
                : 'bg-slate-800/50 border-slate-800 text-slate-500'
            }`}
          >
            {githubUser?.avatar_url ? (
              <img
                src={githubUser.avatar_url}
                alt={githubUser.login}
                className="w-full h-full object-cover"
              />
            ) : (
              <Github className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
