import React from 'react';
import { motion } from 'framer-motion';
import { revealVariants } from '@/animations/variants';

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
  return (
    <motion.div
      style={{ width }}
      className={className}
      custom={direction}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      variants={{
        ...revealVariants,
        visible: {
          ...revealVariants.visible,
          transition: {
            ...(revealVariants.visible as any).transition,
            delay,
          }
        }
      }}
    >
      {children}
    </motion.div>
  );
}