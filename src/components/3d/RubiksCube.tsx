import { useRef } from 'react';
import { Group } from 'three';
import { Cubie } from './Cubie';

export function RubiksCube() {
  const cubeRef = useRef<Group>(null);
  const cubies = [];

  // Generate the 3x3x3 grid coordinates
  for (let x = -1; x <= 1; x++) {
    for (let y = -1; y <= 1; y++) {
      for (let z = -1; z <= 1; z++) {
        cubies.push(
          <Cubie key={`cubie-${x}-${y}-${z}`} position={[x, y, z]} />
        );
      }
    }
  }

  return (
    <group ref={cubeRef}>
      {cubies}
    </group>
  );
}