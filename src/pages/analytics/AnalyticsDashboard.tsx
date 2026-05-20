import { useState, useEffect } from 'react';
import { 
  TrendingDown, Activity, Target, Brain, 
  AlertTriangle, Zap, BarChart3
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, CartesianGrid, Legend
} from 'recharts';
import { PageTransition } from '@/components/animations/PageTransition';
import { clsx } from 'clsx';

// --- MOCK DATA ---
const performanceData = Array.from({ length: 30 }).map((_, i) => ({
  date: `Day ${i + 1}`,
  time: (15 - Math.log(i + 1) * 1.5 + Math.random() * 2).toFixed(2),
  movingAvg: (16 - Math.log(i + 1) * 1.4).toFixed(2),
}));

const phaseSplits = [
  { phase: 'Cross', time: 1.8, target: 1.5, optimal: 1.2 },
  { phase: 'F2L', time: 7.2, target: 6.0, optimal: 5.5 },
  { phase: 'OLL', time: 2.1, target: 2.0, optimal: 1.5 },
  { phase: 'PLL', time: 2.4, target: 2.0, optimal: 1.8 },
];

// --- CUSTOM COMPONENTS ---
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background/90 backdrop-blur-md border border-white/10 p-4 rounded-xl shadow-xl">
        <p className="text-gray-400 text-xs font-bold mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-white font-mono font-bold">{entry.value}s</span>
            <span className="text-gray-500 text-xs capitalize">{entry.name}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const Skeleton = ({ className }: { className: string }) => (
  <div className={`animate-pulse bg-white/5 rounded-2xl ${className}`} />
);

export default function AnalyticsDashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('30D');

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="w-full flex flex-col gap-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24" />)}
        </div>
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  return (
    <PageTransition className="w-full flex flex-col gap-6 pb-12 min-h-screen">
      
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-2">
        <div>
          <h1 className="font-display text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-primary" /> Advanced Analytics
          </h1>
          <p className="text-gray-400 text-sm mt-2">
            Deep dive into your solve mechanics, methodology trends, and AI-identified weaknesses.
          </p>
        </div>
        
        <div className="flex bg-white/5 border border-white/10 p-1 rounded-xl">
          {['7D', '30D', '3M', 'ALL'].map(tf => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={clsx(
                "px-4 py-1.5 rounded-lg text-xs font-bold transition-all",
                timeframe === tf ? "bg-primary/20 text-primary" : "text-gray-500 hover:text-white"
              )}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* Top Row: Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-panel p-6 border-t-2 border-t-primary">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Global Ao100</span>
            <Activity className="w-4 h-4 text-primary" />
          </div>
          <div className="text-3xl font-display font-bold text-white mb-1">12.45<span className="text-lg text-gray-500">s</span></div>
          <p className="text-xs text-emerald-400 flex items-center gap-1"><TrendingDown className="w-3 h-3" /> -0.4s vs last month</p>
        </div>

        <div className="glass-panel p-6 border-t-2 border-t-secondary">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Best Method</span>
            <Zap className="w-4 h-4 text-secondary" />
          </div>
          <div className="text-3xl font-display font-bold text-white mb-1">CFOP</div>
          <p className="text-xs text-gray-400">Yields 15% faster times than Roux</p>
        </div>

        <div className="glass-panel p-6 border-t-2 border-t-tertiary">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Turn Speed (TPS)</span>
            <Target className="w-4 h-4 text-tertiary" />
          </div>
          <div className="text-3xl font-display font-bold text-white mb-1">4.2<span className="text-lg text-gray-500">/s</span></div>
          <p className="text-xs text-emerald-400 flex items-center gap-1"><TrendingDown className="w-3 h-3" style={{transform: 'scaleY(-1)'}}/> +0.3 TPS vs last week</p>
        </div>

        <div className="glass-panel p-6 border-t-2 border-t-orange-500">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Critical Weakness</span>
            <AlertTriangle className="w-4 h-4 text-orange-500" />
          </div>
          <div className="text-3xl font-display font-bold text-white mb-1">F2L<span className="text-lg text-gray-500"> Lookahead</span></div>
          <p className="text-xs text-gray-400">Accounts for 53% of solve time</p>
        </div>
      </div>

      {/* Main Chart: Performance Trend */}
      <div className="glass-panel p-6">
        <h3 className="font-display font-bold text-xl text-white mb-6">Performance Trajectory</h3>
        <div className="w-full h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={performanceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorTime" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorAvg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
              <XAxis dataKey="date" stroke="#4B5563" tick={{ fill: '#9CA3AF', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis stroke="#4B5563" tick={{ fill: '#9CA3AF', fontSize: 12 }} axisLine={false} tickLine={false} domain={['auto', 'auto']} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="time" name="Daily Avg" stroke="#3B82F6" strokeWidth={2} fillOpacity={1} fill="url(#colorTime)" />
              <Area type="monotone" dataKey="movingAvg" name="Ao7 Trend" stroke="#8B5CF6" strokeWidth={3} fillOpacity={1} fill="url(#colorAvg)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Grid: Breakdown & AI */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Phase Split Breakdown */}
        <div className="glass-panel p-6 flex flex-col">
          <h3 className="font-display font-bold text-xl text-white mb-6">Phase Analysis (CFOP)</h3>
          <div className="flex-1 w-full h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={phaseSplits} layout="vertical" margin={{ top: 0, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" horizontal={false} />
                <XAxis type="number" stroke="#4B5563" tick={{ fill: '#9CA3AF', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis dataKey="phase" type="category" stroke="#4B5563" tick={{ fill: '#fff', fontWeight: 'bold' }} axisLine={false} tickLine={false} width={60} />
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }} />
                <Bar dataKey="time" name="Your Avg Time" fill="#3B82F6" radius={[0, 4, 4, 0]}>
                  {phaseSplits.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.time > entry.target ? '#EF4444' : '#3B82F6'} />
                  ))}
                </Bar>
                <Bar dataKey="target" name="Target Time (Sub-12)" fill="#8B5CF6" radius={[0, 4, 4, 0]} opacity={0.5} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex gap-3">
            <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
            <p className="text-sm text-gray-300">
              Your <strong className="text-white">F2L</strong> phase is bleeding time. You are 1.2s behind the target curve for a Sub-12 global average.
            </p>
          </div>
        </div>

        {/* AI Recommendations */}
        <div className="glass-panel p-6 flex flex-col relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-secondary/10 blur-[100px] rounded-full pointer-events-none" />
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-gradient-animated flex items-center justify-center shadow-[0_0_20px_rgba(139,92,246,0.3)]">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-display font-bold text-xl text-white">AI Coach Directives</h3>
                <p className="text-xs text-secondary font-mono tracking-wider">SYSTEM ANALYSIS COMPLETE</p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Insight 1 */}
              <div className="bg-white/5 border border-white/10 p-5 rounded-2xl hover:bg-white/10 transition-colors cursor-pointer group/card">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-white group-hover/card:text-secondary transition-colors">Cross Transition Hesitation</h4>
                  <span className="text-xs font-mono font-bold text-orange-400 bg-orange-400/10 px-2 py-1 rounded">HIGH PRIORITY</span>
                </div>
                <p className="text-sm text-gray-400 leading-relaxed mb-4">
                  Analytics detect an average 0.8s pause between finishing the Cross and executing your first F2L pair. You are not utilizing the 15-second inspection fully.
                </p>
                <button className="text-sm text-secondary font-bold hover:text-white flex items-center gap-1">
                  Launch Blind-Cross Drill &rarr;
                </button>
              </div>

              {/* Insight 2 */}
              <div className="bg-white/5 border border-white/10 p-5 rounded-2xl hover:bg-white/10 transition-colors cursor-pointer group/card">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-white group-hover/card:text-tertiary transition-colors">OLL Algorithmic Inefficiency</h4>
                  <span className="text-xs font-mono font-bold text-tertiary bg-tertiary/10 px-2 py-1 rounded">QUICK FIX</span>
                </div>
                <p className="text-sm text-gray-400 leading-relaxed mb-4">
                  You default to a 2-look OLL approach for the "Dot" cases (OLL 1-4). Learning the 1-look algorithms will instantly shave ~1.1s off your times.
                </p>
                <button className="text-sm text-tertiary font-bold hover:text-white flex items-center gap-1">
                  Open OLL Academy Module &rarr;
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </PageTransition>
  );
}