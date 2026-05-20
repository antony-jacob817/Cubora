import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { CubeViewer } from '@/components/3d/CubeViewer';
import { PlaybackControls } from '@/components/solver/PlaybackControls';
import { useSolvePlayback, type SolveStep } from '@/hooks/useSolvePlayback';
import { PageTransition } from '@/components/animations/PageTransition';
import { clsx } from 'clsx';

// Mock data reflecting what the backend will return
const mockSolveData: SolveStep[] = [
  { phase: 'Cross', explanation: 'Aligning the corner and edge pieces in the top layer to prepare for F2L insertion in the front-right slot.', moves: "F R U' R' F'" },
  { phase: 'F2L Pair 1', explanation: 'Pairing the red-blue edge with the white-red-blue corner.', moves: "U R U' R'" },
  { phase: 'OLL', explanation: 'Orienting the top layer to full yellow.', moves: "R U R' U R U2 R'" },
];

export default function SolverShowcase() {
  const { 
    isPlaying, togglePlay, speed, setSpeed, nextMove, prevMove, 
    currentTimelineIndex, activeStepIndex, totalMoves, currentMove 
  } = useSolvePlayback(mockSolveData);

  const activeStep = mockSolveData[activeStepIndex || 0];

  return (
    <PageTransition className="w-full h-[calc(100vh-100px)] flex flex-col lg:flex-row gap-6 pb-6">
      
      {/* Left/Main Area: 3D Engine & Controls */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex justify-between items-end mb-6">
          <div>
            <h1 className="font-display text-3xl font-bold text-white tracking-tight">3D Solver Showcase</h1>
            <p className="text-gray-400 text-sm mt-1">Analyze and perfect your solve with AI precision.</p>
          </div>
          <div className="hidden sm:flex gap-2">
            <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-gray-400 font-bold">Beginner</span>
            <span className="px-3 py-1 rounded-full bg-primary/20 border border-primary/30 text-primary font-bold text-xs">CFOP</span>
            <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-gray-400 font-bold">Roux</span>
          </div>
        </div>

        {/* 3D Canvas Area */}
        <div className="flex-1 glass-panel relative overflow-hidden flex flex-col">
          <div className="flex-1 w-full relative">
            <CubeViewer 
              className="absolute inset-0"
              currentMove={currentMove}
              speed={speed}
            />
          </div>
          
          {/* Bottom Bar inside the viewer */}
          <div className="p-6 bg-gradient-to-t from-background/90 to-transparent relative z-10 border-t border-white/5">
             <PlaybackControls 
                isPlaying={isPlaying} togglePlay={togglePlay}
                nextMove={nextMove} prevMove={prevMove}
                speed={speed} setSpeed={setSpeed}
                progress={totalMoves > 0 ? (currentTimelineIndex + 1) / totalMoves : 0}
             />
             
             {/* Large Current Move Display */}
             <div className="absolute top-0 right-10 -translate-y-1/2 flex gap-2">
                {currentMove && (
                  <motion.div 
                    key={currentTimelineIndex}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="w-16 h-16 bg-white border border-white/20 rounded-2xl flex items-center justify-center font-display font-bold text-3xl text-background shadow-[0_10px_30px_rgba(255,255,255,0.2)]"
                  >
                    {currentMove}
                  </motion.div>
                )}
             </div>
          </div>
        </div>
      </div>

      {/* Right Area: AI Insights & Move History */}
      <div className="w-full lg:w-96 flex flex-col gap-6">
        
        {/* AI Insight Card */}
        <div className="glass-panel p-6 border-secondary/30 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-secondary/10 to-transparent opacity-50" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-4 h-4 text-secondary" />
              <h3 className="font-display font-bold text-sm tracking-widest uppercase text-secondary">AI Insights</h3>
            </div>
            
            <h4 className="text-white font-bold text-lg mb-2">Optimal Next Move</h4>
            <div className="bg-background/50 border border-white/10 p-4 rounded-xl">
              <p className="text-sm text-gray-300 leading-relaxed">
                <span className="font-bold text-white">Explanation:</span> {activeStep?.explanation}
              </p>
            </div>
          </div>
        </div>

        {/* Move History / Steps List */}
        <div className="glass-panel p-0 flex-1 flex flex-col overflow-hidden">
          <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
             <h3 className="font-display font-bold text-white text-sm tracking-widest uppercase">Move History</h3>
             <span className="text-xs font-mono text-gray-500">{currentTimelineIndex + 1}/{totalMoves} Moves</span>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-2 hide-scrollbar">
            {mockSolveData.map((step, idx) => {
              const isActive = idx === activeStepIndex;
              const isPast = idx < activeStepIndex;

              return (
                <div key={idx} className={clsx(
                  "p-4 rounded-xl transition-all duration-300 border",
                  isActive ? "bg-primary/10 border-primary/30" : "bg-transparent border-transparent"
                )}>
                  <div className="flex items-center justify-between mb-2">
                     <h4 className={clsx("font-bold text-sm", isActive ? "text-primary" : isPast ? "text-white" : "text-gray-500")}>
                       {String(idx + 1).padStart(2, '0')}. {step.phase}
                     </h4>
                     {isActive && <span className="text-xs font-bold text-primary bg-primary/20 px-2 py-0.5 rounded-full">Current</span>}
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {step.moves.split(' ').map((move, mIdx) => (
                      <span key={mIdx} className={clsx(
                        "font-mono text-sm font-bold",
                        isActive ? "text-white" : isPast ? "text-gray-400" : "text-gray-600"
                      )}>
                        {move}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </PageTransition>
  );
}