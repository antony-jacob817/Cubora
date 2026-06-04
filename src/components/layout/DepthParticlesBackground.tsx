import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  depth: number; // 0.1 (far, slow, dim) to 1.0 (near, fast, bright)
}

export const DepthParticlesBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Particle[] = [];
    const particleCount = 85;

    // Track normalized mouse targets [-0.5, 0.5]
    const mouse = {
      x: 0,
      y: 0,
      targetX: 0,
      targetY: 0,
    };

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const initParticles = () => {
      resize();
      particles = [];
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.15, // Slow, ambient drift
          vy: (Math.random() - 0.5) * 0.15,
          radius: Math.random() * 1.5 + 0.6,
          depth: 0.1 + Math.random() * 0.9, // Dynamic layer depth
        });
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.targetX = (e.clientX / window.innerWidth) - 0.5;
      mouse.targetY = (e.clientY / window.innerHeight) - 0.5;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        mouse.targetX = (e.touches[0].clientX / window.innerWidth) - 0.5;
        mouse.targetY = (e.touches[0].clientY / window.innerHeight) - 0.5;
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Spring-loaded mouse interpolation
      mouse.x += (mouse.targetX - mouse.x) * 0.06;
      mouse.y += (mouse.targetY - mouse.y) * 0.06;

      const isDark = document.documentElement.classList.contains('dark');

      // Sync color palettes based on active theme mode
      const particleColor = isDark ? '245, 247, 250' : '15, 23, 42';
      const connectionColor = isDark ? '255, 255, 255' : '15, 23, 42';

      particles.forEach((p, idx) => {
        // 1. Ambient constant drift
        p.x += p.vx;
        p.y += p.vy;

        // 2. Parallax mouse displacement offset based on depth layers
        // Deeper particles offset more, simulating genuine spatial depth
        const offsetX = mouse.x * p.depth * 95;
        const offsetY = mouse.y * p.depth * 95;

        let drawX = p.x + offsetX;
        let drawY = p.y + offsetY;

        // Wrap coordinate bounds cleanly inside viewport constraints
        if (drawX < -20) {
          p.x = canvas.width + 20 - offsetX;
          drawX = p.x + offsetX;
        } else if (drawX > canvas.width + 20) {
          p.x = -20 - offsetX;
          drawX = p.x + offsetX;
        }

        if (drawY < -20) {
          p.y = canvas.height + 20 - offsetY;
          drawY = p.y + offsetY;
        } else if (drawY > canvas.height + 20) {
          p.y = -20 - offsetY;
          drawY = p.y + offsetY;
        }

        // Draw particle sphere
        const baseRadius = p.radius * (0.6 + p.depth * 0.6);
        const opacity = isDark
          ? (0.08 + p.depth * 0.22)
          : (0.03 + p.depth * 0.07);

        ctx.beginPath();
        ctx.arc(drawX, drawY, baseRadius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${particleColor}, ${opacity})`;
        ctx.fill();

        // Connect extremely close neighbors (faint synaptic net constellation)
        for (let j = idx + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const p2OffsetX = mouse.x * p2.depth * 95;
          const p2OffsetY = mouse.y * p2.depth * 95;
          const p2DrawX = p2.x + p2OffsetX;
          const p2DrawY = p2.y + p2OffsetY;

          const dist = Math.hypot(drawX - p2DrawX, drawY - p2DrawY);
          if (dist < 85) {
            ctx.beginPath();
            ctx.moveTo(drawX, drawY);
            ctx.lineTo(p2DrawX, p2DrawY);
            const lineOpacity = isDark
              ? (1 - dist / 85) * 0.032
              : (1 - dist / 85) * 0.015;
            ctx.strokeStyle = `rgba(${connectionColor}, ${lineOpacity})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove);

    initParticles();
    draw();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-screen h-screen pointer-events-none z-0 bg-transparent block"
    />
  );
};
