import { useMemo, useEffect } from 'react';
import * as THREE from 'three';
import { RoundedBox, useTexture } from '@react-three/drei';
import { useTheme } from '@/context/ThemeContext';

interface CubieProps {
  position: [number, number, number];
  onPointerDown?: (event: any) => void;
  name?: string;
  isCenterWhite?: boolean;
}

// Vibrantly calibrated luxury speedcube pigments (GAN-inspired fluorescent & half-bright tones)
const COLORS = {
  Right: '#E63946',   // High-Contrast Red
  Left: '#FD7E14',    // Saturated Fluorescent Orange
  Top: '#FFFFFF',     // Clean Ceramic White
  Bottom: '#FFD43B',  // High-Visibility Yellow
  Front: '#10B981',   // Emerald Speedcube Green
  Back: '#1C7ED6',    // Electric Cobalt Blue
  Internal: '#12131C' // ABS Matt Premium Core Black
};

export function Cubie({ position, onPointerDown, name, isCenterWhite }: CubieProps) {
  const [x, y, z] = position;
  const { accent } = useTheme();

  // Load the transparent branding logo matching the active theme accent
  const logoUrl = useMemo(() => {
    switch (accent) {
      case 'blue': return '/favicon-blue.png';
      case 'purple': return '/favicon-purple.png';
      case 'matte-black': return '/favicon-black.png';
      case 'graphite': default: return '/favicon-grey.png';
    }
  }, [accent]);

  const logoTexture = useTexture(logoUrl);

  useEffect(() => {
    if (logoTexture) {
      logoTexture.colorSpace = THREE.SRGBColorSpace;
      logoTexture.minFilter = THREE.LinearMipmapLinearFilter;
      logoTexture.magFilter = THREE.LinearFilter;
      logoTexture.needsUpdate = true;
    }
  }, [logoTexture]);

  const { internalMat, stickerMats } = useMemo(() => {
    const internalMat = new THREE.MeshPhysicalMaterial({
      color: COLORS.Internal,
      roughness: 0.46,
      metalness: 0.08,
      clearcoat: 0.1,
      reflectivity: 0.25
    });

    const stickerParams = {
      roughness: 0.25,
      metalness: 0.1,
      clearcoat: 1.0,
      clearcoatRoughness: 0.04,
      reflectivity: 1.0
    };

    const stickerMats = {
      Right: new THREE.MeshPhysicalMaterial({ color: COLORS.Right, ...stickerParams }),
      Left: new THREE.MeshPhysicalMaterial({ color: COLORS.Left, ...stickerParams }),
      Top: new THREE.MeshPhysicalMaterial({ color: COLORS.Top, ...stickerParams }),
      Bottom: new THREE.MeshPhysicalMaterial({ color: COLORS.Bottom, ...stickerParams }),
      Front: new THREE.MeshPhysicalMaterial({ color: COLORS.Front, ...stickerParams }),
      Back: new THREE.MeshPhysicalMaterial({ color: COLORS.Back, ...stickerParams })
    };

    return { internalMat, stickerMats };
  }, []);

  useEffect(() => {
    return () => {
      internalMat.dispose();
      Object.values(stickerMats).forEach(mat => mat.dispose());
    };
  }, [internalMat, stickerMats]);

  // --- ENGINEERED DIMENSIONS ---
  // 1. Core Dimensions
  const cubieSize = 0.93; // Deep 0.07 gaps between pieces for prominent black grid
  const filletRadius = 0.05; // Slightly rounded internal black core
  
  // 2. Uniform Tile Dimensions (Solves the warping bug!)
  const tileSize = 0.84; // The square size of the colored tile
  const tileDepth = 0.06; // How thick the tile is (The "Pop")
  const tileRadius = 0.08; // High pillowed rounding for luxury look
  
  // 3. Mathematical placement offset to lock tile onto the core face
  const offset = (cubieSize / 2) + (tileDepth / 2) - 0.005; // Minus 0.005 to recess slightly and prevent light bleed

  return (
    <group position={position} onPointerDown={onPointerDown} name={name}>
      {/* 1. Engineered ABS Plastic Core Box */}
      <RoundedBox
        args={[cubieSize, cubieSize, cubieSize]}
        radius={filletRadius}
        smoothness={6}
        material={internalMat}
        castShadow
        receiveShadow
      />

      {/* 2. Right Face (Red) */}
      {x === 1 && (
        <RoundedBox
          args={[tileSize, tileSize, tileDepth]} // Uniform args
          position={[offset, 0, 0]}
          rotation={[0, Math.PI / 2, 0]} // Rotated into place
          radius={tileRadius}
          smoothness={6}
          material={stickerMats.Right}
          castShadow
        />
      )}
      
      {/* 3. Left Face (Orange) */}
      {x === -1 && (
        <RoundedBox
          args={[tileSize, tileSize, tileDepth]}
          position={[-offset, 0, 0]}
          rotation={[0, -Math.PI / 2, 0]}
          radius={tileRadius}
          smoothness={6}
          material={stickerMats.Left}
          castShadow
        />
      )}
      
      {/* 4. Top Face (White + Logo) */}
      {y === 1 && (
        <group position={[0, offset, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <RoundedBox
            args={[tileSize, tileSize, tileDepth]}
            radius={tileRadius}
            smoothness={6}
            material={stickerMats.Top}
            castShadow
          />
          {/* Seamless physical speedcube brand logo overlay */}
          {isCenterWhite && logoTexture && (
            <mesh 
              position={[0, 0, tileDepth / 2 + 0.001]} // Pushed to the surface of the tile
              castShadow
            >
              <planeGeometry args={[0.42, 0.42]} />
              <meshPhysicalMaterial
                map={logoTexture}
                transparent={true}
                roughness={0.25}
                metalness={0.1}
                clearcoat={1.0}
                clearcoatRoughness={0.04}
                depthWrite={false}
              />
            </mesh>
          )}
        </group>
      )}
      
      {/* 5. Bottom Face (Yellow) */}
      {y === -1 && (
        <RoundedBox
          args={[tileSize, tileSize, tileDepth]}
          position={[0, -offset, 0]}
          rotation={[Math.PI / 2, 0, 0]}
          radius={tileRadius}
          smoothness={6}
          material={stickerMats.Bottom}
          castShadow
        />
      )}
      
      {/* 6. Front Face (Green) */}
      {z === 1 && (
        <RoundedBox
          args={[tileSize, tileSize, tileDepth]}
          position={[0, 0, offset]}
          rotation={[0, 0, 0]}
          radius={tileRadius}
          smoothness={6}
          material={stickerMats.Front}
          castShadow
        />
      )}
      
      {/* 7. Back Face (Blue) */}
      {z === -1 && (
        <RoundedBox
          args={[tileSize, tileSize, tileDepth]}
          position={[0, 0, -offset]}
          rotation={[0, Math.PI, 0]}
          radius={tileRadius}
          smoothness={6}
          material={stickerMats.Back}
          castShadow
        />
      )}
    </group>
  );
}