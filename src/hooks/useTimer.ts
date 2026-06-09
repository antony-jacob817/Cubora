import { useState, useEffect, useRef, useCallback } from 'react';

type TimerState = 'PRE_INSPECTION' | 'PRE_INSPECTION_HOLD' | 'INSPECTION' | 'READY_WAIT' | 'READY' | 'RUNNING' | 'STOPPED';

export function useTimer(useInspection = true, voiceEnabled = true, isPhaseMode = false, numPhases = 1) {
  const [state, setState] = useState<TimerState>('PRE_INSPECTION');
  const [time, setTime] = useState(0);
  const [inspectionTime, setInspectionTime] = useState<string | number>(0);
  const [penalty, setPenalty] = useState<'None' | '+2' | 'DNF'>('None');
  
  // --- PHASE TRACKING STATE ---
  const [activePhaseIndex, setActivePhaseIndex] = useState(0);
  const splitsRef = useRef<number[]>([]);

  const startTimeRef = useRef(0);
  const animationFrameRef = useRef(0);
  const inspectionStartRef = useRef(0);
  const readyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const preInspectionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isHoldingRef = useRef(false);

  const eightSecRef = useRef(false);
  const twelveSecRef = useRef(false);
  const eightSecAudioRef = useRef<HTMLAudioElement | null>(null);
  const twelveSecAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio8 = new Audio('/8s.m4a');
    audio8.preload = 'auto';
    eightSecAudioRef.current = audio8;

    const audio12 = new Audio('/12s.m4a');
    audio12.preload = 'auto';
    twelveSecAudioRef.current = audio12;
  }, []);

  const updateTime = useCallback(() => {
    const now = performance.now();
    setTime(now - startTimeRef.current);
    animationFrameRef.current = requestAnimationFrame(updateTime);
  }, []);

  const updateInspection = useCallback(() => {
    const now = performance.now();
    const elapsed = (now - inspectionStartRef.current) / 1000;

    if (voiceEnabled) {
      if (elapsed >= 8.0 && !eightSecRef.current) {
        eightSecRef.current = true;
        if (eightSecAudioRef.current) {
          try {
            eightSecAudioRef.current.currentTime = 0;
            const playPromise = eightSecAudioRef.current.play();
            if (playPromise !== undefined) playPromise.catch(() => { });
          } catch (e) { }
        }
      }
      if (elapsed >= 12.0 && !twelveSecRef.current) {
        twelveSecRef.current = true;
        if (twelveSecAudioRef.current) {
          try {
            twelveSecAudioRef.current.currentTime = 0;
            const playPromise = twelveSecAudioRef.current.play();
            if (playPromise !== undefined) playPromise.catch(() => { });
          } catch (e) { }
        }
      }
    }

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

  const triggerPressStart = useCallback(() => {
    if (isHoldingRef.current) return;
    isHoldingRef.current = true;

    // FIX: Extracted side-effects from functional setState updaters
    // to prevent React Strict Mode from double-firing the phase taps.
    if (state === 'PRE_INSPECTION') {
        setTime(0);
        setInspectionTime(0);
        setPenalty('None');
        splitsRef.current = [];
        setActivePhaseIndex(0);

        if (useInspection) {
            if (preInspectionTimeoutRef.current) clearTimeout(preInspectionTimeoutRef.current);
            preInspectionTimeoutRef.current = setTimeout(() => {
                setState('INSPECTION');
                inspectionStartRef.current = performance.now();
                eightSecRef.current = false; twelveSecRef.current = false;
                if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
                animationFrameRef.current = requestAnimationFrame(updateInspection);
            }, 550);
            setState('PRE_INSPECTION_HOLD');
        } else {
            if (readyTimeoutRef.current) clearTimeout(readyTimeoutRef.current);
            readyTimeoutRef.current = setTimeout(() => setState('READY'), 300);
            setState('READY_WAIT');
        }
    } 
    else if (state === 'INSPECTION') {
        if (readyTimeoutRef.current) clearTimeout(readyTimeoutRef.current);
        readyTimeoutRef.current = setTimeout(() => setState('READY'), 300);
        setState('READY_WAIT');
    } 
    else if (state === 'RUNNING') {
        const now = performance.now();
        const elapsed = now - startTimeRef.current;
        
        if (isPhaseMode && splitsRef.current.length < numPhases - 1) {
            splitsRef.current.push(elapsed);
            setActivePhaseIndex(prevIdx => prevIdx + 1);
            // state remains 'RUNNING'
        } else {
            // Final phase reached: Stop timer completely
            splitsRef.current.push(elapsed);
            if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
            setTime(elapsed);
            setState('STOPPED');
        }
    } 
    else if (state === 'STOPPED') {
        setTime(0); setInspectionTime(0); setPenalty('None');
        splitsRef.current = []; setActivePhaseIndex(0);
        eightSecRef.current = false; twelveSecRef.current = false;

        if (useInspection) {
            if (preInspectionTimeoutRef.current) clearTimeout(preInspectionTimeoutRef.current);
            preInspectionTimeoutRef.current = setTimeout(() => {
                setState('INSPECTION');
                inspectionStartRef.current = performance.now();
                eightSecRef.current = false; twelveSecRef.current = false;
                if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
                animationFrameRef.current = requestAnimationFrame(updateInspection);
            }, 550);
            setState('PRE_INSPECTION_HOLD');
        } else {
            if (readyTimeoutRef.current) clearTimeout(readyTimeoutRef.current);
            readyTimeoutRef.current = setTimeout(() => setState('READY'), 300);
            setState('READY_WAIT');
        }
    }
  }, [state, useInspection, updateInspection, isPhaseMode, numPhases]);

  const triggerPressEnd = useCallback(() => {
    isHoldingRef.current = false;

    if (state === 'PRE_INSPECTION_HOLD') {
        if (preInspectionTimeoutRef.current) clearTimeout(preInspectionTimeoutRef.current);
        setState('PRE_INSPECTION');
    } 
    else if (state === 'READY_WAIT') {
        if (readyTimeoutRef.current) clearTimeout(readyTimeoutRef.current);
        setState(useInspection ? 'INSPECTION' : 'PRE_INSPECTION');
    } 
    else if (state === 'READY') {
        startTimeRef.current = performance.now();
        if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = requestAnimationFrame(updateTime);
        setState('RUNNING');
    }
  }, [state, useInspection, updateTime]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code !== 'Space' || e.repeat) return;
      if ((e.target as HTMLElement).closest('input') || (e.target as HTMLElement).closest('textarea')) return;
      e.preventDefault(); triggerPressStart();
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code !== 'Space') return;
      if ((e.target as HTMLElement).closest('input') || (e.target as HTMLElement).closest('textarea')) return;
      e.preventDefault(); triggerPressEnd();
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [triggerPressStart, triggerPressEnd]);

  useEffect(() => {
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (readyTimeoutRef.current) clearTimeout(readyTimeoutRef.current);
      if (preInspectionTimeoutRef.current) clearTimeout(preInspectionTimeoutRef.current);
    };
  }, []);

  const resetTimer = useCallback(() => {
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    if (readyTimeoutRef.current) clearTimeout(readyTimeoutRef.current);
    if (preInspectionTimeoutRef.current) clearTimeout(preInspectionTimeoutRef.current);

    isHoldingRef.current = false; eightSecRef.current = false; twelveSecRef.current = false;
    setState('PRE_INSPECTION'); setInspectionTime(0); setPenalty('None');
    splitsRef.current = []; setActivePhaseIndex(0);
  }, []);

  return { 
    state, time, setTime, inspectionTime, penalty, resetTimer, 
    triggerPressStart, triggerPressEnd, 
    activePhaseIndex, splits: splitsRef.current 
  };
}