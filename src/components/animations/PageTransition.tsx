import React from 'react';
import { motion } from 'framer-motion';
import { getPageVariants } from '@/animations/variants';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

export function PageTransition({ children, className }: PageTransitionProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const variants = getPageVariants(prefersReducedMotion);

  return (
    <motion.div
      initial="initial"
      animate="enter"
      exit="exit"
      variants={variants}
      className={className}
    >
      {children}
    </motion.div>
  );
}