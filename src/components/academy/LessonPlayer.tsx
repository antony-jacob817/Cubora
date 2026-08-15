import { useState, useEffect } from 'react';
import { X, BookOpen, CheckCircle2, Lightbulb, Clock, RotateCcw, ChevronRight, Check } from 'lucide-react';
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
  onComplete: (lessonId: string) => Promise<void> | void;
  onToggleComplete?: (lessonId: string, shouldBeCompleted: boolean) => Promise<void> | void;
  onSelectNextLesson?: (next: Lesson) => void;
  isCompleted?: boolean;
}

export function LessonPlayer({
  lesson,
  nextLesson,
  onClose,
  onComplete,
  onToggleComplete,
  onSelectNextLesson,
  isCompleted = false
}: LessonPlayerProps) {
  const [isUpdating, setIsUpdating] = useState(false);

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
    for (let i = 0; i <= currentTimelineIndex; i++) {
      prevMove();
    }
  };

  const handleToggle = async () => {
    try {
      setIsUpdating(true);
      if (onToggleComplete) {
        await onToggleComplete(lesson.id, !isCompleted);
      } else {
        await onComplete(lesson.id);
      }
      if (!isCompleted && nextLesson && onSelectNextLesson) {
        onSelectNextLesson(nextLesson);
      }
    } catch (err) {
      console.error('Failed to toggle lesson completion:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md overflow-hidden"
    >
      <motion.div 
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-5xl max-h-[90vh] flex flex-col md:flex-row bg-[#121417] border border-white/10 rounded-2xl overflow-hidden shadow-2xl relative text-white"
      >
        
        {/* Left / Top: 3D Canvas Viewport */}
        <div className="w-full md:w-3/5 h-[260px] sm:h-[340px] md:h-full relative bg-gradient-to-b from-black/40 to-black/80 flex flex-col justify-between p-4 overflow-hidden">
          
          {/* Top Algorithm Visualizer Overlay */}
          <div className="relative z-20 flex justify-center w-full">
            <div className="bg-black/70 backdrop-blur-md border border-white/10 px-4 py-2 rounded-xl shadow-lg max-w-[95%] overflow-x-auto hide-scrollbar">
              <div className="flex items-center gap-2 sm:gap-2.5 justify-center min-w-max">
                {movesList.map((move, idx) => {
                  const isActive = idx === currentTimelineIndex;
                  return (
                    <span 
                      key={idx} 
                      className={clsx(
                        "font-mono text-sm sm:text-lg font-bold transition-all duration-150 px-1 py-0.5 rounded",
                        isActive 
                          ? "text-primary scale-110 bg-primary/20 ring-1 ring-primary/40" 
                          : idx < currentTimelineIndex 
                            ? "text-gray-500 opacity-60" 
                            : "text-gray-200"
                      )}
                    >
                      {move}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 3D Canvas */}
          <CubeViewer 
            className="absolute inset-0"
            action={currentMove ? { index: currentTimelineIndex, move: currentMove } : null}
            speed={speed}
            currentTimelineIndex={currentTimelineIndex}
            fov={36}
            cameraPosition={[3.8, 3.15, 5.0]}
          />

          {/* Bottom Overlay Info & Hint */}
          <div className="relative z-20 flex justify-between items-center text-[10px] sm:text-[11px] font-mono text-gray-400 bg-black/40 backdrop-blur-sm border border-white/5 px-3 py-1.5 rounded-lg w-fit pointer-events-none">
            <span>Drag to rotate • Scroll to zoom</span>
          </div>
        </div>

        {/* Right / Bottom: Sidebar Instructions & Controls Panel */}
        <div className="w-full md:w-2/5 flex flex-col border-t md:border-t-0 md:border-l border-white/10 bg-[#16191D] justify-between max-h-[50vh] md:max-h-full overflow-hidden">
          
          {/* Header Bar */}
          <div className="p-4 sm:p-5 border-b border-white/10 flex justify-between items-start shrink-0">
            <div className="min-w-0 pr-2">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="text-[9px] font-bold font-mono tracking-widest text-primary uppercase bg-primary/10 border border-primary/20 px-2 py-0.5 rounded">
                  {lesson.difficulty || 'Lesson'}
                </span>
                {isCompleted && (
                  <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <Check className="w-2.5 h-2.5" /> Mastered
                  </span>
                )}
              </div>
              <h2 className="font-display font-bold text-base sm:text-lg text-white truncate leading-snug">
                {lesson.title}
              </h2>
            </div>
            
            <button 
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-colors shrink-0"
              title="Close Lesson"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Scrollable Lesson Details */}
          <div className="p-4 sm:p-5 flex-1 overflow-y-auto space-y-4 text-left">
            
            {/* Algorithm Box */}
            <div className="bg-black/30 border border-white/10 rounded-xl p-3">
              <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-gray-400 block mb-1">
                Algorithm
              </span>
              <p className="font-mono text-sm sm:text-base font-bold text-white tracking-wider select-all">
                {lesson.algorithm}
              </p>
            </div>

            {/* Mechanics Explanation */}
            <div className="space-y-1">
              <h3 className="font-display font-bold text-xs sm:text-sm text-gray-200">
                Mechanics
              </h3>
              <p className="text-gray-300 text-xs leading-relaxed">
                {lesson.explanation}
              </p>
            </div>

            {/* Finger-Trick Tips */}
            {lesson.fingerTrickTips && (
              <div className="bg-primary/10 border border-primary/20 rounded-xl p-3 space-y-1">
                <div className="flex items-center gap-1.5 text-primary font-bold text-[10px] uppercase tracking-wider">
                  <Lightbulb className="w-3.5 h-3.5 shrink-0" />
                  <span>Finger-Trick Tip</span>
                </div>
                <p className="text-xs text-gray-200 leading-relaxed">
                  {lesson.fingerTrickTips}
                </p>
              </div>
            )}

            {/* Step Counter */}
            <div className="flex items-center justify-between text-[11px] font-mono text-gray-400 pt-2 border-t border-white/5">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" /> {lesson.estimatedTime || '5 min'}
              </span>
              <span>
                Move {currentTimelineIndex >= 0 ? currentTimelineIndex + 1 : 0} of {totalMoves}
              </span>
            </div>
          </div>

          {/* Bottom Controls & Unified Action Button */}
          <div className="p-4 sm:p-5 border-t border-white/10 bg-[#121417] space-y-3 shrink-0">
            
            {/* Media Playback Controls */}
            <PlaybackControls 
              isPlaying={isPlaying} 
              togglePlay={togglePlay}
              nextMove={nextMove} 
              prevMove={prevMove}
              speed={speed} 
              setSpeed={setSpeed}
              progress={totalMoves > 0 ? (currentTimelineIndex + 1) / totalMoves : 0}
            />

            {/* Action Row */}
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={handleReset}
                className="h-9 px-3 rounded-xl flex items-center justify-center bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white transition-all text-xs shrink-0"
                title="Reset to Start"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>

              {/* Clean Unified Mastered / Revert Toggle Button */}
              <button
                disabled={isUpdating}
                onClick={handleToggle}
                className={clsx(
                  "flex-1 justify-center",
                  isCompleted
                    ? "bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-2 transition-all active:scale-95 group"
                    : "bg-primary hover:bg-primary/90 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-2 transition-all active:scale-95"
                )}
              >
                {isCompleted ? (
                  <>
                    <span className="group-hover:hidden flex items-center gap-1.5">
                      Mastered <Check className="w-3.5 h-3.5" />
                    </span>
                    <span className="hidden group-hover:flex items-center gap-1.5 text-amber-400">
                      Revert <RotateCcw className="w-3.5 h-3.5" />
                    </span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{isUpdating ? 'Saving...' : 'Mark as Mastered'}</span>
                  </>
                )}
              </button>

              {nextLesson && onSelectNextLesson && (
                <button
                  onClick={() => onSelectNextLesson(nextLesson)}
                  className="h-9 px-3 rounded-xl text-xs font-bold shrink-0 flex items-center gap-1 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white transition-all"
                  title={`Next: ${nextLesson.title}`}
                >
                  <span>Next</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

          </div>

        </div>

      </motion.div>
    </motion.div>
  );
}