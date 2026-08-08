import React, { useEffect, useState } from 'react';
import { 
  X, 
  Trophy, 
  Target, 
  Flame, 
  Timer, 
  Award, 
  Crown,
  Clock,
  Star,
  Medal,
  Loader2
} from 'lucide-react';
import clsx from 'clsx';
import { getAuthHeaders } from '../../utils/api';

interface UserProfileModalProps {
  handle: string | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenMyProfile?: () => void;
  currentUser?: any;
}

const TierColors: Record<string, string> = {
  bronze: 'border-amber-700/40 bg-gradient-to-br from-amber-950/20 via-amber-900/10 to-transparent text-amber-500 shadow-[0_0_15px_rgba(180,83,9,0.15)]',
  silver: 'border-slate-400/40 bg-gradient-to-br from-slate-800/30 via-slate-700/10 to-transparent text-slate-300 shadow-[0_0_15px_rgba(148,163,184,0.15)]',
  gold: 'border-yellow-500/40 bg-gradient-to-br from-yellow-950/20 via-amber-900/10 to-transparent text-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.15)]',
  emerald: 'border-emerald-500/40 bg-gradient-to-br from-emerald-950/20 via-teal-900/10 to-transparent text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.15)]',
  diamond: 'border-cyan-400/40 bg-gradient-to-br from-cyan-950/20 via-blue-900/10 to-transparent text-cyan-300 shadow-[0_0_15px_rgba(34,211,238,0.15)]',
  ruby: 'border-rose-500/40 bg-gradient-to-br from-rose-950/20 via-red-900/10 to-transparent text-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.15)]'
};

const TierProgressBarColors: Record<string, string> = {
  bronze: 'bg-amber-600',
  silver: 'bg-slate-400',
  gold: 'bg-yellow-500',
  emerald: 'bg-emerald-500',
  diamond: 'bg-cyan-400',
  ruby: 'bg-rose-500'
};

const ICON_MAP: Record<string, React.ComponentType<any>> = {
  Target,
  Trophy,
  Flame,
  Timer,
  Clock,
  Star,
  Award,
  Medal
};

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  handle,
  isOpen,
  onClose,
  onOpenMyProfile,
  currentUser
}) => {
  const [profileData, setProfileData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !handle) return;

    // Self-Profile Guard check before fetching
    const cleanHandle = handle.toLowerCase().replace(/^@/, '');
    const myHandle = (currentUser?.username || currentUser?.email || '').split('@')[0].toLowerCase();
    
    if (currentUser && (cleanHandle === myHandle || cleanHandle === currentUser._id)) {
      onClose();
      if (onOpenMyProfile) {
        onOpenMyProfile();
      }
      return;
    }

    const fetchProfile = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(`http://localhost:5000/api/community/users/profile/${encodeURIComponent(cleanHandle)}`, {
          headers: getAuthHeaders()
        });
        const json = await res.json();
        if (json.success && json.data) {
          // Self-Profile Guard check after fetching (by ID)
          if (currentUser && json.data._id === currentUser._id) {
            onClose();
            if (onOpenMyProfile) {
              onOpenMyProfile();
            }
            return;
          }
          setProfileData(json.data);
        } else {
          setError(json.error || 'Failed to load user profile.');
        }
      } catch (err) {
        setError('Network error loading profile.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [handle, isOpen, currentUser]);

  if (!isOpen) return null;

  const getJoinedDuration = (dateStr?: string) => {
    if (!dateStr) return 'Joined recently';
    const d = new Date(dateStr);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `Joined ${months[d.getMonth()]} ${d.getFullYear()}`;
  };

  const groupAchievements = (list: any[]) => {
    if (!list || !Array.isArray(list)) return [];
    const groups: Record<string, any[]> = {};
    list.forEach(ach => {
      const g = ach.group || (ach.id ? ach.id.split('-')[0] : 'other');
      if (!groups[g]) groups[g] = [];
      groups[g].push(ach);
    });

    return Object.entries(groups).map(([groupKey, items]) => {
      const title = items[0]?.title?.split(' (')[0] || 'Achievement';
      const icon = items[0]?.icon || 'Trophy';
      const unlockedItems = items.filter(i => i.isUnlocked);
      const highestAchieved = unlockedItems.length > 0 ? unlockedItems[unlockedItems.length - 1] : null;
      const nextMilestone = items.find(i => !i.isUnlocked) || null;

      return {
        groupKey,
        title,
        icon,
        items,
        highestAchieved,
        nextMilestone
      };
    });
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn">
      <div 
        className="bg-white/95 dark:bg-[#121417]/95 border border-slate-200 dark:border-white/10 rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto flex flex-col relative text-left p-6 sm:p-8 hide-scrollbar"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-9 h-9 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/10 transition-all cursor-pointer z-20"
        >
          <X className="w-5 h-5" />
        </button>

        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400">
            <Loader2 className="w-10 h-10 animate-spin text-primary mb-3" />
            <p className="text-sm font-medium">Loading user profile...</p>
          </div>
        ) : error ? (
          <div className="py-16 text-center text-slate-400">
            <Trophy className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p className="text-sm font-medium text-red-400">{error}</p>
          </div>
        ) : profileData ? (
          <div className="flex flex-col gap-6 w-full">
            {/* Header Section */}
            <div className="glass-panel p-6 sm:p-8 rounded-3xl w-full relative overflow-hidden">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 w-full">
                {/* User Avatar */}
                <div className="relative shrink-0">
                  <img
                    src={profileData.avatar}
                    alt={profileData.name}
                    className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl object-cover border-2 border-primary/30 shadow-xl"
                  />
                </div>

                {/* Info & Equipped Badges */}
                <div className="flex-1 min-w-0 flex flex-col items-center sm:items-start text-center sm:text-left">
                  <h2 className="font-display font-bold text-2xl sm:text-3xl text-slate-900 dark:text-white truncate">
                    {profileData.name}
                  </h2>
                  <p className="text-slate-500 dark:text-gray-400 font-mono text-xs sm:text-sm mt-1">
                    @{profileData.handle} • {getJoinedDuration(profileData.createdAt)}
                  </p>
                  
                  {/* Equipped Badges (Read-Only) */}
                  {profileData.equippedBadges && profileData.equippedBadges.length > 0 && (
                    <div className="flex items-center gap-2 mt-3">
                      {profileData.equippedBadges.map((badgeId: string, idx: number) => {
                        const allBadges = profileData.achievements || [];
                        const b = allBadges.find((a: any) => a.id === badgeId);
                        const tier = b ? b.title.match(/\(([^)]+)\)/)?.[1]?.toLowerCase() : '';
                        const IconComp = b && ICON_MAP[b.icon] ? ICON_MAP[b.icon] : Trophy;
                        const badgeColorClass = tier ? (TierColors[tier] || '') : '';

                        return (
                          <div
                            key={idx}
                            className={clsx(
                              "w-9 h-9 rounded-xl border flex items-center justify-center",
                              badgeColorClass || "border-white/10 bg-white/5 text-primary"
                            )}
                            title={b ? b.title : 'Equipped Badge'}
                          >
                            <IconComp className="w-4 h-4" />
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <div className="mt-3">
                    <span className="inline-block font-mono text-slate-600 dark:text-gray-400 text-xs sm:text-sm italic bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 rounded-xl px-4 py-2 w-fit">
                      "{profileData.about || 'Speedcuber'}"
                    </span>
                  </div>
                </div>
              </div>

              {/* Performance Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 sm:gap-4 w-full mt-6 pt-6 border-t border-slate-200/60 dark:border-white/5">
                {/* PB Card */}
                <div className="glass-panel p-4 flex flex-col justify-between text-left min-h-[110px]">
                  <div className="w-8 h-8 rounded-lg bg-yellow-500/20 text-yellow-500 flex items-center justify-center shadow-[0_0_12px_rgba(234,179,8,0.15)]">
                    <Trophy className="w-4 h-4" />
                  </div>
                  <div className="mt-2">
                    <span className="text-slate-500 dark:text-gray-400 text-[10px] font-bold uppercase tracking-wider block">
                      PB SINGLE
                    </span>
                    <span className="font-display font-bold text-xl text-slate-900 dark:text-white mt-0.5 block">
                      {profileData.metrics?.pb || '--'}
                    </span>
                  </div>
                </div>

                {/* Total Solves Card */}
                <div className="glass-panel p-4 flex flex-col justify-between text-left min-h-[110px]">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-500 flex items-center justify-center shadow-[0_0_12px_rgba(16,185,129,0.15)]">
                    <Target className="w-4 h-4" />
                  </div>
                  <div className="mt-2">
                    <span className="text-slate-500 dark:text-gray-400 text-[10px] font-bold uppercase tracking-wider block">
                      TOTAL SOLVES
                    </span>
                    <span className="font-display font-bold text-xl text-slate-900 dark:text-white mt-0.5 block">
                      {profileData.metrics?.totalSolves ?? 0}
                    </span>
                  </div>
                </div>

                {/* Solve Streak Card */}
                <div className="glass-panel p-4 flex flex-col justify-between text-left min-h-[110px]">
                  <div className="w-8 h-8 rounded-lg bg-orange-500/20 text-orange-500 flex items-center justify-center shadow-[0_0_12px_rgba(249,115,22,0.15)]">
                    <Flame className="w-4 h-4" />
                  </div>
                  <div className="mt-2">
                    <span className="text-slate-500 dark:text-gray-400 text-[10px] font-bold uppercase tracking-wider block">
                      SOLVE STREAK
                    </span>
                    <span className="font-display font-bold text-xl text-slate-900 dark:text-white mt-0.5 block">
                      {profileData.metrics?.streak || '0 Days'}
                    </span>
                  </div>
                </div>

                {/* Global Average Card */}
                <div className="glass-panel p-4 flex flex-col justify-between text-left min-h-[110px]">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-500 flex items-center justify-center shadow-[0_0_12px_rgba(59,130,246,0.15)]">
                    <Timer className="w-4 h-4" />
                  </div>
                  <div className="mt-2">
                    <span className="text-slate-500 dark:text-gray-400 text-[10px] font-bold uppercase tracking-wider block">
                      GLOBAL AVERAGE
                    </span>
                    <span className="font-display font-bold text-xl text-slate-900 dark:text-white mt-0.5 block">
                      {profileData.metrics?.globalAverage || '--'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Read-Only Trophy Case */}
            <div className="w-full text-left">
              <h3 className="font-display font-bold text-lg sm:text-xl text-slate-900 dark:text-white flex items-center gap-2 tracking-tight mb-4">
                <Award className="w-5 h-5 text-tertiary shrink-0" /> Trophy Case
              </h3>

              {profileData.achievements?.length === 0 ? (
                <div className="glass-panel p-8 text-center text-slate-500 w-full">
                  <Trophy className="w-7 h-7 mx-auto mb-2 opacity-50" />
                  <p className="text-xs">No trophies earned yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
                  {groupAchievements(profileData.achievements).map((grouped) => {
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
                          "p-5 rounded-2xl border flex flex-col justify-between relative overflow-hidden group min-h-[170px]",
                          highestTierName
                            ? TierColors[highestTierName]
                            : "border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/[0.01]"
                        )}
                      >
                        <div className="flex flex-col justify-between h-full w-full">
                          {/* Top Header */}
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className={clsx(
                              "p-2 rounded-xl shrink-0",
                              highestTierName ? "bg-white/40 dark:bg-black/20" : "bg-slate-200 dark:bg-white/5"
                            )}>
                              <IconComponent className="w-5 h-5 opacity-90" />
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
                                <Crown className="w-3.5 h-3.5 text-yellow-500 shrink-0" />
                                <span>Max Level Reached!</span>
                                <Crown className="w-3.5 h-3.5 text-yellow-500 shrink-0" />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};
