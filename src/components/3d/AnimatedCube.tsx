import { useRef, useEffect, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import type { PlaybackAction } from '@/hooks/useSolvePlayback';
import * as THREE from 'three';
import { Cubie } from './Cubie';

interface AnimatedCubeProps {
  action?: PlaybackAction | null;
  speed: number;
  currentTimelineIndex?: number;
  setControlsEnabled?: (enabled: boolean) => void;
  isLocked?: boolean;
  initialScramble?: string[];
}

const parseMove = (move: string) => {
  let axis = new THREE.Vector3(1, 0, 0); 
  let layer = 99; 
  let angle = 0; 

  if (!move || typeof move !== 'string') return { axis, layer, angle };

  const face = move.charAt(0);
  const isPrime = move.includes("'");
  const isDouble = move.includes("2");
  
  angle = (Math.PI / 2) * (isPrime ? 1 : -1) * (isDouble ? 2 : 1);

  switch (face) {
    case 'R': axis.set(1, 0, 0); layer = 1; break;
    case 'L': axis.set(1, 0, 0); layer = -1; angle *= -1; break;
    case 'U': axis.set(0, 1, 0); layer = 1; break;
    case 'D': axis.set(0, 1, 0); layer = -1; angle *= -1; break;
    case 'F': axis.set(0, 0, 1); layer = 1; break;
    case 'B': axis.set(0, 0, 1); layer = -1; angle *= -1; break;
    case 'M': axis.set(1, 0, 0); layer = 0; angle *= -1; break; 
    case 'E': axis.set(0, 1, 0); layer = 0; angle *= -1; break; 
    case 'S': axis.set(0, 0, 1); layer = 0; break;              
    case 'x': axis.set(1, 0, 0); layer = 99; break;             
    case 'y': axis.set(0, 1, 0); layer = 99; break;             
    case 'z': axis.set(0, 0, 1); layer = 99; break; 
    default: angle = 0; 
  }
  return { axis, layer, angle };
};

export function AnimatedCube({ action, speed, setControlsEnabled, isLocked, initialScramble }: AnimatedCubeProps) {
  const { gl, camera, raycaster } = useThree();

  const parentGroupRef = useRef<THREE.Group>(null);
  const cubeGroupRef = useRef<THREE.Group>(null);
  const pivotRef = useRef<THREE.Group>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  
  const animState = useRef({ targetAngle: 0, currentAngle: 0, axis: new THREE.Vector3(), elapsedTime: 0 });
  const moveQueue = useRef<string[]>([]);
  const lastProcessedIndex = useRef<number>(-2);

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

  const hasScrambled = useRef(false);
  const framesPassed = useRef(0);

  const dragState = useRef({ isDragging: false, startPoint: new THREE.Vector3(), normal: new THREE.Vector3(), cubiePos: [0,0,0] as [number,number,number], dragAxis: null as THREE.Vector3|null, dragDirection: null as 'u'|'v'|null, uAxis: new THREE.Vector3(), vAxis: new THREE.Vector3(), layerIndex: 0, angle: 0, activeCubieIds: [] as string[] });
  const snapState = useRef({ isSnapping: false, axis: new THREE.Vector3(), currentAngle: 0, targetAngle: 0, velocity: 0, layerIndex: 0 });

  const handlePointerDown = (event: any, position: [number, number, number]) => {
    if (isLocked) return; 
    if (isAnimating || snapState.current.isSnapping) return;
    event.stopPropagation();

    const normal = event.face.normal.clone();
    normal.transformDirection(event.object.matrixWorld);
    normal.set(Math.round(normal.x), Math.round(normal.y), Math.round(normal.z)).normalize();

    const uAxis = new THREE.Vector3();
    const vAxis = new THREE.Vector3();
    
    if (Math.abs(normal.x) > 0.9) { uAxis.set(0, 1, 0); vAxis.set(0, 0, 1); } 
    else if (Math.abs(normal.y) > 0.9) { uAxis.set(1, 0, 0); vAxis.set(0, 0, 1); } 
    else { uAxis.set(1, 0, 0); vAxis.set(0, 1, 0); }

    dragState.current = { isDragging: true, startPoint: event.point.clone(), normal: normal, cubiePos: position, dragAxis: null, dragDirection: null, uAxis, vAxis, layerIndex: 0, angle: 0, activeCubieIds: [] };
    setControlsEnabled?.(false);
  };

  useEffect(() => {
    if (isLocked) return;

    const handlePointerMove = (e: PointerEvent) => {
      const state = dragState.current;
      if (!state.isDragging) return;

      const rect = gl.domElement.getBoundingClientRect();
      const pointer = new THREE.Vector2(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1);
      raycaster.setFromCamera(pointer, camera);

      const plane = new THREE.Plane().setFromNormalAndCoplanarPoint(state.normal, state.startPoint);
      const intersectionPoint = new THREE.Vector3();
      raycaster.ray.intersectPlane(plane, intersectionPoint);

      const displacement = intersectionPoint.clone().sub(state.startPoint);
      const du = displacement.dot(state.uAxis);
      const dv = displacement.dot(state.vAxis);

      if (!state.dragAxis) {
        if (Math.abs(du) > 0.12 || Math.abs(dv) > 0.12) {
          let selectedAxis: THREE.Vector3;
          let layerCoordIndex: number;

          if (Math.abs(du) > Math.abs(dv)) {
            state.dragDirection = 'u';
            selectedAxis = state.vAxis.clone();
            layerCoordIndex = Math.abs(selectedAxis.x) > 0.9 ? 0 : Math.abs(selectedAxis.y) > 0.9 ? 1 : 2;
          } else {
            state.dragDirection = 'v';
            selectedAxis = state.uAxis.clone();
            layerCoordIndex = Math.abs(selectedAxis.x) > 0.9 ? 0 : Math.abs(selectedAxis.y) > 0.9 ? 1 : 2;
          }

          state.dragAxis = selectedAxis;
          state.layerIndex = state.cubiePos[layerCoordIndex];

          const activeCubies: THREE.Object3D[] = [];
          cubeGroupRef.current?.children.forEach(child => {
            const worldPos = new THREE.Vector3();
            child.getWorldPosition(worldPos);
            if (Math.round(worldPos.dot(state.dragAxis!)) === state.layerIndex) activeCubies.push(child);
          });

          if (pivotRef.current) activeCubies.forEach(c => pivotRef.current!.attach(c));
        }
      }

      if (state.dragAxis && state.dragDirection && pivotRef.current) {
        const nx = state.normal.x; const ny = state.normal.y; const nz = state.normal.z;
        let angle = 0;

        if (Math.abs(nx) > 0.9) angle = state.dragDirection === 'u' ? du * nx : -dv * nx;
        else if (Math.abs(ny) > 0.9) angle = state.dragDirection === 'u' ? -du * ny : dv * ny;
        else if (Math.abs(nz) > 0.9) angle = state.dragDirection === 'u' ? du * nz : -dv * nz;

        state.angle = angle * 1.5;
        pivotRef.current.setRotationFromAxisAngle(state.dragAxis, state.angle);
      }
    };

    const handlePointerUp = () => {
      const state = dragState.current;
      if (!state.isDragging) return;
      state.isDragging = false;

      if (state.dragAxis) {
        const unit = Math.PI / 2;
        snapState.current = { isSnapping: true, axis: state.dragAxis.clone(), currentAngle: state.angle, targetAngle: Math.round(state.angle / unit) * unit, velocity: 0, layerIndex: state.layerIndex };
      } else {
        setControlsEnabled?.(true);
      }
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    return () => { window.removeEventListener('pointermove', handlePointerMove); window.removeEventListener('pointerup', handlePointerUp); };
  }, [isLocked, gl, camera, raycaster, setControlsEnabled]);

  useEffect(() => {
    if (!action || action.index === lastProcessedIndex.current) return;
    
    moveQueue.current.push(action.move);
    lastProcessedIndex.current = action.index;

    if (!isAnimating && moveQueue.current.length > 0 && !dragState.current.isDragging && !snapState.current.isSnapping) {
      triggerNextMove();
    }
  }, [action, isAnimating]);

  const triggerNextMove = () => {
    if (moveQueue.current.length === 0 || !cubeGroupRef.current || !pivotRef.current) {
      setIsAnimating(false);
      return;
    }

    const nextMove = moveQueue.current[0];
    const { axis, layer, angle } = parseMove(nextMove);

    if (angle === 0) {
      moveQueue.current.shift();
      if (moveQueue.current.length > 0) triggerNextMove();
      else setIsAnimating(false);
      return;
    }

    const activeCubies: THREE.Object3D[] = [];

    cubeGroupRef.current.children.forEach(child => {
      const worldPos = new THREE.Vector3();
      child.getWorldPosition(worldPos);
      const posOnAxis = Math.round(worldPos.dot(axis));
      if (layer === 99 || posOnAxis === layer) activeCubies.push(child);
    });

    activeCubies.forEach(c => pivotRef.current!.attach(c));
    animState.current = { targetAngle: angle, currentAngle: 0, axis, elapsedTime: 0 };
    setIsAnimating(true);
  };

  useFrame((state, delta) => {
    // --- THE ULTIMATE SCRAMBLE FIX ---
    // We wait natively inside the 3D loop for all 27 boxes to securely attach to the scene graph.
    // Then we wait 5 frames for the GPU to compile shaders before doing the matrix math.
    // This perfectly scrambles the cube without crashing and without dropping pieces!
    if (!hasScrambled.current && initialScramble && initialScramble.length > 0 && cubeGroupRef.current && pivotRef.current) {
      if (cubeGroupRef.current.children.length === 27) {
        framesPassed.current += 1;
        if (framesPassed.current > 5) {
          hasScrambled.current = true;
          
          cubeGroupRef.current.updateMatrixWorld(true);

          initialScramble.forEach(move => {
            const { axis, layer, angle } = parseMove(move);
            if (angle === 0) return;

            const activeCubies: THREE.Object3D[] = [];
            
            cubeGroupRef.current!.children.forEach(child => {
              const worldPos = new THREE.Vector3();
              child.getWorldPosition(worldPos);
              const posOnAxis = Math.round(worldPos.dot(axis));
              if (layer === 99 || posOnAxis === layer) activeCubies.push(child);
            });
            
            activeCubies.forEach(c => pivotRef.current!.attach(c));
            pivotRef.current!.setRotationFromAxisAngle(axis, angle);
            pivotRef.current!.updateMatrixWorld(true);
            
            const children = [...pivotRef.current!.children];
            children.forEach(child => {
              cubeGroupRef.current!.attach(child);
              child.position.set(Math.round(child.position.x), Math.round(child.position.y), Math.round(child.position.z));
              
              const euler = new THREE.Euler().setFromQuaternion(child.quaternion);
              euler.x = Math.round(euler.x / (Math.PI / 2)) * (Math.PI / 2);
              euler.y = Math.round(euler.y / (Math.PI / 2)) * (Math.PI / 2);
              euler.z = Math.round(euler.z / (Math.PI / 2)) * (Math.PI / 2);
              child.quaternion.setFromEuler(euler);
            });
            
            pivotRef.current!.rotation.set(0, 0, 0);
            pivotRef.current!.updateMatrixWorld(true);
            cubeGroupRef.current!.updateMatrixWorld(true);
          });
        }
      }
      return; // Skip animation calculations until the scramble is fully locked in
    }

    const isInteracting = dragState.current.isDragging || snapState.current.isSnapping || isAnimating;

    if (parentGroupRef.current) {
      const targetRx = isInteracting ? 0 : Math.sin(state.clock.elapsedTime * 0.4) * 0.03;
      const targetRy = isInteracting ? 0 : Math.cos(state.clock.elapsedTime * 0.4) * 0.03;
      
      parentGroupRef.current.rotation.x = THREE.MathUtils.lerp(parentGroupRef.current.rotation.x, targetRx, 0.06);
      parentGroupRef.current.rotation.y = THREE.MathUtils.lerp(parentGroupRef.current.rotation.y, targetRy, 0.06);
    }

    if (snapState.current.isSnapping && pivotRef.current && cubeGroupRef.current) {
      const snap = snapState.current;
      const acceleration = (-180 * (snap.currentAngle - snap.targetAngle)) + (-15 * snap.velocity);
      const dt = Math.min(delta, 0.03); 
      snap.velocity += acceleration * dt;
      snap.currentAngle += snap.velocity * dt;
      pivotRef.current.setRotationFromAxisAngle(snap.axis, snap.currentAngle);

      if (Math.abs(snap.currentAngle - snap.targetAngle) < 0.001 && Math.abs(snap.velocity) < 0.02) {
        pivotRef.current.setRotationFromAxisAngle(snap.axis, snap.targetAngle);
        [...pivotRef.current.children].forEach(child => {
          cubeGroupRef.current!.attach(child);
          child.position.set(Math.round(child.position.x), Math.round(child.position.y), Math.round(child.position.z));
        });
        pivotRef.current.rotation.set(0, 0, 0);
        snap.isSnapping = false;
        dragState.current.isDragging = false;
        dragState.current.dragAxis = null;
        setControlsEnabled?.(true);
        if (moveQueue.current.length > 0) triggerNextMove();
      }
      return;
    }

    if (dragState.current.isDragging || !isAnimating || !pivotRef.current || !cubeGroupRef.current) return;

    const duration = 0.40 / speed; 
    animState.current.elapsedTime += delta;
    const p = Math.min(animState.current.elapsedTime / duration, 1.0);
    const ease = -(Math.cos(Math.PI * p) - 1) / 2; 
    const nextAngle = animState.current.targetAngle * ease;

    if (p >= 1.0) {
      pivotRef.current.setRotationFromAxisAngle(animState.current.axis, animState.current.targetAngle);
      [...pivotRef.current.children].forEach(child => {
        cubeGroupRef.current!.attach(child);
        child.position.set(Math.round(child.position.x), Math.round(child.position.y), Math.round(child.position.z));
      });
      pivotRef.current.rotation.set(0, 0, 0); 
      moveQueue.current.shift(); 
      if (moveQueue.current.length > 0) triggerNextMove();
      else setIsAnimating(false);
    } else {
      pivotRef.current.setRotationFromAxisAngle(animState.current.axis, nextAngle);
      animState.current.currentAngle = nextAngle;
    }
  });

  return (
    <group ref={parentGroupRef}>
      <group ref={cubeGroupRef}>
        {cubies.map(c => {
          const [x, y, z] = c.position;
          const isCenterWhite = x === 0 && y === 1 && z === 0;
          return (
            <Cubie 
              key={c.id} 
              name={c.id}
              position={c.position} 
              isCenterWhite={isCenterWhite}
              onPointerDown={(e) => handlePointerDown(e, c.position)}
            />
          );
        })}
      </group>
      <group ref={pivotRef} />
    </group>
  );
}