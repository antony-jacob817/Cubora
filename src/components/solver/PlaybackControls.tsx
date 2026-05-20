import { Play, Pause, SkipBack, SkipForward } from 'lucide-react';
import { clsx } from 'clsx';

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
  return (
    <div className="w-full flex flex-col items-center gap-4 mt-6">
      {/* Progress Bar */}
      <div className="w-full max-w-lg h-1.5 bg-white/10 rounded-full overflow-hidden relative">
        <div 
          className="absolute top-0 left-0 h-full bg-primary transition-all duration-300"
          style={{ width: `${progress * 100}%` }}
        />
      </div>

      <div className="flex items-center gap-8">
        {/* Speed Controls */}
        <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5">
          <span className="text-xs font-bold text-gray-500 uppercase">Speed</span>
          {[0.5, 1, 2].map(s => (
            <button 
              key={s} 
              onClick={() => setSpeed(s)}
              className={clsx(
                "text-xs font-bold font-mono px-2 py-1 rounded-md transition-colors",
                speed === s ? "bg-primary/20 text-primary" : "text-gray-400 hover:text-white"
              )}
            >
              {s}x
            </button>
          ))}
        </div>

        {/* Media Controls */}
        <div className="flex items-center gap-4">
          <button onClick={prevMove} className="p-2 text-gray-400 hover:text-white transition-colors">
            <SkipBack className="w-5 h-5" />
          </button>
          
          <button 
            onClick={togglePlay}
            className="w-14 h-14 rounded-full bg-white text-background flex items-center justify-center hover:scale-105 transition-transform shadow-[0_0_20px_rgba(255,255,255,0.3)]"
          >
            {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-1" />}
          </button>
          
          <button onClick={nextMove} className="p-2 text-gray-400 hover:text-white transition-colors">
            <SkipForward className="w-5 h-5" />
          </button>
        </div>

        {/* Context Display */}
        <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 min-w-[120px] justify-center">
           <span className="text-xs font-bold text-primary font-mono tracking-widest uppercase">
             ALGORITHM
           </span>
        </div>
      </div>
    </div>
  );
}