import { useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { ArrowRight, Sparkles, Scan } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function Hero() {
  // Mouse tracking for parallax effect
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth physics for the mouse movement
  const springX = useSpring(mouseX, { stiffness: 100, damping: 30 });
  const springY = useSpring(mouseY, { stiffness: 100, damping: 30 });

  // Transform constraints for the 3D cube container
  const rotateX = useTransform(springY, [-0.5, 0.5], ["15deg", "-15deg"]);
  const rotateY = useTransform(springX, [-0.5, 0.5], ["-15deg", "15deg"]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Normalize mouse coordinates to range [-0.5, 0.5]
      const x = (e.clientX / window.innerWidth) - 0.5;
      const y = (e.clientY / window.innerHeight) - 0.5;
      mouseX.set(x);
      mouseY.set(y);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  return (
    <section className="relative min-h-[90vh] flex items-center pt-20 overflow-hidden w-full">
      {/* Cinematic Background Particles & Glows */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] mix-blend-screen opacity-50 animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-secondary/20 rounded-full blur-[100px] mix-blend-screen opacity-50" />
        <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-20 mix-blend-overlay" />
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-10 w-full grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">
        
        {/* Left Column: Typography & CTAs */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-start gap-8"
        >
          {/* Live Status Badge */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-md"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-tertiary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-tertiary"></span>
            </span>
            <span className="text-xs font-mono font-medium tracking-wider text-gray-300">
              CUBORA ENGINE V2.0 LIVE
            </span>
          </motion.div>

          {/* Headline */}
          <h1 className="font-display text-5xl lg:text-7xl font-bold tracking-tight text-white leading-[1.1]">
            Solve Any <br/>
            Rubik’s Cube <br/>
            with <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-tertiary to-secondary animate-gradient bg-[length:200%_auto]">AI Precision.</span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg lg:text-xl text-gray-400 max-w-xl leading-relaxed">
            Learn, scan, practice, and master speedcubing with an immersive AI-powered platform designed for seamless solving.
          </p>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto mt-4">
            <Button variant="glow" size="lg" className="w-full sm:w-auto gap-2 group">
              <Scan className="w-5 h-5" />
              Start Solving
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button variant="secondary" size="lg" className="w-full sm:w-auto gap-2 group">
              <Sparkles className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
              Explore Academy
            </Button>
          </div>
        </motion.div>

        {/* Right Column: Interactive 3D Hologram Cube */}
        <div className="relative h-[400px] lg:h-[600px] w-full flex items-center justify-center perspective-[1200px]">
          <motion.div
            style={{ rotateX, rotateY }}
            className="relative w-64 h-64 lg:w-96 lg:h-96 preserve-3d"
          >
            <motion.div 
              animate={{ 
                y: [-15, 15, -15],
                rotateZ: [0, 5, -5, 0]
              }}
              transition={{ 
                duration: 6, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
              className="w-full h-full relative flex items-center justify-center"
            >
              {/* Core Cube Glow */}
              <div className="absolute inset-0 bg-primary/20 blur-[80px] rounded-full mix-blend-screen" />
              
              {/* Isometric Glass Cube Representation */}
              <div className="relative w-48 h-48 lg:w-64 lg:h-64 rotate-45 transform-gpu group">
                {/* Top Face */}
                <div className="absolute top-0 left-0 w-full h-full bg-white/[0.08] backdrop-blur-md border border-white/20 origin-bottom-right -skew-x-12 -skew-y-12 shadow-[inset_0_0_20px_rgba(255,255,255,0.1)] transition-colors duration-500 group-hover:border-primary/50" />
                {/* Left Face */}
                <div className="absolute top-full left-0 w-full h-full bg-primary/[0.05] backdrop-blur-md border border-white/10 origin-top-left skew-x-12 skew-y-12 scale-y-[0.866] transition-colors duration-500 group-hover:border-tertiary/50 group-hover:bg-tertiary/10" />
                {/* Right Face */}
                <div className="absolute top-0 left-full w-full h-full bg-secondary/[0.05] backdrop-blur-md border border-white/10 origin-top-left skew-x-12 skew-y-12 scale-x-[0.866] transition-colors duration-500 group-hover:border-secondary/50 group-hover:bg-secondary/10" />
                
                {/* Center Target Icon */}
                <div className="absolute inset-0 m-auto w-12 h-12 flex items-center justify-center z-10 text-white/50 group-hover:text-white transition-colors duration-500">
                   <Scan className="w-8 h-8 group-hover:scale-110 transition-transform duration-500" />
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>

      </div>
    </section>
  );
}