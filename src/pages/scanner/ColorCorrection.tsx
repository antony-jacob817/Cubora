import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, AlertTriangle, CheckCircle2, RotateCcw, RefreshCw, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { PageTransition } from '@/components/animations/PageTransition';
import { useSolver } from '@/context/SolverContext';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';

import type { CubeColor, CompleteCubeState } from '@/services/colorDetector';
import type { ValidationResult } from '@/utils/cubeValidator';
import { CubeValidator } from '@/utils/cubeValidator';
import { clsx } from 'clsx';

const COLOR_PALETTE: { id: CubeColor; label: string; hex: string; glow: string }[] = [
  { id: 'W', label: 'White', hex: '#FFFFFF', glow: 'shadow-[0_0_15px_rgba(255,255,255,0.4)]' },
  { id: 'Y', label: 'Yellow', hex: '#EAB308', glow: 'shadow-[0_0_15px_rgba(234,179,8,0.4)]' },
  { id: 'G', label: 'Green', hex: '#22C55E', glow: 'shadow-[0_0_15px_rgba(34,197,94,0.4)]' },
  { id: 'B', label: 'Blue', hex: '#3B82F6', glow: 'shadow-[0_0_15px_rgba(59,130,246,0.4)]' },
  { id: 'R', label: 'Red', hex: '#EF4444', glow: 'shadow-[0_0_15px_rgba(239,68,68,0.4)]' },
  { id: 'O', label: 'Orange', hex: '#F97316', glow: 'shadow-[0_0_15px_rgba(249,115,22,0.4)]' },
];

const FACE_LABELS: Record<keyof CompleteCubeState, string> = {
  F: 'Front (Green)', R: 'Right (Red)', B: 'Back (Blue)', L: 'Left (Orange)', U: 'Top (White)', D: 'Bottom (Yellow)',
};

const initialScannedState: CompleteCubeState = {
  F: ['G', 'G', 'R', 'G', 'G', 'G', 'G', 'G', 'G'],
  R: ['R', 'R', 'G', 'R', 'R', 'R', 'R', 'R', 'R'],
  B: ['B', 'B', 'B', 'B', 'B', 'B', 'B', 'B', 'B'],
  L: ['O', 'O', 'O', 'O', 'O', 'O', 'O', 'O', 'O'], 
  U: ['W', 'W', 'W', 'W', 'W', 'W', 'W', 'W', 'W'],
  D: ['Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y'],
};

export default function ColorCorrection() {
  const { scannedFaces, setScannedFaces, setSolution, activeScanId, setActiveScanId } = useSolver();
  const { getAuthHeaders } = useAuth();
  const navigate = useNavigate();

  const isScanComplete = scannedFaces && 
    Object.keys(scannedFaces).length === 6 && 
    Object.values(scannedFaces).every(face => Array.isArray(face) && face.length === 9);

  useEffect(() => {
    if (!isScanComplete) {
      navigate('/scanner', { replace: true });
    }
  }, [isScanComplete, navigate]);

  const getSanitizedInitialState = (): CompleteCubeState => {
    let baseState: CompleteCubeState = scannedFaces
      ? { ...JSON.parse(JSON.stringify(initialScannedState)), ...scannedFaces }
      : JSON.parse(JSON.stringify(initialScannedState));

    baseState.F[4] = 'G'; baseState.R[4] = 'R'; baseState.B[4] = 'B';
    baseState.L[4] = 'O'; baseState.U[4] = 'W'; baseState.D[4] = 'Y';
    return baseState;
  };

  const [cubeState, setCubeState] = useState<CompleteCubeState>(getSanitizedInitialState);
  const [activeFace, setActiveFace] = useState<keyof CompleteCubeState>('F');
  const [selectedColor, setSelectedColor] = useState<CubeColor>('G');
  const [isSolving, setIsSolving] = useState(false);
  const [solveError, setSolveError] = useState<string | null>(null);
  const [validation, setValidation] = useState<ValidationResult>({
    isValid: false, errorMsg: null, colorCounts: { W: 0, Y: 0, G: 0, B: 0, R: 0, O: 0, UNKNOWN: 0 },
  });

  useEffect(() => {
    const result = CubeValidator.validateFullCube(cubeState);
    setValidation(result);
  }, [cubeState]);

  const handleStickerClick = (index: number) => {
    if (index === 4) return;
    setCubeState((prev) => {
      const updatedFace = [...prev[activeFace]];
      updatedFace[index] = selectedColor;
      return { ...prev, [activeFace]: updatedFace };
    });
  };

  const handleReset = () => { setCubeState(getSanitizedInitialState()); };

  const handleCommit = async () => {
    setIsSolving(true);
    setSolveError(null);
    try {
      const response = await fetch('http://localhost:5000/api/solver/solve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({ 
          cubeState, 
          detectedColors: cubeState,
          scanId: activeScanId
        }),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        if (data.scanId) {
          setActiveScanId(data.scanId);
        }
        setScannedFaces(cubeState as any);
        setSolution({ steps: data.steps, totalMoves: data.totalMoves });
        navigate('/solver');
      } else {
        setSolveError(data.error || 'The committed color topology is not mathematically solvable. Please check sticker distribution.');
        setIsSolving(false);
      }
    } catch (err) {
      console.error("Solver error:", err);
      setSolveError('Network request or server failure occurred during solving.');
      setIsSolving(false);
    }
  };

  const faceKeys = Object.keys(FACE_LABELS) as (keyof CompleteCubeState)[];
  if (!isScanComplete) return null;

  return (
    <>
      <PageTransition className="w-full flex flex-col gap-5 sm:gap-6 pb-12 px-1 sm:px-0 text-left">
        
        {/* Sleek Back Button */}
        <button
          onClick={() => navigate('/scanner')}
          className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors mb-2 sm:mb-4 w-fit"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Scanner
        </button>

        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Data Calibration</h1>
          <p className="text-slate-500 dark:text-gray-400 text-xs sm:text-sm mt-1.5 leading-relaxed">Review scanned surfaces. Tap colors below to adjust matrices manually.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6 items-start w-full">
          <div className="lg:col-span-2 flex flex-col gap-5 sm:gap-6 w-full">
            <div className="glass-panel p-4 sm:p-6 flex flex-col items-center w-full">
              
              <div className="w-full flex flex-wrap gap-1.5 border-b border-slate-200 dark:border-white/5 pb-4 mb-5">
                {faceKeys.map((face) => (
                  <button
                    key={face} onClick={() => setActiveFace(face)}
                    className={clsx(
                      "px-3.5 py-2 rounded-xl text-xs font-bold font-display tracking-wider transition-all duration-300 min-h-[36px]",
                      activeFace === face ? "bg-primary/20 text-primary border border-primary/30 shadow-md" : "bg-slate-100 dark:bg-white/5 text-slate-500 hover:text-slate-900 dark:hover:text-white border border-transparent"
                    )}
                  >
                    {face} Face
                  </button>
                ))}
              </div>

              <div className="text-left w-full mb-6">
                <h3 className="text-slate-900 dark:text-white font-display font-medium text-base sm:text-lg">Editing: <span className="text-primary font-bold">{FACE_LABELS[activeFace]}</span></h3>
                <p className="text-slate-600 dark:text-gray-400 text-xs mt-1 leading-normal">Tap segments to assign brush. Anchors are locked.</p>
              </div>

              <div className="w-56 h-56 xs:w-64 xs:h-64 sm:w-72 sm:h-72 grid grid-cols-3 grid-rows-3 gap-2 p-2.5 bg-slate-100 dark:bg-black/40 rounded-2xl border border-slate-200 dark:border-white/10 relative">
                {cubeState[activeFace].map((color, index) => {
                  const matchedColor = COLOR_PALETTE.find((p) => p.id === color);
                  const isCenter = index === 4;

                  return (
                    <motion.button
                      key={index} whileHover={!isCenter ? { scale: 1.03 } : {}} whileTap={!isCenter ? { scale: 0.97 } : {}} onClick={() => handleStickerClick(index)}
                      className={clsx("w-full h-full rounded-xl border relative flex items-center justify-center text-xs font-bold transition-all shadow-sm focus:outline-none", isCenter ? "cursor-not-allowed border-white/30" : "border-slate-200 dark:border-white/5 shadow-inner")}
                      style={{ backgroundColor: matchedColor?.hex || '#1E293B' }}
                    >
                      {isCenter && <div className="absolute inset-0 m-auto w-2.5 h-2.5 rounded-full bg-black/30 border border-white/20" />}
                      <span className="mix-blend-difference text-white font-bold text-xs xs:text-sm select-none">{color}</span>
                    </motion.button>
                  );
                })}
              </div>

              <div className="w-full mt-6 border-t border-slate-200 dark:border-white/5 pt-5 flex flex-col items-center">
                <span className="text-[10px] font-bold font-display tracking-widest text-slate-400 dark:text-gray-500 uppercase block mb-3">Brush Tool</span>
                <div className="flex justify-center gap-2 sm:gap-3 flex-wrap max-w-full px-2">
                  {COLOR_PALETTE.map((p) => {
                    const isSelected = selectedColor === p.id;
                    return (
                      <button
                        key={p.id} onClick={() => setSelectedColor(p.id)}
                        className={clsx("w-11 h-11 rounded-xl border-2 transition-all duration-300 relative flex items-center justify-center cursor-pointer min-h-[44px]", isSelected ? `border-primary scale-105 ${p.glow}` : "border-slate-200 dark:border-white/10 hover:scale-103")}
                        style={{ backgroundColor: p.hex }} title={`Select ${p.label}`}
                      >
                        <span className="mix-blend-difference text-white font-bold text-xs">{p.id}</span>
                        {isSelected && <motion.div layoutId="activeIndicator" className="absolute -bottom-1.5 w-3.5 h-1 bg-primary rounded-full" transition={{ type: "spring", stiffness: 300, damping: 20 }} />}
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>
          </div>

          <div className="flex flex-col gap-5 sm:gap-6 w-full">
            <div className="glass-panel p-4 sm:p-6 flex flex-col gap-5 w-full">
              <h3 className="font-display font-bold text-slate-900 dark:text-white text-lg">Validation Pulse</h3>
              
              <AnimatePresence mode="wait">
                {validation.isValid ? (
                  <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="bg-emerald-500/10 border border-emerald-500/20 p-3.5 rounded-xl flex items-start gap-2.5 text-left">
                    <CheckCircle2 className="w-4 h-4 sm:w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <h4 className="text-xs sm:text-sm font-bold text-emerald-400">Topology Confirmed</h4>
                      <p className="text-[11px] text-slate-600 dark:text-gray-400 mt-1 leading-normal">Puzzle geometry balanced. System confirmed complete matrices paths.</p>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="bg-red-500/10 border border-red-500/20 p-3.5 rounded-xl flex items-start gap-2.5 text-left">
                    <AlertTriangle className="w-4 h-4 sm:w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <h4 className="text-xs sm:text-sm font-bold text-red-400">Invalid Metrics Setup</h4>
                      <p className="text-[11px] text-slate-600 dark:text-gray-400 mt-1 leading-normal">{validation.errorMsg || 'Sticker metrics imbalance parsed.'}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-3.5 border-t border-slate-200 dark:border-white/5 pt-4 text-left w-full">
                <span className="text-[10px] font-bold font-display tracking-widest text-slate-400 dark:text-gray-500 uppercase block mb-1">Densities Check (Requires 9)</span>
                {COLOR_PALETTE.map((p) => {
                  const count = validation.colorCounts[p.id] || 0;
                  const percent = Math.min((count / 9) * 100, 100);
                  const isErroneous = count !== 9;

                  return (
                    <div key={p.id} className="space-y-1 w-full">
                      <div className="flex justify-between text-xs font-medium">
                        <span className="text-slate-600 dark:text-gray-300 flex items-center gap-2 text-[11px]"><div className="w-2.5 h-2.5 rounded-sm border border-slate-200 dark:border-white/10" style={{ backgroundColor: p.hex }} />{p.label}</span>
                        <span className={clsx("font-mono font-bold text-[11px]", isErroneous ? "text-red-400" : "text-emerald-400")}>{count} / 9</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${percent}%` }} className={clsx("h-full rounded-full", isErroneous ? "bg-red-500" : "bg-emerald-500")} transition={{ type: "spring", stiffness: 80 }} />
                      </div>
                    </div>
                  );
                })}
              </div>

              {solveError && (
                <div className="bg-red-500/10 border border-red-500/20 p-3.5 rounded-xl flex items-start gap-2.5 mt-2 text-left">
                  <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-slate-600 dark:text-gray-400 leading-normal">{solveError}</p>
                </div>
              )}

              <div className="flex flex-col gap-3 mt-2 border-t border-slate-200 dark:border-white/5 pt-4 w-full">
                <Button variant="glow" onClick={handleCommit} disabled={!validation.isValid || isSolving} className="w-full h-11 min-h-[44px] text-xs font-bold uppercase tracking-wider justify-center gap-2">
                  {isSolving ? <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Resolving...</> : <><Save className="w-3.5 h-3.5" /> Commit Configurations</>}
                </Button>
                <Button variant="secondary" onClick={handleReset} disabled={isSolving} className="w-full h-11 min-h-[44px] text-xs font-bold uppercase tracking-wider justify-center gap-2 border-slate-200 dark:border-white/10 text-slate-500 hover:text-slate-900 dark:hover:text-white">
                  <RotateCcw className="w-3.5 h-3.5" /> Discard Updates
                </Button>
              </div>
            </div>
          </div>
        </div>
      </PageTransition>

      {/* PORTAL RENDERING - Teleports the blur directly to the body, bypassing Framer Motion constraints */}
      {isSolving && createPortal(
        <div 
          className="fixed inset-0 w-screen h-screen bg-white/60 dark:bg-black/80 backdrop-blur-md z-[9999] flex flex-col items-center justify-center gap-4 p-4 text-center overflow-hidden"
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
        >
          <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin shadow-[0_0_20px_rgba(59,130,246,0.6)]" />
          <h3 className="font-display text-xl font-bold text-slate-900 dark:text-white tracking-wide">Processing Matrix...</h3>
          <p className="text-slate-600 dark:text-gray-400 text-xs font-mono">RESOLVING ALGEBRAIC KOCIEMBA NODES</p>
        </div>,
        document.body
      )}
    </>
  );
}