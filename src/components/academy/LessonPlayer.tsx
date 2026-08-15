import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, BookOpen, CheckCircle2, Lightbulb, Clock, RotateCcw, ChevronRight, Undo2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { CubeViewer } from '@/components/3d/CubeViewer';
import { PlaybackControls } from '@/components/solver/PlaybackControls';
import { useSolvePlayback } from '@/hooks/useSolvePlayback';
import type { Lesson } from '@/data/academy';

interface LessonPlayerProps {
  lesson: Lesson;
  nextLesson?: Lesson | null;
  onClose: () => void;
  onToggleComplete?: (lessonId: string, isCompleted: boolean) => Promise<void> | void;
  onComplete?: (lessonId: string) => Promise<void> | void;
  onSelectNextLesson?: (next: Lesson) => void;
  isCompleted?: boolean;
}

export function LessonPlayer({
  lesson,
  nextLesson,
  onClose,
  onToggleComplete,
  onComplete,
  onSelectNextLesson,
  isCompleted = false
}: LessonPlayerProps) {
  const [isMarking, setIsMarking] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Prevent background body scrolling when modal is open
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  // Format algorithm step for useSolvePlayback
  const lessonData = [{ phase: lesson.title, explanation: lesson.explanation, moves: lesson.algorithm }];
  
  const { 
    isPlaying, togglePlay, speed, setSpeed, nextMove, prevMove, 
    currentTimelineIndex, totalMoves, currentMove
  } = useSolvePlayback(lessonData);

  const movesList = lesson.algorithm.split(' ').filter(Boolean);

  const handleReset = () => {
    // Step back to start
    for (let i = 0; i <= currentTimelineIndex; i++) {
      prevMove();
    }
  };

  const handleToggleState = async (targetCompletedState: boolean) => {
    try {
      setIsMarking(true);
      if (onToggleComplete) {
        await onToggleComplete(lesson.id, targetCompletedState);
      } else if (onComplete) {
        await onComplete(lesson.id);
      }
      
      if (targetCompletedState && nextLesson && onSelectNextLesson) {
        onSelectNextLesson(nextLesson);
      }
    } catch (err) {
      console.error('Failed to update lesson completion:', err);
    } finally {
      setIsMarking(false);
    }
  };

  return createPortal(
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }} 
      animate={{ opacity: 1, scale: 1 }} 
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.25 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-6 overflow-hidden"
    >
      <div className="w-full max-w-5xl h-[85vh] max-h-[750px] glass-panel border border-slate-200/80 dark:border-white/15 flex flex-col overflow-hidden relative shadow-[0_0_80px_rgba(0,0,0,0.6)] rounded-3xl bg-white/95 dark:bg-[#111315]/95 text-slate-900 dark:text-white">
        
        {/* Header Bar */}
        <div className="px-5 py-4 sm:px-6 border-b border-slate-200/60 dark:border-white/10 flex justify-between items-center bg-slate-50/80 dark:bg-white/[0.02] shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-primary/15 border border-primary/20 flex items-center justify-center shrink-0">
              <BookOpen className="w-5 h-5 text-primary" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="font-display font-bold text-base sm:text-xl text-slate-900 dark:text-white truncate">
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
            className="p-2 text-slate-500 hover:text-slate-800 dark:text-gray-400 dark:hover:text-white bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 rounded-full transition-colors shrink-0 ml-2 cursor-pointer"
            title="Close Lesson"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Layout Split: Desktop 2-Column (3D Left, Details Right) / Mobile Stacked */}
        <div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-y-auto lg:overflow-hidden">
          
          {/* 3D Interactive Canvas Viewport */}
          <div className="flex-1 min-h-[280px] sm:min-h-[360px] lg:min-h-0 relative bg-gradient-to-b from-transparent via-primary/[0.02] to-primary/[0.08] touch-none flex flex-col">
            
            {/* 3D Canvas */}
            <CubeViewer 
              className="absolute inset-0"
              action={currentMove ? { index: currentTimelineIndex, move: currentMove } : null}
              speed={speed}
              currentTimelineIndex={currentTimelineIndex}
              cameraPosition={[3.4, 2.7, 4.4]}
              fov={36}
            />

            {/* Floating Top Algorithm Sequence Visualizer */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white/85 dark:bg-[#181A1D]/90 backdrop-blur-md border border-slate-200/80 dark:border-white/15 px-4 py-2 sm:px-6 sm:py-3 rounded-2xl shadow-lg max-w-[92%] overflow-x-auto hide-scrollbar z-20">
              <div className="flex items-center gap-2 sm:gap-3 justify-center min-w-max">
                {movesList.map((move, idx) => {
                  const isActive = idx === currentTimelineIndex;
                  return (
                    <span 
                      key={idx} 
                      className={`font-mono text-base sm:text-2xl font-bold transition-all duration-200 px-1 py-0.5 rounded ${
                        isActive 
                          ? 'text-primary scale-125 bg-primary/10 ring-2 ring-primary/40' 
                          : idx < currentTimelineIndex 
                            ? 'text-slate-400 dark:text-slate-500 line-through opacity-70' 
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
            <div className="absolute bottom-4 left-4 z-20 hidden sm:flex items-center gap-2 text-[11px] font-mono text-slate-500 dark:text-gray-400 bg-white/60 dark:bg-black/50 border border-slate-200/50 dark:border-white/10 px-3 py-1.5 rounded-xl backdrop-blur-sm pointer-events-none">
              <span>Drag to rotate 3D cube • Scroll to zoom</span>
            </div>
          </div>

          {/* Sidebar Instructions & Controls Panel */}
          <div className="w-full lg:w-[400px] border-t lg:border-t-0 lg:border-l border-slate-200/60 dark:border-white/10 flex flex-col bg-white/70 dark:bg-[#111315]/90 backdrop-blur-lg shrink-0">
            
            {/* Scrollable Instruction Details */}
            <div className="p-5 sm:p-6 flex-1 overflow-y-auto space-y-4 text-left">
              
              {/* Algorithm Box */}
              <div className="bg-slate-100 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 rounded-2xl p-4 text-left">
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-500 dark:text-gray-400 block mb-1">
                  Algorithm Sequence
                </span>
                <p className="font-mono text-base sm:text-xl font-bold text-slate-900 dark:text-white tracking-wider select-all">
                  {lesson.algorithm}
                </p>
              </div>

              {/* Lesson Explanation */}
              <div className="text-left space-y-1.5">
                <h3 className="font-display font-bold text-base text-slate-900 dark:text-white">
                  Lesson Mechanics
                </h3>
                <p className="text-slate-700 dark:text-gray-300 text-xs sm:text-sm leading-relaxed">
                  {lesson.explanation}
                </p>
              </div>

              {/* Finger Tricks & Execution Tip Card */}
              {lesson.fingerTrickTips && (
                <div className="bg-primary/10 border border-primary/20 rounded-2xl p-4 text-left space-y-1.5">
                  <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
                    <Lightbulb className="w-4 h-4 shrink-0" />
                    <span>Finger-Trick Pro Tip</span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-800 dark:text-gray-200 leading-relaxed">
                    {lesson.fingerTrickTips}
                  </p>
                </div>
              )}

              {/* Estimated Time & Progress Stats */}
              <div className="flex items-center justify-between text-xs font-mono text-slate-500 dark:text-gray-400 pt-2 border-t border-slate-200/60 dark:border-white/5">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  Est. {lesson.estimatedTime || '5 min'}
                </span>
                <span>
                  Move {currentTimelineIndex >= 0 ? currentTimelineIndex + 1 : 0} of {totalMoves}
                </span>
              </div>
            </div>

            {/* Playback Controls & Action Footer */}
            <div className="p-4 sm:p-5 border-t border-slate-200/60 dark:border-white/10 bg-slate-50/90 dark:bg-[#141618] space-y-3.5">
              
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

              {/* Reset & Mark Complete Action Buttons */}
              <div className="flex items-center gap-2.5 pt-1 w-full justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleReset}
                  className="h-10 px-3 rounded-xl flex items-center justify-center shrink-0"
                  title="Reset to Start"
                >
                  <RotateCcw className="w-4 h-4" />
                </Button>

                {/* Primary Action Button (Fixed dimensions & hover toggle) */}
                {isCompleted ? (
                  <button
                    type="button"
                    disabled={isMarking}
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                    onClick={() => handleToggleState(false)}
                    className="flex-1 h-10 px-5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 select-none border border-emerald-500/40 text-emerald-500 hover:border-red-500/40 hover:text-red-400 hover:bg-red-500/10 active:scale-[0.98] cursor-pointer"
                  >
                    {isHovered ? (
                      <>
                        <Undo2 className="w-3.5 h-3.5 shrink-0" />
                        <span>Undo Completion</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>Completed</span>
                      </>
                    )}
                  </button>
                ) : (
                  <Button 
                    variant="glow"
                    disabled={isMarking}
                    onClick={() => handleToggleState(true)}
                    className="flex-1 h-10 px-5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 select-none"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>{isMarking ? 'Saving...' : 'Mark as Completed'}</span>
                  </Button>
                )}

                {nextLesson && onSelectNextLesson && (
                  <Button
                    variant="secondary"
                    onClick={() => onSelectNextLesson(nextLesson)}
                    className="h-10 px-3.5 rounded-xl text-xs font-bold shrink-0 flex items-center gap-1"
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
      </div>
    </motion.div>,
    document.body
  );
}