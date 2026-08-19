export interface ExampleSolveStep {
  phase: string;
  name: string;
  formula: string;
  explanation: string;
  commentary?: string;
  moves: string;
}

export interface Lesson {
  id: string;
  title: string;
  explanation: string;
  algorithm: string;
  isCompleted?: boolean;
  isExampleSolve?: boolean;
  scramble?: string;
  steps?: ExampleSolveStep[];
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

export const ACADEMY_COURSES: Course[] = [
  {
    id: 'beginner',
    title: 'Beginner Method',
    badge: 'Fundamentals',
    description: 'The universal starting point. Learn to solve layer by layer intuitively.',
    progress: 100,
    modules: [
      {
        id: 'daisy',
        title: 'The Daisy & White Cross',
        description: 'Set up your foundation.',
        lessons: [
          { id: 'b1', title: 'Forming the Daisy', explanation: 'Bring all white edge pieces to the yellow center.', algorithm: "R U R' U'" },
          { id: 'b2', title: 'Dropping the Cross', explanation: 'Match the edge colors to centers and rotate down.', algorithm: "F2 R2 L2 B2" }
        ]
      },
      {
        id: 'first-two-layers',
        title: 'First Two Layers (F2L)',
        description: 'Solve corners and middle edges.',
        lessons: [
          { id: 'b3', title: 'First Layer Corners', explanation: 'Insert white corners using the 4-move Sexy Move trigger.', algorithm: "R U R' U'" },
          { id: 'b4', title: 'Second Layer Right Insertion', explanation: 'Insert edge from top-front into front-right slot.', algorithm: "U R U' R' U' F' U F" },
          { id: 'b5', title: 'Second Layer Left Insertion', explanation: 'Insert edge from top-front into front-left slot.', algorithm: "U' L' U L U F U' F'" }
        ]
      },
      {
        id: 'last-layer',
        title: 'Last Layer (LL)',
        description: 'Complete the top yellow face and position all pieces.',
        lessons: [
          { id: 'b6', title: 'Yellow Cross (FURU\'F\')', explanation: 'Form the yellow cross without breaking the bottom two layers.', algorithm: "F R U R' U' F'" },
          { id: 'b7', title: 'Permute Edges (Sune)', explanation: 'Align all top yellow edges with side center colors.', algorithm: "R U R' U R U2 R'" },
          { id: 'b8', title: 'Position Corners (Niklas)', explanation: 'Cycle yellow corners to their correct physical spots.', algorithm: "U R U' L' U R' U' L" },
          { id: 'b9', title: 'Orient Corners (R\' D\' R D)', explanation: 'Rotate yellow corners upward until the cube is solved.', algorithm: "R' D' R D" }
        ]
      },
      {
        id: 'beginner-walkthrough',
        title: 'Step-by-Step Example Solve',
        description: 'A genuine YouTuber-style complete walkthrough solving a scrambled cube phase by phase.',
        lessons: [
          {
            id: 'b-ex1',
            title: 'Beginner Full Example Solve',
            explanation: 'Watch a scrambled cube resolve through all 7 beginner steps with commentary on every move.',
            algorithm: "F2 R2 L2 B2 U R U' R' U2 R U R' U R U' R' U' F' U F U' L' U L U F U' F' F R U R' U' F' R U R' U R U2 R' U R U' L' U R' U' L R' D' R D R' D' R D U' R' D' R D R' D' R D U",
            isExampleSolve: true,
            scramble: "D2 R2 U F2 D' B2 L2 D F2 U' L' D2 B' R F' D' L F' U2 R2",
            steps: [
              {
                phase: 'Step 1: Daisy -> Cross',
                name: 'White Cross Alignment',
                formula: 'F2 R2 L2 B2',
                explanation: 'Match side colors of the daisy edges with their respective centers and drop 180° down.',
                commentary: 'Rotate green to green, red to red, blue to blue, orange to orange and drop each with F2/R2/L2/B2 to form the bottom cross.',
                moves: 'F2 R2 L2 B2'
              },
              {
                phase: 'Step 2: First Layer Corners',
                name: 'First Layer Corners',
                formula: "U R U' R' U2 R U R'",
                explanation: 'Position target corners above their slots and insert with Sexy Move (R U R\' U\').',
                commentary: 'Align the White-Red-Green and White-Green-Orange corners over their slots and insert cleanly.',
                moves: "U R U' R' U2 R U R'"
              },
              {
                phase: 'Step 3: Second Layer Edges',
                name: 'Middle Layer Edge Insertion',
                formula: "U R U' R' U' F' U F U' L' U L U F U' F'",
                explanation: 'Insert non-yellow edges into the middle layer using Right & Left insertion triggers.',
                commentary: 'Move top edge away from target slot, apply corner trigger, then insert the formed pair into the middle layer.',
                moves: "U R U' R' U' F' U F U' L' U L U F U' F'"
              },
              {
                phase: 'Step 4: Yellow Cross',
                name: 'Yellow Cross (FURU\'F\')',
                formula: "F R U R' U' F'",
                explanation: 'Orient all 4 top yellow edges to form a yellow cross on top.',
                commentary: 'With the horizontal line positioned horizontally, FURU\'F\' brings all yellow edges to face UP in one smooth trigger.',
                moves: "F R U R' U' F'"
              },
              {
                phase: 'Step 5: Permute Yellow Edges',
                name: 'Permute Edges (Sune)',
                formula: "R U R' U R U2 R'",
                explanation: 'Align all 4 top yellow edges with their matching side center colors.',
                commentary: 'Holding one matching edge on the back and one on the right, Sune swaps the remaining edges into place.',
                moves: "R U R' U R U2 R'"
              },
              {
                phase: 'Step 6: Position Yellow Corners',
                name: 'Position Corners (Niklas)',
                formula: "U R U' L' U R' U' L",
                explanation: 'Cycle yellow corners into their correct geometric locations.',
                commentary: 'Keep the correctly positioned corner in the front-right-top and apply Niklas to cycle the remaining 3 corners.',
                moves: "U R U' L' U R' U' L"
              },
              {
                phase: 'Step 7: Orient Yellow Corners',
                name: 'Orient Corners (Solved!)',
                formula: "R' D' R D R' D' R D U' R' D' R D R' D' R D U",
                explanation: 'Rotate corners in place using Reverse Sexy Move (R\' D\' R D) until yellow faces up.',
                commentary: 'Perform R\' D\' R D twice per corner, rotate top layer (U\') to load the next corner, and repeat until the cube is solved!',
                moves: "R' D' R D R' D' R D U' R' D' R D R' D' R D U"
              }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'simplified-cfop',
    title: 'Simplified CFOP',
    badge: 'Intermediate',
    description: 'An easier version of CFOP using 4-Look Last Layer (4LLL) to transition smoothly from beginner.',
    progress: 15,
    modules: [
      {
        id: 'two-look-oll',
        title: '2-Look OLL',
        description: 'Orient the last layer in two simple steps.',
        lessons: [
          { id: 'sc1', title: 'Edge Orientation', explanation: 'Orient all top edges to form a yellow cross.', algorithm: "F R U R' U' F'" },
          { id: 'sc2', title: 'Sune Corner Orientation', explanation: 'Orient corners when one corner is already oriented.', algorithm: "R U R' U R U2 R'" }
        ]
      },
      {
        id: 'two-look-pll',
        title: '2-Look PLL',
        description: 'Permute corners then permute edges.',
        lessons: [
          { id: 'sc3', title: 'T-Perm Corner Swap', explanation: 'Swap two adjacent corners on the top layer.', algorithm: "R U R' U' R' F R2 U' R' U' R U R' F'" },
          { id: 'sc4', title: 'Ub-Perm Edge Cycle', explanation: 'Cycle three top layer edges clockwise.', algorithm: "R2 U R U R' U' R' U' R' U R'" }
        ]
      },
      {
        id: 'simplified-cfop-walkthrough',
        title: 'Step-by-Step Example Solve',
        description: 'Full 4-Look Last Layer (4LLL) progression from scramble to solved state.',
        lessons: [
          {
            id: 'sc-ex1',
            title: 'Simplified CFOP Example Solve',
            explanation: 'Walk through Cross, intuitive F2L, 2-Look OLL, and 2-Look PLL on a scrambled cube.',
            algorithm: "D R' F D2 R2 U R U' R' U' F' U F U2 R U R' U' R U R' F R U R' U' F' U R U R' U R U2 R' R U R' U' R' F R2 U' R' U' R U R' F' U R2 U R U R' U' R' U' R' U R'",
            isExampleSolve: true,
            scramble: "R2 D B2 D2 F2 U' L2 F2 D' B2 U F' D2 L' B R2 U' B2 U2 F",
            steps: [
              {
                phase: 'Phase 1: Bottom Cross',
                name: 'Planned White Cross',
                formula: "D R' F D2 R2",
                explanation: 'Solve all 4 white cross edges directly on the bottom face in 5 moves.',
                commentary: 'Notice green and red cross edges are already aligned relative to each other. D R\' F connects orange/blue, D2 R2 finishes all 4.',
                moves: "D R' F D2 R2"
              },
              {
                phase: 'Phase 2: Intuitive F2L',
                name: 'First Two Layers Pairs',
                formula: "U R U' R' U' F' U F U2 R U R' U' R U R'",
                explanation: 'Pair corner-edge pieces and insert into their slots simultaneously.',
                commentary: 'Pairing Front-Right and Back-Right slots cleanly in 2 fluid triggers without unnecessary cube rotations.',
                moves: "U R U' R' U' F' U F U2 R U R' U' R U R'"
              },
              {
                phase: 'Phase 3: 2-Look OLL',
                name: 'Edge EO & Corner Sune',
                formula: "F R U R' U' F' U R U R' U R U2 R'",
                explanation: 'Orient top edges with FURU\'F\', then orient corners with Sune to make the top yellow.',
                commentary: 'Edge orientation gives the Sune case; standard Sune orients all 4 top corners in one clean fluid sequence.',
                moves: "F R U R' U' F' U R U R' U R U2 R'"
              },
              {
                phase: 'Phase 4: 2-Look PLL',
                name: 'Corner T-Perm & Edge Ub-Perm',
                formula: "R U R' U' R' F R2 U' R' U' R U R' F' U R2 U R U R' U' R' U' R' U R'",
                explanation: 'Permute corners using T-Perm, then cycle the remaining 3 edges using Ub-Perm to solve.',
                commentary: 'T-Perm fixes headlights on corners; Ub-Perm cycles the 3 front-left-back edges directly to finished state!',
                moves: "R U R' U' R' F R2 U' R' U' R U R' F' U R2 U R U R' U' R' U' R' U R'"
              }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'cfop',
    title: 'CFOP Mastery',
    badge: 'Advanced',
    description: 'The world\'s most popular speedcubing method (Cross, F2L, OLL, PLL).',
    progress: 34,
    modules: [
      {
        id: 'f2l-basics',
        title: 'Intuitive F2L',
        description: 'Solve the first two layers simultaneously.',
        lessons: [
          { id: 'c1', title: 'Basic Insertion (Right)', explanation: 'Insert a paired corner and edge into the front-right slot.', algorithm: "R U R'" },
          { id: 'c2', title: 'Hide and Pair', explanation: 'Hide the corner, move the edge, and restore to pair them up.', algorithm: "R U R' U' R U R'" }
        ]
      },
      {
        id: 'pll',
        title: 'PLL Algorithms',
        description: 'Permute the last layer.',
        lessons: [
          { id: 'c3', title: 'T-Permutation', explanation: 'Swaps two adjacent corners and two opposite edges on the top layer.', algorithm: "R U R' U' R' F R2 U' R' U' R U R' F'" },
          { id: 'c4', title: 'Y-Permutation', explanation: 'Swaps two diagonal corners and two adjacent edges.', algorithm: "F R U' R' U' R U R' F' R U R' U' R' F R F'" }
        ]
      },
      {
        id: 'cfop-walkthrough',
        title: 'Step-by-Step Example Solve',
        description: 'Advanced CFOP inspection, 4 F2L slotting, 1-Look OLL, and 1-Look PLL.',
        lessons: [
          {
            id: 'cfop-ex1',
            title: 'Full CFOP Speed Example Solve',
            explanation: 'Full speedsolve walkthrough featuring 4-slot lookahead, 1-Look OLL 33, and Jb-Perm.',
            algorithm: "D' R' F D' L2 R2 U R U' R' U' L' U L U R' U' R U R' U' R U' L U2 L' U L U' L' R U R' U' R' F R F' R U R' F' R U R' U' R' F R2 U' R'",
            isExampleSolve: true,
            scramble: "F2 U2 R2 B2 D2 L2 B2 U L2 F2 D' F' D R B' U2 L F2 D' L2",
            steps: [
              {
                phase: 'Phase 1: Cross',
                name: 'Inspection Planned Cross',
                formula: "D' R' F D' L2 R2",
                explanation: 'Planned 6-move cross solving all 4 edges relative to centers with lookahead.',
                commentary: 'Lookahead during inspection allows placing cross edges directly with D\' R\' F D\' L2 R2 without pauses.',
                moves: "D' R' F D' L2 R2"
              },
              {
                phase: 'Phase 2: F2L Slot 1 (FR)',
                name: 'Slot 1: Front-Right Pair',
                formula: "U R U' R'",
                explanation: 'Basic 3-move insert into the Front-Right slot.',
                commentary: 'The pair was already formed during cross execution — immediate 3-mover insert.',
                moves: "U R U' R'"
              },
              {
                phase: 'Phase 3: F2L Slot 2 (FL)',
                name: 'Slot 2: Front-Left Pair',
                formula: "U' L' U L",
                explanation: 'Left-side 3-move insert into Front-Left slot.',
                commentary: 'Corner and edge are set up for free left insertion.',
                moves: "U' L' U L"
              },
              {
                phase: 'Phase 4: F2L Slot 3 (BR)',
                name: 'Slot 3: Back-Right Pair',
                formula: "U R' U' R U R' U' R",
                explanation: 'Back-Right slot resolution with zero cube rotations.',
                commentary: 'Split and insert into the back right slot directly from the home grip.',
                moves: "U R' U' R U R' U' R"
              },
              {
                phase: 'Phase 5: F2L Slot 4 (BL)',
                name: 'Slot 4: Back-Left Pair',
                formula: "U' L U2 L' U L U' L'",
                explanation: 'Final F2L slot pairing and insertion.',
                commentary: 'Separate corner and edge with L U2 L\', reconnect and insert.',
                moves: "U' L U2 L' U L U' L'"
              },
              {
                phase: 'Phase 6: 1-Look OLL',
                name: 'OLL 33 (T-Shape)',
                formula: "R U R' U' R' F R F'",
                explanation: 'Orient all 4 corners and 2 edges in 1 step.',
                commentary: 'Recognize T-shape OLL: Sexy Move followed by sledgehammer orients the entire top yellow face!',
                moves: "R U R' U' R' F R F'"
              },
              {
                phase: 'Phase 7: 1-Look PLL',
                name: 'Jb-Permutation (Solved!)',
                formula: "R U R' F' R U R' U' R' F R2 U' R'",
                explanation: '1-Look Jb-Permutation to solve the entire last layer.',
                commentary: 'Headlights on the left with solved bar on front-left: Jb-Perm solves all remaining pieces instantly!',
                moves: "R U R' F' R U R' U' R' F R2 U' R'"
              }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'roux',
    title: 'Roux Method',
    badge: 'Pro',
    description: 'Blockbuilding, CMLL, and M-slice mastery for hyper-efficient solves.',
    progress: 0,
    modules: [
      {
        id: 'roux-blocks',
        title: 'First Two Blocks',
        description: 'Build 1x2x3 blocks on the left and right sides without affecting other edges.',
        lessons: [
          { id: 'r1', title: 'Left Block Setup', explanation: 'Align the D-L edge and build around it.', algorithm: "L U L' U L U2 L'" },
          { id: 'r2', title: 'Right Block Setup', explanation: 'Build the symmetrical 1x2x3 block on the right side.', algorithm: "R U' R' U' R U2 R'" }
        ]
      },
      {
        id: 'roux-cmll',
        title: 'CMLL & M-Slice (LSE)',
        description: 'Solve top corners and permute the last six edges (LSE) using M-slice moves.',
        lessons: [
          { id: 'r3', title: 'Corner Orientation', explanation: 'Orient last layer corners without disturbing the side blocks.', algorithm: "R U R' U' R' F R F'" },
          { id: 'r4', title: 'M-Slice Edge Cycle', explanation: 'Cycle edges using the central M-slice axis.', algorithm: "M2 U M' U2 M U M2" }
        ]
      },
      {
        id: 'roux-walkthrough',
        title: 'Step-by-Step Example Solve',
        description: 'Complete Roux method demonstration: FB, SB, CMLL, and LSE (M-slice).',
        lessons: [
          {
            id: 'roux-ex1',
            title: 'Roux Blockbuilding Example Solve',
            explanation: 'Walk through First Block (FB), Second Block (SB), CMLL, and Last Six Edges (LSE).',
            algorithm: "D F' D2 L F' L2 D2 L' U' R' U R U2 M2 U R U' R' R U R' U' R' F R F' M' U M U' M2 U2 M2 U M' U2 M",
            isExampleSolve: true,
            scramble: "B2 D2 L2 F2 U2 R2 U' F2 D' L2 B2 R' D B2 F L' U' R2 B F2",
            steps: [
              {
                phase: 'Phase 1: First Block (FB)',
                name: 'Left 1x2x3 Block',
                formula: "D F' D2 L F' L2 D2 L'",
                explanation: 'Build the left 1x2x3 block around the DL edge without a cross.',
                commentary: 'Place the blue-white DL edge and attach the two corner-edge pairs to complete the solid 1x2x3 left block.',
                moves: "D F' D2 L F' L2 D2 L'"
              },
              {
                phase: 'Phase 2: Second Block (SB)',
                name: 'Right 1x2x3 Block',
                formula: "U' R' U R U2 M2 U R U' R'",
                explanation: 'Build the symmetrical right 1x2x3 block using R, r, M, U moves.',
                commentary: 'Leverage the free M-slice to pair up the green-white pieces and slot into the DR side without disturbing the left block.',
                moves: "U' R' U R U2 M2 U R U' R'"
              },
              {
                phase: 'Phase 3: CMLL',
                name: 'Corners of Last Layer',
                formula: "R U R' U' R' F R F'",
                explanation: 'Orient and permute all top 4 corners without disturbing the side blocks.',
                commentary: 'Recognize the CMLL T-case and execute the algorithm to solve all 4 corners.',
                moves: "R U R' U' R' F R F'"
              },
              {
                phase: 'Phase 4: LSE (Last Six Edges)',
                name: 'EO, UL/UR, & EP (Solved!)',
                formula: "M' U M U' M2 U2 M2 U M' U2 M",
                explanation: 'Orient all 6 remaining edges (EO), separate UL/UR, and permute M-slice edges.',
                commentary: 'M\' U M orients remaining bad edges, M2 separates top side edges, and M U2 M EP finishes the solve!',
                moves: "M' U M U' M2 U2 M2 U M' U2 M"
              }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'zz',
    title: 'ZZ Method',
    badge: 'Expert',
    description: 'Rotationless solving via Edge Orientation Line (EOLine) followed by F2L blockbuilding.',
    progress: 0,
    modules: [
      {
        id: 'zz-eoline',
        title: 'EOLine Setup',
        description: 'Orient all edges (EO) and place the DF and DB line edges (Line).',
        lessons: [
          { id: 'z1', title: 'Edge Orientation (EO)', explanation: 'Orient bad edges to make the rest of the solve completely rotationless.', algorithm: "F R U R' U' F'" },
          { id: 'z2', title: 'Line Placement', explanation: 'Align the front-bottom and back-bottom line edges.', algorithm: "D R2 L2 D'" }
        ]
      },
      {
        id: 'zz-f2l',
        title: 'Rotationless F2L & LL',
        description: 'Complete the first two layers using only U, R, L moves, then finish the last layer.',
        lessons: [
          { id: 'z3', title: 'Right Block Slotting', explanation: 'Solve right side slots rotation-free using U/R moves.', algorithm: "R U R' U' R U R'" },
          { id: 'z4', title: 'Left Block Slotting', explanation: 'Solve left side slots rotation-free using U/L moves.', algorithm: "L U' L' U L U' L'" }
        ]
      },
      {
        id: 'zz-walkthrough',
        title: 'Step-by-Step Example Solve',
        description: 'Complete ZZ rotationless method: EOLine, Left/Right Blockbuilding, COLL, and EPLL.',
        lessons: [
          {
            id: 'zz-ex1',
            title: 'ZZ EOLine & Rotationless Example Solve',
            explanation: 'Walk through EOLine, Left Block, Right Block, COLL, and EPLL with zero cube rotations.',
            algorithm: "F' R U F' D R2 L2 D' L U' L' U L U2 L' U L U' L' R U R' U' R U2 R' U' R U R' R U2 R' U' R U R' U' R U' R' M2 U M U2 M' U M2",
            isExampleSolve: true,
            scramble: "L2 U2 F2 D' R2 B2 U2 F2 D B2 R2 F' L U R' F2 D B' L2 F2",
            steps: [
              {
                phase: 'Phase 1: EOLine',
                name: 'Edge Orientation & Line',
                formula: "F' R U F' D R2 L2 D'",
                explanation: 'Orient all 12 edges and place DF and DB line edges.',
                commentary: 'F\' R U F\' orients all bad edges. Once all edges are good, the entire remainder of the solve uses only <R, U, L> moves!',
                moves: "F' R U F' D R2 L2 D'"
              },
              {
                phase: 'Phase 2: Left Block (ZZ-F2L)',
                name: 'Left 1x2x3 Block',
                formula: "L U' L' U L U2 L' U L U' L'",
                explanation: 'Solve left 1x2x3 block with zero rotations using only L and U moves.',
                commentary: 'Because all edges are oriented, pieces pair up seamlessly with 2-gen <L,U> mechanics.',
                moves: "L U' L' U L U2 L' U L U' L'"
              },
              {
                phase: 'Phase 3: Right Block (ZZ-F2L)',
                name: 'Right 1x2x3 Block',
                formula: "R U R' U' R U2 R' U' R U R'",
                explanation: 'Solve right 1x2x3 block with zero rotations using only R and U moves.',
                commentary: 'Finish the first two layers with smooth <R,U> rotationless flow.',
                moves: "R U R' U' R U2 R' U' R U R'"
              },
              {
                phase: 'Phase 4: COLL',
                name: 'Corners of Last Layer',
                formula: "R U2 R' U' R U R' U' R U' R'",
                explanation: 'Orient and permute last layer corners (edges are already oriented!).',
                commentary: 'Since top edges already form a cross from EOLine, COLL solves all corners in one step.',
                moves: "R U2 R' U' R U R' U' R U' R'"
              },
              {
                phase: 'Phase 5: EPLL',
                name: 'Edge Permutation (Solved!)',
                formula: "M2 U M U2 M' U M2",
                explanation: 'Cycle the remaining 3 top edges with U-Perm to finish the cube.',
                commentary: 'Fast M2 U M U2 M\' U M2 cycles the last 3 edges directly into solved state!',
                moves: "M2 U M U2 M' U M2"
              }
            ]
          }
        ]
      }
    ]
  }
];