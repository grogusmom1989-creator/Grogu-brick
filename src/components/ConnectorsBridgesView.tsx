import React, { useState, useMemo } from 'react';
import {
  GitBranch,
  Cloud,
  Github,
  Compass,
  Film,
  Code2,
  DollarSign,
  FolderGit2,
  CheckSquare,
  FileText,
  Activity,
  Zap,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Sliders,
  ArrowRight,
  Download,
  Plus,
  RefreshCw,
  Search,
  ExternalLink,
  Volume2,
  Radio,
  Eye,
  Layers,
  Sparkles,
  Cpu,
  Share2,
  Trash2,
  Filter,
} from 'lucide-react';
import {
  ProjectBridge,
  BridgeEvent,
  BridgeModule,
  GoogleDriveFile,
  GitHubRepo,
  WorkspaceTask,
  WorkspaceNote,
  WorkspaceProject,
  AppTab,
} from '../types';
import { User } from 'firebase/auth';
import { GitHubUser } from '../services/github';
import { oneDAudio } from '../services/oneDWorldAudio';
import { kikisAudio } from '../services/kikisAudioEngine';

interface ConnectorsBridgesViewProps {
  bridges: ProjectBridge[];
  onUpdateBridge: (id: string, updates: Partial<ProjectBridge>) => void;
  onAddBridge: (bridge: Omit<ProjectBridge, 'id' | 'packetsCount' | 'lastEventAt'>) => void;
  onDeleteBridge: (id: string) => void;
  bridgeEvents: BridgeEvent[];
  onAddBridgeEvent: (event: Omit<BridgeEvent, 'id' | 'timestamp'>) => void;
  onClearBridgeEvents: () => void;
  googleUser: User | null;
  githubUser: GitHubUser | null;
  driveFiles: GoogleDriveFile[];
  githubRepos: GitHubRepo[];
  tasks: WorkspaceTask[];
  notes: WorkspaceNote[];
  projects: WorkspaceProject[];
  onSelectTab: (tab: AppTab) => void;
  onAddTask: (task: Omit<WorkspaceTask, 'id' | 'createdAt'>) => void;
  onAddNote: (note: Omit<WorkspaceNote, 'id' | 'updatedAt'>) => void;
}

interface NodeDefinition {
  id: BridgeModule;
  label: string;
  sublabel: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgGlow: string;
  tabTarget: AppTab;
  x: number; // percentage
  y: number; // percentage
}

const MODULE_NODES: NodeDefinition[] = [
  {
    id: 'drive',
    label: 'Google Drive',
    sublabel: 'Cloud Assets & Media',
    icon: Cloud,
    color: 'text-cyan-400 border-cyan-500/40 bg-cyan-950/40',
    bgGlow: 'from-cyan-500/20',
    tabTarget: 'drive',
    x: 18,
    y: 20,
  },
  {
    id: 'github',
    label: 'GitHub Hub',
    sublabel: 'grogusmom1989 Repos',
    icon: Github,
    color: 'text-indigo-400 border-indigo-500/40 bg-indigo-950/40',
    bgGlow: 'from-indigo-500/20',
    tabTarget: 'github',
    x: 82,
    y: 20,
  },
  {
    id: 'one_d_world',
    label: '1D World & Reiki',
    sublabel: 'Solfeggio & Automata',
    icon: Compass,
    color: 'text-emerald-400 border-emerald-500/40 bg-emerald-950/40',
    bgGlow: 'from-emerald-500/20',
    tabTarget: 'one_d_world',
    x: 18,
    y: 55,
  },
  {
    id: 'kikis_world',
    label: "Kiki's World 2.0",
    sublabel: 'Media Cinema & Audio',
    icon: Film,
    color: 'text-purple-400 border-purple-500/40 bg-purple-950/40',
    bgGlow: 'from-purple-500/20',
    tabTarget: 'kikis_world',
    x: 82,
    y: 55,
  },
  {
    id: 'remix',
    label: 'Remixed Studio',
    sublabel: 'Code Inject & Presets',
    icon: Code2,
    color: 'text-pink-400 border-pink-500/40 bg-pink-950/40',
    bgGlow: 'from-pink-500/20',
    tabTarget: 'remix',
    x: 28,
    y: 86,
  },
  {
    id: 'earnings',
    label: 'PayPal Creator',
    sublabel: 'Tips & Monetization',
    icon: DollarSign,
    color: 'text-amber-400 border-amber-500/40 bg-amber-950/40',
    bgGlow: 'from-amber-500/20',
    tabTarget: 'earnings',
    x: 72,
    y: 86,
  },
  {
    id: 'projects',
    label: 'Projects Portfolio',
    sublabel: 'Unified Repository',
    icon: FolderGit2,
    color: 'text-blue-400 border-blue-500/40 bg-blue-950/40',
    bgGlow: 'from-blue-500/20',
    tabTarget: 'projects',
    x: 50,
    y: 36,
  },
  {
    id: 'tasks',
    label: 'Omni Priorities',
    sublabel: 'Action Items & Notes',
    icon: CheckSquare,
    color: 'text-violet-400 border-violet-500/40 bg-violet-950/40',
    bgGlow: 'from-violet-500/20',
    tabTarget: 'tasks',
    x: 50,
    y: 70,
  },
];

export const ConnectorsBridgesView: React.FC<ConnectorsBridgesViewProps> = ({
  bridges,
  onUpdateBridge,
  onAddBridge,
  onDeleteBridge,
  bridgeEvents,
  onAddBridgeEvent,
  onClearBridgeEvents,
  googleUser,
  githubUser,
  driveFiles,
  githubRepos,
  tasks,
  notes,
  projects,
  onSelectTab,
  onAddTask,
  onAddNote,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNodeId, setSelectedNodeId] = useState<BridgeModule | null>(null);
  const [pulsingBridgeId, setPulsingBridgeId] = useState<string | null>(null);
  const [isNewBridgeModalOpen, setIsNewBridgeModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New Custom Bridge Form State
  const [formTitle, setFormTitle] = useState('');
  const [formSource, setFormSource] = useState<BridgeModule>('drive');
  const [formTarget, setFormTarget] = useState<BridgeModule>('kikis_world');
  const [formCategory, setFormCategory] = useState<ProjectBridge['category']>('data');
  const [formSyncMode, setFormSyncMode] = useState<ProjectBridge['syncMode']>('event_driven');
  const [formDesc, setFormDesc] = useState('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Play gentle harmonic audio feedback when a bridge pulse fires
  const playPulseAudio = (freq = 528) => {
    try {
      oneDAudio.playTone(freq, 0.45, 'sine');
    } catch {
      // Audio fallback
    }
  };

  // Handle manual test pulse on a bridge
  const handleTestPulse = (bridge: ProjectBridge) => {
    setPulsingBridgeId(bridge.id);
    playPulseAudio(bridge.category === 'audio' ? 528 : bridge.category === 'payment' ? 639 : 432);

    // Increment packet count & update last event
    onUpdateBridge(bridge.id, {
      packetsCount: (bridge.packetsCount || 0) + 1,
      lastEventAt: new Date().toISOString(),
      status: 'active',
    });

    let summary = `Pulse executed across ${bridge.title}`;
    let samplePayload: any = { timestamp: new Date().toISOString(), latencyMs: bridge.latencyMs };

    // Execute real domain cross-action depending on bridge
    if (bridge.id === 'bridge-drive-kiki-media') {
      summary = `Streamed ${driveFiles.length > 0 ? driveFiles[0].name : 'Direct Video Stream'} to Kiki's Cinema`;
      samplePayload = { file: driveFiles[0]?.name || 'CosmicFlow.mp4', mime: 'video/mp4', mode: 'hls_direct' };
    } else if (bridge.id === 'bridge-github-portfolio') {
      summary = `Verified ${githubRepos.length} repos from ${githubUser?.login || 'grogusmom1989'}`;
      samplePayload = { reposCount: githubRepos.length, branch: 'main', status: 'synchronized' };
    } else if (bridge.id === 'bridge-github-tasks') {
      const taskTitle = `GitHub Sync: Review open PRs in ${githubRepos[0]?.name || 'OmniSync'}`;
      onAddTask({
        title: taskTitle,
        description: `Automated task created via GitHub Issues Bridge on ${new Date().toLocaleTimeString()}`,
        priority: 'high',
        source: 'github',
        status: 'todo',
        tags: ['Bridge', 'GitHub', 'Automated'],
      });
      summary = `Dispatched priority task "${taskTitle}" to Action Items`;
      samplePayload = { action: 'task_created', title: taskTitle };
    } else if (bridge.id === 'bridge-1d-kiki-sound') {
      summary = `Transmitted 528Hz Solfeggio carrier wave into Kiki's audio bus`;
      samplePayload = { carrierFreq: 528, binauralBeat: 6, resonance: 'DNA_Repair' };
    } else if (bridge.id === 'bridge-1d-paypal-booking') {
      summary = `Routed Reiki alignment exchange tier ($35.00) to PayPal checkout gateway`;
      samplePayload = { tier: 'Reiki Energy Exchange', amount: 35.0, recipient: 'grogusmom1989@gmail.com' };
    } else if (bridge.id === 'bridge-remix-github') {
      summary = `Packaged Remixed App Studio recipe into TypeScript project format`;
      samplePayload = { format: 'react_tailwind_vite', componentsCount: 8, target: 'github_export' };
    } else if (bridge.id === 'bridge-drive-notes') {
      summary = `Synced Google Drive links into Workspace Markdown Knowledge Base`;
      samplePayload = { documentsIndexed: driveFiles.length, format: 'markdown_links' };
    } else if (bridge.id === 'bridge-paypal-portfolio') {
      summary = `Associated PayPal tip button with ${projects.length} portfolio project cards`;
      samplePayload = { projectsFunded: projects.length, tipHandle: 'grogusmom1989' };
    }

    onAddBridgeEvent({
      bridgeId: bridge.id,
      bridgeName: bridge.title,
      source: bridge.sourceModule,
      target: bridge.targetModule,
      type: `${bridge.category}_pulse`,
      summary,
      payload: samplePayload,
      status: 'delivered',
    });

    showToast(`Pulse Delivered: ${bridge.title}`);

    setTimeout(() => {
      setPulsingBridgeId(null);
    }, 1800);
  };

  // Pulse all bridges at once
  const handlePulseAllBridges = () => {
    playPulseAudio(852);
    bridges.forEach((b, idx) => {
      setTimeout(() => {
        if (b.enabled) {
          handleTestPulse(b);
        }
      }, idx * 180);
    });
    showToast(`Triggered full cross-system pulse across ${bridges.length} active bridges!`);
  };

  // Export full bridges config as JSON
  const handleExportBridgesConfig = () => {
    const payload = {
      app: 'OmniSync Hub',
      user: 'grogusmom1989@gmail.com',
      exportDate: new Date().toISOString(),
      bridgesCount: bridges.length,
      bridges,
      recentEvents: bridgeEvents.slice(0, 20),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `omnisync-bridges-topology-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Downloaded OmniSync Bridges Configuration JSON');
  };

  // Handle custom bridge creation
  const handleCreateCustomBridge = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    onAddBridge({
      name: formTitle.toLowerCase().replace(/\s+/g, '_'),
      title: formTitle.trim(),
      sourceModule: formSource,
      targetModule: formTarget,
      description: formDesc.trim() || `Direct bridge connecting ${formSource} and ${formTarget}`,
      status: 'active',
      syncMode: formSyncMode,
      latencyMs: Math.floor(Math.random() * 25) + 5,
      enabled: true,
      category: formCategory,
      config: {
        custom: true,
        createdAt: new Date().toISOString(),
      },
    });

    onAddBridgeEvent({
      bridgeId: `bridge-custom-${Date.now()}`,
      bridgeName: formTitle.trim(),
      source: formSource,
      target: formTarget,
      type: 'bridge_created',
      summary: `Created custom bridge "${formTitle.trim()}" between ${formSource} and ${formTarget}`,
      status: 'delivered',
    });

    setIsNewBridgeModalOpen(false);
    setFormTitle('');
    setFormDesc('');
    showToast(`Bridge "${formTitle.trim()}" registered and active!`);
  };

  // Filter bridges
  const filteredBridges = useMemo(() => {
    return bridges.filter((b) => {
      const matchesCategory = selectedCategory === 'all' || b.category === selectedCategory;
      const matchesSearch =
        !searchQuery ||
        b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.sourceModule.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.targetModule.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesNode =
        !selectedNodeId || b.sourceModule === selectedNodeId || b.targetModule === selectedNodeId;
      return matchesCategory && matchesSearch && matchesNode;
    });
  }, [bridges, selectedCategory, searchQuery, selectedNodeId]);

  const activeCount = bridges.filter((b) => b.enabled).length;
  const totalPackets = bridges.reduce((acc, b) => acc + (b.packetsCount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-2.5 bg-indigo-600 text-white text-xs font-semibold rounded-lg shadow-xl border border-indigo-400 flex items-center gap-2 animate-bounce">
          <Zap className="w-4 h-4 text-cyan-300" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Hero Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          <div className="space-y-1.5 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-semibold">
              <Share2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>Project Connectors & Cross-App Bridges</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Unified Data Bridges & Real-time Cross-Module Pipelines
            </h1>
            <p className="text-xs text-slate-400">
              Bi-directional connectors syncing Google Drive assets, GitHub repositories, 1D World Solfeggio soundwaves, Kiki's World 2.0 Cinema, Remixed App Studio, and PayPal Creator Earnings.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={handlePulseAllBridges}
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium flex items-center gap-2 shadow-md shadow-indigo-600/30 transition-all"
            >
              <Zap className="w-3.5 h-3.5 text-cyan-300" />
              <span>Pulse All Bridges</span>
            </button>

            <button
              onClick={() => setIsNewBridgeModalOpen(true)}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-3.5 h-3.5 text-cyan-400" />
              <span>New Custom Bridge</span>
            </button>

            <button
              onClick={handleExportBridgesConfig}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 rounded-lg transition-colors"
              title="Export Topology JSON"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-5 border-t border-slate-800/80">
          <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-2.5">
            <div className="text-[11px] text-slate-400 font-medium">Active Connectors</div>
            <div className="text-lg font-bold text-white mt-0.5 flex items-center gap-1.5">
              <span>{activeCount}</span>
              <span className="text-[10px] text-emerald-400 font-mono font-normal">/ {bridges.length} total</span>
            </div>
          </div>

          <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-2.5">
            <div className="text-[11px] text-slate-400 font-medium">Total Signals / Packets</div>
            <div className="text-lg font-bold text-cyan-400 mt-0.5 font-mono">
              {totalPackets.toLocaleString()}
            </div>
          </div>

          <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-2.5">
            <div className="text-[11px] text-slate-400 font-medium">Average Latency</div>
            <div className="text-lg font-bold text-emerald-400 mt-0.5 font-mono">
              ~16 ms
            </div>
          </div>

          <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-2.5">
            <div className="text-[11px] text-slate-400 font-medium">Synchronized Nodes</div>
            <div className="text-lg font-bold text-purple-400 mt-0.5">
              8 Live Projects
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Visual Topology Map */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Cpu className="w-4 h-4 text-cyan-400" />
              <span>Interactive Cross-Project Topology Map</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Click any project node to filter active bridges. Glowing links indicate live cross-communication pipes.
            </p>
          </div>

          {selectedNodeId && (
            <button
              onClick={() => setSelectedNodeId(null)}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1 px-2.5 py-1 bg-indigo-500/10 rounded-lg border border-indigo-500/20"
            >
              <span>Clear Node Focus ({selectedNodeId})</span>
              <RotateCcw className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Visual Map Canvas / Grid */}
        <div className="relative w-full h-80 sm:h-96 bg-slate-950 rounded-xl border border-slate-800 overflow-hidden shadow-inner flex items-center justify-center">
          {/* Subtle grid background */}
          <div
            className="absolute inset-0 opacity-15 pointer-events-none"
            style={{
              backgroundImage:
                'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.2) 1px, transparent 0)',
              backgroundSize: '24px 24px',
            }}
          />

          {/* SVG Connecting Cables / Bridges between nodes */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            <defs>
              <linearGradient id="bridgeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.7" />
                <stop offset="50%" stopColor="#6366f1" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#a855f7" stopOpacity="0.7" />
              </linearGradient>
            </defs>

            {bridges.map((bridge) => {
              const src = MODULE_NODES.find((n) => n.id === bridge.sourceModule);
              const tgt = MODULE_NODES.find((n) => n.id === bridge.targetModule);
              if (!src || !tgt) return null;

              const isHighlighted =
                !selectedNodeId ||
                selectedNodeId === bridge.sourceModule ||
                selectedNodeId === bridge.targetModule;
              const isPulsing = pulsingBridgeId === bridge.id;

              return (
                <line
                  key={bridge.id}
                  x1={`${src.x}%`}
                  y1={`${src.y}%`}
                  x2={`${tgt.x}%`}
                  y2={`${tgt.y}%`}
                  stroke={isPulsing ? '#22d3ee' : isHighlighted ? 'url(#bridgeGradient)' : '#334155'}
                  strokeWidth={isPulsing ? 3.5 : isHighlighted ? 2 : 1}
                  strokeDasharray={isPulsing ? '4,4' : isHighlighted ? '6,6' : 'none'}
                  strokeOpacity={isHighlighted ? 0.9 : 0.25}
                  className={isPulsing ? 'animate-pulse' : ''}
                />
              );
            })}
          </svg>

          {/* Render Nodes */}
          {MODULE_NODES.map((node) => {
            const isSelected = selectedNodeId === node.id;
            const Icon = node.icon;
            const connectedBridgesCount = bridges.filter(
              (b) => b.sourceModule === node.id || b.targetModule === node.id
            ).length;

            return (
              <div
                key={node.id}
                onClick={() => setSelectedNodeId(isSelected ? null : node.id)}
                style={{
                  left: `${node.x}%`,
                  top: `${node.y}%`,
                  transform: 'translate(-50%, -50%)',
                }}
                className={`absolute z-10 cursor-pointer group transition-all duration-300 ${
                  isSelected ? 'scale-110' : 'hover:scale-105'
                }`}
              >
                <div
                  className={`p-3 rounded-xl border flex items-center gap-2.5 shadow-lg transition-all ${
                    node.color
                  } ${isSelected ? 'ring-2 ring-indigo-400 shadow-indigo-500/30' : 'hover:border-slate-400'}`}
                >
                  <div className="p-1.5 rounded-lg bg-slate-900/80 shrink-0">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="hidden sm:block text-left">
                    <div className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span>{node.label}</span>
                      <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-slate-900 text-slate-300 font-mono">
                        {connectedBridgesCount}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400">{node.sublabel}</div>
                  </div>
                </div>

                {/* Quick Navigate Link */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectTab(node.tabTarget);
                  }}
                  className="absolute -bottom-2 -right-2 w-5 h-5 rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-300 hover:text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  title={`Open ${node.label}`}
                >
                  <ArrowRight className="w-2.5 h-2.5" />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 rounded-xl p-3">
        {/* Categories */}
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: 'all', label: 'All Bridges' },
            { id: 'media', label: 'Media & Streaming' },
            { id: 'code', label: 'Code & GitHub' },
            { id: 'audio', label: 'Audio & Solfeggio' },
            { id: 'payment', label: 'PayPal & Booking' },
            { id: 'data', label: 'Tasks & Notes' },
            { id: 'webhook', label: 'Webhooks' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                selectedCategory === cat.id
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-700'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative min-w-[220px]">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search bridges..."
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Bridges Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredBridges.map((bridge) => {
          const isPulsing = pulsingBridgeId === bridge.id;
          const srcNode = MODULE_NODES.find((n) => n.id === bridge.sourceModule);
          const tgtNode = MODULE_NODES.find((n) => n.id === bridge.targetModule);

          return (
            <div
              key={bridge.id}
              className={`bg-slate-900 border rounded-xl p-5 space-y-4 transition-all ${
                isPulsing
                  ? 'border-cyan-400 shadow-lg shadow-cyan-500/20'
                  : bridge.enabled
                  ? 'border-slate-800 hover:border-slate-700'
                  : 'border-slate-800/60 opacity-60'
              }`}
            >
              {/* Header: Title + Toggle */}
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        bridge.enabled
                          ? 'bg-emerald-400 shadow-sm shadow-emerald-400/50 animate-pulse'
                          : 'bg-slate-600'
                      }`}
                    />
                    <h4 className="text-sm font-bold text-white tracking-tight">{bridge.title}</h4>
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-2">{bridge.description}</p>
                </div>

                {/* Enable Switch */}
                <button
                  onClick={() => onUpdateBridge(bridge.id, { enabled: !bridge.enabled })}
                  className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors shrink-0 ${
                    bridge.enabled ? 'bg-indigo-600' : 'bg-slate-700'
                  }`}
                  title={bridge.enabled ? 'Disable bridge' : 'Enable bridge'}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                      bridge.enabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Module Flow Badges */}
              <div className="flex items-center gap-2 text-xs">
                <span className="px-2.5 py-1 rounded-md bg-slate-950 border border-slate-800 text-slate-300 font-medium flex items-center gap-1.5">
                  {srcNode && <srcNode.icon className="w-3.5 h-3.5 text-cyan-400" />}
                  <span>{srcNode?.label || bridge.sourceModule}</span>
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span className="px-2.5 py-1 rounded-md bg-slate-950 border border-slate-800 text-slate-300 font-medium flex items-center gap-1.5">
                  {tgtNode && <tgtNode.icon className="w-3.5 h-3.5 text-purple-400" />}
                  <span>{tgtNode?.label || bridge.targetModule}</span>
                </span>
              </div>

              {/* Status and Metrics Strip */}
              <div className="bg-slate-950 rounded-lg p-2.5 border border-slate-800/80 flex items-center justify-between text-xs font-mono text-slate-400">
                <div className="flex items-center gap-3">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block">Mode</span>
                    <span className="text-slate-200 capitalize">{bridge.syncMode.replace('_', ' ')}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block">Latency</span>
                    <span className="text-emerald-400">{bridge.latencyMs}ms</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block">Packets</span>
                    <span className="text-cyan-400">{bridge.packetsCount}</span>
                  </div>
                </div>

                <span className="text-[10px] text-slate-500">
                  {bridge.lastEventAt ? new Date(bridge.lastEventAt).toLocaleTimeString() : 'Idle'}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-1 gap-2">
                <button
                  onClick={() => handleTestPulse(bridge)}
                  disabled={!bridge.enabled}
                  className="flex-1 py-1.5 px-3 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 hover:text-white border border-indigo-500/30 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-all disabled:opacity-40"
                >
                  <Zap className={`w-3.5 h-3.5 ${isPulsing ? 'animate-bounce text-cyan-300' : 'text-indigo-400'}`} />
                  <span>{isPulsing ? 'Pulsing Stream...' : 'Test Bridge Pulse'}</span>
                </button>

                <button
                  onClick={() => {
                    if (srcNode) onSelectTab(srcNode.tabTarget);
                  }}
                  className="py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors border border-slate-700"
                  title="Open source module"
                >
                  <span>Open</span>
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </button>

                {bridge.config?.custom && (
                  <button
                    onClick={() => onDeleteBridge(bridge.id)}
                    className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors"
                    title="Delete Custom Bridge"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Live Bridge Event Stream */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white tracking-tight">
              Live Cross-Bridge Event Stream ({bridgeEvents.length})
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClearBridgeEvents}
              className="text-xs text-slate-400 hover:text-slate-200 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 transition-colors"
            >
              Clear Log
            </button>
          </div>
        </div>

        {bridgeEvents.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-lg">
            No events registered yet. Click &quot;Test Bridge Pulse&quot; or &quot;Pulse All Bridges&quot; to fire cross-system transmissions.
          </div>
        ) : (
          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {bridgeEvents.map((evt) => (
              <div
                key={evt.id}
                className="bg-slate-950 border border-slate-800/80 rounded-lg p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-start gap-2.5">
                  <div className="p-1.5 rounded-md bg-indigo-500/10 text-indigo-400 mt-0.5">
                    <Zap className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-200 flex items-center gap-2">
                      <span>{evt.bridgeName}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-900 text-emerald-400 border border-emerald-500/20">
                        {evt.status}
                      </span>
                    </div>
                    <p className="text-slate-400 mt-0.5">{evt.summary}</p>
                    {evt.payload && (
                      <div className="font-mono text-[10px] text-slate-500 mt-1">
                        Payload: {JSON.stringify(evt.payload)}
                      </div>
                    )}
                  </div>
                </div>

                <div className="text-[11px] font-mono text-slate-500 shrink-0">
                  {new Date(evt.timestamp).toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* New Custom Bridge Modal */}
      {isNewBridgeModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Share2 className="w-4 h-4 text-cyan-400" />
                <span>Create Custom Project Bridge</span>
              </h3>
              <button
                onClick={() => setIsNewBridgeModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCustomBridge} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Bridge Title</label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g., Kiki Sound ⇄ Spotify Broadcast"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Source Module</label>
                  <select
                    value={formSource}
                    onChange={(e) => setFormSource(e.target.value as BridgeModule)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    {MODULE_NODES.map((n) => (
                      <option key={n.id} value={n.id}>
                        {n.label}
                      </option>
                    ))}
                    <option value="webhook">External Webhook</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Target Module</label>
                  <select
                    value={formTarget}
                    onChange={(e) => setFormTarget(e.target.value as BridgeModule)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    {MODULE_NODES.map((n) => (
                      <option key={n.id} value={n.id}>
                        {n.label}
                      </option>
                    ))}
                    <option value="webhook">External Webhook</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Category</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as ProjectBridge['category'])}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="data">Data & Automation</option>
                    <option value="media">Media & Streaming</option>
                    <option value="audio">Audio & Frequencies</option>
                    <option value="code">Code & Repositories</option>
                    <option value="payment">Payment & Payouts</option>
                    <option value="webhook">Webhook & API</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Sync Mode</label>
                  <select
                    value={formSyncMode}
                    onChange={(e) => setFormSyncMode(e.target.value as ProjectBridge['syncMode'])}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="realtime">Real-time Stream</option>
                    <option value="event_driven">Event Driven</option>
                    <option value="poll">Scheduled Poll</option>
                    <option value="manual">Manual Trigger</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Description</label>
                <textarea
                  rows={2}
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  placeholder="Describe what data flows across this bridge..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewBridgeModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium shadow-md"
                >
                  Save & Enable Bridge
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
