import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Sparkles,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Zap,
  Activity,
  Plus,
  Heart,
  Sliders,
  Compass,
  Grid,
  CheckCircle2,
  Download,
  Share2,
  Flame,
  Radio,
  Eye,
} from 'lucide-react';
import { OneDEntity, OneDHealingNode, WorkspaceTask } from '../types';
import { oneDAudio } from '../services/oneDWorldAudio';

interface OneDWorldViewProps {
  onAddTask: (task: Omit<WorkspaceTask, 'id' | 'createdAt'>) => void;
  onLogSyncEvent: (source: any, message: string, count: number) => void;
}

const DEFAULT_CHAKRAS: OneDHealingNode[] = [
  {
    id: 'chakra-7',
    name: 'Crown Node',
    sanskrit: 'Sahasrara',
    frequency: 963,
    position: 95,
    color: '#a855f7',
    description: 'Higher consciousness, universal wisdom, and spiritual unity.',
    affirmation: 'I am connected to the infinite stream of divine knowledge.',
    alignment: 94,
  },
  {
    id: 'chakra-6',
    name: 'Third Eye Node',
    sanskrit: 'Ajna',
    frequency: 852,
    position: 80,
    color: '#6366f1',
    description: 'Intuition, vision, lucidity, and inner guidance.',
    affirmation: 'My intuition is crystal clear and trustworthy.',
    alignment: 90,
  },
  {
    id: 'chakra-5',
    name: 'Throat Node',
    sanskrit: 'Vishuddha',
    frequency: 741,
    position: 65,
    color: '#06b6d4',
    description: 'Authentic expression, truth, creative flow, and clarity.',
    affirmation: 'I express my truth with grace and ease.',
    alignment: 88,
  },
  {
    id: 'chakra-4',
    name: 'Heart Center',
    sanskrit: 'Anahata',
    frequency: 639,
    position: 50,
    color: '#10b981',
    description: 'Compassion, harmonious connection, unconditional love.',
    affirmation: 'I give and receive unconditional compassion.',
    alignment: 96,
  },
  {
    id: 'chakra-3',
    name: 'Solar Plexus',
    sanskrit: 'Manipura',
    frequency: 528,
    position: 35,
    color: '#f59e0b',
    description: 'Willpower, transformation, miracle resonance, and vitality.',
    affirmation: 'I am empowered to manifest my highest purpose.',
    alignment: 92,
  },
  {
    id: 'chakra-2',
    name: 'Sacral Node',
    sanskrit: 'Svadhisthana',
    frequency: 417,
    position: 20,
    color: '#f97316',
    description: 'Creative vitality, emotional equilibrium, adaptability.',
    affirmation: 'Creative energy flows effortlessly through my life.',
    alignment: 85,
  },
  {
    id: 'chakra-1',
    name: 'Root Node',
    sanskrit: 'Muladhara',
    frequency: 396,
    position: 5,
    color: '#ef4444',
    description: 'Grounding, stability, safety, and foundational peace.',
    affirmation: 'I am grounded, safe, and supported in this moment.',
    alignment: 98,
  },
];

const INITIAL_ENTITIES: OneDEntity[] = [
  {
    id: 'ent-1',
    x: 150,
    vx: 1.8,
    energy: 85,
    frequency: 528,
    type: 'healer',
    color: '#f59e0b',
    label: 'Sol 528Hz',
  },
  {
    id: 'ent-2',
    x: 420,
    vx: -2.2,
    energy: 90,
    frequency: 432,
    type: 'carrier',
    color: '#06b6d4',
    label: 'Verdi 432Hz',
  },
  {
    id: 'ent-3',
    x: 750,
    vx: 1.4,
    energy: 95,
    frequency: 639,
    type: 'resonator',
    color: '#10b981',
    label: 'Heart 639Hz',
  },
  {
    id: 'ent-4',
    x: 900,
    vx: -1.6,
    energy: 80,
    frequency: 852,
    type: 'pulse',
    color: '#a855f7',
    label: 'Violet 852Hz',
  },
];

export const OneDWorldView: React.FC<OneDWorldViewProps> = ({
  onAddTask,
  onLogSyncEvent,
}) => {
  const [subTab, setSubTab] = useState<'linear' | 'reiki' | 'automata'>('linear');

  // Linear 1D Universe state
  const [entities, setEntities] = useState<OneDEntity[]>(INITIAL_ENTITIES);
  const [isRunning, setIsRunning] = useState(true);
  const [speedMultiplier, setSpeedMultiplier] = useState(1);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [selectedEntity, setSelectedEntity] = useState<OneDEntity | null>(null);
  const [pulseRings, setPulseRings] = useState<Array<{ x: number; radius: number; color: string; opacity: number }>>([]);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Reiki 1D Healing HQ State
  const [chakras, setChakras] = useState<OneDHealingNode[]>(DEFAULT_CHAKRAS);
  const [activeDroneChakra, setActiveDroneChakra] = useState<string | null>(null);
  const [selectedChakra, setSelectedChakra] = useState<OneDHealingNode>(DEFAULT_CHAKRAS[3]); // Heart center default
  const [isHarmonizingAll, setIsHarmonizingAll] = useState(false);

  // Elementary Cellular Automata state
  const [rule, setRule] = useState<number>(110);
  const [automataSteps, setAutomataSteps] = useState<number[][]>([]);
  const [automataWidth, setAutomataWidth] = useState<number>(81);
  const automataCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // 1. Cellular Automata Generator (Wolfram 1D Rules)
  const generateAutomata = useCallback((ruleNum: number, width: number, stepsCount = 70) => {
    // Generate binary rule table
    const ruleBits = ruleNum.toString(2).padStart(8, '0').split('').map(Number).reverse();

    // Initial step: single center cell active
    const firstRow = new Array(width).fill(0);
    firstRow[Math.floor(width / 2)] = 1;

    const rows: number[][] = [firstRow];

    for (let s = 1; s < stepsCount; s++) {
      const prev = rows[s - 1];
      const next = new Array(width).fill(0);

      for (let i = 0; i < width; i++) {
        const left = i > 0 ? prev[i - 1] : 0;
        const self = prev[i];
        const right = i < width - 1 ? prev[i + 1] : 0;
        const patternIndex = (left << 2) | (self << 1) | right;
        next[i] = ruleBits[patternIndex] || 0;
      }
      rows.push(next);
    }

    setAutomataSteps(rows);
  }, []);

  useEffect(() => {
    generateAutomata(rule, automataWidth);
  }, [rule, automataWidth, generateAutomata]);

  // Render Cellular Automata Canvas
  useEffect(() => {
    if (subTab !== 'automata') return;
    const canvas = automataCanvasRef.current;
    if (!canvas || automataSteps.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rows = automataSteps.length;
    const cols = automataSteps[0].length;
    const cellW = canvas.width / cols;
    const cellH = canvas.height / rows;

    ctx.fillStyle = '#090d16';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (automataSteps[r][c] === 1) {
          // Color based on depth/rule
          const ratio = r / rows;
          ctx.fillStyle = ratio > 0.5 ? '#818cf8' : '#38bdf8';
          ctx.fillRect(c * cellW, r * cellH, cellW - 0.5, cellH - 0.5);
        }
      }
    }
  }, [automataSteps, subTab]);

  // 2. Linear 1D Physics & Collision Loop
  useEffect(() => {
    if (!isRunning || subTab !== 'linear') return;

    let animId: number;
    const updatePhysics = () => {
      setEntities((prev) => {
        const next = prev.map((e) => ({ ...e }));
        const WORLD_LEN = 1000;

        // Move entities
        for (let i = 0; i < next.length; i++) {
          next[i].x += next[i].vx * speedMultiplier;

          // Wall bounce (1D boundary)
          if (next[i].x <= 15) {
            next[i].x = 15;
            next[i].vx = Math.abs(next[i].vx);
            if (soundEnabled) oneDAudio.playTone(next[i].frequency, 0.4);
          } else if (next[i].x >= WORLD_LEN - 15) {
            next[i].x = WORLD_LEN - 15;
            next[i].vx = -Math.abs(next[i].vx);
            if (soundEnabled) oneDAudio.playTone(next[i].frequency, 0.4);
          }
        }

        // 1D Entity-Entity Collisions
        for (let i = 0; i < next.length; i++) {
          for (let j = i + 1; j < next.length; j++) {
            const dist = Math.abs(next[i].x - next[j].x);
            if (dist < 22) {
              // Elastic 1D collision formula
              const v1 = next[i].vx;
              const v2 = next[j].vx;
              next[i].vx = v2;
              next[j].vx = v1;

              // Separate
              if (next[i].x < next[j].x) {
                next[i].x -= 4;
                next[j].x += 4;
              } else {
                next[i].x += 4;
                next[j].x -= 4;
              }

              // Sound resonance on collision
              if (soundEnabled) {
                const harmonicMean = Math.round((next[i].frequency + next[j].frequency) / 2);
                oneDAudio.playTone(harmonicMean, 0.8);
              }
            }
          }
        }

        return next;
      });

      animId = requestAnimationFrame(updatePhysics);
    };

    animId = requestAnimationFrame(updatePhysics);
    return () => cancelAnimationFrame(animId);
  }, [isRunning, speedMultiplier, soundEnabled, subTab]);

  // 3. Render Continuous 1D Line Canvas
  useEffect(() => {
    if (subTab !== 'linear') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const centerY = height / 2;

    ctx.clearRect(0, 0, width, height);

    // Background gradient glow
    const bgGrad = ctx.createLinearGradient(0, centerY - 40, 0, centerY + 40);
    bgGrad.addColorStop(0, 'rgba(30, 41, 59, 0)');
    bgGrad.addColorStop(0.5, 'rgba(56, 189, 248, 0.08)');
    bgGrad.addColorStop(1, 'rgba(30, 41, 59, 0)');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, centerY - 60, width, 120);

    // 1D Axis Line (The Main Coordinate String)
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(30, centerY);
    ctx.lineTo(width - 30, centerY);
    ctx.stroke();

    // Subtle coordinate tick marks along the 1D line
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1;
    ctx.fillStyle = '#64748b';
    ctx.font = '9px monospace';
    ctx.textAlign = 'center';

    const WORLD_MAX = 1000;
    for (let coord = 0; coord <= WORLD_MAX; coord += 100) {
      const cx = 30 + (coord / WORLD_MAX) * (width - 60);
      ctx.beginPath();
      ctx.moveTo(cx, centerY - 6);
      ctx.lineTo(cx, centerY + 6);
      ctx.stroke();
      ctx.fillText(`${coord}u`, cx, centerY + 22);
    }

    // Render Entities along the 1D Axis
    entities.forEach((e) => {
      const ex = 30 + (e.x / WORLD_MAX) * (width - 60);

      // Outer glow pulse
      ctx.beginPath();
      ctx.arc(ex, centerY, 16, 0, Math.PI * 2);
      ctx.fillStyle = `${e.color}25`;
      ctx.fill();

      // Core particle
      ctx.beginPath();
      ctx.arc(ex, centerY, 9, 0, Math.PI * 2);
      ctx.fillStyle = e.color;
      ctx.shadowColor = e.color;
      ctx.shadowBlur = 12;
      ctx.fill();
      ctx.shadowBlur = 0;

      // Entity label & frequency
      ctx.fillStyle = '#f8fafc';
      ctx.font = '10px sans-serif';
      ctx.fillText(e.label, ex, centerY - 18);

      // Velocity vector indicator (small 1D directional arrow)
      ctx.strokeStyle = e.color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(ex, centerY);
      ctx.lineTo(ex + e.vx * 8, centerY);
      ctx.stroke();
    });
  }, [entities, subTab]);

  // Click on 1D line to create a new pulse/entity
  const handleCanvasClick = (evt: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = evt.clientX - rect.left;
    const canvasW = canvas.width;

    const scaleX = (clickX - 30) / (canvasW - 60);
    const targetCoord = Math.max(20, Math.min(980, Math.round(scaleX * 1000)));

    // Choose random Solfeggio frequency
    const freqs = [396, 417, 432, 528, 639, 741, 852, 963];
    const freq = freqs[Math.floor(Math.random() * freqs.length)];
    const colors = ['#f59e0b', '#06b6d4', '#10b981', '#a855f7', '#ec4899'];
    const color = colors[Math.floor(Math.random() * colors.length)];

    const newEnt: OneDEntity = {
      id: 'ent-' + Date.now(),
      x: targetCoord,
      vx: (Math.random() - 0.5) * 3 || 1.5,
      energy: 90,
      frequency: freq,
      type: 'pulse',
      color,
      label: `Node ${freq}Hz`,
    };

    setEntities((prev) => [...prev, newEnt]);
    if (soundEnabled) oneDAudio.playTone(freq, 1.2);
  };

  // Harmonize all Meridian nodes
  const handleHarmonizeAll = () => {
    setIsHarmonizingAll(true);
    oneDAudio.playTone(528, 2.5);

    setChakras((prev) =>
      prev.map((c) => ({
        ...c,
        alignment: 100,
      }))
    );

    onLogSyncEvent('one_d', 'Harmonized 1D Reiki Meridian Axis (7 Nodes at 100%)', 7);

    setTimeout(() => {
      setIsHarmonizingAll(false);
    }, 2000);
  };

  // Start / Stop Drone for a specific Chakra
  const handleToggleChakraDrone = (chakra: OneDHealingNode) => {
    if (activeDroneChakra === chakra.id) {
      oneDAudio.stopDrone();
      setActiveDroneChakra(null);
    } else {
      oneDAudio.startDrone(chakra.frequency);
      setActiveDroneChakra(chakra.id);
      setSelectedChakra(chakra);
    }
  };

  // Create workspace action item from Reiki intention
  const handleCreateHealingTask = (chakra: OneDHealingNode) => {
    onAddTask({
      title: `1D World Practice: Align ${chakra.name} (${chakra.frequency} Hz)`,
      description: `Affirmation: "${chakra.affirmation}". Focused on ${chakra.description}`,
      status: 'todo',
      priority: 'high',
      source: 'manual',
      tags: ['1DWorld', 'ReikiHQ', 'Wellness'],
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-semibold">
              <Compass className="w-3.5 h-3.5 text-cyan-400" />
              <span>1D World & Kiki 1D Network Healing Reiki HQ</span>
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight">
              One-Dimensional Universe, Cellular Automata & Reiki Meridian Portal
            </h1>
            <p className="text-xs text-slate-400">
              Continuous 1D particle physics, Solfeggio sound harmonics, and Wolfram 1D complexity.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`p-2 rounded-lg border text-xs flex items-center gap-1.5 transition-colors ${
                soundEnabled
                  ? 'bg-indigo-600/20 border-indigo-500/40 text-indigo-300'
                  : 'bg-slate-800 border-slate-700 text-slate-400'
              }`}
              title={soundEnabled ? 'Mute Harmonics' : 'Enable Harmonics'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4" />}
              <span className="hidden sm:inline">{soundEnabled ? 'Harmonics ON' : 'Audio Muted'}</span>
            </button>
          </div>
        </div>

        {/* Sub-mode Navigation Tabs */}
        <div className="flex items-center gap-2 mt-5 border-t border-slate-800/80 pt-4">
          <button
            onClick={() => {
              setSubTab('linear');
              oneDAudio.stopDrone();
              setActiveDroneChakra(null);
            }}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-2 ${
              subTab === 'linear'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>1D Continuous Universe</span>
          </button>

          <button
            onClick={() => setSubTab('reiki')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-2 ${
              subTab === 'reiki'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Heart className="w-3.5 h-3.5 text-rose-400" />
            <span>1D Healing Reiki HQ</span>
          </button>

          <button
            onClick={() => {
              setSubTab('automata');
              oneDAudio.stopDrone();
              setActiveDroneChakra(null);
            }}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-2 ${
              subTab === 'automata'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Grid className="w-3.5 h-3.5 text-purple-400" />
            <span>Wolfram 1D Automata</span>
          </button>
        </div>
      </div>

      {/* SUBTAB 1: Linear 1D Continuous Universe Simulator */}
      {subTab === 'linear' && (
        <div className="space-y-4">
          {/* Main 1D Interactive Canvas Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 shadow-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <span>1D Coordinate Axis String</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                    [0, 1000]u
                  </span>
                </h3>
                <p className="text-[11px] text-slate-400">
                  Click anywhere along the line to emit a new 1D wave packet or pulse node.
                </p>
              </div>

              {/* Simulation Controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsRunning(!isRunning)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs text-white rounded-lg border border-slate-700 flex items-center gap-1.5"
                >
                  {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 text-emerald-400" />}
                  <span>{isRunning ? 'Pause' : 'Play'}</span>
                </button>

                <button
                  onClick={() => {
                    setEntities(INITIAL_ENTITIES);
                    oneDAudio.playTone(432, 1);
                  }}
                  className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700"
                  title="Reset 1D Universe"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>

                {/* Speed Slider */}
                <div className="flex items-center gap-1.5 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800 text-[11px] text-slate-400">
                  <span>Speed:</span>
                  <button
                    onClick={() => setSpeedMultiplier((prev) => (prev === 0.5 ? 1 : prev === 1 ? 2 : 0.5))}
                    className="font-mono text-cyan-400 font-bold"
                  >
                    {speedMultiplier}x
                  </button>
                </div>
              </div>
            </div>

            {/* Canvas */}
            <div className="bg-slate-950 rounded-xl border border-slate-800/80 p-2 overflow-hidden">
              <canvas
                ref={canvasRef}
                width={1000}
                height={160}
                onClick={handleCanvasClick}
                className="w-full h-40 cursor-crosshair block"
              />
            </div>

            {/* Quick 1D Waves Emitter */}
            <div className="flex items-center justify-between flex-wrap gap-2 pt-2 border-t border-slate-800 text-xs">
              <span className="text-slate-400">Emit Solfeggio 1D Wave:</span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {[
                  { label: '396Hz Ground', freq: 396 },
                  { label: '432Hz Natural', freq: 432 },
                  { label: '528Hz Miracle', freq: 528 },
                  { label: '639Hz Heart', freq: 639 },
                  { label: '852Hz ThirdEye', freq: 852 },
                ].map((wave) => (
                  <button
                    key={wave.freq}
                    onClick={() => {
                      oneDAudio.playTone(wave.freq, 1.5);
                      // Add new carrier entity
                      const newEnt: OneDEntity = {
                        id: 'ent-' + Date.now(),
                        x: 500,
                        vx: (Math.random() - 0.5) * 4 || 2,
                        energy: 95,
                        frequency: wave.freq,
                        type: 'carrier',
                        color: wave.freq === 528 ? '#f59e0b' : '#38bdf8',
                        label: wave.label,
                      };
                      setEntities((prev) => [...prev, newEnt]);
                    }}
                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-md font-mono text-[11px] border border-slate-700 transition-colors"
                  >
                    {wave.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 1D Entities Inspector Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                Active 1D Universe Entities ({entities.length})
              </h3>
              <button
                onClick={() => {
                  const freqs = [396, 432, 528, 639, 741, 852];
                  const f = freqs[Math.floor(Math.random() * freqs.length)];
                  const newEnt: OneDEntity = {
                    id: 'ent-' + Date.now(),
                    x: Math.round(Math.random() * 900) + 50,
                    vx: (Math.random() - 0.5) * 3,
                    energy: 85,
                    frequency: f,
                    type: 'carrier',
                    color: '#a855f7',
                    label: `Node ${f}Hz`,
                  };
                  setEntities((prev) => [...prev, newEnt]);
                }}
                className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs flex items-center gap-1 font-medium"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Node</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {entities.map((e) => (
                <div
                  key={e.id}
                  className="p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-2 relative group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: e.color }} />
                      {e.label}
                    </span>
                    <button
                      onClick={() => setEntities((prev) => prev.filter((item) => item.id !== e.id))}
                      className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-rose-400 text-xs p-0.5 transition-opacity"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="text-[11px] font-mono text-slate-400 space-y-0.5">
                    <div className="flex justify-between">
                      <span>Position (x):</span>
                      <span className="text-slate-200">{e.x.toFixed(1)}u</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Velocity (v):</span>
                      <span className="text-slate-200">{e.vx > 0 ? `+${e.vx.toFixed(1)}` : e.vx.toFixed(1)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Harmonic:</span>
                      <span className="text-amber-400">{e.frequency} Hz</span>
                    </div>
                  </div>

                  <button
                    onClick={() => oneDAudio.playTone(e.frequency, 1)}
                    className="w-full py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[10px] font-medium transition-colors"
                  >
                    Play Frequency
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 2: Kiki 1D Network Healing Reiki HQ */}
      {subTab === 'reiki' && (
        <div className="space-y-6">
          {/* Top Reiki Action & Alignment Score */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Heart className="w-5 h-5 text-rose-500" />
                <span>Kiki 1D Network Healing Reiki HQ</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Central vertical 1D alignment axis connecting the 7 universal energy nodes with Solfeggio sound therapy.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleHarmonizeAll}
                disabled={isHarmonizingAll}
                className="px-4 py-2 bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-400 hover:to-amber-400 text-white text-xs font-semibold rounded-lg flex items-center gap-2 shadow-md shadow-rose-500/20 transition-all"
              >
                <Sparkles className={`w-4 h-4 ${isHarmonizingAll ? 'animate-spin' : ''}`} />
                <span>{isHarmonizingAll ? 'Harmonizing Nodes...' : 'Harmonize All 7 Nodes'}</span>
              </button>
            </div>
          </div>

          {/* Meridian Grid: 1D Axis on Left, Node Details on Right */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* The 1D Meridian String */}
            <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                1D Meridian Energy Flow
              </h4>

              <div className="space-y-2.5">
                {chakras.map((chakra) => {
                  const isActive = selectedChakra.id === chakra.id;
                  const isDronePlaying = activeDroneChakra === chakra.id;

                  return (
                    <div
                      key={chakra.id}
                      onClick={() => setSelectedChakra(chakra)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                        isActive
                          ? 'bg-slate-800/90 border-slate-600 shadow-sm'
                          : 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-850'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shadow-inner"
                          style={{ backgroundColor: `${chakra.color}25`, color: chakra.color }}
                        >
                          {chakra.frequency}
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-white flex items-center gap-2">
                            <span>{chakra.name}</span>
                            <span className="text-[10px] text-slate-400 font-serif italic">
                              {chakra.sanskrit}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-400">{chakra.frequency} Hz Solfeggio</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleChakraDrone(chakra);
                          }}
                          className={`p-2 rounded-lg text-xs transition-colors ${
                            isDronePlaying
                              ? 'bg-rose-500 text-white animate-pulse'
                              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                          }`}
                          title={isDronePlaying ? 'Stop Drone' : 'Play Harmonic Drone'}
                        >
                          <Radio className="w-3.5 h-3.5" />
                        </button>

                        <span className="text-xs font-mono font-semibold text-emerald-400">
                          {chakra.alignment}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Selected Chakra Deep View & Daily Affirmation */}
            <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-bold shadow-lg"
                      style={{ backgroundColor: `${selectedChakra.color}30`, color: selectedChakra.color }}
                    >
                      {selectedChakra.frequency}Hz
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white">{selectedChakra.name}</h3>
                      <p className="text-xs text-slate-400 font-serif italic">
                        {selectedChakra.sanskrit} • Meridian Position: {selectedChakra.position}%
                      </p>
                    </div>
                  </div>

                  <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                    Alignment {selectedChakra.alignment}%
                  </span>
                </div>

                <div className="space-y-3">
                  <div>
                    <h5 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      Energetic Purpose
                    </h5>
                    <p className="text-xs text-slate-200 mt-1 leading-relaxed">
                      {selectedChakra.description}
                    </p>
                  </div>

                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
                    <h5 className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Daily Reiki Affirmation</span>
                    </h5>
                    <blockquote className="text-xs italic text-slate-200 leading-relaxed font-serif">
                      "{selectedChakra.affirmation}"
                    </blockquote>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
                <button
                  onClick={() => handleToggleChakraDrone(selectedChakra)}
                  className={`px-4 py-2 text-xs font-semibold rounded-lg flex items-center gap-2 transition-all ${
                    activeDroneChakra === selectedChakra.id
                      ? 'bg-rose-600 text-white'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                  }`}
                >
                  <Radio className="w-3.5 h-3.5" />
                  <span>
                    {activeDroneChakra === selectedChakra.id
                      ? 'Stop Solfeggio Drone'
                      : `Play ${selectedChakra.frequency}Hz Solfeggio Drone`}
                  </span>
                </button>

                <button
                  onClick={() => handleCreateHealingTask(selectedChakra)}
                  className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-lg flex items-center gap-1.5 shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add to Workspace Tasks</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 3: Elementary 1D Cellular Automata (Wolfram Universe) */}
      {subTab === 'automata' && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 shadow-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <span>Wolfram Elementary 1D Cellular Automaton</span>
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300">
                    Rule {rule}
                  </span>
                </h3>
                <p className="text-[11px] text-slate-400">
                  Each row shows the 1D space evolving downwards through time steps.
                </p>
              </div>

              {/* Rule selector chips */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {[
                  { r: 110, desc: 'Turing Complete' },
                  { r: 30, desc: 'Chaos & PRNG' },
                  { r: 90, desc: 'Sierpinski Fractal' },
                  { r: 184, desc: 'Traffic & Flow' },
                  { r: 22, desc: 'Triangle Waves' },
                  { r: 150, desc: 'Nested Symmetry' },
                ].map((item) => (
                  <button
                    key={item.r}
                    onClick={() => {
                      setRule(item.r);
                      oneDAudio.playTone(300 + item.r * 2, 0.5);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-mono font-medium transition-colors ${
                      rule === item.r
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                    }`}
                  >
                    Rule {item.r}
                  </button>
                ))}
              </div>
            </div>

            {/* Automata Canvas */}
            <div className="bg-slate-950 rounded-xl border border-slate-800 p-2 overflow-hidden flex justify-center">
              <canvas
                ref={automataCanvasRef}
                width={700}
                height={400}
                className="w-full max-w-3xl h-80 rounded block shadow-inner"
              />
            </div>

            {/* Rule Explanatory Card */}
            <div className="bg-slate-950/80 p-3.5 rounded-lg border border-slate-800 text-xs text-slate-300 flex items-center justify-between gap-4">
              <div>
                <span className="font-semibold text-indigo-400">Rule {rule} Behavior: </span>
                {rule === 110 && 'Proven by Matthew Cook to be capable of universal computation (Turing complete) in a purely 1D grid.'}
                {rule === 30 && 'Class 3 chaotic automaton displaying complex non-periodic deterministic randomness from a single 1D seed.'}
                {rule === 90 && 'Produces the self-similar Sierpinski triangle fractal through binary modular addition (XOR).'}
                {rule === 184 && 'Models traffic flow and ballistic particle annihilation in a 1-dimensional system.'}
                {rule === 22 && 'Generates intricate nested triangle boundaries with a 3-cell neighbor rule.'}
                {rule === 150 && 'Additive elementary cellular automaton with symmetric fractal growth.'}
              </div>

              <button
                onClick={() => {
                  generateAutomata(rule, automataWidth);
                  oneDAudio.playTone(528, 0.8);
                }}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs whitespace-nowrap border border-slate-700"
              >
                Regenerate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
