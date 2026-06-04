import { useState, useRef, useEffect } from 'react';
import { Menu, Moon, Sun, LogOut, Bolt, User as UserIcon } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { clsx } from 'clsx';

interface NavbarProps {
  onMenuToggle: () => void;
}

export function Navbar({ onMenuToggle }: NavbarProps) {
  const { user, logout } = useAuth();
  const { setTheme, isDarkMode } = useTheme();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
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