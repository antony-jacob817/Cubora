import React from 'react';
import { motion, type Variants } from 'framer-motion';
import { getRevealVariants } from '@/animations/variants';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

interface ScrollRevealProps {
  children: React.ReactNode;
  direction?: 'up' | 'down' | 'left' | 'right';
  delay?: number;
  width?: 'fit-content' | '100%';
  className?: string;
}

export function ScrollReveal({ 
  children, 
  direction = 'up', 
  delay = 0, 
  width = '100%',
  className 
}: ScrollRevealProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const revealVariants = getRevealVariants(prefersReducedMotion);

  // Construct dynamic variants cleanly and type-safely
  const dynamicVariants: Variants = {
    hidden: revealVariants.hidden,
    visible: typeof revealVariants.visible === 'function'
      ? (customDir: any) => {
          const base = (revealVariants.visible as any)(customDir);
          return {
            ...base,
            transition: {
              ...base?.transition,
              delay
            }
          };
        }
      : {
          ...revealVariants.visible,
          transition: {
            ...(revealVariants.visible as any)?.transition,
            delay
          }
        }
  };

  return (
    <motion.div
      style={{ width }}
      className={className}
      custom={direction}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      variants={dynamicVariants}
    >
      {children}
    </motion.div>
  );
}