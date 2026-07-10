import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
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
    finalTime: 13.42,
};

export default function MultiplayerHub() {
    const { user } = useAuth();
    const [matchState, setMatchState] = useState<MatchState>('LOBBY');
    const [scramble, setScramble] = useState('');
    const [countdown, setCountdown] = useState(3);

    // Real-time opponent simulation state
    const [opponentProgress, setOpponentProgress] = useState(0);
    const [opponentPhase, setOpponentPhase] = useState('Cross');

    // Utilize our high-precision timer (No WCA inspection for fast-paced 1v1)
    const { state: timerState, time: playerTime, resetTimer, triggerPressStart, triggerPressEnd } = useTimer(false);

    const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
        if ((e.target as HTMLElement).closest('button')) {
            return;
        }
        if (e.button !== 0) return;

        // Disable mouse clicks on the timer card for desktop views
        if (e.pointerType === 'mouse') return;

        e.preventDefault();
        e.currentTarget.setPointerCapture(e.pointerId);
        triggerPressStart();
    };

    const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
        if ((e.target as HTMLElement).closest('button')) {
            return;
        }
        if (e.button !== 0) return;

        // Disable mouse clicks on the timer card for desktop views
        if (e.pointerType === 'mouse') return;

        e.preventDefault();
        try {
            e.currentTarget.releasePointerCapture(e.pointerId);
        } catch (err) {
            // Ignore capture release
        }
        triggerPressEnd();
    };

    // --- STATE MACHINE HANDLERS ---
    const startMatchmaking = () => {
        setMatchState('SEARCHING');

        setTimeout(() => {
            setMatchState('FOUND');
            setScramble(generateScramble(21));

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
                    const next = prev + (100 / (MOCK_OPPONENT.finalTime * 10));

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

    useEffect(() => {
        if (matchState === 'RACING' && timerState === 'STOPPED') {
            setTimeout(() => setMatchState('RESULTS'), 1000);
        }
    }, [timerState, matchState]);

    const playerWon = (playerTime / 1000) < MOCK_OPPONENT.finalTime;

    return (
        <PageTransition className="multiplayer-hub-root w-full flex-1 min-h-0 flex flex-col gap-4 sm:gap-6 pb-4 sm:pb-6 px-1 sm:px-0 text-left">

            <AnimatePresence mode="wait">

                {/* ================= LOBBY STATE ================= */}
                {matchState === 'LOBBY' && (
                    <motion.div key="lobby" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col gap-5 sm:gap-6 w-full max-w-5xl mx-auto">

                        {/* Esports Header */}
                        <div className="glass-panel p-5 sm:p-8 relative overflow-hidden border-primary/30 w-full">
                            <div className="absolute top-0 right-0 w-[280px] h-[280px] sm:w-[500px] sm:h-[500px] bg-primary/10 sm:bg-primary/20 blur-[60px] sm:blur-[100px] rounded-full pointer-events-none z-0" />
                            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 w-full">
                                <div>
                                    <div className="flex items-center gap-2 mb-1.5">
                                        <Globe className="w-4 h-4 text-primary animate-pulse shrink-0" />
                                        <span className="text-[10px] font-bold text-primary tracking-widest uppercase">Global Servers Online</span>
                                    </div>
                                    <h1 className="font-display text-2xl sm:text-4xl md:text-5xl font-bold text-slate-900 dark:text-white tracking-tight">Competitive Hub</h1>
                                </div>

                                {/* Player Rank Display */}
                                <div className="bg-white/30 dark:bg-white/[0.03] backdrop-blur-xl border border-slate-200 dark:border-white/5 p-4 rounded-2xl flex items-center gap-4 w-full md:w-auto min-w-0 sm:min-w-[250px]">
                                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-secondary to-primary flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.3)] shrink-0">
                                        <Shield className="w-5 h-5 text-white" />
                                    </div>
                                    <div className="min-w-0">
                                        <span className="text-[10px] text-slate-500 dark:text-gray-400 font-bold uppercase tracking-wider block mb-0.5">Current Rating</span>
                                        <div className="font-display font-bold text-xl sm:text-2xl text-slate-900 dark:text-white flex items-center gap-2">
                                            {PLAYER_ELO} <span className="text-xs font-mono text-emerald-500 font-bold">+12</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Game Modes */}
                        <div className="-mx-4 sm:-mx-6 md:mx-0 relative z-10 -my-4 md:my-0">
                            <div className="flex md:grid overflow-x-auto md:overflow-visible snap-x snap-mandatory md:snap-none gap-4 sm:gap-6 w-full md:grid-cols-3 px-4 sm:px-6 py-4 md:p-0 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">

                                {/* Ranked 1v1 */}
                                <div
                                    className="glass-panel glass-scroll-safe p-5 sm:p-6 flex flex-col group hover:border-primary/50 transition-colors cursor-pointer relative overflow-hidden min-h-[180px] w-[85vw] md:w-auto shrink-0 snap-center md:snap-align-none"
                                    onClick={startMatchmaking}
                                >
                                    <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                                    <Swords className="w-8 h-8 sm:w-10 sm:h-10 text-primary mb-3.5 relative z-10" />
                                    <h3 className="font-display font-bold text-xl sm:text-2xl text-slate-900 dark:text-white mb-1.5 relative z-10">Ranked 1v1</h3>
                                    <p className="text-xs sm:text-sm text-slate-500 dark:text-gray-400 mb-5 relative z-10 leading-relaxed">Match against opponents of similar skill. Affects global Elo rating.</p>
                                    <div className="mt-auto flex items-center justify-between gap-4 relative z-10 w-full">
                                        <span className="text-[10px] font-bold text-primary bg-primary/10 px-2.5 py-0.5 rounded-full tracking-wide">1,204 Online</span>
                                        <Button variant="glow" size="sm" className="h-8 text-xs font-bold uppercase tracking-wider px-3">Find Match</Button>
                                    </div>
                                </div>

                                {/* Free For All */}
                                <div className="glass-panel glass-scroll-safe p-5 sm:p-6 flex flex-col opacity-40 grayscale cursor-not-allowed min-h-[180px] w-[85vw] md:w-auto shrink-0 snap-center md:snap-align-none">
                                    <Users className="w-8 h-8 sm:w-10 sm:h-10 text-tertiary mb-3.5" />
                                    <h3 className="font-display font-bold text-xl sm:text-2xl text-slate-900 dark:text-white mb-1.5">Free For All</h3>
                                    <p className="text-xs sm:text-sm text-slate-500 dark:text-gray-400 mb-5 leading-relaxed">8-player lobby race. First to finish takes the crown. Unranked.</p>
                                    <div className="mt-auto">
                                        <span className="text-[10px] font-bold text-slate-500 dark:text-gray-500 bg-slate-100 dark:bg-white/5 px-2.5 py-0.5 rounded-full uppercase tracking-wide">Coming Soon</span>
                                    </div>
                                </div>

                                {/* Private Room */}
                                <div className="glass-panel glass-scroll-safe p-5 sm:p-6 flex flex-col opacity-40 grayscale cursor-not-allowed min-h-[180px] w-[85vw] md:w-auto shrink-0 snap-center md:snap-align-none">
                                    <Crosshair className="w-8 h-8 sm:w-10 sm:h-10 text-secondary mb-3.5" />
                                    <h3 className="font-display font-bold text-xl sm:text-2xl text-slate-900 dark:text-white mb-1.5">Private Room</h3>
                                    <p className="text-xs sm:text-sm text-slate-500 dark:text-gray-400 mb-5 leading-relaxed">Invite friends via link. Custom scrambles and custom rulesets.</p>
                                    <div className="mt-auto">
                                        <span className="text-[10px] font-bold text-slate-500 dark:text-gray-500 bg-slate-100 dark:bg-white/5 px-2.5 py-0.5 rounded-full uppercase tracking-wide">Coming Soon</span>
                                    </div>
                                </div>

                            </div>
                        </div>
                    </motion.div>
                )}

                {/* ================= SEARCHING / FOUND STATE ================= */}
                {(matchState === 'SEARCHING' || matchState === 'FOUND') && (
                    <motion.div key="searching" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="flex-1 flex flex-col items-center justify-center min-h-0 w-full text-center p-4">
                        <div className="relative w-36 h-36 sm:w-48 sm:h-48 flex items-center justify-center mb-6 sm:mb-8 shrink-0">
                            <div className="absolute inset-0 border-2 border-primary/20 rounded-full animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite]" />
                            <div className="absolute inset-4 border-2 border-primary/40 rounded-full animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite_0.5s]" />

                            {matchState === 'SEARCHING' ? (
                                <Globe className="w-12 h-12 sm:w-16 sm:h-16 text-primary relative z-10 animate-spin" style={{ animationDuration: '10s' }} />
                            ) : (
                                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }} className="w-24 h-24 sm:w-32 sm:h-32 bg-red-500/20 rounded-full flex items-center justify-center border border-red-500/50 shadow-[0_0_50px_rgba(239,68,68,0.3)]">
                                    <Swords className="w-10 h-10 sm:w-12 sm:h-12 text-red-500 animate-pulse" />
                                </motion.div>
                            )}
                        </div>

                        {matchState === 'SEARCHING' ? (
                            <div className="flex flex-col items-center w-full">
                                <h2 className="font-display text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-1.5">Searching for Opponent...</h2>
                                <p className="text-slate-500 dark:text-gray-400 font-mono text-xs sm:text-sm mb-6 sm:mb-8">Estimated Wait: 0:04</p>
                                <Button variant="secondary" className="h-10 min-h-[40px] text-xs font-bold uppercase tracking-wider px-4" onClick={leaveMatch}>Cancel Matchmaking</Button>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center w-full">
                                <h2 className="font-display text-2xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-2">Match Found!</h2>

                                <div className="flex items-center justify-center gap-4 sm:gap-8 mt-6 sm:mt-8 max-w-full px-2">
                                    <div className="text-center min-w-0">
                                        <img
                                            src={user?.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=Cubora"}
                                            alt="You"
                                            loading="lazy"
                                            className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-primary/20 border-2 border-primary mb-2.5 object-cover shrink-0 mx-auto shadow-sm"
                                        />
                                        <span className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm block truncate max-w-[100px]">You</span>
                                        <span className="text-[10px] text-primary font-mono font-bold block mt-0.5">{PLAYER_ELO} ELO</span>
                                    </div>

                                    <span className="font-display text-2xl sm:text-4xl font-bold text-slate-400 dark:text-gray-500 italic shrink-0 select-none">VS</span>

                                    <div className="text-center min-w-0">
                                        <img src={MOCK_OPPONENT.avatar} alt="Opponent" loading="lazy" className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-red-500/20 border-2 border-red-500 mb-2.5 shrink-0 mx-auto shadow-sm" />
                                        <span className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm block truncate max-w-[100px]">{MOCK_OPPONENT.name}</span>
                                        <span className="text-[10px] text-red-400 font-mono font-bold block mt-0.5">{MOCK_OPPONENT.elo} ELO</span>
                                    </div>
                                </div>

                                <motion.div
                                    key={countdown}
                                    initial={{ opacity: 0, scale: 1.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                                    className="font-display text-4xl sm:text-6xl font-bold text-slate-900 dark:text-white mt-10 sm:mt-12 drop-shadow-[0_0_20px_rgba(255,255,255,0.3)] leading-none"
                                >
                                    {countdown > 0 ? countdown : 'GO!'}
                                </motion.div>
                            </div>
                        )}
                    </motion.div>
                )}

                {/* ================= RACING STATE ================= */}
                {matchState === 'RACING' && (
                    <motion.div key="racing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col w-full max-w-6xl mx-auto">

                        {/* Top Bar: Official Scramble */}
                        <div className="glass-panel p-3.5 sm:p-4 text-center mb-4 w-full overflow-hidden shrink-0">
                            <h3 className="text-[10px] sm:text-xs font-bold text-slate-500 dark:text-gray-500 uppercase tracking-widest mb-1.5">Official Match Scramble</h3>
                            <p className="font-display font-bold text-lg sm:text-xl md:text-2xl text-slate-900 dark:text-white tracking-wider break-words select-all px-1">
                                {scramble}
                            </p>
                        </div>

                        {/* Stacks cleanly into 1 column on mobile, drops into 2 columns side-by-side on desktop */}
                        <div className="flex-1 min-h-0 flex flex-col lg:grid lg:grid-cols-2 gap-4 sm:gap-6 w-full">

                            {/* Player Grid Column (Interactive) */}
                            <div
                                onPointerDown={handlePointerDown}
                                onPointerUp={handlePointerUp}
                                className="glass-panel border-primary/30 flex flex-col relative overflow-hidden bg-white/40 dark:bg-white/[0.01] touch-none select-none flex-1 lg:min-h-0 min-h-[220px] w-full"
                            >
                                <div className="absolute top-0 left-0 w-full h-1 bg-primary" />
                                <div className="p-4 sm:p-5 flex justify-between items-center border-b border-slate-200 dark:border-white/5 w-full">
                                    <div className="flex items-center gap-2.5 min-w-0">
                                        <img
                                            src={user?.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=Cubora"}
                                            className="w-7 h-7 rounded border border-slate-200 dark:border-white/20 object-cover shrink-0 shadow-sm"
                                        />
                                        <span className="font-bold text-slate-900 dark:text-white text-sm truncate">You</span>
                                    </div>
                                    {timerState === 'STOPPED' && <span className="text-[9px] bg-emerald-500/20 text-emerald-500 dark:text-emerald-400 font-bold px-2 py-0.5 rounded uppercase tracking-wider shrink-0">Finished</span>}
                                </div>

                                <div className="flex-1 flex flex-col items-center justify-center p-6 relative w-full">
                                    {(timerState === 'PRE_INSPECTION' || timerState === 'STOPPED') && (
                                        <div className="absolute top-6 flex items-center gap-2 text-slate-500 dark:text-gray-400 text-xs font-semibold">
                                            <span className="px-2 py-0.5 bg-slate-100 dark:bg-white/10 rounded font-mono text-slate-700 dark:text-white text-[10px] border border-slate-200 dark:border-white/5 uppercase tracking-wide">TOUCH CONTAINER</span>
                                            <span>Hold to start</span>
                                        </div>
                                    )}

                                    <div
                                        className={clsx(
                                            "font-display font-bold tabular-nums tracking-tighter transition-colors duration-200 leading-none text-[4.5rem] xs:text-[5.5rem] md:text-[8rem]",
                                            timerState === 'READY_WAIT' && "text-red-500",
                                            timerState === 'READY' && "text-emerald-500",
                                            timerState === 'RUNNING' && "text-slate-900 dark:text-white",
                                            timerState === 'STOPPED' && "text-primary",
                                            timerState === 'PRE_INSPECTION' && "text-slate-900 dark:text-white"
                                        )}
                                    >
                                        {formatTime(playerTime)}
                                    </div>
                                </div>
                            </div>

                            {/* Opponent Grid Column (Simulated Layout Area) */}
                            <div className="glass-panel border-red-500/30 flex flex-col relative overflow-hidden bg-white/40 dark:bg-white/[0.01] flex-1 lg:min-h-0 min-h-[140px] w-full">
                                <div className="absolute top-0 left-0 w-full h-1 bg-red-500" />
                                <div className="p-4 sm:p-5 flex justify-between items-center border-b border-slate-200 dark:border-white/5 w-full">
                                    <div className="flex items-center gap-2.5 min-w-0">
                                        <img src={MOCK_OPPONENT.avatar} className="w-7 h-7 rounded border border-slate-200 dark:border-white/20 shrink-0 shadow-sm" />
                                        <span className="font-bold text-slate-900 dark:text-white text-sm truncate">{MOCK_OPPONENT.name}</span>
                                    </div>
                                    {opponentPhase === 'FINISHED' && <span className="text-[9px] bg-emerald-500/20 text-emerald-500 dark:text-emerald-400 font-bold px-2 py-0.5 rounded uppercase tracking-wider shrink-0">Finished</span>}
                                </div>

                                <div className="flex-1 flex flex-col items-center justify-center p-6 w-full">
                                    {opponentPhase === 'FINISHED' ? (
                                        <div className="font-display font-bold tabular-nums tracking-tighter leading-none text-[4.5rem] sm:text-[6rem] md:text-[8rem] text-red-500 drop-shadow-[0_0_20px_rgba(239,68,68,0.3)]">
                                            {MOCK_OPPONENT.finalTime.toFixed(2)}
                                        </div>
                                    ) : (
                                        <div className="w-full max-w-sm px-2">
                                            <div className="flex justify-between items-end mb-3 w-full">
                                                <span className="text-[10px] sm:text-xs font-bold text-slate-500 dark:text-gray-400 uppercase tracking-widest">Live Progress</span>
                                                <span className="text-sm sm:text-base font-mono font-bold text-red-500 dark:text-red-400 animate-pulse">{opponentPhase}</span>
                                            </div>

                                            {/* Segmented Progress bar slider tracks */}
                                            <div className="w-full h-3.5 bg-slate-200/50 dark:bg-white/5 rounded-full overflow-hidden flex gap-0.5 relative border border-slate-200 dark:border-white/5">
                                                <div
                                                    className="absolute top-0 left-0 h-full bg-red-500 transition-all duration-300 ease-linear shadow-[0_0_15px_rgba(239,68,68,0.6)]"
                                                    style={{ width: `${opponentProgress}%` }}
                                                />
                                                <div className="w-[20%] h-full border-r border-background/20 relative z-10 pointer-events-none" />
                                                <div className="w-[30%] h-full border-r border-background/20 relative z-10 pointer-events-none" />
                                                <div className="w-[35%] h-full border-r border-background/20 relative z-10 pointer-events-none" />
                                                <div className="w-[15%] h-full relative z-10 pointer-events-none" />
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
                    <motion.div key="results" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="flex-1 flex flex-col items-center justify-center min-h-0 w-full max-w-3xl mx-auto p-2">

                        {/* Victory/Defeat Banner Context */}
                        <div className="text-center mb-8 sm:mb-10 relative w-full max-w-md">
                            <div className={clsx(
                                "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[220px] h-[220px] sm:w-[300px] sm:h-[300px] blur-[80px] sm:blur-[100px] rounded-full pointer-events-none z-0",
                                playerWon ? "bg-emerald-500/20" : "bg-red-500/20"
                            )} />

                            <div className="relative z-10 flex flex-col items-center">
                                {playerWon ? <Crown className="w-12 h-12 sm:w-16 sm:h-16 text-yellow-500 mb-3 animate-bounce" /> : <AlertTriangle className="w-12 h-12 sm:w-16 sm:h-16 text-red-500 mb-3 animate-pulse" />}
                                <h1 className="font-display text-4xl sm:text-6xl md:text-7xl font-bold text-slate-900 dark:text-white tracking-tight leading-none">
                                    {playerWon ? 'VICTORY' : 'DEFEAT'}
                                </h1>
                                <p className={clsx("text-base sm:text-xl font-mono mt-3.5 sm:mt-4 font-bold flex items-center gap-1.5 leading-none", playerWon ? "text-emerald-500 dark:text-emerald-400 animate-pulse" : "text-red-500 dark:text-red-400")}>
                                    {playerWon ? '+14 Rating' : '-11 Rating'} <ArrowUp className={clsx("w-4 h-4 sm:w-5 h-5", !playerWon && "rotate-180")} />
                                </p>
                            </div>
                        </div>

                        {/* Time Comparison Ranking Rows Wrapper Card */}
                        <div className="w-full glass-panel p-2 flex flex-col gap-2 border-slate-200 dark:border-white/5 shadow-xl">
                            <div className={clsx(
                                "flex items-center justify-between p-3.5 sm:p-4 rounded-xl border transition-colors w-full gap-4",
                                playerWon ? "bg-primary/10 border-primary/30" : "bg-white/40 dark:bg-white/5 border border-slate-200 dark:border-transparent"
                            )}>
                                <div className="flex items-center gap-3 min-w-0">
                                    <span className="font-bold text-slate-400 dark:text-gray-500 font-mono text-xs sm:text-sm shrink-0 w-4">1.</span>
                                    <img
                                        src={user?.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=Cubora"}
                                        className="w-9 h-9 sm:w-10 sm:h-10 rounded bg-slate-100 dark:bg-surface object-cover shrink-0 shadow-sm"
                                    />
                                    <span className="font-bold text-slate-900 dark:text-white text-sm sm:text-base truncate">You</span>
                                </div>
                                <span className={clsx("font-display font-bold text-xl sm:text-2xl shrink-0 pl-2", playerWon ? "text-primary" : "text-slate-900 dark:text-white")}>
                                    {formatTime(playerTime)}
                                </span>
                            </div>

                            <div className={clsx(
                                "flex items-center justify-between p-3.5 sm:p-4 rounded-xl border transition-colors w-full gap-4",
                                !playerWon ? "bg-red-500/10 border-red-500/30" : "bg-white/40 dark:bg-white/5 border border-slate-200 dark:border-transparent"
                            )}>
                                <div className="flex items-center gap-3 min-w-0">
                                    <span className="font-bold text-slate-400 dark:text-gray-500 font-mono text-xs sm:text-sm shrink-0 w-4">2.</span>
                                    <img src={MOCK_OPPONENT.avatar} loading="lazy" className="w-9 h-9 sm:w-10 sm:h-10 rounded bg-slate-100 dark:bg-surface object-cover shrink-0 shadow-sm" />
                                    <span className="font-bold text-slate-900 dark:text-white text-sm sm:text-base truncate">{MOCK_OPPONENT.name}</span>
                                </div>
                                <span className={clsx("font-display font-bold text-xl sm:text-2xl shrink-0 pl-2", !playerWon ? "text-red-500" : "text-slate-900 dark:text-white")}>
                                    {MOCK_OPPONENT.finalTime.toFixed(2)}s
                                </span>
                            </div>
                        </div>

                        {/* CTA Option Navigation triggers */}
                        <div className="flex flex-col sm:flex-row gap-3 mt-8 sm:mt-10 w-full sm:w-auto px-4 sm:px-0">
                            <Button variant="secondary" className="w-full sm:w-auto h-10 min-h-[40px] text-xs font-bold uppercase tracking-wider justify-center px-5" onClick={leaveMatch}>Return to Lobby</Button>
                            <Button variant="glow" className="w-full sm:w-auto h-10 min-h-[40px] text-xs font-bold uppercase tracking-wider justify-center px-5" onClick={startMatchmaking}>Play Again</Button>
                        </div>
                    </motion.div>
                )}

            </AnimatePresence>
        </PageTransition>
    );
}