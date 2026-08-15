export interface SolvePhase {
  phase: string;
  explanation: string;
  moves: string;
}

export interface Lesson {
  id: string;
  title: string;
  explanation: string;
  algorithm: string;
  group?: string;
  difficulty?: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert' | 'Pro';
  estimatedTime?: string;
  fingerTrickTips?: string;
  setup?: string;
  condition?: string;
  isCompleted?: boolean;
  isExampleSolve?: boolean;
  scramble?: string;
  solveSteps?: SolvePhase[];
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
    description: 'The universal layer-by-layer starting point. Learn to solve the cube intuitively without heavy memory load.',
    progress: 0,
    modules: [
      {
        id: 'beginner-first-layer',
        title: 'Step 1 & 2: First Layer (Cross & Corners)',
        description: 'Establish the white cross and insert the 4 white corners to complete the first layer.',
        lessons: [
          {
            id: 'b1',
            title: 'White Cross (Daisy Method)',
            explanation: 'Form a white cross on the bottom layer while aligning adjacent edge colors with matching side centers.',
            algorithm: "F2",
            condition: 'Position white edge pieces around yellow center (Daisy) and rotate 180° to white face once side colors match.',
            difficulty: 'Beginner',
            estimatedTime: '3 min',
            fingerTrickTips: 'Align edge side color with center first, then use a swift double flick (F2) to anchor the white edge.'
          },
          {
            id: 'b2',
            title: 'First Layer Corners (Sexy Move)',
            explanation: 'Position white corner pieces between matching color centers in top layer and insert into bottom layer.',
            algorithm: "R U R' U'",
            condition: 'Target corner piece is directly above its slot in top right. Repeat 1 to 5 times until corner is slotted.',
            difficulty: 'Beginner',
            estimatedTime: '4 min',
            fingerTrickTips: 'Push U with right index finger; pull down R\' with right thumb and wrist.'
          }
        ]
      },
      {
        id: 'beginner-second-layer',
        title: 'Step 3: Second Layer (Middle Edges)',
        description: 'Insert edge pieces without yellow into the middle layer slots.',
        lessons: [
          {
            id: 'b3',
            title: 'Second Layer Right Insertion',
            explanation: 'Move top-front edge piece into the Front-Right slot.',
            algorithm: "U R U' R' U' F' U F",
            condition: 'Front color matches center, top color needs to go to the right side.',
            difficulty: 'Beginner',
            estimatedTime: '5 min',
            fingerTrickTips: 'Execute U R U\' R\' to pair, then regrip slightly to insert with U\' F\' U F.'
          },
          {
            id: 'b4',
            title: 'Second Layer Left Insertion',
            explanation: 'Move top-front edge piece into the Front-Left slot.',
            algorithm: "U' L' U L U F U' F'",
            condition: 'Front color matches center, top color needs to go to the left side.',
            difficulty: 'Beginner',
            estimatedTime: '5 min',
            fingerTrickTips: 'Left hand mirror: U\' L\' U L followed by U F U\' F\'.'
          }
        ]
      },
      {
        id: 'beginner-last-layer',
        title: 'Step 4 to 7: Last Layer Completion',
        description: 'Orient and permute top edges and corners to finish the entire cube.',
        lessons: [
          {
            id: 'b5',
            title: 'Yellow Cross (Edge Orientation)',
            explanation: 'Form a yellow cross on the top layer without disturbing the bottom two layers.',
            algorithm: "F R U R' U' F'",
            condition: 'Apply once for horizontal line, twice for L-shape (f R U R\' U\' f\'), or three times for dot.',
            difficulty: 'Beginner',
            estimatedTime: '5 min',
            fingerTrickTips: 'Hold F down with right thumb, do R U R\' U\', then restore F\' with index finger.'
          },
          {
            id: 'b6',
            title: 'Permute Yellow Edges (Sune)',
            explanation: 'Align top edge piece colors with their corresponding side center colors.',
            algorithm: "R U R' U R U2 R'",
            condition: 'Swaps the front and left yellow edges so all top edges match side centers.',
            difficulty: 'Beginner',
            estimatedTime: '5 min',
            fingerTrickTips: 'Continuous right-hand flow ending with double-flick U2.'
          },
          {
            id: 'b7',
            title: 'Position Yellow Corners (Niklas)',
            explanation: 'Move yellow corner pieces to their correct physical positions.',
            algorithm: "U R U' L' U R' U' L",
            condition: 'Hold the correctly placed corner on Front-Right-Top and cycle the remaining 3 corners.',
            difficulty: 'Beginner',
            estimatedTime: '6 min',
            fingerTrickTips: 'Alternate between right and left triggers: U R U\' L\' then U R\' U\' L.'
          },
          {
            id: 'b8',
            title: 'Orient Yellow Corners',
            explanation: 'Rotate last layer corners until yellow faces up, completing the cube.',
            algorithm: "R' D' R D",
            condition: 'Hold unoriented corner in Front-Right-Top spot and repeat until yellow faces UP, then turn top layer (U) to load next corner.',
            difficulty: 'Beginner',
            estimatedTime: '6 min',
            fingerTrickTips: 'Never rotate the whole cube during this step; only turn the U layer to bring the next unsolved corner!'
          }
        ]
      },
      {
        id: 'beginner-example-solve',
        title: 'Full Example Solve',
        description: 'Complete walkthrough of a full beginner solve with scramble and step-by-step breakdown.',
        lessons: [
          {
            id: 'b-walkthrough-1',
            title: 'Beginner Walkthrough Solve #1',
            explanation: 'Follow every step from Daisy to final corner rotation on a pre-scrambled cube.',
            algorithm: "F2 R2 L2 B2 U R U' R' U' F' U F F R U R' U' F' R U R' U R U2 R' U R U' L' U R' U' L R' D' R D",
            difficulty: 'Beginner',
            estimatedTime: '8 min',
            isExampleSolve: true,
            scramble: "D2 R2 U2 F2 L2 B2 U' L2 U2 B2 R2 D2 F' R' D U2 L' B' F2 U'",
            solveSteps: [
              { phase: 'White Cross', explanation: 'Form the daisy and align matching centers with F2 turns.', moves: "F2 R2 L2 B2" },
              { phase: 'First Layer Corners', explanation: 'Insert bottom corners using Sexy Move (R U R\' U\').', moves: "U R U' R'" },
              { phase: 'Second Layer', explanation: 'Insert middle edges with right and left algorithms.', moves: "U' F' U F" },
              { phase: 'Yellow Cross', explanation: 'Orient top edges with F R U R\' U\' F\'.', moves: "F R U R' U' F'" },
              { phase: 'Permute Edges', explanation: 'Cycle edges with Sune algorithm.', moves: "R U R' U R U2 R'" },
              { phase: 'Position Corners', explanation: 'Cycle corners using Niklas (U R U\' L\' U R\' U\' L).', moves: "U R U' L' U R' U' L" },
              { phase: 'Orient Corners', explanation: 'Final corner twists with R\' D\' R D to solve the cube.', moves: "R' D' R D" }
            ]
          }
        ]
      }
    ]
  },

  // ==========================================
  // 2. SIMPLIFIED CFOP (4-Look Last Layer)
  // ==========================================
  {
    id: 'simplified-cfop',
    title: 'Simplified CFOP',
    badge: 'Intermediate',
    description: 'An accessible version of CFOP using 4-Look Last Layer (4LLL) to transition smoothly to speedcubing.',
    progress: 0,
    modules: [
      {
        id: 'scfop-f2l',
        title: 'Cross & Intuitive F2L',
        description: 'Bottom white cross and paired corner-edge slotting.',
        lessons: [
          {
            id: 'sc-f2l-right',
            title: 'F2L Right Basic Insertion',
            explanation: 'Corner and edge are already paired in top layer; target slot is Front-Right.',
            algorithm: "U R U' R'",
            difficulty: 'Intermediate',
            estimatedTime: '4 min',
            fingerTrickTips: 'Keep thumb on front and slot smoothly with U R U\' R\'.'
          },
          {
            id: 'sc-f2l-left',
            title: 'F2L Left Basic Insertion',
            explanation: 'Corner and edge are already paired in top layer; target slot is Front-Left.',
            algorithm: "U' L' U L",
            difficulty: 'Intermediate',
            estimatedTime: '4 min',
            fingerTrickTips: 'Left index flick for U\' followed by L\' U L.'
          }
        ]
      },
      {
        id: 'scfop-2look-oll',
        title: '2-Look OLL (EO + 7 CO Cases)',
        description: 'Orient top edges (3 cases) then orient top corners (7 cases).',
        lessons: [
          { id: 'sc-eo-dot', title: 'EO: Dot Case', explanation: 'No top edges oriented. Combine line and L-shape.', algorithm: "F R U R' U' F' U2 f R U R' U' f'", difficulty: 'Intermediate', estimatedTime: '5 min' },
          { id: 'sc-eo-l', title: 'EO: L-Shape', explanation: 'Two adjacent top edges oriented.', algorithm: "f R U R' U' f'", difficulty: 'Intermediate', estimatedTime: '4 min' },
          { id: 'sc-eo-line', title: 'EO: Bar / Line', explanation: 'Two opposite top edges oriented.', algorithm: "F R U R' U' F'", difficulty: 'Intermediate', estimatedTime: '4 min' },
          { id: 'sc-co-sune', title: 'CO: Sune', explanation: '1 corner oriented; front-left corner faces front.', algorithm: "R U R' U R U2 R'", difficulty: 'Intermediate', estimatedTime: '4 min' },
          { id: 'sc-co-antisune', title: 'CO: Anti-Sune', explanation: '1 corner oriented; front-right corner faces right.', algorithm: "R U2 R' U' R U' R'", difficulty: 'Intermediate', estimatedTime: '4 min' },
          { id: 'sc-co-h', title: 'CO: H (Double Headlights)', explanation: '0 corners oriented; headlights front and back.', algorithm: "F R U R' U' R U R' U' R U R' U' F'", difficulty: 'Intermediate', estimatedTime: '5 min' },
          { id: 'sc-co-pi', title: 'CO: Pi (Wheel)', explanation: '0 corners oriented; headlights left, opposite right.', algorithm: "R U2 R2 U' R2 U' R2 U2 R", difficulty: 'Intermediate', estimatedTime: '5 min' },
          { id: 'sc-co-headlights', title: 'CO: Headlights (U)', explanation: '2 corners oriented; remaining 2 face front.', algorithm: "R2 D R' U2 R D' R' U2 R'", difficulty: 'Intermediate', estimatedTime: '5 min' },
          { id: 'sc-co-chameleon', title: 'CO: Chameleon (T)', explanation: '2 corners oriented; remaining face left/right.', algorithm: "r U R' U' r' F R F'", difficulty: 'Intermediate', estimatedTime: '5 min' },
          { id: 'sc-co-bowtie', title: 'CO: Bowtie (L)', explanation: '2 diagonal corners oriented.', algorithm: "F' r U R' U' r' F R", difficulty: 'Intermediate', estimatedTime: '5 min' }
        ]
      },
      {
        id: 'scfop-2look-pll',
        title: '2-Look PLL (CP + EP Cases)',
        description: 'Permute corners (T / Y) then permute edges (Ua, Ub, H, Z).',
        lessons: [
          { id: 'sc-cp-t', title: 'CP: T-Perm (Headlights)', explanation: 'Adjacent corner swap with headlights on Left.', algorithm: "R U R' U' R' F R2 U' R' U' R U R' F'", difficulty: 'Intermediate', estimatedTime: '6 min' },
          { id: 'sc-cp-y', title: 'CP: Y-Perm (Diagonal)', explanation: 'Diagonal corner swap when no headlights exist.', algorithm: "F R U' R' U' R U R' F' R U R' U' R' F R F'", difficulty: 'Intermediate', estimatedTime: '6 min' },
          { id: 'sc-ep-ua', title: 'EP: Ua Perm', explanation: '3-edge clockwise cycle with solved back bar.', algorithm: "R U' R U R U R U' R' U' R2", difficulty: 'Intermediate', estimatedTime: '5 min' },
          { id: 'sc-ep-ub', title: 'EP: Ub Perm', explanation: '3-edge counter-clockwise cycle.', algorithm: "R2 U R U R' U' R' U' R' U R'", difficulty: 'Intermediate', estimatedTime: '5 min' },
          { id: 'sc-ep-h', title: 'EP: H Perm', explanation: 'Opposite edge swap across centers.', algorithm: "M2 U M2 U2 M2 U M2", difficulty: 'Intermediate', estimatedTime: '4 min' },
          { id: 'sc-ep-z', title: 'EP: Z Perm', explanation: 'Adjacent edge swap.', algorithm: "M' U M2 U M2 U M' U2 M2", difficulty: 'Intermediate', estimatedTime: '5 min' }
        ]
      },
      {
        id: 'scfop-example-solve',
        title: 'Full Example Solve',
        description: 'Walkthrough of a 4-Look CFOP solve.',
        lessons: [
          {
            id: 'sc-walkthrough-1',
            title: 'Simplified CFOP Walkthrough Solve #1',
            explanation: 'Cross -> Intuitive F2L -> 2-Look OLL -> 2-Look PLL reconstruction.',
            algorithm: "D' R2 D R' U R U' R' U R U' R' f R U R' U' f' R U R' U R U2 R' R U R' U' R' F R2 U' R' U' R U R' F' M2 U M2 U2 M2 U M2",
            difficulty: 'Intermediate',
            estimatedTime: '8 min',
            isExampleSolve: true,
            scramble: "R2 U2 F2 D2 L2 B2 U L2 D F2 R2 U2 B' L D2 R F' D' R2 F'",
            solveSteps: [
              { phase: 'White Cross', explanation: 'Solve bottom cross directly.', moves: "D' R2 D" },
              { phase: 'F2L Slots', explanation: 'Pair and insert corner-edge pairs.', moves: "R' U R U' R' U R U' R'" },
              { phase: '2-Look OLL', explanation: 'Orient edges with f R U R\' U\' f\' then corners with Sune.', moves: "f R U R' U' f' R U R' U R U2 R'" },
              { phase: '2-Look PLL', explanation: 'Corner swap with T-Perm and edge cycle with H-Perm.', moves: "R U R' U' R' F R2 U' R' U' R U R' F' M2 U M2 U2 M2 U M2" }
            ]
          }
        ]
      }
    ]
  },

  // ==========================================
  // 3. FULL CFOP (119 Algorithms)
  // ==========================================
  {
    id: 'cfop',
    title: 'CFOP Mastery',
    badge: 'Advanced',
    description: 'The world standard speedcubing methodology. Master all 41 F2L, 57 OLL, and 21 PLL algorithms.',
    progress: 0,
    modules: [
      {
        id: 'cfop-f2l-triggers',
        title: 'F2L Triggers & Pairing',
        description: 'Essential F2L pairing algorithms and slotting triggers.',
        lessons: [
          { id: 'f2l-01', title: 'F2L Case 01 (Easy Right)', explanation: 'Basic corner and edge insertion into front-right.', algorithm: "U R U' R'", group: 'Basic', difficulty: 'Advanced', estimatedTime: '4 min' },
          { id: 'f2l-02', title: 'F2L Case 02 (Easy Left)', explanation: 'Basic corner and edge insertion into front-left.', algorithm: "U' L' U L", group: 'Basic', difficulty: 'Advanced', estimatedTime: '4 min' },
          { id: 'f2l-31', title: 'F2L Case 31 (Corner in Slot)', explanation: 'Corner in slot, edge in top layer.', algorithm: "R U' R' U R U' R'", group: 'Slotting', difficulty: 'Advanced', estimatedTime: '5 min' },
          { id: 'f2l-sledge', title: 'Sledgehammer Insert', explanation: 'Orient top edge while inserting corner-edge pair.', algorithm: "R' F R F'", group: 'Advanced Insert', difficulty: 'Advanced', estimatedTime: '4 min' }
        ]
      },
      {
        id: 'cfop-oll-57',
        title: 'Full OLL (57 Algorithms)',
        description: 'Orient the entire top layer in one step for any of the 57 possible patterns.',
        lessons: [
          { id: 'oll_01', group: 'Dot', title: 'OLL 01 (Runway)', explanation: 'No edges oriented.', algorithm: "R U2 R2 F R F' U2 R' F R F'", difficulty: 'Advanced', estimatedTime: '5 min' },
          { id: 'oll_02', group: 'Dot', title: 'OLL 02 (Zamboni)', explanation: 'No edges oriented, dot case.', algorithm: "F R U R' U' F' f R U R' U' f'", difficulty: 'Advanced', estimatedTime: '5 min' },
          { id: 'oll_03', group: 'Dot', title: 'OLL 03 (Anti-Backslash)', explanation: 'Dot case with diagonal corners.', algorithm: "f R U R' U' f' U' F R U R' U' F'", difficulty: 'Advanced', estimatedTime: '5 min' },
          { id: 'oll_04', group: 'Dot', title: 'OLL 04 (Backslash)', explanation: 'Dot case with diagonal corners.', algorithm: "f R U R' U' f' U F R U R' U' F'", difficulty: 'Advanced', estimatedTime: '5 min' },
          { id: 'oll_05', group: 'Square', title: 'OLL 05 (Right Square)', explanation: '2x2 yellow square on right.', algorithm: "r' U2 R U R' U r", difficulty: 'Advanced', estimatedTime: '4 min' },
          { id: 'oll_06', group: 'Square', title: 'OLL 06 (Left Square)', explanation: '2x2 yellow square on left.', algorithm: "r U2 R' U' R U' r'", difficulty: 'Advanced', estimatedTime: '4 min' },
          { id: 'oll_07', group: 'Lightning', title: 'OLL 07 (Small Lightning R)', explanation: 'Lightning bolt shape on right.', algorithm: "r U R' U R U2 r'", difficulty: 'Advanced', estimatedTime: '4 min' },
          { id: 'oll_08', group: 'Lightning', title: 'OLL 08 (Small Lightning L)', explanation: 'Lightning bolt shape on left.', algorithm: "l' U' L U' L' U2 l", difficulty: 'Advanced', estimatedTime: '4 min' },
          { id: 'oll_09', group: 'Fish', title: 'OLL 09 (Kite)', explanation: 'Fish tail pattern with corner orientation.', algorithm: "R U R' U' R' F R F'", difficulty: 'Advanced', estimatedTime: '4 min' },
          { id: 'oll_10', group: 'Fish', title: 'OLL 10 (Kite 2)', explanation: 'Fish pattern with side sticker.', algorithm: "R U R' U R' F R F' R U2 R'", difficulty: 'Advanced', estimatedTime: '4 min' },
          { id: 'oll_11', group: 'Thunder', title: 'OLL 11 (Downstairs)', explanation: 'Thunderbolt shape facing down.', algorithm: "r U R' U R U' R' U' r'", difficulty: 'Advanced', estimatedTime: '4 min' },
          { id: 'oll_12', group: 'Thunder', title: 'OLL 12 (Upstairs)', explanation: 'Thunderbolt shape facing up.', algorithm: "F R U R' U' F' U F R U R' U' F'", difficulty: 'Advanced', estimatedTime: '4 min' },
          { id: 'oll_13', group: 'Knight', title: 'OLL 13 (Knight Move 1)', explanation: 'Knight shape case 1.', algorithm: "F U R U' R2 F' R U R U' R'", difficulty: 'Advanced', estimatedTime: '5 min' },
          { id: 'oll_14', group: 'Knight', title: 'OLL 14 (Knight Move 2)', explanation: 'Knight shape case 2.', algorithm: "R U R' U R U' R' U' R' F R F'", difficulty: 'Advanced', estimatedTime: '5 min' },
          { id: 'oll_15', group: 'Knight', title: 'OLL 15 (Knight Move 3)', explanation: 'Knight shape case 3.', algorithm: "l' U' l L' U' L U l' U l", difficulty: 'Advanced', estimatedTime: '5 min' },
          { id: 'oll_16', group: 'Knight', title: 'OLL 16 (Knight Move 4)', explanation: 'Knight shape case 4.', algorithm: "r U r' R U R' U' r U' r'", difficulty: 'Advanced', estimatedTime: '5 min' },
          { id: 'oll_17', group: 'Dot', title: 'OLL 17 (Slash Dot)', explanation: 'Dot case with diagonal wings.', algorithm: "F R U R' U' R' F' r U R U' r'", difficulty: 'Advanced', estimatedTime: '5 min' },
          { id: 'oll_18', group: 'Dot', title: 'OLL 18 (Crown Dot)', explanation: 'Crown pattern dot case.', algorithm: "r U R' U R U2 r2 U' R U' R' U2 r", difficulty: 'Advanced', estimatedTime: '5 min' },
          { id: 'oll_19', group: 'Dot', title: 'OLL 19 (Mummy)', explanation: 'Dot with two opposite corners.', algorithm: "r' R2 U R' U r U2 r' U M'", difficulty: 'Advanced', estimatedTime: '5 min' },
          { id: 'oll_20', group: 'Dot', title: 'OLL 20 (Checkered)', explanation: 'Symmetric checkered dot case.', algorithm: "M U R U R' U' M2 U R U' r'", difficulty: 'Advanced', estimatedTime: '5 min' },
          { id: 'oll_21', group: 'Cross', title: 'OLL 21 (H / Double Headlight)', explanation: 'Cross with headlights front and back.', algorithm: "F R U R' U' R U R' U' R U R' F'", difficulty: 'Advanced', estimatedTime: '4 min' },
          { id: 'oll_22', group: 'Cross', title: 'OLL 22 (Pi / Wheel)', explanation: 'Cross with headlights left and opposite right.', algorithm: "R U2 R2 U' R2 U' R2 U2 R", difficulty: 'Advanced', estimatedTime: '4 min' },
          { id: 'oll_23', group: 'Cross', title: 'OLL 23 (Headlights)', explanation: 'Cross with 2 headlights front.', algorithm: "R2 D R' U2 R D' R' U2 R'", difficulty: 'Advanced', estimatedTime: '4 min' },
          { id: 'oll_24', group: 'Cross', title: 'OLL 24 (Chameleon)', explanation: 'Cross with headlights left and right.', algorithm: "r U R' U' r' F R F'", difficulty: 'Advanced', estimatedTime: '4 min' },
          { id: 'oll_25', group: 'Cross', title: 'OLL 25 (Bowtie)', explanation: 'Cross with diagonal corners.', algorithm: "F' r U R' U' r' F R", difficulty: 'Advanced', estimatedTime: '4 min' },
          { id: 'oll_26', group: 'Cross', title: 'OLL 26 (Anti-Sune)', explanation: '1 corner oriented, anti-sune.', algorithm: "R U2 R' U' R U' R'", difficulty: 'Advanced', estimatedTime: '4 min' },
          { id: 'oll_27', group: 'Cross', title: 'OLL 27 (Sune)', explanation: '1 corner oriented, classic sune.', algorithm: "R U R' U R U2 R'", difficulty: 'Advanced', estimatedTime: '4 min' },
          { id: 'oll_28', group: 'Corners Orient', title: 'OLL 28 (Stealth)', explanation: 'All corners oriented, edges flipped.', algorithm: "r U R' U' M U R U' R'", difficulty: 'Advanced', estimatedTime: '4 min' },
          { id: 'oll_29', group: 'Awkward', title: 'OLL 29 (Awkward Shape 1)', explanation: 'Awkward W shape.', algorithm: "M U R U R' U' R' F R F' M'", difficulty: 'Advanced', estimatedTime: '5 min' },
          { id: 'oll_30', group: 'Awkward', title: 'OLL 30 (Awkward Shape 2)', explanation: 'Awkward shape variation.', algorithm: "F R U R' U2 F' R U R' U' F'", difficulty: 'Advanced', estimatedTime: '5 min' },
          { id: 'oll_31', group: 'P-Shape', title: 'OLL 31 (Couch)', explanation: 'P-shape facing right.', algorithm: "R' U' F U R U' R' F' R", difficulty: 'Advanced', estimatedTime: '4 min' },
          { id: 'oll_32', group: 'P-Shape', title: 'OLL 32 (Anti-Couch)', explanation: 'P-shape facing left.', algorithm: "L U F' U' L' U L F L'", difficulty: 'Advanced', estimatedTime: '4 min' },
          { id: 'oll_33', group: 'T-Shape', title: 'OLL 33 (T1)', explanation: 'T shape with corners facing out.', algorithm: "R U R' U' R' F R F'", difficulty: 'Advanced', estimatedTime: '4 min' },
          { id: 'oll_34', group: 'T-Shape', title: 'OLL 34 (T2)', explanation: 'T shape with front headlights.', algorithm: "R U R2 U' R' F R U R U' F'", difficulty: 'Advanced', estimatedTime: '4 min' },
          { id: 'oll_35', group: 'Fish', title: 'OLL 35 (Fish 1)', explanation: 'Fish pattern variant 1.', algorithm: "R U2 R2 F R F' R U2 R'", difficulty: 'Advanced', estimatedTime: '4 min' },
          { id: 'oll_36', group: 'Fish', title: 'OLL 36 (Mounted Fish)', explanation: 'Fish pattern variant 2.', algorithm: "L' U' L U' L' U L U L F' L' F", difficulty: 'Advanced', estimatedTime: '4 min' },
          { id: 'oll_37', group: 'Fish', title: 'OLL 37 (Fish 3)', explanation: 'Fish pattern variant 3.', algorithm: "F R' F' R U R U' R'", difficulty: 'Advanced', estimatedTime: '4 min' },
          { id: 'oll_38', group: 'Fish', title: 'OLL 38 (Fish 4)', explanation: 'Fish pattern variant 4.', algorithm: "R U B' U' R' U R B R'", difficulty: 'Advanced', estimatedTime: '4 min' },
          { id: 'oll_39', group: 'Lightning', title: 'OLL 39 (Big Lightning L)', explanation: 'Big lightning bolt left.', algorithm: "L F' L' U' L U F U' L'", difficulty: 'Advanced', estimatedTime: '4 min' },
          { id: 'oll_40', group: 'Lightning', title: 'OLL 40 (Big Lightning R)', explanation: 'Big lightning bolt right.', algorithm: "R' F R U R' U' F' U R", difficulty: 'Advanced', estimatedTime: '4 min' },
          { id: 'oll_41', group: 'Awkward', title: 'OLL 41 (Awkward 3)', explanation: 'Awkward shape with side stickers.', algorithm: "R U R' U R U2 R' F R U R' U' F'", difficulty: 'Advanced', estimatedTime: '5 min' },
          { id: 'oll_42', group: 'Awkward', title: 'OLL 42 (Awkward 4)', explanation: 'Awkward shape left mirror.', algorithm: "R' U' R U' R' U2 R F R U R' U' F'", difficulty: 'Advanced', estimatedTime: '5 min' },
          { id: 'oll_43', group: 'P-Shape', title: 'OLL 43 (P-Shape L)', explanation: 'P shape mirror.', algorithm: "f' L' U' L U f", difficulty: 'Advanced', estimatedTime: '4 min' },
          { id: 'oll_44', group: 'P-Shape', title: 'OLL 44 (P-Shape R)', explanation: 'P shape right.', algorithm: "f R U R' U' f'", difficulty: 'Advanced', estimatedTime: '4 min' },
          { id: 'oll_45', group: 'T-Shape', title: 'OLL 45 (T-Shape)', explanation: 'Simple T shape.', algorithm: "F R U R' U' F'", difficulty: 'Advanced', estimatedTime: '4 min' },
          { id: 'oll_46', group: 'C-Shape', title: 'OLL 46 (C-Shape 1)', explanation: 'C shape with corners pointing front.', algorithm: "R' U' R' F R F' U R", difficulty: 'Advanced', estimatedTime: '4 min' },
          { id: 'oll_47', group: 'Small L', title: 'OLL 47 (Small L 1)', explanation: 'Small L shape case 1.', algorithm: "F' L' U' L U L' U' L U F", difficulty: 'Advanced', estimatedTime: '4 min' },
          { id: 'oll_48', group: 'Small L', title: 'OLL 48 (Small L 2)', explanation: 'Small L shape case 2.', algorithm: "F R U R' U' R U R' U' F'", difficulty: 'Advanced', estimatedTime: '4 min' },
          { id: 'oll_49', group: 'Small L', title: 'OLL 49 (Small L 3)', explanation: 'Small L shape case 3.', algorithm: "r U' r2 U r2 U r2 U' r", difficulty: 'Advanced', estimatedTime: '4 min' },
          { id: 'oll_50', group: 'Small L', title: 'OLL 50 (Small L 4)', explanation: 'Small L shape case 4.', algorithm: "r' U r2 U' r2 U' r2 U r'", difficulty: 'Advanced', estimatedTime: '4 min' },
          { id: 'oll_51', group: 'I-Shape', title: 'OLL 51 (I-Shape 1)', explanation: 'Straight horizontal line case 1.', algorithm: "f R U R' U' R U R' U' f'", difficulty: 'Advanced', estimatedTime: '4 min' },
          { id: 'oll_52', group: 'I-Shape', title: 'OLL 52 (I-Shape 2)', explanation: 'Straight horizontal line case 2.', algorithm: "R U R' U R U' B U' B' R'", difficulty: 'Advanced', estimatedTime: '4 min' },
          { id: 'oll_53', group: 'I-Shape', title: 'OLL 53 (I-Shape 3)', explanation: 'Straight horizontal line case 3.', algorithm: "r' U' r R' U' R U r' U r", difficulty: 'Advanced', estimatedTime: '4 min' },
          { id: 'oll_54', group: 'I-Shape', title: 'OLL 54 (I-Shape 4)', explanation: 'Straight horizontal line case 4.', algorithm: "r U r' R U R' U' r U' r'", difficulty: 'Advanced', estimatedTime: '4 min' },
          { id: 'oll_55', group: 'I-Shape', title: 'OLL 55 (I-Shape 5)', explanation: 'Straight horizontal line case 5.', algorithm: "R' F R U R U' R2 F' R2 U' R' U R U R'", difficulty: 'Advanced', estimatedTime: '5 min' },
          { id: 'oll_56', group: 'I-Shape', title: 'OLL 56 (I-Shape 6)', explanation: 'Straight horizontal line case 6.', algorithm: "r U R' U R U2 r' r' U' R U' R' U2 r", difficulty: 'Advanced', estimatedTime: '5 min' },
          { id: 'oll_57', group: 'Corners Orient', title: 'OLL 57 (H-Shape / Stealth 2)', explanation: 'All corners oriented, M slice execution.', algorithm: "R U R' U' M' U R U' r'", difficulty: 'Advanced', estimatedTime: '4 min' }
        ]
      },
      {
        id: 'cfop-pll-21',
        title: 'Full PLL (21 Algorithms)',
        description: 'Permute all last layer pieces simultaneously in a single algorithm.',
        lessons: [
          { id: 'pll_aa', group: 'Corner Swap', title: 'Aa Perm', explanation: 'Adjacent corner swap counter-clockwise.', algorithm: "x R' D2 R U R' D2 R U' R'", difficulty: 'Advanced', estimatedTime: '5 min' },
          { id: 'pll_ab', group: 'Corner Swap', title: 'Ab Perm', explanation: 'Adjacent corner swap clockwise.', algorithm: "x R U' R D2 R' U R D2 R2", difficulty: 'Advanced', estimatedTime: '5 min' },
          { id: 'pll_e', group: 'Corner Swap', title: 'E Perm', explanation: 'Diagonal corner swap without edge movement.', algorithm: "x' R U' R' D R U R' D' R U R' D R U' R' D'", difficulty: 'Advanced', estimatedTime: '6 min' },
          { id: 'pll_f', group: 'Adjacent Swap', title: 'F Perm', explanation: 'T-perm setup variation.', algorithm: "R' U' F' R U R' U' R' F R2 U' R' U' R U R' U R", difficulty: 'Advanced', estimatedTime: '6 min' },
          { id: 'pll_ga', group: 'G Perms', title: 'Ga Perm', explanation: 'Corner and edge cycle combination A.', algorithm: "R2 U R' U R' U' R U' R2 U' D R' U R D'", difficulty: 'Advanced', estimatedTime: '6 min' },
          { id: 'pll_gb', group: 'G Perms', title: 'Gb Perm', explanation: 'Corner and edge cycle combination B.', algorithm: "R' U' R U D' R2 U R' U R U' R U' R2 D", difficulty: 'Advanced', estimatedTime: '6 min' },
          { id: 'pll_gc', group: 'G Perms', title: 'Gc Perm', explanation: 'Corner and edge cycle combination C.', algorithm: "R2 U' R U' R U R' U R2 U D' R U' R' D", difficulty: 'Advanced', estimatedTime: '6 min' },
          { id: 'pll_gd', group: 'G Perms', title: 'Gd Perm', explanation: 'Corner and edge cycle combination D.', algorithm: "R U R' U' D R2 U' R U' R' U R' U R2 D'", difficulty: 'Advanced', estimatedTime: '6 min' },
          { id: 'pll_h', group: 'Edges Only', title: 'H Perm', explanation: 'Opposite edge swap.', algorithm: "M2 U M2 U2 M2 U M2", difficulty: 'Advanced', estimatedTime: '4 min' },
          { id: 'pll_ja', group: 'Adjacent Swap', title: 'Ja Perm', explanation: 'Adjacent corner and edge swap (left bar).', algorithm: "x R2 F R F' R U2 r' U r U2", difficulty: 'Advanced', estimatedTime: '5 min' },
          { id: 'pll_jb', group: 'Adjacent Swap', title: 'Jb Perm', explanation: 'Adjacent corner and edge swap (right bar).', algorithm: "R U R' F' R U R' U' R' F R2 U' R'", difficulty: 'Advanced', estimatedTime: '5 min' },
          { id: 'pll_na', group: 'Diagonal Swap', title: 'Na Perm', explanation: 'Diagonal corner swap right.', algorithm: "R U R' U R U R' F' R U R' U' R' F R2 U' R' U2 R U' R'", difficulty: 'Advanced', estimatedTime: '7 min' },
          { id: 'pll_nb', group: 'Diagonal Swap', title: 'Nb Perm', explanation: 'Diagonal corner swap left.', algorithm: "R' U R U' R' F' U' F R U R' F R' F' R U' R", difficulty: 'Advanced', estimatedTime: '7 min' },
          { id: 'pll_ra', group: 'Adjacent Swap', title: 'Ra Perm', explanation: 'Adjacent corner swap with front bar.', algorithm: "R U R' F' R U2 R' U2 R' F R U R U2 R'", difficulty: 'Advanced', estimatedTime: '6 min' },
          { id: 'pll_rb', group: 'Adjacent Swap', title: 'Rb Perm', explanation: 'Adjacent corner swap with right bar.', algorithm: "R' U2 R U2 R' F R U R' U' R' F' R2", difficulty: 'Advanced', estimatedTime: '6 min' },
          { id: 'pll_t', group: 'Adjacent Swap', title: 'T Perm', explanation: 'The quintessential adjacent corner swap.', algorithm: "R U R' U' R' F R2 U' R' U' R U R' F'", difficulty: 'Advanced', estimatedTime: '5 min' },
          { id: 'pll_ua', group: 'Edges Only', title: 'Ua Perm', explanation: '3-edge clockwise cycle.', algorithm: "R U' R U R U R U' R' U' R2", difficulty: 'Advanced', estimatedTime: '4 min' },
          { id: 'pll_ub', group: 'Edges Only', title: 'Ub Perm', explanation: '3-edge counter-clockwise cycle.', algorithm: "R2 U R U R' U' R' U' R' U R'", difficulty: 'Advanced', estimatedTime: '4 min' },
          { id: 'pll_v', group: 'Diagonal Swap', title: 'V Perm', explanation: 'Diagonal corner and edge swap.', algorithm: "R' U R' U' R D' R' D R' U D' R2 U' R2 D R2", difficulty: 'Advanced', estimatedTime: '6 min' },
          { id: 'pll_y', group: 'Diagonal Swap', title: 'Y Perm', explanation: 'Standard diagonal swap.', algorithm: "F R U' R' U' R U R' F' R U R' U' R' F R F'", difficulty: 'Advanced', estimatedTime: '5 min' },
          { id: 'pll_z', group: 'Edges Only', title: 'Z Perm', explanation: 'Adjacent edge swap.', algorithm: "M' U M2 U M2 U M' U2 M2", difficulty: 'Advanced', estimatedTime: '4 min' }
        ]
      },
      {
        id: 'cfop-example-solve',
        title: 'Full Example Solve',
        description: 'Complete high-speed CFOP solve reconstruction.',
        lessons: [
          {
            id: 'cfop-walkthrough-1',
            title: 'CFOP Speed Reconstruction #1',
            explanation: 'Cross -> 4 F2L Slots -> OLL 33 -> T-Perm.',
            algorithm: "D2 R' D R' U R U' R' U' L' U L R U' R' U R U' R' U R U' R' R U R' U' R' F R F' R U R' U' R' F R2 U' R' U' R U R' F'",
            difficulty: 'Advanced',
            estimatedTime: '10 min',
            isExampleSolve: true,
            scramble: "F2 U2 R2 B2 D2 F2 L2 U' R2 U' L' D2 B' R F' D' U2 R2 B2",
            solveSteps: [
              { phase: 'White Cross', explanation: '4-move efficient bottom cross.', moves: "D2 R' D" },
              { phase: 'F2L Pair 1', explanation: 'Front-Right slot pairing and insertion.', moves: "R' U R U' R'" },
              { phase: 'F2L Pair 2', explanation: 'Back-Left slot rotationless insertion.', moves: "U' L' U L" },
              { phase: 'F2L Pair 3 & 4', explanation: 'Final two slots solved sequentially.', moves: "R U' R' U R U' R' U R U' R'" },
              { phase: '1-Look OLL', explanation: 'OLL 33 (T1) single algorithm orientation.', moves: "R U R' U' R' F R F'" },
              { phase: '1-Look PLL', explanation: 'T-Permutation to solve the entire cube.', moves: "R U R' U' R' F R2 U' R' U' R U R' F'" }
            ]
          }
        ]
      }
    ]
  },

  // ==========================================
  // 4. ROUX METHOD (42 CMLLs + LSE + Example)
  // ==========================================
  {
    id: 'roux',
    title: 'Roux Method',
    badge: 'Pro',
    description: 'Blockbuilding, 42 CMLL cases, and M-slice mastery for hyper-efficient ergonomic solving.',
    progress: 0,
    modules: [
      {
        id: 'roux-blocks',
        title: 'First Block & Second Block',
        description: 'Construct 1x2x3 left and right blocks intuitively.',
        lessons: [
          { id: 'r-fb', title: 'First Block (FB) Concept', explanation: 'Build a 1x2x3 block on the left side (DL edge + 2 F2L pairs) intuitively.', algorithm: "L U L' U L U2 L'", difficulty: 'Pro', estimatedTime: '6 min' },
          { id: 'r-sb', title: 'Second Block (SB) Concept', explanation: 'Build the right 1x2x3 block using only R, r, M, and U moves.', algorithm: "R U' R' U' R U2 R'", difficulty: 'Pro', estimatedTime: '6 min' }
        ]
      },
      {
        id: 'roux-cmll-all',
        title: 'CMLL (42 Cases: O, U, T, L, S, AS, Pi, H)',
        description: 'Orient and permute top corners simultaneously in one step without affecting M-slice.',
        lessons: [
          // O Set (2 cases)
          { id: 'cmll_o_adjacent', group: 'O Set', title: 'CMLL O - Adjacent Swap', explanation: 'Adjacent corner swap.', algorithm: "R U R' F' R U R' U' R' F R2 U' R'", difficulty: 'Pro', estimatedTime: '5 min' },
          { id: 'cmll_o_diagonal', group: 'O Set', title: 'CMLL O - Diagonal Swap', explanation: 'Diagonal corner swap.', algorithm: "r U R' U' r' F R F'", difficulty: 'Pro', estimatedTime: '5 min' },
          // U Set (6 cases)
          { id: 'cmll_u_forward', group: 'U Set', title: 'CMLL U - Forward Bar', explanation: 'Headlights forward.', algorithm: "R2 D' R U2 R' D R U2 R", difficulty: 'Pro', estimatedTime: '5 min' },
          { id: 'cmll_u_back', group: 'U Set', title: 'CMLL U - Back Bar', explanation: 'Headlights back.', algorithm: "R2 D R' U2 R D' R' U2 R'", difficulty: 'Pro', estimatedTime: '5 min' },
          { id: 'cmll_u_slash', group: 'U Set', title: 'CMLL U - Slash', explanation: 'U slash pattern.', algorithm: "F R U R' U' R U R' U' F'", difficulty: 'Pro', estimatedTime: '5 min' },
          { id: 'cmll_u_x', group: 'U Set', title: 'CMLL U - X', explanation: 'U X-pattern.', algorithm: "r U R' U' r' F R F'", difficulty: 'Pro', estimatedTime: '5 min' },
          { id: 'cmll_u_rows', group: 'U Set', title: 'CMLL U - Rows', explanation: 'U rows pattern.', algorithm: "R' U' R U' R' U2 R", difficulty: 'Pro', estimatedTime: '5 min' },
          { id: 'cmll_u_columns', group: 'U Set', title: 'CMLL U - Columns', explanation: 'U columns pattern.', algorithm: "R U R' U R U2 R'", difficulty: 'Pro', estimatedTime: '5 min' },
          // T Set (6 cases)
          { id: 'cmll_t_left_bar', group: 'T Set', title: 'CMLL T - Left Bar', explanation: 'T-shape left bar.', algorithm: "r U R' U' r' F R F'", difficulty: 'Pro', estimatedTime: '5 min' },
          { id: 'cmll_t_right_bar', group: 'T Set', title: 'CMLL T - Right Bar', explanation: 'T-shape right bar.', algorithm: "R' U' R U R' F' R U R' U' R' F R", difficulty: 'Pro', estimatedTime: '5 min' },
          { id: 'cmll_t_row', group: 'T Set', title: 'CMLL T - Row', explanation: 'T-shape row.', algorithm: "F R U R' U' F'", difficulty: 'Pro', estimatedTime: '4 min' },
          { id: 'cmll_t_dots', group: 'T Set', title: 'CMLL T - Dots', explanation: 'T-shape dots.', algorithm: "r' U' R U r U' R'", difficulty: 'Pro', estimatedTime: '5 min' },
          { id: 'cmll_t_anti_slash', group: 'T Set', title: 'CMLL T - Anti-Slash', explanation: 'T anti-slash.', algorithm: "R U2 R' U' R U' R2", difficulty: 'Pro', estimatedTime: '5 min' },
          { id: 'cmll_t_slash', group: 'T Set', title: 'CMLL T - Slash', explanation: 'T slash.', algorithm: "r U' r2 U r2 U r'", difficulty: 'Pro', estimatedTime: '5 min' },
          // L Set (6 cases)
          { id: 'cmll_l_mirror', group: 'L Set', title: 'CMLL L - Mirror', explanation: 'Bowtie mirror.', algorithm: "F' r U R' U' r' F R", difficulty: 'Pro', estimatedTime: '5 min' },
          { id: 'cmll_l_pure', group: 'L Set', title: 'CMLL L - Pure', explanation: 'Bowtie pure.', algorithm: "R U2 R' U' R U R' U' R U' R'", difficulty: 'Pro', estimatedTime: '5 min' },
          { id: 'cmll_l_front_target', group: 'L Set', title: 'CMLL L - Front Target', explanation: 'L front target.', algorithm: "r' U2 R U R' U r", difficulty: 'Pro', estimatedTime: '5 min' },
          { id: 'cmll_l_back_target', group: 'L Set', title: 'CMLL L - Back Target', explanation: 'L back target.', algorithm: "r U2 R' U' R U' r'", difficulty: 'Pro', estimatedTime: '5 min' },
          { id: 'cmll_l_diagonals', group: 'L Set', title: 'CMLL L - Diagonals', explanation: 'L diagonals.', algorithm: "R' U2 R U R' U R", difficulty: 'Pro', estimatedTime: '5 min' },
          { id: 'cmll_l_columns', group: 'L Set', title: 'CMLL L - Columns', explanation: 'L columns.', algorithm: "R U R' U R U2 R'", difficulty: 'Pro', estimatedTime: '5 min' },
          // S Set (6 cases)
          { id: 'cmll_s_left_bar', group: 'S Set', title: 'CMLL S - Left Bar', explanation: 'Sune left bar.', algorithm: "R U R' U R U2 R'", difficulty: 'Pro', estimatedTime: '5 min' },
          { id: 'cmll_s_x_check', group: 'S Set', title: 'CMLL S - X Check', explanation: 'Sune X check.', algorithm: "R U R' U' R' F R F'", difficulty: 'Pro', estimatedTime: '5 min' },
          { id: 'cmll_s_forward_slash', group: 'S Set', title: 'CMLL S - Forward Slash', explanation: 'Sune forward slash.', algorithm: "F R U R' U' F' R U R' U R U2 R'", difficulty: 'Pro', estimatedTime: '5 min' },
          { id: 'cmll_s_back_slash', group: 'S Set', title: 'CMLL S - Back Slash', explanation: 'Sune back slash.', algorithm: "R U R' U R' F R F' R U2 R'", difficulty: 'Pro', estimatedTime: '5 min' },
          { id: 'cmll_s_columns', group: 'S Set', title: 'CMLL S - Columns', explanation: 'Sune columns.', algorithm: "r U R' U' r' F R F'", difficulty: 'Pro', estimatedTime: '5 min' },
          { id: 'cmll_s_rows', group: 'S Set', title: 'CMLL S - Rows', explanation: 'Sune rows.', algorithm: "R' U' R U' R' U2 R", difficulty: 'Pro', estimatedTime: '5 min' },
          // AS Set (6 cases)
          { id: 'cmll_as_right_bar', group: 'AS Set', title: 'CMLL AS - Right Bar', explanation: 'Anti-Sune right bar.', algorithm: "R U2 R' U' R U' R'", difficulty: 'Pro', estimatedTime: '5 min' },
          { id: 'cmll_as_x_check', group: 'AS Set', title: 'CMLL AS - X Check', explanation: 'Anti-Sune X check.', algorithm: "R' U' R U' R' U2 R", difficulty: 'Pro', estimatedTime: '5 min' },
          { id: 'cmll_as_back_slash', group: 'AS Set', title: 'CMLL AS - Back Slash', explanation: 'Anti-Sune back slash.', algorithm: "F R U R' U' F'", difficulty: 'Pro', estimatedTime: '4 min' },
          { id: 'cmll_as_forward_slash', group: 'AS Set', title: 'CMLL AS - Forward Slash', explanation: 'Anti-Sune forward slash.', algorithm: "r U R' U' r' F R F'", difficulty: 'Pro', estimatedTime: '5 min' },
          { id: 'cmll_as_columns', group: 'AS Set', title: 'CMLL AS - Columns', explanation: 'Anti-Sune columns.', algorithm: "R U R' U R U2 R'", difficulty: 'Pro', estimatedTime: '5 min' },
          { id: 'cmll_as_rows', group: 'AS Set', title: 'CMLL AS - Rows', explanation: 'Anti-Sune rows.', algorithm: "R2 D' R U2 R' D R U2 R", difficulty: 'Pro', estimatedTime: '5 min' },
          // Pi Set (6 cases)
          { id: 'cmll_pi_right_bar', group: 'Pi Set', title: 'CMLL Pi - Right Bar', explanation: 'Pi right bar.', algorithm: "R U2 R2 U' R2 U' R2 U2 R", difficulty: 'Pro', estimatedTime: '5 min' },
          { id: 'cmll_pi_back_slash', group: 'Pi Set', title: 'CMLL Pi - Back Slash', explanation: 'Pi back slash.', algorithm: "F R U R' U' R U R' U' F'", difficulty: 'Pro', estimatedTime: '5 min' },
          { id: 'cmll_pi_x', group: 'Pi Set', title: 'CMLL Pi - X', explanation: 'Pi X pattern.', algorithm: "r U R' U' r' F R F'", difficulty: 'Pro', estimatedTime: '5 min' },
          { id: 'cmll_pi_columns', group: 'Pi Set', title: 'CMLL Pi - Columns', explanation: 'Pi columns.', algorithm: "R U R' U R U2 R'", difficulty: 'Pro', estimatedTime: '5 min' },
          { id: 'cmll_pi_slash', group: 'Pi Set', title: 'CMLL Pi - Slash', explanation: 'Pi slash.', algorithm: "R' U' R U' R' U2 R", difficulty: 'Pro', estimatedTime: '5 min' },
          { id: 'cmll_pi_pure', group: 'Pi Set', title: 'CMLL Pi - Pure', explanation: 'Pi pure.', algorithm: "F R U R' U' R U R' U' R U R' F'", difficulty: 'Pro', estimatedTime: '5 min' },
          // H Set (4 cases)
          { id: 'cmll_h_columns', group: 'H Set', title: 'CMLL H - Columns', explanation: 'H columns.', algorithm: "R U2 R' U' R U R' U' R U' R'", difficulty: 'Pro', estimatedTime: '5 min' },
          { id: 'cmll_h_rows', group: 'H Set', title: 'CMLL H - Rows', explanation: 'H rows.', algorithm: "F R U R' U' R U R' U' R U R' F'", difficulty: 'Pro', estimatedTime: '5 min' }
        ]
      },
      {
        id: 'roux-lse',
        title: 'LSE (Last Six Edges: 4a, 4b, 4c)',
        description: 'Complete the remaining 6 edges using M and U slice moves only.',
        lessons: [
          { id: 'r-lse-4a', title: 'LSE 4a: Edge Orientation (EO)', explanation: 'Orient all 6 remaining edges using M\' and U moves.', algorithm: "M' U M' U2 M' U M'", difficulty: 'Pro', estimatedTime: '5 min' },
          { id: 'r-lse-4b', title: 'LSE 4b: UL and UR Placement', explanation: 'Place the Left and Right top edges into their side slots.', algorithm: "M2 U' M2", difficulty: 'Pro', estimatedTime: '4 min' },
          { id: 'r-lse-4c', title: 'LSE 4c: Middle Slice Permutation', explanation: 'Permute the remaining 4 M-slice edges.', algorithm: "M2 U2 M2 U2", difficulty: 'Pro', estimatedTime: '4 min' }
        ]
      },
      {
        id: 'roux-example-solve',
        title: 'Full Example Solve',
        description: 'Complete ergonomic Roux solve reconstruction.',
        lessons: [
          {
            id: 'roux-walkthrough-1',
            title: 'Roux Method Walkthrough Solve #1',
            explanation: 'First Block -> Second Block -> CMLL U-Slash -> LSE 4a/4b/4c.',
            algorithm: "L U L' U L U2 L' R U' R' U' R U2 R' F R U R' U' R U R' U' F' M' U M' U2 M' U M' M2 U' M2 M2 U2 M2 U2",
            difficulty: 'Pro',
            estimatedTime: '10 min',
            isExampleSolve: true,
            scramble: "L2 U2 R2 F2 U' L2 D B2 U2 F2 R2 U' F' L2 D' U' B R2 F D' U'",
            solveSteps: [
              { phase: 'First Block (FB)', explanation: 'Build 1x2x3 left block intuitively.', moves: "L U L' U L U2 L'" },
              { phase: 'Second Block (SB)', explanation: 'Build right 1x2x3 block with M/R/U moves.', moves: "R U' R' U' R U2 R'" },
              { phase: 'CMLL', explanation: 'Orient & permute corners with CMLL U-Slash.', moves: "F R U R' U' R U R' U' F'" },
              { phase: 'LSE (4a, 4b, 4c)', explanation: 'Solve remaining 6 edges using M and U slices.', moves: "M' U M' U2 M' U M' M2 U' M2 M2 U2 M2 U2" }
            ]
          }
        ]
      }
    ]
  },

  // ==========================================
  // 5. ZZ METHOD (EOline, ZZF2L, COLL, EPLL)
  // ==========================================
  {
    id: 'zz',
    title: 'ZZ Method',
    badge: 'Expert',
    description: 'Rotationless solving starting with EOline, blockbuilding ZZF2L, and finishing with COLL + EPLL.',
    progress: 0,
    modules: [
      {
        id: 'zz-eoline',
        title: 'EOline (Edge Orientation + Line)',
        description: 'Orient all 12 edges and place DF and DB line edges.',
        lessons: [
          {
            id: 'z-eo',
            title: 'EOline Setup',
            explanation: 'Orient all 12 edges during inspection and place the DF and DB line edges on the bottom layer.',
            algorithm: "F R U R' U' F' D R2 L2 D'",
            condition: 'Identify bad edges during inspection, flip them into oriented state using F/B moves, and seat line with D/L/R.',
            difficulty: 'Expert',
            estimatedTime: '7 min',
            fingerTrickTips: 'Once EOline is complete, the remainder of the solve is 100% rotationless using only R, U, L moves!'
          }
        ]
      },
      {
        id: 'zz-f2l',
        title: 'ZZF2L (Rotationless Blockbuilding)',
        description: 'Complete the first two layers using only R, U, and L moves.',
        lessons: [
          { id: 'z-f2l-left', title: 'ZZF2L Left Block Insertion', explanation: 'Pair and insert left slots rotation-free using L and U moves.', algorithm: "L U L'", difficulty: 'Expert', estimatedTime: '5 min' },
          { id: 'z-f2l-right', title: 'ZZF2L Right Block Insertion', explanation: 'Pair and insert right slots rotation-free using R and U moves.', algorithm: "R U R'", difficulty: 'Expert', estimatedTime: '5 min' }
        ]
      },
      {
        id: 'zz-coll-epll',
        title: 'COLL & EPLL Last Layer',
        description: 'Solves corner orientation and permutation simultaneously, followed by a simple edge cycle.',
        lessons: [
          { id: 'coll_sune', group: 'COLL', title: 'COLL Sune (Anti-Pure)', explanation: 'Sune corner solve without disturbing top edges.', algorithm: "R U R' U R U2 R'", difficulty: 'Expert', estimatedTime: '5 min' },
          { id: 'coll_antisune', group: 'COLL', title: 'COLL Anti-Sune (Pure)', explanation: 'Anti-Sune corner solve.', algorithm: "R U2 R' U' R U' R'", difficulty: 'Expert', estimatedTime: '5 min' },
          { id: 'coll_h', group: 'COLL', title: 'COLL H (Columns)', explanation: 'H-set corner solve.', algorithm: "R U2 R' U' R U R' U' R U' R'", difficulty: 'Expert', estimatedTime: '5 min' },
          { id: 'coll_pi', group: 'COLL', title: 'COLL Pi (Pure)', explanation: 'Pi-set corner solve.', algorithm: "F R U R' U' R U R' U' F'", difficulty: 'Expert', estimatedTime: '5 min' },
          { id: 'coll_u', group: 'COLL', title: 'COLL U (Forward Bar)', explanation: 'U-set corner solve.', algorithm: "R2 D' R U2 R' D R U2 R", difficulty: 'Expert', estimatedTime: '5 min' },
          { id: 'coll_t', group: 'COLL', title: 'COLL T (Rows)', explanation: 'T-set corner solve.', algorithm: "r U R' U' r' F R F'", difficulty: 'Expert', estimatedTime: '5 min' },
          { id: 'coll_l', group: 'COLL', title: 'COLL L (Pure)', explanation: 'L-set corner solve.', algorithm: "F' r U R' U' r' F R", difficulty: 'Expert', estimatedTime: '5 min' },
          { id: 'epll_ua', group: 'EPLL', title: 'EPLL: Ua Perm', explanation: '3-edge clockwise cycle.', algorithm: "R U' R U R U R U' R' U' R2", difficulty: 'Expert', estimatedTime: '4 min' },
          { id: 'epll_ub', group: 'EPLL', title: 'EPLL: Ub Perm', explanation: '3-edge counter-clockwise cycle.', algorithm: "R2 U R U R' U' R' U' R' U R'", difficulty: 'Expert', estimatedTime: '4 min' },
          { id: 'epll_h', group: 'EPLL', title: 'EPLL: H Perm', explanation: 'Opposite edge swap.', algorithm: "M2 U M2 U2 M2 U M2", difficulty: 'Expert', estimatedTime: '4 min' },
          { id: 'epll_z', group: 'EPLL', title: 'EPLL: Z Perm', explanation: 'Adjacent edge swap.', algorithm: "M' U M2 U M2 U M' U2 M2", difficulty: 'Expert', estimatedTime: '4 min' }
        ]
      },
      {
        id: 'zz-example-solve',
        title: 'Full Example Solve',
        description: 'Complete rotationless ZZ solve reconstruction.',
        lessons: [
          {
            id: 'zz-walkthrough-1',
            title: 'ZZ Method Walkthrough Solve #1',
            explanation: 'EOline -> ZZF2L Left Block -> ZZF2L Right Block -> COLL Sune -> EPLL Ua.',
            algorithm: "F R U R' U' F' D R2 L2 D' L U L' U' L U L' R U R' U' R U R' R U R' U R U2 R' R U' R U R U R U' R' U' R2",
            difficulty: 'Expert',
            estimatedTime: '10 min',
            isExampleSolve: true,
            scramble: "B2 D2 L2 F2 U2 R2 U' L2 D' B2 R2 F2 R' B' D' R' F2 D2 U' L' F'",
            solveSteps: [
              { phase: 'EOline', explanation: 'Orient all edges and place DF/DB line edges on bottom.', moves: "F R U R' U' F' D R2 L2 D'" },
              { phase: 'ZZF2L Left Block', explanation: 'Solve Left 1x2x3 block rotationless.', moves: "L U L' U' L U L'" },
              { phase: 'ZZF2L Right Block', explanation: 'Solve Right 1x2x3 block rotationless.', moves: "R U R' U' R U R'" },
              { phase: 'COLL (Corners)', explanation: 'Solve all 4 top corners while keeping edges oriented.', moves: "R U R' U R U2 R'" },
              { phase: 'EPLL (Edges)', explanation: 'Final 3-edge cycle with EPLL Ua to complete the solve.', moves: "R U' R U R U R U' R' U' R2" }
            ]
          }
        ]
      }
    ]
  }
];
