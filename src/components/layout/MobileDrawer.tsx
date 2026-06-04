import { clsx } from 'clsx';
import { Sidebar } from './Sidebar';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileDrawer({ isOpen, onClose }: MobileDrawerProps) {
  return (
    <>
      {/* Backdrop */}
      <div 
        className={clsx(
          "fixed inset-0 bg-[#DCDFE2]/80 dark:bg-[#111315]/80 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300",
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div 
        className={clsx(
          "fixed top-0 left-0 bottom-0 w-72 glass-panel rounded-none border-y-0 border-l-0 z-50 lg:hidden backdrop-blur-2xl transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="h-full w-full">
          {/* Reuse the Sidebar component logic, but force it to show and close on click */}
          <Sidebar 
            forceExpanded={true} 
            onItemClick={onClose} 
            className="flex w-full border-none my-0 ml-0 rounded-none h-full" 
          />
        </div>
      </div>
    </>
  );
}