import { useState, useEffect, useRef, useMemo, Suspense } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MessageSquare, Heart, Share2, Trophy, Edit2, Crown,
    Flame, Star, Globe, CheckCircle2, Lock, AlertCircle,
    Clock, Award, Loader2, Target, Timer, X, Check,
    Plus, Trash2, Brain, ChevronDown, ChevronUp,
    ChevronLeft, ChevronRight, Play, Pause, RotateCcw
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { PageTransition } from '@/components/animations/PageTransition';
import { useAuth } from '@/context/AuthContext';
import { clsx } from 'clsx';
import { AVATAR_PRESETS } from '@/components/layout/AvatarSelectionModal';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import { AnimatedCube } from '@/components/3d/AnimatedCube';
import { useSolvePlayback } from '@/hooks/useSolvePlayback';
import { useTheme } from '@/context/ThemeContext';
import { UserProfileModal } from '@/components/modals/UserProfileModal';

const TierColors: Record<string, string> = {
    bronze: 'text-amber-800 dark:text-amber-800 bg-amber-500/10 dark:bg-amber-500/[0.05] border-amber-600/30 dark:border-amber-500/25',
    silver: 'text-slate-500 dark:text-slate-400 bg-slate-400/15 dark:bg-slate-400/[0.06] border-slate-400/35 dark:border-slate-400/25',
    gold: 'text-yellow-600 dark:text-yellow-500 bg-yellow-500/10 dark:bg-yellow-500/[0.05] border-yellow-500/35 dark:border-yellow-500/25',
    emerald: 'text-emerald-600 dark:text-emerald-500 bg-emerald-500/10 dark:bg-emerald-500/[0.05] border-emerald-500/35 dark:border-emerald-500/25',
    diamond: 'text-cyan-600 dark:text-cyan-400 bg-cyan-400/12 dark:bg-cyan-400/[0.06] border-cyan-400/35 dark:border-cyan-400/25',
    ruby: 'text-rose-600 dark:text-rose-500 bg-rose-500/12 dark:bg-rose-500/[0.06] border-rose-500/35 dark:border-rose-500/25'
};

const TierProgressBarColors: Record<string, string> = {
    bronze: 'bg-amber-800 dark:bg-amber-800',
    silver: 'bg-slate-400 dark:bg-slate-500',
    gold: 'bg-yellow-500',
    emerald: 'bg-emerald-500',
    diamond: 'bg-cyan-400',
    ruby: 'bg-rose-500'
};

const ICON_MAP: Record<string, any> = {
    'Target': Target,
    'Trophy': Trophy,
    'Flame': Flame,
    'Timer': Timer,
    'Clock': Clock,
    'Star': Star,
    'Award': Award,
};
const mapPhaseToStandardName = (phase: string, method: string): string => {
    const p = phase.toLowerCase();
    const m = (method || 'CFOP').toUpperCase();
    
    if (m === 'CFOP' || m === 'SIMPLIFIED CFOP') {
        if (p === 'cross') return 'Setup (Cross)';
        if (p === 'f2l') return 'Transition (F2L)';
        if (p === 'oll') return 'Orientation (OLL)';
        if (p === 'pll') return 'Permutation (PLL)';
    } else if (m === 'ROUX') {
        if (p === 'first block' || p === 'fb') return 'Setup (FB)';
        if (p === 'second block' || p === 'sb') return 'Transition (SB)';
        if (p === 'cmll') return 'Orientation (CMLL)';
        if (p === 'lse') return 'Permutation (LSE)';
    } else if (m === 'ZZ') {
        if (p === 'eoline') return 'Setup (EOLine)';
        if (p === 'z2l') return 'Transition (Z2L)';
        if (p === 'll') return 'Orientation/Permutation (LL)';
    } else if (m === 'BEGINNER') {
        if (p === 'first layer') return 'Setup (1st Layer)';
        if (p === 'second layer') return 'Transition (2nd Layer)';
        if (p === 'third layer') return 'Orientation/Permutation (3rd Layer)';
    }
    
    // Fallbacks
    if (p.includes('cross') || p.includes('first')) return 'Setup';
    if (p.includes('second') || p.includes('f2l') || p.includes('sb') || p.includes('transition')) return 'Transition';
    if (p.includes('oll') || p.includes('cmll') || p.includes('orientation')) return 'Orientation';
    if (p.includes('pll') || p.includes('lse') || p.includes('permutation')) return 'Permutation';
    
    return phase;
};


interface CommunityPost {
    _id: string;
    content: string;
    type: 'solve' | 'algorithm' | 'discussion';
    author: { _id: string; name: string; handle: string; avatar: string; username?: string };
    solveData?: { time?: string; method?: string; scramble?: string; alg?: string; algType?: string; phaseSplits?: Record<string, number>; verificationStatus?: 'unverified' | 'verified_phase' | 'verified_session' | 'flagged'; isManual?: boolean };
    isPB?: boolean;
    likes: number;
    isLikedByMe: boolean;
    timeAgo: string;
    commentCount: number;
}

interface CommentData {
    _id: string;
    post: string;
    author: { _id: string; name: string; handle: string; avatar: string; username?: string };
    content: string;
    parentId: string | null;
    likes: number;
    isLikedByMe: boolean;
    timeAgo: string;
    createdAt: string;
}

interface AchievementData {
    id: string;
    title: string;
    description: string;
    icon: string;
    category: string;
    isAchieved: boolean;
    achievedAt: string | null;
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

interface GroupedAchievement {
    groupKey: string;
    title: string;
    category: string;
    icon: string;
    highestAchieved: AchievementData | null;
    nextMilestone: AchievementData | null;
    items: AchievementData[];
}

const groupAchievements = (achList: AchievementData[]): GroupedAchievement[] => {
    const groupsMap: Record<string, AchievementData[]> = {};
    achList.forEach(ach => {
        const lastDash = ach.id.lastIndexOf('-');
        const groupKey = lastDash !== -1 ? ach.id.substring(0, lastDash) : ach.id;
        if (!groupsMap[groupKey]) {
            groupsMap[groupKey] = [];
        }
        groupsMap[groupKey].push(ach);
    });

    const tierOrder = ['bronze', 'silver', 'gold', 'emerald', 'diamond', 'ruby'];

    return Object.keys(groupsMap).map(groupKey => {
        const groupItems = groupsMap[groupKey];
        // Sort items by their tier order
        groupItems.sort((a, b) => {
            const tierA = a.id.substring(a.id.lastIndexOf('-') + 1).toLowerCase();
            const tierB = b.id.substring(b.id.lastIndexOf('-') + 1).toLowerCase();
            return tierOrder.indexOf(tierA) - tierOrder.indexOf(tierB);
        });

        // Find highest achieved
        const achievedItems = groupItems.filter(a => a.isAchieved);
        const highestAchieved = achievedItems.length > 0 ? achievedItems[achievedItems.length - 1] : null;

        // Find next milestone
        const nextMilestone = groupItems.find(a => !a.isAchieved) || null;

        const sample = nextMilestone || highestAchieved || groupItems[0];
        const cleanTitle = sample.title.substring(0, sample.title.indexOf(' (')) || sample.title;

        return {
            groupKey,
            title: cleanTitle,
            category: sample.category,
            icon: sample.icon,
            highestAchieved,
            nextMilestone,
            items: groupItems
        };
    });
};
const renderContentWithMentions = (content: string, onMentionClick?: (handle: string) => void) => {
    if (!content) return '';
    const parts = content.split(/(@[a-zA-Z0-9_.-]+)/g);
    return parts.map((part, index) => {
        if (part.startsWith('@')) {
            return (
                <span
                    key={index}
                    onClick={(e) => {
                        e.stopPropagation();
                        if (onMentionClick) onMentionClick(part);
                    }}
                    className="text-primary font-bold hover:underline cursor-pointer select-all"
                >
                    {part}
                </span>
            );
        }
        return part;
    });
};



function AmbientParticles() {
  const count = 50;
  const pointsRef = useRef<THREE.Points>(null);
  const [positions, speeds] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const spd = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 6;     
      pos[i * 3 + 1] = (Math.random() - 0.5) * 6; 
      pos[i * 3 + 2] = (Math.random() - 0.5) * 6; 
      spd[i] = 0.15 + Math.random() * 0.25;
    }
    return [pos, spd];
  }, []);

  useFrame((state) => {
    if (!pointsRef.current) return;
    const time = state.clock.getElapsedTime();
    const posAttr = pointsRef.current.geometry.attributes.position;
    for (let i = 0; i < count; i++) {
      posAttr.array[i * 3 + 1] += Math.sin(time * speeds[i]) * 0.0015;
      posAttr.array[i * 3] += Math.cos(time * speeds[i] * 0.5) * 0.0008;
      posAttr.array[i * 3 + 2] += Math.sin(time * speeds[i] * 0.7) * 0.0008;
    }
    posAttr.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry><bufferAttribute attach="attributes-position" args={[positions, 3]} /></bufferGeometry>
      <pointsMaterial size={0.045} color="#F5F7FA" transparent opacity={0.4} sizeAttenuation depthWrite={false} />
    </points>
  );
}

interface PostCubeRendererProps {
  action: any;
  speed: number;
  initialScramble: string[];
  currentTimelineIndex: number;
}

function PostCubeRenderer({ action, speed, initialScramble, currentTimelineIndex }: PostCubeRendererProps) {
  const { accent } = useTheme();
  const [controlsEnabled, setControlsEnabled] = useState(true);

  const rimColor = useMemo(() => {
    switch (accent) {
      case 'blue': return '#5B7CFA'; 
      case 'purple': return '#A78BFA'; 
      case 'matte-black': return '#9CA3AF'; 
      default: return '#FFFFFF';
    }
  }, [accent]);

  return (
    <div className="w-full h-full relative cursor-default touch-none select-none">
      <Canvas 
        camera={{ position: [3.8, 3.15, 5.0], fov: 40 }} 
        gl={{ antialias: true, alpha: true, stencil: false }} 
        dpr={[1, 1.5]} 
        shadows
      >
        <directionalLight position={[10, 15, 10]} intensity={3.2} color="#FFF6E9" castShadow shadow-mapSize-width={128} shadow-mapSize-height={128} shadow-bias={-0.0001} />
        <directionalLight position={[-12, 8, -12]} intensity={2.5} color={rimColor} />
        <ambientLight intensity={1.0} color="#94A3B8" />
        <hemisphereLight color="#ffffff" groundColor="#0B0F19" intensity={0.6} />
        
        <AmbientParticles />
        <Suspense fallback={null}>
          <AnimatedCube 
            action={action} 
            speed={speed} 
            currentTimelineIndex={currentTimelineIndex}
            setControlsEnabled={setControlsEnabled}
            isLocked={true} 
            initialScramble={initialScramble} 
          />
        </Suspense>
        
        <ContactShadows position={[0, -1.8, 0]} opacity={0.65} scale={8} blur={2.0} far={3} color="#0B0F19" frames={1} resolution={128} />
        
        <OrbitControls 
          makeDefault
          enablePan={false} 
          enableZoom={false} 
          enableRotate={false} 
          dampingFactor={0.06} 
          autoRotate={false} 
          enabled={controlsEnabled} 
          target={[0, 0, 0]}
        />
      </Canvas>
    </div>
  );
}

function PostCubePlayback({ alg, onReset, onUnload }: { alg: string; onReset: () => void; onUnload: () => void }) {
  const steps = useMemo(() => [{ phase: 'Alg', explanation: '', moves: alg }], [alg]);
  
  const { 
    isPlaying, 
    togglePlay, 
    speed, 
    nextMove, 
    prevMove, 
    currentTimelineIndex, 
    totalMoves, 
    action 
  } = useSolvePlayback(steps);

  const initialScramble = useMemo(() => {
    const allMoves = alg.split(' ').filter(Boolean);
    const invert = (m: string) => m.includes("'") ? m.replace("'", "") : m.includes("2") ? m : m + "'";
    return allMoves.reverse().map(invert);
  }, [alg]);

  return (
    <div className="w-full h-full bg-transparent border border-slate-200 dark:border-white/10 rounded-xl overflow-hidden flex flex-col relative">
      {/* 3D Canvas viewport */}
      <div className="flex-1 w-full relative touch-none select-none">
        <PostCubeRenderer 
          action={action} 
          speed={speed} 
          initialScramble={initialScramble} 
          currentTimelineIndex={currentTimelineIndex} 
        />
        
        {/* Unload X button in top-right */}
        <button 
          onClick={onUnload} 
          className="absolute top-2.5 right-2.5 bg-black/40 dark:bg-black/60 hover:bg-red-500/20 hover:text-red-500 border border-slate-200/20 dark:border-white/10 p-1.5 rounded-lg text-slate-400 dark:text-slate-350 transition-colors cursor-pointer active:scale-95 z-20 flex items-center justify-center"
          title="Unload 3D View"
        >
          <X className="w-3.5 h-3.5" />
        </button>

        {/* Step indicator in bottom-right */}
        <div className="absolute bottom-2.5 right-2.5 bg-black/40 dark:bg-black/60 border border-slate-200/20 dark:border-white/10 px-2 py-0.5 rounded text-[10px] font-mono font-bold text-slate-700 dark:text-slate-300 pointer-events-none select-none z-10">
          {Math.max(0, currentTimelineIndex + 1)} / {totalMoves}
        </div>
      </div>

      {/* Control panel */}
      <div className="shrink-0 w-full px-3 py-1.5 bg-slate-100/50 dark:bg-white/[0.02] border-t border-slate-200 dark:border-white/5 flex items-center justify-between z-10">
        {/* Left spacer for centering balance */}
        <div className="flex-1" />

        {/* Centered Playback controls */}
        <div className="flex items-center gap-3.5 justify-center">
          <button 
            onClick={prevMove} 
            disabled={currentTimelineIndex < 0}
            className="p-1 rounded-lg hover:bg-slate-200 hover:dark:bg-white/10 disabled:opacity-40 disabled:hover:bg-transparent text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all active:scale-95 cursor-pointer"
            title="Step Back"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          <button 
            onClick={togglePlay} 
            className="p-1.5 rounded-lg bg-primary hover:bg-primary/80 text-white transition-all active:scale-95 flex items-center justify-center cursor-pointer"
            title={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
          </button>

          <button 
            onClick={nextMove} 
            disabled={currentTimelineIndex >= totalMoves - 1}
            className="p-1 rounded-lg hover:bg-slate-200 hover:dark:bg-white/10 disabled:opacity-40 disabled:hover:bg-transparent text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all active:scale-95 cursor-pointer"
            title="Step Forward"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Far-right Reset button */}
        <div className="flex-1 flex justify-end pr-2">
          <button 
            onClick={onReset} 
            className="p-1 rounded-lg hover:bg-slate-200 hover:dark:bg-white/10 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all active:scale-95 cursor-pointer"
            title="Reset Cube"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

function PostCubeViewer({ alg }: { alg: string }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  const [isBooted, setIsBooted] = useState(false);

  useEffect(() => {
    if (!isLoaded) return;
    const timer = setTimeout(() => {
      setIsBooted(true);
    }, 100);
    return () => clearTimeout(timer);
  }, [isLoaded]);

  const handleReset = () => {
    setResetKey(prev => prev + 1);
  };

  if (!isLoaded) {
    return (
      <div className="w-full h-48 bg-slate-50/50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 rounded-xl flex flex-col items-center justify-center p-4 text-center select-none relative overflow-hidden group">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(148,163,184,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.03)_1px,transparent_1px)] bg-[size:14px_14px] dark:bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] pointer-events-none" />
        
        <div className="relative z-10 flex flex-col items-center gap-3">
          <button
              onClick={() => setIsLoaded(true)}
              className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-white/5 border border-slate-350 dark:border-white/10 rounded-xl hover:bg-slate-200 dark:hover:bg-white/10 hover:border-slate-400 dark:hover:border-white/20 transition-all duration-200 active:scale-95 cursor-pointer select-none"
          >
              Load 3D View
          </button>
        </div>
      </div>
    );
  }

  if (!isBooted) {
    return (
      <div className="w-full h-48 flex flex-col items-center justify-center gap-2 bg-slate-50/50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 rounded-xl">
        <Loader2 className="w-6 h-6 text-primary animate-spin" />
        <span className="text-[10px] font-mono font-bold tracking-widest text-slate-400 dark:text-gray-550 uppercase animate-pulse">Booting 3D View...</span>
      </div>
    );
  }

  return (
    <PostCubePlayback key={resetKey} alg={alg} onReset={handleReset} onUnload={() => {
      setIsLoaded(false);
      setIsBooted(false);
    }} />
  );
}

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

    // Feed Pagination & Filtering states
    const [feedFilter, setFeedFilter] = useState<string>('all');
    const [feedCursor, setFeedCursor] = useState<string | null>(null);
    const [hasMorePosts, setHasMorePosts] = useState(true);
    const [isFetchingMore, setIsFetchingMore] = useState(false);
    const [isPBChecked, setIsPBChecked] = useState(false);

    // Comment states
    const [commentsByPost, setCommentsByPost] = useState<Record<string, CommentData[]>>({});
    const [isLoadingComments, setIsLoadingComments] = useState<Record<string, boolean>>({});
    const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});
    const [newCommentContent, setNewCommentContent] = useState<Record<string, string>>({});
    const [replyingToComment, setReplyingToComment] = useState<Record<string, CommentData | null>>({});
    const [commentSortMode, setCommentSortMode] = useState<Record<string, 'top' | 'new'>>({});
    const [expandedReplies, setExpandedReplies] = useState<Record<string, boolean>>({});

    // Inline Edit states
    const [editingPostId, setEditingPostId] = useState<string | null>(null);
    const [editingPostContent, setEditingPostContent] = useState('');
    const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
    const [editingCommentContent, setEditingCommentContent] = useState('');

    // Custom Modal Confirm states (no localhost alerts/popups)
    const [confirmDeletePost, setConfirmDeletePost] = useState<CommunityPost | null>(null);
    const [confirmDeleteComment, setConfirmDeleteComment] = useState<CommentData | null>(null);

    // Mentions auto-suggest state
    const [mentionSuggestions, setMentionSuggestions] = useState<any[]>([]);
    const [activeMentionPostId, setActiveMentionPostId] = useState<string | null>(null);
    const [activeMentionCommentId, setActiveMentionCommentId] = useState<string | null>(null);

    // Public Profile Modal state & Self-Profile Guard handler
    const [publicProfileHandle, setPublicProfileHandle] = useState<string | null>(null);

    const handleViewProfile = (targetUser: { _id?: string; handle?: string; username?: string }) => {
        if (!targetUser) return;
        const targetHandle = (targetUser.handle || targetUser.username || '').replace(/^@/, '').toLowerCase().trim();
        const myHandle = (user?.username || user?.email?.split('@')[0] || '').toLowerCase().trim();

        const isSelf = (targetUser._id && user?._id && targetUser._id.toString() === user._id.toString()) ||
                       (targetHandle && myHandle && targetHandle === myHandle);

        if (isSelf) {
            setPublicProfileHandle(null);
            setActiveTab('profile');
        } else if (targetHandle) {
            setPublicProfileHandle(targetHandle);
        }
    };

    // Router location & navigation hooks
    const location = useLocation();
    const navigate = useNavigate();

    // Leaderboard Widget State & Datasets
    const [leaderboardTab, setLeaderboardTab] = useState<'wca' | 'community'>('wca');
    const [selectedCubeCategory, setSelectedCubeCategory] = useState<string>('3x3');
    const [isCubeDropdownOpen, setIsCubeDropdownOpen] = useState<boolean>(false);
    const [apiCommunityPBs, setApiCommunityPBs] = useState<any[]>([]);
    const [isLoadingCommunityPBs, setIsLoadingCommunityPBs] = useState<boolean>(true);
    const [pbSubFilter, setPbSubFilter] = useState<'session' | 'phase'>('session');

    // Active 53-Week Challenge State
    interface CompleterUser {
        _id: string;
        name: string;
        handle: string;
        avatar: string;
    }

    interface ActiveChallengeData {
        _id: string;
        weekNumber: number;
        year: number;
        title: string;
        description: string;
        methodFilter: string;
        targetCount: number;
        userProgress: number;
        completers: CompleterUser[];
    }

    const [activeChallenge, setActiveChallenge] = useState<ActiveChallengeData | null>(null);
    const [isLoadingChallenge, setIsLoadingChallenge] = useState<boolean>(true);

    const fetchActiveChallenge = async () => {
        setIsLoadingChallenge(true);
        try {
            const res = await fetch('http://localhost:5000/api/community/challenge/active', {
                headers: getAuthHeaders()
            });
            const data = await res.json();
            if (data.success && data.data) {
                setActiveChallenge(data.data);
            }
        } catch (err) {
            console.error('Failed to fetch active challenge:', err);
        } finally {
            setIsLoadingChallenge(false);
        }
    };

    useEffect(() => {
        fetchActiveChallenge();
    }, []);

    const CUBE_CATEGORIES = [
        { id: '3x3', label: '3x3x3 Cube', disabled: false },
        { id: '2x2', label: '2x2x2 Cube', disabled: true, note: 'Coming soon' },
        { id: '4x4', label: '4x4x4 Cube', disabled: true, note: 'Coming soon' },
        { id: '5x5', label: '5x5x5 Cube', disabled: true, note: 'Coming soon' },
        { id: 'pyraminx', label: 'Pyraminx', disabled: true, note: 'Coming soon' },
        { id: 'megaminx', label: 'Megaminx', disabled: true, note: 'Coming soon' }
    ];

    interface WcaRecordItem {
        rank: number;
        name: string;
        category: string;
        time: string;
        competition: string;
    }

    const [wcaRecords, setWcaRecords] = useState<WcaRecordItem[]>([]);
    const [isLoadingWca, setIsLoadingWca] = useState<boolean>(true);
    const [wcaError, setWcaError] = useState<string | null>(null);

    // Fetch Live WCA World Records from WCA API
    useEffect(() => {
        let isMounted = true;
        const fetchWcaRecords = async () => {
            setIsLoadingWca(true);
            setWcaError(null);
            try {
                const res = await fetch('https://www.worldcubeassociation.org/api/v0/records');
                if (!res.ok) {
                    throw new Error(`WCA API HTTP ${res.status}`);
                }
                const data = await res.json();
                const r333 = data?.world_records?.['333'];
                
                if (r333 && isMounted) {
                    const parsed: WcaRecordItem[] = [];
                    if (r333.single) {
                        const secSingle = (r333.single / 100).toFixed(2);
                        parsed.push({
                            rank: 1,
                            name: 'Teodor Zajder',
                            category: 'Single WR',
                            time: `${secSingle}s`,
                            competition: 'Official WCA World Record'
                        });
                    }
                    if (r333.average) {
                        const secAvg = (r333.average / 100).toFixed(2);
                        parsed.push({
                            rank: 2,
                            name: 'Yiheng Wang (王艺衡)',
                            category: 'Ao5 WR',
                            time: `${secAvg}s`,
                            competition: 'Official WCA World Record'
                        });
                    }

                    // Add top benchmark records for display
                    parsed.push(
                        { rank: 3, name: 'Max Park', category: 'Single', time: '3.13s', competition: 'Pride in Long Beach 2023' },
                        { rank: 4, name: 'Xuanyi Geng (耿萱一)', category: 'Ao5', time: '3.88s', competition: 'Guangdong Open 2025' },
                        { rank: 5, name: 'Tymon Kolasiński', category: 'Single', time: '3.41s', competition: 'Warsaw Open 2024' }
                    );

                    setWcaRecords(parsed);
                } else if (isMounted) {
                    setWcaError('WCA 3x3 records not available');
                }
            } catch (err: any) {
                if (isMounted) {
                    console.error('Failed to fetch WCA API records:', err);
                    setWcaError(err?.message || 'Failed to fetch WCA records');
                }
            } finally {
                if (isMounted) {
                    setIsLoadingWca(false);
                }
            }
        };

        fetchWcaRecords();
        return () => {
            isMounted = false;
        };
    }, []);

    // Fetch Cubora PBs directly from dedicated backend endpoint
    const fetchCommunityPBs = async () => {
        setIsLoadingCommunityPBs(true);
        try {
            const res = await fetch('http://localhost:5000/api/community/leaderboard/pbs', {
                headers: getAuthHeaders()
            });
            const data = await res.json();
            if (data.success && Array.isArray(data.data)) {
                setApiCommunityPBs(data.data);
            }
        } catch (err) {
            console.error('Failed to fetch community PBs leaderboard:', err);
        } finally {
            setIsLoadingCommunityPBs(false);
        }
    };

    useEffect(() => {
        if (leaderboardTab === 'community') {
            fetchCommunityPBs();
        }
    }, [leaderboardTab, posts.length]);

    // Compute Cubora Community PBs using server data or relaxed client fallback
    const communityPBs = useMemo(() => {
        if (apiCommunityPBs.length > 0) {
            return apiCommunityPBs;
        }

        const communityMap = new Map<string, { id: string; name: string; avatar: string; handle: string; time: string; rawTime: number; method: string; verificationStatus: 'verified_phase' | 'verified_session' }>();

        posts.forEach(p => {
            if (p.isPB && p.solveData?.time) {
                if (p.solveData.isManual === true) {
                    return; // Exclude manual solves
                }

                // Determine verification status
                let status = p.solveData.verificationStatus;
                if (!status || status === 'unverified') {
                    if (p.solveData.phaseSplits && typeof p.solveData.phaseSplits === 'object' && Object.keys(p.solveData.phaseSplits).length > 0) {
                        status = 'verified_phase';
                    } else {
                        status = 'verified_session';
                    }
                }

                if (status === 'flagged') return;

                const rawSecs = typeof p.solveData.time === 'number' ? p.solveData.time : parseFloat(p.solveData.time);
                if (!isNaN(rawSecs) && rawSecs > 0) {
                    // Safe author normalization (object vs string ID)
                    let authorId: string;
                    let authorName: string;
                    let authorHandle: string;
                    let authorAvatar: string;

                    if (p.author && typeof p.author === 'object') {
                        authorId = p.author._id ? p.author._id.toString() : p.author.name || p._id;
                        authorName = p.author.name || p.author.username || 'Cubora User';
                        authorHandle = p.author.handle || `@${authorName.toLowerCase().replace(/\s+/g, '_')}`;
                        authorAvatar = p.author.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(authorName)}`;
                    } else {
                        authorId = typeof p.author === 'string' ? p.author : p._id;
                        authorName = 'Cubora User';
                        authorHandle = '@cubora_user';
                        authorAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(authorId)}`;
                    }

                    const existing = communityMap.get(authorId);
                    if (!existing || rawSecs < existing.rawTime) {
                        communityMap.set(authorId, {
                            id: authorId,
                            name: authorName,
                            avatar: authorAvatar,
                            handle: authorHandle,
                            time: `${rawSecs.toFixed(2)}s`,
                            rawTime: rawSecs,
                            method: p.solveData.method || 'CFOP',
                            verificationStatus: status as 'verified_phase' | 'verified_session'
                        });
                    }
                }
            }
        });

        return Array.from(communityMap.values())
            .sort((a, b) => a.rawTime - b.rawTime)
            .map((item, index) => ({ ...item, rank: index + 1 }));
    }, [posts, apiCommunityPBs]);

    // Sub-filter community PBs based on session vs phase verification toggle
    const filteredCommunityPBs = useMemo(() => {
        if (pbSubFilter === 'phase') {
            return communityPBs
                .filter(item => item.verificationStatus === 'verified_phase')
                .map((item, index) => ({ ...item, rank: index + 1 }));
        }
        return communityPBs
            .filter(item => item.verificationStatus === 'verified_session')
            .map((item, index) => ({ ...item, rank: index + 1 }));
    }, [communityPBs, pbSubFilter]);

    interface LikedUser {
        _id: string;
        name: string;
        handle: string;
        avatar: string;
    }
    const [highlightedCommentId, setHighlightedCommentId] = useState<string | null>(null);
    const [likesModalPost, setLikesModalPost] = useState<{ id: string; users: LikedUser[] } | null>(null);
    const [isLoadingLikers, setIsLoadingLikers] = useState(false);

    const fetchAndOpenLikers = async (postId: string) => {
        setIsLoadingLikers(true);
        setLikesModalPost({ id: postId, users: [] });
        try {
            const res = await fetch(`http://localhost:5000/api/community/${postId}/likers`, {
                headers: getAuthHeaders()
            });
            const data = await res.json();
            if (data.success) {
                setLikesModalPost({ id: postId, users: data.data || [] });
            }
        } catch (err) {
            console.error('Failed to fetch likers:', err);
        } finally {
            setIsLoadingLikers(false);
        }
    };

    // Intercept location.state payloads from notification dropdown clicks
    useEffect(() => {
        if (location.state?.activeTab === 'profile') {
            setActiveTab('profile');
        }
    }, [location.state]);

    useEffect(() => {
        const state = location.state as {
            openPostId?: string;
            highlightCommentId?: string;
            focusReply?: boolean;
            showLikes?: boolean;
            activeTab?: string;
        } | null;

        if (!state || !state.openPostId) return;

        const { openPostId, highlightCommentId, focusReply, showLikes } = state;

        // 1. Expand the target post's comment section & fetch comments
        setExpandedComments(prev => ({ ...prev, [openPostId]: true }));
        fetchComments(openPostId);

        // 2. Clear location.state immediately after reading so it doesn't re-trigger on page refresh
        navigate(location.pathname, { replace: true, state: {} });

        // 3. Execute smooth scroll and UX actions after DOM update
        setTimeout(() => {
            // Scroll target post card into view
            const postElement = document.getElementById(`post-${openPostId}`);
            if (postElement) {
                postElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }

            // UX Rule 2 ("Mentioned in Comment"): Auto-scroll to exact comment ID & apply temporary CSS pulse/highlight animation
            if (highlightCommentId) {
                setHighlightedCommentId(highlightCommentId);
                setTimeout(() => {
                    const commentElement = document.getElementById(`comment-${highlightCommentId}`);
                    if (commentElement) {
                        commentElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                }, 300);

                // Remove highlight pulse after 3.3 seconds
                setTimeout(() => {
                    setHighlightedCommentId(null);
                }, 3300);
            }

            // UX Rule 3 ("Reply on Post"): Auto-scroll to bottom of thread & focus reply input
            if (focusReply) {
                setTimeout(() => {
                    const threadBottom = document.getElementById(`thread-bottom-${openPostId}`);
                    const replyInput = document.getElementById(`reply-input-${openPostId}`) as HTMLTextAreaElement | null;
                    if (replyInput) {
                        replyInput.focus();
                        replyInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    } else if (threadBottom) {
                        threadBottom.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                }, 300);
            }

            // UX Rule 4 ("New Likes"): Open modal showing real list of users who liked the post
            if (showLikes) {
                fetchAndOpenLikers(openPostId);
            }
        }, 400);
    }, [location.state]);

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

    // Badge equip states
    const [isEquipModalOpen, setIsEquipModalOpen] = useState(false);
    const [selectedSlotIndex, setSelectedSlotIndex] = useState<number | null>(null);

    const handleEquipClick = (slotIndex: number) => {
        setSelectedSlotIndex(slotIndex);
        setIsEquipModalOpen(true);
    };

    const handleEquipBadge = async (badgeId: string | null) => {
        if (selectedSlotIndex === null) return;
        try {
            const currentEquipped = [...(user?.equippedBadges || [null, null, null])];
            while (currentEquipped.length < 3) currentEquipped.push(null);
            
            currentEquipped[selectedSlotIndex] = badgeId;

            const res = await fetch('http://localhost:5000/api/auth/profile', {
                method: 'PUT',
                headers: {
                    ...getAuthHeaders(),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ equippedBadges: currentEquipped })
            });
            const data = await res.json();
            if (data.success) {
                await refetchUser();
            }
        } catch (err) {
            console.error('Failed to equip badge:', err);
        } finally {
            setIsEquipModalOpen(false);
            setSelectedSlotIndex(null);
        }
    };

    // Attachment states
    const [attachedSolve, setAttachedSolve] = useState<any | null>(null);
    const [attachedAlg, setAttachedAlg] = useState<{ alg: string; algType: string } | null>(null);
    const [isSolvePickerOpen, setIsSolvePickerOpen] = useState(false);
    const [isAlgInputOpen, setIsAlgInputOpen] = useState(false);
    const [allSolves, setAllSolves] = useState<any[]>([]);
    const [isLoadingSolves, setIsLoadingSolves] = useState(false);
    const [algText, setAlgText] = useState('');
    const [algName, setAlgName] = useState('');

    const handleAppendMove = (move: string) => {
        setAlgText(prev => {
            const trimmed = prev.trim();
            return trimmed ? `${trimmed} ${move}` : move;
        });
    };

    const handleBackspaceMove = () => {
        setAlgText(prev => {
            const moves = prev.trim().split(' ').filter(Boolean);
            if (moves.length === 0) return '';
            moves.pop();
            return moves.join(' ');
        });
    };

    // --- FETCH COMMUNITY FEED ---
    const fetchPosts = async (cursor: string | null, filter: string, append = false) => {
        if (!cursor) setIsLoadingFeed(true);
        else setIsFetchingMore(true);

        try {
            const url = `http://localhost:5000/api/community?limit=10&filter=${filter}${cursor ? `&cursor=${cursor}` : ''}`;
            const res = await fetch(url, { 
                headers: getAuthHeaders() 
            });
            const data = await res.json();
            if (data.success) {
                if (append) {
                    setPosts(prev => {
                        const existingIds = new Set(prev.map(p => p._id));
                        const filteredNew = data.data.filter((p: any) => !existingIds.has(p._id));
                        return [...prev, ...filteredNew];
                    });
                } else {
                    setPosts(data.data);
                }
                setHasMorePosts(data.pagination.hasMore);
                setFeedCursor(data.pagination.nextCursor);
            }
        } catch (err) {
            console.error('Failed to load community feed:', err);
        } finally {
            setIsLoadingFeed(false);
            setIsFetchingMore(false);
        }
    };

    // Trigger fetch on filter change
    useEffect(() => {
        if (activeTab === 'feed') {
            fetchPosts(null, feedFilter, false);
        }
    }, [feedFilter, activeTab]);

    // Infinite scroll listener
    useEffect(() => {
        const handleScroll = () => {
            if (activeTab !== 'feed' || !hasMorePosts || isFetchingMore || isLoadingFeed) return;
            
            const threshold = 150;
            const isNearBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - threshold;
            if (isNearBottom && feedCursor) {
                fetchPosts(feedCursor, feedFilter, true);
            }
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [activeTab, feedCursor, feedFilter, hasMorePosts, isFetchingMore, isLoadingFeed]);

    // --- MENTIONS AUTOCOMPLETE HANDLERS ---
    const handleSearchMentions = async (query: string) => {
        try {
            const res = await fetch(`http://localhost:5000/api/community/users/search?query=${encodeURIComponent(query)}`, {
                headers: getAuthHeaders()
            });
            const data = await res.json();
            if (data.success) {
                let list = data.data || [];
                if (query && query.trim()) {
                    const q = query.toLowerCase().trim();
                    list = list.filter((u: any) => 
                        u.handle.toLowerCase().startsWith(q) || 
                        u.handle.toLowerCase().startsWith(`@${q}`) ||
                        u.name.toLowerCase().startsWith(q) ||
                        u.name.toLowerCase().split(' ').some((word: string) => word.startsWith(q))
                    );
                }
                setMentionSuggestions(list);
            }
        } catch (err) {
            console.error('Failed to search user mentions:', err);
        }
    };

    const handleInputText = (text: string, setContent: (val: string) => void, postId: string | null = null, commentId: string | null = null) => {
        setContent(text);
        
        // Deactivate reply target state when the comment is fully cleared
        if (postId && commentId === 'commentInput') {
            if (text.trim() === '') {
                setReplyingToComment(prev => ({ ...prev, [postId]: null }));
            }
        }
        
        const match = text.match(/@([a-zA-Z0-9_.-]*)$/);
        if (match) {
            const query = match[1];
            setActiveMentionPostId(postId);
            setActiveMentionCommentId(commentId);
            handleSearchMentions(query);
        } else {
            setMentionSuggestions([]);
            setActiveMentionPostId(null);
            setActiveMentionCommentId(null);
        }
    };

    const handleSelectMention = (userHandle: string, currentText: string, setContent: (val: string) => void) => {
        const cleanHandle = userHandle.replace(/^@/, '');
        const newText = currentText.replace(/@([a-zA-Z0-9_.-]*)$/, `@${cleanHandle} `);
        setContent(newText);
        setMentionSuggestions([]);
        setActiveMentionPostId(null);
        setActiveMentionCommentId(null);
    };

    const handleKeyDown = (
        _e: React.KeyboardEvent<HTMLTextAreaElement | HTMLInputElement>,
        _setContent: (val: string) => void,
        _postId: string | null = null,
        _commentId: string | null = null
    ) => {
        // Allow standard character-by-character backspace & typing behavior
    };

    // --- SCROLL TO REPLY BOX ---
    useEffect(() => {
        const activeReplyBox = document.querySelector('[data-reply-input-active="true"]');
        if (activeReplyBox) {
            const timer = setTimeout(() => {
                activeReplyBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [replyingToComment]);

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
                            let bestSolve: any = null;
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
                if (achievData.success && achievData.data) {
                    const mapped = achievData.data.map((ach: any) => ({
                        ...ach,
                        isAchieved: ach.isUnlocked,
                        achievedAt: ach.unlockedAt
                    }));
                    setAchievements(mapped);
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
                    scramble: attachedSolve.scramble,
                    phaseSplits: attachedSolve.phaseSplits,
                    verificationStatus: attachedSolve.verificationStatus,
                    isManual: attachedSolve.isManual || false
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
                    solveData,
                    isPB: isPBChecked
                }),
            });
            const data = await res.json();
            if (data.success) {
                setPosts(prev => [data.data, ...prev]);
                setNewPostContent('');
                setAttachedSolve(null);
                setAttachedAlg(null);
                setIsPBChecked(false);
                if (textareaRef.current) textareaRef.current.style.height = 'auto';
                if (isPBChecked) {
                    fetchCommunityPBs();
                }
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

    // --- FETCH COMMENTS ---
    const fetchComments = async (postId: string) => {
        setIsLoadingComments(prev => ({ ...prev, [postId]: true }));
        try {
            const res = await fetch(`http://localhost:5000/api/community/${postId}/comments`, {
                headers: getAuthHeaders()
            });
            const data = await res.json();
            if (data.success) {
                setCommentsByPost(prev => ({ ...prev, [postId]: data.data }));
            }
        } catch (err) {
            console.error('Failed to fetch comments:', err);
        } finally {
            setIsLoadingComments(prev => ({ ...prev, [postId]: false }));
        }
    };

    const toggleCommentsExpand = (postId: string) => {
        const isExpanded = !expandedComments[postId];
        setExpandedComments(prev => ({ ...prev, [postId]: isExpanded }));
        if (isExpanded) {
            fetchComments(postId);
        }
    };

    const getRootParentId = (c: CommentData, allComments: CommentData[]): string | null => {
        if (c.parentId === null) return null;
        let currentParentId = c.parentId;
        const visited = new Set<string>();
        while (currentParentId !== null) {
            if (visited.has(currentParentId)) break;
            visited.add(currentParentId);
            const parent = allComments.find(p => p._id === currentParentId);
            if (!parent) break;
            if (parent.parentId === null) {
                return parent._id;
            }
            currentParentId = parent.parentId;
        }
        return currentParentId;
    };

    // --- CREATE COMMENT ---
    const handleCreateComment = async (postId: string) => {
        const content = newCommentContent[postId] || '';
        if (!content.trim()) return;

        const replyingTo = replyingToComment[postId];
        const postComments = commentsByPost[postId] || [];
        const absoluteParentId = replyingTo ? (getRootParentId(replyingTo, postComments) || replyingTo._id) : null;

        try {
            const res = await fetch(`http://localhost:5000/api/community/${postId}/comments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
                body: JSON.stringify({
                    content: content.trim(),
                    parentId: absoluteParentId
                })
            });
            const data = await res.json();
            if (data.success) {
                setCommentsByPost(prev => ({
                    ...prev,
                    [postId]: [...(prev[postId] || []), data.data]
                }));
                setNewCommentContent(prev => ({ ...prev, [postId]: '' }));
                setReplyingToComment(prev => ({ ...prev, [postId]: null }));
                setPosts(prev => prev.map(p => p._id === postId ? { ...p, commentCount: p.commentCount + 1 } : p));
            }
        } catch (err) {
            console.error('Failed to create comment:', err);
        }
    };

    // --- TOGGLE COMMENT LIKE ---
    const handleToggleCommentLike = async (postId: string, commentId: string) => {
        setCommentsByPost(prev => {
            const postComments = prev[postId] || [];
            return {
                ...prev,
                [postId]: postComments.map(c => c._id === commentId ? {
                    ...c,
                    isLikedByMe: !c.isLikedByMe,
                    likes: c.isLikedByMe ? c.likes - 1 : c.likes + 1
                } : c)
            };
        });

        try {
            await fetch(`http://localhost:5000/api/community/comments/${commentId}/like`, {
                method: 'PUT',
                headers: getAuthHeaders()
            });
        } catch (err) {
            console.error('Failed to toggle comment like:', err);
        }
    };

    // --- EDIT POST ---
    const handleEditPost = async (postId: string, newContent: string) => {
        if (!newContent.trim()) return;
        try {
            const res = await fetch(`http://localhost:5000/api/community/${postId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
                body: JSON.stringify({ content: newContent.trim() })
            });
            const data = await res.json();
            if (data.success) {
                setPosts(prev => prev.map(p => p._id === postId ? { ...p, content: data.data.content } : p));
                setEditingPostId(null);
                setEditingPostContent('');
            }
        } catch (err) {
            console.error('Failed to edit post:', err);
        }
    };

    // --- DELETE POST ---
    const handleDeletePost = async (postId: string) => {
        try {
            const res = await fetch(`http://localhost:5000/api/community/${postId}`, {
                method: 'DELETE',
                headers: getAuthHeaders()
            });
            const data = await res.json();
            if (data.success) {
                setPosts(prev => prev.filter(p => p._id !== postId));
                setConfirmDeletePost(null);
            }
        } catch (err) {
            console.error('Failed to delete post:', err);
        }
    };

    // --- EDIT COMMENT ---
    const handleEditComment = async (postId: string, commentId: string, newContent: string) => {
        if (!newContent.trim()) return;
        try {
            const res = await fetch(`http://localhost:5000/api/community/comments/${commentId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
                body: JSON.stringify({ content: newContent.trim() })
            });
            const data = await res.json();
            if (data.success) {
                setCommentsByPost(prev => ({
                    ...prev,
                    [postId]: (prev[postId] || []).map(c => c._id === commentId ? { ...c, content: data.data.content } : c)
                }));
                setEditingCommentId(null);
                setEditingCommentContent('');
            }
        } catch (err) {
            console.error('Failed to edit comment:', err);
        }
    };

    // --- DELETE COMMENT ---
    const handleDeleteComment = async (postId: string, commentId: string) => {
        try {
            const res = await fetch(`http://localhost:5000/api/community/comments/${commentId}`, {
                method: 'DELETE',
                headers: getAuthHeaders()
            });
            const data = await res.json();
            if (data.success) {
                const commentsList = commentsByPost[postId] || [];
                
                const getAllDescendantIds = (id: string): string[] => {
                    const ids: string[] = [];
                    const findChildren = (parentId: string) => {
                        commentsList.forEach(c => {
                            if (c.parentId === parentId) {
                                ids.push(c._id);
                                findChildren(c._id);
                            }
                        });
                    };
                    findChildren(id);
                    return ids;
                };

                const descendantIds = getAllDescendantIds(commentId);
                const idsToRemove = new Set([commentId, ...descendantIds]);
                const totalDeleted = idsToRemove.size;

                // Update posts count outside the comments updater callback to prevent double execution in StrictMode
                setPosts(prevPosts => prevPosts.map(p => p._id === postId ? { ...p, commentCount: Math.max(0, p.commentCount - totalDeleted) } : p));

                setCommentsByPost(prev => ({
                    ...prev,
                    [postId]: (prev[postId] || []).filter(c => !idsToRemove.has(c._id))
                }));
                
                setConfirmDeleteComment(null);
            }
        } catch (err) {
            console.error('Failed to delete comment:', err);
        }
    };


    return (
        <PageTransition className="w-full flex flex-col gap-5 sm:gap-6 pb-12 min-h-screen px-3.5 sm:px-0 text-left">

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

            <div className="w-full relative">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: activeTab === 'feed' ? 1 : 0 }}
                    transition={{ duration: 0.2 }}
                    className={clsx(
                        "grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6 w-full",
                        activeTab === 'feed' ? "block" : "hidden"
                    )}
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
                                    <div className="relative w-full">
                                        <textarea
                                            ref={textareaRef}
                                            value={newPostContent}
                                            onChange={(e) => handleInputText(e.target.value, setNewPostContent, null, null)}
                                            onKeyDown={(e) => handleKeyDown(e, setNewPostContent)}
                                            placeholder="Share a solve, algorithm, or thought..."
                                            className="w-full bg-transparent text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-gray-550 outline-none resize-none min-h-[64px] text-sm leading-relaxed"
                                            onInput={(e) => {
                                                const target = e.target as HTMLTextAreaElement;
                                                target.style.height = 'auto';
                                                target.style.height = target.scrollHeight + 'px';
                                            }}
                                        />

                                        {mentionSuggestions.length > 0 && activeMentionPostId === null && activeMentionCommentId === null && (
                                            <div className="absolute z-[100] left-0 top-full mt-1 bg-white dark:bg-[#181A1C] border border-slate-200 dark:border-white/10 rounded-xl shadow-lg p-1.5 w-60 max-h-48 overflow-y-auto flex flex-col gap-1">
                                                {mentionSuggestions.map((u: any) => (
                                                    <button
                                                        key={u._id}
                                                        type="button"
                                                        onClick={() => handleSelectMention(u.handle, newPostContent, setNewPostContent)}
                                                        className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 text-left w-full text-xs transition-colors"
                                                    >
                                                        <img src={u.avatar} className="w-5 h-5 rounded-full object-cover shrink-0" />
                                                        <div className="flex-1 min-w-0">
                                                            <span className="font-bold text-slate-900 dark:text-white block truncate leading-none mb-0.5">{u.name}</span>
                                                            <span className="text-[10px] text-slate-500 dark:text-gray-400 block truncate">@{u.handle}</span>
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Attachment Previews */}
                                    {attachedSolve && (
                                        <div className="w-full bg-slate-50/50 dark:bg-black/35 border border-slate-200 dark:border-white/10 rounded-2xl p-4 mb-3 flex flex-col gap-3 text-left">
                                            <div className="flex items-center justify-between gap-3">
                                                <div className="flex items-center gap-3.5 min-w-0 flex-1">
                                                    <div className="w-11 h-11 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center shrink-0">
                                                        <Clock className="w-5 h-5 text-slate-500 dark:text-gray-400" />
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white block leading-none mb-1.5">
                                                            {(attachedSolve.timeMs / 1000).toFixed(3)}s Solve ({attachedSolve.method})
                                                        </span>
                                                        <span className="text-[10px] font-mono text-slate-400 dark:text-gray-500 block truncate max-w-full leading-normal select-all">
                                                            {attachedSolve.scramble}
                                                        </span>
                                                    </div>
                                                </div>
                                                <button 
                                                    onClick={() => { setAttachedSolve(null); setIsPBChecked(false); }} 
                                                    className="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-500 dark:text-gray-400 transition-colors shrink-0"
                                                >
                                                    <X className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                            <div className="flex items-center gap-2 border-t border-slate-200 dark:border-white/5 pt-2.5 mt-0.5">
                                                <input
                                                    type="checkbox"
                                                    id="pb-checkbox"
                                                    checked={isPBChecked}
                                                    onChange={(e) => setIsPBChecked(e.target.checked)}
                                                    className="rounded border-slate-350 dark:border-white/10 text-primary focus:ring-primary w-3.5 h-3.5 cursor-pointer"
                                                />
                                                <label htmlFor="pb-checkbox" className="text-[10px] font-bold text-slate-650 dark:text-gray-300 cursor-pointer flex items-center gap-1.5">
                                                    <Trophy className="w-3.5 h-3.5 text-amber-500" /> Mark as Personal Best (PB)
                                                </label>
                                            </div>
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
                            <div className="flex flex-row flex-nowrap gap-2 overflow-x-auto pb-1.5 w-full border-b border-slate-200 dark:border-white/5 scrollbar-none">
                                {[
                                    { id: 'all', label: 'All Feed' },
                                    { id: 'solve', label: 'Solves', icon: Clock },
                                    { id: 'pb', label: 'PBs Only', icon: Trophy },
                                    { id: 'algorithm', label: 'Algorithms', icon: Brain },
                                    { id: 'discussion', label: 'Discussions', icon: MessageSquare }
                                ].map((filterItem) => {
                                    const isMethodFilter = !['all', 'solve', 'pb', 'algorithm', 'discussion'].includes(feedFilter);
                                    const isSelected = feedFilter === filterItem.id || (filterItem.id === 'solve' && isMethodFilter);
                                    const IconComponent = 'icon' in filterItem ? filterItem.icon : null;
                                    const displayLabel = filterItem.id === 'solve' && isMethodFilter 
                                        ? `Solves: ${feedFilter}` 
                                        : filterItem.label;
                                    
                                    return (
                                        <button
                                            key={filterItem.id}
                                            onClick={() => {
                                                if (filterItem.id === 'solve' && isMethodFilter) {
                                                    setFeedFilter('solve');
                                                } else {
                                                    setFeedFilter(filterItem.id);
                                                }
                                            }}
                                            className={clsx(
                                                "px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 cursor-pointer border active:scale-95 flex items-center gap-1.5 shrink-0",
                                                isSelected 
                                                    ? "bg-primary text-white border-primary shadow-[0_0_15px_rgba(59,130,246,0.2)]" 
                                                    : "bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/5 text-slate-500 hover:text-slate-900 dark:text-gray-400 dark:hover:text-white"
                                            )}
                                        >
                                            {IconComponent && <IconComponent className={clsx("w-3.5 h-3.5", isSelected ? "text-white" : "text-slate-500 dark:text-gray-400")} />}
                                            {displayLabel}
                                        </button>
                                    );
                                })}
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
                                    <>
                                        {posts.map((post) => (
                                            <div key={post._id} id={`post-${post._id}`} className="glass-panel p-4 sm:p-6 flex flex-col bg-white/40 dark:bg-white/[0.01] w-full">
                                                <div className="flex justify-between items-start gap-3 mb-3.5 w-full">
                                                    <div className="flex items-start gap-3 min-w-0 flex-1">
                                                        <img 
                                                            src={post.author.avatar} 
                                                            alt={post.author.name} 
                                                            loading="lazy" 
                                                            onClick={() => handleViewProfile(post.author)}
                                                            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-slate-900 shrink-0 object-cover mt-0.5 cursor-pointer hover:opacity-80 transition-opacity" 
                                                        />
                                                        <div className="min-w-0 flex-1">
                                                            {/* Name + Badges inline on the right of name */}
                                                            <div className="flex items-center flex-wrap gap-1.5">
                                                                <h4 
                                                                    onClick={() => handleViewProfile(post.author)}
                                                                    className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm leading-snug cursor-pointer hover:underline"
                                                                >
                                                                    {post.author.name}
                                                                </h4>
                                                                
                                                                {post.isPB && (
                                                                    <span className="inline-flex items-center gap-0.5 text-[8px] sm:text-[9px] font-bold uppercase tracking-wider text-amber-500 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded shrink-0">
                                                                        <Trophy className="w-2.5 h-2.5 text-amber-500 mr-0.5" /> PB
                                                                    </span>
                                                                )}

                                                                {post.type === 'solve' && (
                                                                    <span className="text-[9px] font-bold uppercase tracking-widest text-primary bg-primary/5 dark:bg-primary/10 border border-primary/20 px-1.5 py-0.5 rounded shrink-0">
                                                                        Verified
                                                                    </span>
                                                                )}

                                                                {post.type === 'solve' && post.solveData?.method && (
                                                                    <button
                                                                        onClick={() => setFeedFilter(post.solveData!.method!)}
                                                                        className={clsx(
                                                                            "relative overflow-hidden inline-flex items-center justify-center font-display font-medium rounded-lg shrink-0",
                                                                            "transition-[transform,opacity,background-color,border-color,box-shadow] duration-200 ease-[cubic-bezier(0.34,1.56,0.64,1)]",
                                                                            "hover:-translate-y-0.5 hover:scale-[1.04] active:scale-[0.95] active:translate-y-0",
                                                                            "bg-gradient-to-r from-primary to-secondary text-white btn-glow border border-slate-200/20 dark:border-white/20",
                                                                            "before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent before:-translate-x-full hover:before:translate-x-full before:transition-transform before:duration-1000 before:ease-out",
                                                                            "text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 cursor-pointer select-none"
                                                                        )}
                                                                        title={`Filter by ${post.solveData.method}`}
                                                                    >
                                                                        <span className="relative z-10">{post.solveData.method}</span>
                                                                    </button>
                                                                )}

                                                                {post.type === 'algorithm' && (
                                                                    <span className="text-[9px] font-bold uppercase tracking-widest text-secondary bg-secondary/5 dark:bg-secondary/10 border border-secondary/20 px-1.5 py-0.5 rounded shrink-0">
                                                                        Alg
                                                                    </span>
                                                                )}
                                                            </div>

                                                            {/* Handle & Time block below name + badges */}
                                                            <span 
                                                                onClick={() => handleViewProfile(post.author)}
                                                                className="text-[11px] text-slate-400 dark:text-gray-550 font-mono block mt-0.5 cursor-pointer hover:underline"
                                                            >
                                                                {post.author.handle} <span className="text-slate-300 dark:text-gray-600 opacity-60">•</span> {post.timeAgo}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {/* Post Action Icons */}
                                                    {post.author._id === user?._id && (
                                                        <div className="flex items-center gap-1 shrink-0 ml-1">
                                                            <button
                                                                onClick={() => {
                                                                    setEditingPostId(post._id);
                                                                    setEditingPostContent(post.content);
                                                                }}
                                                                className="p-1.5 text-slate-400 hover:text-primary transition-colors cursor-pointer rounded-lg hover:bg-slate-100 dark:hover:bg-white/5"
                                                                title="Edit Post"
                                                            >
                                                                <Edit2 className="w-3.5 h-3.5" />
                                                            </button>
                                                            <button
                                                                onClick={() => setConfirmDeletePost(post)}
                                                                className="p-1.5 text-slate-400 hover:text-red-400 transition-colors cursor-pointer rounded-lg hover:bg-slate-100 dark:hover:bg-white/5"
                                                                title="Delete Post"
                                                                >
                                                                <Trash2 className="w-3.5 h-3.5" />
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>

                                                {editingPostId === post._id ? (
                                                    <div className="flex flex-col gap-2 mb-4 w-full relative">
                                                        <textarea
                                                            value={editingPostContent}
                                                            onChange={(e) => handleInputText(e.target.value, setEditingPostContent, post._id, null)}
                                                            onKeyDown={(e) => handleKeyDown(e, setEditingPostContent)}
                                                            className="w-full bg-slate-50 dark:bg-black/45 border border-slate-200 dark:border-white/10 rounded-xl p-3 text-xs sm:text-sm text-slate-900 dark:text-white focus:border-primary outline-none resize-y min-h-[72px]"
                                                        />
                                                        
                                                        {mentionSuggestions.length > 0 && activeMentionPostId === post._id && activeMentionCommentId === null && (
                                                            <div className="absolute z-[100] left-0 top-full mt-1 bg-white dark:bg-[#181A1C] border border-slate-200 dark:border-white/10 rounded-xl shadow-lg p-1.5 w-60 max-h-48 overflow-y-auto flex flex-col gap-1">
                                                                {mentionSuggestions.map((u: any) => (
                                                                    <button
                                                                        key={u._id}
                                                                        type="button"
                                                                        onClick={() => handleSelectMention(u.handle, editingPostContent, setEditingPostContent)}
                                                                        className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 text-left w-full text-xs transition-colors"
                                                                    >
                                                                        <img src={u.avatar} className="w-5 h-5 rounded-full object-cover shrink-0" />
                                                                        <div className="flex-1 min-w-0">
                                                                            <span className="font-bold text-slate-900 dark:text-white block truncate leading-none mb-0.5">{u.name}</span>
                                                                            <span className="text-[10px] text-slate-500 dark:text-gray-400 block truncate">@{u.handle}</span>
                                                                        </div>
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        )}

                                                        <div className="flex justify-end gap-2">
                                                            <Button
                                                                variant="secondary"
                                                                size="sm"
                                                                onClick={() => {
                                                                    setEditingPostId(null);
                                                                    setEditingPostContent('');
                                                                }}
                                                                className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider w-auto shrink-0"
                                                            >
                                                                Cancel
                                                            </Button>
                                                            <Button
                                                                variant="glow"
                                                                size="sm"
                                                                onClick={() => handleEditPost(post._id, editingPostContent)}
                                                                className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider w-auto shrink-0"
                                                            >
                                                                Save
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <p className="text-slate-700 dark:text-gray-300 text-xs sm:text-sm leading-relaxed mb-4 whitespace-pre-wrap break-words w-full">
                                                        {renderContentWithMentions(post.content)}
                                                    </p>
                                                )}

                                                {/* Rich Data Feed Attachments Layout Row */}
                                                {post.type === 'solve' && post.solveData?.time && (
                                                    <div className="bg-slate-50/50 dark:bg-black/35 border border-slate-200 dark:border-white/10 rounded-2xl p-4 mb-4 flex flex-col gap-3 text-left w-full overflow-hidden">
                                                        <div className="flex items-center gap-3.5 min-w-0 w-full">
                                                            <div className="w-11 h-11 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center shrink-0">
                                                                <Clock className="w-5 h-5 text-slate-500 dark:text-gray-400" />
                                                            </div>
                                                            <div className="min-w-0 flex-1">
                                                                <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white block leading-none mb-1.5">
                                                                    {post.solveData.time} Solve ({post.solveData.method || 'CFOP'})
                                                                </span>
                                                                <span className="text-[10px] font-mono text-slate-400 dark:text-gray-500 block truncate max-w-full leading-normal select-all" title={post.solveData.scramble}>
                                                                    {post.solveData.scramble}
                                                                </span>
                                                            </div>
                                                        </div>

                                                        {post.solveData?.phaseSplits && Object.keys(post.solveData.phaseSplits).length > 0 && (
                                                            <div className="mt-2.5 pt-3.5 border-t border-slate-200 dark:border-white/5 flex flex-col gap-2.5">
                                                                <span className="text-[9px] font-bold text-slate-500 dark:text-gray-400 uppercase tracking-widest block leading-none">
                                                                    Phase Splits Breakdown
                                                                </span>
                                                                
                                                                {/* Multi-segmented stacked progress bar */}
                                                                <div className="h-2 w-full bg-slate-200 dark:bg-white/5 rounded-full overflow-hidden flex">
                                                                    {Object.entries(post.solveData!.phaseSplits!).map(([phase, timeMs], index) => {
                                                                        const totalSplitsTimeMs = Object.values(post.solveData!.phaseSplits!).reduce((sum, val) => sum + val, 0);
                                                                        const percent = totalSplitsTimeMs > 0 ? (timeMs / totalSplitsTimeMs) * 100 : 0;
                                                                        
                                                                        const colors = [
                                                                            'bg-blue-500 dark:bg-blue-600',
                                                                            'bg-emerald-500 dark:bg-emerald-600',
                                                                            'bg-amber-500 dark:bg-amber-600',
                                                                            'bg-purple-500 dark:bg-purple-600',
                                                                            'bg-rose-500 dark:bg-rose-600'
                                                                        ];
                                                                        
                                                                        return (
                                                                            <div 
                                                                                key={phase} 
                                                                                style={{ width: `${percent}%` }} 
                                                                                className={clsx(
                                                                                    "h-full transition-all duration-300",
                                                                                    colors[index % colors.length]
                                                                                )} 
                                                                                title={`${mapPhaseToStandardName(phase, post.solveData!.method || '')}: ${(timeMs / 1000).toFixed(3)}s (${Math.round(percent)}%)`}
                                                                            />
                                                                        );
                                                                    })}
                                                                </div>

                                                                {/* Legend Grid */}
                                                                <div className="grid grid-cols-2 gap-2 mt-1">
                                                                    {Object.entries(post.solveData!.phaseSplits!).map(([phase, timeMs], index) => {
                                                                        const totalSplitsTimeMs = Object.values(post.solveData!.phaseSplits!).reduce((sum, val) => sum + val, 0);
                                                                        const percent = totalSplitsTimeMs > 0 ? (timeMs / totalSplitsTimeMs) * 100 : 0;
                                                                        
                                                                        const dotColors = [
                                                                            'bg-blue-500',
                                                                            'bg-emerald-500',
                                                                            'bg-amber-500',
                                                                            'bg-purple-500',
                                                                            'bg-rose-500'
                                                                        ];
                                                                        
                                                                        return (
                                                                            <div key={phase} className="bg-slate-100/50 dark:bg-white/[0.02] border border-slate-200/50 dark:border-white/5 rounded-xl p-2 flex flex-col gap-0.5">
                                                                                <div className="flex items-center gap-1.5 min-w-0">
                                                                                    <span className={clsx("w-1.5 h-1.5 rounded-full shrink-0", dotColors[index % dotColors.length])} />
                                                                                    <span className="text-[10px] text-slate-500 dark:text-gray-400 font-bold truncate leading-none">
                                                                                        {mapPhaseToStandardName(phase, post.solveData!.method || '')}
                                                                                    </span>
                                                                                </div>
                                                                                <span className="text-[11px] font-mono font-bold text-slate-800 dark:text-gray-200 mt-0.5 pl-3">
                                                                                    {(timeMs / 1000).toFixed(3)}s
                                                                                    <span className="text-[9px] text-slate-400 dark:text-gray-500 ml-1 font-sans font-normal">
                                                                                        ({Math.round(percent)}%)
                                                                                    </span>
                                                                                </span>
                                                                            </div>
                                                                        );
                                                                    })}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

                                                 {post.type === 'algorithm' && post.solveData?.alg && (
                                                      <div className="flex flex-col md:flex-row gap-3.5 mb-4 w-full items-stretch">
                                                          <div className="flex-1 bg-white/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-4 flex flex-col justify-center min-h-[140px] overflow-hidden">
                                                              <span className="text-[10px] font-bold text-slate-500 dark:text-gray-400 block leading-none mb-2.5 uppercase tracking-wide">{post.solveData.algType || 'Algorithm'}</span>
                                                              <code className="text-slate-900 dark:text-white font-mono font-bold tracking-wider text-xs sm:text-sm block break-all select-all leading-relaxed">{post.solveData.alg}</code>
                                                          </div>
                                                          <div className="w-full md:w-44 h-48 shrink-0">
                                                              <PostCubeViewer alg={post.solveData.alg} />
                                                          </div>
                                                      </div>
                                                  )}

                                                <div className="flex items-center gap-5 sm:gap-6 mt-1 pt-3.5 border-t border-slate-200 dark:border-white/5 w-full">
                                                    <div className="flex items-center gap-1.5 min-h-[32px]">
                                                        <button
                                                            onClick={() => handleToggleLike(post._id)}
                                                            className={clsx(
                                                                "flex items-center gap-1 transition-colors group cursor-pointer focus:outline-none",
                                                                post.isLikedByMe ? "text-red-400" : "text-slate-500 dark:text-gray-400 sm:hover:text-red-400"
                                                            )}
                                                            title={post.isLikedByMe ? "Unlike post" : "Like post"}
                                                        >
                                                            <Heart className={clsx("w-4 h-4 shrink-0", post.isLikedByMe && "fill-current")} />
                                                        </button>
                                                        <button
                                                            onClick={() => fetchAndOpenLikers(post._id)}
                                                            className="text-xs font-bold font-mono text-slate-500 dark:text-gray-400 hover:text-slate-800 dark:hover:text-white cursor-pointer focus:outline-none hover:underline"
                                                            title="View people who liked this post"
                                                        >
                                                            {post.likes}
                                                        </button>
                                                    </div>
                                                    <button 
                                                        onClick={() => toggleCommentsExpand(post._id)}
                                                        className={clsx(
                                                            "flex items-center gap-1.5 transition-colors min-h-[32px] px-1 cursor-pointer",
                                                            expandedComments[post._id] ? "text-primary" : "text-slate-500 dark:text-gray-400 sm:hover:text-primary"
                                                        )}
                                                    >
                                                        <MessageSquare className="w-4 h-4 shrink-0" />
                                                        <span className="text-xs font-bold font-mono">{post.commentCount || 0}</span>
                                                    </button>
                                                </div>

                                                {/* Instagram threaded comments section */}
                                                {expandedComments[post._id] && (
                                                    <div className="mt-4 pt-4 border-t border-slate-200 dark:border-white/5 flex flex-col gap-4 text-left w-full">                                                        <div className="flex items-center justify-between pb-1.5 mb-1 border-b border-slate-100 dark:border-white/5">
                                                            <h5 className="text-[10px] font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider">
                                                                Comments ({post.commentCount || 0})
                                                            </h5>
                                                            <div className="flex items-center gap-1.5 shrink-0">
                                                                <button
                                                                    onClick={() => setCommentSortMode(prev => ({ ...prev, [post._id]: 'top' }))}
                                                                    className={clsx(
                                                                        "text-[9px] font-bold px-2 py-0.5 rounded transition-colors cursor-pointer",
                                                                        (commentSortMode[post._id] || 'top') === 'top'
                                                                            ? "bg-slate-100 dark:bg-white/10 text-primary"
                                                                            : "text-slate-500 dark:text-gray-400 hover:text-primary"
                                                                    )}
                                                                >
                                                                    Top
                                                                </button>
                                                                <button
                                                                    onClick={() => setCommentSortMode(prev => ({ ...prev, [post._id]: 'new' }))}
                                                                    className={clsx(
                                                                        "text-[9px] font-bold px-2 py-0.5 rounded transition-colors cursor-pointer",
                                                                        commentSortMode[post._id] === 'new'
                                                                            ? "bg-slate-100 dark:bg-white/10 text-primary"
                                                                            : "text-slate-500 dark:text-gray-400 hover:text-primary"
                                                                    )}
                                                                >
                                                                    Newest
                                                                </button>
                                                            </div>
                                                        </div>

                                                        {isLoadingComments[post._id] ? (
                                                            <div className="flex items-center justify-center py-4 text-slate-500">
                                                                <Loader2 className="w-5 h-5 animate-spin text-primary mr-2" />
                                                                <span className="text-xs">Loading comments...</span>
                                                            </div>
                                                        ) : (
                                                            <div className="flex flex-col gap-3 max-h-80 overflow-y-auto overflow-x-hidden no-scrollbar pr-1">
                                                                {(() => {
                                                                    const postComments = commentsByPost[post._id] || [];
                                                                    if (postComments.length === 0) {
                                                                        return (
                                                                            <div className="text-center py-4 text-slate-500 text-xs">
                                                                                No comments yet. Write one below!
                                                                            </div>
                                                                        );
                                                                    }
                                                                    // Define the recursive comment tree rendering
                                                                    const renderCommentTree = (comment: CommentData, depth: number = 0) => {
                                                                        const commentReplies = depth === 0
                                                                            ? [...postComments.filter(c => getRootParentId(c, postComments) === comment._id)].sort((a, b) => a._id.localeCompare(b._id))
                                                                            : [];
                                                                        const hasReplies = commentReplies.length > 0;
                                                                        const activeReplyComment = replyingToComment[post._id];
                                                                        const activeReplyRootId = activeReplyComment
                                                                            ? (getRootParentId(activeReplyComment, postComments) || activeReplyComment._id)
                                                                            : null;
                                                                        const isReplyingThis = depth === 0 && activeReplyRootId === comment._id;

                                                                        return (
                                                                            <div
                                                                                key={comment._id}
                                                                                id={`comment-${comment._id}`}
                                                                                className={clsx(
                                                                                    "flex flex-col gap-2 relative w-full rounded-2xl transition-all duration-500 p-1.5",
                                                                                    highlightedCommentId === comment._id && "ring-2 ring-primary bg-primary/10 animate-pulse shadow-[0_0_15px_rgba(139,92,246,0.3)]"
                                                                                )}
                                                                            >
                                                                                {/* Comment Row */}
                                                                                <div className="flex items-start gap-2.5 w-full relative">
                                                                                    <img 
                                                                                        src={comment.author.avatar} 
                                                                                        alt={comment.author.name} 
                                                                                        onClick={() => handleViewProfile(comment.author)}
                                                                                        className="w-7 h-7 rounded-full object-cover shrink-0 border border-slate-200 dark:border-white/5 cursor-pointer hover:opacity-80 transition-opacity" 
                                                                                    />
                                                                                    <div className="flex-1 min-w-0 px-1 py-0.5">
                                                                                        <div className="flex justify-between items-start gap-2 mb-0.5">
                                                                                            <div>
                                                                                                <span 
                                                                                                    onClick={() => handleViewProfile(comment.author)}
                                                                                                    className="font-bold text-slate-900 dark:text-white text-xs block leading-none cursor-pointer hover:underline"
                                                                                                >
                                                                                                    {comment.author.name}
                                                                                                </span>
                                                                                                <span 
                                                                                                    onClick={() => handleViewProfile(comment.author)}
                                                                                                    className="text-[9px] text-slate-400 dark:text-gray-550 font-mono cursor-pointer hover:underline"
                                                                                                >
                                                                                                    @{comment.author.handle.replace('@', '')} • {comment.timeAgo}
                                                                                                </span>
                                                                                            </div>
                                                                                            
                                                                                            <div className="flex items-center gap-1.5">
                                                                                                {comment.author._id === user?._id && (
                                                                                                    <div className="flex items-center gap-1 shrink-0">
                                                                                                        <button
                                                                                                            onClick={() => {
                                                                                                                setEditingCommentId(comment._id);
                                                                                                                setEditingCommentContent(comment.content);
                                                                                                            }}
                                                                                                            className="text-slate-400 hover:text-primary transition-colors cursor-pointer"
                                                                                                        >
                                                                                                            <Edit2 className="w-3 h-3" />
                                                                                                        </button>
                                                                                                        <button
                                                                                                            onClick={() => setConfirmDeleteComment(comment)}
                                                                                                            className="text-slate-400 hover:text-red-400 transition-colors cursor-pointer"
                                                                                                        >
                                                                                                            <Trash2 className="w-3 h-3" />
                                                                                                        </button>
                                                                                                    </div>
                                                                                                )}
                                                                                            </div>
                                                                                        </div>

                                                                                        {editingCommentId === comment._id ? (
                                                                                            <div className="flex flex-col gap-1.5 mt-1">
                                                                                                <input
                                                                                                    type="text"
                                                                                                    value={editingCommentContent}
                                                                                                    onChange={(e) => handleInputText(e.target.value, setEditingCommentContent, post._id, comment._id)}
                                                                                                    onKeyDown={(e) => handleKeyDown(e, setEditingCommentContent)}
                                                                                                    className="w-full bg-slate-100 dark:bg-black/35 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:border-primary outline-none"
                                                                                                />
                                                                                                <div className="flex justify-end gap-1.5">
                                                                                                    <button
                                                                                                        onClick={() => {
                                                                                                            setEditingCommentId(null);
                                                                                                            setEditingCommentContent('');
                                                                                                        }}
                                                                                                        className="px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5 cursor-pointer"
                                                                                                    >
                                                                                                        Cancel
                                                                                                    </button>
                                                                                                    <button
                                                                                                        onClick={() => handleEditComment(post._id, comment._id, editingCommentContent)}
                                                                                                        className="px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider bg-primary text-white hover:bg-primary-hover cursor-pointer"
                                                                                                    >
                                                                                                        Save
                                                                                                    </button>
                                                                                                </div>
                                                                                            </div>
                                                                                        ) : (
                                                                                            <p className="text-slate-700 dark:text-gray-300 text-xs leading-relaxed whitespace-pre-wrap break-words">
                                                                                                {renderContentWithMentions(comment.content, (h) => handleViewProfile({ handle: h }))}
                                                                                            </p>
                                                                                        )}

                                                                                        <div className="flex items-center gap-3.5 mt-1 pt-0.5">
                                                                                            <button
                                                                                                onClick={() => handleToggleCommentLike(post._id, comment._id)}
                                                                                                className={clsx(
                                                                                                    "flex items-center gap-1 text-[10px] font-mono transition-colors cursor-pointer",
                                                                                                    comment.isLikedByMe ? "text-red-400" : "text-slate-500 dark:text-gray-400 hover:text-red-400"
                                                                                                )}
                                                                                            >
                                                                                                <Heart className={clsx("w-3 h-3 shrink-0", comment.isLikedByMe && "fill-current")} />
                                                                                                <span>{comment.likes || 0}</span>
                                                                                            </button>
                                                                                                            <button
                                                                                                onClick={() => {
                                                                                                    setReplyingToComment(prev => ({ ...prev, [post._id]: comment }));
                                                                                                    const rootId = getRootParentId(comment, postComments) || comment._id;
                                                                                                    setExpandedReplies(prev => ({ ...prev, [rootId]: true }));
                                                                                                    setNewCommentContent(prev => ({
                                                                                                        ...prev,
                                                                                                        [post._id]: `@${comment.author.handle.replace('@', '')} `
                                                                                                    }));
                                                                                                }}
                                                                                                className="text-[10px] font-bold text-slate-500 dark:text-gray-400 hover:text-primary transition-colors cursor-pointer"
                                                                                            >
                                                                                                Reply
                                                                                            </button>
                                                                                        </div>

                                                                                        {hasReplies && (
                                                                                            <button
                                                                                                onClick={() => setExpandedReplies(prev => ({ ...prev, [comment._id]: !prev[comment._id] }))}
                                                                                                className="flex items-center gap-1 text-[10px] font-bold text-slate-500 hover:text-primary transition-colors cursor-pointer mt-1.5"
                                                                                            >
                                                                                                {expandedReplies[comment._id] ? (
                                                                                                    <>
                                                                                                        <ChevronUp className="w-3 h-3 shrink-0" />
                                                                                                        <span>Hide replies</span>
                                                                                                    </>
                                                                                                ) : (
                                                                                                    <>
                                                                                                        <ChevronDown className="w-3 h-3 shrink-0" />
                                                                                                        <span>View {commentReplies.length} {commentReplies.length === 1 ? 'reply' : 'replies'}</span>
                                                                                                    </>
                                                                                                )}
                                                                                            </button>
                                                                                        )}
                                                                                    </div>
                                                                                </div>

                                                                                {/* Recursively Render Replies & Inline Reply Input */}
                                                                                {(expandedReplies[comment._id] || isReplyingThis) && (
                                                                                    <div className="flex flex-col gap-1 pl-3.5 sm:pl-5 ml-[14px] sm:ml-[20px] relative">
                                                                                        {isReplyingThis && (
                                                                                            <div data-reply-input-active="true" className="flex flex-col gap-2 w-full mb-1 relative">
                                                                                                <div className="flex gap-3 items-center w-full relative pr-2.5 py-3">
                                                                                                    <img src={user?.avatar} alt="Me" className="w-6 h-6 rounded-full object-cover shrink-0 border border-slate-200 dark:border-white/5" />
                                                                                                    <div className="flex-1 relative min-w-0">
                                                                                                        <textarea
                                                                                                            ref={(el) => {
                                                                                                                if (el) {
                                                                                                                    el.style.height = 'auto';
                                                                                                                    if (newCommentContent[post._id]) {
                                                                                                                        el.style.height = `${el.scrollHeight}px`;
                                                                                                                    }
                                                                                                                }
                                                                                                            }}
                                                                                                            rows={1}
                                                                                                            id={`reply-input-${post._id}`}
                                                                                                            value={newCommentContent[post._id] || ''}
                                                                                                            onChange={(e) => handleInputText(e.target.value, (val) => setNewCommentContent(prev => ({ ...prev, [post._id]: val })), post._id, 'commentInput')}
                                                                                                            onKeyDown={(e) => handleKeyDown(e, (val) => setNewCommentContent(prev => ({ ...prev, [post._id]: val })), post._id, 'commentInput')}
                                                                                                            placeholder="Reply to this comment..."
                                                                                                            className="mt-2 w-full min-w-0 bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/10 rounded-2xl px-3 py-3 text-xs text-slate-900 dark:text-white outline-none resize-none leading-normal overflow-y-auto max-h-24 hide-scrollbar"
                                                                                                        />
                                                                                                        {/* Autocomplete mention suggest box inside active inline reply */}
                                                                                                        {mentionSuggestions.length > 0 && activeMentionPostId === post._id && activeMentionCommentId === 'commentInput' && (
                                                                                                            <div className="absolute z-[100] left-0 bottom-full mb-1.5 bg-white dark:bg-[#181A1C] border border-slate-200 dark:border-white/10 rounded-xl shadow-lg p-1.5 w-60 max-h-48 overflow-y-auto flex flex-col gap-1">
                                                                                                                {mentionSuggestions.map((u: any) => (
                                                                                                                    <button
                                                                                                                        key={u._id}
                                                                                                                        type="button"
                                                                                                                        onClick={() => handleSelectMention(u.handle, newCommentContent[post._id] || '', (val) => setNewCommentContent(prev => ({ ...prev, [post._id]: val })))}
                                                                                                                        className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 text-left w-full text-xs transition-colors"
                                                                                                                    >
                                                                                                                        <img src={u.avatar} className="w-5 h-5 rounded-full object-cover shrink-0" />
                                                                                                                        <div className="flex-1 min-w-0">
                                                                                                                            <span className="font-bold text-slate-900 dark:text-white block truncate leading-none mb-0.5">{u.name}</span>
                                                                                                                            <span className="text-[10px] text-slate-550 dark:text-gray-400 block truncate">@{u.handle}</span>
                                                                                                                        </div>
                                                                                                                    </button>
                                                                                                                ))}
                                                                                                            </div>
                                                                                                        )}
                                                                                                        <div id={`thread-bottom-${post._id}`} />
                                                                                                    </div>
                                                                                                    <div className="flex items-center gap-1.5 shrink-0 pr-3 pb-2 pt-1">
                                                                                                        <button
                                                                                                            type="button"
                                                                                                            onClick={() => {
                                                                                                                setReplyingToComment(prev => ({ ...prev, [post._id]: null }));
                                                                                                                setNewCommentContent(prev => ({ ...prev, [post._id]: '' }));
                                                                                                            }}
                                                                                                            className="h-8 w-8 rounded-xl flex items-center justify-center shrink-0 bg-slate-100/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white hover:bg-slate-200/80 dark:hover:bg-white/10 hover:border-slate-300 dark:hover:border-white/20 transition-[transform,opacity,background-color,border-color,box-shadow] duration-200 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:-translate-y-0.5 hover:scale-[1.04] active:scale-[0.95] active:translate-y-0 disabled:opacity-40 disabled:pointer-events-none cursor-pointer focus:outline-none"
                                                                                                            title="Cancel reply"
                                                                                                        >
                                                                                                            <X className="w-3.5 h-3.5" />
                                                                                                        </button>
                                                                                                        <button
                                                                                                            disabled={!(newCommentContent[post._id] || '').trim()}
                                                                                                            onClick={() => handleCreateComment(post._id)}
                                                                                                            className="h-8 w-8 rounded-xl flex items-center justify-center shrink-0 bg-gradient-to-r from-primary to-secondary text-white border border-slate-200/20 dark:border-white/20 shadow-[0_2.5px_8px_var(--btn-glow-shadow)] hover:shadow-[0_4px_12px_var(--btn-glow-shadow)] transition-[transform,opacity,background-color,border-color,box-shadow] duration-200 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:-translate-y-0.5 hover:scale-[1.04] active:scale-[0.95] active:translate-y-0 disabled:opacity-40 disabled:pointer-events-none cursor-pointer focus:outline-none"
                                                                                                            title="Submit reply"
                                                                                                        >
                                                                                                            <Check className="w-3.5 h-3.5" />
                                                                                                        </button>
                                                                                                    </div>
                                                                                                </div>
                                                                                            </div>
                                                                                        )}
                                                                                        {expandedReplies[comment._id] && commentReplies.map((reply) => renderCommentTree(reply, depth + 1))}
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        );
                                                                    };

                                                                    const topLevel = postComments.filter(c => c.parentId === null);
                                                                    const sortMode = commentSortMode[post._id] || 'top';
                                                                    const sortedTopLevel = [...topLevel].sort((a, b) => {
                                                                        if (sortMode === 'top') {
                                                                            const likesA = a.likes || 0;
                                                                            const likesB = b.likes || 0;
                                                                            if (likesA !== likesB) return likesB - likesA;
                                                                            return b._id.localeCompare(a._id);
                                                                        } else {
                                                                            return b._id.localeCompare(a._id);
                                                                        }
                                                                    });
                                                                    return sortedTopLevel.map((comment) => renderCommentTree(comment, 0));
                                                                })()}
                                                            </div>
                                                        )}

                                                        {/* Comment entry textarea and send action */}
                                                        {!replyingToComment[post._id] && (
                                                            <div className="flex gap-3 items-center w-full max-w-full relative">
                                                                <img src={user?.avatar} alt="Me" className="w-7 h-7 rounded-full object-cover shrink-0 border border-slate-200 dark:border-white/5" />
                                                                <div className="flex-1 relative min-w-0">
                                                                    <textarea
                                                                        ref={(el) => {
                                                                            if (el) {
                                                                                el.style.height = 'auto';
                                                                                if (newCommentContent[post._id]) {
                                                                                    el.style.height = `${el.scrollHeight}px`;
                                                                                }
                                                                            }
                                                                        }}
                                                                        rows={1}
                                                                        value={newCommentContent[post._id] || ''}
                                                                        onChange={(e) => handleInputText(e.target.value, (val) => setNewCommentContent(prev => ({ ...prev, [post._id]: val })), post._id, 'commentInput')}
                                                                        onKeyDown={(e) => handleKeyDown(e, (val) => setNewCommentContent(prev => ({ ...prev, [post._id]: val })), post._id, 'commentInput')}
                                                                        placeholder="Write a comment..."
                                                                        className="mt-2 w-full min-w-0 bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/10 rounded-2xl px-3 py-3 text-xs text-slate-900 dark:text-white outline-none resize-none leading-normal overflow-y-auto max-h-24 hide-scrollbar"
                                                                    />

                                                                    {/* Autocomplete mention suggest box inside active comment */}
                                                                    {mentionSuggestions.length > 0 && activeMentionPostId === post._id && activeMentionCommentId === 'commentInput' && (
                                                                        <div className="absolute z-[100] left-0 bottom-full mb-1.5 bg-white dark:bg-[#181A1C] border border-slate-200 dark:border-white/10 rounded-xl shadow-lg p-1.5 w-60 max-h-48 overflow-y-auto flex flex-col gap-1">
                                                                            {mentionSuggestions.map((u: any) => (
                                                                                <button
                                                                                    key={u._id}
                                                                                    type="button"
                                                                                    onClick={() => handleSelectMention(u.handle, newCommentContent[post._id] || '', (val) => setNewCommentContent(prev => ({ ...prev, [post._id]: val })))}
                                                                                    className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 text-left w-full text-xs transition-colors"
                                                                                >
                                                                                    <img src={u.avatar} className="w-5 h-5 rounded-full object-cover shrink-0" />
                                                                                    <div className="flex-1 min-w-0">
                                                                                        <span className="font-bold text-slate-900 dark:text-white block truncate leading-none mb-0.5">{u.name}</span>
                                                                                        <span className="text-[10px] text-slate-550 dark:text-gray-400 block truncate">@{u.handle}</span>
                                                                                    </div>
                                                                                </button>
                                                                            ))}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                
                                                                <Button
                                                                    variant="glow"
                                                                    size="sm"
                                                                    disabled={!(newCommentContent[post._id] || '').trim()}
                                                                    onClick={() => handleCreateComment(post._id)}
                                                                    className="h-8 rounded-xl px-3 text-[10px] font-bold w-auto shrink-0"
                                                                >
                                                                    Send
                                                                </Button>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        ))}

                                        {/* Infinite Scroll Fetching Indicator */}
                                        {isFetchingMore && (
                                            <div className="flex justify-center py-4 w-full text-slate-500">
                                                <Loader2 className="w-6 h-6 animate-spin text-primary mr-2" />
                                                <span className="text-xs">Loading more posts...</span>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Right Column Grid Panel: Leaderboard & Tracking Widget */}
                        <div className="flex flex-col gap-5 sm:gap-6 w-full">

                            {/* Dual-Tab Leaderboard Widget Card */}
                            <div className={clsx("glass-panel p-5 sm:p-6 w-full text-left transition-all relative", isCubeDropdownOpen ? "z-30" : "z-10")}>
                                {/* Header Title & Interactive Cube Selector Dropdown */}
                                <div className="flex items-center justify-between mb-4 w-full pb-3 border-b border-slate-200/60 dark:border-white/5 relative z-20">
                                    <div className="flex items-center gap-2">
                                        <Trophy className="w-5 h-5 text-amber-500 shrink-0" />
                                        <h3 className="font-display font-bold text-slate-900 dark:text-white text-base sm:text-lg">Leaderboard</h3>
                                    </div>
                                    
                                    {/* Cube Category Dropdown */}
                                    <div className="relative">
                                        <button
                                            onClick={() => setIsCubeDropdownOpen(!isCubeDropdownOpen)}
                                            className="text-[10px] font-bold uppercase tracking-wider text-slate-700 dark:text-gray-200 bg-slate-100 dark:bg-white/5 hover:bg-slate-200/80 dark:hover:bg-white/10 px-2.5 py-1 rounded-lg flex items-center gap-1.5 transition-colors border border-slate-200/60 dark:border-white/10 cursor-pointer font-mono select-none"
                                        >
                                            <span>{CUBE_CATEGORIES.find(c => c.id === selectedCubeCategory)?.label || '3x3x3 Cube'}</span>
                                            <ChevronDown className={clsx("w-3 h-3 text-slate-400 transition-transform duration-200", isCubeDropdownOpen && "rotate-180")} />
                                        </button>

                                        <AnimatePresence>
                                            {isCubeDropdownOpen && (
                                                <>
                                                    <div className="fixed inset-0 z-40" onClick={() => setIsCubeDropdownOpen(false)} />
                                                    <motion.div
                                                        initial={{ opacity: 0, y: -4, scale: 0.95 }}
                                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                                        exit={{ opacity: 0, y: -4, scale: 0.95 }}
                                                        transition={{ duration: 0.15 }}
                                                        className="absolute right-0 top-full mt-1.5 w-44 z-50 bg-white dark:bg-[#181A1D] border border-slate-200 dark:border-white/10 rounded-xl shadow-2xl p-1.5 flex flex-col gap-0.5"
                                                    >
                                                        {CUBE_CATEGORIES.map((cat) => (
                                                            <button
                                                                key={cat.id}
                                                                disabled={cat.disabled}
                                                                onClick={() => {
                                                                    if (!cat.disabled) {
                                                                        setSelectedCubeCategory(cat.id);
                                                                        setIsCubeDropdownOpen(false);
                                                                    }
                                                                }}
                                                                className={clsx(
                                                                    "w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between transition-colors",
                                                                    cat.disabled
                                                                        ? "opacity-50 cursor-not-allowed text-slate-400 dark:text-gray-500"
                                                                        : cat.id === selectedCubeCategory
                                                                            ? "bg-primary/10 text-primary font-bold"
                                                                            : "hover:bg-slate-100 dark:hover:bg-white/5 text-slate-700 dark:text-gray-200 cursor-pointer"
                                                                )}
                                                            >
                                                                <span>{cat.label}</span>
                                                                {cat.disabled && (
                                                                    <span className="text-[8.5px] font-bold uppercase tracking-wider text-amber-500/90 bg-amber-500/10 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                                                                        <Lock className="w-2.5 h-2.5" /> Off
                                                                    </span>
                                                                )}
                                                            </button>
                                                        ))}
                                                    </motion.div>
                                                </>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>

                                {/* Dual-Tab Toggle Switch */}
                                <div className="flex items-center p-1 bg-slate-100/80 dark:bg-white/5 rounded-xl border border-slate-200/60 dark:border-white/5 mb-4 relative">
                                    <button
                                        onClick={() => setLeaderboardTab('wca')}
                                        className={clsx(
                                            "flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all relative z-10 cursor-pointer flex items-center justify-center gap-1.5 select-none",
                                            leaderboardTab === 'wca'
                                                ? "text-slate-900 dark:text-white"
                                                : "text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white"
                                        )}
                                    >
                                        {leaderboardTab === 'wca' && (
                                            <motion.div
                                                layoutId="leaderboardTabActive"
                                                className="absolute inset-0 bg-white dark:bg-white/10 rounded-lg shadow-sm"
                                                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                            />
                                        )}
                                        <Globe className="w-3.5 h-3.5 relative z-10 text-cyan-500" />
                                        <span className="relative z-10 truncate">WCA Records</span>
                                    </button>

                                    <button
                                        onClick={() => setLeaderboardTab('community')}
                                        className={clsx(
                                            "flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all relative z-10 cursor-pointer flex items-center justify-center gap-1.5 select-none",
                                            leaderboardTab === 'community'
                                                ? "text-slate-900 dark:text-white"
                                                : "text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white"
                                        )}
                                    >
                                        {leaderboardTab === 'community' && (
                                            <motion.div
                                                layoutId="leaderboardTabActive"
                                                className="absolute inset-0 bg-white dark:bg-white/10 rounded-lg shadow-sm"
                                                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                            />
                                        )}
                                        <Trophy className="w-3.5 h-3.5 relative z-10 text-amber-500" />
                                        <span className="relative z-10 truncate">Cubora PBs</span>
                                    </button>
                                </div>

                                {/* Animated Tab Content */}
                                <AnimatePresence mode="wait">
                                    {leaderboardTab === 'wca' ? (
                                        <motion.div
                                            key="wca-tab"
                                            initial={{ opacity: 0, y: 6 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -6 }}
                                            transition={{ duration: 0.18 }}
                                            className="space-y-2.5 w-full"
                                        >
                                            {isLoadingWca ? (
                                                <div className="flex items-center justify-center py-8 text-slate-400 gap-2">
                                                    <Loader2 className="w-4 h-4 animate-spin text-cyan-500" />
                                                    <span className="text-xs font-medium">Fetching live WCA records...</span>
                                                </div>
                                            ) : wcaError ? (
                                                <div className="flex items-center justify-center py-6 text-red-400 gap-2 bg-red-500/5 rounded-xl border border-red-500/10 px-3">
                                                    <AlertCircle className="w-4 h-4 shrink-0" />
                                                    <span className="text-xs font-medium">{wcaError}</span>
                                                </div>
                                            ) : (
                                                wcaRecords.map((item) => (
                                                    <div key={item.rank} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50/70 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 hover:border-cyan-500/30 transition-all group">
                                                        <div className="flex items-center gap-2.5 min-w-0">
                                                            <span className={clsx(
                                                                "w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold font-mono shrink-0 shadow-sm border",
                                                                item.rank === 1 ? "bg-amber-500/15 text-amber-500 border-amber-500/30" :
                                                                item.rank === 2 ? "bg-slate-300/20 text-slate-400 border-slate-400/20" :
                                                                item.rank === 3 ? "bg-amber-700/15 text-amber-600 border-amber-700/20" :
                                                                "bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-gray-500 border-transparent"
                                                            )}>
                                                                {item.rank}
                                                            </span>

                                                            <div className="flex flex-col min-w-0">
                                                                <div className="flex items-center gap-1.5">
                                                                    <span className="text-xs font-bold text-slate-800 dark:text-gray-200 truncate group-hover:text-primary transition-colors">
                                                                        {item.name}
                                                                    </span>
                                                                    <span className="text-[8.5px] px-1.5 py-0.2 rounded bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 font-bold uppercase tracking-wider shrink-0 flex items-center gap-0.5">
                                                                        <CheckCircle2 className="w-2.5 h-2.5 text-cyan-500" /> WCA
                                                                    </span>
                                                                </div>
                                                                <span className="text-[10px] text-slate-400 dark:text-gray-500 truncate mt-0.5">
                                                                    {item.category} • {item.competition}
                                                                </span>
                                                            </div>
                                                        </div>

                                                        <div className="flex flex-col items-end shrink-0 pl-2">
                                                            <span className="font-mono font-bold text-primary text-xs sm:text-sm">{item.time}</span>
                                                            <span className="text-[8.5px] text-slate-400 dark:text-gray-550 uppercase tracking-widest font-sans">{item.category}</span>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            key="community-tab"
                                            initial={{ opacity: 0, y: 6 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -6 }}
                                            transition={{ duration: 0.18 }}
                                            className="space-y-2.5 w-full"
                                        >
                                            {/* Sub-Filter Verification Toggle Pill Row */}
                                            <div className="flex items-center p-1 bg-slate-100/80 dark:bg-white/5 rounded-xl border border-slate-200/60 dark:border-white/5 mb-3 relative">
                                                <button
                                                    onClick={() => setPbSubFilter('session')}
                                                    className={clsx(
                                                        "flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-colors relative z-10 cursor-pointer flex items-center justify-center gap-1.5 select-none",
                                                        pbSubFilter === 'session'
                                                            ? "text-blue-600 dark:text-blue-400"
                                                            : "text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white"
                                                    )}
                                                >
                                                    {pbSubFilter === 'session' && (
                                                        <motion.div
                                                            layoutId="pbSubFilterActive"
                                                            className="absolute inset-0 bg-white dark:bg-white/10 rounded-lg shadow-sm border border-slate-200/60 dark:border-white/10"
                                                            transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                                        />
                                                    )}
                                                    <span className="relative z-10 truncate flex items-center gap-1.5">
                                                        <span>Session Verified</span>
                                                    </span>
                                                </button>

                                                <button
                                                    onClick={() => setPbSubFilter('phase')}
                                                    className={clsx(
                                                        "flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-colors relative z-10 cursor-pointer flex items-center justify-center gap-1.5 select-none",
                                                        pbSubFilter === 'phase'
                                                            ? "text-emerald-600 dark:text-emerald-400"
                                                            : "text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white"
                                                    )}
                                                >
                                                    {pbSubFilter === 'phase' && (
                                                        <motion.div
                                                            layoutId="pbSubFilterActive"
                                                            className="absolute inset-0 bg-white dark:bg-white/10 rounded-lg shadow-sm border border-slate-200/60 dark:border-white/10"
                                                            transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                                        />
                                                    )}
                                                    <span className="relative z-10 truncate flex items-center gap-1.5">
                                                        <span>Phase Verified</span>
                                                    </span>
                                                </button>
                                            </div>

                                            {isLoadingCommunityPBs && apiCommunityPBs.length === 0 ? (
                                                <div className="flex items-center justify-center py-8 text-slate-400 gap-2">
                                                    <Loader2 className="w-4 h-4 animate-spin text-amber-500" />
                                                    <span className="text-xs font-medium">Fetching community PBs...</span>
                                                </div>
                                            ) : filteredCommunityPBs.length === 0 ? (
                                                <div className="flex flex-col items-center justify-center p-6 text-center rounded-2xl bg-slate-50/50 dark:bg-white/[0.02] border border-dashed border-slate-200 dark:border-white/10 my-1">
                                                    <div className={clsx(
                                                        "w-9 h-9 rounded-full flex items-center justify-center mb-2",
                                                        pbSubFilter === 'phase' ? "bg-emerald-500/10 text-emerald-500" : "bg-amber-500/10 text-amber-500"
                                                    )}>
                                                        <Trophy className="w-4 h-4" />
                                                    </div>
                                                    <h4 className="font-bold text-slate-800 dark:text-white text-xs sm:text-sm mb-1">
                                                        {pbSubFilter === 'phase' ? 'No Phase-Verified PBs shared yet' : 'No Session-Verified PBs shared yet'}
                                                    </h4>
                                                    <p className="text-[11px] text-slate-500 dark:text-gray-400 max-w-[230px] leading-relaxed">
                                                        {pbSubFilter === 'phase'
                                                            ? 'Enable Phase Tracking in the Timer to post one!'
                                                            : 'No standard session-verified PBs shared yet.'}
                                                    </p>
                                                </div>
                                            ) : (
                                                filteredCommunityPBs.map((item) => (
                                                    <div key={item.id} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50/70 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 hover:border-amber-500/30 transition-all group">
                                                        <div className="flex items-center gap-2.5 min-w-0">
                                                            <span className={clsx(
                                                                "w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold font-mono shrink-0 shadow-sm border",
                                                                item.rank === 1 ? "bg-amber-500/15 text-amber-500 border-amber-500/30" :
                                                                item.rank === 2 ? "bg-slate-300/20 text-slate-400 border-slate-400/20" :
                                                                item.rank === 3 ? "bg-amber-700/15 text-amber-600 border-amber-700/20" :
                                                                "bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-gray-500 border-transparent"
                                                            )}>
                                                                {item.rank}
                                                            </span>

                                                            <img 
                                                                src={item.avatar} 
                                                                alt={item.name} 
                                                                onClick={() => handleViewProfile({ handle: item.handle })}
                                                                className="w-6 h-6 rounded-full object-cover shrink-0 border border-slate-200 dark:border-white/10 cursor-pointer hover:opacity-80 transition-opacity" 
                                                            />

                                                            <div className="flex flex-col min-w-0">
                                                                <div className="flex items-center gap-1.5">
                                                                    <span 
                                                                        onClick={() => handleViewProfile({ handle: item.handle })}
                                                                        className="text-xs font-bold text-slate-800 dark:text-gray-200 truncate group-hover:text-amber-500 transition-colors cursor-pointer hover:underline"
                                                                    >
                                                                        {item.name}
                                                                    </span>
                                                                    <span className="text-[8.5px] px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 font-bold uppercase tracking-wider shrink-0 flex items-center gap-0.5">
                                                                        <Trophy className="w-2.5 h-2.5 text-amber-500" /> PB
                                                                    </span>
                                                                </div>
                                                                <span 
                                                                    onClick={() => handleViewProfile({ handle: item.handle })}
                                                                    className="text-[10px] text-slate-400 dark:text-gray-550 truncate mt-0.5 cursor-pointer hover:underline"
                                                                >
                                                                    {item.handle} • {item.method}
                                                                </span>
                                                            </div>
                                                        </div>

                                                        <div className="flex flex-col items-end shrink-0 pl-2">
                                                            <span className="font-mono font-bold text-amber-500 text-xs sm:text-sm">{item.time}</span>
                                                            {item.verificationStatus === 'verified_phase' ? (
                                                                <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-bold tracking-wider shrink-0 flex items-center gap-1 mt-0.5">
                                                                    Phase Verified
                                                                </span>
                                                            ) : (
                                                                <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 font-bold tracking-wider shrink-0 flex items-center gap-1 mt-0.5">
                                                                    Session Verified
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Active Sub-Challenges Framework */}
                            <div className="glass-panel p-5 sm:p-6 border-secondary/20 w-full text-left">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-display font-bold text-slate-900 dark:text-white text-base sm:text-lg">Community Challenge</h3>
                                    {activeChallenge && (
                                        <span className="text-[10px] font-mono font-extrabold uppercase tracking-widest px-2 py-0.5 rounded bg-secondary/15 text-secondary border border-secondary/30">
                                            WEEK {activeChallenge.weekNumber}
                                        </span>
                                    )}
                                </div>

                                {isLoadingChallenge ? (
                                    <div className="flex items-center justify-center py-6 text-slate-400 gap-2">
                                        <Loader2 className="w-4 h-4 animate-spin text-secondary" />
                                        <span className="text-xs font-medium">Loading challenge...</span>
                                    </div>
                                ) : activeChallenge ? (
                                    <>
                                        <div className="flex items-center justify-between gap-2 mb-2">
                                            <h4 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">
                                                {activeChallenge.title}
                                            </h4>
                                            {activeChallenge.userProgress >= activeChallenge.targetCount && (
                                                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded shrink-0 flex items-center gap-1">
                                                    <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Completed!
                                                </span>
                                            )}
                                        </div>

                                        <p className="text-xs text-slate-500 dark:text-gray-400 mb-4 leading-normal">
                                            {activeChallenge.description}
                                        </p>

                                        {/* Overlapping Completer Avatar Ring */}
                                        {activeChallenge.completers && activeChallenge.completers.length > 0 && (
                                            <div className="flex items-center gap-2 mb-3.5 pb-3 border-b border-secondary/10">
                                                <div className="flex -space-x-2 overflow-hidden py-0.5">
                                                    {activeChallenge.completers.slice(0, 5).map((comp) => (
                                                        <img
                                                            key={comp._id}
                                                            src={comp.avatar}
                                                            alt={comp.name}
                                                            title={`${comp.name} (${comp.handle}) - Completed!`}
                                                            onClick={() => handleViewProfile(comp)}
                                                            className="inline-block h-6 w-6 rounded-full ring-2 ring-white dark:ring-[#181A1D] object-cover shrink-0 cursor-pointer hover:scale-110 transition-transform"
                                                        />
                                                    ))}
                                                </div>
                                                <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                                                    <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                                                    {activeChallenge.completers.length} {activeChallenge.completers.length === 1 ? 'solver completed' : 'solvers completed'}
                                                </span>
                                            </div>
                                        )}

                                        {/* Animated Progress Bar */}
                                        {(() => {
                                            const percentage = Math.min(100, Math.round((activeChallenge.userProgress / activeChallenge.targetCount) * 100));
                                            return (
                                                <>
                                                    <div className="w-full h-2 bg-slate-200/40 dark:bg-background rounded-full overflow-hidden mb-2 relative">
                                                        <div
                                                            className="h-full bg-secondary transition-all duration-500 rounded-full"
                                                            style={{ width: `${percentage}%` }}
                                                        />
                                                    </div>
                                                    <div className="flex items-center justify-between text-[11px] font-mono font-bold text-slate-500 dark:text-gray-400">
                                                        <span>{activeChallenge.userProgress} / {activeChallenge.targetCount} Solves</span>
                                                        <span className={percentage === 100 ? "text-emerald-500" : "text-secondary"}>
                                                            {percentage}%
                                                        </span>
                                                    </div>
                                                </>
                                            );
                                        })()}
                                    </>
                                ) : (
                                    <div className="py-4 text-center text-xs text-slate-500">
                                        No active challenge available.
                                    </div>
                                )}
                            </div>
                        </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: activeTab === 'profile' ? 1 : 0 }}
                    transition={{ duration: 0.2 }}
                    className={clsx(
                        "flex flex-col gap-5 sm:gap-6 w-full",
                        activeTab === 'profile' ? "block" : "hidden"
                    )}
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

                                    <div className="px-4 sm:px-8 pb-5 sm:pb-8 w-full flex flex-col lg:flex-row lg:items-center justify-start gap-6 lg:gap-12 mt-5 sm:mt-0">
                                        {/* Left Side: Avatar & Bio */}
                                        <div className="flex flex-col items-center text-center gap-3 sm:gap-4 min-w-0 shrink-0">
                                            {/* Floating Avatar & Settings Link */}
                                            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full relative z-10 shadow-xl overflow-hidden shrink-0 -mt-8 sm:-mt-12">
                                                <img
                                                    loading="lazy"
                                                    src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user?.name || 'Cubora')}`}
                                                    alt="Profile"
                                                    className="w-full h-full rounded-full bg-slate-50 dark:bg-white/5 object-cover"
                                                />
                                            </div>

                                            {/* Bio Identity Summary */}
                                            <div className="flex flex-col items-center text-center min-w-0">
                                                <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white flex items-center justify-center gap-2 tracking-tight">
                                                    {user?.name || 'Cubora User'}
                                                </h2>

                                                {/* Trophy Badge Slots Row */}
                                                <div className="flex items-center justify-center gap-3 my-2.5">
                                                    {[0, 1, 2].map((slotIndex) => {
                                                        const badgeId = user?.equippedBadges?.[slotIndex] || null;
                                                        const activeAch = achievements.find(a => a.id === badgeId);
                                                        const IconComponent = activeAch ? (ICON_MAP[activeAch.icon] || Trophy) : null;
                                                        
                                                        const tier = badgeId ? badgeId.substring(badgeId.lastIndexOf('-') + 1).toLowerCase() : null;
                                                        const badgeColorClass = tier ? (TierColors[tier] || '') : '';

                                                        return (
                                                            <button
                                                                key={slotIndex}
                                                                onClick={() => handleEquipClick(slotIndex)}
                                                                className={clsx(
                                                                    "w-10 h-10 rounded-xl border flex items-center justify-center transition-all cursor-pointer",
                                                                    badgeId 
                                                                        ? `${badgeColorClass} hover:scale-105` 
                                                                        : "border-dashed border-slate-300 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02] hover:bg-slate-100 dark:hover:bg-white/[0.05] text-slate-400 dark:text-gray-500"
                                                                )}
                                                            >
                                                                {IconComponent ? (
                                                                    <IconComponent className="w-5 h-5" />
                                                                ) : (
                                                                    <Plus className="w-4 h-4 opacity-60" />
                                                                )}
                                                            </button>
                                                        );
                                                    })}
                                                </div>

                                                <p className="text-slate-500 dark:text-gray-400 font-mono text-xs sm:text-sm mt-1">
                                                    @{(user?.username || user?.email || '').split('@')[0]} • {getJoinedDuration(user?.createdAt)}
                                                </p>
                                                <div className="mt-3 text-center">
                                                    <span className="inline-block font-mono text-slate-600 dark:text-gray-400 text-xs sm:text-sm italic bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 rounded-xl px-4 py-2 w-fit">
                                                        "{user?.about || 'Speedcuber'}"
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Right Side: Performance Metrics Grid */}
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 sm:gap-4 flex-grow w-full">
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
                                    </div>
                                    {achievements.length === 0 ? (
                                        <div className="glass-panel p-8 text-center text-slate-500 w-full">
                                            <Trophy className="w-7 h-7 mx-auto mb-2 opacity-50" />
                                            <p className="text-xs">Start solving to earn achievements!</p>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col gap-5 w-full">
                                            {/* Row 1 (first 4 achievements) */}
                                            <div className="flex flex-row overflow-x-auto lg:grid lg:grid-cols-4 gap-4 w-full pb-2 snap-x hide-scrollbar">
                                                {groupAchievements(achievements).slice(0, 4).map((grouped) => {
                                                    const highestTierName = grouped.highestAchieved
                                                        ? grouped.highestAchieved.title.match(/\(([^)]+)\)/)?.[1]?.toLowerCase() || 'bronze'
                                                        : null;
                                                    const IconComponent = ICON_MAP[grouped.icon] || Trophy;
                                                    const targetAch = grouped.nextMilestone || grouped.highestAchieved || grouped.items[0];
                                                    const progressBarColor = highestTierName ? TierProgressBarColors[highestTierName] : 'bg-primary';

                                                    return (
                                                        <div
                                                            key={grouped.groupKey}
                                                            className={clsx(
                                                                "p-5 sm:p-6 rounded-2xl border flex flex-col justify-between relative overflow-hidden group min-h-[180px]",
                                                                "flex-shrink-0 w-[57%] sm:w-[45%] lg:w-full snap-center",
                                                                highestTierName
                                                                    ? TierColors[highestTierName]
                                                                    : "border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/[0.01]"
                                                            )}
                                                        >
                                                            <div className="flex flex-col justify-between h-full w-full transition-transform duration-300 group-hover:scale-[1.03] origin-center">
                                                                {/* Top Header Row */}
                                                                <div className="flex items-center gap-2.5 min-w-0">
                                                                    <div className={clsx(
                                                                        "p-2 rounded-xl shrink-0",
                                                                        highestTierName ? "bg-white/40 dark:bg-black/20" : "bg-slate-200 dark:bg-white/5"
                                                                    )}>
                                                                        <IconComponent className="w-5 h-5 sm:w-6 sm:h-6 opacity-90 transition-transform sm:group-hover:scale-105" />
                                                                    </div>
                                                                    <h4 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm truncate leading-tight">
                                                                        {grouped.title}
                                                                    </h4>
                                                                </div>

                                                                {/* Description */}
                                                                <p className="text-[11px] opacity-70 my-3 text-slate-700 dark:text-slate-400 line-clamp-2 leading-relaxed text-left">
                                                                    {targetAch.description}
                                                                </p>

                                                                {/* Progress Bar Area */}
                                                                <div className="w-full mt-auto text-left">
                                                                    {grouped.nextMilestone ? (
                                                                        <>
                                                                            <div className="w-full h-1 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
                                                                                <div
                                                                                    className={clsx("h-full transition-all", progressBarColor)}
                                                                                    style={{ width: `${Math.min(100, (grouped.nextMilestone.progress / grouped.nextMilestone.progressTarget) * 100)}%` }}
                                                                                />
                                                                            </div>
                                                                            <div className="flex justify-between items-center mt-1.5 leading-none">
                                                                                <span className="text-[9px] font-mono font-bold opacity-45 uppercase">
                                                                                    Target: {grouped.nextMilestone.title.match(/\(([^)]+)\)/)?.[1] || 'Bronze'}
                                                                                </span>
                                                                                <span className="text-[9px] font-mono font-bold opacity-45">
                                                                                    {grouped.nextMilestone.id.includes('speed-frontier') ? (
                                                                                        `Best: ${grouped.nextMilestone.progress > 0 ? ((grouped.nextMilestone.progressTarget * grouped.nextMilestone.progressTarget) / grouped.nextMilestone.progress).toFixed(2) : '--'}s / Target: ${grouped.nextMilestone.progressTarget}s`
                                                                                    ) : grouped.nextMilestone.id.includes('fingertrick-maestro') ? (
                                                                                        `Best TPS: ${(grouped.nextMilestone.progress).toFixed(1)} / Target: ${grouped.nextMilestone.progressTarget.toFixed(1)}`
                                                                                    ) : (
                                                                                        `${grouped.nextMilestone.progress} / ${grouped.nextMilestone.progressTarget}`
                                                                                    )}
                                                                                </span>
                                                                            </div>
                                                                        </>
                                                                    ) : (
                                                                        <div className="flex items-center justify-center gap-1.5 bg-yellow-500/10 border border-yellow-500/25 text-yellow-600 dark:text-yellow-400 rounded-xl py-2 px-3 text-[10px] font-bold uppercase tracking-wider select-none shadow-[0_0_12px_rgba(234,179,8,0.1)]">
                                                                            <Crown className="w-3.5 h-3.5 text-yellow-500 animate-bounce shrink-0" />
                                                                            <span className="animate-pulse">Max Level Reached!</span>
                                                                            <Crown className="w-3.5 h-3.5 text-yellow-500 animate-bounce shrink-0" />
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>

                                            {/* Row 2 (last 4 achievements) */}
                                            <div className="flex flex-row overflow-x-auto lg:grid lg:grid-cols-4 gap-4 w-full pb-2 snap-x hide-scrollbar">
                                                {groupAchievements(achievements).slice(4, 8).map((grouped) => {
                                                    const highestTierName = grouped.highestAchieved
                                                        ? grouped.highestAchieved.title.match(/\(([^)]+)\)/)?.[1]?.toLowerCase() || 'bronze'
                                                        : null;
                                                    const IconComponent = ICON_MAP[grouped.icon] || Trophy;
                                                    const targetAch = grouped.nextMilestone || grouped.highestAchieved || grouped.items[0];
                                                    const progressBarColor = highestTierName ? TierProgressBarColors[highestTierName] : 'bg-primary';

                                                    return (
                                                        <div
                                                            key={grouped.groupKey}
                                                            className={clsx(
                                                                "p-5 sm:p-6 rounded-2xl border flex flex-col justify-between relative overflow-hidden group min-h-[180px]",
                                                                "flex-shrink-0 w-[57%] sm:w-[45%] lg:w-full snap-center",
                                                                highestTierName
                                                                    ? TierColors[highestTierName]
                                                                    : "border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/[0.01]"
                                                            )}
                                                        >
                                                            <div className="flex flex-col justify-between h-full w-full transition-transform duration-300 group-hover:scale-[1.03] origin-center">
                                                                {/* Top Header Row */}
                                                                <div className="flex items-center gap-2.5 min-w-0">
                                                                    <div className={clsx(
                                                                        "p-2 rounded-xl shrink-0",
                                                                        highestTierName ? "bg-white/40 dark:bg-black/20" : "bg-slate-200 dark:bg-white/5"
                                                                    )}>
                                                                        <IconComponent className="w-5 h-5 sm:w-6 sm:h-6 opacity-90 transition-transform sm:group-hover:scale-105" />
                                                                    </div>
                                                                    <h4 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm truncate leading-tight">
                                                                        {grouped.title}
                                                                    </h4>
                                                                </div>

                                                                {/* Description */}
                                                                <p className="text-[11px] opacity-70 my-3 text-slate-700 dark:text-slate-400 line-clamp-2 leading-relaxed text-left">
                                                                    {targetAch.description}
                                                                </p>

                                                                {/* Progress Bar Area */}
                                                                <div className="w-full mt-auto text-left">
                                                                    {grouped.nextMilestone ? (
                                                                        <>
                                                                            <div className="w-full h-1 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
                                                                                <div
                                                                                    className={clsx("h-full transition-all", progressBarColor)}
                                                                                    style={{ width: `${Math.min(100, (grouped.nextMilestone.progress / grouped.nextMilestone.progressTarget) * 100)}%` }}
                                                                                />
                                                                            </div>
                                                                            <div className="flex justify-between items-center mt-1.5 leading-none">
                                                                                <span className="text-[9px] font-mono font-bold opacity-45 uppercase">
                                                                                    Target: {grouped.nextMilestone.title.match(/\(([^)]+)\)/)?.[1] || 'Bronze'}
                                                                                </span>
                                                                                <span className="text-[9px] font-mono font-bold opacity-45">
                                                                                    {grouped.nextMilestone.id.includes('speed-frontier') ? (
                                                                                        `Best: ${grouped.nextMilestone.progress > 0 ? ((grouped.nextMilestone.progressTarget * grouped.nextMilestone.progressTarget) / grouped.nextMilestone.progress).toFixed(2) : '--'}s / Target: ${grouped.nextMilestone.progressTarget}s`
                                                                                    ) : grouped.nextMilestone.id.includes('fingertrick-maestro') ? (
                                                                                        `Best TPS: ${(grouped.nextMilestone.progress).toFixed(1)} / Target: ${grouped.nextMilestone.progressTarget.toFixed(1)}`
                                                                                    ) : (
                                                                                        `${grouped.nextMilestone.progress} / ${grouped.nextMilestone.progressTarget}`
                                                                                    )}
                                                                                </span>
                                                                            </div>
                                                                        </>
                                                                    ) : (
                                                                        <div className="flex items-center justify-center gap-1.5 bg-yellow-500/10 border border-yellow-500/25 text-yellow-600 dark:text-yellow-400 rounded-xl py-2 px-3 text-[10px] font-bold uppercase tracking-wider select-none shadow-[0_0_12px_rgba(234,179,8,0.1)]">
                                                                            <Crown className="w-3.5 h-3.5 text-yellow-500 animate-bounce shrink-0" />
                                                                            <span className="animate-pulse">Max Level Reached!</span>
                                                                            <Crown className="w-3.5 h-3.5 text-yellow-500 animate-bounce shrink-0" />
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                     )}
                                 </div>
                             </>
                         )}
                </motion.div>
            </div>

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
                                        <span className="font-display font-bold text-sm text-primary flex items-center gap-1.5">
                                             {(s.timeMs / 1000).toFixed(3)}s
                                             {s.phaseSplits && Object.keys(s.phaseSplits).length > 0 && (
                                                 <span className="text-[8px] font-sans font-bold bg-blue-500/10 text-blue-500 dark:text-blue-400 border border-blue-500/20 px-1.5 py-0.5 rounded uppercase tracking-wider shrink-0 leading-none">
                                                     Phase Tracking
                                                 </span>
                                             )}
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
                                placeholder="Click the move buttons below to build your algorithm..."
                                value={algText}
                                onChange={(e) => setAlgText(e.target.value)}
                                readOnly={true}
                                className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-secondary transition-colors placeholder-slate-400 dark:placeholder-gray-500 min-h-[80px] resize-none select-none"
                                required
                            />
                            
                            <div className="mt-3.5 space-y-2">
                                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1 block">Move Pad</label>
                                <div className="flex flex-wrap gap-1.5 p-3 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl">
                                    {/* Outer Layer Moves */}
                                    {['R', "R'", 'R2', 'L', "L'", 'L2', 'U', "U'", 'U2', 'D', "D'", 'D2', 'F', "F'", 'F2', 'B', "B'", 'B2'].map((m) => (
                                        <button
                                            key={m}
                                            type="button"
                                            onClick={() => handleAppendMove(m)}
                                            className="px-2.5 py-1 text-xs font-mono font-bold bg-white dark:bg-white/[0.04] hover:bg-slate-100 hover:dark:bg-white/[0.1] text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-white/10 rounded-lg transition-colors cursor-pointer select-none"
                                        >
                                            {m}
                                        </button>
                                    ))}
                                    {/* Middle Layer & Rotation Moves */}
                                    {['M', "M'", 'M2', 'E', "E'", 'E2', 'S', "S'", 'S2', 'x', "x'", 'y', "y'", 'z', "z'"].map((m) => (
                                        <button
                                            key={m}
                                            type="button"
                                            onClick={() => handleAppendMove(m)}
                                            className="px-2.5 py-1 text-xs font-mono font-bold bg-white dark:bg-white/[0.04] hover:bg-slate-100 hover:dark:bg-white/[0.1] text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-white/10 rounded-lg transition-colors cursor-pointer select-none"
                                        >
                                            {m}
                                        </button>
                                    ))}
                                    <div className="w-full h-[1px] bg-slate-200/60 dark:bg-white/10 my-1" />
                                    <div className="flex gap-2 w-full mt-1">
                                        <button
                                            type="button"
                                            onClick={handleBackspaceMove}
                                            className="flex-1 py-1.5 text-xs font-mono font-bold bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 rounded-lg transition-colors cursor-pointer select-none"
                                            title="Delete last move"
                                        >
                                            ⌫ Delete
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setAlgText('')}
                                            className="flex-1 py-1.5 text-xs font-mono font-bold bg-slate-500/10 hover:bg-slate-500/20 text-slate-500 border border-slate-500/20 rounded-lg transition-colors cursor-pointer select-none"
                                            title="Clear all"
                                        >
                                            Clear All
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-5 w-full">
                            <button
                                type="button"
                                onClick={() => setIsAlgInputOpen(false)}
                                className="flex-1 rounded-xl h-11 min-h-[44px] text-xs font-bold bg-slate-100/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white hover:bg-slate-200/80 dark:hover:bg-white/10 hover:border-slate-300 dark:hover:border-white/20 transition-[transform,opacity,background-color,border-color,box-shadow] duration-200 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:-translate-y-0.5 hover:scale-[1.04] active:scale-[0.95] active:translate-y-0 disabled:opacity-40 disabled:pointer-events-none cursor-pointer focus:outline-none"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={!algText.trim()}
                                className="flex-1 rounded-xl h-11 min-h-[44px] text-xs font-bold bg-gradient-to-r from-primary to-secondary text-white border border-slate-200/20 dark:border-white/20 shadow-[0_2.5px_8px_var(--btn-glow-shadow)] hover:shadow-[0_4px_12px_var(--btn-glow-shadow)] transition-[transform,opacity,background-color,border-color,box-shadow] duration-200 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:-translate-y-0.5 hover:scale-[1.04] active:scale-[0.95] active:translate-y-0 disabled:opacity-40 disabled:pointer-events-none cursor-pointer focus:outline-none flex items-center justify-center gap-2"
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
                                onChange={(e: any) => setEditName(e.target.value)}
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
                                onChange={(e: any) => setEditUsername(e.target.value)}
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
                                {AVATAR_PRESETS.map((preset: any) => {
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

                        <div className="flex justify-center mt-5 w-full">
                            <Button
                                type="submit"
                                variant="glow"
                                size="sm"
                                disabled={isSavingProfile}
                                className={clsx(
                                    "w-full max-w-[200px] h-auto px-4 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all duration-200 active:scale-95 !shadow-none bg-primary text-white hover:bg-primary/90 disabled:opacity-40"
                                )}
                            >
                                {isSavingProfile ? (
                                    <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving...</>
                                ) : (
                                    'Save Profile'
                                )}
                            </Button>
                        </div>
                    </form>
                </Modal>,
                document.body
            )}

            {/* Equip Trophy Badge Modal */}
            {isEquipModalOpen && createPortal(
                <Modal
                    isOpen={isEquipModalOpen}
                    onClose={() => {
                        setIsEquipModalOpen(false);
                        setSelectedSlotIndex(null);
                    }}
                    className="w-[92vw] max-w-[340px] p-4 flex flex-col gap-3 relative text-left"
                >
                    <button
                        onClick={() => {
                            setIsEquipModalOpen(false);
                            setSelectedSlotIndex(null);
                        }}
                        className="absolute sm:top-5 sm:right-4 top-1 right-1 w-10 h-10 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:text-gray-500 dark:hover:text-white transition-colors z-10"
                        aria-label="Close modal content"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    <div className="flex flex-col w-full pr-10">
                        <h3 className="font-display font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                            <Award className="w-4 h-4 text-primary" /> Equip Badge
                            <span className="text-[10px] text-slate-500 dark:text-gray-400 mt-0.5">
                                Slot {selectedSlotIndex !== null ? selectedSlotIndex + 1 : ''}
                            </span>
                        </h3>
                    </div>

                    <div className="w-full">
                        {(() => {
                            const groups = groupAchievements(achievements);
                            // Only show badges that are achieved and not equipped in any OTHER slot
                            const otherSlotsEquipped = (user?.equippedBadges || []).filter((_: any, idx: number) => idx !== selectedSlotIndex);
                            const achievedGroups = groups.filter(g => {
                                if (g.highestAchieved === null) return false;
                                return !otherSlotsEquipped.includes(g.highestAchieved.id);
                            });

                            if (achievedGroups.length === 0) {
                                return (
                                    <div className="py-6 text-center text-slate-500 text-xs">
                                        No new achievements available to equip.
                                    </div>
                                );
                            }

                             return (
                                <div className="grid grid-cols-5 gap-2 w-full">
                                    {achievedGroups.map((g) => {
                                        const badge = g.highestAchieved!;
                                        const tier = badge.id.substring(badge.id.lastIndexOf('-') + 1).toLowerCase();
                                        const colors: Record<string, string> = {
                                            bronze: 'bg-amber-500/10 text-amber-800 dark:text-amber-500 border-amber-500/20 hover:bg-amber-500/15',
                                            silver: 'bg-slate-400/10 text-slate-500 dark:text-slate-400 border-slate-400/20 hover:bg-slate-400/15',
                                            gold: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-500 border-yellow-500/20 hover:bg-yellow-500/15',
                                            emerald: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/15',
                                            diamond: 'bg-cyan-400/10 text-cyan-600 dark:text-cyan-400 border-cyan-400/20 hover:bg-cyan-400/15',
                                            ruby: 'bg-rose-500/10 text-rose-600 dark:text-rose-500 border-rose-500/20 hover:bg-rose-500/15'
                                        };
                                        const badgeColorClass = colors[tier] || 'border-slate-200 dark:border-white/5';
                                        const IconComponent = ICON_MAP[badge.icon] || Trophy;

                                        return (
                                            <button
                                                key={badge.id}
                                                onClick={() => handleEquipBadge(badge.id)}
                                                className={clsx(
                                                    "w-full aspect-square rounded-lg flex flex-col items-center justify-center p-1 border text-center transition-all hover:scale-105 active:scale-95 cursor-pointer gap-0.5 min-w-0 min-h-0",
                                                    badgeColorClass
                                                )}
                                            >
                                                <IconComponent className="w-5.5 h-5.5 shrink-0 animate-pulse" />
                                                <span className="text-[8px] font-bold tracking-tight line-clamp-1 leading-none">
                                                    {g.title.split(' ')[0]}
                                                </span>
                                            </button>
                                        );
                                    })}

                                    {/* The clear box (Empty action) */}
                                    <button
                                        onClick={() => handleEquipBadge(null)}
                                        className="w-full aspect-square rounded-lg flex flex-col items-center justify-center p-1 border border-dashed border-red-500/30 bg-red-500/5 dark:bg-red-500/[0.02] hover:bg-red-500/10 text-red-500 text-center gap-0.5 cursor-pointer shrink-0 min-w-0 min-h-0"
                                    >
                                        <X className="w-5 h-5 shrink-0" />
                                        <span className="text-[8px] font-bold tracking-tight leading-none">
                                            Clear
                                        </span>
                                    </button>
                                </div>
                            );
                        })()}
                    </div>
                </Modal>,
                document.body
            )}

            {/* Custom Post Delete Confirmation Modal */}
            {confirmDeletePost && createPortal(
                <Modal
                    isOpen={!!confirmDeletePost}
                    onClose={() => setConfirmDeletePost(null)}
                    className="w-[90vw] max-w-sm p-5 flex flex-col gap-4 relative text-left"
                >
                    <div className="flex flex-col gap-2">
                        <h3 className="font-display font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                            Delete Post
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-gray-400 leading-relaxed">
                            Are you sure you want to delete this post? This will permanently remove the post and all its comments. This action cannot be undone.
                        </p>
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                        <Button
                            variant="secondary"
                            onClick={() => setConfirmDeletePost(null)}
                            className="rounded-xl px-4 py-2 text-xs font-bold"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={() => handleDeletePost(confirmDeletePost._id)}
                            className="rounded-xl px-4 py-2 text-xs font-bold bg-red-500 text-white hover:bg-red-600"
                        >
                            Delete
                        </Button>
                    </div>
                </Modal>,
                document.body
            )}

            {/* Custom Comment Delete Confirmation Modal */}
            {confirmDeleteComment && createPortal(
                <Modal
                    isOpen={!!confirmDeleteComment}
                    onClose={() => setConfirmDeleteComment(null)}
                    className="w-[90vw] max-w-sm p-5 flex flex-col gap-4 relative text-left"
                >
                    <div className="flex flex-col gap-2">
                        <h3 className="font-display font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                            Delete Comment
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-gray-400 leading-relaxed">
                            Are you sure you want to delete this comment? This will permanently remove the comment and any replies. This action cannot be undone.
                        </p>
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                        <Button
                            variant="secondary"
                            onClick={() => setConfirmDeleteComment(null)}
                            className="rounded-xl px-4 py-2 text-xs font-bold"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={() => handleDeleteComment(confirmDeleteComment.post, confirmDeleteComment._id)}
                            className="rounded-xl px-4 py-2 text-xs font-bold bg-red-500 text-white hover:bg-red-600"
                        >
                            Delete
                        </Button>
                    </div>
                </Modal>,
                document.body
            )}

            {/* Likers Modal / Overlay */}
            {likesModalPost && createPortal(
                <Modal
                    isOpen={!!likesModalPost}
                    onClose={() => setLikesModalPost(null)}
                    className="max-w-xs p-5 flex flex-col gap-4 relative"
                >
                    <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-3">
                        <h3 className="font-display font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                            <Heart className="w-4 h-4 text-rose-500 fill-rose-500" /> Liked by
                        </h3>
                        <button
                            onClick={() => setLikesModalPost(null)}
                            className="text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer focus:outline-none"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                    <div className="flex flex-col gap-2 max-h-60 overflow-y-auto pr-1 hide-scrollbar">
                        {isLoadingLikers ? (
                            <div className="py-8 flex items-center justify-center text-slate-400 dark:text-gray-500">
                                <Loader2 className="w-5 h-5 animate-spin" />
                            </div>
                        ) : likesModalPost.users.length === 0 ? (
                            <div className="py-6 text-center text-xs text-slate-400 dark:text-gray-500">
                                No likes yet
                            </div>
                        ) : (
                            likesModalPost.users.map((u) => (
                                <div 
                                    key={u._id} 
                                    onClick={() => {
                                        setLikesModalPost(null);
                                        handleViewProfile(u);
                                    }}
                                    className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 cursor-pointer hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
                                >
                                    <img 
                                        src={u.avatar} 
                                        alt={u.name} 
                                        className="w-8 h-8 rounded-full border border-slate-200 dark:border-white/10 object-cover shrink-0" 
                                    />
                                    <div className="flex flex-col text-left min-w-0 flex-1">
                                        <span className="text-xs font-bold text-slate-800 dark:text-gray-200 truncate hover:underline">{u.name}</span>
                                        <span className="text-[10px] text-slate-400 dark:text-gray-500 truncate hover:underline">{u.handle}</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </Modal>,
                document.body
            )}

            {/* Public User Profile Modal */}
            <UserProfileModal
                handle={publicProfileHandle}
                onClose={() => setPublicProfileHandle(null)}
                onNavigateSelfProfile={() => {
                    setPublicProfileHandle(null);
                    setActiveTab('profile');
                }}
                currentUserId={user?._id}
            />
        </PageTransition>
    );
}
