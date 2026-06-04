import { motion } from 'framer-motion';
import { 
  Scan, BrainCircuit, Cuboid, Zap, 
  ChevronDown, Layers, Crosshair, Target } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Hero } from '@/components/sections/Hero';
import { Magnetic } from '@/components/animations/Magnetic';
import { Button } from '@/components/ui/Button';
import { useTheme } from '@/context/ThemeContext';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { getSlideUpVariants, getStaggerContainer } from '@/animations/variants';

// --- SECTIONS ---

const TrustedBy = () => (
  <section className="w-full py-8 sm:py-10 border-y border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/[0.01]">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
      <p className="text-[10px] sm:text-sm font-medium text-slate-500 dark:text-gray-500 mb-4 sm:mb-6 uppercase tracking-widest">
        Powered by Advanced Technologies
      </p>
      <div className="flex flex-wrap justify-center items-center gap-6 sm:gap-8 lg:gap-16 opacity-50 grayscale dark:opacity-30">
        {['React', 'TensorFlow', 'OpenCV', 'Three.js', 'Vite'].map((tech) => (
          <span key={tech} className="font-display font-bold text-base sm:text-xl text-slate-900 dark:text-white select-none">
            {tech}
          </span>
        ))}
      </div>
    </div>
  </section>
);

const FeaturesGrid = () => {
  const prefersReducedMotion = usePrefersReducedMotion();
  const fadeInUp = getSlideUpVariants(prefersReducedMotion, 30);
  const staggerContainer = getStaggerContainer(prefersReducedMotion, 0.08);

  return (
    <section id="features" className="section-container relative px-4 sm:px-6">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[320px] sm:max-w-[600px] h-[320px] sm:h-[600px] bg-primary/10 rounded-full blur-[80px] sm:blur-[120px] pointer-events-none z-0" />
      
      <motion.div 
        initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={fadeInUp}
        className="text-center max-w-3xl mx-auto mb-2 sm:mb-14 relative z-10"
      >
        <h2 className="font-display text-2xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-3 sm:mb-4 tracking-tight">
          Intelligent Mechanics
        </h2>
        <p className="text-slate-600 dark:text-gray-400 text-sm sm:text-lg max-w-xl mx-auto leading-relaxed">
          The most advanced toolkit for cube analysis and mastery.
        </p>
      </motion.div>

      {/* 1. OUTER WRAPPER: Handles layout positioning and pulls out to the edges */}
      <motion.div 
        initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer}
        className="-mx-4 sm:-mx-6 md:mx-0 relative z-10 -mb-20 md:mb-0"
      >
        <div className="py-6 flex md:grid overflow-x-auto md:overflow-visible snap-x snap-mandatory md:snap-none gap-4 sm:gap-6 w-full md:grid-cols-2 lg:grid-cols-3 px-4 sm:px-6 md:p-0 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">

          {/* Feature 1: Scanner */}
          <motion.div variants={fadeInUp} className="glass-panel glass-scroll-safe p-5 sm:p-8 group hover:border-primary/50 transition-colors duration-500 text-left w-[85vw] md:w-auto shrink-0 snap-center md:snap-align-none">
            <div className="w-5 h-8 sm:w-12 sm:h-12 rounded-xl bg-primary/20 flex items-center justify-center mb-5 sm:mb-6 text-primary group-hover:scale-110 transition-transform">
              <Scan className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-2 sm:mb-3">AI Vision Scanner</h3>
            <p className="text-slate-600 dark:text-gray-400 text-xs sm:text-sm leading-relaxed">
              Instantly capture cube states with computer vision. Precise color recognition across varied lighting conditions.
            </p>
          </motion.div>

          {/* Feature 2: 3D Engine */}
          <motion.div variants={fadeInUp} className="glass-panel glass-scroll-safe p-5 sm:p-8 group hover:border-tertiary/50 transition-colors duration-500 text-left w-[85vw] md:w-auto shrink-0 snap-center md:snap-align-none">
            <div className="w-5 h-8 sm:w-12 sm:h-12 rounded-xl bg-tertiary/20 flex items-center justify-center mb-5 sm:mb-6 text-tertiary group-hover:scale-110 transition-transform">
              <Cuboid className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-2 sm:mb-3">3D Solver Engine</h3>
            <p className="text-slate-600 dark:text-gray-400 text-xs sm:text-sm leading-relaxed">
              Step-by-step 3D visualizations for optimal solution paths. Analyze multiple algorithms instantly.
            </p>
          </motion.div>

          {/* Feature 3: Coach */}
          <motion.div variants={fadeInUp} className="glass-panel glass-scroll-safe p-5 sm:p-8 group hover:border-secondary/50 transition-colors duration-500 text-left w-[85vw] md:w-auto shrink-0 snap-center md:snap-align-none">
            <div className="w-5 h-8 sm:w-12 sm:h-12 rounded-xl bg-secondary/20 flex items-center justify-center mb-5 sm:mb-6 text-secondary group-hover:scale-110 transition-transform">
              <BrainCircuit className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-2 sm:mb-3">AI Coach Insights</h3>
            <p className="text-slate-600 dark:text-gray-400 text-xs sm:text-sm leading-relaxed">
              Personalized insights based on your solve history. Identify weak points in cross planning or F2L pairs.
            </p>
          </motion.div>

        </div>
      </motion.div>
    </section>
  );
};

const SupportedMethods = () => {
  const prefersReducedMotion = usePrefersReducedMotion();
  const fadeInUp = getSlideUpVariants(prefersReducedMotion, 30);
  
  const methods = [
    { name: 'Beginner Method', desc: 'Layer-by-layer fundamentals.', icon: Layers },
    { name: 'CFOP', desc: 'Cross, F2L, OLL, PLL for speed.', icon: Zap },
    { name: 'Simplified CFOP', desc: '4-Look Last Layer transition.', icon: Target },
    { name: 'Roux', desc: 'Blockbuilding and M-slice mastery.', icon: Cuboid },
    { name: 'ZZ', desc: 'EO-line focus for rotationless solves.', icon: Crosshair },
  ];

  return (
    <section className="section-container border-t border-slate-200 dark:border-white/5 pt-16 sm:pt-24 px-4 sm:px-6">
      <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="text-center mb-10 sm:mb-16">
        <h2 className="font-display text-2xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-3 sm:mb-4 tracking-tight">
          Master Any Methodology
        </h2>
        <p className="text-slate-600 dark:text-gray-400 text-sm sm:text-lg max-w-xl mx-auto leading-relaxed">
          Cubora adapts to your solving style, supporting the most popular speedcubing methods.
        </p>
      </motion.div>

      <div className="flex flex-wrap justify-center gap-3 sm:gap-4 max-w-5xl mx-auto w-full">
        {methods.map((method, idx) => (
          <motion.div 
            key={idx}
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} custom={idx}
            className="glass-panel w-full sm:w-[calc(50%-0.5rem)] lg:w-80 px-4 sm:px-6 py-4 flex items-center gap-4 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-default text-left"
          >
            <method.icon className="w-5 h-5 text-primary flex-shrink-0" />
            <div className="min-w-0">
              <div className="font-bold text-slate-900 dark:text-white text-sm sm:text-base truncate">{method.name}</div>
              <div className="text-xs text-slate-500 dark:text-gray-500 truncate sm:whitespace-normal">{method.desc}</div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

const Pricing = () => {
  const prefersReducedMotion = usePrefersReducedMotion();
  const fadeInUp = getSlideUpVariants(prefersReducedMotion, 30);

  return (
    <section id="pricing" className="section-container border-t border-slate-200 dark:border-white/5 pt-16 sm:pt-24 px-4 sm:px-6 relative overflow-hidden">
      {/* Cinematic background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[320px] sm:max-w-[600px] h-[240px] sm:h-[400px] bg-secondary/15 blur-[80px] sm:blur-[120px] rounded-full pointer-events-none" />
      
      <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="text-center relative z-10 max-w-2xl mx-auto">
        
        {/* Animated Badge */}
        <div className="inline-flex items-center gap-2 bg-secondary/10 border border-secondary/20 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full mb-6 sm:mb-8">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-secondary"></span>
          </span>
          <span className="text-[10px] sm:text-xs font-bold text-secondary tracking-widest uppercase">Beta Access</span>
        </div>

        <h2 className="font-display text-2xl sm:text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4 sm:mb-6 tracking-tight">
          Pricing <span className="bg-gradient-to-r from-primary via-secondary to-tertiary bg-clip-text text-transparent">Coming Soon</span>
        </h2>
        
        <p className="text-slate-600 dark:text-gray-300 text-sm sm:text-lg mb-2 sm:mb-4 leading-relaxed">
          All features are currently <strong className="text-slate-900 dark:text-white">free</strong> during our beta period.
        </p>
        <p className="text-slate-500 dark:text-gray-500 text-xs sm:text-sm mb-8 sm:mb-10 max-w-md mx-auto leading-relaxed">
          No credit card required. No hidden limits. Full access to Scanner, AI Coach, Timer, Analytics, and Community.
        </p>

        <div className="glass-panel p-6 sm:p-8 w-full max-w-md mx-auto text-center">
          <div className="text-5xl sm:text-6xl font-display font-bold text-slate-900 dark:text-white mb-1.5">$0</div>
          <p className="text-slate-500 dark:text-gray-400 text-xs sm:text-sm mb-5 sm:mb-6">Everything included during beta</p>
          <div className="flex flex-wrap justify-center gap-2">
            {['Scanner', 'AI Coach', 'Timer', 'Analytics', 'Community', 'Multiplayer'].map((feat) => (
              <span key={feat} className="text-[10px] sm:text-xs font-bold text-primary bg-primary/10 border border-primary/20 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full">
                {feat}
              </span>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  );
};

const FAQ = () => {
  const faqs = [
    { q: "How accurate is the AI scanner?", a: "Our computer vision engine is 99.8% accurate across standard lighting conditions, automatically calibrating white balance to detect ambiguous colors." },
    { q: "Does it work with non-standard cubes?", a: "Currently, Cubora is optimized for standard 3x3 speedcubes. Support for 2x2, 4x4, Megaminx, etc. is on the roadmap." },
    { q: "Can it teach me to solve without looking?", a: "Yes! The AI Coach analyzes your solving patterns and recommends specific blindfolded (BLD) tracking exercises in the Academy section." }
  ];

  return (
    <section id="faq" className="section-container py-16 sm:py-24 px-4 sm:px-6">
      <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white text-center mb-8 sm:mb-12 tracking-tight">
        Frequently Asked Questions
      </h2>
      <div className="max-w-3xl mx-auto space-y-3 sm:space-y-4">
        {faqs.map((faq, i) => (
          <details key={i} className="glass-panel p-5 sm:p-6 group cursor-pointer [&_summary::-webkit-details-marker]:hidden text-left">
            <summary className="flex items-center justify-between font-semibold text-sm sm:text-lg text-slate-900 dark:text-white gap-4 selection:bg-transparent">
              {faq.q}
              <ChevronDown className="w-4 h-4 sm:w-5 h-5 transition-transform duration-300 group-open:rotate-180 text-slate-500 dark:text-gray-400 flex-shrink-0" />
            </summary>
            <p className="mt-3 sm:mt-4 text-xs sm:text-sm text-slate-600 dark:text-gray-400 leading-relaxed">
              {faq.a}
            </p>
          </details>
        ))}
      </div>
    </section>
  );
};

interface CTAProps {
  navigate: (path: string) => void;
}

const CTA = ({ navigate }: CTAProps) => {
  const prefersReducedMotion = usePrefersReducedMotion();
  const fadeInUp = getSlideUpVariants(prefersReducedMotion, 30);

  return (
    <section className="relative w-full py-20 sm:py-32 overflow-hidden border-t border-slate-200 dark:border-white/5 px-4 sm:px-6">
      <div className="absolute inset-0 bg-gradient-animated opacity-5 sm:opacity-10 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl h-[280px] sm:h-[400px] bg-primary/20 blur-[100px] sm:blur-[150px] rounded-full pointer-events-none" />
      
      <div className="relative z-10 max-w-4xl mx-auto text-center flex flex-col items-center">
        <motion.h2 
          initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}
          className="font-display text-3xl sm:text-5xl md:text-6xl font-bold text-slate-900 dark:text-white mb-4 sm:mb-6 tracking-tight"
        >
          Ready to solve smarter?
        </motion.h2>
        <motion.p 
          initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}
          className="text-xs sm:text-base md:text-lg lg:text-xl text-slate-600 dark:text-gray-300 mb-8 sm:mb-10 max-w-xl leading-relaxed"
        >
          Join thousands of cubers improving their times with AI precision. No credit card required to start.
        </motion.p>
        <div className="w-full sm:w-auto px-4 sm:px-0">
          <Magnetic pullFactor={0.15}>
            <Button variant="glow" size="lg" className="w-full sm:w-auto min-h-[44px] justify-center text-sm font-bold tracking-wide" onClick={() => navigate('/dashboard')}>
              Start Solving Free
            </Button>
          </Magnetic>
        </div>
      </div>
    </section>
  );
};

// --- MAIN EXPORT ---

export default function LandingPage() {
  const { accent } = useTheme();
  const navigate = useNavigate();

  const getLogoUrl = (accent: string) => {
    switch (accent) {
      case 'blue':
        return '/favicon-blue.png';
      case 'purple':
        return '/favicon-purple.png';
      case 'matte-black':
        return '/favicon-black.png';
      case 'graphite':
      default:
        return '/favicon-grey.png';
    }
  };

  return (
    <div className="min-h-screen bg-background relative selection:bg-primary/30 selection:text-white overflow-x-hidden">
      
      <main className="w-full">
        <Hero />
        <TrustedBy />
        <FeaturesGrid />
        <SupportedMethods />
        <Pricing />
        <FAQ />
        <CTA navigate={navigate} />
      </main>
      
      {/* Minimal Footer */}
      <footer className="w-full py-8 border-t border-slate-200 dark:border-white/5 text-center bg-slate-100 dark:bg-[#050A14] px-4">
        <div className="flex items-center justify-center gap-2 mb-3 select-none">
          <div className="w-8 h-8 rounded bg-gradient-animated flex items-center justify-center overflow-hidden shadow-sm">
            <img 
              src={getLogoUrl(accent)} 
              alt="Cubora logo" 
              className="w-8 h-8 object-contain"
            />
          </div>
          <span className="font-display text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight">Cubora</span>
        </div>
        <p className="text-slate-500 dark:text-gray-600 text-xs sm:text-sm">
          © {new Date().getFullYear()} Cubora AI. Precision Solving.
        </p>
      </footer>
    </div>
  );
}