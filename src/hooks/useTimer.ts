import { useState, useEffect, useRef, useCallback } from 'react';

type TimerState = 'PRE_INSPECTION' | 'PRE_INSPECTION_HOLD' | 'INSPECTION' | 'READY_WAIT' | 'READY' | 'RUNNING' | 'STOPPED';

export function useTimer(useInspection = true, voiceEnabled = true) {
  const [state, setState] = useState<TimerState>('PRE_INSPECTION');
  const [time, setTime] = useState(0);
  const [inspectionTime, setInspectionTime] = useState<string | number>(0);
  const [penalty, setPenalty] = useState<'None' | '+2' | 'DNF'>('None');
  
  const startTimeRef = useRef(0);
  const animationFrameRef = useRef(0);
  const inspectionStartRef = useRef(0);
  const readyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const preInspectionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isHoldingRef = useRef(false);

  // WCA Voice Alert Trackers
  const eightSecRef = useRef(false);
  const twelveSecRef = useRef(false);

  const updateTime = useCallback(() => {
    const now = performance.now();
    setTime(now - startTimeRef.current);
    animationFrameRef.current = requestAnimationFrame(updateTime);
  }, []);

  const updateInspection = useCallback(() => {
    const now = performance.now();
    const elapsed = (now - inspectionStartRef.current) / 1000;
    
    // WCA Official Voice Alerts
    if (voiceEnabled) {
      if (elapsed >= 8.0 && !eightSecRef.current) {
          eightSecRef.current = true;
          if ('speechSynthesis' in window) {
              window.speechSynthesis.cancel();
              window.speechSynthesis.speak(new SpeechSynthesisUtterance("8 seconds"));
          }
      }
      if (elapsed >= 12.0 && !twelveSecRef.current) {
          twelveSecRef.current = true;
          if ('speechSynthesis' in window) {
              window.speechSynthesis.cancel();
              window.speechSynthesis.speak(new SpeechSynthesisUtterance("12 seconds"));
          }
      }
    }
 
    // WCA Official Penalty Enforcement
    if (elapsed >= 17) {
      setPenalty('DNF');
      setInspectionTime('DNF');
    } else if (elapsed >= 15) {
      setPenalty('+2');
      setInspectionTime('+2');
    } else {
      setInspectionTime(Math.floor(elapsed));
    }
    
    animationFrameRef.current = requestAnimationFrame(updateInspection);
  }, [voiceEnabled]);

  // --- UNIFIED PRESS TRIGGERS FOR KEYBOARD & TOUCH STATE MACHINE ACTIONS ---
  const triggerPressStart = useCallback(() => {
    if (isHoldingRef.current) return;
    isHoldingRef.current = true;

    setState(prev => {
      // 1. PRE-INSPECTION STATE (Hold for exactly 1 second countdown trigger)
      if (prev === 'PRE_INSPECTION') {
        setTime(0);
        setInspectionTime(0);
        setPenalty('None');
        
        if (useInspection) {
          if (preInspectionTimeoutRef.current) clearTimeout(preInspectionTimeoutRef.current);
          preInspectionTimeoutRef.current = setTimeout(() => {
            setState('INSPECTION');
            inspectionStartRef.current = performance.now();
            eightSecRef.current = false;
            twelveSecRef.current = false;
            if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
            animationFrameRef.current = requestAnimationFrame(updateInspection);
          }, 550);
          return 'PRE_INSPECTION_HOLD';
        } else {
          // If no WCA inspection (e.g. Multiplayer lobby count), ready up directly
          if (readyTimeoutRef.current) clearTimeout(readyTimeoutRef.current);
          readyTimeoutRef.current = setTimeout(() => {
            setState('READY');
          }, 300);
          return 'READY_WAIT';
        }
      }

      // 2. INSPECTION STATE (Deliberate hold action turns state green in 300ms)
      if (prev === 'INSPECTION') {
        if (readyTimeoutRef.current) clearTimeout(readyTimeoutRef.current);
        readyTimeoutRef.current = setTimeout(() => {
          setState('READY');
        }, 300);
        return 'READY_WAIT';
      }

      // 3. RUNNING STATE (Immediate Stop of solve timer and save solve)
      if (prev === 'RUNNING') {
        if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
        const finalTime = performance.now() - startTimeRef.current;
        setTime(finalTime);
        return 'STOPPED';
      }

      // 4. STOPPED STATE (Transition back to start pre-inspection holds for the next solve)
      if (prev === 'STOPPED') {
        setTime(0);
        setInspectionTime(0);
        setPenalty('None');
        eightSecRef.current = false;
        twelveSecRef.current = false;
        
        if (useInspection) {
          if (preInspectionTimeoutRef.current) clearTimeout(preInspectionTimeoutRef.current);
          preInspectionTimeoutRef.current = setTimeout(() => {
            setState('INSPECTION');
            inspectionStartRef.current = performance.now();
            eightSecRef.current = false;
            twelveSecRef.current = false;
            if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
            animationFrameRef.current = requestAnimationFrame(updateInspection);
          }, 550);
          return 'PRE_INSPECTION_HOLD';
        } else {
          if (readyTimeoutRef.current) clearTimeout(readyTimeoutRef.current);
          readyTimeoutRef.current = setTimeout(() => {
            setState('READY');
          }, 300);
          return 'READY_WAIT';
        }
      }

      return prev;
    });
  }, [useInspection, updateInspection]);

  const triggerPressEnd = useCallback(() => {
    isHoldingRef.current = false;

    setState(prev => {
      // 1. Released during PRE_INSPECTION_HOLD (Release before 1-second threshold is ignored entirely)
      if (prev === 'PRE_INSPECTION_HOLD') {
        if (preInspectionTimeoutRef.current) {
          clearTimeout(preInspectionTimeoutRef.current);
          preInspectionTimeoutRef.current = null;
        }
        return 'PRE_INSPECTION';
      }

      // 2. Released during READY_WAIT (Quick accidental clicks/taps during inspection are ignored)
      if (prev === 'READY_WAIT') {
        if (readyTimeoutRef.current) {
          clearTimeout(readyTimeoutRef.current);
          readyTimeoutRef.current = null;
        }
        return useInspection ? 'INSPECTION' : 'PRE_INSPECTION';
      }

      // 3. Released when READY (Starts WCA Solve Timer counting up)
      if (prev === 'READY') {
        startTimeRef.current = performance.now();
        if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = requestAnimationFrame(updateTime);
        return 'RUNNING';
      }

      return prev;
    });
  }, [useInspection, updateTime]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code !== 'Space' || e.repeat) return;
      
      const target = e.target as HTMLElement;
      if (target.closest('input') || target.closest('textarea')) {
        return;
      }
      
      e.preventDefault();
      triggerPressStart();
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code !== 'Space') return;
      
      const target = e.target as HTMLElement;
      if (target.closest('input') || target.closest('textarea')) {
        return;
      }
      
      e.preventDefault();
      triggerPressEnd();
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [triggerPressStart, triggerPressEnd]);

  // Separate absolute unmount safety handler
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (readyTimeoutRef.current) clearTimeout(readyTimeoutRef.current);
      if (preInspectionTimeoutRef.current) clearTimeout(preInspectionTimeoutRef.current);
    };
  }, []);

  const resetTimer = useCallback(() => {
    setState('PRE_INSPECTION');
    // Keep time in memory so main card does not flash/reset to 0 before list load completes
    setInspectionTime(0);
    setPenalty('None');
    eightSecRef.current = false;
    twelveSecRef.current = false;
  }, []);

  return { state, time, setTime, inspectionTime, penalty, resetTimer, triggerPressStart, triggerPressEnd };
}