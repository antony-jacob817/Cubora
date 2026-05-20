import { useState, useEffect, useRef, useCallback } from 'react';

type TimerState = 'IDLE' | 'INSPECTION' | 'READY_WAIT' | 'READY' | 'RUNNING' | 'STOPPED';

export function useTimer(useInspection = true) {
  const [state, setState] = useState<TimerState>('IDLE');
  const [time, setTime] = useState(0);
  const [inspectionTime, setInspectionTime] = useState(15);
  
  // High-precision refs
  const startTimeRef = useRef(0);
  const animationFrameRef = useRef(0);
  const inspectionStartRef = useRef(0);
  const readyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const updateTime = useCallback(() => {
    const now = performance.now();
    setTime(now - startTimeRef.current);
    animationFrameRef.current = requestAnimationFrame(updateTime);
  }, []);

  const updateInspection = useCallback(() => {
    const now = performance.now();
    const elapsed = Math.floor((now - inspectionStartRef.current) / 1000);
    const remaining = 15 - elapsed;
    
    if (remaining <= 0) {
      // DNF logic would go here in a full WCA app, but we'll force start or stop
      setState('STOPPED'); 
      return;
    }
    
    setInspectionTime(remaining);
    animationFrameRef.current = requestAnimationFrame(updateInspection);
  }, []);

  // --- KEYBOARD EVENT HANDLER STATE MACHINE ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code !== 'Space' || e.repeat) return; // Ignore auto-repeat keydowns

      setState(prev => {
        if (prev === 'IDLE' && useInspection) {
          inspectionStartRef.current = performance.now();
          animationFrameRef.current = requestAnimationFrame(updateInspection);
          return 'INSPECTION';
        }
        
        if (prev === 'IDLE' || prev === 'INSPECTION') {
          cancelAnimationFrame(animationFrameRef.current); // Stop inspection countdown
          
          // WCA rule: must hold spacebar for 0.3s before green light
          readyTimeoutRef.current = setTimeout(() => {
            setState('READY');
          }, 300);
          return 'READY_WAIT';
        }

        if (prev === 'RUNNING') {
          cancelAnimationFrame(animationFrameRef.current);
          const finalTime = performance.now() - startTimeRef.current;
          setTime(finalTime);
          return 'STOPPED';
        }

        return prev;
      });
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code !== 'Space') return;

      setState(prev => {
        if (prev === 'READY_WAIT') {
          clearTimeout(readyTimeoutRef.current);
          // Released too early! Go back to inspection or idle
          return useInspection ? 'INSPECTION' : 'IDLE'; 
        }

        if (prev === 'READY') {
          startTimeRef.current = performance.now();
          animationFrameRef.current = requestAnimationFrame(updateTime);
          return 'RUNNING';
        }

        if (prev === 'STOPPED') {
          return 'IDLE';
        }

        return prev;
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      cancelAnimationFrame(animationFrameRef.current);
      clearTimeout(readyTimeoutRef.current);
    };
  }, [useInspection, updateTime, updateInspection]);

  // Expose a reset function for the UI to save the solve and reset
  const resetTimer = useCallback(() => {
    setState('IDLE');
    setTime(0);
    setInspectionTime(15);
  }, []);

  return { state, time, inspectionTime, resetTimer };
}