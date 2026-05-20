import { useState, useEffect, useRef, useCallback } from 'react';

export interface SolveStep {
  phase: string;
  explanation: string;
  moves: string; // e.g., "R U R' U'"
}

export function useSolvePlayback(steps: SolveStep[]) {
  // Flatten moves into a single timeline array
  const moveTimeline = useRef<{ move: string; stepIndex: number; moveIndex: number }[]>([]);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTimelineIndex, setCurrentTimelineIndex] = useState(-1);
  const [speed, setSpeed] = useState(1); // 0.5x to 2.0x
  
  // Track active step for the UI Sidebar
  const activeStepIndex = currentTimelineIndex >= 0 
    ? moveTimeline.current[currentTimelineIndex]?.stepIndex 
    : 0;

  useEffect(() => {
    // Parse the backend steps into a linear timeline
    const timeline = [];
    steps.forEach((step, sIdx) => {
      const moves = step.moves.split(' ');
      moves.forEach((move, mIdx) => {
        if (move) timeline.push({ move, stepIndex: sIdx, moveIndex: mIdx });
      });
    });
    moveTimeline.current = timeline;
  }, [steps]);

  const nextMove = useCallback(() => {
    setCurrentTimelineIndex(prev => {
      const next = prev + 1;
      return next < moveTimeline.current.length ? next : prev;
    });
  }, []);

  const prevMove = useCallback(() => {
    setCurrentTimelineIndex(prev => (prev > -1 ? prev - 1 : prev));
  }, []);

  // Playback Loop
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isPlaying && currentTimelineIndex < moveTimeline.current.length - 1) {
      interval = setInterval(() => {
        nextMove();
      }, 1000 / speed); // Base speed: 1 move per second
    } else if (currentTimelineIndex >= moveTimeline.current.length - 1) {
      setIsPlaying(false); // Stop at end
    }
    
    return () => clearInterval(interval);
  }, [isPlaying, currentTimelineIndex, speed, nextMove]);

  const togglePlay = () => setIsPlaying(!isPlaying);

  return {
    isPlaying,
    togglePlay,
    speed,
    setSpeed,
    nextMove,
    prevMove,
    currentTimelineIndex,
    activeStepIndex,
    totalMoves: moveTimeline.current.length,
    currentMove: currentTimelineIndex >= 0 ? moveTimeline.current[currentTimelineIndex].move : null
  };
}