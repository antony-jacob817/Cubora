import { useState, useEffect, memo } from 'react';
import { Menu, X, ArrowRight, Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { clsx } from 'clsx';

export const LandingNavbar = memo(function LandingNavbar() {
  const { isAuthenticated } = useAuth();
  const { setTheme, isDarkMode, accent } = useTheme();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const getLogoUrl = (accent) => {
    switch (accent) {
      case 'blue':
        return '/favicon-blue.png';
      case 'purple':
        return '/favicon-purple.png';
      case 'matte-black':
        return '/favicon-black.png';
      case 'graphite':
      default:
        return '/favicon-grey.png';
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 24) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id) => {
    setIsMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className={clsx(
      "fixed left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-7xl z-50 flex items-center justify-between transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] rounded-full border",
      isScrolled 
        ? "top-4 h-[60px] px-4 lg:px-6 bg-white/40 dark:bg-[#181A1D]/65 backdrop-blur-2xl border-slate-200/30 dark:border-white/10 shadow-2xl shadow-black/15"
        : "top-6 h-[64px] px-6 lg:px-8 bg-white/15 dark:bg-[#111315]/15 backdrop-blur-xl border-transparent shadow-sm"
    )}>
      {/* Brand Logo */}
      <div className="flex items-center gap-2 cursor-pointer group" onClick={() => navigate('/')}>
        <div className="w-9 h-9 rounded-lg bg-gradient-animated flex items-center justify-center shadow-[0_0_15px_var(--accent-glow-intense)] transition-transform duration-300 group-hover:scale-110 active:scale-95 overflow-hidden">
          <img 
            src={getLogoUrl(accent)} 
            alt="Cubora logo" 
            className="w-9 h-9 object-contain"
          />
        </div>
        <span className="font-display font-bold text-xl text-slate-900 dark:text-white tracking-tight group-hover:text-primary transition-colors">Cubora</span>
      </div>

      {/* Desktop Navigation Links */}
      <nav className="hidden md:flex items-center gap-8">
        <button 
          onClick={() => scrollToSection('features')} 
          className="text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-slate-900 dark:text-gray-400 dark:hover:text-white transition-all hover:scale-105 active:scale-95"
        >
          Features
        </button>
        <button 
          onClick={() => scrollToSection('pricing')} 
          className="text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-slate-900 dark:text-gray-400 dark:hover:text-white transition-all hover:scale-105 active:scale-95"
        >
          Pricing
        </button>
        <button 
          onClick={() => scrollToSection('faq')} 
          className="text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-slate-900 dark:text-gray-400 dark:hover:text-white transition-all hover:scale-105 active:scale-95"
        >
          FAQ
        </button>
      </nav>

      {/* Desktop Right Actions */}
      <div className="hidden md:flex items-center gap-4">
        <button 
          onClick={() => setTheme(isDarkMode ? 'light' : 'dark')}
          className="p-2 text-slate-500 hover:text-slate-900 dark:text-gray-400 dark:hover:text-white transition-all rounded-full hover:bg-slate-100 dark:hover:bg-white/5 relative group"
          title={`Switch to ${isDarkMode ? 'Light' : 'Dark'} Mode`}
        >
          <span className="absolute inset-0 bg-primary/10 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
          {isDarkMode ? (
            <Sun className="w-4 h-4 relative z-10 transition-transform duration-500 group-hover:rotate-45 group-active:scale-90" />
          ) : (
            <Moon className="w-4 h-4 relative z-10 transition-transform duration-500 group-hover:-rotate-12 group-active:scale-90" />
          )}
        </button>

        <div className="w-px h-5 bg-slate-200 dark:bg-white/10" />

        {isAuthenticated ? (
          <Button variant="glow" size="sm" className="gap-1.5 h-8 text-[11px] font-bold uppercase tracking-wider" onClick={() => navigate('/dashboard')}>
            Dashboard <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        ) : (
          <>
            <button 
              onClick={() => navigate('/login')} 
              className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              Sign In
            </button>
            <Button variant="glow" size="sm" className="h-8 text-[11px] font-bold uppercase tracking-wider" onClick={() => navigate('/signup')}>
              Get Started
            </Button>
          </>
        )}
      </div>

      {/* Mobile Actions (Theme Toggle + Menu Toggle) */}
      <div className="flex md:hidden items-center gap-1">
        <button 
          onClick={() => setTheme(isDarkMode ? 'light' : 'dark')}
          className="p-2 text-slate-500 hover:text-slate-900 dark:text-gray-400 dark:hover:text-white transition-colors rounded-full"
          title={`Switch to ${isDarkMode ? 'Light' : 'Dark'} Mode`}
        >
          {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
        
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 text-slate-500 hover:text-slate-900 dark:text-gray-400 dark:hover:text-white transition-colors z-50 relative"
        >
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* CHANGED: Premium Glass Zoom & Blur Animation */}
      <div 
        className={clsx(
          "absolute top-20 left-0 w-full bg-white/70 dark:bg-[#181A1D]/95 backdrop-blur-2xl border border-slate-200/50 dark:border-white/10 rounded-3xl p-6 flex flex-col gap-6 md:hidden z-45 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.3)] max-h-[calc(100dvh-5rem)] overflow-y-auto origin-top",
          "transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
          isMobileMenuOpen 
            ? "opacity-100 translate-y-0 scale-100 blur-none visible" 
            : "opacity-0 -translate-y-8 scale-105 blur-md invisible pointer-events-none"
        )}
      >
        <button 
          onClick={() => scrollToSection('features')} 
          className="text-left text-base font-bold text-slate-700 hover:text-slate-900 dark:text-gray-300 dark:hover:text-white transition-colors"
        >
          Features
        </button>
        <button 
          onClick={() => scrollToSection('pricing')} 
          className="text-left text-base font-bold text-slate-700 hover:text-slate-900 dark:text-gray-300 dark:hover:text-white transition-colors"
        >
          Pricing
        </button>
        <button 
          onClick={() => scrollToSection('faq')} 
          className="text-left text-base font-bold text-slate-700 hover:text-slate-900 dark:text-gray-300 dark:hover:text-white transition-colors"
        >
          FAQ
        </button>
        
        <div className="h-px bg-slate-200 dark:bg-white/5 my-1" />

        {isAuthenticated ? (
          <Button variant="glow" className="w-full gap-1.5 justify-center" onClick={() => navigate('/dashboard')}>
            Dashboard <ArrowRight className="w-4 h-4" />
          </Button>
        ) : (
          <div className="flex flex-col gap-3">
            <Button variant="secondary" className="w-full justify-center bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 border-slate-200 dark:border-white/10 text-slate-700 dark:text-white" onClick={() => navigate('/login')}>
              Sign In
            </Button>
            <Button variant="glow" className="w-full justify-center" onClick={() => navigate('/signup')}>
              Get Started
            </Button>
          </div>
        )}
      </div>
    </header>
  );
});