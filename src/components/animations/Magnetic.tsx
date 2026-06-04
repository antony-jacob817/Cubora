import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';

interface MagneticProps {
  children: React.ReactElement;
  pullFactor?: number;
}

export function Magnetic({ children, pullFactor = 0.15 }: MagneticProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouse = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    
    const { clientX, clientY } = e;
    const { height, width, left, top } = ref.current.getBoundingClientRect();
    
    // Calculate the distance from the center of the element
    const middleX = clientX - (left + width / 2);
    const middleY = clientY - (top + height / 2);
    
    // Apply the pull factor
    setPosition({ x: middleX * pullFactor, y: middleY * pullFactor });
  };

  const reset = () => {
    setPosition({ x: 0, y: 0 });
  };

  const { x, y } = position;

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={reset}
      animate={{ x, y }}
      transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
      className="inline-block w-full sm:w-auto relative z-10"
    >
      {children}
    </motion.div>
  );
}