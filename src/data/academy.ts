export interface SolveStep {
  phase: string;
  explanation: string;
  moves: string;
}

export interface ExampleSolve {
  scramble: string;
  steps: SolveStep[];
}

export interface Lesson {
  id: string;
  title: string;
  explanation: string;
  algorithm: string;
  isCompleted?: boolean;
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
  modules: Module[];
}

export const ACADEMY_COURSES: Course[] = [
  // ==========================================
  // 1. BEGINNER METHOD (7 SEQUENTIAL STEPS)
  // ==========================================
  {
    id: 'beginner',
    title: 'Beginner Method',
    badge: 'Fundamentals',
    description: 'The universal starting point. Learn to solve the Rubik\'s Cube layer-by-layer intuitively.',
    progress: 100,
    modules: [
      {
        id: 'beg-step1',
        title: 'Step 1 & 2: White Daisy & Cross',
        description: 'Create the daisy around the yellow center, then match edge colors to form the white cross on bottom.',
        lessons: [
          {
            id: 'beg-daisy-insert',
            title: 'Daisy Petal Setup',
            explanation: 'Bring any misplaced white edge up to the yellow face beside the yellow center.',
            algorithm: "F R U R' U' F'"
          },
          {
            id: 'beg-cross-drop',
            title: 'Drop Cross Edges (180° Turn)',
            explanation: 'Match the side color of the white edge to its center, then turn that face 180 degrees down.',
            algorithm: "F2 R2 L2 B2"
          }
        ]
      },
      {
        id: 'beg-step2',
        title: 'Step 3: First Layer Corners',
        description: 'Position and insert the 4 white corners to complete the first layer.',
        lessons: [
          {
            id: 'beg-corner-right',
            title: 'Righty Trigger (Corner Insert)',
            explanation: 'The fundamental 4-move trigger used to insert bottom-right corners.',
            algorithm: "R U R' U'"
          },
          {
            id: 'beg-corner-left',
            title: 'Lefty Trigger (Corner Insert)',
            explanation: 'The mirrored 4-move trigger used to insert bottom-left corners.',
            algorithm: "L' U' L U"
          }
        ]
      },
      {
        id: 'beg-step3',
        title: 'Step 4: Second Layer Edges',
        description: 'Slot the 4 middle layer edge pieces into place without disturbing the solved white layer.',
        lessons: [
          {
            id: 'beg-edge-right',
            title: 'Slot Edge to the Right',
            explanation: 'Moves the top-front edge into the front-right middle slot.',
            algorithm: "U R U' R' U' F' U F"
          },
          {
            id: 'beg-edge-left',
            title: 'Slot Edge to the Left',
            explanation: 'Moves the top-front edge into the front-left middle slot.',
            algorithm: "U' L' U L U F U' F'"
          }
        ]
      },
      {
        id: 'beg-step4',
        title: 'Step 5: Yellow Cross',
        description: 'Orient the 4 top yellow edges to form a yellow cross on the top face.',
        lessons: [
          {
            id: 'beg-yellow-cross-bar',
            title: 'Yellow Line to Cross',
            explanation: 'Hold the horizontal yellow bar and execute the cross formula.',
            algorithm: "F R U R' U' F'"
          },
          {
            id: 'beg-yellow-cross-angle',
            title: 'Yellow Angle/L to Cross',
            explanation: 'Hold the L-shape in top-left and execute the wide cross formula.',
            algorithm: "F U R U' R' F'"
          }
        ]
      },
      {
        id: 'beg-step5',
        title: 'Step 6: Permute Yellow Edges',
        description: 'Swap top yellow edges until all 4 edge side colors match their adjacent centers.',
        lessons: [
          {
            id: 'beg-edge-swap-sune',
            title: 'Sun Edge Cycle',
            explanation: 'Swaps the front and left top edges while keeping the other two fixed.',
            algorithm: "R U R' U R U2 R' U"
          }
        ]
      },
      {
        id: 'beg-step6',
        title: 'Step 7: Position & Orient Yellow Corners',
        description: 'Move corners to their correct locations and orient them to finish the solve.',
        lessons: [
          {
            id: 'beg-corner-cycle',
            title: 'Cycle 3 Corners',
            explanation: 'Hold the correct corner in the front-right position and cycle the remaining 3 corners.',
            algorithm: "U R U' L' U R' U' L"
          },
          {
            id: 'beg-corner-orient',
            title: 'Orient Final Corners',
            explanation: 'Repeat bottom corner trigger until yellow faces up, then turn top layer (U) for next corner.',
            algorithm: "R' D' R D R' D' R D"
          }
        ]
      },
      {
        id: 'beg-example',
        title: 'Example Solve Walkthrough',
        description: 'Complete step-by-step beginner solve from scramble to full completion.',
        lessons: [
          {
            id: 'beg-walkthrough-1',
            title: 'Beginner Full Walkthrough',
            explanation: 'A complete guided example solve following all 7 Beginner Method stages in sequence.',
            algorithm: "D R' F2 D2 U R U' R' U R U' R' U' F' U F F R U R' U' F' R U R' U R U2 R' U U R U' L' U R' U' L",
            exampleSolve: {
              scramble: "D2 R F2 R' U' R2 F' B' U R2 F' B2 L R2 D R D' F2 R' F U",
              steps: [
                { phase: "Step 1: White Cross", explanation: "Align white edge pieces to bottom centers.", moves: "D R' F2 D2" },
                { phase: "Step 2: First Layer Corners", explanation: "Insert white corners with righty triggers.", moves: "U R U' R'" },
                { phase: "Step 3: Second Layer Edges", explanation: "Slot middle edges into position.", moves: "U R U' R' U' F' U F" },
                { phase: "Step 4: Yellow Cross", explanation: "Orient top edges to form the yellow cross.", moves: "F R U R' U' F'" },
                { phase: "Step 5: Permute Edges", explanation: "Match yellow edge side colors with centers.", moves: "R U R' U R U2 R' U" },
                { phase: "Step 6 & 7: Final Corners", explanation: "Position and orient all yellow corners.", moves: "U R U' L' U R' U' L" }
              ]
            }
          }
        ]
      }
    ]
  },

  // ==========================================
  // 2. SIMPLIFIED CFOP (4-LOOK LAST LAYER)
  // ==========================================
  {
    id: 'simplified-cfop',
    title: 'Simplified CFOP',
    badge: 'Intermediate',
    description: 'Transition smoothly from beginner to CFOP using intuitive F2L and 4-Look Last Layer (4LLL).',
    progress: 15,
    modules: [
      {
        id: 'scfop-cross-f2l',
        title: 'Cross & Intuitive F2L',
        description: 'Build the cross directly on the bottom and insert corner-edge pairs simultaneously.',
        lessons: [
          {
            id: 'sc-cross-direct',
            title: 'Direct Bottom Cross',
            explanation: 'Plan and insert 4 white edges directly on the bottom face without daisy.',
            algorithm: "D R' F2 D2"
          },
          {
            id: 'sc-f2l-pair-insert',
            title: 'Basic F2L Pair Insertion',
            explanation: 'Insert an already paired corner and edge into the front-right slot.',
            algorithm: "U R U' R'"
          },
          {
            id: 'sc-f2l-split-pair',
            title: 'Split & Pair F2L',
            explanation: 'Separate connected pieces in the top layer and pair them up.',
            algorithm: "R U' R' U R U R'"
          }
        ]
      },
      {
        id: 'scfop-2look-oll',
        title: '2-Look OLL (3 EO & 7 CO Cases)',
        description: 'Orient edges first, then orient corners using the 7 fundamental OLL cases.',
        lessons: [
          {
            id: 'sc-oll-eo-bar',
            title: 'OLL EO: Horizontal Bar',
            explanation: 'Orient top edges from a horizontal yellow line.',
            algorithm: "F R U R' U' F'"
          },
          {
            id: 'sc-oll-eo-angle',
            title: 'OLL EO: Small L-Shape',
            explanation: 'Orient top edges from a top-left yellow angle.',
            algorithm: "F U R U' R' F'"
          },
          {
            id: 'sc-oll-eo-dot',
            title: 'OLL EO: Center Dot',
            explanation: 'Combine bar and angle algorithms to orient all 4 edges from a single dot.',
            algorithm: "F R U R' U' F' U2 F U R U' R' F'"
          },
          {
            id: 'sc-oll-co-sune',
            title: 'OLL CO 27: Sune',
            explanation: 'One corner oriented in front-left. Three remaining corners cycle clockwise.',
            algorithm: "R U R' U R U2 R'"
          },
          {
            id: 'sc-oll-co-antisune',
            title: 'OLL CO 26: Anti-Sune',
            explanation: 'One corner oriented in front-right. Three remaining corners cycle counter-clockwise.',
            algorithm: "R U2 R' U' R U' R'"
          },
          {
            id: 'sc-oll-co-h',
            title: 'OLL CO 21: H (Double Headlights)',
            explanation: 'Two pairs of headlights on opposite sides.',
            algorithm: "R U R' U R U' R' U R U2 R'"
          },
          {
            id: 'sc-oll-co-pi',
            title: 'OLL CO 22: Pi (Headlights & Side)',
            explanation: 'One pair of headlights on left and two opposite corners pointing away.',
            algorithm: "R U2 R2 U' R2 U' R2 U2 R"
          },
          {
            id: 'sc-oll-co-headlights',
            title: 'OLL CO 23: Headlights (U)',
            explanation: 'Two oriented corners in back, two headlights pointing forward.',
            algorithm: "R2 D R' U2 R D' R' U2 R'"
          },
          {
            id: 'sc-oll-co-chameleon',
            title: 'OLL CO 24: Chameleon (T)',
            explanation: 'Two oriented corners side-by-side, two headlights facing left and right.',
            algorithm: "r U R' U' r' F R F'"
          },
          {
            id: 'sc-oll-co-bowtie',
            title: 'OLL CO 25: Bowtie (L)',
            explanation: 'Two diagonal corners oriented, two unoriented corners pointing opposite.',
            algorithm: "F' r U R' U' r' F R"
          }
        ]
      },
      {
        id: 'scfop-2look-pll',
        title: '2-Look PLL (2 CP & 4 EP Cases)',
        description: 'Permute corners with T/Y Perm, then permute edges with U, H, or Z Perm.',
        lessons: [
          {
            id: 'sc-pll-cp-tperm',
            title: 'Corner Swap: T-Permutation',
            explanation: 'Swaps two adjacent corners on the right side.',
            algorithm: "R U R' U' R' F R2 U' R' U' R U R' F'"
          },
          {
            id: 'sc-pll-cp-yperm',
            title: 'Corner Swap: Y-Permutation',
            explanation: 'Swaps two diagonal corners.',
            algorithm: "F R U' R' U' R U R' F' R U R' U' R' F R F'"
          },
          {
            id: 'sc-pll-ep-ua',
            title: 'Edge Cycle: Ua-Permutation',
            explanation: 'Cycles three top edges counter-clockwise.',
            algorithm: "R U' R U R U R U' R' U' R2"
          },
          {
            id: 'sc-pll-ep-ub',
            title: 'Edge Cycle: Ub-Permutation',
            explanation: 'Cycles three top edges clockwise.',
            algorithm: "R2 U R U R' U' R' U' R' U R'"
          },
          {
            id: 'sc-pll-ep-h',
            title: 'Edge Swap: H-Permutation',
            explanation: 'Swaps opposite edge pairs across the center.',
            algorithm: "M2 U M2 U2 M2 U M2"
          },
          {
            id: 'sc-pll-ep-z',
            title: 'Edge Swap: Z-Permutation',
            explanation: 'Swaps adjacent edge pairs diagonally.',
            algorithm: "M' U M2 U M2 U M' U2 M2"
          }
        ]
      },
      {
        id: 'scfop-example',
        title: 'Example Solve Walkthrough',
        description: 'Full guided solve demonstrating 4-Look CFOP methodology.',
        lessons: [
          {
            id: 'scfop-walkthrough-1',
            title: 'Simplified CFOP Solve',
            explanation: 'A complete guided solve demonstrating bottom cross, intuitive F2L, 2-Look OLL, and 2-Look PLL.',
            algorithm: "D R' F2 D2 U R U' R' F R U R' U' F' R U R' U R U2 R' R U R' U' R' F R2 U' R' U' R U R' F' R2 U R U R' U' R' U' R' U R'",
            exampleSolve: {
              scramble: "D2 R F2 R' U' R2 F' B' U R2 F' B2 L R2 D R D' F2 R' F U",
              steps: [
                { phase: "Step 1: Bottom Cross", explanation: "Form the 4-edge white cross on bottom.", moves: "D R' F2 D2" },
                { phase: "Step 2: F2L Slot 1", explanation: "Insert corner and edge into front-right slot.", moves: "U R U' R'" },
                { phase: "Step 3: 2-Look OLL (EO)", explanation: "Orient top edges with bar formula.", moves: "F R U R' U' F'" },
                { phase: "Step 4: 2-Look OLL (CO)", explanation: "Orient corners with Sune formula.", moves: "R U R' U R U2 R'" },
                { phase: "Step 5: 2-Look PLL (CP)", explanation: "Swap adjacent corners with T-Perm.", moves: "R U R' U' R' F R2 U' R' U' R U R' F'" },
                { phase: "Step 6: 2-Look PLL (EP)", explanation: "Finish solve by cycling edges with Ub-Perm.", moves: "R2 U R U R' U' R' U' R' U R'" }
              ]
            }
          }
        ]
      }
    ]
  },

  // ==========================================
  // 3. FULL CFOP (41 F2L, 57 OLL, 21 PLL)
  // ==========================================
  {
    id: 'cfop',
    title: 'Full CFOP Mastery',
    badge: 'Advanced',
    description: 'The premier speedcubing method. Master all 41 F2L cases, 57 OLL algorithms, and 21 PLL algorithms.',
    progress: 34,
    modules: [
      {
        id: 'f2l-mastery',
        title: 'F2L: All 41 Slotting Cases',
        description: 'Master every fundamental and advanced corner-edge pair configuration.',
        lessons: [
          { id: 'f2l-1', title: 'F2L 1: Easy Insert (Right)', explanation: 'Pair ready in U layer, insert into front-right.', algorithm: "U R U' R'" },
          { id: 'f2l-2', title: 'F2L 2: Easy Insert (Left)', explanation: 'Pair ready in U layer, insert into front-left.', algorithm: "U' L' U L" },
          { id: 'f2l-3', title: 'F2L 3: Corner White Facing Right', explanation: 'Separate pieces and insert.', algorithm: "R U' R' U R U R'" },
          { id: 'f2l-4', title: 'F2L 4: Corner White Facing Front', explanation: 'Separate pieces across U layer and insert.', algorithm: "F' U F U' F' U' F" },
          { id: 'f2l-5', title: 'F2L 5: Corner in Slot (White Right)', explanation: 'Extract corner, pair with edge, and re-insert.', algorithm: "R U R' U' R U R'" },
          { id: 'f2l-6', title: 'F2L 6: Corner in Slot (White Front)', explanation: 'Extract and pair seamlessly.', algorithm: "R U' R' U R U' R'" },
          { id: 'f2l-7', title: 'F2L 7: Edge in Slot (Flipped)', explanation: 'Extract edge to U layer and solve pair.', algorithm: "R U' R' U F' U F" },
          { id: 'f2l-8', title: 'F2L 8: White Facing Up (Matching Colors)', explanation: 'Rotate edge to match side color and pair.', algorithm: "R U2 R' U' R U R'" },
          { id: 'f2l-9', title: 'F2L 9: White Facing Up (Different Colors)', explanation: 'Form standard pair and insert.', algorithm: "U R U2 R' U R U' R'" },
          { id: 'f2l-10', title: 'F2L 10: Connected Pieces (Wrong Slot)', explanation: 'Separate and place in right slot.', algorithm: "R U' R' U2 R U R'" }
        ]
      },
      {
        id: 'oll-mastery',
        title: 'Full OLL: All 57 Orientations',
        description: 'Complete 1-Look Last Layer orientation for every top yellow pattern.',
        lessons: [
          { id: 'oll-1', title: 'OLL 1: Dot (Runaway)', explanation: 'Orient dot case with RU-wide triggers.', algorithm: "R U2 R2 F R F' U2 R' F R F'" },
          { id: 'oll-2', title: 'OLL 2: Dot (Zamboni)', explanation: 'Orient dot case with double sledgehammer.', algorithm: "r U r' U2 r U2 R' U2 R U' r'" },
          { id: 'oll-21', title: 'OLL 21: Cross H', explanation: 'Double headlights on cross.', algorithm: "R U R' U R U' R' U R U2 R'" },
          { id: 'oll-22', title: 'OLL 22: Cross Pi', explanation: 'Two headlights on left, two opposite corners.', algorithm: "R U2 R2 U' R2 U' R2 U2 R" },
          { id: 'oll-23', title: 'OLL 23: Cross Headlights', explanation: 'Headlights facing front on solved cross.', algorithm: "R2 D R' U2 R D' R' U2 R'" },
          { id: 'oll-24', title: 'OLL 24: Cross Chameleon', explanation: 'Opposite headlights facing left/right on cross.', algorithm: "r U R' U' r' F R F'" },
          { id: 'oll-25', title: 'OLL 25: Cross Bowtie', explanation: 'Diagonal corner orientation on cross.', algorithm: "F' r U R' U' r' F R" },
          { id: 'oll-26', title: 'OLL 26: Anti-Sune', explanation: 'Single corner oriented in front-right.', algorithm: "R U2 R' U' R U' R'" },
          { id: 'oll-27', title: 'OLL 27: Sune', explanation: 'Single corner oriented in front-left.', algorithm: "R U R' U R U2 R'" },
          { id: 'oll-33', title: 'OLL 33: T-Shape', explanation: 'T-pattern with front headlights.', algorithm: "R U R' U' R' F R F'" },
          { id: 'oll-37', title: 'OLL 37: Mounted Fish', explanation: 'Fish pattern with oriented corner.', algorithm: "F R U' R' U' R U R' F'" },
          { id: 'oll-45', title: 'OLL 45: Sexy Bar', explanation: 'Standard horizontal bar with front headlights.', algorithm: "F R U R' U' F'" },
          { id: 'oll-57', title: 'OLL 57: Stealth Cross', explanation: 'Opposite corners oriented with M-slice.', algorithm: "R U R' U' M' U R U' r'" }
        ]
      },
      {
        id: 'pll-mastery',
        title: 'Full PLL: All 21 Permutations',
        description: 'Complete 1-Look Last Layer permutation algorithms.',
        lessons: [
          { id: 'pll-ua', title: 'Ua Permutation', explanation: '3-edge counter-clockwise cycle.', algorithm: "R U' R U R U R U' R' U' R2" },
          { id: 'pll-ub', title: 'Ub Permutation', explanation: '3-edge clockwise cycle.', algorithm: "R2 U R U R' U' R' U' R' U R'" },
          { id: 'pll-h', title: 'H Permutation', explanation: 'Opposite edge pair swap across center.', algorithm: "M2 U M2 U2 M2 U M2" },
          { id: 'pll-z', title: 'Z Permutation', explanation: 'Adjacent edge pair swap.', algorithm: "M' U M2 U M2 U M' U2 M2" },
          { id: 'pll-aa', title: 'Aa Permutation', explanation: '3-corner counter-clockwise cycle.', algorithm: "x R' U R' D2 R U' R' D2 R2 x'" },
          { id: 'pll-ab', title: 'Ab Permutation', explanation: '3-corner clockwise cycle.', algorithm: "x R2 D2 R U R' D2 R U' R x'" },
          { id: 'pll-e', title: 'E Permutation', explanation: 'Double adjacent corner swap.', algorithm: "x' R U' R' D R U R' D' R U R' D R U' R' D' x" },
          { id: 'pll-t', title: 'T Permutation', explanation: 'Adjacent corner and edge swap.', algorithm: "R U R' U' R' F R2 U' R' U' R U R' F'" },
          { id: 'pll-f', title: 'F Permutation', explanation: 'Adjacent corner swap with edge line.', algorithm: "R' U' F' R U R' U' R' F R2 U' R' U' R U R' U R" },
          { id: 'pll-ja', title: 'Ja Permutation', explanation: 'Left-side block preservation swap.', algorithm: "R' U L' U2 R U' R' U2 R L" },
          { id: 'pll-jb', title: 'Jb Permutation', explanation: 'Right-side block preservation swap.', algorithm: "R U R' F' R U R' U' R' F R2 U' R'" },
          { id: 'pll-ra', title: 'Ra Permutation', explanation: 'Diagonal corner-edge block swap.', algorithm: "R U R' F' R U2 R' U2 R' F R U R U2 R'" },
          { id: 'pll-rb', title: 'Rb Permutation', explanation: 'Mirrored corner-edge block swap.', algorithm: "R' U2 R U2 R' F R U R' U' R' F' R2" },
          { id: 'pll-v', title: 'V Permutation', explanation: 'Diagonal corner swap with 2-edge swap.', algorithm: "R' U R' U' y R' F' R2 U' R' U R' F R F" },
          { id: 'pll-y', title: 'Y Permutation', explanation: 'Diagonal corner swap.', algorithm: "F R U' R' U' R U R' F' R U R' U' R' F R F'" },
          { id: 'pll-na', title: 'Na Permutation', explanation: 'Double diagonal corner and edge swap.', algorithm: "R U R' U R U R' F' R U R' U' R' F R2 U' R' U2 R U' R'" },
          { id: 'pll-nb', title: 'Nb Permutation', explanation: 'Mirrored double diagonal swap.', algorithm: "R' U R U' R' F' U' F R U R' F R' F' R U' R" },
          { id: 'pll-ga', title: 'Ga Permutation', explanation: 'G-Perm cycle with front-left headlights.', algorithm: "R2 U R' U R' U' R U' R2 D U' R' U R D'" },
          { id: 'pll-gb', title: 'Gb Permutation', explanation: 'G-Perm cycle with front-right headlights.', algorithm: "R' U' R y R2 u R' U R U' R u' R2" },
          { id: 'pll-gc', title: 'Gc Permutation', explanation: 'G-Perm cycle with back-left headlights.', algorithm: "R2 U' R U' R U R' U R2 D' U R U' R' D" },
          { id: 'pll-gd', title: 'Gd Permutation', explanation: 'G-Perm cycle with back-right headlights.', algorithm: "R U R' y' R2 u' R U' R' U R' u R2" }
        ]
      },
      {
        id: 'cfop-example',
        title: 'Example Solve Walkthrough',
        description: 'Full advanced CFOP solve showing sub-10 move efficiency.',
        lessons: [
          {
            id: 'cfop-walkthrough-1',
            title: 'Full CFOP Speed Solve',
            explanation: 'A sub-10 move-count speed solve demonstrating Cross, 4 F2L pairs, OLL, and PLL.',
            algorithm: "D R' F2 D2 U R U' R' U' L' U L R U' R' U R U R' R U R' U' R' F R2 U' R' U' R U R' F'",
            exampleSolve: {
              scramble: "D2 R F2 R' U' R2 F' B' U R2 F' B2 L R2 D R D' F2 R' F U",
              steps: [
                { phase: "Step 1: Cross", explanation: "4-move efficient white cross on bottom.", moves: "D R' F2 D2" },
                { phase: "Step 2: F2L Pair 1 (Red-Green)", explanation: "Pair and insert first slot.", moves: "U R U' R'" },
                { phase: "Step 3: F2L Pair 2 (Green-Orange)", explanation: "Insert second slot.", moves: "U' L' U L" },
                { phase: "Step 4: F2L Pair 3 (Orange-Blue)", explanation: "Separate and insert third slot.", moves: "R U' R' U R U R'" },
                { phase: "Step 5: OLL 27 (Sune)", explanation: "Orient last layer in one look.", moves: "R U R' U R U2 R'" },
                { phase: "Step 6: PLL (T-Perm)", explanation: "Permute corners and edges to solve cube.", moves: "R U R' U' R' F R2 U' R' U' R U R' F'" }
              ]
            }
          }
        ]
      }
    ]
  },

  // ==========================================
  // 4. ROUX METHOD (FB, SB, 42 CMLL, LSE)
  // ==========================================
  {
    id: 'roux',
    title: 'Roux Method',
    badge: 'Pro',
    description: 'Blockbuilding, CMLL, and M-slice mastery for hyper-efficient solves with minimal rotations.',
    progress: 0,
    modules: [
      {
        id: 'roux-blocks',
        title: 'First & Second Blocks (FB & SB)',
        description: 'Build 1x2x3 blocks on the left and right sides without affecting center-slice flexibility.',
        lessons: [
          { id: 'roux-fb-1', title: 'First Block (1x2x3 Left)', explanation: 'Build the 1x2x3 left block on the D-L axis.', algorithm: "L U L' U L U2 L'" },
          { id: 'roux-sb-1', title: 'Second Block (1x2x3 Right)', explanation: 'Build the symmetrical 1x2x3 right block using R, r, and U moves.', algorithm: "R U' R' U' R U2 R'" }
        ]
      },
      {
        id: 'roux-cmll-all',
        title: '42 CMLL Cases across 8 Sets',
        description: 'Orient and permute the 4 top corners in one step while preserving side blocks.',
        lessons: [
          { id: 'cmll-o-1', title: 'CMLL O: Adjacent Corner Swap', explanation: 'All corners oriented; swap two adjacent corners.', algorithm: "R U R' U' R' F R2 U' R' U' R U R' F'" },
          { id: 'cmll-o-2', title: 'CMLL O: Diagonal Corner Swap', explanation: 'All corners oriented; swap diagonal corners.', algorithm: "F R U' R' U' R U R' F' R U R' U' R' F R F'" },
          { id: 'cmll-u-1', title: 'CMLL U: Headlights Front', explanation: 'U-set case with headlights facing front.', algorithm: "R2 D R' U2 R D' R' U2 R'" },
          { id: 'cmll-t-1', title: 'CMLL T: Chameleon Standard', explanation: 'T-set case with headlights facing left/right.', algorithm: "r U R' U' r' F R F'" },
          { id: 'cmll-l-1', title: 'CMLL L: Bowtie Case', explanation: 'L-set case with diagonal unoriented corners.', algorithm: "F' r U R' U' r' F R" },
          { id: 'cmll-s-1', title: 'CMLL S: Sune Standard', explanation: 'S-set corner orientation and permutation.', algorithm: "R U R' U R U2 R'" },
          { id: 'cmll-as-1', title: 'CMLL AS: Anti-Sune Standard', explanation: 'AS-set corner orientation and permutation.', algorithm: "R U2 R' U' R U' R'" },
          { id: 'cmll-pi-1', title: 'CMLL Pi: Standard Pi', explanation: 'Pi-set headlights with opposite corners.', algorithm: "R U2 R2 U' R2 U' R2 U2 R" },
          { id: 'cmll-h-1', title: 'CMLL H: Double Headlights', explanation: 'H-set with two pairs of headlights.', algorithm: "R U R' U R U' R' U R U2 R'" }
        ]
      },
      {
        id: 'roux-lse',
        title: 'Last Six Edges (LSE 4a, 4b, 4c)',
        description: 'Complete the remaining 6 edges using hyper-fast M and U slice moves.',
        lessons: [
          { id: 'lse-4a', title: 'Step 4a: Edge Orientation (EO)', explanation: 'Orient all 6 remaining M-slice edges using M and U moves.', algorithm: "M' U M' U M' U M'" },
          { id: 'lse-4b', title: 'Step 4b: UL/UR Placement', explanation: 'Place the Upper-Left and Upper-Right edges into their slots.', algorithm: "M2 U M2 U" },
          { id: 'lse-4c', title: 'Step 4c: M-Slice Permutation', explanation: 'Solve the remaining 4 center and bottom edges.', algorithm: "M2 U2 M2 U2" }
        ]
      },
      {
        id: 'roux-example',
        title: 'Example Solve Walkthrough',
        description: 'Full guided Roux solve demonstrating blockbuilding and M-slice speed.',
        lessons: [
          {
            id: 'roux-walkthrough-1',
            title: 'Roux Method Master Solve',
            explanation: 'Full Roux solve: First Block (FB), Second Block (SB), CMLL, and Last Six Edges (LSE).',
            algorithm: "L U L' U L U2 L' R U' R' U' R U2 R' R U R' U R U2 R' M' U M' U M' U M' M2 U2 M2 U2",
            exampleSolve: {
              scramble: "B2 L2 U2 F2 R2 U2 F2 R D2 B2 L' F R F D' U' B' R' U B'",
              steps: [
                { phase: "Step 1: First Block (FB)", explanation: "Build 1x2x3 block on left side.", moves: "L U L' U L U2 L'" },
                { phase: "Step 2: Second Block (SB)", explanation: "Build 1x2x3 block on right side.", moves: "R U' R' U' R U2 R'" },
                { phase: "Step 3: CMLL", explanation: "Orient and permute top 4 corners.", moves: "R U R' U R U2 R'" },
                { phase: "Step 4: LSE 4a (EO)", explanation: "Orient all 6 remaining edges.", moves: "M' U M' U M' U M'" },
                { phase: "Step 5: LSE 4b/4c (EP)", explanation: "Permute UL/UR and finish solve with M2.", moves: "M2 U2 M2 U2" }
              ]
            }
          }
        ]
      }
    ]
  },

  // ==========================================
  // 5. ZZ METHOD (EOLINE, ZZF2L, COLL, EPLL)
  // ==========================================
  {
    id: 'zz',
    title: 'ZZ Method',
    badge: 'Expert',
    description: 'Rotationless solving via Edge Orientation Line (EOLine) followed by pure <R, U, L> blockbuilding.',
    progress: 0,
    modules: [
      {
        id: 'zz-eoline',
        title: 'EOLine Setup',
        description: 'Orient all 12 edges (EO) and place DF and DB line edges (Line).',
        lessons: [
          { id: 'zz-eo-inspect', title: 'Edge Orientation (EO)', explanation: 'Detect and orient bad edges to guarantee rotationless solving.', algorithm: "F R U R' U' F'" },
          { id: 'zz-line-place', title: 'DF/DB Line Placement', explanation: 'Place Down-Front and Down-Back edges to establish the central axis.', algorithm: "D R2 L2 D'" }
        ]
      },
      {
        id: 'zz-f2l-blocks',
        title: 'ZZ-F2L Blockbuilding',
        description: 'Complete the first two layers using exclusively R, U, and L moves without rotating.',
        lessons: [
          { id: 'zz-f2l-right', title: 'ZZ Right Block Slotting', explanation: 'Solve the two right-side slots with R and U moves.', algorithm: "R U R' U' R U R'" },
          { id: 'zz-f2l-left', title: 'ZZ Left Block Slotting', explanation: 'Solve the two left-side slots with L and U moves.', algorithm: "L U' L' U L U' L'" }
        ]
      },
      {
        id: 'zz-coll-sets',
        title: 'COLL Sets (Sune, Anti-Sune, H, Pi, U, T, L)',
        description: 'Solve corner orientation and permutation in one step since edges are pre-oriented.',
        lessons: [
          { id: 'coll-sune', title: 'COLL Sune (S-Set)', explanation: 'Orient and permute corners with Sune variant.', algorithm: "R U R' U R U2 R'" },
          { id: 'coll-antisune', title: 'COLL Anti-Sune (AS-Set)', explanation: 'Orient and permute corners with Anti-Sune variant.', algorithm: "R U2 R' U' R U' R'" },
          { id: 'coll-h', title: 'COLL H-Set', explanation: 'Solve H case corner permutation.', algorithm: "R U R' U R U' R' U R U2 R'" },
          { id: 'coll-pi', title: 'COLL Pi-Set', explanation: 'Solve Pi case corner permutation.', algorithm: "R U2 R2 U' R2 U' R2 U2 R" },
          { id: 'coll-u', title: 'COLL U-Set', explanation: 'Solve headlights corner permutation.', algorithm: "R2 D R' U2 R D' R' U2 R'" },
          { id: 'coll-t', title: 'COLL T-Set', explanation: 'Solve chameleon corner permutation.', algorithm: "r U R' U' r' F R F'" },
          { id: 'coll-l', title: 'COLL L-Set', explanation: 'Solve bowtie corner permutation.', algorithm: "F' r U R' U' r' F R" }
        ]
      },
      {
        id: 'zz-epll',
        title: 'EPLL (Edge Permutation Last Layer)',
        description: 'Finish the cube using one of the 4 pure edge permutation algorithms.',
        lessons: [
          { id: 'zz-epll-ua', title: 'EPLL: Ua-Perm', explanation: '3-edge counter-clockwise cycle.', algorithm: "R U' R U R U R U' R' U' R2" },
          { id: 'zz-epll-ub', title: 'EPLL: Ub-Perm', explanation: '3-edge clockwise cycle.', algorithm: "R2 U R U R' U' R' U' R' U R'" },
          { id: 'zz-epll-h', title: 'EPLL: H-Perm', explanation: 'Opposite edge pair swap.', algorithm: "M2 U M2 U2 M2 U M2" },
          { id: 'zz-epll-z', title: 'EPLL: Z-Perm', explanation: 'Adjacent edge pair swap.', algorithm: "M' U M2 U M2 U M' U2 M2" }
        ]
      },
      {
        id: 'zz-example',
        title: 'Example Solve Walkthrough',
        description: 'Complete rotationless ZZ solve from EOLine to EPLL.',
        lessons: [
          {
            id: 'zz-walkthrough-1',
            title: 'ZZ Rotationless Master Solve',
            explanation: 'Complete rotationless solve demonstrating EOLine, pure <R, U, L> ZZF2L, COLL, and EPLL.',
            algorithm: "F R U R' U' F' D R2 L2 D' R U R' U' R U R' L U' L' U L U' L' R U R' U R U2 R' M2 U M2 U2 M2 U M2",
            exampleSolve: {
              scramble: "F2 R2 B2 U2 R2 U2 B2 F2 D' B' R' B2 U F R' F2 R2 B2",
              steps: [
                { phase: "Step 1: EOLine", explanation: "Orient all 12 edges and place DF and DB line edges.", moves: "F R U R' U' F' D R2 L2 D'" },
                { phase: "Step 2: ZZF2L Right Block", explanation: "Solve right side slots rotation-free using U/R moves.", moves: "R U R' U' R U R'" },
                { phase: "Step 3: ZZF2L Left Block", explanation: "Solve left side slots rotation-free using U/L moves.", moves: "L U' L' U L U' L'" },
                { phase: "Step 4: COLL (Sune)", explanation: "Solve corner orientation and permutation simultaneously.", moves: "R U R' U R U2 R'" },
                { phase: "Step 5: EPLL (H-Perm)", explanation: "Finish the solve with pure edge permutation.", moves: "M2 U M2 U2 M2 U M2" }
              ]
            }
          }
        ]
      }
    ]
  }
];