import { useState, useEffect } from 'react';
import { X, Trophy, Target, Flame, Timer, Loader2, Clock, Star, Award } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { getAuthHeaders } from '@/context/AuthContext';
import { clsx } from 'clsx';

interface UserProfileModalProps {
  handle: string | null;
  onClose: () => void;
  onNavigateSelfProfile?: () => void;
  currentUserId?: string;
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

interface GroupedAchievement {
  groupKey: string;
  title: string;
  category: string;
  icon: string;
  highestAchieved: AchievementData | null;
  nextMilestone: AchievementData | null;
  items: AchievementData[];
}

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
    groupItems.sort((a, b) => {
      const tierA = a.id.substring(a.id.lastIndexOf('-') + 1).toLowerCase();
      const tierB = b.id.substring(b.id.lastIndexOf('-') + 1).toLowerCase();
      return tierOrder.indexOf(tierA) - tierOrder.indexOf(tierB);
    });

    const achievedItems = groupItems.filter(a => a.isUnlocked);
    const highestAchieved = achievedItems.length > 0 ? achievedItems[achievedItems.length - 1] : null;
    const nextMilestone = groupItems.find(a => !a.isUnlocked) || null;

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

export function UserProfileModal({ handle, onClose, onNavigateSelfProfile, currentUserId }: UserProfileModalProps) {
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!handle) {
      setProfileData(null);
      setLoading(false);
      return;
    }

    const cleanHandle = handle.replace(/^@/, '').trim();
    setLoading(true);
    setError(null);

    fetch(`http://localhost:5000/api/community/users/profile/${encodeURIComponent(cleanHandle)}`, {
      headers: getAuthHeaders()
    })
      .then(res => res.json())
      .then(resData => {
        if (resData.success && resData.data) {
          // Self-profile guard check
          if (currentUserId && resData.data._id === currentUserId) {
            onClose();
            if (onNavigateSelfProfile) onNavigateSelfProfile();
            return;
          }
          setProfileData(resData.data);
        } else {
          setError(resData.error || 'User profile not found');
        }
      })
      .catch(err => {
        console.error('Failed to fetch user profile:', err);
        setError('Failed to load user profile');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [handle, currentUserId]);

  if (!handle) return null;

  const groupedAchievements = profileData?.achievements ? groupAchievements(profileData.achievements) : [];

  return (
    <Modal isOpen={Boolean(handle)} onClose={onClose} size="3xl">
      <div className="relative p-6 max-h-[85vh] overflow-y-auto hide-scrollbar text-left">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-xl transition-colors cursor-pointer z-20"
        >
          <X className="w-5 h-5" />
        </button>

        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-primary mb-3" />
            <span className="text-xs">Loading user profile...</span>
          </div>
        ) : error || !profileData ? (
          <div className="py-20 text-center text-slate-400">
            <p className="text-sm font-semibold mb-2">{error || 'User profile not found'}</p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl cursor-pointer"
            >
              Close
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {/* Header Profile Section */}
            <div className="glass-panel p-6 sm:p-8 w-full text-left relative overflow-hidden">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 relative z-10">
                <div className="relative shrink-0">
                  <img
                    src={profileData.avatar}
                    alt={profileData.name}
                    className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-2 border-slate-200 dark:border-white/10 shadow-xl"
                  />
                </div>

                <div className="flex-1 text-center sm:text-left min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
                    <div>
                      <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                        {profileData.name}
                      </h1>
                      <p className="text-xs text-slate-400 dark:text-gray-550 font-mono mt-0.5">
                        {profileData.handle} • {getJoinedDuration(profileData.createdAt)}
                      </p>
                    </div>

                    {/* Equipped Badges Display (Read-Only) */}
                    <div className="flex items-center justify-center sm:justify-start gap-1.5 shrink-0">
                      {(profileData.equippedBadges || [null, null, null]).map((bId: string | null, idx: number) => {
                        const bItem = bId && profileData.achievements ? profileData.achievements.find((a: any) => a.id === bId) : null;
                        const tier = bId ? bId.substring(bId.lastIndexOf('-') + 1).toLowerCase() : '';
                        const colorClass = TierColors[tier] || 'border-slate-200 dark:border-white/10 text-slate-400';
                        const IconComp = bItem ? (ICON_MAP[bItem.icon] || Award) : Award;

                        return (
                          <div
                            key={idx}
                            className={clsx(
                              "w-8 h-8 rounded-full flex items-center justify-center border shadow-sm transition-all",
                              colorClass
                            )}
                            title={bItem ? bItem.title : 'Empty Badge Slot'}
                          >
                            {bItem ? <IconComp className="w-4 h-4" /> : <div className="w-2 h-2 rounded-full bg-slate-300 dark:bg-white/10" />}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Bio */}
                  <div className="inline-block mt-1 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs text-slate-600 dark:text-gray-300">
                    "{profileData.about || 'Speedcuber'}"
                  </div>
                </div>
              </div>

              {/* Metrics Grid Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-6 pt-6 border-t border-slate-200/60 dark:border-white/5">
                <div className="bg-slate-50/50 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/5 rounded-2xl p-4 flex flex-col gap-1">
                  <div className="flex items-center gap-2 text-amber-500">
                    <Trophy className="w-4 h-4 shrink-0" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-gray-500">PB Single</span>
                  </div>
                  <span className="text-lg font-bold text-slate-900 dark:text-white font-mono">{profileData.metrics?.pb || '--'}</span>
                </div>

                <div className="bg-slate-50/50 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/5 rounded-2xl p-4 flex flex-col gap-1">
                  <div className="flex items-center gap-2 text-emerald-500">
                    <Target className="w-4 h-4 shrink-0" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-gray-500">Total Solves</span>
                  </div>
                  <span className="text-lg font-bold text-slate-900 dark:text-white font-mono">{profileData.metrics?.totalSolves ?? 0}</span>
                </div>

                <div className="bg-slate-50/50 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/5 rounded-2xl p-4 flex flex-col gap-1">
                  <div className="flex items-center gap-2 text-orange-500">
                    <Flame className="w-4 h-4 shrink-0" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-gray-500">Streak</span>
                  </div>
                  <span className="text-lg font-bold text-slate-900 dark:text-white font-mono">{profileData.metrics?.streak || '0 Days'}</span>
                </div>

                <div className="bg-slate-50/50 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/5 rounded-2xl p-4 flex flex-col gap-1">
                  <div className="flex items-center gap-2 text-cyan-500">
                    <Timer className="w-4 h-4 shrink-0" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-gray-500">Global Average</span>
                  </div>
                  <span className="text-lg font-bold text-slate-900 dark:text-white font-mono">{profileData.metrics?.globalAverage || '--'}</span>
                </div>
              </div>
            </div>

            {/* Trophy Case Section (Read-Only) */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-500" />
                <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">Trophy Case</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {groupedAchievements.map(group => {
                  const IconComponent = ICON_MAP[group.icon] || Trophy;
                  const highestTierName = group.highestAchieved
                    ? group.highestAchieved.id.substring(group.highestAchieved.id.lastIndexOf('-') + 1).toLowerCase()
                    : '';
                  const nextTierName = group.nextMilestone
                    ? group.nextMilestone.id.substring(group.nextMilestone.id.lastIndexOf('-') + 1).toLowerCase()
                    : '';

                  const cardTierName = nextTierName || highestTierName || 'bronze';
                  const nextTierStyle = TierColors[cardTierName] || TierColors.bronze;
                  const progressColor = TierProgressBarColors[cardTierName] || TierProgressBarColors.bronze;

                  let progressPercent = 0;
                  let displayUserVal = '';

                  if (group.nextMilestone) {
                    const currentVal = group.nextMilestone.progress;
                    const targetVal = group.nextMilestone.progressTarget;

                    if (group.groupKey === 'speed-frontier') {
                      progressPercent = Math.min(100, Math.max(0, Math.round((targetVal / (currentVal || targetVal)) * 100)));
                      displayUserVal = `${currentVal}s`;
                    } else if (group.groupKey === 'fingertrick-maestro') {
                      progressPercent = Math.min(100, Math.max(0, Math.round((currentVal / targetVal) * 100)));
                      displayUserVal = `${currentVal} TPS`;
                    } else if (group.groupKey === 'consistency-grind') {
                      progressPercent = Math.min(100, Math.max(0, Math.round((currentVal / targetVal) * 100)));
                      displayUserVal = `${currentVal} Days`;
                    } else {
                      progressPercent = Math.min(100, Math.max(0, Math.round((currentVal / targetVal) * 100)));
                      displayUserVal = `${currentVal}`;
                    }
                  } else {
                    progressPercent = 100;
                    displayUserVal = 'MAXED';
                  }

                  return (
                    <div
                      key={group.groupKey}
                      className="glass-panel p-5 rounded-2xl flex flex-col justify-between border border-slate-200/60 dark:border-white/5 relative text-left"
                    >
                      <div className="flex items-start gap-3.5 mb-3">
                        <div className={clsx("w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border shadow-md", nextTierStyle)}>
                          <IconComponent className="w-5 h-5" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-slate-900 dark:text-white text-sm truncate">{group.title}</h3>
                          <p className="text-[11px] text-slate-550 dark:text-gray-400 leading-snug line-clamp-2 mt-0.5">
                            {group.nextMilestone ? group.nextMilestone.description : (group.highestAchieved ? group.highestAchieved.description : '')}
                          </p>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="mt-3 pt-3 border-t border-slate-200/60 dark:border-white/5 flex flex-col gap-1.5">
                        <div className="w-full h-1.5 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
                          <div
                            className={clsx("h-full transition-all duration-500 rounded-full", progressColor)}
                            style={{ width: `${progressPercent}%` }}
                          />
                        </div>

                        <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 dark:text-gray-500">
                          <span className="uppercase font-bold tracking-wider">
                            TARGET: {cardTierName}
                          </span>
                          <span>
                            {group.nextMilestone ? `${displayUserVal} / Target: ${group.nextMilestone.progressTarget}` : 'Completed'}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
