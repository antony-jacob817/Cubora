export interface SolvePhase {
  name: string;
  moves: string;
  explanation: string;
  subtitles?: string;
  trackingTip?: string;
}

export interface Lesson {
  id: string;
  title: string;
  explanation: string;
  algorithm: string;
  isCompleted?: boolean;
  isExampleSolve?: boolean;
  scramble?: string;
  phases?: SolvePhase[];
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
    description: 'The universal starting point. Learn layer-by-layer solving intuitively with step-by-step masterclasses.',
    progress: 100,
    modules: [
      {
        id: 'beginner-masterclass',
        title: 'Masterclass: Complete Beginner Solve',
        description: 'Interactive walkthrough of a full Beginner solve from scramble to solved state.',
        lessons: [
          {
            id: 'b-masterclass-1',
            title: 'Interactive Masterclass: Beginner Solve',
            explanation: 'Full 8-phase example solve demonstrating the complete Layer-by-Layer beginner method.',
            algorithm: "U R U' F' L F F2 R2 B2 L2 U R U R' U' U R U R' U' U R U' R' U' F' U F F R U R' U' F' R U R' U R U2 R' U R U' L' U R' U' L R' D' R D R' D' R D U R' D' R D R' D' R D U'",
            scramble: "D2 R2 U F2 D' L2 U' B2 U F2 U2 R' D' F L' B' D F2 R2 U'",
            isExampleSolve: true,
            phases: [
              {
                name: '1. Scramble',
                moves: "D2 R2 U F2 D' L2 U' B2 U F2 U2 R' D' F L' B' D F2 R2 U'",
                explanation: 'Inspect the scrambled cube. Identify the yellow center on top and find the 4 white edge pieces.',
                subtitles: 'Locate yellow center on top. Find white edges scattered around the cube to prepare the Daisy.',
                trackingTip: 'Look for white edges on the middle and bottom layers first.'
              },
              {
                name: '2. Daisy',
                moves: "U R U' F' L F",
                explanation: 'Form the Daisy by bringing all 4 white edge pieces to surround the yellow center.',
                subtitles: 'Rotate each white edge up to the yellow top face without worrying about matching side colors yet.',
                trackingTip: 'Keep yellow center facing UP throughout the Daisy step.'
              },
              {
                name: '3. White Cross',
                moves: "F2 R2 B2 L2",
                explanation: 'Match each white edge side color with its corresponding center piece and rotate 180° down.',
                subtitles: 'Turn top layer until edge side color matches center, then do a 180° (F2) turn to drop it into the bottom cross.',
                trackingTip: 'Look at the Green, Red, Blue, and Orange side centers.'
              },
              {
                name: '4. First Layer Corners',
                moves: "U R U R' U' U R U R' U'",
                explanation: 'Insert the 4 bottom white corners using the fundamental Sexy Move (R U R\' U\').',
                subtitles: 'Position corner above target bottom slot. Repeat R U R\' U\' until white sticker faces DOWN.',
                trackingTip: 'Check the 3 colors on the corner to match the adjacent side centers.'
              },
              {
                name: '5. Middle Layer Edges',
                moves: "U R U' R' U' F' U F",
                explanation: 'Insert second layer edges into their matching left/right slots without disturbing the white face.',
                subtitles: 'Align top edge with front center. Push away from target slot, trigger corner out, and re-insert pair.',
                trackingTip: 'Ensure top edge has NO yellow stickers before inserting.'
              },
              {
                name: '6. Yellow Cross',
                moves: "F R U R' U' F'",
                explanation: 'Orient the top yellow edges to form a yellow cross using the FURU\'F\' algorithm.',
                subtitles: 'Identify Dot, L-shape, or Horizontal Line. Execute F (R U R\' U\') F\' to form the yellow cross.',
                trackingTip: 'Hold L-shape at back-left, or horizontal bar horizontally.'
              },
              {
                name: '7. Permute Edges',
                moves: "R U R' U R U2 R'",
                explanation: 'Align all 4 yellow cross edges with their matching side center colors using Sune.',
                subtitles: 'Rotate U until at least 2 edges match side centers. Apply Sune (R U R\' U R U2 R\') to cycle remaining edges.',
                trackingTip: 'Hold the matched edges at Back and Right when applying Sune.'
              },
              {
                name: '8. Position Corners',
                moves: "U R U' L' U R' U' L",
                explanation: 'Cycle the 4 yellow corners into their correct physical corner locations using Niklas.',
                subtitles: 'Find one corner in correct position (even if twisted). Hold at Front-Right and execute Niklas.',
                trackingTip: 'A corner is in position if its 3 colors match the 3 adjacent centers.'
              },
              {
                name: '9. Orient Corners',
                moves: "R' D' R D R' D' R D U R' D' R D R' D' R D U'",
                explanation: 'Twist the yellow corners so yellow faces up using R\' D\' R D, completing the solve!',
                subtitles: 'Hold unsolved corner at Front-Right-Top. Repeat R\' D\' R D until yellow faces UP, then turn U layer for next.',
                trackingTip: 'NEVER rotate the whole cube during this step; only turn the U top layer!'
              }
            ]
          }
        ]
      },
      {
        id: 'daisy',
        title: 'The Daisy & White Cross',
        description: 'Set up your solid foundation.',
        lessons: [
          { id: 'b1', title: 'Forming the Daisy', explanation: 'Bring all white edge pieces to the yellow center.', algorithm: "R U R' U'" },
          { id: 'b2', title: 'Dropping the Cross', explanation: 'Match the edge colors to centers and rotate down.', algorithm: "F2 R2 L2 B2" }
        ]
      },
      {
        id: 'first-layer',
        title: 'First Layer Corners',
        description: 'Insert corners using the Sexy Move trigger.',
        lessons: [
          { id: 'b3', title: 'Right Corner Insertion', explanation: 'Insert front-right corner with the standard trigger.', algorithm: "R U R' U'" },
          { id: 'b4', title: 'Left Corner Insertion', explanation: 'Insert front-left corner with the mirror trigger.', algorithm: "L' U' L U" }
        ]
      },
      {
        id: 'second-layer',
        title: 'Second Layer Edges',
        description: 'Solve the middle layer slots.',
        lessons: [
          { id: 'b5', title: 'Right Edge Slotting', explanation: 'Move edge from top-front into front-right slot.', algorithm: "U R U' R' U' F' U F" },
          { id: 'b6', title: 'Left Edge Slotting', explanation: 'Move edge from top-front into front-left slot.', algorithm: "U' L' U L U F U' F'" }
        ]
      }
    ]
  },
  {
    id: 'simplified-cfop',
    title: 'Simplified CFOP',
    badge: 'Intermediate',
    description: 'Transition smoothly from beginner with 4-Look Last Layer (4LLL) and intuitive First Two Layers.',
    progress: 15,
    modules: [
      {
        id: 'simplified-masterclass',
        title: 'Masterclass: Simplified CFOP Solve',
        description: 'Full walkthrough with 4-Look Last Layer (2-Look OLL + 2-Look PLL).',
        lessons: [
          {
            id: 'sc-masterclass-1',
            title: 'Interactive Masterclass: Simplified CFOP Solve',
            explanation: 'Cross -> Intuitive F2L 1-4 -> 2-Look OLL (EO + CO) -> 2-Look PLL (CP + EP).',
            algorithm: "D' R' F D R2 U L' U' L U' R' U R F' U' F U L U' L' U R U' R' U R U' R' F R U R' U' F' R U R' U R U2 R' R U R' U' R' F R2 U' R' U' R U R' F' R2 U R U R' U' R' U' R' U R'",
            scramble: "B2 L2 F2 U' R2 D' F2 D L2 B2 U2 L' B R2 D' B2 L' F' D2 R",
            isExampleSolve: true,
            phases: [
              {
                name: '1. Cross',
                moves: "D' R' F D R2",
                explanation: 'Solve the 4 white cross edges directly on the bottom face in 5 moves.',
                subtitles: 'Plan cross during inspection. Insert Blue, Red, Green, and Orange edges directly onto D face.',
                trackingTip: 'Keep white on bottom; do not waste moves forming a Daisy.'
              },
              {
                name: '2. F2L Pair 1 (BL)',
                moves: "U L' U' L",
                explanation: 'Pair up back-left corner and edge in top layer and insert into back slot.',
                subtitles: 'Track Back-Left corner/edge pair, bring to U layer, pair up, and insert cleanly.',
                trackingTip: 'Solving back slots first keeps front slots open for better visibility.'
              },
              {
                name: '3. F2L Pair 2 (BR)',
                moves: "U' R' U R",
                explanation: 'Pair and insert back-right corner and edge into back-right slot.',
                subtitles: 'Align matched pair over BR slot and drop down with R\' U R.',
                trackingTip: 'Notice the front slots remain completely open.'
              },
              {
                name: '4. F2L Pair 3 (FL)',
                moves: "F' U' F U L U' L'",
                explanation: 'Separate and pair up front-left slot pieces, then insert into FL.',
                subtitles: 'Hide corner with F\', align edge with U\', restore, and insert with L U\' L\'.',
                trackingTip: 'Watch the front-right slot remain unaffected.'
              },
              {
                name: '5. F2L Pair 4 (FR)',
                moves: "U R U' R' U R U' R'",
                explanation: 'Solve the final F2L pair into the front-right slot.',
                subtitles: 'Position corner and edge with matching top colors, pair up, and slot into FR.',
                trackingTip: 'First two layers are now completely solved.'
              },
              {
                name: '6. 2-Look OLL (EO)',
                moves: "F R U R' U' F'",
                explanation: 'Orient all 4 top yellow edges to form a yellow cross.',
                subtitles: 'Identify horizontal yellow bar. Execute F (R U R\' U\') F\' to orient all top edges.',
                trackingTip: 'Verify all 4 yellow top edges have yellow facing up.'
              },
              {
                name: '7. 2-Look OLL (CO)',
                moves: "R U R' U R U2 R'",
                explanation: 'Orient top yellow corners using Sune algorithm.',
                subtitles: 'One corner oriented at Front-Left-Top. Execute Sune (R U R\' U R U2 R\') to solve yellow face.',
                trackingTip: 'All yellow stickers now face up (OLL complete).'
              },
              {
                name: '8. 2-Look PLL (CP)',
                moves: "R U R' U' R' F R2 U' R' U' R U R' F'",
                explanation: 'Permute all 4 top corners using T-Permutation.',
                subtitles: 'Find matching headlights at Left. Execute T-Perm to solve all 4 corner positions.',
                trackingTip: 'All 4 corners are now in their correct relative spots.'
              },
              {
                name: '9. 2-Look PLL (EP)',
                moves: "R2 U R U R' U' R' U' R' U R'",
                explanation: 'Permute the remaining 3 top edges using Ub-Perm to solve the cube!',
                subtitles: 'Hold solved bar at Back. Execute Ub-Perm (R2 U R U R\' U\' R\' U\' R\' U R\') to finish.',
                trackingTip: 'Cube is fully solved!'
              }
            ]
          }
        ]
      },
      {
        id: 'two-look-oll',
        title: '2-Look OLL',
        description: 'Orient the last layer in two simple steps.',
        lessons: [
          { id: 'sc1', title: 'Edge Orientation', explanation: 'Orient all top edges to form a yellow cross.', algorithm: "F R U R' U' F'" },
          { id: 'sc2', title: 'Sune Corner Orientation', explanation: 'Orient corners when one corner is already oriented.', algorithm: "R U R' U R U2 R'" },
          { id: 'sc2b', title: 'Anti-Sune Corner Orientation', explanation: 'Mirror corner orientation for counter-clockwise case.', algorithm: "R U2 R' U' R U' R'" }
        ]
      },
      {
        id: 'two-look-pll',
        title: '2-Look PLL',
        description: 'Permute corners then permute edges.',
        lessons: [
          { id: 'sc3', title: 'T-Perm Corner Swap', explanation: 'Swap two adjacent corners on the top layer.', algorithm: "R U R' U' R' F R2 U' R' U' R U R' F'" },
          { id: 'sc4', title: 'Ub-Perm Edge Cycle', explanation: 'Cycle three top layer edges clockwise.', algorithm: "R2 U R U R' U' R' U' R' U R'" },
          { id: 'sc5', title: 'Ua-Perm Edge Cycle', explanation: 'Cycle three top layer edges counter-clockwise.', algorithm: "R U' R U R U R U' R' U' R2" }
        ]
      }
    ]
  },
  {
    id: 'cfop',
    title: 'CFOP Mastery',
    badge: 'Advanced',
    description: 'The world\'s premier speedcubing method: Cross, Free F2L, 1-Look OLL, and 1-Look PLL.',
    progress: 34,
    modules: [
      {
        id: 'cfop-masterclass',
        title: 'Masterclass: Full CFOP Pro Solve',
        description: 'Advanced sub-10 walkthrough featuring Planned Cross, Rotationless F2L, Full OLL, and Full PLL.',
        lessons: [
          {
            id: 'cfop-masterclass-1',
            title: 'Interactive Masterclass: Full CFOP Pro Solve',
            explanation: 'Inspection Cross -> F2L Pairs 1-4 -> 1-Look OLL -> 1-Look Jb-Perm.',
            algorithm: "F R' D2 R D' U' R U R' U2 R U' R' y' U R U' R' U' R U R' R' U R U' R' U' R L' U L U2 L' U L r U R' U' r' R U R U' R' R U R' F' R U R' U' R' F R2 U' R'",
            scramble: "L2 B2 D2 F2 R2 D B2 R2 D' F2 U' L' B' D F2 R D2 U B' L2",
            isExampleSolve: true,
            phases: [
              {
                name: '1. Cross',
                moves: "F R' D2 R D'",
                explanation: 'Execute pre-inspected 5-move white cross with zero pauses.',
                subtitles: 'Planned in 15s inspection. Place White-Red, White-Green, White-Blue, White-Orange directly.',
                trackingTip: 'Track the first F2L corner during cross execution.'
              },
              {
                name: '2. F2L Pair 1 (FR)',
                moves: "U' R U R' U2 R U' R'",
                explanation: 'First pair: Separate in U layer and insert smoothly into Front-Right slot.',
                subtitles: 'Bring White-Red-Blue corner and Red-Blue edge together, insert with R U\' R\'.',
                trackingTip: 'Look ahead to the back-right pieces while inserting.'
              },
              {
                name: '3. F2L Pair 2 (FL)',
                moves: "y' U R U' R' U' R U R'",
                explanation: 'Second pair: Quick rotation to load and slot into Front-Left slot.',
                subtitles: 'Pair Green-Red pieces and slot with high TPS trigger.',
                trackingTip: 'Keep cube steady and look ahead to Back-Right.'
              },
              {
                name: '4. F2L Pair 3 (BR)',
                moves: "R' U R U' R' U' R",
                explanation: 'Third pair: Rotationless back-slot insertion into Back-Right.',
                subtitles: 'Use R\' U R triggers to solve into the back without rotating the whole cube.',
                trackingTip: 'Leaves front view clear for the final pair.'
              },
              {
                name: '5. F2L Pair 4 (BL)',
                moves: "L' U L U2 L' U L",
                explanation: 'Fourth pair: Clean back-left sweep completing the first two layers.',
                subtitles: 'Pair up final Orange-Blue pieces and insert into BL slot.',
                trackingTip: 'F2L finished! Transition immediately into OLL recognition.'
              },
              {
                name: '6. Full OLL',
                moves: "r U R' U' r' R U R U' R'",
                explanation: '1-Look OLL: Orient all 8 top pieces simultaneously in 1 algorithm.',
                subtitles: 'Recognize T-shape OLL case #33. Execute wide-r trigger to solve yellow face.',
                trackingTip: 'Yellow face is complete in a single algorithm.'
              },
              {
                name: '7. Full PLL',
                moves: "R U R' F' R U R' U' R' F R2 U' R'",
                explanation: '1-Look PLL: Jb-Permutation solves all remaining corners and edges!',
                subtitles: 'Recognize Jb-Perm headlights and bar at Left. Execute Jb-Perm to complete solve.',
                trackingTip: 'Full solve completed in 56 moves!'
              }
            ]
          }
        ]
      },
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
        id: 'roux-masterclass',
        title: 'Masterclass: Full Roux Method Solve',
        description: 'Step-by-step masterclass featuring First Block (FB), Second Block (SB), CMLL, and Last Six Edges (LSE).',
        lessons: [
          {
            id: 'roux-masterclass-1',
            title: 'Interactive Masterclass: Roux Method Solve',
            explanation: 'First Block -> Second Block -> CMLL -> LSE (EO, UL/UR, EP).',
            algorithm: "U' F' L2 D' L' U L' U2 L M' U R U' R' U2 r U' r' R U2 R' U' R U R' U' R U' R' M' U M' U M' U' M' U2 M2 U2 M2 M2 U2 M2",
            scramble: "F2 R2 U2 B2 D2 L' B2 R D2 R' B2 F' L U R' D' B2 L2 U2 F",
            isExampleSolve: true,
            phases: [
              {
                name: '1. First Block (1x2x3 Left)',
                moves: "U' F' L2 D' L' U L' U2 L",
                explanation: 'Build the 1x2x3 block on the left side around the Blue-White-Orange pieces.',
                subtitles: 'Place D-L edge first, then build corner-edge pairs in the left layer.',
                trackingTip: 'Leave the M-slice and right layer completely free.'
              },
              {
                name: '2. Second Block (1x2x3 Right)',
                moves: "M' U R U' R' U2 r U' r'",
                explanation: 'Build the symmetrical 1x2x3 block on the right side using <R, r, M, U> moves.',
                subtitles: 'Use M-slice freely to orient and pair right-side blocks without breaking the left block.',
                trackingTip: 'Both 1x2x3 side blocks are now complete.'
              },
              {
                name: '3. CMLL (Corners of Last Layer)',
                moves: "R U2 R' U' R U R' U' R U' R'",
                explanation: 'Orient and permute all 4 top corners simultaneously without disturbing the blocks.',
                subtitles: 'Recognize Sune CMLL case and execute algorithm to solve all 4 U-layer corners.',
                trackingTip: 'Top corners are solved; only the M-slice and top edges remain.'
              },
              {
                name: '4. LSE Step 4a (Edge Orientation)',
                moves: "M' U M' U M' U' M'",
                explanation: 'Orient the 6 remaining edges (4 top edges + DF/DB edges) using M and U.',
                subtitles: 'Use M\' U M\' to flip bad edges until all 6 edges are oriented.',
                trackingTip: 'All white and yellow stickers now face UP or DOWN.'
              },
              {
                name: '5. LSE Step 4b (UL/UR Edges)',
                moves: "U2 M2 U2 M2",
                explanation: 'Solve the Upper-Left and Upper-Right edges into their corresponding blocks.',
                subtitles: 'Place the Left and Right top edges to complete the left and right faces.',
                trackingTip: 'Only the 4 middle slice edges remain to be solved.'
              },
              {
                name: '6. LSE Step 4c (Last 4 Edges)',
                moves: "M2 U2 M2",
                explanation: 'Permute the last 4 M-slice edges and centers to solve the entire cube!',
                subtitles: 'Execute M2 U2 M2 to align center pieces and remaining edges.',
                trackingTip: 'Cube solved in ultra-low move count!'
              }
            ]
          }
        ]
      },
      {
        id: 'roux-blocks',
        title: 'First Two Blocks',
        description: 'Build 1x2x3 blocks on the left and right sides.',
        lessons: [
          { id: 'r1', title: 'Left Block Setup', explanation: 'Align the D-L edge and build around it.', algorithm: "L U L' U L U2 L'" },
          { id: 'r2', title: 'Right Block Setup', explanation: 'Build the symmetrical 1x2x3 block on the right side.', algorithm: "R U' R' U' R U2 R'" }
        ]
      },
      {
        id: 'roux-cmll',
        title: 'CMLL & M-Slice (LSE)',
        description: 'Solve top corners and permute the last six edges.',
        lessons: [
          { id: 'r3', title: 'Corner Orientation', explanation: 'Orient last layer corners without disturbing the side blocks.', algorithm: "R U R' U' R' F R F'" },
          { id: 'r4', title: 'M-Slice Edge Cycle', explanation: 'Cycle edges using the central M-slice axis.', algorithm: "M2 U M' U2 M U M2" }
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
        id: 'zz-masterclass',
        title: 'Masterclass: Full ZZ Method Solve',
        description: 'Rotationless speedcubing masterclass: EOLine -> Z2L Left -> Z2L Right -> COLL -> EPLL.',
        lessons: [
          {
            id: 'zz-masterclass-1',
            title: 'Interactive Masterclass: ZZ Method Solve',
            explanation: 'EOLine (EO + Line) -> Left Block -> Right Block -> COLL -> EPLL.',
            algorithm: "F' L' D2 R' F D R2 D2 L' U2 L U L' U' L U2 L' U L R U' R' U2 R U R' U' R U R' R U2 R' U' R U' R' R2 U R U R' U' R' U' R' U R'",
            scramble: "R2 U2 B2 R2 D2 F2 L2 U2 B' R2 B L D' B' R' B2 D' F2 U2",
            isExampleSolve: true,
            phases: [
              {
                name: '1. EOLine (EO + Line)',
                moves: "F' L' D2 R' F D R2 D2",
                explanation: 'Orient all 12 cube edges while placing the Down-Front and Down-Back line edges.',
                subtitles: 'Inspect all 12 edges. F/B moves orient bad edges; D2 places the DF and DB line.',
                trackingTip: 'Entire remaining solve is now completely rotation-free (<R, U, L> only)!'
              },
              {
                name: '2. Left Block (Z2L Left)',
                moves: "L' U2 L U L' U' L U2 L' U L",
                explanation: 'Solve the left 1x2x3 block using pure <L, U> moves without cube rotations.',
                subtitles: 'Build Left-Back and Left-Front pairs rotation-free since all edges are oriented.',
                trackingTip: 'No F, B, or D moves needed.'
              },
              {
                name: '3. Right Block (Z2L Right)',
                moves: "R U' R' U2 R U R' U' R U R'",
                explanation: 'Solve the right 1x2x3 block using pure <R, U> moves.',
                subtitles: 'Slot Right-Back and Right-Front pairs smoothly with zero regrips or rotations.',
                trackingTip: 'First two layers are complete and all top edges are already oriented!'
              },
              {
                name: '4. COLL (Corners of Last Layer)',
                moves: "R U2 R' U' R U' R'",
                explanation: 'Orient and permute all top layer corners simultaneously.',
                subtitles: 'Since edges are already oriented, COLL solves all 4 corners in 1 algorithm.',
                trackingTip: 'Leaves only the 4 top edges to be permuted.'
              },
              {
                name: '5. EPLL (Edge Permutation of Last Layer)',
                moves: "R2 U R U R' U' R' U' R' U R'",
                explanation: 'Permute the last 4 top edges with a single Ub-Perm to solve the cube!',
                subtitles: 'Execute Ub-Perm (R2 U R U R\' U\' R\' U\' R\' U R\') to finish the ZZ solve.',
                trackingTip: 'Zero rotations throughout the entire solve!'
              }
            ]
          }
        ]
      },
      {
        id: 'zz-eoline',
        title: 'EOLine Setup',
        description: 'Orient all edges and place the DF and DB line edges.',
        lessons: [
          { id: 'z1', title: 'Edge Orientation (EO)', explanation: 'Orient bad edges to make the rest of the solve completely rotationless.', algorithm: "F R U R' U' F'" },
          { id: 'z2', title: 'Line Placement', explanation: 'Align the front-bottom and back-bottom line edges.', algorithm: "D R2 L2 D'" }
        ]
      },
      {
        id: 'zz-f2l',
        title: 'Rotationless F2L & LL',
        description: 'Complete the first two layers using only U, R, L moves.',
        lessons: [
          { id: 'z3', title: 'Right Block Slotting', explanation: 'Solve right side slots rotation-free using U/R moves.', algorithm: "R U R' U' R U R'" },
          { id: 'z4', title: 'Left Block Slotting', explanation: 'Solve left side slots rotation-free using U/L moves.', algorithm: "L U' L' U L U' L'" }
        ]
      }
    ]
  }
];