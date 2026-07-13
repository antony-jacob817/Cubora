import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MessageSquare, Heart, Share2, Trophy, Edit2,
    Medal, TrendingUp, Flame, Star,
    Clock, Award, Loader2, Target, Timer, X
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { PageTransition } from '@/components/animations/PageTransition';
import { useAuth } from '@/context/AuthContext';
import { clsx } from 'clsx';
import { AVATAR_PRESETS } from '@/components/layout/AvatarSelectionModal';

const RarityColors: Record<string, string> = {
    common: 'text-gray-400 bg-gray-500/10 border-gray-500/20',
    rare: 'text-primary bg-primary/10 border-primary/20 shadow-[0_0_15px_rgba(59,130,246,0.15)]',
    epic: 'text-secondary bg-secondary/10 border-secondary/20 shadow-[0_0_15px_rgba(139,92,246,0.15)]',
    legendary: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20 shadow-[0_0_20px_rgba(234,179,8,0.2)]'
};

const RARITY_MAP: Record<string, string> = {
    'First Contact': 'common',
    'Sub-30 Pioneer': 'rare',
    'Sub-20 Expert': 'epic',
    'Elite Speedcuber': 'legendary',
    'Century Halfway': 'rare',
    'Centurion Solver': 'epic',
};

const ICON_MAP: Record<string, any> = {
    'Sparkles': Star,
    'Zap': Flame,
    'Flame': Flame,
    'Trophy': Trophy,
    'Target': Clock,
    'Crown': Award,
};

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
    unlockedAt: string | null;
    progress: number;
    progressTarget: number;
}

const getJoinedDuration = (createdAt: string | Date | undefined) => {
    if (!createdAt) return 'Joined recently';
    const createdDate = new Date(createdAt);
    const now = new Date();
    
    let years = now.getFullYear() - createdDate.getFullYear();
    let months = now.getMonth() - createdDate.getMonth();
    
    if (now.getDate() < createdDate.getDate()) {
        months -= 1;
    }
    
    if (months < 0) {
        years -= 1;
        months += 12;
    }
    
    const totalMonths = years * 12 + months;
    
    if (totalMonths < 1) {
        return 'Joined recently';
    }
    
    if (years < 1) {
        return `Joined ${totalMonths} ${totalMonths === 1 ? 'month' : 'months'} ago`;
    }
    
    const yearText = `${years} ${years === 1 ? 'year' : 'years'}`;
    if (months === 0) {
        return `Joined ${yearText} ago`;
    }
    
    const monthText = `${months} ${months === 1 ? 'month' : 'months'}`;
    return `Joined ${yearText} and ${monthText} ago`;
};

export default function CommunityHub() {
    const { user, getAuthHeaders, refetchUser } = useAuth();
    const [activeTab, setActiveTab] = useState<'feed' | 'profile'>('feed');

    // Edit Profile Modal states
    const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
    const [editName, setEditName] = useState('');
    const [editUsername, setEditUsername] = useState('');
    const [editAbout, setEditAbout] = useState('');
    const [editAvatar, setEditAvatar] = useState('');
    const [editProfileError, setEditProfileError] = useState<string | null>(null);
    const [isSavingProfile, setIsSavingProfile] = useState(false);

    // Feed state
    const [posts, setPosts] = useState<CommunityPost[]>([]);
    const [isLoadingFeed, setIsLoadingFeed] = useState(true);
    const [newPostContent, setNewPostContent] = useState('');
    const [isPosting, setIsPosting] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Profile state
    const [profileStats, setProfileStats] = useState<{
        pb: number | null;
        ao5: number | null;
        totalSolves: number;
        streak: number;
        globalAverage: number | null;
        pbSession: string;
    } | null>(null);
    const [achievements, setAchievements] = useState<AchievementData[]>([]);
    const [isLoadingProfile, setIsLoadingProfile] = useState(false);

    // Attachment states
    const [attachedSolve, setAttachedSolve] = useState<any | null>(null);
    const [attachedAlg, setAttachedAlg] = useState<{ alg: string; algType: string } | null>(null);
    const [isSolvePickerOpen, setIsSolvePickerOpen] = useState(false);
    const [isAlgInputOpen, setIsAlgInputOpen] = useState(false);
    const [allSolves, setAllSolves] = useState<any[]>([]);
    const [isLoadingSolves, setIsLoadingSolves] = useState(false);
    const [algText, setAlgText] = useState('');
    const [algName, setAlgName] = useState('');

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
        if (activeTab !== 'profile') return;
        setIsLoadingProfile(true);

        const fetchProfile = async () => {
            try {
                const headers = getAuthHeaders();
                const [statsRes, achievRes, solvesRes] = await Promise.all([
                    fetch('http://localhost:5000/api/solves/stats?sessionId=all', { headers }),
                    fetch('http://localhost:5000/api/achievements', { headers }),
                    fetch('http://localhost:5000/api/solves?sessionId=all', { headers }),
                ]);

                const statsData = await statsRes.json();
                const achievData = await achievRes.json();
                const solvesData = await solvesRes.json();

                if (statsData.success) {
                    let pbSession = 'main';
                    if (solvesData.success && solvesData.data) {
                        const activeSolves = solvesData.data.filter((s: any) => !s.isDeleted && s.penalty !== 'DNF');
                        if (activeSolves.length > 0) {
                            let minTime = Infinity;
                            let bestSolve = null;
                            activeSolves.forEach((s: any) => {
                                const t = s.timeMs + (s.penalty === '+2' ? 2000 : 0);
                                if (t < minTime) {
                                    minTime = t;
                                    bestSolve = s;
                                }
                            });
                            if (bestSolve) {
                                pbSession = bestSolve.sessionId || 'main';
                            }
                        }
                    }

                    setProfileStats({
                        pb: statsData.stats.pb,
                        ao5: statsData.stats.ao5,
                        totalSolves: solvesData.success ? solvesData.data.length : 0,
                        streak: statsData.stats.streak,
                        globalAverage: statsData.stats.globalAverage,
                        pbSession: pbSession
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

    const openSolvePicker = async () => {
        setIsSolvePickerOpen(true);
        if (allSolves.length > 0) return;
        setIsLoadingSolves(true);
        try {
            const res = await fetch('http://localhost:5000/api/solves?sessionId=all', { headers: getAuthHeaders() });
            const data = await res.json();
            if (data.success) {
                const active = data.data.filter((s: any) => !s.isDeleted && s.penalty !== 'DNF');
                setAllSolves(active);
            }
        } catch (err) {
            console.error('Failed to load user solves for picking:', err);
        } finally {
            setIsLoadingSolves(false);
        }
    };

    // --- CREATE POST WITH ATTACHMENTS ---
    const handleCreatePost = async () => {
        if (!newPostContent.trim() || isPosting) return;
        setIsPosting(true);
        try {
            let postType = 'discussion';
            let solveData = undefined;

            if (attachedSolve) {
                postType = 'solve';
                solveData = {
                    time: (attachedSolve.timeMs / 1000).toFixed(3) + 's',
                    method: attachedSolve.method,
                    scramble: attachedSolve.scramble
                };
            } else if (attachedAlg) {
                postType = 'algorithm';
                solveData = {
                    alg: attachedAlg.alg,
                    algType: attachedAlg.algType
                };
            }

            const res = await fetch('http://localhost:5000/api/community', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
                body: JSON.stringify({ 
                    content: newPostContent.trim(), 
                    type: postType, 
                    solveData 
                }),
            });
            const data = await res.json();
            if (data.success) {
                setPosts(prev => [data.data, ...prev]);
                setNewPostContent('');
                setAttachedSolve(null);
                setAttachedAlg(null);
                if (textareaRef.current) textareaRef.current.style.height = 'auto';
            }
        } catch (err) {
            console.error('Failed to create post:', err);
        } finally {
            setIsPosting(false);
        }
    };

    // --- EDIT PROFILE MODAL ---
    const openEditProfileModal = () => {
        setEditName(user?.name || '');
        setEditUsername((user?.username || user?.email || '').split('@')[0]);
        setEditAbout(user?.about || 'Speedcuber');
        setEditAvatar(user?.avatar || '');
        setEditProfileError(null);
        setIsEditProfileOpen(true);
    };

    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editName.trim()) {
            setEditProfileError('Display Name is required.');
            return;
        }
        if (!editUsername.trim()) {
            setEditProfileError('Username is required.');
            return;
        }
        if (editAbout.trim().length > 30) {
            setEditProfileError('About bio cannot exceed 30 characters.');
            return;
        }

        setIsSavingProfile(true);
        setEditProfileError(null);

        try {
            const res = await fetch('http://localhost:5000/api/auth/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
                body: JSON.stringify({
                    name: editName.trim(),
                    username: editUsername.trim().toLowerCase(),
                    about: editAbout.trim() || 'Speedcuber',
                    avatar: editAvatar
                }),
            });
            const data = await res.json();
            if (data.success) {
                await refetchUser();
                setIsEditProfileOpen(false);
            } else {
                setEditProfileError(data.error || 'Failed to update profile.');
            }
        } catch (err) {
            console.error('Failed to update profile:', err);
            setEditProfileError('A network error occurred. Please try again.');
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

    const unlockedAchievements = achievements.filter(a => a.isUnlocked);

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

                                    {/* Attachment Previews */}
                                    {attachedSolve && (
                                        <div className="w-full bg-primary/5 border border-primary/20 rounded-xl p-3.5 mb-2.5 flex items-center justify-between gap-3 text-left">
                                            <div className="flex items-center gap-3 min-w-0 flex-1">
                                                <div className="w-9 h-9 rounded-lg bg-primary/20 flex items-center justify-center border border-primary/20 shrink-0">
                                                    <Clock className="w-4 h-4 text-primary" />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <span className="text-xs font-bold text-slate-900 dark:text-white block leading-none mb-1.5">
                                                        {(attachedSolve.timeMs / 1000).toFixed(3)}s Solve ({attachedSolve.method})
                                                    </span>
                                                    <span className="text-[10px] font-mono text-slate-400 dark:text-gray-550 block truncate max-w-full">
                                                        {attachedSolve.scramble}
                                                    </span>
                                                </div>
                                            </div>
                                            <button 
                                                onClick={() => setAttachedSolve(null)} 
                                                className="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-500 dark:text-gray-400 transition-colors shrink-0"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    )}

                                    {attachedAlg && (
                                        <div className="w-full bg-secondary/5 border border-secondary/20 rounded-xl p-3.5 mb-2.5 flex items-center justify-between gap-3 text-left">
                                            <div className="flex items-center gap-3 min-w-0 flex-1">
                                                <div className="w-9 h-9 rounded-lg bg-secondary/20 flex items-center justify-center border border-secondary/20 shrink-0">
                                                    <Share2 className="w-4 h-4 text-secondary" />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <span className="text-xs font-bold text-slate-900 dark:text-white block leading-none mb-1.5">
                                                        {attachedAlg.algType || 'Algorithm'}
                                                    </span>
                                                    <code className="text-[11px] font-mono font-bold text-slate-700 dark:text-gray-300 block break-all">
                                                        {attachedAlg.alg}
                                                    </code>
                                                </div>
                                            </div>
                                            <button 
                                                onClick={() => setAttachedAlg(null)} 
                                                className="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-500 dark:text-gray-400 transition-colors shrink-0"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    )}

                                    <div className="flex flex-col sm:flex-row gap-3.5 sm:items-center sm:justify-between border-t border-slate-200 dark:border-white/5 pt-3.5 mt-2 w-full">
                                        <div className="flex gap-2 w-full sm:w-auto">
                                            <button 
                                                onClick={openSolvePicker}
                                                className="flex-1 sm:flex-none text-[10px] font-bold text-slate-500 dark:text-gray-400 hover:text-primary transition-colors flex items-center justify-center gap-1.5 bg-slate-100 dark:bg-white/5 px-2.5 py-2 rounded-lg min-h-[38px] sm:min-h-0 uppercase tracking-wider"
                                            >
                                                <Clock className="w-3.5 h-3.5" /> Attach Solve
                                            </button>
                                            <button 
                                                onClick={() => setIsAlgInputOpen(true)}
                                                className="flex-1 sm:flex-none text-[10px] font-bold text-slate-500 dark:text-gray-400 hover:text-secondary transition-colors flex items-center justify-center gap-1.5 bg-slate-100 dark:bg-white/5 px-2.5 py-2 rounded-lg min-h-[38px] sm:min-h-0 uppercase tracking-wider"
                                            >
                                                <Share2 className="w-3.5 h-3.5" /> Share Alg
                                            </button>
                                        </div>
                                        <Button
                                            variant="glow"
                                            size="sm"
                                            onClick={handleCreatePost}
                                            disabled={(!newPostContent.trim() && !attachedSolve && !attachedAlg) || isPosting}
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
                                    <div className="h-14 sm:h-20 w-full bg-gradient-to-r from-primary/15 via-secondary/15 to-tertiary/15" />

                                    {/* Edit Profile Button (Icon Only, Top Right Corner) */}
                                    <button
                                        onClick={openEditProfileModal}
                                        className="absolute top-2 right-3 sm:top-3 sm:right-4 z-20 w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-xl bg-white/40 dark:bg-black/30 hover:bg-white/60 dark:hover:bg-black/55 text-slate-700 dark:text-white border border-slate-200/40 dark:border-white/10 transition-colors shadow-sm cursor-pointer focus:outline-none"
                                        title="Edit Profile"
                                        aria-label="Edit Profile"
                                    >
                                        <Edit2 className="w-3.5 h-3.5 sm:w-4 h-4" />
                                    </button>

                                    <div className="px-4 sm:px-8 pb-5 sm:pb-8 w-full">
                                        {/* Floating Avatar & Settings Link */}
                                        <div className="flex justify-start items-end -mt-8 sm:-mt-12 mb-5 sm:mb-6 w-full">
                                            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full relative z-10 shadow-xl overflow-hidden shrink-0">
                                                <img
                                                    loading="lazy"
                                                    src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user?.name || 'Cubora')}`}
                                                    alt="Profile"
                                                    className="w-full h-full rounded-full bg-slate-50 dark:bg-white/5 object-cover"
                                                />
                                            </div>
                                        </div>

                                        {/* Bio Identity Summary */}
                                        <div className="mb-6 sm:mb-8 w-full">
                                            <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2 tracking-tight">
                                                {user?.name || 'Cubora User'} <Medal className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500 animate-pulse shrink-0" />
                                            </h2>
                                            <p className="text-slate-500 dark:text-gray-400 font-mono text-xs sm:text-sm mt-1">
                                                @{(user?.username || user?.email || '').split('@')[0]} • {getJoinedDuration(user?.createdAt)}
                                            </p>
                                            <div className="mt-3 text-left">
                                                <span className="inline-block font-mono text-slate-600 dark:text-gray-400 text-xs sm:text-sm italic bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 rounded-xl px-4 py-3 w-fit">
                                                    "{user?.about || 'Speedcuber'}"
                                                </span>
                                            </div>
                                        </div>

                                        {/* Performance Metrics Tracker Rows Grid */}
                                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4 w-full">
                                            {/* PB Card */}
                                            <div className="glass-panel-interactive glass-scroll-safe p-3.5 sm:p-5 flex flex-col justify-between group hover:border-yellow-500/40 transition-colors text-left min-h-[105px] sm:min-h-[140px]">
                                                <div className="flex justify-between items-center w-full">
                                                    <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-yellow-500/20 text-yellow-500 flex items-center justify-center shadow-[0_0_12px_rgba(234,179,8,0.15)] group-hover:scale-105 transition-transform duration-300">
                                                        <Trophy className="w-3.5 h-3.5 sm:w-5 h-5" />
                                                    </div>
                                                </div>
                                                <div className="mt-2.5 sm:mt-3">
                                                    <span className="text-slate-500 dark:text-gray-400 text-[10px] font-bold uppercase tracking-wider block leading-none">
                                                        PB ({profileStats?.pbSession ? profileStats.pbSession.toUpperCase() : 'ALL SESSION'})
                                                    </span>
                                                    <span className="font-display font-bold text-xl sm:text-2xl text-slate-900 dark:text-white mt-1 block leading-none">
                                                        {profileStats?.pb ? `${Number(profileStats.pb).toFixed(3)}s` : '--'}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Total Solves Card */}
                                            <div className="glass-panel-interactive glass-scroll-safe p-3.5 sm:p-5 flex flex-col justify-between group hover:border-emerald-500/40 transition-colors text-left min-h-[105px] sm:min-h-[140px]">
                                                <div className="flex justify-between items-center w-full">
                                                    <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-emerald-500/20 text-emerald-500 flex items-center justify-center shadow-[0_0_12px_rgba(16,185,129,0.15)] group-hover:scale-105 transition-transform duration-300">
                                                        <Target className="w-3.5 h-3.5 sm:w-5 h-5 animate-pulse" />
                                                    </div>
                                                </div>
                                                <div className="mt-2.5 sm:mt-3">
                                                    <span className="text-slate-500 dark:text-gray-400 text-[10px] font-bold uppercase tracking-wider block leading-none">
                                                        Total Solves
                                                    </span>
                                                    <span className="font-display font-bold text-xl sm:text-2xl text-slate-900 dark:text-white mt-1 block leading-none">
                                                        {profileStats?.totalSolves ?? 0}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Solve Streak Card */}
                                            <div className="glass-panel-interactive glass-scroll-safe p-3.5 sm:p-5 flex flex-col justify-between group hover:border-orange-500/40 transition-colors text-left min-h-[105px] sm:min-h-[140px]">
                                                <div className="flex justify-between items-center w-full gap-2">
                                                    <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-orange-500/20 text-orange-500 flex items-center justify-center shadow-[0_0_12px_rgba(249,115,22,0.15)] group-hover:scale-105 transition-transform duration-300">
                                                        <Flame className="w-3.5 h-3.5 sm:w-5 h-5 animate-pulse" />
                                                    </div>
                                                </div>
                                                <div className="mt-2.5 sm:mt-3">
                                                    <span className="text-slate-500 dark:text-gray-400 text-[10px] font-bold uppercase tracking-wider block leading-none">
                                                        Solve Streak
                                                    </span>
                                                    <span className="font-display font-bold text-xl sm:text-2xl text-slate-900 dark:text-white mt-1 block leading-none">
                                                        {profileStats?.streak ?? 0} {profileStats?.streak === 1 ? 'Day' : 'Days'}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Global Average Card */}
                                            <div className="glass-panel-interactive glass-scroll-safe p-3.5 sm:p-5 flex flex-col justify-between group hover:border-blue-500/40 transition-colors text-left min-h-[105px] sm:min-h-[140px]">
                                                <div className="flex justify-between items-center w-full gap-2">
                                                    <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-blue-500/20 text-blue-500 flex items-center justify-center shadow-[0_0_12px_rgba(59,130,246,0.15)] group-hover:scale-105 transition-transform duration-300">
                                                        <Timer className="w-3.5 h-3.5 sm:w-5 h-5" />
                                                    </div>
                                                </div>
                                                <div className="mt-2.5 sm:mt-3">
                                                    <span className="text-slate-500 dark:text-gray-400 text-[10px] font-bold uppercase tracking-wider block leading-none">
                                                        Global Average
                                                    </span>
                                                    <span className="font-display font-bold text-xl sm:text-2xl text-slate-900 dark:text-white mt-1 block leading-none">
                                                        {profileStats?.globalAverage ? `${Number(profileStats.globalAverage).toFixed(3)} s` : '--'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Achievements Showcase Trophy Case */}
                                <div className="w-full text-left">
                                    <div className="flex items-center justify-between gap-4 mb-4 w-full">
                                        <h3 className="font-display font-bold text-lg sm:text-xl text-slate-900 dark:text-white flex items-center gap-2 tracking-tight">
                                            <Award className="w-4 h-4 sm:w-5 sm:h-5 text-tertiary shrink-0" /> Trophy Case
                                        </h3>
                                        <span className="text-xs font-mono font-bold text-slate-500 dark:text-gray-500">{unlockedAchievements.length} Unlocked</span>
                                    </div>

                                    {achievements.length === 0 ? (
                                        <div className="glass-panel p-8 text-center text-slate-500 w-full">
                                            <Trophy className="w-7 h-7 mx-auto mb-2 opacity-50" />
                                            <p className="text-xs">Start solving to unlock achievements!</p>
                                        </div>
                                    ) : (
                                        <div className="flex flex-row overflow-x-auto lg:grid lg:grid-cols-3 gap-4 w-full pb-2 snap-x hide-scrollbar">
                                            {/* CHANGED: Mobile horizontal flex container that snaps back to a grid on desktop (lg:) */}
                                            {achievements.map((achievement) => {
                                                const rarity = RARITY_MAP[achievement.title] || 'common';
                                                const IconComponent = ICON_MAP[achievement.icon] || Trophy;
                                                return (
                                                    <div
                                                        key={achievement.id}
                                                        className={clsx(
                                                            "p-4 sm:p-5 rounded-2xl border flex flex-col items-center text-center relative overflow-hidden group transition-all cursor-pointer min-h-[150px]",
                                                            // CHANGED: Force fixed widths for the mobile scroll, then allow w-full inside the desktop grid
                                                            "flex-shrink-0 w-[240px] sm:w-[280px] lg:w-full snap-center",
                                                            achievement.isUnlocked ? RarityColors[rarity] : "border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/[0.01] opacity-40 grayscale",
                                                            achievement.isUnlocked && "sm:hover:scale-[1.02] sm:hover:shadow-md"
                                                        )}
                                                    >
                                                        <IconComponent className="w-8 h-8 sm:w-9 sm:h-9 mb-2.5 opacity-90 sm:group-hover:scale-105 transition-transform shrink-0" />
                                                        <h4 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm mb-0.5 relative z-10 truncate max-w-full">{achievement.title}</h4>
                                                        <p className="text-[11px] opacity-70 mb-4 relative z-10 text-slate-700 dark:text-slate-400 line-clamp-2 leading-relaxed px-1">{achievement.description}</p>

                                                        {achievement.isUnlocked && achievement.unlockedAt ? (
                                                            <span className="text-[10px] font-mono font-bold opacity-40 mt-auto leading-none">
                                                                {new Date(achievement.unlockedAt).toLocaleDateString()}
                                                            </span>
                                                        ) : achievement.progressTarget > 0 ? (
                                                            <div className="w-full mt-auto pt-1">
                                                                <div className="w-full h-1 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
                                                                    <div
                                                                        className="h-full bg-primary transition-all"
                                                                        style={{ width: `${Math.min(100, (achievement.progress / achievement.progressTarget) * 100)}%` }}
                                                                    />
                                                                </div>
                                                                <span className="text-[9px] font-mono font-bold opacity-40 mt-1 block leading-none">
                                                                    {achievement.progress} / {achievement.progressTarget}
                                                                </span>
                                                            </div>
                                                        ) : (
                                                            <span className="text-[9px] font-mono font-bold opacity-40 mt-auto leading-none">Locked</span>
                                                        )}
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

            {/* Solve Picker Modal */}
            {createPortal(
                <Modal
                    isOpen={isSolvePickerOpen}
                    onClose={() => setIsSolvePickerOpen(false)}
                    className="max-w-md p-5 xs:p-6 sm:p-8 flex flex-col gap-5 sm:gap-6 relative"
                >
                    <button
                        onClick={() => setIsSolvePickerOpen(false)}
                        className="absolute top-4 right-3 w-10 h-10 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:text-gray-500 dark:hover:text-white transition-colors z-10"
                        aria-label="Close modal content"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    <div className="flex items-center gap-3 text-left">
                        <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center border border-primary/15 shrink-0">
                            <Clock className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <h3 className="font-display font-bold text-base sm:text-lg text-slate-900 dark:text-white leading-tight">Attach Recent Solve</h3>
                            <p className="text-[11px] text-slate-500 dark:text-gray-400 font-mono tracking-wide">SHARE YOUR PERFORMANCE</p>
                        </div>
                    </div>

                    <div className="max-h-[300px] overflow-y-auto pr-1 flex flex-col gap-2.5">
                        {isLoadingSolves ? (
                            <div className="flex flex-col items-center justify-center py-12 text-slate-500 dark:text-gray-400">
                                <Loader2 className="w-6 h-6 animate-spin text-primary mb-2.5" />
                                <span className="text-xs">Loading solves...</span>
                            </div>
                        ) : allSolves.length === 0 ? (
                            <div className="text-center py-12 text-slate-500 dark:text-gray-500 text-xs">
                                No verified solves found. Solve the cube in the Timer tab first!
                            </div>
                        ) : (
                            allSolves.map((s) => (
                                <button
                                    key={s._id}
                                    onClick={() => {
                                        setAttachedSolve(s);
                                        setAttachedAlg(null);
                                        setIsSolvePickerOpen(false);
                                    }}
                                    className="w-full flex flex-col gap-1 p-3.5 bg-slate-50/50 hover:bg-slate-100/80 dark:bg-white/[0.01] dark:hover:bg-white/5 border border-slate-100 hover:border-slate-200 dark:border-white/5 dark:hover:border-white/10 rounded-xl transition-all text-left"
                                >
                                    <div className="flex justify-between items-center w-full">
                                        <span className="font-display font-bold text-sm text-primary">
                                            {(s.timeMs / 1000).toFixed(3)}s
                                        </span>
                                        <span className="text-[9px] font-mono font-bold bg-slate-200/55 dark:bg-white/10 px-2 py-0.5 rounded text-slate-500 dark:text-gray-400 uppercase">
                                            {s.method}
                                        </span>
                                    </div>
                                    <span className="text-[10px] font-mono text-slate-400 dark:text-gray-500 block truncate w-full select-none">
                                        {s.scramble}
                                    </span>
                                </button>
                            ))
                        )}
                    </div>
                </Modal>,
                document.body
            )}

            {/* Share Alg Modal */}
            {createPortal(
                <Modal
                    isOpen={isAlgInputOpen}
                    onClose={() => setIsAlgInputOpen(false)}
                    className="max-w-md p-5 xs:p-6 sm:p-8 flex flex-col gap-5 sm:gap-6 relative"
                >
                    <button
                        onClick={() => setIsAlgInputOpen(false)}
                        className="absolute top-4 right-3 w-10 h-10 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:text-gray-500 dark:hover:text-white transition-colors z-10"
                        aria-label="Close modal content"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    <div className="flex items-center gap-3 text-left">
                        <div className="w-10 h-10 rounded-xl bg-secondary/20 flex items-center justify-center border border-secondary/15 shrink-0">
                            <Share2 className="w-5 h-5 text-secondary" />
                        </div>
                        <div>
                            <h3 className="font-display font-bold text-base sm:text-lg text-slate-900 dark:text-white leading-tight">Share Algorithm</h3>
                            <p className="text-[11px] text-slate-500 dark:text-gray-400 font-mono tracking-wide">POST AN ALGORITHM FORMULA</p>
                        </div>
                    </div>

                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            if (!algText.trim()) return;
                            setAttachedAlg({
                                alg: algText.trim(),
                                algType: algName.trim() || 'Algorithm'
                            });
                            setAttachedSolve(null);
                            setAlgText('');
                            setAlgName('');
                            setIsAlgInputOpen(false);
                        }}
                        className="space-y-4 text-left"
                    >
                        <div>
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5 block">Algorithm Name</label>
                            <input
                                type="text"
                                placeholder="e.g. Sune OLL 27"
                                value={algName}
                                onChange={(e) => setAlgName(e.target.value)}
                                className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-secondary transition-colors placeholder-slate-400 dark:placeholder-gray-500 min-h-[44px]"
                            />
                        </div>

                        <div>
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5 block">Algorithm Moves</label>
                            <textarea
                                placeholder="e.g. R U R' U R U2 R'"
                                value={algText}
                                onChange={(e) => setAlgText(e.target.value)}
                                className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-secondary transition-colors placeholder-slate-400 dark:placeholder-gray-500 min-h-[80px] resize-none"
                                required
                            />
                        </div>

                        <div className="flex gap-3 mt-5 w-full">
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => setIsAlgInputOpen(false)}
                                className="flex-1 rounded-xl h-11 min-h-[44px] text-xs font-bold"
                            >
                                Cancel
                            </Button>
                            <button
                                type="submit"
                                disabled={!algText.trim()}
                                className="flex-1 bg-secondary hover:bg-secondary/90 disabled:opacity-40 text-white rounded-xl h-11 min-h-[44px] text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(139,92,246,0.2)]"
                            >
                                Attach
                            </button>
                        </div>
                    </form>
                </Modal>,
                document.body
            )}

            {/* Edit Profile Modal */}
            {createPortal(
                <Modal
                    isOpen={isEditProfileOpen}
                    onClose={() => setIsEditProfileOpen(false)}
                    className="max-w-md p-5 xs:p-6 sm:p-8 flex flex-col gap-5 sm:gap-6 relative"
                >
                    <button
                        onClick={() => setIsEditProfileOpen(false)}
                        className="absolute top-4 right-3 w-10 h-10 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:text-gray-500 dark:hover:text-white transition-colors z-10"
                        aria-label="Close modal content"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    <div className="flex items-center gap-3 text-left">
                        <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center border border-primary/15 shrink-0">
                            <Edit2 className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <h3 className="font-display font-bold text-base sm:text-lg text-slate-900 dark:text-white leading-tight">Edit Profile</h3>
                            <p className="text-[11px] text-slate-500 dark:text-gray-400 font-mono tracking-wide">UPDATE YOUR COMMUNITY IDENTITY</p>
                        </div>
                    </div>

                    <form onSubmit={handleSaveProfile} className="space-y-4 text-left">
                        <div>
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5 block">Display Name</label>
                            <Input
                                type="text"
                                placeholder="Display Name"
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-[16px] sm:text-sm"
                                required
                            />
                        </div>

                        <div>
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5 block">Username (Unique)</label>
                            <Input
                                type="text"
                                placeholder="e.g. speedcuber"
                                value={editUsername}
                                onChange={(e) => setEditUsername(e.target.value)}
                                className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-[16px] sm:text-sm"
                                required
                            />
                        </div>

                        <div>
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5 block">Email Address (Not Editable)</label>
                            <div className="bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-400 dark:text-gray-550 text-xs sm:text-sm min-h-[44px] flex items-center select-none cursor-not-allowed">
                                {user?.email || 'Not available'}
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-1.5">
                                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block">About Me (Bio)</label>
                                <span className="text-[10px] font-bold font-mono text-gray-500">{editAbout.length}/30</span>
                            </div>
                            <textarea
                                placeholder="Write a brief bio about yourself..."
                                value={editAbout}
                                onChange={(e) => setEditAbout(e.target.value)}
                                maxLength={30}
                                className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white hover:border-slate-300 dark:hover:border-white/20 outline-none focus:outline-none focus-visible:outline-none focus:ring-0 focus-visible:ring-0 focus:border-primary focus:shadow-[0_0_15px_var(--accent-glow-intense)] transition-all duration-200 placeholder-slate-400 dark:placeholder-gray-500 min-h-[80px] resize-none"
                            />
                        </div>

                        <div>
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5 block">Avatar Presets Mesh</label>
                            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 w-full mt-2">
                                {AVATAR_PRESETS.map((preset) => {
                                    const isSelected = editAvatar === preset.url;
                                    return (
                                        <button
                                            key={preset.id}
                                            type="button"
                                            onClick={() => setEditAvatar(preset.url)}
                                            className={clsx(
                                                "relative p-0.5 rounded-lg border transition-all duration-300 group focus:outline-none min-w-[38px] min-h-[38px]",
                                                isSelected
                                                    ? "bg-primary/20 border-primary shadow-[0_0_10px_rgba(59,130,246,0.5)] scale-105"
                                                    : "bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/5 hover:border-slate-350 dark:hover:border-white/20 hover:bg-slate-200/50 dark:hover:bg-white/10"
                                            )}
                                        >
                                            <div className="aspect-square w-full rounded-md bg-[#181A1D] overflow-hidden flex items-center justify-center">
                                                <img
                                                    src={preset.url}
                                                    alt={preset.name}
                                                    className="w-full h-full object-cover"
                                                    loading="lazy"
                                                />
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {editProfileError && (
                            <div className="text-xs font-bold text-red-500 dark:text-red-400 bg-red-500/10 px-4 py-2.5 rounded-xl border border-red-500/10">
                                {editProfileError}
                            </div>
                        )}

                        <div className="flex gap-3 mt-5 w-full">
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => setIsEditProfileOpen(false)}
                                className="flex-1 rounded-xl h-11 min-h-[44px] text-xs font-bold"
                            >
                                Cancel
                            </Button>
                            <button
                                type="submit"
                                disabled={isSavingProfile}
                                className="flex-1 bg-primary hover:bg-primary/90 disabled:opacity-40 text-white rounded-xl h-11 min-h-[44px] text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(59,130,246,0.2)]"
                            >
                                {isSavingProfile ? (
                                    <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving...</>
                                ) : (
                                    'Save Profile'
                                )}
                            </button>
                        </div>
                    </form>
                </Modal>,
                document.body
            )}
        </PageTransition>
    );
}