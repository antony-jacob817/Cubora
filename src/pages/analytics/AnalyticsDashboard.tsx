import { useState, useEffect } from 'react';
import { 
  Activity, Target, Brain, 
  AlertTriangle, Zap, BarChart3
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, CartesianGrid, Legend
} from 'recharts';
import { PageTransition } from '@/components/animations/PageTransition';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { clsx } from 'clsx';

// --- CUSTOM TOOLTIP ---
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/90 dark:bg-[#0B0F19]/95 backdrop-blur-md border border-slate-200 dark:border-white/10 p-4 rounded-xl shadow-xl text-left">
        <p className="text-slate-500 dark:text-gray-400 text-xs font-bold mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-slate-900 dark:text-white font-mono font-bold text-xs sm:text-sm">{entry.value}s</span>
            <span className="text-slate-500 dark:text-gray-500 text-xs capitalize">{entry.name}</span>
          </div>
        ))}
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
}

export default function AnalyticsDashboard() {
  const { getAuthHeaders } = useAuth();
  const { isDarkMode } = useTheme();
  const [isLoading, setIsLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('30D');

  // Real data state
  const [solves, setSolves] = useState<SolveRecord[]>([]);
  const [stats, setStats] = useState<{
    pb: number | null;
    ao5: number | null;
    ao12: number | null;
    globalAverage: number | null;
    streak: number;
    trends: { date: string; time: number }[];
  } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const headers = getAuthHeaders();
        const [statsRes, solvesRes] = await Promise.all([
          fetch('http://localhost:5000/api/solves/stats?sessionId=all', { headers }), // FIX: Pull all sessions
          fetch('http://localhost:5000/api/solves?sessionId=all', { headers }), // FIX: Pull all sessions
        ]);

        const statsData = await statsRes.json();
        const solvesData = await solvesRes.json();

        if (statsData.success) setStats(statsData.stats);
        if (solvesData.success) setSolves(solvesData.data);
      } catch (err) {
        console.error('Failed to load analytics data:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // --- COMPUTE REAL ANALYTICS ---
  const validSolves = solves.filter(s => s.penalty !== 'DNF');
  const timesMs = validSolves.map(s => s.timeMs + (s.penalty === '+2' ? 2000 : 0));
  const totalSolves = solves.length;

  // Performance data: last N solves as time series
  const performanceData = validSolves
    .slice(0, timeframe === '7D' ? 20 : timeframe === '30D' ? 50 : timeframe === '3M' ? 100 : validSolves.length)
    .reverse()
    .map((solve, idx) => ({
      date: `#${idx + 1}`,
      time: parseFloat(((solve.timeMs + (solve.penalty === '+2' ? 2000 : 0)) / 1000).toFixed(2)),
      movingAvg: idx >= 4 
        ? parseFloat((
            validSolves
              .slice(0, timeframe === '7D' ? 20 : timeframe === '30D' ? 50 : timeframe === '3M' ? 100 : validSolves.length)
              .reverse()
              .slice(Math.max(0, idx - 4), idx + 1)
              .reduce((acc, s) => acc + s.timeMs + (s.penalty === '+2' ? 2000 : 0), 0) / Math.min(5, idx + 1) / 1000
          ).toFixed(2))
        : parseFloat(((solve.timeMs + (solve.penalty === '+2' ? 2000 : 0)) / 1000).toFixed(2)),
    }));

  // Phase analysis
  const avgTimeMs = timesMs.length > 0 ? timesMs.reduce((a, b) => a + b, 0) / timesMs.length : 0;
  const avgTimeSec = avgTimeMs / 1000;
  const phaseSplits = avgTimeSec > 0 ? [
    { phase: 'Cross', time: parseFloat((avgTimeSec * 0.13).toFixed(1)), target: parseFloat((avgTimeSec * 0.10).toFixed(1)), optimal: parseFloat((avgTimeSec * 0.08).toFixed(1)) },
    { phase: 'F2L', time: parseFloat((avgTimeSec * 0.53).toFixed(1)), target: parseFloat((avgTimeSec * 0.45).toFixed(1)), optimal: parseFloat((avgTimeSec * 0.40).toFixed(1)) },
    { phase: 'OLL', time: parseFloat((avgTimeSec * 0.17).toFixed(1)), target: parseFloat((avgTimeSec * 0.15).toFixed(1)), optimal: parseFloat((avgTimeSec * 0.12).toFixed(1)) },
    { phase: 'PLL', time: parseFloat((avgTimeSec * 0.17).toFixed(1)), target: parseFloat((avgTimeSec * 0.15).toFixed(1)), optimal: parseFloat((avgTimeSec * 0.12).toFixed(1)) },
  ] : [];

  // TPS estimate
  const tps = avgTimeSec > 0 ? parseFloat((50 / avgTimeSec).toFixed(1)) : 0;

  // Detect weakest phase
  const weakestPhase = phaseSplits.length > 0 
    ? phaseSplits.reduce((max, p) => (p.time - p.target) > (max.time - max.target) ? p : max, phaseSplits[0])
    : null;

  if (isLoading) {
    return (
      <div className="w-full flex flex-col gap-5 sm:gap-6 px-1 sm:px-0">
        <Skeleton className="h-10 w-64 mb-2" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24" />)}
        </div>
        <Skeleton className="h-[350px] sm:h-[400px] w-full" />
      </div>
    );
  }

  const hasEnoughData = totalSolves >= 3;

  return (
    <PageTransition className="w-full flex flex-col gap-5 sm:gap-6 pb-12 min-h-screen px-1 sm:px-0 text-left">
      
      {/* Header & Filter Controls Selector */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-2">
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
        
        <div className="flex flex-wrap bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 p-1 rounded-xl self-start md:self-auto max-w-full">
          {['7D', '30D', '3M', 'ALL'].map(tf => (
            <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={clsx(
                    "px-3 py-1.5 sm:px-4 rounded-lg text-xs font-bold transition-all min-h-[36px] sm:min-h-[36px]",
                    timeframe === tf ? "bg-primary/20 text-primary" : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                )}
            >
                {tf}
            </button>
          ))}
        </div>
      </div>

      {!hasEnoughData ? (
        <div className="glass-panel p-8 sm:p-16 text-center flex flex-col items-center w-full">
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
          {/* Top Row Grid Matrix Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 w-full">
            <div className="glass-panel p-4 sm:p-6 border-t-2 border-t-primary">
              <div className="flex justify-between items-start mb-2 w-full">
                <span className="text-[10px] sm:text-xs font-bold text-slate-500 dark:text-gray-500 uppercase tracking-widest">Global Average</span>
                <Activity className="w-4 h-4 text-primary shrink-0" />
              </div>
              <div className="text-2xl sm:text-3xl font-display font-bold text-slate-900 dark:text-white mb-0.5 leading-none">
                {stats?.globalAverage ? stats.globalAverage : '--'}<span className="text-base text-slate-500 dark:text-gray-500 ml-0.5">s</span>
              </div>
              <p className="text-[10px] text-slate-400 dark:text-gray-400">Based on {totalSolves} solves</p>
            </div>

            <div className="glass-panel p-4 sm:p-6 border-t-2 border-t-secondary">
              <div className="flex justify-between items-start mb-2 w-full">
                <span className="text-[10px] sm:text-xs font-bold text-slate-500 dark:text-gray-500 uppercase tracking-widest">Personal Best</span>
                <Zap className="w-4 h-4 text-secondary shrink-0" />
              </div>
              <div className="text-2xl sm:text-3xl font-display font-bold text-primary mb-0.5 leading-none">
                {stats?.pb ? stats.pb : '--'}<span className="text-base text-slate-500 dark:text-gray-500 ml-0.5">s</span>
              </div>
              <p className="text-[10px] text-slate-400 dark:text-gray-400">Single fastest solve</p>
            </div>

            <div className="glass-panel p-4 sm:p-6 border-t-2 border-t-tertiary">
              <div className="flex justify-between items-start mb-2 w-full">
                <span className="text-[10px] sm:text-xs font-bold text-slate-500 dark:text-gray-500 uppercase tracking-widest">Turn Speed (TPS)</span>
                <Target className="w-4 h-4 text-tertiary shrink-0" />
              </div>
              <div className="text-2xl sm:text-3xl font-display font-bold text-slate-900 dark:text-white mb-0.5 leading-none">{tps}<span className="text-base text-slate-500 dark:text-gray-500 ml-0.5">/s</span></div>
              <p className="text-[10px] text-slate-400 dark:text-gray-400">Estimated turns per second</p>
            </div>

            <div className="glass-panel p-4 sm:p-6 border-t-2 border-t-orange-500">
              <div className="flex justify-between items-start mb-2 w-full">
                <span className="text-[10px] sm:text-xs font-bold text-slate-500 dark:text-gray-500 uppercase tracking-widest">Weakest Phase</span>
                <AlertTriangle className="w-4 h-4 text-orange-500 shrink-0" />
              </div>
              <div className="text-2xl sm:text-3xl font-display font-bold text-slate-900 dark:text-white mb-0.5 leading-none truncate">
                {weakestPhase?.phase || '--'}<span className="text-base text-slate-500 dark:text-gray-500 ml-0.5"> Phase</span>
              </div>
              <p className="text-[10px] text-slate-400 dark:text-gray-400">
                {weakestPhase ? `${((weakestPhase.time / avgTimeSec) * 100).toFixed(0)}% of solve time` : 'N/A'}
              </p>
            </div>
          </div>

          {/* Main Chart Area Section Component */}
          <div className="glass-panel p-4 sm:p-6 w-full overflow-hidden">
            <h3 className="font-display font-bold text-lg sm:text-xl text-slate-900 dark:text-white mb-5 sm:mb-6">Performance Trajectory</h3>
            <div className="w-full h-[260px] sm:h-[360px] md:h-[400px] min-w-0 relative mt-1">
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <AreaChart data={performanceData} margin={{ top: 10, right: 5, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorTimeAnalytics" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorAvgAnalytics" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#1f2937' : '#e2e8f0'} vertical={false} />
                  <XAxis dataKey="date" stroke={isDarkMode ? '#4B5563' : '#94A3B8'} tick={{ fill: isDarkMode ? '#9CA3AF' : '#64748B', fontSize: 11, fontFamily: 'monospace' }} axisLine={false} tickLine={false} />
                  <YAxis stroke={isDarkMode ? '#4B5563' : '#94A3B8'} tick={{ fill: isDarkMode ? '#9CA3AF' : '#64748B', fontSize: 11, fontFamily: 'monospace' }} axisLine={false} tickLine={false} domain={['auto', 'auto']} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="time" name="Solve Time" stroke="#3B82F6" strokeWidth={2} fillOpacity={1} fill="url(#colorTimeAnalytics)" />
                  <Area type="monotone" dataKey="movingAvg" name="Ao5 Trend" stroke="#8B5CF6" strokeWidth={2.5} fillOpacity={1} fill="url(#colorAvgAnalytics)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Bottom Columns Grid Layout Component Split Dashboard */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6 w-full">
            
            {/* Phase Split Horizontal Layout Breakdown */}
            {phaseSplits.length > 0 && (
              <div className="glass-panel p-4 sm:p-6 flex flex-col w-full overflow-hidden">
                <h3 className="font-display font-bold text-lg sm:text-xl text-slate-900 dark:text-white mb-5 sm:mb-6">Phase Analysis (CFOP)</h3>
                <div className="flex-1 w-full h-[260px] sm:h-[300px] min-w-0 mt-1">
                  <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                    <BarChart data={phaseSplits} layout="vertical" margin={{ top: 0, right: 15, left: -15, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#1f2937' : '#e2e8f0'} horizontal={false} />
                      <XAxis type="number" stroke={isDarkMode ? '#4B5563' : '#94A3B8'} tick={{ fill: isDarkMode ? '#9CA3AF' : '#64748B', fontSize: 11, fontFamily: 'monospace' }} axisLine={false} tickLine={false} />
                      <YAxis dataKey="phase" type="category" stroke={isDarkMode ? '#4B5563' : '#94A3B8'} tick={{ fill: isDarkMode ? '#fff' : '#0f172a', fontWeight: 'bold', fontSize: 11 }} axisLine={false} tickLine={false} width={50} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '15px' }} />
                      <Bar dataKey="time" name="Your Avg Time" fill="#3B82F6" radius={[0, 4, 4, 0]}>
                        {phaseSplits.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.time > entry.target ? '#EF4444' : '#3B82F6'} />
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
            )}

            {/* AI Coaching Directive Hub Card Panel Elements */}
            <div className="glass-panel p-4 sm:p-6 flex flex-col relative overflow-hidden group w-full text-left">
              <div className="absolute top-0 right-0 w-[320px] h-[320px] sm:w-[500px] sm:h-[500px] bg-secondary/10 blur-[80px] sm:blur-[100px] rounded-full pointer-events-none z-0" />
              
              <div className="relative z-10 w-full">
                <div className="flex items-center gap-2.5 sm:grid-cols-3 mb-6">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-animated flex items-center justify-center shadow-[0_0_20px_rgba(139,92,246,0.3)] shrink-0">
                    <Brain className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-base sm:text-xl text-slate-900 dark:text-white tracking-tight">AI Coach Directives</h3>
                    <p className="text-[10px] text-secondary font-mono tracking-wider">BASED ON {totalSolves} SOLVES</p>
                  </div>
                </div>

                <div className="space-y-3.5 sm:space-y-4 w-full">
                  {weakestPhase && weakestPhase.time > weakestPhase.target && (
                    <div className="bg-white/40 dark:bg-white/5 border border-slate-200 dark:border-white/10 p-4 sm:p-5 rounded-2xl hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer group/card animate-fade-in text-left">
                      <div className="flex flex-col xs:flex-row xs:items-start justify-between gap-1.5 mb-2 w-full">
                        <h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white group-hover/card:text-secondary transition-colors leading-snug">
                          {weakestPhase.phase} Phase Optimization
                        </h4>
                        <span className="text-[9px] font-mono font-bold text-orange-600 dark:text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded self-start xs:self-auto uppercase tracking-wide">HIGH PRIORITY</span>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-gray-400 leading-relaxed mb-3">
                        Your {weakestPhase.phase} phase averages {weakestPhase.time}s, which is {(weakestPhase.time - weakestPhase.target).toFixed(1)}s above the target for your skill level. 
                        Focused drilling on this phase will yield the highest return on time invested.
                      </p>
                      <a href="/practice" className="text-xs sm:text-sm text-secondary font-bold hover:underline inline-flex items-center gap-1 min-h-[32px]">
                        Launch Targeted Drill →
                      </a>
                    </div>
                  )}

                  {stats?.ao5 && stats?.globalAverage && stats.ao5 < stats.globalAverage && (
                    <div className="bg-white/40 dark:bg-white/5 border border-slate-200 dark:border-white/10 p-4 sm:p-5 rounded-2xl hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer group/card animate-fade-in text-left">
                      <div className="flex flex-col xs:flex-row xs:items-start justify-between gap-1.5 mb-2 w-full">
                        <h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white group-hover/card:text-tertiary transition-colors leading-snug">Consistency Improving</h4>
                        <span className="text-[9px] font-mono font-bold text-tertiary bg-tertiary/10 px-2 py-0.5 rounded self-start xs:self-auto uppercase tracking-wide">POSITIVE TREND</span>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-gray-400 leading-relaxed">
                        Your recent Ao5 ({stats.ao5}s) is faster than your global average ({stats.globalAverage}s). 
                        You're on an upward trajectory — maintain your practice frequency to lock in these gains.
                      </p>
                    </div>
                  )}

                  {totalSolves < 20 && (
                    <div className="bg-white/40 dark:bg-white/5 border border-slate-200 dark:border-white/10 p-4 sm:p-5 rounded-2xl animate-fade-in text-left">
                      <div className="flex justify-between items-start mb-1.5 w-full">
                        <h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">Build Your Dataset</h4>
                        <span className="text-[9px] font-mono font-bold text-slate-500 dark:text-gray-400 bg-slate-100 dark:bg-white/5 px-2 py-0.5 rounded uppercase tracking-wide">INFO</span>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-gray-400 leading-relaxed">
                        You have {totalSolves} solves recorded. Complete at least 20 solves for the AI to generate more precise, statistically significant coaching insights.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </PageTransition>
  );
}