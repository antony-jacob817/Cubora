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
                "w-full bg-white/5 border border-white/10 text-white px-4 py-2.5 rounded-2xl outline-none text-[16px] min-h-[44px] placeholder:text-gray-500",
                "transition-[transform,background-color,border-color,box-shadow] duration-200 ease-out",
                "hover:border-slate-300 dark:hover:border-white/20 hover:bg-white/10",
                "focus:border-primary focus:bg-white/10 focus:shadow-[0_0_15px_var(--accent-glow-intense)]",
                className
            )}
            {...props}
        />
    );
};
