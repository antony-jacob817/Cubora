import { useMemo } from 'react';
import * as THREE from 'three';
import { RoundedBox } from '@react-three/drei';

interface CubieProps {
  position: [number, number, number];
}

// Map exactly to your ColorCorrection palette
const COLORS = {
  Right: '#EF4444',  // Red
  Left: '#F97316',   // Orange
  Top: '#FFFFFF',    // White
  Bottom: '#EAB308', // Yellow
  Front: '#22C55E',  // Green
  Back: '#3B82F6',   // Blue
  Internal: '#0B0F19' // Deep background color for inner plastic
};

export function Cubie({ position }: CubieProps) {
  const [x, y, z] = position;

  // Three.js BoxGeometry material index order: 
  // [right(x+), left(x-), top(y+), bottom(y-), front(z+), back(z-)]
  const materials = useMemo(() => {
    return [
      new THREE.MeshStandardMaterial({ color: x === 1 ? COLORS.Right : COLORS.Internal, roughness: 0.1, metalness: 0.1 }),
      new THREE.MeshStandardMaterial({ color: x === -1 ? COLORS.Left : COLORS.Internal, roughness: 0.1, metalness: 0.1 }),
      new THREE.MeshStandardMaterial({ color: y === 1 ? COLORS.Top : COLORS.Internal, roughness: 0.1, metalness: 0.1 }),
      new THREE.MeshStandardMaterial({ color: y === -1 ? COLORS.Bottom : COLORS.Internal, roughness: 0.1, metalness: 0.1 }),
      new THREE.MeshStandardMaterial({ color: z === 1 ? COLORS.Front : COLORS.Internal, roughness: 0.1, metalness: 0.1 }),
      new THREE.MeshStandardMaterial({ color: z === -1 ? COLORS.Back : COLORS.Internal, roughness: 0.1, metalness: 0.1 }),
    ];
  }, [x, y, z]);

  return (
    <RoundedBox
      args={[0.96, 0.96, 0.96]} // Slightly smaller than 1 to create natural gaps
      radius={0.08}
      smoothness={4}
      position={position}
      material={materials}
    />
  );
}