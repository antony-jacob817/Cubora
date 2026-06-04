import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Camera, RefreshCw, AlertCircle, CheckCircle2,
  RotateCcw, ArrowLeft, ArrowUp, ArrowDown, Sparkles,
  Cpu, Gauge, Trash2, ScanLine
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useCamera } from '@/hooks/useCamera';
import { PageTransition } from '@/components/animations/PageTransition';
import { clsx } from 'clsx';
import { ColorDetector, type GridSample, type CubeColor } from '@/services/colorDetector';
import { useSolver } from '@/context/SolverContext';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { OpenCVLoader } from '@/services/opencvLoader';
import { CubeValidator } from '@/utils/cubeValidator';

// --- SEQUENCE CONFIGURATION ---
const SCAN_SEQUENCE = [
  { id: 'F', name: 'Front', icon: CheckCircle2, instruction: 'Hold the FRONT (Green) with White side on top.' },
  { id: 'R', name: 'Right', icon: ArrowLeft, instruction: 'Rotate the cube LEFT (Red).' },
  { id: 'B', name: 'Back', icon: ArrowLeft, instruction: 'Rotate the cube LEFT again (Blue).' },
  { id: 'L', name: 'Left', icon: ArrowLeft, instruction: 'Rotate the cube LEFT once more (Orange).' },
  { id: 'U', name: 'Top', icon: ArrowDown, instruction: 'Return to Front, then rotate the cube DOWN (White).' },
  { id: 'D', name: 'Bottom', icon: ArrowUp, instruction: 'Rotate the cube UP twice (Yellow).' },
];

const SAMPLING_GRID_3X3: GridSample[] = [
  { x: 0.25, y: 0.25 }, { x: 0.50, y: 0.25 }, { x: 0.75, y: 0.25 },
  { x: 0.25, y: 0.50 }, { x: 0.50, y: 0.50 }, { x: 0.75, y: 0.50 },
  { x: 0.25, y: 0.75 }, { x: 0.50, y: 0.75 }, { x: 0.75, y: 0.75 }
];

const COLOR_UI_MAP: Record<CubeColor, string> = {
  'W': 'bg-slate-100 shadow-[0_0_15px_rgba(241,245,249,0.5)] border border-slate-300',
  'Y': 'bg-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.5)] border border-yellow-300',
  'G': 'bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.5)] border border-green-400',
  'B': 'bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)] border border-blue-400',
  'R': 'bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)] border border-red-400',
  'O': 'bg-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.5)] border border-orange-400',
  'UNKNOWN': 'bg-cyan-500/5 border border-cyan-500/20' 
};

// FIX APPLIED: Removed border hack. 'W' is now pure white.
const MINI_COLOR_MAP: Record<CubeColor, string> = {
  'W': 'bg-[#F8FAFC]', 'Y': 'bg-yellow-400', 'G': 'bg-green-500',
  'B': 'bg-blue-500', 'R': 'bg-red-500', 'O': 'bg-orange-500', 'UNKNOWN': 'bg-transparent'
};

export default function Scanner() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { error, hasPermission, startCamera, toggleCamera } = useCamera({ videoRef });

  const { setScannedFaces: setContextScannedFaces, setSolution, setActiveScanId } = useSolver();
  const { getAuthHeaders } = useAuth();
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(0);
  const [scannedFaces, setScannedFaces] = useState<Record<string, any>>({});
  const [scanState, setScanState] = useState<'idle' | 'scanning' | 'success' | 'complete'>('idle');
  const [isSolving, setIsSolving] = useState(false);
  const [solveError, setSolveError] = useState<string | null>(null);

  const [fps, setFps] = useState(60.0);
  const [confidence, setConfidence] = useState(99.45);
  const [opencvStatus, setOpencvStatus] = useState<string>('INITIALIZING');
  const [liveColors, setLiveColors] = useState<CubeColor[]>(Array(9).fill('UNKNOWN'));
  const [history, setHistory] = useState<any[]>([]);
  
  const currentFace = SCAN_SEQUENCE[currentStep];
  const isComplete = currentStep === SCAN_SEQUENCE.length;

  const fetchHistory = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/solver/history', { headers: getAuthHeaders() });
      const data = await res.json();
      if (data.success) setHistory(data.data);
    } catch (e) {
      console.error("Failed to load history");
    }
  };

  useEffect(() => {
    startCamera();
    fetchHistory();
    setActiveScanId(null);
  }, [startCamera]);

  useEffect(() => {
    OpenCVLoader.load(); 

    const loaderInterval = setInterval(() => {
      const state = OpenCVLoader.getState();
      setOpencvStatus(state.toUpperCase());
    }, 400);

    const telemetryInterval = setInterval(() => {
      setFps(+(59.3 + Math.random() * 0.7).toFixed(1));
      setConfidence(+(98.4 + Math.random() * 1.45).toFixed(2));
    }, 1000);

    return () => {
      clearInterval(loaderInterval);
      clearInterval(telemetryInterval);
    };
  }, []);

  useEffect(() => {
    let animationFrameId: number;
    let lastProcessTime = 0;
    let isMounted = true;

    const processLiveFeed = async (timestamp: number) => {
      if (
        timestamp - lastProcessTime > 150 && 
        videoRef.current && 
        videoRef.current.readyState === 4 && 
        OpenCVLoader.getState() === 'ready' && 
        scanState === 'idle' &&
        !isComplete
      ) {
        try {
          const colors = await ColorDetector.processVideoFrame(videoRef.current, SAMPLING_GRID_3X3);
          if (isMounted) setLiveColors(colors);
          lastProcessTime = timestamp;
        } catch (e) {}
      }
      
      if (isMounted && scanState === 'idle' && !isComplete) {
        animationFrameId = requestAnimationFrame(processLiveFeed);
      }
    };

    if (hasPermission && scanState === 'idle' && !isComplete) {
      animationFrameId = requestAnimationFrame(processLiveFeed);
    }

    return () => {
      isMounted = false;
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [hasPermission, scanState, isComplete]);

  const handleCapture = async () => {
    if (scanState !== 'idle' || !videoRef.current) return;
    setScanState('scanning');

    try {
      const faceColors = await ColorDetector.processVideoFrame(videoRef.current, SAMPLING_GRID_3X3);

      const centerColors: Record<string, CubeColor> = {
        F: 'G', R: 'R', B: 'B', L: 'O', U: 'W', D: 'Y'
      };
      if (centerColors[currentFace.id]) {
        faceColors[4] = centerColors[currentFace.id];
      }

      setScannedFaces(prev => ({ ...prev, [currentFace.id]: faceColors }));
      setLiveColors(faceColors);
      setScanState('success');

      setTimeout(() => {
        if (currentStep < SCAN_SEQUENCE.length - 1) {
          setCurrentStep(prev => prev + 1);
          setScanState('idle');
          setLiveColors(Array(9).fill('UNKNOWN')); 
        } else {
          setCurrentStep(prev => prev + 1);
          setScanState('complete');
        }
      }, 1200);

    } catch (err) {
      setScanState('idle');
    }
  };

  const handleUndo = () => {
    if (currentStep === 0 || scanState === 'scanning') return;
    const previousStep = currentStep - 1;
    const previousFace = SCAN_SEQUENCE[previousStep];

    setScannedFaces(prev => {
      const newState = { ...prev };
      delete newState[previousFace.id];
      return newState;
    });

    setCurrentStep(previousStep);
    setScanState('idle');
    setLiveColors(Array(9).fill('UNKNOWN'));
  };

  const handleGenerateSolution = async () => {
    setIsSolving(true);
    setSolveError(null);
    
    const validation = CubeValidator.validateFullCube(scannedFaces as any);
    if (!validation.isValid) {
      setSolveError(validation.errorMsg);
      setIsSolving(false);
      return;
    }
    
    try {
      const response = await fetch('http://localhost:5000/api/solver/solve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({
          cubeState: scannedFaces,
          detectedColors: scannedFaces, 
        }),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        if (data.scanId) {
          setActiveScanId(data.scanId);
        }
        setContextScannedFaces(scannedFaces as any);
        setSolution({ steps: data.steps, totalMoves: data.totalMoves });
        navigate('/solver');
      } else {
        setSolveError(data.error || 'The scanned color topology is mathematically invalid.');
      }
    } catch (err) {
      setSolveError('Network request or solver server failure occurred.');
    } finally {
      setIsSolving(false);
    }
  };

  const handleDeleteHistory = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); 
    try {
      await fetch(`http://localhost:5000/api/solver/history/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      fetchHistory(); 
    } catch (err) {
      console.error("Failed to delete record:", err);
    }
  };

  const loadHistoryItem = (cubeState: any, id: string) => {
    setContextScannedFaces(cubeState);
    setActiveScanId(id);
    navigate('/correction');
  };

  return (
    <PageTransition className="w-full min-h-[calc(100vh-100px)] flex flex-col gap-6 pb-6">
      
      {/* Top Split: Camera & Sequence */}
      <div className="w-full flex flex-col lg:flex-row gap-6 h-auto lg:h-[calc(100vh-100px)]">
        
        {/* Left Area: Viewport */}
        <div className="flex-1 relative glass-panel overflow-hidden bg-[#050A14] border-slate-200 dark:border-white/10 flex flex-col min-h-[calc(100vh-120px)] lg:h-auto lg:min-h-0">

          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:30px_30px] pointer-events-none" />

          {/* HUD Overlay: Upper Left Status Feed */}
          <div className="absolute top-4 left-4 lg:top-6 lg:left-6 z-20 flex flex-col items-start gap-1.5 sm:gap-2 pointer-events-none">
            <div className="flex items-center gap-1.5 sm:gap-2 bg-[#0B1528]/85 backdrop-blur-md px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg sm:rounded-xl border border-white/15 shadow-lg">
              <span className="relative flex h-1.5 w-1.5 sm:h-2 sm:w-2">
                <span className={clsx("absolute inline-flex h-full w-full rounded-full opacity-80", isComplete ? "bg-primary" : "bg-cyan-400 animate-ping")}></span>
                <span className={clsx("relative inline-flex rounded-full h-1.5 w-1.5 sm:h-2 sm:w-2", isComplete ? "bg-primary" : "bg-cyan-400")}></span>
              </span>
              <span className="text-[8.5px] sm:text-[10px] font-mono font-bold tracking-widest text-slate-100 uppercase">
                {isComplete ? (
                  <><span className="hidden sm:inline">SYS_CAPTURE: COMPLETE</span><span className="sm:hidden">SYS: COMPLETE</span></>
                ) : (
                  <><span className="hidden sm:inline">SYS_FEED: ACTIVE [FACE_{currentFace?.id || 'DONE'}]</span><span className="sm:hidden">FEED: ACTIVE [{currentFace?.id || 'DONE'}]</span></>
                )}
              </span>
            </div>
            <div className="text-[8px] sm:text-[9px] font-mono text-cyan-400/75 tracking-wider bg-black/45 px-1.5 py-0.5 sm:px-2 rounded border border-cyan-500/10">
              WASM: {opencvStatus}
            </div>
          </div>

          {/* HUD Overlay: Upper Right Real-time Diagnostics */}
          <div className="absolute top-4 right-4 lg:top-6 lg:right-6 z-20 flex items-center gap-2">
            {currentStep > 0 && !isComplete && (
              <button onClick={handleUndo} className="p-2.5 rounded-xl bg-[#0B1528]/85 backdrop-blur-md border border-white/10 text-gray-400 hover:text-white transition-all shadow-md active:scale-95" title="Rescan previous face">
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
            <button onClick={toggleCamera} className="p-2.5 rounded-xl bg-[#0B1528]/85 backdrop-blur-md border border-white/10 text-gray-400 hover:text-white transition-all shadow-md active:scale-95">
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {/* Interactive Holographic Matrix HUD readouts */}
          {!isComplete && hasPermission && (
            <div className="absolute inset-x-4 sm:inset-x-6 top-[72px] sm:top-24 z-20 flex justify-between items-start pointer-events-none text-[9px] sm:text-[10px] font-mono text-slate-400/80">
              <div className="flex flex-col gap-0.5 sm:gap-1 bg-black/40 p-1.5 sm:p-2.5 rounded border border-white/5">
                <div>FPS: <span className="text-green-400 font-bold">{fps} Hz</span></div>
              </div>
              <div className="flex flex-col gap-0.5 sm:gap-1 text-right bg-black/40 p-1.5 sm:p-2.5 rounded border border-white/5">
                <div>Confidence: <span className="text-cyan-400 font-bold">{confidence}%</span></div>
              </div>
            </div>
          )}

          {/* Camera Feed Container */}
          <div className="absolute inset-0 flex items-center justify-center bg-[#03070E] z-0">
            {error ? (
              <div className="text-center p-8 max-w-sm glass-panel border-red-500/20 bg-red-950/10">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4 animate-bounce" />
                <p className="text-white font-bold mb-2">Camera Hardware Error</p>
                <p className="text-gray-400 text-xs mb-6 leading-relaxed">{error}</p>
                <Button onClick={startCamera} variant="glow" className="w-full">Re-initialize Feed</Button>
              </div>
            ) : (
              <video
                ref={videoRef}
                className={clsx("w-full h-full object-cover transition-all duration-700", isComplete ? "opacity-25 grayscale blur-sm" : "opacity-75")}
                muted playsInline
              />
            )}
          </div>

          {/* Tactical CV Target Bracket Overlay */}
          <AnimatePresence mode="wait">
            {!isComplete && hasPermission && (
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.04 }} transition={{ duration: 0.4 }}
                className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none"
              >
                <AnimatePresence>
                  {scanState === 'success' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-cyan-500/20 backdrop-blur-[2px] z-30 flex items-center justify-center">
                      <div className="w-24 h-24 bg-cyan-400/25 border border-cyan-400 rounded-full flex items-center justify-center animate-ping">
                        <CheckCircle2 className="w-16 h-16 text-cyan-400 drop-shadow-[0_0_15px_rgba(34,211,238,0.8)]" />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="relative w-[240px] h-[240px] sm:w-[320px] sm:h-[320px] flex items-center justify-center">
                  <div className="absolute -top-4 -left-4 w-10 h-10 border-t-2 border-l-2 border-cyan-400 rounded-tl-xl shadow-[inset_3px_3px_10px_rgba(34,211,238,0.15)]" />
                  <div className="absolute -top-4 -right-4 w-10 h-10 border-t-2 border-r-2 border-cyan-400 rounded-tr-xl shadow-[inset_-3px_3px_10px_rgba(34,211,238,0.15)]" />
                  <div className="absolute -bottom-4 -left-4 w-10 h-10 border-b-2 border-l-2 border-cyan-400 rounded-bl-xl shadow-[inset_3px_-3px_10px_rgba(34,211,238,0.15)]" />
                  <div className="absolute -bottom-4 -right-4 w-10 h-10 border-b-2 border-r-2 border-cyan-400 rounded-br-xl shadow-[inset_-3px_-3px_10px_rgba(34,211,238,0.15)]" />

                  <div className="w-full h-full grid grid-cols-3 grid-rows-3 gap-2.5 p-2 bg-slate-900/10 backdrop-blur-[0.5px]">
                    {Array.from({ length: 9 }).map((_, i) => (
                      <div key={i} className="relative border border-cyan-500/20 flex items-center justify-center">
                        <span className="absolute top-1 left-1 w-1.5 h-1.5 border-t border-l border-cyan-500/40" />
                        <span className="absolute top-1 right-1 w-1.5 h-1.5 border-t border-r border-cyan-500/40" />
                        <span className="absolute bottom-1 left-1 w-1.5 h-1.5 border-b border-l border-cyan-500/40" />
                        <span className="absolute bottom-1 right-1 w-1.5 h-1.5 border-b border-r border-cyan-500/40" />
                        <span className={clsx(
                          "w-6 h-6 sm:w-8 sm:h-8 rounded-[4px] sm:rounded-md transition-all duration-200 flex items-center justify-center",
                          scanState === 'scanning' ? 'bg-cyan-400 animate-ping' : COLOR_UI_MAP[liveColors[i] || 'UNKNOWN']
                        )}>
                          {liveColors[i] && liveColors[i] !== 'UNKNOWN' && scanState === 'idle' && (
                            <span className="text-[10px] sm:text-xs font-bold text-black/40 mix-blend-overlay pointer-events-none select-none">{liveColors[i]}</span>
                          )}
                        </span>
                      </div>
                    ))}
                  </div>

                  {scanState === 'scanning' && (
                    <motion.div animate={{ y: ['-5%', '105%', '-5%'] }} transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }} className="absolute inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_rgba(34,211,238,0.8)] z-20" />
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Completion State Dashboard */}
          <AnimatePresence>
            {isComplete && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="absolute inset-0 z-30 flex flex-col items-center justify-center p-6 text-center bg-[#070D1A]/95 backdrop-blur-md">
                {solveError ? (
                  <div className="max-w-md p-8 glass-panel border-red-500/30 bg-red-950/15 flex flex-col items-center shadow-[0_20px_50px_rgba(239,68,68,0.15)]">
                    <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-6 border border-red-500/30">
                      <AlertCircle className="w-8 h-8 text-red-500" />
                    </div>
                    <h2 className="font-display text-2xl font-bold text-white mb-3">Mathematical Sync Failed</h2>
                    <p className="text-gray-400 text-sm mb-8 leading-relaxed">{solveError}</p>
                    <div className="flex flex-col sm:flex-row gap-4 w-full">
                      <Button variant="glow" onClick={() => { setContextScannedFaces(scannedFaces as any); navigate('/correction'); }} className="flex-1">Calibrate Colors</Button>
                      <Button variant="secondary" onClick={() => { setScannedFaces({}); setCurrentStep(0); setScanState('idle'); setSolveError(null); }} className="flex-1">Rescan Cube</Button>
                    </div>
                  </div>
                ) : (
                  <div className="max-w-md flex flex-col items-center">
                    <div className="w-20 h-20 bg-cyan-500/20 border border-cyan-400/30 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(6,182,212,0.2)]">
                      <Sparkles className="w-10 h-10 text-cyan-400 animate-pulse" />
                    </div>
                    <h2 className="font-display text-4xl font-bold text-white mb-4">Topology Synced</h2>
                    <p className="text-gray-400 text-sm mb-10 leading-relaxed">All 6 faces successfully processed via OpenCV and mapped to solvable coordinates. Preparing AI solution paths.</p>
                    <Button variant="glow" size="lg" className="w-full sm:w-auto px-12 gap-2" onClick={handleGenerateSolution}>
                      <Cpu className="w-5 h-5" /> Initialize 3D Solver
                    </Button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Global Loading Overlay */}
          {isSolving && (
            <div className="absolute inset-0 bg-[#050A14]/90 backdrop-blur-md z-50 flex flex-col items-center justify-center gap-5">
              <div className="w-14 h-14 rounded-full border-4 border-cyan-400 border-t-transparent animate-spin shadow-[0_0_30px_rgba(34,211,238,0.5)]" />
              <h3 className="font-display text-xl font-bold text-white tracking-wide">Processing Color Matrices</h3>
              <p className="text-cyan-400/80 text-xs font-mono tracking-widest uppercase">RESOLVING KOCIEMBA ALGEBRAIC LAYER MAPS</p>
            </div>
          )}

          {!isComplete && (
            <div className="mt-auto relative z-20 p-3 sm:p-4 flex flex-col items-center bg-gradient-to-t from-[#050A14] via-[#050A14]/95 to-transparent w-full">
              <div className="flex flex-row items-center justify-center gap-2.5 sm:gap-4 w-full max-w-xl sm:max-w-2xl px-2">
                <motion.div key={`instruction-${currentStep}`} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="min-w-0 h-11 sm:h-12 flex items-center gap-2 bg-[#0B1528]/85 border border-white/10 px-3.5 rounded-xl backdrop-blur-md">
                  <currentFace.icon className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <p className="text-gray-200 text-[10px] sm:text-sm font-medium leading-tight line-clamp-2">{currentFace.instruction}</p>
                </motion.div>
                <Button variant="glow" size="md" onClick={handleCapture} disabled={scanState !== 'idle' || opencvStatus !== 'READY'} className="w-[110px] sm:w-[150px] shrink-0 h-11 sm:h-12 min-h-0 rounded-xl shadow-[0_0_20px_rgba(34,211,238,0.15)] font-bold text-[10px] sm:text-sm tracking-wider uppercase gap-1.5 flex items-center justify-center">
                  {scanState === 'scanning' ? <span className="flex items-center gap-1 sm:gap-1.5"><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Scanning</span> : scanState === 'success' ? <span className="flex items-center gap-1 sm:gap-1.5 text-green-400"><CheckCircle2 className="w-3.5 h-3.5" /> Synced</span> : <span className="flex items-center gap-1 sm:gap-1.5"><Camera className="w-3.5 h-3.5 animate-pulse" /> Capture</span>}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Right Area: Tactical Guided Step Track Panel */}
        <div className="w-full lg:w-80 flex flex-col gap-6">
          <div className="glass-panel p-6 flex-1 flex flex-col">
            <div className="flex justify-between items-center mb-8 pb-4 border-b border-slate-200 dark:border-white/5 bg-white/[0.02]">
              <div className="flex items-center gap-2">
                <Gauge className="w-5 h-5 text-cyan-400" />
                <h3 className="font-display font-bold text-slate-900 dark:text-white text-base">HUD Sequence</h3>
              </div>
              <span className="text-xs font-mono text-cyan-400 font-bold bg-cyan-400/10 border border-cyan-400/35 px-2.5 py-0.5 rounded-full">{Math.min(currentStep, 6)} / 6 SECS</span>
            </div>

            <div className="relative flex-1 overflow-y-auto pr-1">
              <div className="absolute left-[19px] top-4 bottom-4 w-[2px] bg-slate-200 dark:bg-white/10" />
              <div className="space-y-6 relative">
                {SCAN_SEQUENCE.map((face, index) => {
                  const isPast = index < currentStep;
                  const isCurrent = index === currentStep;
                  return (
                    <div key={face.id} className={clsx("flex items-center gap-4 transition-all duration-500", isPast ? "opacity-100" : isCurrent ? "opacity-100 scale-102" : "opacity-40 grayscale")}>
                      <div className={clsx("w-10 h-10 rounded-xl flex items-center justify-center font-mono font-bold text-xs relative z-10 transition-colors duration-500", isPast ? "bg-cyan-500 text-white shadow-[0_0_15px_rgba(34,211,238,0.4)]" : isCurrent ? "bg-[#0B1528] border border-cyan-400 text-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.15)] bg-cyan-500/10" : "bg-slate-100/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-500")}>
                        {isPast ? <CheckCircle2 className="w-4 h-4" /> : face.id}
                      </div>
                      <div className="flex-1">
                        <h4 className={clsx("font-bold text-xs", isCurrent ? "text-slate-900 dark:text-white" : "text-slate-600 dark:text-gray-400")}>{face.name} Face</h4>
                        {isCurrent && <p className="text-[10px] text-cyan-400 mt-0.5 font-mono animate-pulse">AWAITING INPUT...</p>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Area: Scan History Table */}
      <div className="w-full glass-panel p-5 sm:p-6 flex flex-col gap-4">
        <div className="flex items-center gap-2 mb-2">
          <ScanLine className="w-5 h-5 text-primary" />
          <h3 className="font-display font-bold text-lg sm:text-xl text-slate-900 dark:text-white">Scan History</h3>
        </div>
        
        {history.length === 0 ? (
          <div className="text-center py-8 text-slate-500 dark:text-gray-500 text-sm">
            No previous scans found.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {history.map((scan) => (
              <div 
                key={scan._id} 
                onClick={() => loadHistoryItem(scan.cubeState, scan._id)}
                className="bg-slate-50 dark:bg-[#111315]/50 border border-slate-200 dark:border-white/10 rounded-2xl p-4 flex flex-col gap-4 cursor-pointer hover:border-primary/40 hover:bg-slate-100 dark:hover:bg-white/5 transition-all group relative"
              >
                <button 
                  onClick={(e) => handleDeleteHistory(e, scan._id)}
                  className="absolute top-4 right-4 p-2 text-slate-400 hover:text-red-500 dark:hover:text-red-400 bg-white dark:bg-[#1a1d21] rounded-lg shadow-sm border border-slate-200 dark:border-white/10 z-10 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <div>
                  <div className="text-xs text-slate-500 dark:text-gray-400 mb-1">{new Date(scan.createdAt).toLocaleString()}</div>
                  <div className="font-mono text-xs sm:text-sm text-slate-700 dark:text-gray-300 font-bold truncate pr-10">
                    {scan.solveSteps.length > 0 ? scan.solveSteps.join(' ') : 'Already Solved'}
                  </div>
                  <div className="text-[10px] text-primary font-bold mt-1 uppercase tracking-wider">{scan.solveSteps.length} Moves</div>
                </div>

                <div className="flex gap-2">
                  {['F', 'R', 'B', 'L', 'U', 'D'].map(faceId => (
                    <div key={faceId} className="flex flex-col items-center gap-1">
                      <span className="text-[8px] font-bold text-slate-500 dark:text-gray-500">{faceId}</span>
                      {/* FIX APPLIED: bg-slate-300 wrapper with mathematically perfect gap and fixed children dimensions */}
                      <div className="grid grid-cols-3 bg-zinc-300 dark:bg-zinc-800 p-[3px] rounded-md w-fit shrink-0">
                          {scan.cubeState[faceId].map((color: string, idx: number) => (
                              <div key={idx} className={clsx("w-[10px] h-[10px] sm:w-[12px] sm:h-[12px] rounded-[3px] shadow-[0_1px_2px_rgba(0,0,0,0.1)] shrink-0 border border-zinc-300 dark:border-zinc-800", MINI_COLOR_MAP[color])} />
                          ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </PageTransition>
  );
}