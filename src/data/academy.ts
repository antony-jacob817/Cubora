export interface Lesson {
  id: string;
  title: string;
  explanation: string;
  algorithm: string;
  difficulty?: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert' | 'Pro';
  estimatedTime?: string;
  fingerTrickTips?: string;
  isCompleted?: boolean;
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
    description: 'The universal 7-step starting point. Learn to solve layer by layer intuitively without heavy memory load.',
    progress: 0,
    modules: [
      {
        id: 'b-step1',
        title: 'Step 1: White Cross (Daisy Method)',
        description: 'Form a white cross on the bottom layer while aligning adjacent edge colors with matching centers.',
        lessons: [
          {
            id: 'b1',
            title: 'White Cross Alignment',
            explanation: 'Position white edge pieces around yellow center (Daisy) and rotate 180° to white face once side colors match.',
            algorithm: 'F2',
            difficulty: 'Beginner',
            estimatedTime: '3 min',
            fingerTrickTips: 'Rotate front face 180 degrees using wrist turn once side edge color matches center.'
          }
        ]
      },
      {
        id: 'b-step2',
        title: 'Step 2: First Layer Corners',
        description: 'Position white corner pieces directly above their slot and insert them into the bottom layer.',
        lessons: [
          {
            id: 'b2',
            title: 'Sexy Move Corner Insertion',
            explanation: 'Target corner piece is directly above its slot in the top right. Repeat until corner is solved.',
            algorithm: "R U R' U'",
            difficulty: 'Beginner',
            estimatedTime: '4 min',
            fingerTrickTips: 'Flick U with right index finger; pull U\' with left index finger.'
          }
        ]
      },
      {
        id: 'b-step3',
        title: 'Step 3: Second Layer (Middle Layer Edges)',
        description: 'Insert edge pieces without yellow into the middle layer slots.',
        lessons: [
          {
            id: 'b3_right',
            title: 'Right Edge Insertion',
            explanation: 'Move top-front edge piece into the Front-Right middle slot.',
            algorithm: "U R U' R' U' F' U F",
            difficulty: 'Beginner',
            estimatedTime: '5 min',
            fingerTrickTips: 'Execute U R U\' R\' then rotate grip slightly left to insert with U\' F\' U F.'
          },
          {
            id: 'b3_left',
            title: 'Left Edge Insertion',
            explanation: 'Move top-front edge piece into the Front-Left middle slot.',
            algorithm: "U' L' U L U F U' F'",
            difficulty: 'Beginner',
            estimatedTime: '5 min',
            fingerTrickTips: 'Symmetrical left-hand version of the right edge insertion.'
          }
        ]
      },
      {
        id: 'b-step4',
        title: 'Step 4: Yellow Cross (OLL Step 1)',
        description: 'Form a yellow cross on the top layer without disturbing the bottom two layers.',
        lessons: [
          {
            id: 'b4',
            title: "FURU'F' (Yellow Cross Setup)",
            explanation: "Apply once for horizontal line, twice for 'L' shape, or three times for center dot.",
            algorithm: "F R U R' U' F'",
            difficulty: 'Beginner',
            estimatedTime: '4 min',
            fingerTrickTips: 'Thumb on front face for F, right index flick for U, push F\' back with right thumb.'
          }
        ]
      },
      {
        id: 'b-step5',
        title: 'Step 5: Permute Yellow Edges',
        description: 'Align the top edge piece colors with their corresponding side center colors.',
        lessons: [
          {
            id: 'b5',
            title: 'Sune Edge Permutation',
            explanation: 'Swaps the front and left yellow edges so all top edges match side center colors.',
            algorithm: "R U R' U R U2 R'",
            difficulty: 'Beginner',
            estimatedTime: '5 min',
            fingerTrickTips: 'Double-flick U2 with right index then middle finger.'
          }
        ]
      },
      {
        id: 'b-step6',
        title: 'Step 6: Position Yellow Corners (Niklas)',
        description: 'Move all yellow corner pieces to their correct physical positions (regardless of rotation).',
        lessons: [
          {
            id: 'b6',
            title: 'Niklas Corner Swap',
            explanation: 'Hold the correctly placed corner on Front-Right-Top and cycle the remaining 3 corners.',
            algorithm: "U R U' L' U R' U' L",
            difficulty: 'Beginner',
            estimatedTime: '5 min',
            fingerTrickTips: 'Alternate index finger U flicks between right and left hand triggers.'
          }
        ]
      },
      {
        id: 'b-step7',
        title: 'Step 7: Orient Yellow Corners',
        description: 'Rotate the last layer corners until the yellow faces are facing upwards.',
        lessons: [
          {
            id: 'b7',
            title: 'Reverse Sexy Move Corner Orientation',
            explanation: 'Hold unoriented corner in Front-Right-Top spot and repeat until yellow faces UP, then turn top layer (U) to load next unsolved corner.',
            algorithm: "R' D' R D",
            difficulty: 'Beginner',
            estimatedTime: '6 min',
            fingerTrickTips: 'Crucial: Never forget the final D move after each corner orientation!'
          }
        ]
      }
    ]
  },
  {
    id: 'simplified-cfop',
    title: 'Simplified CFOP',
    badge: 'Intermediate',
    description: 'An easier version of CFOP using 4-Look Last Layer (4LLL) to transition smoothly from beginner to speedcubing.',
    progress: 0,
    modules: [
      {
        id: 'sc-cross-f2l',
        title: 'Cross & Intuitive F2L',
        description: 'Build 4-edge cross on bottom layer and solve corner-edge pairs simultaneously.',
        lessons: [
          {
            id: 'f2l_basic_insert_right',
            title: 'F2L Basic Right Insertion',
            explanation: 'Corner and edge are already paired in top layer; target slot is Front-Right.',
            algorithm: "U R U' R'",
            difficulty: 'Intermediate',
            estimatedTime: '4 min',
            fingerTrickTips: 'Execute U with right index finger and R U\' R\' in one continuous right-hand motion.'
          },
          {
            id: 'f2l_basic_insert_left',
            title: 'F2L Basic Left Insertion',
            explanation: 'Corner and edge are already paired in top layer; target slot is Front-Left.',
            algorithm: "U' L' U L",
            difficulty: 'Intermediate',
            estimatedTime: '4 min',
            fingerTrickTips: 'Left-hand mirror insertion. Push U\' with left index finger.'
          }
        ]
      },
      {
        id: 'sc-2l-oll',
        title: '2-Look OLL (Orientation)',
        description: 'Orient top layer edges first, then orient top layer corners.',
        lessons: [
          {
            id: 'oll_eo_dot',
            title: 'OLL EO - Dot Case',
            explanation: 'No top edges oriented. Execute Line alg, then L-shape alg.',
            algorithm: "F R U R' U' F' U2 F R U R' U' F'",
            difficulty: 'Intermediate',
            estimatedTime: '5 min',
            fingerTrickTips: 'Combine F (R U R\' U\') F\' with a U2 transition.'
          },
          {
            id: 'oll_eo_l_shape',
            title: 'OLL EO - L-Shape',
            explanation: 'Two adjacent top edges oriented forming an L.',
            algorithm: "f R U R' U' f'",
            difficulty: 'Intermediate',
            estimatedTime: '4 min',
            fingerTrickTips: 'f is wide front move involving top two layers simultaneously.'
          },
          {
            id: 'oll_eo_line',
            title: 'OLL EO - Bar / Line Case',
            explanation: 'Two opposite top edges oriented forming a line.',
            algorithm: "F R U R' U' F'",
            difficulty: 'Intermediate',
            estimatedTime: '4 min',
            fingerTrickTips: 'Standard sexy move enclosed in F and F\' outer turns.'
          },
          {
            id: 'oll_27_sune',
            title: 'OLL CO - Sune',
            explanation: '1 corner oriented; top-left front corner sticker faces front.',
            algorithm: "R U R' U R U2 R'",
            difficulty: 'Intermediate',
            estimatedTime: '5 min',
            fingerTrickTips: 'Continuous right wrist rotation ending with U2 index double-flick.'
          },
          {
            id: 'oll_26_antisune',
            title: 'OLL CO - Anti-Sune',
            explanation: '1 corner oriented; top-right front corner sticker faces right.',
            algorithm: "R U2 R' U' R U' R'",
            difficulty: 'Intermediate',
            estimatedTime: '5 min',
            fingerTrickTips: 'Start with U2 double-flick right after initial R move.'
          },
          {
            id: 'oll_21_cross_h',
            title: 'OLL CO - H (Double Headlight)',
            explanation: '0 corners oriented; two pairs of headlights facing front and back.',
            algorithm: "F R U R' U' R U R' U' R U R' F'",
            difficulty: 'Intermediate',
            estimatedTime: '6 min',
            fingerTrickTips: 'Triple sexy move inside F and F\'.'
          },
          {
            id: 'oll_22_cross_pi',
            title: 'OLL CO - Pi (Wheel)',
            explanation: '0 corners oriented; one pair of headlights on left, two corners pointing away on right.',
            algorithm: "R U2 R2 U' R2 U' R2 U2 R",
            difficulty: 'Intermediate',
            estimatedTime: '6 min',
            fingerTrickTips: 'R2 U\' repetitions executed with smooth right wrist turns.'
          },
          {
            id: 'oll_23_headlights',
            title: 'OLL CO - Headlights (U)',
            explanation: '2 corners oriented; remaining two stickers face front.',
            algorithm: "R2 D R' U2 R D' R' U2 R'",
            difficulty: 'Intermediate',
            estimatedTime: '6 min',
            fingerTrickTips: 'Use left ring finger to push D and D\' bottom layer moves.'
          },
          {
            id: 'oll_24_chameleon',
            title: 'OLL CO - Chameleon (T)',
            explanation: '2 corners oriented; remaining stickers face left and right.',
            algorithm: "r U R' U' r' F R F'",
            difficulty: 'Intermediate',
            estimatedTime: '5 min',
            fingerTrickTips: 'Wide r move start followed by sexy move and r\' F R F\' resolution.'
          },
          {
            id: 'oll_25_bow_tie',
            title: 'OLL CO - Bowtie (L)',
            explanation: '2 diagonal corners oriented.',
            algorithm: "F' r U R' U' r' F R",
            difficulty: 'Intermediate',
            estimatedTime: '5 min',
            fingerTrickTips: 'Push F\' with right thumb to start.'
          }
        ]
      },
      {
        id: 'sc-2l-pll',
        title: '2-Look PLL (Permutation)',
        description: 'Permute corners first using T or Y Perm, then permute remaining edges.',
        lessons: [
          {
            id: 'pll_t_perm',
            title: '2-Look PLL - T Perm (Corner Swap)',
            explanation: 'Headlights on left side; swaps adjacent corners and edges.',
            algorithm: "R U R' U' R' F R2 U' R' U' R U R' F'",
            difficulty: 'Intermediate',
            estimatedTime: '7 min',
            fingerTrickTips: 'Master benchmark algorithm. Keep thumb on R2 regrip.'
          },
          {
            id: 'pll_y_perm',
            title: '2-Look PLL - Y Perm (Diagonal Swap)',
            explanation: 'No headlights; swaps diagonal corners.',
            algorithm: "F R U' R' U' R U R' F' R U R' U' R' F R F'",
            difficulty: 'Intermediate',
            estimatedTime: '8 min',
            fingerTrickTips: 'Combines OLL 33 variation with T-perm ending.'
          },
          {
            id: 'pll_ua_perm',
            title: '2-Look PLL - Ua Perm (Clockwise Edges)',
            explanation: '1 solved bar on back; 3 remaining edges cycle clockwise.',
            algorithm: "R U' R U R U R U' R' U' R2",
            difficulty: 'Intermediate',
            estimatedTime: '5 min',
            fingerTrickTips: 'R U\' R U R U R U\' R\' U\' R2 rhythm is clean and fast.'
          },
          {
            id: 'pll_ub_perm',
            title: '2-Look PLL - Ub Perm (Counter-Clockwise Edges)',
            explanation: '1 solved bar on back; 3 remaining edges cycle counter-clockwise.',
            algorithm: "R2 U R U R' U' R' U' R' U R'",
            difficulty: 'Intermediate',
            estimatedTime: '5 min',
            fingerTrickTips: 'Starts with R2 U before repeating R U R\' U\'.'
          },
          {
            id: 'pll_h_perm',
            title: '2-Look PLL - H Perm (Opposite Edges)',
            explanation: 'Opposite edges swap across the center.',
            algorithm: "M2 U M2 U2 M2 U M2",
            difficulty: 'Intermediate',
            estimatedTime: '4 min',
            fingerTrickTips: 'M2 double flick using right middle & ring finger underneath.'
          },
          {
            id: 'pll_z_perm',
            title: '2-Look PLL - Z Perm (Adjacent Edges)',
            explanation: 'Adjacent edges swap across centers.',
            algorithm: "M' U M2 U M2 U M' U2 M2",
            difficulty: 'Intermediate',
            estimatedTime: '6 min',
            fingerTrickTips: 'Flick M\' upward with right ring finger.'
          }
        ]
      }
    ]
  },
  {
    id: 'cfop',
    title: 'Full CFOP (Fridrich)',
    badge: 'Advanced',
    description: 'The world\'s premier speedcubing system featuring 41 F2L, 57 OLL, and 21 PLL algorithms.',
    progress: 0,
    modules: [
      {
        id: 'cfop-f2l',
        title: 'F2L - First Two Layers (41 Cases)',
        description: 'Simultaneous corner-edge slotting into the 4 lower slots.',
        lessons: [
          {
            id: 'f2l_01',
            title: 'F2L 01 - Basic Right Slot',
            explanation: 'Corner and edge paired in top layer; insert into Front-Right slot.',
            algorithm: "U R U' R'",
            difficulty: 'Advanced',
            estimatedTime: '4 min',
            fingerTrickTips: 'Standard 4-move insertion.'
          },
          {
            id: 'f2l_31',
            title: 'F2L 31 - Corner In Slot, Edge In Top',
            explanation: 'Corner piece is trapped in slot while edge is in U layer.',
            algorithm: "R U' R' U R U' R'",
            difficulty: 'Advanced',
            estimatedTime: '5 min',
            fingerTrickTips: 'Extract corner while pairing edge on U layer.'
          }
        ]
      },
      {
        id: 'cfop-oll',
        title: 'OLL - Orientation of Last Layer (57 Cases)',
        description: 'Orient all top layer stickers in a single algorithm.',
        lessons: [
          { id: 'oll_01', title: 'OLL 01 - Runway (Dot)', explanation: 'All edges and corners unoriented.', algorithm: "R U2 R2 F R F' U2 R' F R F'", difficulty: 'Advanced', estimatedTime: '6 min' },
          { id: 'oll_02', title: 'OLL 02 - Zamboni (Dot)', explanation: 'Dot case with two adjacent outer stickers.', algorithm: "F R U R' U' F' f R U R' U' f'", difficulty: 'Advanced', estimatedTime: '6 min' },
          { id: 'oll_05', title: 'OLL 05 - Right Square', explanation: '2x2 square block on top layer right.', algorithm: "r' U2 R U R' U r", difficulty: 'Advanced', estimatedTime: '5 min' },
          { id: 'oll_09', title: 'OLL 09 - Kite (Fish)', explanation: 'Fish pattern with corner oriented.', algorithm: "R U R' U' R' F R F'", difficulty: 'Advanced', estimatedTime: '5 min' },
          { id: 'oll_21', title: 'OLL 21 - Double Headlights (H)', explanation: 'Yellow cross solved; double headlights on front and back.', algorithm: "F R U R' U' R U R' U' R U R' F'", difficulty: 'Advanced', estimatedTime: '5 min' },
          { id: 'oll_27', title: 'OLL 27 - Sune', explanation: 'Single yellow corner pointing up on front left.', algorithm: "R U R' U R U2 R'", difficulty: 'Advanced', estimatedTime: '4 min' },
          { id: 'oll_33', title: 'OLL 33 - T1 (T-Shape)', explanation: 'T-shaped yellow pattern on top layer.', algorithm: "R U R' U' R' F R F'", difficulty: 'Advanced', estimatedTime: '4 min' },
          { id: 'oll_45', title: 'OLL 45 - T-Shape Line', explanation: 'Simple T-shape with oriented edges.', algorithm: "F R U R' U' F'", difficulty: 'Advanced', estimatedTime: '3 min' },
          { id: 'oll_57', title: 'OLL 57 - H-Shape Stealth', explanation: 'H-shape on top layer with side bars.', algorithm: "R U R' U' M' U R U' r'", difficulty: 'Advanced', estimatedTime: '5 min' }
        ]
      },
      {
        id: 'cfop-pll',
        title: 'PLL - Permutation of Last Layer (21 Cases)',
        description: 'Permute all 4 top corners and 4 top edges in 1 step.',
        lessons: [
          { id: 'pll_aa', title: 'Aa Permutation', explanation: 'Corner swap with headlights on front right.', algorithm: "x R' D2 R U R' D2 R U' R'", difficulty: 'Advanced', estimatedTime: '6 min' },
          { id: 'pll_ab', title: 'Ab Permutation', explanation: 'Corner swap with headlights on front left.', algorithm: "x R U' R D2 R' U R D2 R2", difficulty: 'Advanced', estimatedTime: '6 min' },
          { id: 'pll_e', title: 'E Permutation', explanation: 'Swaps diagonal corners without disturbing edges.', algorithm: "x' R U' R' D R U R' D' R U R' D R U' R' D'", difficulty: 'Advanced', estimatedTime: '8 min' },
          { id: 'pll_f', title: 'F Permutation', explanation: 'Swaps front two corners and two adjacent edges.', algorithm: "R' U' F' R U R' U' R' F R2 U' R' U' R U R' U R", difficulty: 'Advanced', estimatedTime: '8 min' },
          { id: 'pll_h', title: 'H Permutation', explanation: 'Swaps opposite edge pairs across the center.', algorithm: "M2 U M2 U2 M2 U M2", difficulty: 'Advanced', estimatedTime: '4 min' },
          { id: 'pll_ja', title: 'Ja Permutation', explanation: 'Adjacent corner swap with left bar.', algorithm: "x R2 F R F' R U2 r' U r U2", difficulty: 'Advanced', estimatedTime: '6 min' },
          { id: 'pll_jb', title: 'Jb Permutation', explanation: 'Adjacent corner swap with right bar.', algorithm: "R U R' F' R U R' U' R' F R2 U' R'", difficulty: 'Advanced', estimatedTime: '5 min' },
          { id: 'pll_t', title: 'T Permutation', explanation: 'Adjacent corner and edge swap.', algorithm: "R U R' U' R' F R2 U' R' U' R U R' F'", difficulty: 'Advanced', estimatedTime: '6 min' },
          { id: 'pll_ua', title: 'Ua Permutation', explanation: 'Clockwise 3-edge cycle.', algorithm: "R U' R U R U R U' R' U' R2", difficulty: 'Advanced', estimatedTime: '5 min' },
          { id: 'pll_ub', title: 'Ub Permutation', explanation: 'Counter-clockwise 3-edge cycle.', algorithm: "R2 U R U R' U' R' U' R' U R'", difficulty: 'Advanced', estimatedTime: '5 min' },
          { id: 'pll_y', title: 'Y Permutation', explanation: 'Diagonal corner and adjacent edge swap.', algorithm: "F R U' R' U' R U R' F' R U R' U' R' F R F'", difficulty: 'Advanced', estimatedTime: '7 min' },
          { id: 'pll_z', title: 'Z Permutation', explanation: 'Adjacent edge swap across top layer.', algorithm: "M' U M2 U M2 U M' U2 M2", difficulty: 'Advanced', estimatedTime: '5 min' }
        ]
      }
    ]
  },
  {
    id: 'roux',
    title: 'Roux Method',
    badge: 'Pro',
    description: 'Blockbuilding, CMLL (42 cases), and M-slice LSE for hyper-efficient 3D solves.',
    progress: 0,
    modules: [
      {
        id: 'roux-fb-sb',
        title: 'First & Second Blocks (FB & SB)',
        description: 'Build 1x2x3 blocks on left and right sides without affecting center M slice.',
        lessons: [
          { id: 'r1', title: 'First Block (FB) Setup', explanation: 'Build 1x2x3 block on left side (usually blue/white).', algorithm: "L U L' U L U2 L'", difficulty: 'Pro', estimatedTime: '6 min' },
          { id: 'r2', title: 'Second Block (SB) Setup', explanation: 'Build 1x2x3 block on right side using R and M moves.', algorithm: "R U' R' U' R U2 R'", difficulty: 'Pro', estimatedTime: '6 min' }
        ]
      },
      {
        id: 'roux-cmll',
        title: 'CMLL (Corners of Last Layer - 42 Cases)',
        description: 'Orient and permute top layer corners simultaneously.',
        lessons: [
          { id: 'cmll_o_adjacent', title: 'CMLL O - Adjacent Swap', explanation: 'Corners already oriented; swap adjacent corners.', algorithm: "R U R' F' R U R' U' R' F R2 U' R'", difficulty: 'Pro', estimatedTime: '6 min' },
          { id: 'cmll_o_diagonal', title: 'CMLL O - Diagonal Swap', explanation: 'Corners already oriented; swap diagonal corners.', algorithm: "r U R' U' r' F R F'", difficulty: 'Pro', estimatedTime: '6 min' },
          { id: 'cmll_u_forward', title: 'CMLL U - Forward Bar', explanation: 'Headlights case with forward bar.', algorithm: "R2 D' R U2 R' D R U2 R", difficulty: 'Pro', estimatedTime: '7 min' },
          { id: 'cmll_t_left_bar', title: 'CMLL T - Left Bar', explanation: 'Chameleon case with left bar.', algorithm: "r U R' U' r' F R F'", difficulty: 'Pro', estimatedTime: '6 min' },
          { id: 'cmll_l_mirror', title: 'CMLL L - Mirror', explanation: 'Bowtie case with mirror alignment.', algorithm: "F' r U R' U' r' F R", difficulty: 'Pro', estimatedTime: '6 min' },
          { id: 'cmll_s_left_bar', title: 'CMLL S - Left Bar', explanation: 'Sune corner orientation with left bar.', algorithm: "R U R' U R U2 R'", difficulty: 'Pro', estimatedTime: '5 min' },
          { id: 'cmll_as_right_bar', title: 'CMLL AS - Right Bar', explanation: 'Anti-sune corner orientation with right bar.', algorithm: "R U2 R' U' R U' R'", difficulty: 'Pro', estimatedTime: '5 min' },
          { id: 'cmll_pi_right_bar', title: 'CMLL Pi - Right Bar', explanation: 'Wheel case with right bar.', algorithm: "R U2 R2 U' R2 U' R2 U2 R", difficulty: 'Pro', estimatedTime: '6 min' },
          { id: 'cmll_h_column', title: 'CMLL H - Column', explanation: 'Double headlights with column alignment.', algorithm: "F R U R' U' R U R' U' R U R' F'", difficulty: 'Pro', estimatedTime: '6 min' }
        ]
      },
      {
        id: 'roux-lse',
        title: 'LSE - Last Six Edges',
        description: 'Solve remaining 6 edges (UL, UR, and 4 M-slice edges) using M and U moves.',
        lessons: [
          { id: 'lse_eo', title: 'LSE 4a - Edge Orientation (EO)', explanation: 'Orient all 6 remaining edges so white/yellow face up or down.', algorithm: "M' U M'", difficulty: 'Pro', estimatedTime: '4 min' },
          { id: 'lse_ul_ur', title: 'LSE 4b - UL & UR Placement', explanation: 'Place Upper-Left and Upper-Right edges into position.', algorithm: "M2 U2 M2", difficulty: 'Pro', estimatedTime: '4 min' },
          { id: 'lse_ep', title: 'LSE 4c - M-Slice Edge Permutation', explanation: 'Permute remaining 4 M-slice edges to finish solve.', algorithm: "M2 U2 M2 U2", difficulty: 'Pro', estimatedTime: '3 min' }
        ]
      }
    ]
  },
  {
    id: 'zz',
    title: 'ZZ Method',
    badge: 'Expert',
    description: 'Rotationless speedcubing via Edge Orientation Line (EOline), ZZF2L, and COLL/EPLL.',
    progress: 0,
    modules: [
      {
        id: 'zz-eoline-sec',
        title: 'EOline (Edge Orientation + Line)',
        description: 'Orient all 12 edges on inspection while building DF and DB line.',
        lessons: [
          { id: 'eoline_intuitive', title: 'EOline Setup & Execution', explanation: 'Identify bad edges during inspection, flip them with F/B moves, and place DF/DB edges.', algorithm: "F R U R' U' F' D R2 L2 D'", difficulty: 'Expert', estimatedTime: '8 min', fingerTrickTips: 'EOline guarantees rotationless solving using only R, U, L moves!' }
        ]
      },
      {
        id: 'zz-f2l-sec',
        title: 'ZZF2L (Rotationless First Two Layers)',
        description: 'Build left and right 1x2x3 blocks without a single cube rotation.',
        lessons: [
          { id: 'zzf2l_left_block', title: 'ZZF2L Left Block Slotting', explanation: 'Pair and insert corner-edge pairs into left slots using L and U moves.', algorithm: "L U L'", difficulty: 'Expert', estimatedTime: '5 min' },
          { id: 'zzf2l_right_block', title: 'ZZF2L Right Block Slotting', explanation: 'Pair and insert corner-edge pairs into right slots using R and U moves.', algorithm: "R U R'", difficulty: 'Expert', estimatedTime: '5 min' }
        ]
      },
      {
        id: 'zz-ll-sec',
        title: 'Last Layer (COLL & EPLL)',
        description: 'Because EOline guarantees yellow cross on top, solve corners with COLL and edges with EPLL.',
        lessons: [
          { id: 'coll_sune_1', title: 'COLL Sune - Anti-Pure', explanation: 'Solves corner orientation and corner permutation simultaneously.', algorithm: "R U R' U R U2 R'", difficulty: 'Expert', estimatedTime: '6 min' },
          { id: 'coll_antisune_1', title: 'COLL Anti-Sune - Pure', explanation: 'Anti-sune COLL corner orientation & permutation.', algorithm: "R U2 R' U' R U' R'", difficulty: 'Expert', estimatedTime: '6 min' },
          { id: 'coll_h_1', title: 'COLL H - Columns', explanation: 'Double headlights COLL case.', algorithm: "R U2 R' U' R U R' U' R U' R'", difficulty: 'Expert', estimatedTime: '6 min' },
          { id: 'coll_pi_1', title: 'COLL Pi - Pure', explanation: 'Wheel COLL case.', algorithm: "F R U R' U' R U R' U' F'", difficulty: 'Expert', estimatedTime: '6 min' },
          { id: 'epll_ua', title: 'EPLL - Ua Perm', explanation: '3-edge clockwise cycle.', algorithm: "R U' R U R U R U' R' U' R2", difficulty: 'Expert', estimatedTime: '4 min' },
          { id: 'epll_ub', title: 'EPLL - Ub Perm', explanation: '3-edge counter-clockwise cycle.', algorithm: "R2 U R U R' U' R' U' R' U R'", difficulty: 'Expert', estimatedTime: '4 min' },
          { id: 'epll_h', title: 'EPLL - H Perm', explanation: 'Opposite edge swap.', algorithm: "M2 U M2 U2 M2 U M2", difficulty: 'Expert', estimatedTime: '3 min' },
          { id: 'epll_z', title: 'EPLL - Z Perm', explanation: 'Adjacent edge swap.', algorithm: "M' U M2 U M2 U M' U2 M2", difficulty: 'Expert', estimatedTime: '4 min' }
        ]
      }
    ]
  }
];