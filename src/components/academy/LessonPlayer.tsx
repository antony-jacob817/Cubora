import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, PlayCircle, BookOpen, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { CubeViewer } from '@/components/3d/CubeViewer';
import { PlaybackControls } from '@/components/solver/PlaybackControls';
import { useSolvePlayback } from '@/hooks/useSolvePlayback';
import type { Lesson } from '@/data/academy';
import { clsx } from 'clsx';

interface LessonPlayerProps {
  lesson: Lesson;
  isCompleted?: boolean;
  onClose: () => void;
  onToggleComplete?: () => void;
  onComplete?: () => void;
}

export function LessonPlayer({
  lesson,
  isCompleted = false,
  onClose,
  onToggleComplete,
  onComplete
}: LessonPlayerProps) {
  // Prevent background body scrolling while modal is open
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  // Wrap the single algorithm into the format expected by useSolvePlayback
  const lessonData = [
    { phase: lesson.title, explanation: lesson.explanation, moves: lesson.algorithm }
  ];

  const {
    isPlaying,
    togglePlay,
    speed,
    setSpeed,
    nextMove,
    prevMove,
    currentTimelineIndex,
    totalMoves,
    currentMove
  } = useSolvePlayback(lessonData);

  const handleActionClick = () => {
    if (onToggleComplete) {
      onToggleComplete();
    } else if (onComplete) {
      onComplete();
    }
  };

  const modalContent = (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-6 overflow-hidden"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 15 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-5xl h-full max-h-[92vh] lg:h-[85vh] lg:max-h-[750px] glass-panel border border-slate-200/80 dark:border-white/10 rounded-2xl flex flex-col overflow-hidden relative shadow-2xl bg-white/95 dark:bg-[#111315]/95"
      >
        {/* Header */}
        <div className="px-5 py-3.5 sm:px-6 sm:py-4 border-b border-slate-200/60 dark:border-white/10 flex justify-between items-center bg-white/70 dark:bg-white/[0.02] shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
              <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            </div>
            <div className="min-w-0">
              <h2 className="font-display font-bold text-base sm:text-lg text-slate-900 dark:text-white truncate">
                {lesson.title}
              </h2>
              <p className="text-[10px] sm:text-xs text-slate-600 dark:text-gray-400 font-mono tracking-wider">
                ACADEMY MODULE
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 text-slate-500 hover:text-slate-800 dark:text-gray-400 dark:hover:text-white bg-slate-100 dark:bg-white/5 rounded-full transition-colors shrink-0 cursor-pointer"
            title="Close Lesson"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Layout Split: Desktop 2-column, Mobile/Tablet stacked with overflow */}
        <div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-y-auto lg:overflow-hidden">
          {/* Left Column: 3D Interaction Viewport */}
          <div className="w-full lg:flex-1 h-[300px] sm:h-[380px] lg:h-full relative bg-gradient-to-b from-transparent to-primary/5 touch-none shrink-0 lg:shrink min-h-0">
            <CubeViewer
              className="absolute inset-0"
              currentMove={currentMove}
              speed={speed}
              currentTimelineIndex={currentTimelineIndex}
              cameraPosition={[3.4, 2.7, 4.4]}
              cameraFov={36}
            />

            {/* Algorithm Overlay Notation Pill */}
            <div className="absolute top-4 sm:top-6 left-1/2 -translate-x-1/2 bg-white/90 dark:bg-[#111315]/90 backdrop-blur-md border border-slate-200/60 dark:border-white/10 px-4 sm:px-6 py-2 sm:py-2.5 rounded-2xl shadow-lg max-w-[90%] overflow-x-auto hide-scrollbar z-10">
              <div className="flex gap-2 justify-center items-center">
                {lesson.algorithm.split(' ').map((move, idx) => (
                  <span
                    key={idx}
                    className={`font-mono text-base sm:text-lg font-bold transition-all duration-200 shrink-0 ${
                      idx === currentTimelineIndex
                        ? 'text-primary scale-110'
                        : 'text-slate-700 dark:text-slate-400'
                    }`}
                    style={
                      idx === currentTimelineIndex
                        ? { filter: 'drop-shadow(0 0 10px var(--btn-glow-shadow))' }
                        : undefined
                    }
                  >
                    {move}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Sidebar Instructions & Controls */}
          <div className="w-full lg:w-[380px] xl:w-[420px] border-t lg:border-t-0 lg:border-l border-slate-200/60 dark:border-white/10 flex flex-col justify-between bg-white/60 dark:bg-white/[0.02] shrink-0 lg:shrink min-h-0">
            {/* Scrollable Explanations */}
            <div className="p-5 sm:p-6 lg:p-7 flex-1 overflow-y-auto min-h-0">
              <h3 className="font-display font-bold text-lg sm:text-xl text-slate-900 dark:text-white mb-2 sm:mb-3">
                Mechanics & Execution
              </h3>
              <p className="text-slate-700 dark:text-gray-300 text-xs sm:text-sm leading-relaxed mb-5 sm:mb-6 whitespace-pre-line">
                {lesson.explanation}
              </p>

              <div className="bg-primary/10 border border-primary/20 rounded-xl p-3.5 sm:p-4 flex gap-3">
                <PlayCircle className="w-4 h-4 sm:w-5 sm:h-5 text-primary shrink-0 mt-0.5" />
                <p className="text-xs sm:text-sm text-slate-800 dark:text-gray-200 font-medium leading-normal">
                  Use the controls below to step through each move. Drag the 3D cube to inspect hidden layers and spatial alignments.
                </p>
              </div>
            </div>

            {/* Bottom Controls & Standardized Action Button */}
            <div className="p-4 sm:p-5 border-t border-slate-200/60 dark:border-white/10 bg-slate-50/80 dark:bg-[#111315]/80 shrink-0">
              <PlaybackControls
                isPlaying={isPlaying}
                togglePlay={togglePlay}
                nextMove={nextMove}
                prevMove={prevMove}
                speed={speed}
                setSpeed={setSpeed}
                progress={totalMoves > 0 ? (currentTimelineIndex + 1) / totalMoves : 0}
              />

              {/* Standardized Primary Action Toggle Button */}
              <button
                type="button"
                onClick={handleActionClick}
                className={clsx(
                  "h-10 px-5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 select-none group cursor-pointer w-full mt-4",
                  isCompleted
                    ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400"
                    : "bg-gradient-to-r from-primary to-secondary text-white btn-glow border border-white/20 hover:opacity-95 shadow-md"
                )}
              >
                {isCompleted ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 group-hover:hidden shrink-0" />
                    <X className="w-4 h-4 text-red-400 hidden group-hover:inline-block shrink-0" />
                    <span className="group-hover:hidden">Completed</span>
                    <span className="hidden group-hover:inline">Undo Completion</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
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