import { Suspense, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, ContactShadows } from '@react-three/drei';
import { AnimatedCube } from './AnimatedCube';
import { useTheme } from '@/context/ThemeContext';
import { useSolver } from '@/context/SolverContext';
import type { PlaybackAction } from '@/hooks/useSolvePlayback';
import * as THREE from 'three';

interface CubeViewerProps {
  className?: string;
  action?: PlaybackAction | null;
  speed: number;
  currentTimelineIndex?: number;
  cameraPosition?: [number, number, number];
  cameraFov?: number;
  initialScramble?: string[];
}

function AmbientParticles() {
  const count = 80;
  const pointsRef = useRef<THREE.Points>(null);
  const [positions, speeds] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const spd = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 6;     
      pos[i * 3 + 1] = (Math.random() - 0.5) * 6; 
      pos[i * 3 + 2] = (Math.random() - 0.5) * 6; 
      spd[i] = 0.15 + Math.random() * 0.25;
    }
    return [pos, spd];
  }, []);

  useFrame((state) => {
    if (!pointsRef.current) return;
    const time = state.clock.getElapsedTime();
    const posAttr = pointsRef.current.geometry.attributes.position;
    for (let i = 0; i < count; i++) {
      posAttr.array[i * 3 + 1] += Math.sin(time * speeds[i]) * 0.0015;
      posAttr.array[i * 3] += Math.cos(time * speeds[i] * 0.5) * 0.0008;
      posAttr.array[i * 3 + 2] += Math.sin(time * speeds[i] * 0.7) * 0.0008;
    }
    posAttr.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry><bufferAttribute attach="attributes-position" args={[positions, 3]} /></bufferGeometry>
      <pointsMaterial size={0.045} color="#F5F7FA" transparent opacity={0.4} sizeAttenuation depthWrite={false} />
    </points>
  );
}

export function CubeViewer({ className, action, speed, currentTimelineIndex, cameraPosition, cameraFov, initialScramble }: CubeViewerProps) {
  const { accent } = useTheme();
  const { solution } = useSolver();
  const [controlsEnabled, setControlsEnabled] = useState(true);

  const rimColor = useMemo(() => {
    switch (accent) {
      case 'blue': return '#5B7CFA'; case 'purple': return '#A78BFA'; case 'matte-black': return '#9CA3AF'; default: return '#FFFFFF';
    }
  }, [accent]);

  const solverScramble = useMemo(() => {
    if (!solution?.steps) return [];
    const allMoves = solution.steps.flatMap(s => s.moves.split(' ')).filter(Boolean);
    const invert = (m: string) => m.includes("'") ? m.replace("'", "") : m.includes("2") ? m : m + "'";
    return allMoves.reverse().map(invert);
  }, [solution]);

  const activeScramble = initialScramble !== undefined ? initialScramble : solverScramble;

  return (
    <div className={`w-full h-full relative cursor-grab active:cursor-grabbing touch-none ${className}`}>
      <Canvas 
        camera={{ position: cameraPosition || [4.8, 3.8, 6.2], fov: cameraFov || 32 }} 
        gl={{ antialias: true, alpha: true, stencil: false }} 
        dpr={[1, 1.5]} 
        shadows
      >
        {/* Core Lighting */}
        <directionalLight position={[10, 15, 10]} intensity={3.2} color="#FFF6E9" castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024} shadow-bias={-0.0001} />
        <directionalLight position={[-12, 8, -12]} intensity={2.5} color={rimColor} />
        <ambientLight intensity={1.0} color="#94A3B8" />
        
        {/* FIX: Replaced heavy HDR Environment map with an instant, native Hemisphere Light */}
        <hemisphereLight color="#ffffff" groundColor="#0B0F19" intensity={0.6} />
        
        <AmbientParticles />
        <Suspense fallback={null}>
          <AnimatedCube 
            action={action} 
            speed={speed} 
            currentTimelineIndex={currentTimelineIndex}
            setControlsEnabled={setControlsEnabled}
            isLocked={true} 
            initialScramble={activeScramble} 
          />
        </Suspense>
        
        {/* FIX: Lowered shadow resolution to 128 to free up GPU boot memory */}
        <ContactShadows position={[0, -1.8, 0]} opacity={0.65} scale={8} blur={2.0} far={3} color="#0B0F19" frames={1} resolution={128} />
        
        <OrbitControls 
          makeDefault
          enableZoom={false} 
          enablePan={false} 
          enableRotate={true}
          dampingFactor={0.08} 
          autoRotate={!action && controlsEnabled} 
          autoRotateSpeed={0.4} 
          enabled={controlsEnabled} 
          target={[0, 0, 0]}
        />
      </Canvas>
    </div>
  );
}