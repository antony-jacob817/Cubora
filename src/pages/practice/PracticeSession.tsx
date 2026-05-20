import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Timer as TimerIcon, Trophy, RefreshCw, Activity, Target } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { PageTransition } from '@/components/animations/PageTransition';
import { useTimer } from '@/hooks/useTimer';
import { generateScramble, calculateAverage, formatTime } from '@/utils/cubing';
import { clsx } from 'clsx';

interface SolveRecord {
  id: string;
  timeMs: number;
  scramble: string;
  date: Date;
}

export default function PracticeSession() {
  const { state, time, inspectionTime, resetTimer } = useTimer(true); // true = use 15s inspection
  
  const [scramble, setScramble] = useState('');
  const [solves, setSolves] = useState<SolveRecord[]>([]);

  // Generate initial scramble
  useEffect(() => {
    setScramble(generateScramble());
  }, []);

  // Handle solve completion
  useEffect(() => {
    if (state === 'STOPPED' && time > 0) {
      setSolves(prev => [{
        id: Math.random().toString(36).substring(7),
        timeMs: time,
        scramble,
        date: new Date()
      }, ...prev]);
      
      // Auto-generate next scramble
      setScramble(generateScramble());
    }
  }, [state]);

  // Derived Stats
  const timesMs = solves.map(s => s.timeMs);
  const pb = timesMs.length > 0 ? Math.min(...timesMs) : null;
  const ao5 = calculateAverage(timesMs, 5);
  const ao12 = calculateAverage(timesMs, 12);

  // Dynamic color for the main timer text
  const getTimerColor = () => {
    switch (state) {
      case 'READY_WAIT': return 'text-red-500 drop-shadow-[0_0_20px_rgba(239,68,68,0.5)]';
      case 'READY': return 'text-emerald-500 drop-shadow-[0_0_20px_rgba(16,185,129,0.5)]';
      case 'RUNNING': return 'text-white';
      case 'STOPPED': return 'text-primary';
      default: return 'text-white';
    }
  };

  return (
    <PageTransition className="w-full h-[calc(100vh-100px)] flex flex-col lg:flex-row gap-6 pb-6">
      
      {/* Left Area: Main Timer Focus View */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Scramble Display */}
        <div className="glass-panel p-6 text-center mb-6 relative overflow-hidden group">
           <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button 
                onClick={() => setScramble(generateScramble())}
                className="p-2 text-gray-400 hover:text-white bg-white/5 rounded-full transition-colors"
                title="Next Scramble"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
           </div>
           <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Current Scramble</h3>
           <p className="font-display font-bold text-xl lg:text-3xl text-white tracking-wider leading-relaxed">
             {scramble}
           </p>
        </div>

        {/* Timer Canvas */}
        <div className="flex-1 glass-panel flex flex-col items-center justify-center relative cursor-default select-none">
          
          <AnimatePresence>
            {(state === 'IDLE' || state === 'STOPPED') && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="absolute top-10 flex items-center gap-2 text-gray-400 text-sm font-medium"
              >
                <span className="px-2 py-1 bg-white/10 rounded-md font-mono text-white text-xs">SPACE</span>
                <span>Press and hold to start</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Massive Timer Display */}
          <motion.div 
            className={clsx(
              "font-display font-bold tabular-nums tracking-tighter transition-colors duration-200",
              getTimerColor(),
              state === 'INSPECTION' ? 'text-[12rem] lg:text-[16rem]' : 'text-[8rem] sm:text-[10rem] lg:text-[14rem]'
            )}
            style={{ fontVariantNumeric: 'tabular-nums' }}
          >
            {state === 'INSPECTION' 
              ? inspectionTime 
              : formatTime(time || (solves[0]?.timeMs ?? 0))
            }
          </motion.div>

          {/* Save/Reset Controls when stopped */}
          <AnimatePresence>
            {state === 'STOPPED' && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="absolute bottom-10 flex gap-4"
              >
                <Button variant="secondary" onClick={resetTimer}>Discard</Button>
                <Button variant="glow" onClick={resetTimer}>Save & Next</Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Right Area: Session Stats & History */}
      <div className="w-full lg:w-96 flex flex-col gap-6">
        
        {/* Core Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="glass-panel p-4 flex flex-col">
            <span className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2 mb-2">
              <Trophy className="w-4 h-4 text-yellow-500" /> PB Single
            </span>
            <span className="font-display font-bold text-2xl text-white">{pb ? formatTime(pb) : '--'}</span>
          </div>
          <div className="glass-panel p-4 flex flex-col">
            <span className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2 mb-2">
              <Activity className="w-4 h-4 text-primary" /> Session Avg
            </span>
            <span className="font-display font-bold text-2xl text-white">
              {timesMs.length > 0 ? formatTime(timesMs.reduce((a,b)=>a+b,0)/timesMs.length) : '--'}
            </span>
          </div>
          <div className="glass-panel p-4 flex flex-col">
            <span className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2 mb-2">
              <Target className="w-4 h-4 text-tertiary" /> Ao5
            </span>
            <span className="font-display font-bold text-2xl text-white">{ao5 ? formatTime(ao5) : '--'}</span>
          </div>
          <div className="glass-panel p-4 flex flex-col">
            <span className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2 mb-2">
              <Target className="w-4 h-4 text-secondary" /> Ao12
            </span>
            <span className="font-display font-bold text-2xl text-white">{ao12 ? formatTime(ao12) : '--'}</span>
          </div>
        </div>

        {/* Solve History */}
        <div className="glass-panel p-0 flex-1 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
             <h3 className="font-display font-bold text-white text-sm tracking-widest uppercase">Recent Solves</h3>
             <span className="text-xs font-mono text-gray-500">{solves.length} Total</span>
          </div>
          
          <div className="flex-1 overflow-y-auto p-2 space-y-1 hide-scrollbar">
            {solves.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-500 text-sm">
                <TimerIcon className="w-8 h-8 mb-2 opacity-50" />
                No solves yet this session.
              </div>
            ) : (
              solves.map((solve, idx) => (
                <div key={solve.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors group">
                  <div className="flex items-center gap-4">
                    <span className="text-xs font-mono text-gray-500 w-6">{solves.length - idx}.</span>
                    <span className="font-display font-bold text-white text-lg">{formatTime(solve.timeMs)}</span>
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="text-xs text-gray-400 hover:text-red-400 font-bold px-2 py-1 rounded bg-white/5">+2</button>
                    <button className="text-xs text-gray-400 hover:text-red-400 font-bold px-2 py-1 rounded bg-white/5">DNF</button>
                    <button className="text-xs text-gray-400 hover:text-white px-2 py-1 rounded bg-white/5">X</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

    </PageTransition>
  );
}