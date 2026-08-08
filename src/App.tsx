import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence, LazyMotion, domAnimation } from 'framer-motion';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { SolverProvider } from '@/context/SolverContext';

// --- LAYOUTS (Eagerly Loaded) ---
import DashboardLayout from '@/layouts/DashboardLayout';
import { PageTransition } from '@/components/animations/PageTransition';
import { DepthParticlesBackground } from '@/components/layout/DepthParticlesBackground';
import { LandingNavbar } from '@/components/layout/LandingNavbar';

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
const SettingsPage = lazy(() => import('@/pages/settings/SettingsPage'));

// Premium loading state while chunks are fetched
const RouteLoader = () => (
  <div className="w-full h-[60vh] flex flex-col items-center justify-center gap-4">
    <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
    <span className="text-xs font-mono font-bold tracking-widest text-primary animate-pulse">LOADING MODULE...</span>
  </div>
);

// Route Guard for authenticated dashboard pages
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center gap-4 bg-[#0B0F19]">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
        <span className="text-xs font-mono font-bold tracking-widest text-primary animate-pulse">AUTHORIZING SESSION...</span>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

// Route Guard for public auth pages (redirects if already logged in)
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) return null;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
};

function AnimatedRoutes() {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        
        <Route path="/" element={<PageTransition><LandingPage /></PageTransition>} />
        
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
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
          <Route path="/profile/:handle" element={<Suspense fallback={<RouteLoader />}><CommunityHub /></Suspense>} />
          <Route path="/settings" element={<Suspense fallback={<RouteLoader />}><SettingsPage /></Suspense>} />
        </Route>

      </Routes>
    </AnimatePresence>
  );
}

function LandingNavbarConditional() {
  const location = useLocation();
  if (location.pathname === '/') {
    return <LandingNavbar />;
  }
  return null;
}

function App() {
  return (
    // LazyMotion reduces the main bundle by ~40kb by lazy-loading the animation engine
    <LazyMotion features={domAnimation}>
      <AuthProvider>
        <ThemeProvider>
          <SolverProvider>
            <Router>
              <DepthParticlesBackground />
              <div className="accent-mist-glow" />
              <LandingNavbarConditional />
              <AnimatedRoutes />
            </Router>
          </SolverProvider>
        </ThemeProvider>
      </AuthProvider>
    </LazyMotion>
  );
}

export default App;