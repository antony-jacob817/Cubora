import { useState, useEffect, useMemo, useCallback } from 'react';

export interface SolveStep {
  phase: string;
  explanation: string;
  moves: string;
}

const invertMove = (move: string): string => {
  if (move.includes("'")) return move.replace("'", "");
  if (move.includes("2")) return move;
  return move + "'";
};

export type PlaybackAction = { index: number; move: string };

export function useSolvePlayback(steps: SolveStep[]) {
  const moveTimeline = useMemo(() => {
    const timeline: { move: string; stepIndex: number; moveIndex: number }[] = [];
    steps.forEach((step, sIdx) => {
      const moves = step.moves.split(' ').filter(Boolean);
      moves.forEach((move, mIdx) => {
        timeline.push({ move, stepIndex: sIdx, moveIndex: mIdx });
      });
    });
    return timeline;
  }, [steps]);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTimelineIndex, setCurrentTimelineIndex] = useState(-1);
  const [speed, setSpeed] = useState(1); 
  const [action, setAction] = useState<PlaybackAction | null>(null);
  
  const activeStepIndex = currentTimelineIndex >= 0 
    ? (moveTimeline[currentTimelineIndex]?.stepIndex ?? 0)
    : 0;

  const nextMove = useCallback(() => {
    setCurrentTimelineIndex(prev => {
      if (prev < moveTimeline.length - 1) {
        const nextIdx = prev + 1;
        setAction({ index: nextIdx, move: moveTimeline[nextIdx].move });
        return nextIdx;
      }
      return prev;
    });
  }, [moveTimeline]);

  const prevMove = useCallback(() => {
    setCurrentTimelineIndex(prev => {
      if (prev > -1) {
        const inverted = invertMove(moveTimeline[prev].move);
        setAction({ index: prev - 1, move: inverted });
        return prev - 1;
      }
      return prev;
    });
  }, [moveTimeline]);

  const jumpToStep = useCallback((targetStepIndex: number) => {
    const firstMoveIdx = moveTimeline.findIndex(item => item.stepIndex === targetStepIndex);
    if (firstMoveIdx !== -1) {
      setCurrentTimelineIndex(firstMoveIdx);
      setAction({ index: firstMoveIdx, move: moveTimeline[firstMoveIdx].move });
    }
  }, [moveTimeline]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isPlaying && currentTimelineIndex < moveTimeline.length - 1) {
      interval = setInterval(() => nextMove(), 1000 / speed);
    } else if (currentTimelineIndex >= moveTimeline.length - 1) {
      setIsPlaying(false);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentTimelineIndex, speed, nextMove, moveTimeline.length]);

  const togglePlay = () => setIsPlaying(!isPlaying);

  const reset = useCallback(() => {
    setIsPlaying(false);
    setCurrentTimelineIndex(-1);
    setAction(null);
  }, []);

  return {
    isPlaying, togglePlay, speed, setSpeed, nextMove, prevMove, reset, jumpToStep,
    currentTimelineIndex, activeStepIndex, action,
    totalMoves: moveTimeline.length,
    currentMove: action ? action.move : null
  };
}