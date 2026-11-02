import React from 'react';
import {
  LayoutDashboard,
  FolderGit2,
  Share2,
  Globe,
  Cloud,
  Github,
  CheckSquare,
  FileText,
  Activity,
  RefreshCw,
  Sparkles,
  Compass,
  Film,
  Monitor,
  Code2,
  DollarSign,
  LogOut,
} from 'lucide-react';
import { AppTab } from '../types';
import { User } from 'firebase/auth';
import { GitHubUser } from '../services/github';

interface SidebarProps {
  activeTab: AppTab;
  onSelectTab: (tab: AppTab) => void;
  isOpen: boolean;
  onClose: () => void;
  driveCount: number;
  githubRepoCount: number;
  taskCount: number;
  noteCount: number;
  projectCount?: number;
  bridgesCount?: number;
  socialCount?: number;
  googleUser: User | null;
  githubUser: GitHubUser | null;
  onLogoutGoogle: () => void;
  onOpenGitHubModal: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  isOpen,
  onClose,
  driveCount,
  githubRepoCount,
  taskCount,
  noteCount,
  projectCount,
  bridgesCount,
  socialCount = 10,
  googleUser,
  githubUser,
  onLogoutGoogle,
  onOpenGitHubModal,
}) => {
  const navItems = [
    {
      id: 'overview' as AppTab,
      label: 'Hub Overview',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'projects' as AppTab,
      label: 'My Projects',
      icon: FolderGit2,
      badge: projectCount && projectCount > 0 ? projectCount : null,
      badgeColor: 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/30',
    },
    {
      id: 'social' as AppTab,
      label: 'Meta & Social Media',
      icon: Globe,
      badge: `${socialCount}`,
      badgeColor: 'bg-pink-500/15 text-pink-300 border border-pink-500/30',
    },
    {
      id: 'bridges' as AppTab,
      label: 'Connectors & Bridges',
      icon: Share2,
      badge: bridgesCount && bridgesCount > 0 ? `${bridgesCount}` : 'Live',
      badgeColor: 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30',
    },
    {
      id: 'drive' as AppTab,
      label: 'Google Drive',
      icon: Cloud,
      badge: driveCount > 0 ? driveCount : (googleUser ? '0' : 'Off'),
      badgeColor: googleUser ? 'bg-cyan-500/10 text-cyan-400' : 'bg-slate-800 text-slate-500',
    },
    {
      id: 'github' as AppTab,
      label: 'GitHub Hub',
      icon: Github,
      badge: githubRepoCount > 0 ? githubRepoCount : (githubUser ? '0' : 'Off'),
      badgeColor: githubUser ? 'bg-indigo-500/10 text-indigo-400' : 'bg-slate-800 text-slate-500',
    },
    {
      id: 'tasks' as AppTab,
      label: 'Action Items',
      icon: CheckSquare,
      badge: taskCount > 0 ? taskCount : null,
      badgeColor: 'bg-emerald-500/10 text-emerald-400',
    },
    {
      id: 'notes' as AppTab,
      label: 'Knowledge & Notes',
      icon: FileText,
      badge: noteCount > 0 ? noteCount : null,
      badgeColor: 'bg-purple-500/10 text-purple-400',
    },
    {
      id: 'timeline' as AppTab,
      label: 'Activity Stream',
      icon: Activity,
      badge: null,
    },
    {
      id: 'sync' as AppTab,
      label: 'Sync Engine & Logs',
      icon: RefreshCw,
      badge: null,
    },
    {
      id: 'ai' as AppTab,
      label: 'AI Workspace Copilot',
      icon: Sparkles,
      badge: 'AI',
      badgeColor: 'bg-gradient-to-r from-indigo-500/20 to-purple-500/20 text-indigo-300 border border-indigo-500/30',
    },
    {
      id: 'one_d_world' as AppTab,
      label: '1D World & Reiki HQ',
      icon: Compass,
      badge: '1D',
      badgeColor: 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30',
    },
    {
      id: 'kikis_world' as AppTab,
      label: "Kiki's World 2.0",
      icon: Film,
      badge: '2.0',
      badgeColor: 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 border border-purple-500/30',
    },
    {
      id: 'kikios' as AppTab,
      label: 'KikiOS Cyber-Deck',
      icon: Monitor,
      badge: 'OS',
      badgeColor: 'bg-amber-500/10 text-amber-300 border border-amber-500/30',
    },
    {
      id: 'remix' as AppTab,
      label: 'Remixed App Studio',
      icon: Code2,
      badge: 'Remix',
      badgeColor: 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/30',
    },
    {
      id: 'earnings' as AppTab,
      label: 'PayPal Creator Earnings',
      icon: DollarSign,
      badge: '$',
      badgeColor: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30',
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:sticky top-14 bottom-0 left-0 z-40 w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between transition-transform duration-200 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } h-[calc(100vh-3.5rem)]`}
      >
        {/* Navigation list */}
        <div className="p-3 space-y-1 overflow-y-auto flex-1">
          <div className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Workspaces & Sync
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  onClose();
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-indigo-600/15 text-indigo-300 border border-indigo-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon
                    className={`w-4 h-4 ${
                      isActive ? 'text-indigo-400' : 'text-slate-500'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge !== null && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono font-medium ${
                      item.badgeColor || 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Connected Services Panel */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/40 space-y-2">
          <div className="text-[10px] uppercase font-semibold text-slate-400 px-2 tracking-wider flex items-center justify-between">
            <span>Sync Integrations</span>
          </div>

          {/* Google Drive Status Bar */}
          <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800/80 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 min-w-0">
              <Cloud className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <div className="truncate">
                <div className="font-medium text-slate-200 truncate">
                  {googleUser ? googleUser.email?.split('@')[0] : 'Google Drive'}
                </div>
                <div className="text-[10px] text-slate-400">
                  {googleUser ? 'Connected' : 'Offline'}
                </div>
              </div>
            </div>
            {googleUser ? (
              <button
                onClick={onLogoutGoogle}
                title="Disconnect Google Drive"
                className="p-1 text-slate-500 hover:text-rose-400 rounded hover:bg-slate-800 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={() => onSelectTab('drive')}
                className="text-[11px] text-cyan-400 hover:text-cyan-300 font-medium"
              >
                Connect
              </button>
            )}
          </div>

          {/* GitHub Status Bar */}
          <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800/80 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 min-w-0">
              <Github className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <div className="truncate">
                <div className="font-medium text-slate-200 truncate">
                  {githubUser ? `@${githubUser.login}` : 'GitHub'}
                </div>
                <div className="text-[10px] text-slate-400">
                  {githubUser ? `${githubUser.public_repos} repos` : 'Not connected'}
                </div>
              </div>
            </div>
            <button
              onClick={onOpenGitHubModal}
              className="text-[11px] text-indigo-400 hover:text-indigo-300 font-medium"
            >
              {githubUser ? 'Config' : 'Connect'}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
