import React, { useState, useEffect, useRef } from 'react';
import {
  Tv,
  Radio,
  Terminal,
  Sparkles,
  Layers,
  FolderGit2,
  DollarSign,
  Maximize2,
  Minimize2,
  X,
  Volume2,
  VolumeX,
  Play,
  Pause,
  RefreshCw,
  HardDrive,
  Cpu,
  Wifi,
  BatteryCharging,
  Clock,
  Settings,
  Flame,
  Music,
  FileText,
  Shield,
  Zap,
  Globe,
  ExternalLink,
  ChevronRight,
  Monitor,
} from 'lucide-react';
import { AppTab, GoogleDriveFile, GitHubRepo, WorkspaceTask, WorkspaceNote, ProjectBridge } from '../types';
import { getStoredTasks, getStoredNotes, getStoredProjects, getStoredBridges } from '../services/storage';

interface KikiOSViewProps {
  onSelectTab: (tab: AppTab) => void;
  driveFiles?: GoogleDriveFile[];
  githubRepos?: GitHubRepo[];
  tasks?: WorkspaceTask[];
  notes?: WorkspaceNote[];
  bridges?: ProjectBridge[];
  onAddTask?: (task: Omit<WorkspaceTask, 'id' | 'createdAt'>) => void;
}

interface OSWindow {
  id: string;
  title: string;
  icon: React.FC<{ className?: string }>;
  x: number;
  y: number;
  width: number;
  height: number;
  isOpen: boolean;
  isMinimized: boolean;
  isMaximized: boolean;
  zIndex: number;
}

export const KikiOSView: React.FC<KikiOSViewProps> = ({
  onSelectTab,
  driveFiles = [],
  githubRepos = [],
  tasks = [],
  notes = [],
  bridges = [],
  onAddTask,
}) => {
  // Desktop System State
  const [time, setTime] = useState(new Date());
  const [wallpaper, setWallpaper] = useState<'nebula' | 'crystal' | 'cyber' | 'aurora'>('nebula');
  const [systemSound, setSystemSound] = useState(true);
  const [activeFrequency, setActiveFrequency] = useState(528);
  const [isPlayingHarmonic, setIsPlayingHarmonic] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [topZ, setTopZ] = useState(10);
  const [activeWindowId, setActiveWindowId] = useState<string>('terminal');

  // Audio Context for KikiOS system sounds and harmonic oscillator
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscRef = useRef<OscillatorNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);

  // Terminal State
  const [termHistory, setTermHistory] = useState<Array<{ cmd: string; out: string; type?: 'info' | 'success' | 'warn' | 'error' }>>([
    { cmd: 'kikios --version', out: 'KikiOS v2.4 Cosmic Kernel [Unified OmniSync Engine] initialized.', type: 'info' },
    { cmd: 'bridges --status', out: '10 active cross-dimensional bridges online. Solfeggio carrier locked at 528 Hz.', type: 'success' },
    { cmd: 'help', out: 'Available commands: help, bridges, solfeggio <hz>, sync, paypal, repos, tasks, clear, matrix, chime', type: 'info' },
  ]);
  const [termInput, setTermInput] = useState('');
  const termEndRef = useRef<HTMLDivElement | null>(null);

  // Scratchpad Note State
  const [osNote, setOsNote] = useState('✨ KikiOS Cosmic Scratchpad ✨\n• 528 Hz frequency active\n• Solfeggio grid aligned with OmniSync\n• PayPal tipping enabled for @grogusmom1989');

  // Windows Definition
  const [windows, setWindows] = useState<Record<string, OSWindow>>({
    terminal: {
      id: 'terminal',
      title: 'KikiOS Terminal v2.4',
      icon: Terminal,
      x: 30,
      y: 40,
      width: 580,
      height: 380,
      isOpen: true,
      isMinimized: false,
      isMaximized: false,
      zIndex: 10,
    },
    theater: {
      id: 'theater',
      title: "Kiki's Media Theater",
      icon: Tv,
      x: 180,
      y: 80,
      width: 540,
      height: 400,
      isOpen: false,
      isMinimized: false,
      isMaximized: false,
      zIndex: 9,
    },
    altar: {
      id: 'altar',
      title: 'Crystal Altar & Harmonic Grid',
      icon: Sparkles,
      x: 120,
      y: 60,
      width: 520,
      height: 380,
      isOpen: false,
      isMinimized: false,
      isMaximized: false,
      zIndex: 8,
    },
    sysmon: {
      id: 'sysmon',
      title: 'KikiOS System Telemetry',
      icon: Cpu,
      x: 240,
      y: 110,
      width: 480,
      height: 360,
      isOpen: false,
      isMinimized: false,
      isMaximized: false,
      zIndex: 7,
    },
    scratchpad: {
      id: 'scratchpad',
      title: 'Cosmic Scratchpad',
      icon: FileText,
      x: 300,
      y: 140,
      width: 420,
      height: 320,
      isOpen: false,
      isMinimized: false,
      isMaximized: false,
      zIndex: 6,
    },
  });

  // Real-time clock update
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Web Audio Chime generator
  const playChime = (freq = 528, duration = 0.4) => {
    if (!systemSound) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {
      // Audio permission or unsupported
    }
  };

  // Toggle continuous harmonic tone
  const toggleHarmonic = (freq = activeFrequency) => {
    try {
      if (isPlayingHarmonic) {
        if (oscRef.current) {
          oscRef.current.stop();
          oscRef.current.disconnect();
          oscRef.current = null;
        }
        setIsPlayingHarmonic(false);
      } else {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioCtx) return;
        const ctx = audioCtxRef.current || new AudioCtx();
        audioCtxRef.current = ctx;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        gain.gain.setValueAtTime(0.05, ctx.currentTime);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();

        oscRef.current = osc;
        gainRef.current = gain;
        setActiveFrequency(freq);
        setIsPlayingHarmonic(true);
      }
    } catch {
      // audio error handling
    }
  };

  // Cleanup audio oscillator on unmount
  useEffect(() => {
    return () => {
      if (oscRef.current) {
        try {
          oscRef.current.stop();
          oscRef.current.disconnect();
        } catch {}
      }
    };
  }, []);

  // Window Focus / Bring to Front
  const focusWindow = (id: string) => {
    setTopZ((prev) => {
      const next = prev + 1;
      setWindows((w) => ({
        ...w,
        [id]: { ...w[id], isOpen: true, isMinimized: false, zIndex: next },
      }));
      setActiveWindowId(id);
      return next;
    });
  };

  const closeWindow = (id: string) => {
    playChime(396, 0.15);
    setWindows((w) => ({
      ...w,
      [id]: { ...w[id], isOpen: false },
    }));
  };

  const minimizeWindow = (id: string) => {
    playChime(432, 0.12);
    setWindows((w) => ({
      ...w,
      [id]: { ...w[id], isMinimized: !w[id].isMinimized },
    }));
  };

  const maximizeWindow = (id: string) => {
    playChime(639, 0.15);
    setWindows((w) => ({
      ...w,
      [id]: { ...w[id], isMaximized: !w[id].isMaximized },
    }));
  };

  // Terminal Command Execution
  const handleTermCommand = (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = termInput.trim();
    if (!cmd) return;
    setTermInput('');
    playChime(741, 0.08);

    const lower = cmd.toLowerCase();
    let out = '';
    let type: 'info' | 'success' | 'warn' | 'error' = 'info';

    if (lower === 'clear') {
      setTermHistory([]);
      return;
    } else if (lower === 'help') {
      out = `Available commands in KikiOS v2.4:
  • help            - Display this manual
  • bridges         - Inspect live cross-system bridges
  • solfeggio <hz>  - Tune oscillator (396, 432, 528, 639, 741, 852, 963)
  • chime           - Ring harmonic cosmic bell
  • sound <on/off>  - Toggle system audio feedback
  • repos           - List synced GitHub repositories
  • tasks           - List workspace tasks
  • paypal          - Display active creator payout config
  • matrix          - Initiate cosmic stream visualizer
  • sys             - Print system kernel status
  • clear           - Flush terminal output`;
    } else if (lower === 'bridges') {
      out = `[KikiOS Bridge Controller]
  Total Active Bridges: ${bridges.length || 10}
  • 1D World <-> Kiki's World 2.0 (Harmonic Carrier: Online)
  • Google Drive <-> Kiki Theater (Media Pipeline: Online)
  • GitHub <-> Remixed Studio (Template Synced: Online)
  • PayPal <-> Creator Earnings (Tipping Gateway: Active)`;
      type = 'success';
    } else if (lower.startsWith('solfeggio')) {
      const parts = lower.split(' ');
      const hz = parseInt(parts[1], 10) || 528;
      setActiveFrequency(hz);
      if (isPlayingHarmonic && oscRef.current && audioCtxRef.current) {
        oscRef.current.frequency.setValueAtTime(hz, audioCtxRef.current.currentTime);
      }
      playChime(hz, 0.5);
      out = `Harmonic oscillator calibrated to ${hz} Hz Solfeggio frequency.`;
      type = 'success';
    } else if (lower === 'chime') {
      playChime(activeFrequency, 0.8);
      out = `Cosmic chime resonated at ${activeFrequency} Hz.`;
      type = 'success';
    } else if (lower === 'sound on') {
      setSystemSound(true);
      out = 'System audio feedback ENABLED.';
      type = 'success';
    } else if (lower === 'sound off') {
      setSystemSound(false);
      out = 'System audio feedback MUTED.';
      type = 'warn';
    } else if (lower === 'repos') {
      out = githubRepos.length > 0
        ? `Found ${githubRepos.length} synced repositories for @grogusmom1989:\n` +
          githubRepos.slice(0, 5).map((r) => `  - ${r.name} (${r.language || 'Code'}) ★ ${r.stargazers_count}`).join('\n')
        : 'GitHub synced: grogusmom1989 repositories loaded into portfolio.';
    } else if (lower === 'tasks') {
      out = tasks.length > 0
        ? `Active tasks (${tasks.length}):\n` +
          tasks.slice(0, 5).map((t) => `  [${t.status.toUpperCase()}] ${t.title}`).join('\n')
        : 'No open tasks. Create one using the hub tasks view.';
    } else if (lower === 'paypal') {
      out = `Creator Payout Gateway:
  Handle: paypal.me/grogusmom1989
  Status: Live & Ready for tipping and Reiki bookings.`;
      type = 'success';
    } else if (lower === 'matrix') {
      out = '01001011 01001001 01001011 01001001 01001111 01010011\n>>> COSMIC MATRIX SYNCHRONIZED <<<';
      type = 'success';
    } else if (lower === 'sys') {
      out = `KikiOS Kernel: v2.4-cosmic-hybrid
Memory: Virtualized Local State + Firestore Cloud Bridge
Solfeggio Engine: Web Audio API Oscillator
Bridge Nodes: 8 Topology Vertices`;
      type = 'info';
    } else {
      out = `kikios: command not found: "${cmd}". Type "help" for a list of commands.`;
      type = 'error';
    }

    setTermHistory((prev) => [...prev, { cmd, out, type }]);
    setTimeout(() => {
      termEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 50);
  };

  // Wallpapers
  const wallpaperClasses = {
    nebula: 'bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-950',
    crystal: 'bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-fuchsia-900 via-slate-950 to-black',
    cyber: 'bg-gradient-to-br from-cyan-950 via-slate-900 to-emerald-950',
    aurora: 'bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-emerald-950 via-indigo-950 to-slate-950',
  };

  return (
    <div className={`relative w-full h-[calc(100vh-4rem)] rounded-2xl overflow-hidden border border-indigo-500/30 shadow-2xl flex flex-col font-sans select-none ${wallpaperClasses[wallpaper]}`}>
      {/* Background Cosmic Particle Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(rgba(168,85,247,0.15)_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none opacity-60" />

      {/* Top OS Menu Bar */}
      <header className="relative z-40 h-8 bg-slate-950/80 backdrop-blur-md border-b border-indigo-500/20 px-3 flex items-center justify-between text-xs text-slate-300">
        <div className="flex items-center gap-4">
          {/* Cosmic Apple / Kiki Logo */}
          <div className="relative">
            <button
              onClick={() => setActiveMenu(activeMenu === 'kikios' ? null : 'kikios')}
              className="flex items-center gap-1.5 font-bold text-white hover:text-indigo-400 px-1 py-0.5 rounded transition"
            >
              <Sparkles className="w-4 h-4 text-pink-400 animate-pulse" />
              <span className="font-semibold tracking-wide">KikiOS</span>
            </button>

            {/* Apple / OS Dropdown Menu */}
            {activeMenu === 'kikios' && (
              <div className="absolute top-7 left-0 w-52 bg-slate-900/95 border border-indigo-500/30 rounded-xl shadow-2xl backdrop-blur-xl p-1 text-xs text-slate-200 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-2 border-b border-slate-800">
                  <p className="font-semibold text-white">KikiOS v2.4</p>
                  <p className="text-[10px] text-indigo-400">Cosmic Universal Desktop</p>
                </div>
                <button
                  onClick={() => {
                    focusWindow('sysmon');
                    setActiveMenu(null);
                  }}
                  className="w-full text-left px-3 py-1.5 rounded-lg hover:bg-indigo-600/30 text-slate-300 hover:text-white flex items-center gap-2"
                >
                  <Cpu className="w-3.5 h-3.5 text-indigo-400" />
                  <span>About KikiOS</span>
                </button>
                <button
                  onClick={() => {
                    playChime(528, 0.8);
                    setActiveMenu(null);
                  }}
                  className="w-full text-left px-3 py-1.5 rounded-lg hover:bg-indigo-600/30 text-slate-300 hover:text-white flex items-center gap-2"
                >
                  <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Ring Solfeggio Chime</span>
                </button>
                <div className="my-1 border-t border-slate-800" />
                <button
                  onClick={() => {
                    onSelectTab('overview');
                    setActiveMenu(null);
                  }}
                  className="w-full text-left px-3 py-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white flex items-center gap-2"
                >
                  <Monitor className="w-3.5 h-3.5" />
                  <span>Return to OmniSync Hub</span>
                </button>
              </div>
            )}
          </div>

          {/* Top Menu Items */}
          <div className="hidden sm:flex items-center gap-3 text-[11px] text-slate-400">
            <button onClick={() => focusWindow('terminal')} className="hover:text-white transition">Terminal</button>
            <button onClick={() => focusWindow('theater')} className="hover:text-white transition">Theater</button>
            <button onClick={() => focusWindow('altar')} className="hover:text-white transition">Altar</button>
            <button onClick={() => focusWindow('sysmon')} className="hover:text-white transition">Telemetry</button>
            <button onClick={() => focusWindow('scratchpad')} className="hover:text-white transition">Scratchpad</button>
          </div>
        </div>

        {/* Right Status Indicators */}
        <div className="flex items-center gap-3 text-[11px]">
          {/* Harmonic Carrier Frequency Toggle */}
          <button
            onClick={() => toggleHarmonic()}
            className={`flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] transition ${
              isPlayingHarmonic
                ? 'bg-pink-500/20 border-pink-500/50 text-pink-300 animate-pulse'
                : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-slate-200'
            }`}
            title="Toggle Solfeggio Harmonic Background Carrier"
          >
            <Radio className="w-3 h-3" />
            <span>{activeFrequency}Hz</span>
            {isPlayingHarmonic ? <Volume2 className="w-3 h-3 ml-0.5" /> : <VolumeX className="w-3 h-3 ml-0.5" />}
          </button>

          {/* Wallpaper Switcher */}
          <div className="hidden md:flex items-center gap-1 bg-slate-900 border border-slate-800 px-1.5 py-0.5 rounded-md">
            {(['nebula', 'crystal', 'cyber', 'aurora'] as const).map((w) => (
              <button
                key={w}
                onClick={() => setWallpaper(w)}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  wallpaper === w ? 'scale-125 ring-1 ring-white bg-indigo-400' : 'bg-slate-600 hover:bg-slate-400'
                }`}
                title={`Wallpaper: ${w}`}
              />
            ))}
          </div>

          {/* WiFi / Sync Status */}
          <div className="flex items-center gap-1 text-slate-400">
            <Wifi className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden lg:inline text-[10px] text-emerald-400">Synced</span>
          </div>

          {/* Cosmic Power */}
          <div className="flex items-center gap-1 text-slate-400">
            <BatteryCharging className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-[10px]">100%</span>
          </div>

          {/* System Clock */}
          <div className="flex items-center gap-1 text-slate-300 font-mono text-[11px]">
            <Clock className="w-3 h-3 text-slate-400" />
            <span>
              {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>
      </header>

      {/* Main Desktop Work Area */}
      <div className="relative flex-1 p-4 overflow-hidden" onClick={() => setActiveMenu(null)}>
        {/* Desktop Icons Grid (Left column) */}
        <div className="absolute top-6 left-6 grid grid-cols-1 gap-4 z-10">
          {[
            { id: 'terminal', label: 'Kiki Terminal', icon: Terminal, color: 'from-emerald-500 to-cyan-500' },
            { id: 'theater', label: 'Media Theater', icon: Tv, color: 'from-purple-500 to-pink-500' },
            { id: 'altar', label: 'Crystal Altar', icon: Sparkles, color: 'from-amber-500 to-rose-500' },
            { id: 'sysmon', label: 'System Monitor', icon: Cpu, color: 'from-blue-500 to-indigo-500' },
            { id: 'scratchpad', label: 'Scratchpad', icon: FileText, color: 'from-indigo-500 to-fuchsia-500' },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onDoubleClick={() => focusWindow(item.id)}
                onClick={() => focusWindow(item.id)}
                className="group flex flex-col items-center w-20 p-2 rounded-xl hover:bg-white/10 active:bg-white/20 transition-all text-center"
              >
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${item.color} p-0.5 shadow-lg group-hover:scale-105 group-hover:shadow-indigo-500/25 transition-transform`}>
                  <div className="w-full h-full bg-slate-950/80 rounded-[14px] flex items-center justify-center backdrop-blur-sm">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
                <span className="text-[11px] font-medium text-slate-200 mt-1.5 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] truncate w-full group-hover:text-white">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Windows Rendering */}
        {Object.values(windows).map((win) => {
          if (!win.isOpen || win.isMinimized) return null;
          const Icon = win.icon;

          return (
            <div
              key={win.id}
              onClick={() => focusWindow(win.id)}
              style={{
                zIndex: win.zIndex,
                top: win.isMaximized ? 8 : win.y,
                left: win.isMaximized ? 8 : win.x,
                width: win.isMaximized ? 'calc(100% - 16px)' : win.width,
                height: win.isMaximized ? 'calc(100% - 70px)' : win.height,
              }}
              className={`absolute rounded-xl bg-slate-900/90 border ${
                activeWindowId === win.id ? 'border-indigo-400 shadow-[0_10px_35px_rgba(99,102,241,0.25)]' : 'border-slate-800 shadow-xl'
              } backdrop-blur-xl flex flex-col overflow-hidden transition-shadow`}
            >
              {/* Window Header (Mac OS Traffic Light Style) */}
              <div className="h-9 bg-slate-950/80 border-b border-slate-800/80 px-3 flex items-center justify-between cursor-move select-none">
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      closeWindow(win.id);
                    }}
                    className="w-3 h-3 rounded-full bg-rose-500 hover:bg-rose-600 flex items-center justify-center group"
                    title="Close"
                  >
                    <X className="w-2 h-2 text-rose-950 opacity-0 group-hover:opacity-100" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      minimizeWindow(win.id);
                    }}
                    className="w-3 h-3 rounded-full bg-amber-500 hover:bg-amber-600 flex items-center justify-center group"
                    title="Minimize"
                  >
                    <Minimize2 className="w-2 h-2 text-amber-950 opacity-0 group-hover:opacity-100" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      maximizeWindow(win.id);
                    }}
                    className="w-3 h-3 rounded-full bg-emerald-500 hover:bg-emerald-600 flex items-center justify-center group"
                    title="Maximize"
                  >
                    <Maximize2 className="w-2 h-2 text-emerald-950 opacity-0 group-hover:opacity-100" />
                  </button>
                </div>

                {/* Window Title */}
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
                  <Icon className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{win.title}</span>
                </div>

                <div className="w-12 flex justify-end">
                  <span className="text-[10px] text-slate-500 font-mono">active</span>
                </div>
              </div>

              {/* Window Content Body */}
              <div className="flex-1 min-h-0 overflow-y-auto p-3 text-slate-200">
                {/* 1. Terminal Window */}
                {win.id === 'terminal' && (
                  <div className="h-full flex flex-col font-mono text-xs bg-slate-950/90 rounded-lg p-3 border border-slate-800 text-emerald-400">
                    <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                      {termHistory.map((item, idx) => (
                        <div key={idx} className="space-y-0.5">
                          <div className="flex items-center gap-2 text-cyan-400">
                            <span className="text-pink-400">kikios@omnisync</span>
                            <span className="text-slate-500">:</span>
                            <span className="text-indigo-300">~</span>
                            <span className="text-slate-400">$</span>
                            <span className="text-slate-100">{item.cmd}</span>
                          </div>
                          <pre className={`text-[11px] whitespace-pre-wrap leading-relaxed ${
                            item.type === 'success' ? 'text-emerald-300' :
                            item.type === 'warn' ? 'text-amber-300' :
                            item.type === 'error' ? 'text-rose-400' : 'text-slate-300'
                          }`}>
                            {item.out}
                          </pre>
                        </div>
                      ))}
                      <div ref={termEndRef} />
                    </div>

                    <form onSubmit={handleTermCommand} className="mt-2 pt-2 border-t border-slate-800 flex items-center gap-2">
                      <span className="text-pink-400">kikios$</span>
                      <input
                        type="text"
                        value={termInput}
                        onChange={(e) => setTermInput(e.target.value)}
                        placeholder="Type 'help', 'bridges', 'solfeggio 528'..."
                        className="flex-1 bg-transparent text-emerald-300 outline-none font-mono text-xs placeholder:text-slate-600"
                        autoFocus
                      />
                    </form>
                  </div>
                )}

                {/* 2. Media Theater Window */}
                {win.id === 'theater' && (
                  <div className="space-y-3">
                    <div className="aspect-video bg-black rounded-xl border border-indigo-500/30 overflow-hidden flex flex-col items-center justify-center relative p-4 text-center">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-pink-500 to-indigo-500 p-0.5 mb-3 shadow-lg">
                        <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                          <Music className="w-7 h-7 text-pink-400 animate-pulse" />
                        </div>
                      </div>
                      <h4 className="text-sm font-semibold text-white">Kiki Media Engine 2.0</h4>
                      <p className="text-xs text-slate-400 max-w-sm mt-1">
                        Carrier tone active at {activeFrequency}Hz. Connected to Google Drive media stream & local uploads.
                      </p>
                      <button
                        onClick={() => toggleHarmonic()}
                        className="mt-3 px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs flex items-center gap-2 shadow-md transition"
                      >
                        {isPlayingHarmonic ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                        <span>{isPlayingHarmonic ? 'Pause Harmonic' : 'Play Solfeggio Stream'}</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <button
                        onClick={() => onSelectTab('kikis_world')}
                        className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-left transition"
                      >
                        <p className="font-semibold text-white flex items-center gap-1.5">
                          <Tv className="w-3.5 h-3.5 text-purple-400" />
                          <span>Full Kiki Theater</span>
                        </p>
                        <p className="text-[10px] text-slate-400 mt-1">Open custom video player & channels</p>
                      </button>

                      <button
                        onClick={() => onSelectTab('one_d_world')}
                        className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-left transition"
                      >
                        <p className="font-semibold text-white flex items-center gap-1.5">
                          <Radio className="w-3.5 h-3.5 text-pink-400" />
                          <span>1D World Reiki</span>
                        </p>
                        <p className="text-[10px] text-slate-400 mt-1">Solfeggio chakra frequency generator</p>
                      </button>
                    </div>
                  </div>
                )}

                {/* 3. Crystal Altar Window */}
                {win.id === 'altar' && (
                  <div className="space-y-3">
                    <p className="text-xs text-slate-300">
                      Tap any crystal node in the KikiOS altar to resonate its harmonic Solfeggio frequency:
                    </p>
                    <div className="grid grid-cols-3 gap-2.5">
                      {[
                        { name: 'Rose Quartz', chakra: 'Heart', freq: 528, color: 'from-pink-400 to-rose-500' },
                        { name: 'Amethyst', chakra: 'Crown', freq: 963, color: 'from-purple-400 to-indigo-600' },
                        { name: 'Lapis Lazuli', chakra: 'Throat', freq: 741, color: 'from-blue-400 to-cyan-500' },
                        { name: 'Citrine', chakra: 'Solar Plexus', freq: 432, color: 'from-amber-300 to-yellow-500' },
                        { name: 'Carnelian', chakra: 'Sacral', freq: 417, color: 'from-orange-400 to-red-500' },
                        { name: 'Black Tourmaline', chakra: 'Root', freq: 396, color: 'from-slate-600 to-slate-900' },
                      ].map((c) => (
                        <button
                          key={c.name}
                          onClick={() => {
                            setActiveFrequency(c.freq);
                            playChime(c.freq, 0.7);
                          }}
                          className="p-3 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 hover:border-indigo-400 transition flex flex-col items-center text-center group"
                        >
                          <div className={`w-10 h-10 rounded-full bg-gradient-to-tr ${c.color} p-0.5 shadow-md group-hover:scale-110 transition-transform`}>
                            <div className="w-full h-full bg-slate-950/70 rounded-full flex items-center justify-center">
                              <Sparkles className="w-4 h-4 text-white" />
                            </div>
                          </div>
                          <span className="text-xs font-semibold text-white mt-1.5">{c.name}</span>
                          <span className="text-[10px] text-indigo-400 font-mono">{c.freq} Hz</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* 4. System Telemetry Window */}
                {win.id === 'sysmon' && (
                  <div className="space-y-3 text-xs">
                    <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-slate-400">OS Kernel:</span>
                        <span className="font-mono text-emerald-400">KikiOS v2.4 (Cosmic Release)</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Active Topology Bridges:</span>
                        <span className="font-mono text-white">{bridges.length || 10} Connected</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Harmonic Oscillator:</span>
                        <span className="font-mono text-pink-400">{activeFrequency} Hz</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">GitHub Workspace:</span>
                        <span className="font-mono text-indigo-400">@grogusmom1989 ({githubRepos.length} repos)</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Cloud Storage:</span>
                        <span className="font-mono text-cyan-400">Firestore + Google Drive ({driveFiles.length} files)</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Creator Earnings:</span>
                        <span className="font-mono text-amber-400">paypal.me/grogusmom1989</span>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-indigo-950/40 border border-indigo-500/20 text-indigo-300 text-[11px] flex items-center gap-2">
                      <Shield className="w-4 h-4 text-indigo-400 shrink-0" />
                      <span>All 8 world nodes and bridges operating with zero packet loss.</span>
                    </div>
                  </div>
                )}

                {/* 5. Scratchpad Window */}
                {win.id === 'scratchpad' && (
                  <div className="h-full flex flex-col">
                    <textarea
                      value={osNote}
                      onChange={(e) => setOsNote(e.target.value)}
                      className="flex-1 w-full bg-slate-950/80 border border-slate-800 rounded-lg p-3 text-xs font-mono text-slate-200 outline-none resize-none focus:border-indigo-400"
                      placeholder="Write quick notes here..."
                    />
                    <div className="mt-2 flex justify-between items-center text-[10px] text-slate-400">
                      <span>Live autosave in KikiOS memory</span>
                      <button
                        onClick={() => {
                          if (onAddTask) {
                            onAddTask({
                              title: osNote.slice(0, 40) + '...',
                              description: osNote,
                              status: 'todo',
                              priority: 'medium',
                              source: 'manual',
                              tags: ['KikiOS', 'Scratchpad'],
                            });
                            playChime(639, 0.2);
                          }
                        }}
                        className="px-2 py-1 bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 rounded text-[10px] transition"
                      >
                        Convert to Workspace Task
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Futuristic KikiOS Desktop Dock */}
      <footer className="relative z-40 h-16 flex items-center justify-center pb-2 pointer-events-none">
        <div className="pointer-events-auto bg-slate-950/80 backdrop-blur-2xl border border-indigo-500/30 rounded-2xl px-3 py-1.5 flex items-center gap-2 shadow-[0_12px_40px_rgba(0,0,0,0.6)]">
          {[
            { id: 'terminal', label: 'Terminal', icon: Terminal, color: 'from-emerald-500 to-cyan-500' },
            { id: 'theater', label: 'Theater', icon: Tv, color: 'from-purple-500 to-pink-500' },
            { id: 'altar', label: 'Crystal Altar', icon: Sparkles, color: 'from-amber-500 to-rose-500' },
            { id: 'sysmon', label: 'Telemetry', icon: Cpu, color: 'from-blue-500 to-indigo-500' },
            { id: 'scratchpad', label: 'Scratchpad', icon: FileText, color: 'from-indigo-500 to-fuchsia-500' },
          ].map((dockItem) => {
            const Icon = dockItem.icon;
            const isOpen = windows[dockItem.id]?.isOpen && !windows[dockItem.id]?.isMinimized;

            return (
              <button
                key={dockItem.id}
                onClick={() => focusWindow(dockItem.id)}
                className="group relative flex flex-col items-center p-2 rounded-xl hover:bg-white/10 active:scale-95 transition-all"
                title={dockItem.label}
              >
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${dockItem.color} p-0.5 shadow-md group-hover:-translate-y-2 transition-transform duration-200`}>
                  <div className="w-full h-full bg-slate-950/90 rounded-[10px] flex items-center justify-center">
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                </div>

                {/* Dock Open Indicator Dot */}
                <span
                  className={`w-1 h-1 rounded-full mt-1 transition-all ${
                    isOpen ? 'bg-indigo-400 scale-120' : 'bg-transparent'
                  }`}
                />

                {/* Tooltip */}
                <div className="absolute -top-8 px-2 py-0.5 rounded-md bg-slate-900 border border-slate-700 text-[10px] text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-lg">
                  {dockItem.label}
                </div>
              </button>
            );
          })}

          <div className="w-[1px] h-8 bg-slate-800 mx-1" />

          {/* Quick Hub Navigation Links in Dock */}
          <button
            onClick={() => onSelectTab('bridges')}
            className="p-2 rounded-xl hover:bg-white/10 transition text-slate-400 hover:text-white"
            title="Bridges Network Topology"
          >
            <Layers className="w-5 h-5 text-indigo-400" />
          </button>
          <button
            onClick={() => onSelectTab('earnings')}
            className="p-2 rounded-xl hover:bg-white/10 transition text-slate-400 hover:text-white"
            title="PayPal Creator Earnings"
          >
            <DollarSign className="w-5 h-5 text-emerald-400" />
          </button>
          <button
            onClick={() => onSelectTab('overview')}
            className="p-2 rounded-xl hover:bg-white/10 transition text-slate-400 hover:text-white"
            title="Return to Main Workspace"
          >
            <Monitor className="w-5 h-5 text-cyan-400" />
          </button>
        </div>
      </footer>
    </div>
  );
};
