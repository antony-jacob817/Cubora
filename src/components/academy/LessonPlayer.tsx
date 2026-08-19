import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, 
  PlayCircle, 
  BookOpen, 
  CheckCircle2, 
  RotateCcw, 
  Timer, 
  Zap, 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Sparkles, 
  Award,
  ChevronRight,
  Flame,
  Gauge
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CubeViewer } from '@/components/3d/CubeViewer';
import { useSolvePlayback, type SolveStep } from '@/hooks/useSolvePlayback';
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
  courseId = 'cfop', 
  isCompleted = false, 
  onClose, 
  onToggleComplete, 
  onComplete 
}: LessonPlayerProps) {
  const [isDesktop, setIsDesktop] = useState<boolean>(() => typeof window !== 'undefined' ? window.innerWidth >= 1024 : true);
  const [activeTab, setActiveTab] = useState<'walkthrough' | 'timer'>('walkthrough');

  // Practice Timer State
  const [timerState, setTimerState] = useState<'idle' | 'holding' | 'ready' | 'running' | 'stopped'>('idle');
  const [timerTime, setTimerTime] = useState<number>(0);
  const [practiceAttempts, setPracticeAttempts] = useState<number[]>([]);
  const holdTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);

  // Responsive desktop detection
  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Prevent background body scrolling when modal is open
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  // Construct structured SolveSteps for useSolvePlayback
  const steps: SolveStep[] = useMemo(() => {
    if (lesson.steps && lesson.steps.length > 0) {
      return lesson.steps.map(s => ({
        phase: s.name || s.phase,
        explanation: s.explanation,
        moves: s.moves || s.formula
      }));
    }
    return [{
      phase: lesson.title,
      explanation: lesson.explanation,
      moves: lesson.algorithm
    }];
  }, [lesson]);

  // Authentic Scramble setup:
  // For Example Solves, use the authentic scramble; for individual algs, invert the formula
  const initialScramble = useMemo(() => {
    if (lesson.scramble) {
      return lesson.scramble.split(' ').filter(Boolean);
    }
    const allMoves = lesson.algorithm.split(' ').filter(Boolean);
    const invert = (m: string) => m.includes("'") ? m.replace("'", "") : m.includes("2") ? m : m + "'";
    return allMoves.reverse().map(invert);
  }, [lesson]);

  const { 
    isPlaying, 
    togglePlay, 
    speed, 
    setSpeed, 
    nextMove, 
    prevMove, 
    reset,
    currentTimelineIndex, 
    activeStepIndex,
    totalMoves, 
    action 
  } = useSolvePlayback(steps);

  // Current active step details
  const currentStepData = useMemo(() => {
    if (lesson.steps && lesson.steps.length > 0) {
      return lesson.steps[Math.min(activeStepIndex, lesson.steps.length - 1)];
    }
    return null;
  }, [lesson, activeStepIndex]);

  // Supported speed tiers: adaptive based on course
  const speedOptions = useMemo(() => {
    if (courseId === 'beginner') {
      return [0.75, 1.0, 1.25];
    }
    return [0.5, 1.0, 2.0];
  }, [courseId]);

  // --- PRACTICE TIMER LOGIC (Spacebar + Touch) ---
  const startTimer = useCallback(() => {
    startTimeRef.current = performance.now();
    setTimerState('running');
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    timerIntervalRef.current = setInterval(() => {
      setTimerTime((performance.now() - startTimeRef.current) / 1000);
    }, 10);
  }, []);

  const stopTimer = useCallback(() => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    const finalElapsed = (performance.now() - startTimeRef.current) / 1000;
    setTimerTime(finalElapsed);
    setTimerState('stopped');
    setPracticeAttempts(prev => [finalElapsed, ...prev]);
  }, []);

  const handleTimerPadDown = useCallback(() => {
    if (timerState === 'running') {
      stopTimer();
      return;
    }
    if (timerState === 'stopped') {
      setTimerState('idle');
      setTimerTime(0);
      return;
    }
    if (timerState === 'idle') {
      setTimerState('holding');
      holdTimeoutRef.current = setTimeout(() => {
        setTimerState('ready');
      }, 300);
    }
  }, [timerState, stopTimer]);

  const handleTimerPadUp = useCallback(() => {
    if (holdTimeoutRef.current) {
      clearTimeout(holdTimeoutRef.current);
      holdTimeoutRef.current = null;
    }
    if (timerState === 'ready') {
      startTimer();
    } else if (timerState === 'holding') {
      setTimerState('idle');
    }
  }, [timerState, startTimer]);

  // Spacebar listener for Practice Timer
  useEffect(() => {
    if (activeTab !== 'timer') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !e.repeat) {
        e.preventDefault();
        handleTimerPadDown();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        handleTimerPadUp();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [activeTab, handleTimerPadDown, handleTimerPadUp]);

  // Cleanup timer interval on unmount
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (holdTimeoutRef.current) clearTimeout(holdTimeoutRef.current);
    };
  }, []);

  const bestAttempt = useMemo(() => {
    if (practiceAttempts.length === 0) return null;
    return Math.min(...practiceAttempts);
  }, [practiceAttempts]);

  const handleActionClick = () => {
    if (onToggleComplete) {
      onToggleComplete();
    } else if (onComplete) {
      onComplete();
    }
  };

  const progressPercent = totalMoves > 0 ? ((currentTimelineIndex + 1) / totalMoves) * 100 : 0;

  const modalContent = (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-2 sm:p-4 md:p-6 overflow-hidden"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 15 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-5xl max-h-[94vh] lg:h-[85vh] lg:max-h-[750px] glass-panel border-slate-200/80 dark:border-white/10 flex flex-col overflow-hidden relative shadow-[0_0_50px_rgba(0,0,0,0.5)] rounded-2xl bg-white/95 dark:bg-[#111315]/95"
      >
        {/* Modal Header */}
        <div className="px-4 py-3 sm:px-6 sm:py-3.5 border-b border-slate-200/80 dark:border-white/10 flex justify-between items-center bg-white/80 dark:bg-white/[0.02] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
              {lesson.isExampleSolve ? (
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              ) : (
                <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display font-bold text-sm sm:text-base md:text-lg text-slate-900 dark:text-white leading-tight">
                  {lesson.title}
                </h2>
                {lesson.isExampleSolve && (
                  <span className="inline-flex items-center gap-1 text-[9px] sm:text-[10px] font-bold font-mono text-amber-500 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
                    <Sparkles className="w-3 h-3" /> Full Walkthrough
                  </span>
                )}
                {isCompleted && (
                  <span className="inline-flex items-center gap-1 text-[9px] sm:text-[10px] font-bold font-mono text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                    <CheckCircle2 className="w-3 h-3" /> Mastered
                  </span>
                )}
              </div>
              <p className="text-[10px] text-slate-500 dark:text-gray-400 font-mono tracking-wider">
                {lesson.isExampleSolve ? 'AUTHENTIC WCA SCRAMBLE SOLVE' : 'ACADEMY LESSON MODULE'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View Tab Switcher */}
            <div className="flex items-center bg-slate-100 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 p-0.5 rounded-xl">
              <button
                type="button"
                onClick={() => setActiveTab('walkthrough')}
                className={clsx(
                  "px-2.5 sm:px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer",
                  activeTab === 'walkthrough'
                    ? "bg-white dark:bg-background text-slate-900 dark:text-white shadow-sm"
                    : "text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white"
                )}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Breakdown</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('timer')}
                className={clsx(
                  "px-2.5 sm:px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer",
                  activeTab === 'timer'
                    ? "bg-primary text-white shadow-sm"
                    : "text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white"
                )}
              >
                <Timer className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Practice Timer</span>
              </button>
            </div>

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
            
            {/* Top Algorithm Step-by-Step Overlay */}
            <div className="absolute top-3 sm:top-5 left-1/2 -translate-x-1/2 bg-white/90 dark:bg-[#111315]/90 backdrop-blur-md border border-slate-200/80 dark:border-white/10 px-3 sm:px-5 py-2 rounded-2xl shadow-lg max-w-[92%] overflow-x-auto hide-scrollbar z-10 flex items-center gap-1.5 sm:gap-2">
              {(currentStepData ? currentStepData.formula : lesson.algorithm).split(' ').map((move, idx) => (
                <span 
                  key={idx} 
                  className={clsx(
                    "font-mono text-xs sm:text-sm md:text-base font-bold transition-all duration-200 px-1.5 py-0.5 rounded-md shrink-0",
                    idx === currentTimelineIndex 
                      ? 'text-primary bg-primary/10 border border-primary/30 scale-110 shadow-[0_0_12px_var(--btn-glow-shadow)]' 
                      : 'text-slate-700 dark:text-slate-400'
                  )}
                >
                  {move}
                </span>
              ))}
            </div>

            {/* Bottom Scramble Pill (For authentic Example Solves) */}
            {lesson.scramble && (
              <div className="absolute bottom-3 left-4 right-4 sm:left-6 sm:right-6 bg-white/70 dark:bg-[#111315]/70 backdrop-blur-sm border border-slate-200/60 dark:border-white/5 px-3 py-1.5 rounded-xl z-10 hidden sm:flex items-center justify-between">
                <span className="text-[10px] font-mono text-slate-500 dark:text-gray-400 uppercase font-bold tracking-wider">
                  Scramble:
                </span>
                <span className="text-[10px] font-mono text-slate-700 dark:text-gray-300 truncate max-w-[80%] select-all">
                  {lesson.scramble}
                </span>
              </div>
            )}
          </div>

          {/* Right: Sidebar Panel (Walkthrough Tab / Practice Timer Tab) */}
          <div className="w-full lg:w-[410px] xl:w-[440px] border-t lg:border-t-0 lg:border-l border-slate-200/80 dark:border-white/10 flex flex-col bg-white/50 dark:bg-white/[0.01] shrink-0 min-h-0">
            
            {activeTab === 'walkthrough' ? (
              <div className="flex-1 flex flex-col min-h-0">
                {/* Scrollable Content Body */}
                <div className="p-4 sm:p-6 flex-1 overflow-y-auto space-y-4 text-left">
                  
                  {/* If Example Solve: Step Stepper Navigation Badges */}
                  {lesson.steps && lesson.steps.length > 0 && (
                    <div>
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-gray-400 block mb-2">
                        Walkthrough Progression ({activeStepIndex + 1}/{lesson.steps.length})
                      </span>
                      <div className="flex flex-wrap gap-1.5 pb-1">
                        {lesson.steps.map((step, sIdx) => {
                          const isActive = activeStepIndex === sIdx;
                          return (
                            <div
                              key={sIdx}
                              className={clsx(
                                "px-2.5 py-1 rounded-lg text-[10px] font-bold font-mono transition-all flex items-center gap-1 select-none",
                                isActive
                                  ? "bg-primary text-white shadow-sm ring-2 ring-primary/30"
                                  : "bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-gray-400"
                              )}
                            >
                              <span>{sIdx + 1}.</span>
                              <span className="truncate max-w-[90px]">{step.name || step.phase}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Active Phase Teacher Breakdown Card */}
                  <div className="bg-white/80 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 rounded-2xl p-4 shadow-sm space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-bold font-mono uppercase tracking-widest text-primary">
                        {currentStepData ? currentStepData.phase : 'Algorithm Mechanics'}
                      </span>
                      <span className="text-[11px] font-mono font-bold text-slate-500 dark:text-gray-400">
                        {totalMoves > 0 ? `${currentTimelineIndex + 1}/${totalMoves} Moves` : ''}
                      </span>
                    </div>

                    <h3 className="font-display font-bold text-base sm:text-lg text-slate-900 dark:text-white tracking-tight leading-snug">
                      {currentStepData ? currentStepData.name : lesson.title}
                    </h3>

                    {/* Formula Pill */}
                    <div className="bg-slate-200/50 dark:bg-background/80 border border-slate-200/80 dark:border-white/5 px-3 py-1.5 rounded-xl font-mono text-xs font-bold text-slate-800 dark:text-gray-200 select-all flex items-center justify-between">
                      <span>{currentStepData ? currentStepData.formula : lesson.algorithm}</span>
                      <Sparkles className="w-3.5 h-3.5 text-primary shrink-0 opacity-75" />
                    </div>

                    <p className="text-xs text-slate-700 dark:text-gray-300 leading-relaxed pt-1">
                      {currentStepData ? currentStepData.explanation : lesson.explanation}
                    </p>
                  </div>

                  {/* Teacher Commentary / Speedcubing Tip */}
                  {currentStepData?.commentary && (
                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-3.5 flex items-start gap-2.5">
                      <Flame className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-[10px] font-bold font-mono text-amber-600 dark:text-amber-400 uppercase tracking-wider block mb-0.5">
                          Pro Tip / Why This Move:
                        </span>
                        <p className="text-xs text-slate-800 dark:text-gray-200 leading-relaxed font-medium">
                          {currentStepData.commentary}
                        </p>
                      </div>
                    </div>
                  )}

                  {!currentStepData?.commentary && (
                    <div className="bg-primary/5 dark:bg-primary/10 border border-primary/20 rounded-2xl p-3.5 flex items-start gap-2.5">
                      <PlayCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      <p className="text-xs text-slate-700 dark:text-gray-300 leading-relaxed font-medium">
                        Step through each move using the playback bar below. Rotate the 3D cube with your mouse or touch to analyze hidden faces during the sequence.
                      </p>
                    </div>
                  )}
                </div>

                {/* Bottom Media Controls & Speed Multipliers */}
                <div className="p-4 sm:p-5 border-t border-slate-200/80 dark:border-white/10 bg-slate-50/80 dark:bg-[#111315]/80 flex flex-col gap-3.5 shrink-0">
                  
                  {/* Progress Bar */}
                  <div className="w-full h-1.5 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden relative">
                    <div 
                      className="absolute top-0 left-0 h-full bg-primary transition-all duration-300"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>

                  {/* Media Controls Bar & Speed Multiplier Selector */}
                  <div className="flex items-center justify-between gap-2">
                    
                    {/* Adaptive Speed Multiplier Pills */}
                    <div className="flex items-center gap-1 bg-white/60 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 p-0.5 rounded-xl">
                      <Gauge className="w-3 h-3 text-slate-400 ml-1.5 mr-0.5" />
                      {speedOptions.map(s => {
                        const isSelected = speed === s;
                        return (
                          <button
                            key={s}
                            type="button"
                            onClick={() => setSpeed(s)}
                            className={clsx(
                              "px-2 py-1 rounded-lg text-[11px] font-bold font-mono transition-all cursor-pointer",
                              isSelected 
                                ? "bg-primary text-white shadow-sm" 
                                : "text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white"
                            )}
                            title={`Playback Speed: ${s}x`}
                          >
                            {s === 1.0 ? '1x' : `${s}x`}
                          </button>
                        );
                      })}
                    </div>

                    {/* Step & Play Controls */}
                    <div className="flex items-center gap-2">
                      <button 
                        type="button"
                        onClick={prevMove} 
                        className="p-2 text-slate-700 hover:text-slate-900 dark:text-gray-400 dark:hover:text-white bg-white/60 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 rounded-xl transition-all active:scale-95 cursor-pointer"
                        title="Previous Move"
                      >
                        <SkipBack className="w-4 h-4" />
                      </button>
                      
                      <button 
                        type="button"
                        onClick={togglePlay}
                        className="w-10 h-10 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-[#111315] flex items-center justify-center hover:scale-105 active:scale-95 transition-transform shadow-md cursor-pointer"
                        title={isPlaying ? "Pause" : "Play"}
                      >
                        {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
                      </button>
                      
                      <button 
                        type="button"
                        onClick={nextMove} 
                        className="p-2 text-slate-700 hover:text-slate-900 dark:text-gray-400 dark:hover:text-white bg-white/60 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 rounded-xl transition-all active:scale-95 cursor-pointer"
                        title="Next Move"
                      >
                        <SkipForward className="w-4 h-4" />
                      </button>

                      <button 
                        type="button"
                        onClick={reset}
                        className="p-2 text-slate-500 hover:text-slate-900 dark:text-gray-400 dark:hover:text-white bg-white/60 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 rounded-xl transition-all active:scale-95 cursor-pointer"
                        title="Reset Scramble"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Standardized Primary Action Button with Toggle State */}
                  <button 
                    type="button"
                    onClick={handleActionClick}
                    className={clsx(
                      "h-10 px-5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 select-none w-full cursor-pointer",
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
              </div>
            ) : (
              /* --- PRACTICE TIMER TAB --- */
              <div className="flex-1 flex flex-col p-5 sm:p-6 text-left justify-between">
                <div className="space-y-4">
                  <div>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-primary block mb-1">
                      Interactive Formula Drill
                    </span>
                    <h3 className="font-display font-bold text-lg sm:text-xl text-slate-900 dark:text-white">
                      Practice: {lesson.title}
                    </h3>
                  </div>

                  {/* Formula Reference Card */}
                  <div className="bg-slate-100 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 rounded-2xl p-3.5">
                    <span className="text-[10px] font-mono text-slate-500 dark:text-gray-400 uppercase font-bold block mb-1">
                      Target Algorithm:
                    </span>
                    <span className="font-mono text-sm sm:text-base font-bold text-primary select-all">
                      {lesson.algorithm}
                    </span>
                  </div>

                  {/* Interactive Timer Pad */}
                  <div 
                    onMouseDown={handleTimerPadDown}
                    onMouseUp={handleTimerPadUp}
                    onTouchStart={handleTimerPadDown}
                    onTouchEnd={handleTimerPadUp}
                    className={clsx(
                      "w-full h-44 sm:h-52 rounded-2xl border-2 flex flex-col items-center justify-center p-4 transition-all duration-200 cursor-pointer select-none relative overflow-hidden",
                      timerState === 'idle' && "bg-slate-100/80 dark:bg-white/5 border-slate-300 dark:border-white/10 hover:border-primary/40",
                      timerState === 'holding' && "bg-amber-500/10 border-amber-500/50 scale-[0.98]",
                      timerState === 'ready' && "bg-emerald-500/10 border-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.3)] scale-[0.99]",
                      timerState === 'running' && "bg-primary/10 border-primary shadow-[0_0_30px_var(--btn-glow-shadow)]",
                      timerState === 'stopped' && "bg-white/90 dark:bg-white/5 border-primary/50 shadow-md"
                    )}
                  >
                    {/* Big Digital Timer Display */}
                    <span className={clsx(
                      "font-mono text-4xl sm:text-5xl font-extrabold tracking-tight transition-colors",
                      timerState === 'ready' && "text-emerald-500",
                      timerState === 'running' && "text-primary",
                      timerState === 'holding' && "text-amber-500",
                      (timerState === 'idle' || timerState === 'stopped') && "text-slate-900 dark:text-white"
                    )}>
                      {timerTime.toFixed(2)}s
                    </span>

                    {/* Status Hint */}
                    <span className="text-xs font-mono font-bold mt-3 text-slate-500 dark:text-gray-400">
                      {timerState === 'idle' && "Press & Hold Spacebar or Tap Pad"}
                      {timerState === 'holding' && "Holding..."}
                      {timerState === 'ready' && "READY! Release to Start"}
                      {timerState === 'running' && "RUNNING... Press Spacebar or Tap to Stop"}
                      {timerState === 'stopped' && "Solved! Tap Pad or Spacebar to Reset"}
                    </span>
                  </div>

                  {/* Best & Stats Row */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white/60 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 rounded-xl p-3 flex items-center gap-2.5">
                      <Award className="w-4 h-4 text-amber-500 shrink-0" />
                      <div>
                        <span className="text-[10px] font-mono text-slate-500 dark:text-gray-400 font-bold uppercase block">
                          Best PB
                        </span>
                        <span className="text-sm font-mono font-bold text-slate-900 dark:text-white">
                          {bestAttempt ? `${bestAttempt.toFixed(2)}s` : '--'}
                        </span>
                      </div>
                    </div>

                    <div className="bg-white/60 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 rounded-xl p-3 flex items-center gap-2.5">
                      <Zap className="w-4 h-4 text-primary shrink-0" />
                      <div>
                        <span className="text-[10px] font-mono text-slate-500 dark:text-gray-400 font-bold uppercase block">
                          Attempts
                        </span>
                        <span className="text-sm font-mono font-bold text-slate-900 dark:text-white">
                          {practiceAttempts.length} Solves
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Switch back to breakdown button */}
                <button
                  type="button"
                  onClick={() => setActiveTab('walkthrough')}
                  className="mt-4 h-10 px-5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-800 dark:text-gray-200 border border-slate-200/80 dark:border-white/10 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <BookOpen className="w-4 h-4" /> Return to 3D Breakdown
                </button>
              </div>
            )}

          </div>

        </div>
      </motion.div>
    </motion.div>
  );

  return createPortal(modalContent, document.body);
}