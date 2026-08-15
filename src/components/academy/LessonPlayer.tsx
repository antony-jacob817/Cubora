import { useState, useEffect, useRef, useCallback } from 'react';
import { 
  X, BookOpen, CheckCircle2, Lightbulb, Clock, RotateCcw, 
  ChevronRight, Timer, Play, Pause, RotateCw, Sparkles, Undo2,
  TrendingUp, Zap, Award, Trash2
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

type TabType = 'guide' | 'timer';
type TimerStatus = 'IDLE' | 'HOLDING' | 'READY' | 'RUNNING' | 'STOPPED';

export function LessonPlayer({
  lesson,
  nextLesson,
  onClose,
  onToggleComplete,
  onSelectNextLesson,
  isCompleted = false
}: LessonPlayerProps) {
  const [activeTab, setActiveTab] = useState<TabType>('guide');
  const [isToggling, setIsToggling] = useState(false);

  // ==========================================
  // 3D Playback Setup
  // ==========================================
  const lessonData = lesson.solveSteps && lesson.solveSteps.length > 0
    ? lesson.solveSteps
    : [{ phase: lesson.title, explanation: lesson.explanation, moves: lesson.algorithm }];
  
  const { 
    isPlaying, togglePlay, speed, setSpeed, nextMove, prevMove, 
    currentTimelineIndex, totalMoves, currentMove
  } = useSolvePlayback(lessonData);

  const movesList = lesson.algorithm.split(' ').filter(Boolean);

  const handleReset = () => {
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

  // ==========================================
  // In-Lesson Alg Timer Mode Setup
  // ==========================================
  const [timerStatus, setTimerStatus] = useState<TimerStatus>('IDLE');
  const [time, setTime] = useState(0);
  const [sessionTimes, setSessionTimes] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem(`cubora_alg_timer_${lesson.id}`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const holdTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const animFrameRef = useRef<number | null>(null);
  const isRunningRef = useRef(false);

  // Save session times to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(`cubora_alg_timer_${lesson.id}`, JSON.stringify(sessionTimes));
    } catch (e) {
      console.error(e);
    }
  }, [sessionTimes, lesson.id]);

  const bestTime = sessionTimes.length > 0 ? Math.min(...sessionTimes) : null;
  const averageTime = sessionTimes.length > 0 
    ? sessionTimes.reduce((a, b) => a + b, 0) / sessionTimes.length 
    : null;

  // Stop Timer
  const stopTimer = useCallback(() => {
    if (!isRunningRef.current) return;
    isRunningRef.current = false;
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    
    const finalElapsed = (performance.now() - startTimeRef.current) / 1000;
    setTime(finalElapsed);
    setTimerStatus('STOPPED');
    setSessionTimes(prev => [finalElapsed, ...prev]);
  }, []);

  // Start Timer Running
  const startTimer = useCallback(() => {
    isRunningRef.current = true;
    startTimeRef.current = performance.now();
    setTimerStatus('RUNNING');

    const update = () => {
      if (!isRunningRef.current) return;
      const elapsed = (performance.now() - startTimeRef.current) / 1000;
      setTime(elapsed);
      animFrameRef.current = requestAnimationFrame(update);
    };
    animFrameRef.current = requestAnimationFrame(update);
  }, []);

  // Keyboard Handler for Spacebar
  useEffect(() => {
    if (activeTab !== 'timer') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;

      if (e.code === 'Space') {
        e.preventDefault();
        if (isRunningRef.current) {
          stopTimer();
        } else if (timerStatus === 'IDLE' || timerStatus === 'STOPPED') {
          setTimerStatus('HOLDING');
          holdTimeoutRef.current = setTimeout(() => {
            setTimerStatus('READY');
          }, 300);
        }
      } else if (isRunningRef.current) {
        // Any other key stops the timer when running
        stopTimer();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        if (holdTimeoutRef.current) {
          clearTimeout(holdTimeoutRef.current);
        }
        if (timerStatus === 'READY') {
          startTimer();
        } else if (timerStatus === 'HOLDING') {
          setTimerStatus('IDLE');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      if (holdTimeoutRef.current) clearTimeout(holdTimeoutRef.current);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [activeTab, timerStatus, startTimer, stopTimer]);

  // Touch / Pointer Handlers for Mobile & Pad Click
  const handleTouchStart = () => {
    if (isRunningRef.current) {
      stopTimer();
    } else if (timerStatus === 'IDLE' || timerStatus === 'STOPPED') {
      setTimerStatus('HOLDING');
      holdTimeoutRef.current = setTimeout(() => {
        setTimerStatus('READY');
      }, 300);
    }
  };

  const handleTouchEnd = () => {
    if (holdTimeoutRef.current) {
      clearTimeout(holdTimeoutRef.current);
    }
    if (timerStatus === 'READY') {
      startTimer();
    } else if (timerStatus === 'HOLDING') {
      setTimerStatus('IDLE');
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }} 
      animate={{ opacity: 1, scale: 1 }} 
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.22 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 lg:p-8 bg-[#0B0F19]/85 backdrop-blur-2xl"
    >
      <div className="glass-panel bg-background/95 dark:bg-[#12151B]/95 border border-slate-200 dark:border-white/10 w-full max-w-5xl h-full max-h-[820px] rounded-3xl overflow-hidden shadow-2xl flex flex-col relative text-left">
        
        {/* Modal Header */}
        <div className="px-4 py-3 sm:px-6 sm:py-3.5 border-b border-slate-200/70 dark:border-white/10 flex justify-between items-center bg-white/70 dark:bg-[#181A1D]/80 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-primary/15 border border-primary/25 flex items-center justify-center shrink-0 text-primary">
              <BookOpen className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="font-display font-bold text-sm sm:text-lg text-slate-900 dark:text-white truncate">
                  {lesson.title}
                </h2>
                {lesson.difficulty && (
                  <span className="text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20 shrink-0">
                    {lesson.difficulty}
                  </span>
                )}
                {isCompleted && (
                  <span className="inline-flex items-center gap-1 text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 shrink-0">
                    <CheckCircle2 className="w-3 h-3" /> Mastered
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-gray-400 font-mono tracking-wider truncate">
                ACADEMY 3D MASTER LAB
              </p>
            </div>
          </div>
          
          <button 
            onClick={onClose} 
            className="p-2 text-slate-500 hover:text-slate-800 dark:text-gray-400 dark:hover:text-white bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 rounded-full transition-colors shrink-0 ml-2"
            title="Close Lab"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Main Content */}
        <div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-y-auto lg:overflow-hidden">
          
          {/* Left Viewport: 3D Cube Canvas & Algorithm Overlay */}
          <div className="flex-1 min-h-[280px] sm:min-h-[360px] lg:min-h-0 relative bg-gradient-to-b from-transparent via-primary/[0.02] to-primary/[0.08] touch-none flex flex-col">
            
            {/* 3D Canvas with user-requested Camera position & fov */}
            <CubeViewer 
              className="absolute inset-0"
              action={currentMove ? { index: currentTimelineIndex, move: currentMove } : null}
              speed={speed}
              currentTimelineIndex={currentTimelineIndex}
              cameraPosition={[3.2, 2.6, 4.2]}
              cameraFov={42}
            />

            {/* Algorithm Sequence Floating Visualizer */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white/85 dark:bg-[#181A1D]/90 backdrop-blur-md border border-slate-200 dark:border-white/15 px-4 py-2 sm:px-5 sm:py-3 rounded-2xl shadow-lg max-w-[92%] overflow-x-auto hide-scrollbar z-20">
              <div className="flex items-center gap-2 sm:gap-2.5 justify-center min-w-max">
                {movesList.map((move, idx) => {
                  const isActive = idx === currentTimelineIndex;
                  return (
                    <span 
                      key={idx} 
                      className={`font-mono text-base sm:text-xl font-bold transition-all duration-200 px-1 py-0.5 rounded ${
                        isActive 
                          ? 'text-primary scale-125 bg-primary/15 ring-2 ring-primary/40' 
                          : idx < currentTimelineIndex 
                            ? 'text-slate-400 dark:text-slate-500 line-through opacity-70' 
                            : 'text-slate-800 dark:text-gray-200'
                      }`}
                    >
                      {move}
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Scramble badge if Example Solve */}
            {lesson.scramble && (
              <div className="absolute top-16 left-4 z-20 max-w-[85%] sm:max-w-[60%] bg-white/90 dark:bg-black/60 border border-slate-200 dark:border-white/10 px-3 py-1.5 rounded-xl backdrop-blur-md text-[11px] font-mono text-slate-700 dark:text-gray-300">
                <span className="text-primary font-bold mr-1.5">Scramble:</span>
                <span className="truncate">{lesson.scramble}</span>
              </div>
            )}

            {/* Bottom 3D Hint */}
            <div className="absolute bottom-3 left-4 z-20 hidden sm:flex items-center gap-2 text-[10px] font-mono text-slate-500 dark:text-gray-400 bg-white/60 dark:bg-black/50 border border-slate-200 dark:border-white/10 px-3 py-1 rounded-lg backdrop-blur-sm pointer-events-none">
              <span>Rotate 3D cube with mouse • Scroll to zoom</span>
            </div>
          </div>

          {/* Right Sidebar: Tabs [ 3D Guide | Alg Timer ] */}
          <div className="w-full lg:w-[410px] border-t lg:border-t-0 lg:border-l border-slate-200/70 dark:border-white/10 flex flex-col bg-white/80 dark:bg-[#12151B]/95 backdrop-blur-xl shrink-0">
            
            {/* Sidebar Tab Switcher */}
            <div className="p-3 border-b border-slate-200/70 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02] flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => setActiveTab('guide')}
                className={clsx(
                  "flex-1 py-2 px-3 rounded-xl text-xs font-bold font-mono transition-all flex items-center justify-center gap-2",
                  activeTab === 'guide'
                    ? "bg-primary text-white shadow-sm"
                    : "text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5"
                )}
              >
                <BookOpen className="w-3.5 h-3.5" /> 3D Guide
              </button>
              
              <button
                onClick={() => setActiveTab('timer')}
                className={clsx(
                  "flex-1 py-2 px-3 rounded-xl text-xs font-bold font-mono transition-all flex items-center justify-center gap-2",
                  activeTab === 'timer'
                    ? "bg-primary text-white shadow-sm"
                    : "text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5"
                )}
              >
                <Timer className="w-3.5 h-3.5" /> Alg Timer
              </button>
            </div>

            {/* Tab 1: 3D Guide View */}
            {activeTab === 'guide' && (
              <div className="flex-1 flex flex-col min-h-0">
                <div className="p-4 sm:p-5 flex-1 overflow-y-auto space-y-4">
                  
                  {/* Algorithm Box */}
                  <div className="bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-3.5 text-left">
                    <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-slate-500 dark:text-gray-400 block mb-1">
                      Official Algorithm Sequence
                    </span>
                    <p className="font-mono text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-wide select-all">
                      {lesson.algorithm}
                    </p>
                  </div>

                  {/* Mechanics Explanation */}
                  <div className="text-left space-y-1.5">
                    <h3 className="font-display font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-primary" /> Mechanics & Objective
                    </h3>
                    <p className="text-slate-700 dark:text-gray-300 text-xs sm:text-sm leading-relaxed">
                      {lesson.explanation}
                    </p>
                  </div>

                  {/* Finger Trick Pro Tips */}
                  {lesson.fingerTrickTips && (
                    <div className="bg-primary/10 border border-primary/20 rounded-2xl p-3.5 text-left space-y-1.5">
                      <div className="flex items-center gap-1.5 text-primary font-bold text-xs uppercase tracking-wider">
                        <Lightbulb className="w-3.5 h-3.5 shrink-0" />
                        <span>Finger-Trick Pro Tip</span>
                      </div>
                      <p className="text-xs text-slate-800 dark:text-gray-200 leading-relaxed">
                        {lesson.fingerTrickTips}
                      </p>
                    </div>
                  )}

                  {/* Solve Steps Breakdown if Example Solve */}
                  {lesson.solveSteps && lesson.solveSteps.length > 0 && (
                    <div className="space-y-2 pt-2 border-t border-slate-200/70 dark:border-white/10">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-500 dark:text-gray-400 block">
                        Reconstruction Steps
                      </span>
                      <div className="space-y-1.5">
                        {lesson.solveSteps.map((step, sIdx) => (
                          <div key={sIdx} className="bg-white/60 dark:bg-white/[0.02] border border-slate-200/70 dark:border-white/5 rounded-xl p-2.5 text-xs text-left">
                            <div className="flex justify-between items-center mb-0.5">
                              <span className="font-bold text-primary font-mono">{step.phase}</span>
                              <span className="font-mono text-[10px] text-slate-500 dark:text-gray-400">{step.moves}</span>
                            </div>
                            <p className="text-slate-600 dark:text-gray-400 text-[11px]">{step.explanation}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Metadata Stats */}
                  <div className="flex items-center justify-between text-xs font-mono text-slate-500 dark:text-gray-400 pt-2 border-t border-slate-200/70 dark:border-white/5">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      Est. {lesson.estimatedTime || '5 min'}
                    </span>
                    <span>
                      Move {currentTimelineIndex >= 0 ? currentTimelineIndex + 1 : 0} / {totalMoves}
                    </span>
                  </div>
                </div>

                {/* 3D Playback Controls Footer */}
                <div className="p-4 sm:p-5 border-t border-slate-200/70 dark:border-white/10 bg-slate-50/70 dark:bg-[#181A1D]/60 space-y-3 shrink-0">
                  <PlaybackControls 
                    isPlaying={isPlaying} 
                    togglePlay={togglePlay}
                    nextMove={nextMove} 
                    prevMove={prevMove}
                    speed={speed} 
                    setSpeed={setSpeed}
                    progress={totalMoves > 0 ? (currentTimelineIndex + 1) / totalMoves : 0}
                  />

                  {/* Reset & Bidirectional Completion Toggle */}
                  <div className="flex items-center gap-2.5 pt-1">
                    <Button
                      variant="outline"
                      size="md"
                      onClick={handleReset}
                      className="h-10 px-3 rounded-xl flex items-center justify-center shrink-0 border-slate-200 dark:border-white/10"
                      title="Reset Algorithm"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </Button>

                    <Button 
                      variant={isCompleted ? "outline" : "glow"} 
                      size="lg"
                      disabled={isToggling}
                      onClick={handleToggleCompletion}
                      className={clsx(
                        "flex-1 h-10 rounded-xl text-xs sm:text-sm font-bold tracking-wide gap-2 justify-center transition-all",
                        isCompleted 
                          ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 hover:border-red-500/40 hover:text-red-500" 
                          : "text-white"
                      )}
                    >
                      {isCompleted ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          <span>Completed ✓ (Click to Undo)</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>{isToggling ? 'Updating...' : 'Mark as Completed'}</span>
                        </>
                      )}
                    </Button>

                    {nextLesson && onSelectNextLesson && (
                      <Button
                        variant="secondary"
                        size="md"
                        onClick={() => onSelectNextLesson(nextLesson)}
                        className="h-10 px-3 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold"
                        title={`Next: ${nextLesson.title}`}
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: Alg Timer Training Mode View */}
            {activeTab === 'timer' && (
              <div className="flex-1 flex flex-col min-h-0 p-4 sm:p-5 text-center justify-between">
                <div className="space-y-4">
                  {/* Alg Display Header */}
                  <div className="bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-3 text-center">
                    <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-slate-500 dark:text-gray-400 block mb-1">
                      Target Algorithm Notation
                    </span>
                    <p className="font-mono text-sm sm:text-base font-bold text-primary tracking-wide">
                      {lesson.algorithm}
                    </p>
                  </div>

                  {/* Timer Stats Bar */}
                  <div className="grid grid-cols-2 gap-2 text-left">
                    <div className="bg-white/70 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-2.5">
                      <div className="flex items-center gap-1.5 text-slate-500 dark:text-gray-400 text-[10px] font-mono font-bold uppercase">
                        <Award className="w-3.5 h-3.5 text-yellow-500" /> Best Time
                      </div>
                      <span className="font-mono text-lg font-bold text-slate-900 dark:text-white">
                        {bestTime ? `${bestTime.toFixed(2)}s` : '--'}
                      </span>
                    </div>

                    <div className="bg-white/70 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-2.5">
                      <div className="flex items-center gap-1.5 text-slate-500 dark:text-gray-400 text-[10px] font-mono font-bold uppercase">
                        <TrendingUp className="w-3.5 h-3.5 text-primary" /> Session Avg
                      </div>
                      <span className="font-mono text-lg font-bold text-slate-900 dark:text-white">
                        {averageTime ? `${averageTime.toFixed(2)}s` : '--'}
                      </span>
                    </div>
                  </div>

                  {/* Interactive Timer Pad */}
                  <div 
                    onMouseDown={handleTouchStart}
                    onMouseUp={handleTouchEnd}
                    onTouchStart={handleTouchStart}
                    onTouchEnd={handleTouchEnd}
                    className={clsx(
                      "w-full h-36 rounded-2xl border-2 flex flex-col items-center justify-center cursor-pointer select-none transition-all duration-150 relative overflow-hidden shadow-inner",
                      timerStatus === 'HOLDING' && "border-yellow-500 bg-yellow-500/10 scale-98",
                      timerStatus === 'READY' && "border-emerald-500 bg-emerald-500/20 scale-100",
                      timerStatus === 'RUNNING' && "border-primary bg-primary/10",
                      (timerStatus === 'IDLE' || timerStatus === 'STOPPED') && "border-dashed border-slate-300 dark:border-white/20 bg-slate-50 dark:bg-white/[0.02] hover:border-primary/50"
                    )}
                  >
                    <span className={clsx(
                      "font-mono text-4xl sm:text-5xl font-extrabold tracking-tight transition-colors",
                      timerStatus === 'READY' ? "text-emerald-500" :
                      timerStatus === 'HOLDING' ? "text-yellow-500" :
                      timerStatus === 'RUNNING' ? "text-primary" :
                      "text-slate-900 dark:text-white"
                    )}>
                      {time.toFixed(2)}
                      <span className="text-lg font-normal ml-1">s</span>
                    </span>

                    <span className="text-[11px] font-mono font-medium text-slate-500 dark:text-gray-400 mt-2">
                      {timerStatus === 'READY' ? "Release Spacebar to Start!" :
                       timerStatus === 'HOLDING' ? "Hold still..." :
                       timerStatus === 'RUNNING' ? "Executing... Press any key to stop" :
                       "Hold Spacebar or Click & Hold to Start"}
                    </span>
                  </div>

                  {/* Session Solve List */}
                  {sessionTimes.length > 0 && (
                    <div className="text-left space-y-1.5">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-gray-400">
                          Recent Solves ({sessionTimes.length})
                        </span>
                        <button 
                          onClick={() => setSessionTimes([])}
                          className="text-[10px] font-mono text-red-500 hover:underline flex items-center gap-1"
                        >
                          <Trash2 className="w-3 h-3" /> Clear
                        </button>
                      </div>
                      
                      <div className="flex items-center gap-1.5 overflow-x-auto hide-scrollbar py-1">
                        {sessionTimes.slice(0, 10).map((t, idx) => (
                          <span 
                            key={idx}
                            className="text-xs font-mono px-2 py-1 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-gray-300 shrink-0"
                          >
                            {t.toFixed(2)}s
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer Toggle Completion Button */}
                <div className="pt-3 border-t border-slate-200/70 dark:border-white/10">
                  <Button 
                    variant={isCompleted ? "outline" : "glow"} 
                    size="lg"
                    disabled={isToggling}
                    onClick={handleToggleCompletion}
                    className={clsx(
                      "w-full h-10 rounded-xl text-xs sm:text-sm font-bold tracking-wide gap-2 justify-center transition-all",
                      isCompleted 
                        ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20" 
                        : "text-white"
                    )}
                  >
                    {isCompleted ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        <span>Completed ✓ (Click to Undo)</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>{isToggling ? 'Updating...' : 'Mark as Completed'}</span>
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