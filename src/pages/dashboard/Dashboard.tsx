import { useState, useEffect } from 'react';
import { motion, type Variants } from 'framer-motion';
import { 
  Flame, Timer, BrainCircuit, Target, 
  ChevronRight, ArrowDownRight, Activity 
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer 
} from 'recharts';
import { Button } from '@/components/ui/Button';

// --- MOCK DATA ---
const performanceData = [
  { date: 'Mon', time: 14.2 }, { date: 'Tue', time: 13.8 },
  { date: 'Wed', time: 13.5 }, { date: 'Thu', time: 14.0 },
  { date: 'Fri', time: 12.9 }, { date: 'Sat', time: 12.5 },
  { date: 'Sun', time: 12.1 },
];

const recentSolves = [
  { id: 1, time: '11.42s', method: 'CFOP', penalty: 'None', date: '2 mins ago' },
  { id: 2, time: '12.05s', method: 'CFOP', penalty: '+2', date: '15 mins ago' },
  { id: 3, time: '13.11s', method: 'CFOP', penalty: 'None', date: '1 hour ago' },
  { id: 4, time: '12.89s', method: 'CFOP', penalty: 'None', date: '3 hours ago' },
];

// --- ANIMATION VARIANTS ---
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20, filter: 'blur(5px)' },
  visible: { 
    opacity: 1, 
    y: 0, 
    filter: 'blur(0px)',
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } 
  }
};

export default function Dashboard() {
  const [isLoading, setIsLoading] = useState(true);

  // Simulate smooth data fetching
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="w-full h-full flex flex-col gap-6 animate-pulse">
        <div className="h-10 w-48 bg-white/5 rounded-lg mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-32 glass-panel" />)}
        </div>
        <div className="h-96 glass-panel w-full" />
      </div>
    );
  }

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full flex flex-col gap-6 pb-12"
    >
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="font-display text-3xl font-bold text-white tracking-tight">Overview</h1>
          <p className="text-gray-400 text-sm mt-1">Session active. AI tracking enabled.</p>
        </div>
        <Button variant="glow" size="sm" className="hidden sm:flex gap-2">
          <Activity className="w-4 h-4" /> Live Session
        </Button>
      </div>

      {/* --- TOP STATS ROW --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Streak Widget */}
        <motion.div variants={itemVariants} className="glass-panel p-6 flex flex-col justify-between group hover:border-orange-500/30 transition-colors">
          <div className="flex justify-between items-start">
            <div className="w-10 h-10 rounded-xl bg-orange-500/20 text-orange-500 flex items-center justify-center">
              <Flame className="w-5 h-5" />
            </div>
            <span className="text-xs font-medium text-orange-400 bg-orange-500/10 px-2 py-1 rounded-full">Personal Best</span>
          </div>
          <div className="mt-4">
            <h3 className="text-gray-400 text-sm font-medium">Solve Streak</h3>
            <div className="text-3xl font-display font-bold text-white mt-1">14 Days</div>
          </div>
        </motion.div>

        {/* Average Time Widget */}
        <motion.div variants={itemVariants} className="glass-panel p-6 flex flex-col justify-between group hover:border-primary/30 transition-colors">
          <div className="flex justify-between items-start">
            <div className="w-10 h-10 rounded-xl bg-primary/20 text-primary flex items-center justify-center">
              <Timer className="w-5 h-5" />
            </div>
            <span className="flex items-center text-xs font-medium text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full">
              <ArrowDownRight className="w-3 h-3 mr-1" /> 0.8s
            </span>
          </div>
          <div className="mt-4">
            <h3 className="text-gray-400 text-sm font-medium">Global Average (Ao100)</h3>
            <div className="text-3xl font-display font-bold text-white mt-1">12.45<span className="text-lg text-gray-500 ml-1">s</span></div>
          </div>
        </motion.div>

        {/* Daily Challenge */}
        <motion.div variants={itemVariants} className="glass-panel p-6 flex flex-col justify-between lg:col-span-2 relative overflow-hidden group">
          <div className="absolute right-0 top-0 w-64 h-64 bg-secondary/10 blur-[50px] rounded-full pointer-events-none group-hover:bg-secondary/20 transition-colors duration-700" />
          <div className="relative z-10 flex justify-between items-center h-full">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-5 h-5 text-secondary" />
                <h3 className="text-secondary text-sm font-bold tracking-wider uppercase">Daily Challenge</h3>
              </div>
              <div className="text-xl font-display font-bold text-white mb-2">Sub-15s Cross + 1st Pair</div>
              <p className="text-gray-400 text-sm max-w-[200px]">Master your transition speed in today's scenario.</p>
            </div>
            <Button variant="secondary" className="shrink-0 bg-white/5 hover:bg-white/10 border-white/10">
              Start Drill
            </Button>
          </div>
        </motion.div>
      </div>

      {/* --- MIDDLE ROW (Graph & AI Recs) --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Progress Graph */}
        <motion.div variants={itemVariants} className="glass-panel p-6 lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-display font-bold text-lg text-white">Performance Trend</h3>
            <select className="bg-white/5 border border-white/10 rounded-lg text-sm text-gray-300 px-3 py-1 outline-none focus:border-primary">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
              <option>All Time</option>
            </select>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={performanceData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTime" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="date" 
                  stroke="#4B5563" 
                  tick={{ fill: '#9CA3AF', fontSize: 12 }} 
                  axisLine={false} 
                  tickLine={false} 
                />
                <YAxis 
                  stroke="#4B5563" 
                  tick={{ fill: '#9CA3AF', fontSize: 12 }} 
                  axisLine={false} 
                  tickLine={false}
                  domain={['dataMin - 1', 'dataMax + 1']}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(5, 20, 36, 0.8)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }}
                  itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="time" 
                  stroke="#3B82F6" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorTime)" 
                  animationDuration={1500}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* AI Recommendations */}
        <motion.div variants={itemVariants} className="glass-panel p-6 flex flex-col border-primary/20 bg-gradient-to-b from-primary/[0.02] to-transparent">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-lg bg-gradient-animated flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.3)]">
              <BrainCircuit className="w-4 h-4 text-white" />
            </div>
            <h3 className="font-display font-bold text-lg text-white">AI Coach</h3>
          </div>
          
          <div className="flex-1 flex flex-col gap-4">
            <div className="bg-white/5 border border-white/5 rounded-xl p-4 hover:bg-white/10 transition-colors cursor-pointer group">
              <div className="text-sm text-primary font-bold mb-1 group-hover:text-white transition-colors">Lookahead Plateau Detected</div>
              <p className="text-xs text-gray-400 leading-relaxed">Your F2L transitions are averaging +1.2s. Focus on OLL algorithms 21-25 to reduce hesitation.</p>
            </div>
            
            <div className="bg-white/5 border border-white/5 rounded-xl p-4 hover:bg-white/10 transition-colors cursor-pointer group">
              <div className="text-sm text-tertiary font-bold mb-1 group-hover:text-white transition-colors">Cross Optimization</div>
              <p className="text-xs text-gray-400 leading-relaxed">In 3 of your last 5 solves, your cross could have been completed in 6 moves instead of 8.</p>
            </div>
          </div>

          <Button variant="glow" className="w-full mt-4 bg-primary/10">
            View Analysis Hub
          </Button>
        </motion.div>
      </div>

      {/* --- BOTTOM ROW (Recent Solves) --- */}
      <motion.div variants={itemVariants} className="glass-panel p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-display font-bold text-lg text-white">Recent Solves</h3>
          <button className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-1">
            View All <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-xs font-medium text-gray-500 uppercase tracking-wider">
                <th className="pb-3 pl-4">Time</th>
                <th className="pb-3">Method</th>
                <th className="pb-3">Penalty</th>
                <th className="pb-3 text-right pr-4">Date</th>
              </tr>
            </thead>
            <tbody>
              {recentSolves.map((solve) => (
                <tr key={solve.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
                  <td className="py-4 pl-4 font-display font-bold text-white text-lg group-hover:text-primary transition-colors">{solve.time}</td>
                  <td className="py-4 text-sm text-gray-300">{solve.method}</td>
                  <td className="py-4">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${solve.penalty === 'None' ? 'bg-white/5 text-gray-400' : 'bg-red-500/20 text-red-400'}`}>
                      {solve.penalty}
                    </span>
                  </td>
                  <td className="py-4 text-sm text-gray-500 text-right pr-4">{solve.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

    </motion.div>
  );
}