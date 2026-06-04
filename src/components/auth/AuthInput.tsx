import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface AuthInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon: React.ReactNode;
  error?: string;
}

export function AuthInput({ icon, error, type, className, ...props }: AuthInputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';

  return (
    <div className="w-full relative flex flex-col gap-1">
      <div className="relative flex items-center min-h-[44px]">
        {/* Left Icon */}
        <div className="absolute left-4 text-gray-400 pointer-events-none">
          {icon}
        </div>
        
        {/* Text-base on mobile prevents automatic forced-zoom on iOS Safari focus */}
        <input
          type={isPassword && showPassword ? 'text' : type}
          className={twMerge(
            clsx(
              "w-full bg-white/5 border text-white pl-12 pr-4 py-2.5 sm:py-3 min-h-[44px] text-base md:text-sm rounded-2xl outline-none transition-all duration-300 placeholder:text-gray-500 focus:bg-white/10",
              error 
                ? "border-red-500/50 focus:border-red-500 focus:ring-1 focus:ring-red-500" 
                : "border-white/10 focus:border-primary focus:ring-1 focus:ring-primary",
              isPassword && "pr-12",
              className
            )
          )}
          {...props}
        />

        {/* Password Visibility Toggle with Touch Target Safety Margin */}
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-2 px-2 h-full flex items-center justify-center text-gray-400 hover:text-white transition-colors"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
          </button>
        )}
      </div>

      {/* Validation Error */}
      {error && (
        <span className="text-xs text-red-400 ml-2 mt-0.5 animate-fade-in">
          {error}
        </span>
      )}
    </div>
  );
}