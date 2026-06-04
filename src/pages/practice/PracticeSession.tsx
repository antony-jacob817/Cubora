import { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Timer as TimerIcon, Trophy, Activity, Target, ChevronDown, ChevronLeft, ChevronRight, Trash2, Check, MessageSquare, Volume2, VolumeX, Plus, Maximize2, Minimize2, Zap, Award, Crown } from 'lucide-react';
import { PageTransition } from '@/components/animations/PageTransition';
import { useTimer } from '@/hooks/useTimer';
import { generateScramble, formatTime } from '@/utils/cubing';
import { useAuth } from '@/context/AuthContext';
import { clsx } from 'clsx';
import { Button } from '@/components/ui/Button';
import confetti from 'canvas-confetti';

interface SolveRecord {
    _id?: string;
    id?: string;
    timeMs: number;
    scramble: string;
    method: string;
    penalty: 'None' | '+2' | 'DNF';
    date: string | Date;
    comments?: string; 
}

interface CubeState {
    U: string[];
    D: string[];
    L: string[];
    R: string[];
    F: string[];
    B: string[];
}

function getScrambledState(scrambleStr: string): CubeState {
    const state: CubeState = {
        U: Array(9).fill('Y'),
        D: Array(9).fill('W'),
        L: Array(9).fill('O'),
        R: Array(9).fill('R'),
        F: Array(9).fill('G'),
        B: Array(9).fill('B')
    };

    const rotateFaceCW = (face: keyof CubeState) => {
        const f = state[face];
        state[face] = [f[6], f[3], f[0], f[7], f[4], f[1], f[8], f[5], f[2]];
    };

    const applyMove = (move: string) => {
        const base = move[0] as keyof CubeState;
        if (!state[base]) return; // Guard against malformed moves
        const modifier = move.slice(1);

        const count = modifier === '2' ? 2 : modifier === "'" ? 3 : 1;

        for (let t = 0; t < count; t++) {
            rotateFaceCW(base);
            // Neighbor rotations for CW
            if (base === 'U') {
                const temp = [state.F[0], state.F[1], state.F[2]];
                state.F[0] = state.R[0]; state.F[1] = state.R[1]; state.F[2] = state.R[2];
                state.R[0] = state.B[0]; state.R[1] = state.B[1]; state.R[2] = state.B[2];
                state.B[0] = state.L[0]; state.B[1] = state.L[1]; state.B[2] = state.L[2];
                state.L[0] = temp[0]; state.L[1] = temp[1]; state.L[2] = temp[2];
            } else if (base === 'D') {
                const temp = [state.F[6], state.F[7], state.F[8]];
                state.F[6] = state.L[6]; state.F[7] = state.L[7]; state.F[8] = state.L[8];
                state.L[6] = state.B[6]; state.L[7] = state.B[7]; state.L[8] = state.B[8];
                state.B[6] = state.R[6]; state.B[7] = state.R[7]; state.B[8] = state.R[8];
                state.R[6] = temp[0]; state.R[7] = temp[1]; state.R[8] = temp[2];
            } else if (base === 'R') {
                const temp = [state.U[2], state.U[5], state.U[8]];
                state.U[2] = state.F[2]; state.U[5] = state.F[5]; state.U[8] = state.F[8];
                state.F[2] = state.D[2]; state.F[5] = state.D[5]; state.F[8] = state.D[8];
                state.D[2] = state.B[6]; state.D[5] = state.B[3]; state.D[8] = state.B[0];
                state.B[6] = temp[0]; state.B[3] = temp[1]; state.B[0] = temp[2];
            } else if (base === 'L') {
                const temp = [state.U[0], state.U[3], state.U[6]];
                state.U[0] = state.B[8]; state.U[3] = state.B[5]; state.U[6] = state.B[2];
                state.B[8] = state.D[0]; state.B[5] = state.D[3]; state.B[2] = state.D[6];
                state.D[0] = state.F[0]; state.D[3] = state.F[3]; state.D[6] = state.F[6];
                state.F[0] = temp[0]; state.F[3] = temp[1]; state.F[6] = temp[2];
            } else if (base === 'F') {
                const temp = [state.U[6], state.U[7], state.U[8]];
                state.U[6] = state.L[8]; state.U[7] = state.L[5]; state.U[8] = state.L[2];
                state.L[8] = state.D[2]; state.L[5] = state.D[1]; state.L[2] = state.D[0];
                state.D[2] = state.R[0]; state.D[1] = state.R[3]; state.D[0] = state.R[6];
                state.R[0] = temp[0]; state.R[3] = temp[1]; state.R[6] = temp[2];
            } else if (base === 'B') {
                const temp = [state.U[2], state.U[1], state.U[0]];
                state.U[2] = state.R[8]; state.U[1] = state.R[5]; state.U[0] = state.R[2];
                state.R[8] = state.D[6]; state.R[5] = state.D[7]; state.R[2] = state.D[8];
                state.D[6] = state.L[0]; state.D[7] = state.L[3]; state.D[8] = state.L[6];
                state.L[0] = temp[0]; state.L[3] = temp[1]; state.L[6] = temp[2];
            }
        }
    };

    const moves = scrambleStr.split(' ').filter(Boolean);
    for (const move of moves) {
        applyMove(move);
    }

    return state;
}

const FaceGrid = ({ face }: { face: string[] }) => {
    return (
        <div className="grid grid-cols-3 bg-zinc-300 dark:bg-zinc-800 p-[3px] rounded-md w-fit shrink-0">
            {face.map((color, idx) => {
                return (
                    <div 
                        key={idx} 
                        className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-[3px] shadow-sm border border-zinc-300 dark:border-zinc-800"
                        style={{
                            backgroundColor: color === 'Y' ? '#EAB308' :
                                             color === 'W' ? '#F8FAFC' :
                                             color === 'O' ? '#F97316' :
                                             color === 'R' ? '#EF4444' :
                                             color === 'G' ? '#10B981' : '#3B82F6'
                        }}
                    />
                );
            })}
        </div>
    );
};

function ScramblePreview({ scramble }: { scramble: string }) {
    const state = useMemo(() => getScrambledState(scramble), [scramble]);

    return (
        <div className="grid grid-cols-4 gap-0.5 sm:gap-1 select-none shrink-0 w-max">
            {/* Row 1 */}
            <div />
            <FaceGrid face={state.U} />
            <div />
            <div />

            {/* Row 2 */}
            <FaceGrid face={state.L} />
            <FaceGrid face={state.F} />
            <FaceGrid face={state.R} />
            <FaceGrid face={state.B} />

            {/* Row 3 */}
            <div />
            <FaceGrid face={state.D} />
            <div />
            <div />
        </div>
    );
}

const RubiksCubeIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <rect x="3" y="3" width="18" height="18" rx="1.5" />
        <path d="M9 3v18" />
        <path d="M15 3v18" />    
        <path d="M3 9h18" />
        <path d="M3 15h18" />
    </svg>
);

export default function PracticeSession() {
    const { getAuthHeaders } = useAuth();

    // Voice Alerts Toggle State
    const [isVoiceEnabled, setIsVoiceEnabled] = useState(() => {
        return localStorage.getItem('cubora_voice_alerts') !== 'false';
    });

    useEffect(() => {
        localStorage.setItem('cubora_voice_alerts', String(isVoiceEnabled));
    }, [isVoiceEnabled]);

    const { state, time, setTime, inspectionTime, penalty: autoPenalty = 'None', resetTimer, triggerPressStart, triggerPressEnd } = useTimer(true, isVoiceEnabled); 

    const timerRef = useRef<HTMLDivElement>(null);
    const [isFullscreen, setIsFullscreen] = useState(false);

    const toggleFullscreen = () => {
        if (!timerRef.current) return;
        if (!document.fullscreenElement) {
            timerRef.current.requestFullscreen().catch((err) => {
                console.error(`Error attempting to enable fullscreen: ${err.message}`);
            });
        } else {
            document.exitFullscreen();
        }
    };

    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(document.fullscreenElement === timerRef.current);
        };
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
        };
    }, []);

    const [sessions, setSessions] = useState<string[]>(() => {
        const saved = localStorage.getItem('cubora_practice_sessions');
        return saved ? JSON.parse(saved) : ['Session 1'];
    });
    const [currentSession, setCurrentSession] = useState(() => {
        const saved = localStorage.getItem('cubora_practice_sessions');
        const parsed = saved ? JSON.parse(saved) : ['Session 1'];
        return parsed[0] || 'Session 1';
    });
    const [scrambleQueue, setScrambleQueue] = useState<string[]>([]);
    const [scrambleIndex, setScrambleIndex] = useState(-1);
    const scramble = scrambleQueue[scrambleIndex] || '';
    const [showScramblePreview, setShowScramblePreview] = useState(false);

    const handleNextScramble = () => {
        if (scrambleIndex < scrambleQueue.length - 1) {
            setScrambleIndex(prev => prev + 1);
        } else {
            const next = generateScramble();
            setScrambleQueue(prev => [...prev, next]);
            setScrambleIndex(prev => prev + 1);
        }
    };

    const handlePrevScramble = () => {
        if (scrambleIndex > 0) {
            setScrambleIndex(prev => prev - 1);
        }
    };
    const [solves, setSolves] = useState<SolveRecord[]>([]);

    const [confirmModal, setConfirmModal] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        confirmText: string;
        onConfirm: () => void;
    }>({
        isOpen: false,
        title: '',
        message: '',
        confirmText: 'Confirm',
        onConfirm: () => {}
    });

    const [inputModal, setInputModal] = useState<{
        isOpen: boolean;
        title: string;
        placeholder: string;
        confirmText: string;
        onConfirm: (val: string) => void;
    }>({
        isOpen: false,
        title: '',
        placeholder: '',
        confirmText: 'Confirm',
        onConfirm: () => {}
    });
    const [newSessionNameInput, setNewSessionNameInput] = useState('');
    const [globalPb, setGlobalPb] = useState<number | null>(null);

    // Save sessions to localStorage when they change
    useEffect(() => {
        localStorage.setItem('cubora_practice_sessions', JSON.stringify(sessions));
    }, [sessions]);

    const [method, setMethod] = useState('CFOP');
    
    // Method Dropdown State
    const [isMethodDropdownOpen, setIsMethodDropdownOpen] = useState(false);
    const methodDropdownRef = useRef<HTMLDivElement>(null);

    // Session Dropdown State
    const [isSessionDropdownOpen, setIsSessionDropdownOpen] = useState(false);
    const sessionDropdownRef = useRef<HTMLDivElement>(null);
    const scramblePreviewRef = useRef<HTMLDivElement>(null);

    // Track which solve is actively being edited for penalties
    const [selectedSolveId, setSelectedSolveId] = useState<string | null>(null);
    const [activeCommentSolveId, setActiveCommentSolveId] = useState<string | null>(null);

    // Handle clicks outside the dropdown to close it
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent | TouchEvent) => {
            if (methodDropdownRef.current && !methodDropdownRef.current.contains(event.target as Node)) {
                setIsMethodDropdownOpen(false);
            }
            if (sessionDropdownRef.current && !sessionDropdownRef.current.contains(event.target as Node)) {
                setIsSessionDropdownOpen(false);
            }
            if (scramblePreviewRef.current && !scramblePreviewRef.current.contains(event.target as Node)) {
                setShowScramblePreview(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('touchstart', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('touchstart', handleClickOutside);
        };
    }, []);

    const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
        // Prevent timer start when clicking buttons, inputs, or dropdowns
        if (
            (e.target as HTMLElement).closest('button') || 
            (e.target as HTMLElement).closest('input') || 
            (e.target as HTMLElement).closest('.method-dropdown-container') || 
            (e.target as HTMLElement).closest('.session-dropdown-container') ||
            (e.target as HTMLElement).closest('.scramble-preview-tooltip')
        ) {
            return;
        }
        if (e.button !== 0) return;
        
        // Disable mouse clicks on the timer card for desktop views
        if (e.pointerType === 'mouse') return;

        e.preventDefault();
        e.currentTarget.setPointerCapture(e.pointerId);
        triggerPressStart();
    };

    const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
        if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('input') || (e.target as HTMLElement).closest('.method-dropdown-container') || (e.target as HTMLElement).closest('.session-dropdown-container')) {
            return;
        }
        if (e.button !== 0) return;

        // Disable mouse clicks on the timer card for desktop views
        if (e.pointerType === 'mouse') return;

        e.preventDefault();
        try {
            e.currentTarget.releasePointerCapture(e.pointerId);
        } catch (err) {
            // Ignore capture release
        }
        triggerPressEnd();
    };

    const fetchGlobalPb = async () => {
        try {
            const response = await fetch(`http://localhost:5000/api/solves?sessionId=all`, {
                headers: getAuthHeaders(),
            });
            const data = await response.json();
            if (data.success && Array.isArray(data.data)) {
                const allTimesMs = data.data.filter(s => s.penalty !== 'DNF').map(s => s.timeMs + (s.penalty === '+2' ? 2000 : 0));
                setGlobalPb(allTimesMs.length > 0 ? Math.min(...allTimesMs) : null);
            }
        } catch (err) {
            console.error('Failed to fetch global PB:', err);
        }
    };

    // Fetch user solves history on mount and when session changes
    useEffect(() => {
        const first = generateScramble();
        setScrambleQueue([first]);
        setScrambleIndex(0); 

        const fetchSolves = async () => {
            try {
                const response = await fetch(`http://localhost:5000/api/solves?sessionId=${encodeURIComponent(currentSession)}`, {
                    headers: getAuthHeaders(),
                });
                const data = await response.json();
                if (data.success) {
                    setSolves(data.data);
                }
            } catch (err) {
                console.error('Failed to load solve history:', err);
            }
        };

        fetchSolves();
        fetchGlobalPb();
    }, [currentSession]);

    const prevStateRef = useRef(state);
    const triggerPBConfetti = () => {
        const themeColors = ['#FFC107', '#00E5FF', '#FF6B6B', '#10B981', '#DA70D6'];
        confetti({
            particleCount: 150,
            spread: 100,
            origin: { y: 0.65 },
            colors: themeColors,
            disableForReducedMotion: true,
            zIndex: 9999
        });
        try {
            const cheer = new Audio('/cheer.mp3'); 
            cheer.volume = 0.5;
            cheer.play().catch(() => {});
        } catch (e) {}
    };
    useEffect(() => {
        const handleAutoSave = (finalTime: number, finalPenalty: string) => {
            const usedScramble = scramble;
            const usedMethod = method;
            const calculatedTime = finalTime + (finalPenalty === '+2' ? 2000 : 0);
            if (finalPenalty !== 'DNF' && finalTime > 0) {
                if (globalPb === null || calculatedTime < globalPb) {
                    triggerPBConfetti();
                }
            }
            const next = generateScramble();
            setScrambleQueue(prev => [...prev, next]);
            setScrambleIndex(prev => prev + 1);
            
            
            // Fire API in the background
            fetch('http://localhost:5000/api/solves', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
                body: JSON.stringify({
                    timeMs: finalTime,
                    scramble: usedScramble,
                    method: usedMethod, 
                    penalty: finalPenalty, 
                    sessionId: currentSession,
                }),
            })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setSolves(prev => [data.data, ...prev]);
                    setTime(0);
                    resetTimer();
                    fetchGlobalPb();
                }
            })
            .catch(err => console.error('Failed to auto-save solve:', err));
        };

        if (prevStateRef.current === 'RUNNING' && state === 'STOPPED') {
            handleAutoSave(time, autoPenalty);
        } else if (prevStateRef.current === 'INSPECTION' && state === 'STOPPED') {
            handleAutoSave(0, 'DNF'); // Inspection ran out (17s+)
        }
        
        prevStateRef.current = state;
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [state]); 

    // --- INLINE EDITING ACTIONS ---
    const handleUpdatePenalty = async (id: string, newPenalty: 'None' | '+2' | 'DNF') => {
        try {
            const response = await fetch(`http://localhost:5000/api/solves/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
                body: JSON.stringify({ penalty: newPenalty }),
            });

            const data = await response.json();
            if (data.success) {
                setSolves(prev => prev.map(s => (s._id === id || s.id === id) ? { ...s, penalty: newPenalty } : s));
                fetchGlobalPb();
            }
        } catch (err) {
            console.error('Failed to update penalty:', err);
        }
    };

    const handleUpdateComment = async (id: string, newComment: string) => {
        try {
            const response = await fetch(`http://localhost:5000/api/solves/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
                body: JSON.stringify({ comments: newComment }),
            });

            const data = await response.json();
            if (data.success) {
                setSolves(prev => prev.map(s => (s._id === id || s.id === id) ? { ...s, comments: newComment } : s));
            }
        } catch (err) {
            console.error('Failed to update comment:', err);
        }
    };

    const performDeleteSolve = async (id: string) => {
        try {
            const response = await fetch(`http://localhost:5000/api/solves/${id}`, {
                method: 'DELETE',
                headers: getAuthHeaders(),
            });

            const data = await response.json();
            if (data.success) {
                setSolves(prev => prev.filter(s => s._id !== id && s.id !== id));
                setSelectedSolveId(null);
                setTime(0); // Reset timer active memory so it falls back to the new latest solve
                resetTimer(); // Reset WCA states to ensure clean state machine sync
                fetchGlobalPb();
            }
        } catch (err) {
            console.error('Failed to delete solve record:', err);
        }
    };

    const handleDeleteSolve = (id: string) => {
        setConfirmModal({
            isOpen: true,
            title: 'Delete Solve',
            message: 'Are you sure you want to delete this solve? This action cannot be undone.',
            confirmText: 'Delete',
            onConfirm: () => performDeleteSolve(id)
        });
    };

    const handleClearSession = async () => {
        if (solves.length === 0) return;
        
        setConfirmModal({
            isOpen: true,
            title: 'Clear Session Solves',
            message: `Are you sure you want to clear all ${solves.length} solves in "${currentSession}"? This cannot be undone.`,
            confirmText: 'Clear',
            onConfirm: async () => {
                try {
                    // Delete all solves in the current session
                    await Promise.all(solves.map(s => {
                        const solveId = s._id || s.id || '';
                        return fetch(`http://localhost:5000/api/solves/${solveId}`, {
                            method: 'DELETE',
                            headers: getAuthHeaders(),
                        });
                    }));
                    setSolves([]);
                    setTime(0);
                    resetTimer();
                    fetchGlobalPb();
                } catch (err) {
                    console.error("Failed to clear session solves:", err);
                }
            }
        });
    };

    const handleAddSession = () => {
        let nextNum = 1;
        while (sessions.includes(`Session ${nextNum}`)) {
            nextNum++;
        }
        const defaultName = `Session ${nextNum}`;
        setNewSessionNameInput(defaultName);

        setInputModal({
            isOpen: true,
            title: 'New Session Name',
            placeholder: 'Enter session name...',
            confirmText: 'Create',
            onConfirm: (name) => {
                const trimmedName = name.trim();
                if (!trimmedName) return;

                if (sessions.includes(trimmedName)) {
                    setConfirmModal({
                        isOpen: true,
                        title: 'Duplicate Session Name',
                        message: `A session named "${trimmedName}" already exists. Please choose a unique name.`,
                        confirmText: 'OK',
                        onConfirm: () => {
                            handleAddSession();
                        }
                    });
                    return;
                }

                setSessions(prev => [...prev, trimmedName]);
                setCurrentSession(trimmedName);
            }
        });
    };

    const handleDeleteSession = (sessionName: string) => {
        if (sessions.length <= 1) return;

        setConfirmModal({
            isOpen: true,
            title: 'Delete Session',
            message: `Are you sure you want to delete "${sessionName}" and all of its recorded solves? This cannot be undone.`,
            confirmText: 'Delete',
            onConfirm: async () => {
                try {
                    const response = await fetch(`http://localhost:5000/api/solves?sessionId=${encodeURIComponent(sessionName)}`, {
                        headers: getAuthHeaders(),
                    });
                    const result = await response.json();
                    
                    if (result.success && Array.isArray(result.data)) {
                        await Promise.all(result.data.map(s => {
                            const solveId = s._id || s.id || '';
                            return fetch(`http://localhost:5000/api/solves/${solveId}`, {
                                method: 'DELETE',
                                headers: getAuthHeaders(),
                            });
                        }));
                    }
                } catch (err) {
                    console.error("Failed to delete session solves:", err);
                }

                setSessions(prev => {
                    const nextSessions = prev.filter(s => s !== sessionName);
                    if (currentSession === sessionName) {
                        setCurrentSession(nextSessions[0]);
                    }
                    return nextSessions;
                });
                setTime(0);
                resetTimer();
                fetchGlobalPb();
            }
        });
    };

    // Helper to calculate standard Average of N (aoN)
    const calculateAoN = (solvesSlice: SolveRecord[], n: number) => {
        if (solvesSlice.length < n) return null;
        const dnfCount = solvesSlice.filter(s => s.penalty === 'DNF').length;
        if (dnfCount > 1) return 'DNF';
        
        const times = solvesSlice.map(s => s.penalty === 'DNF' ? Infinity : s.timeMs + (s.penalty === '+2' ? 2000 : 0));
        times.sort((a, b) => a - b);
        
        const middleTimes = times.slice(1, n - 1);
        if (middleTimes.includes(Infinity)) return 'DNF';
        
        return middleTimes.reduce((a, b) => a + b, 0) / (n - 2);
    };

    // Helper to calculate Mean of 3 (mo3)
    const calculateMo3 = (solvesSlice: SolveRecord[]) => {
        if (solvesSlice.length < 3) return null;
        const hasDnf = solvesSlice.some(s => s.penalty === 'DNF');
        if (hasDnf) return 'DNF';
        
        const times = solvesSlice.map(s => s.timeMs + (s.penalty === '+2' ? 2000 : 0));
        return times.reduce((a, b) => a + b, 0) / 3;
    };

    // 1. Single Helper arrays
    const timesMs = solves.filter(s => s.penalty !== 'DNF').map(s => s.timeMs + (s.penalty === '+2' ? 2000 : 0));
    const bestSolveTime = timesMs.length > 0 ? Math.min(...timesMs) : null;
    const worstSolveTime = timesMs.length > 0 ? Math.max(...timesMs) : null;
    
    // 2. Best mo3
    let bestMo3: number | 'DNF' | null = null;
    for (let i = 0; i <= solves.length - 3; i++) {
        const val = calculateMo3(solves.slice(i, i + 3));
        if (val !== null && val !== 'DNF') {
            if (bestMo3 === null || bestMo3 === 'DNF' || val < bestMo3) bestMo3 = val;
        } else if (val === 'DNF' && bestMo3 === null) {
            bestMo3 = 'DNF';
        }
    }

    // 3. Best ao5
    let bestAo5: number | 'DNF' | null = null;
    for (let i = 0; i <= solves.length - 5; i++) {
        const val = calculateAoN(solves.slice(i, i + 5), 5);
        if (val !== null && val !== 'DNF') {
            if (bestAo5 === null || bestAo5 === 'DNF' || val < bestAo5) bestAo5 = val;
        } else if (val === 'DNF' && bestAo5 === null) {
            bestAo5 = 'DNF';
        }
    }

    // 4. Best ao12
    let bestAo12: number | 'DNF' | null = null;
    for (let i = 0; i <= solves.length - 12; i++) {
        const val = calculateAoN(solves.slice(i, i + 12), 12);
        if (val !== null && val !== 'DNF') {
            if (bestAo12 === null || bestAo12 === 'DNF' || val < bestAo12) bestAo12 = val;
        } else if (val === 'DNF' && bestAo12 === null) {
            bestAo12 = 'DNF';
        }
    }

    // 5. Best ao50
    let bestAo50: number | 'DNF' | null = null;
    for (let i = 0; i <= solves.length - 50; i++) {
        const val = calculateAoN(solves.slice(i, i + 50), 50);
        if (val !== null && val !== 'DNF') {
            if (bestAo50 === null || bestAo50 === 'DNF' || val < bestAo50) bestAo50 = val;
        } else if (val === 'DNF' && bestAo50 === null) {
            bestAo50 = 'DNF';
        }
    }

    // 6. Best ao100
    let bestAo100: number | 'DNF' | null = null;
    for (let i = 0; i <= solves.length - 100; i++) {
        const val = calculateAoN(solves.slice(i, i + 100), 100);
        if (val !== null && val !== 'DNF') {
            if (bestAo100 === null || bestAo100 === 'DNF' || val < bestAo100) bestAo100 = val;
        } else if (val === 'DNF' && bestAo100 === null) {
            bestAo100 = 'DNF';
        }
    }

    const renderStatValue = (val: number | 'DNF' | null) => {
        if (val === null || val === Infinity) return '--';
        if (val === 'DNF') return 'DNF';
        return formatTime(val);
    };

    const renderComparison = () => {
        // Only show comparison when in resting/stopped states and we have solves
        if (state !== 'PRE_INSPECTION' && state !== 'STOPPED') return null;
        if (solves.length < 2) return null;

        let currentMs = 0;
        let prevMs = 0;

        if (state === 'STOPPED') {
            // We just finished a solve. The solve time is in `time`.
            currentMs = time;

            const latestRawMs = solves[0].timeMs;
            // If the latest solve's raw time in solves array is already the same as `time`,
            // then `solves[0]` is the current solve, and `solves[1]` is the previous solve.
            if (Math.abs(time - latestRawMs) < 50) {
                if (solves.length < 2) return null;
                currentMs = latestRawMs;
                prevMs = solves[1].timeMs;
            } else {
                // Otherwise, the solves array hasn't updated yet.
                // We compare the completed time in memory (`time`) with `solves[0]`.
                prevMs = latestRawMs;
            }
        } else {
            // state === 'PRE_INSPECTION' (resting/session viewing)
            if (solves.length < 2) return null;
            currentMs = solves[0].timeMs;
            prevMs = solves[1].timeMs;
        }

        const diffMs = currentMs - prevMs;
        const diffSec = diffMs / 1000;

        const formattedDiff = diffSec >= 0 
            ? `+${diffSec.toFixed(3)}` 
            : `${diffSec.toFixed(3)}`;

        const colorClass = diffMs < 0 
            ? 'text-emerald-500 drop-shadow-[0_0_15px_rgba(16,185,129,0.4)]' 
            : diffMs > 0 
                ? 'text-red-500 drop-shadow-[0_0_15px_rgba(239,68,68,0.4)]' 
                : 'text-slate-400';

        return (
            <span className={clsx("absolute bottom-4 right-4 sm:bottom-6 sm:right-6 font-display font-bold text-lg sm:text-2xl lg:text-3xl select-none", colorClass)}>
                ({formattedDiff})
            </span>
        );
    };

    const getDisplayTime = () => {
        if (state === 'READY_WAIT' || state === 'READY') {
            return 0;
        }
        if (time) {
            return time;
        }
        if (solves.length > 0) {
            return solves[0].timeMs;
        }
        return 0;
    };

    const getTimerColor = () => {
        let activePenalty = 'None';
        if (state === 'STOPPED' && time > 0) {
            activePenalty = autoPenalty;
        } else if (solves.length > 0) {
            activePenalty = solves[0].penalty;
        }

        switch (state) {
            case 'PRE_INSPECTION_HOLD':
            case 'READY_WAIT': 
                return 'text-red-500 drop-shadow-[0_0_20px_rgba(239,68,68,0.5)]';
            case 'INSPECTION':
                if (inspectionTime === 'DNF' || autoPenalty === 'DNF') {
                    return 'text-red-500 drop-shadow-[0_0_20px_rgba(239,68,68,0.5)]';
                }
                if (inspectionTime === '+2' || autoPenalty === '+2') {
                    return 'text-yellow-500 dark:text-amber-400 drop-shadow-[0_0_20px_rgba(234,179,8,0.5)]';
                }
                return 'text-emerald-500 drop-shadow-[0_0_20px_rgba(16,185,129,0.5)]';
            case 'READY': 
                return 'text-emerald-500 drop-shadow-[0_0_20px_rgba(16,185,129,0.5)]';
            case 'RUNNING': 
                return 'text-slate-900 dark:text-white';
            case 'STOPPED': 
            case 'PRE_INSPECTION': 
                return activePenalty === 'DNF' 
                    ? 'text-red-500' 
                    : activePenalty === '+2' 
                        ? 'text-yellow-500 dark:text-amber-400 drop-shadow-[0_0_20px_rgba(234,179,8,0.5)]' 
                        : 'text-primary';
            default: 
                return 'text-slate-900 dark:text-white';
        }
    };

    const renderStats = (containerClass: string, cardClass: string = "p-3") => (
        <div className={clsx("w-full", containerClass)}>
            {/* Single (PB) Card */}
            <div className={clsx("glass-panel flex flex-col justify-center text-center lg:text-left transition-all duration-300", cardClass)}>
                <span className="text-[9px] sm:text-[10px] font-bold text-slate-500 dark:text-gray-500 uppercase flex items-center justify-center lg:justify-start gap-1 lg:gap-1.5 mb-1 truncate">
                    <Trophy className="w-3.5 h-3.5 text-[#FFC107] shrink-0" /> 
                    <span>Best Single</span>
                </span>
                <span className="font-display font-bold text-xl sm:text-2xl text-slate-900 dark:text-white leading-tight mt-1">
                    {renderStatValue(globalPb)}
                </span>
            </div>

            {/* mo3 Card */}
            <div className={clsx("glass-panel flex flex-col justify-center text-center lg:text-left transition-all duration-300", cardClass)}>
                <span className="text-[9px] sm:text-[10px] font-bold text-slate-500 dark:text-gray-500 uppercase flex items-center justify-center lg:justify-start gap-1 lg:gap-1.5 mb-1 truncate">
                    <Activity className="w-3.5 h-3.5 text-[#00E5FF] shrink-0" /> 
                    <span>Best mo3</span>
                </span>
                <span className="font-display font-bold text-xl sm:text-2xl text-slate-900 dark:text-white leading-tight mt-1">
                    {renderStatValue(bestMo3)}
                </span>
            </div>

            {/* ao5 Card */}
            <div className={clsx("glass-panel flex flex-col justify-center text-center lg:text-left transition-all duration-300", cardClass)}>
                <span className="text-[9px] sm:text-[10px] font-bold text-slate-500 dark:text-gray-500 uppercase flex items-center justify-center lg:justify-start gap-1 lg:gap-1.5 mb-1 truncate">
                    <Zap className="w-3.5 h-3.5 text-[#FF6B6B] shrink-0" /> 
                    <span>Best ao5</span>
                </span>
                <span className="font-display font-bold text-xl sm:text-2xl text-slate-900 dark:text-white leading-tight mt-1">
                    {renderStatValue(bestAo5)}
                </span>
            </div>

            {/* ao12 Card */}
            <div className={clsx("glass-panel flex flex-col justify-center text-center lg:text-left transition-all duration-300", cardClass)}>
                <span className="text-[9px] sm:text-[10px] font-bold text-slate-500 dark:text-gray-500 uppercase flex items-center justify-center lg:justify-start gap-1 lg:gap-1.5 mb-1 truncate">
                    <Target className="w-3.5 h-3.5 text-[#DA70D6] shrink-0" /> 
                    <span>Best ao12</span>
                </span>
                <span className="font-display font-bold text-xl sm:text-2xl text-slate-900 dark:text-white leading-tight mt-1">
                    {renderStatValue(bestAo12)}
                </span>
            </div>

            {/* ao50 Card */}
            <div className={clsx("glass-panel flex flex-col justify-center text-center lg:text-left transition-all duration-300", cardClass)}>
                <span className="text-[9px] sm:text-[10px] font-bold text-slate-500 dark:text-gray-500 uppercase flex items-center justify-center lg:justify-start gap-1 lg:gap-1.5 mb-1 truncate">
                    <Award className="w-3.5 h-3.5 text-[#10B981] shrink-0" /> 
                    <span>Best ao50</span>
                </span>
                <span className="font-display font-bold text-xl sm:text-2xl text-slate-900 dark:text-white leading-tight mt-1">
                    {renderStatValue(bestAo50)}
                </span>
            </div>

            {/* ao100 Card */}
            <div className={clsx("glass-panel flex flex-col justify-center text-center lg:text-left transition-all duration-300", cardClass)}>
                <span className="text-[9px] sm:text-[10px] font-bold text-slate-500 dark:text-gray-500 uppercase flex items-center justify-center lg:justify-start gap-1 lg:gap-1.5 mb-1 truncate">
                    <Crown className="w-3.5 h-3.5 text-[#E2E8F0] shrink-0" /> 
                    <span>Best ao100</span>
                </span>
                <span className="font-display font-bold text-xl sm:text-2xl text-slate-900 dark:text-white leading-tight mt-1">
                    {renderStatValue(bestAo100)}
                </span>
            </div>
        </div>
    );

    return (
        <PageTransition className="practice-session-root w-full h-auto lg:h-full lg:min-h-0 min-h-screen flex flex-col lg:flex-row gap-5 sm:gap-6 pb-6 px-1 sm:px-0 text-left">

            {/* Left Area: Main Timer Focus View Layout Pane */}
            <div className="flex-1 flex flex-col min-w-0 w-full lg:h-full">
                {/* Scramble Container Display with 2D Visual Preview and Scramble History Queue */}
                <div className="glass-panel p-4 sm:p-5 flex flex-col items-center gap-4 mb-4 sm:mb-5 relative overflow-visible w-full shrink-0 select-none z-30">
                    {/* Header Row: Previous Scramble, Title & Status, Next Scramble */}
                    <div className="flex items-center justify-center gap-4 sm:gap-6 w-full select-none shrink-0 border-b border-slate-200/40 dark:border-white/5 pb-3">
                        {/* Previous Scramble Button */}
                        <button
                            onClick={handlePrevScramble}
                            disabled={scrambleIndex <= 0}
                            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-slate-500 hover:text-slate-950 dark:text-gray-400 dark:hover:text-white bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 border border-slate-200 dark:border-white/5 disabled:opacity-30 disabled:pointer-events-none rounded-lg transition-all focus:outline-none cursor-pointer"
                            title="Previous Scramble"
                        >
                            <ChevronLeft className="w-3.5 h-3.5 shrink-0" />
                            <span className="hidden xs:inline">Previous</span>
                        </button>
                        
                        {/* Title & Status Indicator */}
                        <div className="flex items-center gap-2 select-none">
                            <h3 className="text-[10px] sm:text-xs font-bold text-slate-500 dark:text-gray-500 uppercase tracking-widest leading-none">
                                Current Scramble
                            </h3>
                            <span className="text-[9px] font-mono font-bold text-slate-450 dark:text-gray-650 bg-slate-100 dark:bg-white/[0.04] border border-slate-200/50 dark:border-white/5 px-2 py-0.5 rounded-full leading-none">
                                {scrambleIndex + 1} / {scrambleQueue.length}
                            </span>
                        </div>

                        {/* Next Scramble Button */}
                        <button
                            onClick={handleNextScramble}
                            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-slate-500 hover:text-slate-950 dark:text-gray-400 dark:hover:text-white bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 border border-slate-200 dark:border-white/5 rounded-lg transition-all focus:outline-none cursor-pointer"
                            title={scrambleIndex === scrambleQueue.length - 1 ? "Generate Next Scramble" : "Next Scramble"}
                        >
                            <span className="hidden xs:inline">
                                {scrambleIndex === scrambleQueue.length - 1 ? "New Scramble" : "Next Scramble"}
                            </span>
                            {scrambleIndex === scrambleQueue.length - 1 ? (
                                <Plus className="w-3.5 h-3.5 shrink-0" />
                            ) : (
                                <ChevronRight className="w-3.5 h-3.5 shrink-0" />
                            )}
                        </button>
                    </div>

                    {/* Scramble Text and Cube Visual Preview Toggle Row */}
                    <div className="flex items-center justify-center gap-3 w-full px-2 sm:px-4">
                        <div className="flex items-center justify-center gap-3 max-w-full">
                            {/* Scramble String */}
                            <p className="font-display font-bold text-lg sm:text-xl md:text-2xl lg:text-3xl text-slate-900 dark:text-white tracking-wider leading-relaxed break-words text-center select-text select-all">
                                {scramble}
                            </p>

                            {/* Rubik's Cube Visual Preview Toggle Button */}
                            <div className="relative shrink-0" ref={scramblePreviewRef}>
                                <button
                                    onClick={() => setShowScramblePreview(!showScramblePreview)}
                                    className={clsx(
                                        "w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-xl border transition-all shadow-sm focus:outline-none cursor-pointer",
                                        showScramblePreview 
                                            ? "border-zinc-600 bg-primary/10 text-primary shadow-[0_0_15px_var(--accent-glow)]"
                                            : "border-slate-200 dark:border-white/10 bg-slate-50 hover:bg-slate-100 dark:bg-white/5 dark:hover:bg-white/10 text-slate-500 hover:text-slate-950 dark:text-gray-400 dark:hover:text-white"
                                    )}
                                    title="Toggle Visual Scramble Preview"
                                >
                                    <RubiksCubeIcon className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
                                </button>
                                
                                <AnimatePresence>
                                    {showScramblePreview && scramble && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.9, y: -10 }}
                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.9, y: -10 }}
                                            transition={{ duration: 0.15, ease: "easeOut" }}
                                            className="absolute top-full right-0 mt-3 z-50 p-4 rounded-2xl bg-white/45 dark:bg-[#1C1E22]/65 backdrop-blur-md border border-slate-200 dark:border-white/10 shadow-2xl origin-top-right min-w-[200px] scramble-preview-tooltip"
                                        >
                                            {/* Arrow pointing up */}
                                            <div className="absolute -top-1.5 right-3.5 w-3 h-3 rotate-45 bg-white dark:bg-[#1C1E22] border-t border-l border-slate-200/80 dark:border-white/10" />
                                            
                                            {/* Inner Content */}
                                            <div className="relative z-10 flex flex-col items-center gap-2">
                                                <span className="text-[9px] font-bold text-slate-450 dark:text-gray-500 uppercase tracking-widest leading-none">Scramble Preview</span>
                                                <div className="p-2 rounded-xl bg-slate-100/50 dark:bg-white/[0.02] border border-slate-200/50 dark:border-white/5 shadow-inner">
                                                    <ScramblePreview scramble={scramble} />
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>
                </div>

                {/* MOBILE ONLY: Scrollable Neat Compact Stats Strip */}
                {renderStats("flex overflow-x-auto gap-2.5 mb-4 lg:hidden [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden w-full px-0.5 py-0.5 snap-x snap-mandatory", "p-2 sm:p-2.5 min-w-[110px] sm:min-w-[120px] flex-1 shrink-0 snap-center glass-flat")}

                {/* Main Interactive Touch Timer Canvas Container */}
                <div
                    ref={timerRef}
                    onPointerDown={handlePointerDown}
                    onPointerUp={handlePointerUp}
                    className={clsx(
                        "flex-grow flex flex-col items-center justify-center relative cursor-default select-none touch-none w-full transition-all duration-300",
                        isFullscreen 
                            ? "bg-[#090A0C] border-none rounded-none h-screen w-screen z-[999] justify-center items-center" 
                            : "glass-panel min-h-[300px] sm:min-h-[400px] lg:h-[500px] lg:min-h-0"
                    )}
                >
                    {/* Controls Overlay (Top Left) */}
                    <AnimatePresence>
                        {(state === 'PRE_INSPECTION' || state === 'STOPPED') && (
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.15, ease: "easeOut" }}
                                onPointerDown={(e) => e.stopPropagation()}
                                onPointerUp={(e) => e.stopPropagation()}
                                onTouchStart={(e) => e.stopPropagation()}
                                onTouchEnd={(e) => e.stopPropagation()}
                                onClick={(e) => e.stopPropagation()}
                                className="absolute top-4 left-4 sm:top-6 sm:left-6 z-20 flex flex-col gap-2"
                            >
                                <button
                                    onClick={() => setIsVoiceEnabled(!isVoiceEnabled)}
                                    className="glass-panel w-9 h-9 sm:w-[44px] sm:h-[44px] flex items-center justify-center rounded-xl sm:rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#1C1E22] text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white transition-all shadow-sm focus:outline-none backdrop-blur-md"
                                    title={isVoiceEnabled ? "Mute WCA Voice Alerts" : "Unmute WCA Voice Alerts"}
                                >
                                    {isVoiceEnabled ? (
                                        <Volume2 className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                                    ) : (
                                        <VolumeX className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                                    )}
                                </button>

                                <button
                                    onClick={toggleFullscreen}
                                    className="glass-panel w-9 h-9 sm:w-[44px] sm:h-[44px] flex items-center justify-center rounded-xl sm:rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#1C1E22] text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white transition-all shadow-sm focus:outline-none backdrop-blur-md"
                                    title={isFullscreen ? "Exit Full-screen Timer" : "Full-screen Timer Mode"}
                                >
                                    {isFullscreen ? (
                                        <Minimize2 className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                                    ) : (
                                        <Maximize2 className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                                    )}
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Fullscreen Scramble Overlay */}
                    <AnimatePresence>
                        {isFullscreen && (state === 'PRE_INSPECTION' || state === 'STOPPED') && (
                            <motion.div
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.2, ease: "easeOut" }}
                                className="absolute top-28 sm:top-5 left-4 right-4 sm:left-20 sm:right-44 mx-auto text-center z-20 flex flex-col items-center gap-1.5 sm:gap-2 select-none max-w-full"
                                onPointerDown={(e) => e.stopPropagation()}
                                onPointerUp={(e) => e.stopPropagation()}
                            >
                                <div className="flex items-center justify-center gap-2 select-none">
                                    <button
                                        onClick={handlePrevScramble}
                                        disabled={scrambleIndex <= 0}
                                        className="w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none rounded-full transition-all focus:outline-none shrink-0"
                                        title="Previous Scramble"
                                    >
                                        <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4" />
                                    </button>
                                    
                                    <span className="text-[8px] sm:text-[9px] font-bold text-slate-500 uppercase tracking-widest leading-none">
                                        Scramble {scrambleIndex + 1}/{scrambleQueue.length}
                                    </span>
                                    
                                    <button
                                        onClick={handleNextScramble}
                                        className="w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-all focus:outline-none shrink-0"
                                        title={scrambleIndex === scrambleQueue.length - 1 ? "Generate Next Scramble" : "Next Scramble"}
                                    >
                                        {scrambleIndex === scrambleQueue.length - 1 ? (
                                            <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                                        ) : (
                                            <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
                                        )}
                                    </button>
                                </div>
                                <p className="font-display font-bold text-[10px] sm:text-xs md:text-sm lg:text-base xl:text-lg text-white tracking-wide sm:tracking-wider leading-normal break-words text-center select-text max-w-full mt-1.5">
                                    {scramble}
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Method Selector Dropdown (Top Right) */}
                    <div 
                        onPointerDown={(e) => e.stopPropagation()}
                        onPointerUp={(e) => e.stopPropagation()}
                        onTouchStart={(e) => e.stopPropagation()}
                        onTouchEnd={(e) => e.stopPropagation()}
                        onClick={(e) => e.stopPropagation()}
                        className="absolute top-4 right-4 sm:top-6 sm:right-6 z-20 flex items-center method-dropdown-container"
                    >
                        <div className="relative" ref={methodDropdownRef}>
                            <button 
                                onClick={() => setIsMethodDropdownOpen(!isMethodDropdownOpen)}
                                className={`glass-panel flex items-center justify-between gap-1.5 sm:gap-3 bg-slate-50 dark:bg-[#1C1E22] border rounded-xl sm:rounded-2xl text-[12px] sm:text-sm font-semibold text-slate-700 dark:text-gray-300 pl-2.5 pr-1.5 sm:pl-4 sm:pr-3 py-1.5 sm:py-2.5 outline-none transition-all min-h-[36px] sm:min-h-[44px] min-w-[110px] sm:min-w-[150px] whitespace-nowrap shadow-sm ${
                                    isMethodDropdownOpen ? "border-primary ring-1 ring-primary" : "border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20"
                                }`}
                            >
                                {method}
                                <ChevronDown className={`w-3 h-3 sm:w-4 sm:h-4 shrink-0 text-slate-500 transition-transform duration-200 ${isMethodDropdownOpen ? "rotate-180" : ""}`} />
                            </button>
                            <div className={`glass-panel absolute top-full mt-2 right-0 w-full min-w-[140px] sm:min-w-[160px] bg-white/80 dark:bg-[#1C1E22]/80 backdrop-blur-md border border-slate-200 dark:border-white/10 rounded-xl sm:rounded-2xl shadow-xl overflow-hidden z-50 transition-all duration-200 origin-top-right ${
                                isMethodDropdownOpen ? "opacity-100 scale-100 visible" : "opacity-0 scale-95 invisible pointer-events-none"
                            }`}>
                                {['CFOP','Simplified CFOP', 'Roux', 'ZZ', 'Beginner'].map((option) => (
                                    <button
                                        key={option}
                                        onClick={() => { setMethod(option); setIsMethodDropdownOpen(false); }}
                                        className={`w-full text-left px-3 sm:px-4 py-2 sm:py-2.5 text-[13px] sm:text-sm font-medium transition-colors whitespace-nowrap ${
                                            method === option ? "bg-primary/10 text-primary dark:text-blue-400" : "text-slate-700 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-white/5"
                                        }`}
                                    >
                                        {option}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <AnimatePresence>
                        {(state === 'PRE_INSPECTION' || state === 'STOPPED') && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }} 
                                animate={{ opacity: 1, y: 0 }} 
                                exit={{ opacity: 0 }}
                                className="absolute bottom-4 sm:bottom-6 inset-x-0 mx-auto flex justify-center text-slate-500 dark:text-gray-400 text-xs sm:text-sm font-medium whitespace-nowrap z-10"
                            >
                                <span className="hidden sm:inline">Hold space to start</span>
                                <span className="inline sm:hidden">Touch and hold to start</span>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Massive Responsive Timer Typography Core */}
                    <div className="flex items-baseline justify-center gap-2 sm:gap-4 flex-wrap w-full select-none">
                        <motion.div
                            className={clsx(
                                "font-display font-bold tabular-nums tracking-tighter transition-colors duration-200 leading-none",
                                getTimerColor(),
                                state === 'INSPECTION'
                                    ? 'text-[8rem] sm:text-[12rem] lg:text-[16rem]'
                                    : 'text-[5rem] sm:text-[7rem] lg:text-[14rem]'
                            )}
                            style={{ fontVariantNumeric: 'tabular-nums' }}
                        >
                            {state === 'INSPECTION'
                                ? inspectionTime
                                : state === 'PRE_INSPECTION_HOLD'
                                    ? '0'
                                    : formatTime(getDisplayTime())
                            }
                        </motion.div>
                        {renderComparison()}
                    </div>
                </div>
            </div>

            {/* Right Area: Session Stats Widgets & Recent History Panel */}
            <div className="w-full lg:w-96 flex flex-col gap-5 sm:gap-6 shrink-0 lg:h-full">

                {/* DESKTOP ONLY: Grid layout for stat cards (Updated to 3 Columns) */}
                {renderStats("hidden lg:grid grid-cols-3 gap-3 shrink-0", "p-2.5")}

                {/* Recent Session Solve History Log Board List */}
                <div className="glass-panel p-0 flex-1 flex flex-col overflow-hidden min-h-[280px] lg:h-[500px] lg:min-h-0 w-full text-left">
                    {/* Compact Session Selection & Stats Row */}
                    <div className="flex justify-between items-center min-h-[56px] px-4 py-2.5 gap-3 border-b border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.01] w-full shrink-0 select-none">
                        {/* Left Side: Session Selector Dropdown & Trash Button */}
                        <div className="flex items-center gap-2">
                            <div className="relative flex items-center session-dropdown-container" ref={sessionDropdownRef}>
                                <button
                                    onClick={() => setIsSessionDropdownOpen(!isSessionDropdownOpen)}
                                    className={`glass-panel flex items-center justify-between gap-1.5 bg-slate-100 dark:bg-[#1C1E22] border rounded-lg pl-3 pr-2 py-1.5 text-xs font-semibold text-slate-700 dark:text-gray-300 outline-none hover:border-slate-300 dark:hover:border-white/20 hover:bg-slate-200/50 dark:hover:bg-[#25282E] transition-all cursor-pointer min-w-[95px] shadow-sm ${
                                        isSessionDropdownOpen ? "border-primary ring-1 ring-primary" : "border-slate-200 dark:border-white/10"
                                    }`}
                                >
                                    <span>{currentSession}</span>
                                    <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-200 ${isSessionDropdownOpen ? "rotate-180" : ""}`} />
                                </button>
                                
                                <div className={`glass-panel absolute top-full left-0 mt-1.5 w-[160px] bg-white/80 dark:bg-[#1C1E22]/80 backdrop-blur-md border border-slate-200 dark:border-white/10 rounded-lg shadow-xl overflow-hidden z-50 transition-all duration-200 origin-top-left ${
                                    isSessionDropdownOpen ? "opacity-100 scale-100 visible" : "opacity-0 scale-95 invisible pointer-events-none"
                                }`}>
                                    <div className="max-h-[220px] overflow-y-auto py-1 divide-y divide-slate-100 dark:divide-white/5 hide-scrollbar">
                                        {sessions.map((s) => (
                                            <div
                                                key={s}
                                                className={`flex items-center justify-between w-full px-2 py-1.5 text-xs font-semibold transition-colors ${
                                                    currentSession === s ? "bg-primary/10 text-primary dark:text-blue-400" : "text-slate-700 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-white/5"
                                                }`}
                                            >
                                                <button
                                                    onClick={() => { 
                                                        setCurrentSession(s); 
                                                        setIsSessionDropdownOpen(false); 
                                                    }}
                                                    className="flex-1 text-left py-0.5 truncate"
                                                >
                                                    {s}
                                                </button>
                                                {sessions.length > 1 && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDeleteSession(s);
                                                        }}
                                                        className="p-1 rounded-md text-red-500 hover:bg-red-500/10 active:scale-95 transition-all focus:outline-none shrink-0 ml-1"
                                                        title={`Delete ${s}`}
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5 shrink-0" />
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                    
                                    <button
                                        onClick={() => {
                                            handleAddSession();
                                            setIsSessionDropdownOpen(false);
                                        }}
                                        className="w-full flex items-center justify-center gap-1.5 py-2 px-3 border-t border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02] hover:bg-slate-100 dark:hover:bg-white/5 text-primary dark:text-blue-400 text-xs font-bold transition-all focus:outline-none"
                                    >
                                        <Plus className="w-3.5 h-3.5" />
                                        <span>Add Session</span>
                                    </button>
                                </div>
                            </div>
                            <button
                                onClick={handleClearSession}
                                className="w-8 h-8 flex items-center justify-center rounded-lg border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 active:bg-red-500/25 text-red-500 transition-all shrink-0 focus:outline-none"
                                title="Clear All Solves in Session"
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                            </button>
                        </div>

                        {/* Right Side: Session Average & Solves Total */}
                        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-gray-400">
                            <span className="text-[10px] sm:text-xs font-bold text-slate-500 dark:text-gray-500 uppercase flex items-center gap-1">
                                <TimerIcon className="w-3.5 h-3.5 text-primary shrink-0" />
                                <span>Avg:</span>
                            </span>
                            <span className="font-display font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                                {timesMs.length > 0 ? formatTime(timesMs.reduce((a, b) => a + b, 0) / timesMs.length) : '--'}
                            </span>
                            <span className="text-[10px] font-mono font-bold text-slate-400 dark:text-gray-500 bg-slate-100 dark:bg-white/[0.04] px-2 py-0.5 rounded-full border border-slate-200/50 dark:border-white/5">
                                {solves.length} {solves.length === 1 ? 'solve' : 'solves'}
                            </span>
                        </div>
                    </div>
                    {/* csTimer-style Table Header */}
                    <div className="sticky top-0 m-2 px-4 py-2.5 grid grid-cols-12 gap-2 text-[10px] sm:text-xs font-bold text-slate-400 dark:text-gray-500 uppercase tracking-wider select-none border-b border-slate-200 dark:border-white/5 bg-slate-50/90 dark:bg-black/[0.01] backdrop-blur-md z-20">
                        <div className="col-span-2 pl-1">No.</div>
                        <div className="col-span-4">Time</div>
                        <div className="col-span-2 text-center">mo3</div>
                        <div className="col-span-2 text-center">ao5</div>
                        <div className="col-span-2 text-center">ao12</div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-2 space-y-1 hide-scrollbar w-full method-dropdown-container">
                        {solves.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-slate-500 dark:text-gray-500 text-xs sm:text-sm py-12 w-full text-center">
                                <TimerIcon className="w-7 h-7 mb-2 opacity-50" />
                                No solves recorded this session.
                            </div>
                        ) : (
                            <>
                                {solves.map((solve, idx) => {
                                    const solveId = solve._id || solve.id || '';
                                    const isSelected = selectedSolveId === solveId;

                                    const calculatedTime = solve.penalty === 'DNF' ? null : solve.timeMs + (solve.penalty === '+2' ? 2000 : 0);
                                    const isBest = calculatedTime !== null && bestSolveTime !== null && calculatedTime === bestSolveTime && solves.length > 1;
                                    const isWorst = calculatedTime !== null && worstSolveTime !== null && calculatedTime === worstSolveTime && solves.length > 1;

                                    return (
                                        <motion.div 
                                            layout
                                            key={solveId} 
                                            className={clsx(
                                                "flex flex-col w-full cursor-pointer select-none border mb-1 overflow-hidden transition-all duration-200",
                                                isSelected 
                                                    ? "p-2.5 px-4 rounded-xl dark:bg-white/[0.03] bg-white/40 border-slate-200 dark:border-white/10 backdrop-blur-md shadow-md"
                                                    : "p-2 px-4 rounded-xl bg-transparent border-transparent hover:bg-slate-100 dark:hover:bg-white/5"
                                            )}
                                            onClick={() => setSelectedSolveId(isSelected ? null : solveId)}
                                            transition={{ layout: { type: "spring", stiffness: 300, damping: 28, mass: 0.9 } }}
                                        >
                                            {/* Unified Grid Row */}
                                            <div className="grid grid-cols-12 gap-2 items-center w-full">
                                                {/* Column 1: Index / No. */}
                                                <div className="col-span-2 font-mono font-bold text-xs text-slate-400 dark:text-gray-500 pl-1 select-none">
                                                    {solves.length - idx}.
                                                </div>
                                                
                                                {/* Column 2: Time Column (keeps font-size identical between states with best/worst highlights at top-right) */}
                                                <div className="col-span-4 flex items-start gap-1 sm:gap-1.5 min-w-0">
                                                    <div className="flex items-start gap-1 select-none shrink-0">
                                                        <span className="font-display font-bold text-slate-900 dark:text-white text-sm sm:text-base leading-none">
                                                            {solve.penalty === '+2' ? formatTime(solve.timeMs + 2000) + '+' : formatTime(solve.timeMs)}
                                                        </span>
                                                        {isBest && (
                                                            <span className="text-[7px] sm:text-[8px] font-mono font-extrabold uppercase text-green-600 dark:text-green-400 bg-green-500/10 px-1 py-0.5 rounded leading-none shrink-0 self-start -mt-1 select-none">
                                                                best
                                                            </span>
                                                        )}
                                                        {isWorst && (
                                                            <span className="text-[7px] sm:text-[8px] font-mono font-extrabold uppercase text-red-600 dark:text-red-400 bg-red-500/10 px-1 py-0.5 rounded leading-none shrink-0 self-start -mt-1 select-none">
                                                                worst
                                                            </span>
                                                        )}
                                                    </div>
                                                    {solve.penalty === 'None' && solve.comments && <MessageSquare className="w-2.5 h-2.5 text-slate-400/70 shrink-0 self-center" />}
                                                    {solve.penalty === '+2' && (
                                                        <span className="text-[8px] sm:text-[9px] font-mono text-yellow-600 dark:text-amber-400 font-extrabold px-1 py-0.5 rounded bg-yellow-500/10 shrink-0 select-none self-center">
                                                            +2
                                                        </span>
                                                    )}
                                                    {solve.penalty === 'DNF' && (
                                                        <span className="text-[8px] sm:text-[9px] font-mono text-red-600 dark:text-red-400 font-extrabold px-1 py-0.5 rounded bg-red-500/10 shrink-0 select-none self-center">
                                                            DNF
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Column 3, 4, 5: Either Stats when closed OR compact action buttons when open */}
                                                {!isSelected ? (
                                                    <>
                                                        {/* mo3 Column */}
                                                        <div className={clsx(
                                                            "col-span-2 text-center font-mono text-xs leading-none",
                                                            (() => {
                                                                const rowMo3 = calculateMo3(solves.slice(idx, idx + 3));
                                                                const isBestMo3 = rowMo3 !== null && rowMo3 !== 'DNF' && rowMo3 === bestMo3;
                                                                return isBestMo3 ? "text-orange-500 dark:text-orange-400 font-bold" : "text-slate-600 dark:text-gray-400";
                                                            })()
                                                        )}>
                                                            {(() => {
                                                                const rowMo3 = calculateMo3(solves.slice(idx, idx + 3));
                                                                return rowMo3 !== null ? (rowMo3 === 'DNF' ? 'DNF' : formatTime(rowMo3)) : '-';
                                                            })()}
                                                        </div>

                                                        {/* ao5 Column */}
                                                        <div className={clsx(
                                                            "col-span-2 text-center font-mono text-xs leading-none",
                                                            (() => {
                                                                const rowAo5 = calculateAoN(solves.slice(idx, idx + 5), 5);
                                                                const isBestAo5 = rowAo5 !== null && rowAo5 !== 'DNF' && rowAo5 === bestAo5;
                                                                return isBestAo5 ? "text-orange-500 dark:text-orange-400 font-bold" : "text-slate-600 dark:text-gray-400";
                                                            })()
                                                        )}>
                                                            {(() => {
                                                                const rowAo5 = calculateAoN(solves.slice(idx, idx + 5), 5);
                                                                return rowAo5 !== null ? (rowAo5 === 'DNF' ? 'DNF' : formatTime(rowAo5)) : '-';
                                                            })()}
                                                        </div>

                                                        {/* ao12 Column */}
                                                        <div className={clsx(
                                                            "col-span-2 text-center font-mono text-xs leading-none",
                                                            (() => {
                                                                const rowAo12 = calculateAoN(solves.slice(idx, idx + 12), 12);
                                                                const isBestAo12 = rowAo12 !== null && rowAo12 !== 'DNF' && rowAo12 === bestAo12;
                                                                return isBestAo12 ? "text-orange-500 dark:text-orange-400 font-bold" : "text-slate-600 dark:text-gray-400";
                                                            })()
                                                        )}>
                                                            {(() => {
                                                                const rowAo12 = calculateAoN(solves.slice(idx, idx + 12), 12);
                                                                return rowAo12 !== null ? (rowAo12 === 'DNF' ? 'DNF' : formatTime(rowAo12)) : '-';
                                                            })()}
                                                        </div>
                                                    </>
                                                ) : (
                                                    /* Compact Action Buttons (OK, +2, DNF, Comment, Delete) */
                                                    <motion.div 
                                                        initial={{ opacity: 0, x: 10 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        exit={{ opacity: 0, x: 10 }}
                                                        transition={{ duration: 0.15 }}
                                                        className="col-span-6 flex justify-end items-center gap-1 sm:gap-1.5 select-none"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        {/* None Penalty */}
                                                        <button 
                                                            onClick={() => handleUpdatePenalty(solveId, 'None')} 
                                                            className={clsx(
                                                                "w-6 h-6 sm:w-[28px] sm:h-[28px] rounded-[6px] transition-all duration-200 border flex justify-center items-center focus:outline-none backdrop-blur-md",
                                                                solve.penalty === 'None' || !solve.penalty
                                                                    ? "bg-slate-600/20 dark:bg-white/10 border-slate-400/30 dark:border-white/20 text-slate-900 dark:text-white" 
                                                                    : "bg-slate-200/40 dark:bg-white/[0.04] border-transparent text-slate-500 dark:text-gray-400 hover:bg-slate-300/40 hover:dark:bg-white/[0.08]"
                                                            )}
                                                            title="No Penalty"
                                                        >
                                                            <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
                                                        </button>
                                                        
                                                        {/* +2 Penalty */}
                                                        <button 
                                                            onClick={() => handleUpdatePenalty(solveId, '+2')} 
                                                            className={clsx(
                                                                "w-6 h-6 sm:w-[28px] sm:h-[28px] rounded-[6px] text-[8px] sm:text-[10px] font-bold tracking-wider transition-all duration-200 border flex justify-center items-center focus:outline-none backdrop-blur-md",
                                                                solve.penalty === '+2' 
                                                                    ? "bg-yellow-500/20 dark:bg-yellow-500/20 border-yellow-500/30 dark:border-yellow-500/30 text-yellow-600 dark:text-yellow-400" 
                                                                    : "bg-slate-200/40 dark:bg-white/[0.04] border-transparent text-yellow-600 dark:text-yellow-500 hover:bg-slate-300/40 hover:dark:bg-white/[0.08]"
                                                            )}
                                                            title="+2 Penalty"
                                                        >
                                                            +2
                                                        </button>

                                                        {/* DNF Penalty */}
                                                        <button 
                                                            onClick={() => handleUpdatePenalty(solveId, 'DNF')} 
                                                            className={clsx(
                                                                "w-6 h-6 sm:w-[28px] sm:h-[28px] rounded-[6px] text-[8px] sm:text-[10px] font-bold tracking-wider transition-all duration-200 border flex justify-center items-center focus:outline-none backdrop-blur-md",
                                                                solve.penalty === 'DNF' 
                                                                    ? "bg-red-500/20 dark:bg-red-500/20 border-red-500/30 dark:border-red-500/30 text-red-600 dark:text-red-400" 
                                                                    : "bg-slate-200/40 dark:bg-white/[0.04] border-transparent text-red-600 dark:text-red-500 hover:bg-slate-300/40 hover:dark:bg-white/[0.08]"
                                                            )}
                                                            title="Did Not Finish"
                                                        >
                                                            DNF
                                                        </button>

                                                        {/* Add Comment */}
                                                        <button
                                                            onClick={() => setActiveCommentSolveId(activeCommentSolveId === solveId ? null : solveId)}
                                                            className={clsx(
                                                                "w-6 h-6 sm:w-[28px] sm:h-[28px] rounded-[6px] transition-all duration-200 border flex justify-center items-center focus:outline-none backdrop-blur-md",
                                                                activeCommentSolveId === solveId
                                                                    ? "bg-slate-600/20 dark:bg-white/10 border-slate-400/30 dark:border-white/20 text-slate-900 dark:text-white"
                                                                    : "bg-slate-200/40 dark:bg-white/[0.04] border-transparent text-slate-400 hover:bg-slate-300/40 hover:dark:bg-white/[0.08] hover:text-slate-900 dark:hover:text-white"
                                                            )}
                                                            title="Add Comment"
                                                        >
                                                            <MessageSquare className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
                                                        </button>

                                                        {/* Delete Solve */}
                                                        <button 
                                                            onClick={() => handleDeleteSolve(solveId)} 
                                                            className="w-6 h-6 sm:w-[28px] sm:h-[28px] rounded-[6px] bg-slate-200/40 dark:bg-white/[0.04] border border-transparent text-red-600 dark:text-red-500 hover:bg-red-500/10 hover:dark:bg-red-500/20 hover:border-red-500/30 backdrop-blur-md transition-all duration-200 flex justify-center items-center focus:outline-none"
                                                            title="Delete Solve"
                                                        >
                                                            <Trash2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0"/>
                                                        </button>
                                                    </motion.div>
                                                )}
                                            </div>

                                            {/* Expanded Downward Details (CFOP Method, Date & Scramble) */}
                                            <AnimatePresence>
                                                {isSelected && (
                                                    <motion.div 
                                                        initial={{ height: 0, opacity: 0 }}
                                                        animate={{ height: 'auto', opacity: 1 }}
                                                        exit={{ height: 0, opacity: 0 }}
                                                        transition={{ height: { duration: 0.2, ease: "easeOut" }, opacity: { duration: 0.15, delay: 0.05 } }}
                                                        className="overflow-hidden w-full cursor-default select-text" 
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        <div className="pt-3 pb-1 border-t border-slate-200/50 dark:border-white/5 mt-2 flex flex-col gap-2">
                                                            <div className="flex justify-between items-center text-[10px] text-slate-500 dark:text-gray-400 font-semibold px-1 select-none">
                                                                <span>Date: {new Date(solve.date).toLocaleString()}</span>
                                                                <span className="uppercase tracking-widest text-[9px] text-slate-400 dark:text-gray-500 bg-slate-100 dark:bg-white/[0.04] px-1.5 py-0.5 rounded font-extrabold">
                                                                    {solve.method || 'CFOP'}
                                                                </span>
                                                            </div>
                                                            <div className="text-[11px] sm:text-xs font-mono font-medium text-slate-700/60 dark:text-gray-300/60 leading-relaxed tracking-wider break-all border-l-2 border-slate-200 dark:border-[#2e323d] pl-3 select-text py-0.5">
                                                                {solve.scramble}
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>

                                            {/* Closed Preview for comments */}
                                            {!isSelected && solve.comments && (
                                                <div className="text-[10px] text-slate-400 dark:text-gray-500 italic truncate max-w-full pl-6 select-none mt-1">
                                                    {solve.comments}
                                                </div>
                                            )}

                                            {/* Expanded Comment Input */}
                                            <AnimatePresence>
                                                {isSelected && activeCommentSolveId === solveId && (
                                                    <motion.div 
                                                        initial={{ height: 0, opacity: 0, marginTop: 0 }} 
                                                        animate={{ height: 'auto', opacity: 1, marginTop: 8 }} 
                                                        exit={{ height: 0, opacity: 0, marginTop: 0 }}
                                                        transition={{ type: "spring", stiffness: 300, damping: 26 }}
                                                        className="overflow-hidden w-full text-left"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        <input
                                                            type="text"
                                                            placeholder="Add a comment..."
                                                            defaultValue={solve.comments || ''}
                                                            onBlur={(e) => handleUpdateComment(solveId, e.target.value)}
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter') {
                                                                    handleUpdateComment(solveId, e.currentTarget.value);
                                                                    setActiveCommentSolveId(null);
                                                                }
                                                            }}
                                                            className="w-full bg-slate-100 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2 text-xs text-slate-700 dark:text-gray-300 outline-none focus:border-primary/50 transition-colors shadow-inner"
                                                            autoFocus
                                                        />
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </motion.div>
                                    );
                                })}
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Custom Confirmation Glass Modal Pop-up */}
            {typeof document !== 'undefined' && createPortal(
                <AnimatePresence>
                    {confirmModal.isOpen && (
                        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                            {/* Backdrop with full screen blur */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                                className="absolute inset-0 backdrop-blur-2xl"
                            />
                            {/* Modal Container */}
                            <motion.div
                                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                                animate={{ scale: 1, opacity: 1, y: 0 }}
                                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                                transition={{ type: "spring", stiffness: 350, damping: 28 }}
                                className="relative w-full max-w-sm glass-panel p-6 dark:bg-[#1C1E22]/90 backdrop-blur-xl border border-slate-200/80 dark:border-white/10 rounded-3xl shadow-2xl z-10 text-center"
                                style={{ background: '#FFFFFF' }}
                            >
                                <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white mb-2">
                                    {confirmModal.title}
                                </h3>
                                <p className="text-xs sm:text-sm text-slate-600 dark:text-gray-400 leading-relaxed mb-6">
                                    {confirmModal.message}
                                </p>
                                <div className="flex gap-3 justify-center">
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        onClick={() => {
                                            confirmModal.onConfirm();
                                            setConfirmModal(prev => ({ ...prev, isOpen: false }));
                                        }}
                                        className="bg-red-500 hover:bg-red-650 hover:shadow-[0_0_20px_rgba(239,68,68,0.45)] dark:hover:shadow-[0_0_20px_rgba(239,68,68,0.65)] text-white"
                                        size="sm"
                                    >
                                        {confirmModal.confirmText}
                                    </Button>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>,
                document.body
            )}

            {/* Custom Input Glass Modal Pop-up */}
            {typeof document !== 'undefined' && createPortal(
                <AnimatePresence>
                    {inputModal.isOpen && (
                        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                            {/* Backdrop with full screen blur */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                onClick={() => setInputModal(prev => ({ ...prev, isOpen: false }))}
                                className="absolute inset-0 backdrop-blur-2xl"
                            />
                            {/* Modal Container */}
                            <motion.div
                                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                                animate={{ scale: 1, opacity: 1, y: 0 }}
                                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                                transition={{ type: "spring", stiffness: 350, damping: 28 }}
                                className="relative w-full max-w-sm glass-panel p-6 dark:bg-[#1C1E22]/90 backdrop-blur-xl border border-slate-200/80 dark:border-white/10 rounded-3xl shadow-2xl z-10 text-center"
                                style={{ background: '#FFFFFF' }}
                            >
                                <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white mb-4">
                                    {inputModal.title}
                                </h3>
                                <input
                                    type="text"
                                    placeholder={inputModal.placeholder}
                                    value={newSessionNameInput}
                                    onChange={(e) => setNewSessionNameInput(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            inputModal.onConfirm(newSessionNameInput);
                                            setInputModal(prev => ({ ...prev, isOpen: false }));
                                        }
                                    }}
                                    className="w-full bg-slate-100 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-700 dark:text-gray-300 outline-none focus:border-primary/50 transition-colors shadow-inner mb-6"
                                    autoFocus
                                />
                                <div className="flex gap-3 justify-center">
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        onClick={() => setInputModal(prev => ({ ...prev, isOpen: false }))}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        variant="glow"
                                        size="sm"
                                        onClick={() => {
                                            inputModal.onConfirm(newSessionNameInput);
                                            setInputModal(prev => ({ ...prev, isOpen: false }));
                                        }}
                                    >
                                        {inputModal.confirmText}
                                    </Button>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>,
                document.body
            )}

        </PageTransition>
    );
}