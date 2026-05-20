import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageSquare, Heart, Share2, Trophy, 
  Medal, Users, TrendingUp, Flame, Star, 
  Clock, Award, } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { PageTransition } from '@/components/animations/PageTransition';
import { clsx } from 'clsx';

// --- MOCK SOCIAL DATA ---
const MOCK_POSTS = [
  {
    id: '1',
    type: 'solve',
    author: { name: 'Elena Rostova', handle: '@speedy_elena', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Elena' },
    timeAgo: '2 hours ago',
    content: 'Finally broke the sub-10 barrier! The AI Coach drill on F2L lookahead completely changed my transition speed.',
    solveData: { time: '9.84s', method: 'CFOP', scramble: "R U2 R' U' R U2 L' U R' U' L" },
    likes: 234,
    comments: 45
  },
  {
    id: '2',
    type: 'algorithm',
    author: { name: 'Marcus Chen', handle: '@marcus_cubes', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus' },
    timeAgo: '5 hours ago',
    content: 'Found a much smoother fingertrick for the V-Perm. Try executing the starting R\' U R\' with a pinch grip.',
    solveData: { alg: "R' U R' d' R' F' R2 U' R' U R' F R F", type: 'PLL' },
    likes: 892,
    comments: 112
  },
  {
    id: '3',
    type: 'discussion',
    author: { name: 'Sarah Jenkins', handle: '@s_jenks', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah' },
    timeAgo: '12 hours ago',
    content: 'Is anyone else transitioning from CFOP to Roux? Im struggling with the M-slice speed on the Last 6 Edges. Any tips?',
    likes: 56,
    comments: 89
  }
];

const MOCK_ACHIEVEMENTS = [
  { id: 'a1', title: 'Sub-15 Club', desc: 'Achieve a verified Ao5 under 15 seconds.', rarity: 'epic', icon: Timer, date: 'Mar 12, 2024' },
  { id: 'a2', title: 'Flawless Week', desc: 'Maintain a 7-day practice streak.', rarity: 'rare', icon: Flame, date: 'Apr 02, 2024' },
  { id: 'a3', title: 'OLL Master', desc: 'Learn all 57 OLL algorithms.', rarity: 'legendary', icon: Brain, date: 'May 14, 2024' },
  { id: 'a4', title: 'First Scan', desc: 'Successfully digitize a physical cube.', rarity: 'common', icon: Scan, date: 'Jan 05, 2024' },
];

// --- HELPER COMPONENTS ---
function Timer(props: any) { return <Clock {...props} />; }
function Brain(props: any) { return <Star {...props} />; }
function Scan(props: any) { return <Trophy {...props} />; }

const RarityColors = {
  common: 'text-gray-400 bg-gray-500/10 border-gray-500/20',
  rare: 'text-primary bg-primary/10 border-primary/20 shadow-[0_0_15px_rgba(59,130,246,0.15)]',
  epic: 'text-secondary bg-secondary/10 border-secondary/20 shadow-[0_0_15px_rgba(139,92,246,0.15)]',
  legendary: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20 shadow-[0_0_20px_rgba(234,179,8,0.2)]'
};

export default function CommunityHub() {
  const [activeTab, setActiveTab] = useState<'feed' | 'profile'>('feed');

  return (
    <PageTransition className="w-full flex flex-col gap-6 pb-12 min-h-screen">
      
      {/* Header Context */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-2">
        <div>
          <h1 className="font-display text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            <Users className="w-8 h-8 text-primary" /> Cubora Network
          </h1>
          <p className="text-gray-400 text-sm mt-2">
            Connect with speedcubers, share verified times, and discover new algorithms.
          </p>
        </div>
        
        {/* Navigation Tabs */}
        <div className="flex bg-white/5 border border-white/10 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('feed')}
            className={clsx(
              "px-6 py-2 rounded-lg text-sm font-bold transition-all",
              activeTab === 'feed' ? "bg-primary/20 text-primary" : "text-gray-500 hover:text-white"
            )}
          >
            Global Feed
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={clsx(
              "px-6 py-2 rounded-lg text-sm font-bold transition-all",
              activeTab === 'profile' ? "bg-primary/20 text-primary" : "text-gray-500 hover:text-white"
            )}
          >
            My Profile
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'feed' ? (
          /* ================= GLOBAL FEED TAB ================= */
          <motion.div 
            key="feed"
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            {/* Left Column: Post Feed */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              
              {/* Create Post Input */}
              <div className="glass-panel p-4 flex gap-4 items-start">
                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Cubora" alt="Me" className="w-10 h-10 rounded-full border border-white/10 bg-surface" />
                <div className="flex-1">
                  <textarea 
                    placeholder="Share a solve, algorithm, or thought..."
                    className="w-full bg-transparent text-white placeholder:text-gray-500 outline-none resize-none min-h-[60px] text-sm"
                  />
                  <div className="flex justify-between items-center border-t border-white/5 pt-3 mt-2">
                    <div className="flex gap-2">
                      <button className="text-xs font-bold text-gray-400 hover:text-primary transition-colors flex items-center gap-1 bg-white/5 px-3 py-1.5 rounded-lg">
                        <Clock className="w-3 h-3" /> Attach Solve
                      </button>
                      <button className="text-xs font-bold text-gray-400 hover:text-secondary transition-colors flex items-center gap-1 bg-white/5 px-3 py-1.5 rounded-lg">
                        <Share2 className="w-3 h-3" /> Share Alg
                      </button>
                    </div>
                    <Button variant="glow" size="sm">Post</Button>
                  </div>
                </div>
              </div>

              {/* Feed Stream */}
              <div className="flex flex-col gap-4">
                {MOCK_POSTS.map((post) => (
                  <div key={post.id} className="glass-panel p-6 flex flex-col">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <img src={post.author.avatar} alt={post.author.name} loading="lazy" className="w-10 h-10 rounded-full border border-white/10 bg-surface-bright" />
                        <div>
                          <h4 className="font-bold text-white text-sm">{post.author.name}</h4>
                          <span className="text-xs text-gray-500 font-mono">{post.author.handle} • {post.timeAgo}</span>
                        </div>
                      </div>
                      {post.type === 'solve' && <span className="text-[10px] font-bold uppercase tracking-widest text-primary bg-primary/10 border border-primary/20 px-2 py-1 rounded">Verified Solve</span>}
                      {post.type === 'algorithm' && <span className="text-[10px] font-bold uppercase tracking-widest text-secondary bg-secondary/10 border border-secondary/20 px-2 py-1 rounded">Algorithm</span>}
                    </div>

                    <p className="text-gray-300 text-sm leading-relaxed mb-4">{post.content}</p>

                    {/* Rich Data Attachments */}
                    {post.type === 'solve' && post.solveData && (
                      <div className="bg-background/50 border border-white/10 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center border border-primary/30 shadow-[0_0_15px_rgba(59,130,246,0.2)]">
                            <span className="font-display font-bold text-lg text-primary">{post.solveData.time}</span>
                          </div>
                          <div>
                            <span className="text-xs font-bold text-gray-400 block mb-1">{post.solveData.method} Method</span>
                            <span className="text-xs font-mono text-gray-500 block truncate max-w-[200px]">{post.solveData.scramble}</span>
                          </div>
                        </div>
                        <Button variant="secondary" size="sm" className="w-full sm:w-auto">Play 3D Replay</Button>
                      </div>
                    )}

                    {post.type === 'algorithm' && post.solveData && (
                      <div className="bg-background/50 border border-white/10 rounded-xl p-4 mb-4">
                        <span className="text-xs font-bold text-gray-400 block mb-2">{post.solveData.type} Case</span>
                        <div className="flex justify-between items-center">
                          <code className="text-white font-mono font-bold tracking-wider">{post.solveData.alg}</code>
                          <button className="text-xs text-secondary hover:text-white transition-colors font-bold">Copy</button>
                        </div>
                      </div>
                    )}

                    {/* Engagement Bar */}
                    <div className="flex items-center gap-6 mt-2 pt-4 border-t border-white/5">
                      <button className="flex items-center gap-2 text-gray-400 hover:text-red-400 transition-colors group">
                        <Heart className="w-4 h-4 group-hover:fill-current" /> <span className="text-xs font-bold">{post.likes}</span>
                      </button>
                      <button className="flex items-center gap-2 text-gray-400 hover:text-primary transition-colors">
                        <MessageSquare className="w-4 h-4" /> <span className="text-xs font-bold">{post.comments}</span>
                      </button>
                      <button className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors ml-auto">
                        <Share2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: Trending & Leaderboards */}
            <div className="flex flex-col gap-6">
              
              {/* Leaderboard Snippet */}
              <div className="glass-panel p-6">
                <div className="flex items-center gap-2 mb-6">
                  <TrendingUp className="w-5 h-5 text-tertiary" />
                  <h3 className="font-display font-bold text-white text-lg">Top Solvers (Ao100)</h3>
                </div>
                
                <div className="space-y-4">
                  {[
                    { rank: 1, name: 'Max Park', time: '5.21s' },
                    { rank: 2, name: 'Tymon Kolasiński', time: '5.43s' },
                    { rank: 3, name: 'Ruihang Xu', time: '5.62s' }
                  ].map(user => (
                    <div key={user.rank} className="flex items-center justify-between group cursor-pointer">
                      <div className="flex items-center gap-3">
                        <span className={clsx(
                          "w-6 h-6 rounded flex items-center justify-center text-xs font-bold font-mono",
                          user.rank === 1 ? "bg-yellow-500/20 text-yellow-500" :
                          user.rank === 2 ? "bg-gray-300/20 text-gray-300" :
                          user.rank === 3 ? "bg-orange-600/20 text-orange-500" : "bg-white/5 text-gray-500"
                        )}>{user.rank}</span>
                        <span className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">{user.name}</span>
                      </div>
                      <span className="font-mono font-bold text-primary">{user.time}</span>
                    </div>
                  ))}
                </div>
                <button className="w-full mt-6 py-2 text-xs font-bold text-gray-400 hover:text-white bg-white/5 rounded-lg transition-colors">
                  View Global Leaderboard
                </button>
              </div>

              {/* Active Challenges */}
              <div className="glass-panel p-6 border-secondary/20">
                <h3 className="font-display font-bold text-white text-lg mb-4">Community Challenge</h3>
                <div className="bg-secondary/10 border border-secondary/20 rounded-xl p-4">
                  <h4 className="font-bold text-secondary text-sm mb-1">Roux Transition Week</h4>
                  <p className="text-xs text-gray-400 mb-4">Complete 50 verified solves using the Roux method.</p>
                  <div className="w-full h-1.5 bg-background rounded-full overflow-hidden mb-2">
                    <div className="h-full bg-secondary w-[40%]" />
                  </div>
                  <span className="text-xs font-mono text-gray-400">20 / 50 Solves</span>
                </div>
              </div>

            </div>
          </motion.div>

        ) : (
          /* ================= PUBLIC PROFILE TAB ================= */
          <motion.div 
            key="profile"
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            className="flex flex-col gap-8"
          >
            {/* Profile Header Card */}
            <div className="glass-panel p-0 relative overflow-hidden">
              {/* Banner */}
              <div className="h-32 w-full bg-gradient-to-r from-primary/20 via-secondary/20 to-tertiary/20" />
              
              <div className="px-8 pb-8">
                {/* Avatar & Edit */}
                <div className="flex justify-between items-end -mt-12 mb-6">
                  <div className="w-24 h-24 rounded-2xl bg-surface border-4 border-background p-1 relative z-10 shadow-xl">
                    <img loading="lazy" src="https://api.dicebear.com/7.x/avataaars/svg?seed=Cubora" alt="Profile" className="w-full h-full rounded-xl bg-white/5" />
                  </div>
                  <Button variant="secondary" size="sm">Edit Profile</Button>
                </div>

                {/* Info */}
                <div className="mb-8">
                  <h2 className="font-display text-3xl font-bold text-white flex items-center gap-2">
                    Antony Jacob <Medal className="w-5 h-5 text-yellow-500" />
                  </h2>
                  <p className="text-gray-400 font-mono text-sm">@antony_j • Speedcuber • Joined Jan 2024</p>
                </div>

                {/* Profile Stats Row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-1">Global Rank</span>
                    <span className="font-display font-bold text-2xl text-white">#4,201</span>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-1">Official PB</span>
                    <span className="font-display font-bold text-2xl text-primary">11.42s</span>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-1">Total Solves</span>
                    <span className="font-display font-bold text-2xl text-white">8,492</span>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-1">Followers</span>
                    <span className="font-display font-bold text-2xl text-white">124</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Achievements Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display font-bold text-xl text-white flex items-center gap-2">
                  <Award className="w-5 h-5 text-tertiary" /> Trophy Case
                </h3>
                <span className="text-sm font-mono text-gray-500">14 Unlocked</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {MOCK_ACHIEVEMENTS.map((achievement) => (
                  <div 
                    key={achievement.id} 
                    className={clsx(
                      "p-5 rounded-2xl border flex flex-col items-center text-center relative overflow-hidden group hover:scale-105 transition-transform cursor-pointer",
                      RarityColors[achievement.rarity as keyof typeof RarityColors]
                    )}
                  >
                    <achievement.icon className="w-10 h-10 mb-3 opacity-90 group-hover:scale-110 transition-transform" />
                    <h4 className="font-bold text-white text-sm mb-1 relative z-10">{achievement.title}</h4>
                    <p className="text-xs opacity-70 mb-4 relative z-10">{achievement.desc}</p>
                    <span className="text-[10px] font-mono font-bold opacity-50 mt-auto">{achievement.date}</span>
                  </div>
                ))}
              </div>
            </div>
            
          </motion.div>
        )}
      </AnimatePresence>
    </PageTransition>
  );
}