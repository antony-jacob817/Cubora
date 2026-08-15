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
  scramble?: string;
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
  // 1. BEGINNER METHOD
  {
    id: 'beginner',
    title: 'Beginner Method',
    badge: 'Fundamentals',
    description: 'The universal starting point. Learn to solve layer by layer intuitively without complex memory load.',
    progress: 0,
    modules: [
      {
        id: 'step-1-cross',
        title: 'Step 1: White Cross (Daisy Method)',
        description: 'Form a white cross on the bottom layer while aligning the adjacent edge colors with their matching center pieces.',
        lessons: [
          {
            id: 'b1',
            title: 'White Cross Alignment',
            explanation: 'Position white edge pieces around yellow center (Daisy) and rotate 180° (F2) to the white face once side colors match.',
            algorithm: 'F2 R2 L2 B2',
            difficulty: 'Beginner',
            estimatedTime: '3 min',
            fingerTrickTips: 'Rotate the front face (F2) with a smooth double wrist turn once the edge aligns with its side center.'
          }
        ]
      },
      {
        id: 'step-2-corners',
        title: 'Step 2: First Layer Corners',
        description: 'Position white corner pieces between matching center colors in the top layer and insert them into the bottom layer.',
        lessons: [
          {
            id: 'b2',
            title: 'Sexy Move / Corner Insertion',
            explanation: 'Target corner piece is directly above its slot in the top right. Execute the 4-move Sexy Move trigger until oriented.',
            algorithm: "R U R' U'",
            difficulty: 'Beginner',
            estimatedTime: '4 min',
            fingerTrickTips: 'Right thumb stays on front, right index finger pushes U, then right hand restores with R\' and index pulls U\'.'
          }
        ]
      },
      {
        id: 'step-3-second-layer',
        title: 'Step 3: Second Layer (Middle Edges)',
        description: 'Insert edge pieces without yellow into the middle layer slots (F2L edge insertion).',
        lessons: [
          {
            id: 'b3_right',
            title: 'Right Edge Insertion',
            explanation: 'The top-front edge piece needs to move into the Front-Right middle slot.',
            algorithm: "U R U' R' U' F' U F",
            difficulty: 'Beginner',
            estimatedTime: '5 min',
            fingerTrickTips: 'First half separates with right trigger, second half inserts into the front face seamlessly.'
          },
          {
            id: 'b3_left',
            title: 'Left Edge Insertion',
            explanation: 'The top-front edge piece needs to move into the Front-Left middle slot.',
            algorithm: "U' L' U L U F U' F'",
            difficulty: 'Beginner',
            estimatedTime: '5 min',
            fingerTrickTips: 'Mirror of the right insertion: Push U\' with left index finger and execute left trigger.'
          }
        ]
      },
      {
        id: 'step-4-yellow-cross',
        title: 'Step 4: Yellow Cross (OLL 1)',
        description: 'Form a yellow cross on the top layer without disturbing the bottom two layers.',
        lessons: [
          {
            id: 'b4',
            title: "FURU'F' (Fur-U-Ruf)",
            explanation: "Apply once for horizontal line case, twice for 'L' shape (held in top-left), or three times for a center dot.",
            algorithm: "F R U R' U' F'",
            difficulty: 'Beginner',
            estimatedTime: '4 min',
            fingerTrickTips: 'Push F with right thumb, perform sexy move (R U R\' U\'), then index flick F\' back up.'
          }
        ]
      },
      {
        id: 'step-5-permute-edges',
        title: 'Step 5: Permute Yellow Edges',
        description: 'Align the top edge piece colors with their corresponding side center colors.',
        lessons: [
          {
            id: 'b5',
            title: 'Sune Edge Permutation',
            explanation: 'Swaps the front and left yellow edges so all top edges match their side center colors.',
            algorithm: "R U R' U R U2 R'",
            difficulty: 'Beginner',
            estimatedTime: '5 min',
            fingerTrickTips: 'Execute R U R\' smoothly, then R U2 with an index-middle double flick on U2.'
          }
        ]
      },
      {
        id: 'step-6-position-corners',
        title: 'Step 6: Position Yellow Corners',
        description: 'Move all yellow corner pieces to their correct physical positions (regardless of rotation).',
        lessons: [
          {
            id: 'b6',
            title: 'Niklas Corner Cycle',
            explanation: 'Hold the correctly placed corner on Front-Right-Top and cycle the remaining 3 corners until all are placed.',
            algorithm: "U R U' L' U R' U' L",
            difficulty: 'Beginner',
            estimatedTime: '6 min',
            fingerTrickTips: 'Alternate lifting the right side (R) and left side (L\') with top layer alignments.'
          }
        ]
      },
      {
        id: 'step-7-orient-corners',
        title: 'Step 7: Orient Yellow Corners',
        description: 'Rotate the last layer corners until the yellow faces are facing upwards.',
        lessons: [
          {
            id: 'b7',
            title: 'Reverse Sexy Move Orient',
            explanation: 'Hold unoriented corner in Front-Right-Top spot and repeat until yellow faces UP, then turn top layer (U) to load next unsolved corner.',
            algorithm: "R' D' R D",
            difficulty: 'Beginner',
            estimatedTime: '5 min',
            fingerTrickTips: 'Never rotate the whole cube during this step; only turn the U layer to bring new corners to Front-Right!'
          }
        ]
      },
      {
        id: 'step-8-example-solve',
        title: 'Interactive Example Solve',
        description: 'Walk through a complete 3D solve from scramble to full solution using the 7 Beginner steps.',
        lessons: [
          {
            id: 'b_example_solve',
            title: 'Full Beginner Example Solve',
            explanation: 'Follow each phase step-by-step: 1. White Cross -> 2. First Layer Corners -> 3. Second Layer Edges -> 4. Yellow Cross -> 5. Permute Edges -> 6. Position Corners -> 7. Orient Corners.',
            algorithm: "D' R' F D R2 U R U' R' U' L' U L U F U' F' F R U R' U' F' R U R' U R U2 R' U R U' L' U R' U' L R' D' R D",
            difficulty: 'Beginner',
            estimatedTime: '8 min',
            fingerTrickTips: 'Observe how each step builds upon the previous layer without breaking existing solved blocks.',
            isExampleSolve: true,
            scramble: "D2 R2 F2 U L2 D F2 D' B2 L2 U2 F' L' B' D' R' B2 D' F' R2"
          }
        ]
      }
    ]
  },

  // 2. SIMPLIFIED CFOP (4 PHASES)
  {
    id: 'simplified-cfop',
    title: 'Simplified CFOP',
    badge: 'Intermediate',
    description: 'An easier version of CFOP using 4-Look Last Layer (4LLL) to transition smoothly from beginner to speedcubing.',
    progress: 0,
    modules: [
      {
        id: 'sc-cross',
        title: 'Phase 1: Cross on Bottom',
        description: 'Form a 4-edge cross directly on the bottom layer matching side center colors.',
        lessons: [
          {
            id: 'sc_cross',
            title: 'Direct White Cross',
            explanation: 'Build the cross directly on the bottom (D layer) to skip the Daisy step and save moves.',
            algorithm: "D' R' F D R2",
            difficulty: 'Intermediate',
            estimatedTime: '4 min',
            fingerTrickTips: 'Plan your cross moves during 15-second inspection before executing.'
          }
        ]
      },
      {
        id: 'sc-f2l',
        title: 'Phase 2: Intuitive F2L',
        description: 'Solve the first two layers simultaneously by pairing corner and edge pieces in the top layer.',
        lessons: [
          {
            id: 'sc_f2l_r',
            title: 'Basic Right Insertion',
            explanation: 'Corner and edge are already paired in top layer; target slot is Front-Right.',
            algorithm: "U R U' R'",
            difficulty: 'Intermediate',
            estimatedTime: '4 min',
            fingerTrickTips: 'One continuous fluid stroke with right hand.'
          },
          {
            id: 'sc_f2l_l',
            title: 'Basic Left Insertion',
            explanation: 'Corner and edge are already paired in top layer; target slot is Front-Left.',
            algorithm: "U' L' U L",
            difficulty: 'Intermediate',
            estimatedTime: '4 min',
            fingerTrickTips: 'Mirror of right insertion with left hand.'
          }
        ]
      },
      {
        id: 'sc-2look-oll',
        title: 'Phase 3: 2-Look OLL (10 Cases)',
        description: 'Orient the last layer in 2 looks: Step A (Edge Orientation) + Step B (Corner Orientation).',
        lessons: [
          {
            id: 'sc_oll_dot',
            title: 'EO: Dot Case',
            explanation: 'No top edges oriented. Execute line alg followed by L-shape alg.',
            algorithm: "F R U R' U' F' U2 F U R U' R' F'",
            difficulty: 'Intermediate',
            estimatedTime: '5 min',
            fingerTrickTips: 'U2 adjustment between triggers aligns the L shape perfectly.'
          },
          {
            id: 'sc_oll_l',
            title: 'EO: L-Shape (Wide F)',
            explanation: 'Two adjacent top edges oriented forming an L in the top-left.',
            algorithm: "f R U R' U' f'",
            difficulty: 'Intermediate',
            estimatedTime: '4 min',
            fingerTrickTips: 'Use fat/wide f move turning both front layers with right thumb.'
          },
          {
            id: 'sc_oll_line',
            title: 'EO: Bar / Line Case',
            explanation: 'Two opposite top edges oriented forming a horizontal bar.',
            algorithm: "F R U R' U' F'",
            difficulty: 'Intermediate',
            estimatedTime: '4 min',
            fingerTrickTips: 'Standard FURU\'F\' trigger.'
          },
          {
            id: 'sc_oll_sune',
            title: 'CO: Sune',
            explanation: '1 corner oriented; top-left front corner sticker faces front.',
            algorithm: "R U R' U R U2 R'",
            difficulty: 'Intermediate',
            estimatedTime: '5 min',
            fingerTrickTips: 'Classic speedcubing trigger.'
          },
          {
            id: 'sc_oll_antisune',
            title: 'CO: Anti-Sune',
            explanation: '1 corner oriented; top-right front corner sticker faces right.',
            algorithm: "R U2 R' U' R U' R'",
            difficulty: 'Intermediate',
            estimatedTime: '5 min',
            fingerTrickTips: 'Double flick U2 at the beginning, then reverse flow.'
          },
          {
            id: 'sc_oll_h',
            title: 'CO: H (Double Headlight)',
            explanation: '0 corners oriented; two pairs of headlights facing front and back.',
            algorithm: "F R U R' U' R U R' U' R U R' F'",
            difficulty: 'Intermediate',
            estimatedTime: '6 min',
            fingerTrickTips: 'Triple sexy move inside F and F\'.'
          },
          {
            id: 'sc_oll_pi',
            title: 'CO: Pi (Wheel)',
            explanation: '0 corners oriented; one pair of headlights on left, two corners pointing away on right.',
            algorithm: "R U2 R2 U' R2 U' R2 U2 R",
            difficulty: 'Intermediate',
            estimatedTime: '6 min',
            fingerTrickTips: 'R2 double turns driven by right wrist.'
          },
          {
            id: 'sc_oll_headlights',
            title: 'CO: Headlights (U)',
            explanation: '2 corners oriented; remaining two stickers face front.',
            algorithm: "R2 D R' U2 R D' R' U2 R'",
            difficulty: 'Intermediate',
            estimatedTime: '6 min',
            fingerTrickTips: 'Bottom layer D flick using left ring finger.'
          },
          {
            id: 'sc_oll_chameleon',
            title: 'CO: Chameleon (T)',
            explanation: '2 corners oriented; remaining stickers face left and right.',
            algorithm: "r U R' U' r' F R F'",
            difficulty: 'Intermediate',
            estimatedTime: '6 min',
            fingerTrickTips: 'Wide r move with right inner layers.'
          },
          {
            id: 'sc_oll_bowtie',
            title: 'CO: Bowtie (L)',
            explanation: '2 diagonal corners oriented.',
            algorithm: "F' r U R' U' r' F R",
            difficulty: 'Intermediate',
            estimatedTime: '6 min',
            fingerTrickTips: 'Start with F\' index push, then inner r slice.'
          }
        ]
      },
      {
        id: 'sc-2look-pll',
        title: 'Phase 4: 2-Look PLL (6 Cases)',
        description: 'Permute the last layer in 2 looks: Corner Permutation (CP) + Edge Permutation (EP).',
        lessons: [
          {
            id: 'sc_pll_t',
            title: 'CP: T Perm (Headlights)',
            explanation: 'One side has matching corners (headlights). Put headlights on Left.',
            algorithm: "R U R' U' R' F R2 U' R' U' R U R' F'",
            difficulty: 'Intermediate',
            estimatedTime: '6 min',
            fingerTrickTips: 'Essential PLL algorithm across all methods.'
          },
          {
            id: 'sc_pll_y',
            title: 'CP: Y Perm (No Headlights)',
            explanation: 'No matching corners on any side. Swaps diagonal corners.',
            algorithm: "F R U' R' U' R U R' F' R U R' U' R' F R F'",
            difficulty: 'Intermediate',
            estimatedTime: '7 min',
            fingerTrickTips: 'Split mentally into setup F + T-Perm variation + F\'.'
          },
          {
            id: 'sc_pll_ua',
            title: 'EP: Ua Perm (Clockwise 3-Edge)',
            explanation: '1 solved edge bar; remaining 3 edges cycle clockwise.',
            algorithm: "R U' R U R U R U' R' U' R2",
            difficulty: 'Intermediate',
            estimatedTime: '5 min',
            fingerTrickTips: 'R U\' rhythm with continuous right-hand flow.'
          },
          {
            id: 'sc_pll_ub',
            title: 'EP: Ub Perm (Counter-Clockwise)',
            explanation: '1 solved edge bar; remaining 3 edges cycle counter-clockwise.',
            algorithm: "R2 U R U R' U' R' U' R' U R'",
            difficulty: 'Intermediate',
            estimatedTime: '5 min',
            fingerTrickTips: 'Starts with R2 U wrist roll.'
          },
          {
            id: 'sc_pll_h',
            title: 'EP: H Perm (Opposite Swaps)',
            explanation: 'Opposite edges swap across the center.',
            algorithm: "M2 U M2 U2 M2 U M2",
            difficulty: 'Intermediate',
            estimatedTime: '5 min',
            fingerTrickTips: 'Middle-ring finger double flick on bottom back for M2.'
          },
          {
            id: 'sc_pll_z',
            title: 'EP: Z Perm (Adjacent Swaps)',
            explanation: 'Adjacent edges swap in pairs.',
            algorithm: "M' U M2 U M2 U M' U2 M2",
            difficulty: 'Intermediate',
            estimatedTime: '6 min',
            fingerTrickTips: 'M\' flick combined with snappy M2 rotations.'
          }
        ]
      },
      {
        id: 'sc-example-solve',
        title: 'Interactive Example Solve',
        description: 'Complete 4-Phase walkthrough showing Cross, F2L, 2-Look OLL, and 2-Look PLL.',
        lessons: [
          {
            id: 'sc_example_solve',
            title: 'Full Simplified CFOP Example Solve',
            explanation: 'Watch each speedcubing stage unfold: Bottom Cross -> Intuitive F2L Pairings -> 2-Look OLL (Cross + Sune) -> 2-Look PLL (T-Perm + Ub-Perm).',
            algorithm: "D' R' F D R2 U R U' R' U' L' U L F R U R' U' F' R U R' U R U2 R' R U R' U' R' F R2 U' R' U' R U R' F' R2 U R U R' U' R' U' R' U R'",
            difficulty: 'Intermediate',
            estimatedTime: '8 min',
            fingerTrickTips: 'Notice the transition speed between F2L slotting and launching OLL.',
            isExampleSolve: true,
            scramble: "R2 U2 B2 D2 L2 F2 U B2 D' L2 U' F' R' U B' D L' B' D2 F"
          }
        ]
      }
    ]
  },

  // 3. FULL CFOP MASTERY (119 ALGS)
  {
    id: 'cfop',
    title: 'Full CFOP Mastery',
    badge: 'Advanced',
    description: 'The world standard for competitive speedcubing: Full F2L, all 57 OLL algorithms, and all 21 PLL algorithms.',
    progress: 0,
    modules: [
      {
        id: 'f2l-mastery',
        title: 'First Two Layers (F2L - 41 Cases)',
        description: 'Simultaneously pair and insert 4 corner-edge pairs into their slots.',
        lessons: [
          {
            id: 'f2l_01',
            title: 'F2L 01: Easy Right Insertion',
            explanation: 'Corner and edge are positioned in the top layer ready for 3-move slotting.',
            algorithm: "U R U' R'",
            difficulty: 'Intermediate',
            estimatedTime: '3 min',
            fingerTrickTips: 'Clean 3-move insertion.'
          },
          {
            id: 'f2l_31',
            title: 'F2L 31: Corner in Slot, Edge in U',
            explanation: 'Corner is inserted in bottom slot with wrong orientation while edge is on top.',
            algorithm: "R U' R' U R U' R'",
            difficulty: 'Advanced',
            estimatedTime: '4 min',
            fingerTrickTips: 'Eject and pair in one continuous movement.'
          }
        ]
      },
      {
        id: 'oll-mastery',
        title: 'Orientation of Last Layer (57 OLL Cases)',
        description: 'Orient all 8 top layer stickers in a single 1-look algorithm.',
        lessons: [
          { id: 'oll_01', title: 'OLL 01 (Dot: Runway)', explanation: 'No edges oriented.', algorithm: "R U2 R2 F R F' U2 R' F R F'", difficulty: 'Advanced', estimatedTime: '5 min', fingerTrickTips: 'Regrip on F move.' },
          { id: 'oll_02', title: 'OLL 02 (Dot: Zamboni)', explanation: 'No edges oriented.', algorithm: "F R U R' U' F' f R U R' U' f'", difficulty: 'Advanced', estimatedTime: '5 min', fingerTrickTips: 'F-sexy-F\' then fat f-sexy-f\'.' },
          { id: 'oll_03', title: 'OLL 03 (Dot: Anti-Backslash)', explanation: 'No edges oriented.', algorithm: "f R U R' U' f' U' F R U R' U' F'", difficulty: 'Advanced', estimatedTime: '5 min', fingerTrickTips: 'Combine wide and standard triggers.' },
          { id: 'oll_04', title: 'OLL 04 (Dot: Backslash)', explanation: 'No edges oriented.', algorithm: "f R U R' U' f' U F R U R' U' F'", difficulty: 'Advanced', estimatedTime: '5 min', fingerTrickTips: 'Wide f start.' },
          { id: 'oll_05', title: 'OLL 05 (Square: Right)', explanation: 'Square shape on right.', algorithm: "r' U2 R U R' U r", difficulty: 'Advanced', estimatedTime: '4 min', fingerTrickTips: 'Inner r slice.' },
          { id: 'oll_06', title: 'OLL 06 (Square: Left)', explanation: 'Square shape on left.', algorithm: "r U2 R' U' R U' r'", difficulty: 'Advanced', estimatedTime: '4 min', fingerTrickTips: 'Left mirror.' },
          { id: 'oll_07', title: 'OLL 07 (Lightning: Small Right)', explanation: 'Lightning bolt shape.', algorithm: "r U R' U R U2 r'", difficulty: 'Advanced', estimatedTime: '4 min', fingerTrickTips: 'Wide Sune variant.' },
          { id: 'oll_08', title: 'OLL 08 (Lightning: Small Left)', explanation: 'Lightning bolt shape on left.', algorithm: "l' U' L U' L' U2 l", difficulty: 'Advanced', estimatedTime: '4 min', fingerTrickTips: 'Left hand wide Sune.' },
          { id: 'oll_09', title: 'OLL 09 (Fish: Kite)', explanation: 'Fish pattern with pointing headlights.', algorithm: "R U R' U' R' F R F'", difficulty: 'Advanced', estimatedTime: '4 min', fingerTrickTips: 'Sexy move into sledgehammer.' },
          { id: 'oll_10', title: 'OLL 10 (Fish: Mounted)', explanation: 'Fish pattern with side sticker.', algorithm: "R U R' U R' F R F' R U2 R'", difficulty: 'Advanced', estimatedTime: '4 min', fingerTrickTips: 'Sune + Sledgehammer.' },
          { id: 'oll_21', title: 'OLL 21 (Cross: H / Double Headlight)', explanation: 'Cross on top, headlights front and back.', algorithm: "F R U R' U' R U R' U' R U R' F'", difficulty: 'Advanced', estimatedTime: '4 min', fingerTrickTips: 'Triple sexy move.' },
          { id: 'oll_22', title: 'OLL 22 (Cross: Pi / Wheel)', explanation: 'Cross on top with left headlights.', algorithm: "R U2 R2 U' R2 U' R2 U2 R", difficulty: 'Advanced', estimatedTime: '4 min', fingerTrickTips: 'R2 wrist rolls.' },
          { id: 'oll_23', title: 'OLL 23 (Cross: Headlights)', explanation: 'Cross with front headlights.', algorithm: "R2 D R' U2 R D' R' U2 R'", difficulty: 'Advanced', estimatedTime: '4 min', fingerTrickTips: 'Left ring finger D flick.' },
          { id: 'oll_24', title: 'OLL 24 (Cross: Chameleon)', explanation: 'Cross with side headlights.', algorithm: "r U R' U' r' F R F'", difficulty: 'Advanced', estimatedTime: '4 min', fingerTrickTips: 'Wide r sexy sledge.' },
          { id: 'oll_25', title: 'OLL 25 (Cross: Bowtie)', explanation: 'Cross with diagonal corners.', algorithm: "F' r U R' U' r' F R", difficulty: 'Advanced', estimatedTime: '4 min', fingerTrickTips: 'Index push F\'.' },
          { id: 'oll_26', title: 'OLL 26 (Cross: Anti-Sune)', explanation: 'Classic Anti-Sune.', algorithm: "R U2 R' U' R U' R'", difficulty: 'Advanced', estimatedTime: '4 min', fingerTrickTips: 'Rapid execution.' },
          { id: 'oll_27', title: 'OLL 27 (Cross: Sune)', explanation: 'Classic Sune.', algorithm: "R U R' U R U2 R'", difficulty: 'Advanced', estimatedTime: '4 min', fingerTrickTips: 'Sub-1s execution.' },
          { id: 'oll_33', title: 'OLL 33 (T-Shape: T1)', explanation: 'T-bar on top layer.', algorithm: "R U R' U' R' F R F'", difficulty: 'Advanced', estimatedTime: '4 min', fingerTrickTips: 'Sexy move + sledge.' },
          { id: 'oll_45', title: 'OLL 45 (T-Shape: T2)', explanation: 'T-shape with oriented edges.', algorithm: "F R U R' U' F'", difficulty: 'Advanced', estimatedTime: '4 min', fingerTrickTips: 'FURU\'F\'.' },
          { id: 'oll_57', title: 'OLL 57 (Corners Orient: H)', explanation: 'H-pattern orientation.', algorithm: "R U R' U' M' U R U' r'", difficulty: 'Advanced', estimatedTime: '4 min', fingerTrickTips: 'M slice coordination.' }
        ]
      },
      {
        id: 'pll-mastery',
        title: 'Permutation of Last Layer (All 21 PLL Cases)',
        description: 'Permute all 8 top layer pieces in a single 1-look algorithm.',
        lessons: [
          { id: 'pll_aa', title: 'Aa Permutation', explanation: 'Corner swap on Left.', algorithm: "x R' D2 R U R' D2 R U' R'", difficulty: 'Advanced', estimatedTime: '5 min', fingerTrickTips: 'Cube rotation x.' },
          { id: 'pll_ab', title: 'Ab Permutation', explanation: 'Corner swap on Right.', algorithm: "x R U' R D2 R' U R D2 R2", difficulty: 'Advanced', estimatedTime: '5 min', fingerTrickTips: 'Double D2 ring-pinky flick.' },
          { id: 'pll_e', title: 'E Permutation', explanation: 'Diagonal corner swaps.', algorithm: "x' R U' R' D R U R' D' R U R' D R U' R' D'", difficulty: 'Advanced', estimatedTime: '6 min', fingerTrickTips: 'D and D\' rhythm.' },
          { id: 'pll_f', title: 'F Permutation', explanation: 'Adjacent corner and edge swap.', algorithm: "R' U' F' R U R' U' R' F R2 U' R' U' R U R' U R", difficulty: 'Advanced', estimatedTime: '6 min', fingerTrickTips: 'T-perm setup variation.' },
          { id: 'pll_ga', title: 'Ga Permutation', explanation: 'G Permutation variant A.', algorithm: "R2 U R' U R' U' R U' R2 U' D R' U R D'", difficulty: 'Advanced', estimatedTime: '6 min', fingerTrickTips: 'Simultaneous U\' D double turn.' },
          { id: 'pll_gb', title: 'Gb Permutation', explanation: 'G Permutation variant B.', algorithm: "R' U' R U D' R2 U R' U R U' R U' R2 D", difficulty: 'Advanced', estimatedTime: '6 min', fingerTrickTips: 'U D\' sync.' },
          { id: 'pll_gc', title: 'Gc Permutation', explanation: 'G Permutation variant C.', algorithm: "R2 U' R U' R U R' U R2 U D' R U' R' D", difficulty: 'Advanced', estimatedTime: '6 min', fingerTrickTips: 'Smooth flow.' },
          { id: 'pll_gd', title: 'Gd Permutation', explanation: 'G Permutation variant D.', algorithm: "R U R' U' D R2 U' R U' R' U R' U R2 D'", difficulty: 'Advanced', estimatedTime: '6 min', fingerTrickTips: 'R2 end turn.' },
          { id: 'pll_h', title: 'H Permutation', explanation: 'Opposite edge swap.', algorithm: "M2 U M2 U2 M2 U M2", difficulty: 'Advanced', estimatedTime: '4 min', fingerTrickTips: 'M2 double flicks.' },
          { id: 'pll_ja', title: 'Ja Permutation', explanation: 'Adjacent bar swap.', algorithm: "x R2 F R F' R U2 r' U r U2", difficulty: 'Advanced', estimatedTime: '5 min', fingerTrickTips: 'x rotation.' },
          { id: 'pll_jb', title: 'Jb Permutation', explanation: 'Adjacent bar swap on right.', algorithm: "R U R' F' R U R' U' R' F R2 U' R'", difficulty: 'Advanced', estimatedTime: '4 min', fingerTrickTips: 'One of the fastest PLLs.' },
          { id: 'pll_na', title: 'Na Permutation', explanation: 'Diagonal corner and edge swap.', algorithm: "R U R' U R U R' F' R U R' U' R' F R2 U' R' U2 R U' R'", difficulty: 'Advanced', estimatedTime: '7 min', fingerTrickTips: 'J-perm based execution.' },
          { id: 'pll_nb', title: 'Nb Permutation', explanation: 'Diagonal swap.', algorithm: "R' U R U' R' F' U' F R U R' F R' F' R U' R", difficulty: 'Advanced', estimatedTime: '7 min', fingerTrickTips: 'Finger fluidity.' },
          { id: 'pll_ra', title: 'Ra Permutation', explanation: 'Adjacent swap.', algorithm: "R U R' F' R U2 R' U2 R' F R U R U2 R'", difficulty: 'Advanced', estimatedTime: '6 min', fingerTrickTips: 'R U2 rhythm.' },
          { id: 'pll_rb', title: 'Rb Permutation', explanation: 'Adjacent swap.', algorithm: "R' U2 R U2 R' F R U R' U' R' F' R2", difficulty: 'Advanced', estimatedTime: '6 min', fingerTrickTips: 'F sledge.' },
          { id: 'pll_t', title: 'T Permutation', explanation: 'Headlights on left.', algorithm: "R U R' U' R' F R2 U' R' U' R U R' F'", difficulty: 'Advanced', estimatedTime: '4 min', fingerTrickTips: 'Sub-0.8s target.' },
          { id: 'pll_ua', title: 'Ua Permutation', explanation: 'Clockwise edge cycle.', algorithm: "R U' R U R U R U' R' U' R2", difficulty: 'Advanced', estimatedTime: '4 min', fingerTrickTips: 'RUS finger tricks.' },
          { id: 'pll_ub', title: 'Ub Permutation', explanation: 'Counter-clockwise edge cycle.', algorithm: "R2 U R U R' U' R' U' R' U R'", difficulty: 'Advanced', estimatedTime: '4 min', fingerTrickTips: 'R2 start.' },
          { id: 'pll_v', title: 'V Permutation', explanation: 'Diagonal corner swap.', algorithm: "R' U R' U' R D' R' D R' U D' R2 U' R2 D R2", difficulty: 'Advanced', estimatedTime: '6 min', fingerTrickTips: 'D layer coordination.' },
          { id: 'pll_y', title: 'Y Permutation', explanation: 'Diagonal swap.', algorithm: "F R U' R' U' R U R' F' R U R' U' R' F R F'", difficulty: 'Advanced', estimatedTime: '5 min', fingerTrickTips: 'F start and finish.' },
          { id: 'pll_z', title: 'Z Permutation', explanation: 'Adjacent edge cycle.', algorithm: "M' U M2 U M2 U M' U2 M2", difficulty: 'Advanced', estimatedTime: '5 min', fingerTrickTips: 'M slice speed.' }
        ]
      },
      {
        id: 'cfop-example-solve',
        title: 'Interactive Example Solve',
        description: 'Complete speedcubing solve walkthrough showing Cross -> 4 F2L Slots -> 1-Look OLL 33 -> 1-Look T-Perm.',
        lessons: [
          {
            id: 'cfop_example_solve',
            title: 'Full CFOP Speedcubing Example Solve',
            explanation: 'Sub-10 execution flow: 5-move White Cross -> 4 fluid F2L slot insertions -> OLL 33 (T1) -> T-Perm PLL finish.',
            algorithm: "D R' D' F2 R2 U R U' R' U R U' R' U R U' R' F R U R' U' F' R U R' U' R' F R2 U' R' U' R U R' F'",
            difficulty: 'Advanced',
            estimatedTime: '8 min',
            fingerTrickTips: 'Observe how rotationless F2L pairing allows instant lookahead into the OLL shape.',
            isExampleSolve: true,
            scramble: "F2 U' R2 B2 D2 L2 D' B2 D' F2 U2 L' B R' F2 D' L2 B' D' R'"
          }
        ]
      }
    ]
  },

  // 4. ROUX METHOD (4 PHASES)
  {
    id: 'roux',
    title: 'Roux Method',
    badge: 'Pro',
    description: 'Blockbuilding, CMLL (42 cases), and M-slice mastery (LSE) for hyper-efficient solves with minimal rotations.',
    progress: 0,
    modules: [
      {
        id: 'roux-fb',
        title: 'Phase 1: First Block (FB)',
        description: 'Build a 1x2x3 block on the left side of the cube (typically matching the Left Blue/White center).',
        lessons: [
          {
            id: 'roux_fb_setup',
            title: 'Left Block Setup & Insertion',
            explanation: 'Align the D-L edge and construct the 1x2x3 block intuitively.',
            algorithm: "L U L' U L U2 L'",
            difficulty: 'Pro',
            estimatedTime: '5 min',
            fingerTrickTips: 'Flick L moves using left ring and middle fingers.'
          }
        ]
      },
      {
        id: 'roux-sb',
        title: 'Phase 2: Second Block (SB)',
        description: 'Build a second 1x2x3 block on the right side using M and R moves without disturbing the First Block.',
        lessons: [
          {
            id: 'roux_sb_setup',
            title: 'Right Block R/M Building',
            explanation: 'Construct the right 1x2x3 block using R and M slice turns.',
            algorithm: "R U' R' U' R U2 R'",
            difficulty: 'Pro',
            estimatedTime: '5 min',
            fingerTrickTips: 'Use left index finger for U\' pushes during right block pairs.'
          }
        ]
      },
      {
        id: 'roux-cmll',
        title: 'Phase 3: CMLL (All 42 Cases / 8 Sets)',
        description: 'Orient and permute the 4 top-layer corners simultaneously using a single algorithm.',
        lessons: [
          { id: 'cmll_o_adj', title: 'CMLL O: Adjacent Swap', explanation: 'Corners oriented, adjacent swap.', algorithm: "R U R' F' R U R' U' R' F R2 U' R'", difficulty: 'Pro', estimatedTime: '6 min', fingerTrickTips: 'T-Perm algorithm.' },
          { id: 'cmll_o_diag', title: 'CMLL O: Diagonal Swap', explanation: 'Corners oriented, diagonal swap.', algorithm: "r U R' U' r' F R F'", difficulty: 'Pro', estimatedTime: '5 min', fingerTrickTips: 'Wide r sexy sledge.' },
          { id: 'cmll_u_fwd', title: 'CMLL U: Forward Bar', explanation: 'U Headlights facing front.', algorithm: "R2 D' R U2 R' D R U2 R", difficulty: 'Pro', estimatedTime: '6 min', fingerTrickTips: 'D\' flick with left ring finger.' },
          { id: 'cmll_u_back', title: 'CMLL U: Back Bar', explanation: 'U Headlights facing back.', algorithm: "R2 D R' U2 R D' R' U2 R'", difficulty: 'Pro', estimatedTime: '6 min', fingerTrickTips: 'D flick with left ring finger.' },
          { id: 'cmll_t_row', title: 'CMLL T: Row', explanation: 'T-pattern corner permutation.', algorithm: "F R U R' U' F'", difficulty: 'Pro', estimatedTime: '4 min', fingerTrickTips: 'FURU\'F\'.' },
          { id: 'cmll_l_mirror', title: 'CMLL L: Mirror', explanation: 'Bowtie pattern.', algorithm: "F' r U R' U' r' F R", difficulty: 'Pro', estimatedTime: '5 min', fingerTrickTips: 'Wide r index push.' },
          { id: 'cmll_s_sune', title: 'CMLL S: Left Bar', explanation: 'Sune CMLL.', algorithm: "R U R' U R U2 R'", difficulty: 'Pro', estimatedTime: '4 min', fingerTrickTips: 'Classic Sune.' },
          { id: 'cmll_as_bar', title: 'CMLL AS: Right Bar', explanation: 'Anti-Sune CMLL.', algorithm: "R U2 R' U' R U' R'", difficulty: 'Pro', estimatedTime: '4 min', fingerTrickTips: 'Anti-Sune.' },
          { id: 'cmll_pi_bar', title: 'CMLL Pi: Right Bar', explanation: 'Pi wheel pattern.', algorithm: "R U2 R2 U' R2 U' R2 U2 R", difficulty: 'Pro', estimatedTime: '5 min', fingerTrickTips: 'R2 wrist rolls.' },
          { id: 'cmll_h_col', title: 'CMLL H: Column', explanation: 'Double headlights CMLL.', algorithm: "F R U R' U' R U R' U' R U R' F'", difficulty: 'Pro', estimatedTime: '5 min', fingerTrickTips: 'Triple sexy move.' }
        ]
      },
      {
        id: 'roux-lse',
        title: 'Phase 4: LSE (Last Six Edges)',
        description: 'Solve the remaining 6 edges (UL, UR, and 4 M-slice edges) using M and U moves.',
        lessons: [
          {
            id: 'roux_lse_4a',
            title: '4a: Edge Orientation (EO)',
            explanation: 'Orient all 6 remaining edges so white/yellow faces up or down.',
            algorithm: "M' U M'",
            difficulty: 'Pro',
            estimatedTime: '4 min',
            fingerTrickTips: 'Ring finger flick for M\' slice.'
          },
          {
            id: 'roux_lse_4b',
            title: '4b: UL & UR Edges',
            explanation: 'Place the Upper-Left (UL) and Upper-Right (UR) edges into their correct side positions.',
            algorithm: "M2 U2 M2",
            difficulty: 'Pro',
            estimatedTime: '4 min',
            fingerTrickTips: 'M2 double flick with ring-middle fingers.'
          },
          {
            id: 'roux_lse_4c',
            title: '4c: EP (Edge Permutation)',
            explanation: 'Permute the remaining 4 M-slice edges to solve the cube.',
            algorithm: "M2 U2 M2 U2",
            difficulty: 'Pro',
            estimatedTime: '4 min',
            fingerTrickTips: 'Continuous double-flick rhythm.'
          }
        ]
      },
      {
        id: 'roux-example-solve',
        title: 'Interactive Example Solve',
        description: 'Full Roux solve walkthrough: First Block (FB) -> Second Block (SB) -> CMLL -> LSE M-Slice Finish.',
        lessons: [
          {
            id: 'roux_example_solve',
            title: 'Full Roux Method Example Solve',
            explanation: 'Step 1 (First Block on Left) -> Step 2 (Second Block on Right) -> Step 3 (CMLL Corner Solve) -> Step 4 (LSE M-Slice Permutation).',
            algorithm: "L U L' U L U2 L' R U' R' U' R U2 R' R U R' U' R' F R F' M2 U M' U2 M U M2",
            difficulty: 'Pro',
            estimatedTime: '8 min',
            fingerTrickTips: 'Notice how the M-slice remains completely free during blockbuilding.',
            isExampleSolve: true,
            scramble: "B2 L2 U2 F2 D R2 D' F2 D B2 D' R' F D2 L B' D' F2 R2 D"
          }
        ]
      }
    ]
  },

  // 5. ZZ METHOD (3 PHASES)
  {
    id: 'zz',
    title: 'ZZ Method (Zbigniew Zborowski)',
    badge: 'Expert',
    description: 'Rotationless solving via Edge Orientation Line (EOline) followed by ZZF2L blockbuilding and COLL/EPLL.',
    progress: 0,
    modules: [
      {
        id: 'zz-eoline',
        title: 'Phase 1: EOline (Edge Orientation + Line)',
        description: 'Orient all 12 edges while placing DF and DB line edges to make the rest of the solve 100% rotationless.',
        lessons: [
          {
            id: 'zz_eoline_setup',
            title: 'EO + Line Setup',
            explanation: 'Identify bad edges during inspection, flip them using F/B moves, and place DF/DB edges.',
            algorithm: "F R U R' U' F' D R2 L2 D'",
            difficulty: 'Expert',
            estimatedTime: '6 min',
            fingerTrickTips: 'Once EOline is complete, your hands never need to regrip for cube rotations.'
          }
        ]
      },
      {
        id: 'zz-f2l',
        title: 'Phase 2: ZZF2L (R, U, L Only)',
        description: 'Build the Left 1x2x3 block and Right 1x2x3 block using only R, U, and L moves without rotations.',
        lessons: [
          {
            id: 'zz_f2l_left',
            title: 'Left Block Slotting',
            explanation: 'Pair and insert corner-edge pairs into the left slots using only L and U moves.',
            algorithm: "L U L'",
            difficulty: 'Expert',
            estimatedTime: '4 min',
            fingerTrickTips: 'Left hand trigger.'
          },
          {
            id: 'zz_f2l_right',
            title: 'Right Block Slotting',
            explanation: 'Pair and insert corner-edge pairs into the right slots using only R and U moves.',
            algorithm: "R U R'",
            difficulty: 'Expert',
            estimatedTime: '4 min',
            fingerTrickTips: 'Right hand trigger.'
          }
        ]
      },
      {
        id: 'zz-ll',
        title: 'Phase 3: Last Layer (COLL & EPLL)',
        description: 'Because all edges are pre-oriented, land directly on yellow cross and solve corners (COLL) + edges (EPLL).',
        lessons: [
          { id: 'zz_coll_sune', title: 'COLL Sune: Anti-Pure', explanation: 'Solve corners simultaneously.', algorithm: "R U R' U R U2 R'", difficulty: 'Expert', estimatedTime: '5 min', fingerTrickTips: 'Sune COLL.' },
          { id: 'zz_coll_antisune', title: 'COLL Anti-Sune: Pure', explanation: 'Anti-Sune corner permutation.', algorithm: "R U2 R' U' R U' R'", difficulty: 'Expert', estimatedTime: '5 min', fingerTrickTips: 'Anti-Sune.' },
          { id: 'zz_coll_h', title: 'COLL H: Columns', explanation: 'Double headlight COLL.', algorithm: "R U2 R' U' R U R' U' R U' R'", difficulty: 'Expert', estimatedTime: '6 min', fingerTrickTips: 'H COLL.' },
          { id: 'zz_coll_t', title: 'COLL T: Rows', explanation: 'T-shape COLL.', algorithm: "r U R' U' r' F R F'", difficulty: 'Expert', estimatedTime: '5 min', fingerTrickTips: 'Wide r sexy sledge.' },
          { id: 'zz_epll_ua', title: 'EPLL: Ua Perm', explanation: 'Clockwise edge cycle.', algorithm: "R U' R U R U R U' R' U' R2", difficulty: 'Expert', estimatedTime: '4 min', fingerTrickTips: '3-edge cycle.' },
          { id: 'zz_epll_ub', title: 'EPLL: Ub Perm', explanation: 'Counter-clockwise edge cycle.', algorithm: "R2 U R U R' U' R' U' R' U R'", difficulty: 'Expert', estimatedTime: '4 min', fingerTrickTips: '3-edge cycle.' },
          { id: 'zz_epll_h', title: 'EPLL: H Perm', explanation: 'Opposite edge swap.', algorithm: "M2 U M2 U2 M2 U M2", difficulty: 'Expert', estimatedTime: '4 min', fingerTrickTips: 'M2 double flick.' },
          { id: 'zz_epll_z', title: 'EPLL: Z Perm', explanation: 'Adjacent edge swap.', algorithm: "M' U M2 U M2 U M' U2 M2", difficulty: 'Expert', estimatedTime: '5 min', fingerTrickTips: 'M slice coordination.' }
        ]
      },
      {
        id: 'zz-example-solve',
        title: 'Interactive Example Solve',
        description: 'Complete rotationless ZZ solve walkthrough: EOline -> ZZF2L Blocks -> COLL Sune -> EPLL Ua Perm finish.',
        lessons: [
          {
            id: 'zz_example_solve',
            title: 'Full ZZ Method Example Solve',
            explanation: 'Phase 1: EOline flips bad edges and places DF/DB line -> Phase 2: ZZF2L solves Left & Right blocks rotationless -> Phase 3: COLL Sune corner solve -> EPLL Ua-Permutation.',
            algorithm: "F R U R' U' F' D R2 L2 D' L U L' R U R' R U R' U R U2 R' R U' R U R U R U' R' U' R2",
            difficulty: 'Expert',
            estimatedTime: '8 min',
            fingerTrickTips: 'Notice how the entire solve from ZZF2L to end is executed using only R, U, L moves with zero cube rotations.',
            isExampleSolve: true,
            scramble: "U2 R2 F2 D2 L2 B2 U L2 D' B2 U' F' D R B L2 D' B' R' D2"
          }
        ]
      }
    ]
  }
];