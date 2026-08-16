import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, PlayCircle, BookOpen, CheckCircle2, Check, RotateCcw } from 'lucide-react';
import { motion } from 'framer-motion';
import { CubeViewer } from '@/components/3d/CubeViewer';
import { PlaybackControls } from '@/components/solver/PlaybackControls';
import { useSolvePlayback } from '@/hooks/useSolvePlayback';
import type { Lesson } from '@/data/academy';
import { clsx } from 'clsx';

interface LessonPlayerProps {
  lesson: Lesson;
  onClose: () => void;
  onComplete?: () => void;
  isCompleted?: boolean;
  onToggleComplete?: (lessonId: string) => void;
}

export function LessonPlayer({ lesson, onClose, onComplete, isCompleted = false, onToggleComplete }: LessonPlayerProps) {
  const [completedState, setCompletedState] = useState<boolean>(isCompleted);
  const [isButtonHovered, setIsButtonHovered] = useState<boolean>(false);

  // Sync prop changes
  useEffect(() => {
    setCompletedState(isCompleted);
  }, [isCompleted]);

  // Lock background body scrolling when modal is open
  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  // Wrap the single algorithm into the format expected by our playback hook
  const lessonData = [{ phase: lesson.title, explanation: lesson.explanation, moves: lesson.algorithm }];
  
  const { 
    isPlaying, togglePlay, speed, setSpeed, nextMove, prevMove, 
    currentTimelineIndex, totalMoves, currentMove 
  } = useSolvePlayback(lessonData);

  const handleToggleCompletion = () => {
    const newState = !completedState;
    setCompletedState(newState);
    if (onToggleComplete) {
      onToggleComplete(lesson.id);
    } else if (onComplete && newState) {
      onComplete();
    }
  };

  const modalContent = (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-6 overflow-hidden"
    >
      <motion.div 
        initial={{ opacity: 0, scale: 0.96, y: 15 }} 
        animate={{ opacity: 1, scale: 1, y: 0 }} 
        exit={{ opacity: 0, scale: 0.96, y: 15 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-5xl h-full max-h-[92vh] lg:h-[85vh] lg:max-h-[750px] glass-panel border-slate-200/80 dark:border-white/15 rounded-2xl sm:rounded-3xl flex flex-col overflow-hidden relative shadow-[0_0_50px_rgba(0,0,0,0.5)] bg-white/95 dark:bg-[#121417]/95"
      >
        {/* Header */}
        <div className="px-5 sm:px-6 py-3.5 sm:py-4 border-b border-slate-200/60 dark:border-white/10 flex justify-between items-center bg-slate-50/70 dark:bg-white/[0.02] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-primary/15 border border-primary/20 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(139,92,246,0.15)]">
              <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            </div>
            <div className="min-w-0">
              <h2 className="font-display font-bold text-base sm:text-lg text-slate-900 dark:text-white truncate">{lesson.title}</h2>
              <p className="text-[10px] sm:text-xs text-slate-500 dark:text-gray-400 font-mono tracking-wider">ACADEMY MODULE</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 text-slate-500 hover:text-slate-800 dark:text-gray-400 dark:hover:text-white bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 rounded-xl transition-all cursor-pointer focus:outline-none"
            title="Close Lesson (Esc)"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Layout Split: Mobile/Tablet Stacked (scrollable) -> Desktop 2-Column (Left: 3D Viewport, Right: Control/Details Panel) */}
        <div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-y-auto lg:overflow-hidden">
          
          {/* 3D Interaction Viewport (Left) */}
          <div className="w-full lg:flex-1 h-[280px] sm:h-[340px] lg:h-full relative bg-gradient-to-b from-transparent via-primary/[0.02] to-primary/5 touch-none shrink-0 lg:shrink">
            <CubeViewer 
              className="absolute inset-0"
              currentMove={currentMove}
              speed={speed}
              currentTimelineIndex={currentTimelineIndex}
              cameraPosition={[3.4, 2.7, 4.4]}
              fov={36}
            />
            
            {/* Algorithm Overlay HUD */}
            <div className="absolute top-4 sm:top-5 left-1/2 -translate-x-1/2 bg-white/90 dark:bg-[#111315]/90 backdrop-blur-md border border-slate-200/80 dark:border-white/15 px-4 sm:px-6 py-2 sm:py-2.5 rounded-2xl shadow-lg max-w-[90%] overflow-x-auto hide-scrollbar z-10">
               <div className="flex gap-1.5 sm:gap-2 items-center justify-center whitespace-nowrap">
                 {lesson.algorithm.split(' ').map((move, idx) => (
                   <span 
                     key={idx} 
                     className={clsx(
                       "font-mono text-base sm:text-lg font-bold transition-all duration-200 px-1 py-0.5 rounded",
                       idx === currentTimelineIndex 
                         ? "text-primary scale-110 bg-primary/10 shadow-[0_0_10px_var(--btn-glow-shadow)]" 
                         : "text-slate-600 dark:text-slate-400"
                     )}
                   >
                     {move}
                   </span>
                 ))}
               </div>
            </div>
          </div>

          {/* Control & Details Panel (Right on Desktop, Bottom on Mobile) */}
          <div className="w-full lg:w-[380px] xl:w-[420px] lg:border-l border-t lg:border-t-0 border-slate-200/60 dark:border-white/10 flex flex-col bg-white/50 dark:bg-white/[0.02] shrink-0">
            <div className="p-5 sm:p-6 lg:p-7 flex-1 overflow-y-auto space-y-4">
              <div>
                <h3 className="font-display font-bold text-lg sm:text-xl text-slate-900 dark:text-white mb-2">Mechanics</h3>
                <p className="text-slate-700 dark:text-gray-300 text-xs sm:text-sm leading-relaxed">{lesson.explanation}</p>
              </div>
              
              <div className="bg-primary/10 border border-primary/20 rounded-xl p-3.5 sm:p-4 flex gap-3">
                <PlayCircle className="w-4 h-4 sm:w-5 sm:h-5 text-primary shrink-0 mt-0.5" />
                <p className="text-xs sm:text-sm text-slate-800 dark:text-gray-200 font-medium leading-normal">
                  Use the playback controls below to step through each turn. Click and drag the 3D viewport to inspect the cube from any angle.
                </p>
              </div>
            </div>

            {/* Bottom Controls Area */}
            <div className="p-4 sm:p-5 lg:p-6 border-t border-slate-200/60 dark:border-white/10 bg-slate-50/80 dark:bg-[#111315]/80 flex flex-col gap-4">
              <PlaybackControls 
                isPlaying={isPlaying} togglePlay={togglePlay}
                nextMove={nextMove} prevMove={prevMove}
                speed={speed} setSpeed={setSpeed}
                progress={totalMoves > 0 ? (currentTimelineIndex + 1) / totalMoves : 0}
              />
              
              {/* Standardized Primary Action Button */}
              <button 
                type="button"
                onClick={handleToggleCompletion}
                onMouseEnter={() => setIsButtonHovered(true)}
                onMouseLeave={() => setIsButtonHovered(false)}
                className={clsx(
                  "w-full h-10 px-5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 select-none cursor-pointer focus:outline-none",
                  completedState
                    ? "border border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-rose-500/10 hover:border-rose-500/40 hover:text-rose-600 dark:hover:text-rose-400 shadow-[0_0_12px_rgba(16,185,129,0.15)]"
                    : "bg-gradient-to-r from-primary to-secondary text-white btn-glow shadow-[0_2.5px_8px_var(--btn-glow-shadow)] hover:shadow-[0_4px_12px_var(--btn-glow-shadow)] hover:-translate-y-0.5 active:translate-y-0"
                )}
              >
                {completedState ? (
                  isButtonHovered ? (
                    <>
                      <RotateCcw className="w-3.5 h-3.5 shrink-0" />
                      <span>Undo Completion</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>Completed</span>
                    </>
                  )
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5 shrink-0" />
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