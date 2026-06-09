import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from '@/components/layout/Sidebar';
import { Navbar } from '@/components/layout/Navbar';
import { MobileDrawer } from '@/components/layout/MobileDrawer';
import { AvatarSelectionModal } from '@/components/layout/AvatarSelectionModal';
import { ErrorBoundary } from '@/components/layout/ErrorBoundary';

export default function DashboardLayout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    // CHANGED: Replaced h-screen with h-[100dvh]
    <div className="flex h-[100dvh] w-full bg-transparent overflow-hidden relative">
      <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-ai-glow pointer-events-none opacity-50" />
      
      <Sidebar />
      <MobileDrawer 
        isOpen={isMobileMenuOpen} 
        onClose={() => setIsMobileMenuOpen(false)} 
      />

      <div className="flex-1 flex flex-col min-w-0 relative z-10">
        {/* CHANGED: Added pb-safe to ensure the footer doesn't hit the iOS home indicator */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden relative scroll-smooth pt-4 pb-safe sm:pb-0 flex flex-col">
          <Navbar onMenuToggle={() => setIsMobileMenuOpen(true)} />
          <div className="p-4 sm:p-6 lg:p-10 w-full max-w-[1600px] mx-auto flex-1">
            <ErrorBoundary>
              <Outlet />
            </ErrorBoundary>
          </div>
          
          <footer className="w-full py-6 text-center text-sm text-gray-600 border-t border-white/5 mt-auto">
            © {new Date().getFullYear()} Cubora AI. Precision Solving.
          </footer>
        </main>
      </div>

      <AvatarSelectionModal />
    </div>
  );
}