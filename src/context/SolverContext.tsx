import React, { createContext, useContext, useState } from 'react';
import { type CubeColor } from '@/services/colorDetector';
import { type SolveStep } from '@/hooks/useSolvePlayback';

interface SolverContextType {
  scannedFaces: Record<string, CubeColor[]> | null;
  solution: { steps: SolveStep[]; totalMoves: number } | null;
  activeScanId: string | null;
  setScannedFaces: (faces: Record<string, CubeColor[]>) => void;
  setSolution: (solution: { steps: SolveStep[]; totalMoves: number }) => void;
  setActiveScanId: (id: string | null) => void;
  clearScanState: () => void;
}

const SolverContext = createContext<SolverContextType | undefined>(undefined);

export const SolverProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [scannedFaces, setScannedFacesState] = useState<Record<string, CubeColor[]> | null>(null);
  const [solution, setSolutionState] = useState<{ steps: SolveStep[]; totalMoves: number } | null>(null);
  const [activeScanId, setActiveScanIdState] = useState<string | null>(null);

  const setScannedFaces = (faces: Record<string, CubeColor[]>) => {
    setScannedFacesState(faces);
  };

  const setSolution = (sol: { steps: SolveStep[]; totalMoves: number }) => {
    setSolutionState(sol);
  };

  const setActiveScanId = (id: string | null) => {
    setActiveScanIdState(id);
  };

  const clearScanState = () => {
    setScannedFacesState(null);
    setSolutionState(null);
    setActiveScanIdState(null);
  };

  return (
    <SolverContext.Provider
      value={{
        scannedFaces,
        solution,
        activeScanId,
        setScannedFaces,
        setSolution,
        setActiveScanId,
        clearScanState,
      }}
    >
      {children}
    </SolverContext.Provider>
  );
};

export const useSolver = () => {
  const context = useContext(SolverContext);
  if (!context) {
    throw new Error('useSolver must be called inside a SolverProvider wrapper.');
  }
  return context;
};
