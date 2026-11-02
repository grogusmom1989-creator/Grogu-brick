import React from 'react';
import { WifiOff, ShieldCheck } from 'lucide-react';
import { useOnlineStatus } from '../hooks/usePWAInstall';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-16 sm:bottom-4 left-4 right-4 sm:right-auto z-50 flex items-center justify-between sm:justify-start gap-3 rounded-xl bg-amber-500/95 text-slate-950 font-medium px-4 py-2 text-xs shadow-2xl backdrop-blur-md border border-amber-300 animate-in fade-in slide-in-from-bottom duration-300">
      <div className="flex items-center gap-2">
        <WifiOff className="w-4 h-4 text-slate-950 animate-pulse" />
        <span>Offline Mode — Cached data, audio oscillators & bridges active</span>
      </div>
      <div className="flex items-center gap-1 text-[11px] opacity-80">
        <ShieldCheck className="w-3.5 h-3.5" />
        <span>PWA Local</span>
      </div>
    </div>
  );
};
