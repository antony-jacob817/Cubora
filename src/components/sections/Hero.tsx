import { useEffect, useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { ArrowRight, Sparkles, Scan, Cpu, Layers, Activity } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { CubeViewer } from '@/components/3d/CubeViewer';
import { useNavigate } from 'react-router-dom';
import { Magnetic } from '@/components/animations/Magnetic';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { getSlideUpVariants, getScaleUpVariants } from '@/animations/variants';

// Synaptic canvas particle system for futuristic AI atmosphere
function SynapticParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const prefersReduced = usePrefersReducedMotion();

  useEffect(() => {
    // Completely bypass particle calculations and canvas drawing if reduced motion is preferred
    if (prefersReduced) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Array<{ x: number; y: number; vx: number; vy: number; radius: number }> = [];
    const particleCount = 25; // Optimized from 45 to 25 on mobile frameworks to save UI execution threads

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };

    const init = () => {
      resize();
      particles = [];
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.25,
          vy: (Math.random() - 0.5) * 0.25,
          radius: Math.random() * 1.5 + 0.5,
        });
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const isDark = document.documentElement.classList.contains('dark');
      ctx.fillStyle = isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(15, 23, 42, 0.08)';
      ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(15, 23, 42, 0.02)';

      // Draw and update particles
      particles.forEach((p, idx) => {
        p.x += p.vx;
        p.y += p.vy;

        // Boundary bounce
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();

        // Connect near neighbors
        for (let j = idx + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dist = Math.hypot(p.x - p2.x, p.y - p2.y);
          if (dist < 90) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.lineWidth = (1 - dist / 90) * 0.5;
            ctx.stroke();
          }
        }
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    window.addEventListener('resize', resize);
    init();
    draw();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [prefersReduced]);

  if (prefersReduced) return null;
  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />;
}

export function Hero() {
  const navigate = useNavigate();
  const prefersReduced = usePrefersReducedMotion();

  // Mouse tracking for spatial 3D parallax effects
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // High-fidelity spring configurations
  const springX = useSpring(mouseX, { stiffness: 90, damping: 25 });
  const springY = useSpring(mouseY, { stiffness: 90, damping: 25 });

  // Concentric layer parallax drift velocities - completely static if reduced motion is active
  const leftX = useTransform(springX, [-0.5, 0.5], prefersReduced ? [0, 0] : [-35, 35]);
  const leftY = useTransform(springY, [-0.5, 0.5], prefersReduced ? [0, 0] : [-35, 35]);

  const rightX = useTransform(springX, [-0.5, 0.5], prefersReduced ? [0, 0] : [25, -25]);
  const rightY = useTransform(springY, [-0.5, 0.5], prefersReduced ? [0, 0] : [25, -25]);

  const bottomX = useTransform(springX, [-0.5, 0.5], prefersReduced ? [0, 0] : [-12, 12]);
  const bottomY = useTransform(springY, [-0.5, 0.5], prefersReduced ? [0, 0] : [-12, 12]);

  const cubeX = useTransform(springX, [-0.5, 0.5], prefersReduced ? [0, 0] : [-15, 15]);
  const cubeY = useTransform(springY, [-0.5, 0.5], prefersReduced ? [0, 0] : [-15, 15]);
  const rotateX = useTransform(springY, [-0.5, 0.5], prefersReduced ? ["0deg", "0deg"] : ["6deg", "-6deg"]);
  const rotateY = useTransform(springX, [-0.5, 0.5], prefersReduced ? ["0deg", "0deg"] : ["-6deg", "6deg"]);

  const auraX = useTransform(springX, [-0.5, 0.5], prefersReduced ? [0, 0] : [-8, 8]);
  const auraY = useTransform(springY, [-0.5, 0.5], prefersReduced ? [0, 0] : [-8, 8]);

  useEffect(() => {
    if (prefersReduced) return;

    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) - 0.5;
      const y = (e.clientY / window.innerHeight) - 0.5;
      mouseX.set(x);
      mouseY.set(y);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY, prefersReduced]);

  // Accessibility-aware dynamic entrance variants
  const badgeVariants = getSlideUpVariants(prefersReduced, 15);
  const headlineVariants = getSlideUpVariants(prefersReduced, 25);
  const copyVariants = getSlideUpVariants(prefersReduced, 20);
  const ctaVariants = getSlideUpVariants(prefersReduced, 15);
  const cubeContainerVariants = getScaleUpVariants(prefersReduced, 0.95);

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center pt-24 pb-12 px-4 sm:px-6 md:pt-28 md:pb-20 overflow-hidden w-full bg-background transition-colors duration-300 film-grain-noise text-center">
      
      {/* 1. Ambient Particles & AI Glow Layer */}
      <div className="absolute inset-0 pointer-events-none z-0">
        {/* Soft graphite backdrop aura */}
        <motion.div 
          style={{ x: auraX, y: auraY }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[280px] h-[280px] sm:w-[550px] sm:h-[550px] bg-primary/5 dark:bg-primary/10 rounded-full blur-[80px] sm:blur-[140px] mix-blend-screen opacity-70 pointer-events-none" 
        />
        
        {/* Synaptic Network Particles */}
        <SynapticParticles />
      </div>

      <div className="max-w-4xl mx-auto w-full flex flex-col items-center relative z-10">
        
        {/* A. Live Status Badge */}
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={badgeVariants}
          className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full border border-slate-200 dark:border-white/10 bg-white/40 dark:bg-white/5 backdrop-blur-md shadow-sm"
        >
          <span className="relative flex h-2 w-2 sm:h-2.5 sm:w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 sm:h-2.5 sm:w-2.5 bg-primary"></span>
          </span>
          <span className="text-[9px] sm:text-xs font-mono font-bold tracking-widest text-slate-600 dark:text-gray-300 uppercase">
            CUBORA ENGINE V2.0 LIVE
          </span>
        </motion.div>

        {/* B. Headline */}
        <motion.h1 
          initial="hidden"
          animate="visible"
          variants={headlineVariants}
          className="font-display text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-slate-900 dark:text-white leading-[1.2] sm:leading-[1.15] mt-4 sm:mt-6 max-w-3xl px-1 sm:px-4"
        >
          Solve Any Rubik’s Cube <br className="hidden sm:inline" />
          with <span className="text-transparent bg-clip-text bg-gradient-animated">AI Precision.</span>
        </motion.h1>

        {/* C. Supporting Copy */}
        <motion.p 
          initial="hidden"
          animate="visible"
          variants={copyVariants}
          className="text-xs sm:text-base md:text-lg lg:text-xl text-slate-600 dark:text-gray-400 max-w-xl mt-4 sm:mt-6 leading-relaxed px-4"
        >
          Learn, scan, practice, and master speedcubing with an immersive AI-powered platform designed for seamless solving.
        </motion.p>

        {/* D. CTAs (Forced Row on Mobile) */}
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={ctaVariants}
          // Changed flex-col to flex-row and added max-w-md mx-auto
          className="flex flex-row justify-center items-center gap-2 sm:gap-3 w-full max-w-md mx-auto mt-6 sm:mt-8 px-4 sm:px-0 z-30"
        >
          {/* Added flex-1 wrappers so the buttons split the width 50/50 */}
          <div className="flex-1">
            <Magnetic>
              <Button 
                  variant="glow" 
                  size="sm" 
                  onClick={() => navigate('/dashboard')}
                  // Reduced text size and padding for mobile, added whitespace-nowrap
                  className="w-full gap-1.5 sm:gap-2 group shadow-lg h-12 px-1 sm:px-6 justify-center text-[12px] sm:text-base whitespace-nowrap"
              >
                  <Scan className="w-4 h-4 sm:w-5 sm:h-5 animate-pulse" />
                  Start Solving
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Magnetic>
          </div>
          
          <div className="flex-1">
            <Magnetic>
              <Button 
                  variant="secondary" 
                  size="sm" 
                  onClick={() => {
                    const el = document.getElementById('features');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="w-full gap-1.5 sm:gap-2 group h-12 px-1 sm:px-6 justify-center text-[12px] sm:text-base whitespace-nowrap"
              >
                  <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-slate-500 dark:text-gray-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors" />
                  Explore Academy
              </Button>
            </Magnetic>
          </div>
        </motion.div>

        {/* E. Flagship Centered 3D Cube Showcase wrapper */}
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={cubeContainerVariants}
          style={{ rotateX, rotateY, x: cubeX, y: cubeY }}
          className="h-[280px] sm:h-[380px] lg:h-[460px] w-full max-w-[500px] mt-8 sm:mt-12 flex items-center justify-center relative perspective-[1200px]"
        >
          {/* Backing Ambient spotlight */}
          <div className="absolute w-[200px] h-[200px] lg:w-[300px] lg:h-[300px] bg-primary/20 dark:bg-primary/25 blur-[60px] lg:blur-[90px] rounded-full mix-blend-screen pointer-events-none z-0" />
          
          {/* Added strict touch-none container configuration to allow finger page scrolls past WebGL bounds */}
          <div className="w-full h-full relative z-10 flex items-center justify-center touch-none">
            {/* Real 3D interactive cube engine */}
            <CubeViewer 
              className="w-full h-full"
              currentMove={null}
              speed={1}
            />
          </div>

          {/* F. Left Spatial Telemetry Card (Hidden on Mobile) */}
          <motion.div 
            style={{ x: leftX, y: leftY }}
            className="absolute -left-12 sm:-left-24 top-[15%] hidden md:flex flex-col gap-2 p-4 w-[210px] glass-panel text-left z-20 pointer-events-none select-none"
          >
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded bg-primary/20 flex items-center justify-center">
                <Layers className="w-3 h-3 text-primary" />
              </div>
              <span className="text-[10px] font-mono font-bold tracking-wider text-slate-800 dark:text-white">NEURAL CV STACK</span>
            </div>
            <div className="h-px bg-slate-200 dark:bg-white/10 my-0.5" />
            <div className="text-[10px] font-mono text-slate-500 dark:text-gray-400 space-y-1">
              <div>accuracy: <span className="text-primary font-bold">99.8%</span></div>
              <div>mesh_nodes: <span className="text-slate-800 dark:text-gray-300">54/54</span></div>
              <div>camera: <span className="text-green-500 dark:text-green-400 font-bold">CALIBRATED</span></div>
            </div>
          </motion.div>

          {/* G. Right Spatial Telemetry Card (Hidden on Mobile) */}
          <motion.div 
            style={{ x: rightX, y: rightY }}
            className="absolute -right-12 sm:-right-24 top-[35%] hidden md:flex flex-col gap-2 p-4 w-[210px] glass-panel text-left z-20 pointer-events-none select-none"
          >
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded bg-tertiary/20 flex items-center justify-center">
                <Cpu className="w-3 h-3 text-tertiary" />
              </div>
              <span className="text-[10px] font-mono font-bold tracking-wider text-slate-800 dark:text-white">CFOP SOLVER v2.0</span>
            </div>
            <div className="h-px bg-slate-200 dark:bg-white/10 my-0.5" />
            <div className="text-[10px] font-mono text-slate-500 dark:text-gray-400 space-y-1">
              <div>solve_path: <span className="text-tertiary font-bold">PARSED</span></div>
              <div>f2l_subroutines: <span className="text-slate-800 dark:text-gray-300">4 paths</span></div>
              <div>oll_index: <span className="text-slate-800 dark:text-gray-300">case_42</span></div>
              <div>engine_latency: <span className="text-tertiary font-bold">12ms</span></div>
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-[8px] font-mono text-slate-400 dark:text-gray-500 uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-tertiary animate-pulse" />
              Synaptic Engine Loaded
            </div>
          </motion.div>

          {/* H. Bottom Spatial Telemetry Card (Hidden on Mobile) */}
          <motion.div 
            style={{ x: bottomX, y: bottomY }}
            className="absolute left-1/2 -translate-x-1/2 -bottom-2 hidden md:flex flex-col gap-2 p-4 w-[230px] glass-panel text-left z-20 pointer-events-none select-none"
          >
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded bg-secondary/20 flex items-center justify-center">
                <Activity className="w-3 h-3 text-secondary" />
              </div>
              <span className="text-[10px] font-mono font-bold tracking-wider text-slate-800 dark:text-white">TACTILE SOLVING</span>
            </div>
            <div className="h-px bg-slate-200 dark:bg-white/10 my-0.5" />
            <div className="text-[10px] font-mono text-slate-500 dark:text-gray-400 space-y-1">
              <div>snap_momentum: <span className="text-secondary font-bold">0.35s SPRING</span></div>
              <div>magnetic_snaps: <span className="text-slate-800 dark:text-gray-300">ACTIVE</span></div>
              <div>haptic_latency: <span className="text-slate-800 dark:text-gray-300">0ms</span></div>
            </div>
          </motion.div>

        </motion.div>

        {/* Mobile Telemetry Alternative Row (Rendered cleanly underneath the canvas container below 768px viewports) */}
        <div className="md:hidden grid grid-cols-1 gap-3 w-full max-w-sm px-4 mt-8">
          <div className="flex items-center justify-between p-3.5 glass-panel text-left">
            <div className="flex items-center gap-2.5">
              <Layers className="w-4 h-4 text-primary" />
              <span className="text-xs font-mono font-bold text-slate-800 dark:text-white">NEURAL CV STACK</span>
            </div>
            <span className="text-xs font-mono text-primary font-bold">99.8% ACC</span>
          </div>
          <div className="flex items-center justify-between p-3.5 glass-panel text-left">
            <div className="flex items-center gap-2.5">
              <Cpu className="w-4 h-4 text-tertiary" />
              <span className="text-xs font-mono font-bold text-slate-800 dark:text-white">CFOP ENGINE PATH</span>
            </div>
            <span className="text-xs font-mono text-tertiary font-bold">12ms LAT</span>
          </div>
        </div>

      </div>
    </section>
  );
}