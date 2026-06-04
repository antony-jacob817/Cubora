import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '@/context/ThemeContext';

export function AuthLayout({ children }: { children: React.ReactNode }) {
  const { accent } = useTheme();

  const getLogoUrl = (accent: string) => {
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

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden bg-background">
      {/* Immersive Background Effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[85vw] h-[85vw] max-w-[700px] max-h-[700px] bg-primary/15 sm:bg-primary/20 blur-[80px] sm:blur-[150px] rounded-full mix-blend-screen pointer-events-none z-0" />
      <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-15 sm:opacity-20 mix-blend-overlay pointer-events-none z-0" />
      
      {/* Brand Logo - Switched from absolute layout tracking to flow elegantly on very tight small landscape windows */}
      <div className="w-full max-w-md mb-6 flex justify-start sm:absolute sm:top-8 sm:left-8 sm:mb-0 select-none z-10">
        <a href='/' className="flex items-center gap-2.5 sm:gap-3 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-animated flex items-center justify-center shadow-[0_0_15px_var(--accent-glow-intense)] overflow-hidden transition-transform duration-300 group-hover:scale-105">
              <img 
                src={getLogoUrl(accent)} 
                alt="Cubora logo" 
                className="w-5 h-5 sm:w-6 sm:h-6 object-contain"
              />
          </div>
          <span className="font-display font-bold text-lg sm:text-xl tracking-tight text-slate-900 dark:text-white">Cubora</span>
        </a>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 15, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md relative z-10 mx-auto"
      >
        {children}
      </motion.div>
    </div>
  );
}