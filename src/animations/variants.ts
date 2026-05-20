import type { Variants } from 'framer-motion';

// Premium SaaS Easing Curve (Smooth, slightly snappy, no bounce)
export const transition = {
  type: 'spring',
  stiffness: 100,
  damping: 20,
  mass: 0.5,
};

// Standard Page/Route Transitions with Motion Blur
export const pageVariants: Variants = {
  initial: { 
    opacity: 0, 
    y: 10, 
    filter: 'blur(10px)',
    scale: 0.98
  },
  enter: { 
    opacity: 1, 
    y: 0, 
    filter: 'blur(0px)',
    scale: 1,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1] // Custom cubic-bezier for premium feel
    }
  },
  exit: { 
    opacity: 0, 
    y: -10, 
    filter: 'blur(10px)',
    scale: 0.98,
    transition: {
      duration: 0.3,
      ease: [0.22, 1, 0.36, 1]
    }
  }
};

// Reusable Scroll Reveal Variants
export const revealVariants: Variants = {
  hidden: (direction: 'up' | 'down' | 'left' | 'right' = 'up') => ({
    opacity: 0,
    y: direction === 'up' ? 40 : direction === 'down' ? -40 : 0,
    x: direction === 'left' ? 40 : direction === 'right' ? -40 : 0,
    filter: 'blur(8px)',
  }),
  visible: {
    opacity: 1,
    y: 0,
    x: 0,
    filter: 'blur(0px)',
    transition: {
      duration: 0.7,
      ease: [0.16, 1, 0.3, 1],
    }
  }
};

// Global Floating Element Variant (Continuous)
export const floatVariants: Variants = {
  initial: { y: 0 },
  animate: {
    y: [-8, 8, -8],
    transition: {
      duration: 6,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};