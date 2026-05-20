import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Camera, RefreshCw, AlertCircle, CheckCircle2, 
  RotateCcw, ArrowLeft, ArrowUp, ArrowDown, Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useCamera } from '@/hooks/useCamera';
import { PageTransition } from '@/components/animations/PageTransition';
import { clsx } from 'clsx';
import { ColorDetector, type GridSample } from '@/services/colorDetector';

// --- SEQUENCE CONFIGURATION ---
const SCAN_SEQUENCE = [
  { id: 'F', name: 'Front', icon: CheckCircle2, instruction: 'Hold the cube directly facing the camera.' },
  { id: 'R', name: 'Right', icon: ArrowLeft, instruction: 'Rotate the entire cube to the LEFT to scan the Right face.' },
  { id: 'B', name: 'Back', icon: ArrowLeft, instruction: 'Rotate the cube LEFT again to scan the Back face.' },
  { id: 'L', name: 'Left', icon: ArrowLeft, instruction: 'Rotate the cube LEFT once more to scan the Left face.' },
  { id: 'U', name: 'Top', icon: ArrowDown, instruction: 'Return to Front, then rotate the cube DOWN to scan the Top face.' },
  { id: 'D', name: 'Bottom', icon: ArrowUp, instruction: 'Rotate the cube UP twice to scan the Bottom face.' },
];

const SAMPLING_GRID_3X3: GridSample[] = [
  { x: 0.25, y: 0.25 }, { x: 0.50, y: 0.25 }, { x: 0.75, y: 0.25 },
  { x: 0.25, y: 0.50 }, { x: 0.50, y: 0.50 }, { x: 0.75, y: 0.50 },
  { x: 0.25, y: 0.75 }, { x: 0.50, y: 0.75 }, { x: 0.75, y: 0.75 }
];

export default function Scanner() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { error, hasPermission, startCamera, toggleCamera } = useCamera({ videoRef });

  // --- STATE MACHINE ---
  const [currentStep, setCurrentStep] = useState(0);
  const [scannedFaces, setScannedFaces] = useState<Record<string, any>>({});
  const [scanState, setScanState] = useState<'idle' | 'scanning' | 'success' | 'complete'>('idle');

  // Start camera automatically
  useEffect(() => {
    startCamera();
  }, [startCamera]);

  const currentFace = SCAN_SEQUENCE[currentStep];
  const isComplete = currentStep === SCAN_SEQUENCE.length;

  // --- ACTIONS ---
  // --- ACTIONS ---
  const handleCapture = async () => {
    if (scanState !== 'idle' || !videoRef.current) return;
    
    setScanState('scanning');
    
    try {
      // 1. Pass the real video element and the 3x3 tracking coordinate markers
      const faceColors = await ColorDetector.processVideoFrame(videoRef.current, SAMPLING_GRID_3X3);
      console.log(`Extracted Pattern for ${currentFace.id} face:`, faceColors);

      // 2. Save the real matrix data mapping into your state object
      setScannedFaces(prev => ({
        ...prev,
        [currentFace.id]: faceColors // Storing the actual ['W', 'R', 'G', ...] array
      }));
      
      setScanState('success');
      
      // Auto-advance after brief success message animation
      setTimeout(() => {
        if (currentStep < SCAN_SEQUENCE.length - 1) {
          setCurrentStep(prev => prev + 1);
          setScanState('idle');
        } else {
          setCurrentStep(prev => prev + 1);
          setScanState('complete');
        }
      }, 1500);
      return faceColors;

    } catch (err) {
      console.error("OpenCV image parsing processing failure pipeline thread exception:", err);
      return null;
    }
  };

  const handleUndo = () => {
    if (currentStep === 0 || scanState === 'scanning') return;
    
    const previousStep = currentStep - 1;
    const previousFace = SCAN_SEQUENCE[previousStep];
    
    // Remove the previous face from state
    setScannedFaces(prev => {
      const newState = { ...prev };
      delete newState[previousFace.id];
      return newState;
    });
    
    setCurrentStep(previousStep);
    setScanState('idle');
  };

  const handleGenerateSolution = () => {
    // Here you would send `scannedFaces` to your backend Engine
    console.log("Generating solution for:", scannedFaces);
  };

  return (
    <PageTransition className="h-[calc(100vh-100px)] w-full flex flex-col lg:flex-row gap-6 pb-6">
      
      {/* Left Area: Camera & Guided Overlay */}
      <div className="flex-1 relative glass-panel overflow-hidden bg-black/50 border-white/10 flex flex-col">
        
        {/* Top Status & Controls */}
        <div className="absolute top-6 left-6 z-20 flex items-center gap-4">
          <div className="flex items-center gap-2 bg-background/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
            <span className="relative flex h-2 w-2">
              <span className={clsx("absolute inline-flex h-full w-full rounded-full opacity-75", isComplete ? "bg-primary" : "bg-tertiary animate-ping")}></span>
              <span className={clsx("relative inline-flex rounded-full h-2 w-2", isComplete ? "bg-primary" : "bg-tertiary")}></span>
            </span>
            <span className="text-xs font-bold tracking-wider text-white">
              {isComplete ? 'SCAN COMPLETE' : 'LIVE FEED'}
            </span>
          </div>
        </div>

        <div className="absolute top-6 right-6 z-20 flex gap-2">
          {currentStep > 0 && !isComplete && (
            <button 
              onClick={handleUndo}
              className="p-3 rounded-full bg-background/80 backdrop-blur-md border border-white/10 text-gray-400 hover:text-white transition-colors"
              title="Rescan previous face"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          )}
          <button 
            onClick={toggleCamera}
            className="p-3 rounded-full bg-background/80 backdrop-blur-md border border-white/10 text-gray-400 hover:text-white transition-colors"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>

        {/* Camera Video Element */}
        <div className="absolute inset-0 flex items-center justify-center bg-black">
          {error ? (
            <div className="text-center p-6">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <p className="text-white font-medium mb-2">Camera Error</p>
              <p className="text-gray-400 text-sm mb-4">{error}</p>
              <Button onClick={startCamera} variant="secondary">Try Again</Button>
            </div>
          ) : (
            <video 
              ref={videoRef}
              className={clsx(
                "w-full h-full object-cover transition-opacity duration-700",
                isComplete ? "opacity-30 grayscale" : "opacity-80"
              )}
              muted
              playsInline
            />
          )}
        </div>

        {/* Dynamic Overlay System */}
        <AnimatePresence mode="wait">
          {!isComplete && hasPermission && (
            <motion.div 
              key={currentStep}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.4 }}
              className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none"
            >
              {/* Scan Success Flash */}
              <AnimatePresence>
                {scanState === 'success' && (
                  <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-primary/20 backdrop-blur-sm z-30 flex items-center justify-center"
                  >
                    <CheckCircle2 className="w-24 h-24 text-primary drop-shadow-[0_0_15px_rgba(59,130,246,0.8)]" />
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="relative w-[280px] h-[280px] sm:w-[320px] sm:h-[320px]">
                {/* Corner Brackets */}
                <div className="absolute -top-4 -left-4 w-8 h-8 border-t-2 border-l-2 border-white/50 rounded-tl-lg" />
                <div className="absolute -top-4 -right-4 w-8 h-8 border-t-2 border-r-2 border-white/50 rounded-tr-lg" />
                <div className="absolute -bottom-4 -left-4 w-8 h-8 border-b-2 border-l-2 border-white/50 rounded-bl-lg" />
                <div className="absolute -bottom-4 -right-4 w-8 h-8 border-b-2 border-r-2 border-white/50 rounded-br-lg" />

                <div className="w-full h-full grid grid-cols-3 grid-rows-3 gap-1 p-1">
                  {Array.from({ length: 9 }).map((_, i) => (
                    <div key={i} className={clsx(
                      "border bg-background/10 backdrop-blur-[1px] transition-colors duration-300",
                      scanState === 'scanning' ? 'border-primary/50 bg-primary/10' : 'border-white/20'
                    )} />
                  ))}
                </div>

                {scanState === 'scanning' && (
                  <motion.div 
                    animate={{ y: ['0%', '100%', '0%'] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                    className="absolute top-0 left-0 w-full h-[3px] bg-tertiary shadow-[0_0_20px_rgba(6,182,212,1)] z-20"
                  />
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Completion State UI */}
        <AnimatePresence>
          {isComplete && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute inset-0 z-30 flex flex-col items-center justify-center p-6 text-center"
            >
              <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mb-6">
                <Sparkles className="w-10 h-10 text-primary" />
              </div>
              <h2 className="font-display text-4xl font-bold text-white mb-4">Cube Captured</h2>
              <p className="text-gray-300 max-w-md mb-8">All 6 faces have been successfully scanned and validated. Ready to generate the optimal solution.</p>
              <Button variant="glow" size="lg" className="px-12" onClick={handleGenerateSolution}>
                Initialize 3D Solver
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom Instructional Area */}
        {!isComplete && (
          <div className="mt-auto relative z-20 p-6 lg:p-8 flex flex-col items-center bg-gradient-to-t from-background via-background/90 to-transparent">
            
            {/* Dynamic Instruction */}
            <motion.div 
              key={`instruction-${currentStep}`}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 bg-white/5 border border-white/10 px-6 py-3 rounded-2xl mb-6 backdrop-blur-md"
            >
              <currentFace.icon className="w-5 h-5 text-tertiary animate-pulse" />
              <p className="text-white text-sm lg:text-base font-medium">
                {currentFace.instruction}
              </p>
            </motion.div>

            <Button 
              variant="glow" 
              size="lg" 
              onClick={handleCapture}
              disabled={scanState !== 'idle'}
              className="w-full max-w-sm rounded-full shadow-[0_0_30px_rgba(59,130,246,0.2)]"
            >
              {scanState === 'scanning' ? (
                <span className="flex items-center gap-2"><RefreshCw className="w-5 h-5 animate-spin" /> Analyzing...</span>
              ) : scanState === 'success' ? (
                <span className="flex items-center gap-2 text-green-400"><CheckCircle2 className="w-5 h-5" /> Captured</span>
              ) : (
                <span className="flex items-center gap-2"><Camera className="w-5 h-5" /> Scan {currentFace.name} Face</span>
              )}
            </Button>
          </div>
        )}
      </div>

      {/* Right Area: Step Tracker */}
      <div className="w-full lg:w-80 flex flex-col gap-6">
        <div className="glass-panel p-6 flex-1">
          <div className="flex justify-between items-center mb-8">
            <h3 className="font-display font-bold text-white text-xl">Sequence</h3>
            <span className="text-sm font-mono text-primary font-bold">{Math.min(currentStep, 6)} / 6</span>
          </div>
          
          <div className="relative">
            {/* Connecting Line */}
            <div className="absolute left-[19px] top-4 bottom-4 w-[2px] bg-white/10" />
            
            <div className="space-y-6 relative">
              {SCAN_SEQUENCE.map((face, index) => {
                const isPast = index < currentStep;
                const isCurrent = index === currentStep;
                
                return (
                  <div key={face.id} className={clsx(
                    "flex items-center gap-4 transition-all duration-500",
                    isPast ? "opacity-100" : isCurrent ? "opacity-100 scale-105" : "opacity-40 grayscale"
                  )}>
                    <div className={clsx(
                      "w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm relative z-10 transition-colors duration-500",
                      isPast ? "bg-primary text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]" : 
                      isCurrent ? "bg-white/10 border-2 border-tertiary text-tertiary bg-tertiary/10" : 
                      "bg-white/5 border border-white/10 text-gray-500"
                    )}>
                      {isPast ? <CheckCircle2 className="w-5 h-5" /> : face.id}
                    </div>
                    
                    <div className="flex-1">
                      <h4 className={clsx("font-bold text-sm", isCurrent ? "text-white" : "text-gray-300")}>
                        {face.name} Face
                      </h4>
                      {isCurrent && (
                        <p className="text-xs text-tertiary mt-1 font-medium animate-pulse">Awaiting Scan...</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

    </PageTransition>
  );
}