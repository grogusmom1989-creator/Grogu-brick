import React from 'react';
import {
  RefreshCw,
  Search,
  Sparkles,
  Cloud,
  Github,
  CheckCircle2,
  AlertCircle,
  Menu,
} from 'lucide-react';
import { User } from 'firebase/auth';
import { GitHubUser } from '../services/github';
import { PWAHeaderButton } from './PWAInstallBanner';

interface NavbarProps {
  onOpenCommand: () => void;
  onSyncAll: () => void;
  isSyncing: boolean;
  syncCountdown: number;
  autoSyncEnabled: boolean;
  googleUser: User | null;
  githubUser: GitHubUser | null;
  onToggleSidebar: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenCommand,
  onSyncAll,
  isSyncing,
  syncCountdown,
  autoSyncEnabled,
  googleUser,
  githubUser,
  onToggleSidebar,
}) => {
  return (
    <header className="sticky top-0 z-30 h-14 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 flex items-center justify-between px-4 sm:px-6">
      {/* Left: Mobile Menu & Logo */}
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
              OmniSync <span className="text-[10px] uppercase font-semibold tracking-wider px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">Hub</span>
            </span>
          </div>
        </div>
      </div>

      {/* Middle: Universal Search Omnibar Trigger */}
      <div className="flex-1 max-w-md mx-4 hidden sm:block">
        <button
          onClick={onOpenCommand}
          className="w-full h-9 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 hover:border-slate-600 rounded-lg px-3 flex items-center justify-between text-xs text-slate-400 transition-all group shadow-inner"
        >
          <div className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-400 transition-colors" />
            <span>Search Drive, GitHub, notes & tasks...</span>
          </div>
          <kbd className="hidden md:inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-mono font-medium text-slate-400 bg-slate-900 border border-slate-700 rounded shadow-sm">
            <span>⌘</span>K
          </kbd>
        </button>
      </div>

      {/* Right: Sync Status & Accounts */}
      <div className="flex items-center gap-3">
        {/* Sync Countdown & Pulse */}
        <div className="hidden md:flex items-center gap-2 text-xs text-slate-400 bg-slate-800/60 border border-slate-800 px-2.5 py-1.5 rounded-lg">
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
            {isSyncing ? 'Syncing...' : autoSyncEnabled ? `Next: ${syncCountdown}s` : 'Manual'}
          </span>
        </div>

        {/* Sync All Trigger Button */}
        <button
          onClick={onSyncAll}
          disabled={isSyncing}
          className={`h-9 px-3 text-xs font-medium rounded-lg flex items-center gap-2 transition-all shadow-sm ${
            isSyncing
              ? 'bg-slate-800 text-slate-400 cursor-wait border border-slate-700'
              : 'bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white shadow-indigo-600/25 shadow-md'
          }`}
          title="Trigger instantaneous sync across Google Drive & GitHub"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-cyan-400' : ''}`} />
          <span className="hidden sm:inline">{isSyncing ? 'Syncing...' : 'Sync All'}</span>
        </button>

        {/* PWA Mobile App Install Button */}
        <PWAHeaderButton />

        {/* Connected Services Quick Status */}
        <div className="flex items-center gap-1.5 border-l border-slate-800 pl-3">
          {/* Drive Status Badge */}
          <div
            title={googleUser ? `Google Drive: ${googleUser.email}` : 'Google Drive disconnected'}
            className={`w-7 h-7 rounded-lg flex items-center justify-center border transition-colors ${
              googleUser
                ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-400'
                : 'bg-slate-800/50 border-slate-800 text-slate-500'
            }`}
          >
            <Cloud className="w-3.5 h-3.5" />
          </div>

          {/* GitHub Status Badge */}
          <div
            title={githubUser ? `GitHub: @${githubUser.login}` : 'GitHub not connected'}
            className={`w-7 h-7 rounded-lg flex items-center justify-center border transition-colors overflow-hidden ${
              githubUser
                ? 'bg-indigo-950/40 border-indigo-500/30 text-indigo-400'
                : 'bg-slate-800/50 border-slate-800 text-slate-500'
            }`}
          >
            {githubUser?.avatar_url ? (
              <img src={githubUser.avatar_url} alt={githubUser.login} className="w-full h-full object-cover" />
            ) : (
              <Github className="w-3.5 h-3.5" />
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
