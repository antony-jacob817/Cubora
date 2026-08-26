export interface ExampleSolvePhase {
  phase: string;
  explanation: string;
  moves: string;
}

export interface ExampleSolve {
  scramble: string;
  phases: ExampleSolvePhase[];
}

export interface Lesson {
  id: string;
  title: string;
  explanation: string;
  algorithm: string;
  isCompleted?: boolean;
  group?: string;
  caseId?: string;
  setup?: string;
  exampleSolve?: ExampleSolve;
}

export interface Module {
  id: string;
  title: string;
  description: string;
  lessons: Lesson[];
}

export interface Course {
  id: string;
  title: string;
  badge: string;
  description: string;
  progress: number;
  isAlgorithmic?: boolean;
  modules: Module[];
  exampleSolve?: ExampleSolve;
}

// -------------------------------------------------------------
// 1. BEGINNER METHOD
// -------------------------------------------------------------
const BEGINNER_EXAMPLE_SOLVE: ExampleSolve = {
  scramble: "F U' B D2 U' R U L' F2 U B' F' R D2 L2 B2 U' L' D2 R F",
  phases: [
    { phase: "Step 1: White Cross (Daisy)", explanation: "Brings white edges to yellow center, then rotates 180° down matching side colors.", moves: "U R2 F2 L2 B2" },
    { phase: "Step 2: First Layer Corners", explanation: "Uses right-hand trigger moves to insert all 4 first-layer corners.", moves: "U R U' R' U' F' U F" },
    { phase: "Step 3: Second Layer Edges", explanation: "Inserts middle layer edges without yellow into their correct slots.", moves: "U R U' R' U' F' U F" },
    { phase: "Step 4: Yellow Cross", explanation: "Applies FURU'F' sequence to form the top yellow cross.", moves: "F R U R' U' F'" },
    { phase: "Step 5: Permute Edges", explanation: "Sune edge swap cycle to align edge colors with side centers.", moves: "R U R' U R U2 R'" },
    { phase: "Step 6: Position Corners", explanation: "Niklas corner cycling sequence to place corners in their correct physical spots.", moves: "U R U' L' U R' U' L" },
    { phase: "Step 7: Orient Corners", explanation: "Repeats reverse sexy triggers until all yellow corners face up, completing the solve.", moves: "R' D' R D R' D' R D" }
  ]
};

// -------------------------------------------------------------
// 2. SIMPLIFIED CFOP
// -------------------------------------------------------------
const SIMPLIFIED_CFOP_EXAMPLE_SOLVE: ExampleSolve = {
  scramble: "D L F' U' D' F D F R' U2 F U2 B2 U L B' D' F' B R F2",
  phases: [
    { phase: "Phase 1: White Cross", explanation: "Aligns all 4 white cross edges with matching side centers directly on the bottom.", moves: "D' R' F D2" },
    { phase: "Phase 2: F2L Pair 1", explanation: "Pairs and slots the Red-Green corner/edge pair into the Back-Right slot.", moves: "U' R U R' U2 R U' R'" },
    { phase: "Phase 3: F2L Pair 2", explanation: "Rotates and slots the Orange-Green pair into the Front-Right slot.", moves: "y' U' R U R'" },
    { phase: "Phase 4: F2L Pair 3", explanation: "Inserts the Red-Blue pair into the Front-Left slot.", moves: "y U R U' R'" },
    { phase: "Phase 5: F2L Pair 4", explanation: "Solves the final Orange-Blue pair cleanly.", moves: "U' R' U R U' R' U' R" },
    { phase: "Phase 6: 2-Look OLL", explanation: "Applies L-Shape 2-Look OLL to orient top yellow face.", moves: "f R U R' U' f'" },
    { phase: "Phase 7: 2-Look PLL", explanation: "Jb Permutation to permute all corners and edges, fully solving the cube.", moves: "R U R' F' R U R' U' R' F R2 U' R'" }
  ]
};

// -------------------------------------------------------------
// 3. FULL CFOP (FRIDRICH)
// -------------------------------------------------------------
const CFOP_EXAMPLE_SOLVE: ExampleSolve = {
  scramble: "D L F' U' D' F D F R' U2 F U2 B2 U L B' D' F' B R F2",
  phases: [
    { phase: "Phase 1: White Cross", explanation: "Aligns all 4 white cross edges with matching side centers.", moves: "D' R' F D2" },
    { phase: "Phase 2: F2L Pair 1", explanation: "Pairs and slots the Red-Green corner/edge pair into the Back-Right slot.", moves: "U' R U R' U2 R U' R'" },
    { phase: "Phase 3: F2L Pair 2", explanation: "Rotates and slots the Orange-Green pair into the Front-Right slot.", moves: "y' U' R U R'" },
    { phase: "Phase 4: F2L Pair 3", explanation: "Inserts the Red-Blue pair.", moves: "y U R U' R'" },
    { phase: "Phase 5: F2L Pair 4", explanation: "Solves the final Orange-Blue pair cleanly.", moves: "U' R' U R U' R' U' R" },
    { phase: "Phase 6: OLL (Orient Last Layer)", explanation: "2-Look OLL L-Shape algorithm to orient top yellow face.", moves: "f R U R' U' f'" },
    { phase: "Phase 7: PLL (Permute Last Layer)", explanation: "Jb Permutation to permute all corners and edges, fully solving the cube.", moves: "R U R' F' R U R' U' R' F R2 U' R'" }
  ]
};

// -------------------------------------------------------------
// 4. ROUX METHOD
// -------------------------------------------------------------
const ROUX_EXAMPLE_SOLVE: ExampleSolve = {
  scramble: "B2 L2 U2 F2 D' B2 D' F2 U B2 R' D' L F' D B' U' L' U' B2",
  phases: [
    { phase: "Step 1: First Block (FB)", explanation: "Build 1x2x3 block on the left side of the cube.", moves: "D' F' B U2 B' L2 F'" },
    { phase: "Step 2: Second Block (SB)", explanation: "Build the second 1x2x3 block on the right side using M and R moves.", moves: "U' R' U M' U R' U' R U2 R' U' R" },
    { phase: "Step 3: CMLL", explanation: "Orient and permute top 4 corners simultaneously.", moves: "R U R' U' R' F R F'" },
    { phase: "Step 4: LSE (Last Six Edges)", explanation: "Orient edges, place UL/UR edges, and permute M-slice edges to solve.", moves: "M' U M' U2 M' U M' M2 U2 M2 U M2 U2 M2" }
  ]
};

// -------------------------------------------------------------
// 5. ZZ METHOD
// -------------------------------------------------------------
const ZZ_EXAMPLE_SOLVE: ExampleSolve = {
  scramble: "D2 R2 U2 B2 F2 R' U2 R' B2 D2 F' L U R' F D' L B' F2 U2",
  phases: [
    { phase: "Step 1: EOLine", explanation: "Orient all 12 edges and place DF and DB line edges.", moves: "F' L' D2 B' D' R2 D" },
    { phase: "Step 2: ZZF2L Blocks", explanation: "Rotationless block building using only R, L, and U moves.", moves: "U R U' R' U R U2 R' L U L' U2 L U' L'" },
    { phase: "Step 3: COLL", explanation: "Solve corner orientation and permutation simultaneously.", moves: "R U2 R' U' R U R' U' R U' R'" },
    { phase: "Step 4: EPLL", explanation: "Permute remaining top layer edges to solve the cube.", moves: "M2 U M2 U2 M2 U M2" }
  ]
};

export const ACADEMY_COURSES: Course[] = [
  // ==========================================
  // COURSE 1: BEGINNER METHOD
  // ==========================================
  {
    id: 'beginner',
    title: 'Beginner Method',
    badge: 'Fundamentals',
    description: 'The universal starting point. Learn layer-by-layer solving through intuitive triggers and clear mechanics.',
    progress: 100,
    isAlgorithmic: false,
    exampleSolve: BEGINNER_EXAMPLE_SOLVE,
    modules: [
      {
        id: 'daisy-cross',
        title: 'Step 1: White Cross (Daisy Method)',
        description: 'Form a white cross on the bottom layer while aligning adjacent edge colors with side centers.',
        lessons: [
          { id: 'b_cross_intuitive', title: 'Daisy Edge Alignment', explanation: 'Position white edge pieces around yellow center (Daisy) and rotate 180° to white face once side colors match.', algorithm: "F2 R2 L2 B2" }
        ]
      },
      {
        id: 'first-layer-corners',
        title: 'Step 2: First Layer Corners',
        description: 'Position white corner pieces between matching color centers and insert into the bottom layer.',
        lessons: [
          { id: 'b_sexy_trigger', title: 'Sexy Move / Right Trigger', explanation: 'Target corner piece is directly above its slot in the top right. Apply right-hand trigger to insert.', algorithm: "R U R' U'" },
          { id: 'b_left_trigger', title: 'Left Hand Trigger', explanation: 'Target corner piece is in top left. Apply mirror left-hand trigger to insert.', algorithm: "L' U' L U" }
        ]
      },
      {
        id: 'second-layer-edges',
        title: 'Step 3: Second Layer Edges',
        description: 'Insert edge pieces without yellow into the middle layer slots.',
        lessons: [
          { id: 'b_edge_insert_right', title: 'Right Edge Insertion', explanation: 'Top-front edge piece moves into the Front-Right slot.', algorithm: "U R U' R' U' F' U F" },
          { id: 'b_edge_insert_left', title: 'Left Edge Insertion', explanation: 'Top-front edge piece moves into the Front-Left slot.', algorithm: "U' L' U L U F U' F'" }
        ]
      },
      {
        id: 'yellow-cross',
        title: 'Step 4: Yellow Cross',
        description: 'Form a yellow cross on top without disturbing the bottom two layers.',
        lessons: [
          { id: 'b_yellow_cross', title: 'FURU\'F\' (Fur-U-Ruf)', explanation: 'Apply once for horizontal line, twice for L shape, or 3 times for center dot.', algorithm: "F R U R' U' F'" }
        ]
      },
      {
        id: 'permute-edges',
        title: 'Step 5: Permute Yellow Edges',
        description: 'Align the top edge colors with corresponding side center colors.',
        lessons: [
          { id: 'b_sune_permute', title: 'Sune Edge Swap', explanation: 'Swaps front and left yellow edges so all top edges match side center colors.', algorithm: "R U R' U R U2 R'" }
        ]
      },
      {
        id: 'position-corners',
        title: 'Step 6: Position Yellow Corners',
        description: 'Cycle corner pieces to their correct physical positions.',
        lessons: [
          { id: 'b_niklas_cycle', title: 'Niklas Corner Cycle', explanation: 'Hold correctly placed corner on Front-Right-Top and cycle remaining 3 corners.', algorithm: "U R U' L' U R' U' L" }
        ]
      },
      {
        id: 'orient-corners',
        title: 'Step 7: Orient Yellow Corners',
        description: 'Rotate last layer corners until all yellow faces point upwards.',
        lessons: [
          { id: 'b_reverse_sexy', title: 'Corner Orientation Trigger', explanation: 'Hold unoriented corner in Front-Right-Top spot and repeat until yellow faces UP, then turn top layer (U) to load next.', algorithm: "R' D' R D" }
        ]
      },
      {
        id: 'beginner-walkthrough',
        title: 'Full Example Solve Walkthrough',
        description: 'Step-by-step complete example solve walkthrough starting from a scrambled cube to 100% solved.',
        lessons: [
          {
            id: 'beginner_master_solve',
            title: 'Beginner Complete Walkthrough',
            explanation: 'Walk through every phase of a full beginner solve with live 3D piece tracking.',
            algorithm: BEGINNER_EXAMPLE_SOLVE.phases.map(p => p.moves).join(' '),
            exampleSolve: BEGINNER_EXAMPLE_SOLVE
          }
        ]
      }
    ]
  },

  // ==========================================
  // COURSE 2: SIMPLIFIED CFOP
  // ==========================================
  {
    id: 'simplified-cfop',
    title: 'Simplified CFOP',
    badge: 'Intermediate',
    description: 'Transition smoothly from beginner to speedcubing with 4-Look Last Layer (4LLL) and intuitive F2L insertions.',
    progress: 15,
    isAlgorithmic: true,
    exampleSolve: SIMPLIFIED_CFOP_EXAMPLE_SOLVE,
    modules: [
      {
        id: 'scfop-f2l',
        title: 'Intuitive F2L Insertions',
        description: 'Solve first two layers by pairing corner and edge pieces in the top layer.',
        lessons: [
          { id: 'sc_f2l_right', title: 'Basic Right Insertion', explanation: 'Corner and edge are paired in top layer; target slot is Front-Right.', algorithm: "U R U' R'" },
          { id: 'sc_f2l_left', title: 'Basic Left Insertion', explanation: 'Corner and edge are paired in top layer; target slot is Front-Left.', algorithm: "U' L' U L" }
        ]
      },
      {
        id: 'scfop-2look-oll-eo',
        title: '2-Look OLL: Edge Orientation (EO)',
        description: 'Orient top edges into a yellow cross in 3 distinct cases.',
        lessons: [
          { id: 'sc_oll_dot', title: 'Dot Case', explanation: 'No top edges oriented. Execute Line alg, then L-shape alg.', algorithm: "F R U R' U' F' U2 F U R U' R' F'" },
          { id: 'sc_oll_l_shape', title: 'L-Shape', explanation: 'Two adjacent top edges oriented forming an L.', algorithm: "f R U R' U' f'" },
          { id: 'sc_oll_line', title: 'Bar / Line Case', explanation: 'Two opposite top edges oriented forming a line.', algorithm: "F R U R' U' F'" }
        ]
      },
      {
        id: 'scfop-2look-oll-co',
        title: '2-Look OLL: Corner Orientation (CO)',
        description: 'Orient yellow corners across all 7 standard cases.',
        lessons: [
          { id: 'sc_oll_sune', title: 'Sune', explanation: '1 corner oriented; top-left front corner sticker faces front.', algorithm: "R U R' U R U2 R'" },
          { id: 'sc_oll_antisune', title: 'Anti-Sune', explanation: '1 corner oriented; top-right front corner sticker faces right.', algorithm: "R U2 R' U' R U' R'" },
          { id: 'sc_oll_h', title: 'H (Double Headlight)', explanation: '0 corners oriented; two pairs of headlights facing front and back.', algorithm: "F R U R' U' R U R' U' R U R' F'" },
          { id: 'sc_oll_pi', title: 'Pi (Wheel)', explanation: '0 corners oriented; headlights on left, corners pointing away on right.', algorithm: "R U2 R2 U' R2 U' R2 U2 R" },
          { id: 'sc_oll_headlights', title: 'Headlights (U)', explanation: '2 corners oriented; remaining two stickers face front.', algorithm: "R2 D R' U2 R D' R' U2 R'" },
          { id: 'sc_oll_chameleon', title: 'Chameleon (T)', explanation: '2 corners oriented; remaining stickers face left and right.', algorithm: "r U R' U' r' F R F'" },
          { id: 'sc_oll_bowtie', title: 'Bowtie (L)', explanation: '2 diagonal corners oriented.', algorithm: "F' r U R' U' r' F R" }
        ]
      },
      {
        id: 'scfop-2look-pll-cp',
        title: '2-Look PLL: Corner Permutation (CP)',
        description: 'Permute corners using T and Y permutations.',
        lessons: [
          { id: 'sc_pll_t', title: 'T Perm (Headlights Case)', explanation: 'One side has matching corners (headlights). Put headlights on Left.', algorithm: "R U R' U' R' F R2 U' R' U' R U R' F'" },
          { id: 'sc_pll_y', title: 'Y Perm (No Headlights Case)', explanation: 'No matching corners on sides. Swaps diagonal corners.', algorithm: "F R U' R' U' R U R' F' R U R' U' R' F R F'" }
        ]
      },
      {
        id: 'scfop-2look-pll-ep',
        title: '2-Look PLL: Edge Permutation (EP)',
        description: 'Permute edges with Ua, Ub, H, and Z perms.',
        lessons: [
          { id: 'sc_pll_ua', title: 'Ua Perm (Clockwise Cycle)', explanation: '1 solved bar; 3 edges cycle clockwise.', algorithm: "R U' R U R U R U' R' U' R2" },
          { id: 'sc_pll_ub', title: 'Ub Perm (Counter-Clockwise)', explanation: '1 solved bar; 3 edges cycle counter-clockwise.', algorithm: "R2 U R U R' U' R' U' R' U R'" },
          { id: 'sc_pll_h', title: 'H Perm (Opposite Edge Swap)', explanation: 'No solved bars; opposite edges swap across center.', algorithm: "M2 U M2 U2 M2 U M2" },
          { id: 'sc_pll_z', title: 'Z Perm (Adjacent Edge Swap)', explanation: 'No solved bars; adjacent edges swap.', algorithm: "M' U M2 U M2 U M' U2 M2" }
        ]
      },
      {
        id: 'scfop-walkthrough',
        title: 'Simplified CFOP Example Solve',
        description: 'Complete 4-Look Last Layer walkthrough from scramble to solved state.',
        lessons: [
          {
            id: 'scfop_master_solve',
            title: 'Simplified CFOP Walkthrough',
            explanation: 'Walk through Cross, Intuitive F2L, 2-Look OLL, and 2-Look PLL on a live 3D cube.',
            algorithm: SIMPLIFIED_CFOP_EXAMPLE_SOLVE.phases.map(p => p.moves).join(' '),
            exampleSolve: SIMPLIFIED_CFOP_EXAMPLE_SOLVE
          }
        ]
      }
    ]
  },

  // ==========================================
  // COURSE 3: FULL CFOP (FRIDRICH)
  // ==========================================
  {
    id: 'cfop',
    title: 'CFOP Mastery',
    badge: 'Advanced',
    description: 'The world\'s most popular speedcubing method. Master all 119 standard algorithms (F2L, 57 OLL, 21 PLL).',
    progress: 34,
    isAlgorithmic: true,
    exampleSolve: CFOP_EXAMPLE_SOLVE,
    modules: [
      {
        id: 'cfop-f2l-core',
        title: 'F2L Core Setups & Insertions',
        description: 'Solve corner and edge simultaneously into slots with maximum efficiency.',
        lessons: [
          { id: 'f2l_01', title: 'Easy Case Right', explanation: 'Corner and edge separated in top layer.', algorithm: "U R U' R'", setup: "R U R'" },
          { id: 'f2l_31', title: 'Corner in Slot, Edge in U', explanation: 'Extract corner while pairing with edge.', algorithm: "R U' R' U R U' R'", setup: "R U' R' U R U' R'" }
        ]
      },
      {
        id: 'cfop-oll-all',
        title: 'OLL: Orientation of Last Layer (57 Cases)',
        description: 'Orient the entire top yellow face in a single algorithm.',
        lessons: [
          { id: 'oll_01', group: 'Dot', title: 'OLL 1 (Runway)', explanation: 'Dot case with no edges oriented.', algorithm: "R U2 R2 F R F' U2 R' F R F'" },
          { id: 'oll_02', group: 'Dot', title: 'OLL 2 (Zamboni)', explanation: 'Dot case double trigger.', algorithm: "F R U R' U' F' f R U R' U' f'" },
          { id: 'oll_03', group: 'Dot', title: 'OLL 3 (Anti-Backslash)', explanation: 'Dot case with anti-backslash orientation.', algorithm: "f R U R' U' f' U' F R U R' U' F'" },
          { id: 'oll_04', group: 'Dot', title: 'OLL 4 (Backslash)', explanation: 'Dot case with backslash orientation.', algorithm: "f R U R' U' f' U F R U R' U' F'" },
          { id: 'oll_05', group: 'Square', title: 'OLL 5 (Right Square)', explanation: 'Square group case.', algorithm: "r' U2 R U R' U r" },
          { id: 'oll_06', group: 'Square', title: 'OLL 6 (Left Square)', explanation: 'Square group left mirror.', algorithm: "r U2 R' U' R U' r'" },
          { id: 'oll_07', group: 'Lightning', title: 'OLL 7 (Small Lightning)', explanation: 'Small lightning bolt shape.', algorithm: "r U R' U R U2 r'" },
          { id: 'oll_08', group: 'Lightning', title: 'OLL 8 (Small Lightning Mirror)', explanation: 'Small lightning left mirror.', algorithm: "l' U' L U' L' U2 l" },
          { id: 'oll_09', group: 'Fish', title: 'OLL 9 (Kite)', explanation: 'Fish shape with kite orientation.', algorithm: "R U R' U' R' F R F'" },
          { id: 'oll_10', group: 'Fish', title: 'OLL 10 (Kite Variant)', explanation: 'Fish shape kite variant.', algorithm: "R U R' U R' F R F' R U2 R'" },
          { id: 'oll_11', group: 'Thunder', title: 'OLL 11 (Downstairs)', explanation: 'Thunderbolt shape downstairs.', algorithm: "r U R' U R U' R' U' r'" },
          { id: 'oll_12', group: 'Thunder', title: 'OLL 12 (Upstairs)', explanation: 'Thunderbolt shape upstairs.', algorithm: "F R U R' U' F' U F R U R' U' F'" },
          { id: 'oll_13', group: 'Knight', title: 'OLL 13 (Knight Move)', explanation: 'Knight move pattern.', algorithm: "F U R U' R2 F' R U R U' R'" },
          { id: 'oll_14', group: 'Knight', title: 'OLL 14 (Knight Move Mirror)', explanation: 'Knight move mirror pattern.', algorithm: "R U R' U R U' R' U' R' F R F'" },
          { id: 'oll_15', group: 'Knight', title: 'OLL 15 (Knight Move Left)', explanation: 'Left knight move pattern.', algorithm: "l' U' l L' U' L U l' U l" },
          { id: 'oll_16', group: 'Knight', title: 'OLL 16 (Knight Move Right)', explanation: 'Right knight move pattern.', algorithm: "r U r' R U R' U' r U' r'" },
          { id: 'oll_18', group: 'Dot', title: 'OLL 18 (Crown)', explanation: 'Crown pattern on dot case.', algorithm: "r U R' U R U2 r2 U' R U' R' U2 r" },
          { id: 'oll_19', group: 'Dot', title: 'OLL 19 (Mummy)', explanation: 'Mummy pattern on dot case.', algorithm: "r' R2 U R' U r U2 r' U M'" },
          { id: 'oll_20', group: 'Dot', title: 'OLL 20 (Checkered)', explanation: 'Checkered pattern on dot case.', algorithm: "M U R U R' U' M2 U R U' r'" },
          { id: 'oll_21', group: 'Cross', title: 'OLL 21 (H / Double Headlight)', explanation: 'Cross case with 4 unoriented corners.', algorithm: "F R U R' U' R U R' U' R U R' F'" },
          { id: 'oll_22', group: 'Cross', title: 'OLL 22 (Pi / Wheel)', explanation: 'Cross case with Pi corner configuration.', algorithm: "R U2 R2 U' R2 U' R2 U2 R" },
          { id: 'oll_23', group: 'Cross', title: 'OLL 23 (Headlights)', explanation: 'Cross case with front headlights.', algorithm: "R2 D R' U2 R D' R' U2 R'" },
          { id: 'oll_24', group: 'Cross', title: 'OLL 24 (Chameleon)', explanation: 'Cross case with chameleon side stickers.', algorithm: "r U R' U' r' F R F'" },
          { id: 'oll_25', group: 'Cross', title: 'OLL 25 (Bowtie)', explanation: 'Cross case with diagonal corners oriented.', algorithm: "F' r U R' U' r' F R" },
          { id: 'oll_26', group: 'Cross', title: 'OLL 26 (Anti-Sune)', explanation: 'Cross case anti-sune pattern.', algorithm: "R U2 R' U' R U' R'" },
          { id: 'oll_27', group: 'Cross', title: 'OLL 27 (Sune)', explanation: 'Standard Sune orientation.', algorithm: "R U R' U R U2 R'" },
          { id: 'oll_28', group: 'Corners Orient', title: 'OLL 28 (Stealth)', explanation: 'Corners oriented, edges flipped.', algorithm: "r U R' U' M U R U' R'" },
          { id: 'oll_31', group: 'P-Shape', title: 'OLL 31 (Couch)', explanation: 'P-shape couch case.', algorithm: "R' U' F U R U' R' F' R" },
          { id: 'oll_32', group: 'P-Shape', title: 'OLL 32 (Anti-Couch)', explanation: 'P-shape anti-couch mirror.', algorithm: "L U F' U' L' U L F L'" },
          { id: 'oll_33', group: 'T-Shape', title: 'OLL 33 (T1)', explanation: 'T-shape first variant.', algorithm: "R U R' U' R' F R F'" },
          { id: 'oll_34', group: 'T-Shape', title: 'OLL 34 (T2)', explanation: 'T-shape second variant.', algorithm: "R U R2 U' R' F R U R U' F'" },
          { id: 'oll_35', group: 'Fish', title: 'OLL 35 (Fish)', explanation: 'Standard fish case.', algorithm: "R U2 R2 F R F' R U2 R'" },
          { id: 'oll_37', group: 'Fish', title: 'OLL 37 (Mounted Fish)', explanation: 'Mounted fish case.', algorithm: "F R' F' R U R U' R'" },
          { id: 'oll_43', group: 'P-Shape', title: 'OLL 43 (P-Shape Left)', explanation: 'P-shape left orientation.', algorithm: "f' L' U' L U f" },
          { id: 'oll_44', group: 'P-Shape', title: 'OLL 44 (P-Shape Right)', explanation: 'P-shape right orientation.', algorithm: "f R U R' U' f'" },
          { id: 'oll_45', group: 'T-Shape', title: 'OLL 45 (T-Shape Standard)', explanation: 'Classic FURU\'F\' T-shape.', algorithm: "F R U R' U' F'" },
          { id: 'oll_46', group: 'C-Shape', title: 'OLL 46 (C-Shape)', explanation: 'C-shape algorithm.', algorithm: "R' U' R' F R F' U R" },
          { id: 'oll_47', group: 'Small L', title: 'OLL 47 (Small L)', explanation: 'Small L case.', algorithm: "F' L' U' L U L' U' L U F" },
          { id: 'oll_48', group: 'Small L', title: 'OLL 48 (Small L Mirror)', explanation: 'Small L mirror case.', algorithm: "F R U R' U' R U R' U' F'" },
          { id: 'oll_51', group: 'I-Shape', title: 'OLL 51 (I-Shape Line)', explanation: 'I-shape line algorithm.', algorithm: "f R U R' U' R U R' U' f'" },
          { id: 'oll_57', group: 'Corners Orient', title: 'OLL 57 (H-Shape)', explanation: 'H-shape edge flip algorithm.', algorithm: "R U R' U' M' U R U' r'" }
        ]
      },
      {
        id: 'cfop-pll-all',
        title: 'PLL: Permutation of Last Layer (21 Cases)',
        description: 'Permute all last layer corners and edges simultaneously.',
        lessons: [
          { id: 'pll_aa', group: 'Corner Swap', title: 'Aa Permutation', explanation: 'Adjacent corner swap.', algorithm: "x R' D2 R U R' D2 R U' R'" },
          { id: 'pll_ab', group: 'Corner Swap', title: 'Ab Permutation', explanation: 'Adjacent corner swap mirror.', algorithm: "x R U' R D2 R' U R D2 R2" },
          { id: 'pll_e', group: 'Corner Swap', title: 'E Permutation', explanation: 'Diagonal corner swap with no edge movement.', algorithm: "x' R U' R' D R U R' D' R U R' D R U' R' D'" },
          { id: 'pll_f', group: 'Adjacent Swap', title: 'F Permutation', explanation: 'Adjacent corner and two edge swap.', algorithm: "R' U' F' R U R' U' R' F R2 U' R' U' R U R' U R" },
          { id: 'pll_ga', group: 'G Perms', title: 'Ga Permutation', explanation: 'First G permutation variant.', algorithm: "R2 U R' U R' U' R U' R2 U' D R' U R D'" },
          { id: 'pll_gb', group: 'G Perms', title: 'Gb Permutation', explanation: 'Second G permutation variant.', algorithm: "R' U' R U D' R2 U R' U R U' R U' R2 D" },
          { id: 'pll_gc', group: 'G Perms', title: 'Gc Permutation', explanation: 'Third G permutation variant.', algorithm: "R2 U' R U' R U R' U R2 U D' R U' R' D" },
          { id: 'pll_gd', group: 'G Perms', title: 'Gd Permutation', explanation: 'Fourth G permutation variant.', algorithm: "R U R' U' D R2 U' R U' R' U R' U R2 D'" },
          { id: 'pll_h', group: 'Edges Only', title: 'H Permutation', explanation: 'Opposite edge swap.', algorithm: "M2 U M2 U2 M2 U M2" },
          { id: 'pll_ja', group: 'Adjacent Swap', title: 'Ja Permutation', explanation: 'L-shape adjacent swap.', algorithm: "x R2 F R F' R U2 r' U r U2" },
          { id: 'pll_jb', group: 'Adjacent Swap', title: 'Jb Permutation', explanation: 'Classic J-perm adjacent swap.', algorithm: "R U R' F' R U R' U' R' F R2 U' R'" },
          { id: 'pll_na', group: 'Diagonal Swap', title: 'Na Permutation', explanation: 'Diagonal corner and opposite edge swap.', algorithm: "R U R' U R U R' F' R U R' U' R' F R2 U' R' U2 R U' R'" },
          { id: 'pll_nb', group: 'Diagonal Swap', title: 'Nb Permutation', explanation: 'Diagonal corner and opposite edge swap mirror.', algorithm: "R' U R U' R' F' U' F R U R' F R' F' R U' R" },
          { id: 'pll_ra', group: 'Adjacent Swap', title: 'Ra Permutation', explanation: 'R-perm variant A.', algorithm: "R U R' F' R U2 R' U2 R' F R U R U2 R'" },
          { id: 'pll_rb', group: 'Adjacent Swap', title: 'Rb Permutation', explanation: 'R-perm variant B.', algorithm: "R' U2 R U2 R' F R U R' U' R' F' R2" },
          { id: 'pll_t', group: 'Adjacent Swap', title: 'T Permutation', explanation: 'T-perm adjacent swap.', algorithm: "R U R' U' R' F R2 U' R' U' R U R' F'" },
          { id: 'pll_ua', group: 'Edges Only', title: 'Ua Permutation', explanation: 'Clockwise edge cycle.', algorithm: "R U' R U R U R U' R' U' R2" },
          { id: 'pll_ub', group: 'Edges Only', title: 'Ub Permutation', explanation: 'Counter-clockwise edge cycle.', algorithm: "R2 U R U R' U' R' U' R' U R'" },
          { id: 'pll_v', group: 'Diagonal Swap', title: 'V Permutation', explanation: 'Diagonal swap with adjacent edges.', algorithm: "R' U R' U' R D' R' D R' U D' R2 U' R2 D R2" },
          { id: 'pll_y', group: 'Diagonal Swap', title: 'Y Permutation', explanation: 'Diagonal corner swap.', algorithm: "F R U' R' U' R U R' F' R U R' U' R' F R F'" },
          { id: 'pll_z', group: 'Edges Only', title: 'Z Permutation', explanation: 'Adjacent edge swap.', algorithm: "M' U M2 U M2 U M' U2 M2" }
        ]
      },
      {
        id: 'cfop-walkthrough',
        title: 'Full CFOP Master Example Solve',
        description: 'Complete Fridrich solve walkthrough from scramble to full solution.',
        lessons: [
          {
            id: 'cfop_master_solve',
            title: 'Full CFOP Master Walkthrough',
            explanation: 'Cross, 4 F2L pairs, OLL, and PLL executed with 100% precision.',
            algorithm: CFOP_EXAMPLE_SOLVE.phases.map(p => p.moves).join(' '),
            exampleSolve: CFOP_EXAMPLE_SOLVE
          }
        ]
      }
    ]
  },

  // ==========================================
  // COURSE 4: ROUX METHOD
  // ==========================================
  {
    id: 'roux',
    title: 'Roux Method',
    badge: 'Pro',
    description: 'Blockbuilding, CMLL, and M-slice mastery for hyper-efficient solves.',
    progress: 0,
    isAlgorithmic: true,
    exampleSolve: ROUX_EXAMPLE_SOLVE,
    modules: [
      {
        id: 'roux-blocks',
        title: 'First & Second Blocks (FB & SB)',
        description: 'Build 1x2x3 blocks on left and right without disturbing opposite sides.',
        lessons: [
          { id: 'r_fb_setup', title: 'First Block (FB) Setup', explanation: 'Build the 1x2x3 block on the left side of the cube.', algorithm: "L U L' U L U2 L'" },
          { id: 'r_sb_setup', title: 'Second Block (SB) Setup', explanation: 'Build the second 1x2x3 block on the right side using M and R moves.', algorithm: "R U' R' U' R U2 R'" }
        ]
      },
      {
        id: 'roux-cmll',
        title: 'CMLL (Corners of Last Layer - 42 Cases)',
        description: 'Orient and permute top corners across all 8 sets (O, U, T, L, S, AS, Pi, H).',
        lessons: [
          { id: 'cmll_o_adj', group: 'O Set', title: 'CMLL O - Adjacent Swap', explanation: 'Adjacent corner swap on oriented corners.', algorithm: "R U R' F' R U R' U' R' F R2 U' R'" },
          { id: 'cmll_o_diag', group: 'O Set', title: 'CMLL O - Diagonal Swap', explanation: 'Diagonal corner swap on oriented corners.', algorithm: "r U R' U' r' F R F'" },
          { id: 'cmll_u_forward', group: 'U Set', title: 'CMLL U - Forward Bar', explanation: 'U headlights with forward bar.', algorithm: "R2 D' R U2 R' D R U2 R" },
          { id: 'cmll_u_back', group: 'U Set', title: 'CMLL U - Back Bar', explanation: 'U headlights with back bar.', algorithm: "R2 D R' U2 R D' R' U2 R'" },
          { id: 'cmll_t_left_bar', group: 'T Set', title: 'CMLL T - Left Bar', explanation: 'T chameleon with left bar.', algorithm: "r U R' U' r' F R F'" },
          { id: 'cmll_t_right_bar', group: 'T Set', title: 'CMLL T - Right Bar', explanation: 'T chameleon with right bar.', algorithm: "R' U' R U R' F' R U R' U' R' F R" },
          { id: 'cmll_l_mirror', group: 'L Set', title: 'CMLL L - Mirror', explanation: 'Bowtie mirror case.', algorithm: "F' r U R' U' r' F R" },
          { id: 'cmll_l_pure', group: 'L Set', title: 'CMLL L - Pure', explanation: 'Bowtie pure case.', algorithm: "R U2 R' U' R U R' U' R U' R'" },
          { id: 'cmll_s_left_bar', group: 'S Set', title: 'CMLL Sune - Left Bar', explanation: 'Sune with left bar.', algorithm: "R U R' U R U2 R'" },
          { id: 'cmll_as_right_bar', group: 'AS Set', title: 'CMLL Anti-Sune - Right Bar', explanation: 'Anti-Sune with right bar.', algorithm: "R U2 R' U' R U' R'" },
          { id: 'cmll_pi_right_bar', group: 'Pi Set', title: 'CMLL Pi - Right Bar', explanation: 'Pi wheel with right bar.', algorithm: "R U2 R2 U' R2 U' R2 U2 R" },
          { id: 'cmll_h_column', group: 'H Set', title: 'CMLL H - Column', explanation: 'Double headlights with column orientation.', algorithm: "F R U R' U' R U R' U' R U R' F'" }
        ]
      },
      {
        id: 'roux-lse',
        title: 'LSE (Last Six Edges)',
        description: 'Solve the remaining 6 edges using M and U slice moves in 3 sub-steps (EO, UL/UR, EP).',
        lessons: [
          { id: 'r_lse_4a', title: '4a. Edge Orientation (EO)', explanation: 'Orient all 6 remaining edges so white/yellow faces up or down.', algorithm: "M' U M'" },
          { id: 'r_lse_4b', title: '4b. UL & UR Placement', explanation: 'Place the Upper-Left (UL) and Upper-Right (UR) edges into correct positions.', algorithm: "M2 U2 M2" },
          { id: 'r_lse_4c', title: '4c. Edge Permutation (EP)', explanation: 'Permute the remaining 4 M-slice edges to fully solve the cube.', algorithm: "M2 U2 M2 U2" }
        ]
      },
      {
        id: 'roux-walkthrough',
        title: 'Roux Example Solve Walkthrough',
        description: 'Step-by-step Roux solve from scramble to complete resolution.',
        lessons: [
          {
            id: 'roux_master_solve',
            title: 'Roux Method Master Walkthrough',
            explanation: 'First Block, Second Block, CMLL, and M-slice LSE demonstrated on a 3D cube.',
            algorithm: ROUX_EXAMPLE_SOLVE.phases.map(p => p.moves).join(' '),
            exampleSolve: ROUX_EXAMPLE_SOLVE
          }
        ]
      }
    ]
  },

  // ==========================================
  // COURSE 5: ZZ METHOD
  // ==========================================
  {
    id: 'zz',
    title: 'ZZ Method',
    badge: 'Expert',
    description: 'Rotationless solving via Edge Orientation Line (EOLine) followed by F2L blockbuilding.',
    progress: 0,
    isAlgorithmic: true,
    exampleSolve: ZZ_EXAMPLE_SOLVE,
    modules: [
      {
        id: 'zz-eoline',
        title: 'EOLine Setup',
        description: 'Orient all 12 edges and place DF and DB line edges for rotationless solving.',
        lessons: [
          { id: 'z_eoline_setup', title: 'EO + Line Placement', explanation: 'Flip bad edges using F/B moves and position DF/DB line edges.', algorithm: "F' L' D2 B' D' R2 D" }
        ]
      },
      {
        id: 'zz-f2l',
        title: 'ZZF2L Block Building',
        description: 'Build left and right 1x2x3 blocks using only R, U, and L moves without rotations.',
        lessons: [
          { id: 'z_f2l_left', title: 'Left Block Insertion', explanation: 'Pair and insert corner-edge pairs into left slots rotation-free.', algorithm: "L U L' U2 L U' L'" },
          { id: 'z_f2l_right', title: 'Right Block Insertion', explanation: 'Pair and insert corner-edge pairs into right slots rotation-free.', algorithm: "R U R' U R U2 R'" }
        ]
      },
      {
        id: 'zz-coll',
        title: 'COLL (Corners of Last Layer)',
        description: 'Solves corner orientation and permutation simultaneously because all edges are already oriented.',
        lessons: [
          { id: 'coll_sune_1', group: 'Sune', title: 'COLL Sune - Anti-Pure', explanation: 'Sune corner solve preserving yellow cross.', algorithm: "R U R' U R U2 R'" },
          { id: 'coll_antisune_1', group: 'Anti-Sune', title: 'COLL Anti-Sune - Pure', explanation: 'Anti-Sune corner solve preserving yellow cross.', algorithm: "R U2 R' U' R U' R'" },
          { id: 'coll_h_1', group: 'H Set', title: 'COLL H - Columns', explanation: 'Double headlights corner solve.', algorithm: "R U2 R' U' R U R' U' R U' R'" },
          { id: 'coll_pi_1', group: 'Pi Set', title: 'COLL Pi - Pure', explanation: 'Pi wheel corner solve.', algorithm: "F R U R' U' R U R' U' F'" },
          { id: 'coll_u_1', group: 'U Set', title: 'COLL U - Forward Bar', explanation: 'U headlights corner solve.', algorithm: "R2 D' R U2 R' D R U2 R" },
          { id: 'coll_t_1', group: 'T Set', title: 'COLL T - Rows', explanation: 'T chameleon corner solve.', algorithm: "r U R' U' r' F R F'" },
          { id: 'coll_l_1', group: 'L Set', title: 'COLL L - Pure', explanation: 'Bowtie corner solve.', algorithm: "F' r U R' U' r' F R" }
        ]
      },
      {
        id: 'zz-epll',
        title: 'EPLL (Edge Permutation of Last Layer)',
        description: 'Permute remaining 4 edges to complete the solve.',
        lessons: [
          { id: 'z_epll_ua', title: 'EPLL Ua Perm', explanation: 'Clockwise edge cycle.', algorithm: "R U' R U R U R U' R' U' R2" },
          { id: 'z_epll_ub', title: 'EPLL Ub Perm', explanation: 'Counter-clockwise edge cycle.', algorithm: "R2 U R U R' U' R' U' R' U R'" },
          { id: 'z_epll_h', title: 'EPLL H Perm', explanation: 'Opposite edge swap.', algorithm: "M2 U M2 U2 M2 U M2" },
          { id: 'z_epll_z', title: 'EPLL Z Perm', explanation: 'Adjacent edge swap.', algorithm: "M' U M2 U M2 U M' U2 M2" }
        ]
      },
      {
        id: 'zz-walkthrough',
        title: 'ZZ Method Master Example Solve',
        description: 'Complete rotationless solve walkthrough from scramble to finished cube.',
        lessons: [
          {
            id: 'zz_master_solve',
            title: 'ZZ Method Master Walkthrough',
            explanation: 'EOLine, ZZF2L, COLL, and EPLL demonstrated on the 3D cube engine.',
            algorithm: ZZ_EXAMPLE_SOLVE.phases.map(p => p.moves).join(' '),
            exampleSolve: ZZ_EXAMPLE_SOLVE
          }
        ]
      }
    ]
  }
];