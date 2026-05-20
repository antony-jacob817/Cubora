import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, AlertTriangle, CheckCircle2, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { PageTransition } from '@/components/animations/PageTransition';

// Type-only syntax enforcement for verbatimModuleSyntax requirements
import type { CubeColor, CompleteCubeState } from '@/services/colorDetector';
import type { ValidationResult } from '@/utils/cubeValidator';
import { CubeValidator } from '@/utils/cubeValidator';
import { clsx } from 'clsx';

// --- CONFIGURATION MAPPINGS ---
const COLOR_PALETTE: { id: CubeColor; label: string; hex: string; glow: string }[] = [
  { id: 'W', label: 'White', hex: '#FFFFFF', glow: 'shadow-[0_0_15px_rgba(255,255,255,0.4)]' },
  { id: 'Y', label: 'Yellow', hex: '#EAB308', glow: 'shadow-[0_0_15px_rgba(234,179,8,0.4)]' },
  { id: 'G', label: 'Green', hex: '#22C55E', glow: 'shadow-[0_0_15px_rgba(34,197,94,0.4)]' },
  { id: 'B', label: 'Blue', hex: '#3B82F6', glow: 'shadow-[0_0_15px_rgba(59,130,246,0.4)]' },
  { id: 'R', label: 'Red', hex: '#EF4444', glow: 'shadow-[0_0_15px_rgba(239,68,68,0.4)]' },
  { id: 'O', label: 'Orange', hex: '#F97316', glow: 'shadow-[0_0_15px_rgba(249,115,22,0.4)]' },
];

const FACE_LABELS: Record<keyof CompleteCubeState, string> = {
  F: 'Front (Green)',
  R: 'Right (Red)',
  B: 'Back (Blue)',
  L: 'Left (Orange)',
  U: 'Top (White)',
  D: 'Bottom (Yellow)',
};

// Fixed type mapping: "L" is replaced globally with "O" to conform to absolute CubeColor allocations
const initialScannedState: CompleteCubeState = {
  F: ['G', 'G', 'R', 'G', 'G', 'G', 'G', 'G', 'G'],
  R: ['R', 'R', 'G', 'R', 'R', 'R', 'R', 'R', 'R'],
  B: ['B', 'B', 'B', 'B', 'B', 'B', 'B', 'B', 'B'],
  L: ['O', 'O', 'O', 'O', 'O', 'O', 'O', 'O', 'O'], 
  U: ['W', 'W', 'W', 'W', 'W', 'W', 'W', 'W', 'W'],
  D: ['Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y'],
};

export default function ColorCorrection() {
  const getSanitizedInitialState = (): CompleteCubeState => JSON.parse(JSON.stringify(initialScannedState));

  // --- STATE STACK ---
  const [cubeState, setCubeState] = useState<CompleteCubeState>(getSanitizedInitialState);
  const [activeFace, setActiveFace] = useState<keyof CompleteCubeState>('F');
  const [selectedColor, setSelectedColor] = useState<CubeColor>('G');
  const [validation, setValidation] = useState<ValidationResult>({
    isValid: false,
    errorMsg: null,
    colorCounts: { W: 0, Y: 0, G: 0, B: 0, R: 0, O: 0, UNKNOWN: 0 },
  });

  useEffect(() => {
    const result = CubeValidator.validateFullCube(cubeState);
    setValidation(result);
  }, [cubeState]);

  const handleStickerClick = (index: number) => {
    if (index === 4) return; // Anchor protection loop

    setCubeState((prev) => {
      const updatedFace = [...prev[activeFace]];
      updatedFace[index] = selectedColor;
      return {
        ...prev,
        [activeFace]: updatedFace,
      };
    });
  };

  const handleReset = () => {
    setCubeState(getSanitizedInitialState());
  };

  // Fixed indexing key transformations: Extract keys into typed face matrices arrays explicitly
  const faceKeys = Object.keys(FACE_LABELS) as (keyof CompleteCubeState)[];

  return (
    <PageTransition className="w-full flex flex-col gap-6 pb-12">
      <div>
        <h1 className="font-display text-3xl font-bold text-white tracking-tight">Data Calibration</h1>
        <p className="text-gray-400 text-sm mt-1">
          Review scanned surfaces. Tap swatches below to correct physical sticker assignments manually.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* LEFT COLUMN: EDITOR */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="glass-panel p-6 flex flex-col items-center">
            
            <div className="w-full flex flex-wrap gap-2 border-b border-white/5 pb-4 mb-6">
              {faceKeys.map((face) => (
                <button
                  key={face} // Fixed: key is now a clean string template literal token
                  onClick={() => setActiveFace(face)}
                  className={clsx(
                    "px-4 py-2 rounded-xl text-xs font-bold font-display tracking-wider transition-all duration-300",
                    activeFace === face
                      ? "bg-primary/20 text-primary border border-primary/30 shadow-[0_0_15px_rgba(59,130,246,0.15)]"
                      : "bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 border border-transparent"
                  )}
                >
                  {face} Matrix
                </button>
              ))}
            </div>

            <h3 className="text-white font-display font-medium text-lg mb-2 self-start">
              Editing: <span className="text-primary font-bold">{FACE_LABELS[activeFace]}</span>
            </h3>
            <p className="text-gray-400 text-xs mb-8 self-start">
              Click individual squares to apply the active palette color. Center squares are immutable anchors.
            </p>

            <div className="w-64 h-64 sm:w-72 sm:h-72 grid grid-cols-3 grid-rows-3 gap-2 p-3 bg-black/40 rounded-2xl border border-white/10 relative">
              {cubeState[activeFace].map((color, index) => {
                const matchedColor = COLOR_PALETTE.find((p) => p.id === color);
                const isCenter = index === 4;

                return (
                  <motion.button
                    key={index}
                    whileHover={!isCenter ? { scale: 1.04 } : {}}
                    whileTap={!isCenter ? { scale: 0.96 } : {}} // Fixed: whileActive migrated to whileTap
                    onClick={() => handleStickerClick(index)}
                    className={clsx(
                      "w-full h-full rounded-xl transition-all border relative flex items-center justify-center text-xs font-bold font-mono",
                      isCenter ? "cursor-not-allowed border-white/40" : "border-white/10 shadow-inner"
                    )}
                    style={{ backgroundColor: matchedColor?.hex || '#1E293B' }}
                  >
                    {isCenter && (
                      <div className="absolute inset-0 m-auto w-3 h-3 rounded-full bg-black/30 border border-white/30" />
                    )}
                    <span className="mix-blend-difference text-white font-bold text-sm select-none">
                      {color}
                    </span>
                  </motion.button>
                );
              })}
            </div>

            <div className="w-full mt-8 border-t border-white/5 pt-6 flex flex-col items-center">
              <span className="text-xs font-bold font-display tracking-widest text-gray-500 uppercase block mb-4">
                Active Brush Palette
              </span>
              <div className="flex justify-center gap-3 sm:gap-4 flex-wrap">
                {COLOR_PALETTE.map((paletteItem) => {
                  const isSelected = selectedColor === paletteItem.id;

                  return (
                    <button
                      key={paletteItem.id}
                      onClick={() => setSelectedColor(paletteItem.id)}
                      className={clsx(
                        "w-12 h-12 rounded-xl border-2 transition-all duration-300 relative flex flex-col items-center justify-center cursor-pointer",
                        isSelected 
                          ? `border-primary scale-110 ${paletteItem.glow}` 
                          : "border-white/10 hover:border-white/30 hover:scale-105"
                      )}
                      style={{ backgroundColor: paletteItem.hex }}
                      title={`Select ${paletteItem.label}`}
                    >
                      <span className="mix-blend-difference text-white font-bold text-xs">
                        {paletteItem.id}
                      </span>
                      {isSelected && (
                        <motion.div 
                          layoutId="activeIndicator"
                          className="absolute -bottom-1.5 w-4 h-1 bg-primary rounded-full"
                          transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

          </div>
        </div>

        {/* RIGHT COLUMN: RECOGNITION REPORT */}
        <div className="flex flex-col gap-6">
          <div className="glass-panel p-6 flex flex-col gap-6">
            <h3 className="font-display font-bold text-white text-xl">Validation Pulse</h3>
            
            <AnimatePresence mode="wait">
              {validation.isValid ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                  className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl flex items-start gap-3"
                >
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-emerald-400">Topology Confirmed</h4>
                    <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                      Sticker distributions are balanced. This mathematical node tree is completely solvable.
                    </p>
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                  className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex items-start gap-3"
                >
                  <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-red-400">Invalid Matrix Setup</h4>
                    <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                      {validation.errorMsg || 'The puzzle geometry contains invalid face parameters.'}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-3 border-t border-white/5 pt-4">
              <span className="text-xs font-bold font-display tracking-widest text-gray-500 uppercase block mb-1">
                Sticker Densities (Demands 9)
              </span>

              {COLOR_PALETTE.map((p) => {
                const count = validation.colorCounts[p.id] || 0;
                const percent = Math.min((count / 9) * 100, 100);
                const isErroneous = count !== 9;

                return (
                  <div key={p.id} className="space-y-1">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-gray-300 flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-sm border border-white/10" style={{ backgroundColor: p.hex }} />
                        {p.label}
                      </span>
                      <span className={clsx("font-mono font-bold", isErroneous ? "text-red-400" : "text-emerald-400")}>
                        {count} / 9
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${percent}%` }}
                        className={clsx("h-full rounded-full", isErroneous ? "bg-red-500" : "bg-emerald-500")}
                        transition={{ type: "spring", stiffness: 80 }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex flex-col gap-3 mt-4 border-t border-white/5 pt-4">
              <Button 
                variant="glow" 
                className="w-full py-3.5 gap-2" 
                disabled={!validation.isValid}
              >
                <Save className="w-4 h-4" /> Commit Configurations
              </Button>
              <Button 
                variant="secondary" 
                className="w-full py-3.5 gap-2 text-gray-400 hover:text-white"
                onClick={handleReset}
              >
                <RotateCcw className="w-4 h-4" /> Discard Updates
              </Button>
            </div>

          </div>
        </div>
      </div>
    </PageTransition>
  );
}