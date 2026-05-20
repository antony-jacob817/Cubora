import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '@/components/layout/Sidebar';
import { Navbar } from '@/components/layout/Navbar';
import { MobileDrawer } from '@/components/layout/MobileDrawer';

export default function DashboardLayout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden relative">
      {/* Global AI Glow Behind Everything */}
      <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-ai-glow pointer-events-none opacity-50" />
      
      <Sidebar />
      <MobileDrawer 
        isOpen={isMobileMenuOpen} 
        onClose={() => setIsMobileMenuOpen(false)} 
      />

      <div className="flex-1 flex flex-col min-w-0 relative z-10">
        <Navbar onMenuToggle={() => setIsMobileMenuOpen(true)} />
        
        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden relative scroll-smooth">
          <div className="p-6 lg:p-10 w-full max-w-[1600px] mx-auto min-h-full">
            <Outlet />
          </div>
          
          {/* Simple Footer */}
          <footer className="w-full py-6 text-center text-sm text-gray-600 border-t border-white/5 mt-auto">
            © {new Date().getFullYear()} Cubora AI. Precision Solving.
          </footer>
        </main>
      </div>
    </div>
  );
}