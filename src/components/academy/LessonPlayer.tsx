import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, PlayCircle, BookOpen, CheckCircle2, RotateCcw, 
  Timer, Zap, Award, Sparkles, Layers, Flame, Trophy, Lightbulb 
} from 'lucide-react';
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

type TimerState = 'idle' | 'holding' | 'ready' | 'running' | 'stopped';

export function LessonPlayer({ 
  lesson, 
  methodId, 
  isCompleted = false, 
  onClose, 
  onToggleComplete, 
  onComplete 
}: LessonPlayerProps) {
  const [isDesktop, setIsDesktop] = useState<boolean>(() => typeof window !== 'undefined' ? window.innerWidth >= 1024 : true);
  const isBeginner = methodId === 'beginner' || lesson.id.startsWith('beginner');
  const [activeTab, setActiveTab] = useState<'tutorial' | 'timer'>('tutorial');

  // Practice Timer State
  const [timerState, setTimerState] = useState<TimerState>('idle');
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [personalBest, setPersonalBest] = useState<number | null>(null);
  const holdTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const animationFrameRef = useRef<number | null>(null);

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

  // Wrap the single or multi-phase algorithm into the format expected by useSolvePlayback
  const steps = useMemo(() => {
    if (lesson.phases && lesson.phases.length > 0) {
      return lesson.phases.map(p => ({
        phase: p.phase,
        explanation: p.explanation,
        moves: p.moves
      }));
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
    currentTimelineIndex, totalMoves, activeStepIndex, action 
  } = useSolvePlayback(steps);

  const activeStep = steps[activeStepIndex] || steps[0];
  const isMultiPhase = steps.length > 1;

  // Practice Timer Stop & Run Logic
  const stopTimer = useCallback(() => {
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    const finalTime = (performance.now() - startTimeRef.current) / 1000;
    setElapsedTime(finalTime);
    setTimerState('stopped');
    setPersonalBest(prev => prev === null ? finalTime : Math.min(prev, finalTime));
  }, []);

  const startTimer = useCallback(() => {
    setTimerState('running');
    startTimeRef.current = performance.now();
    const update = () => {
      setElapsedTime((performance.now() - startTimeRef.current) / 1000);
      animationFrameRef.current = requestAnimationFrame(update);
    };
    animationFrameRef.current = requestAnimationFrame(update);
  }, []);

  // Keyboard Spacebar Handling for Timer
  useEffect(() => {
    if (isBeginner || activeTab !== 'timer') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !e.repeat) {
        e.preventDefault();
        if (timerState === 'running') {
          stopTimer();
        } else if (timerState === 'idle' || timerState === 'stopped') {
          setTimerState('holding');
          holdTimeoutRef.current = setTimeout(() => {
            setTimerState('ready');
          }, 280);
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        if (holdTimeoutRef.current) clearTimeout(holdTimeoutRef.current);
        if (timerState === 'ready') {
          startTimer();
        } else if (timerState === 'holding') {
          setTimerState('idle');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      if (holdTimeoutRef.current) clearTimeout(holdTimeoutRef.current);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [isBeginner, activeTab, timerState, startTimer, stopTimer]);

  const handleActionClick = () => {
    if (onToggleComplete) {
      onToggleComplete();
    } else if (onComplete) {
      onComplete();
    }
  };

  const getSpeedRating = (time: number) => {
    if (time < 1.3) return { label: 'Godlike TPS', color: 'text-rose-500 bg-rose-500/10 border-rose-500/30', icon: Flame };
    if (time < 2.2) return { label: 'Lightning Speed', color: 'text-amber-500 bg-amber-500/10 border-amber-500/30', icon: Zap };
    if (time < 3.8) return { label: 'Solid Execution', color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/30', icon: Award };
    return { label: 'Keep Practicing', color: 'text-sky-500 bg-sky-500/10 border-sky-500/30', icon: Trophy };
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
              </div>
              <p className="text-[10px] text-slate-500 dark:text-gray-400 font-mono tracking-wider">
                {isMultiPhase ? 'MULTI-PHASE EXAMPLE SOLVE BREAKDOWN' : 'ACADEMY LESSON MODULE'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
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
            
            {/* Algorithm Step-by-Step Overlay */}
            <div className="absolute top-4 sm:top-6 left-1/2 -translate-x-1/2 bg-white/90 dark:bg-[#111315]/90 backdrop-blur-md border border-slate-200/80 dark:border-white/10 px-4 sm:px-6 py-2 sm:py-2.5 rounded-2xl shadow-lg max-w-[90%] overflow-x-auto hide-scrollbar z-10">
              <div className="flex items-center gap-1.5 sm:gap-2">
                {lesson.algorithm.split(' ').map((move, idx) => (
                  <span 
                    key={idx} 
                    className={clsx(
                      "font-mono text-sm sm:text-base md:text-lg font-bold transition-all duration-200 px-1.5 py-0.5 rounded-md",
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

            {/* Scramble Tag if Verified Multi-Phase Solve */}
            {lesson.initialScramble && (
              <div className="absolute bottom-3 left-4 z-10 bg-black/40 backdrop-blur-md px-3 py-1 rounded-lg border border-white/10 hidden sm:flex items-center gap-1.5 text-[10px] font-mono text-slate-300">
                <Sparkles className="w-3 h-3 text-primary" /> Verified Solution Track
              </div>
            )}
          </div>

          {/* Right: Sidebar Instructions, Phase Tracking & Adaptive Controls */}
          <div className="w-full lg:w-[380px] xl:w-[420px] border-t lg:border-t-0 lg:border-l border-slate-200/80 dark:border-white/10 flex flex-col bg-white/50 dark:bg-white/[0.01] shrink-0">
            
            {/* Mode Switcher Tabs for Advanced Methods (Omitted for Beginner Method) */}
            {!isBeginner && (
              <div className="p-3 border-b border-slate-200/80 dark:border-white/10 bg-slate-100/50 dark:bg-white/[0.02] flex gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setActiveTab('tutorial')}
                  className={clsx(
                    "flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer",
                    activeTab === 'tutorial'
                      ? "bg-white dark:bg-white/10 text-primary shadow-sm border border-slate-200/80 dark:border-white/10"
                      : "text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white"
                  )}
                >
                  <PlayCircle className="w-3.5 h-3.5" /> Breakdown & 3D
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('timer')}
                  className={clsx(
                    "flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer",
                    activeTab === 'timer'
                      ? "bg-white dark:bg-white/10 text-primary shadow-sm border border-slate-200/80 dark:border-white/10"
                      : "text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white"
                  )}
                >
                  <Timer className="w-3.5 h-3.5 text-primary" /> Practice Timer
                </button>
              </div>
            )}

            {/* TAB CONTENT 1: Breakdown & Mechanics */}
            {activeTab === 'tutorial' && (
              <div className="p-5 sm:p-6 flex-1 overflow-y-auto space-y-4 text-left">
                
                {/* Multi-Phase Stepper Header */}
                {isMultiPhase && (
                  <div className="bg-primary/5 dark:bg-primary/10 border border-primary/20 rounded-xl p-3.5 flex flex-col gap-2">
                    <div className="flex justify-between items-center text-xs font-bold">
                      <span className="text-primary font-mono uppercase tracking-wider flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5" /> {activeStep.phase}
                      </span>
                      <span className="text-[10px] text-slate-500 dark:text-gray-400 font-mono">
                        Step {activeStepIndex + 1} of {steps.length}
                      </span>
                    </div>

                    {/* Progress Phase Pills */}
                    <div className="grid grid-cols-4 gap-1.5 pt-1">
                      {steps.map((_, sIdx) => (
                        <div 
                          key={sIdx}
                          className={clsx(
                            "h-1.5 rounded-full transition-all duration-300",
                            sIdx === activeStepIndex
                              ? "bg-primary shadow-[0_0_8px_var(--btn-glow-shadow)]"
                              : sIdx < activeStepIndex
                                ? "bg-emerald-500"
                                : "bg-slate-200 dark:bg-white/10"
                          )}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Explanation Content */}
                <div>
                  <h3 className="font-display font-bold text-lg sm:text-xl text-slate-900 dark:text-white mb-2 tracking-tight flex items-center gap-2">
                    {isMultiPhase ? activeStep.phase : "Mechanics & Piece Tracking"}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-700 dark:text-gray-300 leading-relaxed font-normal">
                    {isMultiPhase ? activeStep.explanation : lesson.explanation}
                  </p>
                </div>

                {/* Beginner Conceptual Trigger & Layer Guide */}
                {isBeginner && (
                  <div className="bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20 rounded-xl p-3.5 flex flex-col gap-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400">
                      <Lightbulb className="w-4 h-4" /> Beginner Layer Spotlight
                    </div>
                    <p className="text-xs text-slate-700 dark:text-gray-300 leading-relaxed">
                      Take your time studying the piece locations before turning. Rotate the 3D cube freely to inspect adjacent faces. No speed pressure—focus on mastering the muscle memory.
                    </p>
                  </div>
                )}

                {/* Speed Multiplier Quick Selection */}
                <div className="pt-2 border-t border-slate-200/80 dark:border-white/10 flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider font-mono">
                    Speed:
                  </span>
                  <div className="flex gap-1">
                    {[0.5, 1, 1.5, 2].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setSpeed(s)}
                        className={clsx(
                          "px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer",
                          speed === s
                            ? "bg-primary text-white shadow-sm"
                            : "bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white"
                        )}
                      >
                        {s}x
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT 2: Adaptive Practice Timer */}
            {activeTab === 'timer' && !isBeginner && (
              <div className="p-5 sm:p-6 flex-1 overflow-y-auto flex flex-col items-center justify-between text-center gap-4">
                
                {/* Algorithm Reminder Badge */}
                <div className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-3">
                  <span className="text-[10px] font-mono text-slate-500 dark:text-gray-400 uppercase tracking-wider block mb-1">
                    Target Algorithm
                  </span>
                  <span className="font-mono text-sm sm:text-base font-bold text-primary select-all">
                    {lesson.algorithm}
                  </span>
                </div>

                {/* Big Stopwatch Display */}
                <div className="flex flex-col items-center justify-center my-auto">
                  <div 
                    className={clsx(
                      "font-mono font-extrabold text-5xl sm:text-6xl tracking-tight transition-colors duration-200 select-none",
                      timerState === 'holding' && "text-amber-500 scale-105",
                      timerState === 'ready' && "text-emerald-500 scale-110",
                      timerState === 'running' && "text-primary animate-pulse",
                      timerState === 'stopped' && "text-slate-900 dark:text-white",
                      timerState === 'idle' && "text-slate-400 dark:text-gray-500"
                    )}
                  >
                    {elapsedTime.toFixed(2)}<span className="text-2xl sm:text-3xl text-slate-500">s</span>
                  </div>

                  {/* Status Helper Message */}
                  <div className="text-xs font-bold mt-3 transition-colors">
                    {timerState === 'idle' && (
                      <span className="text-slate-500 dark:text-gray-400">
                        Hold <kbd className="px-2 py-0.5 bg-slate-200 dark:bg-white/10 rounded-md font-mono text-[10px]">Spacebar</kbd> or press button below
                      </span>
                    )}
                    {timerState === 'holding' && (
                      <span className="text-amber-500">Hold steady...</span>
                    )}
                    {timerState === 'ready' && (
                      <span className="text-emerald-500 font-extrabold">RELEASE TO START!</span>
                    )}
                    {timerState === 'running' && (
                      <span className="text-primary font-bold">SOLVING... Press Space/Tap to Stop</span>
                    )}
                    {timerState === 'stopped' && (
                      <div className="flex flex-col items-center gap-1">
                        {(() => {
                          const rating = getSpeedRating(elapsedTime);
                          const Icon = rating.icon;
                          return (
                            <span className={clsx("inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full border", rating.color)}>
                              <Icon className="w-3.5 h-3.5" /> {rating.label}
                            </span>
                          );
                        })()}
                      </div>
                    )}
                  </div>
                </div>

                {/* Session PB and Mobile Tap Area */}
                <div className="w-full flex flex-col gap-2.5">
                  {personalBest !== null && (
                    <div className="flex justify-between items-center text-xs font-mono px-3 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-500 font-bold">
                      <span className="flex items-center gap-1.5"><Trophy className="w-3.5 h-3.5" /> Session Best</span>
                      <span>{personalBest.toFixed(2)}s</span>
                    </div>
                  )}

                  {/* Mobile Tap/Touch Hold Button */}
                  <button
                    type="button"
                    onPointerDown={() => {
                      if (timerState === 'running') {
                        stopTimer();
                      } else if (timerState === 'idle' || timerState === 'stopped') {
                        setTimerState('holding');
                        holdTimeoutRef.current = setTimeout(() => {
                          setTimerState('ready');
                        }, 280);
                      }
                    }}
                    onPointerUp={() => {
                      if (holdTimeoutRef.current) clearTimeout(holdTimeoutRef.current);
                      if (timerState === 'ready') {
                        startTimer();
                      } else if (timerState === 'holding') {
                        setTimerState('idle');
                      }
                    }}
                    className={clsx(
                      "h-12 w-full rounded-xl text-xs font-bold select-none cursor-pointer transition-all flex items-center justify-center gap-2",
                      timerState === 'running'
                        ? "bg-rose-500 text-white shadow-lg"
                        : timerState === 'ready'
                          ? "bg-emerald-500 text-white shadow-lg scale-98"
                          : timerState === 'holding'
                            ? "bg-amber-500 text-white"
                            : "bg-slate-200 dark:bg-white/10 text-slate-900 dark:text-white hover:bg-slate-300 dark:hover:bg-white/20"
                    )}
                  >
                    {timerState === 'running' ? 'Tap to Stop' : timerState === 'ready' ? 'Release to Start' : 'Press & Hold to Ready'}
                  </button>
                </div>
              </div>
            )}

            {/* Bottom Controls Bar (Playback & Standardized Action Button) */}
            <div className="p-4 sm:p-5 border-t border-slate-200/80 dark:border-white/10 bg-slate-50/80 dark:bg-[#111315]/80 flex flex-col gap-3.5 shrink-0">
              {activeTab === 'tutorial' && (
                <PlaybackControls 
                  isPlaying={isPlaying} 
                  togglePlay={togglePlay}
                  nextMove={nextMove} 
                  prevMove={prevMove}
                  speed={speed} 
                  setSpeed={setSpeed}
                  progress={totalMoves > 0 ? (currentTimelineIndex + 1) / totalMoves : 0}
                />
              )}
              
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