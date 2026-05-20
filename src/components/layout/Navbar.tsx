import { Menu, Bell, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface NavbarProps {
  onMenuToggle: () => void;
}

const isDarkMode = true;

export function Navbar({ onMenuToggle }: NavbarProps) {
  return (
    <header className="h-20 w-full flex items-center justify-between px-6 lg:px-10 border-b border-white/5 bg-background/80 backdrop-blur-md sticky top-0 z-30">
      <div className="flex items-center gap-4 lg:hidden">
        <button 
          onClick={onMenuToggle}
          className="p-2 -ml-2 text-gray-400 hover:text-white transition-colors"
        >
          <Menu className="w-6 h-6" />
        </button>
        <span className="font-display font-bold text-lg text-white">Cubora</span>
      </div>

      <div className="hidden lg:flex flex-1 items-center gap-4">
        {/* Contextual breadcrumbs or search can go here */}
        <div className="w-64 h-10 glass-panel rounded-2xl flex items-center px-4 text-sm text-gray-500 border-white/5">
          Cmd + K to search...
        </div>
      </div>

      <div className="flex items-center gap-4 lg:gap-6">
        <button className="text-gray-400 hover:text-tertiary transition-colors relative group">
          <Bell className="w-5 h-5" />
          <span className="absolute top-0 right-0 w-2 h-2 bg-tertiary rounded-full shadow-[0_0_10px_rgba(6,182,212,0.8)]" />
        </button>
        
        <button className="text-gray-400 hover:text-white transition-colors">
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        <div className="w-px h-6 bg-white/10 hidden lg:block" />

        <Button variant="glow" size="sm" className="hidden lg:flex">
          + New Scan
        </Button>

        {/* User Avatar */}
        <button className="w-10 h-10 rounded-full bg-surface-bright border border-white/10 overflow-hidden hover:border-primary transition-colors flex-shrink-0">
          <img 
            src="https://api.dicebear.com/7.x/avataaars/svg?seed=Cubora" 
            alt="User profile" 
            className="w-full h-full object-cover"
          />
        </button>
      </div>
    </header>
  );
}