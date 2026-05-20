import { type CubeColor } from '../services/colorDetector';

export interface CompleteCubeState {
  F: CubeColor[]; // 9 element arrays per face config allocation block
  R: CubeColor[];
  B: CubeColor[];
  L: CubeColor[];
  U: CubeColor[];
  D: CubeColor[];
}

export interface ValidationResult {
  isValid: boolean;
  errorMsg: string | null;
  colorCounts: Record<CubeColor, number>;
}

export class CubeValidator {
  /**
   * Asserts exact structural configuration requirements on complete 54-element puzzle states.
   */
  static validateFullCube(cube: CompleteCubeState): ValidationResult {
    const counts: Record<CubeColor, number> = {
      W: 0, Y: 0, G: 0, B: 0, R: 0, O: 0, UNKNOWN: 0
    };

    const faces: (keyof CompleteCubeState)[] = ['F', 'R', 'B', 'L', 'U', 'D'];
    const centers: Record<string, CubeColor> = {};

    for (const face of faces) {
      const grid = cube[face];
      
      if (!grid || grid.length !== 9) {
        return { isValid: false, errorMsg: `Face alignment layout corrupted for block structure: ${face}`, colorCounts: counts };
      }

      // Catalog center point distributions (Index 4 represents absolute spatial center element mapping)
      centers[face] = grid[4];

      // Tally atomic distribution footprints
      for (const color of grid) {
        counts[color]++;
      }
    }

    // Check 1: Unknown entities inside runtime stack arrays
    if (counts.UNKNOWN > 0) {
      return { isValid: false, errorMsg: `Scanning failed to isolate ${counts.UNKNOWN} ambiguous face elements.`, colorCounts: counts };
    }

    // Check 2: Absolute total frequency distribution assertion
    const validColors: CubeColor[] = ['W', 'Y', 'G', 'B', 'R', 'O'];
    for (const color of validColors) {
      if (counts[color] !== 9) {
        return { 
          isValid: false, 
          errorMsg: `Invalid structural configuration profile counts. Color label [${color}] demands exactly 9 total blocks. Found: ${counts[color]}`, 
          colorCounts: counts 
        };
      }
    }

    // Check 3: Unique center configuration constraints
    const centerValues = Object.values(centers);
    const uniqueCenters = new Set(centerValues);
    if (uniqueCenters.size !== 6) {
      return { 
        isValid: false, 
        errorMsg: "Structural layout verification failure: System mapped identical color elements onto separate core spatial centers.", 
        colorCounts: counts 
      };
    }

    return { isValid: true, errorMsg: null, colorCounts: counts };
  }
}