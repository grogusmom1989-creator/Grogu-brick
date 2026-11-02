import React, { useState, useEffect } from 'react';
import {
  Download,
  Share,
  PlusSquare,
  X,
  Check,
  Sparkles,
  Wifi,
  WifiOff,
  ShieldCheck,
  Inbox,
  HelpCircle,
  Monitor,
} from 'lucide-react';
import { usePWAInstall, useOnlineStatus } from '../hooks/usePWAInstall';
import { getOutboxItems } from '../services/storage';

export const PWAInstallBanner: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const isOnline = useOnlineStatus();
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [outboxCount, setOutboxCount] = useState<number>(() => getOutboxItems().length);

  // Poll outbox count periodically or on interaction
  useEffect(() => {
    const updateCount = () => setOutboxCount(getOutboxItems().length);
    updateCount();
    const interval = setInterval(updateCount, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleInstallClick = async () => {
    if (isInstallable) {
      await install();
    } else {
      setShowGuideModal(true);
    }
  };

  return (
    <>
      {/* Sleek Ambient Application Utility Bar */}
      {!dismissed && (
        <div className="bg-slate-900/90 border-b border-indigo-500/20 px-4 py-2 text-xs backdrop-blur-md">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
            {/* Left Info & Offline Mode Tooltip */}
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex items-center gap-2">
                <span className="p-1 rounded-md bg-indigo-500/20 text-indigo-400 shrink-0">
                  <Monitor className="w-4 h-4" />
                </span>
                <span className="font-semibold text-white">OmniSync Hub</span>
                <span className="hidden md:inline text-slate-400">
                  Standalone Workspace & Real-Time Sync Station
                </span>
              </div>

              {/* Descriptive 'Offline Mode' Tooltip & Status */}
              <div
                className="relative inline-flex items-center"
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
              >
                <button
                  type="button"
                  onClick={() => setShowTooltip((prev) => !prev)}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-medium transition cursor-help ${
                    isOnline
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                      : 'bg-amber-500/10 border-amber-500/30 text-amber-300 hover:bg-amber-500/20'
                  }`}
                  aria-label="Offline Mode Information"
                >
                  {isOnline ? (
                    <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <WifiOff className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                  )}
                  <span>{isOnline ? 'Online Sync' : 'Offline Mode Active'}</span>
                  {outboxCount > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full bg-indigo-500 text-white font-mono text-[10px]">
                      {outboxCount}
                    </span>
                  )}
                  <HelpCircle className="w-3 h-3 text-slate-400" />
                </button>

                {/* Descriptive Popover / Tooltip */}
                {showTooltip && (
                  <div className="absolute top-full left-0 mt-2 z-50 w-72 sm:w-80 p-3.5 rounded-xl bg-slate-950/95 border border-indigo-500/40 shadow-2xl text-slate-200 text-xs backdrop-blur-xl animate-in fade-in duration-150">
                    <div className="flex items-center gap-2 font-semibold text-white border-b border-slate-800 pb-2 mb-2">
                      <ShieldCheck className="w-4 h-4 text-cyan-400" />
                      <span>Offline Mode & Persistent Outbox</span>
                    </div>
                    <p className="text-slate-300 leading-relaxed text-[11px]">
                      All actions (creating tasks, editing notes, updating projects, and scheduling syncs) are safely queued in the persistent local Outbox.
                    </p>
                    <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                      <span className="text-slate-400 flex items-center gap-1">
                        <Inbox className="w-3 h-3 text-cyan-400" />
                        Queued in Outbox:
                      </span>
                      <span className="font-mono font-semibold text-cyan-300">
                        {outboxCount} {outboxCount === 1 ? 'action' : 'actions'}
                      </span>
                    </div>
                    <p className="mt-1 text-[10px] text-emerald-400">
                      Zero data loss guarantee: automatically flushes to cloud synchronization upon reconnect.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Right Action: Manual Trigger Button for 'Add to Home Screen' */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleInstallClick}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-semibold rounded-lg shadow-sm shadow-indigo-500/20 transition active:scale-95"
                title="Add to Home Screen / Install as Desktop App"
              >
                <PlusSquare className="w-3.5 h-3.5 text-cyan-300" />
                <span>Add to Home Screen</span>
              </button>

              <button
                onClick={() => setDismissed(true)}
                className="p-1 text-slate-400 hover:text-white rounded transition"
                title="Dismiss banner"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add to Home Screen Step-by-Step Guide Modal */}
      {showGuideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-indigo-500/30 p-6 shadow-2xl text-slate-200">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-cyan-500 p-0.5">
                  <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-cyan-400" />
                  </div>
                </div>
                <div>
                  <h3 className="text-base font-semibold text-white">Add to Home Screen</h3>
                  <p className="text-xs text-slate-400">Install OmniSync as a standalone application</p>
                </div>
              </div>
              <button
                onClick={() => setShowGuideModal(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-5 space-y-3 text-xs">
              {isIOS ? (
                <>
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-800/60 border border-slate-700/50">
                    <div className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400 shrink-0 mt-0.5">
                      <Share className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-200">Step 1</p>
                      <p className="text-slate-400 mt-0.5">
                        Tap the <strong className="text-white">Share</strong> icon in your browser toolbar.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-800/60 border border-slate-700/50">
                    <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 shrink-0 mt-0.5">
                      <PlusSquare className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-200">Step 2</p>
                      <p className="text-slate-400 mt-0.5">
                        Scroll down and select <strong className="text-white">&ldquo;Add to Home Screen&rdquo;</strong>.
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-800/60 border border-slate-700/50">
                    <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400 shrink-0 mt-0.5">
                      <Download className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-200">Desktop / Chrome / Edge</p>
                      <p className="text-slate-400 mt-0.5">
                        Look for the <strong className="text-white">Install icon</strong> (computer with down arrow) in your browser address bar on the right side, or click browser menu &rarr; <strong className="text-white">&ldquo;Install OmniSync Hub&rdquo;</strong>.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-800/60 border border-slate-700/50">
                    <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400 shrink-0 mt-0.5">
                      <Check className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-200">Instant Full-Window Workspace</p>
                      <p className="text-slate-400 mt-0.5">
                        Once added, OmniSync launches directly in its own distraction-free window with offline outbox enabled.
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowGuideModal(false)}
                className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl text-xs transition"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export const PWAHeaderButton: React.FC = () => {
  const { isInstallable, install } = usePWAInstall();
  const [showModal, setShowModal] = useState(false);

  const handleClick = async () => {
    if (isInstallable) {
      await install();
    } else {
      setShowModal(true);
    }
  };

  return (
    <>
      <button
        onClick={handleClick}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 hover:text-white text-xs font-medium transition active:scale-95"
        title="Add to Home Screen / Install as Desktop App"
      >
        <PlusSquare className="w-3.5 h-3.5 text-cyan-400" />
        <span className="hidden sm:inline">Add to Home Screen</span>
      </button>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-indigo-500/30 p-6 shadow-2xl text-slate-200">
            <h3 className="text-base font-semibold text-white">Add to Home Screen</h3>
            <p className="mt-2 text-xs text-slate-400">
              Click the install icon in your browser address bar or choose &ldquo;Add to Home Screen&rdquo; from your browser menu to run OmniSync Hub as a standalone desktop app.
            </p>
            <button
              onClick={() => setShowModal(false)}
              className="mt-4 w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl text-xs transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};

