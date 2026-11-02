import React from 'react';
import {
  RefreshCw,
  Search,
  Cloud,
  Github,
  Menu,
  Smartphone,
  Lock,
} from 'lucide-react';
import { User } from 'firebase/auth';
import { GitHubUser } from '../services/github';
import { PWAHeaderButton } from './PWAInstallBanner';

interface NavbarProps {
  onOpenCommand: () => void;
  onSyncAll: () => void;
  onOpenPlayStore: () => void;
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
  onOpenPlayStore,
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
              OmniSync{' '}
              <span className="text-[10px] uppercase font-semibold tracking-wider px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                Hub
              </span>
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
            {isSyncing ? 'Pulling...' : autoSyncEnabled ? `Auto: ${syncCountdown}s` : 'Manual'}
          </span>
        </div>

        {/* Master Pull Everything Trigger Button */}
        <button
          onClick={onSyncAll}
          disabled={isSyncing}
          className={`h-9 px-3 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all shadow-sm ${
            isSyncing
              ? 'bg-slate-800 text-slate-400 cursor-wait border border-slate-700'
              : 'bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 active:scale-95 text-white shadow-indigo-600/25 shadow-md'
          }`}
          title="Pull everything across GitHub, Google Drive, Firestore Cloud & Portfolio"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-cyan-300' : ''}`} />
          <span className="hidden sm:inline">{isSyncing ? 'Pulling All...' : 'Pull Everything'}</span>
        </button>

        {/* Google Play Store & Stay Signed In Studio Button */}
        <button
          onClick={onOpenPlayStore}
          className="h-9 px-2.5 text-xs font-semibold rounded-lg bg-emerald-950/60 hover:bg-emerald-900/70 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5 transition-all"
          title="Google Play Store App Packager & Stay Signed In Hub"
        >
          <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
          <span className="hidden md:inline">Play Store</span>
        </button>

        {/* PWA Mobile App Install Button */}
        <PWAHeaderButton />

        {/* Connected Services Quick Status */}
        <div className="flex items-center gap-1.5 border-l border-slate-800 pl-2.5">
          {/* Drive / Persistent Auth Status Badge */}
          <button
            onClick={onOpenPlayStore}
            title={
              googleUser
                ? `Stay Signed In Active: ${googleUser.email}`
                : 'Click to configure Persistent Sign-In & Cloud Sync'
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
          <div
            title={githubUser ? `GitHub: @${githubUser.login}` : 'GitHub: @grogusmom1989'}
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
