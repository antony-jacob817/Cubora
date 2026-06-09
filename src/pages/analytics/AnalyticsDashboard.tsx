import { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Activity, Target, Brain, ChevronDown,
  AlertTriangle, Zap, BarChart3, Trophy, Award, Crown,
  Gauge, Timer, Crosshair, Layers, GitCompare
} from 'lucide-react';
import { 
  Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, CartesianGrid, Legend, ReferenceDot, ComposedChart, Line,
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import { PageTransition } from '@/components/animations/PageTransition';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { clsx } from 'clsx';
import { motion } from 'framer-motion';

const CustomTooltip = ({ active, payload, label, activeColor }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="px-3 py-2.5 rounded-xl backdrop-blur-xl bg-white/80 dark:bg-[#141519]/80 border border-primary/30 shadow-[0_8px_20px_rgba(0,0,0,0.15)] relative overflow-hidden flex flex-col outline-none z-50">
        <div className="absolute left-0 top-0 bottom-0 w-1 shadow-[0_0_10px_currentColor]" style={{ backgroundColor: activeColor || 'var(--color-primary)'}} />
          <div className="flex justify-between items-center mb-1.5 border-b border-slate-200/50 dark:border-white/5 pb-1 gap-4">
            <span className="text-[9px] font-bold text-slate-500 dark:text-gray-400 uppercase tracking-widest pl-1.5">
                {label}
            </span>
            {payload[0]?.payload?.method && (
                <span className="text-[9px] font-mono font-bold text-slate-400 dark:text-gray-500 bg-slate-100 dark:bg-white/[0.05] px-1.5 py-0.5 rounded uppercase leading-none">
                    {payload[0].payload.method}
                </span>
            )}
         </div>
        {payload.map((entry: any, index: number) => {
          const color = (entry.name === 'Solve Time' && activeColor) 
            ? activeColor 
            : (entry.color === 'currentColor' ? 'var(--color-primary)' : entry.color);
            
          return (
            <div key={index} className="flex items-center gap-2 mb-1.5 pl-1.5">
                <div className="w-1.5 h-1.5 rounded-full shadow-sm" style={{ backgroundColor: color, boxShadow: `0 0 6px ${color}` }} />
                <span className="text-slate-900 dark:text-white font-mono font-bold text-xs sm:text-sm leading-none">
                    {typeof entry.value === 'number' ? entry.value : entry.value}
                    {entry.name.includes('Efficiency') ? '%' : 's'}
                </span>
                <span className="text-slate-500 dark:text-gray-500 text-[10px] font-bold uppercase tracking-wider leading-none ml-1">{entry.name}</span>
            </div>
          )
        })}
      </div>
    );
  }
  return null;
};

const Skeleton = ({ className }: { className: string }) => (
  <div className={`animate-pulse bg-slate-200 dark:bg-white/5 rounded-2xl ${className}`} />
);

interface SolveRecord {
  _id: string;
  timeMs: number;
  scramble: string;
  method: string;
  penalty: string;
  date: string;
  sessionId?: string;
  phaseSplits?: Record<string, number>;
}

export default function AnalyticsDashboard() {
  const { getAuthHeaders } = useAuth();
  const { isDarkMode } = useTheme();
  const [isLoading, setIsLoading] = useState(true);
  
  const [activeTab, setActiveTab] = useState<'trajectory' | 'phases' | 'comparison'>('trajectory');

  const [timeframe, setTimeframe] = useState('7D');
  const [isTimeDropdownOpen, setIsTimeDropdownOpen] = useState(false);
  const timeDropdownRef = useRef<HTMLDivElement>(null);

  const [chartSession, setChartSession] = useState('');
  const [isChartSessionDropdownOpen, setIsChartSessionDropdownOpen] = useState(false);
  const chartSessionDropdownRef = useRef<HTMLDivElement>(null);

  const [phaseMethod, setPhaseMethod] = useState('CFOP');
  const [isPhaseMethodDropdownOpen, setIsPhaseMethodDropdownOpen] = useState(false);
  const phaseMethodDropdownRef = useRef<HTMLDivElement>(null);

  const chartScrollRef = useRef<HTMLDivElement>(null);
  const [isDraggingChart, setIsDraggingChart] = useState(false);
  const [chartStartX, setChartStartX] = useState(0);
  const [chartScrollLeftValue, setChartScrollLeftValue] = useState(0);
  const [isChartScrolling, setIsChartScrolling] = useState(false);
  const chartScrollTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
        const handleClickOutside = (event: MouseEvent | TouchEvent) => {
            if (timeDropdownRef.current && !timeDropdownRef.current.contains(event.target as Node)) setIsTimeDropdownOpen(false);
            if (chartSessionDropdownRef.current && !chartSessionDropdownRef.current.contains(event.target as Node)) setIsChartSessionDropdownOpen(false);
            if (phaseMethodDropdownRef.current && !phaseMethodDropdownRef.current.contains(event.target as Node)) setIsPhaseMethodDropdownOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('touchstart', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('touchstart', handleClickOutside);
        };
  }, []);

  const handleChartScroll = () => {
    setIsChartScrolling(true);
    if (chartScrollTimeout.current) clearTimeout(chartScrollTimeout.current);
    chartScrollTimeout.current = setTimeout(() => setIsChartScrolling(false), 150);
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

  const [solves, setSolves] = useState<SolveRecord[]>([]);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const headers = getAuthHeaders();
        const solvesRes = await fetch('http://localhost:5000/api/solves?sessionId=all', { headers }); 
        const solvesData = await solvesRes.json();
        if (solvesData.success) setSolves(solvesData.data.filter((s: any) => !s.isDeleted));
      } catch (err) {
        console.error('Failed to load analytics data:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const uniqueSessions = useMemo(() => {
        const savedSessionsStr = localStorage.getItem('cubora_practice_sessions');
        const savedSessions: string[] = savedSessionsStr ? JSON.parse(savedSessionsStr) : [];
        const baseSessions = savedSessions.length > 0 ? savedSessions : ['Session 1'];
        const solvesSessions = Array.from(new Set(solves.map(s => s.sessionId || 'Session 1')));
        const combined = Array.from(new Set([...baseSessions, ...solvesSessions]));
        
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
        
        return [...combined].sort((a, b) => {
            const idxA = savedSessions.indexOf(a);
            const idxB = savedSessions.indexOf(b);
            if (idxA !== -1 && idxB !== -1) return idxA - idxB;
            if (idxA !== -1) return -1;
            if (idxB !== -1) return 1;
            return (sessionEarliestDates[a] || Infinity) - (sessionEarliestDates[b] || Infinity);
        });
  }, [solves]);

  useEffect(() => {
    if (uniqueSessions.length > 0 && (!chartSession || !uniqueSessions.includes(chartSession))) {
        setChartSession(uniqueSessions[0]);
    }
  }, [uniqueSessions, chartSession]);

  const calcRollingBest = (times: number[], count: number, isAo: boolean) => {
    if (times.length < count) return null;
    let best = Infinity;
    for (let i = count; i <= times.length; i++) {
        const window = times.slice(i - count, i);
        let val;
        if (isAo) {
            const sorted = [...window].sort((a, b) => a - b);
            const trim = Math.max(1, Math.ceil(count * 0.05));
            const trimmed = sorted.slice(trim, -trim);
            val = trimmed.reduce((a, b) => a + b, 0) / trimmed.length;
        } else {
            val = window.reduce((a, b) => a + b, 0) / window.length;
        }
        if (val < best) best = val;
    }
    return parseFloat((best / 1000).toFixed(3));
  };

  const IDEALS: Record<string, Record<string, number>> = {
      'CFOP': { 'Cross': 0.12, 'F2L': 0.50, 'OLL': 0.17, 'PLL': 0.21 },
      'Simplified CFOP': { 'Cross': 0.15, 'F2L': 0.55, 'OLL': 0.15, 'PLL': 0.15 },
      'Roux': { 'First Block': 0.25, 'Second Block': 0.30, 'CMLL': 0.15, 'LSE': 0.30 },
      'ZZ': { 'EOLine': 0.12, 'Z2L': 0.55, 'LL': 0.33 },
      'Beginner': { 'First Layer': 0.30, 'Second Layer': 0.35, 'Third Layer': 0.35 }
  };

  // ==========================================
  // TAB 1: SESSION TRAJECTORY LOGIC
  // ==========================================
  const sessionSolves = useMemo(() => solves.filter(s => (s.sessionId || 'Session 1') === chartSession), [solves, chartSession]);
  const validSessionSolves = useMemo(() => sessionSolves.filter(s => s.penalty !== 'DNF').reverse(), [sessionSolves]);
  const timesChronological = useMemo(() => validSessionSolves.map(s => s.timeMs + (s.penalty === '+2' ? 2000 : 0)), [validSessionSolves]);
  const totalSolves = validSessionSolves.length;

  const bestMO3 = useMemo(() => calcRollingBest(timesChronological, 3, false), [timesChronological]);
  const bestAO5 = useMemo(() => calcRollingBest(timesChronological, 5, true), [timesChronological]);
  const bestAO12 = useMemo(() => calcRollingBest(timesChronological, 12, true), [timesChronological]);
  const bestAO50 = useMemo(() => calcRollingBest(timesChronological, 50, true), [timesChronological]);
  const bestAO100 = useMemo(() => calcRollingBest(timesChronological, 100, true), [timesChronological]);

  const performanceDataFull = useMemo(() => {
    return validSessionSolves.map((solve, idx) => {
      const getVal = (count: number, isAo: boolean) => {
          if (idx + 1 < count) return null;
          const window = timesChronological.slice(idx + 1 - count, idx + 1);
          if (isAo) {
              const sorted = [...window].sort((a,b) => a-b);
              const trim = Math.max(1, Math.ceil(count * 0.05));
              const trimmed = sorted.slice(trim, -trim);
              return parseFloat((trimmed.reduce((a,b)=>a+b,0)/trimmed.length/1000).toFixed(3));
          } else {
              return parseFloat((window.reduce((a,b)=>a+b,0)/window.length/1000).toFixed(3));
          }
      };
      return {
          date: `#${idx + 1}`,
          time: parseFloat((timesChronological[idx] / 1000).toFixed(3)),
          method: solve.method || 'CFOP',
          mo3: getVal(3, false),
          ao5: getVal(5, true),
          ao12: getVal(12, true),
          ao50: getVal(50, true),
          ao100: getVal(100, true),
      };
    });
  }, [validSessionSolves, timesChronological]);

  const performanceData = useMemo(() => {
    let limit = performanceDataFull.length;
    if (timeframe === '7D') limit = 20;
    if (timeframe === '30D') limit = 50;
    if (timeframe === '3M') limit = 100;
    
    const pData = performanceDataFull.slice(-limit);
    if (pData.length === 1) pData.unshift({ ...pData[0], date: 'Start' });
    return pData;
  }, [performanceDataFull, timeframe]);

  useEffect(() => {
    if (!isLoading && performanceData.length > 0 && chartScrollRef.current && activeTab === 'trajectory') {
      const timerId = setTimeout(() => {
        if (chartScrollRef.current) chartScrollRef.current.scrollLeft = chartScrollRef.current.scrollWidth;
      }, 100);
      return () => clearTimeout(timerId);
    }
  }, [performanceData, isLoading, activeTab]);

  const pbSec = useMemo(() => timesChronological.length === 0 ? null : parseFloat((Math.min(...timesChronological) / 1000).toFixed(3)), [timesChronological]);
  const pbPoint = useMemo(() => pbSec ? performanceData.find(d => d.time === pbSec) : null, [performanceData, pbSec]);
  const avgTimeSec = useMemo(() => timesChronological.length === 0 ? 0 : parseFloat((timesChronological.reduce((acc, t) => acc + t, 0) / timesChronological.length / 1000).toFixed(3)), [timesChronological]);
  const tps = useMemo(() => avgTimeSec > 0 ? parseFloat((50 / avgTimeSec).toFixed(1)) : 0, [avgTimeSec]);

  // ==========================================
  // TAB 2: PHASE ANALYSIS LOGIC
  // ==========================================
  const methodPhaseSolves = useMemo(() => validSessionSolves.filter(s => (s.method || 'CFOP') === phaseMethod && s.phaseSplits && Object.keys(s.phaseSplits).length > 0), [validSessionSolves, phaseMethod]);
  const methodPhaseTimesChrono = useMemo(() => methodPhaseSolves.map(s => s.timeMs + (s.penalty === '+2' ? 2000 : 0)), [methodPhaseSolves]);
  
  const methodPhaseAvgSec = useMemo(() => methodPhaseTimesChrono.length === 0 ? 0 : parseFloat((methodPhaseTimesChrono.reduce((a,b)=>a+b,0)/methodPhaseTimesChrono.length/1000).toFixed(3)), [methodPhaseTimesChrono]);
  const methodPhaseTps = useMemo(() => methodPhaseAvgSec > 0 ? parseFloat((50 / methodPhaseAvgSec).toFixed(1)) : 0, [methodPhaseAvgSec]);
  
  const methodAo5 = useMemo(() => calcRollingBest(methodPhaseTimesChrono, 5, true), [methodPhaseTimesChrono]);

  const phaseSplitsData = useMemo(() => {
    if (methodPhaseSolves.length === 0 || methodPhaseAvgSec === 0) return [];

    const phaseTotals: Record<string, number> = {};
    const phaseCounts: Record<string, number> = {};

    methodPhaseSolves.forEach(solve => {
        Object.entries(solve.phaseSplits as Record<string, number>).forEach(([phase, timeMs]) => {
            phaseTotals[phase] = (phaseTotals[phase] || 0) + timeMs;
            phaseCounts[phase] = (phaseCounts[phase] || 0) + 1;
        });
    });

    const targetIdeals = IDEALS[phaseMethod] || IDEALS['CFOP'];

    return Object.keys(phaseTotals).map(phase => {
        const trueAvgMs = phaseTotals[phase] / phaseCounts[phase];
        const trueAvgSec = parseFloat((trueAvgMs / 1000).toFixed(3));
        const expectedRatio = targetIdeals[phase] || (1 / Object.keys(phaseTotals).length);
        const targetSec = parseFloat((methodPhaseAvgSec * expectedRatio).toFixed(3));
        
        return { 
            phase: phase, 
            time: trueAvgSec, 
            target: targetSec, 
            optimal: parseFloat((targetSec * 0.85).toFixed(3))
        };
    });
  }, [methodPhaseSolves, methodPhaseAvgSec, phaseMethod]);

  const weakestPhase = useMemo(() => {
    return phaseSplitsData.length > 0 
      ? phaseSplitsData.reduce((max, p) => (p.time - p.target) > (max.time - max.target) ? p : max, phaseSplitsData[0])
      : null;
  }, [phaseSplitsData]);


  // ==========================================
  // TAB 3: SPIDER CHART METHOD COMPARISON LOGIC
  // ==========================================
  const methodRadarData = useMemo(() => {
      const methodsToCompare = ['CFOP', 'Simplified CFOP', 'Roux', 'ZZ', 'Beginner'];
      const radarResults: any[] = [];

      methodsToCompare.forEach(m => {
          const mSolves = validSessionSolves.filter(s => (s.method || 'CFOP') === m && s.phaseSplits && Object.keys(s.phaseSplits).length > 0);
          if (mSolves.length > 0) {
              const phaseTotals: Record<string, number> = {};
              const phaseCounts: Record<string, number> = {};
              let totalMs = 0;

              mSolves.forEach(solve => {
                  totalMs += (solve.timeMs + (solve.penalty === '+2' ? 2000 : 0));
                  Object.entries(solve.phaseSplits as Record<string, number>).forEach(([phase, timeMs]) => {
                      phaseTotals[phase] = (phaseTotals[phase] || 0) + timeMs;
                      phaseCounts[phase] = (phaseCounts[phase] || 0) + 1;
                  });
              });

              const avgMethodSec = (totalMs / mSolves.length) / 1000;
              const targetIdeals = IDEALS[m] || IDEALS['CFOP'];

              const chartData = Object.keys(phaseTotals).map(phase => {
                  const trueAvgSec = (phaseTotals[phase] / phaseCounts[phase]) / 1000;
                  const expectedRatio = targetIdeals[phase] || (1 / Object.keys(phaseTotals).length);
                  const targetSec = avgMethodSec * expectedRatio;
                  
                  const efficiency = Math.round((targetSec / trueAvgSec) * 100);
                  
                  return {
                      phase,
                      Efficiency: efficiency > 150 ? 150 : efficiency, 
                      Target: 100,
                      ActualTime: parseFloat(trueAvgSec.toFixed(2))
                  };
              });

              radarResults.push({ 
                  method: m, 
                  data: chartData, 
                  avgSec: parseFloat(avgMethodSec.toFixed(3)), 
                  solveCount: mSolves.length 
              });
          }
      });

      return radarResults;
  }, [validSessionSolves]);

  const consistencyIndex = useMemo(() => {
    if (timesChronological.length < 2) return null;

    const mean =
      timesChronological.reduce((sum, t) => sum + t, 0) /
      timesChronological.length;

    const variance =
      timesChronological.reduce(
        (sum, t) => sum + Math.pow(t - mean, 2),
        0
      ) / timesChronological.length;

    return parseFloat((Math.sqrt(variance) / 1000).toFixed(3));
  }, [timesChronological]);

  const consistencyPercent = useMemo(() => {
    if (consistencyIndex === null || avgTimeSec <= 0) return null;
    return (consistencyIndex / avgTimeSec) * 100;
  }, [consistencyIndex, avgTimeSec]);

  const consistencyGrade = useMemo(() => {
    if (consistencyPercent === null) {
      return {
        grade: '--',
        color: 'text-slate-400',
        message: 'Not enough data'
      };
    }

    if (consistencyPercent < 3) {
      return {
        grade: 'S',
        color: 'text-yellow-400',
        message: 'Locked In'
      };
    }

    if (consistencyPercent < 5) {
      return {
        grade: 'A',
        color: 'text-green-400',
        message: 'Elite'
      };
    }

    if (consistencyPercent < 8) {
      return {
        grade: 'B',
        color: 'text-blue-400',
        message: 'Stable'
      };
    }

    if (consistencyPercent < 12) {
      return {
        grade: 'C',
        color: 'text-orange-400',
        message: 'Average'
      };
    }

    if (consistencyPercent < 18) {
      return {
        grade: 'D',
        color: 'text-red-400',
        message: 'Volatile'
      };
    }

    return {
      grade: 'F',
      color: 'text-red-600',
      message: 'Chaotic'
    };
  }, [consistencyPercent]);

  if (isLoading) {
    return (
      <div className="w-full flex flex-col gap-5 sm:gap-6 px-1 sm:px-0">
        <Skeleton className="h-10 w-64 mb-2" />
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 sm:gap-6 w-full mb-6">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => <Skeleton key={i} className="h-28" />)}
        </div>
        <Skeleton className="h-[350px] sm:h-[400px] w-full" />
      </div>
    );
  }

  const hasEnoughData = solves.filter(s => s.penalty !== 'DNF').length >= 3;

  return (
    <PageTransition className="w-full flex flex-col gap-5 sm:gap-6 pb-4 sm:pb-12 px-1 sm:px-0 text-left">
      
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-1">
        <div className="min-w-0">
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5 sm:gap-3">
            <BarChart3 className="w-7 h-7 sm:w-8 sm:h-8 text-primary shrink-0" /> Advanced Analytics
          </h1>
          <p className="text-slate-500 dark:text-gray-400 text-xs sm:text-sm mt-1.5 leading-relaxed">
            {hasEnoughData 
              ? `Analyzing ${totalSolves} solves for pattern recognition and AI insights.`
              : 'Complete more solves to unlock detailed analytics.'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-1.5 sm:gap-3 w-full mb-2">
        <Button
          variant="glow"
          size="sm"
          onClick={() => setActiveTab('trajectory')}
          className={clsx(
            "h-auto px-1 sm:px-4 py-2 sm:py-2.5 rounded-xl font-bold text-[9px] xs:text-[10px] sm:text-sm flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 transition-all duration-200 active:scale-95 !shadow-none",
            activeTab === 'trajectory'
              ? "bg-primary text-white shadow-md hover:bg-primary/90"
              : "glass-panel text-slate-500 hover:text-slate-900 dark:text-gray-400 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/5"
          )}
        >
          <Activity className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
          <span className="text-center leading-tight whitespace-normal">
            Session Trajectory
          </span>
        </Button>

        <Button
          variant="glow"
          size="sm"
          onClick={() => setActiveTab('phases')}
          className={clsx(
            "h-auto px-1 sm:px-4 py-2 sm:py-2.5 rounded-xl font-bold text-[9px] xs:text-[10px] sm:text-sm flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 transition-all duration-200 active:scale-95 !shadow-none",
            activeTab === 'phases'
              ? "bg-primary text-white shadow-md hover:bg-primary/90"
              : "glass-panel text-slate-500 hover:text-slate-900 dark:text-gray-400 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/5"
          )}
        >
          <Layers className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
          <span className="text-center leading-tight whitespace-normal">
            Phase Analysis
          </span>
        </Button>

        <Button
          variant="glow"
          size="sm"
          onClick={() => setActiveTab('comparison')}
          className={clsx(
            "h-auto px-1 sm:px-4 py-2 sm:py-2.5 rounded-xl font-bold text-[9px] xs:text-[10px] sm:text-sm flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 transition-all duration-200 active:scale-95 !shadow-none",
            activeTab === 'comparison'
              ? "bg-primary text-white shadow-md hover:bg-primary/90"
              : "glass-panel text-slate-500 hover:text-slate-900 dark:text-gray-400 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/5"
          )}
        >
          <GitCompare className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
          <span className="text-center leading-tight whitespace-normal">
            Method Comparison
          </span>
        </Button>
      </div>

      {!hasEnoughData ? (
        <div className="glass-panel p-8 sm:p-16 text-center flex flex-col items-center w-full mt-4">
          <BarChart3 className="w-12 h-12 sm:w-16 sm:h-16 text-slate-400 dark:text-gray-600 mb-5 sm:mb-6" />
          <h2 className="font-display text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-2 sm:mb-3">Not Enough Data Yet</h2>
          <p className="text-slate-500 dark:text-gray-400 text-xs sm:text-sm max-w-md mb-5 sm:mb-6 leading-relaxed">Complete at least 3 solves in the Practice session to unlock your performance analytics dashboard.</p>
          <a href="/practice" className="w-full sm:w-auto">
            <button className="w-full sm:w-auto px-5 py-3 bg-primary/20 text-primary rounded-xl font-bold text-xs sm:text-sm hover:bg-primary/30 transition-colors border border-primary/20 min-h-[44px]">
              Go to Practice →
            </button>
          </a>
        </div>
      ) : (
        <>
          {/* =========================================
                 TAB 1: SESSION TRAJECTORY 
             ========================================= */}
          {activeTab === 'trajectory' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="flex flex-col gap-5 sm:gap-6 w-full">
              {/* FULL 10-GRID DASHBOARD METRICS */}
              <div className="grid grid-cols-5 gap-1.5 sm:gap-4 lg:gap-6 w-full">
                
                {/* ROW 1: General Stats */}
                <div className="glass-panel p-1.5 xs:p-2 sm:p-4 flex flex-col justify-center items-center sm:items-start relative overflow-hidden group border-t-2 border-t-primary">
                  <div className="flex flex-col xl:flex-row items-center sm:items-start xl:items-center gap-0.5 sm:gap-1.5 mb-0.5 sm:mb-1.5 uppercase tracking-tight sm:tracking-widest text-[6px] xs:text-[7px] sm:text-[10px] font-bold text-slate-500 w-full text-center sm:text-left">
                      <Timer className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-primary shrink-0 mb-0.5 sm:mb-0" />
                      <span className="truncate w-full leading-none mt-0.5 sm:mt-0">Total Avg</span>
                  </div>
                  <div className="text-[10px] xs:text-xs sm:text-xl xl:text-2xl font-display font-bold text-slate-900 dark:text-white z-10 truncate w-full text-center sm:text-left leading-none">
                      {avgTimeSec > 0 ? `${avgTimeSec.toFixed(3)}s` : '--'}
                  </div>
                </div>

                <div className="glass-panel p-1.5 xs:p-2 sm:p-4 flex flex-col justify-center items-center sm:items-start relative overflow-hidden group border-t-2 border-t-primary">
                  <div className="flex flex-col xl:flex-row items-center sm:items-start xl:items-center gap-0.5 sm:gap-1.5 mb-0.5 sm:mb-1.5 uppercase tracking-tight sm:tracking-widest text-[6px] xs:text-[7px] sm:text-[10px] font-bold text-slate-500 w-full text-center sm:text-left">
                      <Crosshair className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#A3E635] shrink-0 mb-0.5 sm:mb-0" />
                      <span className="truncate w-full leading-none mt-0.5 sm:mt-0">Total Solves</span>
                  </div>
                  <div className="text-[10px] xs:text-xs sm:text-xl xl:text-2xl font-display font-bold text-slate-900 dark:text-white z-10 truncate w-full text-center sm:text-left leading-none">
                      {totalSolves}
                  </div>
                </div>

                <div className="glass-panel p-1.5 xs:p-2 sm:p-4 flex flex-col justify-center items-center sm:items-start relative overflow-hidden group border-t-2 border-t-tertiary">
                  <div className="flex flex-col xl:flex-row items-center sm:items-start xl:items-center gap-0.5 sm:gap-1.5 mb-0.5 sm:mb-1.5 uppercase tracking-tight sm:tracking-widest text-[6px] xs:text-[7px] sm:text-[10px] font-bold text-slate-500 w-full text-center sm:text-left">
                      <Gauge className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#60A5FA] shrink-0 mb-0.5 sm:mb-0" />
                      <span className="truncate w-full leading-none mt-0.5 sm:mt-0">Turn Speed</span>
                  </div>
                  <div className="text-[10px] xs:text-xs sm:text-xl xl:text-2xl font-display font-bold text-slate-900 dark:text-white z-10 truncate w-full text-center sm:text-left leading-none">
                      {tps ? `${tps.toFixed(1)}/s` : '--'}
                  </div>
                </div>

                <div className="glass-panel p-1.5 xs:p-2 sm:p-4 flex flex-col justify-center items-center sm:items-start relative overflow-hidden group border-t-2 border-t-orange-500">
                  <div className={clsx(
                    "absolute top-1.5 right-1.5 sm:top-3 sm:right-3 text-[9px] sm:text-xs font-black",
                    consistencyGrade.color
                  )}>
                    {consistencyGrade.grade}
                  </div>

                  <div className="flex flex-col xl:flex-row items-center sm:items-start xl:items-center gap-0.5 sm:gap-1.5 mb-0.5 sm:mb-1.5 uppercase tracking-tight sm:tracking-widest text-[6px] xs:text-[7px] sm:text-[10px] font-bold text-slate-500 w-full text-center sm:text-left">
                      <Target className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-orange-500 shrink-0 mb-0.5 sm:mb-0" />
                      <span className="truncate w-full leading-none mt-0.5 sm:mt-0">
                        Consistency
                      </span>
                  </div>

                  <div className="text-[10px] xs:text-xs sm:text-xl xl:text-2xl font-display font-bold text-slate-900 dark:text-white z-10 truncate w-full text-center sm:text-left leading-none">
                      {consistencyIndex !== null ? `±${consistencyIndex}s` : '--'}
                  </div>

                  <div className={clsx(
                    "text-[6px] xs:text-[7px] sm:text-[10px] font-bold uppercase tracking-wider mt-0.5 sm:mt-1",
                    consistencyGrade.color
                  )}>
                      {consistencyGrade.message}
                  </div>
                </div>

                <div className="glass-panel p-1.5 xs:p-2 sm:p-4 flex flex-col justify-center items-center sm:items-start relative overflow-hidden group border-t-2 border-t-yellow-500">
                  <div className="flex flex-col xl:flex-row items-center sm:items-start xl:items-center gap-0.5 sm:gap-1.5 mb-0.5 sm:mb-1.5 uppercase tracking-tight sm:tracking-widest text-[6px] xs:text-[7px] sm:text-[10px] font-bold text-slate-500 w-full text-center sm:text-left">
                      <Trophy className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-yellow-500 shrink-0 mb-0.5 sm:mb-0" />
                      <span className="truncate w-full leading-none mt-0.5 sm:mt-0">PB <span className="hidden sm:inline">({chartSession})</span></span>
                  </div>
                  <div className="text-[10px] xs:text-xs sm:text-xl xl:text-2xl font-display font-bold text-slate-900 dark:text-white z-10 truncate w-full text-center sm:text-left leading-none">
                      {pbSec !== null ? `${pbSec.toFixed(3)}s` : '--'}
                  </div>
                </div>

                {/* ROW 2: Custom Rolling Bests Matrix */}
                <div className="glass-panel p-1.5 xs:p-2 sm:p-4 flex flex-col justify-center items-center sm:items-start relative overflow-hidden group border-t-2" style={{ borderTopColor: '#00E5FF' }}>
                  <div className="flex flex-col xl:flex-row items-center sm:items-start xl:items-center gap-0.5 sm:gap-1.5 mb-0.5 sm:mb-1.5 uppercase tracking-tight sm:tracking-widest text-[6px] xs:text-[7px] sm:text-[10px] font-bold text-slate-500 w-full text-center sm:text-left">
                      <Activity className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0 mb-0.5 sm:mb-0" style={{ color: '#00E5FF' }} />
                      <span className="truncate w-full leading-none mt-0.5 sm:mt-0">Best MO3</span>
                  </div>
                  <div className="text-[10px] xs:text-xs sm:text-xl xl:text-2xl font-display font-bold text-slate-900 dark:text-white z-10 truncate w-full text-center sm:text-left leading-none">
                      {bestMO3 !== null ? `${bestMO3.toFixed(3)}s` : '--'}
                  </div>
                </div>

                <div className="glass-panel p-1.5 xs:p-2 sm:p-4 flex flex-col justify-center items-center sm:items-start relative overflow-hidden group border-t-2" style={{ borderTopColor: '#FF6B6B' }}>
                  <div className="flex flex-col xl:flex-row items-center sm:items-start xl:items-center gap-0.5 sm:gap-1.5 mb-0.5 sm:mb-1.5 uppercase tracking-tight sm:tracking-widest text-[6px] xs:text-[7px] sm:text-[10px] font-bold text-slate-500 w-full text-center sm:text-left">
                      <Zap className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0 mb-0.5 sm:mb-0" style={{ color: '#FF6B6B' }} />
                      <span className="truncate w-full leading-none mt-0.5 sm:mt-0">Best AO5</span>
                  </div>
                  <div className="text-[10px] xs:text-xs sm:text-xl xl:text-2xl font-display font-bold text-slate-900 dark:text-white z-10 truncate w-full text-center sm:text-left leading-none">
                      {bestAO5 !== null ? `${bestAO5.toFixed(3)}s` : '--'}
                  </div>
                </div>

                <div className="glass-panel p-1.5 xs:p-2 sm:p-4 flex flex-col justify-center items-center sm:items-start relative overflow-hidden group border-t-2" style={{ borderTopColor: '#DA70D6' }}>
                  <div className="flex flex-col xl:flex-row items-center sm:items-start xl:items-center gap-0.5 sm:gap-1.5 mb-0.5 sm:mb-1.5 uppercase tracking-tight sm:tracking-widest text-[6px] xs:text-[7px] sm:text-[10px] font-bold text-slate-500 w-full text-center sm:text-left">
                      <Target className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0 mb-0.5 sm:mb-0" style={{ color: '#DA70D6' }} />
                      <span className="truncate w-full leading-none mt-0.5 sm:mt-0">Best AO12</span>
                  </div>
                  <div className="text-[10px] xs:text-xs sm:text-xl xl:text-2xl font-display font-bold text-slate-900 dark:text-white z-10 truncate w-full text-center sm:text-left leading-none">
                      {bestAO12 !== null ? `${bestAO12.toFixed(3)}s` : '--'}
                  </div>
                </div>

                <div className="glass-panel p-1.5 xs:p-2 sm:p-4 flex flex-col justify-center items-center sm:items-start relative overflow-hidden group border-t-2" style={{ borderTopColor: '#10B981' }}>
                  <div className="flex flex-col xl:flex-row items-center sm:items-start xl:items-center gap-0.5 sm:gap-1.5 mb-0.5 sm:mb-1.5 uppercase tracking-tight sm:tracking-widest text-[6px] xs:text-[7px] sm:text-[10px] font-bold text-slate-500 w-full text-center sm:text-left">
                      <Award className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0 mb-0.5 sm:mb-0" style={{ color: '#10B981' }} />
                      <span className="truncate w-full leading-none mt-0.5 sm:mt-0">Best AO50</span>
                  </div>
                  <div className="text-[10px] xs:text-xs sm:text-xl xl:text-2xl font-display font-bold text-slate-900 dark:text-white z-10 truncate w-full text-center sm:text-left leading-none">
                      {bestAO50 !== null ? `${bestAO50.toFixed(3)}s` : '--'}
                  </div>
                </div>

                <div className="glass-panel p-1.5 xs:p-2 sm:p-4 flex flex-col justify-center items-center sm:items-start relative overflow-hidden group border-t-2" style={{ borderTopColor: '#E2E8F0' }}>
                  <div className="flex flex-col xl:flex-row items-center sm:items-start xl:items-center gap-0.5 sm:gap-1.5 mb-0.5 sm:mb-1.5 uppercase tracking-tight sm:tracking-widest text-[6px] xs:text-[7px] sm:text-[10px] font-bold text-slate-500 w-full text-center sm:text-left">
                      <Crown className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0 mb-0.5 sm:mb-0" style={{ color: '#E2E8F0' }} />
                      <span className="truncate w-full leading-none mt-0.5 sm:mt-0">Best AO100</span>
                  </div>
                  <div className="text-[10px] xs:text-xs sm:text-xl xl:text-2xl font-display font-bold text-slate-900 dark:text-white z-10 truncate w-full text-center sm:text-left leading-none">
                      {bestAO100 !== null ? `${bestAO100.toFixed(3)}s` : '--'}
                  </div>
                </div>
              </div>

              {/* MAIN GRAPH AREA */}
              <div className="glass-panel p-4 sm:p-6 w-full overflow-hidden flex flex-col">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 sm:mb-6 w-full shrink-0">
                    <h3 className="font-display font-bold text-lg sm:text-xl text-slate-900 dark:text-white shrink-0">Session Timeline</h3>
                    <div className="flex items-center gap-2 self-start sm:self-auto max-w-full">
                        {/* SESSION FILTER DROPDOWN */}
                        <div className="relative shrink-0" ref={chartSessionDropdownRef}>
                            <button 
                                onClick={() => setIsChartSessionDropdownOpen(!isChartSessionDropdownOpen)}
                                className={`glass-panel flex items-center justify-between gap-1.5 sm:gap-3 bg-slate-50 dark:bg-[#1C1E22] border rounded-xl sm:rounded-2xl text-[12px] sm:text-sm font-semibold text-slate-700 dark:text-gray-300 pl-3 pr-2 sm:pl-4 sm:pr-3 py-2 sm:py-2.5 outline-none transition-all shadow-sm ${
                                    isChartSessionDropdownOpen ? "border-primary ring-1 ring-primary" : "border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20"
                                }`}
                            >
                                <span className="truncate max-w-[80px] sm:max-w-[120px]">{chartSession}</span>
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
                                            className={`w-full text-left px-3 sm:px-4 py-2 sm:py-2.5 text-[12px] sm:text-sm font-medium transition-colors truncate ${
                                                chartSession === option ? "bg-primary/10 text-primary dark:text-blue-400" : "text-slate-700 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-white/5"
                                            }`}
                                        >
                                            {option}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* TIMEFRAME DROPDOWN */}
                        <div className="relative shrink-0" ref={timeDropdownRef}>
                            <button 
                                onClick={() => setIsTimeDropdownOpen(!isTimeDropdownOpen)}
                                className={`glass-panel flex items-center justify-between gap-1.5 sm:gap-3 bg-slate-50 dark:bg-[#1C1E22] border rounded-xl sm:rounded-2xl text-[12px] sm:text-sm font-semibold text-slate-700 dark:text-gray-300 pl-3 pr-2 sm:pl-4 sm:pr-3 py-2 sm:py-2.5 outline-none transition-all shadow-sm ${
                                    isTimeDropdownOpen ? "border-primary ring-1 ring-primary" : "border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20"
                                }`}
                            >
                                <span className="whitespace-nowrap">{timeframe === 'ALL' ? 'All Time' : timeframe}</span>
                                <ChevronDown className={`w-3.5 h-3.5 text-slate-500 shrink-0 transition-transform duration-200 ${isTimeDropdownOpen ? "rotate-180" : ""}`} />
                            </button>
                            <div className={`glass-panel absolute top-full mt-2 right-0 w-[120px] sm:w-[150px] bg-white dark:bg-[#1C1E22] border border-slate-200 dark:border-white/10 rounded-xl sm:rounded-2xl shadow-xl overflow-hidden z-50 transition-all duration-200 origin-top-right ${
                                isTimeDropdownOpen ? "opacity-100 scale-100 visible" : "opacity-0 scale-95 invisible pointer-events-none"
                            }`}>
                                {['7D', '30D', '3M', 'ALL'].map((option) => (
                                    <button
                                        key={option}
                                        onClick={() => { setTimeframe(option); setIsTimeDropdownOpen(false); }}
                                        className={`w-full text-left px-3 sm:px-4 py-2 sm:py-2.5 text-[12px] sm:text-sm font-medium transition-colors whitespace-nowrap ${
                                            timeframe === option ? "bg-primary/10 text-primary dark:text-blue-400" : "text-slate-700 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-white/5"
                                        }`}
                                    >
                                        {option === 'ALL' ? 'All Time' : option}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="relative w-full h-[260px] sm:h-[360px] md:h-[400px] flex flex-col overflow-hidden">
                  {/* FIXED Y-AXIS OVERLAY */}
                  <div className="absolute left-0 top-0 bottom-0 w-[40px] z-10 pointer-events-none bg-slate-50/30 dark:bg-[#181A1D]/30 backdrop-blur-sm border-r border-slate-200/10 dark:border-white/5 pr-1 pb-2 flex flex-col justify-between">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={performanceData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                        <XAxis dataKey="date" hide />
                        <YAxis stroke={isDarkMode ? '#4B5563' : '#94A3B8'} tick={{ fill: isDarkMode ? '#9CA3AF' : '#64748B', fontSize: 11, fontFamily: 'monospace' }} axisLine={false} tickLine={false} domain={[0, 'auto']} />
                        <Area type="monotone" dataKey="time" stroke="transparent" fill="transparent" strokeWidth={0} fillOpacity={0} activeDot={false} dot={false} />
                      </ComposedChart>
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
                        "text-primary flex-1 w-full h-[260px] sm:h-[360px] md:h-[400px] mt-1 outline-none overflow-x-auto overflow-y-hidden pb-2 select-none",
                        "[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden",
                        isDraggingChart ? "cursor-grabbing" : "cursor-grab"
                    )}
                  >
                    <div style={{ minWidth: '100%', width: `${performanceData.length * (isMobile ? 45 : 65)}px`, height: '100%' }} className={clsx("transition-opacity", (isChartScrolling || isDraggingChart) && "pointer-events-none opacity-90")}>
                      <ResponsiveContainer width="100%" height="100%" minWidth={0} style={{ outline: 'none' }}>
                        <ComposedChart style={{ outline: 'none' }} data={performanceData} margin={{ top: 10, right: 15, left: 40, bottom: 0 }}>
                          <defs>
                            <linearGradient id="colorTimeAnalytics" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="currentColor" stopOpacity={0.4}/>
                              <stop offset="95%" stopColor="currentColor" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#1f2937' : '#e2e8f0'} vertical={false} />
                          <XAxis dataKey="date" stroke={isDarkMode ? '#4B5563' : '#94A3B8'} tick={{ fill: isDarkMode ? '#9CA3AF' : '#64748B', fontSize: 10, fontFamily: 'monospace' }} axisLine={false} tickLine={false} interval="preserveStartEnd" minTickGap={20} />
                          <YAxis stroke="transparent" tick={false} axisLine={false} tickLine={false} width={0} domain={[0, 'auto']} />
                          <Tooltip cursor={false} content={<CustomTooltip activeColor={'currentColor'} />} />
                          
                          <Area type="monotone" dataKey="time" name="Solve Time" stroke="currentColor" strokeWidth={2} fillOpacity={1} fill="url(#colorTimeAnalytics)" dot={{ r: 4, fill: 'currentColor', strokeWidth: 0 }} activeDot={{ r: 6, fill: 'currentColor', stroke: '#fff', strokeWidth: 2 }} />
                          <Line type="monotone" dataKey="mo3" name="MO3" stroke="#00E5FF" strokeWidth={2.5} dot={{ r: 3, fill: '#00E5FF', strokeWidth: 0 }} activeDot={{ r: 5, fill: '#00E5FF', stroke: '#fff', strokeWidth: 2 }} connectNulls={false} />
                          <Line type="monotone" dataKey="ao5" name="AO5" stroke="#FF6B6B" strokeWidth={2.5} dot={{ r: 3, fill: '#FF6B6B', strokeWidth: 0 }} activeDot={{ r: 5, fill: '#FF6B6B', stroke: '#fff', strokeWidth: 2 }} connectNulls={false} />
                          <Line type="monotone" dataKey="ao12" name="AO12" stroke="#DA70D6" strokeWidth={2.5} dot={{ r: 3, fill: '#DA70D6', strokeWidth: 0 }} activeDot={{ r: 5, fill: '#DA70D6', stroke: '#fff', strokeWidth: 2 }} connectNulls={false} />
                          <Line type="monotone" dataKey="ao50" name="AO50" stroke="#10B981" strokeWidth={2.5} dot={{ r: 3, fill: '#10B981', strokeWidth: 0 }} activeDot={{ r: 5, fill: '#10B981', stroke: '#fff', strokeWidth: 2 }} connectNulls={false} />
                          <Line type="monotone" dataKey="ao100" name="AO100" stroke="#E2E8F0" strokeWidth={2.5} dot={{ r: 3, fill: '#E2E8F0', strokeWidth: 0 }} activeDot={{ r: 5, fill: '#E2E8F0', stroke: '#fff', strokeWidth: 2 }} connectNulls={false} />

                          {pbPoint && <ReferenceDot x={pbPoint.date} y={pbPoint.time} r={6} fill="#F97316" stroke="#fff" strokeWidth={2} style={{ filter: 'drop-shadow(0px 0px 4px #F97316)', outline: 'none' }} />}
                        </ComposedChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* =========================================
                 TAB 2: PHASE ANALYSIS 
             ========================================= */}
          {activeTab === 'phases' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="flex flex-col gap-5 sm:gap-6 w-full">
                
                {/* 4 CARDS FOCUSED ONLY ON METHOD SPECIFIC DATA */}
                <div className="grid grid-cols-4 gap-1.5 sm:gap-4 lg:gap-6 w-full">
                  <div className="glass-panel p-1.5 xs:p-2 sm:p-4 flex flex-col justify-center items-center sm:items-start relative overflow-hidden group border-t-2 border-t-primary">
                    <div className="flex flex-col xl:flex-row items-center sm:items-start xl:items-center gap-0.5 sm:gap-1.5 mb-0.5 sm:mb-1.5 uppercase tracking-tight sm:tracking-widest text-[6px] xs:text-[7px] sm:text-[10px] font-bold text-slate-500 w-full text-center sm:text-left">
                        <Timer className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-primary shrink-0 mb-0.5 sm:mb-0" />
                        <span className="truncate w-full leading-none mt-0.5 sm:mt-0">{phaseMethod} Avg</span>
                    </div>
                    <div className="text-[10px] xs:text-xs sm:text-xl xl:text-2xl font-display font-bold text-slate-900 dark:text-white z-10 truncate w-full text-center sm:text-left leading-none">
                        {methodPhaseAvgSec > 0 ? `${methodPhaseAvgSec.toFixed(3)}s` : '--'}
                    </div>
                  </div>

                  <div className="glass-panel p-1.5 xs:p-2 sm:p-4 flex flex-col justify-center items-center sm:items-start relative overflow-hidden group border-t-2 border-t-primary">
                    <div className="flex flex-col xl:flex-row items-center sm:items-start xl:items-center gap-0.5 sm:gap-1.5 mb-0.5 sm:mb-1.5 uppercase tracking-tight sm:tracking-widest text-[6px] xs:text-[7px] sm:text-[10px] font-bold text-slate-500 w-full text-center sm:text-left">
                        <Crosshair className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#A3E635] shrink-0 mb-0.5 sm:mb-0" />
                        <span className="truncate w-full leading-none mt-0.5 sm:mt-0">Phased Solves</span>
                    </div>
                    <div className="text-[10px] xs:text-xs sm:text-xl xl:text-2xl font-display font-bold text-slate-900 dark:text-white z-10 truncate w-full text-center sm:text-left leading-none">
                        {methodPhaseSolves.length}
                    </div>
                  </div>

                  <div className="glass-panel p-1.5 xs:p-2 sm:p-4 flex flex-col justify-center items-center sm:items-start relative overflow-hidden group border-t-2 border-t-tertiary">
                    <div className="flex flex-col xl:flex-row items-center sm:items-start xl:items-center gap-0.5 sm:gap-1.5 mb-0.5 sm:mb-1.5 uppercase tracking-tight sm:tracking-widest text-[6px] xs:text-[7px] sm:text-[10px] font-bold text-slate-500 w-full text-center sm:text-left">
                        <Gauge className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#60A5FA] shrink-0 mb-0.5 sm:mb-0" />
                        <span className="truncate w-full leading-none mt-0.5 sm:mt-0">Turn Speed</span>
                    </div>
                    <div className="text-[10px] xs:text-xs sm:text-xl xl:text-2xl font-display font-bold text-slate-900 dark:text-white z-10 truncate w-full text-center sm:text-left leading-none">
                        {methodPhaseTps ? `${methodPhaseTps.toFixed(1)}/s` : '--'}
                    </div>
                  </div>

                  <div className="glass-panel p-1.5 xs:p-2 sm:p-4 flex flex-col justify-center items-center sm:items-start relative overflow-hidden group border-t-2 border-t-orange-500">
                    <div className="flex flex-col xl:flex-row items-center sm:items-start xl:items-center gap-0.5 sm:gap-1.5 mb-0.5 sm:mb-1.5 uppercase tracking-tight sm:tracking-widest text-[6px] xs:text-[7px] sm:text-[10px] font-bold text-slate-500 w-full text-center sm:text-left">
                        <AlertTriangle className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-orange-500 shrink-0 mb-0.5 sm:mb-0" />
                        <span className="truncate w-full leading-none mt-0.5 sm:mt-0">Weak Phase</span>
                    </div>
                    <div className="text-[10px] xs:text-xs sm:text-xl xl:text-2xl font-display font-bold text-slate-900 dark:text-white z-10 truncate w-full text-center sm:text-left leading-none">
                        {weakestPhase?.phase || '--'}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6 w-full">
                  {phaseSplitsData.length > 0 ? (
                    <div className="glass-panel p-4 sm:p-6 flex flex-col w-full overflow-hidden">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-5 sm:mb-6 w-full">
                          <h3 className="font-display font-bold text-lg sm:text-xl text-slate-900 dark:text-white">Phase Analysis Engine</h3>
                          {/* METHOD DROPDOWN FILTER */}
                          <div className="relative shrink-0 z-20" ref={phaseMethodDropdownRef}>
                              <button 
                                  onClick={() => setIsPhaseMethodDropdownOpen(!isPhaseMethodDropdownOpen)}
                                  className={`glass-panel flex items-center justify-between gap-1.5 sm:gap-3 bg-slate-50 dark:bg-[#1C1E22] border rounded-xl sm:rounded-2xl text-[12px] sm:text-sm font-semibold text-slate-700 dark:text-gray-300 pl-3 pr-2 sm:pl-4 sm:pr-3 py-2 sm:py-2.5 outline-none transition-all shadow-sm ${
                                      isPhaseMethodDropdownOpen ? "border-primary ring-1 ring-primary" : "border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20"
                                  }`}
                              >
                                  <span className="truncate">{phaseMethod}</span>
                                  <ChevronDown className={`w-3.5 h-3.5 text-slate-500 shrink-0 transition-transform duration-200 ${isPhaseMethodDropdownOpen ? "rotate-180" : ""}`} />
                              </button>
                              <div className={`glass-panel absolute top-full mt-2 right-0 w-[140px] sm:w-[180px] bg-white dark:bg-[#1C1E22] border border-slate-200 dark:border-white/10 rounded-xl sm:rounded-2xl shadow-xl overflow-hidden transition-all duration-200 origin-top-right ${
                                  isPhaseMethodDropdownOpen ? "opacity-100 scale-100 visible" : "opacity-0 scale-95 invisible pointer-events-none"
                              }`}>
                                  {['CFOP', 'Simplified CFOP', 'Roux', 'ZZ', 'Beginner'].map((option) => (
                                      <button
                                          key={option}
                                          onClick={() => { setPhaseMethod(option); setIsPhaseMethodDropdownOpen(false); }}
                                          className={`w-full text-left px-3 sm:px-4 py-2 sm:py-2.5 text-[12px] sm:text-sm font-medium transition-colors truncate ${
                                              phaseMethod === option ? "bg-primary/10 text-primary dark:text-blue-400" : "text-slate-700 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-white/5"
                                          }`}
                                      >
                                          {option}
                                      </button>
                                  ))}
                              </div>
                          </div>
                      </div>

                      <div className="flex-1 w-full h-[260px] sm:h-[300px] min-w-0 mt-1">
                        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                          <BarChart data={phaseSplitsData} layout="vertical" margin={{ top: 0, right: 15, left: -15, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#1f2937' : '#e2e8f0'} horizontal={false} />
                            <XAxis type="number" stroke={isDarkMode ? '#4B5563' : '#94A3B8'} tick={{ fill: isDarkMode ? '#9CA3AF' : '#64748B', fontSize: 11, fontFamily: 'monospace' }} axisLine={false} tickLine={false} />
                            <YAxis dataKey="phase" type="category" stroke={isDarkMode ? '#4B5563' : '#94A3B8'} tick={{ fill: isDarkMode ? '#fff' : '#0f172a', fontWeight: 'bold', fontSize: 11 }} axisLine={false} tickLine={false} width={50} />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '15px' }} />
                            <Bar dataKey="time" name="Your Avg Time" fill="currentColor" radius={[0, 4, 4, 0]} className="text-primary">
                              {phaseSplitsData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.time > entry.target ? '#EF4444' : 'currentColor'} />
                              ))}
                            </Bar>
                            <Bar dataKey="target" name="Target Time" fill="#8B5CF6" radius={[0, 4, 4, 0]} opacity={0.4} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                      {weakestPhase && weakestPhase.time > weakestPhase.target && (
                        <div className="mt-4 p-3.5 bg-red-500/10 border border-red-500/20 rounded-xl flex gap-3 text-left">
                          <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-red-400 shrink-0 mt-0.5" />
                          <p className="text-xs sm:text-sm text-slate-700 dark:text-gray-300 leading-relaxed">
                            Your <strong className="text-slate-900 dark:text-white">{weakestPhase.phase}</strong> phase is {(weakestPhase.time - weakestPhase.target).toFixed(1)}s above target. Focus on this area for the biggest time gains.
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="glass-panel p-4 sm:p-6 flex flex-col w-full overflow-hidden">
                       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-5 sm:mb-6 w-full">
                          <h3 className="font-display font-bold text-lg sm:text-xl text-slate-900 dark:text-white">Phase Analysis Engine</h3>
                          <div className="relative shrink-0 z-20" ref={phaseMethodDropdownRef}>
                              <button 
                                  onClick={() => setIsPhaseMethodDropdownOpen(!isPhaseMethodDropdownOpen)}
                                  className={`glass-panel flex items-center justify-between gap-1.5 sm:gap-3 bg-slate-50 dark:bg-[#1C1E22] border rounded-xl sm:rounded-2xl text-[12px] sm:text-sm font-semibold text-slate-700 dark:text-gray-300 pl-3 pr-2 sm:pl-4 sm:pr-3 py-2 sm:py-2.5 outline-none transition-all shadow-sm ${
                                      isPhaseMethodDropdownOpen ? "border-primary ring-1 ring-primary" : "border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20"
                                  }`}
                              >
                                  <span className="truncate">{phaseMethod}</span>
                                  <ChevronDown className={`w-3.5 h-3.5 text-slate-500 shrink-0 transition-transform duration-200 ${isPhaseMethodDropdownOpen ? "rotate-180" : ""}`} />
                              </button>
                              <div className={`glass-panel absolute top-full mt-2 right-0 w-[140px] sm:w-[180px] bg-white dark:bg-[#1C1E22] border border-slate-200 dark:border-white/10 rounded-xl sm:rounded-2xl shadow-xl overflow-hidden transition-all duration-200 origin-top-right ${
                                  isPhaseMethodDropdownOpen ? "opacity-100 scale-100 visible" : "opacity-0 scale-95 invisible pointer-events-none"
                              }`}>
                                  {['CFOP', 'Simplified CFOP', 'Roux', 'ZZ', 'Beginner'].map((option) => (
                                      <button
                                          key={option}
                                          onClick={() => { setPhaseMethod(option); setIsPhaseMethodDropdownOpen(false); }}
                                          className={`w-full text-left px-3 sm:px-4 py-2 sm:py-2.5 text-[12px] sm:text-sm font-medium transition-colors truncate ${
                                              phaseMethod === option ? "bg-primary/10 text-primary dark:text-blue-400" : "text-slate-700 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-white/5"
                                          }`}
                                      >
                                          {option}
                                      </button>
                                  ))}
                              </div>
                          </div>
                      </div>
                      <div className="flex flex-col items-center justify-center text-center w-full flex-1 min-h-[200px]">
                          <Brain className="w-10 h-10 text-slate-400 mb-3 opacity-50" />
                          <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white">Phase Data Unavailable</h3>
                          <p className="text-sm text-slate-500 mt-2 max-w-sm">Use the Multi-Tap mode in your Practice Session while using {phaseMethod} to unlock these analytics.</p>
                      </div>
                    </div>
                  )}

                  <div className="glass-panel p-4 sm:p-6 flex flex-col relative overflow-hidden group w-full text-left">
                    <div className="absolute top-0 right-0 w-[320px] h-[320px] sm:w-[500px] sm:h-[500px] bg-secondary/10 blur-[80px] sm:blur-[100px] rounded-full pointer-events-none z-0" />
                    
                    <div className="relative z-10 w-full">
                      <div className="flex items-center gap-2.5 sm:grid-cols-3 mb-6">
                        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-animated flex items-center justify-center shadow-[0_0_20px_rgba(139,92,246,0.3)] shrink-0">
                          <Brain className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="font-display font-bold text-base sm:text-xl text-slate-900 dark:text-white tracking-tight">AI Coach Directives</h3>
                          <p className="text-[10px] text-secondary font-mono tracking-wider">BASED ON {methodPhaseSolves.length} {phaseMethod.toUpperCase()} SOLVES</p>
                        </div>
                      </div>

                      <div className="space-y-3.5 sm:space-y-4 w-full">
                        {weakestPhase && weakestPhase.time > weakestPhase.target && (
                          <div className="bg-white/40 dark:bg-white/5 border border-slate-200 dark:border-white/10 p-4 sm:p-5 rounded-2xl hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer group/card animate-fade-in text-left" onClick={() => window.location.href = '/practice'}>
                            <div className="flex flex-col xs:flex-row xs:items-start justify-between gap-1.5 mb-2 w-full">
                              <h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white group-hover/card:text-secondary transition-colors leading-snug">
                                {weakestPhase.phase} Optimization
                              </h4>
                              <span className="text-[9px] font-mono font-bold text-orange-600 dark:text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded self-start xs:self-auto uppercase tracking-wide">HIGH PRIORITY</span>
                            </div>
                            <p className="text-xs sm:text-sm text-slate-600 dark:text-gray-400 leading-relaxed mb-3">
                              Your {weakestPhase.phase} phase averages {weakestPhase.time}s, which is {(weakestPhase.time - weakestPhase.target).toFixed(1)}s above the target for your skill level. 
                              Focused drilling on this phase will yield the highest return on time invested.
                            </p>
                            <span className="text-xs sm:text-sm text-secondary font-bold hover:underline inline-flex items-center gap-1 min-h-[32px]">
                              Launch Targeted Drill →
                            </span>
                          </div>
                        )}

                        {methodAo5 && methodPhaseAvgSec && methodAo5 < methodPhaseAvgSec && (
                          <div className="bg-white/40 dark:bg-white/5 border border-slate-200 dark:border-white/10 p-4 sm:p-5 rounded-2xl hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer group/card animate-fade-in text-left">
                            <div className="flex flex-col xs:flex-row xs:items-start justify-between gap-1.5 mb-2 w-full">
                              <h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white group-hover/card:text-tertiary transition-colors leading-snug">Consistency Improving</h4>
                              <span className="text-[9px] font-mono font-bold text-tertiary bg-tertiary/10 px-2 py-0.5 rounded self-start xs:self-auto uppercase tracking-wide">POSITIVE TREND</span>
                            </div>
                            <p className="text-xs sm:text-sm text-slate-600 dark:text-gray-400 leading-relaxed">
                              Your recent {phaseMethod} Ao5 ({methodAo5.toFixed(3)}s) is faster than your tracked average ({methodPhaseAvgSec.toFixed(3)}s). 
                              You're on an upward trajectory — maintain your practice frequency to lock in these gains.
                            </p>
                          </div>
                        )}

                        {methodPhaseSolves.length < 20 && (
                          <div className="bg-white/40 dark:bg-white/5 border border-slate-200 dark:border-white/10 p-4 sm:p-5 rounded-2xl animate-fade-in text-left">
                            <div className="flex justify-between items-start mb-1.5 w-full">
                              <h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">Build Your Dataset</h4>
                              <span className="text-[9px] font-mono font-bold text-slate-500 dark:text-gray-400 bg-slate-100 dark:bg-white/5 px-2 py-0.5 rounded uppercase tracking-wide">INFO</span>
                            </div>
                            <p className="text-xs sm:text-sm text-slate-600 dark:text-gray-400 leading-relaxed">
                              You have {methodPhaseSolves.length} solves recorded using {phaseMethod}. Complete at least 20 solves for the AI to generate more precise, statistically significant coaching insights.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
            </motion.div>
          )}


          {/* =========================================
                 TAB 3: METHOD COMPARISON (SPIDER CHARTS)
             ========================================= */}
          {activeTab === 'comparison' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="flex flex-col gap-5 sm:gap-6 w-full">
               <div className="glass-panel p-4 sm:p-6 w-full overflow-hidden">
                 <h3 className="font-display font-bold text-lg sm:text-xl text-slate-900 dark:text-white mb-2">Method Phase Strengths</h3>
                 <p className="text-xs text-slate-500 dark:text-gray-400 mb-6 max-w-2xl leading-relaxed">This chart maps your Phase Efficiency. A score of 100% hits the ideal target time. A larger, outward-pushing shape means you are exceptionally fast at that phase, revealing your true natural method.</p>

                 {methodRadarData.length > 0 ? (
                     <div className="flex flex-wrap justify-center gap-4 sm:gap-6 w-full">
                         {methodRadarData.map((dataObj) => (
                             <div key={dataObj.method} className="w-full md:w-[calc(50%-12px)] xl:w-[calc(33.333%-16px)] bg-slate-50/50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 rounded-2xl p-4 flex flex-col items-center shadow-inner relative group">
                                 <h4 className="font-display font-bold text-base text-slate-900 dark:text-white mb-1 uppercase tracking-widest">{dataObj.method}</h4>
                                 <div className="flex gap-3 text-[10px] font-mono font-bold text-slate-500 dark:text-gray-400 mb-2">
                                     <span className="bg-slate-200/50 dark:bg-white/5 px-2 py-0.5 rounded">Avg: {dataObj.avgSec}s</span>
                                     <span className="bg-slate-200/50 dark:bg-white/5 px-2 py-0.5 rounded">{dataObj.solveCount} Solves</span>
                                 </div>
                                 <div className="w-full h-[220px] sm:h-[260px] relative">
                                     <ResponsiveContainer width="100%" height="100%">
                                         <RadarChart cx="50%" cy="50%" outerRadius="65%" data={dataObj.data}>
                                             <PolarGrid stroke={isDarkMode ? '#374151' : '#e2e8f0'} />
                                             <PolarAngleAxis dataKey="phase" tick={{ fill: isDarkMode ? '#9CA3AF' : '#64748B', fontSize: 10, fontWeight: 'bold' }} />
                                             <PolarRadiusAxis angle={30} domain={[0, 150]} tick={false} axisLine={false} />
                                             <Tooltip 
                                                contentStyle={{ backgroundColor: isDarkMode ? '#0f172a' : '#fff', border: 'none', borderRadius: '12px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)' }} 
                                                itemStyle={{ fontWeight: 'bold' }}
                                                formatter={(value: number, name: string) => [`${value}${name === 'Target' ? '%' : (name.includes('Efficiency') ? '%' : 's')}`, name]}
                                             />
                                             <Radar name="Target (100%)" dataKey="Target" stroke="#8B5CF6" strokeWidth={2} fill="transparent" strokeDasharray="3 3" />
                                             <Radar name="Your Efficiency" dataKey="Efficiency" stroke="var(--color-primary)" strokeWidth={2.5} fill="var(--color-primary)" fillOpacity={0.4} />
                                         </RadarChart>
                                     </ResponsiveContainer>
                                 </div>
                             </div>
                         ))}
                     </div>
                 ) : (
                     <div className="text-slate-500 dark:text-gray-500 text-center py-12 flex flex-col items-center">
                         <Layers className="w-12 h-12 opacity-30 mb-3" />
                         <p className="font-bold text-sm">No multi-tap phase data available to compare methods.</p>
                         <p className="text-xs mt-1">Use the "Track Phases" tool in Practice mode across different methods.</p>
                     </div>
                 )}
               </div>
            </motion.div>
          )}

        </>
      )}
    </PageTransition>
  );
}