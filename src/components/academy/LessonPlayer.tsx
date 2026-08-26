import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X, PlayCircle, BookOpen, CheckCircle2, RotateCcw, Box, Timer, Zap, Trophy, RefreshCw } from 'lucide-react';
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

type TimerState = 'idle' | 'arming' | 'ready' | 'running' | 'stopped';

export function LessonPlayer({ lesson, courseId, isCompleted = false, onClose, onToggleComplete, onComplete }: LessonPlayerProps) {
  const isAlgorithmic = useMemo(() => {
    if (courseId) {
      return courseId !== 'beginner';
    }
    return !lesson.id.startsWith('b_') && lesson.id !== 'beginner_master_solve';
  }, [courseId, lesson.id]);

  const [activeTab, setActiveTab] = useState<'visualizer' | 'timer'>('visualizer');
  const [isDesktop, setIsDesktop] = useState<boolean>(() => typeof window !== 'undefined' ? window.innerWidth >= 1024 : true);

  // Practice Timer State
  const [timerState, setTimerState] = useState<TimerState>('idle');
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [sessionTimes, setSessionTimes] = useState<number[]>([]);
  const startTimeRef = useRef<number>(0);
  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const armingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  // Compute Multi-Phase Steps or Single Algorithm Step
  const steps = useMemo(() => {
    if (lesson.exampleSolve && lesson.exampleSolve.phases.length > 0) {
      return lesson.exampleSolve.phases.map(p => ({
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

  // Compute Initial Scramble (from Example Solve Scramble or Inverted Algorithm)
  const initialScramble = useMemo(() => {
    if (lesson.exampleSolve?.scramble) {
      return lesson.exampleSolve.scramble.split(' ').filter(Boolean);
    }
    const allMoves = lesson.algorithm.split(' ').filter(Boolean);
    const invert = (m: string) => m.includes("'") ? m.replace("'", "") : m.includes("2") ? m : m + "'";
    return allMoves.reverse().map(invert);
  }, [lesson]);
  
  const { 
    isPlaying, togglePlay, speed, setSpeed, nextMove, prevMove, 
    currentTimelineIndex, totalMoves, action, activeStepIndex 
  } = useSolvePlayback(steps);

  const activePhase = steps[activeStepIndex] || steps[0];

  // Stop Timer Routine
  const stopTimer = useCallback(() => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    const finalElapsed = (performance.now() - startTimeRef.current) / 1000;
    setElapsedTime(finalElapsed);
    setTimerState('stopped');
    setSessionTimes(prev => [finalElapsed, ...prev]);
  }, []);

  // Start Timer Routine
  const startTimer = useCallback(() => {
    startTimeRef.current = performance.now();
    setTimerState('running');
    setElapsedTime(0);
    timerIntervalRef.current = setInterval(() => {
      setElapsedTime((performance.now() - startTimeRef.current) / 1000);
    }, 16);
  }, []);

  // Keyboard Spacebar Handlers for Timer
  useEffect(() => {
    if (activeTab !== 'timer') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        if (timerState === 'running') {
          stopTimer();
        } else if (timerState === 'idle' || timerState === 'stopped') {
          if (!armingTimeoutRef.current) {
            setTimerState('arming');
            armingTimeoutRef.current = setTimeout(() => {
              setTimerState('ready');
            }, 350);
          }
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        if (armingTimeoutRef.current) {
          clearTimeout(armingTimeoutRef.current);
          armingTimeoutRef.current = null;
        }
        if (timerState === 'ready') {
          startTimer();
        } else if (timerState === 'arming') {
          setTimerState('idle');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      if (armingTimeoutRef.current) clearTimeout(armingTimeoutRef.current);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [activeTab, timerState, startTimer, stopTimer]);

  const handlePointerDown = () => {
    if (activeTab !== 'timer') return;
    if (timerState === 'running') {
      stopTimer();
    } else if (timerState === 'idle' || timerState === 'stopped') {
      setTimerState('arming');
      armingTimeoutRef.current = setTimeout(() => {
        setTimerState('ready');
      }, 350);
    }
  };

  const handlePointerUp = () => {
    if (activeTab !== 'timer') return;
    if (armingTimeoutRef.current) {
      clearTimeout(armingTimeoutRef.current);
      armingTimeoutRef.current = null;
    }
    if (timerState === 'ready') {
      startTimer();
    } else if (timerState === 'arming') {
      setTimerState('idle');
    }
  };

  const handleActionClick = () => {
    if (onToggleComplete) {
      onToggleComplete();
    } else if (onComplete) {
      onComplete();
    }
  };

  const bestTime = sessionTimes.length > 0 ? Math.min(...sessionTimes) : null;

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
                {lesson.exampleSolve ? `EXAMPLE SOLVE (${steps.length} PHASES)` : (lesson.group ? `${lesson.group.toUpperCase()} CASE` : 'ACADEMY MODULE')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Adaptive Mode Switcher (For Algorithmic Lessons) */}
            {isAlgorithmic && (
              <div className="flex items-center bg-slate-100 dark:bg-white/5 p-1 rounded-xl border border-slate-200/80 dark:border-white/10 mr-1 sm:mr-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('visualizer')}
                  className={clsx(
                    "flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer",
                    activeTab === 'visualizer'
                      ? "bg-white dark:bg-white/15 text-primary dark:text-white shadow-sm"
                      : "text-slate-500 dark:text-gray-400 hover:text-slate-800 dark:hover:text-white"
                  )}
                >
                  <Box className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">3D View</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('timer')}
                  className={clsx(
                    "flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer",
                    activeTab === 'timer'
                      ? "bg-white dark:bg-white/15 text-primary dark:text-white shadow-sm"
                      : "text-slate-500 dark:text-gray-400 hover:text-slate-800 dark:hover:text-white"
                  )}
                >
                  <Timer className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Practice Timer</span>
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

        {/* Layout Split */}
        <div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-y-auto lg:overflow-hidden">
          
          {/* Main Area: 3D Viewport OR Practice Timer */}
          <div className="flex-1 min-h-[280px] sm:min-h-[350px] lg:min-h-0 relative bg-gradient-to-b from-transparent to-primary/5 touch-none flex flex-col justify-center items-center overflow-hidden">
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
                <div className="absolute top-4 sm:top-6 left-1/2 -translate-x-1/2 bg-white/90 dark:bg-[#111315]/90 backdrop-blur-md border border-slate-200/80 dark:border-white/10 px-4 sm:px-6 py-2 sm:py-2.5 rounded-2xl shadow-lg max-w-[90%] overflow-x-auto hide-scrollbar z-10">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    {activePhase.moves.split(' ').map((move, idx) => (
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

                {/* Example Solve Phase Indicator Pill */}
                {lesson.exampleSolve && (
                  <div className="absolute bottom-4 left-4 z-10 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 text-white text-[11px] font-mono font-bold">
                    Phase {activeStepIndex + 1} / {steps.length}: {activePhase.phase}
                  </div>
                )}
              </>
            ) : (
              /* Practice Timer Interactive Panel */
              <div 
                className="absolute inset-0 flex flex-col items-center justify-center p-6 select-none cursor-pointer"
                onPointerDown={handlePointerDown}
                onPointerUp={handlePointerUp}
              >
                <div className="text-center max-w-lg w-full flex flex-col items-center gap-4 sm:gap-6">
                  {/* Algorithm Preview Badge */}
                  <div className="px-5 py-3 rounded-2xl bg-white/80 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 shadow-sm">
                    <span className="text-[10px] uppercase font-mono tracking-widest text-slate-500 dark:text-gray-400 block mb-1">
                      Target Algorithm
                    </span>
                    <span className="font-mono text-base sm:text-xl font-extrabold text-primary select-all">
                      {lesson.algorithm}
                    </span>
                  </div>

                  {/* Main Stopwatch Face */}
                  <motion.div 
                    animate={{
                      scale: timerState === 'ready' ? 1.04 : 1,
                      borderColor: timerState === 'ready' 
                        ? 'rgba(16, 185, 129, 0.6)' 
                        : timerState === 'arming' 
                        ? 'rgba(245, 158, 11, 0.6)' 
                        : 'rgba(255, 255, 255, 0.1)'
                    }}
                    className={clsx(
                      "w-64 sm:w-80 h-36 sm:h-44 rounded-3xl border-2 flex flex-col items-center justify-center shadow-xl backdrop-blur-md transition-colors",
                      timerState === 'ready' 
                        ? 'bg-emerald-500/10 shadow-[0_0_40px_rgba(16,185,129,0.2)]' 
                        : timerState === 'arming'
                        ? 'bg-amber-500/10 shadow-[0_0_30px_rgba(245,158,11,0.2)]'
                        : timerState === 'running'
                        ? 'bg-primary/10 shadow-[0_0_40px_var(--btn-glow-shadow)]'
                        : 'bg-white/60 dark:bg-[#181A1D]/80'
                    )}
                  >
                    <span className={clsx(
                      "font-mono text-4xl sm:text-6xl font-black tracking-tight",
                      timerState === 'ready' ? 'text-emerald-500' : timerState === 'arming' ? 'text-amber-500' : 'text-slate-900 dark:text-white'
                    )}>
                      {elapsedTime.toFixed(2)}s
                    </span>

                    <div className="mt-2 text-xs font-bold uppercase tracking-widest">
                      {timerState === 'idle' && <span className="text-slate-400">Hold Space or Touch to Arm</span>}
                      {timerState === 'arming' && <span className="text-amber-500 animate-pulse">Arming...</span>}
                      {timerState === 'ready' && <span className="text-emerald-500 flex items-center gap-1"><Zap className="w-3.5 h-3.5 fill-current" /> READY! RELEASE TO START</span>}
                      {timerState === 'running' && <span className="text-primary animate-pulse">TIMING EXECUTION</span>}
                      {timerState === 'stopped' && <span className="text-emerald-400">SOLVE RECORDED! HOLD AGAIN</span>}
                    </div>
                  </motion.div>

                  {/* Session Records Mini Dashboard */}
                  <div className="flex items-center gap-4 text-xs font-mono">
                    {bestTime !== null && (
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-600 dark:text-yellow-400 font-bold">
                        <Trophy className="w-3.5 h-3.5" /> Best: {bestTime.toFixed(2)}s
                      </div>
                    )}
                    <div className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 text-slate-600 dark:text-gray-400 font-bold">
                      Attempts: {sessionTimes.length}
                    </div>
                    {sessionTimes.length > 0 && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSessionTimes([]);
                          setElapsedTime(0);
                          setTimerState('idle');
                        }}
                        className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg transition-colors cursor-pointer"
                        title="Clear attempts"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right: Sidebar Instructions & Controls */}
          <div className="w-full lg:w-[380px] xl:w-[400px] border-t lg:border-t-0 lg:border-l border-slate-200/80 dark:border-white/10 flex flex-col bg-white/50 dark:bg-white/[0.01] shrink-0">
            <div className="p-5 sm:p-6 flex-1 overflow-y-auto space-y-4 text-left">
              <div>
                <h3 className="font-display font-bold text-lg sm:text-xl text-slate-900 dark:text-white mb-2 tracking-tight">
                  {lesson.exampleSolve ? activePhase.phase : 'Mechanics & Logic'}
                </h3>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-gray-300 leading-relaxed">
                  {lesson.exampleSolve ? activePhase.explanation : lesson.explanation}
                </p>
              </div>
              
              <div className="bg-primary/5 dark:bg-primary/10 border border-primary/20 rounded-xl p-3.5 flex items-start gap-2.5">
                <PlayCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <p className="text-xs text-slate-700 dark:text-gray-300 leading-relaxed font-medium">
                  {lesson.exampleSolve 
                    ? "Step through every phase using the playback bar. The 3D tracking engine solves from scramble to 100% finished state."
                    : "Step through each turn using the playback bar below. Rotate the 3D cube with your mouse or touch to analyze all face orientations."}
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