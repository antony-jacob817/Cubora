import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X, PlayCircle, BookOpen, CheckCircle2, RotateCcw, Timer as TimerIcon, Play, Pause, SkipBack, SkipForward, Sparkles, Trophy, Video } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CubeViewer } from '@/components/3d/CubeViewer';
import { useSolvePlayback } from '@/hooks/useSolvePlayback';
import type { Lesson } from '@/data/academy';
import { clsx } from 'clsx';

interface LessonPlayerProps {
  lesson: Lesson;
  isAlgorithmic?: boolean;
  isCompleted?: boolean;
  onClose: () => void;
  onToggleComplete?: () => void;
  onComplete?: () => void;
}

export function LessonPlayer({
  lesson,
  isAlgorithmic = true,
  isCompleted = false,
  onClose,
  onToggleComplete,
  onComplete
}: LessonPlayerProps) {
  const [isDesktop, setIsDesktop] = useState<boolean>(() => typeof window !== 'undefined' ? window.innerWidth >= 1024 : true);
  const [activeTab, setActiveTab] = useState<'visualizer' | 'timer'>('visualizer');

  // Practice Timer State
  const [timerState, setTimerState] = useState<'idle' | 'holding' | 'ready' | 'running' | 'stopped'>('idle');
  const [timerTime, setTimerTime] = useState<number>(0);
  const [bestTime, setBestTime] = useState<number | null>(null);
  const [recentTimes, setRecentTimes] = useState<number[]>([]);
  const holdTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timerStartTimeRef = useRef<number>(0);

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

  // Wrap the algorithm or multi-phase breakdown for useSolvePlayback
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
    if (lesson.isExampleSolve && lesson.scramble) {
      return lesson.scramble.split(' ').filter(Boolean);
    }
    const allMoves = lesson.algorithm.split(' ').filter(Boolean);
    const invert = (m: string) => m.includes("'") ? m.replace("'", "") : m.includes("2") ? m : m + "'";
    return allMoves.reverse().map(invert);
  }, [lesson.algorithm, lesson.isExampleSolve, lesson.scramble]);
  
  const { 
    isPlaying, togglePlay, speed, setSpeed, nextMove, prevMove, 
    currentTimelineIndex, activeStepIndex, totalMoves, action, jumpToStep 
  } = useSolvePlayback(steps);

  const currentPhaseData = steps[activeStepIndex] || steps[0];

  // --- PRACTICE TIMER LOGIC (HOLD SPACEBAR / BUTTON) ---
  const startHolding = useCallback(() => {
    if (timerState === 'running') {
      // Stop timer
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      const elapsed = Date.now() - timerStartTimeRef.current;
      setTimerTime(elapsed);
      setTimerState('stopped');
      setRecentTimes(prev => [elapsed, ...prev.slice(0, 4)]);
      setBestTime(prev => (prev === null || elapsed < prev ? elapsed : prev));
      return;
    }

    if (timerState === 'idle' || timerState === 'stopped') {
      setTimerState('holding');
      holdTimeoutRef.current = setTimeout(() => {
        setTimerState('ready');
      }, 350);
    }
  }, [timerState]);

  const releaseHolding = useCallback(() => {
    if (holdTimeoutRef.current) clearTimeout(holdTimeoutRef.current);

    if (timerState === 'ready') {
      setTimerStartTimeRef.current = Date.now();
      setTimerTime(0);
      setTimerState('running');
      timerIntervalRef.current = setInterval(() => {
        setTimerTime(Date.now() - timerStartTimeRef.current);
      }, 10);
    } else if (timerState === 'holding') {
      setTimerState('idle');
    }
  }, [timerState]);

  // Keyboard spacebar listener for timer
  useEffect(() => {
    if (activeTab !== 'timer') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !e.repeat) {
        e.preventDefault();
        startHolding();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        releaseHolding();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      if (holdTimeoutRef.current) clearTimeout(holdTimeoutRef.current);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [activeTab, startHolding, releaseHolding]);

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
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-2 sm:p-4 lg:p-6 overflow-hidden"
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
                <Video className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              ) : (
                <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display font-bold text-sm sm:text-base md:text-lg text-slate-900 dark:text-white leading-tight truncate max-w-[200px] sm:max-w-md">
                  {lesson.title}
                </h2>
                {lesson.isExampleSolve && (
                  <span className="inline-flex items-center gap-1 text-[9px] sm:text-[10px] font-bold font-mono text-purple-400 bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded-full">
                    <Sparkles className="w-2.5 h-2.5" /> Walkthrough
                  </span>
                )}
                {isCompleted && (
                  <span className="inline-flex items-center gap-1 text-[9px] sm:text-[10px] font-bold font-mono text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                    <CheckCircle2 className="w-2.5 h-2.5" /> Mastered
                  </span>
                )}
              </div>
              <p className="text-[10px] text-slate-500 dark:text-gray-400 font-mono tracking-wider">
                {lesson.isExampleSolve ? 'INTERACTIVE YOUTUBE-STYLE SOLVE' : 'ACADEMY LESSON MODULE'}
              </p>
            </div>
          </div>

          {/* Right Mode Switcher for Algorithmic Courses */}
          <div className="flex items-center gap-2">
            {isAlgorithmic && !lesson.isExampleSolve && (
              <div className="flex items-center bg-slate-100 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 p-0.5 rounded-xl">
                <button
                  type="button"
                  onClick={() => setActiveTab('visualizer')}
                  className={clsx(
                    "px-2.5 sm:px-3 py-1 rounded-lg text-xs font-bold transition-all",
                    activeTab === 'visualizer'
                      ? "bg-primary text-white shadow-sm"
                      : "text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white"
                  )}
                >
                  3D View
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('timer')}
                  className={clsx(
                    "px-2.5 sm:px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1",
                    activeTab === 'timer'
                      ? "bg-primary text-white shadow-sm"
                      : "text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white"
                  )}
                >
                  <TimerIcon className="w-3 h-3" /> Timer
                </button>
              </div>
            )}

            <button 
              type="button"
              onClick={onClose} 
              className="p-1.5 sm:p-2 text-slate-500 hover:text-slate-900 dark:text-gray-400 dark:hover:text-white bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
              title="Close Lesson"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>

        {/* Layout Split: Desktop 2-Column (Left: 3D Canvas / Timer, Right: Details & Controls) */}
        <div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-y-auto lg:overflow-hidden">
          
          {/* Left: Interactive Stage Area */}
          <div className="flex-1 min-h-[260px] sm:min-h-[340px] lg:min-h-0 relative bg-gradient-to-b from-transparent to-primary/5 touch-none flex flex-col justify-center items-center overflow-hidden">
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
                <div className="absolute top-3 sm:top-5 left-1/2 -translate-x-1/2 bg-white/90 dark:bg-[#111315]/90 backdrop-blur-md border border-slate-200/80 dark:border-white/10 px-3 sm:px-5 py-1.5 sm:py-2 rounded-2xl shadow-lg max-w-[92%] overflow-x-auto hide-scrollbar z-10">
                  <div className="flex items-center gap-1 sm:gap-1.5">
                    {lesson.algorithm.split(' ').map((move, idx) => (
                      <span 
                        key={idx} 
                        className={clsx(
                          "font-mono text-xs sm:text-sm md:text-base font-bold transition-all duration-200 px-1.5 py-0.5 rounded-md",
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

                {/* Multi-Phase Selector Bar for Example Solves */}
                {lesson.phases && lesson.phases.length > 1 && (
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-white/80 dark:bg-[#111315]/80 backdrop-blur-md border border-slate-200/80 dark:border-white/10 p-1.5 rounded-2xl shadow-lg flex items-center gap-1.5 max-w-[95%] overflow-x-auto hide-scrollbar z-10">
                    {lesson.phases.map((ph, pIdx) => (
                      <button
                        key={pIdx}
                        type="button"
                        onClick={() => jumpToStep(pIdx)}
                        className={clsx(
                          "px-2.5 py-1 rounded-xl text-[10px] font-bold whitespace-nowrap transition-all cursor-pointer",
                          activeStepIndex === pIdx
                            ? "bg-primary text-white shadow-sm"
                            : "bg-slate-100/80 dark:bg-white/5 text-slate-700 dark:text-gray-400 hover:bg-slate-200 dark:hover:bg-white/10"
                        )}
                      >
                        {ph.phase.split(':')[0]}
                      </button>
                    ))}
                  </div>
                )}
              </>
            ) : (
              /* Practice Execution Timer Mode */
              <div className="w-full h-full p-6 flex flex-col items-center justify-center select-none text-center">
                <div className="mb-4">
                  <span className="text-xs font-mono font-bold uppercase tracking-widest text-slate-500 dark:text-gray-400">
                    Execution Time Trainer
                  </span>
                  <div className="mt-2 text-5xl sm:text-7xl font-mono font-extrabold tracking-tight">
                    <span className={clsx(
                      timerState === 'ready' && "text-emerald-500",
                      timerState === 'holding' && "text-amber-500",
                      timerState === 'running' && "text-primary",
                      (timerState === 'idle' || timerState === 'stopped') && "text-slate-900 dark:text-white"
                    )}>
                      {(timerTime / 1000).toFixed(2)}s
                    </span>
                  </div>
                </div>

                {/* Big Interactive Hold Button */}
                <button
                  type="button"
                  onMouseDown={startHolding}
                  onMouseUp={releaseHolding}
                  onTouchStart={startHolding}
                  onTouchEnd={releaseHolding}
                  className={clsx(
                    "w-56 sm:w-64 h-14 sm:h-16 rounded-2xl font-bold text-sm sm:text-base tracking-wide transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer border",
                    timerState === 'ready'
                      ? "bg-emerald-500 text-white border-emerald-400 shadow-emerald-500/30 scale-105"
                      : timerState === 'holding'
                      ? "bg-amber-500 text-white border-amber-400 shadow-amber-500/30"
                      : timerState === 'running'
                      ? "bg-rose-500 text-white border-rose-400 animate-pulse"
                      : "bg-gradient-to-r from-primary to-secondary text-white btn-glow border-white/20 hover:opacity-95"
                  )}
                >
                  {timerState === 'ready' && "Release to Start!"}
                  {timerState === 'holding' && "Keep Holding..."}
                  {timerState === 'running' && "Click or Press Space to Stop"}
                  {(timerState === 'idle' || timerState === 'stopped') && "Hold Spacebar / Tap to Start"}
                </button>

                {/* PB & Recent Solves Stats */}
                <div className="mt-8 flex items-center gap-6 text-left bg-white/40 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 px-5 py-3 rounded-2xl">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-gray-400 block">Personal Best</span>
                    <span className="text-base font-mono font-bold text-amber-500 flex items-center gap-1">
                      <Trophy className="w-4 h-4" /> {bestTime !== null ? `${(bestTime / 1000).toFixed(2)}s` : '--'}
                    </span>
                  </div>
                  <div className="h-8 w-px bg-slate-200 dark:bg-white/10" />
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-gray-400 block">Recent Reps</span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      {recentTimes.length > 0 ? (
                        recentTimes.map((t, idx) => (
                          <span key={idx} className="text-xs font-mono font-semibold text-slate-700 dark:text-gray-300">
                            {(t / 1000).toFixed(2)}s{idx < recentTimes.length - 1 ? ',' : ''}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-slate-400 dark:text-gray-500">No attempts yet</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right: Sidebar Instructions & Controls */}
          <div className="w-full lg:w-[380px] xl:w-[400px] border-t lg:border-t-0 lg:border-l border-slate-200/80 dark:border-white/10 flex flex-col bg-white/50 dark:bg-white/[0.01] shrink-0">
            <div className="p-4 sm:p-6 flex-1 overflow-y-auto space-y-4 text-left">
              {/* Dynamic Phase Context & Conversational Explanation */}
              <div>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <h3 className="font-display font-bold text-base sm:text-lg text-slate-900 dark:text-white tracking-tight leading-snug">
                    {currentPhaseData.phase || lesson.title}
                  </h3>
                  {lesson.group && (
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-slate-200/60 dark:bg-white/10 text-slate-700 dark:text-gray-300">
                      {lesson.group}
                    </span>
                  )}
                </div>

                <p className="text-xs sm:text-sm text-slate-700 dark:text-gray-300 leading-relaxed">
                  {currentPhaseData.explanation || lesson.explanation}
                </p>
              </div>
              
              {/* YouTuber-Style or Visual Cue Highlight Card */}
              <div className={clsx(
                "border rounded-xl p-3.5 flex items-start gap-2.5 shadow-sm",
                lesson.isExampleSolve
                  ? "bg-purple-500/5 dark:bg-purple-500/10 border-purple-500/20"
                  : "bg-primary/5 dark:bg-primary/10 border-primary/20"
              )}>
                {lesson.isExampleSolve ? (
                  <Sparkles className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                ) : (
                  <PlayCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                )}
                <p className="text-xs text-slate-700 dark:text-gray-200 leading-relaxed font-medium">
                  {lesson.isExampleSolve
                    ? "Study how this step flows directly into the next phase without unnecessary rotations or pauses. Rotate the 3D cube to inspect tracking."
                    : "Use the playback bar below to step through turn-by-turn, or switch to the Timer tab to drill muscle memory!"}
                </p>
              </div>

              {lesson.condition && (
                <div className="bg-slate-100 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 rounded-xl p-3">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-gray-400 block mb-1">
                    Recognition Condition
                  </span>
                  <p className="text-xs text-slate-700 dark:text-gray-300">
                    {lesson.condition}
                  </p>
                </div>
              )}
            </div>

            {/* Bottom Controls Bar with Speed Multipliers & Playback */}
            <div className="p-4 sm:p-5 border-t border-slate-200/80 dark:border-white/10 bg-slate-50/80 dark:bg-[#111315]/80 flex flex-col gap-3.5 shrink-0">
              {/* Speed Multiplier Toggles (0.5x, 1x, 1.5x, 2x) */}
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-gray-400">
                  Speed
                </span>
                <div className="flex items-center gap-1 bg-slate-200/60 dark:bg-white/5 p-1 rounded-xl">
                  {[0.5, 1.0, 1.5, 2.0].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSpeed(s)}
                      className={clsx(
                        "px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer",
                        speed === s
                          ? "bg-primary text-white shadow-xs"
                          : "text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white"
                      )}
                    >
                      {s}x
                    </button>
                  ))}
                </div>
              </div>

              {/* Media Controls */}
              <div className="flex items-center justify-center gap-4">
                <button
                  type="button"
                  onClick={prevMove}
                  className="p-2 text-slate-700 hover:text-slate-900 dark:text-gray-400 dark:hover:text-white transition-colors active:scale-95 cursor-pointer"
                  title="Previous Move"
                >
                  <SkipBack className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>

                <button
                  type="button"
                  onClick={togglePlay}
                  className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-slate-900 dark:bg-white text-white dark:text-[#111315] flex items-center justify-center hover:scale-105 active:scale-95 transition-transform shadow-md cursor-pointer"
                  title={isPlaying ? "Pause" : "Play"}
                >
                  {isPlaying ? (
                    <Pause className="w-5 h-5 fill-current" />
                  ) : (
                    <Play className="w-5 h-5 fill-current ml-0.5" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={nextMove}
                  className="p-2 text-slate-700 hover:text-slate-900 dark:text-gray-400 dark:hover:text-white transition-colors active:scale-95 cursor-pointer"
                  title="Next Move"
                >
                  <SkipForward className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
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

        </div>
      </motion.div>
    </motion.div>
  );

  return createPortal(modalContent, document.body);
}