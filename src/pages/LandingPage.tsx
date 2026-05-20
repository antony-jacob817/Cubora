import { motion, type Variants } from 'framer-motion';
import { 
  Scan, BrainCircuit, Cuboid, Zap, 
  CheckCircle2, ChevronDown, Layers, Crosshair } from 'lucide-react';
import { Hero } from '@/components/sections/Hero';
import { Magnetic } from '@/components/animations/Magnetic';
import { Button } from '@/components/ui/Button';

// --- ANIMATION VARIANTS ---
const fadeInUp : Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }
};

const staggerContainer : Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

// --- SECTIONS ---

const TrustedBy = () => (
  <section className="w-full py-10 border-y border-white/5 bg-white/[0.01]">
    <div className="max-w-7xl mx-auto px-6 text-center">
      <p className="text-sm font-medium text-gray-500 mb-6 uppercase tracking-widest">Powered by Advanced Technologies</p>
      <div className="flex flex-wrap justify-center items-center gap-8 lg:gap-16 opacity-50 grayscale">
        {/* Placeholder for actual tech logos (React, TensorFlow, OpenCV, Vite) */}
        {['React', 'TensorFlow', 'OpenCV', 'Three.js', 'Vite'].map((tech) => (
          <span key={tech} className="font-display font-bold text-xl text-white">{tech}</span>
        ))}
      </div>
    </div>
  </section>
);

const FeaturesGrid = () => (
  <section className="section-container relative">
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
    
    <motion.div 
      initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeInUp}
      className="text-center max-w-3xl mx-auto mb-16"
    >
      <h2 className="font-display text-4xl font-bold text-white mb-4">Intelligent Mechanics</h2>
      <p className="text-gray-400 text-lg">The most advanced toolkit for cube analysis and mastery.</p>
    </motion.div>

    <motion.div 
      initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer}
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10"
    >
      {/* Feature 1: Scanner */}
      <motion.div variants={fadeInUp} className="glass-panel p-8 group hover:border-primary/50 transition-colors duration-500">
        <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center mb-6 text-primary group-hover:scale-110 transition-transform">
          <Scan className="w-6 h-6" />
        </div>
        <h3 className="text-xl font-bold text-white mb-3">AI Vision Scanner</h3>
        <p className="text-gray-400">Instantly capture cube states with computer vision. Precise color recognition across varied lighting conditions.</p>
      </motion.div>

      {/* Feature 2: 3D Engine */}
      <motion.div variants={fadeInUp} className="glass-panel p-8 group hover:border-tertiary/50 transition-colors duration-500">
        <div className="w-12 h-12 rounded-xl bg-tertiary/20 flex items-center justify-center mb-6 text-tertiary group-hover:scale-110 transition-transform">
          <Cuboid className="w-6 h-6" />
        </div>
        <h3 className="text-xl font-bold text-white mb-3">3D Solver Engine</h3>
        <p className="text-gray-400">Step-by-step 3D visualizations for optimal solution paths. Analyze multiple algorithms instantly.</p>
      </motion.div>

      {/* Feature 3: Coach */}
      <motion.div variants={fadeInUp} className="glass-panel p-8 group hover:border-secondary/50 transition-colors duration-500">
        <div className="w-12 h-12 rounded-xl bg-secondary/20 flex items-center justify-center mb-6 text-secondary group-hover:scale-110 transition-transform">
          <BrainCircuit className="w-6 h-6" />
        </div>
        <h3 className="text-xl font-bold text-white mb-3">AI Coach Insights</h3>
        <p className="text-gray-400">Personalized insights based on your solve history. Identify weak points in cross planning or F2L pairs.</p>
      </motion.div>
    </motion.div>
  </section>
);

const SupportedMethods = () => {
  const methods = [
    { name: 'Beginner Method', desc: 'Layer-by-layer fundamentals.', icon: Layers },
    { name: 'CFOP', desc: 'Cross, F2L, OLL, PLL for speed.', icon: Zap },
    { name: 'Simplified CFOP', desc: '4-Look Last Layer transition.', icon: Target },
    { name: 'Roux', desc: 'Blockbuilding and M-slice mastery.', icon: Cuboid },
    { name: 'ZZ', desc: 'EO-line focus for rotationless solves.', icon: Crosshair },
  ];

  return (
    <section className="section-container border-t border-white/5 pt-24">
      <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="text-center mb-16">
        <h2 className="font-display text-4xl font-bold text-white mb-4">Master Any Methodology</h2>
        <p className="text-gray-400 text-lg">Cubora adapts to your solving style, supporting the most popular speedcubing methods.</p>
      </motion.div>

      <div className="flex flex-wrap justify-center gap-4">
        {methods.map((method, idx) => (
          <motion.div 
            key={idx}
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} custom={idx}
            className="glass-panel px-6 py-4 flex items-center gap-4 hover:bg-white/5 transition-colors cursor-default"
          >
            <method.icon className="w-5 h-5 text-primary" />
            <div className="text-left">
              <div className="font-bold text-white text-sm">{method.name}</div>
              <div className="text-xs text-gray-500">{method.desc}</div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

const Target = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
);

const Pricing = () => (
  <section className="section-container border-t border-white/5 pt-24">
    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="text-center mb-16">
      <h2 className="font-display text-4xl font-bold text-white mb-4">Simple, Transparent Pricing</h2>
      <p className="text-gray-400 text-lg">Start solving for free, upgrade when you need advanced analytics.</p>
    </motion.div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
      {/* Free Tier */}
      <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="glass-panel p-8 flex flex-col">
        <h3 className="text-2xl font-bold text-white mb-2">Basic</h3>
        <div className="text-4xl font-display font-bold text-white mb-6">$0<span className="text-lg text-gray-500 font-sans">/mo</span></div>
        <ul className="space-y-4 mb-8 flex-1">
          {['10 AI Scans per day', 'Beginner & Basic CFOP methods', 'Standard 3D visualizations', 'Community access'].map((feat, i) => (
            <li key={i} className="flex items-center gap-3 text-gray-300">
              <CheckCircle2 className="w-5 h-5 text-tertiary" /> {feat}
            </li>
          ))}
        </ul>
        <Button variant="secondary" className="w-full">Start Free</Button>
      </motion.div>

      {/* Pro Tier */}
      <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="glass-panel p-8 flex flex-col border-primary/50 relative overflow-hidden">
        <div className="absolute top-0 right-0 bg-primary text-white text-xs font-bold px-3 py-1 rounded-bl-lg">POPULAR</div>
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent pointer-events-none" />
        <h3 className="text-2xl font-bold text-white mb-2 relative z-10">Pro</h3>
        <div className="text-4xl font-display font-bold text-white mb-6 relative z-10">$8<span className="text-lg text-gray-500 font-sans">/mo</span></div>
        <ul className="space-y-4 mb-8 flex-1 relative z-10">
          {['Unlimited AI Scans', 'All advanced methods (Roux, ZZ, etc.)', 'AI Coach F2L & lookahead analysis', 'Multiplayer races', 'Priority support'].map((feat, i) => (
            <li key={i} className="flex items-center gap-3 text-gray-300">
              <CheckCircle2 className="w-5 h-5 text-primary" /> {feat}
            </li>
          ))}
        </ul>
        <Button variant="glow" className="w-full relative z-10">Upgrade to Pro</Button>
      </motion.div>
    </div>
  </section>
);

const FAQ = () => {
  const faqs = [
    { q: "How accurate is the AI scanner?", a: "Our computer vision engine is 99.8% accurate across standard lighting conditions, automatically calibrating white balance to detect ambiguous colors." },
    { q: "Does it work with non-standard cubes?", a: "Currently, Cubora is optimized for standard 3x3x3 speedcubes. Support for 2x2, 4x4, and Megaminx is on the roadmap." },
    { q: "Can it teach me to solve without looking?", a: "Yes! The AI Coach analyzes your solving patterns and recommends specific blindfolded (BLD) tracking exercises in the Academy section." }
  ];

  return (
    <section className="section-container py-24">
      <h2 className="font-display text-3xl font-bold text-white text-center mb-12">Frequently Asked Questions</h2>
      <div className="max-w-3xl mx-auto space-y-4">
        {faqs.map((faq, i) => (
          <details key={i} className="glass-panel p-6 group cursor-pointer [&_summary::-webkit-details-marker]:hidden">
            <summary className="flex items-center justify-between font-medium text-lg text-white">
              {faq.q}
              <ChevronDown className="w-5 h-5 transition-transform group-open:rotate-180 text-gray-400" />
            </summary>
            <p className="mt-4 text-gray-400 leading-relaxed">{faq.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
};

const CTA = () => (
  <section className="relative w-full py-32 overflow-hidden border-t border-white/5">
    <div className="absolute inset-0 bg-gradient-animated opacity-10" />
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl h-[400px] bg-primary/20 blur-[150px] rounded-full pointer-events-none" />
    
    <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
      <h2 className="font-display text-5xl md:text-6xl font-bold text-white mb-6">Ready to solve smarter?</h2>
      <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">Join thousands of cubers improving their times with AI precision. No credit card required to start.</p>
      <Magnetic pullFactor={0.2}>
        <Button variant="glow" size="lg">Start Solving Free</Button>
      </Magnetic>
    </div>
  </section>
);

// --- MAIN EXPORT ---

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background relative selection:bg-primary/30 selection:text-white">
      {/* Navbar placeholder - assuming it's managed in a Layout or inserted here */}
      
      <main>
        <Hero />
        <TrustedBy />
        <FeaturesGrid />
        {/* Placeholder for Interactive Previews (Scanner/Academy) which would be complex 3D components */}
        <SupportedMethods />
        <Pricing />
        <FAQ />
        <CTA />
      </main>
      
      {/* Minimal Footer */}
      <footer className="w-full py-8 border-t border-white/5 text-center bg-[#050A14]">
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="w-6 h-6 rounded bg-gradient-animated flex items-center justify-center text-white text-xs font-bold">C</div>
          <span className="font-display font-bold text-white">Cubora</span>
        </div>
        <p className="text-gray-600 text-sm">© {new Date().getFullYear()} Cubora AI. Precision Solving.</p>
      </footer>
    </div>
  );
}