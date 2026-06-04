import { useState, useEffect, useRef, Fragment, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Flame, Timer, BrainCircuit, Target, ChevronDown,
    ChevronRight, Activity, ScanLine, History, CheckCircle2, CalendarDays
} from 'lucide-react';
import {
    AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { formatTime } from '@/utils/cubing';
import { useNavigate } from 'react-router-dom';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { getSlideUpVariants, getStaggerContainer } from '@/animations/variants';
import { PageTransition } from '@/components/animations/PageTransition';
import { clsx } from 'clsx';

const Skeleton = ({ className }: { className: string }) => (
    <div className={`animate-pulse bg-slate-200 dark:bg-white/5 rounded-2xl ${className}`} />
);

const MINI_COLOR_MAP: Record<string, string> = {
    'W': 'bg-[#F8FAFC]', 'Y': 'bg-yellow-400', 'G': 'bg-green-500',
    'B': 'bg-blue-500', 'R': 'bg-red-500', 'O': 'bg-orange-500', 'UNKNOWN': 'bg-transparent'
};

// --- PROCEDURAL 365-DAY CHALLENGE MATRIX ---
const getDailyChallenge = (date: Date) => {
    const start = new Date(date.getFullYear(), 0, 0);
    const diff = date.getTime() - start.getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);

    const volumes = [5, 8, 10, 12, 15, 20];
    const targetCutoffs = [15000, 18000, 20000, 22000, 25000, 30000];
    const speedcubingMethods = ['CFOP', 'Roux', 'ZZ', 'Beginner', 'Any Method'];

    const targetCount = volumes[dayOfYear % volumes.length];
    const timeLimitMs = targetCutoffs[(dayOfYear + 2) % targetCutoffs.length];
    const requiredMethod = speedcubingMethods[(dayOfYear + 4) % speedcubingMethods.length];

    const modeSeed = dayOfYear % 4;

    switch (modeSeed) {
        case 0:
            return {
                title: `${targetCount} Solves Sub-${timeLimitMs / 1000}s`,
                description: `Maintain high execution speeds today. Log ${targetCount} validated solves below ${timeLimitMs / 1000} seconds.`,
                evaluate: (solvesToday: any[]) => {
                    const matched = solvesToday.filter(s => {
                        const calculatedTime = s.timeMs + (s.penalty === '+2' ? 2000 : 0);
                        return s.penalty !== 'DNF' && calculatedTime < timeLimitMs;
                    }).length;
                    return { progress: Math.min(matched, targetCount), target: targetCount };
                }
            };
        case 1:
            return {
                title: `${requiredMethod} Sprint: ${targetCount} Solves`,
                description: `Focus heavily on framework mechanics. Complete ${targetCount} solves specifically using the ${requiredMethod} tracking option.`,
                evaluate: (solvesToday: any[]) => {
                    const matched = solvesToday.filter(s => requiredMethod === 'Any Method' || s.method === requiredMethod).length;
                    return { progress: Math.min(matched, targetCount), target: targetCount };
                }
            };
        case 2:
            return {
                title: `Streak Sprint: ${targetCount} Clean Runs`,
                description: `Avoid turning mistakes or inspection timeouts. Land a consecutive streak of ${targetCount} solves with no DNF values today.`,
                evaluate: (solvesToday: any[]) => {
                    let maxStreak = 0;
                    let currentStreak = 0;
                    const chronologicallySorted = [...solvesToday].reverse();
                    for (const s of chronologicallySorted) {
                        if (s.penalty !== 'DNF') {
                            currentStreak++;
                            if (currentStreak > maxStreak) maxStreak = currentStreak;
                        } else {
                            currentStreak = 0;
                        }
                    }
                    return { progress: Math.min(maxStreak, targetCount), target: targetCount };
                }
            };
        case 3:
        default:
            return {
                title: `Volume Lock: ${targetCount} Solves`,
                description: `Build persistent hand muscle memory. Clock in at least ${targetCount} total validated runs before the daily reset timer hits.`,
                evaluate: (solvesToday: any[]) => {
                    return { progress: Math.min(solvesToday.length, targetCount), target: targetCount };
                }
            };
    }
};

export default function Dashboard() {
    const prefersReducedMotion = usePrefersReducedMotion();
    const containerVariants = getStaggerContainer(prefersReducedMotion, 0.08);
    const itemVariants = getSlideUpVariants(prefersReducedMotion, 15);

    const { getAuthHeaders } = useAuth();
    const { isDarkMode } = useTheme();
    const navigate = useNavigate();
    const chartWrapperRef = useRef<HTMLDivElement>(null);
    const mapScrollRef = useRef<HTMLDivElement>(null);
    const [isChartSafe, setIsChartSafe] = useState(false);

    const [timeRange, setTimeRange] = useState('Last 7 Days');
    const [isTimeDropdownOpen, setIsTimeDropdownOpen] = useState(false);
    const timeDropdownRef = useRef<HTMLDivElement>(null);

    // Desktop Drag-to-Scroll State
    const [isDraggingMap, setIsDraggingMap] = useState(false);
    const [startX, setStartX] = useState(0);
    const [scrollLeft, setScrollLeft] = useState(0);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent | TouchEvent) => {
            if (timeDropdownRef.current && !timeDropdownRef.current.contains(event.target as Node)) {
                setIsTimeDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('touchstart', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('touchstart', handleClickOutside);
        };
    }, []);

    const [isLoading, setIsLoading] = useState(true);
    const [stats, setStats] = useState<{
        pb: number | null;
        ao5: number | null;
        ao12: number | null;
        globalAverage: number | null;
        streak: number;
        trends: { date: string; time: number }[];
    } | null>(null);
    const [solves, setSolves] = useState<any[]>([]);
    const [scans, setScans] = useState<any[]>([]);
    const [expandedScanId, setExpandedScanId] = useState<string | null>(null);

    useEffect(() => {
        if (!chartWrapperRef.current) return;
        
        const observer = new ResizeObserver(([entry]) => {
            if (entry.contentRect.width > 0) {
                setIsChartSafe(true);
                observer.disconnect(); 
            }
        });
        
        observer.observe(chartWrapperRef.current);
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const headers = getAuthHeaders();
                const [statsRes, solvesRes, scansRes] = await Promise.all([
                    fetch('http://localhost:5000/api/solves/stats', { headers }),
                    fetch('http://localhost:5000/api/solves?sessionId=all', { headers }),
                    fetch('http://localhost:5000/api/solver/history', { headers })
                ]);
                const statsData = await statsRes.json();
                const solvesData = await solvesRes.json();
                const scansData = await scansRes.json();

                if (statsData.success) setStats(statsData.stats);
                if (solvesData.success) setSolves(solvesData.data);
                if (scansData.success) setScans(scansData.data);
            } catch (err) {
                console.error('Failed to load dashboard data:', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    // --- LIVE SEEDED DAILY CHALLENGE CALCULATOR ---
    const currentChallenge = getDailyChallenge(new Date());
    const solvesToday = solves.filter(s => s.date && new Date(s.date).toDateString() === new Date().toDateString());
    const { progress: challengeProgress, target: challengeTarget } = currentChallenge.evaluate(solvesToday);
    const challengeComplete = challengeProgress >= challengeTarget;

    // --- 365-DAY YEARLY HISTORY DATA MAPPING ---
    const yearHistory = useMemo(() => {
        const history = [];
        const today = new Date();
        
        const solvesByDate = solves.reduce((acc, solve) => {
            if (!solve.date) return acc;
            const dStr = new Date(solve.date).toDateString();
            if (!acc[dStr]) acc[dStr] = [];
            acc[dStr].push(solve);
            return acc;
        }, {});

        // Determine the day of the week exactly 364 days ago
        const oldestDate = new Date(today);
        oldestDate.setDate(today.getDate() - 364);
        const startDayOfWeek = oldestDate.getDay();

        // Pad the start to align columns properly (Row 0 = Sunday)
        for (let i = 0; i < startDayOfWeek; i++) {
            history.push({ empty: true });
        }

        // Evaluate all 365 days using the deterministic subchallenge
        for (let i = 364; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(d.getDate() - i);
            const dStr = d.toDateString();
            const daySolves = solvesByDate[dStr] || [];

            let level = 0; // Stage 1: Full Dim
            
            if (daySolves.length > 0) {
                level = 1; // Stage 2: Half Bright (streak maintained)
                const challenge = getDailyChallenge(d);
                const { progress, target } = challenge.evaluate(daySolves);
                if (progress >= target) {
                    level = 2; // Stage 3: Full Bright (streak & sub challenge finished)
                }
            }
            history.push({ date: d, level, empty: false });
        }
        return history;
    }, [solves]);

    // Ensure the Annual Map defaults to showing the most recent days (scroll right)
    useEffect(() => {
        if (!isLoading && yearHistory.length > 0 && mapScrollRef.current) {
            const timerId = setTimeout(() => {
                if (mapScrollRef.current) {
                    mapScrollRef.current.scrollLeft = mapScrollRef.current.scrollWidth;
                }
            }, 100);
            return () => clearTimeout(timerId);
        }
    }, [yearHistory, isLoading]);

    // Desktop Drag-to-Scroll Handlers
    const handleMapMouseDown = (e: any) => {
        if (!mapScrollRef.current) return;
        setIsDraggingMap(true);
        setStartX(e.pageX - mapScrollRef.current.offsetLeft);
        setScrollLeft(mapScrollRef.current.scrollLeft);
    };

    const handleMapMouseLeave = () => {
        setIsDraggingMap(false);
    };

    const handleMapMouseUp = () => {
        setIsDraggingMap(false);
    };

    const handleMapMouseMove = (e: any) => {
        if (!isDraggingMap || !mapScrollRef.current) return;
        e.preventDefault(); // Prevent text/box selection while dragging
        const x = e.pageX - mapScrollRef.current.offsetLeft;
        const walk = (x - startX) * 1.5; // Drag speed multiplier
        mapScrollRef.current.scrollLeft = scrollLeft - walk;
    };

    if (isLoading) {
        return (
            <div className="w-full flex flex-col gap-5 sm:gap-6 px-1 sm:px-0">
                <Skeleton className="h-9 w-40 mb-2" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                    {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32" />)}
                </div>
                <Skeleton className="h-80 sm:h-96 w-full" />
            </div>
        );
    }

    return (
        <PageTransition>
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="w-full flex flex-col gap-5 sm:gap-6 pb-12 px-1 sm:px-0 text-left"
            >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-1">
                    <div>
                        <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Overview</h1>
                        <p className="text-slate-500 dark:text-gray-400 text-xs sm:text-sm mt-0.5">Session active. AI tracking enabled.</p>
                    </div>
                    <Button variant="glow" size="sm" className="w-full sm:w-auto gap-2 h-10 min-h-[40px] text-xs font-bold uppercase tracking-wider justify-center" onClick={() => navigate('/practice')}>
                        <Activity className="w-4 h-4 animate-pulse" /> Live Session
                    </Button>
                </div>

                {/* --- HORIZONTAL METRICS ROW --- */}
                <div className="flex md:grid overflow-x-auto md:overflow-visible snap-x snap-mandatory md:snap-none gap-3 sm:gap-6 w-full md:grid-cols-2 lg:grid-cols-4 md:pb-0 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                    <motion.div variants={itemVariants} className="glass-panel-interactive glass-scroll-safe p-3.5 sm:p-6 flex flex-col justify-between group hover:border-orange-500/40 min-h-[75px] sm:min-h-[140px] w-[80vw] md:w-auto shrink-0 snap-center md:snap-align-none" onClick={() => navigate('/practice')}>
                        <div className="flex justify-between items-center w-full">
                            <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-orange-500/20 text-orange-500 flex items-center justify-center shadow-[0_0_12px_rgba(249,115,22,0.15)] group-hover:scale-105 transition-transform duration-300">
                                <Flame className="w-3.5 h-3.5 sm:w-5 h-5 animate-pulse" />
                            </div>
                            <span className="text-[11px] font-mono font-bold text-orange-500 dark:text-orange-400 bg-orange-500/10 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full border border-orange-500/15">
                                PB: {stats?.pb ? `${stats.pb}s` : '--'}
                            </span>
                        </div>
                        <div className="mt-2 sm:mt-3 text-left">
                            <h3 className="text-slate-500 dark:text-gray-400 text-[10px] font-bold uppercase tracking-wider">Solve Streak</h3>
                            <div className="text-xl font-display font-bold text-slate-900 dark:text-white mt-0.5 sm:mt-1 leading-none">{stats?.streak ?? 0} {stats?.streak === 1 ? 'Day' : 'Days'}</div>
                        </div>
                    </motion.div>

                    <motion.div variants={itemVariants} className="glass-panel-interactive glass-scroll-safe p-3.5 sm:p-6 flex flex-col justify-between group hover:border-primary/40 min-h-[75px] sm:min-h-[140px] w-[80vw] md:w-auto shrink-0 snap-center md:snap-align-none" onClick={() => navigate('/practice')}>
                        <div className="flex justify-between items-center w-full">
                            <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-primary/20 text-primary flex items-center justify-center shadow-[0_0_12px_rgba(59,130,246,0.15)] group-hover:scale-105 transition-transform duration-300">
                                <Timer className="w-3.5 h-3.5 sm:w-5 h-5" />
                            </div>
                            <span className="flex items-center text-[11px] font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full border border-emerald-500/15">
                                Solves: {solves.length}
                            </span>
                        </div>
                        <div className="mt-2 sm:mt-3 text-left">
                            <h3 className="text-slate-500 dark:text-gray-400 text-[11px] font-bold uppercase tracking-wider">Global Average</h3>
                            <div className="text-xl font-display font-bold text-slate-900 dark:text-white mt-0.5 sm:mt-1 leading-none">
                                {stats?.globalAverage ? `${stats.globalAverage}` : '--'}
                                {stats?.globalAverage && <span className="text-xs sm:text-base text-gray-500 dark:text-gray-400 ml-1 font-sans">s</span>}
                            </div>
                        </div>
                    </motion.div>

                    <motion.div variants={itemVariants} className="glass-panel-interactive glass-scroll-safe p-3.5 sm:p-6 flex flex-col justify-between lg:col-span-2 relative overflow-hidden group hover:border-secondary/40 transition-colors min-h-[75px] sm:min-h-[140px] w-[80vw] md:w-auto shrink-0 snap-center md:snap-align-none">
                        <div className="absolute right-0 top-0 w-32 h-32 sm:w-64 sm:h-64 bg-gradient-to-br from-secondary/15 to-transparent blur-[30px] sm:blur-[60px] rounded-full pointer-events-none group-hover:scale-110 transition-all duration-700 z-0" />
                        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 sm:gap-4 w-full h-full text-left">
                            <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-1.5 mb-1 sm:mb-2">
                                    {challengeComplete ? (
                                        <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500" />
                                    ) : (
                                        <Target className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-secondary animate-pulse" />
                                    )}
                                    <h3 className={clsx("text-[8px] sm:text-[10px] font-bold tracking-widest uppercase", challengeComplete ? "text-emerald-500" : "text-secondary")}>
                                        Daily Challenge
                                    </h3>
                                </div>
                                <div className="text-sm sm:text-xl font-display font-bold text-slate-900 dark:text-white mb-0.5 sm:mb-1 leading-tight truncate">
                                    {currentChallenge.title} ({challengeProgress}/{challengeTarget})
                                </div>
                                <p className="text-slate-500 dark:text-gray-400 text-[9px] sm:text-xs max-w-sm sm:max-w-xs leading-relaxed line-clamp-1 sm:line-clamp-none">
                                    {challengeComplete ? "Sensational work! Today's drill is fully locked and completed." : currentChallenge.description}
                                </p>
                            </div>
                            <Button variant="secondary" className="w-full sm:w-auto shrink-0 h-7 sm:h-10 min-h-[28px] sm:min-h-[40px] text-[10px] sm:text-xs font-bold sm:group-hover:bg-slate-200/90 sm:dark:group-hover:bg-white/10" onClick={() => navigate('/practice')}>
                                {challengeComplete ? "Completed" : "Start Drill"}
                            </Button>
                        </div>
                    </motion.div>
                </div>

                {/* --- PERFORMANCE TREND, MAP & AI COACH ROW --- */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6 w-full">
                    
                    {/* LEFT COLUMN: Performance Trend */}
                    <motion.div variants={itemVariants} className="glass-panel p-4 sm:p-6 lg:col-span-2 min-h-[360px] sm:min-h-[400px] flex flex-col w-full overflow-hidden">
                        <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-3 mb-5 w-full">
                            <div className="flex items-center gap-2 text-left">
                                <Activity className="w-4 h-4 sm:w-5 h-5 text-primary" />
                                <h3 className="font-display font-bold text-base sm:text-lg text-slate-900 dark:text-white">Performance Trend</h3>
                            </div>
                            <div className="relative self-start xs:self-auto" ref={timeDropdownRef}>
                                <button 
                                    onClick={() => setIsTimeDropdownOpen(!isTimeDropdownOpen)}
                                    className={`glass-panel flex items-center justify-between gap-3 bg-slate-50 dark:bg-[#1C1E22] border rounded-2xl text-[16px] sm:text-sm font-semibold text-slate-700 dark:text-gray-300 pl-4 pr-3 py-2.5 outline-none transition-all min-h-[44px] min-w-[150px] shadow-sm ${
                                        isTimeDropdownOpen ? "border-primary ring-1 ring-primary" : "border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20"
                                    }`}
                                >
                                    {timeRange}
                                    <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${isTimeDropdownOpen ? "rotate-180" : ""}`} />
                                </button>
                                <div className={`glass-panel absolute top-full mt-2 right-0 sm:left-0 w-full min-w-[150px] bg-white dark:bg-[#1C1E22] border border-slate-200 dark:border-white/10 rounded-2xl shadow-xl overflow-hidden z-50 transition-all duration-200 origin-top ${
                                    isTimeDropdownOpen ? "opacity-100 scale-100 visible" : "opacity-0 scale-95 invisible pointer-events-none"
                                }`}>
                                    {['Last 7 Days', 'Last 30 Days', 'All Time'].map((option) => (
                                        <button
                                            key={option}
                                            onClick={() => { setTimeRange(option); setIsTimeDropdownOpen(false); }}
                                            className={`w-full text-left px-4 py-3 sm:py-2.5 text-[16px] sm:text-sm font-medium transition-colors ${
                                                timeRange === option ? "bg-primary/10 text-primary dark:text-blue-400" : "text-slate-700 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-white/5"
                                            }`}
                                        >
                                            {option}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                        
                        <div ref={chartWrapperRef} className="flex-1 w-full h-[240px] sm:h-[280px] relative mt-1">
                            {isChartSafe && (
                            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                                <AreaChart data={stats?.trends || []} margin={{ top: 10, right: 5, left: -25, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorTime" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4} />
                                            <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="4 4" stroke={isDarkMode ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)'} vertical={false} />
                                    <XAxis dataKey="date" stroke={isDarkMode ? '#4B5563' : '#94A3B8'} tick={{ fill: isDarkMode ? '#9CA3AF' : '#64748B', fontSize: 10, fontFamily: 'monospace' }} axisLine={false} tickLine={false} />
                                    <YAxis stroke={isDarkMode ? '#4B5563' : '#94A3B8'} tick={{ fill: isDarkMode ? '#9CA3AF' : '#64748B', fontSize: 10, fontFamily: 'monospace' }} axisLine={false} tickLine={false} domain={['dataMin - 1', 'dataMax + 1']} />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: isDarkMode ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                                            backdropFilter: 'blur(20px)',
                                            border: isDarkMode ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.06)',
                                            borderRadius: '14px',
                                            boxShadow: '0 15px 30px rgba(0,0,0,0.15)',
                                            fontSize: '11px'
                                        }}
                                        itemStyle={{ color: isDarkMode ? '#3B82F6' : '#2563EB', fontWeight: 'bold' }}
                                        labelStyle={{ color: isDarkMode ? '#9CA3AF' : '#64748B', fontWeight: 'medium' }}
                                    />
                                    <Area type="monotone" dataKey="time" stroke="#3B82F6" strokeWidth={2.5} fillOpacity={1} fill="url(#colorTime)" animationDuration={1200} />
                                </AreaChart>
                            </ResponsiveContainer>
                            )}
                        </div>
                    </motion.div>

                    {/* RIGHT COLUMN: Activity Map & AI Coach Wrapper */}
                    <div className="flex flex-col gap-5 sm:gap-6 lg:col-span-1 w-full">
                        
                        {/* 1. Annual Activity Map (Top) */}
                        <motion.div variants={itemVariants} className="glass-panel p-4 sm:p-5 w-full flex flex-col relative">
                            <div className="flex items-center gap-2 mb-4">
                                <CalendarDays className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                                <h3 className="font-display font-bold text-base sm:text-lg text-slate-900 dark:text-white">Annual Activity Map</h3>
                            </div>
                            
                            {/* Scrollable Drag-to-Scroll Container */}
                            <div 
                                ref={mapScrollRef} 
                                onMouseDown={handleMapMouseDown}
                                onMouseLeave={handleMapMouseLeave}
                                onMouseUp={handleMapMouseUp}
                                onMouseMove={handleMapMouseMove}
                                className={clsx(
                                    "w-full overflow-x-auto pb-3 select-none",
                                    "[&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-200 dark:[&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded-full",
                                    isDraggingMap ? "cursor-grabbing" : "cursor-grab"
                                )}
                            >
                                <div className="grid grid-rows-7 grid-flow-col gap-[3px] sm:gap-1 w-max">
                                    {yearHistory.map((day, i) => {
                                        if (day.empty) {
                                            return <div key={`empty-${i}`} className="w-[10px] h-[10px] sm:w-[13px] sm:h-[13px] bg-transparent" />;
                                        }
                                        return (
                                            <div 
                                                key={`day-${i}`} 
                                                title={`${day.date.toDateString()}: ${day.level === 0 ? 'No activity' : day.level === 1 ? 'Streak maintained' : 'Challenge finished'}`}
                                                className={clsx(
                                                    "w-[10px] h-[10px] sm:w-[13px] sm:h-[13px] rounded-[2px] sm:rounded-[3px] transition-colors duration-300 pointer-events-none",
                                                    day.level === 0 && "bg-slate-200 dark:bg-white/5",
                                                    day.level === 1 && "bg-primary opacity-40",
                                                    day.level === 2 && "bg-primary shadow-sm"
                                                )}
                                            />
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-2 mt-3 text-[10px] sm:text-xs text-slate-500 dark:text-gray-400 font-medium">
                                <span>Lazy</span>
                                <div className="flex gap-1">
                                    <div className="w-3 h-3 rounded-[3px] bg-slate-200 dark:bg-white/5" />
                                    <div className="w-3 h-3 rounded-[3px] bg-primary opacity-40" />
                                    <div className="w-3 h-3 rounded-[3px] bg-primary" />
                                </div>
                                <span>Grind</span>
                            </div>
                        </motion.div>

                        {/* 2. AI Coach (Bottom) */}
                        <motion.div variants={itemVariants} className="glass-panel p-5 sm:p-6 flex flex-col border-primary/20 bg-gradient-to-b from-primary/[0.02] to-transparent w-full text-left h-full">
                            <div className="flex items-center gap-2.5 mb-5">
                                <div className="w-8 h-8 rounded-lg bg-gradient-animated flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.3)] flex-shrink-0">
                                    <BrainCircuit className="w-4 h-4 text-white" />
                                </div>
                                <h3 className="font-display font-bold text-base sm:text-lg text-slate-900 dark:text-white">AI Coach</h3>
                            </div>

                            <div className="flex-1 flex flex-col gap-3.5 w-full">
                                <div className="bg-white/40 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-xl p-4 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer group" onClick={() => navigate('/coach')}>
                                    <div className="text-xs sm:text-sm text-primary font-bold mb-1 transition-colors group-hover:text-slate-900 dark:group-hover:text-white">Lookahead Plateau Detected</div>
                                    <p className="text-[11px] sm:text-xs text-slate-500 dark:text-gray-400 leading-relaxed">Your F2L transitions are averaging +1.2s. Focus on OLL algorithms 21-25 to reduce hesitation.</p>
                                </div>

                                <div className="bg-white/40 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-xl p-4 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer group" onClick={() => navigate('/coach')}>
                                    <div className="text-xs sm:text-sm text-tertiary font-bold mb-1 transition-colors group-hover:text-slate-900 dark:group-hover:text-white">Cross Optimization</div>
                                    <p className="text-[11px] sm:text-xs text-slate-500 dark:text-gray-400 leading-relaxed">In 3 of your last 5 solves, your cross could have been completed in 6 moves instead of 8.</p>
                                </div>
                            </div>

                            <Button variant="glow" className="w-full mt-5 bg-primary/10 h-10 min-h-[40px] text-xs font-bold uppercase tracking-wider justify-center" onClick={() => navigate('/coach')}>
                                View Analysis Hub
                            </Button>
                        </motion.div>
                    </div>

                </div>

                {/* --- RECENT SOLVES & SCAN HISTORY --- */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6 w-full">
                    
                    <motion.div variants={itemVariants} className="glass-panel p-4 sm:p-6 w-full text-left">
                        <div className="flex items-center justify-between mb-5 w-full">
                            <div className="flex items-center gap-2">
                                <History className="w-4 h-4 sm:w-5 h-5 text-primary" />
                                <h3 className="font-display font-bold text-base sm:text-lg text-slate-900 dark:text-white">Recent Solves</h3>
                            </div>
                            <button className="text-xs sm:text-sm text-slate-500 hover:text-slate-900 dark:text-gray-400 dark:hover:text-white font-semibold transition-colors flex items-center gap-1 min-h-[32px] px-1" onClick={() => navigate('/analytics')}>
                                View All <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="w-full overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden -mx-1 px-1">
                            <table className="w-full text-left border-collapse min-w-[320px]">
                                <thead>
                                    <tr className="border-b border-slate-200 dark:border-white/10 text-[10px] font-bold text-slate-500 dark:text-gray-500 uppercase tracking-wider">
                                        <th className="pb-3 pl-2 sm:pl-4">Time</th>
                                        <th className="pb-3">Session</th>
                                        <th className="pb-3">Method</th>
                                        <th className="pb-3">Penalty</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {solves.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="py-8 text-center text-slate-500 dark:text-gray-500 text-xs sm:text-sm">
                                                No solves recorded yet. Start a session!
                                            </td>
                                        </tr>
                                    ) : (
                                        solves.slice(0, 4).map((solve) => (
                                            <tr key={solve._id || solve.id} className="border-b border-slate-100 dark:border-white/5 hover:bg-slate-50/50 dark:hover:bg-white/[0.01] transition-colors group">
                                                <td className="py-3.5 pl-2 sm:pl-4 font-display font-bold text-slate-900 dark:text-white text-base sm:text-lg transition-colors group-hover:text-primary">
                                                    {solve.penalty === '+2' ? formatTime(solve.timeMs + 2000) + '+' : formatTime(solve.timeMs)}
                                                </td>
                                                <td className="py-3.5 text-xs sm:text-sm text-slate-500 dark:text-gray-400 font-semibold">
                                                    <span className="bg-slate-100 dark:bg-white/5 px-2 py-0.5 rounded-md border border-slate-200/50 dark:border-white/5">
                                                        {solve.sessionId || 'Session 1'}
                                                    </span>
                                                </td>
                                                <td className="py-3.5 text-xs sm:text-sm text-slate-700 dark:text-gray-300 font-medium">{solve.method || 'CFOP'}</td>
                                                <td className="py-3.5">
                                                    <span className={`text-[10px] sm:text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wide ${
                                                        solve.penalty === 'None' || !solve.penalty
                                                            ? 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-gray-400' 
                                                            : solve.penalty === '+2'
                                                                ? 'bg-yellow-500/10 dark:bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 border border-yellow-500/15'
                                                                : 'bg-red-500/10 dark:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/15'
                                                    }`}>
                                                        {solve.penalty || 'None'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>

                    <motion.div variants={itemVariants} className="glass-panel p-4 sm:p-6 w-full text-left">
                        <div className="flex items-center justify-between mb-5 w-full">
                            <div className="flex items-center gap-2">
                                <ScanLine className="w-4 h-4 sm:w-5 h-5 text-primary" />
                                <h3 className="font-display font-bold text-base sm:text-lg text-slate-900 dark:text-white">Scan History</h3>
                            </div>
                            <button className="text-xs sm:text-sm text-slate-500 hover:text-slate-900 dark:text-gray-400 dark:hover:text-white font-semibold transition-colors flex items-center gap-1 min-h-[32px] px-1" onClick={() => navigate('/scanner')}>
                                View All <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="w-full overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden -mx-1 px-1">
                            <table className="w-full text-left border-collapse min-w-0">
                                <thead>
                                    <tr className="border-b border-slate-200 dark:border-white/10 text-[10px] font-bold text-slate-500 dark:text-gray-500 uppercase tracking-wider">
                                        <th className="pb-3 pl-2 sm:pl-4">Date</th>
                                        <th className="pb-3">Algorithm Sequence</th>
                                        <th className="pb-3 text-right pr-2 sm:pr-4">Moves</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {scans.length === 0 ? (
                                        <tr>
                                            <td colSpan={3} className="py-8 text-center text-slate-500 dark:text-gray-500 text-xs sm:text-sm">
                                                No cube scans found. Scan a physical cube!
                                            </td>
                                        </tr>
                                    ) : (
                                        scans.slice(0, 4).map((scan) => (
                                            <Fragment key={scan._id}>
                                                <tr 
                                                    className={clsx(
                                                        "border-b border-slate-100 dark:border-white/5 hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors group cursor-pointer",
                                                        expandedScanId === scan._id && "bg-slate-50/80 dark:bg-white/[0.03]"
                                                    )}
                                                    onClick={() => setExpandedScanId(expandedScanId === scan._id ? null : scan._id)}
                                                >
                                                    <td className="py-3.5 pl-2 sm:pl-4 text-xs sm:text-sm text-slate-700 dark:text-gray-300 font-medium whitespace-nowrap">
                                                        {new Date(scan.createdAt).toLocaleDateString()}
                                                    </td>
                                                    <td className="py-3.5 text-xs font-mono text-slate-500 dark:text-gray-400">
                                                        <div className="max-w-[90px] xs:max-w-[130px] sm:max-w-[200px] md:max-w-xs truncate">
                                                            {scan.solveSteps.length > 0 ? scan.solveSteps.join(' ') : 'Already Solved'}
                                                        </div>
                                                    </td>
                                                    <td className="py-3.5 text-right pr-2 sm:pr-4">
                                                        <span className="text-[10px] sm:text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wide bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
                                                            {scan.solveSteps.length}
                                                        </span>
                                                    </td>
                                                </tr>
                                                <AnimatePresence>
                                                    {expandedScanId === scan._id && (
                                                        <tr>
                                                            <td colSpan={3} className="p-0 border-b border-slate-100 dark:border-white/5">
                                                                <motion.div
                                                                    initial={{ height: 0, opacity: 0 }}
                                                                    animate={{ height: 'auto', opacity: 1 }}
                                                                    exit={{ height: 0, opacity: 0 }}
                                                                    transition={{ duration: 0.3, ease: "easeInOut" }}
                                                                    className="overflow-hidden w-full"
                                                                >
                                                                    <div className="p-4 flex items-center justify-start sm:justify-center gap-3 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden w-full">
                                                                        {['F', 'R', 'B', 'L', 'U', 'D'].map(faceId => (
                                                                            <div key={faceId} className="flex flex-col items-center gap-1.5 shrink-0 bg-slate-100 dark:bg-white/5 p-2.5 rounded-xl border border-slate-200 dark:border-white/10">
                                                                                <span className="text-[10px] font-bold text-slate-500 dark:text-gray-400 uppercase tracking-widest leading-none">{faceId}</span>
                                                                                
                                                                                <div className="grid grid-cols-3 bg-zinc-300 dark:bg-zinc-800 p-[3px] rounded-md w-fit shrink-0">
                                                                                    {scan.cubeState[faceId].map((color: string, idx: number) => (
                                                                                        <div key={idx} className={clsx("w-[10px] h-[10px] sm:w-[12px] sm:h-[12px] rounded-[3px] shadow-[0_1px_2px_rgba(0,0,0,0.1)] shrink-0 border border-zinc-300 dark:border-zinc-800", MINI_COLOR_MAP[color])} />
                                                                                    ))}
                                                                                </div>

                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </motion.div>
                                                            </td>
                                                        </tr>
                                                    )}
                                                </AnimatePresence>
                                            </Fragment>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>

                </div>

            </motion.div>
        </PageTransition>
    );
}