import { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { X, PlayCircle, BookOpen, CheckCircle2, RotateCcw, Zap, Compass, Target } from 'lucide-react';
import { motion } from 'framer-motion';
import { CubeViewer } from '@/components/3d/CubeViewer';
import { PlaybackControls } from '@/components/solver/PlaybackControls';
import { useSolvePlayback } from '@/hooks/useSolvePlayback';
import type { Lesson } from '@/data/academy';
import { clsx } from 'clsx';

interface LessonPlayerProps {
  lesson: Lesson;
  methodName?: string;
  isCompleted?: boolean;
  onClose: () => void;
  onToggleComplete?: () => void;
  onComplete?: () => void;
}

export function LessonPlayer({ 
  lesson, 
  methodName = 'CFOP', 
  isCompleted = false, 
  onClose, 
  onToggleComplete, 
  onComplete 
}: LessonPlayerProps) {
  const navigate = useNavigate();
  const [isDesktop, setIsDesktop] = useState<boolean>(() => typeof window !== 'undefined' ? window.innerWidth >= 1024 : true);

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

  const hasPhases = Boolean(lesson.phases && lesson.phases.length > 0);

  // Wrap the single algorithm or multi-phase sequence into steps
  const steps = useMemo(() => {
    if (lesson.phases && lesson.phases.length > 0) {
      return lesson.phases.map(p => ({
        phase: p.name,
        explanation: p.explanation,
        moves: p.moves,
        subtitles: p.subtitles || p.explanation,
        trackingTip: p.trackingTip
      }));
    }
    return [{
      phase: lesson.title,
      explanation: lesson.explanation,
      moves: lesson.algorithm,
      subtitles: lesson.explanation,
      trackingTip: undefined
    }];
  }, [lesson]);

  const initialScramble = useMemo(() => {
    if (lesson.scramble) {
      return lesson.scramble.split(' ').filter(Boolean);
    }
    const allMoves = lesson.algorithm.split(' ').filter(Boolean);
    const invert = (m: string) => m.includes("'") ? m.replace("'", "") : m.includes("2") ? m : m + "'";
    return allMoves.reverse().map(invert);
  }, [lesson.algorithm, lesson.scramble]);
  
  const { 
    isPlaying, togglePlay, speed, setSpeed, nextMove, prevMove, 
    goToStep,
    currentTimelineIndex, totalMoves, action, activeStepIndex 
  } = useSolvePlayback(steps);

  const currentStepObj = steps[activeStepIndex] || steps[0];

  const handleActionClick = () => {
    if (onToggleComplete) {
      onToggleComplete();
    } else if (onComplete) {
      onComplete();
    }
  };

  const handlePracticeInTimer = () => {
    onClose();
    navigate('/practice', {
      state: {
        preloadScramble: lesson.scramble || lesson.algorithm,
        preloadMethod: methodName,
        preloadTitle: lesson.title
      }
    });
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
        <div className="px-5 py-3 sm:px-6 sm:py-3.5 border-b border-slate-200/80 dark:border-white/10 flex justify-between items-center bg-white/80 dark:bg-white/[0.02] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
              {lesson.isExampleSolve ? (
                <Compass className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              ) : (
                <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display font-bold text-base sm:text-lg text-slate-900 dark:text-white leading-tight">
                  {lesson.title}
                </h2>
                {lesson.isExampleSolve && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold font-mono text-amber-500 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
                    <Compass className="w-3 h-3" /> Masterclass Solve
                  </span>
                )}
                {isCompleted && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold font-mono text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                    <CheckCircle2 className="w-3 h-3" /> Mastered
                  </span>
                )}
              </div>
              <p className="text-[10px] text-slate-500 dark:text-gray-400 font-mono tracking-wider">
                {methodName.toUpperCase()} {hasPhases ? '• MULTI-PHASE WALKTHROUGH' : '• LESSON MODULE'}
              </p>
            </div>
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

        {/* Layout Split: Desktop 2-Column (Left: 3D Canvas, Right: Details & Controls) / Mobile Stacked */}
        <div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-y-auto lg:overflow-hidden">
          
          {/* Left: 3D Interaction Area */}
          <div className="flex-1 min-h-[300px] sm:min-h-[360px] lg:min-h-0 relative bg-gradient-to-b from-transparent to-primary/5 touch-none flex flex-col justify-center items-center overflow-hidden">
            <CubeViewer 
              className="absolute inset-0"
              action={action}
              speed={speed}
              currentTimelineIndex={currentTimelineIndex}
              initialScramble={initialScramble}
              cameraPosition={isDesktop ? [5.65, 4.45, 7.3] : [4.8, 3.8, 6.2]}
              cameraFov={32}
            />
            
            {/* Top: Current Phase Algorithm Overlay */}
            <div className="absolute top-3 sm:top-4 left-1/2 -translate-x-1/2 bg-white/90 dark:bg-[#111315]/90 backdrop-blur-md border border-slate-200/80 dark:border-white/10 px-4 sm:px-5 py-1.5 sm:py-2 rounded-2xl shadow-lg max-w-[92%] overflow-x-auto hide-scrollbar z-10">
              <div className="flex items-center gap-1.5 sm:gap-2">
                {currentStepObj.moves.split(' ').filter(Boolean).map((move, idx) => (
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

            {/* Bottom: Dynamic Coaching Subtitles Card with Piece Tracking Logic */}
            <div className="absolute bottom-3 left-3 right-3 sm:bottom-4 sm:left-4 sm:right-4 z-10 pointer-events-none flex justify-center">
              <div className="bg-white/95 dark:bg-[#111315]/95 backdrop-blur-md border border-slate-200/90 dark:border-white/10 p-3 sm:p-3.5 rounded-2xl shadow-xl max-w-lg w-full pointer-events-auto transition-all">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-[10px] font-bold font-mono uppercase tracking-wider text-primary flex items-center gap-1.5">
                    <Compass className="w-3.5 h-3.5" />
                    {currentStepObj.phase}
                  </span>
                  <span className="text-[10px] font-mono text-slate-500 dark:text-gray-400">
                    Phase {activeStepIndex + 1} of {steps.length}
                  </span>
                </div>
                <p className="text-xs text-slate-800 dark:text-gray-200 font-medium leading-relaxed">
                  {currentStepObj.subtitles}
                </p>
                {currentStepObj.trackingTip && (
                  <div className="mt-1.5 pt-1.5 border-t border-slate-200/60 dark:border-white/5 flex items-center gap-1.5 text-[11px] text-amber-600 dark:text-amber-400 font-semibold">
                    <Target className="w-3 h-3 shrink-0" />
                    <span>Tip: {currentStepObj.trackingTip}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right: Sidebar Instructions, Phase Timeline & Controls */}
          <div className="w-full lg:w-[380px] xl:w-[420px] border-t lg:border-t-0 lg:border-l border-slate-200/80 dark:border-white/10 flex flex-col bg-white/50 dark:bg-white/[0.01] shrink-0">
            
            {/* Scrollable Content Container */}
            <div className="p-4 sm:p-5 flex-1 overflow-y-auto space-y-4 text-left">
              
              {/* Multi-Phase YouTube-Style Timeline Navigation */}
              {hasPhases && (
                <div>
                  <h4 className="text-[10px] font-bold text-slate-500 dark:text-gray-400 font-mono uppercase tracking-wider mb-2">
                    Solve Phase Timeline
                  </h4>
                  <div className="flex flex-row overflow-x-auto gap-1.5 pb-2 pt-0.5 hide-scrollbar snap-x scroll-smooth">
                    {steps.map((step, sIdx) => {
                      const isStepActive = activeStepIndex === sIdx;
                      return (
                        <button
                          key={sIdx}
                          type="button"
                          onClick={() => goToStep(sIdx)}
                          className={clsx(
                            "px-2.5 py-1.5 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all flex items-center gap-1.5 snap-start shrink-0 cursor-pointer",
                            isStepActive
                              ? "bg-primary text-white shadow-md shadow-primary/20 border border-primary"
                              : "bg-white/80 dark:bg-white/5 text-slate-700 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-white/10 border border-slate-200/60 dark:border-white/10"
                          )}
                        >
                          <span className={clsx(
                            "w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-mono",
                            isStepActive ? "bg-white/20 text-white" : "bg-black/5 dark:bg-white/10 text-slate-600 dark:text-gray-400"
                          )}>
                            {sIdx + 1}
                          </span>
                          <span>{step.phase.replace(/^\d+\.\s*/, '')}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div>
                <h3 className="font-display font-bold text-base sm:text-lg text-slate-900 dark:text-white mb-1.5 tracking-tight">
                  Mechanics & Logic
                </h3>
                <p className="text-xs text-slate-700 dark:text-gray-300 leading-relaxed">
                  {currentStepObj.explanation}
                </p>
              </div>
              
              <div className="bg-primary/5 dark:bg-primary/10 border border-primary/20 rounded-xl p-3 flex items-start gap-2.5">
                <PlayCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <p className="text-xs text-slate-700 dark:text-gray-300 leading-relaxed font-medium">
                  Use the controls below to step through turns. Switch playback speeds to study piece trajectories frame-by-frame.
                </p>
              </div>
            </div>

            {/* Bottom Controls Bar */}
            <div className="p-3.5 sm:p-4 border-t border-slate-200/80 dark:border-white/10 bg-slate-50/80 dark:bg-[#111315]/80 flex flex-col gap-3 shrink-0">
              
              {/* Speedcubing Method-Aware Playback Speed Controls */}
              <PlaybackControls 
                isPlaying={isPlaying} 
                togglePlay={togglePlay}
                nextMove={nextMove} 
                prevMove={prevMove}
                speed={speed} 
                setSpeed={setSpeed}
                method={methodName}
                progress={totalMoves > 0 ? (currentTimelineIndex + 1) / totalMoves : 0}
              />
              
              {/* Action Buttons Row: Practice in Timer & Completion Toggle */}
              <div className="flex flex-col sm:flex-row gap-2 w-full pt-1">
                
                {/* Primary Action 1: Practice in Timer */}
                <button
                  type="button"
                  onClick={handlePracticeInTimer}
                  className="h-10 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 select-none w-full bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 hover:border-amber-500/50 cursor-pointer shadow-sm"
                  title="Load this scramble and practice directly in the timer session"
                >
                  <Zap className="w-4 h-4 fill-amber-500 text-amber-500" />
                  <span>Practice in Timer</span>
                </button>

                {/* Primary Action 2: Standardized Completion / Undo State */}
                <button 
                  type="button"
                  onClick={handleActionClick}
                  className={clsx(
                    "h-10 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 select-none w-full cursor-pointer",
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
                      <span className="hidden group-hover/btn:inline">Undo</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>Mark Complete</span>
                    </>
                  )}
                </button>
              </div>
            </div>

          </div>

        </div>
      </motion.div>
    </motion.div>
  );

  return createPortal(modalContent, document.body);
}