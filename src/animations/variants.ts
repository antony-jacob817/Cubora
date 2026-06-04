import type { Variants } from 'framer-motion';

// ==================================================
// CENTRALIZED MOTION SYSTEM CONSTANTS
// ==================================================

// Premium physical spring presets designed for cinematic tactile feedback
export const SPRINGS = {
  crisp: { type: 'spring', stiffness: 380, damping: 28, mass: 0.6 },
  magnetic: { type: 'spring', stiffness: 220, damping: 15, mass: 0.1 },
  tactile: { type: 'spring', stiffness: 300, damping: 20, mass: 0.5 },
  fluid: { type: 'spring', stiffness: 140, damping: 22, mass: 0.8 },
  slow: { type: 'spring', stiffness: 60, damping: 18, mass: 1.0 }
} as const;

// Apple-level custom easing profiles
export const EASINGS = {
  premium: [0.16, 1, 0.3, 1], // Custom Apple-level easeOut
  inOut: [0.76, 0, 0.24, 1],   // Highly responsive easeInOut
  out: [0.22, 1, 0.36, 1],
  bouncy: [0.34, 1.56, 0.64, 1] // Tactical bouncy curves
} as const;

// ==================================================
// ACCESSIBILITY-AWARE DYNAMIC VARIANTS
// ==================================================

/**
 * Page route transition variants.
 * Respects prefers-reduced-motion by suppressing blur, scale, and translation vectors.
 */
export const getPageVariants = (reducedMotion: boolean): Variants => {
  if (reducedMotion) {
    return {
      initial: { opacity: 0 },
      enter: { opacity: 1, transition: { duration: 0.25, ease: 'linear' } },
      exit: { opacity: 0, transition: { duration: 0.2, ease: 'linear' } }
    };
  }

  return {
    initial: { 
      opacity: 0, 
      y: 10, 
      filter: 'blur(8px)',
      scale: 0.98
    },
    enter: { 
      opacity: 1, 
      y: 0, 
      filter: 'blur(0px)',
      scale: 1,
      transition: {
        duration: 0.45,
        ease: EASINGS.premium
      }
    },
    exit: { 
      opacity: 0, 
      y: -10, 
      filter: 'blur(8px)',
      scale: 0.98,
      transition: {
        duration: 0.3,
        ease: EASINGS.premium
      }
    }
  };
};

/**
 * Slide-up animations for components/widgets.
 * Automatically strips displacement, filter, and spring bounces when reduced motion is preferred.
 */
export const getSlideUpVariants = (reducedMotion: boolean, yOffset = 20): Variants => {
  if (reducedMotion) {
    return {
      hidden: { opacity: 0 },
      visible: { 
        opacity: 1, 
        transition: { duration: 0.25, ease: EASINGS.out } 
      }
    };
  }

  return {
    hidden: { 
      opacity: 0, 
      y: yOffset,
      filter: 'blur(4px)'
    },
    visible: { 
      opacity: 1, 
      y: 0,
      filter: 'blur(0px)',
      transition: SPRINGS.fluid
    }
  };
};

/**
 * Scale-up animations for cards and dialogs.
 * Strips scale/displacement/blur when reduced motion is preferred.
 */
export const getScaleUpVariants = (reducedMotion: boolean, scaleStart = 0.95): Variants => {
  if (reducedMotion) {
    return {
      hidden: { opacity: 0 },
      visible: { 
        opacity: 1, 
        transition: { duration: 0.25, ease: EASINGS.out } 
      }
    };
  }

  return {
    hidden: { 
      opacity: 0, 
      scale: scaleStart,
      y: 12,
      filter: 'blur(4px)'
    },
    visible: { 
      opacity: 1, 
      scale: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: SPRINGS.crisp
    }
  };
};

/**
 * Stagger container sequence choreograph.
 * If reduced motion is preferred, staggers are set to 0 to render instantly.
 */
export const getStaggerContainer = (reducedMotion: boolean, staggerDelay = 0.06): Variants => {
  return {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { 
        staggerChildren: reducedMotion ? 0 : staggerDelay 
      }
    }
  };
};

/**
 * Floating continuous ambient animations.
 * Completely disables movement if reduced motion is requested.
 */
export const getFloatVariants = (reducedMotion: boolean, yAmplitude = 6): Variants => {
  if (reducedMotion) {
    return {
      initial: { y: 0 },
      animate: { y: 0 }
    };
  }

  return {
    initial: { y: 0 },
    animate: {
      y: [-yAmplitude, yAmplitude, -yAmplitude],
      transition: {
        duration: 5,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };
};

/**
 * Reusable Scroll Reveal direction-aware variants.
 * Stagger reveals with translations that gracefully fold to pure fades when reduced motion is active.
 */
export const getRevealVariants = (reducedMotion: boolean): Variants => {
  if (reducedMotion) {
    return {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: { duration: 0.3, ease: EASINGS.out }
      }
    };
  }

  return {
    hidden: (direction: 'up' | 'down' | 'left' | 'right' = 'up') => ({
      opacity: 0,
      y: direction === 'up' ? 30 : direction === 'down' ? -30 : 0,
      x: direction === 'left' ? 30 : direction === 'right' ? -30 : 0,
      filter: 'blur(6px)'
    }),
    visible: {
      opacity: 1,
      y: 0,
      x: 0,
      filter: 'blur(0px)',
      transition: SPRINGS.fluid
    }
  };
};

// Legacy backward-compatible exports to ensure zero breakages during migration
export const transition = SPRINGS.fluid;
export const pageVariants = getPageVariants(false);
export const revealVariants = {
  hidden: (direction: 'up' | 'down' | 'left' | 'right' = 'up') => ({
    opacity: 0,
    y: direction === 'up' ? 30 : direction === 'down' ? -30 : 0,
    x: direction === 'left' ? 30 : direction === 'right' ? -30 : 0,
    filter: 'blur(6px)'
  }),
  visible: {
    opacity: 1,
    y: 0,
    x: 0,
    filter: 'blur(0px)',
    transition: SPRINGS.fluid
  }
};
export const floatVariants = getFloatVariants(false);