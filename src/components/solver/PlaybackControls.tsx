import { useState } from 'react';
import { Play, Pause, SkipBack, SkipForward, Timer, Check } from 'lucide-react';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';

interface PlaybackControlsProps {
  isPlaying: boolean;
  togglePlay: () => void;
  nextMove: () => void;
  prevMove: () => void;
  speed: number;
  setSpeed: (s: number) => void;
  progress: number; // 0 to 1
}

export function PlaybackControls({ isPlaying, togglePlay, nextMove, prevMove, speed, setSpeed, progress }: PlaybackControlsProps) {
  const [showSpeed, setShowSpeed] = useState(false);

  return (
    <div className="w-full flex flex-col items-center gap-3 sm:gap-4 mt-2 sm:mt-6">
      {/* Progress Bar */}
      <div className="w-full max-w-lg h-1 sm:h-1.5 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden relative">
        <div 
          className="absolute top-0 left-0 h-full bg-primary transition-all duration-300"
          style={{ width: `${progress * 100}%` }}
        />
      </div>

      {/* Controls Container - Relative wrapper guarantees center controls never shift */}
      <div className="relative flex w-full max-w-lg items-center justify-center mt-1 sm:mt-2">
        
        {/* Left: Playback Speed Selector Dropdown */}
        <div className="absolute left-0 z-20">
          <button 
            onClick={() => setShowSpeed(!showSpeed)}
            className={clsx(
              "w-9 h-9 sm:w-11 sm:h-11 rounded-full flex items-center justify-center bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white transition-colors relative shadow-sm",
              showSpeed && "text-primary dark:text-white border-primary/30 dark:border-white/20 bg-primary/10 dark:bg-white/10"
            )}
            title="Playback Speed"
          >
            <Timer className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          <AnimatePresence>
            {showSpeed && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                className="absolute bottom-12 left-0 bg-white dark:bg-[#181A1D] border border-slate-200 dark:border-white/10 shadow-2xl rounded-2xl w-40 p-2.5 flex flex-col gap-0.5 z-30 origin-bottom-left"
              >
                {/* Small indicator bubble arrow pointing at the button */}
                <div className="absolute -bottom-1 w-2.5 h-2.5 bg-white dark:bg-[#181A1D] border-r border-b border-slate-200 dark:border-white/10 rotate-45 left-4 z-10" />
                
                <span className="text-[9px] font-bold text-slate-400 dark:text-gray-500 uppercase tracking-widest mb-1.5 px-2 block select-none">
                  Playback Speed
                </span>

                {[0.5, 0.75, 1.0, 1.25, 1.5].map(s => {
                  const isSelected = speed === s;
                  return (
                    <button
                      key={s}
                      onClick={() => {
                        setSpeed(s);
                        setShowSpeed(false);
                      }}
                      className={clsx(
                        "w-full flex items-center gap-2 px-2 py-1.5 rounded-xl text-xs font-bold transition-colors text-left relative z-25 min-h-[32px] sm:min-h-0",
                        isSelected 
                          ? "bg-slate-100 dark:bg-white/5 text-slate-900 dark:text-white" 
                          : "text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/[0.02]"
                      )}
                    >
                      <span className="w-3.5 flex items-center justify-center shrink-0">
                        {isSelected && <Check className="w-3.5 h-3.5 text-primary" />}
                      </span>
                      <span>{s === 1.0 ? "1x" : `${s}x`}</span>
                      {s === 1.0 && (
                        <span className="text-[7.5px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-gray-500 bg-slate-200/50 dark:bg-white/10 px-1.5 py-0.5 rounded-md ml-auto">
                          DEFAULT
                        </span>
                      )}
                    </button>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Center: Media Controls (Always perfectly aligned in the dead center) */}
        <div className="flex items-center justify-center gap-2 sm:gap-5 z-10">
          <button onClick={prevMove} className="p-2 text-slate-700 hover:text-slate-900 dark:text-gray-400 dark:hover:text-white transition-colors active:scale-95">
            <SkipBack className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          
          <button 
            onClick={togglePlay}
            className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-slate-900 dark:bg-white text-white dark:text-[#111315] flex items-center justify-center hover:scale-105 active:scale-95 transition-transform shadow-md dark:shadow-[0_0_20px_rgba(255,255,255,0.3)]"
          >
            {isPlaying ? <Pause className="w-5 h-5 sm:w-6 sm:h-6 fill-current" /> : <Play className="w-5 h-5 sm:w-6 sm:h-6 fill-current ml-0.5 sm:ml-1" />}
          </button>
          
          <button onClick={nextMove} className="p-2 text-slate-700 hover:text-slate-900 dark:text-gray-400 dark:hover:text-white transition-colors active:scale-95">
            <SkipForward className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

      </div>
    </div>
  );
}