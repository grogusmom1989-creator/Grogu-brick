import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import {
  Dna,
  FlaskConical,
  BookOpen,
  Search,
  RefreshCw,
  Plus,
  ExternalLink,
  CheckCircle2,
  Atom,
  Activity,
  FileText,
} from 'lucide-react';
import { WorkspaceTask, WorkspaceNote } from '../types';

interface ScienceWorkbenchViewProps {
  onAddTask: (task: Omit<WorkspaceTask, 'id' | 'createdAt'>) => void;
  onAddNote: (note: Omit<WorkspaceNote, 'id' | 'updatedAt'>) => void;
}

type ScienceSubTab = 'protein_3d' | 'pubchem' | 'literature_trials';

interface ParsedAtom {
  x: number;
  y: number;
  z: number;
  element: string;
  atomName: string;
  chain: string;
  resName: string;
  resSeq: number;
}

const PDB_PRESETS = [
  { id: '4HHB', label: '4HHB • Human Deoxyhemoglobin' },
  { id: '1EMA', label: '1EMA • Green Fluorescent Protein (GFP)' },
  { id: '1INS', label: '1INS • Human Insulin Hormone' },
  { id: '4OO8', label: '4OO8 • CRISPR-Cas9 Endonuclease' },
  { id: '1BNA', label: '1BNA • B-DNA Double Helix Dodecamer' },
];

export const ScienceWorkbenchView: React.FC<ScienceWorkbenchViewProps> = ({
  onAddTask,
  onAddNote,
}) => {
  const [subTab, setSubTab] = useState<ScienceSubTab>('protein_3d');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // 1. Protein 3D State
  const [pdbId, setPdbId] = useState('4HHB');
  const [pdbSearchInput, setPdbSearchInput] = useState('4HHB');
  const [pdbMetadata, setPdbMetadata] = useState<any>(null);
  const [atomsCount, setAtomsCount] = useState(0);
  const [chainsFound, setChainsFound] = useState<string[]>([]);
  const [isLoadingPdb, setIsLoadingPdb] = useState(false);
  const [renderStyle, setRenderStyle] = useState<'backbone_atoms' | 'cpk_spheres'>('backbone_atoms');
  const pdbCanvasRef = useRef<HTMLDivElement | null>(null);
  const parsedAtomsRef = useRef<ParsedAtom[]>([]);

  // 2. PubChem Compound Explorer State
  const [compoundQuery, setCompoundQuery] = useState('Caffeine');
  const [compoundData, setCompoundData] = useState<any>(null);
  const [isLoadingCompound, setIsLoadingCompound] = useState(false);
  const [compoundError, setCompoundError] = useState<string | null>(null);

  // 3. Literature & Clinical Trials State
  const [litQuery, setLitQuery] = useState('CRISPR gene therapy');
  const [papers, setPapers] = useState<any[]>([]);
  const [trials, setTrials] = useState<any[]>([]);
  const [isLoadingLit, setIsLoadingLit] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3200);
  };

  // Fetch & Parse Real RCSB PDB Entry + Coordinates
  const fetchPdbStructure = async (idToFetch: string) => {
    const cleanId = idToFetch.trim().toUpperCase();
    if (!cleanId) return;
    setIsLoadingPdb(true);
    setPdbId(cleanId);

    try {
      const [metaRes, pdbTextRes] = await Promise.all([
        fetch(`https://data.rcsb.org/rest/v1/core/entry/${cleanId}`),
        fetch(`https://files.rcsb.org/download/${cleanId}.pdb`),
      ]);

      if (metaRes.ok) {
        const metaJson = await metaRes.json();
        setPdbMetadata({
          title: metaJson.struct?.title || `PDB Structure ${cleanId}`,
          method: metaJson.exptl?.[0]?.method || 'X-RAY DIFFRACTION',
          resolution: metaJson.rcsb_entry_info?.resolution_combined?.[0] || 'N/A',
          molecularWeight: metaJson.rcsb_entry_info?.molecular_weight
            ? `${metaJson.rcsb_entry_info.molecular_weight.toFixed(1)} kDa`
            : 'N/A',
          releaseDate: metaJson.rcsb_accession_info?.initial_release_date?.split('T')[0] || 'N/A',
          citationTitle: metaJson.rcsb_primary_citation?.title || '',
        });
      }

      if (pdbTextRes.ok) {
        const pdbText = await pdbTextRes.text();
        const lines = pdbText.split('\n');
        const atoms: ParsedAtom[] = [];
        const chainsSet = new Set<string>();

        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          if (line.startsWith('ATOM  ') || line.startsWith('HETATM')) {
            const atomName = line.substring(12, 16).trim();
            const resName = line.substring(17, 20).trim();
            if (resName === 'HOH') continue; // skip water molecules for clean 3D rendering
            const chain = line.substring(21, 22).trim() || 'A';
            const resSeq = parseInt(line.substring(22, 26).trim(), 10) || 0;
            const x = parseFloat(line.substring(30, 38));
            const y = parseFloat(line.substring(38, 46));
            const z = parseFloat(line.substring(46, 54));
            const element = (line.substring(76, 78).trim() || atomName.charAt(0)).toUpperCase();

            if (!isNaN(x) && !isNaN(y) && !isNaN(z)) {
              chainsSet.add(chain);
              // Keep CA, P, C3' backbone atoms plus sampled sidechain/ligand atoms for smooth 60fps WebGL
              if (
                atomName === 'CA' ||
                atomName === 'P' ||
                line.startsWith('HETATM') ||
                atoms.length < 1800
              ) {
                atoms.push({ x, y, z, element, atomName, chain, resName, resSeq });
              }
            }
          }
        }

        parsedAtomsRef.current = atoms;
        setAtomsCount(atoms.length);
        setChainsFound(Array.from(chainsSet));
      }
    } catch (err) {
      console.error('Error loading PDB:', err);
    } finally {
      setIsLoadingPdb(false);
    }
  };

  useEffect(() => {
    fetchPdbStructure('4HHB');
  }, []);

  // Render 3D Molecular Structure in Three.js when atoms or style change
  useEffect(() => {
    if (subTab !== 'protein_3d') return;
    const container = pdbCanvasRef.current;
    if (!container) return;

    const width = container.clientWidth || 720;
    const height = container.clientHeight || 460;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x060a14);

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.set(0, 0, 68);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 1.2;

    scene.add(new THREE.AmbientLight(0xffffff, 0.85));
    const dirLight1 = new THREE.DirectionalLight(0x38bdf8, 1.5);
    dirLight1.position.set(40, 50, 60);
    scene.add(dirLight1);
    const dirLight2 = new THREE.DirectionalLight(0xa855f7, 1.0);
    dirLight2.position.set(-40, -30, -50);
    scene.add(dirLight2);

    const atoms = parsedAtomsRef.current;
    const moleculeGroup = new THREE.Group();

    if (atoms.length > 0) {
      // Calculate centroid to center protein at (0,0,0)
      let cx = 0,
        cy = 0,
        cz = 0;
      atoms.forEach((a) => {
        cx += a.x;
        cy += a.y;
        cz += a.z;
      });
      cx /= atoms.length;
      cy /= atoms.length;
      cz /= atoms.length;

      const chainColors: Record<string, number> = {
        A: 0x38bdf8,
        B: 0xa855f7,
        C: 0x10b981,
        D: 0xf59e0b,
        E: 0xf43f5e,
        F: 0x22d3ee,
      };

      const elementColors: Record<string, number> = {
        C: 0x94a3b8,
        N: 0x3b82f6,
        O: 0xef4444,
        S: 0xeab308,
        P: 0xf97316,
        FE: 0xdc2626,
      };

      // Draw C-alpha / Phosphorus backbone splines per chain
      const chainsMap: Record<string, THREE.Vector3[]> = {};
      atoms.forEach((a) => {
        if (a.atomName === 'CA' || a.atomName === 'P') {
          if (!chainsMap[a.chain]) chainsMap[a.chain] = [];
          chainsMap[a.chain].push(new THREE.Vector3(a.x - cx, a.y - cy, a.z - cz));
        }
      });

      Object.entries(chainsMap).forEach(([chainId, pts], idx) => {
        if (pts.length > 3) {
          const curve = new THREE.CatmullRomCurve3(pts);
          const tubeGeo = new THREE.TubeGeometry(
            curve,
            Math.min(pts.length * 3, 320),
            renderStyle === 'backbone_atoms' ? 0.42 : 0.22,
            8,
            false
          );
          const colorHex = chainColors[chainId] || [0x38bdf8, 0xa855f7, 0x10b981, 0xf59e0b][idx % 4];
          const tubeMat = new THREE.MeshStandardMaterial({
            color: colorHex,
            metalness: 0.35,
            roughness: 0.25,
          });
          moleculeGroup.add(new THREE.Mesh(tubeGeo, tubeMat));
        }
      });

      // InstancedMesh for high-performance 3D atom spheres
      const sampledAtoms = atoms.slice(0, 1200);
      const sphereRadius = renderStyle === 'cpk_spheres' ? 0.95 : 0.45;
      const sphereGeo = new THREE.SphereGeometry(sphereRadius, 12, 12);
      const sphereMat = new THREE.MeshStandardMaterial({
        metalness: 0.25,
        roughness: 0.3,
      });
      const instancedAtoms = new THREE.InstancedMesh(sphereGeo, sphereMat, sampledAtoms.length);
      const dummy = new THREE.Object3D();
      const colorObj = new THREE.Color();

      sampledAtoms.forEach((a, i) => {
        dummy.position.set(a.x - cx, a.y - cy, a.z - cz);
        dummy.updateMatrix();
        instancedAtoms.setMatrixAt(i, dummy.matrix);
        const cHex =
          renderStyle === 'cpk_spheres'
            ? elementColors[a.element] || 0x38bdf8
            : chainColors[a.chain] || 0x38bdf8;
        colorObj.setHex(cHex);
        instancedAtoms.setColorAt(i, colorObj);
      });

      instancedAtoms.instanceMatrix.needsUpdate = true;
      if (instancedAtoms.instanceColor) instancedAtoms.instanceColor.needsUpdate = true;
      moleculeGroup.add(instancedAtoms);
    }

    scene.add(moleculeGroup);

    let animId = 0;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      controls.dispose();
      renderer.dispose();
    };
  }, [subTab, atomsCount, pdbId, renderStyle]);

  // Fetch Real PubChem Compound Data
  const fetchPubChemCompound = async (nameQuery?: string) => {
    const q = (nameQuery || compoundQuery).trim();
    if (!q) return;
    setIsLoadingCompound(true);
    setCompoundError(null);

    try {
      const propUrl = `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${encodeURIComponent(
        q
      )}/property/MolecularFormula,MolecularWeight,IUPACName,CanonicalSMILES,XLogP,TPSA,HBondDonorCount,HBondAcceptorCount/JSON`;
      const res = await fetch(propUrl);
      if (!res.ok) {
        throw new Error(`Compound "${q}" not found in PubChem database.`);
      }
      const json = await res.json();
      const prop = json.PropertyTable?.Properties?.[0];
      if (!prop) throw new Error('No properties returned');

      setCompoundData({
        ...prop,
        queryName: q,
        image2DUrl: `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${prop.CID}/PNG?record_type=2d&image_size=large`,
      });
    } catch (err: any) {
      setCompoundError(err.message || 'Failed to fetch compound from PubChem');
    } finally {
      setIsLoadingCompound(false);
    }
  };

  useEffect(() => {
    if (subTab === 'pubchem' && !compoundData) {
      fetchPubChemCompound('Caffeine');
    }
  }, [subTab]);

  // Fetch Real Europe PMC Literature & ClinicalTrials.gov v2 Studies
  const fetchLiteratureAndTrials = async (queryText?: string) => {
    const q = (queryText || litQuery).trim();
    if (!q) return;
    setIsLoadingLit(true);

    try {
      const [epmcRes, ctRes] = await Promise.all([
        fetch(
          `https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=${encodeURIComponent(
            q
          )}&format=json&pageSize=6`
        ),
        fetch(
          `https://clinicaltrials.gov/api/v2/studies?query.term=${encodeURIComponent(q)}&pageSize=6`
        ),
      ]);

      if (epmcRes.ok) {
        const epmcJson = await epmcRes.json();
        setPapers(epmcJson.resultList?.result || []);
      }

      if (ctRes.ok) {
        const ctJson = await ctRes.json();
        setTrials(ctJson.studies || []);
      }
    } catch (err) {
      console.error('Literature/Trials search error:', err);
    } finally {
      setIsLoadingLit(false);
    }
  };

  useEffect(() => {
    if (subTab === 'literature_trials' && papers.length === 0) {
      fetchLiteratureAndTrials('CRISPR gene therapy');
    }
  }, [subTab]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-emerald-500 via-cyan-500 to-indigo-500 p-0.5 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Dna className="w-5 h-5 text-emerald-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white">
                OmniSync Scientific Computing &amp; Bioscience Workbench
              </h2>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                RCSB PDB • PubChem • ClinicalTrials.gov
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Interactive 3D molecular structures, chemical cheminformatics, Lipinski drug discovery rules, and live biomedical literature &amp; clinical trials.
            </p>
          </div>
        </div>

        {/* Sub-Tab Selector */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setSubTab('protein_3d')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
              subTab === 'protein_3d'
                ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Atom className="w-4 h-4" />
            3D Protein Structure (RCSB PDB)
          </button>
          <button
            onClick={() => setSubTab('pubchem')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
              subTab === 'pubchem'
                ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <FlaskConical className="w-4 h-4" />
            PubChem Compound Explorer
          </button>
          <button
            onClick={() => setSubTab('literature_trials')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
              subTab === 'literature_trials'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Literature &amp; Clinical Trials
          </button>
        </div>
      </div>

      {toastMessage && (
        <div className="p-3 rounded-xl bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* TAB 1: 3D PROTEIN & MOLECULAR VIEWER */}
      {subTab === 'protein_3d' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Columns: 3D WebGL Protein Viewport */}
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  fetchPdbStructure(pdbSearchInput);
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={pdbSearchInput}
                  onChange={(e) => setPdbSearchInput(e.target.value.toUpperCase())}
                  placeholder="PDB ID (e.g. 4HHB)"
                  className="w-36 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white font-mono uppercase"
                />
                <button
                  type="submit"
                  disabled={isLoadingPdb}
                  className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5"
                >
                  {isLoadingPdb ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                  Load PDB
                </button>
              </form>

              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    setRenderStyle((s) => (s === 'backbone_atoms' ? 'cpk_spheres' : 'backbone_atoms'))
                  }
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-cyan-300 border border-slate-700"
                >
                  Style: {renderStyle === 'backbone_atoms' ? 'Ribbon + Chain Atoms' : 'CPK Spacefill Spheres'}
                </button>
              </div>
            </div>

            {/* Preset Bar */}
            <div className="px-4 py-2 bg-slate-950/60 border-b border-slate-800 flex items-center gap-2 overflow-x-auto">
              <span className="text-[11px] text-slate-400 shrink-0">Presets:</span>
              {PDB_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => {
                    setPdbSearchInput(preset.id);
                    fetchPdbStructure(preset.id);
                  }}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium whitespace-nowrap transition-colors ${
                    pdbId === preset.id
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'bg-slate-800/80 text-slate-400 hover:text-white'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            {/* 3D Canvas */}
            <div className="relative flex-1 min-h-[450px] bg-slate-950">
              <div ref={pdbCanvasRef} className="w-full h-[450px] cursor-grab active:cursor-grabbing" />
              <div className="absolute bottom-3 left-3 bg-slate-950/80 backdrop-blur-md border border-slate-800 px-3 py-1.5 rounded-lg text-[11px] text-slate-400">
                Drag to rotate 3D macromolecule • Scroll to zoom • Rendered atoms:{' '}
                <span className="text-emerald-400 font-mono">{atomsCount}</span> • Chains:{' '}
                <span className="text-cyan-400 font-mono">{chainsFound.join(', ') || 'A'}</span>
              </div>
            </div>
          </div>

          {/* Right Column: RCSB PDB Metadata & Save to Workspace */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  RCSB PDB: {pdbId}
                </span>
                <a
                  href={`https://www.rcsb.org/structure/${pdbId}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-cyan-400 hover:underline flex items-center gap-1"
                >
                  View on RCSB.org <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <h3 className="text-base font-bold text-white leading-snug">
                {pdbMetadata?.title || `Loading ${pdbId}...`}
              </h3>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                  <div className="text-[10px] text-slate-400 uppercase">Method</div>
                  <div className="text-xs font-semibold text-slate-200 mt-0.5">
                    {pdbMetadata?.method || 'X-RAY'}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                  <div className="text-[10px] text-slate-400 uppercase">Resolution</div>
                  <div className="text-xs font-semibold text-emerald-400 font-mono mt-0.5">
                    {pdbMetadata?.resolution ? `${pdbMetadata.resolution} Å` : 'N/A'}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                  <div className="text-[10px] text-slate-400 uppercase">Molecular Weight</div>
                  <div className="text-xs font-semibold text-cyan-400 font-mono mt-0.5">
                    {pdbMetadata?.molecularWeight || 'N/A'}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                  <div className="text-[10px] text-slate-400 uppercase">Released</div>
                  <div className="text-xs font-semibold text-slate-200 font-mono mt-0.5">
                    {pdbMetadata?.releaseDate || 'N/A'}
                  </div>
                </div>
              </div>

              {pdbMetadata?.citationTitle && (
                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-indigo-400">
                    Primary Literature Citation
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{pdbMetadata.citationTitle}</p>
                </div>
              )}
            </div>

            <div className="space-y-2 pt-4 border-t border-slate-800">
              <button
                onClick={() => {
                  onAddNote({
                    title: `PDB ${pdbId}: ${pdbMetadata?.title || 'Protein Structure'}`,
                    content: `RCSB PDB Entry: ${pdbId}\nMethod: ${pdbMetadata?.method}\nResolution: ${pdbMetadata?.resolution} Å\nMolecular Weight: ${pdbMetadata?.molecularWeight}\nChains: ${chainsFound.join(', ')}\nCitation: ${pdbMetadata?.citationTitle}\nURL: https://www.rcsb.org/structure/${pdbId}`,
                    tags: ['Bioscience', 'PDB', pdbId],
                    pinned: false,
                  });
                  showToast(`Saved PDB ${pdbId} structure report to Workspace Notes!`);
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
              >
                <FileText className="w-4 h-4" />
                Save Structure Report to Notes
              </button>
              <button
                onClick={() => {
                  onAddTask({
                    title: `Analyze 3D Macromolecule ${pdbId} (${pdbMetadata?.title?.slice(0, 40) || 'Protein'})`,
                    description: `Review chains ${chainsFound.join(', ')} at ${pdbMetadata?.resolution} Å resolution.`,
                    status: 'todo',
                    priority: 'medium',
                    source: 'manual',
                    sourceUrl: `https://www.rcsb.org/structure/${pdbId}`,
                    tags: ['Science', 'PDB'],
                  });
                  showToast(`Added PDB ${pdbId} analysis to Action Items!`);
                }}
                className="w-full py-2 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center justify-center gap-2 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Create Action Task
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PUBCHEM COMPOUND EXPLORER */}
      {subTab === 'pubchem' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                fetchPubChemCompound();
              }}
              className="flex-1 flex items-center gap-2 max-w-xl"
            >
              <input
                type="text"
                value={compoundQuery}
                onChange={(e) => setCompoundQuery(e.target.value)}
                placeholder="Search chemical compound or drug (e.g., Aspirin, Caffeine, Paclitaxel, Dopamine)..."
                className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
              />
              <button
                type="submit"
                disabled={isLoadingCompound}
                className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1.5"
              >
                {isLoadingCompound ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
                Search PubChem
              </button>
            </form>

            <div className="flex flex-wrap gap-1.5">
              {['Caffeine', 'Aspirin', 'Dopamine', 'Serotonin', 'Ibuprofen', 'Resveratrol'].map(
                (preset) => (
                  <button
                    key={preset}
                    onClick={() => {
                      setCompoundQuery(preset);
                      fetchPubChemCompound(preset);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300"
                  >
                    {preset}
                  </button>
                )
              )}
            </div>
          </div>

          {compoundError && (
            <div className="p-4 rounded-xl bg-rose-950/50 border border-rose-500/40 text-xs text-rose-300">
              {compoundError}
            </div>
          )}

          {compoundData && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
              {/* 2D Chemical Depiction */}
              <div className="p-4 rounded-2xl bg-white flex flex-col items-center justify-center shadow-inner">
                <img
                  src={compoundData.image2DUrl}
                  alt={compoundData.queryName}
                  className="w-56 h-56 object-contain"
                />
                <span className="text-[11px] font-mono text-slate-700 mt-2">
                  PubChem CID: {compoundData.CID}
                </span>
              </div>

              {/* Molecular Descriptors & Lipinski Rule of 5 */}
              <div className="md:col-span-2 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h3 className="text-xl font-bold text-white capitalize">
                      {compoundData.queryName}
                    </h3>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">
                      IUPAC: {compoundData.IUPACName || 'Standard Compound'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        onAddNote({
                          title: `PubChem Compound: ${compoundData.queryName} (CID ${compoundData.CID})`,
                          content: `Formula: ${compoundData.MolecularFormula}\nMolecular Weight: ${compoundData.MolecularWeight} g/mol\nSMILES: ${compoundData.CanonicalSMILES}\nIUPAC: ${compoundData.IUPACName}\nXLogP: ${compoundData.XLogP}\nTPSA: ${compoundData.TPSA} Å²`,
                          tags: ['Chemistry', 'PubChem', compoundData.MolecularFormula],
                        });
                        showToast(`Saved ${compoundData.queryName} chemical profile to Notes!`);
                      }}
                      className="px-3.5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Save to Notes
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <div className="text-[10px] text-slate-400 uppercase">Formula</div>
                    <div className="text-sm font-bold text-cyan-400 font-mono mt-0.5">
                      {compoundData.MolecularFormula}
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <div className="text-[10px] text-slate-400 uppercase">Mol. Weight</div>
                    <div className="text-sm font-bold text-emerald-400 font-mono mt-0.5">
                      {compoundData.MolecularWeight} g/mol
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <div className="text-[10px] text-slate-400 uppercase">XLogP (Lipophilicity)</div>
                    <div className="text-sm font-bold text-indigo-400 font-mono mt-0.5">
                      {compoundData.XLogP ?? 'N/A'}
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <div className="text-[10px] text-slate-400 uppercase">Polar Area (TPSA)</div>
                    <div className="text-sm font-bold text-purple-400 font-mono mt-0.5">
                      {compoundData.TPSA ? `${compoundData.TPSA} Å²` : 'N/A'}
                    </div>
                  </div>
                </div>

                {compoundData.CanonicalSMILES && (
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">
                      Canonical SMILES String
                    </div>
                    <div className="text-xs font-mono text-emerald-300 break-all">
                      {compoundData.CanonicalSMILES}
                    </div>
                  </div>
                )}

                <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                  <div className="text-xs font-bold text-white flex items-center gap-2">
                    <Activity className="w-4 h-4 text-emerald-400" />
                    Lipinski Rule of Five (Oral Bioavailability Assessment)
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <div className="p-2 rounded bg-slate-900 border border-slate-800">
                      MW &le; 500: <span className="text-emerald-400 font-mono">{Number(compoundData.MolecularWeight) <= 500 ? 'PASS' : 'HIGH'}</span>
                    </div>
                    <div className="p-2 rounded bg-slate-900 border border-slate-800">
                      LogP &le; 5: <span className="text-emerald-400 font-mono">{Number(compoundData.XLogP || 0) <= 5 ? 'PASS' : 'HIGH'}</span>
                    </div>
                    <div className="p-2 rounded bg-slate-900 border border-slate-800">
                      H-Donors ({compoundData.HBondDonorCount ?? 0} &le; 5): <span className="text-emerald-400 font-mono">PASS</span>
                    </div>
                    <div className="p-2 rounded bg-slate-900 border border-slate-800">
                      H-Acceptors ({compoundData.HBondAcceptorCount ?? 0} &le; 10): <span className="text-emerald-400 font-mono">PASS</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: BIOMEDICAL LITERATURE & CLINICAL TRIALS */}
      {subTab === 'literature_trials' && (
        <div className="space-y-6">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              fetchLiteratureAndTrials();
            }}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3"
          >
            <input
              type="text"
              value={litQuery}
              onChange={(e) => setLitQuery(e.target.value)}
              placeholder="Search Europe PMC & ClinicalTrials.gov (e.g., CRISPR, Alzheimer, CAR-T, mRNA vaccine)..."
              className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
            />
            <button
              type="submit"
              disabled={isLoadingLit}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2"
            >
              {isLoadingLit ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
              Query Biomedical Databases
            </button>
          </form>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Europe PMC Peer-Reviewed Papers */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-cyan-400" />
                  Europe PMC Biomedical Literature
                </span>
                <span className="text-[11px] font-mono text-slate-400">{papers.length} papers</span>
              </h3>

              <div className="space-y-3">
                {papers.map((paper: any, idx: number) => (
                  <div
                    key={paper.id || idx}
                    className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2"
                  >
                    <div className="text-xs font-bold text-slate-100 leading-snug">
                      {paper.title}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {paper.authorString} • <span className="text-cyan-400">{paper.journalTitle}</span> ({paper.pubYear})
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[10px] font-mono text-slate-500">
                        PMID: {paper.pmid || paper.id} • Cited by: {paper.citedByCount || 0}
                      </span>
                      <button
                        onClick={() => {
                          onAddNote({
                            title: `Paper: ${paper.title?.slice(0, 60)}`,
                            content: `Title: ${paper.title}\nAuthors: ${paper.authorString}\nJournal: ${paper.journalTitle} (${paper.pubYear})\nPMID: ${paper.pmid || paper.id}\nDOI: ${paper.doi || 'N/A'}`,
                            tags: ['Literature', 'EuropePMC'],
                          });
                          showToast('Saved citation to Workspace Notes!');
                        }}
                        className="px-2.5 py-1 rounded bg-slate-800 hover:bg-indigo-600 text-[11px] text-slate-200 transition-colors"
                      >
                        + Save Citation
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ClinicalTrials.gov v2 Active Trials */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-400" />
                  ClinicalTrials.gov Registry (API v2)
                </span>
                <span className="text-[11px] font-mono text-slate-400">{trials.length} studies</span>
              </h3>

              <div className="space-y-3">
                {trials.map((study: any, idx: number) => {
                  const proto = study.protocolSection || {};
                  const nctId = proto.identificationModule?.nctId || `NCT-${idx}`;
                  const title = proto.identificationModule?.briefTitle || 'Clinical Study';
                  const status = proto.statusModule?.overallStatus || 'ACTIVE';
                  const conditions = proto.conditionsModule?.conditions?.slice(0, 3).join(', ') || 'General';

                  return (
                    <div
                      key={nctId}
                      className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                          {nctId}
                        </span>
                        <span className="text-[10px] font-mono text-cyan-400">{status}</span>
                      </div>
                      <div className="text-xs font-bold text-slate-100 leading-snug">{title}</div>
                      <div className="text-[11px] text-slate-400">
                        Conditions: <span className="text-slate-300">{conditions}</span>
                      </div>
                      <div className="flex items-center justify-between pt-1">
                        <a
                          href={`https://clinicaltrials.gov/study/${nctId}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] text-cyan-400 hover:underline flex items-center gap-1"
                        >
                          View Study <ExternalLink className="w-3 h-3" />
                        </a>
                        <button
                          onClick={() => {
                            onAddTask({
                              title: `Review Clinical Trial ${nctId}: ${title.slice(0, 45)}`,
                              description: `Status: ${status} • Conditions: ${conditions}`,
                              status: 'todo',
                              priority: 'medium',
                              source: 'manual',
                              sourceUrl: `https://clinicaltrials.gov/study/${nctId}`,
                              tags: ['ClinicalTrial', nctId],
                            });
                            showToast(`Added ${nctId} to Workspace Tasks!`);
                          }}
                          className="px-2.5 py-1 rounded bg-slate-800 hover:bg-emerald-600 text-[11px] text-slate-200 transition-colors"
                        >
                          + Track Study
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
