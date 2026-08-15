import { useState, useEffect, useRef, useCallback } from 'react';
import { 
  X, BookOpen, CheckCircle2, Lightbulb, Clock, RotateCcw, 
  ChevronRight, Timer, Play, Pause, RotateCw, Trash2, Trophy, 
  Zap, Undo2, Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { CubeViewer } from '@/components/3d/CubeViewer';
import { PlaybackControls } from '@/components/solver/PlaybackControls';
import { useSolvePlayback } from '@/hooks/useSolvePlayback';
import type { Lesson } from '@/data/academyData';
import { clsx } from 'clsx';

interface LessonPlayerProps {
  lesson: Lesson;
  nextLesson?: Lesson | null;
  onClose: () => void;
  onToggleComplete: (lessonId: string) => Promise<void> | void;
  onSelectNextLesson?: (next: Lesson) => void;
  isCompleted?: boolean;
}

interface AlgSolveRecord {
  id: string;
  timeMs: number;
  date: Date;
}

export function LessonPlayer({
  lesson,
  nextLesson,
  onClose,
  onToggleComplete,
  onSelectNextLesson,
  isCompleted = false
}: LessonPlayerProps) {
  const [activeTab, setActiveTab] = useState<'guide' | 'timer'>('guide');
  const [isToggling, setIsToggling] = useState(false);

  // -------------------------------------------------------------
  // 3D Playback Engine
  // -------------------------------------------------------------
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

  const handleToggleCompletion = async () => {
    try {
      setIsToggling(true);
      await onToggleComplete(lesson.id);
    } catch (err) {
      console.error('Failed to toggle lesson completion:', err);
    } finally {
      setIsToggling(false);
    }
  };

  // -------------------------------------------------------------
  // Alg Timer Engine (Spacebar & Touch-and-Hold)
  // -------------------------------------------------------------
  const [timerState, setTimerState] = useState<'idle' | 'holding' | 'ready' | 'running'>('idle');
  const [elapsedTimeMs, setElapsedTimeMs] = useState(0);
  const [sessionSolves, setSessionSolves] = useState<AlgSolveRecord[]>([]);
  
  const holdTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);

  // Timer run effect
  useEffect(() => {
    if (timerState === 'running') {
      startTimeRef.current = performance.now();
      timerIntervalRef.current = setInterval(() => {
        setElapsedTimeMs(performance.now() - startTimeRef.current);
      }, 10);
    } else {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    }
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [timerState]);

  // Spacebar and Global Keyboard Handlers
  useEffect(() => {
    if (activeTab !== 'timer') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code !== 'Space' || e.repeat) return;
      e.preventDefault();

      if (timerState === 'running') {
        // Stop timer
        const finalTime = performance.now() - startTimeRef.current;
        setElapsedTimeMs(finalTime);
        setTimerState('idle');
        setSessionSolves(prev => [{ id: Math.random().toString(), timeMs: finalTime, date: new Date() }, ...prev]);
      } else if (timerState === 'idle') {
        // Prepare hold
        setTimerState('holding');
        holdTimeoutRef.current = setTimeout(() => {
          setTimerState('ready');
        }, 350);
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
        // Launch timer
        setElapsedTimeMs(0);
        setTimerState('running');
      } else if (timerState === 'holding') {
        // Released too early
        setTimerState('idle');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      if (holdTimeoutRef.current) clearTimeout(holdTimeoutRef.current);
    };
  }, [activeTab, timerState]);

  // Touch / Mouse button trigger handlers
  const handleTouchStart = () => {
    if (timerState === 'running') {
      const finalTime = performance.now() - startTimeRef.current;
      setElapsedTimeMs(finalTime);
      setTimerState('idle');
      setSessionSolves(prev => [{ id: Math.random().toString(), timeMs: finalTime, date: new Date() }, ...prev]);
    } else if (timerState === 'idle') {
      setTimerState('holding');
      holdTimeoutRef.current = setTimeout(() => {
        setTimerState('ready');
      }, 350);
    }
  };

  const handleTouchEnd = () => {
    if (holdTimeoutRef.current) {
      clearTimeout(holdTimeoutRef.current);
      holdTimeoutRef.current = null;
    }

    if (timerState === 'ready') {
      setElapsedTimeMs(0);
      setTimerState('running');
    } else if (timerState === 'holding') {
      setTimerState('idle');
    }
  };

  // Compute best time & average of 5
  const bestTimeMs = sessionSolves.length > 0 
    ? Math.min(...sessionSolves.map(s => s.timeMs)) 
    : null;

  const currentAo5 = sessionSolves.length >= 5 
    ? sessionSolves.slice(0, 5).reduce((acc, s) => acc + s.timeMs, 0) / 5 
    : null;

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 lg:p-8 bg-[#0B0F19]/80 dark:bg-[#070A10]/90 backdrop-blur-2xl"
    >
      <div className="glass-panel bg-background/95 dark:bg-[#12151B]/95 border border-slate-200 dark:border-white/10 max-w-5xl w-full h-full max-h-[850px] rounded-3xl overflow-hidden shadow-2xl flex flex-col relative text-left">
        
        {/* Modal Top Header Bar */}
        <div className="px-5 py-3.5 sm:px-6 sm:py-4 border-b border-slate-200/80 dark:border-white/10 flex justify-between items-center bg-slate-50/50 dark:bg-white/[0.02] shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 text-primary">
              <BookOpen className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="font-display font-bold text-base sm:text-lg text-slate-900 dark:text-white truncate">
                  {lesson.title}
                </h2>
                {lesson.difficulty && (
                  <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20 shrink-0">
                    {lesson.difficulty}
                  </span>
                )}
                {isCompleted && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 shrink-0">
                    <CheckCircle2 className="w-3 h-3" /> Mastered
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-gray-400 font-mono tracking-wider truncate mt-0.5">
                {lesson.group ? `${lesson.group.toUpperCase()} • ` : ''}3D INTERACTIVE LESSON
              </p>
            </div>
          </div>
          
          <button 
            onClick={onClose} 
            className="p-2 text-slate-500 hover:text-slate-800 dark:text-gray-400 dark:hover:text-white bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 rounded-full transition-colors shrink-0 ml-2"
            title="Close Lesson Player"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: 3D Viewport on Left + Controls / Alg Timer on Right */}
        <div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-y-auto lg:overflow-hidden">
          
          {/* Left: 3D Interactive Canvas Area */}
          <div className="flex-1 min-h-[300px] sm:min-h-[380px] lg:min-h-0 relative bg-gradient-to-b from-transparent via-primary/[0.01] to-primary/[0.06] touch-none flex flex-col">
            
            {/* 3D Cube Canvas Viewport */}
            <CubeViewer 
              className="absolute inset-0"
              action={currentMove ? { index: currentTimelineIndex, move: currentMove } : null}
              speed={speed}
              currentTimelineIndex={currentTimelineIndex}
            />

            {/* Floating Top Algorithm Sequence Display */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white/85 dark:bg-[#181A1D]/90 backdrop-blur-md border border-slate-200/80 dark:border-white/15 px-4 py-2.5 sm:px-6 sm:py-3.5 rounded-2xl shadow-lg max-w-[92%] overflow-x-auto hide-scrollbar z-20">
              <div className="flex items-center gap-2 sm:gap-3 justify-center min-w-max">
                {movesList.map((move, idx) => {
                  const isActive = idx === currentTimelineIndex;
                  return (
                    <span 
                      key={idx} 
                      className={clsx(
                        "font-mono text-lg sm:text-2xl font-bold transition-all duration-200 px-1 py-0.5 rounded",
                        isActive 
                          ? "text-primary scale-125 bg-primary/10 ring-2 ring-primary/40" 
                          : idx < currentTimelineIndex 
                            ? "text-slate-400 dark:text-slate-500 line-through opacity-70" 
                            : "text-slate-800 dark:text-gray-200"
                      )}
                    >
                      {move}
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Bottom Hint */}
            <div className="absolute bottom-4 left-4 z-20 hidden sm:flex items-center gap-2 text-[11px] font-mono text-slate-500 dark:text-gray-400 bg-white/60 dark:bg-black/40 border border-slate-200/60 dark:border-white/10 px-3 py-1.5 rounded-xl backdrop-blur-sm pointer-events-none">
              <span>Drag to rotate • Scroll to zoom</span>
            </div>
          </div>

          {/* Right: Sidebar Panel with Mode Tab Switcher */}
          <div className="w-full lg:w-[410px] border-t lg:border-t-0 lg:border-l border-slate-200/80 dark:border-white/10 flex flex-col bg-slate-50/40 dark:bg-[#111315]/80 backdrop-blur-lg shrink-0">
            
            {/* Tab Switcher Header */}
            <div className="p-3 border-b border-slate-200/80 dark:border-white/10 flex gap-1.5 bg-slate-100/60 dark:bg-black/20">
              <button
                onClick={() => setActiveTab('guide')}
                className={clsx(
                  "flex-1 py-2 px-3 rounded-xl text-xs font-bold font-display transition-all duration-200 flex items-center justify-center gap-1.5",
                  activeTab === 'guide'
                    ? "bg-white dark:bg-white/10 text-slate-900 dark:text-white shadow-sm border border-slate-200/80 dark:border-white/10"
                    : "text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white"
                )}
              >
                <BookOpen className="w-3.5 h-3.5" /> 3D Guide
              </button>
              <button
                onClick={() => setActiveTab('timer')}
                className={clsx(
                  "flex-1 py-2 px-3 rounded-xl text-xs font-bold font-display transition-all duration-200 flex items-center justify-center gap-1.5",
                  activeTab === 'timer'
                    ? "bg-white dark:bg-white/10 text-slate-900 dark:text-white shadow-sm border border-slate-200/80 dark:border-white/10"
                    : "text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white"
                )}
              >
                <Timer className="w-3.5 h-3.5 text-primary" /> Alg Timer
              </button>
            </div>

            {/* Tab 1: 3D Guide & Mechanics */}
            {activeTab === 'guide' && (
              <div className="flex-1 flex flex-col min-h-0">
                <div className="p-5 sm:p-6 flex-1 overflow-y-auto space-y-4 text-left">
                  
                  {/* Algorithm Box */}
                  <div className="bg-white/80 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 rounded-2xl p-4">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-500 dark:text-gray-400 block mb-1">
                      Notation Moves
                    </span>
                    <p className="font-mono text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-wider select-all">
                      {lesson.algorithm}
                    </p>
                  </div>

                  {/* Mechanics Explanation */}
                  <div className="space-y-1.5">
                    <h3 className="font-display font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                      Execution Mechanics
                    </h3>
                    <p className="text-slate-700 dark:text-gray-300 text-xs sm:text-sm leading-relaxed">
                      {lesson.explanation}
                    </p>
                  </div>

                  {/* Finger-Trick Tip */}
                  {lesson.fingerTrickTips && (
                    <div className="bg-primary/10 border border-primary/20 rounded-2xl p-4 space-y-1.5">
                      <div className="flex items-center gap-1.5 text-primary font-bold text-xs uppercase tracking-wider">
                        <Lightbulb className="w-4 h-4 shrink-0" />
                        <span>Finger-Trick Pro Tip</span>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-800 dark:text-gray-200 leading-relaxed">
                        {lesson.fingerTrickTips}
                      </p>
                    </div>
                  )}

                  {/* Example Solve Phases if available */}
                  {lesson.isExampleSolve && lesson.exampleSolveData && (
                    <div className="space-y-2 pt-2 border-t border-slate-200/60 dark:border-white/5">
                      <span className="text-xs font-mono font-bold text-primary uppercase tracking-wider block">
                        Solve Phases Breakdown
                      </span>
                      <div className="space-y-2">
                        {lesson.exampleSolveData.phases.map((ph, idx) => (
                          <div key={idx} className="bg-slate-100/80 dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/5 p-2.5 rounded-xl text-xs">
                            <div className="flex justify-between items-center mb-1 font-bold text-slate-900 dark:text-white">
                              <span>{ph.name}</span>
                              <span className="font-mono text-[10px] text-primary">{ph.moves}</span>
                            </div>
                            <p className="text-[11px] text-slate-600 dark:text-gray-400">{ph.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Move Timeline Stat */}
                  <div className="flex items-center justify-between text-xs font-mono text-slate-500 dark:text-gray-400 pt-2 border-t border-slate-200/60 dark:border-white/5">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      Est. {lesson.estimatedTime || '5 min'}
                    </span>
                    <span>
                      Move {currentTimelineIndex >= 0 ? currentTimelineIndex + 1 : 0} of {totalMoves}
                    </span>
                  </div>
                </div>

                {/* Guide Playback Controls Footer */}
                <div className="p-4 sm:p-5 border-t border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-[#111315]/90 space-y-3 shrink-0">
                  <PlaybackControls 
                    isPlaying={isPlaying} 
                    togglePlay={togglePlay}
                    nextMove={nextMove} 
                    prevMove={prevMove}
                    speed={speed} 
                    setSpeed={setSpeed}
                    progress={totalMoves > 0 ? (currentTimelineIndex + 1) / totalMoves : 0}
                  />

                  <div className="flex items-center gap-2.5 pt-1">
                    <Button
                      variant="outline"
                      size="md"
                      onClick={handleResetPlayback}
                      className="h-10 px-3 rounded-xl flex items-center justify-center shrink-0 border-slate-200 dark:border-white/10"
                      title="Reset Timeline"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </Button>

                    <Button 
                      variant={isCompleted ? "secondary" : "glow"}
                      size="lg"
                      disabled={isToggling}
                      onClick={handleToggleCompletion}
                      className={clsx(
                        "flex-1 h-10 rounded-xl text-xs sm:text-sm font-bold tracking-wide gap-2 justify-center transition-all",
                        isCompleted && "bg-emerald-500/10 text-emerald-500 border-emerald-500/30 hover:bg-emerald-500/20"
                      )}
                    >
                      {isCompleted ? (
                        <>
                          <Check className="w-4 h-4 text-emerald-500" />
                          <span>Completed ✓ (Click to Undo)</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          <span>{isToggling ? 'Saving...' : 'Mark as Completed'}</span>
                        </>
                      )}
                    </Button>

                    {nextLesson && onSelectNextLesson && (
                      <Button
                        variant="secondary"
                        size="md"
                        onClick={() => onSelectNextLesson(nextLesson)}
                        className="h-10 px-3 rounded-xl flex items-center justify-center shrink-0 gap-1 text-xs font-bold"
                        title="Go to next lesson"
                      >
                        <span>Next</span>
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: Alg Timer Training Mode */}
            {activeTab === 'timer' && (
              <div className="flex-1 flex flex-col min-h-0">
                <div className="p-5 sm:p-6 flex-1 overflow-y-auto space-y-4 text-left">
                  
                  {/* Alg Target Header */}
                  <div className="bg-white/80 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 rounded-2xl p-4 text-center">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-500 dark:text-gray-400 block mb-1">
                      Execution Target
                    </span>
                    <p className="font-mono text-lg sm:text-xl font-bold text-primary tracking-wider select-all">
                      {lesson.algorithm}
                    </p>
                  </div>

                  {/* Timer Display Box */}
                  <div 
                    onMouseDown={handleTouchStart}
                    onMouseUp={handleTouchEnd}
                    onTouchStart={handleTouchStart}
                    onTouchEnd={handleTouchEnd}
                    className={clsx(
                      "rounded-3xl p-6 sm:p-8 flex flex-col items-center justify-center cursor-pointer select-none transition-all duration-200 border text-center relative overflow-hidden",
                      timerState === 'ready' 
                        ? "bg-emerald-500/20 border-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.3)] text-emerald-400"
                        : timerState === 'holding'
                          ? "bg-amber-500/15 border-amber-500/40 text-amber-400"
                          : timerState === 'running'
                            ? "bg-primary/15 border-primary shadow-[0_0_30px_rgba(139,92,246,0.3)] text-white"
                            : "bg-white/60 dark:bg-black/30 border-slate-200/80 dark:border-white/10 text-slate-900 dark:text-white hover:border-primary/40"
                    )}
                  >
                    <div className="font-mono font-extrabold text-4xl sm:text-5xl tracking-tight leading-none mb-2">
                      {(elapsedTimeMs / 1000).toFixed(2)}<span className="text-xl opacity-70">s</span>
                    </div>

                    <span className="text-[11px] font-mono font-bold uppercase tracking-widest">
                      {timerState === 'ready' 
                        ? '🟢 Release to Start!' 
                        : timerState === 'holding' 
                          ? '🟡 Hold steady...' 
                          : timerState === 'running' 
                            ? '⏱️ Running (Press Space or Click to Stop)' 
                            : 'Hold Spacebar or Click & Hold to Start'}
                    </span>
                  </div>

                  {/* Session Stats Chips */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-white/60 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 rounded-xl p-2.5 text-center">
                      <span className="text-[9px] font-mono font-bold text-slate-500 dark:text-gray-400 uppercase block">Best Time</span>
                      <span className="font-mono font-bold text-xs sm:text-sm text-yellow-500">
                        {bestTimeMs ? `${(bestTimeMs / 1000).toFixed(2)}s` : '--'}
                      </span>
                    </div>
                    <div className="bg-white/60 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 rounded-xl p-2.5 text-center">
                      <span className="text-[9px] font-mono font-bold text-slate-500 dark:text-gray-400 uppercase block">Ao5 Avg</span>
                      <span className="font-mono font-bold text-xs sm:text-sm text-primary">
                        {currentAo5 ? `${(currentAo5 / 1000).toFixed(2)}s` : '--'}
                      </span>
                    </div>
                    <div className="bg-white/60 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 rounded-xl p-2.5 text-center">
                      <span className="text-[9px] font-mono font-bold text-slate-500 dark:text-gray-400 uppercase block">Attempts</span>
                      <span className="font-mono font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                        {sessionSolves.length}
                      </span>
                    </div>
                  </div>

                  {/* Session Attempts List */}
                  {sessionSolves.length > 0 && (
                    <div className="space-y-1.5 pt-2 border-t border-slate-200/60 dark:border-white/5">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-mono font-bold text-slate-500 dark:text-gray-400 uppercase">
                          Recent Solves
                        </span>
                        <button
                          onClick={() => setSessionSolves([])}
                          className="text-[10px] font-mono text-slate-400 hover:text-red-400 transition-colors flex items-center gap-1"
                        >
                          <Trash2 className="w-3 h-3" /> Clear
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto">
                        {sessionSolves.map((s, idx) => (
                          <span 
                            key={s.id} 
                            className={clsx(
                              "px-2.5 py-1 rounded-lg text-xs font-mono font-bold border",
                              s.timeMs === bestTimeMs 
                                ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/30 ring-1 ring-yellow-500/20" 
                                : "bg-white/80 dark:bg-white/5 text-slate-800 dark:text-gray-300 border-slate-200/80 dark:border-white/10"
                            )}
                          >
                            #{sessionSolves.length - idx}: {(s.timeMs / 1000).toFixed(2)}s
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                </div>

                {/* Footer with Completion Toggle in Timer Mode */}
                <div className="p-4 sm:p-5 border-t border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-[#111315]/90 shrink-0">
                  <Button 
                    variant={isCompleted ? "secondary" : "glow"}
                    size="lg"
                    disabled={isToggling}
                    onClick={handleToggleCompletion}
                    className={clsx(
                      "w-full h-10 rounded-xl text-xs sm:text-sm font-bold tracking-wide gap-2 justify-center transition-all",
                      isCompleted && "bg-emerald-500/10 text-emerald-500 border-emerald-500/30 hover:bg-emerald-500/20"
                    )}
                  >
                    {isCompleted ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-500" />
                        <span>Completed ✓ (Click to Undo)</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>{isToggling ? 'Saving...' : 'Mark as Completed'}</span>
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}

          </div>

        </div>
      </div>
    </motion.div>
  );
}