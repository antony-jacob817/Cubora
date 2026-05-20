import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Swords, Users, Crosshair, 
  Globe, Shield, Crown, AlertTriangle, ArrowUp
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { PageTransition } from '@/components/animations/PageTransition';
import { useTimer } from '@/hooks/useTimer';
import { generateScramble, formatTime } from '@/utils/cubing';
import { clsx } from 'clsx';

type MatchState = 'LOBBY' | 'SEARCHING' | 'FOUND' | 'RACING' | 'RESULTS';

// --- MOCK DATA ---
const PLAYER_ELO = 1420;
const MOCK_OPPONENT = {
  name: 'VortexCuber_99',
  elo: 1455,
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Vortex',
  finalTime: 13.42, // Pre-determined for the mock race
};

export default function MultiplayerHub() {
  const [matchState, setMatchState] = useState<MatchState>('LOBBY');
  const [scramble, setScramble] = useState('');
  const [countdown, setCountdown] = useState(3);
  
  // Real-time opponent simulation state
  const [opponentProgress, setOpponentProgress] = useState(0);
  const [opponentPhase, setOpponentPhase] = useState('Cross');

  // Utilize our high-precision timer (No WCA inspection for fast-paced 1v1)
  const { state: timerState, time: playerTime, resetTimer } = useTimer(false);

  // --- STATE MACHINE HANDLERS ---
  const startMatchmaking = () => {
    setMatchState('SEARCHING');
    
    // Simulate finding a match after 2.5 seconds
    setTimeout(() => {
      setMatchState('FOUND');
      setScramble(generateScramble(21));
      
      // Start 3-second countdown
      let count = 3;
      setCountdown(count);
      const interval = setInterval(() => {
        count -= 1;
        setCountdown(count);
        if (count === 0) {
          clearInterval(interval);
          setMatchState('RACING');
          resetTimer();
        }
      }, 1000);
    }, 2500);
  };

  const leaveMatch = () => {
    setMatchState('LOBBY');
    setOpponentProgress(0);
    resetTimer();
  };

  // --- OPPONENT SIMULATION LOOP ---
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    
    if (matchState === 'RACING') {
      interval = setInterval(() => {
        setOpponentProgress(prev => {
          const next = prev + (100 / (MOCK_OPPONENT.finalTime * 10)); // Advance based on their final time
          
          // Update visual phases based on percentage
          if (next > 20 && next < 50) setOpponentPhase('F2L');
          if (next >= 50 && next < 85) setOpponentPhase('OLL');
          if (next >= 85) setOpponentPhase('PLL');
          
          if (next >= 100) {
            clearInterval(interval);
            setOpponentPhase('FINISHED');
            return 100;
          }
          return next;
        });
      }, 100);
    }
    
    return () => clearInterval(interval);
  }, [matchState]);

  // Transition to results when player stops timer
  useEffect(() => {
    if (matchState === 'RACING' && timerState === 'STOPPED') {
      // Small delay for dramatic effect
      setTimeout(() => setMatchState('RESULTS'), 1000);
    }
  }, [timerState, matchState]);

  // --- DYNAMIC RENDERERS ---
  const playerWon = (playerTime / 1000) < MOCK_OPPONENT.finalTime;

  return (
    <PageTransition className="w-full flex flex-col gap-6 pb-12 min-h-[calc(100vh-100px)]">
      
      <AnimatePresence mode="wait">
        
        {/* ================= LOBBY STATE ================= */}
        {matchState === 'LOBBY' && (
          <motion.div key="lobby" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col gap-8 w-full max-w-5xl mx-auto">
            
            {/* Esports Header */}
            <div className="glass-panel p-8 relative overflow-hidden border-primary/30">
              <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/20 blur-[100px] rounded-full pointer-events-none" />
              <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Globe className="w-5 h-5 text-primary" />
                    <span className="text-xs font-bold text-primary tracking-widest uppercase">Global Servers Online</span>
                  </div>
                  <h1 className="font-display text-4xl md:text-5xl font-bold text-white tracking-tight">Competitive Hub</h1>
                </div>
                
                {/* Player Rank Display */}
                <div className="bg-background/80 backdrop-blur-md border border-white/10 p-4 rounded-2xl flex items-center gap-6 min-w-[250px]">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-secondary to-primary flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.4)]">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <span className="text-xs text-gray-400 font-bold uppercase tracking-wider block mb-1">Current Rating</span>
                    <div className="font-display font-bold text-2xl text-white flex items-center gap-2">
                      {PLAYER_ELO} <span className="text-sm font-mono text-emerald-400">+12</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Game Modes */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="glass-panel p-6 flex flex-col group hover:border-primary/50 transition-colors cursor-pointer relative overflow-hidden" onClick={startMatchmaking}>
                <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <Swords className="w-10 h-10 text-primary mb-4 relative z-10" />
                <h3 className="font-display font-bold text-2xl text-white mb-2 relative z-10">Ranked 1v1</h3>
                <p className="text-sm text-gray-400 mb-6 relative z-10">Match against opponents of similar skill. Affects global Elo rating.</p>
                <div className="mt-auto flex items-center justify-between relative z-10">
                  <span className="text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full">1,204 Online</span>
                  <Button variant="glow" size="sm">Find Match</Button>
                </div>
              </div>

              <div className="glass-panel p-6 flex flex-col opacity-50 grayscale cursor-not-allowed">
                <Users className="w-10 h-10 text-tertiary mb-4" />
                <h3 className="font-display font-bold text-2xl text-white mb-2">Free For All</h3>
                <p className="text-sm text-gray-400 mb-6">8-player lobby race. First to finish takes the crown. Unranked.</p>
                <div className="mt-auto">
                  <span className="text-xs font-bold text-gray-500 bg-white/5 px-3 py-1 rounded-full">Coming Soon</span>
                </div>
              </div>

              <div className="glass-panel p-6 flex flex-col opacity-50 grayscale cursor-not-allowed">
                <Crosshair className="w-10 h-10 text-secondary mb-4" />
                <h3 className="font-display font-bold text-2xl text-white mb-2">Private Room</h3>
                <p className="text-sm text-gray-400 mb-6">Invite friends via link. Custom scrambles and custom rulesets.</p>
                <div className="mt-auto">
                  <span className="text-xs font-bold text-gray-500 bg-white/5 px-3 py-1 rounded-full">Coming Soon</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ================= SEARCHING / FOUND STATE ================= */}
        {(matchState === 'SEARCHING' || matchState === 'FOUND') && (
          <motion.div key="searching" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex-1 flex flex-col items-center justify-center min-h-[600px]">
            <div className="relative w-64 h-64 flex items-center justify-center mb-12">
              <div className="absolute inset-0 border-2 border-primary/20 rounded-full animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite]" />
              <div className="absolute inset-4 border-2 border-primary/40 rounded-full animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite_0.5s]" />
              
              {matchState === 'SEARCHING' ? (
                <Globe className="w-16 h-16 text-primary relative z-10" />
              ) : (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }} className="w-32 h-32 bg-red-500/20 rounded-full flex items-center justify-center border border-red-500/50 shadow-[0_0_50px_rgba(239,68,68,0.4)]">
                  <Swords className="w-12 h-12 text-red-500" />
                </motion.div>
              )}
            </div>

            {matchState === 'SEARCHING' ? (
              <>
                <h2 className="font-display text-2xl font-bold text-white mb-2">Searching for Opponent...</h2>
                <p className="text-gray-400 font-mono text-sm mb-8">Estimated Wait: 0:04</p>
                <Button variant="secondary" onClick={leaveMatch}>Cancel Matchmaking</Button>
              </>
            ) : (
              <>
                <h2 className="font-display text-4xl font-bold text-white mb-2">Match Found!</h2>
                <div className="flex items-center gap-8 mt-8">
                  <div className="text-center">
                    <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Cubora" alt="You" loading="lazy" className="w-20 h-20 rounded-2xl bg-primary/20 border-2 border-primary mb-3" />
                    <span className="font-bold text-white block">You</span>
                    <span className="text-xs text-primary font-mono">{PLAYER_ELO} Elo</span>
                  </div>
                  
                  <span className="font-display text-4xl font-bold text-gray-500 italic">VS</span>
                  
                  <div className="text-center">
                    <img src={MOCK_OPPONENT.avatar} alt="Opponent" loading="lazy" className="w-20 h-20 rounded-2xl bg-red-500/20 border-2 border-red-500 mb-3" />
                    <span className="font-bold text-white block">{MOCK_OPPONENT.name}</span>
                    <span className="text-xs text-red-400 font-mono">{MOCK_OPPONENT.elo} Elo</span>
                  </div>
                </div>
                <motion.div 
                  key={countdown}
                  initial={{ opacity: 0, scale: 2 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                  className="font-display text-6xl font-bold text-white mt-12 drop-shadow-[0_0_20px_rgba(255,255,255,0.5)]"
                >
                  {countdown > 0 ? countdown : 'GO!'}
                </motion.div>
              </>
            )}
          </motion.div>
        )}

        {/* ================= RACING STATE ================= */}
        {matchState === 'RACING' && (
          <motion.div key="racing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col h-[calc(100vh-120px)] w-full max-w-6xl mx-auto">
            
            {/* Top Bar: Scramble */}
            <div className="glass-panel p-4 text-center mb-6">
               <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Official Match Scramble</h3>
               <p className="font-display font-bold text-xl md:text-2xl text-white tracking-wider">
                 {scramble}
               </p>
            </div>

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Player Side (Interactive) */}
              <div className="glass-panel border-primary/30 flex flex-col relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-primary" />
                <div className="p-6 flex justify-between items-center border-b border-white/5">
                  <div className="flex items-center gap-3">
                    <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Cubora" className="w-8 h-8 rounded border border-white/20" />
                    <span className="font-bold text-white">You</span>
                  </div>
                  {timerState === 'STOPPED' && <span className="text-xs bg-emerald-500/20 text-emerald-400 font-bold px-2 py-1 rounded uppercase tracking-wider">Finished</span>}
                </div>
                
                <div className="flex-1 flex flex-col items-center justify-center p-8 relative">
                  {(timerState === 'IDLE' || timerState === 'STOPPED') && (
                    <div className="absolute top-10 flex items-center gap-2 text-gray-400 text-sm font-medium">
                      <span className="px-2 py-1 bg-white/10 rounded-md font-mono text-white text-xs">SPACE</span>
                      <span>Hold to start</span>
                    </div>
                  )}

                  <div 
                    className={clsx(
                      "font-display font-bold tabular-nums tracking-tighter transition-colors duration-200 text-[6rem] md:text-[8rem]",
                      timerState === 'READY_WAIT' && "text-red-500",
                      timerState === 'READY' && "text-emerald-500",
                      timerState === 'RUNNING' && "text-white",
                      timerState === 'STOPPED' && "text-primary",
                      timerState === 'IDLE' && "text-white"
                    )}
                  >
                    {formatTime(playerTime)}
                  </div>
                </div>
              </div>

              {/* Opponent Side (Simulated) */}
              <div className="glass-panel border-red-500/30 flex flex-col relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-red-500" />
                <div className="p-6 flex justify-between items-center border-b border-white/5">
                  <div className="flex items-center gap-3">
                    <img src={MOCK_OPPONENT.avatar} className="w-8 h-8 rounded border border-white/20" />
                    <span className="font-bold text-white">{MOCK_OPPONENT.name}</span>
                  </div>
                  {opponentPhase === 'FINISHED' && <span className="text-xs bg-emerald-500/20 text-emerald-400 font-bold px-2 py-1 rounded uppercase tracking-wider">Finished</span>}
                </div>

                <div className="flex-1 flex flex-col items-center justify-center p-8">
                  {opponentPhase === 'FINISHED' ? (
                    <div className="font-display font-bold tabular-nums tracking-tighter text-[6rem] md:text-[8rem] text-red-500 drop-shadow-[0_0_20px_rgba(239,68,68,0.5)]">
                      {MOCK_OPPONENT.finalTime.toFixed(2)}
                    </div>
                  ) : (
                    <div className="w-full max-w-md">
                      <div className="flex justify-between items-end mb-4">
                        <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">Live Progress</span>
                        <span className="text-xl font-mono font-bold text-red-400 animate-pulse">{opponentPhase}</span>
                      </div>
                      
                      {/* Segmented Progress Bar */}
                      <div className="w-full h-4 bg-white/5 rounded-full overflow-hidden flex gap-1 relative">
                        <div 
                          className="absolute top-0 left-0 h-full bg-red-500 transition-all duration-300 ease-linear shadow-[0_0_15px_rgba(239,68,68,0.8)]"
                          style={{ width: `${opponentProgress}%` }}
                        />
                        {/* Markers for visual segments */}
                        <div className="w-[20%] h-full border-r border-background/50 relative z-10" />
                        <div className="w-[30%] h-full border-r border-background/50 relative z-10" />
                        <div className="w-[35%] h-full border-r border-background/50 relative z-10" />
                        <div className="w-[15%] h-full relative z-10" />
                      </div>
                    </div>
                  )}
                </div>
              </div>

            </div>
          </motion.div>
        )}

        {/* ================= RESULTS STATE ================= */}
        {matchState === 'RESULTS' && (
          <motion.div key="results" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center min-h-[600px] w-full max-w-3xl mx-auto">
            
            {/* Victory/Defeat Banner */}
            <div className="text-center mb-12 relative">
              <div className={clsx(
                "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] blur-[100px] rounded-full pointer-events-none",
                playerWon ? "bg-emerald-500/30" : "bg-red-500/30"
              )} />
              
              <div className="relative z-10 flex flex-col items-center">
                {playerWon ? <Crown className="w-16 h-16 text-yellow-500 mb-4" /> : <AlertTriangle className="w-16 h-16 text-red-500 mb-4" />}
                <h1 className="font-display text-5xl md:text-7xl font-bold text-white tracking-tight">
                  {playerWon ? 'VICTORY' : 'DEFEAT'}
                </h1>
                <p className={clsx("text-xl font-mono mt-4 font-bold flex items-center gap-2", playerWon ? "text-emerald-400" : "text-red-400")}>
                  {playerWon ? '+14 Rating' : '-11 Rating'} <ArrowUp className={clsx("w-5 h-5", !playerWon && "rotate-180")} />
                </p>
              </div>
            </div>

            {/* Time Comparison Card */}
            <div className="w-full glass-panel p-2 flex flex-col gap-2">
              <div className={clsx(
                "flex items-center justify-between p-4 rounded-xl border transition-colors",
                playerWon ? "bg-primary/10 border-primary/30" : "bg-white/5 border-transparent"
              )}>
                <div className="flex items-center gap-4">
                  <span className="font-bold text-gray-500 font-mono w-4">1.</span>
                  <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Cubora" className="w-10 h-10 rounded bg-surface" />
                  <span className="font-bold text-white text-lg">You</span>
                </div>
                <span className={clsx("font-display font-bold text-2xl", playerWon ? "text-primary" : "text-white")}>
                  {formatTime(playerTime)}
                </span>
              </div>

              <div className={clsx(
                "flex items-center justify-between p-4 rounded-xl border transition-colors",
                !playerWon ? "bg-red-500/10 border-red-500/30" : "bg-white/5 border-transparent"
              )}>
                <div className="flex items-center gap-4">
                  <span className="font-bold text-gray-500 font-mono w-4">2.</span>
                  <img src={MOCK_OPPONENT.avatar} loading="lazy" className="w-10 h-10 rounded bg-surface" />
                  <span className="font-bold text-white text-lg">{MOCK_OPPONENT.name}</span>
                </div>
                <span className={clsx("font-display font-bold text-2xl", !playerWon ? "text-red-500" : "text-white")}>
                  {MOCK_OPPONENT.finalTime.toFixed(2)}s
                </span>
              </div>
            </div>

            <div className="flex gap-4 mt-12">
              <Button variant="secondary" onClick={leaveMatch}>Return to Lobby</Button>
              <Button variant="glow" onClick={startMatchmaking}>Play Again</Button>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </PageTransition>
  );
}