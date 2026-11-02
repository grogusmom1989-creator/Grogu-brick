import React from 'react';
import { WifiOff, ShieldCheck, RefreshCw, Inbox } from 'lucide-react';
import { useOnlineStatus } from '../hooks/usePWAInstall';

interface OfflineIndicatorProps {
  outboxCount?: number;
  isFlushingOutbox?: boolean;
  onFlushOutbox?: () => void;
}

export const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({
  outboxCount = 0,
  isFlushingOutbox = false,
  onFlushOutbox,
}) => {
  const isOnline = useOnlineStatus();

  if (isOnline && outboxCount === 0 && !isFlushingOutbox) return null;

  if (!isOnline) {
    return (
      <div className="fixed bottom-16 sm:bottom-4 left-4 right-4 sm:right-auto z-50 flex items-center justify-between sm:justify-start gap-3 rounded-xl bg-amber-500/95 text-slate-950 font-medium px-4 py-2.5 text-xs shadow-2xl backdrop-blur-md border border-amber-300 animate-in fade-in slide-in-from-bottom duration-300">
        <div className="flex items-center gap-2">
          <WifiOff className="w-4 h-4 text-slate-950 animate-pulse shrink-0" />
          <span>
            Offline Mode —{' '}
            {outboxCount > 0
              ? `${outboxCount} action${outboxCount === 1 ? '' : 's'} queued in Outbox (will auto-flush on reconnect)`
              : 'All new tasks & note edits will queue in persistent Outbox'}
          </span>
        </div>
        <div className="flex items-center gap-1 text-[11px] font-semibold bg-slate-950/15 px-2 py-0.5 rounded-md shrink-0">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Outbox: {outboxCount}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-16 sm:bottom-4 left-4 right-4 sm:right-auto z-50 flex items-center justify-between sm:justify-start gap-3 rounded-xl bg-indigo-950/95 text-indigo-100 font-medium px-4 py-2 text-xs shadow-2xl backdrop-blur-md border border-indigo-500/40 animate-in fade-in slide-in-from-bottom duration-300">
      <div className="flex items-center gap-2">
        {isFlushingOutbox ? (
          <RefreshCw className="w-4 h-4 text-cyan-400 animate-spin shrink-0" />
        ) : (
          <Inbox className="w-4 h-4 text-cyan-400 shrink-0" />
        )}
        <span>
          {isFlushingOutbox
            ? `Flushing ${outboxCount} queued offline action${outboxCount === 1 ? '' : 's'} to Firestore...`
            : `${outboxCount} offline action${outboxCount === 1 ? '' : 's'} queued in localStorage Outbox`}
        </span>
      </div>
      {onFlushOutbox && !isFlushingOutbox && (
        <button
          onClick={onFlushOutbox}
          className="px-2.5 py-1 rounded-md bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-[11px] transition-colors shrink-0"
        >
          Flush Now
        </button>
      )}
    </div>
  );
};
