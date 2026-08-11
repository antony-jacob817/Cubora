import { useState } from 'react';
import { X, BookOpen, CheckCircle2, Lightbulb, Clock, RotateCcw, ChevronRight } from 'lucide-react';
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
  onComplete: (lessonId: string) => Promise<void> | void;
  onSelectNextLesson?: (next: Lesson) => void;
  isCompleted?: boolean;
}

export function LessonPlayer({
  lesson,
  nextLesson,
  onClose,
  onComplete,
  onSelectNextLesson,
  isCompleted = false
}: LessonPlayerProps) {
  const [isMarking, setIsMarking] = useState(false);

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

  const handleMarkCompleted = async () => {
    try {
      setIsMarking(true);
      await onComplete(lesson.id);
      if (nextLesson && onSelectNextLesson) {
        onSelectNextLesson(nextLesson);
      } else {
        onClose();
      }
    } catch (err) {
      console.error('Failed to mark lesson complete:', err);
    } finally {
      setIsMarking(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }} 
      animate={{ opacity: 1, scale: 1 }} 
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.25 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 lg:p-8 bg-[#0B0F19]/85 backdrop-blur-2xl"
    >
      <div className="w-full max-w-6xl h-full max-h-[850px] glass-panel border border-slate-200/80 dark:border-white/15 flex flex-col overflow-hidden relative shadow-[0_0_80px_rgba(0,0,0,0.5)] rounded-3xl">
        
        {/* Header */}
        <div className="px-5 py-4 sm:px-6 border-b border-slate-200/60 dark:border-white/10 flex justify-between items-center bg-white/70 dark:bg-[#111315]/80 shrink-0">
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
            className="p-2 text-slate-500 hover:text-slate-800 dark:text-gray-400 dark:hover:text-white bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 rounded-full transition-colors shrink-0 ml-2"
            title="Close Lesson"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main Content Layout */}
        <div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-y-auto lg:overflow-hidden">
          
          {/* 3D Interactive Canvas Viewport */}
          <div className="flex-1 min-h-[300px] sm:min-h-[400px] lg:min-h-0 relative bg-gradient-to-b from-transparent via-primary/[0.02] to-primary/[0.08] touch-none flex flex-col">
            
            {/* 3D Canvas */}
            <CubeViewer 
              className="absolute inset-0"
              action={currentMove ? { index: currentTimelineIndex, move: currentMove } : null}
              speed={speed}
              currentTimelineIndex={currentTimelineIndex}
            />

            {/* Floating Top Algorithm Sequence Visualizer */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white/80 dark:bg-[#181A1D]/85 backdrop-blur-md border border-slate-200/80 dark:border-white/15 px-4 py-2.5 sm:px-6 sm:py-3.5 rounded-2xl shadow-lg max-w-[92%] overflow-x-auto hide-scrollbar z-20">
              <div className="flex items-center gap-2 sm:gap-3 justify-center min-w-max">
                {movesList.map((move, idx) => {
                  const isActive = idx === currentTimelineIndex;
                  return (
                    <span 
                      key={idx} 
                      className={`font-mono text-lg sm:text-2xl font-bold transition-all duration-200 px-1 py-0.5 rounded ${
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
            <div className="absolute bottom-4 left-4 z-20 hidden sm:flex items-center gap-2 text-[11px] font-mono text-slate-500 dark:text-gray-400 bg-white/50 dark:bg-black/40 border border-slate-200/50 dark:border-white/10 px-3 py-1.5 rounded-xl backdrop-blur-sm pointer-events-none">
              <span>Drag to rotate 3D cube • Scroll to zoom</span>
            </div>
          </div>

          {/* Sidebar Instructions & Controls Panel */}
          <div className="w-full lg:w-[420px] border-t lg:border-t-0 lg:border-l border-slate-200/60 dark:border-white/10 flex flex-col bg-white/70 dark:bg-[#111315]/90 backdrop-blur-lg shrink-0">
            
            {/* Scrollable Instruction Details */}
            <div className="p-5 sm:p-6 lg:p-7 flex-1 overflow-y-auto space-y-5">
              
              {/* Algorithm Box */}
              <div className="bg-slate-100 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 rounded-2xl p-4 text-left">
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-500 dark:text-gray-400 block mb-1.5">
                  Algorithm Sequence
                </span>
                <p className="font-mono text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-wider select-all">
                  {lesson.algorithm}
                </p>
              </div>

              {/* Lesson Explanation */}
              <div className="text-left space-y-2">
                <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                  Lesson Mechanics
                </h3>
                <p className="text-slate-700 dark:text-gray-300 text-xs sm:text-sm leading-relaxed">
                  {lesson.explanation}
                </p>
              </div>

              {/* Finger Tricks & Execution Tip Card */}
              {lesson.fingerTrickTips && (
                <div className="bg-primary/10 border border-primary/20 rounded-2xl p-4 text-left space-y-2">
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
            <div className="p-5 sm:p-6 border-t border-slate-200/60 dark:border-white/10 bg-slate-50/80 dark:bg-[#111315]/70 space-y-4">
              
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
              <div className="flex items-center gap-3 pt-2">
                <Button
                  variant="outline"
                  size="md"
                  onClick={handleReset}
                  className="h-11 px-3.5 rounded-xl flex items-center justify-center shrink-0"
                  title="Reset Algorithm"
                >
                  <RotateCcw className="w-4 h-4" />
                </Button>

                <Button 
                  variant="glow" 
                  size="lg"
                  disabled={isMarking}
                  onClick={handleMarkCompleted}
                  className="flex-1 h-11 rounded-xl text-xs sm:text-sm font-bold tracking-wide gap-2 justify-center"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  {isCompleted ? (nextLesson ? 'Next Lesson' : 'Completed') : (isMarking ? 'Saving...' : 'Mark as Completed')}
                  {nextLesson && <ChevronRight className="w-4 h-4 ml-auto" />}
                </Button>
              </div>
            </div>

          </div>

        </div>
      </div>
    </motion.div>
  );
}