export interface Lesson {
  id: string;
  title: string;
  explanation: string;
  algorithm: string;
  difficulty?: 'Beginner' | 'Intermediate' | 'Advanced' | 'Pro' | 'Expert';
  estimatedTime?: string;
  fingerTrickTips?: string;
  setup?: string;
  group?: string;
  isExampleSolve?: boolean;
  exampleSolveData?: {
    scramble: string;
    phases: { name: string; moves: string; description: string }[];
  };
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
  modules: Module[];
}

// -------------------------------------------------------------
// 1. BEGINNER METHOD (7 Steps + Full Walkthrough Example Solve)
// -------------------------------------------------------------
const BEGINNER_MODULES: Module[] = [
  {
    id: 'step-1-cross',
    title: 'Step 1: White Cross (Daisy Method)',
    description: 'Form a white cross on the bottom layer while aligning the adjacent edge colors with matching center pieces.',
    lessons: [
      {
        id: 'beg_cross_daisy',
        title: 'Forming the Daisy & Dropping Cross',
        explanation: 'Position white edge pieces around the yellow center to create a daisy flower pattern. Rotate side centers until edge colors match, then perform a 180° turn (F2) to drop each white edge down to form the white cross.',
        algorithm: 'F2 R2 L2 B2',
        difficulty: 'Beginner',
        estimatedTime: '4 min',
        fingerTrickTips: 'Use double wrist rotations (F2/R2) to drop aligned edges cleanly to the white base.'
      }
    ]
  },
  {
    id: 'step-2-corners',
    title: 'Step 2: First Layer Corners',
    description: 'Position white corner pieces between matching color centers in the top layer and insert them into the bottom layer.',
    lessons: [
      {
        id: 'beg_corner_sexy',
        title: 'Right Trigger / Sexy Move Insertion',
        explanation: 'Hold the target corner directly above its intended bottom slot on the front-right. Execute the 4-move right trigger (R U R\' U\') 1, 3, or 5 times until the white corner is properly oriented and slotted into the first layer.',
        algorithm: "R U R' U'",
        difficulty: 'Beginner',
        estimatedTime: '4 min',
        fingerTrickTips: 'Flick U with your right index finger and pull U\' with your left index finger.'
      }
    ]
  },
  {
    id: 'step-3-second-layer',
    title: 'Step 3: Second Layer (Middle Layer Edges)',
    description: 'Insert edge pieces without yellow from the top layer into middle layer slots without disturbing the completed first layer.',
    lessons: [
      {
        id: 'beg_edge_right',
        title: 'Right Edge Insertion',
        explanation: 'Move top-front edge to Front-Right slot by sending it away from the target, lifting the slot, pairing, and inserting with front rotation.',
        algorithm: "U R U' R' U' F' U F",
        difficulty: 'Beginner',
        estimatedTime: '5 min',
        fingerTrickTips: 'Execute U R U\' R\' in one stroke, then push F\' with your right thumb to finish.'
      },
      {
        id: 'beg_edge_left',
        title: 'Left Edge Insertion',
        explanation: 'Move top-front edge to Front-Left slot with mirror trigger moves.',
        algorithm: "U' L' U L U F U' F'",
        difficulty: 'Beginner',
        estimatedTime: '5 min',
        fingerTrickTips: 'Mirror of the right insertion using left index and thumb.'
      }
    ]
  },
  {
    id: 'step-4-yellow-cross',
    title: 'Step 4: Yellow Cross (OLL Step 1)',
    description: 'Form a yellow cross on the top layer without disturbing the bottom two solved layers.',
    lessons: [
      {
        id: 'beg_yellow_cross',
        title: "FURU'F' (Fur-U-Ruf)",
        explanation: "Apply once for horizontal line case, twice for 'L' shape, or three times for a center dot.",
        algorithm: "F R U R' U' F'",
        difficulty: 'Beginner',
        estimatedTime: '5 min',
        fingerTrickTips: 'Keep your right thumb on the front-bottom right corner to pivot F effortlessly.'
      }
    ]
  },
  {
    id: 'step-5-permute-edges',
    title: 'Step 5: Permute Yellow Edges',
    description: 'Align the top edge piece colors with their corresponding side center colors.',
    lessons: [
      {
        id: 'beg_sune_edges',
        title: 'Sune Edge Permutation',
        explanation: 'Swaps the front and left yellow edges so all top edges match side center colors.',
        algorithm: "R U R' U R U2 R'",
        difficulty: 'Beginner',
        estimatedTime: '6 min',
        fingerTrickTips: 'Double flick U2 using your right index followed immediately by your right middle finger.'
      }
    ]
  },
  {
    id: 'step-6-permute-corners',
    title: 'Step 6: Position Yellow Corners (Permute Corners)',
    description: 'Move all yellow corner pieces to their correct physical positions (regardless of rotation).',
    lessons: [
      {
        id: 'beg_niklas_corners',
        title: 'Niklas Corner Cycle',
        explanation: 'Hold the correctly placed corner on the Front-Right-Top and cycle the remaining 3 corners.',
        algorithm: "U R U' L' U R' U' L",
        difficulty: 'Beginner',
        estimatedTime: '6 min',
        fingerTrickTips: 'Alternate right and left hand triggers cleanly without rotating the entire cube.'
      }
    ]
  },
  {
    id: 'step-7-orient-corners',
    title: 'Step 7: Orient Yellow Corners',
    description: 'Rotate the last layer corners until the yellow faces are facing upwards.',
    lessons: [
      {
        id: 'beg_orient_corners',
        title: 'Reverse Sexy Move Corner Orient',
        explanation: 'Hold unoriented corner in Front-Right-Top spot and repeat until yellow faces UP, then turn top layer (U) to load next unsolved corner.',
        algorithm: "R' D' R D R' D' R D",
        difficulty: 'Beginner',
        estimatedTime: '7 min',
        fingerTrickTips: 'Do not forget the final D move! Turn only the U face to bring the next corner to the bottom-right.'
      }
    ]
  },
  {
    id: 'beg-example-solve',
    title: 'Step 8: Full Walkthrough Example Solve',
    description: 'Interactive complete solve walkthrough applying the Beginner Layer-by-Layer method from scramble to solved cube.',
    lessons: [
      {
        id: 'beg_solve_walkthrough',
        title: 'Beginner Full Solve Walkthrough',
        explanation: 'Watch each step execute seamlessly on the 3D cube. Step through the white cross, corners, edges, yellow cross, edge permutation, and corner orientation.',
        algorithm: "D' R F' R2 D2 U R U' R' U2 R U R' U R U' R' U' F' U F U' L' U L U F U' F' F R U R' U' F' R U R' U R U2 R' U R U' L' U R' U' L R' D' R D R' D' R D U R' D' R D R' D' R D U",
        difficulty: 'Beginner',
        estimatedTime: '10 min',
        isExampleSolve: true,
        exampleSolveData: {
          scramble: "D2 R2 F2 U' L2 U B2 D F2 L2 U' R B' L' D2 F U B F2 R",
          phases: [
            { name: 'White Cross', moves: "D' R F' R2 D2", description: 'Align white edges around yellow center and drop down to create bottom cross.' },
            { name: 'First Layer Corners', moves: "U R U' R' U2 R U R'", description: 'Insert white corners using sexy moves into the bottom layer.' },
            { name: 'Second Layer Edges', moves: "U R U' R' U' F' U F U' L' U L U F U' F'", description: 'Insert non-yellow edges into the middle layer slots.' },
            { name: 'Yellow Cross (EO)', moves: "F R U R' U' F'", description: 'Orient yellow edges with FURU\'F\'.' },
            { name: 'Permute Edges', moves: "R U R' U R U2 R'", description: 'Align yellow edge colors with matching side centers.' },
            { name: 'Position Corners', moves: "U R U' L' U R' U' L", description: 'Cycle remaining yellow corners into their correct positions.' },
            { name: 'Orient Corners', moves: "R' D' R D R' D' R D U R' D' R D R' D' R D U", description: 'Flip yellow corners facing up to solve the cube.' }
          ]
        }
      }
    ]
  }
];

// -------------------------------------------------------------
// 2. SIMPLIFIED CFOP (2-Look OLL + 2-Look PLL + Example Solve)
// -------------------------------------------------------------
const SIMPLIFIED_CFOP_MODULES: Module[] = [
  {
    id: 'sc-cross-f2l',
    title: 'Module 1: Intuitive Cross & F2L',
    description: 'Solve the bottom white cross and pair corners with edges for simultaneous insertion.',
    lessons: [
      {
        id: 'sc_cross_basics',
        title: 'Bottom Cross Alignment',
        explanation: 'Plan the 4 cross edges directly on the white bottom layer in under 8 moves.',
        algorithm: "D R' F R D2",
        difficulty: 'Intermediate',
        estimatedTime: '4 min'
      },
      {
        id: 'sc_f2l_insert_right',
        title: 'Basic F2L Right Insertion',
        explanation: 'Corner and edge are already paired in top layer; target slot is Front-Right.',
        algorithm: "U R U' R'",
        difficulty: 'Intermediate',
        estimatedTime: '4 min'
      },
      {
        id: 'sc_f2l_insert_left',
        title: 'Basic F2L Left Insertion',
        explanation: 'Corner and edge are already paired in top layer; target slot is Front-Left.',
        algorithm: "U' L' U L",
        difficulty: 'Intermediate',
        estimatedTime: '4 min'
      }
    ]
  },
  {
    id: 'sc-2look-oll',
    title: 'Module 2: 2-Look OLL (EO + 7 CO Cases)',
    description: 'Orient the last layer in two simple steps: 3 Edge Orientation cases followed by 7 Corner Orientation cases.',
    lessons: [
      {
        id: 'sc_oll_eo_dot',
        title: 'OLL EO: Dot Case',
        explanation: 'No top edges oriented. Execute Line algorithm, then L-shape algorithm.',
        algorithm: "F R U R' U' F' U2 F U R U' R' F'",
        difficulty: 'Intermediate',
        estimatedTime: '5 min'
      },
      {
        id: 'sc_oll_eo_l_shape',
        title: 'OLL EO: L-Shape Case',
        explanation: 'Two adjacent top edges oriented forming an L shape.',
        algorithm: "f R U R' U' f'",
        difficulty: 'Intermediate',
        estimatedTime: '4 min'
      },
      {
        id: 'sc_oll_eo_line',
        title: 'OLL EO: Bar / Line Case',
        explanation: 'Two opposite top edges oriented forming a straight line.',
        algorithm: "F R U R' U' F'",
        difficulty: 'Intermediate',
        estimatedTime: '4 min'
      },
      {
        id: 'sc_oll_sune',
        title: 'OLL 27: Sune',
        explanation: '1 corner oriented; top-left front corner sticker faces front.',
        algorithm: "R U R' U R U2 R'",
        difficulty: 'Intermediate',
        estimatedTime: '5 min'
      },
      {
        id: 'sc_oll_antisune',
        title: 'OLL 26: Anti-Sune',
        explanation: '1 corner oriented; top-right front corner sticker faces right.',
        algorithm: "R U2 R' U' R U' R'",
        difficulty: 'Intermediate',
        estimatedTime: '5 min'
      },
      {
        id: 'sc_oll_h',
        title: 'OLL 21: H (Double Headlights)',
        explanation: '0 corners oriented; two pairs of headlights facing front and back.',
        algorithm: "F R U R' U' R U R' U' R U R' F'",
        difficulty: 'Intermediate',
        estimatedTime: '5 min'
      },
      {
        id: 'sc_oll_pi',
        title: 'OLL 22: Pi (Wheel)',
        explanation: '0 corners oriented; one pair of headlights on left, two corners pointing away on right.',
        algorithm: "R U2 R2 U' R2 U' R2 U2 R",
        difficulty: 'Intermediate',
        estimatedTime: '5 min'
      },
      {
        id: 'sc_oll_headlights',
        title: 'OLL 23: Headlights (U)',
        explanation: '2 corners oriented; remaining two stickers face front.',
        algorithm: "R2 D R' U2 R D' R' U2 R'",
        difficulty: 'Intermediate',
        estimatedTime: '5 min'
      },
      {
        id: 'sc_oll_chameleon',
        title: 'OLL 24: Chameleon (T)',
        explanation: '2 corners oriented; remaining stickers face left and right.',
        algorithm: "r U R' U' r' F R F'",
        difficulty: 'Intermediate',
        estimatedTime: '5 min'
      },
      {
        id: 'sc_oll_bowtie',
        title: 'OLL 25: Bowtie (L)',
        explanation: '2 diagonal corners oriented.',
        algorithm: "F' r U R' U' r' F R",
        difficulty: 'Intermediate',
        estimatedTime: '5 min'
      }
    ]
  },
  {
    id: 'sc-2look-pll',
    title: 'Module 3: 2-Look PLL (CP + EP Cases)',
    description: 'Permute corners then permute edges to complete the solve.',
    lessons: [
      {
        id: 'sc_pll_t_perm',
        title: 'PLL CP: T Perm (Headlights Case)',
        explanation: 'One side has two matching corners (headlights). Put headlights on Left.',
        algorithm: "R U R' U' R' F R2 U' R' U' R U R' F'",
        difficulty: 'Intermediate',
        estimatedTime: '6 min'
      },
      {
        id: 'sc_pll_y_perm',
        title: 'PLL CP: Y Perm (Diagonal Swap)',
        explanation: 'No sides have matching corners. Swaps diagonal corners.',
        algorithm: "F R U' R' U' R U R' F' R U R' U' R' F R F'",
        difficulty: 'Intermediate',
        estimatedTime: '7 min'
      },
      {
        id: 'sc_pll_ua_perm',
        title: 'PLL EP: Ua Perm (Clockwise Cycle)',
        explanation: '1 solved edge bar; remaining 3 edges cycle clockwise.',
        algorithm: "R U' R U R U R U' R' U' R2",
        difficulty: 'Intermediate',
        estimatedTime: '5 min'
      },
      {
        id: 'sc_pll_ub_perm',
        title: 'PLL EP: Ub Perm (Counter-Clockwise Cycle)',
        explanation: '1 solved edge bar; remaining 3 edges cycle counter-clockwise.',
        algorithm: "R2 U R U R' U' R' U' R' U R'",
        difficulty: 'Intermediate',
        estimatedTime: '5 min'
      },
      {
        id: 'sc_pll_h_perm',
        title: 'PLL EP: H Perm (Opposite Edge Swaps)',
        explanation: 'Swaps opposite edge pairs forming an X/H pattern across all sides.',
        algorithm: "M2 U M2 U2 M2 U M2",
        difficulty: 'Intermediate',
        estimatedTime: '5 min'
      },
      {
        id: 'sc_pll_z_perm',
        title: 'PLL EP: Z Perm (Adjacent Edge Swaps)',
        explanation: 'Swaps adjacent edge pairs diagonally.',
        algorithm: "M' U M2 U M2 U M' U2 M2",
        difficulty: 'Intermediate',
        estimatedTime: '6 min'
      }
    ]
  },
  {
    id: 'sc-example-solve',
    title: 'Module 4: Full Walkthrough Example Solve',
    description: 'Complete walkthrough solve applying 4-Look Last Layer (Simplified CFOP).',
    lessons: [
      {
        id: 'sc_solve_walkthrough',
        title: 'Simplified CFOP Full Solve Walkthrough',
        explanation: 'Watch Cross, F2L slots, 2-Look OLL (EO + Sune), and 2-Look PLL (T-Perm + Ub-Perm) execute in sequence on the 3D cube.',
        algorithm: "D R' F R D2 U R U' R' U2 L' U' L U' R U2 R' U R U' R' F R U R' U' F' U R U R' U R U2 R' U R U R' U' R' F R2 U' R' U' R U R' F' U R2 U R U R' U' R' U' R' U R'",
        difficulty: 'Intermediate',
        estimatedTime: '10 min',
        isExampleSolve: true,
        exampleSolveData: {
          scramble: "R2 U' R2 D B2 D2 F2 L2 D' R2 U' B R' F' D' L B' U L2 F2",
          phases: [
            { name: 'Cross', moves: "D R' F R D2", description: 'Solve bottom 4 cross edges.' },
            { name: 'F2L Pairs', moves: "U R U' R' U2 L' U' L U' R U2 R' U R U' R'", description: 'Pair and insert all four corner-edge pairs.' },
            { name: 'OLL (2-Look)', moves: "F R U R' U' F' U R U R' U R U2 R'", description: 'EO Line alg + Sune Corner Orientation.' },
            { name: 'PLL (2-Look)', moves: "U R U R' U' R' F R2 U' R' U' R U R' F' U R2 U R U R' U' R' U' R' U R'", description: 'T-Perm Corner Swap followed by Ub-Perm Edge Cycle.' }
          ]
        }
      }
    ]
  }
];

// -------------------------------------------------------------
// 3. FULL CFOP MASTERY (All 57 OLL + All 21 PLL + Example Solve)
// -------------------------------------------------------------
const OLL_ALGS = [
  { id: 'oll_01', group: 'Dot', name: 'Runway', algorithm: "R U2 R2 F R F' U2 R' F R F'" },
  { id: 'oll_02', group: 'Dot', name: 'Zamboni', algorithm: "F R U R' U' F' f R U R' U' f'" },
  { id: 'oll_03', group: 'Dot', name: 'Anti-Backslash', algorithm: "f R U R' U' f' U' F R U R' U' F'" },
  { id: 'oll_04', group: 'Dot', name: 'Backslash', algorithm: "f R U R' U' f' U F R U R' U' F'" },
  { id: 'oll_05', group: 'Square', name: 'Right Square', algorithm: "r' U2 R U R' U r" },
  { id: 'oll_06', group: 'Square', name: 'Left Square', algorithm: "r U2 R' U' R U' r'" },
  { id: 'oll_07', group: 'Lightning', name: 'Small Lightning', algorithm: "r U R' U R U2 r'" },
  { id: 'oll_08', group: 'Lightning', name: 'Small Lightning Left', algorithm: "l' U' L U' L' U2 l" },
  { id: 'oll_09', group: 'Fish', name: 'Kite', algorithm: "R U R' U' R' F R F'" },
  { id: 'oll_10', group: 'Fish', name: 'Kite Variation', algorithm: "R U R' U R' F R F' R U2 R'" },
  { id: 'oll_11', group: 'Thunder', name: 'Downstairs', algorithm: "r U R' U R U' R' U' r'" },
  { id: 'oll_12', group: 'Thunder', name: 'Upstairs', algorithm: "F R U R' U' F' U F R U R' U' F'" },
  { id: 'oll_13', group: 'Knight', name: 'Knight Move 1', algorithm: "F U R U' R2 F' R U R U' R'" },
  { id: 'oll_14', group: 'Knight', name: 'Knight Move 2', algorithm: "R U R' U R U' R' U' R' F R F'" },
  { id: 'oll_15', group: 'Knight', name: 'Knight Move Left 1', algorithm: "l' U' l L' U' L U l' U l" },
  { id: 'oll_16', group: 'Knight', name: 'Knight Move Left 2', algorithm: "r U r' R U R' U' r U' r'" },
  { id: 'oll_17', group: 'Dot', name: 'Slash', algorithm: "F R U R' U' R A R' U' F'" },
  { id: 'oll_18', group: 'Dot', name: 'Crown', algorithm: "r U R' U R U2 r2 U' R U' R' U2 r" },
  { id: 'oll_19', group: 'Dot', name: 'Mummy', algorithm: "r' R2 U R' U r U2 r' U M'" },
  { id: 'oll_20', group: 'Dot', name: 'Checkered', algorithm: "M U R U R' U' M2 U R U' r'" },
  { id: 'oll_21', group: 'Cross', name: 'H / Double Headlight', algorithm: "F R U R' U' R U R' U' R U R' F'" },
  { id: 'oll_22', group: 'Cross', name: 'Pi / Wheel', algorithm: "R U2 R2 U' R2 U' R2 U2 R" },
  { id: 'oll_23', group: 'Cross', name: 'Headlights', algorithm: "R2 D R' U2 R D' R' U2 R'" },
  { id: 'oll_24', group: 'Cross', name: 'Chameleon', algorithm: "r U R' U' r' F R F'" },
  { id: 'oll_25', group: 'Cross', name: 'Bowtie', algorithm: "F' r U R' U' r' F R" },
  { id: 'oll_26', group: 'Cross', name: 'Anti-Sune', algorithm: "R U2 R' U' R U' R'" },
  { id: 'oll_27', group: 'Cross', name: 'Sune', algorithm: "R U R' U R U2 R'" },
  { id: 'oll_28', group: 'Corners Orient', name: 'Stealth', algorithm: "r U R' U' M U R U' R'" },
  { id: 'oll_29', group: 'Awkward', name: 'Awkward Shape 1', algorithm: "M U R U R' U' R' F R F' M'" },
  { id: 'oll_30', group: 'Awkward', name: 'Awkward Shape 2', algorithm: "F R U R' U2 F' R U R' U' F'" },
  { id: 'oll_31', group: 'P-Shape', name: 'Couch', algorithm: "R' U' F U R U' R' F' R" },
  { id: 'oll_32', group: 'P-Shape', name: 'Anti-Couch', algorithm: "L U F' U' L' U L F L'" },
  { id: 'oll_33', group: 'T-Shape', name: 'T1', algorithm: "R U R' U' R' F R F'" },
  { id: 'oll_34', group: 'T-Shape', name: 'T2', algorithm: "R U R2 U' R' F R U R U' F'" },
  { id: 'oll_35', group: 'Fish', name: 'Fish 1', algorithm: "R U2 R2 F R F' R U2 R'" },
  { id: 'oll_36', group: 'Fish', name: 'Mounted Fish', algorithm: "L' U' L U' L' U L U L F' L' F" },
  { id: 'oll_37', group: 'Fish', name: 'Fish 2', algorithm: "F R' F' R U R U' R'" },
  { id: 'oll_38', group: 'Fish', name: 'Fish 3', algorithm: "R U B' U' R' U R B R'" },
  { id: 'oll_39', group: 'Lightning', name: 'Big Lightning 1', algorithm: "L F' L' U' L U F U' L'" },
  { id: 'oll_40', group: 'Lightning', name: 'Big Lightning 2', algorithm: "R' F R U R' U' F' U R" },
  { id: 'oll_41', group: 'Awkward', name: 'Awkward Shape 3', algorithm: "R U R' U R U2 R' F R U R' U' F'" },
  { id: 'oll_42', group: 'Awkward', name: 'Awkward Shape 4', algorithm: "R' U' R U' R' U2 R F R U R' U' F'" },
  { id: 'oll_43', group: 'P-Shape', name: 'P-Shape 1', algorithm: "f' L' U' L U f" },
  { id: 'oll_44', group: 'P-Shape', name: 'P-Shape 2', algorithm: "f R U R' U' f'" },
  { id: 'oll_45', group: 'T-Shape', name: 'T-Shape 1', algorithm: "F R U R' U' F'" },
  { id: 'oll_46', group: 'C-Shape', name: 'C-Shape', algorithm: "R' U' R' F R F' U R" },
  { id: 'oll_47', group: 'Small L', name: 'Small L 1', algorithm: "F' L' U' L U L' U' L U F" },
  { id: 'oll_48', group: 'Small L', name: 'Small L 2', algorithm: "F R U R' U' R U R' U' F'" },
  { id: 'oll_49', group: 'Small L', name: 'Small L 3', algorithm: "r U' r2 U r2 U r2 U' r" },
  { id: 'oll_50', group: 'Small L', name: 'Small L 4', algorithm: "r' U r2 U' r2 U' r2 U r'" },
  { id: 'oll_51', group: 'I-Shape', name: 'I-Shape 1', algorithm: "f R U R' U' R U R' U' f'" },
  { id: 'oll_52', group: 'I-Shape', name: 'I-Shape 2', algorithm: "R U R' U R U' B U' B' R'" },
  { id: 'oll_53', group: 'I-Shape', name: 'I-Shape 3', algorithm: "r' U' r R' U' R U r' U r" },
  { id: 'oll_54', group: 'I-Shape', name: 'I-Shape 4', algorithm: "r U r' R U R' U' r U' r'" },
  { id: 'oll_55', group: 'I-Shape', name: 'I-Shape 5', algorithm: "R' F R U R U' R2 F' R2 U' R' U R U R'" },
  { id: 'oll_56', group: 'I-Shape', name: 'I-Shape 6', algorithm: "r U R' U R U2 r' r' U' R U' R' U2 r" },
  { id: 'oll_57', group: 'Corners Orient', name: 'H-Shape Stealth', algorithm: "R U R' U' M' U R U' r'" }
];

const PLL_ALGS = [
  { id: 'pll_aa', name: 'Aa Perm', group: 'Corner Swap', algorithm: "x R' D2 R U R' D2 R U' R'" },
  { id: 'pll_ab', name: 'Ab Perm', group: 'Corner Swap', algorithm: "x R U' R D2 R' U R D2 R2" },
  { id: 'pll_e', name: 'E Perm', group: 'Corner Swap', algorithm: "x' R U' R' D R U R' D' R U R' D R U' R' D'" },
  { id: 'pll_f', name: 'F Perm', group: 'Adjacent Swap', algorithm: "R' U' F' R U R' U' R' F R2 U' R' U' R U R' U R" },
  { id: 'pll_ga', name: 'Ga Perm', group: 'G Perms', algorithm: "R2 U R' U R' U' R U' R2 U' D R' U R D'" },
  { id: 'pll_gb', name: 'Gb Perm', group: 'G Perms', algorithm: "R' U' R U D' R2 U R' U R U' R U' R2 D" },
  { id: 'pll_gc', name: 'Gc Perm', group: 'G Perms', algorithm: "R2 U' R U' R U R' U R2 U D' R U' R' D" },
  { id: 'pll_gd', name: 'Gd Perm', group: 'G Perms', algorithm: "R U R' U' D R2 U' R U' R' U R' U R2 D'" },
  { id: 'pll_h', name: 'H Perm', group: 'Edges Only', algorithm: "M2 U M2 U2 M2 U M2" },
  { id: 'pll_ja', name: 'Ja Perm', group: 'Adjacent Swap', algorithm: "x R2 F R F' R U2 r' U r U2" },
  { id: 'pll_jb', name: 'Jb Perm', group: 'Adjacent Swap', algorithm: "R U R' F' R U R' U' R' F R2 U' R'" },
  { id: 'pll_na', name: 'Na Perm', group: 'Diagonal Swap', algorithm: "R U R' U R U R' F' R U R' U' R' F R2 U' R' U2 R U' R'" },
  { id: 'pll_nb', name: 'Nb Perm', group: 'Diagonal Swap', algorithm: "R' U R U' R' F' U' F R U R' F R' F' R U' R" },
  { id: 'pll_ra', name: 'Ra Perm', group: 'Adjacent Swap', algorithm: "R U R' F' R U2 R' U2 R' F R U R U2 R'" },
  { id: 'pll_rb', name: 'Rb Perm', group: 'Adjacent Swap', algorithm: "R' U2 R U2 R' F R U R' U' R' F' R2" },
  { id: 'pll_t', name: 'T Perm', group: 'Adjacent Swap', algorithm: "R U R' U' R' F R2 U' R' U' R U R' F'" },
  { id: 'pll_ua', name: 'Ua Perm', group: 'Edges Only', algorithm: "R U' R U R U R U' R' U' R2" },
  { id: 'pll_ub', name: 'Ub Perm', group: 'Edges Only', algorithm: "R2 U R U R' U' R' U' R' U R'" },
  { id: 'pll_v', name: 'V Perm', group: 'Diagonal Swap', algorithm: "R' U R' U' R D' R' D R' U D' R2 U' R2 D R2" },
  { id: 'pll_y', name: 'Y Perm', group: 'Diagonal Swap', algorithm: "F R U' R' U' R U R' F' R U R' U' R' F R F'" },
  { id: 'pll_z', name: 'Z Perm', group: 'Edges Only', algorithm: "M' U M2 U M2 U M' U2 M2" }
];

const CFOP_MODULES: Module[] = [
  {
    id: 'cfop-f2l',
    title: 'Phase 1: Advanced F2L Triggers',
    description: 'Essential F2L pairing triggers and slotting techniques for sub-15 second speeds.',
    lessons: [
      {
        id: 'f2l_01',
        title: 'Easy Case Right Slot',
        explanation: 'Basic standard pair insertion in the front-right slot.',
        algorithm: "U R U' R'",
        difficulty: 'Advanced',
        estimatedTime: '4 min'
      },
      {
        id: 'f2l_31',
        title: 'Corner in slot, Edge in U layer',
        explanation: 'Eject corner while simultaneously pairing with top edge.',
        algorithm: "R U' R' U R U' R'",
        difficulty: 'Advanced',
        estimatedTime: '5 min'
      }
    ]
  },
  {
    id: 'cfop-oll-all',
    title: 'Phase 2: Complete OLL (All 57 Algorithms)',
    description: 'Orient all top layer stickers in a single 1-Look step across all 57 cases.',
    lessons: OLL_ALGS.map(o => ({
      id: o.id,
      title: `${o.id.toUpperCase()}: ${o.name} (${o.group})`,
      explanation: `1-Look OLL algorithm for the ${o.group} case.`,
      algorithm: o.algorithm,
      difficulty: 'Advanced' as const,
      estimatedTime: '5 min',
      group: o.group
    }))
  },
  {
    id: 'cfop-pll-all',
    title: 'Phase 3: Complete PLL (All 21 Algorithms)',
    description: 'Permute all last layer corners and edges in a single 1-Look algorithm.',
    lessons: PLL_ALGS.map(p => ({
      id: p.id,
      title: `${p.id.toUpperCase()}: ${p.name} (${p.group})`,
      explanation: `1-Look PLL algorithm for ${p.group}.`,
      algorithm: p.algorithm,
      difficulty: 'Advanced' as const,
      estimatedTime: '6 min',
      group: p.group
    }))
  },
  {
    id: 'cfop-example-solve',
    title: 'Phase 4: Full Walkthrough Example Solve',
    description: 'Full speedsolving CFOP reconstruction demonstrating sub-10 second execution.',
    lessons: [
      {
        id: 'cfop_solve_walkthrough',
        title: 'Full CFOP Walkthrough Example Solve',
        explanation: 'High-speed reconstruction: Cross, 4 rotationless F2L slots, 1-Look OLL (Chameleon), and 1-Look PLL (Jb-Perm).',
        algorithm: "D' R' F D R2 U R U' R' U' L' U L U' R U2 R' U R U' R' U2 R' U' R U R' U' R r U R' U' r' F R F' R U R' F' R U R' U' R' F R2 U' R'",
        difficulty: 'Advanced',
        estimatedTime: '12 min',
        isExampleSolve: true,
        exampleSolveData: {
          scramble: "F2 U2 R2 B2 D2 R2 B2 U L2 U' F2 L' B' D F2 R' D2 F L' R2",
          phases: [
            { name: 'Cross', moves: "D' R' F D R2", description: '5-move bottom cross with efficient D pre-alignment.' },
            { name: 'F2L Slot 1 (FR)', moves: "U R U' R'", description: 'Basic right pair insert.' },
            { name: 'F2L Slot 2 (FL)', moves: "U' L' U L", description: 'Keyhole left pair insert.' },
            { name: 'F2L Slot 3 (BR)', moves: "U' R U2 R' U R U' R'", description: 'Split pair and slot into back right.' },
            { name: 'F2L Slot 4 (BL)', moves: "U2 R' U' R U R' U' R", description: 'Finish final F2L slot rotation-free.' },
            { name: 'OLL 24 (Chameleon)', moves: "r U R' U' r' F R F'", description: '1-Look OLL orientation.' },
            { name: 'PLL (Jb Perm)', moves: "R U R' F' R U R' U' R' F R2 U' R'", description: '1-Look PLL adjacent corner and edge swap.' }
          ]
        }
      }
    ]
  }
];

// -------------------------------------------------------------
// 4. ROUX METHOD (First Block, Second Block, 42 CMLL, LSE + Example Solve)
// -------------------------------------------------------------
const CMLL_ALGS = [
  // O Set
  { id: 'cmll_o_adjacent', name: 'O - Adjacent Swap', set: 'O', algorithm: "R U R' F' R U R' U' R' F R2 U' R'" },
  { id: 'cmll_o_diagonal', name: 'O - Diagonal Swap', set: 'O', algorithm: "r U R' U' r' F R F'" },
  // U Set
  { id: 'cmll_u_forward', name: 'U - Forward Bar', set: 'U', algorithm: "R2 D' R U2 R' D R U2 R" },
  { id: 'cmll_u_back', name: 'U - Back Bar', set: 'U', algorithm: "R2 D R' U2 R D' R' U2 R'" },
  { id: 'cmll_u_slash', name: 'U - Slash', set: 'U', algorithm: "F R U R' U' R U R' U' F'" },
  { id: 'cmll_u_x', name: 'U - X', set: 'U', algorithm: "r U R' U' r' F R F'" },
  { id: 'cmll_u_rows', name: 'U - Rows', set: 'U', algorithm: "R' U' R U' R' U2 R" },
  { id: 'cmll_u_columns', name: 'U - Columns', set: 'U', algorithm: "R U R' U R U2 R'" },
  // T Set
  { id: 'cmll_t_left_bar', name: 'T - Left Bar', set: 'T', algorithm: "r U R' U' r' F R F'" },
  { id: 'cmll_t_right_bar', name: 'T - Right Bar', set: 'T', algorithm: "R' U' R U R' F' R U R' U' R' F R" },
  { id: 'cmll_t_row', name: 'T - Row', set: 'T', algorithm: "F R U R' U' F'" },
  { id: 'cmll_t_dots', name: 'T - Dots', set: 'T', algorithm: "r' U' R U r U' R'" },
  { id: 'cmll_t_anti_slash', name: 'T - Anti-Slash', set: 'T', algorithm: "R U2 R' U' R U' R2 L' U' L U F" },
  { id: 'cmll_t_slash', name: 'T - Slash', set: 'T', algorithm: "r U' r2 U r2 U r'" },
  // L Set
  { id: 'cmll_l_mirror', name: 'L - Mirror', set: 'L', algorithm: "F' r U R' U' r' F R" },
  { id: 'cmll_l_pure', name: 'L - Pure', set: 'L', algorithm: "R U2 R' U' R U R' U' R U' R'" },
  { id: 'cmll_l_front_target', name: 'L - Front Target', set: 'L', algorithm: "r' U2 R U R' U r" },
  { id: 'cmll_l_back_target', name: 'L - Back Target', set: 'L', algorithm: "r U2 R' U' R U' r'" },
  { id: 'cmll_l_diagonals', name: 'L - Diagonals', set: 'L', algorithm: "R' U2 R U R' U R" },
  { id: 'cmll_l_columns', name: 'L - Columns', set: 'L', algorithm: "R U R' U R U2 R'" },
  // S Set
  { id: 'cmll_s_left_bar', name: 'S - Left Bar', set: 'S', algorithm: "R U R' U R U2 R'" },
  { id: 'cmll_s_x_check', name: 'S - X Check', set: 'S', algorithm: "R U R' U' R' F R F'" },
  { id: 'cmll_s_forward_slash', name: 'S - Forward Slash', set: 'S', algorithm: "F R U R' U' F' R U R' U R U2 R'" },
  { id: 'cmll_s_back_slash', name: 'S - Back Slash', set: 'S', algorithm: "R U R' U R' F R F' R U2 R'" },
  { id: 'cmll_s_columns', name: 'S - Columns', set: 'S', algorithm: "r U R' U' r' F R F'" },
  { id: 'cmll_s_rows', name: 'S - Rows', set: 'S', algorithm: "R' U' R U' R' U2 R" },
  // AS Set
  { id: 'cmll_as_right_bar', name: 'AS - Right Bar', set: 'AS', algorithm: "R U2 R' U' R U' R'" },
  { id: 'cmll_as_x_check', name: 'AS - X Check', set: 'AS', algorithm: "R' U' R U' R' U2 R" },
  { id: 'cmll_as_back_slash', name: 'AS - Back Slash', set: 'AS', algorithm: "F R U R' U' F'" },
  { id: 'cmll_as_forward_slash', name: 'AS - Forward Slash', set: 'AS', algorithm: "r U R' U' r' F R F'" },
  { id: 'cmll_as_columns', name: 'AS - Columns', set: 'AS', algorithm: "R U R' U R U2 R'" },
  { id: 'cmll_as_rows', name: 'AS - Rows', set: 'AS', algorithm: "R2 D' R U2 R' D R U2 R" },
  // Pi Set
  { id: 'cmll_pi_right_bar', name: 'Pi - Right Bar', set: 'Pi', algorithm: "R U2 R2 U' R2 U' R2 U2 R" },
  { id: 'cmll_pi_back_slash', name: 'Pi - Back Slash', set: 'Pi', algorithm: "F R U R' U' R U R' U' F'" },
  { id: 'cmll_pi_x', name: 'Pi - X', set: 'Pi', algorithm: "r U R' U' r' F R F'" },
  { id: 'cmll_pi_columns', name: 'Pi - Columns', set: 'Pi', algorithm: "R U R' U R U2 R'" },
  { id: 'cmll_pi_slash', name: 'Pi - Slash', set: 'Pi', algorithm: "R' U' R U' R' U2 R" },
  { id: 'cmll_pi_pure', name: 'Pi - Pure', set: 'Pi', algorithm: "F R U R' U' R U R' U' R U R' F'" },
  // H Set
  { id: 'cmll_h_column', name: 'H - Column', set: 'H', algorithm: "F R U R' U' R U R' U' R U R' F'" },
  { id: 'cmll_h_row', name: 'H - Row', set: 'H', algorithm: "R U R' U R U' R' U R U2 R'" },
  { id: 'cmll_h_slash', name: 'H - Slash', set: 'H', algorithm: "r U R' U' r' F R F'" },
  { id: 'cmll_h_pure', name: 'H - Pure', set: 'H', algorithm: "R U2 R' U' R U R' U' R U' R'" }
];

const ROUX_MODULES: Module[] = [
  {
    id: 'roux-fb-sb',
    title: 'Phases 1 & 2: First Block (FB) & Second Block (SB)',
    description: 'Intuitive block building on the left and right 1x2x3 sides leaving the M-slice free.',
    lessons: [
      {
        id: 'roux_fb_intro',
        title: 'First Block (FB) 1x2x3',
        explanation: 'Build the Left 1x2x3 block starting with the D-L edge and adding corners and edges without center constraints.',
        algorithm: "U' F' L2 B' U' L2",
        difficulty: 'Pro',
        estimatedTime: '6 min'
      },
      {
        id: 'roux_sb_intro',
        title: 'Second Block (SB) 1x2x3',
        explanation: 'Build the Right 1x2x3 block using only R, r, and M moves without disturbing the completed Left Block.',
        algorithm: "U R' U R' U' R U2 M' U R U' R'",
        difficulty: 'Pro',
        estimatedTime: '7 min'
      }
    ]
  },
  {
    id: 'roux-cmll-all',
    title: 'Phase 3: CMLL (All 42 Algorithms)',
    description: 'Orient and permute the 4 top-layer corners simultaneously using a single algorithm.',
    lessons: CMLL_ALGS.map(c => ({
      id: c.id,
      title: `${c.name} (Set ${c.set})`,
      explanation: `CMLL algorithm for ${c.name} in set ${c.set}.`,
      algorithm: c.algorithm,
      difficulty: 'Pro' as const,
      estimatedTime: '6 min',
      group: c.set
    }))
  },
  {
    id: 'roux-lse',
    title: 'Phase 4: Last Six Edges (LSE 4a, 4b, 4c)',
    description: 'Solve the remaining 6 edges (UL, UR, and 4 M-slice edges) using hyper-fast M and U moves.',
    lessons: [
      {
        id: 'roux_lse_4a',
        title: '4a: Edge Orientation (EO)',
        explanation: 'Orient all 6 remaining edges so white and yellow faces point strictly UP or DOWN.',
        algorithm: "M' U M'",
        difficulty: 'Pro',
        estimatedTime: '5 min'
      },
      {
        id: 'roux_lse_4b',
        title: '4b: UL and UR Edge Placement',
        explanation: 'Place the Left-Top and Right-Top edges into their correct home positions.',
        algorithm: "M2 U2 M2",
        difficulty: 'Pro',
        estimatedTime: '5 min'
      },
      {
        id: 'roux_lse_4c',
        title: '4c: M-Slice Edge Permutation',
        explanation: 'Permute the remaining 4 center M-slice edges to finish the cube.',
        algorithm: "M2 U2 M2 U2",
        difficulty: 'Pro',
        estimatedTime: '5 min'
      }
    ]
  },
  {
    id: 'roux-example-solve',
    title: 'Phase 5: Full Walkthrough Example Solve',
    description: 'Complete high-efficiency Roux method solve demonstrating blockbuilding and M-slice fluency.',
    lessons: [
      {
        id: 'roux_solve_walkthrough',
        title: 'Roux Method Full Solve Walkthrough',
        explanation: 'Step through FB block, SB block, CMLL (Sune), and LSE (4a EO, 4b UL/UR, 4c EP).',
        algorithm: "U' F' L2 B' U' L2 U R' U R' U' R U2 M' U R U' R' R U R' U R U2 R' M' U M' U2 M' U' M' M2 U2 M2 U M2 U2 M2",
        difficulty: 'Pro',
        estimatedTime: '12 min',
        isExampleSolve: true,
        exampleSolveData: {
          scramble: "B2 L2 U2 B2 D L2 B2 D' F2 U L2 B' D' R2 F2 U L' F' D L",
          phases: [
            { name: 'First Block (FB)', moves: "U' F' L2 B' U' L2", description: 'Build left 1x2x3 block.' },
            { name: 'Second Block (SB)', moves: "U R' U R' U' R U2 M' U R U' R'", description: 'Build right 1x2x3 block with M and R moves.' },
            { name: 'CMLL (Sune)', moves: "R U R' U R U2 R'", description: 'Orient & permute corners simultaneously.' },
            { name: 'LSE (4a EO + 4b UL/UR + 4c EP)', moves: "M' U M' U2 M' U' M' M2 U2 M2 U M2 U2 M2", description: 'Solve last six edges using M/U moves.' }
          ]
        }
      }
    ]
  }
];

// -------------------------------------------------------------
// 5. ZZ METHOD (EOline, ZZF2L, COLL, EPLL + Example Solve)
// -------------------------------------------------------------
const COLL_ALGS = [
  // Sune Set
  { id: 'coll_sune_1', name: 'Sune - Anti-Pure', set: 'Sune', algorithm: "R U R' U R U2 R'" },
  { id: 'coll_sune_2', name: 'Sune - Diagonal', set: 'Sune', algorithm: "F R U R' U' F' R U R' U R U2 R'" },
  // Anti-Sune Set
  { id: 'coll_antisune_1', name: 'Anti-Sune - Pure', set: 'Anti-Sune', algorithm: "R U2 R' U' R U' R'" },
  // H Set
  { id: 'coll_h_1', name: 'H - Columns', set: 'H', algorithm: "R U2 R' U' R U R' U' R U' R'" },
  // Pi Set
  { id: 'coll_pi_1', name: 'Pi - Pure', set: 'Pi', algorithm: "F R U R' U' R U R' U' F'" },
  // U Set
  { id: 'coll_u_1', name: 'U - Forward Bar', set: 'U', algorithm: "R2 D' R U2 R' D R U2 R" },
  // T Set
  { id: 'coll_t_1', name: 'T - Rows', set: 'T', algorithm: "r U R' U' r' F R F'" },
  // L Set
  { id: 'coll_l_1', name: 'L - Pure', set: 'L', algorithm: "F' r U R' U' r' F R" }
];

const ZZ_MODULES: Module[] = [
  {
    id: 'zz-eoline',
    title: 'Phase 1: EOline (Edge Orientation + Line)',
    description: 'Orient all 12 edges and place DF and DB edges to unlock rotationless 3-gen solving.',
    lessons: [
      {
        id: 'zz_eoline_basics',
        title: 'EOline Setup & Execution',
        explanation: 'Identify bad edges during inspection, flip them into an oriented state with F/B moves, and place the DF/DB bottom line.',
        algorithm: "F R' F' D R2 L2 D'",
        difficulty: 'Expert',
        estimatedTime: '8 min'
      }
    ]
  },
  {
    id: 'zz-f2l',
    title: 'Phase 2: ZZF2L (Rotationless R, U, L Blockbuilding)',
    description: 'Build left and right slots completely rotationless using only R, U, and L moves.',
    lessons: [
      {
        id: 'zz_f2l_left',
        title: 'Left Block Slotting',
        explanation: 'Pair and insert corner-edge pairs into the left slots without cube rotations.',
        algorithm: "L U L' U2 L U' L'",
        difficulty: 'Expert',
        estimatedTime: '6 min'
      },
      {
        id: 'zz_f2l_right',
        title: 'Right Block Slotting',
        explanation: 'Pair and insert corner-edge pairs into the right slots without cube rotations.',
        algorithm: "R U' R' U R U' R'",
        difficulty: 'Expert',
        estimatedTime: '6 min'
      }
    ]
  },
  {
    id: 'zz-coll-epll',
    title: 'Phase 3: COLL & EPLL Last Layer',
    description: 'Since EOline guarantees oriented edges, solve LL via COLL corner sets and EPLL edge cycles.',
    lessons: [
      ...COLL_ALGS.map(c => ({
        id: c.id,
        title: `COLL: ${c.name} (${c.set} Set)`,
        explanation: `COLL algorithm for ${c.name} in the ${c.set} set.`,
        algorithm: c.algorithm,
        difficulty: 'Expert' as const,
        estimatedTime: '7 min',
        group: c.set
      })),
      {
        id: 'zz_epll_ua',
        title: 'EPLL: Ua Perm',
        explanation: 'Cycle 3 edges clockwise.',
        algorithm: "R U' R U R U R U' R' U' R2",
        difficulty: 'Expert',
        estimatedTime: '5 min'
      },
      {
        id: 'zz_epll_ub',
        title: 'EPLL: Ub Perm',
        explanation: 'Cycle 3 edges counter-clockwise.',
        algorithm: "R2 U R U R' U' R' U' R' U R'",
        difficulty: 'Expert',
        estimatedTime: '5 min'
      },
      {
        id: 'zz_epll_h',
        title: 'EPLL: H Perm',
        explanation: 'Opposite edge swap.',
        algorithm: "M2 U M2 U2 M2 U M2",
        difficulty: 'Expert',
        estimatedTime: '5 min'
      },
      {
        id: 'zz_epll_z',
        title: 'EPLL: Z Perm',
        explanation: 'Adjacent edge swap.',
        algorithm: "M' U M2 U M2 U M' U2 M2",
        difficulty: 'Expert',
        estimatedTime: '5 min'
      }
    ]
  },
  {
    id: 'zz-example-solve',
    title: 'Phase 4: Full Walkthrough Example Solve',
    description: 'Complete rotationless ZZ method solve from EOline to EPLL.',
    lessons: [
      {
        id: 'zz_solve_walkthrough',
        title: 'ZZ Method Full Solve Walkthrough',
        explanation: 'Step through EOline, left/right ZZF2L blocks, COLL Sune corner solve, and H-Perm EPLL.',
        algorithm: "F R' F' D R2 L2 D' L U L' U2 L U' L' R U' R' U R U' R' R U2 R' U' R U' R' M2 U M2 U2 M2 U M2",
        difficulty: 'Expert',
        estimatedTime: '12 min',
        isExampleSolve: true,
        exampleSolveData: {
          scramble: "L2 U2 B2 D2 R2 F2 U2 R2 F2 U' R2 B' L D' R2 B F2 U' R D'",
          phases: [
            { name: 'EOLine', moves: "F R' F' D R2 L2 D'", description: 'Orient all 12 edges and place DF/DB line.' },
            { name: 'ZZF2L Left Block', moves: "L U L' U2 L U' L'", description: 'Solve left slots rotationless.' },
            { name: 'ZZF2L Right Block', moves: "R U' R' U R U' R'", description: 'Solve right slots rotationless.' },
            { name: 'COLL (Anti-Sune)', moves: "R U2 R' U' R U' R'", description: 'Solve corners while keeping top cross oriented.' },
            { name: 'EPLL (H Perm)', moves: "M2 U M2 U2 M2 U M2", description: 'Finish the cube with fast M2 edge swaps.' }
          ]
        }
      }
    ]
  }
];

// -------------------------------------------------------------
// MAIN EXPORT: ACADEMY COURSES
// -------------------------------------------------------------
export const ACADEMY_COURSES: Course[] = [
  {
    id: 'beginner',
    title: 'Beginner Method',
    badge: 'Fundamentals',
    description: 'The universal starting point. Learn to solve layer by layer intuitively with simple algorithmic triggers.',
    progress: 0,
    modules: BEGINNER_MODULES
  },
  {
    id: 'simplified-cfop',
    title: 'Simplified CFOP',
    badge: 'Intermediate',
    description: 'An easier version of CFOP using 4-Look Last Layer (4LLL) to transition smoothly from beginner to speedcubing.',
    progress: 0,
    modules: SIMPLIFIED_CFOP_MODULES
  },
  {
    id: 'cfop',
    title: 'CFOP Mastery',
    badge: 'Advanced',
    description: 'The world\'s most popular speedcubing method (Cross, F2L, 57 OLL, 21 PLL) for sub-10 second solving.',
    progress: 0,
    modules: CFOP_MODULES
  },
  {
    id: 'roux',
    title: 'Roux Method',
    badge: 'Pro',
    description: 'Blockbuilding, 42 CMLL algorithms, and M-slice mastery for hyper-efficient ergonomic solving.',
    progress: 0,
    modules: ROUX_MODULES
  },
  {
    id: 'zz',
    title: 'ZZ Method',
    badge: 'Expert',
    description: 'Rotationless solving via Edge Orientation Line (EOline), ZZF2L blockbuilding, COLL, and EPLL.',
    progress: 0,
    modules: ZZ_MODULES
  }
];
