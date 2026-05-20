import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

// --- LAYOUTS & ANIMATIONS ---
import DashboardLayout from '@/layouts/DashboardLayout';
import { PageTransition } from '@/components/animations/PageTransition';

// --- PUBLIC & AUTH PAGES ---
import LandingPage from '@/pages/LandingPage';
import Login from '@/components/auth/Login';
import Signup from '@/components/auth/Signup';
import ForgotPassword from '@/components/auth/ForgotPassword';

// --- DASHBOARD PAGES ---
import Dashboard from '@/pages/dashboard/Dashboard';
import Scanner from '@/pages/scanner/Scanner';
import ColorCorrection from '@/pages/scanner/ColorCorrection';
import SolverShowcase from '@/components/solver/SolverShowcase';
import Academy from '@/components/academy/Academy';
import PracticeSession from '@/pages/practice/PracticeSession';
import AnalyticsDashboard from '@/pages/analytics/AnalyticsDashboard';
import AiCoach from '@/pages/coach/AiCoach';

// Centralized Animated Routing Component
function AnimatedRoutes() {
  const location = useLocation();
  {/* mode="wait" ensures the exit animation finishes before the enter animation starts */}
  return (
    
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        
        {/* --- PUBLIC ROUTES --- */}
        <Route path="/" element={
          <PageTransition>
            <LandingPage />
          </PageTransition>
        } />

        {/* --- AUTHENTICATION ROUTES --- */}
        {/* Note: AuthLayout and PageTransition are already baked into these components */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* --- APP DASHBOARD ROUTES --- */}
        {/* Everything inside here will automatically have the Sidebar and Top Navbar */}
        <Route element={<DashboardLayout />}>
          
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/scanner" element={<Scanner />} />
          <Route path="/correction" element={<ColorCorrection />} />
          <Route path="/solver" element={<SolverShowcase />} />
          
          {/* Mapping /learn from the sidebar to the Academy component */}
          <Route path="/learn" element={<Academy />} />
          <Route path="/academy" element={<Academy />} />
          
          <Route path="/practice" element={<PracticeSession />} />
          <Route path="/analytics" element={<AnalyticsDashboard />} />
          <Route path="/coach" element={<AiCoach />} />

          {/* Placeholders for remaining sidebar items */}
          <Route path="/multiplayer" element={
            <PageTransition><div className="flex h-full items-center justify-center text-gray-500 font-display text-xl">Multiplayer Coming Soon</div></PageTransition>
          } />
          <Route path="/community" element={
            <PageTransition><div className="flex h-full items-center justify-center text-gray-500 font-display text-xl">Community Coming Soon</div></PageTransition>
          } />
          <Route path="/settings" element={
            <PageTransition><div className="flex h-full items-center justify-center text-gray-500 font-display text-xl">Settings Coming Soon</div></PageTransition>
          } />

        </Route>

      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <Router>
      <AnimatedRoutes />
    </Router>
  );
}

export default App;