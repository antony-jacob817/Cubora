import { useState, useEffect } from 'react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import {
    BrainCircuit, Sparkles, Target, Zap,
    ChevronRight, Activity, Crosshair, Map, PlayCircle
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { PageTransition } from '@/components/animations/PageTransition';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { clsx } from 'clsx';

// --- ANIMATION VARIANTS ---
const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
};

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } }
};

interface SolveData {
    _id: string;
    timeMs: number;
    method: string;
    penalty: string;
    date: string;
}

interface StatsData {
    pb: number | null;
    ao5: number | null;
    ao12: number | null;
    globalAverage: number | null;
    streak: number;
}

export default function AiCoach() {
    const { getAuthHeaders } = useAuth();
    const navigate = useNavigate();
    const [isProcessing, setIsProcessing] = useState(true);
    const [solves, setSolves] = useState<SolveData[]>([]);
    const [stats, setStats] = useState<StatsData | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const headers = getAuthHeaders();
                const [statsRes, solvesRes] = await Promise.all([
                    fetch('http://localhost:5000/api/solves/stats', { headers }),
                    fetch('http://localhost:5000/api/solves', { headers }),
                ]);

                const statsData = await statsRes.json();
                const solvesData = await solvesRes.json();

                if (statsData.success) setStats(statsData.stats);
                if (solvesData.success) setSolves(solvesData.data);
            } catch (err) {
                console.error('Failed to load AI coach data:', err);
            } finally {
                setTimeout(() => setIsProcessing(false), 1200);
            }
        };
        fetchData();
    }, []);

    // --- COMPUTE AI INSIGHTS FROM REAL DATA ---
    const validSolves = solves.filter(s => s.penalty !== 'DNF');
    const timesMs = validSolves.map(s => s.timeMs);
    const totalSolves = solves.length;
    const avgTimeMs = timesMs.length > 0 ? timesMs.reduce((a, b) => a + b, 0) / timesMs.length : 0;
    const avgTimeSec = avgTimeMs / 1000;

    const stdDev = timesMs.length > 1
        ? Math.sqrt(timesMs.reduce((sum, t) => sum + Math.pow(t - avgTimeMs, 2), 0) / timesMs.length) / 1000
        : 0;

    const isConsistent = stdDev < avgTimeSec * 0.15;

    const recent5 = timesMs.slice(0, 5);
    const recent5Avg = recent5.length >= 5 ? recent5.reduce((a, b) => a + b, 0) / recent5.length / 1000 : null;
    const isImproving = recent5Avg !== null && stats?.globalAverage !== null && recent5Avg < (stats?.globalAverage ?? Infinity);

    const estimatedWeakness = avgTimeSec > 0 ? {
        title: avgTimeSec > 30 ? 'Cross Construction Speed' : avgTimeSec > 15 ? 'F2L Lookahead Pauses' : 'OLL Recognition Speed',
        impact: avgTimeSec > 30 ? `-${(avgTimeSec * 0.08).toFixed(1)}s per solve` : avgTimeSec > 15 ? `-${(avgTimeSec * 0.12).toFixed(1)}s per solve` : `-${(avgTimeSec * 0.05).toFixed(1)}s per solve`,
        description: avgTimeSec > 30
            ? 'Your cross phase is taking longer than expected. Focus on planning the entire cross during inspection time and executing with minimal rotations.'
            : avgTimeSec > 15
                ? 'Analytics detect hesitation between F2L pairs. Practice tracking the next pair while inserting the current one. Slow, deliberate practice is more effective than speed.'
                : 'Your OLL recognition can be accelerated by focusing on the "shape" of the top layer rather than individual sticker positions.',
        confidence: Math.min(95, 60 + totalSolves)
    } : null;

    const drills = [
        { id: 'd1', title: avgTimeSec > 30 ? 'Cross Efficiency Trainer' : 'Blind Cross & Tracking', duration: '5 mins', roi: 'High', type: 'Focus', icon: Crosshair },
        { id: 'd2', title: isConsistent ? 'Speed Push Challenge' : 'Slow Turning (Metronome)', duration: '10 mins', roi: 'Medium', type: 'Flow', icon: Activity },
        { id: 'd3', title: avgTimeSec > 20 ? 'F2L Recognition Trainer' : 'OLL Recognition Trainer', duration: '3 mins', roi: totalSolves < 20 ? 'High' : 'Low', type: 'Speed', icon: Zap }
    ];

    const roadmap = [
        { id: 'r1', phase: 'Current', title: avgTimeSec > 30 ? 'Master Layer Foundations' : avgTimeSec > 15 ? 'Master 2-Look OLL' : 'Full OLL Recognition', status: 'active' as const, progress: Math.min(95, Math.max(10, totalSolves * 2)) },
        { id: 'r2', phase: 'Next', title: avgTimeSec > 30 ? 'Transition to Beginner CFOP' : 'Advanced F2L Inserts', status: totalSolves > 50 ? 'active' as const : 'locked' as const, progress: totalSolves > 50 ? 20 : 0 },
        { id: 'r3', phase: 'Future', title: avgTimeSec > 15 ? 'Full PLL Transition' : 'Sub-10 Speed Optimization', status: 'locked' as const, progress: 0 }
    ];

    const hasEnoughData = totalSolves >= 5;

    return (
        <PageTransition className="w-full flex flex-col gap-5 sm:gap-6 pb-12 min-h-screen px-1 sm:px-0 text-left">

            {/* Header Context Controls */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-1">
                <div>
                    <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5 sm:gap-3">
                        <div className="relative w-8 h-8 flex items-center justify-center shrink-0">
                            {isProcessing && <div className="absolute inset-0 border-2 border-t-tertiary border-transparent rounded-full animate-spin" />}
                            <BrainCircuit className={clsx("w-5 h-5 sm:w-6 h-6", isProcessing ? "text-slate-400" : "text-tertiary")} />
                        </div>
                        Neural Coach
                    </h1>
                    <p className="text-slate-500 dark:text-gray-400 text-xs sm:text-sm mt-1 leading-relaxed">
                        {hasEnoughData
                            ? `Personalized directives generated from your ${totalSolves} solves.`
                            : 'Complete more solves to unlock AI coaching insights.'
                        }
                    </p>
                </div>

                {/* Status Indicator Frame */}
                <div className="flex items-center gap-2.5 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 px-3.5 py-2 rounded-2xl self-start md:self-auto min-h-[38px]">
                    <span className="relative flex h-2 w-2">
                        {!isProcessing && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-tertiary opacity-75"></span>}
                        <span className={clsx("relative inline-flex rounded-full h-2 w-2", isProcessing ? "bg-orange-500 animate-pulse" : "bg-tertiary")}></span>
                    </span>
                    <span className="text-[10px] font-mono font-bold tracking-wider text-slate-600 dark:text-gray-300 uppercase">
                        {isProcessing ? 'ANALYZING DATA...' : 'SYSTEM OPTIMAL'}
                    </span>
                </div>
            </div>

            <AnimatePresence mode="wait">
                {isProcessing ? (
                    <motion.div
                        key="processing"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="flex-1 flex flex-col items-center justify-center min-h-[350px] sm:min-h-[400px] glass-panel border-tertiary/20 p-6 w-full text-center"
                    >
                        <div className="w-16 h-16 sm:w-20 sm:h-20 relative flex items-center justify-center mb-5">
                            <div className="absolute inset-0 bg-tertiary/20 rounded-full blur-xl animate-pulse" />
                            <BrainCircuit className="w-10 h-10 text-tertiary relative z-10" />
                        </div>
                        <h2 className="font-display text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-1.5">Analyzing Solve Trajectories</h2>
                        <p className="text-slate-400 dark:text-gray-500 font-mono text-xs">Processing {totalSolves} data points...</p>
                    </motion.div>
                ) : !hasEnoughData ? (
                    <motion.div
                        key="not-enough"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="flex-1 flex flex-col items-center justify-center min-h-[350px] sm:min-h-[400px] glass-panel p-6 w-full text-center"
                    >
                        <BrainCircuit className="w-12 h-12 sm:w-14 sm:h-14 text-slate-400 dark:text-gray-600 mb-5" />
                        <h2 className="font-display text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-2">Insufficient Data</h2>
                        <p className="text-slate-500 dark:text-gray-400 text-xs sm:text-sm max-w-sm mb-6 leading-relaxed">
                            The AI Coach needs at least 5 solves to generate meaningful insights.
                            You currently have {totalSolves} solve{totalSolves !== 1 ? 's' : ''} recorded.
                        </p>
                        <Button variant="glow" className="h-10 min-h-[40px] text-xs font-bold uppercase tracking-wider" onClick={() => navigate('/practice')}>
                            Start Practice Session →
                        </Button>
                    </motion.div>
                ) : (
                    <motion.div
                        key="dashboard"
                        variants={containerVariants} initial="hidden" animate="visible"
                        className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6 w-full"
                    >

                        {/* LEFT COLUMN: Main Directive Target Modules */}
                        <div className="lg:col-span-2 flex flex-col gap-5 sm:gap-6 w-full">

                            {/* Primary Weakness Analysis Card */}
                            {estimatedWeakness && (
                                <motion.div variants={itemVariants} className="glass-panel p-5 sm:p-6 md:p-8 relative overflow-hidden group border-tertiary/30 w-full">
                                    <div className="absolute top-0 right-0 w-[260px] h-[260px] sm:w-[400px] sm:h-[400px] bg-tertiary/10 blur-[60px] sm:blur-[80px] rounded-full pointer-events-none sm:group-hover:bg-tertiary/20 transition-colors duration-700 z-0" />

                                    <div className="relative z-10 w-full text-left">
                                        <div className="flex items-center gap-2 mb-4 sm:mb-5">
                                            <Target className="w-4 h-4 text-tertiary" />
                                            <h3 className="font-display font-bold text-[10px] sm:text-xs tracking-widest uppercase text-tertiary">Priority Target</h3>
                                        </div>

                                        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3.5 mb-4">
                                            <h2 className="font-display text-xl sm:text-3xl font-bold text-slate-900 dark:text-white leading-tight">
                                                {estimatedWeakness.title}
                                            </h2>
                                            <div className="bg-red-500/10 border border-red-500/20 px-3 py-1 rounded-xl flex items-center gap-2 shrink-0 self-start sm:self-auto h-8">
                                                <Activity className="w-3.5 h-3.5 text-red-400" />
                                                <span className="text-red-400 font-bold text-xs sm:text-sm font-mono leading-none">{estimatedWeakness.impact}</span>
                                            </div>
                                        </div>

                                        <p className="text-slate-700 dark:text-gray-300 leading-relaxed text-sm sm:text-base md:text-lg mb-6 max-w-2xl">
                                            {estimatedWeakness.description}
                                        </p>

                                        <div className="flex flex-col sm:flex-row sm:items-center gap-4 w-full">
                                            <Button
                                                variant="glow"
                                                className="w-full sm:w-auto bg-tertiary/20 hover:bg-tertiary/30 border-tertiary/50 text-slate-900 dark:text-white shadow-[0_0_20px_rgba(6,182,212,0.2)] h-10 min-h-[40px] text-xs font-bold uppercase tracking-wider justify-center"
                                                onClick={() => navigate('/practice')}
                                            >
                                                Initialize Targeted Drill
                                            </Button>
                                            <span className="text-[11px] font-mono text-slate-400 dark:text-gray-500">{estimatedWeakness.confidence}% AI Confidence</span>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* Generated Practice Drills Grid Block */}
                            <motion.div variants={itemVariants} className="flex flex-col gap-4 w-full">
                                <div className="flex items-center justify-between gap-4 w-full">
                                    <h3 className="font-display font-bold text-lg sm:text-xl text-slate-900 dark:text-white">Generated Session</h3>
                                    <Button variant="secondary" size="sm" className="h-9 min-h-[44px] sm:min-h-[36px] text-xs font-bold gap-1.5 px-3">
                                        <Zap className="w-3.5 h-3.5" /> Regenerate
                                    </Button>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
                                    {drills.map((drill, idx) => (
                                        <div
                                            key={drill.id}
                                            className="glass-panel p-4 sm:p-5 flex flex-col group hover:border-primary/40 transition-colors cursor-pointer bg-white/40 dark:bg-white/5 min-h-[160px] text-left"
                                            onClick={() => navigate('/practice')}
                                        >
                                            <div className="flex justify-between items-start mb-3.5 w-full">
                                                <div className={clsx(
                                                    "w-9 h-9 rounded-xl flex items-center justify-center transition-colors shrink-0",
                                                    idx === 0 ? "bg-tertiary/20 text-tertiary" : "bg-slate-200/50 dark:bg-white/5 text-slate-400 dark:text-gray-400 sm:group-hover:text-slate-900 sm:dark:group-hover:text-white"
                                                )}>
                                                    <drill.icon className="w-4 h-4 sm:w-5 h-5" />
                                                </div>
                                                <span className="text-[10px] font-mono font-bold text-slate-400 dark:text-gray-500">{drill.duration}</span>
                                            </div>

                                            <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-0.5 sm:group-hover:text-primary transition-colors line-clamp-1">{drill.title}</h4>
                                            <p className="text-[11px] text-slate-500 dark:text-gray-400 mb-5">{drill.type} Training</p>

                                            <div className="mt-auto flex items-center justify-between w-full pt-1">
                                                <span className={clsx(
                                                    "text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md",
                                                    drill.roi === 'High' ? "bg-emerald-500/10 text-emerald-500" : "bg-slate-200/40 dark:bg-white/5 text-slate-500 dark:text-gray-400"
                                                )}>
                                                    {drill.roi} ROI
                                                </span>
                                                <PlayCircle className="w-4 h-4 sm:w-5 h-5 text-slate-400 dark:text-gray-500 sm:group-hover:text-primary transition-colors" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>

                            {/* Trend Insights Momentum Banner */}
                            {isImproving && (
                                <motion.div variants={itemVariants} className="glass-panel p-4 sm:p-5 border-emerald-500/20 bg-emerald-500/5 dark:bg-emerald-500/[0.02] w-full text-left">
                                    <div className="flex items-start gap-3 w-full">
                                        <Sparkles className="w-5 h-5 text-emerald-500 dark:text-emerald-400 animate-pulse shrink-0 mt-0.5" />
                                        <div className="min-w-0">
                                            <h4 className="font-bold text-slate-900 dark:text-white text-sm">Positive Momentum Detected</h4>
                                            <p className="text-xs sm:text-sm text-slate-700 dark:text-gray-400 mt-1 leading-relaxed">
                                                Your recent 5 solves average {recent5Avg?.toFixed(2)}s — that's {((stats?.globalAverage ?? 0) - (recent5Avg ?? 0)).toFixed(2)}s faster than your global average. Keep pushing!
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </div>

                        {/* RIGHT COLUMN: Learning Curve Roadmap */}
                        <motion.div variants={itemVariants} className="glass-panel p-5 sm:p-6 flex flex-col w-full text-left">
                            <div className="flex items-center gap-2 mb-6 sm:mb-8 w-full">
                                <Map className="w-4 h-4 sm:w-5 h-5 text-secondary" />
                                <h3 className="font-display font-bold text-lg sm:text-xl text-slate-900 dark:text-white">Evolution Path</h3>
                            </div>

                            <div className="flex-1 relative w-full">
                                {/* Vertical Center Connector Line */}
                                <div className="absolute left-[17px] top-5 bottom-5 w-0.5 bg-slate-200 dark:bg-white/5" />

                                <div className="space-y-6 sm:space-y-7 relative w-full">
                                    {roadmap.map((step, idx) => {
                                        const isActive = step.status === 'active';

                                        return (
                                            <div key={step.id} className={clsx(
                                                "flex gap-3.5 sm:gap-4 relative w-full text-left",
                                                step.status === 'locked' && "opacity-50 grayscale"
                                            )}>
                                                <div className="relative mt-0.5 shrink-0">
                                                    <div className={clsx(
                                                        "w-9 h-9 rounded-xl flex items-center justify-center relative z-10 transition-colors",
                                                        isActive ? "bg-secondary/20 border-2 border-secondary" : "bg-slate-200/50 dark:bg-white/5 border border-slate-200 dark:border-white/10"
                                                    )}>
                                                        {isActive ? (
                                                            <Sparkles className="w-4 h-4 text-secondary animate-pulse" />
                                                        ) : (
                                                            <span className="text-[11px] font-mono font-bold text-slate-500 dark:text-gray-500">{idx + 1}</span>
                                                        )}
                                                    </div>
                                                    {isActive && (
                                                        <div className="absolute inset-0 bg-secondary/20 blur-sm rounded-full" />
                                                    )}
                                                </div>

                                                <div className="flex-1 pt-0.5 min-w-0">
                                                    <span className={clsx(
                                                        "text-[9px] font-bold uppercase tracking-widest mb-0.5 block",
                                                        isActive ? "text-secondary font-extrabold" : "text-slate-400 dark:text-gray-500"
                                                    )}>
                                                        {step.phase} Focus
                                                    </span>
                                                    <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-1.5 leading-snug truncate">{step.title}</h4>

                                                    {isActive ? (
                                                        <div className="w-full h-1.5 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden mt-2.5 max-w-[200px]">
                                                            <div className="h-full bg-secondary transition-all" style={{ width: `${step.progress}%` }} />
                                                        </div>
                                                    ) : (
                                                        <button className="text-[11px] font-semibold text-slate-500 sm:hover:text-slate-950 dark:text-gray-500 sm:dark:hover:text-white transition-colors flex items-center gap-0.5 mt-0.5 min-h-[44px] sm:min-h-[28px]">
                                                            View Curriculum <ChevronRight className="w-3 h-3" />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <Button variant="secondary" className="w-full mt-6 bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.02] border-slate-200 dark:border-white/10 text-slate-900 dark:text-white h-10 min-h-[40px] text-xs font-bold uppercase tracking-wider justify-center" onClick={() => navigate('/learn')}>
                                Full Curriculum Tree
                            </Button>
                        </motion.div>

                    </motion.div>
                )}
            </AnimatePresence>
        </PageTransition>
    );
}