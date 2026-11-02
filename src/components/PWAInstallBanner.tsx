import React, { useState } from 'react';
import { Smartphone, Download, Share, PlusSquare, X, Check, Sparkles } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallBanner: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // If already installed or dismissed, hide ambient banner
  if (isInstalled) {
    return null;
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      await install();
    } else if (isIOS) {
      setShowIOSModal(true);
    } else {
      // General instructions modal
      setShowIOSModal(true);
    }
  };

  return (
    <>
      {/* Sleek mobile action button / banner */}
      {!dismissed && (
        <div className="bg-gradient-to-r from-indigo-900/80 via-purple-900/80 to-pink-900/80 border-b border-indigo-500/30 px-3 py-2 text-xs backdrop-blur-md">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <span className="p-1 rounded-md bg-indigo-500/20 text-indigo-400 shrink-0">
                <Smartphone className="w-4 h-4" />
              </span>
              <div className="truncate">
                <span className="font-semibold text-white">Get OmniSync Mobile App</span>
                <span className="hidden sm:inline text-slate-300 ml-1.5">
                  • Install directly to your home screen for instant full-screen access & offline bridges
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={handleInstallClick}
                className="flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-medium rounded-lg shadow-sm transition active:scale-95"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{isIOS ? 'Install on iPhone' : 'Install App'}</span>
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

      {/* iOS & Mobile Installation Walkthrough Modal */}
      {showIOSModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-indigo-500/30 p-6 shadow-2xl text-slate-200">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-pink-500 p-0.5">
                  <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-indigo-400" />
                  </div>
                </div>
                <div>
                  <h3 className="text-base font-semibold text-white">Install OmniSync Hub</h3>
                  <p className="text-xs text-slate-400">Add to your Mobile Home Screen</p>
                </div>
              </div>
              <button
                onClick={() => setShowIOSModal(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-5 space-y-3.5 text-xs">
              <div className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/50">
                <div className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400 shrink-0 mt-0.5">
                  <Share className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-medium text-slate-200">Step 1</p>
                  <p className="text-slate-400 mt-0.5">
                    Tap the <strong className="text-white">Share</strong> button in your browser toolbar (Safari bottom bar or Chrome menu).
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/50">
                <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 shrink-0 mt-0.5">
                  <PlusSquare className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-medium text-slate-200">Step 2</p>
                  <p className="text-slate-400 mt-0.5">
                    Scroll down and select <strong className="text-white">"Add to Home Screen"</strong>.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/50">
                <div className="p-1.5 rounded-lg bg-purple-500/20 text-purple-400 shrink-0 mt-0.5">
                  <Check className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-medium text-slate-200">Step 3</p>
                  <p className="text-slate-400 mt-0.5">
                    Tap <strong className="text-white">Add</strong> in top right. OmniSync Hub will now launch like a standalone native app!
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowIOSModal(false)}
                className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium rounded-xl text-xs transition"
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
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showModal, setShowModal] = useState(false);

  if (isInstalled) {
    return (
      <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        <span>Mobile App Mode</span>
      </div>
    );
  }

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
        title="Install as Mobile App"
      >
        <Smartphone className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Install App</span>
      </button>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-indigo-500/30 p-6 shadow-2xl text-slate-200">
            <h3 className="text-base font-semibold text-white">Install Mobile App</h3>
            <p className="mt-2 text-xs text-slate-400">
              {isIOS
                ? 'To install on iPhone or iPad, tap Share in Safari and choose "Add to Home Screen".'
                : 'Tap your browser menu (three dots) and select "Install app" or "Add to Home screen".'}
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
