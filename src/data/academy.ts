export interface Lesson {
  id: string;
  title: string;
  explanation: string;
  algorithm: string;
  difficulty?: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert' | 'Pro';
  estimatedTime?: string;
  fingerTrickTips?: string;
  isCompleted?: boolean;
  isExampleSolve?: boolean;
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
  // 1. BEGINNER METHOD (7 Steps + Example Solve)
  // ==========================================
  {
    id: 'beginner',
    title: 'Beginner Method',
    badge: 'Fundamentals',
    description: 'The classic layer-by-layer method. Learn intuitive cross building, corner insertion, middle layer slotting, and 4-step last layer resolution.',
    progress: 0,
    modules: [
      {
        id: 'beginner-step1',
        title: 'Step 1: White Cross (Daisy Method)',
        description: 'Form a white cross on the bottom layer while aligning the adjacent edge colors with matching center pieces.',
        lessons: [
          {
            id: 'beg_1',
            title: 'White Cross / Daisy Alignment',
            explanation: 'Position white edge pieces around the yellow center (Daisy) and rotate 180 degrees to the white face once side colors match.',
            algorithm: 'F2 R2 L2 B2',
            difficulty: 'Beginner',
            estimatedTime: '3 min',
            fingerTrickTips: 'Use double wrist rotations (F2/R2) to drop aligned edges onto the white cross cleanly.'
          }
        ]
      },
      {
        id: 'beginner-step2',
        title: 'Step 2: First Layer Corners',
        description: 'Position white corner pieces above their target slots and insert them into the bottom layer.',
        lessons: [
          {
            id: 'beg_2',
            title: 'Sexy Move / Corner Insertion',
            explanation: 'Target corner piece is directly above its slot in the top right. Repeat R U R\' U\' until white faces down.',
            algorithm: "R U R' U'",
            difficulty: 'Beginner',
            estimatedTime: '4 min',
            fingerTrickTips: 'Flick U with right index finger and push R\' down with right thumb in one fluid stroke.'
          }
        ]
      },
      {
        id: 'beginner-step3',
        title: 'Step 3: Second Layer (Middle Layer Edges)',
        description: 'Insert non-yellow edge pieces from the top layer into their matching middle layer slots.',
        lessons: [
          {
            id: 'beg_3_right',
            title: 'Right Edge Insertion',
            explanation: 'Moves the top-front edge piece into the Front-Right middle layer slot without disturbing the white layer.',
            algorithm: "U R U' R' U' F' U F",
            difficulty: 'Beginner',
            estimatedTime: '5 min',
            fingerTrickTips: 'Split into two halves: U (Right Trigger) followed by U\' (Front Trigger).'
          },
          {
            id: 'beg_3_left',
            title: 'Left Edge Insertion',
            explanation: 'Moves the top-front edge piece into the Front-Left middle layer slot.',
            algorithm: "U' L' U L U F U' F'",
            difficulty: 'Beginner',
            estimatedTime: '5 min',
            fingerTrickTips: 'Mirror of the right insertion using left index and thumb.'
          }
        ]
      },
      {
        id: 'beginner-step4',
        title: 'Step 4: Yellow Cross (OLL Step 1)',
        description: 'Form a yellow cross on the top face without disturbing the bottom two layers.',
        lessons: [
          {
            id: 'beg_4',
            title: "FURU'F' (Fur-U-Ruf)",
            explanation: 'Apply once for horizontal line, twice for "L" shape, or three times for center dot to form the yellow cross.',
            algorithm: "F R U R' U' F'",
            difficulty: 'Beginner',
            estimatedTime: '4 min',
            fingerTrickTips: 'Push F with right thumb, perform sexy move (R U R\' U\'), and reset with index finger flick F\'.'
          }
        ]
      },
      {
        id: 'beginner-step5',
        title: 'Step 5: Permute Yellow Edges',
        description: 'Align the top edge piece colors with their corresponding side center colors.',
        lessons: [
          {
            id: 'beg_5',
            title: 'Sune Edge Permutation',
            explanation: 'Swaps the front and left yellow edges so all top edges match side center colors.',
            algorithm: "R U R' U R U2 R'",
            difficulty: 'Beginner',
            estimatedTime: '5 min',
            fingerTrickTips: 'Execute R U R\' seamlessly, then double-flick U2 with right index and middle fingers.'
          }
        ]
      },
      {
        id: 'beginner-step6',
        title: 'Step 6: Position Yellow Corners (Niklas)',
        description: 'Move all yellow corner pieces to their correct physical corner locations.',
        lessons: [
          {
            id: 'beg_6',
            title: 'Niklas Corner Cycle',
            explanation: 'Hold the correctly placed corner on Front-Right-Top and cycle the remaining 3 corners until all 4 are in position.',
            algorithm: "U R U' L' U R' U' L",
            difficulty: 'Beginner',
            estimatedTime: '5 min',
            fingerTrickTips: 'Alternate right-up, left-up, right-down, left-down with index finger U pulls.'
          }
        ]
      },
      {
        id: 'beginner-step7',
        title: 'Step 7: Orient Yellow Corners',
        description: 'Rotate the last layer corners until all yellow stickers face upwards to solve the cube.',
        lessons: [
          {
            id: 'beg_7',
            title: 'Reverse Sexy Move Corner Flip',
            explanation: 'Hold unoriented corner in Front-Right-Top spot and repeat R\' D\' R D until yellow faces UP, then turn top layer (U) to load next corner.',
            algorithm: "R' D' R D",
            difficulty: 'Beginner',
            estimatedTime: '6 min',
            fingerTrickTips: 'NEVER rotate the whole cube between corners. Always turn only the U layer to cycle corners into the bottom right.'
          }
        ]
      },
      {
        id: 'beginner-example',
        title: 'Interactive Example Solve',
        description: 'Full start-to-finish walkthrough of an intuitive beginner solve from scramble to completion.',
        lessons: [
          {
            id: 'beg_example_solve',
            title: 'Complete Beginner Example Solve',
            explanation: 'Step-by-step reconstruction: White Cross -> Corner Slots -> Second Layer Edges -> Yellow Cross -> Sune -> Niklas -> Final Corner Orientations.',
            algorithm: "F2 R2 L2 B2 U R U' R' U' F' U F F R U R' U' F' R U R' U R U2 R' U R U' L' U R' U' L R' D' R D",
            difficulty: 'Beginner',
            estimatedTime: '8 min',
            fingerTrickTips: 'Follow the 3D cube moves to see how the whole puzzle comes together layer by layer.',
            isExampleSolve: true
          }
        ]
      }
    ]
  },

  // ==========================================
  // 2. SIMPLIFIED CFOP (4 Phases + Example Solve)
  // ==========================================
  {
    id: 'simplified-cfop',
    title: 'Simplified CFOP',
    badge: 'Intermediate',
    description: 'An approachable bridge to speedcubing using intuitive F2L and 4-Look Last Layer (2-Look OLL + 2-Look PLL).',
    progress: 0,
    modules: [
      {
        id: 'scfop-cross',
        title: 'Phase 1: Bottom Cross',
        description: 'Build an efficient 4-edge cross on the bottom layer matching side centers.',
        lessons: [
          {
            id: 'sc_cross',
            title: 'Direct Cross Assembly',
            explanation: 'Build the cross directly on the bottom face without needing an intermediate daisy step.',
            algorithm: "D R2 L2 U2 F2 B2",
            difficulty: 'Intermediate',
            estimatedTime: '4 min',
            fingerTrickTips: 'Plan cross pieces during 15s inspection so you can execute smoothly without pausing.'
          }
        ]
      },
      {
        id: 'scfop-f2l',
        title: 'Phase 2: Intuitive F2L (First Two Layers)',
        description: 'Pair corner and edge pieces in the top layer and insert them together into their middle-layer slots.',
        lessons: [
          {
            id: 'sc_f2l_right',
            title: 'Basic Right Insertion',
            explanation: 'Corner and edge are already paired in top layer; target slot is Front-Right.',
            algorithm: "U R U' R'",
            difficulty: 'Intermediate',
            estimatedTime: '4 min',
            fingerTrickTips: 'Keep hands in home grip position and insert the pair with one smooth wrist stroke.'
          },
          {
            id: 'sc_f2l_left',
            title: 'Basic Left Insertion',
            explanation: 'Corner and edge are already paired in top layer; target slot is Front-Left.',
            algorithm: "U' L' U L",
            difficulty: 'Intermediate',
            estimatedTime: '4 min',
            fingerTrickTips: 'Mirror of right insertion using left index and thumb.'
          }
        ]
      },
      {
        id: 'scfop-2look-oll',
        title: 'Phase 3: 2-Look OLL (Orientation)',
        description: 'Orient top edges into a yellow cross, then orient the 4 corners in two fast steps.',
        lessons: [
          {
            id: 'sc_oll_dot',
            title: 'EO: Dot Case',
            explanation: 'No top edges oriented. Execute Line alg, U2, then L-shape alg to orient all edges.',
            algorithm: "F R U R' U' F' U2 F U R U' R' F'",
            difficulty: 'Intermediate',
            estimatedTime: '5 min',
            fingerTrickTips: 'Keep thumb on front face for quick double trigger execution.'
          },
          {
            id: 'sc_oll_l_shape',
            title: 'EO: L-Shape',
            explanation: 'Two adjacent top edges oriented. Wide front move f (F + S) followed by sexy move.',
            algorithm: "f R U R' U' f'",
            difficulty: 'Intermediate',
            estimatedTime: '4 min',
            fingerTrickTips: 'Use right thumb to push both front layers (f) simultaneously.'
          },
          {
            id: 'sc_oll_line',
            title: 'EO: Bar / Line Case',
            explanation: 'Two opposite top edges oriented. Standard FURU\'F\' trigger.',
            algorithm: "F R U R' U' F'",
            difficulty: 'Intermediate',
            estimatedTime: '4 min',
            fingerTrickTips: 'Classic speedcubing trigger. Index flick resets F\'.'
          },
          {
            id: 'sc_oll_sune',
            title: 'CO: Sune (OLL 27)',
            explanation: '1 corner oriented; top-left front corner sticker faces front.',
            algorithm: "R U R' U R U2 R'",
            difficulty: 'Intermediate',
            estimatedTime: '5 min',
            fingerTrickTips: 'Fastest corner orientation trigger. Right index + middle double flick on U2.'
          },
          {
            id: 'sc_oll_antisune',
            title: 'CO: Anti-Sune (OLL 26)',
            explanation: '1 corner oriented; top-right front corner sticker faces right.',
            algorithm: "R U2 R' U' R U' R'",
            difficulty: 'Intermediate',
            estimatedTime: '5 min',
            fingerTrickTips: 'Mirror of Sune starting with immediate U2 double flick.'
          },
          {
            id: 'sc_oll_h',
            title: 'CO: H / Double Headlight (OLL 21)',
            explanation: '0 corners oriented; two pairs of headlights facing front and back.',
            algorithm: "F R U R' U' R U R' U' R U R' F'",
            difficulty: 'Intermediate',
            estimatedTime: '6 min',
            fingerTrickTips: 'Triple sexy move inside F and F\' brackets.'
          },
          {
            id: 'sc_oll_pi',
            title: 'CO: Pi / Wheel (OLL 22)',
            explanation: '0 corners oriented; headlights on left, opposite corners on right.',
            algorithm: "R U2 R2 U' R2 U' R2 U2 R",
            difficulty: 'Intermediate',
            estimatedTime: '6 min',
            fingerTrickTips: 'Maintain continuous wrist rotation throughout R2 strokes.'
          },
          {
            id: 'sc_oll_headlights',
            title: 'CO: Headlights / U (OLL 23)',
            explanation: '2 corners oriented; remaining two stickers face front.',
            algorithm: "R2 D R' U2 R D' R' U2 R'",
            difficulty: 'Intermediate',
            estimatedTime: '6 min',
            fingerTrickTips: 'Left ring finger pushes D, right ring finger pulls D\'.'
          },
          {
            id: 'sc_oll_chameleon',
            title: 'CO: Chameleon / T (OLL 24)',
            explanation: '2 corners oriented; remaining stickers face left and right.',
            algorithm: "r U R' U' r' F R F'",
            difficulty: 'Intermediate',
            estimatedTime: '5 min',
            fingerTrickTips: 'Wide r stroke followed by sexy move and sledgehammer finish.'
          },
          {
            id: 'sc_oll_bowtie',
            title: 'CO: Bowtie / L (OLL 25)',
            explanation: '2 diagonal corners oriented.',
            algorithm: "F' r U R' U' r' F R",
            difficulty: 'Intermediate',
            estimatedTime: '5 min',
            fingerTrickTips: 'Starts with left index F\' push, smoothly flows into r U R\'.'
          }
        ]
      },
      {
        id: 'scfop-2look-pll',
        title: 'Phase 4: 2-Look PLL (Permutation)',
        description: 'Permute corners with T or Y perm, then cycle edges with Ua, Ub, H, or Z perm.',
        lessons: [
          {
            id: 'sc_pll_t_perm',
            title: 'CP: T-Permutation (Headlights Case)',
            explanation: 'One side has matching headlights. Put headlights on Left and execute T-Perm.',
            algorithm: "R U R' U' R' F R2 U' R' U' R U R' F'",
            difficulty: 'Intermediate',
            estimatedTime: '7 min',
            fingerTrickTips: 'The most foundational speedcubing algorithm. Regrip thumb to front before R2.'
          },
          {
            id: 'sc_pll_y_perm',
            title: 'CP: Y-Permutation (No Headlights Case)',
            explanation: 'No sides have matching corners. Swaps diagonal corners.',
            algorithm: "F R U' R' U' R U R' F' R U R' U' R' F R F'",
            difficulty: 'Intermediate',
            estimatedTime: '8 min',
            fingerTrickTips: 'Break into two parts: setup trigger + modified T-perm sequence.'
          },
          {
            id: 'sc_pll_ua',
            title: 'EP: Ua-Perm (3-Edge Clockwise Cycle)',
            explanation: '1 solved edge bar in back; remaining 3 edges cycle clockwise.',
            algorithm: "R U' R U R U R U' R' U' R2",
            difficulty: 'Intermediate',
            estimatedTime: '6 min',
            fingerTrickTips: 'Keep right index and thumb rhythmic during the alternating U and U\' moves.'
          },
          {
            id: 'sc_pll_ub',
            title: 'EP: Ub-Perm (3-Edge Counter-Clockwise Cycle)',
            explanation: '1 solved edge bar in back; remaining 3 edges cycle counter-clockwise.',
            algorithm: "R2 U R U R' U' R' U' R' U R'",
            difficulty: 'Intermediate',
            estimatedTime: '6 min',
            fingerTrickTips: 'R2 U start rolls smoothly into continuous right-hand turns.'
          },
          {
            id: 'sc_pll_h',
            title: 'EP: H-Perm (Opposite Edge Swap)',
            explanation: 'No solved bars; opposite edges swap across center using M-slice moves.',
            algorithm: "M2 U M2 U2 M2 U M2",
            difficulty: 'Intermediate',
            estimatedTime: '5 min',
            fingerTrickTips: 'Use right ring + middle finger double flick from bottom-back for M2.'
          },
          {
            id: 'sc_pll_z',
            title: 'EP: Z-Perm (Adjacent Edge Swap)',
            explanation: 'No solved bars; adjacent pairs of edges swap.',
            algorithm: "M' U M2 U M2 U M' U2 M2",
            difficulty: 'Intermediate',
            estimatedTime: '6 min',
            fingerTrickTips: 'Left ring finger flicks M\' upwards, right double flick executes M2.'
          }
        ]
      },
      {
        id: 'scfop-example',
        title: 'Interactive Example Solve',
        description: 'Complete 4-Look Last Layer CFOP walkthrough from scramble to completion.',
        lessons: [
          {
            id: 'scfop_example_solve',
            title: 'Simplified CFOP Example Solve',
            explanation: 'Complete solve reconstruction: Planned White Cross -> Intuitive F2L Pairs -> 2-Look OLL (EO + CO) -> 2-Look PLL (T-Perm + Ua-Perm).',
            algorithm: "D R2 L2 U2 F2 B2 U R U' R' U' L' U L F R U R' U' F' R U R' U R U2 R' R U R' U' R' F R2 U' R' U' R U R' F' R U' R U R U R U' R' U' R2",
            difficulty: 'Intermediate',
            estimatedTime: '10 min',
            fingerTrickTips: 'Observe how 2-Look OLL and 2-Look PLL reduce memorization while keeping execution fast.',
            isExampleSolve: true
          }
        ]
      }
    ]
  },

  // ==========================================
  // 3. FULL CFOP (119 Algorithms + Example Solve)
  // ==========================================
  {
    id: 'cfop',
    title: 'Full CFOP (Fridrich)',
    badge: 'Advanced',
    description: 'The premier competitive speedcubing method. Complete coverage of all 41 F2L archetypes, all 57 OLL cases, and all 21 PLL algorithms.',
    progress: 0,
    modules: [
      {
        id: 'cfop-f2l',
        title: 'F2L: First Two Layers (41 Cases)',
        description: 'Advanced slot insertions, edge-corner separation, and rotationless slotting.',
        lessons: [
          {
            id: 'f2l_01',
            title: 'F2L 01: Easy Case Right',
            explanation: 'Corner and edge separated in top layer with matching top colors; right-slot insertion.',
            algorithm: "U R U' R'",
            difficulty: 'Advanced',
            estimatedTime: '4 min',
            fingerTrickTips: 'Single continuous wrist stroke with home grip.'
          },
          {
            id: 'f2l_31',
            title: 'F2L 31: Corner in slot, Edge in U layer',
            explanation: 'Corner is solved in slot with wrong orientation; edge in top layer.',
            algorithm: "R U' R' U R U' R'",
            difficulty: 'Advanced',
            estimatedTime: '5 min',
            fingerTrickTips: 'Eject corner and pair with edge in a single fluid 7-move combo.'
          }
        ]
      },
      {
        id: 'cfop-oll',
        title: 'OLL: Orientation of Last Layer (57 Cases)',
        description: 'Orient all top stickers simultaneously in a single algorithm.',
        lessons: [
          { id: 'oll_01', title: 'OLL 01: Runway (Dot)', explanation: 'No edges oriented; two corners pointing opposite.', algorithm: "R U2 R2 F R F' U2 R' F R F'", difficulty: 'Advanced', estimatedTime: '6 min', fingerTrickTips: 'Index finger pushes F\'.' },
          { id: 'oll_02', title: 'OLL 02: Zamboni (Dot)', explanation: 'Dot case with wide-turn combination.', algorithm: "F R U R' U' F' f R U R' U' f'", difficulty: 'Advanced', estimatedTime: '6 min', fingerTrickTips: 'Transition from F to wide f seamlessly.' },
          { id: 'oll_05', title: 'OLL 05: Right Square', explanation: '2x2 yellow square on front-right.', algorithm: "r' U2 R U R' U r", difficulty: 'Advanced', estimatedTime: '5 min', fingerTrickTips: 'Wide r\' start with left thumb.' },
          { id: 'oll_07', title: 'OLL 07: Small Lightning', explanation: 'Lightning bolt shape with right-handed trigger.', algorithm: "r U R' U R U2 r'", difficulty: 'Advanced', estimatedTime: '5 min', fingerTrickTips: 'Wide Sune variant.' },
          { id: 'oll_09', title: 'OLL 09: Kite / Fish', explanation: 'Kite shape with sledgehammer insert.', algorithm: "R U R' U' R' F R F'", difficulty: 'Advanced', estimatedTime: '5 min', fingerTrickTips: 'Sexy move into sledgehammer.' },
          { id: 'oll_21', title: 'OLL 21: H-Shape (Cross)', explanation: 'Yellow cross with double headlights front and back.', algorithm: "F R U R' U' R U R' U' R U R' F'", difficulty: 'Advanced', estimatedTime: '5 min', fingerTrickTips: 'Triple sexy move inside F brackets.' },
          { id: 'oll_27', title: 'OLL 27: Sune (Cross)', explanation: '1 corner oriented, classic Sune.', algorithm: "R U R' U R U2 R'", difficulty: 'Advanced', estimatedTime: '4 min', fingerTrickTips: 'Fastest OLL algorithm in speedcubing.' },
          { id: 'oll_33', title: 'OLL 33: T-Shape T1', explanation: 'T-shape with side headlights.', algorithm: "R U R' U' R' F R F'", difficulty: 'Advanced', estimatedTime: '4 min', fingerTrickTips: 'Clean 8-move trigger.' },
          { id: 'oll_45', title: 'OLL 45: T-Shape T2', explanation: 'T-shape with front headlights.', algorithm: "F R U R' U' F'", difficulty: 'Advanced', estimatedTime: '4 min', fingerTrickTips: 'The universal FURU\'F\' trigger.' },
          { id: 'oll_57', title: 'OLL 57: Stealth (Corners Orient)', explanation: 'All 4 corners oriented; M-slice finish.', algorithm: "R U R' U' M' U R U' r'", difficulty: 'Advanced', estimatedTime: '5 min', fingerTrickTips: 'M\' slice embedded in right-hand sequence.' }
        ]
      },
      {
        id: 'cfop-pll',
        title: 'PLL: Permutation of Last Layer (21 Cases)',
        description: 'Permute all last-layer pieces simultaneously to complete the solve.',
        lessons: [
          { id: 'pll_aa', title: 'Aa Permutation', explanation: '3-corner cycle with headlights on right.', algorithm: "x R' D2 R U R' D2 R U' R'", difficulty: 'Advanced', estimatedTime: '6 min', fingerTrickTips: 'Left ring finger double flick on D2.' },
          { id: 'pll_ab', title: 'Ab Permutation', explanation: '3-corner cycle with headlights on front.', algorithm: "x R U' R D2 R' U R D2 R2", difficulty: 'Advanced', estimatedTime: '6 min', fingerTrickTips: 'Right ring finger double flick on D2.' },
          { id: 'pll_e', title: 'E Permutation', explanation: 'Diagonal corner swap across top layer.', algorithm: "x' R U' R' D R U R' D' R U R' D R U' R' D'", difficulty: 'Advanced', estimatedTime: '8 min', fingerTrickTips: 'Alternate D and D\' pushes with left ring finger.' },
          { id: 'pll_f', title: 'F Permutation', explanation: 'Adjacent corner swap with edge bar on left.', algorithm: "R' U' F' R U R' U' R' F R2 U' R' U' R U R' U R", difficulty: 'Advanced', estimatedTime: '8 min', fingerTrickTips: 'Setup move into modified T-perm and restore.' },
          { id: 'pll_ga', title: 'Ga Permutation', explanation: 'G-Permutation variation A.', algorithm: "R2 U R' U R' U' R U' R2 U' D R' U R D'", difficulty: 'Advanced', estimatedTime: '8 min', fingerTrickTips: 'Simultaneous U\' and D turns with index and ring.' },
          { id: 'pll_h', title: 'H Permutation', explanation: 'Opposite edge swap across centers.', algorithm: "M2 U M2 U2 M2 U M2", difficulty: 'Advanced', estimatedTime: '5 min', fingerTrickTips: 'Fastest PLL algorithm using M2 double flicks.' },
          { id: 'pll_ja', title: 'Ja Permutation', explanation: 'Adjacent swap with 1x1x3 bar on left.', algorithm: "x R2 F R F' R U2 r' U r U2", difficulty: 'Advanced', estimatedTime: '6 min', fingerTrickTips: 'Cube rotation x into smooth right trigger.' },
          { id: 'pll_jb', title: 'Jb Permutation', explanation: 'Adjacent swap with 1x1x3 bar on front-left.', algorithm: "R U R' F' R U R' U' R' F R2 U' R'", difficulty: 'Advanced', estimatedTime: '5 min', fingerTrickTips: 'One of the smoothest right-handed algorithms.' },
          { id: 'pll_ra', title: 'Ra Permutation', explanation: 'R-Permutation variation A.', algorithm: "R U' R' U' R U R D R' U' R D' R' U2 R'", difficulty: 'Advanced', estimatedTime: '7 min', fingerTrickTips: 'D and D\' keying with right ring finger.' },
          { id: 'pll_t', title: 'T Permutation', explanation: 'Adjacent corner swap with opposite edge swap.', algorithm: "R U R' U' R' F R2 U' R' U' R U R' F'", difficulty: 'Advanced', estimatedTime: '5 min', fingerTrickTips: 'Universal benchmark speedcubing algorithm.' },
          { id: 'pll_ua', title: 'Ua Permutation', explanation: 'Clockwise 3-edge cycle with back bar.', algorithm: "R U' R U R U R U' R' U' R2", difficulty: 'Advanced', estimatedTime: '5 min', fingerTrickTips: 'Rhythmic right-hand fingertricks.' },
          { id: 'pll_z', title: 'Z Permutation', explanation: 'Adjacent edge pairs swap.', algorithm: "M' U M2 U M2 U M' U2 M2", difficulty: 'Advanced', estimatedTime: '6 min', fingerTrickTips: 'M\' upward flick followed by M2 rolls.' }
        ]
      },
      {
        id: 'cfop-example',
        title: 'Interactive Example Solve',
        description: 'High-speed competitive CFOP solve breakdown with advanced F2L slotting, 1-Look OLL, and 1-Look PLL.',
        lessons: [
          {
            id: 'cfop_example_solve',
            title: 'Full CFOP Master Example Solve',
            explanation: 'Reconstruction: Planned Cross -> F2L Slot 1 -> F2L Slot 2 -> F2L Slot 3 -> F2L Slot 4 -> 1-Look OLL 33 -> 1-Look PLL Jb.',
            algorithm: "D R2 L2 U2 F2 B2 U R U' R' R U' R' U R U' R' R U R' U' R' F R F' R U R' F' R U R' U' R' F R2 U' R'",
            difficulty: 'Advanced',
            estimatedTime: '12 min',
            fingerTrickTips: 'Observe lookahead between pairs to eliminate pauses during transition to last layer.',
            isExampleSolve: true
          }
        ]
      }
    ]
  },

  // ==========================================
  // 4. ROUX METHOD (4 Phases + Example Solve)
  // ==========================================
  {
    id: 'roux',
    title: 'Roux Method',
    badge: 'Pro',
    description: 'Blockbuilding, CMLL, and M-slice mastery. Ultra-low move count with rotationless solving and hyper-efficient ergonomics.',
    progress: 0,
    modules: [
      {
        id: 'roux-fb',
        title: 'Phase 1: First Block (FB)',
        description: 'Build a 1x2x3 block on the left side of the cube (typically blue/white or green/white).',
        lessons: [
          {
            id: 'roux_fb_left',
            title: 'Left Block Construction',
            explanation: 'Build the 1x2x3 block on the left side using intuitive corner-edge block building.',
            algorithm: "L U L' U L U2 L'",
            difficulty: 'Pro',
            estimatedTime: '6 min',
            fingerTrickTips: 'Flick L moves using left ring and middle fingers.'
          }
        ]
      },
      {
        id: 'roux-sb',
        title: 'Phase 2: Second Block (SB)',
        description: 'Build a matching 1x2x3 block on the right side using M and R moves without disturbing FB.',
        lessons: [
          {
            id: 'roux_sb_right',
            title: 'Right Block Construction',
            explanation: 'Build the right 1x2x3 block using R, r, U, and M moves.',
            algorithm: "R U' R' U' R U2 R'",
            difficulty: 'Pro',
            estimatedTime: '6 min',
            fingerTrickTips: 'Use M-slice freedoms to pair corners and edges without breaking the left block.'
          }
        ]
      },
      {
        id: 'roux-cmll',
        title: 'Phase 3: CMLL (Corners of Last Layer - 42 Cases)',
        description: 'Orient and permute all 4 top-layer corners simultaneously without disturbing the two side blocks.',
        lessons: [
          { id: 'cmll_o_adj', title: 'CMLL O: Adjacent Swap', explanation: 'Oriented corners with adjacent permutation.', algorithm: "R U R' F' R U R' U' R' F R2 U' R'", difficulty: 'Pro', estimatedTime: '7 min', fingerTrickTips: 'Standard Jb permutation variant.' },
          { id: 'cmll_o_diag', title: 'CMLL O: Diagonal Swap', explanation: 'Oriented corners with diagonal permutation.', algorithm: "r U R' U' r' F R F'", difficulty: 'Pro', estimatedTime: '6 min', fingerTrickTips: 'Smooth wide-turn sledgehammer trigger.' },
          { id: 'cmll_u_fwd', title: 'CMLL U: Forward Bar', explanation: 'Headlights case with forward bar.', algorithm: "R2 D' R U2 R' D R U2 R", difficulty: 'Pro', estimatedTime: '7 min', fingerTrickTips: 'Left ring finger pushes D\', right ring pulls D.' },
          { id: 'cmll_t_row', title: 'CMLL T: Row', explanation: 'Chameleon case with solved row.', algorithm: "F R U R' U' F'", difficulty: 'Pro', estimatedTime: '5 min', fingerTrickTips: 'Standard FURU\'F\' trigger.' },
          { id: 'cmll_l_pure', title: 'CMLL L: Pure Bowtie', explanation: 'Bowtie diagonal corners case.', algorithm: "R U2 R' U' R U R' U' R U' R'", difficulty: 'Pro', estimatedTime: '7 min', fingerTrickTips: 'Continuous right-hand rhythm.' },
          { id: 'cmll_s_bar', title: 'CMLL S: Sune Left Bar', explanation: 'Sune corner orientation with left bar preservation.', algorithm: "R U R' U R U2 R'", difficulty: 'Pro', estimatedTime: '5 min', fingerTrickTips: 'Classic Sune sequence.' },
          { id: 'cmll_as_bar', title: 'CMLL AS: Anti-Sune Right Bar', explanation: 'Anti-sune corner orientation with right bar preservation.', algorithm: "R U2 R' U' R U' R'", difficulty: 'Pro', estimatedTime: '5 min', fingerTrickTips: 'Classic Anti-Sune sequence.' },
          { id: 'cmll_pi_pure', title: 'CMLL Pi: Pure Wheel', explanation: 'Pi case with triple sexy move.', algorithm: "F R U R' U' R U R' U' R U R' F'", difficulty: 'Pro', estimatedTime: '7 min', fingerTrickTips: 'Triple sexy move inside F and F\'.' },
          { id: 'cmll_h_pure', title: 'CMLL H: Pure Double Headlights', explanation: 'Double headlights with corner preservation.', algorithm: "R U2 R' U' R U R' U' R U' R'", difficulty: 'Pro', estimatedTime: '7 min', fingerTrickTips: 'Clean 11-move corner orientation.' }
        ]
      },
      {
        id: 'roux-lse',
        title: 'Phase 4: LSE (Last Six Edges)',
        description: 'Solve the remaining 6 edges (UL, UR, and M-slice edges) using only M and U moves.',
        lessons: [
          {
            id: 'roux_4a_eo',
            title: '4a: Edge Orientation (EO)',
            explanation: 'Orient all 6 remaining edges so white/yellow face top or bottom.',
            algorithm: "M' U M'",
            difficulty: 'Pro',
            estimatedTime: '5 min',
            fingerTrickTips: 'Flick M\' with left ring finger while top layer rotates.'
          },
          {
            id: 'roux_4b_ul_ur',
            title: '4b: UL & UR Edges',
            explanation: 'Place Upper-Left (UL) and Upper-Right (UR) edges into position.',
            algorithm: "M2 U2 M2",
            difficulty: 'Pro',
            estimatedTime: '5 min',
            fingerTrickTips: 'Double flick M2 from bottom back with ring and middle finger.'
          },
          {
            id: 'roux_4c_ep',
            title: '4c: Edge Permutation (EP)',
            explanation: 'Permute the remaining 4 M-slice edges to solve the cube.',
            algorithm: "M2 U2 M2 U2",
            difficulty: 'Pro',
            estimatedTime: '5 min',
            fingerTrickTips: 'Final M2 U2 cadence finishes the solve.'
          }
        ]
      },
      {
        id: 'roux-example',
        title: 'Interactive Example Solve',
        description: 'Complete Roux method solve walkthrough featuring First Block, Second Block, CMLL, and Last Six Edges.',
        lessons: [
          {
            id: 'roux_example_solve',
            title: 'Roux Master Example Solve',
            explanation: 'Reconstruction: FB Left 1x2x3 Block -> SB Right 1x2x3 Block -> CMLL T-Row -> LSE 4a EO -> LSE 4b UL/UR -> LSE 4c EP Finish.',
            algorithm: "L U L' U L U2 L' R U' R' U' R U2 R' F R U R' U' F' M' U M' M2 U2 M2 M2 U2 M2 U2",
            difficulty: 'Pro',
            estimatedTime: '12 min',
            fingerTrickTips: 'Notice the fluid M and U layer moves in LSE with zero cube rotations.',
            isExampleSolve: true
          }
        ]
      }
    ]
  },

  // ==========================================
  // 5. ZZ METHOD (3 Phases + Example Solve)
  // ==========================================
  {
    id: 'zz',
    title: 'ZZ Method',
    badge: 'Expert',
    description: 'Rotationless solving starting with Edge Orientation Line (EOline), followed by ergonomic ZZF2L blockbuilding and COLL/EPLL.',
    progress: 0,
    modules: [
      {
        id: 'zz-eoline',
        title: 'Phase 1: EOline (Edge Orientation + Line)',
        description: 'Orient all 12 edges during inspection while placing DF and DB line edges.',
        lessons: [
          {
            id: 'zz_eoline_setup',
            title: 'EO + Line Setup',
            explanation: 'Flip bad edges using F/B moves and place DF/DB edges to create the bottom line.',
            algorithm: "F B D L R",
            difficulty: 'Expert',
            estimatedTime: '8 min',
            fingerTrickTips: 'Count bad edges in inspection (2, 4, 6, or 8) before making your first turn.'
          }
        ]
      },
      {
        id: 'zz-f2l',
        title: 'Phase 2: ZZF2L (Rotationless First Two Layers)',
        description: 'Build left and right 1x2x3 blocks using only R, U, and L moves. Completely rotation-free.',
        lessons: [
          {
            id: 'zz_f2l_left',
            title: 'Left Block Insertion',
            explanation: 'Pairing and inserting corner-edge pairs into the left slots without cube rotations.',
            algorithm: "L U L'",
            difficulty: 'Expert',
            estimatedTime: '6 min',
            fingerTrickTips: 'Left hand trigger slots pairs cleanly without any F or B moves.'
          },
          {
            id: 'zz_f2l_right',
            title: 'Right Block Insertion',
            explanation: 'Pairing and inserting corner-edge pairs into the right slots using only R and U moves.',
            algorithm: "R U R'",
            difficulty: 'Expert',
            estimatedTime: '6 min',
            fingerTrickTips: 'Right hand trigger slots pairs with zero regrip.'
          }
        ]
      },
      {
        id: 'zz-ll',
        title: 'Phase 3: Last Layer (COLL & EPLL)',
        description: 'Because EOline pre-orients all edges, you always get a yellow cross. Finish in 2 steps with COLL and EPLL.',
        lessons: [
          { id: 'coll_sune_1', title: 'COLL Sune (Anti-Pure)', explanation: 'Orient and permute corners simultaneously for Sune case.', algorithm: "R U R' U R U2 R'", difficulty: 'Expert', estimatedTime: '6 min', fingerTrickTips: 'Standard Sune preserves pre-oriented top edges.' },
          { id: 'coll_sune_2', title: 'COLL Sune (Diagonal)', explanation: 'Diagonal corner swap variant for Sune case.', algorithm: "F R U R' U' F' R U R' U R U2 R'", difficulty: 'Expert', estimatedTime: '7 min', fingerTrickTips: 'FURU\'F\' setup into Sune.' },
          { id: 'coll_antisune_1', title: 'COLL Anti-Sune (Pure)', explanation: 'Anti-Sune corner resolution preserving edges.', algorithm: "R U2 R' U' R U' R'", difficulty: 'Expert', estimatedTime: '6 min', fingerTrickTips: 'Fast Anti-Sune sequence.' },
          { id: 'coll_h_1', title: 'COLL H (Columns)', explanation: 'Double headlights with column corner preservation.', algorithm: "R U2 R' U' R U R' U' R U' R'", difficulty: 'Expert', estimatedTime: '7 min', fingerTrickTips: 'Clean 11-move corner permutation.' },
          { id: 'coll_pi_1', title: 'COLL Pi (Pure)', explanation: 'Pi case with simultaneous corner permutation.', algorithm: "F R U R' U' R U R' U' F'", difficulty: 'Expert', estimatedTime: '7 min', fingerTrickTips: 'Double sexy move inside F and F\'.' },
          { id: 'coll_u_1', title: 'COLL U (Forward Bar)', explanation: 'Headlights case preserving top cross edges.', algorithm: "R2 D' R U2 R' D R U2 R", difficulty: 'Expert', estimatedTime: '7 min', fingerTrickTips: 'D and D\' keying with ring fingers.' },
          { id: 'coll_t_1', title: 'COLL T (Rows)', explanation: 'T-case corner permutation.', algorithm: "r U R' U' r' F R F'", difficulty: 'Expert', estimatedTime: '6 min', fingerTrickTips: 'Wide r trigger into sledgehammer.' },
          { id: 'coll_l_1', title: 'COLL L (Pure)', explanation: 'Bowtie corner permutation.', algorithm: "F' r U R' U' r' F R", difficulty: 'Expert', estimatedTime: '6 min', fingerTrickTips: 'Index push F\' into wide r combo.' },
          { id: 'epll_ua', title: 'EPLL: Ua Permutation', explanation: 'Clockwise 3-edge cycle after COLL corner resolution.', algorithm: "R U' R U R U R U' R' U' R2", difficulty: 'Expert', estimatedTime: '5 min', fingerTrickTips: 'High-speed right-hand edge cycle.' },
          { id: 'epll_ub', title: 'EPLL: Ub Permutation', explanation: 'Counter-clockwise 3-edge cycle.', algorithm: "R2 U R U R' U' R' U' R' U R'", difficulty: 'Expert', estimatedTime: '5 min', fingerTrickTips: 'Smooth continuous R2 U start.' },
          { id: 'epll_h', title: 'EPLL: H Permutation', explanation: 'Opposite edge swap across center.', algorithm: "M2 U M2 U2 M2 U M2", difficulty: 'Expert', estimatedTime: '5 min', fingerTrickTips: 'M2 double flicks finish the cube.' },
          { id: 'epll_z', title: 'EPLL: Z Permutation', explanation: 'Adjacent edge pairs swap.', algorithm: "M' U M2 U M2 U M' U2 M2", difficulty: 'Expert', estimatedTime: '5 min', fingerTrickTips: 'M\' upward flick followed by M2 rolls.' }
        ]
      },
      {
        id: 'zz-example',
        title: 'Interactive Example Solve',
        description: 'Complete ZZ method solve walkthrough featuring EOline, rotationless ZZF2L, COLL, and EPLL finish.',
        lessons: [
          {
            id: 'zz_example_solve',
            title: 'ZZ Method Master Example Solve',
            explanation: 'Reconstruction: EOline Setup -> ZZF2L Left Block -> ZZF2L Right Block -> COLL Sune -> EPLL Ua Perm Finish.',
            algorithm: "F B D L R L U L' R U R' R U R' U R U2 R' R U' R U R U R U' R' U' R2",
            difficulty: 'Expert',
            estimatedTime: '12 min',
            fingerTrickTips: 'Notice that after EOline, not a single cube rotation (y/x/z) or F/B move is required.',
            isExampleSolve: true
          }
        ]
      }
    ]
  }
];