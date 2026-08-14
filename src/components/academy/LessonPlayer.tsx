import { useState, useEffect, useRef, useCallback } from 'react';
import { 
  X, BookOpen, CheckCircle2, XCircle, Lightbulb, Clock, RotateCcw, 
  ChevronRight, Box, Timer, Play, Pause, Zap, Award, Flame, RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { CubeViewer } from '@/components/3d/CubeViewer';
import { PlaybackControls } from '@/components/solver/PlaybackControls';
import { useSolvePlayback } from '@/hooks/useSolvePlayback';
import type { Lesson } from '@/data/academy';
import { clsx } from 'clsx';

interface LessonPlayerProps {
  lesson: Lesson;
  nextLesson?: Lesson | null;
  onClose: () => void;
  onComplete: (lessonId: string) => Promise<void> | void;
  onUncomplete: (lessonId: string) => Promise<void> | void;
  onSelectNextLesson?: (next: Lesson) => void;
  isCompleted?: boolean;
}

interface PracticeAttempt {
  id: string;
  timeMs: number;
  tps: number;
  createdAt: string;
}

export function LessonPlayer({
  lesson,
  nextLesson,
  onClose,
  onComplete,
  onUncomplete,
  onSelectNextLesson,
  isCompleted = false
}: LessonPlayerProps) {
  const [activeTab, setActiveTab] = useState<'3d' | 'timer'>('3d');
  const [isTogglingComplete, setIsTogglingComplete] = useState(false);

  // --- 3D PLAYBACK HOOK INTEGRATION ---
  const lessonData = [{ phase: lesson.title, explanation: lesson.explanation, moves: lesson.algorithm }];
  const { 
    isPlaying, togglePlay, speed, setSpeed, nextMove, prevMove, 
    currentTimelineIndex, totalMoves, currentMove
  } = useSolvePlayback(lessonData);

  const movesList = lesson.algorithm.split(' ').filter(Boolean);

  const handleReset3D = () => {
    for (let i = 0; i <= currentTimelineIndex; i++) {
      prevMove();
    }
  };

  // --- BIDIRECTIONAL MARK / UNMARK TOGGLE ---
  const handleToggleCompletion = async () => {
    try {
      setIsTogglingComplete(true);
      if (isCompleted) {
        await onUncomplete(lesson.id);
      } else {
        await onComplete(lesson.id);
        if (nextLesson && onSelectNextLesson) {
          onSelectNextLesson(nextLesson);
        }
      }
    } catch (err) {
      console.error('Failed to toggle completion:', err);
    } finally {
      setIsTogglingComplete(false);
    }
  };

  // --- INTERACTIVE TIMER PRACTICE MODE STATE ---
  type TimerState = 'idle' | 'holding' | 'ready' | 'running' | 'stopped';
  const [timerState, setTimerState] = useState<TimerState>('idle');
  const [timeMs, setTimeMs] = useState<number>(0);
  const [attempts, setAttempts] = useState<PracticeAttempt[]>([]);
  
  const timerRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const holdTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const formatTime = (ms: number) => {
    const totalSec = ms / 1000;
    return totalSec.toFixed(3);
  };

  const calculateTps = (ms: number) => {
    if (ms <= 0 || movesList.length === 0) return 0;
    return parseFloat((movesList.length / (ms / 1000)).toFixed(2));
  };

  const startTimer = useCallback(() => {
    setTimerState('running');
    startTimeRef.current = performance.now();
    timerRef.current = requestAnimationFrame(function update() {
      const elapsed = performance.now() - startTimeRef.current;
      setTimeMs(elapsed);
      timerRef.current = requestAnimationFrame(update);
    }) as unknown as number;
  }, []);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      cancelAnimationFrame(timerRef.current);
      timerRef.current = null;
    }
    const finalTime = performance.now() - startTimeRef.current;
    setTimeMs(finalTime);
    setTimerState('stopped');

    const calculatedTps = calculateTps(finalTime);
    const newAttempt: PracticeAttempt = {
      id: Date.now().toString(),
      timeMs: finalTime,
      tps: calculatedTps,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    };

    setAttempts(prev => [newAttempt, ...prev]);
  }, [movesList.length]);

  // Spacebar timer event listeners when Timer tab is active
  useEffect(() => {
    if (activeTab !== 'timer') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code !== 'Space' || e.repeat) return;
      e.preventDefault();

      if (timerState === 'running') {
        stopTimer();
      } else if (timerState === 'idle' || timerState === 'stopped') {
        setTimerState('holding');
        holdTimeoutRef.current = setTimeout(() => {
          setTimerState('ready');
        }, 300);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code !== 'Space') return;
      e.preventDefault();

      if (holdTimeoutRef.current) {
        clearTimeout(holdTimeoutRef.current);
        holdTimeoutRef.current = null;
      }

      if (timerState === 'ready') {
        startTimer();
      } else if (timerState === 'holding') {
        setTimerState('idle');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      if (holdTimeoutRef.current) clearTimeout(holdTimeoutRef.current);
      if (timerRef.current) cancelAnimationFrame(timerRef.current);
    };
  }, [activeTab, timerState, startTimer, stopTimer]);

  // Touch handlers for mobile practice timer
  const handleTouchStart = () => {
    if (activeTab !== 'timer') return;
    if (timerState === 'running') {
      stopTimer();
    } else if (timerState === 'idle' || timerState === 'stopped') {
      setTimerState('holding');
      holdTimeoutRef.current = setTimeout(() => {
        setTimerState('ready');
      }, 300);
    }
  };

  const handleTouchEnd = () => {
    if (activeTab !== 'timer') return;
    if (holdTimeoutRef.current) {
      clearTimeout(holdTimeoutRef.current);
      holdTimeoutRef.current = null;
    }
    if (timerState === 'ready') {
      startTimer();
    } else if (timerState === 'holding') {
      setTimerState('idle');
    }
  };

  const bestAttempt = attempts.length > 0
    ? [...attempts].sort((a, b) => a.timeMs - b.timeMs)[0]
    : null;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.96 }} 
      animate={{ opacity: 1, scale: 1 }} 
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-[#0B0F19]/85 backdrop-blur-xl"
    >
      {/* Resized Container: max-w-3xl, h-[80vh], max-h-[780px] */}
      <div className="w-full max-w-3xl h-[80vh] max-h-[780px] glass-panel bg-slate-900/95 dark:bg-[#0B0F19]/95 border border-slate-700/60 dark:border-white/15 shadow-2xl rounded-3xl flex flex-col overflow-hidden relative">
        
        {/* Modal Header */}
        <div className="px-4 py-3 sm:px-6 border-b border-slate-800 dark:border-white/10 flex justify-between items-center bg-slate-900/80 dark:bg-[#111315]/80 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center text-primary shrink-0">
              <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="font-display font-bold text-base sm:text-lg text-white truncate">
                  {lesson.title}
                </h2>
                {lesson.difficulty && (
                  <span className="text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-primary/20 text-primary border border-primary/30 shrink-0">
                    {lesson.difficulty}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-gray-400 font-mono tracking-wider truncate">
                {lesson.algorithm} ({movesList.length} Moves)
              </p>
            </div>
          </div>

          {/* Mode Selector Tabs: [ 3D Animation ] | [ Speed Practice Timer ] */}
          <div className="flex items-center gap-1 bg-black/40 border border-white/10 p-1 rounded-xl shrink-0 ml-2">
            <button
              onClick={() => setActiveTab('3d')}
              className={clsx(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer",
                activeTab === '3d'
                  ? "bg-primary text-white shadow-sm"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              )}
            >
              <Box className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">3D Animation</span>
            </button>
            <button
              onClick={() => setActiveTab('timer')}
              className={clsx(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer",
                activeTab === 'timer'
                  ? "bg-primary text-white shadow-sm"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              )}
            >
              <Timer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Speed Timer</span>
            </button>
          </div>

          {/* Close button */}
          <button 
            onClick={onClose} 
            className="p-1.5 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-colors shrink-0 ml-2 cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Main Body Content */}
        <div className="flex-1 min-h-0 flex flex-col relative overflow-hidden">

          {activeTab === '3d' ? (
            /* --- 3D ANIMATION VIEW MODE --- */
            <div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-hidden">
              
              {/* 3D Cube Viewport */}
              <div className="flex-1 min-h-[240px] sm:min-h-[300px] lg:min-h-0 relative bg-gradient-to-b from-transparent via-primary/[0.02] to-primary/[0.08] touch-none">
                <CubeViewer 
                  className="absolute inset-0"
                  action={currentMove ? { index: currentTimelineIndex, move: currentMove } : null}
                  speed={speed}
                  currentTimelineIndex={currentTimelineIndex}
                  cameraPosition={[4.8, 3.8, 6.2]}
                  fov={38}
                />

                {/* Top Algorithm Move Visualizer Overlay */}
                <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-[#181A1D]/90 backdrop-blur-md border border-white/15 px-4 py-2 rounded-xl shadow-lg max-w-[90%] overflow-x-auto hide-scrollbar z-20">
                  <div className="flex items-center gap-2 justify-center min-w-max">
                    {movesList.map((move, idx) => {
                      const isActive = idx === currentTimelineIndex;
                      return (
                        <span 
                          key={idx} 
                          className={clsx(
                            "font-mono text-base sm:text-xl font-bold transition-all duration-200 px-1 py-0.5 rounded",
                            isActive 
                              ? 'text-primary scale-125 bg-primary/20 ring-1 ring-primary' 
                              : idx < currentTimelineIndex 
                                ? 'text-gray-500 line-through opacity-60' 
                                : 'text-gray-300'
                          )}
                        >
                          {move}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Sidebar Mechanics & Controls */}
              <div className="w-full lg:w-[320px] border-t lg:border-t-0 lg:border-l border-white/10 flex flex-col bg-slate-900/60 dark:bg-[#111315]/80 shrink-0">
                
                <div className="p-4 flex-1 overflow-y-auto space-y-3.5 text-left">
                  {/* Algorithm Box */}
                  <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                    <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-gray-400 block mb-1">
                      Formula String
                    </span>
                    <p className="font-mono text-base font-bold text-white tracking-wider select-all">
                      {lesson.algorithm}
                    </p>
                  </div>

                  {/* Explanation */}
                  <div className="space-y-1">
                    <h3 className="font-display font-bold text-xs uppercase tracking-wider text-gray-300">
                      Mechanics
                    </h3>
                    <p className="text-gray-300 text-xs leading-relaxed">
                      {lesson.explanation}
                    </p>
                  </div>

                  {/* Finger Tricks */}
                  {lesson.fingerTrickTips && (
                    <div className="bg-primary/10 border border-primary/20 rounded-xl p-3 space-y-1">
                      <div className="flex items-center gap-1.5 text-primary font-bold text-[10px] uppercase tracking-wider">
                        <Lightbulb className="w-3.5 h-3.5" />
                        <span>Finger-Trick Tip</span>
                      </div>
                      <p className="text-xs text-gray-200 leading-relaxed">
                        {lesson.fingerTrickTips}
                      </p>
                    </div>
                  )}
                </div>

                {/* 3D Playback Controls Footer */}
                <div className="p-4 border-t border-white/10 bg-black/40 space-y-3">
                  <PlaybackControls 
                    isPlaying={isPlaying} 
                    togglePlay={togglePlay}
                    nextMove={nextMove} 
                    prevMove={prevMove}
                    speed={speed} 
                    setSpeed={setSpeed}
                    progress={totalMoves > 0 ? (currentTimelineIndex + 1) / totalMoves : 0}
                  />

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleReset3D}
                      className="h-9 px-3 rounded-xl flex items-center justify-center shrink-0 border-white/10 text-gray-300 hover:text-white"
                      title="Reset Animation"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>

              </div>

            </div>
          ) : (
            /* --- SPEED PRACTICE TIMER MODE --- */
            <div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-hidden bg-[#0D1017]">
              
              {/* Interactive Timer Interactive Touch Area */}
              <div 
                onMouseDown={handleTouchStart}
                onMouseUp={handleTouchEnd}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
                className={clsx(
                  "flex-1 p-6 flex flex-col items-center justify-center relative select-none cursor-pointer transition-colors duration-200 text-center",
                  timerState === 'holding' && "bg-amber-500/10",
                  timerState === 'ready' && "bg-emerald-500/15",
                  timerState === 'running' && "bg-primary/10",
                  timerState === 'stopped' && "bg-emerald-500/[0.04]",
                  timerState === 'idle' && "hover:bg-white/[0.02]"
                )}
              >
                {/* Algorithm Target Formula */}
                <div className="mb-6 bg-black/50 border border-white/10 px-5 py-2.5 rounded-2xl max-w-md">
                  <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest block mb-1">
                    Execute Algorithm Formula
                  </span>
                  <p className="font-mono text-xl sm:text-2xl font-bold text-white tracking-wider">
                    {lesson.algorithm}
                  </p>
                </div>

                {/* Big Timer Display */}
                <div className="my-4">
                  <span 
                    className={clsx(
                      "font-mono text-5xl sm:text-7xl font-bold tracking-tight transition-colors duration-150",
                      timerState === 'holding' && "text-amber-400",
                      timerState === 'ready' && "text-emerald-400 drop-shadow-[0_0_20px_rgba(52,211,153,0.5)]",
                      timerState === 'running' && "text-cyan-400 animate-pulse",
                      timerState === 'stopped' && "text-emerald-400",
                      timerState === 'idle' && "text-white opacity-80"
                    )}
                  >
                    {formatTime(timeMs)}s
                  </span>
                </div>

                {/* Single-Execution Speed (TPS) Display */}
                {timeMs > 0 && timerState === 'stopped' && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/30 px-4 py-1.5 rounded-xl text-emerald-400 font-mono text-sm font-bold my-2"
                  >
                    <Zap className="w-4 h-4 text-emerald-400" />
                    <span>Speed: {calculateTps(timeMs)} TPS</span>
                    <span className="text-gray-400 text-xs font-normal">({movesList.length} moves)</span>
                  </motion.div>
                )}

                {/* Dynamic Timer Instruction Overlay */}
                <div className="mt-4 text-xs font-mono text-gray-400">
                  {timerState === 'idle' && "Hold [Spacebar] or Touch screen to start..."}
                  {timerState === 'holding' && "Keep holding..."}
                  {timerState === 'ready' && "Release to Launch Timer!"}
                  {timerState === 'running' && "Press [Spacebar] or Touch screen to STOP"}
                  {timerState === 'stopped' && "Hold [Spacebar] or Touch screen for next attempt"}
                </div>
              </div>

              {/* Session Attempts Practice Log Sidebar */}
              <div className="w-full lg:w-[280px] border-t lg:border-t-0 lg:border-l border-white/10 flex flex-col bg-slate-900/60 dark:bg-[#111315]/80 shrink-0 p-4">
                <div className="flex items-center justify-between mb-3 border-b border-white/10 pb-2">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Flame className="w-4 h-4 text-amber-500" /> Practice Attempts
                  </span>
                  {bestAttempt && (
                    <span className="text-[10px] font-mono text-amber-400 font-bold bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded">
                      PB: {formatTime(bestAttempt.timeMs)}s
                    </span>
                  )}
                </div>

                <div className="flex-1 overflow-y-auto space-y-2 pr-1 hide-scrollbar">
                  {attempts.length === 0 ? (
                    <div className="text-center py-8 text-xs text-gray-500">
                      No attempts yet this session. Launch timer to log speed!
                    </div>
                  ) : (
                    attempts.map((att, index) => {
                      const isBest = bestAttempt && bestAttempt.id === att.id;
                      return (
                        <div 
                          key={att.id}
                          className={clsx(
                            "flex items-center justify-between p-2.5 rounded-xl border text-xs font-mono transition-colors",
                            isBest 
                              ? "bg-amber-500/10 border-amber-500/30 text-white" 
                              : "bg-white/5 border-white/5 text-gray-300"
                          )}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-gray-500 font-bold">#{attempts.length - index}</span>
                            <span className="font-bold text-sm">{formatTime(att.timeMs)}s</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-gray-400 text-[11px]">
                            <Zap className="w-3 h-3 text-primary" />
                            <span>{att.tps} TPS</span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Modal Footer: Bidirectional Completion Toggle */}
        <div className="px-5 py-3.5 border-t border-slate-800 dark:border-white/10 bg-slate-900 dark:bg-[#111315] flex items-center justify-between shrink-0 gap-3">
          <div className="flex items-center gap-2 text-xs font-mono text-gray-400">
            {isCompleted ? (
              <span className="text-emerald-400 flex items-center gap-1.5 font-bold">
                <CheckCircle2 className="w-4 h-4" /> Lesson Mastered
              </span>
            ) : (
              <span>Status: Incomplete</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant={isCompleted ? "secondary" : "glow"}
              size="md"
              disabled={isTogglingComplete}
              onClick={handleToggleCompletion}
              className="h-10 px-4 rounded-xl text-xs font-bold gap-2 cursor-pointer"
            >
              {isCompleted ? (
                <>
                  <XCircle className="w-4 h-4 text-red-400" />
                  <span>Completed (Click to Unmark)</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>{isTogglingComplete ? 'Saving...' : 'Mark as Completed'}</span>
                </>
              )}
            </Button>

            {nextLesson && (
              <Button
                variant="outline"
                size="md"
                onClick={() => onSelectNextLesson && onSelectNextLesson(nextLesson)}
                className="h-10 px-3 rounded-xl text-xs font-bold gap-1 border-white/10 text-gray-300 hover:text-white cursor-pointer"
                title="Next Lesson"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>

      </div>
    </motion.div>
  );
}