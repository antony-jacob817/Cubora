import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, PlayCircle, BookOpen, CheckCircle2, RotateCcw, 
  Timer as TimerIcon, Layers, Sparkles, Trophy, History, 
  RefreshCw, Check, ArrowRight, Lightbulb
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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

type TabMode = '3d-walkthrough' | 'practice-timer' | 'conceptual-guide';
type TimerStatus = 'idle' | 'ready' | 'running' | 'stopped';

export function LessonPlayer({ 
  lesson, 
  courseId = 'simplified-cfop', 
  isCompleted = false, 
  onClose, 
  onToggleComplete, 
  onComplete 
}: LessonPlayerProps) {
  const isBeginner = courseId === 'beginner';
  const isMultiPhase = Boolean(lesson.phases && lesson.phases.length > 0);

  const [activeTab, setActiveTab] = useState<TabMode>('3d-walkthrough');
  const [isDesktop, setIsDesktop] = useState<boolean>(() => typeof window !== 'undefined' ? window.innerWidth >= 1024 : true);

  // Practice Timer States
  const [timerStatus, setTimerStatus] = useState<TimerStatus>('idle');
  const [elapsedMs, setElapsedMs] = useState<number>(0);
  const [attempts, setAttempts] = useState<number[]>([]);
  const [bestTime, setBestTime] = useState<number | null>(null);

  const timerRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const readyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  // Wrap algorithms into steps format expected by useSolvePlayback
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

  const initialScramble = useMemo(() => {
    if (lesson.initialScramble) {
      return lesson.initialScramble.split(' ').filter(Boolean);
    }
    const allMoves = lesson.algorithm.split(' ').filter(Boolean);
    const invert = (m: string) => m.includes("'") ? m.replace("'", "") : m.includes("2") ? m : m + "'";
    return allMoves.reverse().map(invert);
  }, [lesson.algorithm, lesson.initialScramble]);
  
  const { 
    isPlaying, togglePlay, speed, setSpeed, nextMove, prevMove, 
    currentTimelineIndex, totalMoves, action, activeStepIndex 
  } = useSolvePlayback(steps);

  const currentPhase = steps[activeStepIndex] || steps[0];
  const isSolveFullyCompleted = totalMoves > 0 && currentTimelineIndex === totalMoves - 1;

  // --- PRACTICE TIMER LOGIC ---
  const startStopwatch = useCallback(() => {
    startTimeRef.current = performance.now();
    setTimerStatus('running');
    const update = () => {
      const now = performance.now();
      setElapsedMs(now - startTimeRef.current);
      timerRef.current = requestAnimationFrame(update);
    };
    timerRef.current = requestAnimationFrame(update);
  }, []);

  const stopStopwatch = useCallback(() => {
    if (timerRef.current) cancelAnimationFrame(timerRef.current);
    const finalMs = performance.now() - startTimeRef.current;
    setElapsedMs(finalMs);
    setTimerStatus('stopped');
    setAttempts(prev => [finalMs, ...prev.slice(0, 7)]);
    setBestTime(prev => (prev === null || finalMs < prev ? finalMs : prev));
  }, []);

  const resetTimer = useCallback(() => {
    if (timerRef.current) cancelAnimationFrame(timerRef.current);
    setTimerStatus('idle');
    setElapsedMs(0);
  }, []);

  const handlePointerDownTimer = useCallback(() => {
    if (timerStatus === 'running') {
      stopStopwatch();
    } else if (timerStatus === 'idle' || timerStatus === 'stopped') {
      readyTimeoutRef.current = setTimeout(() => {
        setTimerStatus('ready');
      }, 300);
    }
  }, [timerStatus, stopStopwatch]);

  const handlePointerUpTimer = useCallback(() => {
    if (readyTimeoutRef.current) clearTimeout(readyTimeoutRef.current);
    if (timerStatus === 'ready') {
      startStopwatch();
    } else if (timerStatus === 'idle') {
      // Released too quickly
      setTimerStatus('idle');
    }
  }, [timerStatus, startStopwatch]);

  // Spacebar hotkey for Practice Timer
  useEffect(() => {
    if (activeTab !== 'practice-timer') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        if (timerStatus === 'running') {
          stopStopwatch();
        } else if (timerStatus === 'idle' || timerStatus === 'stopped') {
          if (!readyTimeoutRef.current) {
            readyTimeoutRef.current = setTimeout(() => {
              setTimerStatus('ready');
            }, 250);
          }
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        if (readyTimeoutRef.current) {
          clearTimeout(readyTimeoutRef.current);
          readyTimeoutRef.current = null;
        }
        if (timerStatus === 'ready') {
          startStopwatch();
        } else if (timerStatus === 'idle') {
          setTimerStatus('idle');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [activeTab, timerStatus, startStopwatch, stopStopwatch]);

  const handleActionClick = () => {
    if (onToggleComplete) {
      onToggleComplete();
    } else if (onComplete) {
      onComplete();
    }
  };

  const modalContent = (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-6 overflow-hidden"
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
        <div className="px-5 py-3 sm:px-6 sm:py-3.5 border-b border-slate-200/80 dark:border-white/10 flex flex-wrap justify-between items-center bg-white/80 dark:bg-white/[0.02] gap-3 shrink-0">
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
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold font-mono text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full">
                    <Sparkles className="w-3 h-3" /> Full Solve
                  </span>
                )}
              </div>
              <p className="text-[10px] text-slate-500 dark:text-gray-400 font-mono tracking-wider">
                {courseId.toUpperCase()} ACADEMY MODULE
              </p>
            </div>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex items-center gap-2">
            {!isBeginner ? (
              <div className="flex items-center bg-slate-100 dark:bg-white/5 p-1 rounded-xl border border-slate-200/80 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setActiveTab('3d-walkthrough')}
                  className={clsx(
                    "px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer",
                    activeTab === '3d-walkthrough'
                      ? "bg-white dark:bg-primary text-slate-900 dark:text-white shadow-sm"
                      : "text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white"
                  )}
                >
                  <PlayCircle className="w-3.5 h-3.5" /> 3D Walkthrough
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('practice-timer')}
                  className={clsx(
                    "px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer",
                    activeTab === 'practice-timer'
                      ? "bg-white dark:bg-primary text-slate-900 dark:text-white shadow-sm"
                      : "text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white"
                  )}
                >
                  <TimerIcon className="w-3.5 h-3.5" /> Practice Timer
                </button>
              </div>
            ) : (
              <div className="flex items-center bg-slate-100 dark:bg-white/5 p-1 rounded-xl border border-slate-200/80 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setActiveTab('3d-walkthrough')}
                  className={clsx(
                    "px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer",
                    activeTab === '3d-walkthrough'
                      ? "bg-white dark:bg-primary text-slate-900 dark:text-white shadow-sm"
                      : "text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white"
                  )}
                >
                  <PlayCircle className="w-3.5 h-3.5" /> 3D Solver
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('conceptual-guide')}
                  className={clsx(
                    "px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer",
                    activeTab === 'conceptual-guide'
                      ? "bg-white dark:bg-primary text-slate-900 dark:text-white shadow-sm"
                      : "text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white"
                  )}
                >
                  <Lightbulb className="w-3.5 h-3.5 text-amber-500" /> Beginner Guide
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

        {/* Layout Split: Desktop 2-Column / Mobile Stacked */}
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
            
            {/* Algorithm Step-by-Step Overlay */}
            <div className="absolute top-3 sm:top-5 left-1/2 -translate-x-1/2 bg-white/90 dark:bg-[#111315]/90 backdrop-blur-md border border-slate-200/80 dark:border-white/10 px-4 sm:px-6 py-2 sm:py-2.5 rounded-2xl shadow-lg max-w-[92%] overflow-x-auto hide-scrollbar z-10 flex flex-col items-center gap-1">
              {isMultiPhase && (
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[10px] font-bold font-mono uppercase tracking-widest text-primary">
                    {currentPhase.phase}
                  </span>
                </div>
              )}
              
              <div className="flex items-center gap-1.5 sm:gap-2">
                {currentPhase.moves ? (
                  currentPhase.moves.split(' ').filter(Boolean).map((move, idx) => (
                    <span 
                      key={idx} 
                      className={clsx(
                        "font-mono text-sm sm:text-base md:text-lg font-bold transition-all duration-200 px-1.5 py-0.5 rounded-md select-all",
                        idx === currentTimelineIndex 
                          ? 'text-primary bg-primary/10 border border-primary/30 scale-110 shadow-[0_0_12px_var(--btn-glow-shadow)]' 
                          : 'text-slate-700 dark:text-slate-400'
                      )}
                    >
                      {move}
                    </span>
                  ))
                ) : (
                  <span className="text-xs font-mono font-bold text-emerald-500">
                    🎉 Scramble 100% Solved!
                  </span>
                )}
              </div>
            </div>

            {/* Solved Celebration Toast */}
            {isSolveFullyCompleted && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-emerald-500/90 text-white font-bold text-xs px-4 py-2 rounded-full shadow-lg flex items-center gap-2 backdrop-blur-md"
              >
                <Trophy className="w-4 h-4 text-yellow-300" />
                <span>100% Solved! Full execution sequence completed.</span>
              </motion.div>
            )}
          </div>

          {/* Right: Sidebar Instructions, Multi-Phase Stepper, Practice Timer or Beginner Guide */}
          <div className="w-full lg:w-[400px] xl:w-[420px] border-t lg:border-t-0 lg:border-l border-slate-200/80 dark:border-white/10 flex flex-col bg-white/50 dark:bg-white/[0.01] shrink-0">
            
            {activeTab === '3d-walkthrough' && (
              <div className="p-5 sm:p-6 flex-1 overflow-y-auto space-y-4 text-left">
                {/* Multi-Phase Stepper Navigation */}
                {isMultiPhase && (
                  <div className="bg-slate-100/80 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 rounded-2xl p-3.5 space-y-2.5">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold font-mono tracking-widest text-primary uppercase">
                        Phase {activeStepIndex + 1} of {steps.length}
                      </span>
                      <span className="text-[11px] font-mono font-bold text-slate-700 dark:text-gray-300">
                        {Math.round(((currentTimelineIndex + 1) / Math.max(1, totalMoves)) * 100)}%
                      </span>
                    </div>

                    {/* Stepper Progress Bar */}
                    <div className="grid grid-cols-7 gap-1">
                      {steps.map((_, idx) => (
                        <div
                          key={idx}
                          className={clsx(
                            "h-1.5 rounded-full transition-all duration-300",
                            idx < activeStepIndex
                              ? "bg-emerald-500"
                              : idx === activeStepIndex
                              ? "bg-primary shadow-[0_0_8px_var(--btn-glow-shadow)]"
                              : "bg-slate-200 dark:bg-white/10"
                          )}
                        />
                      ))}
                    </div>

                    <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate">
                      {currentPhase.phase}
                    </h4>
                  </div>
                )}

                {/* YouTuber-Style Conversational Commentary */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    <h3 className="font-display font-bold text-base sm:text-lg text-slate-900 dark:text-white tracking-tight">
                      Pro Breakdown & Piece Tracking
                    </h3>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-700 dark:text-gray-300 leading-relaxed font-sans bg-white/70 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 rounded-2xl p-4 shadow-sm">
                    {currentPhase.explanation}
                  </p>
                </div>
                
                {/* Finger Placement & Mechanics Tips */}
                <div className="bg-primary/5 dark:bg-primary/10 border border-primary/20 rounded-xl p-3.5 flex items-start gap-2.5">
                  <PlayCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <p className="text-xs text-slate-700 dark:text-gray-300 leading-relaxed font-medium">
                    Use the speed buttons below (0.5x – 2x) to pace algorithm execution. Drag with your mouse or finger to inspect hidden face layers!
                  </p>
                </div>
              </div>
            )}

            {/* PRACTICE TIMER TAB (For CFOP, Simplified CFOP, Roux, ZZ) */}
            {activeTab === 'practice-timer' && (
              <div className="p-5 sm:p-6 flex-1 overflow-y-auto flex flex-col justify-between text-left space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <TimerIcon className="w-4 h-4 text-primary" />
                      <h3 className="font-display font-bold text-base sm:text-lg text-slate-900 dark:text-white tracking-tight">
                        Adaptive Practice Timer
                      </h3>
                    </div>
                    {bestTime !== null && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold text-amber-500 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
                        <Trophy className="w-3 h-3" /> PB: {(bestTime / 1000).toFixed(2)}s
                      </span>
                    )}
                  </div>

                  {/* Target Algorithm Quick Reference */}
                  <div className="bg-slate-100 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 rounded-2xl p-3 mb-4">
                    <span className="text-[10px] font-bold font-mono text-slate-500 dark:text-gray-400 block mb-1 uppercase tracking-wider">
                      Target Algorithm
                    </span>
                    <span className="font-mono font-bold text-sm text-primary select-all">
                      {lesson.algorithm}
                    </span>
                  </div>

                  {/* Large Stackmat-style Timer Surface */}
                  <div
                    onPointerDown={handlePointerDownTimer}
                    onPointerUp={handlePointerUpTimer}
                    className={clsx(
                      "w-full h-40 rounded-2xl border-2 flex flex-col items-center justify-center cursor-pointer select-none transition-all duration-200 relative overflow-hidden shadow-inner",
                      timerStatus === 'ready'
                        ? "bg-emerald-500/20 border-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.3)] scale-[1.02]"
                        : timerStatus === 'running'
                        ? "bg-primary/20 border-primary shadow-[0_0_30px_rgba(99,102,241,0.3)]"
                        : "bg-slate-100 dark:bg-white/5 border-dashed border-slate-300 dark:border-white/20 hover:border-primary/50"
                    )}
                  >
                    <span className={clsx(
                      "font-mono font-black tracking-tight transition-all",
                      timerStatus === 'running'
                        ? "text-4xl sm:text-5xl text-primary"
                        : timerStatus === 'ready'
                        ? "text-4xl sm:text-5xl text-emerald-500"
                        : "text-3xl sm:text-4xl text-slate-800 dark:text-white"
                    )}>
                      {(elapsedMs / 1000).toFixed(2)}s
                    </span>

                    <span className="text-[11px] font-bold font-mono tracking-wider text-slate-500 dark:text-gray-400 mt-2">
                      {timerStatus === 'idle' && "Hold Spacebar / Tap to Ready"}
                      {timerStatus === 'ready' && "READY! Release to Start"}
                      {timerStatus === 'running' && "RUNNING... Press Spacebar / Tap to Stop"}
                      {timerStatus === 'stopped' && "COMPLETED! Hold to try again"}
                    </span>
                  </div>

                  {/* Action row */}
                  <div className="flex justify-between items-center mt-3">
                    <button
                      type="button"
                      onClick={resetTimer}
                      className="text-xs text-slate-500 hover:text-slate-800 dark:text-gray-400 dark:hover:text-white flex items-center gap-1 cursor-pointer font-bold"
                    >
                      <RefreshCw className="w-3 h-3" /> Reset Time
                    </button>
                    {timerStatus === 'stopped' && elapsedMs > 0 && (
                      <span className="text-xs font-mono font-bold text-emerald-500">
                        {elapsedMs < 2000 ? "⚡ Sub-2s Master!" : elapsedMs < 3500 ? "🔥 Great Speed!" : "👍 Smooth Execution!"}
                      </span>
                    )}
                  </div>
                </div>

                {/* Recent Attempts History */}
                {attempts.length > 0 && (
                  <div className="bg-slate-100/70 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 rounded-2xl p-3">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold font-mono text-slate-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                      <History className="w-3 h-3" /> Recent Times
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {attempts.map((ms, idx) => (
                        <span 
                          key={idx}
                          className="px-2 py-0.5 rounded-lg bg-white dark:bg-white/10 border border-slate-200 dark:border-white/10 text-[11px] font-mono font-bold text-slate-800 dark:text-gray-300"
                        >
                          {(ms / 1000).toFixed(2)}s
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* BEGINNER CONCEPTUAL GUIDE TAB */}
            {activeTab === 'conceptual-guide' && (
              <div className="p-5 sm:p-6 flex-1 overflow-y-auto space-y-4 text-left">
                <div className="flex items-center gap-2 mb-1">
                  <Lightbulb className="w-5 h-5 text-amber-500" />
                  <h3 className="font-display font-bold text-base sm:text-lg text-slate-900 dark:text-white tracking-tight">
                    Beginner Movement & Trigger Guide
                  </h3>
                </div>

                {/* Visual Trigger Reference Cards */}
                <div className="space-y-2.5">
                  <div className="bg-white dark:bg-white/5 border border-slate-200/80 dark:border-white/10 rounded-xl p-3">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-bold text-primary">The "Sexy Move" (Right Trigger)</span>
                      <span className="text-[10px] font-mono font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-md">R U R' U'</span>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-gray-400">
                      Right face UP $\to$ Top layer LEFT $\to$ Right face DOWN $\to$ Top layer RIGHT. Memorize this muscle memory trigger!
                    </p>
                  </div>

                  <div className="bg-white dark:bg-white/5 border border-slate-200/80 dark:border-white/10 rounded-xl p-3">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-bold text-emerald-500">FUR-U-RUF (Yellow Cross)</span>
                      <span className="text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded-md">F R U R' U' F'</span>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-gray-400">
                      Front face CLOCKWISE $\to$ Sexy Move (R U R' U') $\to$ Front face COUNTER-CLOCKWISE.
                    </p>
                  </div>

                  <div className="bg-white dark:bg-white/5 border border-slate-200/80 dark:border-white/10 rounded-xl p-3">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-bold text-indigo-400">Niklas (Corner Cycling)</span>
                      <span className="text-[10px] font-mono font-bold bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded-md">U R U' L' U R' U' L</span>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-gray-400">
                      Up $\to$ Right UP $\to$ Up Back $\to$ Left UP $\to$ Up $\to$ Right DOWN $\to$ Up Back $\to$ Left DOWN.
                    </p>
                  </div>
                </div>

                {/* Layer Anatomy Breakdown */}
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 flex items-start gap-2.5">
                  <Layers className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-slate-700 dark:text-gray-300 leading-relaxed font-medium">
                    Always maintain white center on the bottom (D) and yellow center on top (U) unless instructed to flip during the final corner orientation step!
                  </p>
                </div>
              </div>
            )}

            {/* Bottom Controls & Action Bar */}
            <div className="p-4 sm:p-5 border-t border-slate-200/80 dark:border-white/10 bg-slate-50/80 dark:bg-[#111315]/80 flex flex-col gap-3 shrink-0">
              
              {/* Playback Controls with 0.5x, 1x, 1.5x, 2x Speed Multipliers */}
              <div className="w-full">
                <PlaybackControls 
                  isPlaying={isPlaying} 
                  togglePlay={togglePlay}
                  nextMove={nextMove} 
                  prevMove={prevMove}
                  speed={speed} 
                  setSpeed={setSpeed}
                  progress={totalMoves > 0 ? (currentTimelineIndex + 1) / totalMoves : 0}
                />

                {/* Speed Multiplier Pill Toggles */}
                <div className="flex items-center justify-center gap-1.5 mt-2.5">
                  <span className="text-[9px] font-bold font-mono uppercase text-slate-400 dark:text-gray-500 mr-1">
                    Speed:
                  </span>
                  {[0.5, 1.0, 1.5, 2.0].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSpeed(s)}
                      className={clsx(
                        "px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer",
                        speed === s
                          ? "bg-primary text-white shadow-sm"
                          : "bg-slate-200/60 dark:bg-white/5 text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white"
                      )}
                    >
                      {s === 1.0 ? "1x" : `${s}x`}
                    </button>
                  ))}
                </div>
              </div>
              
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
          </div>

        </div>
      </motion.div>
    </motion.div>
  );

  return createPortal(modalContent, document.body);
}