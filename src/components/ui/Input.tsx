import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = ({ className, ...props }) => {
  return (
    <input
      className={cn(
        "w-full bg-white/5 border border-white/10 text-white px-4 py-3 rounded-2xl outline-none transition-all duration-300",
        "focus:border-primary focus:ring-1 focus:ring-primary focus:bg-white/10 placeholder:text-gray-500",
        className
      )}
      {...props}
    />
  );
};