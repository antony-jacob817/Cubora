import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import DashboardLayout from '@/layouts/DashboardLayout';
import LandingPage from '@/pages/LandingPage';
import { PageTransition } from '@/components/animations/PageTransition';

// Create an inner component to access useLocation
function AnimatedRoutes() {
  const location = useLocation();
  
  {/* mode="wait" ensures the exit animation finishes before the enter animation starts */}
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        
        {/* Landing Page Route */}
        <Route path="/" element={
          <PageTransition>
            <LandingPage />
          </PageTransition>
        } />

        {/* Dashboard Routes wrapped in the Layout */}
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={
            <PageTransition>
              <div>Dashboard Content Goes Here</div>
            </PageTransition>
          } />
          {/* Add /scanner, /practice, etc. here, wrapped in <PageTransition> */}
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