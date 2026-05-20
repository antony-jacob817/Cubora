import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, Scan, GraduationCap, 
  Timer, BarChart2, Users, MessageSquare, Settings 
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const navItems = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Scanner', path: '/scanner', icon: Scan },
  { name: 'Learn', path: '/learn', icon: GraduationCap },
  { name: 'Practice', path: '/practice', icon: Timer },
  { name: 'Multiplayer', path: '/multiplayer', icon: Users },
  { name: 'Analytics', path: '/analytics', icon: BarChart2 },
  { name: 'Community', path: '/community', icon: MessageSquare },
];

export function Sidebar() {
  return (
    <aside className="hidden lg:flex flex-col w-64 h-full glass-panel border-l-0 border-y-0 rounded-none bg-surface/50 z-20">
      <div className="p-6 flex items-center gap-3">
        {/* Replace with your actual logo path once moved to assets */}
        <div className="w-8 h-8 rounded-lg bg-gradient-animated flex items-center justify-center text-white font-bold shadow-[0_0_15px_rgba(59,130,246,0.5)]">
          C
        </div>
        <span className="font-display font-bold text-xl tracking-tight text-white">Cubora</span>
      </div>

      <nav className="flex-1 px-4 space-y-2 overflow-y-auto hide-scrollbar">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) => twMerge(
              clsx(
                "flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 font-medium text-sm group",
                isActive 
                  ? "bg-primary/10 text-primary border border-primary/20 shadow-[0_0_20px_rgba(59,130,246,0.15)]" 
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              )
            )}
          >
            <item.icon className="w-5 h-5 transition-transform group-hover:scale-110 group-active:scale-95" />
            {item.name}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 mt-auto">
        <NavLink
          to="/settings"
          className={({ isActive }) => twMerge(
            clsx(
              "flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 font-medium text-sm group",
              isActive ? "bg-white/10 text-white" : "text-gray-400 hover:text-white hover:bg-white/5"
            )
          )}
        >
          <Settings className="w-5 h-5 transition-transform group-hover:rotate-90" />
          Settings
        </NavLink>
      </div>
    </aside>
  );
}