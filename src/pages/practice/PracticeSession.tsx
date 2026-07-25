import { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Timer as TimerIcon, Trophy, Activity, Target, ChevronDown, ChevronLeft, Timeline, ChevronRight, TimerOff,  Trash2, Check, MessageSquare, Volume2, VolumeX, Plus, Maximize2, Minimize2, Zap, Award, Crown, Edit2, Pencil, PencilOff, X, Loader2 } from 'lucide-react';
import { PageTransition } from '@/components/animations/PageTransition';
import { useTimer } from '@/hooks/useTimer';
import { generateScramble, formatTime } from '@/utils/cubing';
import { useAuth } from '@/context/AuthContext';
import { clsx } from 'clsx';
import { Button } from '@/components/ui/Button';
import confetti from 'canvas-confetti';
import { useTheme } from '@/context/ThemeContext';

interface SolveRecord {
    _id?: string;
    id?: string;
    timeMs: number;
    scramble: string;
    method: string;
    penalty: 'None' | '+2' | 'DNF';
    date: string | Date;
    comments?: string;
    sessionId?: string;
    phaseSplits?: Record<string, number>;
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
        if (!state[base]) return; 
        const modifier = move.slice(1);

        const count = modifier === '2' ? 2 : modifier === "'" ? 3 : 1;

        for (let t = 0; t < count; t++) {
            rotateFaceCW(base);
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
            <div />
            <FaceGrid face={state.U} />
            <div />
            <div />
            <FaceGrid face={state.L} />
            <FaceGrid face={state.F} />
            <FaceGrid face={state.R} />
            <FaceGrid face={state.B} />
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

// --- HSV Color Conversion Helpers ---
function hexToHsv(hex: string): { h: number; s: number; v: number } {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return { h: 0, s: 0, v: 0 };
    const r = parseInt(result[1], 16) / 255;
    const g = parseInt(result[2], 16) / 255;
    const b = parseInt(result[3], 16) / 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    const d = max - min;
    let h = 0;
    if (d !== 0) {
        if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        else if (max === g) h = ((b - r) / d + 2) / 6;
        else h = ((r - g) / d + 4) / 6;
    }
    const s = max === 0 ? 0 : d / max;
    return { h, s, v: max };
}

function hsvToHex(h: number, s: number, v: number): string {
    const i = Math.floor(h * 6);
    const f = h * 6 - i;
    const p = v * (1 - s);
    const q = v * (1 - f * s);
    const t = v * (1 - (1 - f) * s);
    let r = 0, g = 0, b = 0;
    switch (i % 6) {
        case 0: r = v; g = t; b = p; break;
        case 1: r = q; g = v; b = p; break;
        case 2: r = p; g = v; b = t; break;
        case 3: r = p; g = q; b = v; break;
        case 4: r = t; g = p; b = v; break;
        case 5: r = v; g = p; b = q; break;
    }
    const toHex = (n: number) => Math.round(n * 255).toString(16).padStart(2, '0');
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

const PRESET_THEME_COLORS = [
    '#3B82F6', // Blue
    '#4F46E5', // Indigo
    '#7C3AED', // Purple
    '#9333EA', // Fuchsia
    '#475569', // Slate
    '#71717A', // Graphite
    '#1F2937', // Matte Black
];

const METHOD_RATIOS: Record<string, { name: string; percent: number }[]> = {
    'CFOP': [
        { name: 'Cross', percent: 10 },
        { name: 'F2L', percent: 55 },
        { name: 'OLL', percent: 15 },
        { name: 'PLL', percent: 20 }
    ],
    'Simplified CFOP': [
        { name: 'Cross', percent: 10 },
        { name: 'F2L', percent: 55 },
        { name: 'OLL', percent: 15 },
        { name: 'PLL', percent: 20 }
    ],
    'Roux': [
        { name: 'First Block', percent: 20 },
        { name: 'Second Block', percent: 35 },
        { name: 'CMLL', percent: 20 },
        { name: 'LSE', percent: 25 }
    ],
    'ZZ': [
        { name: 'EOLine', percent: 15 },
        { name: 'Z2L', percent: 50 },
        { name: 'LL', percent: 35 }
    ],
    'Beginner': [
        { name: 'First Layer', percent: 30 },
        { name: 'Second Layer', percent: 35 },
        { name: 'Third Layer', percent: 35 }
    ]
};

const getMethodPhases = (methodName: string) => {
    return METHOD_RATIOS[methodName] || [
        { name: 'Phase 1', percent: 25 },
        { name: 'Phase 2', percent: 25 },
        { name: 'Phase 3', percent: 25 },
        { name: 'Phase 4', percent: 25 }
    ];
};

const calculateInitialSplits = (totalMs: number, methodName: string, existingSplits?: Record<string, number>): Record<string, number> => {
    const phases = getMethodPhases(methodName);
    
    if (existingSplits && phases.every(p => typeof existingSplits[p.name] === 'number' && existingSplits[p.name] >= 0)) {
        const existingSum = Object.values(existingSplits).reduce((a, b) => a + b, 0);
        if (Math.abs(existingSum - totalMs) <= 10) {
            return { ...existingSplits };
        }
    }

    const splits: Record<string, number> = {};
    let allocated = 0;
    
    phases.forEach((p, idx) => {
        if (idx === phases.length - 1) {
            splits[p.name] = Math.max(0, totalMs - allocated);
        } else {
            const phaseMs = Math.round((p.percent / 100) * totalMs);
            splits[p.name] = phaseMs;
            allocated += phaseMs;
        }
    });

    return splits;
};

const splitsToBoundaries = (splits: Record<string, number>, phaseNames: string[]): number[] => {
    const boundaries: number[] = [];
    let cumulative = 0;
    for (let i = 0; i < phaseNames.length - 1; i++) {
        cumulative += (splits[phaseNames[i]] || 0);
        boundaries.push(cumulative);
    }
    return boundaries;
};

const boundariesToSplits = (boundaries: number[], totalMs: number, phaseNames: string[]): Record<string, number> => {
    const splits: Record<string, number> = {};
    let prev = 0;
    for (let i = 0; i < phaseNames.length - 1; i++) {
        const b = boundaries[i];
        splits[phaseNames[i]] = Math.max(0, b - prev);
        prev = b;
    }
    splits[phaseNames[phaseNames.length - 1]] = Math.max(0, totalMs - prev);
    return splits;
};

const applyPreset = (presetType: 'standard' | 'pll_skip' | 'oll_skip' | 'easy_cross', totalMs: number, methodName: string): Record<string, number> => {
    const phases = getMethodPhases(methodName);
    const phaseNames = phases.map(p => p.name);
    
    if (presetType === 'standard') {
        return calculateInitialSplits(totalMs, methodName);
    }
    
    const newSplits: Record<string, number> = {};

    if (presetType === 'pll_skip') {
        const lastPhaseName = phaseNames[phaseNames.length - 1];
        const remainingPhases = phases.slice(0, phases.length - 1);
        const sumPercent = remainingPhases.reduce((acc, p) => acc + p.percent, 0);

        let allocated = 0;
        remainingPhases.forEach((p, idx) => {
            if (idx === remainingPhases.length - 1) {
                newSplits[p.name] = Math.max(0, totalMs - allocated);
            } else {
                const ms = Math.round((p.percent / sumPercent) * totalMs);
                newSplits[p.name] = ms;
                allocated += ms;
            }
        });
        newSplits[lastPhaseName] = 0;
    } else if (presetType === 'oll_skip') {
        let skipIndex = phaseNames.findIndex(n => n.toUpperCase() === 'OLL' || n.toUpperCase().includes('CMLL') || n.toUpperCase().includes('Z2L'));
        if (skipIndex === -1 && phaseNames.length >= 3) {
            skipIndex = phaseNames.length - 2;
        }

        if (skipIndex !== -1) {
            const remainingPhases = phases.filter((_, i) => i !== skipIndex);
            const sumPercent = remainingPhases.reduce((acc, p) => acc + p.percent, 0);

            let allocated = 0;
            phaseNames.forEach((pName, i) => {
                if (i === skipIndex) {
                    newSplits[pName] = 0;
                } else {
                    const originalP = phases.find(p => p.name === pName)!;
                    const remainingIdx = remainingPhases.findIndex(rp => rp.name === pName);
                    if (remainingIdx === remainingPhases.length - 1) {
                        newSplits[pName] = Math.max(0, totalMs - allocated);
                    } else {
                        const ms = Math.round((originalP.percent / sumPercent) * totalMs);
                        newSplits[pName] = ms;
                        allocated += ms;
                    }
                }
            });
        } else {
            return calculateInitialSplits(totalMs, methodName);
        }
    } else if (presetType === 'easy_cross') {
        const firstPhaseName = phaseNames[0];
        const crossMs = Math.round(0.05 * totalMs);
        newSplits[firstPhaseName] = crossMs;

        const remainingPhases = phases.slice(1);
        const sumPercent = remainingPhases.reduce((acc, p) => acc + p.percent, 0);
        const remainingTotalMs = totalMs - crossMs;

        let allocated = 0;
        remainingPhases.forEach((p, idx) => {
            if (idx === remainingPhases.length - 1) {
                newSplits[p.name] = Math.max(0, remainingTotalMs - allocated);
            } else {
                const ms = Math.round((p.percent / sumPercent) * remainingTotalMs);
                newSplits[p.name] = ms;
                allocated += ms;
            }
        });
    }

    return newSplits;
};

function PostSolveReconstructionModal({
    solveData,
    onClose,
    onSave,
    isSaving,
    isDarkMode
}: {
    solveData: {
        id: string;
        timeMs: number;
        method: string;
        phaseSplits: Record<string, number>;
    };
    onClose: () => void;
    onSave: (solveId: string, updatedSplits: Record<string, number>) => void;
    isSaving: boolean;
    isDarkMode: boolean;
}) {
    const { timeMs, method: methodName, phaseSplits: initialSplits, id: solveId } = solveData;
    const methodPhases = useMemo(() => getMethodPhases(methodName), [methodName]);
    const phaseNames = useMemo(() => methodPhases.map(p => p.name), [methodPhases]);

    const [currentSplits, setCurrentSplits] = useState<Record<string, number>>(() => {
        return calculateInitialSplits(timeMs, methodName, initialSplits);
    });

    useEffect(() => {
        setCurrentSplits(calculateInitialSplits(timeMs, methodName, initialSplits));
    }, [timeMs, methodName, initialSplits]);

    const boundaries = useMemo(() => {
        return splitsToBoundaries(currentSplits, phaseNames);
    }, [currentSplits, phaseNames]);

    const handleBoundaryChange = (index: number, newBoundaryVal: number) => {
        const minVal = index > 0 ? boundaries[index - 1] : 0;
        const maxVal = index < boundaries.length - 1 ? boundaries[index + 1] : timeMs;
        const clamped = Math.max(minVal, Math.min(maxVal, newBoundaryVal));

        const updatedBoundaries = [...boundaries];
        updatedBoundaries[index] = clamped;

        const newSplits = boundariesToSplits(updatedBoundaries, timeMs, phaseNames);
        setCurrentSplits(newSplits);
    };

    const handleApplyPreset = (presetType: 'standard' | 'pll_skip' | 'oll_skip' | 'easy_cross') => {
        const newSplits = applyPreset(presetType, timeMs, methodName);
        setCurrentSplits(newSplits);
    };

    const handleMicroAdjust = (phaseName: string, deltaMs: number) => {
        setCurrentSplits(prev => {
            const currentMs = prev[phaseName] || 0;
            const targetMs = Math.max(0, currentMs + deltaMs);
            const diff = targetMs - currentMs;
            if (diff === 0) return prev;

            const otherPhaseNames = phaseNames.filter(n => n !== phaseName);
            const otherTotalMs = otherPhaseNames.reduce((acc, n) => acc + (prev[n] || 0), 0);

            const nextSplits = { ...prev, [phaseName]: targetMs };

            if (otherTotalMs > 0) {
                let remainingDiff = -diff;
                otherPhaseNames.forEach((n, idx) => {
                    if (idx === otherPhaseNames.length - 1) {
                        nextSplits[n] = Math.max(0, (prev[n] || 0) + remainingDiff);
                    } else {
                        const ratio = (prev[n] || 0) / otherTotalMs;
                        const adjustment = Math.round(ratio * (-diff));
                        nextSplits[n] = Math.max(0, (prev[n] || 0) + adjustment);
                        remainingDiff -= adjustment;
                    }
                });
            }
            return nextSplits;
        });
    };

    const phaseColors = [
        { bg: 'bg-blue-500', text: 'text-blue-500', border: 'border-blue-500/30', lightBg: 'bg-blue-500/10' },
        { bg: 'bg-emerald-500', text: 'text-emerald-500', border: 'border-emerald-500/30', lightBg: 'bg-emerald-500/10' },
        { bg: 'bg-amber-500', text: 'text-amber-500', border: 'border-amber-500/30', lightBg: 'bg-amber-500/10' },
        { bg: 'bg-purple-500', text: 'text-purple-500', border: 'border-purple-500/30', lightBg: 'bg-purple-500/10' },
        { bg: 'bg-rose-500', text: 'text-rose-500', border: 'border-rose-500/30', lightBg: 'bg-rose-500/10' }
    ];

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={onClose}
                className="absolute inset-0 backdrop-blur-2xl bg-black/50"
            />
            <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                transition={{ type: "spring", stiffness: 350, damping: 28 }}
                className="relative w-full max-w-xl glass-panel p-6 dark:bg-[#1C1E22]/95 backdrop-blur-xl border border-slate-200/80 dark:border-white/10 rounded-3xl shadow-2xl z-10 flex flex-col gap-5 text-left max-h-[90vh] overflow-y-auto"
                style={{ background: isDarkMode ? '#1C1E22' : '#FFFFFF' }}
            >
                {/* Header */}
                <div className="flex items-start justify-between border-b border-slate-200 dark:border-white/10 pb-4">
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                            <Timeline className="w-5 h-5 text-primary" />
                            <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white">
                                Post-Solve Phase Reconstruction
                            </h3>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2.5 py-0.5 rounded-full border border-primary/20">
                                {methodName}
                            </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-gray-400">
                            Solve Time: <span className="font-mono font-bold text-slate-900 dark:text-white">{formatTime(timeMs)}</span> — Drag step boundary handles or apply one-tap presets.
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 transition-colors rounded-lg"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Interactive Multi-segment Timeline Bar */}
                <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 dark:text-gray-500 uppercase tracking-wider">
                        <span>Phase Timeline Ratio</span>
                        <span>100% ({formatTime(timeMs)})</span>
                    </div>

                    <div className="h-7 w-full bg-slate-200 dark:bg-black/40 rounded-xl overflow-hidden flex relative shadow-inner p-0.5">
                        {phaseNames.map((pName, idx) => {
                            const duration = currentSplits[pName] || 0;
                            const percent = timeMs > 0 ? (duration / timeMs) * 100 : 0;
                            const colorObj = phaseColors[idx % phaseColors.length];

                            return (
                                <div
                                    key={pName}
                                    style={{ width: `${percent}%` }}
                                    className={clsx("h-full transition-all duration-150 flex items-center justify-center relative rounded-md", colorObj.bg)}
                                    title={`${pName}: ${formatTime(duration)} (${Math.round(percent)}%)`}
                                >
                                    {percent > 8 && (
                                        <span className="text-[9px] font-bold text-white font-mono drop-shadow-sm truncate px-1">
                                            {Math.round(percent)}%
                                        </span>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Draggable Step Boundaries */}
                {boundaries.length > 0 && (
                    <div className="flex flex-col gap-3 bg-slate-50 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/5 p-4 rounded-2xl">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-gray-400">
                            Interactive Step Boundary Handles
                        </span>
                        <div className="flex flex-col gap-3">
                            {boundaries.map((boundaryVal, idx) => {
                                const prevPhase = phaseNames[idx];
                                const nextPhase = phaseNames[idx + 1];
                                const minVal = idx > 0 ? boundaries[idx - 1] : 0;
                                const maxVal = idx < boundaries.length - 1 ? boundaries[idx + 1] : timeMs;
                                const colorObj = phaseColors[idx % phaseColors.length];

                                return (
                                    <div key={idx} className="flex flex-col gap-1">
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="font-semibold text-slate-700 dark:text-gray-300 flex items-center gap-1.5">
                                                <span className={clsx("w-2 h-2 rounded-full", colorObj.bg)} />
                                                {prevPhase} ➔ {nextPhase} Boundary
                                            </span>
                                            <span className="font-mono font-bold text-slate-900 dark:text-white text-xs">
                                                {formatTime(boundaryVal)}
                                            </span>
                                        </div>
                                        <input
                                            type="range"
                                            min={minVal}
                                            max={maxVal}
                                            step={10}
                                            value={boundaryVal}
                                            onChange={(e) => handleBoundaryChange(idx, Number(e.target.value))}
                                            className="w-full accent-primary h-2 bg-slate-200 dark:bg-white/10 rounded-lg cursor-pointer transition-all"
                                        />
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Phase Breakdown Cards & Micro-Adjustments */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {phaseNames.map((pName, idx) => {
                        const duration = currentSplits[pName] || 0;
                        const percent = timeMs > 0 ? (duration / timeMs) * 100 : 0;
                        const colorObj = phaseColors[idx % phaseColors.length];

                        return (
                            <div key={pName} className="flex flex-col gap-1 p-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/5">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-1.5 min-w-0">
                                        <span className={clsx("w-2 h-2 rounded-full shrink-0", colorObj.bg)} />
                                        <span className="text-[10px] font-bold text-slate-700 dark:text-gray-300 truncate">
                                            {pName}
                                        </span>
                                    </div>
                                    <span className="text-[9px] font-mono text-slate-400 dark:text-gray-500">
                                        {Math.round(percent)}%
                                    </span>
                                </div>

                                <span className="font-mono font-bold text-xs sm:text-sm text-slate-900 dark:text-white mt-0.5">
                                    {formatTime(duration)}
                                </span>

                                <div className="flex items-center gap-1 mt-1">
                                    <button
                                        type="button"
                                        onClick={() => handleMicroAdjust(pName, -100)}
                                        className="flex-1 py-0.5 rounded bg-slate-200 dark:bg-white/5 hover:bg-slate-300 dark:hover:bg-white/10 text-[9px] font-bold text-slate-600 dark:text-gray-300 transition-colors"
                                        title="Decrease 0.1s"
                                    >
                                        -0.1s
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleMicroAdjust(pName, 100)}
                                        className="flex-1 py-0.5 rounded bg-slate-200 dark:bg-white/5 hover:bg-slate-300 dark:hover:bg-white/10 text-[9px] font-bold text-slate-600 dark:text-gray-300 transition-colors"
                                        title="Increase 0.1s"
                                    >
                                        +0.1s
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* One-Tap Quick Presets */}
                <div className="flex flex-col gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-gray-400">
                        One-Tap Quick Presets
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        <button
                            type="button"
                            onClick={() => handleApplyPreset('pll_skip')}
                            className="px-2.5 py-2 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 dark:text-purple-400 border border-purple-500/20 text-[10px] font-bold flex items-center justify-center gap-1 transition-all active:scale-95 cursor-pointer"
                        >
                            <Zap className="w-3 h-3" /> PLL Skip
                        </button>
                        <button
                            type="button"
                            onClick={() => handleApplyPreset('oll_skip')}
                            className="px-2.5 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-[10px] font-bold flex items-center justify-center gap-1 transition-all active:scale-95 cursor-pointer"
                        >
                            <Zap className="w-3 h-3" /> OLL Skip
                        </button>
                        <button
                            type="button"
                            onClick={() => handleApplyPreset('easy_cross')}
                            className="px-2.5 py-2 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/20 text-[10px] font-bold flex items-center justify-center gap-1 transition-all active:scale-95 cursor-pointer"
                        >
                            <Target className="w-3 h-3" /> Easy Cross
                        </button>
                        <button
                            type="button"
                            onClick={() => handleApplyPreset('standard')}
                            className="px-2.5 py-2 rounded-xl bg-slate-200 dark:bg-white/5 hover:bg-slate-300 dark:hover:bg-white/10 text-slate-700 dark:text-gray-300 border border-slate-300 dark:border-white/10 text-[10px] font-bold flex items-center justify-center gap-1 transition-all active:scale-95 cursor-pointer"
                        >
                            <Activity className="w-3 h-3" /> Standard Ratio
                        </button>
                    </div>
                </div>

                {/* Footer Buttons */}
                <div className="flex justify-end gap-3 pt-3 border-t border-slate-200 dark:border-white/10 mt-1">
                    <Button variant="secondary" size="sm" onClick={onClose} className="rounded-xl px-4 py-2 text-xs font-bold">
                        Cancel
                    </Button>
                    <Button
                        onClick={() => onSave(solveId, currentSplits)}
                        disabled={isSaving}
                        size="sm"
                        className="rounded-xl px-5 py-2 text-xs font-bold bg-primary text-white hover:bg-primary/90 flex items-center gap-1.5"
                    >
                        {isSaving ? (
                            <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving...
                            </>
                        ) : (
                            <>
                                <Check className="w-3.5 h-3.5" /> Save Phase Reconstruction
                            </>
                        )}
                    </Button>
                </div>
            </motion.div>
        </div>
    );
}

const METHOD_PHASES: Record<string, string[]> = {
    'CFOP': ['Cross', 'F2L', 'OLL', 'PLL'],
    'Simplified CFOP': ['Cross', 'F2L', 'OLL', 'PLL'],
    'Roux': ['First Block', 'Second Block', 'CMLL', 'LSE'],
    'ZZ': ['EOLine', 'Z2L', 'LL'],
    'Beginner': ['First Layer', 'Second Layer', 'Third Layer'] 
};

export default function PracticeSession() {
    const { getAuthHeaders } = useAuth();
    const { accent, isDarkMode } = useTheme();    

    const [method, setMethod] = useState('CFOP');
    const [isPhaseMode, setIsPhaseMode] = useState(false);
    const activePhasesArray = METHOD_PHASES[method] || ['Solve'];

    const getThemeAccentColor = (acc: string) => {
        switch (acc) {
            case 'accent-blue':
            case 'blue': return '#2563EB';
            case 'accent-purple':
            case 'purple': return '#7C3AED';
            case 'accent-matte-black':
            case 'matte-black': return '#1F2937';
            case 'accent-graphite':
            case 'graphite':
            default: return '#71717a';
        }
    };

    const [isVoiceEnabled, setIsVoiceEnabled] = useState(() => {
        return localStorage.getItem('cubora_voice_alerts') !== 'false';
    });

    useEffect(() => {
        localStorage.setItem('cubora_voice_alerts', String(isVoiceEnabled));
    }, [isVoiceEnabled]);

    const { 
        state, time, setTime, inspectionTime, penalty: autoPenalty = 'None', 
        resetTimer, triggerPressStart, triggerPressEnd, 
        activePhaseIndex, splits 
    } = useTimer(true, isVoiceEnabled, isPhaseMode, activePhasesArray.length); 

    const timerRef = useRef<HTMLDivElement>(null);
    const confettiCanvasRef = useRef<HTMLCanvasElement>(null);
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

    // --- MANUAL ENTRY STATE & LOGIC ---
    const [isManualMode, setIsManualMode] = useState(false);
    const [manualTimeInput, setManualTimeInput] = useState('');

    const parseManualTime = (input: string): number | null => {
        const clean = input.trim();
        if (!clean) return null;
        const parts = clean.split(':');
        let totalSeconds = 0;
        if (parts.length === 2) {
            totalSeconds = parseInt(parts[0], 10) * 60 + parseFloat(parts[1]);
        } else if (parts.length === 1) {
            totalSeconds = parseFloat(parts[0]);
        } else {
            return null;
        }
        if (isNaN(totalSeconds) || totalSeconds <= 0) return null;
        return Math.floor(totalSeconds * 1000);
    };

    const handleManualSave = async () => {
        const parsedMs = parseManualTime(manualTimeInput);
        if (parsedMs === null || parsedMs <= 0) return;

        const usedScramble = scramble;
        const usedMethod = method;
        
        if (globalPb === null || parsedMs < globalPb) {
            triggerPBConfetti();
        }

        const next = generateScramble();
        setScrambleQueue(prev => [...prev, next]);
        setScrambleIndex(prev => prev + 1);
        setManualTimeInput('');

        try {
            const res = await fetch('http://localhost:5000/api/solves', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
                body: JSON.stringify({
                    timeMs: parsedMs,
                    scramble: usedScramble,
                    method: usedMethod, 
                    penalty: 'None', 
                    sessionId: currentSession,
                    phaseSplits: {}, 
                    isManual: true
                }),
            });
            const data = await res.json();
            if (data.success) {
                setSolves(prev => [data.data, ...prev]);
                fetchGlobalPb();
            }
        } catch (err) {
            console.error('Failed to save manual solve:', err);
        }
    };
    // ----------------------------------

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

    const [reconstructionSolve, setReconstructionSolve] = useState<{
        id: string;
        timeMs: number;
        method: string;
        phaseSplits: Record<string, number>;
    } | null>(null);
    const [isSavingReconstruction, setIsSavingReconstruction] = useState(false);

    const handleSaveReconstruction = async (solveId: string, updatedSplits: Record<string, number>) => {
        setIsSavingReconstruction(true);
        try {
            const response = await fetch(`http://localhost:5000/api/solves/${solveId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
                body: JSON.stringify({ phaseSplits: updatedSplits }),
            });
            const data = await response.json();
            if (data.success) {
                setSolves(prev => prev.map(s => ((s._id === solveId || s.id === solveId) ? { ...s, phaseSplits: updatedSplits } : s)));
                setReconstructionSolve(null);
            }
        } catch (err) {
            console.error('Failed to save phase reconstruction:', err);
        } finally {
            setIsSavingReconstruction(false);
        }
    };

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
        onConfirm: (val: string, color: string) => void;
    }>({
        isOpen: false,
        title: '',
        placeholder: '',
        confirmText: 'Confirm',
        onConfirm: () => {}
    });
    
    const [newSessionNameInput, setNewSessionNameInput] = useState('');
    // Store either a hex string OR the word 'theme'
    const [newSessionColor, setNewSessionColor] = useState('theme'); 
    const [showCustomColorPicker, setShowCustomColorPicker] = useState(false);
    const [hsv, setHsv] = useState({ h: 0, s: 0, v: 0 });
    const svBoxRef = useRef<HTMLDivElement>(null);
    const hueSliderRef = useRef<HTMLDivElement>(null);

    const syncHsvFromHex = (hex: string) => {
        const parsed = hexToHsv(hex);
        setHsv(parsed);
    };

    const updateColorFromHsv = (newHsv: { h: number; s: number; v: number }) => {
        setHsv(newHsv);
        setNewSessionColor(hsvToHex(newHsv.h, newHsv.s, newHsv.v));
    };

    const handleSvInteraction = (clientX: number, clientY: number) => {
        if (!svBoxRef.current) return;
        const rect = svBoxRef.current.getBoundingClientRect();
        const s = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
        const v = Math.max(0, Math.min(1, 1 - (clientY - rect.top) / rect.height));
        updateColorFromHsv({ ...hsv, s, v });
    };

    const handleHueInteraction = (clientX: number) => {
        if (!hueSliderRef.current) return;
        const rect = hueSliderRef.current.getBoundingClientRect();
        const h = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
        updateColorFromHsv({ ...hsv, h });
    };

    const sessionColors = useMemo(() => {
        const defaultColor = getThemeAccentColor(accent);
        const savedColorsStr = localStorage.getItem('cubora_practice_session_colors');
        const savedColors = savedColorsStr ? JSON.parse(savedColorsStr) : {};
        
        const map: Record<string, string> = {};
        sessions.forEach(s => {
            const saved = savedColors[s];
            // Resolve 'theme' to the dynamic accent color
            map[s] = (saved === 'theme' || !saved) ? defaultColor : saved;
        });
        return map;
    }, [sessions, accent]);

    const [globalPb, setGlobalPb] = useState<number | null>(null);

    useEffect(() => {
        localStorage.setItem('cubora_practice_sessions', JSON.stringify(sessions));
    }, [sessions]);

    const [isMethodDropdownOpen, setIsMethodDropdownOpen] = useState(false);
    const methodDropdownRef = useRef<HTMLDivElement>(null);

    const [isSessionDropdownOpen, setIsSessionDropdownOpen] = useState(false);
    const sessionDropdownRef = useRef<HTMLDivElement>(null);
    const scramblePreviewRef = useRef<HTMLDivElement>(null);

    const [selectedSolveId, setSelectedSolveId] = useState<string | null>(null);
    const [activeCommentSolveId, setActiveCommentSolveId] = useState<string | null>(null);
    const cheerAudioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        const audio = new Audio('/cheer.mp3');
        audio.preload = 'auto'; 
        cheerAudioRef.current = audio;
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent | TouchEvent) => {
            if (methodDropdownRef.current && !methodDropdownRef.current.contains(event.target as Node)) setIsMethodDropdownOpen(false);
            if (sessionDropdownRef.current && !sessionDropdownRef.current.contains(event.target as Node)) setIsSessionDropdownOpen(false);
            if (scramblePreviewRef.current && !scramblePreviewRef.current.contains(event.target as Node)) setShowScramblePreview(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('touchstart', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('touchstart', handleClickOutside);
        };
    }, []);

    const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
        if (isManualMode) return;
        if (
            (e.target as HTMLElement).closest('button') || 
            (e.target as HTMLElement).closest('input') || 
            (e.target as HTMLElement).closest('.method-dropdown-container') || 
            (e.target as HTMLElement).closest('.session-dropdown-container') ||
            (e.target as HTMLElement).closest('.scramble-preview-tooltip')
        ) return;
        
        if (e.button !== 0) return;
        if (e.pointerType === 'mouse') return;

        e.preventDefault();
        e.currentTarget.setPointerCapture(e.pointerId);
        triggerPressStart();
    };

    const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
        if (isManualMode) return;
        if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('input') || (e.target as HTMLElement).closest('.method-dropdown-container') || (e.target as HTMLElement).closest('.session-dropdown-container')) return;
        if (e.button !== 0) return;
        if (e.pointerType === 'mouse') return;

        e.preventDefault();
        try { e.currentTarget.releasePointerCapture(e.pointerId); } catch (err) {}
        triggerPressEnd();
    };

    const fetchGlobalPb = async () => {
        try {
            const response = await fetch(`http://localhost:5000/api/solves?sessionId=all`, {
                headers: getAuthHeaders(),
            });
            const data = await response.json();
            if (data.success && Array.isArray(data.data)) {
                const allTimesMs = data.data.filter(s => s.penalty !== 'DNF' && !s.isDeleted).map(s => s.timeMs + (s.penalty === '+2' ? 2000 : 0));
                setGlobalPb(allTimesMs.length > 0 ? Math.min(...allTimesMs) : null);
            }
        } catch (err) {
            console.error('Failed to fetch global PB:', err);
        }
    };

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
                    setSolves(data.data.filter((s: any) => !s.isDeleted));
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
        
        const confettiOptions = {
            particleCount: 150,
            spread: 100,
            origin: { y: 0.65 },
            colors: themeColors,
            disableForReducedMotion: true,
            zIndex: 9999
        };
        if (confettiCanvasRef.current) {
            const customConfetti = confetti.create(confettiCanvasRef.current, {
                resize: true,
                useWorker: true
            });
            customConfetti(confettiOptions);
        } else {
            // Fallback
            confetti(confettiOptions);
        }

        if (cheerAudioRef.current) {
            try {
                cheerAudioRef.current.currentTime = 0; 
                cheerAudioRef.current.volume = 0.5;
                const playPromise = cheerAudioRef.current.play();
                if (playPromise !== undefined) playPromise.catch(() => {});
            } catch (e) {}
        }
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
            
            let calculatedSplits: Record<string, number> = {};

            if (isPhaseMode && splits && splits.length === activePhasesArray.length) {
                const TAP_COMPENSATION_MS = 250;
                let previousCumulative = 0;
                
                splits.forEach((cumulativeTime: number, i: number) => {
                    const phaseName = activePhasesArray[i];
                    const isLastPhase = i === splits.length - 1;
                    
                    let adjustedCumulative = cumulativeTime;
                    if (!isLastPhase) {
                        adjustedCumulative = Math.max(previousCumulative, cumulativeTime - TAP_COMPENSATION_MS);
                    }
                    
                    calculatedSplits[phaseName] = adjustedCumulative - previousCumulative;
                    previousCumulative = adjustedCumulative;
                });
            }

            fetch('http://localhost:5000/api/solves', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
                body: JSON.stringify({
                    timeMs: finalTime,
                    scramble: usedScramble,
                    method: usedMethod, 
                    penalty: finalPenalty, 
                    sessionId: currentSession,
                    phaseSplits: calculatedSplits // Send real data to the DB!
                }),
            })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setSolves(prev => [data.data, ...prev]);
                    setTime(0);
                    resetTimer();
                    fetchGlobalPb();

                    if (isPhaseMode && finalPenalty !== 'DNF' && finalTime > 0) {
                        const initSplits = Object.keys(calculatedSplits).length > 0 
                            ? calculatedSplits 
                            : calculateInitialSplits(finalTime, usedMethod);

                        setReconstructionSolve({
                            id: data.data._id || data.data.id,
                            timeMs: finalTime,
                            method: usedMethod,
                            phaseSplits: initSplits
                        });
                    }
                }
            })
            .catch(err => console.error('Failed to auto-save solve:', err));
        };

        if (prevStateRef.current === 'RUNNING' && state === 'STOPPED') {
            handleAutoSave(time, autoPenalty);
        } else if (prevStateRef.current === 'INSPECTION' && state === 'STOPPED') {
            handleAutoSave(0, 'DNF');
        }
        prevStateRef.current = state;
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [state]); 

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
                setTime(0); 
                resetTimer(); 
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

    const handleAddSession = () => {
        let nextNum = 1;
        while (sessions.includes(`Session ${nextNum}`)) nextNum++;
        const defaultName = `Session ${nextNum}`;
        setNewSessionNameInput(defaultName);

        // Explicitly set dynamic tracking for newly created sessions
        setNewSessionColor('theme');
        syncHsvFromHex(getThemeAccentColor(accent));
        setShowCustomColorPicker(false);

        setInputModal({
            isOpen: true,
            title: 'New Session Name',
            placeholder: 'Enter session name...',
            confirmText: 'Create',
            onConfirm: (name, color) => {
                const trimmedName = name.trim();
                if (!trimmedName) return;
                if (sessions.includes(trimmedName)) {
                    setConfirmModal({
                        isOpen: true,
                        title: 'Duplicate Session Name',
                        message: `A session named "${trimmedName}" already exists. Please choose a unique name.`,
                        confirmText: 'OK',
                        onConfirm: () => handleAddSession()
                    });
                    return;
                }
                const savedColorsStr = localStorage.getItem('cubora_practice_session_colors');
                const savedColors = savedColorsStr ? JSON.parse(savedColorsStr) : {};
                savedColors[trimmedName] = color;
                localStorage.setItem('cubora_practice_session_colors', JSON.stringify(savedColors));

                setSessions(prev => [...prev, trimmedName]);
                setCurrentSession(trimmedName);
            }
        });
    };

    const handleEditSession = (oldSessionName: string) => {
        setNewSessionNameInput(oldSessionName);
        
        const savedColorsStr = localStorage.getItem('cubora_practice_session_colors');
        const savedColors = savedColorsStr ? JSON.parse(savedColorsStr) : {};
        const rawColor = savedColors[oldSessionName] || 'theme';
        
        setNewSessionColor(rawColor);
        syncHsvFromHex(rawColor === 'theme' ? getThemeAccentColor(accent) : rawColor);
        setShowCustomColorPicker(false);

        setInputModal({
            isOpen: true,
            title: 'Edit Session',
            placeholder: 'Enter session name...',
            confirmText: 'Save',
            onConfirm: async (newName, newColor) => {
                const trimmedName = newName.trim();
                if (!trimmedName) return;
                if (trimmedName !== oldSessionName && sessions.includes(trimmedName)) {
                    setConfirmModal({
                        isOpen: true,
                        title: 'Duplicate Session Name',
                        message: `A session named "${trimmedName}" already exists. Please choose a unique name.`,
                        confirmText: 'OK',
                        onConfirm: () => handleEditSession(oldSessionName)
                    });
                    return;
                }

                const savedColorsStr = localStorage.getItem('cubora_practice_session_colors');
                const savedColors = savedColorsStr ? JSON.parse(savedColorsStr) : {};
                if (trimmedName !== oldSessionName) delete savedColors[oldSessionName];
                savedColors[trimmedName] = newColor;
                localStorage.setItem('cubora_practice_session_colors', JSON.stringify(savedColors));

                if (trimmedName !== oldSessionName) {
                    try {
                        const response = await fetch(`http://localhost:5000/api/solves?sessionId=${encodeURIComponent(oldSessionName)}`, {
                            headers: getAuthHeaders(),
                        });
                        const result = await response.json();
                        
                        if (result.success && Array.isArray(result.data)) {
                            await Promise.all(result.data.map(s => {
                                const solveId = s._id || s.id || '';
                                return fetch(`http://localhost:5000/api/solves/${solveId}`, {
                                    method: 'PUT',
                                    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
                                    body: JSON.stringify({ sessionId: trimmedName }),
                                });
                            }));
                        }
                    } catch (err) {
                        console.error("Failed to rename session solves in backend:", err);
                    }
                }
                setSessions(prev => prev.map(s => s === oldSessionName ? trimmedName : s));
                if (currentSession === oldSessionName) setCurrentSession(trimmedName);
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
                } catch (err) {}

                setSessions(prev => {
                    const nextSessions = prev.filter(s => s !== sessionName);
                    if (currentSession === sessionName) setCurrentSession(nextSessions[0]);
                    return nextSessions;
                });
                
                const savedColorsStr = localStorage.getItem('cubora_practice_session_colors');
                if (savedColorsStr) {
                    const savedColors = JSON.parse(savedColorsStr);
                    delete savedColors[sessionName];
                    localStorage.setItem('cubora_practice_session_colors', JSON.stringify(savedColors));
                }
                setTime(0);
                resetTimer();
                fetchGlobalPb();
            }
        });
    };

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

    const calculateMo3 = (solvesSlice: SolveRecord[]) => {
        if (solvesSlice.length < 3) return null;
        if (solvesSlice.some(s => s.penalty === 'DNF')) return 'DNF';
        const times = solvesSlice.map(s => s.timeMs + (s.penalty === '+2' ? 2000 : 0));
        return times.reduce((a, b) => a + b, 0) / 3;
    };

    const timesMs = solves.filter(s => s.penalty !== 'DNF').map(s => s.timeMs + (s.penalty === '+2' ? 2000 : 0));
    const bestSolveTime = timesMs.length > 0 ? Math.min(...timesMs) : null;
    const worstSolveTime = timesMs.length > 0 ? Math.max(...timesMs) : null;
    
    let bestMo3: number | 'DNF' | null = null;
    for (let i = 0; i <= solves.length - 3; i++) {
        const val = calculateMo3(solves.slice(i, i + 3));
        if (val !== null && val !== 'DNF') {
            if (bestMo3 === null || bestMo3 === 'DNF' || val < bestMo3) bestMo3 = val;
        } else if (val === 'DNF' && bestMo3 === null) bestMo3 = 'DNF';
    }

    let bestAo5: number | 'DNF' | null = null;
    for (let i = 0; i <= solves.length - 5; i++) {
        const val = calculateAoN(solves.slice(i, i + 5), 5);
        if (val !== null && val !== 'DNF') {
            if (bestAo5 === null || bestAo5 === 'DNF' || val < bestAo5) bestAo5 = val;
        } else if (val === 'DNF' && bestAo5 === null) bestAo5 = 'DNF';
    }

    let bestAo12: number | 'DNF' | null = null;
    for (let i = 0; i <= solves.length - 12; i++) {
        const val = calculateAoN(solves.slice(i, i + 12), 12);
        if (val !== null && val !== 'DNF') {
            if (bestAo12 === null || bestAo12 === 'DNF' || val < bestAo12) bestAo12 = val;
        } else if (val === 'DNF' && bestAo12 === null) bestAo12 = 'DNF';
    }

    let bestAo50: number | 'DNF' | null = null;
    for (let i = 0; i <= solves.length - 50; i++) {
        const val = calculateAoN(solves.slice(i, i + 50), 50);
        if (val !== null && val !== 'DNF') {
            if (bestAo50 === null || bestAo50 === 'DNF' || val < bestAo50) bestAo50 = val;
        } else if (val === 'DNF' && bestAo50 === null) bestAo50 = 'DNF';
    }

    let bestAo100: number | 'DNF' | null = null;
    for (let i = 0; i <= solves.length - 100; i++) {
        const val = calculateAoN(solves.slice(i, i + 100), 100);
        if (val !== null && val !== 'DNF') {
            if (bestAo100 === null || bestAo100 === 'DNF' || val < bestAo100) bestAo100 = val;
        } else if (val === 'DNF' && bestAo100 === null) bestAo100 = 'DNF';
    }

    const renderStatValue = (val: number | 'DNF' | null) => {
        if (val === null || val === Infinity) return '--';
        if (val === 'DNF') return 'DNF';
        const mins = Math.floor(val / 60000);
        const secs = ((val % 60000) / 1000).toFixed(3);
        return mins > 0 ? `${mins}:${secs.padStart(6, '0')}` : secs;
    };

    const renderComparison = () => {
        if (state !== 'PRE_INSPECTION' && state !== 'STOPPED') return null;
        if (solves.length < 2) return null;

        let currentMs = 0;
        let prevMs = 0;

        if (state === 'STOPPED') {
            currentMs = time;
            const latestRawMs = solves[0].timeMs;
            if (Math.abs(time - latestRawMs) < 50) {
                if (solves.length < 2) return null;
                currentMs = latestRawMs;
                prevMs = solves[1].timeMs;
            } else {
                prevMs = latestRawMs;
            }
        } else {
            if (solves.length < 2) return null;
            currentMs = solves[0].timeMs;
            prevMs = solves[1].timeMs;
        }

        const diffMs = currentMs - prevMs;
        const diffSec = diffMs / 1000;
        const formattedDiff = diffSec >= 0 ? `+${diffSec.toFixed(3)}` : `${diffSec.toFixed(3)}`;
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
        if (state === 'READY_WAIT' || state === 'READY') return 0;
        if (time) return time;
        if (solves.length > 0) return solves[0].timeMs;
        return 0;
    };

    const getTimerColor = () => {
        let activePenalty = 'None';
        if (state === 'STOPPED' && time > 0) activePenalty = autoPenalty;
        else if (solves.length > 0) activePenalty = solves[0].penalty;

        switch (state) {
            case 'PRE_INSPECTION_HOLD':
            case 'READY_WAIT': return 'text-red-500 drop-shadow-[0_0_20px_rgba(239,68,68,0.5)]';
            case 'INSPECTION':
                if (inspectionTime === 'DNF' || autoPenalty === 'DNF') return 'text-red-500 drop-shadow-[0_0_20px_rgba(239,68,68,0.5)]';
                if (inspectionTime === '+2' || autoPenalty === '+2') return 'text-yellow-500 dark:text-amber-400 drop-shadow-[0_0_20px_rgba(234,179,8,0.5)]';
                return 'text-emerald-500 drop-shadow-[0_0_20px_rgba(16,185,129,0.5)]';
            case 'READY': return 'text-emerald-500 drop-shadow-[0_0_20px_rgba(16,185,129,0.5)]';
            case 'RUNNING': return 'text-slate-900 dark:text-white';
            case 'STOPPED': 
            case 'PRE_INSPECTION': 
                return activePenalty === 'DNF' ? 'text-red-500' : activePenalty === '+2' ? 'text-yellow-500 dark:text-amber-400 drop-shadow-[0_0_20px_rgba(234,179,8,0.5)]' : 'text-primary';
            default: return 'text-slate-900 dark:text-white';
        }
    };

    const renderStats = (containerClass: string, cardClass: string = "p-3") => (
        <div className={clsx("w-full", containerClass)}>
            <div className={clsx("glass-panel flex flex-col justify-center text-center lg:text-left transition-all duration-300", cardClass)}>
                <span className="text-[8px] xs:text-[9px] sm:text-[10px] font-bold text-slate-500 dark:text-gray-500 uppercase flex items-center justify-center lg:justify-start gap-0.5 sm:gap-1.5 mb-1 truncate w-full">
                    <Trophy className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 text-[#FFC107] shrink-0" /> <span className="truncate"><span className="hidden sm:inline">Best </span>Single</span>
                </span>
                <span className="font-display font-bold text-[10px] xs:text-xs sm:text-xl lg:text-2xl text-slate-900 dark:text-white leading-tight mt-0.5 sm:mt-1 truncate w-full text-center lg:text-left">{renderStatValue(globalPb)}</span>
            </div>
            <div className={clsx("glass-panel flex flex-col justify-center text-center lg:text-left transition-all duration-300", cardClass)}>
                <span className="text-[8px] xs:text-[9px] sm:text-[10px] font-bold text-slate-500 dark:text-gray-500 uppercase flex items-center justify-center lg:justify-start gap-0.5 sm:gap-1.5 mb-1 truncate w-full">
                    <Activity className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 text-[#00E5FF] shrink-0" /> <span className="truncate"><span className="hidden sm:inline">Best </span>mo3</span>
                </span>
                <span className="font-display font-bold text-[10px] xs:text-xs sm:text-xl lg:text-2xl text-slate-900 dark:text-white leading-tight mt-0.5 sm:mt-1 truncate w-full text-center lg:text-left">{renderStatValue(bestMo3)}</span>
            </div>
            <div className={clsx("glass-panel flex flex-col justify-center text-center lg:text-left transition-all duration-300", cardClass)}>
                <span className="text-[8px] xs:text-[9px] sm:text-[10px] font-bold text-slate-500 dark:text-gray-500 uppercase flex items-center justify-center lg:justify-start gap-0.5 sm:gap-1.5 mb-1 truncate w-full">
                    <Zap className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 text-[#FF6B6B] shrink-0" /> <span className="truncate"><span className="hidden sm:inline">Best </span>ao5</span>
                </span>
                <span className="font-display font-bold text-[10px] xs:text-xs sm:text-xl lg:text-2xl text-slate-900 dark:text-white leading-tight mt-0.5 sm:mt-1 truncate w-full text-center lg:text-left">{renderStatValue(bestAo5)}</span>
            </div>
            <div className={clsx("glass-panel flex flex-col justify-center text-center lg:text-left transition-all duration-300", cardClass)}>
                <span className="text-[8px] xs:text-[9px] sm:text-[10px] font-bold text-slate-500 dark:text-gray-500 uppercase flex items-center justify-center lg:justify-start gap-0.5 sm:gap-1.5 mb-1 truncate w-full">
                    <Target className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 text-[#DA70D6] shrink-0" /> <span className="truncate"><span className="hidden sm:inline">Best </span>ao12</span>
                </span>
                <span className="font-display font-bold text-[10px] xs:text-xs sm:text-xl lg:text-2xl text-slate-900 dark:text-white leading-tight mt-0.5 sm:mt-1 truncate w-full text-center lg:text-left">{renderStatValue(bestAo12)}</span>
            </div>
            <div className={clsx("glass-panel flex flex-col justify-center text-center lg:text-left transition-all duration-300", cardClass)}>
                <span className="text-[8px] xs:text-[9px] sm:text-[10px] font-bold text-slate-500 dark:text-gray-500 uppercase flex items-center justify-center lg:justify-start gap-0.5 sm:gap-1.5 mb-1 truncate w-full">
                    <Award className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 text-[#10B981] shrink-0" /> <span className="truncate"><span className="hidden sm:inline">Best </span>ao50</span>
                </span>
                <span className="font-display font-bold text-[10px] xs:text-xs sm:text-xl lg:text-2xl text-slate-900 dark:text-white leading-tight mt-0.5 sm:mt-1 truncate w-full text-center lg:text-left">{renderStatValue(bestAo50)}</span>
            </div>
            <div className={clsx("glass-panel flex flex-col justify-center text-center lg:text-left transition-all duration-300", cardClass)}>
                <span className="text-[8px] xs:text-[9px] sm:text-[10px] font-bold text-slate-500 dark:text-gray-500 uppercase flex items-center justify-center lg:justify-start gap-0.5 sm:gap-1.5 mb-1 truncate w-full">
                    <Crown className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 text-[#E2E8F0] shrink-0" /> <span className="truncate"><span className="hidden sm:inline">Best </span>ao100</span>
                </span>
                <span className="font-display font-bold text-[10px] xs:text-xs sm:text-xl lg:text-2xl text-slate-900 dark:text-white leading-tight mt-0.5 sm:mt-1 truncate w-full text-center lg:text-left">{renderStatValue(bestAo100)}</span>
            </div>
        </div>
    );

    // Resolve the display color for the modal UI specifically
    const resolvedModalColor = newSessionColor === 'theme' ? getThemeAccentColor(accent) : newSessionColor;

    return (
        <PageTransition className="practice-session-root w-full h-auto lg:h-full lg:min-h-0 min-h-screen flex flex-col lg:flex-row gap-5 sm:gap-6 pb-6 px-1 sm:px-0 text-left">
            <div className="flex-1 flex flex-col min-w-0 w-full lg:h-full">
                <div className="glass-panel p-4 sm:p-5 flex flex-col items-center gap-4 mb-4 sm:mb-5 relative overflow-visible w-full shrink-0 select-none z-30">
                    <div className="flex items-center justify-center gap-4 sm:gap-6 w-full select-none shrink-0 border-b border-slate-200/40 dark:border-white/5 pb-3">
                        <button
                            onClick={handlePrevScramble}
                            disabled={scrambleIndex <= 0}
                            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-slate-500 hover:text-slate-950 dark:text-gray-400 dark:hover:text-white bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 border border-slate-200 dark:border-white/5 disabled:opacity-30 disabled:pointer-events-none rounded-lg transition-all focus:outline-none cursor-pointer"
                        >
                            <ChevronLeft className="w-3.5 h-3.5 shrink-0" />
                            <span className="hidden xs:inline">Previous</span>
                        </button>
                        <div className="flex items-center gap-2 select-none">
                            <h3 className="text-[10px] sm:text-xs font-bold text-slate-500 dark:text-gray-500 uppercase tracking-widest leading-none">Current Scramble</h3>
                            <span className="text-[9px] font-mono font-bold text-slate-450 dark:text-gray-650 bg-slate-100 dark:bg-white/[0.04] border border-slate-200/50 dark:border-white/5 px-2 py-0.5 rounded-full leading-none">
                                {scrambleIndex + 1} / {scrambleQueue.length}
                            </span>
                        </div>
                        <button
                            onClick={handleNextScramble}
                            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-slate-500 hover:text-slate-950 dark:text-gray-400 dark:hover:text-white bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 border border-slate-200 dark:border-white/5 rounded-lg transition-all focus:outline-none cursor-pointer"
                        >
                            <span className="hidden xs:inline">{scrambleIndex === scrambleQueue.length - 1 ? "New Scramble" : "Next Scramble"}</span>
                            {scrambleIndex === scrambleQueue.length - 1 ? <Plus className="w-3.5 h-3.5 shrink-0" /> : <ChevronRight className="w-3.5 h-3.5 shrink-0" />}
                        </button>
                    </div>
                    <div className="flex items-center justify-center gap-3 w-full px-2 sm:px-4">
                        <div className="flex items-center justify-center gap-3 max-w-full">
                            <p className="font-display font-bold text-lg sm:text-xl md:text-2xl lg:text-3xl text-slate-900 dark:text-white tracking-wider leading-relaxed break-words text-center select-text select-all">
                                {scramble}
                            </p>
                            <div className="relative shrink-0" ref={scramblePreviewRef}>
                                <button
                                    onClick={() => setShowScramblePreview(!showScramblePreview)}
                                    className={clsx(
                                        "w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-xl border transition-all shadow-sm focus:outline-none cursor-pointer",
                                        showScramblePreview ? "border-zinc-600 bg-primary/10 text-primary shadow-[0_0_15px_var(--accent-glow)]" : "border-slate-200 dark:border-white/10 bg-slate-50 hover:bg-slate-100 dark:bg-white/5 dark:hover:bg-white/10 text-slate-500 hover:text-slate-950 dark:text-gray-400 dark:hover:text-white"
                                    )}
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
                                            <div className="absolute -top-1.5 right-3.5 w-3 h-3 rotate-45 bg-white dark:bg-[#1C1E22] border-t border-l border-slate-200/80 dark:border-white/10" />
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

                <div
                    ref={timerRef}
                    onPointerDown={handlePointerDown}
                    onPointerUp={handlePointerUp}
                    className={clsx(
                        "flex-grow flex flex-col items-center justify-center relative cursor-default select-none w-full transition-all duration-300",
                        !isManualMode && "touch-none", // Allow touch scrolling when typing on mobile
                        isFullscreen ? "bg-[#090A0C] border-none rounded-none h-screen w-screen z-[999] justify-center items-center" : "glass-panel min-h-[300px] sm:min-h-[400px] lg:h-[500px] lg:min-h-0"
                    )}
                >
                    <AnimatePresence>
                        {(state === 'PRE_INSPECTION' || state === 'STOPPED') && (
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.15, ease: "easeOut" }}
                                onPointerDown={(e) => e.stopPropagation()} onPointerUp={(e) => e.stopPropagation()} onTouchStart={(e) => e.stopPropagation()} onTouchEnd={(e) => e.stopPropagation()} onClick={(e) => e.stopPropagation()}
                                className="absolute top-4 left-4 sm:top-6 sm:left-6 z-20 flex flex-col gap-2"
                            >
                                {/* ROW 1: Volume & Manual Mode side-by-side */}
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setIsVoiceEnabled(!isVoiceEnabled)}
                                        className="glass-panel w-9 h-9 sm:w-[44px] sm:h-[44px] flex items-center justify-center rounded-xl sm:rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#1C1E22] text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white transition-all shadow-sm focus:outline-none backdrop-blur-md"
                                    >
                                        {isVoiceEnabled ? <Volume2 className="w-4 h-4 sm:w-5 sm:h-5 text-primary" /> : <VolumeX className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />}
                                    </button>
                                    
                                    <button
                                        onClick={() => { setIsManualMode(!isManualMode); setManualTimeInput(''); }}
                                        className={clsx(
                                            "glass-panel w-9 h-9 sm:w-[44px] sm:h-[44px] flex items-center justify-center rounded-xl sm:rounded-2xl border transition-all shadow-sm focus:outline-none backdrop-blur-md",
                                            isManualMode 
                                                ? "bg-primary/10 border-primary/40 text-primary shadow-[0_0_15px_rgba(59,130,246,0.3)]" 
                                                : "border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#1C1E22] text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white"
                                        )}
                                        title="Manual Time Entry"
                                    >
                                        {isManualMode ? <Pencil className="w-4 h-4 sm:w-5 sm:h-5 currentColor" /> : <PencilOff className="w-4 h-4 sm:w-5 sm:h-5 currentColor" />}
                                    </button>
                                </div>

                                {/* ROW 2: Fullscreen */}
                                <button
                                    onClick={toggleFullscreen}
                                    className="glass-panel w-9 h-9 sm:w-[44px] sm:h-[44px] flex items-center justify-center rounded-xl sm:rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#1C1E22] text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white transition-all shadow-sm focus:outline-none backdrop-blur-md"
                                >
                                    {isFullscreen ? <Minimize2 className="w-4 h-4 sm:w-5 sm:h-5 text-primary" /> : <Maximize2 className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />}
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <AnimatePresence>
                        {isFullscreen && (state === 'PRE_INSPECTION' || state === 'STOPPED') && (
                            <motion.div
                                initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.2, ease: "easeOut" }}
                                className="absolute top-28 sm:top-5 left-4 right-4 sm:left-20 sm:right-44 mx-auto text-center z-20 flex flex-col items-center gap-1.5 sm:gap-2 select-none max-w-full"
                                onPointerDown={(e) => e.stopPropagation()} onPointerUp={(e) => e.stopPropagation()}
                            >
                                <div className="flex items-center justify-center gap-2 select-none">
                                    <button onClick={handlePrevScramble} disabled={scrambleIndex <= 0} className="w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none rounded-full transition-all focus:outline-none shrink-0"><ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4" /></button>
                                    <span className="text-[8px] sm:text-[9px] font-bold text-slate-500 uppercase tracking-widest leading-none">Scramble {scrambleIndex + 1}/{scrambleQueue.length}</span>
                                    <button onClick={handleNextScramble} className="w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-all focus:outline-none shrink-0">{scrambleIndex === scrambleQueue.length - 1 ? <Plus className="w-3 h-3 sm:w-4 sm:h-4" /> : <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />}</button>
                                </div>
                                <p className="font-display font-bold text-[10px] sm:text-xs md:text-sm lg:text-base xl:text-lg text-white tracking-wide sm:tracking-wider leading-normal break-words text-center select-text max-w-full mt-1.5">{scramble}</p>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <AnimatePresence>
                        {(state === 'PRE_INSPECTION' || state === 'STOPPED') ? (
                            <motion.div 
                                key="method-dropdown"
                                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.15, ease: "easeOut" }}
                                onPointerDown={(e) => e.stopPropagation()} onPointerUp={(e) => e.stopPropagation()} onTouchStart={(e) => e.stopPropagation()} onTouchEnd={(e) => e.stopPropagation()} onClick={(e) => e.stopPropagation()}
                                className="absolute top-4 right-4 sm:top-6 sm:right-6 z-20 flex items-center method-dropdown-container"
                            >
                                <div className="relative" ref={methodDropdownRef}>
                                    <button 
                                        onClick={() => setIsMethodDropdownOpen(!isMethodDropdownOpen)}
                                        className={`glass-panel flex items-center justify-between gap-1.5 sm:gap-3 bg-slate-50 dark:bg-[#1C1E22] border rounded-xl sm:rounded-2xl text-[12px] sm:text-sm font-semibold text-slate-700 dark:text-gray-300 pl-2.5 pr-1.5 sm:pl-4 sm:pr-3 py-1.5 sm:py-2.5 outline-none transition-all min-h-[36px] sm:min-h-[44px] min-w-[110px] sm:min-w-[150px] whitespace-nowrap shadow-sm ${isMethodDropdownOpen ? "border-primary ring-1 ring-primary" : "border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20"}`}
                                    >
                                        {method}
                                        <ChevronDown className={`w-3 h-3 sm:w-4 sm:h-4 shrink-0 text-slate-500 transition-transform duration-200 ${isMethodDropdownOpen ? "rotate-180" : ""}`} />
                                    </button>
                                    <div className={`glass-panel absolute top-full mt-2 right-0 w-full min-w-[140px] sm:min-w-[160px] bg-white/80 dark:bg-[#1C1E22]/80 backdrop-blur-md border border-slate-200 dark:border-white/10 rounded-xl sm:rounded-2xl shadow-xl overflow-hidden z-50 transition-all duration-200 origin-top-right ${isMethodDropdownOpen ? "opacity-100 scale-100 visible" : "opacity-0 scale-95 invisible pointer-events-none"}`}>
                                        {['CFOP','Simplified CFOP', 'Roux', 'ZZ', 'Beginner'].map((option) => (
                                            <button key={option} onClick={() => { setMethod(option); setIsMethodDropdownOpen(false); }} className={`w-full text-left px-3 sm:px-4 py-2 sm:py-2.5 text-[13px] sm:text-sm font-medium transition-colors whitespace-nowrap ${method === option ? "bg-primary/10 text-primary dark:text-blue-400" : "text-slate-700 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-white/5"}`}>{option}</button>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        ) : ['PRE_INSPECTION_HOLD', 'INSPECTION', 'READY_WAIT', 'READY'].includes(state) ? (
                            <motion.div
                                key="inspection-stop-btn"
                                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.15, ease: "easeOut" }}
                                onPointerDown={(e) => e.stopPropagation()} onPointerUp={(e) => e.stopPropagation()} onTouchStart={(e) => e.stopPropagation()} onTouchEnd={(e) => e.stopPropagation()} onClick={(e) => e.stopPropagation()}
                                className="absolute top-4 right-4 sm:top-6 sm:right-6 z-20 flex items-center"
                            >
                                <button
                                    onClick={() => {
                                        prevStateRef.current = 'PRE_INSPECTION'; 
                                        setTime(0);
                                        resetTimer();
                                    }}
                                    className="glass-panel w-9 h-9 sm:w-[44px] sm:h-[44px] flex items-center justify-center rounded-xl sm:rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#1C1E22] text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white transition-all shadow-sm focus:outline-none backdrop-blur-md"
                                >
                                    <TimerOff className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                                </button>
                            </motion.div>
                        ) : null}
                    </AnimatePresence>

                    <AnimatePresence>
                        {(state === 'PRE_INSPECTION' || state === 'STOPPED') && !isManualMode && (
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.9, y: 10 }} 
                                animate={{ opacity: 1, scale: 1, y: 0 }} 
                                exit={{ opacity: 0, scale: 0.9, y: 10 }} 
                                className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 z-20 flex flex-col items-center gap-1 sm:gap-1.5"
                                onPointerDown={(e) => e.stopPropagation()}
                            >
                                <button 
                                    onClick={() => setIsPhaseMode(!isPhaseMode)}
                                    title="Toggle Phase Tracking"
                                    className={clsx(
                                        "glass-panel w-9 h-9 sm:w-[44px] sm:h-[44px] flex items-center justify-center rounded-xl sm:rounded-2xl border transition-all duration-300 shadow-sm focus:outline-none backdrop-blur-md group",
                                        isPhaseMode 
                                            ? "bg-primary/10 border-primary/40 text-primary shadow-[0_0_15px_rgba(59,130,246,0.3)]" 
                                            : "bg-slate-50 dark:bg-[#1C1E22] border-slate-200 dark:border-white/10 text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white"
                                    )}
                                >
                                    <Timeline 
                                        className={clsx(
                                            "w-4 h-4 sm:w-5 sm:h-5 transition-all duration-300", 
                                            isPhaseMode && "scale-110 animate-pulse drop-shadow-[0_0_8px_currentColor]"
                                        )} 
                                    /> 
                                </button>
                                <span className={clsx(
                                    "text-[8px] sm:text-[9px] font-bold uppercase tracking-widest select-none transition-colors duration-300 whitespace-pre-line text-center block", 
                                    isPhaseMode ? "text-primary drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]" : "text-slate-400 dark:text-gray-500"
                                )}>
                                    {isPhaseMode ? "Phase\nTracking" : "No Phase\nTracking"}
                                </span>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <AnimatePresence>
                        {(state === 'PRE_INSPECTION' || state === 'STOPPED') && !isManualMode && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="absolute bottom-4 sm:bottom-6 inset-x-0 mx-auto flex justify-center text-slate-500 dark:text-gray-400 text-xs sm:text-sm font-medium whitespace-nowrap z-10 pointer-events-none">
                                <span className="hidden sm:inline">Hold space to start</span>
                                <span className="inline sm:hidden">Touch and hold to start</span>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <AnimatePresence>
                        {state === 'RUNNING' && isPhaseMode && !isManualMode && (
                            <motion.div 
                                initial={{ opacity: 0, y: 10 }} 
                                animate={{ opacity: 1, y: 0 }} 
                                exit={{ opacity: 0 }}
                                className="absolute bottom-4 sm:bottom-6 inset-x-0 mx-auto flex justify-center z-10 pointer-events-none"
                            >
                                <div className="bg-primary/10 border border-primary/20 text-primary px-4 py-1.5 rounded-full font-bold text-xs sm:text-sm uppercase tracking-widest shadow-[0_0_15px_rgba(59,130,246,0.2)] backdrop-blur-md">
                                    Phase {activePhaseIndex + 1}: {activePhasesArray[activePhaseIndex]}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* DYNAMIC TIMER OR INPUT AREA */}
                    <div className="flex items-baseline justify-center gap-2 sm:gap-4 flex-wrap w-full select-none">
                        {isManualMode ? (
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                                className="flex flex-col items-center gap-4 sm:gap-6 z-10 w-full px-4"
                                onPointerDown={(e) => e.stopPropagation()}
                            >
                                <div className="flex flex-col items-center gap-2 sm:gap-3 w-full max-w-[200px] sm:max-w-[320px]">
                                    <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-gray-500">
                                        Manual Entry
                                    </span>
                                    <input 
                                        type="text" 
                                        inputMode="decimal"
                                        value={manualTimeInput}
                                        onChange={(e) => setManualTimeInput(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleManualSave()}
                                        placeholder="0.00"
                                        className="font-display font-bold tabular-nums tracking-tighter text-center bg-slate-100 dark:bg-[#1C1E22] border-2 border-slate-200 dark:border-white/10 focus:border-primary/50 dark:focus:border-primary/50 outline-none focus:outline-none focus:ring-0 text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-gray-700/50 w-full text-[2.5rem] sm:text-[4.5rem] lg:text-[5.5rem] rounded-2xl sm:rounded-[2rem] py-2 sm:py-4 transition-all shadow-inner"
                                        autoFocus
                                    />
                                </div>
                                <div className="flex gap-3 sm:gap-4 mt-1 sm:mt-0">
                                    <button 
                                        onClick={() => { setIsManualMode(false); setManualTimeInput(''); }}
                                        className="w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center rounded-2xl bg-slate-200/50 dark:bg-white/5 hover:bg-slate-300/50 hover:dark:bg-white/10 text-slate-500 dark:text-gray-400 hover:text-slate-900 hover:dark:text-white transition-all shadow-sm focus:outline-none"
                                        title="Cancel"
                                    >
                                        <X className="w-5 h-5 sm:w-6 sm:h-6" />
                                    </button>
                                    <button 
                                        onClick={handleManualSave}
                                        className="w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 hover:border-primary/30 transition-all shadow-[0_0_15px_rgba(59,130,246,0.15)] hover:shadow-[0_0_20px_rgba(59,130,246,0.25)] focus:outline-none"
                                        title="Save Time"
                                    >
                                        <Check className="w-5 h-5 sm:w-6 sm:h-6 stroke-[3]" />
                                    </button>
                                </div>
                            </motion.div>
                        ) : (
                            <>
                                <motion.div
                                    className={clsx("font-display font-bold tabular-nums tracking-tighter transition-colors duration-200 leading-none", getTimerColor(), state === 'INSPECTION' ? 'text-[8rem] sm:text-[12rem] lg:text-[16rem]' : 'text-[5rem] sm:text-[7rem] lg:text-[14rem]')}
                                    style={{ fontVariantNumeric: 'tabular-nums' }}
                                >
                                    {state === 'INSPECTION' ? inspectionTime : state === 'PRE_INSPECTION_HOLD' ? '0' : formatTime(getDisplayTime())}
                                </motion.div>
                                {renderComparison()}
                            </>
                        )}
                    </div>
                    
                    <canvas ref={confettiCanvasRef} className="pointer-events-none absolute inset-0 w-full h-full z-[9999]" />
                </div>

                {renderStats("grid grid-cols-6 gap-1 sm:gap-2 mt-4 lg:hidden w-full px-0.5 py-0.5", "p-1 sm:p-2 min-w-0 w-full glass-flat")}
            </div>

            <div className="w-full lg:w-96 flex flex-col gap-5 sm:gap-6 shrink-0 lg:h-full">
                {renderStats("hidden lg:grid grid-cols-3 gap-3 shrink-0", "p-2.5")}
                <div className="glass-panel p-0 flex-1 flex flex-col overflow-hidden min-h-[280px] lg:h-[500px] lg:min-h-0 w-full text-left">
                    <div className="flex justify-between items-center min-h-[56px] px-4 py-2.5 gap-3 border-b border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.01] w-full shrink-0 select-none">
                        <div className="flex items-center gap-2">
                            <div className="relative flex items-center session-dropdown-container" ref={sessionDropdownRef}>
                                <button
                                    onClick={() => setIsSessionDropdownOpen(!isSessionDropdownOpen)}
                                    className={`glass-panel flex items-center justify-between gap-1.5 bg-slate-100 dark:bg-[#1C1E22] border rounded-lg pl-3 pr-2 py-1.5 text-xs font-semibold text-slate-700 dark:text-gray-300 outline-none hover:border-slate-300 dark:hover:border-white/20 hover:bg-slate-200/50 dark:hover:bg-[#25282E] transition-all cursor-pointer min-w-[95px] shadow-sm ${isSessionDropdownOpen ? "border-primary ring-1 ring-primary" : "border-slate-200 dark:border-white/10"}`}
                                >
                                    <div className="flex items-center gap-1.5 truncate max-w-[80px]">
                                        <span className="truncate">{currentSession}</span>
                                        <span className="w-2.5 h-2.5 rounded-[5px] border border-black/10 dark:border-white/10 shrink-0" style={{ backgroundColor: sessionColors[currentSession] }} />
                                    </div>
                                    <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-200 ${isSessionDropdownOpen ? "rotate-180" : ""}`} />
                                </button>
                                
                                <div className={`glass-panel absolute top-full left-0 mt-1.5 w-[160px] bg-white/80 dark:bg-[#1C1E22]/80 backdrop-blur-md border border-slate-200 dark:border-white/10 rounded-lg shadow-xl overflow-hidden z-50 transition-all duration-200 origin-top-left ${isSessionDropdownOpen ? "opacity-100 scale-100 visible" : "opacity-0 scale-95 invisible pointer-events-none"}`}>
                                    <div className="max-h-[220px] overflow-y-auto py-1 divide-y divide-slate-100 dark:divide-white/5 hide-scrollbar">
                                        {sessions.map((s) => (
                                            <div key={s} className={`flex items-center justify-between w-full px-2 py-1.5 text-xs font-semibold transition-colors ${currentSession === s ? "bg-primary/10 text-primary dark:text-blue-400" : "text-slate-700 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-white/5"}`}>
                                                <button onClick={() => { setCurrentSession(s); setIsSessionDropdownOpen(false); }} className="flex-1 text-left py-0.5 truncate flex items-center justify-between gap-2 pr-1">
                                                    <span className="truncate">{s}</span>
                                                    <span className="w-2.5 h-2.5 rounded-[5px] border border-black/10 dark:border-white/10 shrink-0" style={{ backgroundColor: sessionColors[s] }} />
                                                </button>
                                                <button onClick={(e) => { e.stopPropagation(); handleEditSession(s); setIsSessionDropdownOpen(false); }} className="p-1 rounded-md text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 active:scale-95 transition-all focus:outline-none shrink-0 ml-1">
                                                    <Edit2 className="w-3.5 h-3.5 shrink-0" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                    <button onClick={() => { handleAddSession(); setIsSessionDropdownOpen(false); }} className="w-full flex items-center justify-center gap-1.5 py-2 px-3 border-t border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02] hover:bg-slate-100 dark:hover:bg-white/5 text-primary dark:text-blue-400 text-xs font-bold transition-all focus:outline-none">
                                        <Plus className="w-3.5 h-3.5" /><span>Add Session</span>
                                    </button>
                                </div>
                            </div>
                            <button
                                onClick={() => handleDeleteSession(currentSession)} disabled={sessions.length <= 1}
                                className={`w-8 h-8 flex items-center justify-center rounded-lg border transition-all shrink-0 focus:outline-none ${sessions.length <= 1 ? "border-slate-200 dark:border-white/5 bg-slate-100 dark:bg-white/[0.02] text-slate-400 dark:text-gray-600 cursor-not-allowed opacity-50" : "border-red-500/20 bg-red-500/5 hover:bg-red-500/10 active:bg-red-500/25 text-red-500"}`}
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                            </button>
                        </div>

                        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-gray-400">
                            <span className="text-[10px] sm:text-xs font-bold text-slate-500 dark:text-gray-500 uppercase flex items-center gap-1">
                                <TimerIcon className="w-3.5 h-3.5 text-primary shrink-0" /><span>Avg:</span>
                            </span>
                            <span className="font-display font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                                {timesMs.length > 0 ? (() => {
                                    const avgMs = timesMs.reduce((a, b) => a + b, 0) / timesMs.length;
                                    const mins = Math.floor(avgMs / 60000);
                                    const secs = ((avgMs % 60000) / 1000).toFixed(3);
                                    return mins > 0 ? `${mins}:${secs.padStart(6, '0')}` : secs;
                                })() : '--'}
                            </span>
                            <span className="text-[10px] font-mono font-bold text-slate-400 dark:text-gray-500 bg-slate-100 dark:bg-white/[0.04] px-2 py-0.5 rounded-full border border-slate-200/50 dark:border-white/5">
                                {solves.length} {solves.length === 1 ? 'solve' : 'solves'}
                            </span>
                        </div>
                    </div>
                    <div className="sticky top-0 m-2 px-4 py-2.5 grid grid-cols-12 gap-2 text-[10px] sm:text-xs font-bold text-slate-400 dark:text-gray-500 uppercase tracking-wider select-none border-b border-slate-200 dark:border-white/5 bg-slate-50/90 dark:bg-black/[0.01] backdrop-blur-md z-20">
                        <div className="col-span-2 pl-1">No.</div>
                        <div className="col-span-4">Time</div>
                        <div className="col-span-2 text-center">mo3</div>
                        <div className="col-span-2 text-center">ao5</div>
                        <div className="col-span-2 text-center">ao12</div>
                    </div>

                    <div className="flex-1 max-h-[210px] lg:max-h-none overflow-y-auto p-2 space-y-1 hide-scrollbar w-full method-dropdown-container">
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
                                            layout key={solveId} transition={{ layout: { type: "spring", stiffness: 300, damping: 28, mass: 0.9 } }}
                                            onClick={() => setSelectedSolveId(isSelected ? null : solveId)}
                                            className={clsx(
                                                "flex flex-col w-full cursor-pointer select-none border mb-1 overflow-hidden transition-all duration-200",
                                                isSelected ? "p-2.5 px-4 rounded-xl dark:bg-white/[0.03] bg-white/40 border-slate-200 dark:border-white/10 backdrop-blur-md shadow-md" : "p-2 px-4 rounded-xl bg-transparent border-transparent hover:bg-slate-100 dark:hover:bg-white/5"
                                            )}
                                        >
                                            <div className="grid grid-cols-12 gap-2 items-center w-full">
                                                <div className="col-span-2 font-mono font-bold text-xs text-slate-400 dark:text-gray-500 pl-1 select-none">
                                                    {solves.length - idx}.
                                                </div>
                                                <div className="col-span-4 flex flex-col items-start gap-1 min-w-0">
                                                    <div className="flex items-center gap-1 select-none shrink-0 flex-wrap">
                                                        <span className="font-display font-bold text-slate-900 dark:text-white text-sm sm:text-base leading-none">
                                                            {solve.penalty === '+2' ? formatTime(solve.timeMs + 2000) + '+' : formatTime(solve.timeMs)}
                                                        </span>
                                                        {isBest && <span className="text-[7px] sm:text-[8px] font-mono font-extrabold uppercase text-green-600 dark:text-green-400 bg-green-500/10 px-1 py-0.5 rounded leading-none shrink-0 self-start -mt-1 select-none">best</span>}
                                                        {isWorst && <span className="text-[7px] sm:text-[8px] font-mono font-extrabold uppercase text-red-600 dark:text-red-400 bg-red-500/10 px-1 py-0.5 rounded leading-none shrink-0 self-start -mt-1 select-none">worst</span>}
                                                        {solve.penalty === 'None' && solve.comments && <MessageSquare className="w-2.5 h-2.5 text-slate-400/70 shrink-0 self-center" />}
                                                        {solve.penalty === '+2' && <span className="text-[8px] sm:text-[9px] font-mono text-yellow-600 dark:text-amber-400 font-extrabold px-1 py-0.5 rounded bg-yellow-500/10 shrink-0 select-none self-center">+2</span>}
                                                        {solve.penalty === 'DNF' && <span className="text-[8px] sm:text-[9px] font-mono text-red-600 dark:text-red-400 font-extrabold px-1 py-0.5 rounded bg-red-500/10 shrink-0 select-none self-center">DNF</span>}
                                                    </div>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            const initSplits = solve.phaseSplits && Object.keys(solve.phaseSplits).length > 0
                                                                ? solve.phaseSplits
                                                                : calculateInitialSplits(solve.timeMs, solve.method || method);
                                                            setReconstructionSolve({
                                                                id: solveId,
                                                                timeMs: solve.timeMs,
                                                                method: solve.method || method,
                                                                phaseSplits: initSplits
                                                            });
                                                        }}
                                                        className="text-[8px] font-bold text-blue-600 dark:text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 px-1.5 py-0.5 rounded flex items-center gap-0.5 transition-colors cursor-pointer"
                                                        title="Reconstruct Phase Splits"
                                                    >
                                                        <Timeline className="w-2.5 h-2.5" /> Reconstruct
                                                    </button>
                                                </div>

                                                {!isSelected ? (
                                                    <>
                                                        <div className={clsx("col-span-2 text-center font-mono text-xs leading-none", (() => { const rowMo3 = calculateMo3(solves.slice(idx, idx + 3)); return (rowMo3 !== null && rowMo3 !== 'DNF' && rowMo3 === bestMo3) ? "text-orange-500 dark:text-orange-400 font-bold" : "text-slate-600 dark:text-gray-400"; })())}>
                                                            {(() => { const rowMo3 = calculateMo3(solves.slice(idx, idx + 3)); return rowMo3 !== null ? (rowMo3 === 'DNF' ? 'DNF' : formatTime(rowMo3)) : '-'; })()}
                                                        </div>
                                                        <div className={clsx("col-span-2 text-center font-mono text-xs leading-none", (() => { const rowAo5 = calculateAoN(solves.slice(idx, idx + 5), 5); return (rowAo5 !== null && rowAo5 !== 'DNF' && rowAo5 === bestAo5) ? "text-orange-500 dark:text-orange-400 font-bold" : "text-slate-600 dark:text-gray-400"; })())}>
                                                            {(() => { const rowAo5 = calculateAoN(solves.slice(idx, idx + 5), 5); return rowAo5 !== null ? (rowAo5 === 'DNF' ? 'DNF' : formatTime(rowAo5)) : '-'; })()}
                                                        </div>
                                                        <div className={clsx("col-span-2 text-center font-mono text-xs leading-none", (() => { const rowAo12 = calculateAoN(solves.slice(idx, idx + 12), 12); return (rowAo12 !== null && rowAo12 !== 'DNF' && rowAo12 === bestAo12) ? "text-orange-500 dark:text-orange-400 font-bold" : "text-slate-600 dark:text-gray-400"; })())}>
                                                            {(() => { const rowAo12 = calculateAoN(solves.slice(idx, idx + 12), 12); return rowAo12 !== null ? (rowAo12 === 'DNF' ? 'DNF' : formatTime(rowAo12)) : '-'; })()}
                                                        </div>
                                                    </>
                                                ) : (
                                                    <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} transition={{ duration: 0.15 }} className="col-span-6 flex justify-end items-center gap-1 sm:gap-1.5 select-none" onClick={(e) => e.stopPropagation()}>
                                                        <button
                                                            onClick={() => {
                                                                const initSplits = solve.phaseSplits && Object.keys(solve.phaseSplits).length > 0
                                                                    ? solve.phaseSplits
                                                                    : calculateInitialSplits(solve.timeMs, solve.method || method);
                                                                setReconstructionSolve({
                                                                    id: solveId,
                                                                    timeMs: solve.timeMs,
                                                                    method: solve.method || method,
                                                                    phaseSplits: initSplits
                                                                });
                                                            }}
                                                            className="w-6 h-6 sm:w-[28px] sm:h-[28px] rounded-[6px] transition-all duration-200 border border-blue-500/20 bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 flex justify-center items-center focus:outline-none backdrop-blur-md"
                                                            title="Reconstruct Phase Splits"
                                                        >
                                                            <Timeline className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
                                                        </button>
                                                        <button onClick={() => handleUpdatePenalty(solveId, 'None')} className={clsx("w-6 h-6 sm:w-[28px] sm:h-[28px] rounded-[6px] transition-all duration-200 border flex justify-center items-center focus:outline-none backdrop-blur-md", solve.penalty === 'None' || !solve.penalty ? "bg-slate-600/20 dark:bg-white/10 border-slate-400/30 dark:border-white/20 text-slate-900 dark:text-white" : "bg-slate-200/40 dark:bg-white/[0.04] border-transparent text-slate-500 dark:text-gray-400 hover:bg-slate-300/40 hover:dark:bg-white/[0.08]")} title="No Penalty"><Check className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" /></button>
                                                        <button onClick={() => handleUpdatePenalty(solveId, '+2')} className={clsx("w-6 h-6 sm:w-[28px] sm:h-[28px] rounded-[6px] text-[8px] sm:text-[10px] font-bold tracking-wider transition-all duration-200 border flex justify-center items-center focus:outline-none backdrop-blur-md", solve.penalty === '+2' ? "bg-yellow-500/20 dark:bg-yellow-500/20 border-yellow-500/30 dark:border-yellow-500/30 text-yellow-600 dark:text-yellow-400" : "bg-slate-200/40 dark:bg-white/[0.04] border-transparent text-yellow-600 dark:text-yellow-500 hover:bg-slate-300/40 hover:dark:bg-white/[0.08]")} title="+2 Penalty">+2</button>
                                                        <button onClick={() => handleUpdatePenalty(solveId, 'DNF')} className={clsx("w-6 h-6 sm:w-[28px] sm:h-[28px] rounded-[6px] text-[8px] sm:text-[10px] font-bold tracking-wider transition-all duration-200 border flex justify-center items-center focus:outline-none backdrop-blur-md", solve.penalty === 'DNF' ? "bg-red-500/20 dark:bg-red-500/20 border-red-500/30 dark:border-red-500/30 text-red-600 dark:text-red-400" : "bg-slate-200/40 dark:bg-white/[0.04] border-transparent text-red-600 dark:text-red-500 hover:bg-slate-300/40 hover:dark:bg-white/[0.08]")} title="Did Not Finish">DNF</button>
                                                        <button onClick={() => setActiveCommentSolveId(activeCommentSolveId === solveId ? null : solveId)} className={clsx("w-6 h-6 sm:w-[28px] sm:h-[28px] rounded-[6px] transition-all duration-200 border flex justify-center items-center focus:outline-none backdrop-blur-md", activeCommentSolveId === solveId ? "bg-slate-600/20 dark:bg-white/10 border-slate-400/30 dark:border-white/20 text-slate-900 dark:text-white" : "bg-slate-200/40 dark:bg-white/[0.04] border-transparent text-slate-400 hover:bg-slate-300/40 hover:dark:bg-white/[0.08] hover:text-slate-900 dark:hover:text-white")} title="Add Comment"><MessageSquare className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" /></button>
                                                        <button onClick={() => handleDeleteSolve(solveId)} className="w-6 h-6 sm:w-[28px] sm:h-[28px] rounded-[6px] bg-slate-200/40 dark:bg-white/[0.04] border border-transparent text-red-600 dark:text-red-500 hover:bg-red-500/10 hover:dark:bg-red-500/20 hover:border-red-500/30 backdrop-blur-md transition-all duration-200 flex justify-center items-center focus:outline-none" title="Delete Solve"><Trash2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0"/></button>
                                                    </motion.div>
                                                )}
                                            </div>

                                            <AnimatePresence>
                                                {isSelected && (
                                                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ height: { duration: 0.2, ease: "easeOut" }, opacity: { duration: 0.15, delay: 0.05 } }} className="overflow-hidden w-full cursor-default select-text" onClick={(e) => e.stopPropagation()}>
                                                        <div className="pt-3 pb-1 border-t border-slate-200/50 dark:border-white/5 mt-2 flex flex-col gap-2">
                                                            <div className="flex justify-between items-center text-[10px] text-slate-500 dark:text-gray-400 font-semibold px-1 select-none">
                                                                <span>Date: {new Date(solve.date).toLocaleString()}</span>
                                                                <span className="uppercase tracking-widest text-[9px] text-slate-400 dark:text-gray-500 bg-slate-100 dark:bg-white/[0.04] px-1.5 py-0.5 rounded font-extrabold">{solve.method || 'CFOP'}</span>
                                                            </div>
                                                            <div className="text-[11px] sm:text-xs font-mono font-medium text-slate-700/60 dark:text-gray-300/60 leading-relaxed tracking-wider break-all border-l-2 border-slate-200 dark:border-[#2e323d] pl-3 select-text py-0.5">{solve.scramble}</div>
                                                            
                                                            {solve.phaseSplits && Object.keys(solve.phaseSplits).length > 0 && (
                                                                <div className="flex flex-col gap-1 bg-slate-100/50 dark:bg-black/20 p-2.5 rounded-xl border border-slate-200/50 dark:border-white/5 mt-1 text-left">
                                                                    <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-gray-500">Phase Splits Breakdown:</span>
                                                                    <div className="flex flex-wrap gap-2.5 text-[11px] font-mono">
                                                                        {Object.entries(solve.phaseSplits).map(([pName, pMs]) => (
                                                                            <span key={pName} className="text-slate-700 dark:text-gray-300">
                                                                                <strong className="text-primary">{pName}:</strong> {formatTime(pMs)}
                                                                            </span>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>

                                            {!isSelected && solve.comments && (
                                                <div className="text-[10px] text-slate-400 dark:text-gray-500 italic truncate max-w-full pl-6 select-none mt-1">{solve.comments}</div>
                                            )}

                                            <AnimatePresence>
                                                {isSelected && activeCommentSolveId === solveId && (
                                                    <motion.div initial={{ height: 0, opacity: 0, marginTop: 0 }} animate={{ height: 'auto', opacity: 1, marginTop: 8 }} exit={{ height: 0, opacity: 0, marginTop: 0 }} transition={{ type: "spring", stiffness: 300, damping: 26 }} className="overflow-hidden w-full text-left" onClick={(e) => e.stopPropagation()}>
                                                        <input type="text" placeholder="Add a comment..." defaultValue={solve.comments || ''} onBlur={(e) => handleUpdateComment(solveId, e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { handleUpdateComment(solveId, e.currentTarget.value); setActiveCommentSolveId(null); } }} className="w-full bg-zinc-200 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2 text-xs text-slate-700 dark:text-gray-300 outline-none focus:border-primary/50 transition-colors shadow-inner" autoFocus />
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

            {typeof document !== 'undefined' && createPortal(
                <AnimatePresence>
                    {confirmModal.isOpen && (
                        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))} className="absolute inset-0 backdrop-blur-2xl" />
                            <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} transition={{ type: "spring", stiffness: 350, damping: 28 }} className="relative w-full max-w-sm glass-panel p-6 dark:bg-[#1C1E22]/90 backdrop-blur-xl border border-slate-200/80 dark:border-white/10 rounded-3xl shadow-2xl z-10 text-center" style={{ background: '#FFFFFF' }}>
                                <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white mb-2">{confirmModal.title}</h3>
                                <p className="text-xs sm:text-sm text-slate-600 dark:text-gray-400 leading-relaxed mb-6">{confirmModal.message}</p>
                                <div className="flex gap-3 justify-center">
                                    <Button variant="secondary" size="sm" onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}>Cancel</Button>
                                    <Button onClick={() => { confirmModal.onConfirm(); setConfirmModal(prev => ({ ...prev, isOpen: false })); }} className="bg-red-500 hover:bg-red-650 hover:shadow-[0_0_20px_rgba(239,68,68,0.45)] dark:hover:shadow-[0_0_20px_rgba(239,68,68,0.65)] text-white" size="sm">{confirmModal.confirmText}</Button>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>,
                document.body
            )}

            {typeof document !== 'undefined' && createPortal(
                <AnimatePresence>
                    {inputModal.isOpen && (
                        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} onClick={() => setInputModal(prev => ({ ...prev, isOpen: false }))} className="absolute inset-0 backdrop-blur-2xl" />
                            <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} transition={{ type: "spring", stiffness: 350, damping: 28 }} className="relative w-full max-w-[340px] sm:max-w-sm glass-panel p-5 sm:p-6 dark:bg-[#1C1E22]/90 backdrop-blur-xl border border-slate-200/80 dark:border-white/10 rounded-3xl shadow-2xl z-10 text-center" style={{ background: '#FFFFFF' }}>
                                <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white mb-4">{inputModal.title}</h3>
                                <input
                                    type="text" placeholder={inputModal.placeholder} value={newSessionNameInput} onChange={(e) => setNewSessionNameInput(e.target.value)}
                                    onKeyDown={(e) => { if (e.key === 'Enter') { inputModal.onConfirm(newSessionNameInput, newSessionColor); setInputModal(prev => ({ ...prev, isOpen: false })); } }}
                                    className="w-full bg-zinc-200 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-700 dark:text-gray-300 outline-none focus:border-primary/50 transition-colors shadow-inner mb-4" autoFocus
                                />
                                
                                <div className="flex flex-col gap-2.5 mb-6 text-left w-full">
                                    {/* Presets + Custom Picker Toggle Row */}
                                    <div className="bg-zinc-100 dark:bg-black/15 border border-slate-200 dark:border-white/5 rounded-xl p-2 sm:p-2.5 flex items-center justify-between w-full overflow-hidden gap-1.5 sm:gap-2 shadow-inner">
                                        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto hide-scrollbar flex-1 pb-0.5">
                                            {PRESET_THEME_COLORS.map((c) => {
                                                const isActive = !showCustomColorPicker && newSessionColor.toLowerCase() === c.toLowerCase();
                                                return (
                                                    <button
                                                        key={c}
                                                        type="button"
                                                        onClick={() => { 
                                                            setNewSessionColor(c); 
                                                            syncHsvFromHex(c);
                                                            setShowCustomColorPicker(false);
                                                        }}
                                                        className={clsx(
                                                            "w-6 h-6 sm:w-7 sm:h-7 rounded-full border-2 transition-all duration-200 hover:scale-105 active:scale-90 shrink-0 focus:outline-none ml-[2px] mt-1 mb-1",
                                                            isActive ? "border-slate-400 dark:border-white shadow-[0_0_0_1px_rgba(0,0,0,0.1)]" : "border-transparent"
                                                        )}
                                                        style={{ backgroundColor: c }}
                                                        title={c}
                                                    />
                                                );
                                            })}
                                        </div>
                                        
                                        <div className="w-[0.1px] h-5 bg-slate-200 dark:bg-white/10 shrink-0 mx-0.5 sm:mx-1" />
                                        
                                        {/* Custom Picker rainbow wheel toggle */}
                                        <button 
                                            type="button"
                                            onClick={() => {
                                                syncHsvFromHex(resolvedModalColor);
                                                setShowCustomColorPicker(!showCustomColorPicker);
                                            }}
                                            className="relative w-7 h-7 rounded-full overflow-hidden border-2 hover:scale-110 active:scale-95 transition-all duration-200 flex-shrink-0 cursor-pointer focus:outline-none"
                                            style={{ 
                                                borderColor: showCustomColorPicker || (!PRESET_THEME_COLORS.some(c => c.toLowerCase() === newSessionColor.toLowerCase()) && newSessionColor !== 'theme')
                                                    ? (isDarkMode ? '#FFFFFF' : '#0F172A')
                                                    : 'transparent',
                                                boxShadow: showCustomColorPicker || (!PRESET_THEME_COLORS.some(c => c.toLowerCase() === newSessionColor.toLowerCase()) && newSessionColor !== 'theme')
                                                    ? `0 0 12px ${resolvedModalColor}` 
                                                    : 'none'
                                            }}
                                        >
                                            <div 
                                                className="w-full h-full rounded-full"
                                                style={{
                                                    backgroundImage: `url('/rainbow.png')`,
                                                    backgroundSize: 'cover',
                                                    backgroundPosition: 'center'
                                                }}
                                            />
                                        </button>
                                    </div>

                                    {/* Expandable Custom Color Picker Component */}
                                    <AnimatePresence>
                                        {showCustomColorPicker && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25, ease: 'easeInOut' }}
                                                className="overflow-hidden w-full"
                                            >
                                                <div className="flex flex-col gap-2 pt-1 w-full">
                                                    
                                                    {/* Figma-style Precise Custom UI Panel */}
                                                    <div className="bg-zinc-200 dark:bg-black/20 p-3 sm:p-4 rounded-xl shadow-inner border border-white/10 flex flex-col gap-3.5 w-full">
                                                        {/* SV Box */}
                                                        <div
                                                            ref={svBoxRef}
                                                            className="relative w-full h-[120px] sm:h-[150px] rounded-lg cursor-crosshair select-none touch-none overflow-hidden"
                                                            style={{
                                                                backgroundColor: hsvToHex(hsv.h, 1, 1),
                                                                backgroundImage: `linear-gradient(to top, rgba(0,0,0,1), transparent), linear-gradient(to right, rgba(255,255,255,1), transparent)`
                                                            }}
                                                            onPointerDown={(e) => {
                                                                e.preventDefault();
                                                                e.currentTarget.setPointerCapture(e.pointerId);
                                                                handleSvInteraction(e.clientX, e.clientY);
                                                            }}
                                                            onPointerMove={(e) => {
                                                                if (e.buttons > 0) handleSvInteraction(e.clientX, e.clientY);
                                                            }}
                                                            onPointerUp={(e) => {
                                                                try { e.currentTarget.releasePointerCapture(e.pointerId); } catch(err) {}
                                                            }}
                                                        >
                                                            <div
                                                                className="absolute w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full border-[2.5px] border-white shadow-[0_0_4px_rgba(0,0,0,0.5)] pointer-events-none -translate-x-1/2 -translate-y-1/2"
                                                                style={{ left: `${hsv.s * 100}%`, top: `${(1 - hsv.v) * 100}%` }}
                                                            />
                                                        </div>

                                                        {/* Sliders Container */}
                                                        <div className="flex flex-col gap-3 mt-1 px-1">
                                                            {/* Hue Slider */}
                                                            <div
                                                                ref={hueSliderRef}
                                                                className="relative w-full h-3 sm:h-4 cursor-pointer select-none touch-none"
                                                                onPointerDown={(e) => {
                                                                    e.preventDefault();
                                                                    e.currentTarget.setPointerCapture(e.pointerId);
                                                                    handleHueInteraction(e.clientX);
                                                                }}
                                                                onPointerMove={(e) => {
                                                                    if (e.buttons > 0) handleHueInteraction(e.clientX);
                                                                }}
                                                                onPointerUp={(e) => {
                                                                    try { e.currentTarget.releasePointerCapture(e.pointerId); } catch(err) {}
                                                                }}
                                                            >
                                                                <div className="absolute inset-0 rounded-full" style={{ background: 'linear-gradient(to right, #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%)' }} />
                                                                <div className="absolute top-1/2 -translate-y-1/2 w-3 sm:w-[14px] h-[calc(100%+6px)] border-[2px] sm:border-[2.5px] border-white rounded-full shadow-md pointer-events-none" style={{ left: `calc(${hsv.h * 100}% - 7px)` }} />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                    
                                    {/* DEFAULT ACCENT COLOR BUTTON */}
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setNewSessionColor('theme');
                                            syncHsvFromHex(getThemeAccentColor(accent));
                                            setShowCustomColorPicker(false);
                                        }}
                                        className={clsx(
                                            "mt-1 w-full py-2.5 flex items-center justify-center gap-2 text-[11px] font-bold tracking-wide rounded-lg transition-all focus:outline-none border shadow-sm",
                                            newSessionColor === 'theme' 
                                                ? "bg-primary/10 text-primary border-primary/20"
                                                : "text-slate-500 dark:text-gray-400 hover:text-slate-800 dark:hover:text-white bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border-transparent hover:border-slate-300 dark:hover:border-white/10"
                                        )}
                                    >
                                        <div className="w-3 h-3 rounded-full shadow-[0_1px_2px_rgba(0,0,0,0.2)]" style={{ backgroundColor: getThemeAccentColor(accent) }} />
                                        {newSessionColor === 'theme' ? "USING ACCENT COLOR" : "USE ACCENT COLOR"}
                                    </button>

                                </div>
                                <div className="flex gap-3 justify-center">
                                    <Button variant="secondary" size="sm" onClick={() => setInputModal(prev => ({ ...prev, isOpen: false }))}>Cancel</Button>
                                    <Button variant="glow" size="sm" onClick={() => { inputModal.onConfirm(newSessionNameInput, newSessionColor); setInputModal(prev => ({ ...prev, isOpen: false })); }}>
                                        {inputModal.confirmText}
                                    </Button>
                                </div>
                            </motion.div>
                        </div>
                    )}
                    {reconstructionSolve && (
                        <PostSolveReconstructionModal
                            solveData={reconstructionSolve}
                            onClose={() => setReconstructionSolve(null)}
                            onSave={handleSaveReconstruction}
                            isSaving={isSavingReconstruction}
                            isDarkMode={isDarkMode}
                        />
                    )}
                </AnimatePresence>,
                document.body
            )}

        </PageTransition>
    );
}