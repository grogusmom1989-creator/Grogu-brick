import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import {
  Gamepad2,
  Box,
  Play,
  Pause,
  RotateCcw,
  Trophy,
  Sparkles,
  Plus,
  Layers,
  Shield,
  Zap,
  Sliders,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import { WorkspaceTask, WorkspaceNote } from '../types';

interface ThreeGameStudioViewProps {
  onAddTask: (task: Omit<WorkspaceTask, 'id' | 'createdAt'>) => void;
  onAddNote?: (note: Omit<WorkspaceNote, 'id' | 'updatedAt'>) => void;
  onLogSyncEvent?: (source: string, message: string, count: number) => void;
}

type StudioMode = 'cyber_runner' | 'shader_architect';

interface SpawnedObject {
  id: string;
  name: string;
  geometryType: 'torusKnot' | 'icosahedron' | 'octahedron' | 'sphere' | 'box';
  color: string;
  wireframe: boolean;
  scale: number;
}

export const ThreeGameStudioView: React.FC<ThreeGameStudioViewProps> = ({
  onAddTask,
  onAddNote,
  onLogSyncEvent,
}) => {
  const [mode, setMode] = useState<StudioMode>('cyber_runner');

  // Game State
  const [isPlaying, setIsPlaying] = useState(true);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    const saved = localStorage.getItem('omnisync_3d_highscore');
    return saved ? parseInt(saved, 10) : 0;
  });
  const [shields, setShields] = useState(100);
  const [combo, setCombo] = useState(1);
  const [level, setLevel] = useState(1);
  const [crystalsCollected, setCrystalsCollected] = useState(0);
  const [syncedBanner, setSyncedBanner] = useState<string | null>(null);

  // Architect State
  const [shaderSpeed, setShaderSpeed] = useState(1.4);
  const [wireframeMode, setWireframeMode] = useState(false);
  const [primaryColor, setPrimaryColor] = useState('#38bdf8');
  const [metalness, setMetalness] = useState(0.75);
  const [roughness, setRoughness] = useState(0.2);
  const [spawnedObjects, setSpawnedObjects] = useState<SpawnedObject[]>([
    {
      id: 'obj-1',
      name: 'Quantum Torus Knot',
      geometryType: 'torusKnot',
      color: '#38bdf8',
      wireframe: false,
      scale: 1,
    },
    {
      id: 'obj-2',
      name: 'Orbital Icosahedron',
      geometryType: 'icosahedron',
      color: '#a855f7',
      wireframe: true,
      scale: 0.9,
    },
  ]);

  const canvasContainerRef = useRef<HTMLDivElement | null>(null);
  const keysPressedRef = useRef<{ [key: string]: boolean }>({});
  const isPlayingRef = useRef(isPlaying);
  isPlayingRef.current = isPlaying;

  const scoreRef = useRef(score);
  scoreRef.current = score;
  const comboRef = useRef(combo);
  comboRef.current = combo;
  const shieldsRef = useRef(shields);
  shieldsRef.current = shields;

  // Touch / button steer helper
  const setSteerKey = (key: string, pressed: boolean) => {
    keysPressedRef.current[key] = pressed;
  };

  const resetGame = useCallback(() => {
    setScore(0);
    setShields(100);
    setCombo(1);
    setLevel(1);
    setCrystalsCollected(0);
    setIsPlaying(true);
  }, []);

  const handleSyncScoreToWorkspace = () => {
    const finalScore = Math.max(score, highScore);
    onAddTask({
      title: `3D OmniRunner High Score Milestone: ${finalScore.toLocaleString()} pts (Lv.${level})`,
      description: `Collected ${crystalsCollected} Quantum Data Crystals in OmniSync 3D WebGL Studio.`,
      status: 'done',
      priority: 'medium',
      source: 'manual',
      tags: ['3D-Studio', 'Three.js', 'Milestone'],
    });
    if (onAddNote) {
      onAddNote({
        title: `Three.js 3D Studio Session Log — ${new Date().toLocaleDateString()}`,
        content: `Mode: ${mode === 'cyber_runner' ? 'OmniRunner 3D Cyber-Node Defender' : '3D Shader & Geometry Architect'}\nHigh Score: ${finalScore} pts\nCrystals Synced: ${crystalsCollected}\nShader Speed: ${shaderSpeed}x\nObjects in Scene: ${spawnedObjects.length}`,
        tags: ['3D', 'WebGL', 'ThreeJS'],
        pinned: false,
      });
    }
    if (onLogSyncEvent) {
      onLogSyncEvent('all', `Synced 3D Studio Telemetry (${finalScore} pts) to Workspace`, 1);
    }
    setSyncedBanner('Synced 3D Game Telemetry & High Score to Tasks & Notes!');
    setTimeout(() => setSyncedBanner(null), 3500);
  };

  // Keyboard listeners for Cyber-Runner
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      keysPressedRef.current[e.key.toLowerCase()] = true;
    };
    const onKeyUp = (e: KeyboardEvent) => {
      keysPressedRef.current[e.key.toLowerCase()] = false;
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, []);

  // Main Three.js Scene Effect
  useEffect(() => {
    const container = canvasContainerRef.current;
    if (!container) return;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 520;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x060913);
    scene.fog = new THREE.FogExp2(0x060913, 0.022);

    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 500);
    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0x38bdf8, 0.65);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.8);
    dirLight.position.set(10, 20, 15);
    scene.add(dirLight);

    const pointLight = new THREE.PointLight(0x6366f1, 3, 35);
    pointLight.position.set(0, 4, 4);
    scene.add(pointLight);

    // Starfield particles
    const starCount = 700;
    const starGeo = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      starPositions[i * 3] = (Math.random() - 0.5) * 90;
      starPositions[i * 3 + 1] = (Math.random() - 0.5) * 50;
      starPositions[i * 3 + 2] = -Math.random() * 120;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const starMat = new THREE.PointsMaterial({
      color: 0x7dd3fc,
      size: 0.22,
      transparent: true,
      opacity: 0.8,
    });
    const stars = new THREE.Points(starGeo, starMat);
    scene.add(stars);

    // Cyber Grid Floor
    const gridHelper = new THREE.GridHelper(120, 60, 0x06b6d4, 0x1e293b);
    gridHelper.position.y = -3.2;
    scene.add(gridHelper);

    let controls: OrbitControls | null = null;
    let animationFrameId = 0;
    const clock = new THREE.Clock();

    // Mode-specific objects
    // 1. Cyber Runner Mode
    const shipGroup = new THREE.Group();
    const crystals: THREE.Mesh[] = [];
    const obstacles: THREE.Mesh[] = [];

    // 2. Shader Architect Mode
    let shaderMaterial: THREE.ShaderMaterial | null = null;
    const architectMeshes: THREE.Mesh[] = [];

    if (mode === 'cyber_runner') {
      camera.position.set(0, 2.6, 9.5);
      camera.lookAt(0, 0, -10);

      // Build Player Cyber Ship
      const hullGeo = new THREE.ConeGeometry(0.85, 2.4, 6);
      hullGeo.rotateX(-Math.PI / 2);
      const hullMat = new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        emissive: 0x0284c7,
        emissiveIntensity: 0.45,
        metalness: 0.8,
        roughness: 0.2,
      });
      const hullMesh = new THREE.Mesh(hullGeo, hullMat);
      shipGroup.add(hullMesh);

      const wingGeo = new THREE.BoxGeometry(2.4, 0.12, 0.9);
      const wingMat = new THREE.MeshStandardMaterial({
        color: 0x818cf8,
        emissive: 0x4f46e5,
        emissiveIntensity: 0.35,
        metalness: 0.7,
        roughness: 0.25,
      });
      const wingMesh = new THREE.Mesh(wingGeo, wingMat);
      wingMesh.position.set(0, -0.1, 0.4);
      shipGroup.add(wingMesh);

      // Core thruster ring
      const ringGeo = new THREE.TorusGeometry(0.45, 0.08, 12, 24);
      const ringMat = new THREE.MeshBasicMaterial({ color: 0x22d3ee });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.position.set(0, 0, 1.25);
      shipGroup.add(ringMesh);

      scene.add(shipGroup);

      // Spawn Collectible Data Crystals (Octahedrons)
      const crystalGeo = new THREE.OctahedronGeometry(0.65, 0);
      for (let i = 0; i < 10; i++) {
        const mat = new THREE.MeshStandardMaterial({
          color: 0x10b981,
          emissive: 0x059669,
          emissiveIntensity: 0.7,
          metalness: 0.5,
          roughness: 0.1,
        });
        const mesh = new THREE.Mesh(crystalGeo, mat);
        mesh.position.set(
          (Math.random() - 0.5) * 14,
          (Math.random() - 0.5) * 4.5,
          -12 - i * 9
        );
        scene.add(mesh);
        crystals.push(mesh);
      }

      // Spawn Firewall Obstacles (Wireframe / Glowing Boxes)
      const obsGeo = new THREE.DodecahedronGeometry(0.95, 0);
      for (let i = 0; i < 7; i++) {
        const mat = new THREE.MeshStandardMaterial({
          color: 0xf43f5e,
          emissive: 0xe11d48,
          emissiveIntensity: 0.6,
          metalness: 0.6,
          roughness: 0.3,
          wireframe: i % 2 === 0,
        });
        const mesh = new THREE.Mesh(obsGeo, mat);
        mesh.position.set(
          (Math.random() - 0.5) * 14,
          (Math.random() - 0.5) * 4.5,
          -18 - i * 13
        );
        scene.add(mesh);
        obstacles.push(mesh);
      }
    } else {
      // Shader & Geometry Architect Mode
      camera.position.set(0, 3.5, 9);
      controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.05;

      // Custom GLSL Wave Floor Plane
      shaderMaterial = new THREE.ShaderMaterial({
        uniforms: {
          uTime: { value: 0 },
          uColorA: { value: new THREE.Color(primaryColor) },
          uColorB: { value: new THREE.Color('#6366f1') },
        },
        vertexShader: `
          uniform float uTime;
          varying vec2 vUv;
          varying float vElevation;
          void main() {
            vUv = uv;
            vec3 pos = position;
            float elev = sin(pos.x * 0.8 + uTime) * cos(pos.y * 0.8 + uTime) * 0.45;
            pos.z += elev;
            vElevation = elev;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
          }
        `,
        fragmentShader: `
          uniform vec3 uColorA;
          uniform vec3 uColorB;
          varying vec2 vUv;
          varying float vElevation;
          void main() {
            float mixFactor = smoothstep(-0.45, 0.45, vElevation);
            vec3 color = mix(uColorB, uColorA, mixFactor);
            gl_FragColor = vec4(color, 0.78);
          }
        `,
        wireframe: true,
        transparent: true,
      });

      const wavePlaneGeo = new THREE.PlaneGeometry(24, 24, 48, 48);
      const wavePlane = new THREE.Mesh(wavePlaneGeo, shaderMaterial);
      wavePlane.rotation.x = -Math.PI / 2;
      wavePlane.position.y = -2.2;
      scene.add(wavePlane);

      // Render user-spawned 3D objects
      spawnedObjects.forEach((obj, idx) => {
        let geo: THREE.BufferGeometry;
        switch (obj.geometryType) {
          case 'torusKnot':
            geo = new THREE.TorusKnotGeometry(1.1, 0.34, 128, 32);
            break;
          case 'icosahedron':
            geo = new THREE.IcosahedronGeometry(1.35, 1);
            break;
          case 'octahedron':
            geo = new THREE.OctahedronGeometry(1.3, 0);
            break;
          case 'sphere':
            geo = new THREE.SphereGeometry(1.25, 32, 32);
            break;
          default:
            geo = new THREE.BoxGeometry(1.6, 1.6, 1.6);
        }

        const mat = new THREE.MeshStandardMaterial({
          color: new THREE.Color(obj.color || primaryColor),
          metalness,
          roughness,
          wireframe: wireframeMode || obj.wireframe,
        });

        const mesh = new THREE.Mesh(geo, mat);
        const spread = (idx - (spawnedObjects.length - 1) / 2) * 3.6;
        mesh.position.set(spread, 0.6, 0);
        mesh.scale.setScalar(obj.scale);
        scene.add(mesh);
        architectMeshes.push(mesh);
      });
    }

    // Animation Loop
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = Math.min(clock.getDelta(), 0.1);
      const elapsed = clock.getElapsedTime();

      if (mode === 'cyber_runner') {
        if (isPlayingRef.current && shieldsRef.current > 0) {
          const moveSpeed = 11 * delta;
          const keys = keysPressedRef.current;

          if (keys['arrowleft'] || keys['a']) shipGroup.position.x -= moveSpeed;
          if (keys['arrowright'] || keys['d']) shipGroup.position.x += moveSpeed;
          if (keys['arrowup'] || keys['w']) shipGroup.position.y += moveSpeed;
          if (keys['arrowdown'] || keys['s']) shipGroup.position.y -= moveSpeed;

          // Clamp ship inside arena
          shipGroup.position.x = THREE.MathUtils.clamp(shipGroup.position.x, -7.2, 7.2);
          shipGroup.position.y = THREE.MathUtils.clamp(shipGroup.position.y, -2.1, 3.2);

          // Subtle banking tilt
          const targetRoll =
            (keys['arrowleft'] || keys['a'] ? 0.45 : 0) +
            (keys['arrowright'] || keys['d'] ? -0.45 : 0);
          shipGroup.rotation.z = THREE.MathUtils.lerp(shipGroup.rotation.z, targetRoll, 0.12);

          const forwardSpeed = (18 + Math.min(scoreRef.current / 350, 16)) * delta;

          // Scroll grid & stars
          gridHelper.position.z = (elapsed * 12) % 2;
          stars.rotation.z += 0.04 * delta;

          // Move & check crystals
          crystals.forEach((crystal) => {
            crystal.position.z += forwardSpeed;
            crystal.rotation.y += 2.2 * delta;
            crystal.rotation.x += 1.4 * delta;

            if (crystal.position.distanceTo(shipGroup.position) < 1.55) {
              // Collected crystal!
              crystal.position.set(
                (Math.random() - 0.5) * 14,
                (Math.random() - 0.5) * 4.5,
                -85 - Math.random() * 25
              );
              setScore((prev) => {
                const next = prev + 50 * comboRef.current;
                if (next > highScore) {
                  localStorage.setItem('omnisync_3d_highscore', String(next));
                  setHighScore(next);
                }
                setLevel(Math.floor(next / 500) + 1);
                return next;
              });
              setCombo((c) => Math.min(c + 1, 10));
              setCrystalsCollected((c) => c + 1);
            } else if (crystal.position.z > 11) {
              crystal.position.set(
                (Math.random() - 0.5) * 14,
                (Math.random() - 0.5) * 4.5,
                -85 - Math.random() * 20
              );
            }
          });

          // Move & check firewall obstacles
          obstacles.forEach((obs) => {
            obs.position.z += forwardSpeed * 1.08;
            obs.rotation.x += 1.8 * delta;
            obs.rotation.y += 1.5 * delta;

            if (obs.position.distanceTo(shipGroup.position) < 1.55) {
              obs.position.set(
                (Math.random() - 0.5) * 14,
                (Math.random() - 0.5) * 4.5,
                -90 - Math.random() * 30
              );
              setCombo(1);
              setShields((prev) => {
                const next = Math.max(0, prev - 20);
                if (next === 0) {
                  setIsPlaying(false);
                }
                return next;
              });
            } else if (obs.position.z > 11) {
              obs.position.set(
                (Math.random() - 0.5) * 14,
                (Math.random() - 0.5) * 4.5,
                -90 - Math.random() * 25
              );
            }
          });

          pointLight.position.copy(shipGroup.position).add(new THREE.Vector3(0, 1.5, 2));
        }
      } else {
        // Shader Architect animation
        if (shaderMaterial) {
          shaderMaterial.uniforms.uTime.value = elapsed * shaderSpeed;
          shaderMaterial.uniforms.uColorA.value.set(primaryColor);
        }
        architectMeshes.forEach((mesh, i) => {
          mesh.rotation.y = elapsed * 0.45 * shaderSpeed + i;
          mesh.rotation.x = elapsed * 0.28 * shaderSpeed;
        });
        controls?.update();
      }

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || 800;
      const h = container.clientHeight || 520;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      controls?.dispose();
      renderer.dispose();
    };
  }, [mode, spawnedObjects, shaderSpeed, wireframeMode, primaryColor, metalness, roughness]);

  const handleAdd3DObject = (geometryType: SpawnedObject['geometryType']) => {
    const colors = ['#38bdf8', '#a855f7', '#10b981', '#f43f5e', '#f59e0b'];
    const nextColor = colors[spawnedObjects.length % colors.length];
    setSpawnedObjects((prev) => [
      ...prev,
      {
        id: `obj-${Date.now()}`,
        name: `${geometryType.toUpperCase()} Node #${prev.length + 1}`,
        geometryType,
        color: nextColor,
        wireframe: wireframeMode,
        scale: 0.95,
      },
    ]);
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-purple-500 p-0.5 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Gamepad2 className="w-5 h-5 text-cyan-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white">
                OmniSync 3D Game &amp; WebGL Spatial Studio
              </h2>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                Three.js r170 WebGL2
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Play OmniRunner 3D: Cyber-Node Defender or design real-time GLSL shaders &amp; 3D geometries synced with your workspace.
            </p>
          </div>
        </div>

        {/* Mode Switcher + Sync */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setMode('cyber_runner')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
              mode === 'cyber_runner'
                ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/25'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Gamepad2 className="w-4 h-4" />
            OmniRunner 3D Game
          </button>
          <button
            onClick={() => setMode('shader_architect')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
              mode === 'shader_architect'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Box className="w-4 h-4" />
            3D Shader &amp; Scene Architect
          </button>
          <button
            onClick={handleSyncScoreToWorkspace}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Sync Telemetry to Hub
          </button>
        </div>
      </div>

      {syncedBanner && (
        <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{syncedBanner}</span>
        </div>
      )}

      {/* 3D Canvas Viewport + HUD Overlay */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 shadow-2xl">
        <div
          ref={canvasContainerRef}
          className="w-full h-[520px] sm:h-[560px] cursor-crosshair"
        />

        {/* Top HUD Overlay for Cyber Runner */}
        {mode === 'cyber_runner' && (
          <div className="absolute top-4 left-4 right-4 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
            <div className="flex flex-wrap items-center gap-2.5 bg-slate-950/80 backdrop-blur-md border border-slate-800/90 px-4 py-2.5 rounded-xl pointer-events-auto">
              <div className="pr-3 border-r border-slate-800">
                <div className="text-[10px] uppercase tracking-wider text-slate-400">Score</div>
                <div className="text-lg font-black font-mono text-cyan-400">
                  {score.toLocaleString()}
                </div>
              </div>
              <div className="pr-3 border-r border-slate-800">
                <div className="text-[10px] uppercase tracking-wider text-slate-400 flex items-center gap-1">
                  <Trophy className="w-3 h-3 text-amber-400" /> Best
                </div>
                <div className="text-lg font-black font-mono text-amber-400">
                  {highScore.toLocaleString()}
                </div>
              </div>
              <div className="pr-3 border-r border-slate-800">
                <div className="text-[10px] uppercase tracking-wider text-slate-400 flex items-center gap-1">
                  <Zap className="w-3 h-3 text-purple-400" /> Combo
                </div>
                <div className="text-lg font-black font-mono text-purple-400">{combo}x</div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider text-slate-400 flex items-center gap-1">
                  <Shield className="w-3 h-3 text-emerald-400" /> Hull Shield
                </div>
                <div className="w-24 h-2.5 bg-slate-800 rounded-full overflow-hidden mt-1">
                  <div
                    className={`h-full transition-all ${
                      shields > 40 ? 'bg-emerald-400' : 'bg-rose-500'
                    }`}
                    style={{ width: `${shields}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 pointer-events-auto">
              <button
                onClick={() => setIsPlaying((p) => !p)}
                className="px-3 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-white flex items-center gap-1.5"
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                {isPlaying ? 'Pause' : 'Resume'}
              </button>
              <button
                onClick={resetGame}
                className="px-3 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-cyan-300 flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset Run
              </button>
            </div>
          </div>
        )}

        {/* Game Over Overlay */}
        {mode === 'cyber_runner' && shields <= 0 && (
          <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center space-y-4">
            <Trophy className="w-12 h-12 text-amber-400 animate-bounce" />
            <h3 className="text-2xl font-black text-white">Hull Shields Depleted!</h3>
            <p className="text-xs text-slate-300 max-w-md">
              Final Score: <span className="text-cyan-400 font-mono font-bold">{score}</span> pts • Crystals Synced:{' '}
              <span className="text-emerald-400 font-mono font-bold">{crystalsCollected}</span> • Level {level}
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={resetGame}
                className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Launch New Run
              </button>
              <button
                onClick={handleSyncScoreToWorkspace}
                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                Save Score to Tasks
              </button>
            </div>
          </div>
        )}

        {/* Bottom On-Screen Controls / Instructions for Cyber-Runner */}
        {mode === 'cyber_runner' && (
          <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between pointer-events-none">
            <div className="bg-slate-950/80 backdrop-blur-md border border-slate-800 px-3.5 py-2 rounded-xl text-[11px] text-slate-300 pointer-events-auto">
              <span className="text-cyan-400 font-semibold">Controls:</span> Use{' '}
              <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-white font-mono">WASD</kbd> or{' '}
              <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-white font-mono">Arrow Keys</kbd>{' '}
              to steer. Collect <span className="text-emerald-400 font-semibold">Emerald Data Crystals</span> &amp; dodge{' '}
              <span className="text-rose-400 font-semibold">Crimson Firewalls</span>.
            </div>

            {/* Touch D-Pad for Mobile / Mouse */}
            <div className="grid grid-cols-3 gap-1.5 pointer-events-auto">
              <div />
              <button
                onMouseDown={() => setSteerKey('w', true)}
                onMouseUp={() => setSteerKey('w', false)}
                onTouchStart={() => setSteerKey('w', true)}
                onTouchEnd={() => setSteerKey('w', false)}
                className="w-9 h-9 rounded-lg bg-slate-900/90 border border-slate-700 flex items-center justify-center text-slate-200 active:bg-cyan-500 active:text-slate-950"
              >
                <ArrowUp className="w-4 h-4" />
              </button>
              <div />
              <button
                onMouseDown={() => setSteerKey('a', true)}
                onMouseUp={() => setSteerKey('a', false)}
                onTouchStart={() => setSteerKey('a', true)}
                onTouchEnd={() => setSteerKey('a', false)}
                className="w-9 h-9 rounded-lg bg-slate-900/90 border border-slate-700 flex items-center justify-center text-slate-200 active:bg-cyan-500 active:text-slate-950"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <button
                onMouseDown={() => setSteerKey('s', true)}
                onMouseUp={() => setSteerKey('s', false)}
                onTouchStart={() => setSteerKey('s', true)}
                onTouchEnd={() => setSteerKey('s', false)}
                className="w-9 h-9 rounded-lg bg-slate-900/90 border border-slate-700 flex items-center justify-center text-slate-200 active:bg-cyan-500 active:text-slate-950"
              >
                <ArrowDown className="w-4 h-4" />
              </button>
              <button
                onMouseDown={() => setSteerKey('d', true)}
                onMouseUp={() => setSteerKey('d', false)}
                onTouchStart={() => setSteerKey('d', true)}
                onTouchEnd={() => setSteerKey('d', false)}
                className="w-9 h-9 rounded-lg bg-slate-900/90 border border-slate-700 flex items-center justify-center text-slate-200 active:bg-cyan-500 active:text-slate-950"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Shader & Geometry Architect Inspector Deck */}
      {mode === 'shader_architect' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
              <Sliders className="w-4 h-4" />
              GLSL Wave Shader &amp; PBR Material Controls
            </h3>
            <div className="space-y-3 text-xs">
              <div>
                <div className="flex justify-between text-slate-400 mb-1">
                  <span>Shader Wave Frequency / Speed</span>
                  <span className="font-mono text-white">{shaderSpeed.toFixed(1)}x</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="4"
                  step="0.1"
                  value={shaderSpeed}
                  onChange={(e) => setShaderSpeed(parseFloat(e.target.value))}
                  className="w-full accent-cyan-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Metalness ({metalness})</label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={metalness}
                    onChange={(e) => setMetalness(parseFloat(e.target.value))}
                    className="w-full accent-indigo-400"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Roughness ({roughness})</label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={roughness}
                    onChange={(e) => setRoughness(parseFloat(e.target.value))}
                    className="w-full accent-indigo-400"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <label className="text-slate-300 flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={wireframeMode}
                    onChange={(e) => setWireframeMode(e.target.checked)}
                    className="rounded border-slate-700"
                  />
                  Global Wireframe Mesh
                </label>
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-8 h-6 rounded bg-transparent cursor-pointer"
                />
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3 lg:col-span-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-2">
                <Layers className="w-4 h-4" />
                Spawn 3D Primitives (Drag Canvas to Orbit / Scroll to Zoom)
              </h3>
              <button
                onClick={() => setSpawnedObjects(spawnedObjects.slice(0, 1))}
                className="text-[11px] text-slate-400 hover:text-white"
              >
                Clear Extra Meshes
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {(
                [
                  { type: 'torusKnot', label: '+ Torus Knot' },
                  { type: 'icosahedron', label: '+ Geodesic Icosahedron' },
                  { type: 'octahedron', label: '+ Quantum Octahedron' },
                  { type: 'sphere', label: '+ Metallic Sphere' },
                  { type: 'box', label: '+ Cyber Cube' },
                ] as const
              ).map((btn) => (
                <button
                  key={btn.type}
                  onClick={() => handleAdd3DObject(btn.type)}
                  className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-indigo-600/30 border border-slate-700 hover:border-indigo-500/40 text-xs font-semibold text-slate-200 flex items-center gap-1.5 transition-all"
                >
                  <Plus className="w-3.5 h-3.5 text-cyan-400" />
                  {btn.label}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
              {spawnedObjects.map((obj) => (
                <div
                  key={obj.id}
                  className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2 truncate">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: obj.color }}
                    />
                    <span className="truncate text-slate-300 font-medium">{obj.name}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
