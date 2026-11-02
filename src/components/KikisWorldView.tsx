import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Play,
  Pause,
  Film,
  Music,
  Tv,
  Volume2,
  VolumeX,
  Upload,
  Radio,
  ExternalLink,
  Layers,
  Heart,
  Grid,
  CheckCircle2,
  Plus,
  RefreshCw,
  Search,
  Maximize2,
  Minimize2,
  RotateCcw,
  SkipForward,
  SkipBack,
  Cloud,
  Github,
  Compass,
  FileText,
  Star,
  Eye,
  Sliders,
} from 'lucide-react';
import { GoogleDriveFile, GitHubRepo, WorkspaceTask, WorkspaceNote, CrystalNode, OracleCard } from '../types';
import { kikisAudio, PlaylistItem } from '../services/kikisAudioEngine';

interface KikisWorldViewProps {
  driveFiles: GoogleDriveFile[];
  githubRepos: GitHubRepo[];
  tasks: WorkspaceTask[];
  notes: WorkspaceNote[];
  onAddTask: (task: Omit<WorkspaceTask, 'id' | 'createdAt'>) => void;
  onLogSyncEvent: (source: any, message: string, count: number) => void;
}

const CURATED_VIDEOS = [
  {
    id: 'vid-1',
    title: '528Hz Sacred Geometry & Nebula Flow',
    description: 'Bioluminescent deep space fractal meditation and harmonic frequency journey.',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=600&auto=format&fit=crop&q=80',
    duration: '10:00',
    tag: 'Sacred Flow',
  },
  {
    id: 'vid-2',
    title: 'Aurora Borealis & Cosmic Starlight',
    description: 'Celestial northern lights dancing across crystal skies with 432Hz ambient resonance.',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=600&auto=format&fit=crop&q=80',
    duration: '11:00',
    tag: 'Celestial',
  },
  {
    id: 'vid-3',
    title: 'Crystalline Energy Matrix & Chakra Flow',
    description: 'Dynamic light beam meditation synchronizing the 7 meridian centers.',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80',
    duration: '0:15',
    tag: 'Reiki Matrix',
  },
];

const CURATED_AUDIO_TRACKS: PlaylistItem[] = [
  {
    id: 'track-1',
    title: '528Hz Miracle Resonance & DNA Repair',
    artist: "Kiki's Reiki HQ Sound Lab",
    type: 'frequency',
    frequency: 528,
    duration: 'Continuous',
    color: '#f59e0b',
  },
  {
    id: 'track-2',
    title: '432Hz Universal Harmony & Deep Stillness',
    artist: "Kiki's Sanctuary Strings",
    type: 'frequency',
    frequency: 432,
    duration: 'Continuous',
    color: '#06b6d4',
  },
  {
    id: 'track-3',
    title: '639Hz Heart Coherence & Compassion Stream',
    artist: 'Anahata Reiki Master',
    type: 'frequency',
    frequency: 639,
    duration: 'Continuous',
    color: '#10b981',
  },
  {
    id: 'track-4',
    title: '963Hz Crown Awakening & Celestial Light',
    artist: 'Sahasrara Light Body',
    type: 'frequency',
    frequency: 963,
    duration: 'Continuous',
    color: '#a855f7',
  },
  {
    id: 'track-5',
    title: '7.83Hz Schumann Resonance + Theta Brainwave',
    artist: 'Earth Biofield Entrainment',
    type: 'frequency',
    frequency: 432,
    duration: 'Continuous',
    color: '#ec4899',
  },
];

const ORACLE_CARDS: OracleCard[] = [
  {
    id: 'card-1',
    title: 'The Quantum Portal',
    subtitle: 'Vibrational Expansion',
    glyph: '✦',
    color: '#818cf8',
    frequency: 528,
    guidance: 'You are stepping into a higher octave of creative power. All fragmented projects align effortlessly when approached with joy.',
    affirmation: 'I welcome quantum leaps in my productivity and creative flow.',
    alignmentAction: 'Review high-priority tasks and clear unnecessary friction.',
  },
  {
    id: 'card-2',
    title: 'Solar Sovereignty',
    subtitle: 'Inner Fire & Authority',
    glyph: '☉',
    color: '#f59e0b',
    frequency: 528,
    guidance: 'Take full ownership of your creations. Your unique vision cannot be duplicated. Lead with bold certainty and luminous clarity.',
    affirmation: 'I stand in the radiant center of my creative authority.',
    alignmentAction: 'Publish or push an active code repository update today.',
  },
  {
    id: 'card-3',
    title: 'The 1D Thread of Grace',
    subtitle: 'Unbroken Divine Alignment',
    glyph: '—',
    color: '#06b6d4',
    frequency: 432,
    guidance: 'Even when the path feels narrow or simplified to a single line, that one thread is directly connected to infinite intelligence.',
    affirmation: 'I trust the single step before me; it holds the entire universe.',
    alignmentAction: 'Complete one small task with 100% presence.',
  },
  {
    id: 'card-4',
    title: 'Emerald Sanctuary',
    subtitle: 'Heart-Centered Harmony',
    glyph: '❤',
    color: '#10b981',
    frequency: 639,
    guidance: 'Bring tenderness to your collaborative efforts. When code and content serve human connection, success is natural.',
    affirmation: 'My work is a blessing to all who interact with it.',
    alignmentAction: 'Share progress or a kind note with a collaborator.',
  },
];

const INITIAL_CRYSTALS: CrystalNode[] = [
  {
    id: 'c-1',
    name: 'Clear Quartz',
    stone: 'Master Healer',
    x: 50,
    y: 16,
    frequency: 963,
    color: '#e0e7ff',
    glowColor: '#818cf8',
    chakra: 'Crown',
    property: 'Amplification & Clarity',
    activated: true,
  },
  {
    id: 'c-2',
    name: 'Amethyst',
    stone: 'Spiritual Vision',
    x: 74,
    y: 35,
    frequency: 852,
    color: '#c084fc',
    glowColor: '#a855f7',
    chakra: 'Third Eye',
    property: 'Intuitive Insight',
    activated: true,
  },
  {
    id: 'c-3',
    name: 'Lapis Lazuli',
    stone: 'Truth Stone',
    x: 74,
    y: 65,
    frequency: 741,
    color: '#38bdf8',
    glowColor: '#0284c7',
    chakra: 'Throat',
    property: 'Clear Expression',
    activated: true,
  },
  {
    id: 'c-4',
    name: 'Rose Quartz',
    stone: 'Heart Center',
    x: 50,
    y: 84,
    frequency: 639,
    color: '#f472b6',
    glowColor: '#db2777',
    chakra: 'Heart',
    property: 'Unconditional Compassion',
    activated: true,
  },
  {
    id: 'c-5',
    name: 'Citrine',
    stone: 'Abundance Flame',
    x: 26,
    y: 65,
    frequency: 528,
    color: '#fde047',
    glowColor: '#eab308',
    chakra: 'Solar Plexus',
    property: 'Manifestation & Joy',
    activated: true,
  },
  {
    id: 'c-6',
    name: 'Carnelian',
    stone: 'Vital Spark',
    x: 26,
    y: 35,
    frequency: 417,
    color: '#fb923c',
    glowColor: '#ea580c',
    chakra: 'Sacral',
    property: 'Creative Passion',
    activated: true,
  },
  {
    id: 'c-7',
    name: 'Black Tourmaline',
    stone: 'Guardian Shield',
    x: 50,
    y: 50,
    frequency: 396,
    color: '#94a3b8',
    glowColor: '#475569',
    chakra: 'Root Anchor',
    property: 'Protection & Grounding',
    activated: true,
  },
];

export const KikisWorldView: React.FC<KikisWorldViewProps> = ({
  driveFiles,
  githubRepos,
  tasks,
  notes,
  onAddTask,
  onLogSyncEvent,
}) => {
  const [subTab, setSubTab] = useState<'theater' | 'all_content' | 'reiki_studio' | 'oracle'>('theater');

  // Video State
  const [activeVideo, setActiveVideo] = useState<any>(CURATED_VIDEOS[0]);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [videoSearch, setVideoSearch] = useState('');
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Audio & Music State
  const [activeTrack, setActiveTrack] = useState<PlaylistItem>(CURATED_AUDIO_TRACKS[0]);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [isBinauralActive, setIsBinauralActive] = useState(false);
  const visualizerCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Reiki Crystal Grid 2.0 State
  const [crystals, setCrystals] = useState<CrystalNode[]>(INITIAL_CRYSTALS);
  const [selectedCrystal, setSelectedCrystal] = useState<CrystalNode>(INITIAL_CRYSTALS[0]);
  const [isGridHarmonized, setIsGridHarmonized] = useState(false);

  // Oracle Deck State
  const [drawnCard, setDrawnCard] = useState<OracleCard>(ORACLE_CARDS[0]);
  const [isDrawing, setIsDrawing] = useState(false);

  // All Content Filter
  const [contentFilter, setContentFilter] = useState<'all' | 'video' | 'audio' | 'drive' | 'github' | 'notes'>('all');
  const [contentSearch, setContentSearch] = useState('');

  // Extract Drive Videos & Audio
  const driveVideos = driveFiles.filter((f) => f.mimeType.includes('video'));
  const driveAudios = driveFiles.filter((f) => f.mimeType.includes('audio'));

  // 1. Audio Visualizer Wave Loop
  useEffect(() => {
    let animId: number;
    const canvas = visualizerCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const analyser = kikisAudio.getAnalyser();
    const dataArray = new Uint8Array(64);

    const renderVisualizer = () => {
      animId = requestAnimationFrame(renderVisualizer);

      if (analyser && (isAudioPlaying || isBinauralActive)) {
        analyser.getByteFrequencyData(dataArray);
      } else {
        // Subtle ambient breathing wave if audio is paused
        for (let i = 0; i < dataArray.length; i++) {
          dataArray[i] = Math.sin(Date.now() * 0.003 + i * 0.2) * 15 + 18;
        }
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / dataArray.length) * 1.5;
      let x = 0;

      for (let i = 0; i < dataArray.length; i++) {
        const barHeight = (dataArray[i] / 255) * canvas.height * 0.85;

        const grad = ctx.createLinearGradient(0, canvas.height, 0, 0);
        grad.addColorStop(0, '#6366f1');
        grad.addColorStop(0.5, '#06b6d4');
        grad.addColorStop(1, '#a855f7');

        ctx.fillStyle = grad;
        ctx.fillRect(x, canvas.height - barHeight, barWidth - 1, barHeight);

        x += barWidth;
      }
    };

    renderVisualizer();
    return () => cancelAnimationFrame(animId);
  }, [isAudioPlaying, isBinauralActive]);

  // Video Handlers
  const handleSelectVideo = (vid: any) => {
    setActiveVideo(vid);
    setIsVideoPlaying(true);
    if (videoRef.current) {
      videoRef.current.src = vid.url;
      videoRef.current.play().catch(() => {});
    }
  };

  const handleTogglePlayVideo = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play().catch(() => {});
      setIsVideoPlaying(true);
    } else {
      videoRef.current.pause();
      setIsVideoPlaying(false);
    }
  };

  // Local Video Upload Picker
  const handleLocalVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const localUrl = URL.createObjectURL(file);
    const newVid = {
      id: 'local-' + Date.now(),
      title: file.name,
      description: `Local file (${(file.size / 1024 / 1024).toFixed(1)} MB) loaded into Kiki's Theater`,
      url: localUrl,
      thumbnail: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=600&auto=format&fit=crop&q=80',
      duration: 'Local',
      tag: 'My Video',
    };
    handleSelectVideo(newVid);
  };

  // Audio Handlers
  const handlePlayTrack = (track: PlaylistItem) => {
    setActiveTrack(track);

    if (track.type === 'frequency' && track.frequency) {
      kikisAudio.startBinauralBeat(track.frequency, 6);
      setIsBinauralActive(true);
      setIsAudioPlaying(true);
    } else if (track.url) {
      kikisAudio.playAudioUrl(track.url, track);
      setIsAudioPlaying(true);
      setIsBinauralActive(false);
    }
  };

  const handleToggleAudio = () => {
    if (isAudioPlaying) {
      kikisAudio.stopFrequencies();
      kikisAudio.pauseAudio();
      setIsAudioPlaying(false);
      setIsBinauralActive(false);
    } else {
      handlePlayTrack(activeTrack);
    }
  };

  // Harmonize Crystal Grid
  const handleHarmonizeGrid = () => {
    setIsGridHarmonized(true);
    kikisAudio.playHarmonicTone(528, 3.0);
    setCrystals((prev) => prev.map((c) => ({ ...c, activated: true })));

    onLogSyncEvent('all', "Kiki's World 2.0: Aligned 7-Crystal Harmonic Grid", 7);

    setTimeout(() => {
      setIsGridHarmonized(false);
    }, 2500);
  };

  // Draw Oracle Card
  const handleDrawCard = () => {
    setIsDrawing(true);
    kikisAudio.playHarmonicTone(852, 1.5);

    setTimeout(() => {
      const idx = Math.floor(Math.random() * ORACLE_CARDS.length);
      setDrawnCard(ORACLE_CARDS[idx]);
      setIsDrawing(false);
    }, 600);
  };

  // Convert Oracle action to workspace task
  const handleAddOracleTask = (card: OracleCard) => {
    onAddTask({
      title: `Kiki's 2.0 Intention: ${card.title}`,
      description: `${card.guidance} Action: ${card.alignmentAction}`,
      status: 'todo',
      priority: 'high',
      source: 'manual',
      tags: ['KikisWorld', 'Oracle', 'Focus'],
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-purple-950/40 to-slate-900 border border-purple-500/30 rounded-2xl p-6 shadow-md">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Kiki's World 2.0 • Content Theater & Crystal Sanctuary</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Universal Media Player & Multi-Dimensional Content Experience
            </h1>
            <p className="text-xs text-slate-300 max-w-2xl">
              Play your Google Drive videos and music, stream Solfeggio sound therapy, explore all workspace assets in one unified theater, and activate the 2.0 Crystal Grid.
            </p>
          </div>

          {/* Quick Frequency Player Pill */}
          <div className="flex items-center gap-3 bg-slate-950/80 border border-purple-500/30 px-3.5 py-2 rounded-xl">
            <button
              onClick={handleToggleAudio}
              className={`p-2 rounded-lg text-white font-semibold transition-all ${
                isAudioPlaying ? 'bg-rose-600 animate-pulse' : 'bg-purple-600 hover:bg-purple-500'
              }`}
            >
              {isAudioPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
            <div className="truncate min-w-0">
              <div className="text-xs font-semibold text-white truncate max-w-[150px]">
                {activeTrack.title}
              </div>
              <div className="text-[10px] text-cyan-400 font-mono">
                {isAudioPlaying ? 'Playing Resonance' : 'Ready to Play'}
              </div>
            </div>
          </div>
        </div>

        {/* Sub-Tabs */}
        <div className="flex items-center gap-2 mt-5 border-t border-slate-800/80 pt-4 overflow-x-auto pb-1">
          <button
            onClick={() => setSubTab('theater')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-2 whitespace-nowrap ${
              subTab === 'theater'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Film className="w-3.5 h-3.5 text-cyan-400" />
            <span>Video & Music Theater</span>
          </button>

          <button
            onClick={() => setSubTab('all_content')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-2 whitespace-nowrap ${
              subTab === 'all_content'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-amber-400" />
            <span>View All Content ({driveFiles.length + githubRepos.length + tasks.length})</span>
          </button>

          <button
            onClick={() => setSubTab('reiki_studio')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-2 whitespace-nowrap ${
              subTab === 'reiki_studio'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Grid className="w-3.5 h-3.5 text-rose-400" />
            <span>2.0 Crystal Grid & Altar</span>
          </button>

          <button
            onClick={() => setSubTab('oracle')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-2 whitespace-nowrap ${
              subTab === 'oracle'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Oracle & Synchronicities</span>
          </button>
        </div>
      </div>

      {/* SUBTAB 1: Integrated Video & Music Theater */}
      {subTab === 'theater' && (
        <div className="space-y-6">
          {/* Main Cinema Screen & Video Player */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Screen (8 cols) */}
            <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl flex flex-col">
              <div className="relative aspect-video bg-black flex items-center justify-center group overflow-hidden">
                <video
                  ref={videoRef}
                  src={activeVideo.url}
                  className="w-full h-full object-cover"
                  controls
                  playsInline
                  onPlay={() => setIsVideoPlaying(true)}
                  onPause={() => setIsVideoPlaying(false)}
                />
              </div>

              {/* Video Info Bar */}
              <div className="p-4 bg-slate-900/95 border-t border-slate-800 flex items-center justify-between gap-4">
                <div className="truncate">
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                    {activeVideo.tag || 'Now Playing'}
                  </span>
                  <h3 className="text-sm font-bold text-white mt-1 truncate">{activeVideo.title}</h3>
                  <p className="text-xs text-slate-400 truncate">{activeVideo.description}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <label className="cursor-pointer px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 rounded-lg border border-slate-700 flex items-center gap-1.5 transition-colors">
                    <Upload className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Upload Video</span>
                    <input
                      type="file"
                      accept="video/*"
                      onChange={handleLocalVideoUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* Video Queue & Library (4 cols) */}
            <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Tv className="w-4 h-4 text-purple-400" />
                  <span>Video Channels & Drive ({CURATED_VIDEOS.length + driveVideos.length})</span>
                </h4>
              </div>

              <div className="space-y-2 flex-1 overflow-y-auto max-h-[380px]">
                {/* Drive Videos if found */}
                {driveVideos.length > 0 && (
                  <div className="space-y-1.5 pb-2">
                    <span className="text-[10px] uppercase font-semibold text-cyan-400 tracking-wider">
                      From Google Drive
                    </span>
                    {driveVideos.map((dv) => (
                      <div
                        key={dv.id}
                        onClick={() =>
                          handleSelectVideo({
                            id: dv.id,
                            title: dv.name,
                            description: 'Google Drive Video File',
                            url: dv.webViewLink,
                            tag: 'Google Drive',
                          })
                        }
                        className="p-2.5 bg-slate-950/80 hover:bg-slate-800 border border-cyan-500/20 rounded-xl cursor-pointer transition-all flex items-center gap-2.5"
                      >
                        <Cloud className="w-4 h-4 text-cyan-400 shrink-0" />
                        <div className="truncate min-w-0">
                          <div className="text-xs font-medium text-white truncate">{dv.name}</div>
                          <div className="text-[10px] text-slate-400">Google Drive</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Curated Channels */}
                {CURATED_VIDEOS.map((vid) => {
                  const isCurrent = activeVideo.id === vid.id;
                  return (
                    <div
                      key={vid.id}
                      onClick={() => handleSelectVideo(vid)}
                      className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center gap-3 ${
                        isCurrent
                          ? 'bg-purple-600/15 border-purple-500/50 shadow-sm'
                          : 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-800/50'
                      }`}
                    >
                      <img
                        src={vid.thumbnail}
                        alt={vid.title}
                        className="w-16 h-11 rounded-lg object-cover shrink-0"
                      />
                      <div className="truncate min-w-0 flex-1">
                        <div className="text-xs font-semibold text-white truncate">{vid.title}</div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5">
                          <span className="text-purple-300">{vid.tag}</span>
                          <span>•</span>
                          <span>{vid.duration}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Music & Solfeggio Sound Healing Player Section */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                  <Music className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <span>Solfeggio Sound Healing & Music Mixer</span>
                    {isAudioPlaying && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        Resonating
                      </span>
                    )}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Binaural beats, pure Solfeggio healing frequencies, and Drive audio playback.
                  </p>
                </div>
              </div>

              {/* Real-time Spectrum Wave Canvas */}
              <div className="bg-slate-950 border border-slate-800/80 rounded-xl px-3 py-1 flex items-center gap-2">
                <span className="text-[10px] font-mono text-slate-500 uppercase">Resonance</span>
                <canvas
                  ref={visualizerCanvasRef}
                  width={140}
                  height={32}
                  className="w-32 h-8 block rounded"
                />
              </div>
            </div>

            {/* Audio Playlist Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {CURATED_AUDIO_TRACKS.map((track) => {
                const isSelected = activeTrack.id === track.id;
                const isPlayingThis = isSelected && isAudioPlaying;

                return (
                  <div
                    key={track.id}
                    onClick={() => handlePlayTrack(track)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-purple-600/15 border-purple-500/50 shadow-md'
                        : 'bg-slate-950/70 border-slate-800/80 hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="flex items-center gap-3 truncate min-w-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (isPlayingThis) {
                            handleToggleAudio();
                          } else {
                            handlePlayTrack(track);
                          }
                        }}
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-transform ${
                          isPlayingThis
                            ? 'bg-rose-500 text-white scale-105'
                            : 'bg-slate-800 text-slate-200 hover:scale-105'
                        }`}
                      >
                        {isPlayingThis ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      </button>

                      <div className="truncate">
                        <div className="text-xs font-semibold text-white truncate">{track.title}</div>
                        <div className="text-[10px] text-slate-400 truncate">{track.artist}</div>
                      </div>
                    </div>

                    {track.frequency && (
                      <span className="text-xs font-mono font-bold text-amber-400 shrink-0">
                        {track.frequency}Hz
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 2: View All Content Theater */}
      {subTab === 'all_content' && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 shadow-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-amber-400" />
                  <span>Kiki's 2.0 Unified Content Browser</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Search and play all your Drive files, GitHub repositories, and notes in one place.
                </p>
              </div>

              {/* Search */}
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={contentSearch}
                  onChange={(e) => setContentSearch(e.target.value)}
                  placeholder="Filter all content..."
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            {/* Filter Categories */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
              {(['all', 'video', 'audio', 'drive', 'github', 'notes'] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setContentFilter(cat)}
                  className={`px-3 py-1.5 rounded-lg capitalize font-medium transition-colors ${
                    contentFilter === cat
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {cat === 'all' ? 'All Content' : cat}
                </button>
              ))}
            </div>

            {/* Content List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {/* Drive files */}
              {(contentFilter === 'all' || contentFilter === 'drive' || contentFilter === 'video' || contentFilter === 'audio') &&
                driveFiles
                  .filter((f) => {
                    const matchesSearch = !contentSearch || f.name.toLowerCase().includes(contentSearch.toLowerCase());
                    if (!matchesSearch) return false;
                    if (contentFilter === 'video') return f.mimeType.includes('video');
                    if (contentFilter === 'audio') return f.mimeType.includes('audio');
                    return true;
                  })
                  .slice(0, 18)
                  .map((file) => (
                    <div
                      key={file.id}
                      className="p-3.5 bg-slate-950/70 border border-slate-800 hover:border-cyan-500/40 rounded-xl flex flex-col justify-between space-y-3 transition-all"
                    >
                      <div className="flex items-start gap-2.5">
                        <Cloud className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                        <div className="truncate min-w-0">
                          <h4 className="text-xs font-semibold text-white truncate">{file.name}</h4>
                          <span className="text-[10px] text-slate-400">{file.mimeType.split('.').pop() || 'Drive file'}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800">
                        {file.mimeType.includes('video') ? (
                          <button
                            onClick={() => {
                              handleSelectVideo({
                                id: file.id,
                                title: file.name,
                                description: 'Google Drive Video',
                                url: file.webViewLink,
                                tag: 'Drive Video',
                              });
                              setSubTab('theater');
                            }}
                            className="text-[11px] text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1"
                          >
                            <Play className="w-3 h-3" /> Play in Theater
                          </button>
                        ) : (
                          <a
                            href={file.webViewLink}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1"
                          >
                            <span>Open Drive</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  ))}

              {/* GitHub Repos */}
              {(contentFilter === 'all' || contentFilter === 'github') &&
                githubRepos
                  .filter((r) => !contentSearch || r.name.toLowerCase().includes(contentSearch.toLowerCase()))
                  .slice(0, 12)
                  .map((repo) => (
                    <div
                      key={repo.id}
                      className="p-3.5 bg-slate-950/70 border border-slate-800 hover:border-indigo-500/40 rounded-xl flex flex-col justify-between space-y-3 transition-all"
                    >
                      <div className="flex items-start gap-2.5">
                        <Github className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                        <div className="truncate min-w-0">
                          <h4 className="text-xs font-semibold text-white truncate">{repo.name}</h4>
                          <span className="text-[10px] text-slate-400">{repo.language || 'Code'} • ★ {repo.stargazers_count}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800">
                        <a
                          href={repo.html_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                        >
                          <span>View Code</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  ))}
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 3: Kiki's 2.0 Crystal Grid & Altar */}
      {subTab === 'reiki_studio' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* The 2D Sacred Geometry Altar (7 cols) */}
            <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col items-center justify-center min-h-[460px] relative overflow-hidden shadow-xl">
              {/* Concentric Sacred Geometry Rings */}
              <div className="absolute w-96 h-96 rounded-full border border-purple-500/10 animate-[spin_60s_linear_infinite]" />
              <div className="absolute w-72 h-72 rounded-full border border-cyan-500/15 animate-[spin_40s_linear_infinite_reverse]" />
              <div className="absolute w-48 h-48 rounded-full border border-amber-500/20" />

              {/* Crystal Grid Nodes */}
              <div className="relative w-full max-w-sm aspect-square">
                {crystals.map((c) => {
                  const isSelected = selectedCrystal.id === c.id;
                  return (
                    <div
                      key={c.id}
                      onClick={() => {
                        setSelectedCrystal(c);
                        kikisAudio.playHarmonicTone(c.frequency, 1.5);
                      }}
                      style={{
                        left: `${c.x}%`,
                        top: `${c.y}%`,
                        transform: 'translate(-50%, -50%)',
                      }}
                      className="absolute cursor-pointer group"
                    >
                      {/* Aura pulse */}
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                          isSelected
                            ? 'scale-125 ring-2 ring-white shadow-lg'
                            : 'hover:scale-110 shadow-md'
                        }`}
                        style={{
                          backgroundColor: `${c.glowColor}30`,
                          boxShadow: `0 0 20px ${c.glowColor}60`,
                        }}
                      >
                        <div
                          className="w-5 h-5 rounded-full"
                          style={{ backgroundColor: c.color }}
                        />
                      </div>

                      <div className="absolute top-full mt-1.5 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-semibold text-slate-200 bg-slate-950/80 px-1.5 py-0.5 rounded border border-slate-800 shadow">
                        {c.name}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Harmonize Grid Button */}
              <button
                onClick={handleHarmonizeGrid}
                disabled={isGridHarmonized}
                className="mt-6 px-5 py-2.5 bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 hover:from-purple-500 hover:to-amber-400 text-white text-xs font-bold rounded-xl shadow-lg shadow-purple-500/25 flex items-center gap-2 transition-all"
              >
                <Sparkles className={`w-4 h-4 ${isGridHarmonized ? 'animate-spin' : ''}`} />
                <span>{isGridHarmonized ? 'Harmonizing Grid 2.0...' : 'Activate 7-Crystal Harmonic Grid'}</span>
              </button>
            </div>

            {/* Selected Crystal Energy Profile (5 cols) */}
            <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-purple-500/10 text-purple-300">
                      {selectedCrystal.chakra} Chakra
                    </span>
                    <h3 className="text-base font-bold text-white mt-1">{selectedCrystal.name}</h3>
                    <p className="text-xs text-slate-400 font-serif italic">{selectedCrystal.stone}</p>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-mono font-bold text-amber-400">
                      {selectedCrystal.frequency} Hz
                    </span>
                  </div>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 text-xs">
                  <div className="text-slate-400 font-medium">Metaphysical Essence:</div>
                  <div className="text-slate-200 leading-relaxed">{selectedCrystal.property}</div>
                </div>

                <div className="space-y-2">
                  <div className="text-xs text-slate-400">Alignment Resonance:</div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-cyan-400 rounded-full"
                      style={{ width: '96%' }}
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-3">
                <button
                  onClick={() => kikisAudio.playHarmonicTone(selectedCrystal.frequency, 2.5)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 flex items-center gap-1.5"
                >
                  <Volume2 className="w-4 h-4 text-cyan-400" />
                  <span>Play Tone ({selectedCrystal.frequency}Hz)</span>
                </button>

                <button
                  onClick={() => {
                    onAddTask({
                      title: `Crystal Focus: ${selectedCrystal.name} (${selectedCrystal.property})`,
                      description: `Chakra: ${selectedCrystal.chakra} • Frequency: ${selectedCrystal.frequency} Hz.`,
                      status: 'todo',
                      priority: 'medium',
                      source: 'manual',
                      tags: ['KikisWorld', 'CrystalGrid'],
                    });
                  }}
                  className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-lg"
                >
                  + Add Focus Task
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 4: Oracle & Synchronicity Deck */}
      {subTab === 'oracle' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
            {/* The Oracle Card Visual */}
            <div
              className={`w-72 h-96 rounded-2xl border-2 p-6 flex flex-col justify-between shadow-2xl transition-all duration-300 relative overflow-hidden ${
                isDrawing ? 'scale-95 blur-xs' : 'scale-100'
              }`}
              style={{
                borderColor: drawnCard.color,
                background: `linear-gradient(135deg, #090d16 0%, ${drawnCard.color}15 100%)`,
                boxShadow: `0 0 30px ${drawnCard.color}30`,
              }}
            >
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-mono">{drawnCard.frequency}Hz</span>
                <span className="text-lg">{drawnCard.glyph}</span>
              </div>

              <div className="text-center space-y-1 my-auto">
                <div
                  className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center text-3xl font-bold shadow-inner mb-3"
                  style={{ backgroundColor: `${drawnCard.color}25`, color: drawnCard.color }}
                >
                  {drawnCard.glyph}
                </div>
                <h3 className="text-base font-bold text-white tracking-wide">{drawnCard.title}</h3>
                <p className="text-xs text-slate-400 font-serif italic">{drawnCard.subtitle}</p>
              </div>

              <div className="text-[10px] text-center font-mono text-slate-500 uppercase tracking-wider">
                Kiki's Synchronicity 2.0
              </div>
            </div>

            {/* Oracle Card Insights & Action Item */}
            <div className="flex-1 space-y-5 max-w-xl">
              <div>
                <span className="text-xs uppercase font-mono px-2.5 py-1 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20">
                  Daily Intuitive Draw
                </span>
                <h2 className="text-xl font-bold text-white mt-2">{drawnCard.title}</h2>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  {drawnCard.guidance}
                </p>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
                <span className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider">
                  Vibrational Affirmation
                </span>
                <blockquote className="text-xs italic text-slate-200 font-serif leading-relaxed">
                  "{drawnCard.affirmation}"
                </blockquote>
              </div>

              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-1 text-xs">
                <span className="text-[11px] font-semibold text-cyan-400 uppercase tracking-wider">
                  Synchronicity Action
                </span>
                <p className="text-slate-300">{drawnCard.alignmentAction}</p>
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  onClick={handleDrawCard}
                  disabled={isDrawing}
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-semibold rounded-lg shadow-md transition-all flex items-center gap-2"
                >
                  <RotateCcw className={`w-3.5 h-3.5 ${isDrawing ? 'animate-spin' : ''}`} />
                  <span>{isDrawing ? 'Shuffling...' : 'Draw New Card'}</span>
                </button>

                <button
                  onClick={() => handleAddOracleTask(drawnCard)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Track as Action Item</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
