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
   * Utilizes ZZ Method Edge Orientation and Kociemba Corner Orientation Invariants.
   */
  static validateFullCube(cube: CompleteCubeState): ValidationResult {
    const counts: Record<CubeColor, number> = {
      W: 0, Y: 0, G: 0, B: 0, R: 0, O: 0, UNKNOWN: 0
    };

    const faces: (keyof CompleteCubeState)[] = ['F', 'R', 'B', 'L', 'U', 'D'];
    const centers: Record<string, CubeColor> = {};

    // 1. Basic Element Tallying
    for (const face of faces) {
      const grid = cube[face];
      if (!grid || grid.length !== 9) return { isValid: false, errorMsg: `Face alignment layout corrupted for block structure: ${face}`, colorCounts: counts };
      centers[face] = grid[4];
      for (const color of grid) counts[color]++;
    }

    if (counts.UNKNOWN > 0) return { isValid: false, errorMsg: `Scanning failed to isolate ${counts.UNKNOWN} ambiguous face elements.`, colorCounts: counts };

    // 2. Absolute Density Check
    const validColors: CubeColor[] = ['W', 'Y', 'G', 'B', 'R', 'O'];
    for (const color of validColors) {
      if (counts[color] !== 9) return { isValid: false, errorMsg: `Invalid structural counts. Color label [${color}] demands exactly 9 total blocks. Found: ${counts[color]}`, colorCounts: counts };
    }

    const uniqueCenters = new Set(Object.values(centers));
    if (uniqueCenters.size !== 6) return { isValid: false, errorMsg: "Structural layout verification failure: Duplicate center colors detected.", colorCounts: counts };

    // 3. Deep Geometric Topology Mapping
    const opposites: Record<string, string> = {
      [centers.U]: centers.D, [centers.D]: centers.U,
      [centers.F]: centers.B, [centers.B]: centers.F,
      [centers.L]: centers.R, [centers.R]: centers.L
    };

    // Edges mapped as: [PrimarySlotFace, SecondarySlotFace]
    const edges = [
      [cube.U[1], cube.B[1]], [cube.U[5], cube.R[1]], [cube.U[7], cube.F[1]], [cube.U[3], cube.L[1]],
      [cube.D[7], cube.B[7]], [cube.D[5], cube.R[7]], [cube.D[1], cube.F[7]], [cube.D[3], cube.L[7]],
      [cube.F[5], cube.R[3]], [cube.F[3], cube.L[5]], [cube.B[3], cube.R[5]], [cube.B[5], cube.L[3]]
    ];

    // Corners mapped in strict CLOCKWISE visual order
    const corners = [
      [cube.U[0], cube.L[0], cube.B[2]], // UBL
      [cube.U[2], cube.B[0], cube.R[2]], // UBR
      [cube.U[8], cube.R[0], cube.F[2]], // UFR
      [cube.U[6], cube.F[0], cube.L[2]], // UFL
      [cube.D[0], cube.L[8], cube.F[6]], // DFL
      [cube.D[2], cube.F[8], cube.R[6]], // DFR
      [cube.D[8], cube.R[8], cube.B[6]], // DBR
      [cube.D[6], cube.B[8], cube.L[6]]  // DBL
    ];

    const hasDuplicates = (arr: CubeColor[]) => new Set(arr).size !== arr.length;
    const hasOpposites = (arr: CubeColor[]) => arr.some(c => arr.includes(opposites[c] as CubeColor));

    // 4. Validate Physical Impossibilities & Duplicate Pieces
    const serializedEdges = new Set<string>();
    for (const edge of edges) {
      if (hasDuplicates(edge)) return { isValid: false, errorMsg: "Invalid Geometry: Edge piece contains identical duplicate colors.", colorCounts: counts };
      if (hasOpposites(edge)) return { isValid: false, errorMsg: "Invalid Geometry: Edge piece contains physically impossible opposite colors.", colorCounts: counts };
      
      const sig = [...edge].sort().join('-');
      if (serializedEdges.has(sig)) return { isValid: false, errorMsg: "Invalid Geometry: Duplicate edge pieces detected across the cube.", colorCounts: counts };
      serializedEdges.add(sig);
    }

    const serializedCorners = new Set<string>();
    for (const corner of corners) {
      if (hasDuplicates(corner)) return { isValid: false, errorMsg: "Invalid Geometry: Corner piece contains identical duplicate colors.", colorCounts: counts };
      if (hasOpposites(corner)) return { isValid: false, errorMsg: "Invalid Geometry: Corner piece contains physically impossible opposite colors.", colorCounts: counts };
      
      const sig = [...corner].sort().join('-');
      if (serializedCorners.has(sig)) return { isValid: false, errorMsg: "Invalid Geometry: Duplicate corner pieces detected across the cube.", colorCounts: counts };
      serializedCorners.add(sig);
    }

    // 5. Flawless Mathematical Parity Checking (Twists & Flips)
    
    // Check Corner Twists (Orientation modulo 3 must equal 0)
    let cornerTwistSum = 0;
    for (const corner of corners) {
      // Find where the Top/Bottom (U/D) center color is located on this specific corner
      const twistIndex = corner.findIndex(c => c === centers.U || c === centers.D);
      if (twistIndex === -1) return { isValid: false, errorMsg: "Invalid Geometry: Corner piece missing Top/Bottom color.", colorCounts: counts };
      cornerTwistSum += twistIndex; // Adds 0, 1, or 2 based on its clockwise axis
    }

    if (cornerTwistSum % 3 !== 0) {
      return { 
        isValid: false, 
        errorMsg: "Unsolvable Condition: A single corner on your physical cube is twisted. Please manually twist it back to solve the cube.", 
        colorCounts: counts 
      };
    }

    // Check Edge Flips (Orientation modulo 2 must equal 0)
    let edgeFlipSum = 0;
    for (const edge of edges) {
      // Determine the primary color of the physical piece using standard hierarchy
      let primaryColor: CubeColor | null = null;
      if (edge.includes(centers.U)) primaryColor = centers.U;
      else if (edge.includes(centers.D)) primaryColor = centers.D;
      else if (edge.includes(centers.F)) primaryColor = centers.F;
      else if (edge.includes(centers.B)) primaryColor = centers.B;

      if (!primaryColor) return { isValid: false, errorMsg: "Invalid Geometry: Edge piece missing primary structural color.", colorCounts: counts };

      const primaryIndex = edge.indexOf(primaryColor);
      edgeFlipSum += primaryIndex; // Adds 0 (Oriented) or 1 (Flipped)
    }

    if (edgeFlipSum % 2 !== 0) {
      return { 
        isValid: false, 
        errorMsg: "Unsolvable Condition: A single edge on your physical cube is flipped. Please gently pop it out and flip it to solve the cube.", 
        colorCounts: counts 
      };
    }

    // If it passes geometry, duplicates, twists, and flips, it is highly likely to be solvable!
    // Any deeper permutation swaps (e.g., 2 edges swapped) will be safely caught by the backend Kociemba engine.
    return { isValid: true, errorMsg: null, colorCounts: counts };
  }
}