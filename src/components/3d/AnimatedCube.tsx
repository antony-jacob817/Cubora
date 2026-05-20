import { useRef, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Cubie } from './Cubie';

interface AnimatedCubeProps {
  currentMove: string | null;
  speed: number;
}

// Helper to parse moves (e.g., "R'", "U2")
const parseMove = (move: string) => {
  const face = move.charAt(0);
  const isPrime = move.includes("'");
  const isDouble = move.includes("2");
  
  let axis = new THREE.Vector3();
  let layer = 0; // -1, 0, 1 (coordinates)
  let angle = (Math.PI / 2) * (isPrime ? 1 : -1) * (isDouble ? 2 : 1);

  switch (face) {
    case 'R': axis.set(1, 0, 0); layer = 1; break;
    case 'L': axis.set(1, 0, 0); layer = -1; angle *= -1; break;
    case 'U': axis.set(0, 1, 0); layer = 1; break;
    case 'D': axis.set(0, 1, 0); layer = -1; angle *= -1; break;
    case 'F': axis.set(0, 0, 1); layer = 1; break;
    case 'B': axis.set(0, 0, 1); layer = -1; angle *= -1; break;
  }
  return { axis, layer, angle };
};

export function AnimatedCube({ currentMove, speed }: AnimatedCubeProps) {
  const cubeGroupRef = useRef<THREE.Group>(null);
  const pivotRef = useRef<THREE.Group>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const animState = useRef({ targetAngle: 0, currentAngle: 0, axis: new THREE.Vector3() });

  // Initial generation
  const [cubies] = useState(() => {
    const arr = [];
    for (let x = -1; x <= 1; x++) {
      for (let y = -1; y <= 1; y++) {
        for (let z = -1; z <= 1; z++) {
          arr.push({ position: [x, y, z] as [number, number, number], id: `${x}${y}${z}` });
        }
      }
    }
    return arr;
  });

  useEffect(() => {
    if (!currentMove || isAnimating || !cubeGroupRef.current || !pivotRef.current) return;

    const { axis, layer, angle } = parseMove(currentMove);
    const activeCubies: THREE.Object3D[] = [];

    // Find all cubies in the target slice based on current world position
    cubeGroupRef.current.children.forEach(child => {
      const worldPos = new THREE.Vector3();
      child.getWorldPosition(worldPos);
      const posOnAxis = Math.round(worldPos.dot(axis));
      if (posOnAxis === layer) {
        activeCubies.push(child);
      }
    });

    // Reparent to pivot
    activeCubies.forEach(c => pivotRef.current!.attach(c));
    
    animState.current = { targetAngle: angle, currentAngle: 0, axis };
    setIsAnimating(true);
  }, [currentMove, isAnimating]);

  useFrame((_, delta) => {
    if (!isAnimating || !pivotRef.current || !cubeGroupRef.current) return;

    const step = (Math.PI * 2) * speed * delta; // Animation speed based on user setting
    let nextAngle = animState.current.currentAngle + Math.sign(animState.current.targetAngle) * step;

    // Check if we hit the target angle
    if (Math.abs(nextAngle) >= Math.abs(animState.current.targetAngle)) {
      nextAngle = animState.current.targetAngle;
      setIsAnimating(false);
    }

    // Apply rotation
    pivotRef.current.setRotationFromAxisAngle(animState.current.axis, nextAngle);
    animState.current.currentAngle = nextAngle;

    // If finished, bake transforms and return to main group
    if (!isAnimating) {
      const children = [...pivotRef.current.children];
      children.forEach(child => {
        cubeGroupRef.current!.attach(child);
        // Clean up floating point errors
        child.position.set(Math.round(child.position.x), Math.round(child.position.y), Math.round(child.position.z));
      });
      pivotRef.current.rotation.set(0, 0, 0); // Reset pivot
    }
  });

  return (
    <group>
      <group ref={cubeGroupRef}>
        {cubies.map(c => <Cubie key={c.id} position={c.position} />)}
      </group>
      {/* Invisible pivot point at 0,0,0 */}
      <group ref={pivotRef} />
    </group>
  );
}