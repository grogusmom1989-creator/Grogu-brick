import React, { useState } from 'react';
import {
  X,
  Smartphone,
  ShieldCheck,
  Download,
  Copy,
  CheckCircle2,
  RefreshCw,
  Cloud,
  Github,
  Database,
  Terminal,
  ExternalLink,
  Lock,
  Sparkles,
  Layers,
  KeyRound,
} from 'lucide-react';
import { User } from 'firebase/auth';
import { GitHubUser } from '../services/github';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PlayStoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  googleUser: User | null;
  githubUser: GitHubUser | null;
  onGoogleSignIn: () => void;
  onPullEverything: () => Promise<void>;
  isSyncing: boolean;
  stats: {
    reposCount: number;
    driveCount: number;
    projectsCount: number;
    tasksCount: number;
    notesCount: number;
    bridgesCount: number;
  };
}

export const PlayStoreModal: React.FC<PlayStoreModalProps> = ({
  isOpen,
  onClose,
  googleUser,
  githubUser,
  onGoogleSignIn,
  onPullEverything,
  isSyncing,
  stats,
}) => {
  const [activeSection, setActiveSection] = useState<'pull_hub' | 'play_store' | 'store_listing'>('pull_hub');
  const [packageName, setPackageName] = useState('app.omnisync.hub');
  const [sha256Fingerprint, setSha256Fingerprint] = useState(
    'FA:C6:17:45:DC:09:03:78:6F:B9:ED:E6:2A:96:2B:39:9F:73:48:F0:BB:6F:89:9B:83:32:66:75:91:03:3B:9C'
  );
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const { isInstallable, isInstalled, install: triggerInstall } = usePWAInstall();

  if (!isOpen) return null;

  const appOrigin = window.location.origin;
  const appHost = window.location.host;

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const assetLinksJson = JSON.stringify(
    [
      {
        relation: ['delegate_permission/common.handle_all_urls'],
        target: {
          namespace: 'android_app',
          package_name: packageName,
          sha256_cert_fingerprints: [sha256Fingerprint.trim()],
        },
      },
    ],
    null,
    2
  );

  const twaManifestJson = JSON.stringify(
    {
      packageId: packageName,
      host: appHost,
      name: 'OmniSync Hub',
      launcherName: 'OmniSync',
      display: 'standalone',
      themeColor: '#0F172A',
      navigationColor: '#090D16',
      backgroundColor: '#090D16',
      enableNotifications: true,
      startUrl: '/',
      iconUrl: `${appOrigin}/pwa-512x512.png`,
      maskableIconUrl: `${appOrigin}/pwa-maskable-512x512.png`,
      webManifestUrl: `${appOrigin}/manifest.webmanifest`,
      fullScopeUrl: `${appOrigin}/`,
      minSdkVersion: 21,
      orientation: 'portrait-primary',
      appVersionName: '2.0.0',
      appVersionCode: 2,
    },
    null,
    2
  );

  const bubblewrapCommand = `# 1. Install Bubblewrap CLI globally
npm i -g @bubblewrap/cli

# 2. Initialize Android Trusted Web Activity (TWA) project from live manifest
bubblewrap init --manifest=${appOrigin}/manifest.webmanifest

# 3. Build signed Google Play Store Android App Bundle (.aab) & APK (.apk)
bubblewrap build`;

  const downloadFile = (filename: string, content: string) => {
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-indigo-950/90 via-slate-900 to-emerald-950/60 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-400 p-0.5 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Smartphone className="w-5 h-5 text-emerald-400" />
              </div>
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                OmniSync Hub — Pull Everything & Google Play Store Studio
                <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Stay Signed In Active
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Persistent Hub Authentication, One-Click Universal Pull, and Android Play Store (.aab / TWA) Packager
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="px-6 pt-3 bg-slate-900/90 border-b border-slate-800 flex items-center gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveSection('pull_hub')}
            className={`px-4 py-2.5 text-xs font-semibold rounded-t-lg border-b-2 transition-all flex items-center gap-2 ${
              activeSection === 'pull_hub'
                ? 'border-cyan-400 text-cyan-300 bg-cyan-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            1. Pull Everything & Stay Signed In
          </button>
          <button
            onClick={() => setActiveSection('play_store')}
            className={`px-4 py-2.5 text-xs font-semibold rounded-t-lg border-b-2 transition-all flex items-center gap-2 ${
              activeSection === 'play_store'
                ? 'border-emerald-400 text-emerald-300 bg-emerald-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            2. Google Play Store Packager (.AAB / TWA)
          </button>
          <button
            onClick={() => setActiveSection('store_listing')}
            className={`px-4 py-2.5 text-xs font-semibold rounded-t-lg border-b-2 transition-all flex items-center gap-2 ${
              activeSection === 'store_listing'
                ? 'border-indigo-400 text-indigo-300 bg-indigo-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            3. Play Console Store Listing Copy
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {activeSection === 'pull_hub' && (
            <>
              {/* Master Pull Everything Hero Action */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-950/80 via-slate-900 to-cyan-950/70 border border-indigo-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-cyan-300 bg-cyan-500/10 border border-cyan-500/30 px-2.5 py-0.5 rounded-md">
                    <Layers className="w-3.5 h-3.5" />
                    Universal Multi-Source Pull Engine
                  </div>
                  <h3 className="text-lg font-bold text-white">
                    Pull Everything Into OmniSync Hub
                  </h3>
                  <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
                    Simultaneously pulls all repositories & issues from{' '}
                    <span className="text-indigo-300 font-mono font-semibold">
                      @{githubUser?.login || 'grogusmom1989'}
                    </span>
                    , indexes your Google Drive files, restores Firestore Cloud Database records, and auto-imports every repository and Drive folder directly into your Projects Portfolio.
                  </p>
                </div>

                <button
                  onClick={onPullEverything}
                  disabled={isSyncing}
                  className="shrink-0 px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/20 active:scale-95 transition-all disabled:opacity-60"
                >
                  <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                  {isSyncing ? 'Pulling Everything...' : 'Pull Everything Now'}
                </button>
              </div>

              {/* Live Inventory Counters */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {[
                  { label: 'GitHub Repos', value: stats.reposCount, color: 'text-indigo-400' },
                  { label: 'Drive Files', value: stats.driveCount, color: 'text-emerald-400' },
                  { label: 'Portfolio Projects', value: stats.projectsCount, color: 'text-cyan-400' },
                  { label: 'Action Tasks', value: stats.tasksCount, color: 'text-amber-400' },
                  { label: 'Synced Notes', value: stats.notesCount, color: 'text-purple-400' },
                  { label: 'Active Bridges', value: stats.bridgesCount, color: 'text-pink-400' },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/90 text-center"
                  >
                    <div className={`text-xl font-black font-mono ${item.color}`}>
                      {item.value}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">{item.label}</div>
                  </div>
                ))}
              </div>

              {/* Stay Signed In & Persistent Sessions Status */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Google & Firebase Persistent Auth */}
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-emerald-400" />
                      Stay Signed In (Hub Lock)
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono">
                      browserLocalPersistence
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Your Hub login uses persistent IndexedDB token storage so you stay signed in across page refreshes, browser restarts, and installed Play Store launches.
                  </p>
                  {googleUser ? (
                    <div className="p-2.5 rounded-lg bg-emerald-950/30 border border-emerald-500/30 flex items-center justify-between">
                      <div className="truncate">
                        <div className="text-xs font-semibold text-emerald-300 truncate">
                          {googleUser.displayName || 'Creator Signed In'}
                        </div>
                        <div className="text-[11px] text-emerald-400/80 font-mono truncate">
                          {googleUser.email}
                        </div>
                      </div>
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    </div>
                  ) : (
                    <button
                      onClick={onGoogleSignIn}
                      className="w-full py-2 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
                    >
                      <Cloud className="w-3.5 h-3.5" />
                      Sign In & Lock Persistent Session
                    </button>
                  )}
                </div>

                {/* GitHub Persistent Account */}
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Github className="w-3.5 h-3.5 text-indigo-400" />
                      GitHub Auto-Pull Target
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-mono">
                      Active
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Configured to automatically pull public & authenticated repositories, commits, issues, and stars into your portfolio.
                  </p>
                  <div className="p-2.5 rounded-lg bg-indigo-950/30 border border-indigo-500/30 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-semibold text-indigo-300">
                        @{githubUser?.login || 'grogusmom1989'}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {stats.reposCount} repositories synced
                      </div>
                    </div>
                    <CheckCircle2 className="w-4 h-4 text-indigo-400" />
                  </div>
                </div>

                {/* Firestore Cloud Database */}
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Database className="w-3.5 h-3.5 text-cyan-400" />
                      Firestore Cloud Vault
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-mono">
                      Zero-Trust Rules
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Tasks, Notes, Projects, and Bridges automatically mirror to Firestore database so your phone and desktop stay in lockstep.
                  </p>
                  <div className="p-2.5 rounded-lg bg-cyan-950/30 border border-cyan-500/30 flex items-center justify-between">
                    <div className="truncate">
                      <div className="text-xs font-semibold text-cyan-300">
                        Cloud Sync Ready
                      </div>
                      <div className="text-[11px] text-slate-400 truncate font-mono">
                        /users/{googleUser?.uid ? googleUser.uid.slice(0, 10) + '...' : 'grogusmom1989'}
                      </div>
                    </div>
                    <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
                  </div>
                </div>
              </div>
            </>
          )}

          {activeSection === 'play_store' && (
            <div className="space-y-5">
              {/* Direct Device Install vs Play Store Bundle */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col justify-between gap-3">
                  <div>
                    <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1">
                      Option A: Instant Phone / Desktop Install
                    </div>
                    <h4 className="text-sm font-bold text-white">
                      Install Standalone App Right Now
                    </h4>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      Installs OmniSync Hub directly onto your Android home screen, Windows/Mac dock, or iOS device with full-screen standalone mode and offline caching.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {isInstalled ? (
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-2 rounded-lg">
                        <CheckCircle2 className="w-4 h-4" />
                        Installed on this device
                      </span>
                    ) : isInstallable ? (
                      <button
                        onClick={triggerInstall}
                        className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition-colors"
                      >
                        <Download className="w-4 h-4" />
                        Install App to Device
                      </button>
                    ) : (
                      <span className="text-xs text-slate-400 bg-slate-900 px-3 py-2 rounded-lg border border-slate-800">
                        Open in Chrome on Android/Desktop and click the install icon in the address bar
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col justify-between gap-3">
                  <div>
                    <div className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-1">
                      Option B: Google Play Console (.AAB)
                    </div>
                    <h4 className="text-sm font-bold text-white">
                      Download Play Store TWA Config Files
                    </h4>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      Your app is pre-configured with <code className="text-indigo-300">/.well-known/assetlinks.json</code> and <code className="text-indigo-300">/twa-manifest.json</code> for Bubblewrap &amp; PWABuilder packaging.
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => downloadFile('twa-manifest.json', twaManifestJson)}
                      className="px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      twa-manifest.json
                    </button>
                    <button
                      onClick={() => downloadFile('assetlinks.json', assetLinksJson)}
                      className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs flex items-center gap-1.5 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      assetlinks.json
                    </button>
                    <a
                      href="https://www.pwabuilder.com"
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 font-semibold text-xs flex items-center gap-1.5 transition-colors"
                    >
                      PWABuilder
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>

              {/* Package ID & SHA-256 Certificate Configurator */}
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                    <KeyRound className="w-4 h-4 text-amber-400" />
                    Android Package & Digital Asset Links Configurator
                  </h4>
                  <a
                    href="/.well-known/assetlinks.json"
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-cyan-400 hover:underline flex items-center gap-1"
                  >
                    View Live /.well-known/assetlinks.json
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">
                      Android Application ID (package_name)
                    </label>
                    <input
                      type="text"
                      value={packageName}
                      onChange={(e) => setPackageName(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white font-mono"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] text-slate-400 mb-1">
                      Play App Signing SHA-256 Certificate Fingerprint
                    </label>
                    <input
                      type="text"
                      value={sha256Fingerprint}
                      onChange={(e) => setSha256Fingerprint(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Bubblewrap CLI Commands */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300 flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-emerald-400" />
                    Build Signed Google Play Store Bundle (.aab) via Bubblewrap CLI
                  </span>
                  <button
                    onClick={() => copyToClipboard(bubblewrapCommand, 'bubblewrap')}
                    className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 flex items-center gap-1.5"
                  >
                    {copiedKey === 'bubblewrap' ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        Copy Commands
                      </>
                    )}
                  </button>
                </div>
                <pre className="p-3 rounded-lg bg-slate-900/90 text-[11px] font-mono text-emerald-300 overflow-x-auto leading-relaxed">
                  {bubblewrapCommand}
                </pre>
              </div>
            </div>
          )}

          {activeSection === 'store_listing' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-400">
                Copy and paste these pre-formatted fields directly into your{' '}
                <strong className="text-white">Google Play Console → Main Store Listing</strong> page.
              </p>

              {[
                {
                  key: 'title',
                  label: 'App Name (Max 30 chars)',
                  content: 'OmniSync Hub: Cloud & Dev Sync',
                },
                {
                  key: 'short_desc',
                  label: 'Short Description (Max 80 chars)',
                  content:
                    'Unified workspace syncing GitHub repos, Google Drive, tasks, notes & AI tools.',
                },
                {
                  key: 'full_desc',
                  label: 'Full Description (Max 4000 chars)',
                  content: `OmniSync Hub is a unified continuous synchronization workspace built for creators and developers.

KEY FEATURES:
• Live GitHub Repository & Issue Sync: Track repositories, commits, pull requests, and issues in real time.
• Google Drive Cloud Indexer: Search, preview, and convert Google Docs, Sheets, Slides, and media folders into actionable tasks.
• Project Portfolio & Universal Bridges: Connect GitHub repositories, Google Drive folders, 1D World & Reiki HQ, Kiki's World 2.0, Remixed App Studio, and Creator PayPal Earnings into one interconnected command center.
• Persistent Cloud & Offline Support: Powered by Zero-Trust Firestore cloud sync and offline-first local storage caching so you stay signed in everywhere.
• Global Command Omnibar: Instant search across all connected cloud drives, repositories, notes, and tasks.`,
                },
              ].map((field) => (
                <div
                  key={field.key}
                  className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-300">{field.label}</span>
                    <button
                      onClick={() => copyToClipboard(field.content, field.key)}
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 flex items-center gap-1"
                    >
                      {copiedKey === field.key ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          Copy
                        </>
                      )}
                    </button>
                  </div>
                  <pre className="p-3 rounded-lg bg-slate-900 text-xs text-slate-200 whitespace-pre-wrap font-sans leading-relaxed">
                    {field.content}
                  </pre>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
