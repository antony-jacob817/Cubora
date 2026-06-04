import { X, PlayCircle, BookOpen, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { CubeViewer } from '@/components/3d/CubeViewer'; // Ensure this uses AnimatedCube internally based on currentMove
import { PlaybackControls } from '@/components/solver/PlaybackControls';
import { useSolvePlayback } from '@/hooks/useSolvePlayback';
import type { Lesson } from '@/data/academy';

interface LessonPlayerProps {
  lesson: Lesson;
  onClose: () => void;
  onComplete: () => void;
}

export function LessonPlayer({ lesson, onClose, onComplete }: LessonPlayerProps) {
  // Wrap the single algorithm into the format expected by our hook
  const lessonData = [{ phase: lesson.title, explanation: lesson.explanation, moves: lesson.algorithm }];
  
  const { 
    isPlaying, togglePlay, speed, setSpeed, nextMove, prevMove, 
    currentTimelineIndex, totalMoves, currentMove 
  } = useSolvePlayback(lessonData);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 lg:p-12 bg-[#DCDFE2]/90 dark:bg-[#111315]/90 backdrop-blur-xl"
    >
      <div className="w-full max-w-6xl h-full max-h-[800px] glass-panel border-slate-200 dark:border-white/20 flex flex-col overflow-hidden relative shadow-[0_0_50px_rgba(0,0,0,0.3)]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200/60 dark:border-white/10 flex justify-between items-center bg-white/60 dark:bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="font-display font-bold text-lg text-slate-900 dark:text-white">{lesson.title}</h2>
              <p className="text-xs text-slate-700 dark:text-gray-400 font-mono tracking-wider">ACADEMY MODULE</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-500 hover:text-slate-800 dark:text-gray-400 dark:hover:text-white bg-slate-100 dark:bg-white/5 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Layout Split */}
        <div className="flex-1 flex flex-col lg:flex-row min-h-0">
          
          {/* 3D Interaction Area */}
          <div className="flex-1 min-h-[260px] sm:min-h-[360px] lg:min-h-0 relative bg-gradient-to-b from-transparent to-primary/5 touch-none">
            <CubeViewer 
              className="absolute inset-0"
              currentMove={currentMove}
              speed={speed}
              currentTimelineIndex={currentTimelineIndex}
            />
            
            {/* Algorithm Overlay */}
            <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-white/80 dark:bg-[#111315]/80 backdrop-blur-md border border-slate-200/60 dark:border-white/10 px-6 py-3 rounded-2xl shadow-sm">
               <div className="flex gap-2">
                 {lesson.algorithm.split(' ').map((move, idx) => (
                   <span 
                     key={idx} 
                     className={`font-mono text-xl font-bold transition-all duration-200 ${
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

          {/* Sidebar Instructions */}
          <div className="w-full lg:w-[400px] border-l border-slate-200/60 dark:border-white/10 flex flex-col bg-white/50 dark:bg-white/[0.02]">
            <div className="p-8 flex-1 overflow-y-auto">
              <h3 className="font-display font-bold text-2xl text-slate-900 dark:text-white mb-4">Mechanics</h3>
              <p className="text-slate-800 dark:text-gray-300 leading-relaxed mb-8">{lesson.explanation}</p>
              
              <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 flex gap-3">
                <PlayCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <p className="text-sm text-slate-800 dark:text-gray-200 font-medium">
                  Use the controls below to step through the algorithm. Rotate the 3D canvas to study the hidden faces during the sequence.
                </p>
              </div>
            </div>

            {/* Controls */}
            <div className="p-6 border-t border-slate-200/60 dark:border-white/10 bg-slate-50/60 dark:bg-[#111315]/50">
              <PlaybackControls 
                isPlaying={isPlaying} togglePlay={togglePlay}
                nextMove={nextMove} prevMove={prevMove}
                speed={speed} setSpeed={setSpeed}
                progress={totalMoves > 0 ? (currentTimelineIndex + 1) / totalMoves : 0}
              />
              
              <Button 
                variant="glow" className="w-full mt-6 gap-2"
                onClick={() => { onComplete(); onClose(); }}
              >
                <CheckCircle2 className="w-5 h-5" /> Mark as Mastered
              </Button>
            </div>
          </div>

        </div>
      </div>
    </motion.div>
  );
}