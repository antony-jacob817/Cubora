import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, LazyMotion, domAnimation } from 'framer-motion';

// --- LAYOUTS (Eagerly Loaded) ---
import DashboardLayout from '@/layouts/DashboardLayout';
import { PageTransition } from '@/components/animations/PageTransition';

// --- PUBLIC & AUTH PAGES (Eagerly Loaded for instant First Contentful Paint) ---
import LandingPage from '@/pages/LandingPage';
import Login from '@/components/auth/Login';
import Signup from '@/components/auth/Signup';
import ForgotPassword from '@/components/auth/ForgotPassword';

// --- DASHBOARD PAGES (Lazy Loaded on demand) ---
const Dashboard = lazy(() => import('@/pages/dashboard/Dashboard'));
const Scanner = lazy(() => import('@/pages/scanner/Scanner'));
const ColorCorrection = lazy(() => import('@/pages/scanner/ColorCorrection'));
const SolverShowcase = lazy(() => import('@/components/solver/SolverShowcase'));
const Academy = lazy(() => import('@/components/academy/Academy'));
const PracticeSession = lazy(() => import('@/pages/practice/PracticeSession'));
const AnalyticsDashboard = lazy(() => import('@/pages/analytics/AnalyticsDashboard'));
const AiCoach = lazy(() => import('@/pages/coach/AiCoach'));
const CommunityHub = lazy(() => import('@/pages/community/CommunityHub'));
const MultiplayerHub = lazy(() => import('@/pages/multiplayer/MultiplayerHub'));

// Premium loading state while chunks are fetched
const RouteLoader = () => (
  <div className="w-full h-[60vh] flex flex-col items-center justify-center gap-4">
    <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
    <span className="text-xs font-mono font-bold tracking-widest text-primary animate-pulse">LOADING MODULE...</span>
  </div>
);

function AnimatedRoutes() {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        
        <Route path="/" element={<PageTransition><LandingPage /></PageTransition>} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        <Route element={<DashboardLayout />}>
          {/* Wrap all lazy routes in Suspense to handle the asynchronous network request */}
          <Route path="/dashboard" element={<Suspense fallback={<RouteLoader />}><Dashboard /></Suspense>} />
          <Route path="/scanner" element={<Suspense fallback={<RouteLoader />}><Scanner /></Suspense>} />
          <Route path="/correction" element={<Suspense fallback={<RouteLoader />}><ColorCorrection /></Suspense>} />
          <Route path="/solver" element={<Suspense fallback={<RouteLoader />}><SolverShowcase /></Suspense>} />
          <Route path="/learn" element={<Suspense fallback={<RouteLoader />}><Academy /></Suspense>} />
          <Route path="/academy" element={<Suspense fallback={<RouteLoader />}><Academy /></Suspense>} />
          <Route path="/practice" element={<Suspense fallback={<RouteLoader />}><PracticeSession /></Suspense>} />
          <Route path="/analytics" element={<Suspense fallback={<RouteLoader />}><AnalyticsDashboard /></Suspense>} />
          <Route path="/coach" element={<Suspense fallback={<RouteLoader />}><AiCoach /></Suspense>} />
          <Route path="/multiplayer" element={<Suspense fallback={<RouteLoader />}><MultiplayerHub /></Suspense>} />
          <Route path="/community" element={<Suspense fallback={<RouteLoader />}><CommunityHub /></Suspense>} />
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
    // LazyMotion reduces the main bundle by ~40kb by lazy-loading the animation engine
    <LazyMotion features={domAnimation}>
      <Router>
        <AnimatedRoutes />
      </Router>
    </LazyMotion>
  );
}

export default App;