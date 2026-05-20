import React from 'react';
import { motion } from 'framer-motion';
import { pageVariants } from '@/animations/variants';

interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

export function PageTransition({ children, className }: PageTransitionProps) {
  return (
    <motion.div
      initial="initial"
      animate="enter"
      exit="exit"
      variants={pageVariants}
      className={className}
    >
      {children}
      {/*<Your3DCubeComponent />*/}
    </motion.div>
  );
}