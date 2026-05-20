import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei';
import { AnimatedCube } from './AnimatedCube';

// 1. Add the missing types to your interface
interface CubeViewerProps {
  className?: string;
  currentMove: string | null;
  speed: number;
}

// 2. Extract currentMove and speed from the props
export function CubeViewer({ className, currentMove, speed }: CubeViewerProps) {
  return (
    <div className={`w-full h-full relative cursor-grab active:cursor-grabbing ${className}`}>
      <Canvas 
        camera={{ position: [3, 3, 4], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
      >
        {/* Cinematic Lighting Setup */}
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1.5} castShadow />
        <spotLight position={[-10, -10, -5]} intensity={0.5} color="#4d8eff" />

        {/* The Cube Model - Now it has the variables it needs! */}
        <Suspense fallback={null}>
          <AnimatedCube currentMove={currentMove} speed={speed} />
        </Suspense>

        {/* Environmental Reflections & Ground Shadow */}
        <Environment preset="city" />
        <ContactShadows 
          position={[0, -2, 0]} 
          opacity={0.4} 
          scale={10} 
          blur={2} 
          far={4} 
          color="#3B82F6" 
        />

        {/* Interaction Controls */}
        <OrbitControls 
          enablePan={false}
          enableZoom={true}
          minDistance={3}
          maxDistance={10}
          dampingFactor={0.05}
          autoRotate={true}
          autoRotateSpeed={0.5}
        />
      </Canvas>

      {/* UI Overlay Data (Optional, purely aesthetic) */}
      <div className="absolute top-4 left-4 pointer-events-none">
        <div className="text-xs font-mono text-gray-500">
          WebGL_Canvas <br/> Active
        </div>
      </div>
    </div>
  );
}