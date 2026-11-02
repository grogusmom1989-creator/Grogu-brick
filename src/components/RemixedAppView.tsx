import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Layers,
  Play,
  Pause,
  Plus,
  Code2,
  Sliders,
  Download,
  Copy,
  Check,
  RotateCcw,
  Volume2,
  Trash2,
  ExternalLink,
  Film,
  Music,
  Compass,
  Github,
  Cloud,
  CheckCircle2,
} from 'lucide-react';
import { RemixedApp, WorkspaceTask } from '../types';
import { oneDAudio } from '../services/oneDWorldAudio';

interface RemixedAppViewProps {
  onAddTask: (task: Omit<WorkspaceTask, 'id' | 'createdAt'>) => void;
  onLogSyncEvent: (source: any, message: string, count: number) => void;
}

const DEFAULT_REMIXES: RemixedApp[] = [
  {
    id: 'remix-1',
    name: "Kiki's Reiki World 2.0 Extended Remix",
    tagline: 'Dimensional sacred geometry altar with 528Hz DNA miracle resonance and particle aura',
    version: '2.4-remix',
    baseApp: "Kiki's World 2.0",
    themeColor: '#a855f7',
    category: 'wellness',
    tags: ['Reiki', '528Hz', 'CrystalGrid', 'Remix'],
    config: {
      ambientFrequency: 528,
      visualizerTheme: 'Aurora Violet',
      autoSyncEnabled: true,
      syncIntervalMinutes: 5,
      customCodeSnippet: `// Kiki's 2.0 Extended Harmonic Loop\nfunction resonateSanctuary() {\n  const solfeggio = [396, 432, 528, 639, 963];\n  return solfeggio.map(hz => createLightWave(hz));\n}`,
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'remix-2',
    name: 'Universal Cloud Drive & Media Hub Remix',
    tagline: 'Streamlined video player and music mixer synced directly with Google Drive files',
    version: '1.8-remix',
    baseApp: 'OmniSync Hub',
    themeColor: '#06b6d4',
    category: 'media',
    tags: ['GoogleDrive', 'VideoPlayer', 'AudioMixer'],
    config: {
      ambientFrequency: 432,
      visualizerTheme: 'Neon Cyan',
      autoSyncEnabled: true,
      syncIntervalMinutes: 2,
      customCodeSnippet: `// Drive Video & Audio Auto-Mount Pipeline\nconst mountDriveMedia = async () => {\n  const stream = await fetchDriveMediaStream();\n  renderPlayer({ autoplay: true, eq: 'vocal-boost' });\n};`,
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'remix-3',
    name: 'Wolfram 1D Generative Math Art Remix',
    tagline: 'Interactive cellular automata visualizer with Rule 30/110 and audio synthesis',
    version: '1.2-remix',
    baseApp: '1D World',
    themeColor: '#10b981',
    category: 'generative',
    tags: ['Math', 'CellularAutomata', 'Rule110', 'Generative'],
    config: {
      ambientFrequency: 639,
      visualizerTheme: 'Emerald Matrix',
      autoSyncEnabled: false,
      customCodeSnippet: `// Wolfram 1D Rule 110 Turing Complete Generator\nconst computeNextRow = (cells, rule = 110) => {\n  return cells.map((_, i) => ruleLookup(cells, i, rule));\n};`,
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const STORAGE_KEY_REMIXES = 'omnisync_remixes_v1';

export const RemixedAppView: React.FC<RemixedAppViewProps> = ({
  onAddTask,
  onLogSyncEvent,
}) => {
  const [remixes, setRemixes] = useState<RemixedApp[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_REMIXES);
      return stored ? JSON.parse(stored) : DEFAULT_REMIXES;
    } catch {
      return DEFAULT_REMIXES;
    }
  });

  const [selectedRemix, setSelectedRemix] = useState<RemixedApp>(remixes[0] || DEFAULT_REMIXES[0]);
  const [isPlayingResonance, setIsPlayingResonance] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);

  // Form state for creating a new remix
  const [newName, setNewName] = useState('');
  const [newTagline, setNewTagline] = useState('');
  const [newBaseApp, setNewBaseApp] = useState("Kiki's World 2.0");
  const [newThemeColor, setNewThemeColor] = useState('#a855f7');
  const [newFrequency, setNewFrequency] = useState(528);

  const saveRemixes = (updated: RemixedApp[]) => {
    setRemixes(updated);
    try {
      localStorage.setItem(STORAGE_KEY_REMIXES, JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to save remixes to localStorage', e);
    }
  };

  const handleToggleSound = (freq = 528) => {
    if (isPlayingResonance) {
      oneDAudio.stopDrone();
      setIsPlayingResonance(false);
    } else {
      oneDAudio.startDrone(freq);
      setIsPlayingResonance(true);
    }
  };

  const handleCopyCode = () => {
    if (!selectedRemix?.config.customCodeSnippet) return;
    navigator.clipboard.writeText(selectedRemix.config.customCodeSnippet);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleExportRemix = (remix: RemixedApp) => {
    const blob = new Blob([JSON.stringify(remix, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${remix.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCreateRemix = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const newApp: RemixedApp = {
      id: 'remix-' + Date.now(),
      name: newName.trim(),
      tagline: newTagline.trim() || 'Custom remixed applet workspace',
      version: '1.0-remix',
      baseApp: newBaseApp,
      themeColor: newThemeColor,
      category: 'custom',
      tags: ['Remix', newBaseApp.replace(/\s+/g, '')],
      config: {
        ambientFrequency: newFrequency,
        visualizerTheme: 'Neon Cyan',
        autoSyncEnabled: true,
        syncIntervalMinutes: 5,
        customCodeSnippet: `// Custom Remixed Applet: ${newName.trim()}\nexport function initCustomRemix() {\n  console.log("Remix loaded with ${newFrequency}Hz frequency");\n}`,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updated = [newApp, ...remixes];
    saveRemixes(updated);
    setSelectedRemix(newApp);
    setIsNewModalOpen(false);
    setNewName('');
    setNewTagline('');

    onLogSyncEvent('all', `Created custom remix: "${newApp.name}"`, 1);
  };

  const handleDeleteRemix = (id: string) => {
    if (remixes.length <= 1) return;
    if (window.confirm('Delete this remixed app?')) {
      const updated = remixes.filter((r) => r.id !== id);
      saveRemixes(updated);
      setSelectedRemix(updated[0]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/30 rounded-2xl p-6 shadow-md">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold">
              <Code2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>Remixed App Studio • Live Sandbox & Code Forge</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Remixed Apps, Live Interactive Sandboxes & Modular Extensions
            </h1>
            <p className="text-xs text-slate-300 max-w-2xl">
              Create, customize, and run your remixed apps. Tune Solfeggio sound parameters, preview live component sandboxes, and export clean configurations.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsNewModalOpen(true)}
              className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-semibold rounded-lg shadow-md flex items-center gap-2 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>New Remixed App</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Studio Layout: Left Sidebar List, Right Interactive Sandbox */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Remix Vault & List (4 cols) */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col space-y-3 shadow-sm">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              <span>Remix Vault ({remixes.length})</span>
            </h3>
          </div>

          <div className="space-y-2 flex-1 overflow-y-auto max-h-[500px]">
            {remixes.map((remix) => {
              const isSelected = selectedRemix.id === remix.id;
              return (
                <div
                  key={remix.id}
                  onClick={() => setSelectedRemix(remix)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col space-y-2 ${
                    isSelected
                      ? 'bg-indigo-600/15 border-indigo-500/50 shadow-sm'
                      : 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-850'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: remix.themeColor }}
                      />
                      <h4 className="text-xs font-semibold text-white truncate">{remix.name}</h4>
                    </div>

                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 shrink-0">
                      {remix.version}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-400 line-clamp-2">{remix.tagline}</p>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[10px] text-slate-500">
                    <span className="text-indigo-400 font-medium">Base: {remix.baseApp}</span>
                    <span>{remix.config.ambientFrequency || 528} Hz</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Interactive Live Sandbox & Inspector (8 cols) */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between space-y-6 shadow-sm">
          <div className="space-y-5">
            {/* Header info */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span
                    className="w-3.5 h-3.5 rounded-full"
                    style={{ backgroundColor: selectedRemix.themeColor }}
                  />
                  <h2 className="text-lg font-bold text-white">{selectedRemix.name}</h2>
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300">
                    {selectedRemix.version}
                  </span>
                </div>
                <p className="text-xs text-slate-400">{selectedRemix.tagline}</p>
              </div>

              {/* Top Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleToggleSound(selectedRemix.config.ambientFrequency || 528)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg border flex items-center gap-1.5 transition-all ${
                    isPlayingResonance
                      ? 'bg-rose-500 text-white border-rose-400 animate-pulse'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                  }`}
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>
                    {isPlayingResonance
                      ? `Playing ${selectedRemix.config.ambientFrequency || 528}Hz`
                      : `Resonate ${selectedRemix.config.ambientFrequency || 528}Hz`}
                  </span>
                </button>

                <button
                  onClick={() => handleExportRemix(selectedRemix)}
                  className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700"
                  title="Export Remix Configuration"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>

                {remixes.length > 1 && (
                  <button
                    onClick={() => handleDeleteRemix(selectedRemix.id)}
                    className="p-2 bg-slate-800 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 rounded-lg border border-slate-700"
                    title="Delete Remix"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Interactive Live Sandbox Card */}
            <div className="bg-slate-950 rounded-xl border border-slate-800 p-5 space-y-4 shadow-inner">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-200 flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-cyan-400" />
                  <span>Live Sandbox Configuration & Tuning</span>
                </span>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400">
                  Ready to Run
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider">Base Applet</span>
                  <div className="font-semibold text-slate-200">{selectedRemix.baseApp}</div>
                </div>

                <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider">Harmonic Frequency</span>
                  <div className="font-semibold text-amber-400 font-mono">
                    {selectedRemix.config.ambientFrequency || 528} Hz
                  </div>
                </div>

                <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider">Visualizer Theme</span>
                  <div className="font-semibold text-indigo-300">
                    {selectedRemix.config.visualizerTheme || 'Aurora Violet'}
                  </div>
                </div>
              </div>

              {/* Code Snippet Viewer */}
              {selectedRemix.config.customCodeSnippet && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5">
                      <Code2 className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Component Remix Snippet</span>
                    </span>
                    <button
                      onClick={handleCopyCode}
                      className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1"
                    >
                      {isCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{isCopied ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>

                  <pre className="p-3.5 bg-slate-900/90 rounded-lg font-mono text-xs text-slate-300 overflow-x-auto border border-slate-800 leading-relaxed">
                    {selectedRemix.config.customCodeSnippet}
                  </pre>
                </div>
              )}
            </div>
          </div>

          {/* Action Footer */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2">
              {selectedRemix.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-400 border border-slate-700/60"
                >
                  #{tag}
                </span>
              ))}
            </div>

            <button
              onClick={() => {
                onAddTask({
                  title: `Develop Remix Feature: "${selectedRemix.name}"`,
                  description: `Extend remix configuration for ${selectedRemix.baseApp}. Frequency tuned to ${selectedRemix.config.ambientFrequency || 528}Hz.`,
                  status: 'todo',
                  priority: 'high',
                  source: 'manual',
                  tags: ['Remix', 'Studio'],
                });
              }}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Track as Workspace Task</span>
            </button>
          </div>
        </div>
      </div>

      {/* New Remix Modal */}
      {isNewModalOpen && (
        <div
          onClick={() => setIsNewModalOpen(false)}
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-xl p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Code2 className="w-4 h-4 text-indigo-400" />
                <span>Create New Remixed App</span>
              </h3>
              <button
                onClick={() => setIsNewModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateRemix} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Remix Name</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Kiki's Quantum Solfeggio Remix"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Tagline & Purpose</label>
                <input
                  type="text"
                  value={newTagline}
                  onChange={(e) => setNewTagline(e.target.value)}
                  placeholder="Short description of this remixed app"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Base Template</label>
                  <select
                    value={newBaseApp}
                    onChange={(e) => setNewBaseApp(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Kiki's World 2.0">Kiki's World 2.0</option>
                    <option value="OmniSync Hub">OmniSync Hub</option>
                    <option value="1D Universe">1D Universe</option>
                    <option value="Audio Theater">Audio Theater</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Harmonic Tone</label>
                  <select
                    value={newFrequency}
                    onChange={(e) => setNewFrequency(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value={528}>528 Hz (Miracles)</option>
                    <option value={432}>432 Hz (Harmony)</option>
                    <option value={639}>639 Hz (Heart)</option>
                    <option value={963}>963 Hz (Crown)</option>
                    <option value={396}>396 Hz (Root)</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsNewModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow-sm"
                >
                  Create & Save Remix
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
