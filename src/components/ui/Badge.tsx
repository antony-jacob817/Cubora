import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'blue' | 'violet' | 'cyan' | 'outline';
}

export const Badge: React.FC<BadgeProps> = ({ className, variant = 'blue', children, ...props }) => {
  const variants = {
    blue: "bg-primary/20 text-primary border border-primary/30",
    violet: "bg-secondary/20 text-secondary border border-secondary/30",
    cyan: "bg-tertiary/20 text-tertiary border border-tertiary/30",
    outline: "bg-transparent text-gray-300 border border-white/20",
  };

  return (
    <span className={cn("px-3 py-1 text-xs font-medium rounded-2xl whitespace-nowrap", variants[variant], className)} {...props}>
      {children}
    </span>
  );
};