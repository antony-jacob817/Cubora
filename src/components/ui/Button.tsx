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
  const baseStyles = "inline-flex items-center justify-center font-display font-medium transition-all duration-300 rounded-2xl active:scale-95 disabled:opacity-50 disabled:pointer-events-none";
  
  const variants = {
    primary: "bg-primary text-white hover:bg-blue-600 hover:shadow-[0_0_20px_rgba(59,130,246,0.4)]",
    secondary: "bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:border-white/20",
    ghost: "bg-transparent text-gray-300 hover:text-white hover:bg-white/5",
    glow: "bg-gradient-to-r from-primary to-secondary text-white hover:shadow-[0_0_30px_rgba(139,92,246,0.5)] border border-white/20",
  };

  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
  };

  return (
    <button className={cn(baseStyles, variants[variant], sizes[size], className)} {...props}>
      {children}
    </button>
  );
};