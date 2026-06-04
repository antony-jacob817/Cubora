import React, { useRef } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const Card: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, children, ...props }) => {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    // Calculate cursor location relative to the card boundaries
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Direct DOM mutation bypassing React state updates to guarantee 60 FPS layout performance
    cardRef.current.style.setProperty('--mouse-x', `${x}px`);
    cardRef.current.style.setProperty('--mouse-y', `${y}px`);
  };

  return (
    <div 
      ref={cardRef}
      onMouseMove={handleMouseMove}
      className={cn(
        "glass-panel p-4 sm:p-5 md:p-6 overflow-hidden relative group w-full",
        "transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
        "hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/25 hover:border-slate-300 dark:hover:border-white/20",
        className
      )} 
      {...props}
    >
      {/* Vercel-style reactive radial cursor spotlight tracking */}
      <div 
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-0"
        style={{
          background: 'radial-gradient(350px circle at var(--mouse-x, 0px) var(--mouse-y, 0px), rgba(59, 130, 246, 0.08), transparent 80%)'
        }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
};