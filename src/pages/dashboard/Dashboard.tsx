import { useState, useEffect, useRef, Fragment, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Flame, Timer, BrainCircuit, Target, ChevronDown,
    ChevronRight, Activity, ScanLine, History, CheckCircle2, CalendarDays
} from 'lucide-react';
import {
    AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceDot
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
    const mapScrollRef = useRef<HTMLDivElement>(null);
    const chartScrollRef = useRef<HTMLDivElement>(null);

    const [timeRange, setTimeRange] = useState('Last 7 Days');
    const [isTimeDropdownOpen, setIsTimeDropdownOpen] = useState(false);
    const timeDropdownRef = useRef<HTMLDivElement>(null);

    const [chartSession, setChartSession] = useState('All Sessions');
    const [isChartSessionDropdownOpen, setIsChartSessionDropdownOpen] = useState(false);
    const chartSessionDropdownRef = useRef<HTMLDivElement>(null);

    // Map dragging state
    const [isDraggingMap, setIsDraggingMap] = useState(false);
    const [mapStartX, setMapStartX] = useState(0);
    const [mapScrollLeft, setMapScrollLeft] = useState(0);

    // Chart dragging & scrolling state (to fix tooltip on mobile)
    const [isDraggingChart, setIsDraggingChart] = useState(false);
    const [chartStartX, setChartStartX] = useState(0);
    const [chartScrollLeftValue, setChartScrollLeftValue] = useState(0);
    const [isChartScrolling, setIsChartScrolling] = useState(false);
    const chartScrollTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 640);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent | TouchEvent) => {
            if (timeDropdownRef.current && !timeDropdownRef.current.contains(event.target as Node)) {
                setIsTimeDropdownOpen(false);
            }
            if (chartSessionDropdownRef.current && !chartSessionDropdownRef.current.contains(event.target as Node)) {
                setIsChartSessionDropdownOpen(false);
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
        const fetchData = async () => {
            try {
                const headers = getAuthHeaders();
                const [statsRes, solvesRes, scansRes] = await Promise.all([
                    fetch('http://localhost:5000/api/solves/stats?sessionId=all', { headers }),
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

    const uniqueSessions = useMemo(() => {
        const savedSessionsStr = localStorage.getItem('cubora_practice_sessions');
        const savedSessions: string[] = savedSessionsStr ? JSON.parse(savedSessionsStr) : [];
        
        const activeSolves = solves.filter(s => !s.isDeleted);
        const solvesSessions = Array.from(new Set(activeSolves.map(s => s.sessionId || 'Session 1')));
        
        const sessionEarliestDates: Record<string, number> = {};
        solves.forEach(s => {
            const sess = s.sessionId || 'Session 1';
            const time = s.date ? new Date(s.date).getTime() : 0;
            if (time > 0) {
                if (!sessionEarliestDates[sess] || time < sessionEarliestDates[sess]) {
                    sessionEarliestDates[sess] = time;
                }
            }
        });
        
        const sorted = [...solvesSessions].sort((a, b) => {
            const idxA = savedSessions.indexOf(a);
            const idxB = savedSessions.indexOf(b);
            if (idxA !== -1 && idxB !== -1) return idxA - idxB;
            if (idxA !== -1) return -1;
            if (idxB !== -1) return 1;
            
            const dateA = sessionEarliestDates[a] || 0;
            const dateB = sessionEarliestDates[b] || 0;
            return dateA - dateB;
        });
        
        return ['All Sessions', ...sorted];
    }, [solves]);

    const sessionColors = useMemo(() => {
        const savedColorsStr = localStorage.getItem('cubora_practice_session_colors');
        const savedColors = savedColorsStr ? JSON.parse(savedColorsStr) : {};
        
        const map: Record<string, string> = {};
        uniqueSessions.forEach(s => {
            const saved = savedColors[s];
            // Resolve 'theme' (or undefined) strictly to the dynamic CSS variable
            map[s] = (saved === 'theme' || !saved) ? 'var(--primary)' : saved;
        });
        return map;
    }, [uniqueSessions]);


    // Wrap validSolves and chartSolves in useMemo to prevent re-renders on scroll
    const validSolves = useMemo(() => solves.filter(s => s.penalty !== 'DNF' && !s.isDeleted), [solves]);
    
    // Filter chart data explicitly by Session
    const chartSolves = useMemo(() => validSolves.filter(s => (s.sessionId || 'Session 1') === chartSession), [validSolves, chartSession]);
    
    const performanceData = useMemo(() => {
        if (chartSession !== 'All Sessions') {
            const limit = timeRange === 'Last 7 Days' ? 20 : timeRange === 'Last 30 Days' ? 50 : chartSolves.length;
            const data = [...chartSolves]
                .slice(0, limit)
                .reverse()
                .map((solve, idx) => ({
                    date: `#${idx + 1}`,
                    time: parseFloat(((solve.timeMs + (solve.penalty === '+2' ? 2000 : 0)) / 1000).toFixed(3)),
                    method: solve.method || 'CFOP'
                }));
            if (data.length === 1) {
                data.unshift({ date: 'Start', time: data[0].time, method: data[0].method });
            }
            return data;
        } else {
            const sessionsList = uniqueSessions.filter(s => s !== 'All Sessions');
            const chronologicalSolves = [...validSolves].reverse();
            
            // 1. UPDATE THIS MAP TO STORE AN OBJECT INSTEAD OF JUST A NUMBER
            const sessionSolvesMap: Record<string, {time: number, method: string}[]> = {};
            sessionsList.forEach(s => {
                sessionSolvesMap[s] = [];
            });
            
            chronologicalSolves.forEach(solve => {
                const sId = solve.sessionId || 'Session 1';
                if (sessionSolvesMap[sId]) {
                    sessionSolvesMap[sId].push({
                        time: parseFloat(((solve.timeMs + (solve.penalty === '+2' ? 2000 : 0)) / 1000).toFixed(3)),
                        method: solve.method || 'CFOP'
                    });
                }
            });
            
            const limit = timeRange === 'Last 7 Days' ? 20 : timeRange === 'Last 30 Days' ? 50 : Infinity;
            
            // 2. UPDATE THE LIMITED MAP TYPE
            const sessionSolvesLimited: Record<string, {time: number, method: string}[]> = {};
            sessionsList.forEach(s => {
                sessionSolvesLimited[s] = sessionSolvesMap[s].slice(-limit);
            });
            
            const maxSolves = Math.max(...sessionsList.map(s => sessionSolvesLimited[s].length), 0);
            
            const data = Array.from({ length: maxSolves }).map((_, idx) => {
                const point: any = {
                    date: `#${idx + 1}`
                };
                sessionsList.forEach(s => {
                    if (idx < sessionSolvesLimited[s].length) {
                        // 3. ASSIGN BOTH TIME AND METHOD TO THE POINT
                        point[s] = sessionSolvesLimited[s][idx].time;
                        point[`${s}_method`] = sessionSolvesLimited[s][idx].method; 
                    }
                });
                return point;
            });
            
            if (data.length === 1) {
                const startPoint = { ...data[0], date: 'Start' };
                data.unshift(startPoint);
            }
            return data;
        }
    }, [chartSession, chartSolves, validSolves, timeRange, uniqueSessions]);

    // Auto-scroll the chart to the end when data changes
    useEffect(() => {
        if (!isLoading && performanceData.length > 0 && chartScrollRef.current) {
            const timerId = setTimeout(() => {
                if (chartScrollRef.current) {
                    chartScrollRef.current.scrollLeft = chartScrollRef.current.scrollWidth;
                }
            }, 100);
            return () => clearTimeout(timerId);
        }
    }, [performanceData, isLoading]);

    // Isolate Personal Best Point
    const pbSec = stats?.pb ? parseFloat(stats.pb.toFixed(3)) : null;
    let pbPoint: any = null;
    let pbSessionKey: string | null = null;
    if (pbSec) {
        if (chartSession !== 'All Sessions') {
            pbPoint = performanceData.find((d: any) => d.time && Math.abs(d.time - pbSec) < 0.001);
        } else {
            const sessionsList = uniqueSessions.filter(s => s !== 'All Sessions');
            for (const d of performanceData) {
                for (const s of sessionsList) {
                    if (d[s] && Math.abs(d[s] - pbSec) < 0.001) {
                        pbPoint = d;
                        pbSessionKey = s;
                        break;
                    }
                }
                if (pbPoint) break;
            }
        }
    }
    const hasEnoughChartData = chartSession !== 'All Sessions' ? chartSolves.length >= 2 : validSolves.length >= 2

    const currentChallenge = getDailyChallenge(new Date());
    const solvesToday = solves.filter(s => s.date && new Date(s.date).toDateString() === new Date().toDateString());
    const { progress: challengeProgress, target: challengeTarget } = currentChallenge.evaluate(solvesToday);
    const challengeComplete = challengeProgress >= challengeTarget;

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

        const oldestDate = new Date(today);
        oldestDate.setDate(today.getDate() - 364);
        const startDayOfWeek = oldestDate.getDay();

        for (let i = 0; i < startDayOfWeek; i++) {
            history.push({ empty: true });
        }

        for (let i = 364; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(d.getDate() - i);
            const dStr = d.toDateString();
            const daySolves = solvesByDate[dStr] || [];

            let level = 0; 
            if (daySolves.length > 0) {
                level = 1; 
                const challenge = getDailyChallenge(d);
                const { progress, target } = challenge.evaluate(daySolves);
                if (progress >= target) {
                    level = 2; 
                }
            }
            history.push({ date: d, level, empty: false });
        }
        return history;
    }, [solves]);

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

    // Map Handlers
    const handleMapMouseDown = (e: any) => {
        if (!mapScrollRef.current) return;
        setIsDraggingMap(true);
        setMapStartX(e.pageX - mapScrollRef.current.offsetLeft);
        setMapScrollLeft(mapScrollRef.current.scrollLeft);
    };
    const handleMapMouseLeave = () => setIsDraggingMap(false);
    const handleMapMouseUp = () => setIsDraggingMap(false);
    const handleMapMouseMove = (e: any) => {
        if (!isDraggingMap || !mapScrollRef.current) return;
        e.preventDefault(); 
        const x = e.pageX - mapScrollRef.current.offsetLeft;
        const walk = (x - mapStartX) * 1.5; 
        mapScrollRef.current.scrollLeft = mapScrollLeft - walk;
    };

    // Chart Handlers (Scroll & Drag)
    const handleChartScroll = () => {
        setIsChartScrolling(true);
        if (chartScrollTimeout.current) clearTimeout(chartScrollTimeout.current);
        chartScrollTimeout.current = setTimeout(() => {
            setIsChartScrolling(false);
        }, 150);
    };
    const handleChartMouseDown = (e: any) => {
        if (!chartScrollRef.current) return;
        setIsDraggingChart(true);
        setChartStartX(e.pageX - chartScrollRef.current.offsetLeft);
        setChartScrollLeftValue(chartScrollRef.current.scrollLeft);
    };
    const handleChartMouseLeave = () => setIsDraggingChart(false);
    const handleChartMouseUp = () => setIsDraggingChart(false);
    const handleChartMouseMove = (e: any) => {
        if (!isDraggingChart || !chartScrollRef.current) return;
        e.preventDefault(); 
        const x = e.pageX - chartScrollRef.current.offsetLeft;
        const walk = (x - chartStartX) * 1.5; 
        chartScrollRef.current.scrollLeft = chartScrollLeftValue - walk;
    };

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="px-3 py-2.5 rounded-xl backdrop-blur-xl bg-white/80 dark:bg-[#141519]/80 border border-primary/30 shadow-[0_8px_20px_rgba(0,0,0,0.15)] relative overflow-hidden flex flex-col outline-none z-50 pointer-events-none">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary shadow-[0_0_10px_currentColor]" />
                        
                        {/* 1. RESTORED SIMPLE HEADER */}
                        <div className="flex justify-between items-center mb-1.5 border-b border-slate-200/50 dark:border-white/5 pb-1 gap-4">
                            <span className="text-[9px] font-bold text-slate-500 dark:text-gray-400 uppercase tracking-widest pl-1.5">
                                Solve {label}
                            </span>
                        </div>
                    
                    <div className="flex flex-col gap-1.5 pl-1.5 mt-1">
                        {payload.map((entry: any, index: number) => {
                            const displayName = entry.name === 'time' ? (chartSession === 'All Sessions' ? 'Solve Time' : chartSession) : entry.name;
                            
                            // 2. GRAB METHOD DYNAMICALLY FOR EITHER SINGLE OR ALL SESSIONS
                            const method = entry.payload[`${entry.name}_method`] || entry.payload.method;

                            let color = entry.color;
                            if (color === 'currentColor') {
                                color = chartSession !== 'All Sessions' ? sessionColors[chartSession] : 'var(--primary)';
                            }

                            return (
                                <div key={index} className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
                                    
                                    {/* 3. INLINE FLEX ROW FOR NAME, TIME, AND BADGE */}
                                    <span className="text-xs font-semibold text-slate-700 dark:text-gray-300 flex items-center gap-1.5">
                                        <span>{displayName}: <span className="font-display font-bold text-slate-900 dark:text-white">{entry.value}s</span></span>
                                        
                                        {method && (
                                            <span className="text-[8px] font-mono font-bold text-slate-400 dark:text-gray-500 bg-slate-100 dark:bg-white/[0.05] px-1.5 py-0.5 rounded uppercase leading-none mt-px">
                                                {method}
                                            </span>
                                        )}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            );
        }
        return null;
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
                                PB: {stats?.pb ? `${Number(stats.pb).toFixed(3)}s` : '--'}
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
                                Total Solves: {solves.filter(s => !s.isDeleted).length}
                            </span>
                        </div>
                        <div className="mt-2 sm:mt-3 text-left">
                            <h3 className="text-slate-500 dark:text-gray-400 text-[11px] font-bold uppercase tracking-wider">Global Average</h3>
                            <div className="text-xl font-display font-bold text-slate-900 dark:text-white mt-0.5 sm:mt-1 leading-none">
                                {stats?.globalAverage ? Number(stats.globalAverage).toFixed(3) : '--'}
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
                        <div className="flex flex-col gap-3 mb-5 w-full">
                            
                            <div className="flex items-center gap-2 text-left">
                                <Activity className="w-4 h-4 sm:w-5 h-5 text-primary" />
                                <h3 className="font-display font-bold text-base sm:text-lg text-slate-900 dark:text-white">Performance Trend</h3>
                            </div>
                            
                            <div className="flex items-center justify-between w-full">
                                <div className="relative" ref={timeDropdownRef}>
                                    <button 
                                        onClick={() => setIsTimeDropdownOpen(!isTimeDropdownOpen)}
                                        className={`glass-panel flex items-center justify-between gap-3 bg-slate-50 dark:bg-[#1C1E22] border rounded-2xl text-[16px] sm:text-sm font-semibold text-slate-700 dark:text-gray-300 pl-4 pr-3 py-2.5 outline-none transition-all min-h-[44px] min-w-[150px] shadow-sm ${
                                            isTimeDropdownOpen ? "border-primary ring-1 ring-primary" : "border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20"
                                        }`}
                                    >
                                        {timeRange}
                                        <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${isTimeDropdownOpen ? "rotate-180" : ""}`} />
                                    </button>
                                    
                                    <div className={`glass-panel absolute top-full mt-2 left-0 w-full min-w-[150px] bg-white dark:bg-[#1C1E22] border border-slate-200 dark:border-white/10 rounded-2xl shadow-xl overflow-hidden z-50 transition-all duration-200 origin-top-left ${
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

                                <div className="relative shrink-0" ref={chartSessionDropdownRef}>
                                    <button 
                                        onClick={() => setIsChartSessionDropdownOpen(!isChartSessionDropdownOpen)}
                                        className={`glass-panel flex items-center justify-between gap-1.5 sm:gap-3 bg-slate-50 dark:bg-[#1C1E22] border rounded-xl sm:rounded-2xl text-[12px] sm:text-sm font-semibold text-slate-700 dark:text-gray-300 pl-3 pr-2 sm:pl-4 sm:pr-3 py-2 sm:py-2.5 outline-none transition-all shadow-sm ${
                                            isChartSessionDropdownOpen ? "border-primary ring-1 ring-primary" : "border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20"
                                        }`}
                                    >
                                        <div className="flex items-center gap-1.5 truncate max-w-[80px] sm:max-w-[120px]">
                                            {chartSession !== 'All Sessions' && (
                                                <span 
                                                    className="w-2.5 h-2.5 rounded-[5px] border border-black/10 dark:border-white/10 shrink-0" 
                                                    style={{ backgroundColor: sessionColors[chartSession] }} 
                                                />
                                            )}
                                            <span className="truncate">{chartSession}</span>
                                        </div>
                                        <ChevronDown className={`w-3.5 h-3.5 text-slate-500 shrink-0 transition-transform duration-200 ${isChartSessionDropdownOpen ? "rotate-180" : ""}`} />
                                    </button>
                                    <div className={`glass-panel absolute top-full mt-2 right-0 w-[140px] sm:w-[180px] bg-white dark:bg-[#1C1E22] border border-slate-200 dark:border-white/10 rounded-xl sm:rounded-2xl shadow-xl overflow-hidden z-50 transition-all duration-200 origin-top-right ${
                                        isChartSessionDropdownOpen ? "opacity-100 scale-100 visible" : "opacity-0 scale-95 invisible pointer-events-none"
                                    }`}>
                                        <div className="max-h-[200px] overflow-y-auto hide-scrollbar">
                                            {uniqueSessions.map((option) => (
                                                <button
                                                    key={option}
                                                    onClick={() => { setChartSession(option); setIsChartSessionDropdownOpen(false); }}
                                                    className={`w-full text-left px-3 sm:px-4 py-2 sm:py-2.5 text-[12px] sm:text-sm font-medium transition-colors flex items-center gap-1.5 ${
                                                        chartSession === option ? "bg-primary/10 text-primary dark:text-blue-400" : "text-slate-700 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-white/5"
                                                    }`}
                                                >
                                                    {option !== 'All Sessions' && (
                                                        <span 
                                                            className="w-2.5 h-2.5 rounded-[5px] border border-black/10 dark:border-white/10 shrink-0" 
                                                            style={{ backgroundColor: sessionColors[option] }} 
                                                        />
                                                    )}
                                                    <span className="truncate">{option}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>                                
                            </div>
                        </div>
                        
                        <div className="relative flex-1 w-full flex flex-col overflow-hidden">
                            {!hasEnoughChartData ? (
                                <div className="flex flex-col items-center justify-center flex-1 w-full h-full text-slate-500 dark:text-gray-500 gap-3 min-h-[240px]">
                                    <Activity className="w-8 h-8 sm:w-10 sm:h-10 opacity-20 dark:opacity-40" />
                                    <p className="text-xs sm:text-sm font-medium">Minimum 2 solves required to show trend.</p>
                                </div>
                            ) : (
                                <>
                                    {/* FIXED Y-AXIS OVERLAY */}
                                    <div 
                                        className="absolute left-0 top-0 bottom-0 w-[40px] z-10 pointer-events-none bg-slate-50/30 dark:bg-[#181A1D]/30 backdrop-blur-sm border-r border-slate-200/10 dark:border-white/5 pr-1 pb-2 flex flex-col justify-between"
                                        style={{ color: chartSession !== 'All Sessions' ? sessionColors[chartSession] : 'var(--primary)' }}
                                    >
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={performanceData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                                                {/* ... (Keep your existing AreaChart code here) ... */}
                                                <XAxis dataKey="date" hide />
                                                <YAxis 
                                                    stroke={isDarkMode ? '#4B5563' : '#94A3B8'} 
                                                    tick={{ fill: isDarkMode ? '#9CA3AF' : '#64748B', fontSize: 10, fontFamily: 'monospace' }} 
                                                    axisLine={false} 
                                                    tickLine={false} 
                                                    domain={[0, 'auto']} 
                                                />
                                                {chartSession !== 'All Sessions' ? (
                                                    <Area type="monotone" dataKey="time" stroke="transparent" fill="transparent" strokeWidth={0} fillOpacity={0} activeDot={false} dot={false} />
                                                ) : (
                                                    uniqueSessions.filter(s => s !== 'All Sessions').map((sessionName) => (
                                                        <Area key={sessionName} type="monotone" dataKey={sessionName} stroke="transparent" fill="transparent" strokeWidth={0} fillOpacity={0} activeDot={false} dot={false} />
                                                    ))
                                                )}
                                                {pbPoint && (
                                                    <ReferenceDot x={pbPoint.date} y={chartSession === 'All Sessions' && pbSessionKey ? pbPoint[pbSessionKey] : pbPoint.time} r={0} fill="transparent" stroke="transparent" />
                                                )}
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>

                                    {/* SCROLLABLE CHART CONTAINER */}
                                    <div 
                                        ref={chartScrollRef}
                                        onScroll={handleChartScroll}
                                        onMouseDown={handleChartMouseDown}
                                        onMouseLeave={handleChartMouseLeave}
                                        onMouseUp={handleChartMouseUp}
                                        onMouseMove={handleChartMouseMove}
                                        className={clsx(
                                            "flex-1 min-w-0 w-full h-[240px] sm:h-[280px] mt-1 outline-none overflow-x-auto overflow-y-hidden pb-2 select-none",
                                            "[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden",
                                            isDraggingChart ? "cursor-grabbing" : "cursor-grab"
                                        )}
                                        style={{ color: chartSession !== 'All Sessions' ? sessionColors[chartSession] : 'var(--primary)' }}
                                    >
                                        <style>{`
                                            .recharts-wrapper:focus, 
                                            .recharts-surface:focus, 
                                            .recharts-responsive-container:focus,
                                            .recharts-wrapper *:focus {
                                                outline: none !important;
                                            }
                                        `}</style>
                                        <div 
                                            style={{ width: `${Math.max(100, (performanceData.length / (isMobile ? 5 : 10)) * 100)}%`, height: '100%', minWidth: '100%' }}
                                            className={clsx(
                                                "transition-opacity",
                                                (isChartScrolling || isDraggingChart) && "pointer-events-none opacity-90"
                                            )}
                                        >
                                            <ResponsiveContainer width="100%" height="100%" minWidth={0} style={{ outline: 'none' }}>
                                                <AreaChart style={{ outline: 'none' }} data={performanceData} margin={{ top: 10, right: 15, left: 40, bottom: 0 }}>
                                                    {/* ... (Keep your existing AreaChart code here) ... */}
                                                    <defs>
                                                        {chartSession !== 'All Sessions' ? (
                                                            <linearGradient id="dynamicColorTime" x1="0" y1="0" x2="0" y2="1">
                                                                <stop offset="5%" stopColor="currentColor" stopOpacity={0.4} />
                                                                <stop offset="95%" stopColor="currentColor" stopOpacity={0} />
                                                            </linearGradient>
                                                        ) : (
                                                            uniqueSessions.filter(s => s !== 'All Sessions').map((sessionName) => {
                                                                const sColor = sessionColors[sessionName] || 'var(--primary)';
                                                                const gradId = `gradient-${sessionName.replace(/\s+/g, '-')}`;
                                                                return (
                                                                    <linearGradient key={gradId} id={gradId} x1="0" y1="0" x2="0" y2="1">
                                                                        <stop offset="5%" stopColor={sColor} stopOpacity={0.15} />
                                                                        <stop offset="95%" stopColor={sColor} stopOpacity={0} />
                                                                    </linearGradient>
                                                                );
                                                            })
                                                        )}
                                                    </defs>
                                                    <CartesianGrid strokeDasharray="4 4" stroke={isDarkMode ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)'} vertical={false} />
                                                    <XAxis 
                                                        dataKey="date" 
                                                        stroke={isDarkMode ? '#4B5563' : '#94A3B8'} 
                                                        tick={{ fill: isDarkMode ? '#9CA3AF' : '#64748B', fontSize: 10, fontFamily: 'monospace' }} 
                                                        axisLine={false} 
                                                        tickLine={false}
                                                        interval="preserveStartEnd"
                                                        minTickGap={20}
                                                    />
                                                    <YAxis stroke="transparent" tick={false} axisLine={false} tickLine={false} width={0} domain={[0, 'auto']} />
                                                    <Tooltip cursor={false} content={<CustomTooltip />} />
                                                    {chartSession !== 'All Sessions' ? (
                                                        <Area type="monotone" dataKey="time" name={chartSession} stroke="currentColor" strokeWidth={2.5} fillOpacity={1} fill="url(#dynamicColorTime)" animationDuration={1200} dot={{ r: 4, fill: 'currentColor', strokeWidth: 0 }} activeDot={{ r: 6, fill: 'currentColor', stroke: '#fff', strokeWidth: 2 }} />
                                                    ) : (
                                                        uniqueSessions.filter(s => s !== 'All Sessions').map((sessionName) => (
                                                            <Area key={sessionName} type="monotone" dataKey={sessionName} name={sessionName} stroke={sessionColors[sessionName] || 'var(--primary)'} strokeWidth={2.5} fillOpacity={1} fill={`url(#gradient-${sessionName.replace(/\s+/g, '-')})`} animationDuration={1200} dot={{ r: 4, fill: sessionColors[sessionName] || 'var(--primary)', strokeWidth: 0 }} activeDot={{ r: 6, fill: sessionColors[sessionName] || 'var(--primary)', stroke: '#fff', strokeWidth: 2 }} />
                                                        ))
                                                    )}
                                                    {pbPoint && (
                                                        <ReferenceDot x={pbPoint.date} y={chartSession === 'All Sessions' && pbSessionKey ? pbPoint[pbSessionKey] : pbPoint.time} r={6} fill="#F97316" stroke="#fff" strokeWidth={2} style={{ filter: 'drop-shadow(0px 0px 6px #F97316)', outline: 'none' }} />
                                                    )}
                                                </AreaChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </motion.div>

                    {/* RIGHT COLUMN: Activity Map & AI Coach Wrapper */}
                    <div className="flex flex-col gap-5 sm:gap-6 lg:col-span-1 w-full">
                        
                        <motion.div variants={itemVariants} className="glass-panel p-4 sm:p-5 w-full flex flex-col relative">
                            <div className="flex items-center gap-2 mb-4">
                                <CalendarDays className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                                <h3 className="font-display font-bold text-base sm:text-lg text-slate-900 dark:text-white">Annual Activity Map</h3>
                            </div>
                            
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
                                                    day.level === 0 && "bg-primary opacity-10 dark:opacity-100 dark:bg-white/5",
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
                                    <div className="w-3 h-3 rounded-[3px] bg-primary opacity-10 dark:opacity-100 dark:bg-white/5" />
                                    <div className="w-3 h-3 rounded-[3px] bg-primary opacity-40" />
                                    <div className="w-3 h-3 rounded-[3px] bg-primary" />
                                </div>
                                <span>Grind</span>
                            </div>
                        </motion.div>

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
                                        solves.filter(s => !s.isDeleted).slice(0, 4).map((solve) => (
                                            <tr key={solve._id || solve.id} className="border-b border-slate-100 dark:border-white/5 hover:bg-slate-50/50 dark:hover:bg-white/[0.01] transition-colors group">
                                                <td className="py-3.5 pl-2 sm:pl-4 font-display font-bold text-slate-900 dark:text-white text-base sm:text-lg transition-colors group-hover:text-primary">
                                                    {solve.penalty === '+2' ? formatTime(solve.timeMs + 2000) + '+' : formatTime(solve.timeMs)}
                                                </td>
                                                <td className="py-3.5 text-xs sm:text-sm text-slate-500 dark:text-gray-400 font-semibold">
                                                    <span className="inline-flex items-center gap-1.5 bg-slate-100 dark:bg-white/5 px-2 py-0.5 rounded-md border border-slate-200/50 dark:border-white/5 w-max">
                                                        <span 
                                                            className="w-2 h-2 rounded-full shrink-0" 
                                                            style={{ backgroundColor: sessionColors[solve.sessionId || 'Session 1'] }} 
                                                        />
                                                        <span className="truncate max-w-[80px] sm:max-w-[120px]">
                                                            {solve.sessionId || 'Session 1'}
                                                        </span>
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