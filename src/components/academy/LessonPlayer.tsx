import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, 
  PlayCircle, 
  BookOpen, 
  CheckCircle2, 
  RotateCcw, 
  Timer, 
  Sparkles, 
  Layers, 
  Zap, 
  Trophy, 
  Flame, 
  RefreshCw,
  Eye,
  HandMetal
} from 'lucide-react';
import { motion } from 'framer-motion';
import { CubeViewer } from '@/components/3d/CubeViewer';
import { PlaybackControls } from '@/components/solver/PlaybackControls';
import { useSolvePlayback } from '@/hooks/useSolvePlayback';
import type { Lesson } from '@/data/academy';
import { clsx } from 'clsx';

interface LessonPlayerProps {
  lesson: Lesson;
  courseId?: string;
  isCompleted?: boolean;
  onClose: () => void;
  onToggleComplete?: () => void;
  onComplete?: () => void;
}

export function LessonPlayer({ 
  lesson, 
  courseId,
  isCompleted = false, 
  onClose, 
  onToggleComplete, 
  onComplete 
}: LessonPlayerProps) {
  const isBeginner = courseId === 'beginner' || lesson.id.startsWith('beginner');
  const isMultiPhase = Boolean(lesson.phases && lesson.phases.length > 0);

  const [activeTab, setActiveTab] = useState<'walkthrough' | 'timer'>('walkthrough');
  const [isDesktop, setIsDesktop] = useState<boolean>(() => typeof window !== 'undefined' ? window.innerWidth >= 1024 : true);

  // Responsive desktop check
  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Prevent background body scrolling when modal is active
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  // Multi-Phase vs Single Step handling
  const steps = useMemo(() => {
    if (lesson.phases && lesson.phases.length > 0) {
      return lesson.phases;
    }
    return [{
      phase: lesson.title,
      explanation: lesson.explanation,
      moves: lesson.algorithm
    }];
  }, [lesson]);

  // Initial scramble: uses preset initialScramble if available, otherwise inverts the algorithm
  const initialScramble = useMemo(() => {
    if (lesson.initialScramble) {
      return lesson.initialScramble.split(' ').filter(Boolean);
    }
    const allMoves = lesson.algorithm.split(' ').filter(Boolean);
    const invert = (m: string) => m.includes("'") ? m.replace("'", "") : m.includes("2") ? m : m + "'";
    return allMoves.reverse().map(invert);
  }, [lesson]);

  const { 
    isPlaying, togglePlay, speed, setSpeed, nextMove, prevMove, 
    currentTimelineIndex, activeStepIndex, totalMoves, action 
  } = useSolvePlayback(steps);

  const currentPhase = steps[activeStepIndex] || steps[0];

  // ----------------------------------------------------
  // ADAPTIVE PRACTICE TIMER LOGIC (CFOP / Roux / ZZ)
  // ----------------------------------------------------
  const [timerState, setTimerState] = useState<'idle' | 'holding' | 'ready' | 'running' | 'stopped'>('idle');
  const [time, setTime] = useState(0);
  const [bestTime, setBestTime] = useState<number | null>(null);
  const [solveHistory, setSolveHistory] = useState<number[]>([]);

  const holdTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (holdTimeoutRef.current) clearTimeout(holdTimeoutRef.current);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, []);

  const handleStartHold = useCallback(() => {
    if (timerState === 'running') {
      // Stop the timer immediately
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      const elapsed = performance.now() - startTimeRef.current;
      setTime(elapsed);
      setTimerState('stopped');
      setSolveHistory(prev => [elapsed, ...prev]);
      setBestTime(prev => (prev === null || elapsed < prev ? elapsed : prev));
      return;
    }

    if (timerState === 'idle' || timerState === 'stopped') {
      setTimerState('holding');
      holdTimeoutRef.current = setTimeout(() => {
        setTimerState('ready');
      }, 300); // 300ms hold threshold to arm timer
    }
  }, [timerState]);

  const handleReleaseHold = useCallback(() => {
    if (timerState === 'holding') {
      if (holdTimeoutRef.current) clearTimeout(holdTimeoutRef.current);
      setTimerState('idle');
    } else if (timerState === 'ready') {
      // Launch stopwatch!
      setTimerState('running');
      startTimeRef.current = performance.now();
      timerIntervalRef.current = setInterval(() => {
        setTime(performance.now() - startTimeRef.current);
      }, 10);
    }
  }, [timerState]);

  // Spacebar Keyboard Listener for Stackmat-style Timer
  useEffect(() => {
    if (isBeginner || activeTab !== 'timer') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !e.repeat) {
        e.preventDefault();
        handleStartHold();
      } else if (timerState === 'running') {
        e.preventDefault();
        handleStartHold(); // stops running timer on any key press
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        handleReleaseHold();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isBeginner, activeTab, timerState, handleStartHold, handleReleaseHold]);

  const handleResetTimer = () => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    setTimerState('idle');
    setTime(0);
  };

  // Average of 5 Calculation
  const ao5 = useMemo(() => {
    if (solveHistory.length < 5) return null;
    const last5 = solveHistory.slice(0, 5);
    const sorted = [...last5].sort((a, b) => a - b);
    const middle3 = sorted.slice(1, 4);
    return middle3.reduce((sum, v) => sum + v, 0) / 3;
  }, [solveHistory]);

  const handleActionClick = () => {
    if (onToggleComplete) {
      onToggleComplete();
    } else if (onComplete) {
      onComplete();
    }
  };

  // Beginner Trigger Concept details helper
  const beginnerConceptDetails = useMemo(() => {
    const alg = lesson.algorithm;
    if (alg.includes("R U R' U'")) {
      return {
        name: "Sexy Move Trigger",
        breakdown: "R (Right Up) ➔ U (Top Left) ➔ R' (Right Down) ➔ U' (Top Right)",
        handPlacement: "Keep right thumb on the front center face and index finger hooked over the top right edge for high-speed triggering.",
        layerFocus: "First Layer Corners & F2L pairing"
      };
    }
    if (alg.includes("R' D' R D")) {
      return {
        name: "Reverse Sexy Corner Orient Trigger",
        breakdown: "R' (Right Down) ➔ D' (Bottom Left) ➔ R (Right Up) ➔ D (Bottom Right)",
        handPlacement: "Hold the unsolved corner in the Front-Right-Bottom slot. Keep cube still and turn ONLY D layer between corner twists.",
        layerFocus: "Final Layer Yellow Corner Twisting"
      };
    }
    if (alg.includes("F R U R' U' F'")) {
      return {
        name: "FUR-U-RUF Edge Orientation",
        breakdown: "F (Front Clockwise) ➔ [R U R' U' Sexy Move] ➔ F' (Front Counter-Clockwise)",
        handPlacement: "Index finger pushes the F face clockwise, right hand cycles the Sexy Move, index finger recovers F back.",
        layerFocus: "Top Layer Yellow Cross"
      };
    }
    if (alg.includes("R U R' U R U2 R'")) {
      return {
        name: "Sune Permutation Trigger",
        breakdown: "R U R' U ➔ R U2 R' (Lift right pair, push top, lift again, 180° home)",
        handPlacement: "Flick the U2 with your right index finger followed by the middle finger for a rapid double-flick.",
        layerFocus: "Yellow Cross Edge Realignment"
      };
    }
    if (alg.includes("U R U' L' U R' U' L")) {
      return {
        name: "Niklas Corner Cycling Formula",
        breakdown: "U R U' L' (Shift top right, shift top left) ➔ U R' U' L (Restore both columns)",
        handPlacement: "Keep target corner on Front-Right-Top. Left and right index fingers alternate pushing the U layer.",
        layerFocus: "Top Layer Corner Positioning"
      };
    }
    return {
      name: "Layer Construction Logic",
      breakdown: `${lesson.title} sequence: ${lesson.algorithm}`,
      handPlacement: "Maintain neutral wrist orientation with thumbs on front centers.",
      layerFocus: "Layer-by-Layer fundamentals"
    };
  }, [lesson]);

  const modalContent = (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-6 overflow-hidden"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 15 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-5xl max-h-[92vh] lg:h-[85vh] lg:max-h-[750px] glass-panel border-slate-200/80 dark:border-white/10 flex flex-col overflow-hidden relative shadow-[0_0_50px_rgba(0,0,0,0.5)] rounded-2xl bg-white/95 dark:bg-[#111315]/95"
      >
        {/* Modal Header */}
        <div className="px-5 py-3.5 sm:px-6 sm:py-4 border-b border-slate-200/80 dark:border-white/10 flex justify-between items-center bg-white/80 dark:bg-white/[0.02] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
              <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display font-bold text-base sm:text-lg text-slate-900 dark:text-white leading-tight">
                  {lesson.title}
                </h2>
                {isCompleted && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold font-mono text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                    <CheckCircle2 className="w-3 h-3" /> Mastered
                  </span>
                )}
                {isMultiPhase && (
                  <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold font-mono text-purple-500 bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded-full">
                    <Sparkles className="w-3 h-3" /> Full Solve Breakdown
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] text-slate-500 dark:text-gray-400 font-mono tracking-wider">
                  {courseId?.toUpperCase() || 'ACADEMY'} MODULE
                </span>
                {isMultiPhase && (
                  <span className="text-[10px] text-primary font-bold font-mono">
                    • Step {activeStepIndex + 1} of {steps.length}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Mode Tabs for Non-Beginner Tracks */}
            {!isBeginner && (
              <div className="flex items-center bg-slate-100 dark:bg-white/5 p-1 rounded-xl border border-slate-200/80 dark:border-white/10 mr-1">
                <button
                  type="button"
                  onClick={() => setActiveTab('walkthrough')}
                  className={clsx(
                    "px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer",
                    activeTab === 'walkthrough'
                      ? "bg-white dark:bg-white/10 text-primary dark:text-white shadow-sm"
                      : "text-slate-500 dark:text-gray-400 hover:text-slate-800 dark:hover:text-white"
                  )}
                >
                  <Eye className="w-3.5 h-3.5" /> 3D Solve
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('timer')}
                  className={clsx(
                    "px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer",
                    activeTab === 'timer'
                      ? "bg-white dark:bg-white/10 text-primary dark:text-white shadow-sm"
                      : "text-slate-500 dark:text-gray-400 hover:text-slate-800 dark:hover:text-white"
                  )}
                >
                  <Timer className="w-3.5 h-3.5" /> Practice Timer
                </button>
              </div>
            )}

            <button 
              type="button"
              onClick={onClose} 
              className="p-2 text-slate-500 hover:text-slate-900 dark:text-gray-400 dark:hover:text-white bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
              title="Close Lesson"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>

        {/* Layout Split: Desktop 2-Column (Left: 3D Canvas, Right: Details & Controls) / Mobile Stacked */}
        <div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-y-auto lg:overflow-hidden">
          
          {/* Left: 3D Interaction Area */}
          <div className="flex-1 min-h-[260px] sm:min-h-[340px] lg:min-h-0 relative bg-gradient-to-b from-transparent to-primary/5 touch-none flex flex-col justify-center items-center overflow-hidden">
            <CubeViewer 
              className="absolute inset-0"
              action={action}
              speed={speed}
              currentTimelineIndex={currentTimelineIndex}
              initialScramble={initialScramble}
              cameraPosition={isDesktop ? [5.65, 4.45, 7.3] : [4.8, 3.8, 6.2]}
              cameraFov={32}
            />
            
            {/* Algorithm Step-by-Step Sequence Overlay */}
            <div className="absolute top-4 sm:top-5 left-1/2 -translate-x-1/2 bg-white/90 dark:bg-[#111315]/90 backdrop-blur-md border border-slate-200/80 dark:border-white/10 px-4 sm:px-6 py-2 sm:py-2.5 rounded-2xl shadow-lg max-w-[92%] overflow-x-auto hide-scrollbar z-10">
              <div className="flex items-center gap-1.5 sm:gap-2">
                {lesson.algorithm.split(' ').map((move, idx) => (
                  <span 
                    key={idx} 
                    className={clsx(
                      "font-mono text-sm sm:text-base md:text-lg font-bold transition-all duration-200 px-1.5 py-0.5 rounded-md shrink-0",
                      idx === currentTimelineIndex 
                        ? 'text-primary bg-primary/10 border border-primary/30 scale-110 shadow-[0_0_12px_var(--btn-glow-shadow)]' 
                        : 'text-slate-700 dark:text-slate-400'
                    )}
                  >
                    {move}
                  </span>
                ))}
              </div>
            </div>

            {/* Bottom 3D Helper Badge */}
            <div className="absolute bottom-3 left-4 text-[10px] text-slate-500 dark:text-gray-400 font-mono flex items-center gap-1.5 bg-black/40 px-2.5 py-1 rounded-full backdrop-blur-sm pointer-events-none">
              <Sparkles className="w-3 h-3 text-primary" /> Drag to rotate 360° • Zoom locked
            </div>
          </div>

          {/* Right: Sidebar Instructions & Controls */}
          <div className="w-full lg:w-[380px] xl:w-[420px] border-t lg:border-t-0 lg:border-l border-slate-200/80 dark:border-white/10 flex flex-col bg-white/50 dark:bg-white/[0.01] shrink-0">
            
            {/* TAB CONTENT 1: WALKTHROUGH & 3D TUTORIAL */}
            {activeTab === 'walkthrough' && (
              <>
                <div className="p-5 sm:p-6 flex-1 overflow-y-auto space-y-4 text-left">
                  
                  {/* Multi-Phase Stepper Pills */}
                  {isMultiPhase && (
                    <div className="space-y-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-gray-400 flex items-center gap-1">
                        <Layers className="w-3 h-3 text-primary" /> Solve Stage Breakdown
                      </span>
                      <div className="flex gap-1.5 overflow-x-auto hide-scrollbar pb-1">
                        {steps.map((st, idx) => (
                          <div
                            key={idx}
                            className={clsx(
                              "px-2.5 py-1 rounded-lg text-[10px] font-bold font-mono border transition-all shrink-0 cursor-default",
                              idx === activeStepIndex
                                ? "bg-primary text-white border-primary shadow-sm"
                                : idx < activeStepIndex
                                ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                                : "bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-gray-400 border-slate-200/80 dark:border-white/10"
                            )}
                          >
                            {idx + 1}. {st.phase.split(':')[0]}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Active Phase / Lesson Mechanics */}
                  <div>
                    <h3 className="font-display font-bold text-lg sm:text-xl text-slate-900 dark:text-white mb-2 tracking-tight flex items-center gap-2">
                      <Zap className="w-4 h-4 text-yellow-500 shrink-0" />
                      {currentPhase.phase}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-700 dark:text-gray-300 leading-relaxed font-normal">
                      {currentPhase.explanation}
                    </p>
                  </div>

                  {/* Beginner Method Visual Highlights & Triggers */}
                  {isBeginner && (
                    <div className="space-y-3 pt-2">
                      <div className="bg-primary/5 dark:bg-primary/10 border border-primary/20 rounded-2xl p-4 text-left space-y-2.5">
                        <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
                          <HandMetal className="w-4 h-4" />
                          <span>{beginnerConceptDetails.name}</span>
                        </div>
                        <p className="text-xs text-slate-700 dark:text-gray-200 font-mono font-medium leading-relaxed bg-white/60 dark:bg-black/30 p-2.5 rounded-xl border border-slate-200/60 dark:border-white/5">
                          {beginnerConceptDetails.breakdown}
                        </p>
                        <div className="text-[11px] text-slate-600 dark:text-gray-300 leading-relaxed">
                          <strong className="text-slate-800 dark:text-white font-semibold">Finger Positioning: </strong>
                          {beginnerConceptDetails.handPlacement}
                        </div>
                      </div>

                      <div className="bg-slate-100/70 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 rounded-xl p-3 flex items-center justify-between text-xs">
                        <span className="text-slate-500 dark:text-gray-400 font-medium">Target Layer</span>
                        <span className="font-mono font-bold text-slate-900 dark:text-white">{beginnerConceptDetails.layerFocus}</span>
                      </div>
                    </div>
                  )}

                  {/* Non-Beginner Tip Box */}
                  {!isBeginner && (
                    <div className="bg-primary/5 dark:bg-primary/10 border border-primary/20 rounded-xl p-3.5 flex items-start gap-2.5">
                      <PlayCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      <p className="text-xs text-slate-700 dark:text-gray-300 leading-relaxed font-medium">
                        Step through moves using the controls below. Switch to the <strong>Practice Timer</strong> tab above to time your live finger execution.
                      </p>
                    </div>
                  )}
                </div>

                {/* Bottom Playback Controls */}
                <div className="p-4 sm:p-5 border-t border-slate-200/80 dark:border-white/10 bg-slate-50/80 dark:bg-[#111315]/80 flex flex-col gap-3.5 shrink-0">
                  <PlaybackControls 
                    isPlaying={isPlaying} 
                    togglePlay={togglePlay}
                    nextMove={nextMove} 
                    prevMove={prevMove}
                    speed={speed} 
                    setSpeed={setSpeed}
                    progress={totalMoves > 0 ? (currentTimelineIndex + 1) / totalMoves : 0}
                  />
                  
                  {/* Standardized Primary Action Button with Toggle State */}
                  <button 
                    type="button"
                    onClick={handleActionClick}
                    className={clsx(
                      "h-10 px-5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 select-none w-full cursor-pointer mt-1",
                      isCompleted
                        ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 hover:bg-rose-500/10 hover:border-rose-500/30 hover:text-rose-400 group/btn"
                        : "bg-gradient-to-r from-primary to-secondary text-white btn-glow border border-white/20 hover:opacity-95 shadow-sm"
                    )}
                  >
                    {isCompleted ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 group-hover/btn:hidden shrink-0" />
                        <RotateCcw className="w-4 h-4 text-rose-400 hidden group-hover/btn:inline-block shrink-0" />
                        <span className="group-hover/btn:hidden">Completed</span>
                        <span className="hidden group-hover/btn:inline">Undo Completion</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                        <span>Mark as Completed</span>
                      </>
                    )}
                  </button>
                </div>
              </>
            )}

            {/* TAB CONTENT 2: ADAPTIVE PRACTICE TIMER (SPEED MULTIPLIERS & STACKMAT TIMER) */}
            {activeTab === 'timer' && !isBeginner && (
              <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between overflow-y-auto space-y-4 text-left">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Flame className="w-3.5 h-3.5 text-orange-500" /> Target Formula
                    </span>
                    <span className="text-[10px] font-mono font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md">
                      {lesson.algorithm.split(' ').length} Moves
                    </span>
                  </div>

                  <div className="bg-slate-100 dark:bg-black/40 border border-slate-200/80 dark:border-white/10 rounded-2xl p-3.5 text-center font-mono font-bold text-sm text-slate-900 dark:text-white select-all mb-4">
                    {lesson.algorithm}
                  </div>

                  {/* Interactive Hold-to-Start Timer Pad */}
                  <div 
                    onMouseDown={handleStartHold}
                    onMouseUp={handleReleaseHold}
                    onTouchStart={handleStartHold}
                    onTouchEnd={handleReleaseHold}
                    className={clsx(
                      "w-full h-44 rounded-2xl border-2 flex flex-col items-center justify-center p-4 transition-all duration-200 cursor-pointer select-none relative overflow-hidden",
                      timerState === 'idle' && "bg-white/80 dark:bg-white/5 border-slate-300/80 dark:border-white/10 hover:border-primary/40",
                      timerState === 'holding' && "bg-amber-500/10 border-amber-500/50 scale-[0.99]",
                      timerState === 'ready' && "bg-emerald-500/20 border-emerald-500 scale-[1.01] shadow-[0_0_25px_rgba(16,185,129,0.3)]",
                      timerState === 'running' && "bg-primary/10 border-primary shadow-[0_0_30px_var(--btn-glow-shadow)]",
                      timerState === 'stopped' && "bg-emerald-500/10 border-emerald-500/40"
                    )}
                  >
                    {/* Big Digital Numbers */}
                    <span className={clsx(
                      "font-mono font-extrabold text-4xl sm:text-5xl tracking-tight transition-colors",
                      timerState === 'ready' && "text-emerald-500",
                      timerState === 'holding' && "text-amber-500",
                      timerState === 'running' && "text-primary",
                      (timerState === 'stopped' || timerState === 'idle') && "text-slate-900 dark:text-white"
                    )}>
                      {(time / 1000).toFixed(3)}s
                    </span>

                    {/* Instruction State Caption */}
                    <span className="text-[11px] font-bold text-slate-500 dark:text-gray-400 mt-2 uppercase tracking-wider">
                      {timerState === 'idle' && "Hold SPACEBAR or Tap & Hold (0.3s)"}
                      {timerState === 'holding' && "Get Ready..."}
                      {timerState === 'ready' && "READY! Release to Start"}
                      {timerState === 'running' && "STOP: Tap anywhere or press Space"}
                      {timerState === 'stopped' && "Tap & Hold to Try Again"}
                    </span>
                  </div>

                  {/* Performance Metrics Row */}
                  <div className="grid grid-cols-2 gap-3 mt-4">
                    <div className="bg-white/80 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 rounded-xl p-3 flex flex-col">
                      <span className="text-[10px] text-slate-500 dark:text-gray-400 font-bold uppercase tracking-wider flex items-center gap-1">
                        <Trophy className="w-3 h-3 text-yellow-500" /> Best Time
                      </span>
                      <span className="text-base font-mono font-bold text-slate-900 dark:text-white mt-1">
                        {bestTime !== null ? `${(bestTime / 1000).toFixed(3)}s` : '--'}
                      </span>
                    </div>

                    <div className="bg-white/80 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 rounded-xl p-3 flex flex-col">
                      <span className="text-[10px] text-slate-500 dark:text-gray-400 font-bold uppercase tracking-wider flex items-center gap-1">
                        <Timer className="w-3 h-3 text-primary" /> Session Ao5
                      </span>
                      <span className="text-base font-mono font-bold text-slate-900 dark:text-white mt-1">
                        {ao5 !== null ? `${(ao5 / 1000).toFixed(3)}s` : `${solveHistory.length}/5 Solves`}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Reset & Quick Actions */}
                <div className="flex gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={handleResetTimer}
                    className="flex-1 h-10 px-4 rounded-xl text-xs font-bold bg-slate-100 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-gray-300 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Reset Timer
                  </button>

                  <button
                    type="button"
                    onClick={handleActionClick}
                    className={clsx(
                      "flex-1 h-10 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer",
                      isCompleted
                        ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-500"
                        : "bg-gradient-to-r from-primary to-secondary text-white shadow-sm"
                    )}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{isCompleted ? "Mastered" : "Mark Mastered"}</span>
                  </button>
                </div>
              </div>
            )}

          </div>

        </div>
      </motion.div>
    </motion.div>
  );

  return createPortal(modalContent, document.body);
}