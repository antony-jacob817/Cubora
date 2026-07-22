import { useState, useRef, useEffect, useMemo } from 'react';
import { Menu, Moon, Sun, LogOut, Bolt, User as UserIcon, Bell, Flame, Heart, Award, MessageSquare, AtSign, Check } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { clsx } from 'clsx';

interface NavbarProps {
  onMenuToggle: () => void;
}

interface NotificationItem {
  id: string;
  type: string;
  title: string;
  content: string;
  time: string;
  unread: boolean;
  postId?: string;
  commentId?: string;
}

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'mention': return AtSign;
    case 'reply': return MessageSquare;
    case 'like':
    case 'batched_likes': return Heart;
    case 'streak':
    case 'streak_warning': return Flame;
    case 'achievement': return Award;
    default: return Bell;
  }
};

const getNotificationIconColor = (type: string) => {
  switch (type) {
    case 'mention': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
    case 'reply': return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
    case 'like':
    case 'batched_likes': return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
    case 'streak':
    case 'streak_warning': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
    case 'achievement': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
    default: return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
  }
};

function getTimeAgo(dateString: string) {
  const seconds = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateString).toLocaleDateString();
}

export function Navbar({ onMenuToggle }: NavbarProps) {
  const { user, logout, getAuthHeaders } = useAuth();
  const { setTheme, isDarkMode } = useTheme();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  
  // Notification States
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const fetchNotifications = async () => {
    try {
      const headers = getAuthHeaders();
      const res = await fetch('http://localhost:5000/api/notifications', { headers });
      const resData = await res.json();
      if (resData.success && resData.data) {
        setNotifications(resData.data.map((n: any) => ({
          id: n._id,
          type: n.type,
          title: n.title,
          content: n.content,
          time: getTimeAgo(n.createdAt),
          unread: n.unread,
          postId: n.post?._id || n.post || n.postId,
          commentId: n.comment?._id || n.commentId
        })));
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  };

  const handleNotificationClick = (notification: NotificationItem) => {
    if (notification.unread) {
      toggleRead(notification.id);
    }
    setIsNotificationOpen(false);

    const { type, postId, commentId } = notification;

    if (type === 'streak_warning' || type === 'streak') {
      // Rule 1: "Consistency Grind!" -> navigate directly to PracticeSession view
      navigate('/practice');
    } else if (type === 'mention') {
      // Rule 2: "Mentioned in Comment" -> open post, scroll to & highlight comment
      navigate('/community', {
        state: { openPostId: postId, highlightCommentId: commentId }
      });
    } else if (type === 'reply') {
      // Rule 3: "Reply on Post" -> open post, scroll to bottom & focus reply
      navigate('/community', {
        state: { openPostId: postId, focusReply: true }
      });
    } else if (type === 'batched_likes' || type === 'like') {
      // Rule 4: "New Likes" -> open post & show list of likers modal
      navigate('/community', {
        state: { openPostId: postId, showLikes: true }
      });
    }
  };

  useEffect(() => {
    if (!user) return;
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 20000); // poll every 20s
    return () => clearInterval(interval);
  }, [user]);

  const unreadCount = useMemo(() => notifications.filter(n => n.unread).length, [notifications]);

  const toggleRead = async (id: string) => {
    // Optimistic UI update
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, unread: !n.unread } : n));
    try {
      const headers = getAuthHeaders();
      await fetch(`http://localhost:5000/api/notifications/${id}`, {
        method: 'PUT',
        headers
      });
    } catch (err) {
      console.error('Failed to toggle read state:', err);
    }
  };

  const markAllAsRead = async () => {
    // Optimistic UI update
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
    try {
      const headers = getAuthHeaders();
      await fetch('http://localhost:5000/api/notifications', {
        method: 'PUT',
        headers
      });
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);

    const scrollContainer = headerRef.current?.parentElement;
    
    const handleScroll = () => {
      if (scrollContainer) {
        setIsScrolled(scrollContainer.scrollTop > 10);
      }
    };

    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll, { passive: true });
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      if (scrollContainer) {
        scrollContainer.removeEventListener('scroll', handleScroll);
      }
    };
  }, []);

  const handleLogout = () => {
    setIsDropdownOpen(false);
    logout();
    navigate('/');
  };

  const handleSettings = () => {
    setIsDropdownOpen(false);
    navigate('/settings');
  };

  return (
    <header 
      ref={headerRef}
      className={clsx(
        "z-30 transition-all duration-300 w-full",
        // Force desktop back to default
        "lg:relative lg:p-0",
        // Mobile sticky behavior
        isScrolled ? "sticky top-0 pt-2 px-4 sm:px-6" : "relative pt-0 px-0"
      )}
    >
      <div className={clsx(
        "w-full h-14 flex items-center justify-between transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] px-4 lg:px-10",
        isScrolled 
          ? "bg-white/70 dark:bg-[#181A1D]/75 backdrop-blur-xl border border-slate-200/50 dark:border-white/10 shadow-sm shadow-black/5 rounded-2xl lg:bg-transparent lg:dark:bg-transparent lg:backdrop-blur-none lg:border-0 lg:shadow-none lg:rounded-none" 
          : "bg-transparent border-transparent border lg:bg-transparent lg:border-0 lg:shadow-none lg:rounded-none"
      )}>
        {/* Mobile Drawer Trigger */}
        <div className="flex items-center lg:hidden">
          <button 
            onClick={onMenuToggle}
            className="w-11 h-11 flex items-center justify-center -ml-2 text-slate-500 hover:text-slate-900 dark:text-gray-400 dark:hover:text-white transition-colors"
            aria-label="Open sidebar menu navigation"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>

        <div className="hidden lg:block flex-1" />

        {/* Control Actions */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Notifications Dropdown Frame */}
          <div className="relative flex items-center" ref={notificationRef}>
            <button 
              onClick={() => setIsNotificationOpen(!isNotificationOpen)}
              className="text-slate-500 hover:text-slate-900 dark:text-gray-400 dark:hover:text-white transition-all relative w-10 h-10 flex items-center justify-center rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 group focus:outline-none"
              title="Notifications"
            >
              <Bell className="w-4 h-4 relative z-10" />
              {unreadCount > 0 && (
                <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-white dark:ring-[#181A1D] animate-pulse z-20" />
              )}
              <span className="absolute inset-0 bg-primary/10 rounded-xl blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>

            {/* Notifications Dropdown menu */}
            <div className={clsx(
              "absolute right-[-70px] sm:right-0 top-full mt-3 w-80 max-w-[calc(100vw-2rem)] p-4 z-50 bg-white dark:bg-[#181A1D] origin-top-right transition-all duration-300 border border-slate-200 dark:border-white/10 shadow-2xl rounded-2xl flex flex-col gap-3",
              isNotificationOpen 
                ? "opacity-100 scale-100 translate-y-0 visible" 
                : "opacity-0 scale-95 -translate-y-2 invisible pointer-events-none"
            )}>
              <div className="flex justify-between items-center pb-2.5 border-b border-slate-200/60 dark:border-white/5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-900 dark:text-white">Notifications</span>
                {unreadCount > 0 && (
                  <button 
                    onClick={markAllAsRead}
                    className="text-[9px] font-bold uppercase tracking-widest text-primary hover:text-primary/80 transition-colors flex items-center gap-1 cursor-pointer focus:outline-none"
                  >
                    <Check className="w-3 h-3" /> Mark all read
                  </button>
                )}
              </div>

              <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto pr-1 select-none text-left">
                {notifications.map((n) => {
                  const Icon = getNotificationIcon(n.type);
                  const iconColor = getNotificationIconColor(n.type);
                  return (
                    <button
                      key={n.id}
                      onClick={() => handleNotificationClick(n)}
                      className={clsx(
                        "w-full text-left p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-white/[0.03] border border-transparent transition-[background-color,opacity] duration-150 flex gap-3 items-start relative focus:outline-none focus:ring-0 focus-visible:ring-0 cursor-pointer",
                        n.unread 
                          ? "bg-slate-50/50 dark:bg-white/[0.01]" 
                          : "bg-transparent opacity-65"
                      )}
                    >
                      <div className={clsx("w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border", iconColor)}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start gap-2 mb-0.5">
                          <span className="text-[10px] font-bold uppercase tracking-wide text-slate-800 dark:text-gray-200 truncate">
                            {n.title}
                          </span>
                          <span className="text-[8px] text-slate-400 dark:text-gray-550 shrink-0 font-mono">
                            {n.time}
                          </span>
                        </div>
                        <p className="text-[10.5px] leading-relaxed text-slate-600 dark:text-gray-400 font-sans whitespace-normal">
                          {n.content}
                        </p>
                      </div>
                     </button>
                  );
                })}
              </div>
            </div>
          </div>

          <button 
            onClick={() => setTheme(isDarkMode ? 'light' : 'dark')}
            className="text-slate-500 hover:text-slate-900 dark:text-gray-400 dark:hover:text-white transition-all relative w-10 h-10 flex items-center justify-center rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 group"
            title={`Switch to ${isDarkMode ? 'Light' : 'Dark'} Mode`}
          >
            {isDarkMode ? <Sun className="w-4 h-4 relative z-10" /> : <Moon className="w-4 h-4 relative z-10" />}
            <span className="absolute inset-0 bg-primary/10 rounded-xl blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>

          <div className="w-px h-5 bg-slate-200 dark:bg-white/10" />

          {/* Profile Dropdown Frame */}
          <div className="relative" ref={dropdownRef}>
            <button 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-9 h-9 sm:w-8 sm:h-8 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 overflow-hidden hover:border-primary transition-colors flex-shrink-0 flex items-center justify-center relative z-40 focus:outline-none min-h-[36px] min-w-[36px] sm:min-h-0 sm:min-w-0"
            >
              {user?.avatar ? (
                <img 
                  src={user.avatar} 
                  loading="lazy"
                  alt="User profile avatar" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <UserIcon className="w-4 h-4 text-slate-500 dark:text-gray-400" />
              )}
            </button>

            {/* Dropdown Menu - CHANGED: Solid background colors, removed glass/blur */}
            <div className={clsx(
              "absolute right-0 mt-3 w-60 max-w-[calc(100vw-2rem)] p-4 z-50 bg-white dark:bg-[#181A1D] origin-top-right transition-all duration-300 border border-slate-200 dark:border-white/10 shadow-2xl rounded-2xl",
              isDropdownOpen 
                ? "opacity-100 scale-100 translate-y-0 visible" 
                : "opacity-0 scale-95 -translate-y-2 invisible pointer-events-none"
            )}>
              <div className="flex flex-col gap-1 pb-3 border-b border-slate-200/60 dark:border-white/5 text-left">
                <span className="text-sm font-bold text-slate-900 dark:text-white tracking-tight leading-none truncate">
                  {user?.name || 'Cubora User'}
                </span>
                <span className="text-xs text-slate-500 dark:text-gray-400 truncate leading-none mt-2 font-mono">
                  {user?.email || 'user@cubora.ai'}
                </span>
              </div>

              <div className="flex flex-col gap-1 pt-2">
                <button 
                  onClick={handleSettings}
                  className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors text-left min-h-[40px]"
                >
                  <Bolt className="w-3.5 h-3.5 text-primary" />
                  Settings
                </button>
                <button 
                  onClick={handleLogout}
                  className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-wider text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 hover:bg-red-500/10 transition-colors text-left mt-0.5 min-h-[40px]"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}