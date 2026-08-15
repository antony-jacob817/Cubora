import { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, BookOpen, CheckCircle2, Lightbulb, Clock, RotateCcw, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
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
  const [isUpdating, setIsUpdating] = useState(false);

  // Format algorithm step for useSolvePlayback
  const lessonData = [{ phase: lesson.title, explanation: lesson.explanation, moves: lesson.algorithm }];
  
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
      setIsUpdating(true);
      await onToggleComplete(lesson.id, !isCompleted);
    } catch (err) {
      console.error('Failed to toggle lesson completion:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  const modalContent = (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-hidden"
    >
      <motion.div 
        initial={{ scale: 0.96, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.96, opacity: 0, y: 10 }}
        transition={{ duration: 0.2 }}
        className="max-w-4xl w-full max-h-[90vh] glass-panel border border-slate-200/80 dark:border-white/15 flex flex-col overflow-hidden relative shadow-[0_0_80px_rgba(0,0,0,0.6)] rounded-3xl bg-white/95 dark:bg-[#111315]/95 text-slate-900 dark:text-white"
      >
        
        {/* Header Bar */}
        <div className="px-5 py-4 border-b border-slate-200/60 dark:border-white/10 flex justify-between items-center bg-slate-50/80 dark:bg-white/[0.02] shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-primary/15 border border-primary/20 flex items-center justify-center shrink-0">
              <BookOpen className="w-5 h-5 text-primary" />
            </div>
            <div className="min-w-0 text-left">
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
                INTERACTIVE 3D LESSON PLAYER
              </p>
            </div>
          </div>
          
          <button 
            onClick={onClose} 
            className="p-2 text-slate-500 hover:text-slate-800 dark:text-gray-400 dark:hover:text-white bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 rounded-xl transition-colors shrink-0 ml-2"
            title="Close Lesson"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main Content Split: Left 3D Viewport / Right Instructions */}
        <div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-y-auto lg:overflow-hidden">
          
          {/* 3D Interactive Canvas Viewport */}
          <div className="flex-1 min-h-[260px] sm:min-h-[340px] lg:min-h-0 relative bg-gradient-to-b from-transparent via-primary/[0.02] to-primary/[0.08] touch-none flex flex-col">
            
            {/* 3D Canvas */}
            <CubeViewer 
              className="absolute inset-0"
              action={currentMove ? { index: currentTimelineIndex, move: currentMove } : null}
              speed={speed}
              currentTimelineIndex={currentTimelineIndex}
            />

            {/* Floating Algorithm Sequence Display */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white/85 dark:bg-[#181A1D]/90 backdrop-blur-md border border-slate-200/80 dark:border-white/15 px-4 py-2.5 sm:px-6 sm:py-3 rounded-2xl shadow-lg max-w-[92%] overflow-x-auto no-scrollbar z-20">
              <div className="flex items-center gap-2 sm:gap-3 justify-center min-w-max">
                {movesList.map((move, idx) => {
                  const isActive = idx === currentTimelineIndex;
                  return (
                    <span 
                      key={idx} 
                      className={`font-mono text-base sm:text-xl font-bold transition-all duration-200 px-1 py-0.5 rounded ${
                        isActive 
                          ? 'text-primary scale-125 bg-primary/10 ring-2 ring-primary/40' 
                          : idx < currentTimelineIndex 
                            ? 'text-slate-400 dark:text-slate-500 line-through opacity-60' 
                            : 'text-slate-800 dark:text-gray-300'
                      }`}
                    >
                      {move}
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Bottom Overlay Hint */}
            <div className="absolute bottom-3 left-3 z-20 hidden sm:flex items-center gap-2 text-[10px] font-mono text-slate-500 dark:text-gray-400 bg-white/50 dark:bg-black/40 border border-slate-200/50 dark:border-white/10 px-2.5 py-1 rounded-lg backdrop-blur-sm pointer-events-none">
              <span>Drag to rotate 3D cube • Scroll to zoom</span>
            </div>
          </div>

          {/* Sidebar Instructions & Controls Panel */}
          <div className="w-full lg:w-[380px] xl:w-[400px] border-t lg:border-t-0 lg:border-l border-slate-200/60 dark:border-white/10 flex flex-col bg-slate-50/50 dark:bg-[#111315]/80 shrink-0">
            
            {/* Scrollable Details */}
            <div className="p-4 sm:p-5 flex-1 overflow-y-auto space-y-4 text-left">
              
              {/* Algorithm Box */}
              <div className="bg-slate-100 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 rounded-2xl p-3.5">
                <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-slate-500 dark:text-gray-400 block mb-1">
                  Algorithm Sequence
                </span>
                <p className="font-mono text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-wider select-all">
                  {lesson.algorithm}
                </p>
              </div>

              {/* Lesson Mechanics Explanation */}
              <div className="space-y-1.5">
                <h3 className="font-display font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                  Lesson Mechanics
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
                    <span>Finger-Trick Pro Tip</span>
                  </div>
                  <p className="text-xs text-slate-800 dark:text-gray-200 leading-relaxed">
                    {lesson.fingerTrickTips}
                  </p>
                </div>
              )}

              {/* Estimated Duration & Timeline Step */}
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

            {/* Playback Controls & Action Footer */}
            <div className="p-4 sm:p-5 border-t border-slate-200/60 dark:border-white/10 bg-white dark:bg-[#141618] space-y-3.5">
              
              {/* Timeline Media Controls */}
              <PlaybackControls 
                isPlaying={isPlaying} 
                togglePlay={togglePlay}
                nextMove={nextMove} 
                prevMove={prevMove}
                speed={speed} 
                setSpeed={setSpeed}
                progress={totalMoves > 0 ? (currentTimelineIndex + 1) / totalMoves : 0}
              />

              {/* Action Buttons: Reset, Unified Completion Button, Next Lesson */}
              <div className="flex items-center gap-2 pt-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleReset}
                  className="h-11 px-3 rounded-xl flex items-center justify-center shrink-0"
                  title="Reset Algorithm"
                >
                  <RotateCcw className="w-4 h-4" />
                </Button>

                {/* Unified Completion & Undo Button */}
                <Button 
                  variant={isCompleted ? "outline" : "glow"}
                  size="md"
                  disabled={isUpdating}
                  onClick={handleToggleCompletion}
                  className={clsx(
                    "flex-1 h-11 rounded-xl text-xs sm:text-sm font-bold tracking-wide gap-2 justify-center transition-all",
                    isCompleted && "border-emerald-500/40 text-emerald-500 hover:bg-emerald-500/10 shadow-[0_0_15px_rgba(16,185,129,0.15)]"
                  )}
                >
                  <CheckCircle2 className={clsx("w-4 h-4", isCompleted ? "text-emerald-500" : "text-emerald-400")} />
                  <span>
                    {isUpdating ? 'Saving...' : isCompleted ? 'Completed (Undo)' : 'Mark as Completed'}
                  </span>
                </Button>

                {nextLesson && onSelectNextLesson && (
                  <Button
                    variant="secondary"
                    size="md"
                    onClick={() => onSelectNextLesson(nextLesson)}
                    className="h-11 px-3.5 rounded-xl text-xs font-bold shrink-0 flex items-center gap-1.5"
                    title={`Next: ${nextLesson.title}`}
                  >
                    <span>Next</span>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>

          </div>

        </div>
      </motion.div>
    </motion.div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : null;
}