import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard, Scan, GraduationCap,
    Timer, BarChart2, Users, MessageSquare, Bolt, BrainCircuit
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { memo } from 'react';
import { useTheme, type Accent } from '@/context/ThemeContext';
import { motion } from 'framer-motion';
import { PageTransition } from '../animations/PageTransition';


const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Scanner', path: '/scanner', icon: Scan },
    { name: 'Learn', path: '/learn', icon: GraduationCap },
    { name: 'Practice', path: '/practice', icon: Timer },
    { name: 'AI Coach', path: '/coach', icon: BrainCircuit },
    { name: 'Multiplayer', path: '/multiplayer', icon: Users },
    { name: 'Analytics', path: '/analytics', icon: BarChart2 },
    { name: 'Community', path: '/community', icon: MessageSquare },
];

interface SidebarProps {
    forceExpanded?: boolean;
    onItemClick?: () => void;
    className?: string;
}

export const Sidebar = memo(function Sidebar({ forceExpanded = false, onItemClick, className }: SidebarProps) {
    const { accent } = useTheme();

    const getLogoUrl = (accent: Accent) => {
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
        <PageTransition 
            className={twMerge(
                "hidden lg:flex flex-col h-[calc(100vh)] z-20 shrink-0",
                className
            )}
        >
            <motion.aside
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className={twMerge(
                    clsx(
                        "hidden lg:flex flex-col h-[calc(100vh-2rem)] my-4 ml-4 glass-panel rounded-3xl z-20 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-hidden",
                        forceExpanded
                            ? "w-64"
                            : "w-20 hover:w-64 group/sidebar"
                    ),
                    className
                )}
            >
                <a href='/'>
                    <div className={clsx(
                        "p-6 flex items-center justify-start transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
                        forceExpanded ? "gap-3" : "gap-0 group-hover/sidebar:gap-3"
                    )}>
                        <div className="w-9 h-9 rounded-lg bg-gradient-animated flex items-center justify-center shadow-[0_0_15px_var(--accent-glow-intense)] shrink-0 overflow-hidden">
                            <img
                                src={getLogoUrl(accent)}
                                alt="Cubora Logo"
                                className="w-9 h-9 object-contain"
                            />
                        </div>
                        <span className={clsx(
                            "font-display font-bold text-xl tracking-tight text-slate-900 dark:text-white transition-opacity duration-300 whitespace-nowrap overflow-hidden",
                            forceExpanded
                                ? "opacity-100"
                                : "opacity-0 group-hover/sidebar:opacity-100"
                        )}>
                            Cubora
                        </span>
                    </div>
                </a>

                <nav className="flex-1 px-4 space-y-2 overflow-y-auto hide-scrollbar">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.name}
                            to={item.path}
                            onClick={onItemClick}
                            className={({ isActive }) => twMerge(
                                clsx(
                                    "flex items-center justify-start rounded-2xl transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] font-medium text-sm group relative overflow-hidden py-3",
                                    forceExpanded
                                        ? "pl-5 pr-4 gap-3"
                                        : "px-[14px] group-hover/sidebar:pl-5 group-hover/sidebar:pr-4 gap-0 group-hover/sidebar:gap-3",
                                    isActive
                                        ? clsx(
                                            "bg-primary/10 text-primary border border-primary/20 shadow-[0_0_20px_var(--accent-glow-intense)]",
                                            forceExpanded ? "pl-5" : "px-[14px] group-hover/sidebar:pl-5"
                                        )
                                        : "text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5"
                                )
                            )}
                        >
                            {({ isActive }) => (
                                <>
                                    {isActive && (
                                        <span className="absolute left-0 top-1/3 bottom-1/3 w-1 rounded-r-md bg-gradient-to-b from-primary to-secondary shadow-[0_0_12px_var(--primary)]" />
                                    )}
                                    <item.icon className="w-5 h-5 shrink-0 transition-transform group-hover:scale-110 group-active:scale-95" />
                                    <span className={clsx(
                                        "transition-opacity duration-300 whitespace-nowrap overflow-hidden",
                                        forceExpanded
                                            ? "opacity-100"
                                            : "opacity-0 group-hover/sidebar:opacity-100"
                                    )}>
                                        {item.name}
                                    </span>
                                </>
                            )}
                        </NavLink>
                    ))}
                </nav>

                <div className="p-4 mt-auto">
                    <NavLink
                        to="/settings"
                        onClick={onItemClick}
                        className={({ isActive }) => twMerge(
                            clsx(
                                "flex items-center justify-start rounded-2xl transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] font-medium text-sm group relative overflow-hidden py-3",
                                forceExpanded
                                    ? "pl-5 pr-4 gap-3"
                                    : "px-[14px] group-hover/sidebar:pl-5 group-hover/sidebar:pr-4 gap-0 group-hover/sidebar:gap-3",
                                isActive
                                    ? clsx(
                                        "bg-black/5 dark:bg-white/10 text-slate-900 dark:text-white border border-black/10 dark:border-white/10",
                                        forceExpanded ? "pl-5" : "px-[14px] group-hover/sidebar:pl-5"
                                    )
                                    : "text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5"
                            )
                        )}
                    >
                        {({ isActive }) => (
                            <>
                                {isActive && (
                                    <span className="absolute left-0 top-1/3 bottom-1/3 w-1 rounded-r-md bg-gradient-to-b from-primary to-secondary shadow-[0_0_12px_var(--primary)]" />
                                )}
                                <Bolt className="w-5 h-5 shrink-0 transition-transform group-hover:rotate-90" />
                                <span className={clsx(
                                    "transition-opacity duration-300 whitespace-nowrap overflow-hidden",
                                    forceExpanded
                                        ? "opacity-100"
                                        : "opacity-0 group-hover/sidebar:opacity-100"
                                )}>
                                    Settings
                                </span>
                            </>
                        )}
                    </NavLink>
                </div>
            </motion.aside>
        </PageTransition>
    );
});