import { Outlet } from 'react-router-dom';

export default function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Background AI Glow Effect */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-ai-glow pointer-events-none" />
      
      {/* Header Placeholder */}
      <header className="h-16 border-b border-white/5 flex items-center px-gutter z-10">
        <h1 className="font-display font-bold text-xl tracking-tight">Cubora</h1>
      </header>

      {/* Main Content */}
      <main className="flex-1 relative z-10 p-gutter">
        <Outlet />
      </main>
    </div>
  );
}