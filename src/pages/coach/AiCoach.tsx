import { useState, useEffect } from 'react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { 
  BrainCircuit, Sparkles, Target, Zap, 
  ChevronRight, Activity, Crosshair, Map, PlayCircle
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { PageTransition } from '@/components/animations/PageTransition';
import { clsx } from 'clsx';

// --- MOCK AI DIAGNOSTIC DATA ---
const diagnosticData = {
  status: 'ANALYZING_COMPLETE',
  lastSolveCount: 42,
  primaryWeakness: {
    title: 'F2L Lookahead Pauses',
    impact: '-1.2s per solve',
    description: 'System detects an average 0.8s hesitation between cross completion and your first F2L pair insertion. Your turn speed is high, but recognition is lagging.',
    confidence: 94
  },
  recommendedDrills: [
    { id: 'd1', title: 'Blind Cross & Tracking', duration: '5 mins', roi: 'High', type: 'Focus', icon: Crosshair },
    { id: 'd2', title: 'Slow Turning (Metronome)', duration: '10 mins', roi: 'Medium', type: 'Flow', icon: Activity },
    { id: 'd3', title: 'OLL Recognition Trainer', duration: '3 mins', roi: 'Low', type: 'Speed', icon: Zap }
  ],
  roadmap: [
    { id: 'r1', phase: 'Current', title: 'Master 2-Look OLL', status: 'active', progress: 85 },
    { id: 'r2', phase: 'Next', title: 'Advanced F2L Inserts (Back Slots)', status: 'locked', progress: 0 },
    { id: 'r3', phase: 'Future', title: 'Full PLL Transition', status: 'locked', progress: 0 }
  ]
};

// --- ANIMATION VARIANTS ---
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } }
};

export default function AiCoach() {
  const [isProcessing, setIsProcessing] = useState(true);

  // Simulate AI "thinking" on mount to give it that authentic feel
  useEffect(() => {
    const timer = setTimeout(() => setIsProcessing(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <PageTransition className="w-full flex flex-col gap-6 pb-12 min-h-screen">
      
      {/* Header Context */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-2">
        <div>
          <h1 className="font-display text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            <div className="relative w-8 h-8 flex items-center justify-center">
              {isProcessing && <div className="absolute inset-0 border-2 border-t-tertiary border-transparent rounded-full animate-spin" />}
              <BrainCircuit className={clsx("w-6 h-6", isProcessing ? "text-gray-500" : "text-tertiary")} />
            </div>
            Neural Coach
          </h1>
          <p className="text-gray-400 text-sm mt-2">
            Personalized directives generated from your recent 42 solves.
          </p>
        </div>
        
        {/* Status Indicator */}
        <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-2 rounded-2xl">
          <span className="relative flex h-2.5 w-2.5">
            {!isProcessing && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-tertiary opacity-75"></span>}
            <span className={clsx("relative inline-flex rounded-full h-2.5 w-2.5", isProcessing ? "bg-orange-500 animate-pulse" : "bg-tertiary")}></span>
          </span>
          <span className="text-xs font-mono font-bold tracking-wider text-gray-300">
            {isProcessing ? 'COMPILING DATA...' : 'SYSTEM OPTIMAL'}
          </span>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {isProcessing ? (
          <motion.div 
            key="processing"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center min-h-[400px] glass-panel border-tertiary/20"
          >
            <div className="w-24 h-24 relative flex items-center justify-center mb-6">
              <div className="absolute inset-0 bg-tertiary/20 rounded-full blur-xl animate-pulse" />
              <BrainCircuit className="w-12 h-12 text-tertiary relative z-10" />
            </div>
            <h2 className="font-display text-xl font-bold text-white mb-2">Analyzing Solve Trajectories</h2>
            <p className="text-gray-400 font-mono text-sm">Running pattern recognition on Phase Splits...</p>
          </motion.div>
        ) : (
          <motion.div 
            key="dashboard"
            variants={containerVariants} initial="hidden" animate="visible"
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            
            {/* LEFT COLUMN: Main Directive & Drills */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              
              {/* Primary Weakness Card */}
              <motion.div variants={itemVariants} className="glass-panel p-8 relative overflow-hidden group border-tertiary/30">
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-tertiary/10 blur-[80px] rounded-full pointer-events-none group-hover:bg-tertiary/20 transition-colors duration-700" />
                
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-6">
                    <Target className="w-5 h-5 text-tertiary" />
                    <h3 className="font-display font-bold text-sm tracking-widest uppercase text-tertiary">Priority Target</h3>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-4">
                    <h2 className="font-display text-3xl md:text-4xl font-bold text-white">
                      {diagnosticData.primaryWeakness.title}
                    </h2>
                    <div className="bg-red-500/10 border border-red-500/20 px-3 py-1.5 rounded-xl flex items-center gap-2 shrink-0">
                      <Activity className="w-4 h-4 text-red-400" />
                      <span className="text-red-400 font-bold text-sm font-mono">{diagnosticData.primaryWeakness.impact}</span>
                    </div>
                  </div>
                  
                  <p className="text-gray-300 leading-relaxed text-lg mb-8 max-w-2xl">
                    {diagnosticData.primaryWeakness.description}
                  </p>

                  <div className="flex items-center gap-4">
                    <Button variant="glow" className="bg-tertiary/20 hover:bg-tertiary/30 border-tertiary/50 text-white shadow-[0_0_20px_rgba(6,182,212,0.3)]">
                      Initialize Targeted Drill
                    </Button>
                    <span className="text-xs font-mono text-gray-500">{diagnosticData.primaryWeakness.confidence}% AI Confidence</span>
                  </div>
                </div>
              </motion.div>

              {/* Smart Practice Generator */}
              <motion.div variants={itemVariants} className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-display font-bold text-xl text-white">Generated Session</h3>
                  <Button variant="secondary" size="sm" className="gap-2">
                    <Zap className="w-4 h-4" /> Regenerate
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {diagnosticData.recommendedDrills.map((drill, idx) => (
                    <div key={drill.id} className="glass-panel p-5 flex flex-col group hover:border-primary/40 transition-colors cursor-pointer">
                      <div className="flex justify-between items-start mb-4">
                        <div className={clsx(
                          "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
                          idx === 0 ? "bg-tertiary/20 text-tertiary" : "bg-white/5 text-gray-400 group-hover:text-white"
                        )}>
                          <drill.icon className="w-5 h-5" />
                        </div>
                        <span className="text-xs font-mono text-gray-500">{drill.duration}</span>
                      </div>
                      
                      <h4 className="font-bold text-white mb-1 group-hover:text-primary transition-colors">{drill.title}</h4>
                      <p className="text-xs text-gray-400 mb-6">{drill.type} Training</p>
                      
                      <div className="mt-auto flex items-center justify-between">
                        <span className={clsx(
                          "text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md",
                          drill.roi === 'High' ? "bg-emerald-500/10 text-emerald-400" : "bg-white/5 text-gray-400"
                        )}>
                          {drill.roi} ROI
                        </span>
                        <PlayCircle className="w-5 h-5 text-gray-500 group-hover:text-primary transition-colors" />
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

            </div>

            {/* RIGHT COLUMN: Learning Roadmap */}
            <motion.div variants={itemVariants} className="glass-panel p-6 flex flex-col">
              <div className="flex items-center gap-2 mb-8">
                <Map className="w-5 h-5 text-secondary" />
                <h3 className="font-display font-bold text-xl text-white">Evolution Path</h3>
              </div>

              <div className="flex-1 relative">
                {/* Connecting Line */}
                <div className="absolute left-[19px] top-6 bottom-6 w-0.5 bg-white/5" />

                <div className="space-y-8 relative">
                  {diagnosticData.roadmap.map((step, idx) => {
                    const isActive = step.status === 'active';
                    
                    return (
                      <div key={step.id} className={clsx(
                        "flex gap-4 relative",
                        step.status === 'locked' && "opacity-50 grayscale"
                      )}>
                        {/* Node */}
                        <div className="relative mt-1">
                          <div className={clsx(
                            "w-10 h-10 rounded-xl flex items-center justify-center relative z-10 transition-colors",
                            isActive ? "bg-secondary/20 border-2 border-secondary" : "bg-background border border-white/10"
                          )}>
                            {isActive ? (
                              <Sparkles className="w-5 h-5 text-secondary" />
                            ) : (
                              <span className="text-xs font-mono font-bold text-gray-500">{idx + 1}</span>
                            )}
                          </div>
                          {isActive && (
                            <div className="absolute inset-0 bg-secondary/20 blur-md rounded-full" />
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 pt-1">
                          <span className={clsx(
                            "text-[10px] font-bold uppercase tracking-widest mb-1 block",
                            isActive ? "text-secondary" : "text-gray-500"
                          )}>
                            {step.phase} Focus
                          </span>
                          <h4 className="font-bold text-white text-sm mb-2">{step.title}</h4>
                          
                          {isActive ? (
                            <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden mt-3">
                              <div className="h-full bg-secondary" style={{ width: `${step.progress}%` }} />
                            </div>
                          ) : (
                            <button className="text-xs text-gray-500 hover:text-white transition-colors flex items-center gap-1 mt-1">
                              View Curriculum <ChevronRight className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <Button variant="secondary" className="w-full mt-8 bg-white/[0.02]">
                Full Curriculum Tree
              </Button>
            </motion.div>

          </motion.div>
        )}
      </AnimatePresence>
    </PageTransition>
  );
}