import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'glow';
  size?: 'sm' | 'md' | 'lg';
}

export const Button: React.FC<ButtonProps> = ({ 
  className, variant = 'primary', size = 'md', children, ...props 
}) => {
  // Premium spring ease transition combined with mechanical active press shrink feedback
  const baseStyles = cn(
    "relative inline-flex items-center justify-center font-display font-medium overflow-hidden w-full sm:w-auto",
    "transition-[transform,opacity,background-color,border-color,box-shadow] duration-200 ease-[cubic-bezier(0.34,1.56,0.64,1)]",
    "hover:-translate-y-0.5 hover:scale-[1.02]",
    "active:scale-[0.96] active:translate-y-0",
    "disabled:opacity-50 disabled:pointer-events-none disabled:hover:translate-y-0 disabled:hover:scale-100 disabled:active:scale-100",
    "rounded-2xl"
  );
  
  // Custom hardware-accelerated sweep reflections on primary and glowing variants
  const sweepStyles = "before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent before:-translate-x-full hover:before:translate-x-full before:transition-transform before:duration-1000 before:ease-out";

  const variants = {
    primary: cn(
      "bg-primary text-white hover:bg-blue-600 hover:shadow-[0_0_20px_rgba(59,130,246,0.45)] dark:hover:shadow-[0_0_20px_rgba(59,130,246,0.65)]",
      sweepStyles
    ),
    secondary: "bg-slate-100/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white hover:bg-slate-200/80 dark:hover:bg-white/10 hover:border-slate-300 dark:hover:border-white/20",
    ghost: "bg-transparent text-slate-600 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/50 dark:hover:bg-white/5",
    glow: cn(
      "bg-gradient-to-r from-primary to-secondary text-white btn-glow border border-slate-200/20 dark:border-white/20",
      sweepStyles
    ),
  };

  const sizes = {
    sm: "px-3.5 py-2 text-xs min-h-[38px]",
    md: "px-5 py-3 text-sm sm:text-base min-h-[44px]",
    lg: "px-7 py-4 text-base sm:text-lg min-h-[52px]",
  };

  return (
    <button className={cn(baseStyles, variants[variant], sizes[size], className)} {...props}>
      <span className="relative z-10 inline-flex items-center justify-center gap-2">{children}</span>
    </button>
  );
};