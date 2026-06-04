import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowLeft, Loader2 } from 'lucide-react';
import { CubeViewer } from '@/components/3d/CubeViewer';
import { PlaybackControls } from '@/components/solver/PlaybackControls';
import { useSolvePlayback } from '@/hooks/useSolvePlayback';
import { PageTransition } from '@/components/animations/PageTransition';
import { clsx } from 'clsx';
import { useSolver } from '@/context/SolverContext';
import { useNavigate } from 'react-router-dom';

export default function SolverShowcase() {
  const { solution } = useSolver();
  const navigate = useNavigate();
  
  const [is3DReady, setIs3DReady] = useState(false);

  useEffect(() => {
    // FIX: Extended the boot delay to 700ms. 
    // This allows the browser to completely garbage-collect the heavy OpenCV camera feed 
    // from the previous page BEFORE we ask the GPU to compile 3D shaders, stopping the memory crash.
    const timer = setTimeout(() => setIs3DReady(true), 700); 
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!solution || !solution.steps || solution.steps.length === 0) {
      navigate('/scanner', { replace: true });
    }
  }, [solution, navigate]);

  if (!solution || !solution.steps || solution.steps.length === 0) return null;

  const stepsToUse = solution.steps;
  
  const { 
    isPlaying, togglePlay, speed, setSpeed, nextMove, prevMove, 
    currentTimelineIndex, totalMoves, currentMove, action 
  } = useSolvePlayback(stepsToUse);

  const activeStep = stepsToUse[0]; 
  const isAlreadySolved = totalMoves === 0;

  const allMoves = useMemo(() => {
    if (isAlreadySolved) return [];
    return stepsToUse.flatMap(step => step.moves.split(' ')).filter(Boolean);
  }, [stepsToUse, isAlreadySolved]);

  return (
    <PageTransition className="w-full h-auto lg:h-[calc(100vh-100px)] lg:min-h-0 min-h-screen flex flex-col lg:flex-row gap-4 lg:gap-6 pb-12 sm:pb-6">
      
      <div className="flex-1 flex flex-col min-w-0">
        
        <button
          onClick={() => navigate('/correction')}
          className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors mb-3 sm:mb-5 w-fit"
        >
          <ArrowLeft className="w-4 h-4" /> Calibration
        </button>

        <div className="flex justify-between items-end mb-4 sm:mb-6">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">3D Solver Showcase</h1>
            <p className="text-slate-500 dark:text-gray-400 text-xs sm:text-sm mt-1">Analyze and perfect your solve with AI precision.</p>
          </div>
          <div className="hidden sm:flex gap-2">
            <span className={clsx("px-3 py-1 rounded-full border font-bold text-xs tracking-wider", isAlreadySolved ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-500" : "bg-primary/20 border-primary/30 text-primary")}>
              {isAlreadySolved ? 'ALREADY SOLVED' : 'KOCIEMBA OPTIMAL'}
            </span>
          </div>
        </div>

        <div className="w-full min-h-[420px] sm:min-h-[480px] lg:min-h-0 lg:flex-1 glass-panel relative overflow-hidden flex flex-col">
          
          <div className="flex-1 w-full relative touch-none bg-[#0B0F19]/5 overflow-hidden">
            
            {is3DReady && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8 }}
                className="absolute top-0 left-1/2 w-[120vw] h-full -translate-x-1/2"
              >
                <CubeViewer 
                  className="w-full h-full"
                  action={action}
                  speed={speed}
                  currentTimelineIndex={currentTimelineIndex}
                />
              </motion.div>
            )}
            
            {/* Loading Spinner Fallback */}
            <div className={clsx(
              "absolute inset-0 flex items-center justify-center flex-col gap-3 transition-opacity duration-700 pointer-events-none z-20",
              is3DReady ? "opacity-0" : "opacity-100"
            )}>
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
              <span className="text-xs font-bold tracking-widest text-slate-500 uppercase">Booting Engine...</span>
            </div>
          </div>
          
          <div className="shrink-0 w-full px-2 pb-4 pt-4 sm:px-6 sm:pb-6 sm:pt-6 bg-gradient-to-t from-[#DCDFE2] dark:from-[#111315] via-[#DCDFE2]/80 dark:via-[#111315]/80 to-transparent relative z-10 border-t border-slate-200/50 dark:border-white/5">
             <PlaybackControls 
                isPlaying={isPlaying} togglePlay={togglePlay} nextMove={nextMove} prevMove={prevMove} speed={speed} setSpeed={setSpeed}
                progress={totalMoves > 0 ? (currentTimelineIndex + 1) / totalMoves : 0}
             />
             <div className="absolute top-0 right-4 sm:right-10 -translate-y-1/2 flex gap-2">
                 {currentMove && (
                   <motion.div key={currentTimelineIndex} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="w-12 h-12 sm:w-16 sm:h-16 bg-slate-900 dark:bg-white border border-slate-700 dark:border-white/20 rounded-xl sm:rounded-2xl flex items-center justify-center font-display font-bold text-xl sm:text-3xl text-white dark:text-[#111315] shadow-md">
                     {currentMove}
                   </motion.div>
                 )}
             </div>
          </div>

        </div>
      </div>

      <div className="w-full lg:w-96 flex flex-col gap-4 sm:gap-6">
        <div className="glass-panel p-4 sm:p-6 border-secondary/30 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-secondary/10 to-transparent opacity-50" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
              <Sparkles className="w-4 h-4 text-secondary" />
              <h3 className="font-display font-bold text-xs sm:text-sm tracking-widest uppercase text-secondary">Kociemba'S Algorithm Analysis</h3>
            </div>
            <div className="bg-[#DCDFE2]/50 dark:bg-[#111315]/50 border border-slate-200 dark:border-white/10 p-3 sm:p-4 rounded-xl">
              <p className="text-xs sm:text-sm text-slate-700 dark:text-gray-300 leading-relaxed"><span className="font-bold text-slate-950 dark:text-white">Explanation:</span> {activeStep?.explanation}</p>
            </div>
          </div>
        </div>

        <div className="glass-panel p-0 h-[260px] sm:h-[300px] lg:h-auto lg:flex-1 flex flex-col overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-white/5 flex justify-between items-center bg-slate-50/50 dark:bg-white/[0.02]">
             <h3 className="font-display font-bold text-slate-900 dark:text-white text-xs sm:text-sm tracking-widest uppercase">Solution Algorithm</h3>
             <span className="text-[10px] sm:text-xs font-mono text-slate-500 dark:text-gray-400">{currentTimelineIndex + 1}/{totalMoves} Moves</span>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 hide-scrollbar">
            {isAlreadySolved ? (
              <div className="text-center py-8">
                 <span className="font-mono text-sm font-bold text-emerald-500 dark:text-emerald-400 tracking-wide">[ ZERO MOVES REQUIRED ]</span>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2 sm:gap-2.5">
                {allMoves.map((move, idx) => {
                  const isActive = idx === currentTimelineIndex;
                  const isPast = idx < currentTimelineIndex;
                  return (
                    <span 
                      key={idx} 
                      className={clsx(
                        "font-mono text-xs sm:text-[15px] font-bold px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg border transition-all duration-300",
                        isActive ? "bg-primary text-white border-primary shadow-[0_0_15px_rgba(59,130,246,0.4)] scale-110 z-10" : isPast ? "bg-transparent text-slate-400 border-slate-200/50 dark:border-white/10" : "bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-gray-300 border-transparent"
                      )}
                    >
                      {move}
                    </span>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </PageTransition>
  );
}