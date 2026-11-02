import React from 'react';
import {
  LayoutDashboard,
  Network,
  Radio,
  Tv,
  DollarSign,
  FolderGit2,
  Share2,
  Menu,
} from 'lucide-react';
import { AppTab } from '../types';

interface MobileBottomNavProps {
  activeTab: AppTab;
  onSelectTab: (tab: AppTab) => void;
  onOpenSidebar: () => void;
  bridgesCount: number;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  onSelectTab,
  onOpenSidebar,
  bridgesCount,
}) => {
  const navItems: { tab: AppTab; label: string; icon: React.FC<{ className?: string }>; badge?: number }[] = [
    { tab: 'overview', label: 'Home', icon: LayoutDashboard },
    { tab: 'social', label: 'Social/Apps', icon: Share2 },
    { tab: 'bridges', label: 'Bridges', icon: Network, badge: bridgesCount },
    { tab: 'one_d_world', label: '1D World', icon: Radio },
    { tab: 'kikis_world', label: 'Kiki 2.0', icon: Tv },
    { tab: 'projects', label: 'Projects', icon: FolderGit2 },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-xl border-t border-slate-800 pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_24px_rgba(0,0,0,0.5)]">
      <div className="flex items-center justify-around px-1 py-1.5 max-w-lg mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.tab;
          return (
            <button
              key={item.tab}
              onClick={() => onSelectTab(item.tab)}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all relative ${
                isActive
                  ? 'text-indigo-400 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110' : ''}`} />
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-1 -right-2 px-1 text-[9px] font-bold rounded-full bg-indigo-500 text-white">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-1 tracking-tight">{item.label}</span>
              {isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-0.5 animate-pulse" />
              )}
            </button>
          );
        })}

        {/* More / All Modules Button */}
        <button
          onClick={onOpenSidebar}
          className="flex flex-col items-center justify-center py-1 px-2 rounded-xl text-slate-400 hover:text-slate-200 transition-all"
        >
          <Menu className="w-5 h-5" />
          <span className="text-[10px] mt-1 tracking-tight">More</span>
        </button>
      </div>
    </nav>
  );
};
