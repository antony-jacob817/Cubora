import { useState, useEffect, useRef, useCallback } from 'react';
import { 
  X, BookOpen, CheckCircle2, Lightbulb, Clock, RotateCcw, 
  ChevronRight, Timer, Play, Pause, SkipBack, SkipForward,
  Sparkles, Undo2, Award, Flame, Check, RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { CubeViewer } from '@/components/3d/CubeViewer';
import { PlaybackControls } from '@/components/solver/PlaybackControls';
import { useSolvePlayback } from '@/hooks/useSolvePlayback';
import { useTheme } from '@/context/ThemeContext';
import type { Lesson } from '@/data/academy';
import { clsx } from 'clsx';

interface LessonPlayerProps {
  lesson: Lesson;
  nextLesson?: Lesson | null;
  onClose: () => void;
  onToggleComplete: (lessonId: string, isCompleted: boolean) => Promise<void> | void;
  onSelectNextLesson?: (next: Lesson) => void;
  isCompleted?: boolean;
}

export function LessonPlayer({
  lesson,
  nextLesson,
  onClose,
  onToggleComplete,
  onSelectNextLesson,
  isCompleted = false
}: LessonPlayerProps) {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState<'3d' | 'timer'>('3d');
  const [isUpdating, setIsUpdating] = useState(false);

  // --- 3D PLAYBACK HOOK ---
  const lessonData = [{ phase: lesson.title, explanation: lesson.explanation, moves: lesson.algorithm }];
  const { 
    isPlaying, togglePlay, speed, setSpeed, nextMove, prevMove, 
    currentTimelineIndex, totalMoves, currentMove
  } = useSolvePlayback(lessonData);

  const movesList = lesson.algorithm.split(' ').filter(Boolean);

  const handleResetPlayback = () => {
    for (let i = 0; i <= currentTimelineIndex; i++) {
      prevMove();
    }
  };

  // --- BIDIRECTIONAL COMPLETION TOGGLE ---
  const handleToggleCompletion = async () => {
    try {
      setIsUpdating(true);
      await onToggleComplete(lesson.id, !isCompleted);
    } catch (err) {
      console.error('Failed to toggle lesson completion:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  // --- INTERACTIVE ALGORITHM PRACTICE TIMER STATE ---
  const [timerState, setTimerState] = useState<'idle' | 'holding' | 'ready' | 'running' | 'stopped'>('idle');
  const [timeMs, setTimeMs] = useState(0);
  const [sessionTimes, setSessionTimes] = useState<number[]>([]);
  const holdTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);

  const bestTime = sessionTimes.length > 0 ? Math.min(...sessionTimes) : null;
  const averageTime = sessionTimes.length > 0 
    ? (sessionTimes.reduce((a, b) => a + b, 0) / sessionTimes.length) 
    : null;

  const startTimer = useCallback(() => {
    startTimeRef.current = performance.now();
    setTimerState('running');
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    timerIntervalRef.current = setInterval(() => {
      setTimeMs(performance.now() - startTimeRef.current);
    }, 10);
  }, []);

  const stopTimer = useCallback(() => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    const finalElapsed = performance.now() - startTimeRef.current;
    setTimeMs(finalElapsed);
    setTimerState('stopped');
    setSessionTimes(prev => [finalElapsed, ...prev]);
  }, []);

  const handlePointerDown = useCallback(() => {
    if (timerState === 'running') {
      stopTimer();
      return;
    }
    if (timerState === 'idle' || timerState === 'stopped') {
      setTimerState('holding');
      holdTimeoutRef.current = setTimeout(() => {
        setTimerState('ready');
      }, 300);
    }
  }, [timerState, stopTimer]);

  const handlePointerUp = useCallback(() => {
    if (holdTimeoutRef.current) clearTimeout(holdTimeoutRef.current);
    if (timerState === 'ready') {
      startTimer();
    } else if (timerState === 'holding') {
      setTimerState('idle');
    }
  }, [timerState, startTimer]);

  // Keyboard Spacebar Listener for Timer Tab
  useEffect(() => {
    if (activeTab !== 'timer') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !e.repeat && (e.target as HTMLElement).tagName !== 'INPUT') {
        e.preventDefault();
        handlePointerDown();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        handlePointerUp();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (holdTimeoutRef.current) clearTimeout(holdTimeoutRef.current);
    };
  }, [activeTab, handlePointerDown, handlePointerUp]);

  const formatTimer = (ms: number) => {
    const totalSeconds = ms / 1000;
    return totalSeconds.toFixed(2);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.97 }} 
      animate={{ opacity: 1, scale: 1 }} 
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 md:p-6 bg-black/80 dark:bg-black/85 backdrop-blur-xl"
    >
      <div className="w-full max-w-5xl h-full max-h-[85vh] glass-panel border border-slate-200/80 dark:border-white/15 flex flex-col overflow-hidden relative shadow-[0_0_60px_rgba(0,0,0,0.5)] rounded-3xl bg-white/95 dark:bg-[#111315]/95 text-slate-900 dark:text-white">
        
        {/* Header Bar */}
        <div className="px-4 sm:px-6 py-3.5 border-b border-slate-200/60 dark:border-white/10 flex justify-between items-center bg-slate-50/80 dark:bg-white/[0.02] shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-primary/15 border border-primary/20 flex items-center justify-center shrink-0">
              <BookOpen className="w-4 h-4 text-primary" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="font-display font-bold text-sm sm:text-lg text-slate-900 dark:text-white truncate">
                  {lesson.title}
                </h2>
                {lesson.difficulty && (
                  <span className="text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 shrink-0">
                    {lesson.difficulty}
                  </span>
                )}
                {isCompleted && (
                  <span className="inline-flex items-center gap-1 text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 shrink-0">
                    <CheckCircle2 className="w-3 h-3" /> Mastered
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 shrink-0">
            {/* Tab Switcher: 3D Visualizer vs Practice Timer */}
            <div className="flex items-center p-1 bg-slate-200/60 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl">
              <button
                onClick={() => setActiveTab('3d')}
                className={clsx(
                  "px-3 py-1 rounded-lg text-xs font-bold transition-all",
                  activeTab === '3d'
                    ? "bg-white dark:bg-white/15 text-primary shadow-sm"
                    : "text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white"
                )}
              >
                3D Visualizer
              </button>
              <button
                onClick={() => setActiveTab('timer')}
                className={clsx(
                  "px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5",
                  activeTab === 'timer'
                    ? "bg-white dark:bg-white/15 text-primary shadow-sm"
                    : "text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white"
                )}
              >
                <Timer className="w-3.5 h-3.5" /> Practice Timer
              </button>
            </div>

            <button 
              onClick={onClose} 
              className="p-1.5 text-slate-500 hover:text-slate-800 dark:text-gray-400 dark:hover:text-white bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 rounded-xl transition-colors shrink-0 ml-1"
              title="Close Lesson"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>

        {/* Tab 1: 3D Visualizer View */}
        {activeTab === '3d' && (
          <div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-hidden">
            
            {/* 3D Canvas Viewport */}
            <div className="flex-1 min-h-[260px] sm:min-h-[340px] lg:min-h-0 relative bg-gradient-to-b from-transparent via-primary/[0.02] to-primary/[0.06] touch-none flex flex-col">
              
              <CubeViewer 
                className="absolute inset-0"
                action={currentMove ? { index: currentTimelineIndex, move: currentMove } : null}
                speed={speed}
                currentTimelineIndex={currentTimelineIndex}
                cameraPosition={[3.2, 2.5, 4.2]}
                fov={38}
              />

              {/* Floating Top Algorithm Ribbon */}
              <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-white/90 dark:bg-[#181A1D]/90 backdrop-blur-md border border-slate-200/80 dark:border-white/15 px-4 py-2 rounded-2xl shadow-lg max-w-[92%] overflow-x-auto hide-scrollbar z-20">
                <div className="flex items-center gap-2 sm:gap-3 justify-center min-w-max">
                  {movesList.map((move, idx) => {
                    const isActive = idx === currentTimelineIndex;
                    return (
                      <span 
                        key={idx} 
                        className={`font-mono text-base sm:text-xl font-bold transition-all duration-150 px-1 py-0.5 rounded ${
                          isActive 
                            ? 'text-primary scale-125 bg-primary/10 ring-2 ring-primary/40' 
                            : idx < currentTimelineIndex 
                              ? 'text-slate-400 dark:text-slate-500 opacity-60' 
                              : 'text-slate-800 dark:text-gray-300'
                        }`}
                      >
                        {move}
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* Bottom Canvas Hint */}
              <div className="absolute bottom-3 left-3 z-20 hidden sm:flex items-center gap-2 text-[10px] font-mono text-slate-500 dark:text-gray-400 bg-white/60 dark:bg-black/40 border border-slate-200/50 dark:border-white/10 px-2.5 py-1 rounded-lg backdrop-blur-sm pointer-events-none">
                <span>Drag to rotate • Scroll to zoom</span>
              </div>
            </div>

            {/* Sidebar Instructions & Controls */}
            <div className="w-full lg:w-[380px] xl:w-[400px] border-t lg:border-t-0 lg:border-l border-slate-200/60 dark:border-white/10 flex flex-col bg-slate-50/50 dark:bg-[#111315]/80 shrink-0">
              
              {/* Instructions Detail List */}
              <div className="p-4 sm:p-5 flex-1 overflow-y-auto space-y-4 text-left">
                
                {/* Algorithm Code Box */}
                <div className="bg-slate-100/90 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 rounded-2xl p-3.5">
                  <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-slate-500 dark:text-gray-400 block mb-1">
                    Algorithm Sequence
                  </span>
                  <p className="font-mono text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-wider select-all">
                    {lesson.algorithm}
                  </p>
                </div>

                {/* Lesson Explanation */}
                <div className="space-y-1.5">
                  <h3 className="font-display font-bold text-sm text-slate-900 dark:text-white">
                    Mechanics & Concept
                  </h3>
                  <p className="text-slate-700 dark:text-gray-300 text-xs sm:text-sm leading-relaxed">
                    {lesson.explanation}
                  </p>
                </div>

                {/* Finger-Trick Tip */}
                {lesson.fingerTrickTips && (
                  <div className="bg-primary/10 border border-primary/20 rounded-2xl p-3.5 space-y-1.5">
                    <div className="flex items-center gap-1.5 text-primary font-bold text-[11px] uppercase tracking-wider">
                      <Lightbulb className="w-3.5 h-3.5 shrink-0" />
                      <span>Finger-Trick Execution</span>
                    </div>
                    <p className="text-xs text-slate-800 dark:text-gray-200 leading-relaxed">
                      {lesson.fingerTrickTips}
                    </p>
                  </div>
                )}

                {/* Timeline Progress Step */}
                <div className="flex items-center justify-between text-xs font-mono text-slate-500 dark:text-gray-400 pt-2 border-t border-slate-200/60 dark:border-white/5">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {lesson.estimatedTime || '5 min'}
                  </span>
                  <span>
                    Move {currentTimelineIndex >= 0 ? currentTimelineIndex + 1 : 0} of {totalMoves}
                  </span>
                </div>
              </div>

              {/* Playback Controls & Action Footer */}
              <div className="p-4 sm:p-5 border-t border-slate-200/60 dark:border-white/10 bg-white dark:bg-[#141618] space-y-3.5">
                <PlaybackControls 
                  isPlaying={isPlaying} 
                  togglePlay={togglePlay}
                  nextMove={nextMove} 
                  prevMove={prevMove}
                  speed={speed} 
                  setSpeed={setSpeed}
                  progress={totalMoves > 0 ? (currentTimelineIndex + 1) / totalMoves : 0}
                />

                <div className="flex items-center gap-2 pt-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleResetPlayback}
                    className="h-10 px-3 rounded-xl flex items-center justify-center shrink-0"
                    title="Reset to Start"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </Button>

                  {/* Bidirectional Completion Toggle */}
                  <Button 
                    variant={isCompleted ? "outline" : "glow"}
                    size="md"
                    disabled={isUpdating}
                    onClick={handleToggleCompletion}
                    className={clsx(
                      "flex-1 h-10 rounded-xl text-xs font-bold tracking-wide gap-1.5 justify-center transition-all",
                      isCompleted && "border-emerald-500/40 text-emerald-500 hover:bg-emerald-500/10"
                    )}
                  >
                    {isCompleted ? (
                      <>
                        <Undo2 className="w-3.5 h-3.5" />
                        <span>Mastered (Click to Undo)</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>{isUpdating ? 'Saving...' : 'Mark as Completed'}</span>
                      </>
                    )}
                  </Button>

                  {nextLesson && onSelectNextLesson && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => onSelectNextLesson(nextLesson)}
                      className="h-10 px-3 rounded-xl text-xs font-bold shrink-0 flex items-center gap-1"
                      title={`Next: ${nextLesson.title}`}
                    >
                      <span>Next</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Button>
                  )}
                </div>
              </div>

            </div>

          </div>
        )}

        {/* Tab 2: Interactive Practice Timer View */}
        {activeTab === 'timer' && (
          <div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-hidden">
            
            {/* Center: Live Timer Area */}
            <div 
              onPointerDown={handlePointerDown}
              onPointerUp={handlePointerUp}
              className="flex-1 flex flex-col items-center justify-center p-6 select-none cursor-pointer relative bg-gradient-to-b from-transparent via-primary/[0.02] to-primary/[0.08]"
            >
              {/* Algorithm Display at Top */}
              <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 px-6 py-2.5 rounded-2xl shadow-sm max-w-[90%] text-center">
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-500 dark:text-gray-400 block mb-0.5">
                  Algorithm to Practice
                </span>
                <span className="font-mono text-base sm:text-xl font-bold text-slate-900 dark:text-white">
                  {lesson.algorithm}
                </span>
              </div>

              {/* Big Stopwatch Display */}
              <div className="flex flex-col items-center justify-center gap-2">
                <span 
                  className={clsx(
                    "font-mono text-6xl sm:text-8xl md:text-9xl font-extrabold tracking-tight transition-colors duration-150",
                    timerState === 'ready' && "text-emerald-500 scale-105",
                    timerState === 'holding' && "text-amber-500",
                    timerState === 'running' && "text-primary animate-pulse",
                    (timerState === 'idle' || timerState === 'stopped') && "text-slate-900 dark:text-white"
                  )}
                >
                  {formatTimer(timeMs)}
                </span>

                {/* Status Indicator Badge */}
                <div className="mt-4">
                  {timerState === 'idle' && (
                    <span className="px-4 py-1.5 rounded-full text-xs font-mono font-bold bg-slate-200/70 dark:bg-white/10 text-slate-700 dark:text-gray-300">
                      Hold [SPACE] or Touch and Hold to Arm
                    </span>
                  )}
                  {timerState === 'holding' && (
                    <span className="px-4 py-1.5 rounded-full text-xs font-mono font-bold bg-amber-500/20 text-amber-500 border border-amber-500/30">
                      Hold still...
                    </span>
                  )}
                  {timerState === 'ready' && (
                    <span className="px-4 py-1.5 rounded-full text-xs font-mono font-bold bg-emerald-500/20 text-emerald-500 border border-emerald-500/30 animate-bounce">
                      Release to Start!
                    </span>
                  )}
                  {timerState === 'running' && (
                    <span className="px-4 py-1.5 rounded-full text-xs font-mono font-bold bg-primary/20 text-primary border border-primary/30">
                      Press SPACE or Tap to Stop
                    </span>
                  )}
                  {timerState === 'stopped' && (
                    <span className="px-4 py-1.5 rounded-full text-xs font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                      Execution Complete • Ready for Next Rep
                    </span>
                  )}
                </div>
              </div>

              {/* Bottom Hint */}
              <div className="absolute bottom-6 text-[11px] font-mono text-slate-400 dark:text-gray-550">
                Execute the algorithm cleanly on your physical cube while timing
              </div>
            </div>

            {/* Right: Session Stats & History Panel */}
            <div className="w-full lg:w-[320px] border-t lg:border-t-0 lg:border-l border-slate-200/60 dark:border-white/10 flex flex-col bg-slate-50/80 dark:bg-[#111315]/80 p-5 shrink-0 text-left">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200/60 dark:border-white/10 mb-4">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-gray-400 flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-primary" /> Session Stats
                </span>
                {sessionTimes.length > 0 && (
                  <button 
                    onClick={() => { setSessionTimes([]); setTimeMs(0); setTimerState('idle'); }}
                    className="text-[11px] font-mono text-slate-400 hover:text-red-400 transition-colors flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" /> Clear
                  </button>
                )}
              </div>

              {/* Stat Cards Grid */}
              <div className="grid grid-cols-2 gap-3 mb-5">
                <div className="bg-white dark:bg-white/5 border border-slate-200/80 dark:border-white/10 rounded-xl p-3">
                  <span className="text-[10px] font-mono text-slate-500 dark:text-gray-400 block mb-1">Repetitions</span>
                  <span className="text-xl font-mono font-bold text-slate-900 dark:text-white">
                    {sessionTimes.length}
                  </span>
                </div>
                <div className="bg-white dark:bg-white/5 border border-slate-200/80 dark:border-white/10 rounded-xl p-3">
                  <span className="text-[10px] font-mono text-slate-500 dark:text-gray-400 block mb-1">Best Time (PB)</span>
                  <span className="text-xl font-mono font-bold text-emerald-500">
                    {bestTime ? `${(bestTime / 1000).toFixed(2)}s` : '--'}
                  </span>
                </div>
                <div className="col-span-2 bg-white dark:bg-white/5 border border-slate-200/80 dark:border-white/10 rounded-xl p-3">
                  <span className="text-[10px] font-mono text-slate-500 dark:text-gray-400 block mb-1">Session Average</span>
                  <span className="text-lg font-mono font-bold text-slate-900 dark:text-white">
                    {averageTime ? `${(averageTime / 1000).toFixed(2)}s` : '--'}
                  </span>
                </div>
              </div>

              {/* Recent Attempt Times List */}
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-gray-400 mb-2 block">
                Recent Reps
              </span>
              <div className="flex-1 overflow-y-auto space-y-1.5 max-h-48 pr-1">
                {sessionTimes.length === 0 ? (
                  <p className="text-xs text-slate-400 dark:text-gray-500 italic py-4 text-center">
                    No reps logged yet. Hold space to start!
                  </p>
                ) : (
                  sessionTimes.map((t, idx) => (
                    <div 
                      key={idx} 
                      className="flex items-center justify-between text-xs font-mono px-3 py-1.5 rounded-lg bg-white/60 dark:bg-white/5 border border-slate-200/50 dark:border-white/5"
                    >
                      <span className="text-slate-400">Rep #{sessionTimes.length - idx}</span>
                      <span className={clsx("font-bold", t === bestTime ? "text-emerald-500" : "text-slate-800 dark:text-gray-200")}>
                        {(t / 1000).toFixed(2)}s
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        )}

      </div>
    </motion.div>
  );
}