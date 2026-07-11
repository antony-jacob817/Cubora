import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MessageSquare, Heart, Share2, Trophy, Edit2,
    Medal, TrendingUp, Flame, Star,
    Clock, Award, Loader2, X, User, Target, Timer
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { PageTransition } from '@/components/animations/PageTransition';
import { useAuth } from '@/context/AuthContext';
import { clsx } from 'clsx';

const TierStyles: Record<string, string> = {
    locked: 'border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/[0.01] opacity-40 grayscale',
    bronze: 'text-[#CD7F32] bg-[#CD7F32]/5 border-[#CD7F32]/30 shadow-[0_0_15px_rgba(205,127,50,0.1)]',
    silver: 'text-slate-400 bg-slate-400/5 border-slate-400/30 shadow-[0_0_15px_rgba(148,163,184,0.1)]',
    gold: 'text-yellow-500 bg-yellow-500/5 border-yellow-500/30 shadow-[0_0_15px_rgba(234,179,8,0.15)]',
    emerald: 'text-emerald-400 bg-emerald-400/5 border-emerald-400/30 shadow-[0_0_15px_rgba(52,211,153,0.15)]',
    diamond: 'text-cyan-400 bg-cyan-400/5 border-cyan-400/30 shadow-[0_0_20px_rgba(34,211,238,0.2)]',
    ruby: 'text-rose-500 bg-rose-500/5 border-rose-500/30 shadow-[0_0_25px_rgba(244,63,94,0.25)]'
};

const TierBadgeColors: Record<string, string> = {
    bronze: 'text-[#CD7F32] bg-[#CD7F32]/10',
    silver: 'text-slate-400 bg-slate-400/10',
    gold: 'text-yellow-500 bg-yellow-500/10',
    emerald: 'text-emerald-400 bg-emerald-400/10',
    diamond: 'text-cyan-400 bg-cyan-400/10',
    ruby: 'text-rose-500 bg-rose-500/10'
};

const ICON_MAP: Record<string, any> = {
    'Trophy': Trophy,
    'Flame': Flame,
    'Sparkles': Star,
    'Zap': Flame,
    'Target': Clock,
    'Check': CheckCircle2,
    'Crown': Award,
    'Award': Award
};

// Simple stub for CheckCircle2 if not imported directly
import { CheckCircle2 } from 'lucide-react';

const AVATAR_PRESETS = [
    '/Avatars/Cosmic Churn.png',
    '/Avatars/Cube Guru.png',
    '/Avatars/Cyber Scout.png',
    '/Avatars/Guide Bot.png',
    '/Avatars/Logic Buddy.png',
    '/Avatars/Pixel Pal.png',
    '/Avatars/Star Cuber.png',
    '/Avatars/Swift Spark.png'
];

interface CommunityPost {
    _id: string;
    content: string;
    type: 'solve' | 'algorithm' | 'discussion';
    author: { _id: string; name: string; handle: string; avatar: string };
    solveData?: { time?: string; method?: string; scramble?: string; alg?: string; algType?: string };
    likes: number;
    isLikedByMe: boolean;
    timeAgo: string;
}

interface AchievementData {
    id: string;
    title: string;
    description: string;
    icon: string;
    category: string;
    isUnlocked: boolean;
    currentTier?: string;
    isMaxed?: boolean;
    unlockedAt: string | null;
    progress: number;
    progressTarget: number;
}

// Helper function to calculate relative join date
const getRelativeJoinDate = (dateString?: string) => {
    if (!dateString) return 'Recently';
    const joinedDate = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - joinedDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const diffMonths = Math.floor(diffDays / 30);
    const diffYears = Math.floor(diffDays / 365);

    if (diffYears > 0) return `${diffYears} year${diffYears > 1 ? 's' : ''} ago`;
    if (diffMonths > 0) return `${diffMonths} month${diffMonths > 1 ? 's' : ''} ago`;
    if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return 'Today';
};

export default function CommunityHub() {
    const { user, getAuthHeaders, refetchUser } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [activeTab, setActiveTab] = useState<'feed' | 'profile'>('feed');

    // Feed state
    const [posts, setPosts] = useState<CommunityPost[]>([]);
    const [isLoadingFeed, setIsLoadingFeed] = useState(true);
    const [newPostContent, setNewPostContent] = useState('');
    const [isPosting, setIsPosting] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Profile Identity Modal State
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [editName, setEditName] = useState('');
    const [editAbout, setEditAbout] = useState('');
    const [editAvatar, setEditAvatar] = useState('');
    const [isSavingProfile, setIsSavingProfile] = useState(false);
    const [profileError, setProfileError] = useState<string | null>(null);

    // Profile state
    const [profileStats, setProfileStats] = useState<{
        pb: number | null;
        globalAverage: number | null;
        totalSolves: number;
        streak: number;
    } | null>(null);
    const [achievements, setAchievements] = useState<AchievementData[]>([]);
    const [isLoadingProfile, setIsLoadingProfile] = useState(false);

    // Prefill shared PB from Dashboard
    useEffect(() => {
        if (location.state?.sharePb) {
            setNewPostContent(`I just hit a new Personal Best of ${location.state.sharePb}s on Cubora! 🚀🔥`);
            setActiveTab('feed');
        }
    }, [location.state]);

    // Populate Modal with current user data when opened
    useEffect(() => {
        if (isProfileModalOpen && user) {
            // Default to user.name, fallback to user.email
            setEditName(user.name || user.email || '');
            setEditAvatar(user.avatar || AVATAR_PRESETS[0]);
            setEditAbout((user as any).about || '');
            setProfileError(null);
        }
    }, [isProfileModalOpen, user]);

    // --- FETCH COMMUNITY FEED ---
    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const res = await fetch('http://localhost:5000/api/community', { headers: getAuthHeaders() });
                const data = await res.json();
                if (data.success) setPosts(data.data);
            } catch (err) {
                console.error('Failed to load community feed:', err);
            } finally {
                setIsLoadingFeed(false);
            }
        };
        fetchPosts();
    }, []);

    // --- FETCH PROFILE DATA ---
    useEffect(() => {
        if (activeTab !== 'profile' || profileStats) return;
        setIsLoadingProfile(true);

        const fetchProfile = async () => {
            try {
                const headers = getAuthHeaders();
                const [statsRes, achievRes, solvesRes] = await Promise.all([
                    fetch('http://localhost:5000/api/solves/stats', { headers }),
                    fetch('http://localhost:5000/api/achievements', { headers }),
                    fetch('http://localhost:5000/api/solves', { headers }),
                ]);

                const statsData = await statsRes.json();
                const achievData = await achievRes.json();
                const solvesData = await solvesRes.json();

                if (statsData.success) {
                    setProfileStats({
                        pb: statsData.stats.pb,
                        globalAverage: statsData.stats.globalAverage,
                        totalSolves: solvesData.success ? (solvesData.count || solvesData.data?.length || 0) : 0,
                        streak: statsData.stats.streak,
                    });
                }
                if (achievData.success) {
                    setAchievements(achievData.data);
                }
            } catch (err) {
                console.error('Failed to load profile data:', err);
            } finally {
                setIsLoadingProfile(false);
            }
        };
        fetchProfile();
    }, [activeTab]);

    // --- CREATE POST ---
    const handleCreatePost = async () => {
        if (!newPostContent.trim() || isPosting) return;
        setIsPosting(true);
        try {
            const isSharePb = location.state?.sharePb && newPostContent.includes(location.state.sharePb);
            const res = await fetch('http://localhost:5000/api/community', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
                body: JSON.stringify({ 
                    content: newPostContent.trim(), 
                    type: isSharePb ? 'solve' : 'discussion',
                    solveData: isSharePb ? { time: location.state.sharePb, method: 'CFOP' } : undefined
                }),
            });
            const data = await res.json();
            if (data.success) {
                setPosts(prev => [data.data, ...prev]);
                setNewPostContent('');
                if (textareaRef.current) textareaRef.current.style.height = 'auto';
                navigate('/community', { replace: true, state: {} });
            }
        } catch (err) {
            console.error('Failed to create post:', err);
        } finally {
            setIsPosting(false);
        }
    };

    // --- UPDATE PROFILE IDENTITY ---
    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editName.trim()) {
            setProfileError('Username cannot be empty.');
            return;
        }

        setIsSavingProfile(true);
        setProfileError(null);

        try {
            const res = await fetch('http://localhost:5000/api/auth/updatedetails', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
                body: JSON.stringify({ 
                    name: editName.trim(), 
                    avatar: editAvatar,
                    about: editAbout.trim() 
                }),
            });
            const data = await res.json();
            
            if (data.success) {
                if (refetchUser) await refetchUser();
                setIsProfileModalOpen(false);
            } else {
                setProfileError(data.error || 'Failed to update profile. The username might already be taken.');
            }
        } catch (err) {
            console.error('Failed to update profile:', err);
            setProfileError('A network error occurred. Please try again.');
        } finally {
            setIsSavingProfile(false);
        }
    };

    // --- TOGGLE LIKE ---
    const handleToggleLike = async (postId: string) => {
        setPosts(prev => prev.map(p => {
            if (p._id === postId) {
                return {
                    ...p,
                    isLikedByMe: !p.isLikedByMe,
                    likes: p.isLikedByMe ? p.likes - 1 : p.likes + 1,
                };
            }
            return p;
        }));

        try {
            await fetch(`http://localhost:5000/api/community/${postId}/like`, {
                method: 'PUT',
                headers: getAuthHeaders(),
            });
        } catch (err) {
            setPosts(prev => prev.map(p => {
                if (p._id === postId) {
                    return {
                        ...p,
                        isLikedByMe: !p.isLikedByMe,
                        likes: p.isLikedByMe ? p.likes - 1 : p.likes + 1,
                    };
                }
                return p;
            }));
        }
    };

    // Use email as fallback for display name
    const displayUsername = user?.name || user?.email || 'Cubora User';

    return (
        <PageTransition className="w-full flex flex-col gap-5 sm:gap-6 pb-12 min-h-screen px-1 sm:px-0 text-left">

            {/* Header Context Controls */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-1">
                <div>
                    <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5 sm:gap-3">
                        <MessageSquare className="w-7 h-7 sm:w-8 sm:h-8 text-primary shrink-0" /> Cubora Network
                    </h1>
                    <p className="text-slate-500 dark:text-gray-400 text-xs sm:text-sm mt-1 leading-relaxed">
                        Connect with speedcubers, share verified times, and discover new algorithms.
                    </p>
                </div>

                {/* Navigation Control Tabs */}
                <div className="flex w-full md:w-auto bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 p-1 rounded-xl shrink-0 max-w-full">
                    {(['feed', 'profile'] as const).map((tab) => {
                        const isActive = activeTab === tab;
                        return (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={clsx(
                                    "relative flex-1 md:flex-none px-4 sm:px-6 py-2 rounded-lg text-xs font-bold transition-colors text-center min-h-[36px] z-10",
                                    isActive ? "text-primary" : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                                )}
                            >
                                {/* Sliding Framer Motion Border */}
                                {isActive && (
                                    <motion.div
                                        layoutId="activeCommunityTab"
                                        className="absolute inset-0 bg-primary/10 border border-primary/30 shadow-sm rounded-lg z-[-1]"
                                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                    />
                                )}
                                <span className="relative z-10">
                                    {tab === 'feed' ? 'Global Feed' : 'My Profile'}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>

            <AnimatePresence mode="wait">
                {activeTab === 'feed' ? (
                    /* ================= GLOBAL FEED STREAM TAB ================= */
                    <motion.div
                        key="feed"
                        initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 15 }}
                        className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6 w-full"
                    >
                        {/* Left Column Feed Node Feed Panel */}
                        <div className="lg:col-span-2 flex flex-col gap-5 sm:gap-6 w-full">

                            {/* Post Creation Area Dashboard */}
                            <div className="glass-panel p-4 flex gap-3.5 items-start w-full">
                                <img
                                    src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user?.name || 'Cubora')}`}
                                    alt="Me"
                                    className="w-9 h-9 rounded-full border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-slate-800 object-cover shrink-0 mt-0.5"
                                />
                                <div className="flex-1 min-w-0 w-full">
                                    <textarea
                                        ref={textareaRef}
                                        value={newPostContent}
                                        onChange={(e) => setNewPostContent(e.target.value)}
                                        placeholder="Share a solve, algorithm, or thought..."
                                        className="w-full bg-transparent text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-gray-500 outline-none resize-none min-h-[64px] text-sm leading-relaxed"
                                        onInput={(e) => {
                                            const target = e.target as HTMLTextAreaElement;
                                            target.style.height = 'auto';
                                            target.style.height = target.scrollHeight + 'px';
                                        }}
                                    />
                                    <div className="flex flex-col sm:flex-row gap-3.5 sm:items-center sm:justify-between border-t border-slate-200 dark:border-white/5 pt-3.5 mt-2 w-full">
                                        <div className="flex gap-2 w-full sm:w-auto">
                                            <button className="flex-1 sm:flex-none text-[10px] font-bold text-slate-500 dark:text-gray-400 hover:text-primary transition-colors flex items-center justify-center gap-1.5 bg-slate-100 dark:bg-white/5 px-2.5 py-2 rounded-lg min-h-[38px] sm:min-h-0 uppercase tracking-wider">
                                                <Clock className="w-3.5 h-3.5" /> Attach Solve
                                            </button>
                                            <button className="flex-1 sm:flex-none text-[10px] font-bold text-slate-500 dark:text-gray-400 hover:text-secondary transition-colors flex items-center justify-center gap-1.5 bg-slate-100 dark:bg-white/5 px-2.5 py-2 rounded-lg min-h-[38px] sm:min-h-0 uppercase tracking-wider">
                                                <Share2 className="w-3.5 h-3.5" /> Share Alg
                                            </button>
                                        </div>
                                        <Button
                                            variant="glow"
                                            size="sm"
                                            onClick={handleCreatePost}
                                            disabled={!newPostContent.trim() || isPosting}
                                            className="w-full sm:w-auto h-9 min-h-[36px] text-xs font-bold uppercase tracking-wider justify-center"
                                        >
                                            {isPosting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Post'}
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            {/* Feed Content Stream */}
                            <div className="flex flex-col gap-4 w-full">
                                {isLoadingFeed ? (
                                    <div className="flex flex-col items-center justify-center py-16 text-slate-500 w-full text-center">
                                        <Loader2 className="w-7 h-7 animate-spin text-primary mb-3" />
                                        <span className="text-xs font-medium">Loading feed...</span>
                                    </div>
                                ) : posts.length === 0 ? (
                                    <div className="glass-panel p-8 sm:p-12 text-center w-full">
                                        <MessageSquare className="w-10 h-10 text-slate-400 dark:text-gray-600 mx-auto mb-4" />
                                        <h3 className="text-slate-900 dark:text-white font-bold text-base sm:text-lg mb-1.5">No posts yet</h3>
                                        <p className="text-slate-500 dark:text-gray-400 text-xs sm:text-sm leading-relaxed">Be the first to share something with the Cubora community!</p>
                                    </div>
                                ) : (
                                    posts.map((post) => (
                                        <div key={post._id} className="glass-panel p-4 sm:p-6 flex flex-col bg-white/40 dark:bg-white/[0.01] w-full">
                                            <div className="flex justify-between items-start gap-4 mb-3.5 w-full">
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <img src={post.author.avatar} alt={post.author.name} loading="lazy" className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-slate-900 shrink-0 object-cover" />
                                                    <div className="min-w-0">
                                                        <h4 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm truncate leading-snug">{post.author.name}</h4>
                                                        <span className="text-[11px] text-slate-400 dark:text-gray-500 font-mono block truncate mt-0.5">{post.author.handle} • {post.timeAgo}</span>
                                                    </div>
                                                </div>
                                                {post.type === 'solve' && <span className="text-[9px] font-bold uppercase tracking-widest text-primary bg-primary/5 dark:bg-primary/10 border border-primary/20 px-2 py-0.5 rounded shrink-0">Verified</span>}
                                                {post.type === 'algorithm' && <span className="text-[9px] font-bold uppercase tracking-widest text-secondary bg-secondary/5 dark:bg-secondary/10 border border-secondary/20 px-2 py-0.5 rounded shrink-0">Alg</span>}
                                            </div>

                                            <p className="text-slate-700 dark:text-gray-300 text-xs sm:text-sm leading-relaxed mb-4 whitespace-pre-wrap break-words w-full">{post.content}</p>

                                            {/* Rich Data Feed Attachments Layout Row */}
                                            {post.type === 'solve' && post.solveData?.time && (
                                                <div className="bg-white/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 mb-4 w-full overflow-hidden">
                                                    <div className="flex items-center gap-3.5 min-w-0 w-full">
                                                        <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-lg bg-primary/20 flex items-center justify-center border border-primary/30 shadow-[0_0_15px_rgba(59,130,246,0.15)] shrink-0">
                                                            <span className="font-display font-bold text-base sm:text-lg text-primary">{post.solveData.time}</span>
                                                        </div>
                                                        <div className="min-w-0 flex-1">
                                                            <span className="text-[11px] font-bold text-slate-500 dark:text-gray-400 block leading-none mb-1.5">{post.solveData.method || 'CFOP'} Method</span>
                                                            <span className="text-xs font-mono text-slate-400 dark:text-gray-500 block truncate max-w-full select-all" title={post.solveData.scramble}>{post.solveData.scramble}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {post.type === 'algorithm' && post.solveData?.alg && (
                                                <div className="bg-white/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-3.5 mb-4 w-full overflow-hidden">
                                                    <span className="text-[10px] font-bold text-slate-500 dark:text-gray-400 block leading-none mb-2 uppercase tracking-wide">{post.solveData.algType || 'Algorithm'}</span>
                                                    <code className="text-slate-900 dark:text-white font-mono font-bold tracking-wider text-xs sm:text-sm block break-all select-all">{post.solveData.alg}</code>
                                                </div>
                                            )}

                                            {/* Social Action Engagement Bar */}
                                            <div className="flex items-center gap-5 sm:gap-6 mt-1 pt-3.5 border-t border-slate-200 dark:border-white/5 w-full">
                                                <button
                                                    onClick={() => handleToggleLike(post._id)}
                                                    className={clsx(
                                                        "flex items-center gap-1.5 transition-colors group min-h-[32px] px-1",
                                                        post.isLikedByMe ? "text-red-400" : "text-slate-500 dark:text-gray-400 sm:hover:text-red-400"
                                                    )}
                                                >
                                                    <Heart className={clsx("w-4 h-4 shrink-0", post.isLikedByMe && "fill-current")} />
                                                    <span className="text-xs font-bold font-mono">{post.likes}</span>
                                                </button>
                                                <button className="flex items-center gap-1.5 text-slate-500 dark:text-gray-400 sm:hover:text-primary transition-colors min-h-[32px] px-1">
                                                    <MessageSquare className="w-4 h-4 shrink-0" /> <span className="text-xs font-bold font-mono">0</span>
                                                </button>
                                                <button className="flex items-center gap-1.5 text-slate-500 dark:text-gray-400 sm:hover:text-slate-900 dark:sm:hover:text-white ml-auto min-h-[32px] px-1" aria-label="Share post link">
                                                    <Share2 className="w-4 h-4 shrink-0" />
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Right Column Grid Panel: Leaderboard & Tracking Widget */}
                        <div className="flex flex-col gap-5 sm:gap-6 w-full">

                            {/* Top Solvers Lead Rank Widget Card */}
                            <div className="glass-panel p-5 sm:p-6 w-full text-left">
                                <div className="flex items-center gap-2 mb-5 w-full">
                                    <TrendingUp className="w-4 h-4 sm:w-5 h-5 text-tertiary shrink-0" />
                                    <h3 className="font-display font-bold text-slate-900 dark:text-white text-base sm:text-lg">Top Solvers (Ao100)</h3>
                                </div>

                                <div className="space-y-3.5 w-full">
                                    {[
                                        { rank: 1, name: 'Max Park', time: '5.21s' },
                                        { rank: 2, name: 'Tymon Kolasiński', time: '5.43s' },
                                        { rank: 3, name: 'Ruihang Xu', time: '5.62s' }
                                    ].map(lbUser => (
                                        <div key={lbUser.rank} className="flex items-center justify-between group cursor-pointer w-full">
                                            <div className="flex items-center gap-3 min-w-0">
                                                <span className={clsx(
                                                    "w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold font-mono shrink-0",
                                                    lbUser.rank === 1 ? "bg-yellow-500/20 text-yellow-500" :
                                                        lbUser.rank === 2 ? "bg-gray-300/20 text-gray-400" :
                                                            lbUser.rank === 3 ? "bg-orange-600/20 text-orange-500" : "bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-gray-500"
                                                )}>{lbUser.rank}</span>
                                                <span className="text-xs sm:text-sm font-medium text-slate-650 sm:group-hover:text-slate-900 dark:text-gray-300 sm:dark:group-hover:text-white transition-colors truncate">{lbUser.name}</span>
                                            </div>
                                            <span className="font-mono font-bold text-primary text-xs sm:text-sm shrink-0 pl-2">{lbUser.time}</span>
                                        </div>
                                    ))}
                                </div>
                                <button className="w-full mt-5 py-2.5 text-xs font-bold text-slate-500 sm:hover:text-slate-900 dark:text-gray-400 sm:dark:hover:text-white bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-transparent rounded-lg transition-colors min-h-[38px] uppercase tracking-wider">
                                    Global Leaderboard
                                </button>
                            </div>

                            {/* Active Sub-Challenges Framework */}
                            <div className="glass-panel p-5 sm:p-6 border-secondary/20 w-full text-left">
                                <h3 className="font-display font-bold text-slate-900 dark:text-white text-base sm:text-lg mb-4">Community Challenge</h3>
                                <div className="bg-secondary/5 dark:bg-secondary/10 border border-secondary/20 rounded-xl p-4 w-full">
                                    <h4 className="font-bold text-secondary text-xs sm:text-sm mb-0.5 uppercase tracking-wide">Roux Transition Week</h4>
                                    <p className="text-xs text-slate-500 dark:text-gray-400 mb-4 leading-normal">Complete 50 verified solves using the Roux method.</p>
                                    <div className="w-full h-1.5 bg-slate-200/40 dark:bg-background rounded-full overflow-hidden mb-2">
                                        <div className="h-full bg-secondary w-[40%] transition-all" />
                                    </div>
                                    <span className="text-[11px] font-mono font-bold text-slate-500 dark:text-gray-400">20 / 50 Solves</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                ) : (
                    /* ================= PUBLIC PERSONAL PROFILE TAB ================= */
                    <motion.div
                        key="profile"
                        initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -15 }}
                        className="flex flex-col gap-5 sm:gap-6 w-full"
                    >
                        {isLoadingProfile ? (
                            <div className="flex flex-col items-center justify-center py-24 text-slate-500 w-full text-center">
                                <Loader2 className="w-8 h-8 animate-spin text-primary mb-3" />
                                <span className="text-xs font-medium">Loading profile...</span>
                            </div>
                        ) : (
                            <>
                                {/* Profile Banner & Info Header Card Layout */}
                                <div className="glass-panel p-0 relative overflow-hidden bg-white/30 dark:bg-white/[0.01] w-full text-left">
                                    {/* Backdrop Header Canvas Decor */}
                                    <div className="h-24 sm:h-32 w-full bg-gradient-to-r from-primary/15 via-secondary/15 to-tertiary/15" />

                                    <div className="px-4 sm:px-8 pb-5 sm:pb-8 w-full">
                                        {/* Floating Avatar & Settings Link */}
                                        <div className="flex justify-between items-end -mt-8 sm:-mt-12 mb-5 sm:mb-6 w-full">
                                            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-slate-100 dark:bg-[#111315] border-4 border-slate-100 dark:border-[#111315] p-0.5 relative z-10 shadow-xl overflow-hidden shrink-0">
                                                <img
                                                    loading="lazy"
                                                    src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user?.name || 'Cubora')}`}
                                                    alt="Profile"
                                                    className="w-full h-full rounded-xl bg-slate-50 dark:bg-white/5 object-cover"
                                                />
                                            </div>
                                            <Button variant="secondary" size="sm" className="gap-1.5 min-h-[44px] sm:min-h-[32px] px-4 sm:px-3 ml-8" onClick={() => setIsProfileModalOpen(true)}>
                                                <Edit2 className="w-3.5 h-3.5" /> Edit Profile
                                            </Button>
                                        </div>

                                        {/* Bio Identity Summary */}
                                        <div className="mb-6 sm:mb-8 w-full">
                                            <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2 tracking-tight">
                                                {displayUsername} <Medal className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500 animate-pulse shrink-0" />
                                            </h2>
                                            <p className="text-slate-500 dark:text-gray-400 font-mono text-xs sm:text-sm mt-1">
                                                Joined {getRelativeJoinDate(user?.createdAt)}
                                            </p>
                                            {(user as any)?.about && (
                                                <p className="text-sm text-slate-600 dark:text-gray-300 mt-3 leading-relaxed max-w-3xl whitespace-pre-wrap break-words">
                                                    {(user as any).about}
                                                </p>
                                            )}
                                        </div>

                                        {/* Performance Metrics Tracker Rows Grid */}
                                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4 w-full">
                                            {/* PB Card */}
                                            <div className="bg-white/40 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-4 sm:p-5 text-left flex flex-col justify-between min-h-[120px]">
                                                <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center mb-4">
                                                    <Trophy className="w-5 h-5 text-yellow-500" />
                                                </div>
                                                <div>
                                                    <span className="text-[10px] font-bold text-slate-500 dark:text-gray-400 uppercase tracking-widest block mb-1">PB (ALL SESSION)</span>
                                                    <span className="font-display font-bold text-xl sm:text-2xl text-slate-900 dark:text-white leading-none block">{profileStats?.pb ? `${profileStats.pb}s` : '--'}</span>
                                                </div>
                                            </div>

                                            {/* Total Solves Card */}
                                            <div className="bg-white/40 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-4 sm:p-5 text-left flex flex-col justify-between min-h-[120px]">
                                                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-4">
                                                    <Target className="w-5 h-5 text-emerald-500" />
                                                </div>
                                                <div>
                                                    <span className="text-[10px] font-bold text-slate-500 dark:text-gray-400 uppercase tracking-widest block mb-1">TOTAL SOLVES</span>
                                                    <span className="font-display font-bold text-xl sm:text-2xl text-slate-900 dark:text-white leading-none block">{profileStats?.totalSolves ?? 0}</span>
                                                </div>
                                            </div>

                                            {/* Solve Streak Card */}
                                            <div className="bg-white/40 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-4 sm:p-5 text-left flex flex-col justify-between min-h-[120px]">
                                                <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center mb-4">
                                                    <Flame className="w-5 h-5 text-orange-500" />
                                                </div>
                                                <div>
                                                    <span className="text-[10px] font-bold text-slate-500 dark:text-gray-400 uppercase tracking-widest block mb-1">SOLVE STREAK</span>
                                                    <span className="font-display font-bold text-xl sm:text-2xl text-slate-900 dark:text-white leading-none block">{profileStats?.streak ?? 0} Days</span>
                                                </div>
                                            </div>

                                            {/* Global Average Card */}
                                            <div className="bg-white/40 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-4 sm:p-5 text-left flex flex-col justify-between min-h-[120px]">
                                                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center mb-4">
                                                    <Timer className="w-5 h-5 text-blue-500" />
                                                </div>
                                                <div>
                                                    <span className="text-[10px] font-bold text-slate-500 dark:text-gray-400 uppercase tracking-widest block mb-1">GLOBAL AVERAGE</span>
                                                    <span className="font-display font-bold text-xl sm:text-2xl text-slate-900 dark:text-white leading-none block">{profileStats?.globalAverage ? `${profileStats.globalAverage}s` : '--'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Achievements Showcase Trophy Case */}
                                <div className="w-full text-left">
                                    <div className="flex items-center justify-between gap-4 mb-5 w-full">
                                        <h3 className="font-display font-bold text-lg sm:text-xl text-slate-900 dark:text-white flex items-center gap-2 tracking-tight">
                                            <Award className="w-5 h-5 text-primary shrink-0" /> Trophy Case
                                        </h3>
                                        <span className="text-xs font-mono font-bold text-slate-500 dark:text-gray-500">
                                            {achievements.filter(a => a.isUnlocked).length} Active Tracks
                                        </span>
                                    </div>

                                    {achievements.length === 0 ? (
                                        <div className="glass-panel p-8 text-center text-slate-500 w-full">
                                            <Trophy className="w-7 h-7 mx-auto mb-2 opacity-50" />
                                            <p className="text-xs">Start practicing to activate progressive tracks.</p>
                                        </div>
                                    ) : (
                                        <div className="flex flex-row overflow-x-auto lg:grid lg:grid-cols-3 gap-4 w-full pb-4 snap-x hide-scrollbar -mx-1 px-1">
                                            {achievements.map((achievement: any) => {
                                                const IconComponent = ICON_MAP[achievement.icon] || Trophy;
                                                const currentTier = achievement.currentTier || 'locked';
                                                
                                                return (
                                                    <div
                                                        key={achievement.id}
                                                        className={clsx(
                                                            "p-4 sm:p-5 rounded-2xl border flex flex-col relative overflow-hidden group transition-all duration-300 select-none min-h-[160px]",
                                                            "flex-shrink-0 w-[250px] sm:w-[280px] lg:w-full snap-center",
                                                            TierStyles[currentTier]
                                                        )}
                                                    >
                                                        <div className="flex justify-between items-start w-full mb-3">
                                                            <div className={clsx(
                                                                "w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border border-slate-200/10",
                                                                currentTier !== 'locked' ? 'bg-white/10 dark:bg-black/20' : 'bg-slate-200 dark:bg-white/5'
                                                            )}>
                                                                <IconComponent className="w-4 h-4" />
                                                            </div>
                                                            {achievement.isUnlocked ? (
                                                                <span className={clsx(
                                                                    "text-[8px] font-black tracking-widest uppercase px-2 py-0.5 rounded leading-none shadow-sm",
                                                                    TierBadgeColors[currentTier]
                                                                )}>
                                                                    {currentTier}
                                                                </span>
                                                            ) : (
                                                                <span className="text-[8px] font-mono font-bold text-slate-400 bg-slate-150 dark:bg-white/5 px-2 py-0.5 rounded leading-none uppercase tracking-wide">
                                                                    Locked
                                                                </span>
                                                            )}
                                                        </div>

                                                        <h4 className="font-display font-bold text-slate-900 dark:text-white text-sm mb-1 truncate w-full">
                                                            {achievement.title}
                                                        </h4>
                                                        <p className="text-[11px] text-slate-500 dark:text-gray-400 line-clamp-2 leading-relaxed mb-4">
                                                            {achievement.description}
                                                        </p>

                                                        {/* Progressive Value Slider Logic */}
                                                        <div className="w-full mt-auto pt-1">
                                                            <div className="flex justify-between text-[9px] font-black font-mono text-slate-400 dark:text-gray-500 mb-1 leading-none uppercase">
                                                                <span>Stats</span>
                                                                <span>
                                                                    {achievement.isMaxed ? 'MAXED' : `${achievement.progress} / ${achievement.progressTarget}`}
                                                                </span>
                                                            </div>
                                                            <div className="w-full h-1 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
                                                                <div
                                                                    className={clsx(
                                                                        "h-full transition-all duration-500 rounded-full",
                                                                        currentTier !== 'locked' ? 'bg-current' : 'bg-slate-400'
                                                                    )}
                                                                    style={{ 
                                                                        width: achievement.isMaxed 
                                                                            ? '100%' 
                                                                            : `${Math.min(100, (achievement.progress / achievement.progressTarget) * 100)}%` 
                                                                    }}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* --- PROFILE IDENTITY MODAL --- */}
            {createPortal(
                <Modal
                    isOpen={isProfileModalOpen}
                    onClose={() => !isSavingProfile && setIsProfileModalOpen(false)}
                    className="max-w-2xl p-5 sm:p-8 flex flex-col w-[95vw] md:w-full"
                >
                    <button
                        onClick={() => !isSavingProfile && setIsProfileModalOpen(false)}
                        className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:text-gray-500 dark:hover:text-white transition-colors z-10"
                        aria-label="Close modal"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    <div className="flex items-center gap-3 mb-6 text-left">
                        <User className="w-5 h-5 sm:w-6 sm:h-6 text-slate-400 dark:text-gray-400 shrink-0" />
                        <h2 className="font-display font-bold text-xl sm:text-2xl text-slate-900 dark:text-white">Profile Identity</h2>
                    </div>

                    <form onSubmit={handleSaveProfile} className="flex flex-col gap-6 text-left">
                        {/* Username Field */}
                        <div>
                            <label className="text-[10px] sm:text-xs font-bold text-slate-500 dark:text-gray-400 uppercase tracking-widest mb-2 block">Username</label>
                            <Input 
                                value={editName} 
                                onChange={(e) => setEditName(e.target.value.replace(/\s+/g, '').toLowerCase())} 
                                placeholder="Enter a unique username"
                                className="w-full bg-slate-50 dark:bg-[#1C1E22] border-slate-200 dark:border-white/10 h-12"
                                required
                            />
                            <p className="text-[10px] sm:text-xs text-slate-500 dark:text-gray-500 mt-2">Must be unique.</p>
                        </div>

                        {/* Email Address Field (Disabled) */}
                        <div>
                            <label className="text-[10px] sm:text-xs font-bold text-slate-500 dark:text-gray-400 uppercase tracking-widest mb-2 block">Email Address</label>
                            <Input 
                                value={user?.email || ''} 
                                disabled 
                                className="w-full bg-slate-100 dark:bg-black/20 border-slate-200 dark:border-white/5 opacity-60 cursor-not-allowed h-12 text-slate-500 dark:text-gray-400"
                            />
                        </div>

                        {/* About Field */}
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="text-[10px] sm:text-xs font-bold text-slate-500 dark:text-gray-400 uppercase tracking-widest block">About You</label>
                                <span className="text-[10px] font-mono text-slate-400">{editAbout.length}/50</span>
                            </div>
                            <textarea 
                                value={editAbout} 
                                onChange={(e) => setEditAbout(e.target.value.slice(0, 50))} 
                                maxLength={50}
                                placeholder="A short bio..."
                                className="w-full bg-slate-50 dark:bg-[#1C1E22] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all resize-none min-h-[80px] placeholder:text-slate-400 dark:placeholder:text-gray-600"
                            />
                        </div>

                        {/* Avatar Presets Mesh */}
                        <div>
                            <label className="text-[10px] sm:text-xs font-bold text-slate-500 dark:text-gray-400 uppercase tracking-widest mb-3 block">Avatar Presets Mesh</label>
                            <div className="grid grid-cols-4 sm:flex sm:flex-wrap gap-3 sm:gap-4">
                                {AVATAR_PRESETS.map((avatar) => (
                                    <div 
                                        key={avatar}
                                        onClick={() => setEditAvatar(avatar)}
                                        className={clsx(
                                            "relative aspect-square sm:w-16 sm:h-16 rounded-2xl cursor-pointer transition-all duration-300 border-2 overflow-hidden flex items-center justify-center p-1 sm:p-2",
                                            editAvatar === avatar 
                                                ? "border-primary bg-primary/10 shadow-[0_0_15px_rgba(59,130,246,0.25)] scale-105" 
                                                : "border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#1C1E22] hover:border-slate-300 dark:hover:border-white/20 hover:bg-slate-100 dark:hover:bg-white/5 opacity-80 hover:opacity-100"
                                        )}
                                    >
                                        <img 
                                            src={avatar} 
                                            alt="Avatar option" 
                                            className="w-full h-full object-contain"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {profileError && (
                            <div className="text-xs font-bold text-red-500 dark:text-red-400 bg-red-500/10 px-4 py-3 rounded-xl border border-red-500/10">
                                {profileError}
                            </div>
                        )}

                        <div className="flex gap-3 pt-2">
                            <Button 
                                type="button" 
                                variant="secondary" 
                                onClick={() => setIsProfileModalOpen(false)}
                                disabled={isSavingProfile}
                                className="flex-1 min-h-[44px] sm:h-12"
                            >
                                Cancel
                            </Button>
                            <Button 
                                type="submit" 
                                variant="glow" 
                                disabled={isSavingProfile}
                                className="flex-1 min-h-[44px] sm:h-12 gap-2"
                            >
                                {isSavingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                                {isSavingProfile ? 'Saving...' : 'Save Profile'}
                            </Button>
                        </div>
                    </form>
                </Modal>,
                document.body
            )}

        </PageTransition>
    );
}