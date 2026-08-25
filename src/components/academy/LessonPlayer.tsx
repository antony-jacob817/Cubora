import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, PlayCircle, BookOpen, CheckCircle2, RotateCcw, Timer, Layers, Zap, Sparkles, RefreshCw, Trophy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CubeViewer } from '@/components/3d/CubeViewer';
import { PlaybackControls } from '@/components/solver/PlaybackControls';
import { useSolvePlayback } from '@/hooks/useSolvePlayback';
import type { Lesson } from '@/data/academy';
import { clsx } from 'clsx';

interface LessonPlayerProps {
  lesson: Lesson;
  methodId?: string;
  isCompleted?: boolean;
  onClose: () => void;
  onToggleComplete?: () => void;
  onComplete?: () => void;
}

type TabMode = 'visualizer' | 'timer';
type TimerStatus = 'idle' | 'holding' | 'ready' | 'running' | 'stopped';

export function LessonPlayer({
  lesson,
  methodId = 'cfop',
  isCompleted = false,
  onClose,
  onToggleComplete,
  onComplete
}: LessonPlayerProps) {
  const isBeginner = methodId === 'beginner';
  const isWalkthrough = Boolean(lesson.phases && lesson.phases.length > 0);

  const [activeTab, setActiveTab] = useState<TabMode>('visualizer');
  const [isDesktop, setIsDesktop] = useState<boolean>(() => typeof window !== 'undefined' ? window.innerWidth >= 1024 : true);

  // Practice Timer State
  const [timerStatus, setTimerStatus] = useState<TimerStatus>('idle');
  const [elapsedMs, setElapsedMs] = useState<number>(0);
  const [recentTimes, setRecentTimes] = useState<number[]>([]);
  const holdTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);

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

  // Wrap the steps format for useSolvePlayback
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

  // Derived initial scramble
  const initialScramble = useMemo(() => {
    if (lesson.scramble) {
      return lesson.scramble.split(' ').filter(Boolean);
    }
    const allMoves = lesson.algorithm.split(' ').filter(Boolean);
    const invert = (m: string) => m.includes("'") ? m.replace("'", "") : m.includes("2") ? m : m + "'";
    return allMoves.reverse().map(invert);
  }, [lesson]);

  const { 
    isPlaying, togglePlay, speed, setSpeed, nextMove, prevMove, reset, jumpToStep,
    currentTimelineIndex, activeStepIndex, totalMoves, action 
  } = useSolvePlayback(steps);

  const currentPhase = steps[activeStepIndex] || steps[0];
  const algorithmMoves = useMemo(() => lesson.algorithm.split(' ').filter(Boolean), [lesson.algorithm]);
  const moveCount = algorithmMoves.length;

  // Best / PB time
  const bestTime = useMemo(() => {
    if (recentTimes.length === 0) return null;
    return Math.min(...recentTimes);
  }, [recentTimes]);

  // Practice Timer Keyboard and Touch Interactions
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (activeTab !== 'timer') return;
    if (e.code === 'Space') {
      e.preventDefault();
      if (timerStatus === 'idle' || timerStatus === 'stopped') {
        setTimerStatus('holding');
        if (holdTimeoutRef.current) clearTimeout(holdTimeoutRef.current);
        holdTimeoutRef.current = setTimeout(() => {
          setTimerStatus('ready');
        }, 300);
      } else if (timerStatus === 'running') {
        // Stop timer
        if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
        const finalTime = Date.now() - startTimeRef.current;
        setElapsedMs(finalTime);
        setTimerStatus('stopped');
        setRecentTimes(prev => [finalTime, ...prev.slice(0, 9)]);
      }
    }
  }, [activeTab, timerStatus]);

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    if (activeTab !== 'timer') return;
    if (e.code === 'Space') {
      e.preventDefault();
      if (timerStatus === 'holding') {
        if (holdTimeoutRef.current) clearTimeout(holdTimeoutRef.current);
        setTimerStatus('idle');
      } else if (timerStatus === 'ready') {
        // Start running
        startTimeRef.current = Date.now();
        setElapsedMs(0);
        setTimerStatus('running');
        timerIntervalRef.current = setInterval(() => {
          setElapsedMs(Date.now() - startTimeRef.current);
        }, 10);
      }
    }
  }, [activeTab, timerStatus]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      if (holdTimeoutRef.current) clearTimeout(holdTimeoutRef.current);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [handleKeyDown, handleKeyUp]);

  const handleTouchStart = () => {
    if (activeTab !== 'timer') return;
    if (timerStatus === 'idle' || timerStatus === 'stopped') {
      setTimerStatus('holding');
      if (holdTimeoutRef.current) clearTimeout(holdTimeoutRef.current);
      holdTimeoutRef.current = setTimeout(() => {
        setTimerStatus('ready');
      }, 300);
    } else if (timerStatus === 'running') {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      const finalTime = Date.now() - startTimeRef.current;
      setElapsedMs(finalTime);
      setTimerStatus('stopped');
      setRecentTimes(prev => [finalTime, ...prev.slice(0, 9)]);
    }
  };

  const handleTouchEnd = () => {
    if (activeTab !== 'timer') return;
    if (timerStatus === 'holding') {
      if (holdTimeoutRef.current) clearTimeout(holdTimeoutRef.current);
      setTimerStatus('idle');
    } else if (timerStatus === 'ready') {
      startTimeRef.current = Date.now();
      setElapsedMs(0);
      setTimerStatus('running');
      timerIntervalRef.current = setInterval(() => {
        setElapsedMs(Date.now() - startTimeRef.current);
      }, 10);
    }
  };

  const handleActionClick = () => {
    if (onToggleComplete) {
      onToggleComplete();
    } else if (onComplete) {
      onComplete();
    }
  };

  const formatTime = (ms: number) => {
    const totalSecs = ms / 1000;
    return totalSecs.toFixed(2);
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
                {isWalkthrough && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold font-mono text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full">
                    <Sparkles className="w-3 h-3" /> Interactive Walkthrough
                  </span>
                )}
              </div>
              <p className="text-[10px] text-slate-500 dark:text-gray-400 font-mono tracking-wider">
                {isWalkthrough 
                  ? `PHASE ${activeStepIndex + 1} OF ${steps.length}: ${currentPhase.phase}`
                  : `${methodId.toUpperCase()} ACADEMY MODULE`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Tabs (Only for algorithmic non-beginner methods when not in multi-phase walkthrough) */}
            {!isBeginner && !isWalkthrough && (
              <div className="flex items-center p-0.5 bg-slate-100 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 rounded-xl">
                <button
                  type="button"
                  onClick={() => setActiveTab('visualizer')}
                  className={clsx(
                    "px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer",
                    activeTab === 'visualizer'
                      ? "bg-white dark:bg-white/10 text-primary dark:text-white shadow-sm"
                      : "text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white"
                  )}
                >
                  <Layers className="w-3.5 h-3.5" /> 3D Guide
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('timer')}
                  className={clsx(
                    "px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer",
                    activeTab === 'timer'
                      ? "bg-white dark:bg-white/10 text-primary dark:text-white shadow-sm"
                      : "text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white"
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

        {/* Layout Split: Desktop 2-Column (Left: 3D Canvas / Timer, Right: Details & Controls) / Mobile Stacked */}
        <div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-y-auto lg:overflow-hidden">
          
          {/* Left Main Interaction Area */}
          <div className="flex-1 min-h-[300px] sm:min-h-[360px] lg:min-h-0 relative bg-gradient-to-b from-transparent to-primary/5 touch-none flex flex-col justify-center items-center overflow-hidden">
            
            {/* Visualizer Mode */}
            {activeTab === 'visualizer' ? (
              <>
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
                <div className="absolute top-3 sm:top-5 left-1/2 -translate-x-1/2 bg-white/90 dark:bg-[#111315]/90 backdrop-blur-md border border-slate-200/80 dark:border-white/10 px-4 sm:px-6 py-2 rounded-2xl shadow-lg max-w-[90%] overflow-x-auto hide-scrollbar z-10">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    {steps.flatMap((s, sIdx) => s.moves.split(' ').filter(Boolean).map((m, mIdx) => ({ move: m, sIdx, mIdx }))).map((item, idx) => (
                      <span 
                        key={idx} 
                        className={clsx(
                          "font-mono text-sm sm:text-base md:text-lg font-bold transition-all duration-200 px-1.5 py-0.5 rounded-md",
                          idx === currentTimelineIndex 
                            ? 'text-primary bg-primary/10 border border-primary/30 scale-110 shadow-[0_0_12px_var(--btn-glow-shadow)]' 
                            : item.sIdx === activeStepIndex
                              ? 'text-slate-900 dark:text-white'
                              : 'text-slate-400 dark:text-slate-600'
                        )}
                      >
                        {item.move}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Preset Scramble Badge for Example Solves */}
                {lesson.scramble && (
                  <div className="absolute bottom-3 left-4 right-4 sm:left-6 sm:right-6 bg-slate-900/80 dark:bg-black/80 backdrop-blur-md border border-white/10 px-3.5 py-2 rounded-xl text-[11px] font-mono text-gray-300 truncate z-10 flex items-center justify-between">
                    <span className="text-primary font-bold mr-2 shrink-0">SCRAMBLE:</span>
                    <span className="truncate select-all">{lesson.scramble}</span>
                  </div>
                )}
              </>
            ) : (
              /* Practice Timer Execution Mode */
              <div 
                onMouseDown={handleTouchStart}
                onMouseUp={handleTouchEnd}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
                className="w-full h-full flex flex-col items-center justify-center p-6 select-none cursor-pointer relative"
              >
                {/* Top Algorithm Banner */}
                <div className="absolute top-4 bg-white/80 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 px-6 py-3 rounded-2xl shadow-sm text-center">
                  <span className="text-[10px] font-bold text-slate-500 dark:text-gray-400 uppercase tracking-widest block mb-1">Target Algorithm</span>
                  <span className="font-mono text-lg sm:text-xl font-extrabold text-primary select-all">
                    {lesson.algorithm}
                  </span>
                </div>

                {/* Live Timer Display */}
                <div className="flex flex-col items-center justify-center gap-2 my-auto">
                  <span
                    className={clsx(
                      "font-mono text-6xl sm:text-7xl md:text-8xl font-black tracking-tight transition-colors duration-150",
                      timerStatus === 'holding' && "text-yellow-500",
                      timerStatus === 'ready' && "text-emerald-500 scale-105",
                      timerStatus === 'running' && "text-primary",
                      timerStatus === 'stopped' && "text-slate-900 dark:text-white",
                      timerStatus === 'idle' && "text-slate-700 dark:text-gray-400"
                    )}
                  >
                    {formatTime(elapsedMs)}s
                  </span>

                  <span className="text-xs font-bold font-mono uppercase tracking-wider text-slate-500 dark:text-gray-400">
                    {timerStatus === 'holding' && 'HOLD SPACEBAR / TOUCH...'}
                    {timerStatus === 'ready' && 'RELEASE TO START!'}
                    {timerStatus === 'running' && 'TIMING... PRESS ANY KEY TO STOP'}
                    {timerStatus === 'stopped' && `${((moveCount / (elapsedMs / 1000)) || 0).toFixed(1)} TPS (Turns/Sec)`}
                    {timerStatus === 'idle' && 'HOLD SPACEBAR OR TOUCH SCREEN TO START'}
                  </span>
                </div>

                {/* Stats & PB Strip */}
                <div className="w-full max-w-md grid grid-cols-3 gap-3 mt-auto bg-white/40 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 p-3 rounded-2xl">
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] text-slate-500 dark:text-gray-400 font-bold uppercase tracking-wider">Moves</span>
                    <span className="font-mono font-bold text-sm text-slate-900 dark:text-white">{moveCount}</span>
                  </div>
                  <div className="flex flex-col items-center border-x border-slate-200/80 dark:border-white/10">
                    <span className="text-[10px] text-slate-500 dark:text-gray-400 font-bold uppercase tracking-wider flex items-center gap-1">
                      <Trophy className="w-3 h-3 text-yellow-500" /> Best (PB)
                    </span>
                    <span className="font-mono font-bold text-sm text-yellow-500">
                      {bestTime ? `${formatTime(bestTime)}s` : '--'}
                    </span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] text-slate-500 dark:text-gray-400 font-bold uppercase tracking-wider">Attempts</span>
                    <span className="font-mono font-bold text-sm text-slate-900 dark:text-white">{recentTimes.length}</span>
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* Right: Sidebar Instructions & Controls */}
          <div className="w-full lg:w-[380px] xl:w-[400px] border-t lg:border-t-0 lg:border-l border-slate-200/80 dark:border-white/10 flex flex-col bg-white/50 dark:bg-white/[0.01] shrink-0">
            
            {/* Scrollable Content */}
            <div className="p-5 sm:p-6 flex-1 overflow-y-auto space-y-4 text-left">
              
              {/* Multi-Phase Walkthrough Selector Pills */}
              {isWalkthrough && steps.length > 1 && (
                <div>
                  <h4 className="text-[11px] font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-primary" /> Solution Phases
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {steps.map((st, sIdx) => {
                      const isActive = activeStepIndex === sIdx;
                      return (
                        <button
                          key={sIdx}
                          type="button"
                          onClick={() => jumpToStep(sIdx)}
                          className={clsx(
                            "px-2.5 py-1 rounded-lg text-xs font-bold transition-all text-left truncate max-w-full cursor-pointer",
                            isActive
                              ? "bg-primary text-white shadow-sm"
                              : "bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-gray-400 hover:bg-slate-200 dark:hover:bg-white/10"
                          )}
                        >
                          {st.phase}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* YouTuber-Style Conversational Explanation */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  {isWalkthrough ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold font-mono text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full">
                      🎬 YouTuber Breakdown
                    </span>
                  ) : isBeginner ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold font-mono text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                      💡 Visual Cue & Trigger
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold font-mono text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full">
                      ⚡ Algorithm Mechanics
                    </span>
                  )}
                  <h3 className="font-display font-bold text-base sm:text-lg text-slate-900 dark:text-white tracking-tight truncate">
                    {currentPhase.phase}
                  </h3>
                </div>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-gray-300 leading-relaxed bg-slate-50/50 dark:bg-white/[0.02] p-3.5 rounded-xl border border-slate-200/60 dark:border-white/5">
                  {currentPhase.explanation}
                </p>
              </div>
              
              {/* Visual Tip Box */}
              <div className="bg-primary/5 dark:bg-primary/10 border border-primary/20 rounded-xl p-3.5 flex items-start gap-2.5">
                <PlayCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <p className="text-xs text-slate-700 dark:text-gray-300 leading-relaxed font-medium">
                  {isWalkthrough 
                    ? "Step through each phase to watch the solution unfold in real time. Rotate the 3D canvas to inspect all faces."
                    : isBeginner 
                      ? "Memorize the intuitive trigger shape. Focus on how corner and edge stickers align before inserting."
                      : "Use the 3D Guide to master the finger tricks, then switch to Practice Timer to drill sub-2 second execution!"}
                </p>
              </div>
            </div>

            {/* Bottom Controls Bar */}
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

        </div>
      </motion.div>
    </motion.div>
  );

  return createPortal(modalContent, document.body);
}