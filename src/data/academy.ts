export interface LessonPhase {
  phase: string;
  explanation: string;
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
  phases?: LessonPhase[];
  group?: string;
  condition?: string;
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
}

export const ACADEMY_COURSES: Course[] = [
  // =========================================================================
  // 1. BEGINNER METHOD
  // =========================================================================
  {
    id: 'beginner',
    title: 'Beginner Method',
    badge: 'Fundamentals',
    description: 'The classic layer-by-layer method. Learn intuitive visual cues, trigger mechanics, and solve your first Rubik\'s cube.',
    progress: 100,
    isAlgorithmic: false,
    modules: [
      {
        id: 'beginner-example-solve',
        title: 'Full Example Solve Walkthrough',
        description: 'Watch a complete beginner solve from start to finish with conversational, YouTuber-style breakdowns for every single step.',
        lessons: [
          {
            id: 'beginner-walkthrough-1',
            title: 'Full Layer-by-Layer Example Solve',
            explanation: 'Follow along with this full beginner solve. We take a scrambled cube, build the Daisy, drop the White Cross, solve the First Layer corners with Sexy Moves, insert Middle Layer edges, form the Yellow Cross, permute edges, position corners, and finish with corner orientation!',
            algorithm: "D R' D' F2 L' U L F2 U R U' R' U' L' U L U R U' R' U' F' U F F R U R' U' F' R U R' U R U2 R' U R U' L' U R' U' L R' D' R D R' D' R D U R' D' R D R' D' R D U",
            isExampleSolve: true,
            scramble: "D L F' U' D' F D F R' U2 F U2 B2 U L B' D' F' B R F2",
            phases: [
              {
                phase: "Step 1: Daisy & White Cross",
                explanation: "Hey cubers! We start by finding white edge pieces and placing them around the yellow center to create our 'Daisy'. Once side colors match their centers, we do 180° rotations (F2, R2) to drop them to the white face.",
                moves: "D R' D' F2 L' U L F2"
              },
              {
                phase: "Step 2: First Layer Corners",
                explanation: "Now we look for white corners in the top layer. Align the corner diagonally above its matching colored slot, and repeat the famous Right-Hand 'Sexy Move' (R U R' U') until the corner locks into the bottom layer!",
                moves: "U R U' R' U' L' U L"
              },
              {
                phase: "Step 3: Second Layer Edges",
                explanation: "Middle layer time! Find an edge on top that doesn't have yellow. To insert it into the front-right slot, move it away (U), bring the right slot up (R U' R'), then rotate to face the target and insert (U' F' U F).",
                moves: "U R U' R' U' F' U F"
              },
              {
                phase: "Step 4: Yellow Cross (FURU'F')",
                explanation: "Time for the top layer! We use the FUR-U-RUF trigger (F R U R' U' F'). If you have a dot, do it 3 times; if an 'L' shape, hold it in the top-left and do it twice; if a horizontal line, do it once to get the Yellow Cross!",
                moves: "F R U R' U' F'"
              },
              {
                phase: "Step 5: Permute Yellow Edges (Sune)",
                explanation: "Align the yellow cross edges with their matching side colors. If two adjacent edges are swapped, hold them in the front and left and execute the classic Sune algorithm (R U R' U R U2 R').",
                moves: "R U R' U R U2 R'"
              },
              {
                phase: "Step 6: Position Yellow Corners (Niklas)",
                explanation: "We need each corner in its correct physical spot. Find one corner that is already between its 3 matching color centers, place it at the Front-Right-Top, and do Niklas (U R U' L' U R' U' L) to cycle the remaining 3 corners.",
                moves: "U R U' L' U R' U' L"
              },
              {
                phase: "Step 7: Orient Corners (R' D' R D)",
                explanation: "Final step! Flip the cube so yellow is on top. Hold an unsolved corner in the Front-Right-Top spot and repeat (R' D' R D) until yellow points UP. Then turn ONLY the top layer (U) to bring the next unsolved corner over, and repeat to solve!",
                moves: "R' D' R D R' D' R D U R' D' R D R' D' R D U"
              }
            ]
          }
        ]
      },
      {
        id: 'beginner-7-steps',
        title: 'The 7 Fundamental Steps',
        description: 'Master each core step of the beginner method with dedicated triggers and visual mechanics.',
        lessons: [
          {
            id: 'b-step-1',
            title: '1. White Cross (Daisy Method)',
            explanation: 'Position white edge pieces around the yellow center (Daisy), match the side colors to adjacent centers, and rotate 180° (F2) to the white bottom face.',
            algorithm: 'F2 R2 L2 B2',
            condition: 'Daisy formed around yellow center; align side colors.'
          },
          {
            id: 'b-step-2',
            title: '2. First Layer Corners (Sexy Move)',
            explanation: 'Position white corner pieces above their target slot and execute the Sexy Move trigger (R U R\' U\') 1 to 5 times until the corner settles into place with white facing down.',
            algorithm: "R U R' U'",
            condition: 'Target corner piece is directly above its slot in the top right.'
          },
          {
            id: 'b-step-3a',
            title: '3a. Second Layer (Right Edge Insertion)',
            explanation: 'When the top-front edge needs to move into the Front-Right middle slot, move it away to the left and insert with this 8-move flow.',
            algorithm: "U R U' R' U' F' U F",
            condition: 'Top-front edge matches front center; needs to go right.'
          },
          {
            id: 'b-step-3b',
            title: '3b. Second Layer (Left Edge Insertion)',
            explanation: 'When the top-front edge needs to move into the Front-Left middle slot, move it away to the right and insert.',
            algorithm: "U' L' U L U F U' F'",
            condition: 'Top-front edge matches front center; needs to go left.'
          },
          {
            id: 'b-step-4',
            title: '4. Yellow Cross (FURU\'F\')',
            explanation: 'Form the yellow cross without disturbing the first two layers. Works for dot, L-shape, and horizontal bar cases.',
            algorithm: "F R U R' U' F'",
            condition: 'Execute for horizontal line, L-shape in top-left, or dot.'
          },
          {
            id: 'b-step-5',
            title: '5. Permute Yellow Edges (Sune)',
            explanation: 'Swap the front and left yellow edges so all 4 top edges match their corresponding side center colors.',
            algorithm: "R U R' U R U2 R'",
            condition: 'Two adjacent top edges need to swap.'
          },
          {
            id: 'b-step-6',
            title: '6. Position Corners (Niklas)',
            explanation: 'Cycles 3 corners while keeping the front-right corner locked in place until all 4 corners are in their proper positions.',
            algorithm: "U R U' L' U R' U' L",
            condition: 'Hold the correctly positioned corner on Front-Right-Top.'
          },
          {
            id: 'b-step-7',
            title: '7. Orient Corners (Reverse Sexy Move)',
            explanation: 'Hold the unsolved corner in the Front-Right-Top spot and repeat R\' D\' R D until yellow faces UP, then turn the U face to load the next corner.',
            algorithm: "R' D' R D",
            condition: 'Hold unoriented corner in Front-Right-Top.'
          }
        ]
      }
    ]
  },

  // =========================================================================
  // 2. SIMPLIFIED CFOP (4-LOOK LAST LAYER)
  // =========================================================================
  {
    id: 'simplified-cfop',
    title: 'Simplified CFOP',
    badge: 'Intermediate',
    description: 'Transition smoothly into speedcubing with Intuitive F2L, 2-Look OLL (3 EO, 7 CO), and 2-Look PLL (2 CP, 4 EP).',
    progress: 45,
    isAlgorithmic: true,
    modules: [
      {
        id: 'simplified-example-solve',
        title: 'Full Example Solve Walkthrough',
        description: 'Step-by-step speedcubing walkthrough using Simplified CFOP (Intuitive Cross & F2L, 2-Look OLL, 2-Look PLL).',
        lessons: [
          {
            id: 'simplified-walkthrough-1',
            title: '4-Look Last Layer Full Solve',
            explanation: 'Watch how Simplified CFOP cuts solve times in half. We construct a 4-move bottom cross, insert 4 F2L pairs intuitively, orient the top with 2-Look OLL, and finish with 2-Look PLL!',
            algorithm: "D R' D' F2 U R U' R' U' L' U L U R U' R' U' F' U F f R U R' U' f' R U R' U R U2 R' R U R' U' R' F R2 U' R' U' R U R' F' R U' R U R U R U' R' U' R2",
            isExampleSolve: true,
            scramble: "D L F' U' D' F D F R' U2 F U2 B2 U L B' D' F' B R F2",
            phases: [
              {
                phase: "Phase 1: Direct White Cross",
                explanation: "Unlike beginner method where we make a daisy first, in CFOP we build the white cross directly on the bottom face in 4 to 8 moves during inspection.",
                moves: "D R' D' F2"
              },
              {
                phase: "Phase 2: Intuitive F2L (Pairs 1-4)",
                explanation: "We solve the corner and edge simultaneously as a pair into the 4 slots between the cross edges, eliminating the need for separate corner/edge steps!",
                moves: "U R U' R' U' L' U L U R U' R' U' F' U F"
              },
              {
                phase: "Phase 3a: 2-Look OLL (Edge Orientation)",
                explanation: "Look at the top face edges. We have an L-shape, so we fire the wide 'f' trigger (f R U R' U' f') to orient all 4 edges immediately into a yellow cross!",
                moves: "f R U R' U' f'"
              },
              {
                phase: "Phase 3b: 2-Look OLL (Corner Orientation - Sune)",
                explanation: "Now we have 1 yellow corner pointing up and 3 needing flip. We execute standard Sune (R U R' U R U2 R') to make the entire top face yellow in one go!",
                moves: "R U R' U R U2 R'"
              },
              {
                phase: "Phase 4a: 2-Look PLL (Corner Permutation - T-Perm)",
                explanation: "We spot a pair of headlights on the left. We run the iconic T-Permutation to solve all 4 corners simultaneously!",
                moves: "R U R' U' R' F R2 U' R' U' R U R' F'"
              },
              {
                phase: "Phase 4b: 2-Look PLL (Edge Permutation - Ua Perm)",
                explanation: "All corners are solved and we have 1 solved back bar with 3 edges cycling clockwise. We fire the Ua Perm (R U' R U R U R U' R' U' R2) to complete the solve!",
                moves: "R U' R U R U R U' R' U' R2"
              }
            ]
          }
        ]
      },
      {
        id: 'simplified-f2l',
        title: 'Intuitive F2L Fundamentals',
        description: 'Pair up corner and edge pieces in the top layer and insert them together.',
        lessons: [
          {
            id: 'sim-f2l-right',
            title: 'Basic Right Insertion',
            explanation: 'When corner and edge are paired in the top layer, insert them smoothly into the Front-Right slot.',
            algorithm: "U R U' R'",
            condition: 'Pair ready in U layer; slot in Front-Right.'
          },
          {
            id: 'sim-f2l-left',
            title: 'Basic Left Insertion',
            explanation: 'When corner and edge are paired in the top layer, insert them smoothly into the Front-Left slot.',
            algorithm: "U' L' U L",
            condition: 'Pair ready in U layer; slot in Front-Left.'
          }
        ]
      },
      {
        id: 'simplified-2look-oll',
        title: '2-Look OLL (3 EO + 7 CO)',
        description: 'Orient the last layer in 2 rapid steps: First orient edges (EO), then orient corners (CO).',
        lessons: [
          { id: 'oll-eo-dot', title: 'EO: Dot Case', explanation: 'No edges oriented. Execute Line alg, then L-shape alg.', algorithm: "F R U R' U' F' U2 F U R U' R' F'", group: 'EO' },
          { id: 'oll-eo-l', title: 'EO: L-Shape', explanation: 'Two adjacent top edges oriented. Hold in top-left and execute wide f.', algorithm: "f R U R' U' f'", group: 'EO' },
          { id: 'oll-eo-line', title: 'EO: Line Case', explanation: 'Two opposite top edges oriented. Hold horizontally and execute F R U R\' U\' F\'.', algorithm: "F R U R' U' F'", group: 'EO' },
          { id: 'oll-co-sune', title: 'CO: Sune (OLL 27)', explanation: '1 corner oriented; front-left sticker faces front.', algorithm: "R U R' U R U2 R'", group: 'CO' },
          { id: 'oll-co-antisune', title: 'CO: Anti-Sune (OLL 26)', explanation: '1 corner oriented; front-right sticker faces right.', algorithm: "R U2 R' U' R U' R'", group: 'CO' },
          { id: 'oll-co-h', title: 'CO: H / Double Headlights (OLL 21)', explanation: '0 corners oriented; two pairs of headlights facing front and back.', algorithm: "F R U R' U' R U R' U' R U R' F'", group: 'CO' },
          { id: 'oll-co-pi', title: 'CO: Pi / Wheel (OLL 22)', explanation: '0 corners oriented; headlights on left, two corners pointing outward on right.', algorithm: "R U2 R2 U' R2 U' R2 U2 R", group: 'CO' },
          { id: 'oll-co-u', title: 'CO: Headlights / U (OLL 23)', explanation: '2 corners oriented; remaining two headlights face front.', algorithm: "R2 D R' U2 R D' R' U2 R'", group: 'CO' },
          { id: 'oll-co-t', title: 'CO: Chameleon / T (OLL 24)', explanation: '2 corners oriented; remaining stickers face left and right.', algorithm: "r U R' U' r' F R F'", group: 'CO' },
          { id: 'oll-co-l', title: 'CO: Bowtie / L (OLL 25)', explanation: '2 diagonal corners oriented.', algorithm: "F' r U R' U' r' F R", group: 'CO' }
        ]
      },
      {
        id: 'simplified-2look-pll',
        title: '2-Look PLL (2 CP + 4 EP)',
        description: 'Permute the last layer in 2 rapid steps: First solve corners (CP), then cycle remaining edges (EP).',
        lessons: [
          { id: 'pll-cp-t', title: 'CP: T-Permutation (Headlights)', explanation: 'Hold matching corner headlights on Left and swap the right two corners.', algorithm: "R U R' U' R' F R2 U' R' U' R U R' F'", group: 'CP' },
          { id: 'pll-cp-y', title: 'CP: Y-Permutation (No Headlights)', explanation: 'No matching corners on any side. Swaps diagonal corners.', algorithm: "F R U' R' U' R U R' F' R U R' U' R' F R F'", group: 'CP' },
          { id: 'pll-ep-ua', title: 'EP: Ua Perm (Clockwise 3-Edge)', explanation: 'Hold solved edge bar in back; cycle remaining 3 edges clockwise.', algorithm: "R U' R U R U R U' R' U' R2", group: 'EP' },
          { id: 'pll-ep-ub', title: 'EP: Ub Perm (Counter-Clockwise 3-Edge)', explanation: 'Hold solved edge bar in back; cycle remaining 3 edges counter-clockwise.', algorithm: "R2 U R U R' U' R' U' R' U R'", group: 'EP' },
          { id: 'pll-ep-h', title: 'EP: H Perm (Opposite Edge Swap)', explanation: 'Swap opposite edges across center using clean M-slice triggers.', algorithm: "M2 U M2 U2 M2 U M2", group: 'EP' },
          { id: 'pll-ep-z', title: 'EP: Z Perm (Adjacent Edge Swap)', explanation: 'Swap adjacent pairs of edges.', algorithm: "M' U M2 U M2 U M' U2 M2", group: 'EP' }
        ]
      }
    ]
  },

  // =========================================================================
  // 3. FULL CFOP (FRIDRICH MASTERY)
  // =========================================================================
  {
    id: 'cfop',
    title: 'Full CFOP Mastery',
    badge: 'Advanced',
    description: 'The golden standard of speedcubing. Master 41 F2L setups, all 57 OLL cases, and all 21 PLL algorithms.',
    progress: 25,
    isAlgorithmic: true,
    modules: [
      {
        id: 'full-cfop-walkthrough',
        title: 'Full Example Solve Walkthrough',
        description: 'Elite sub-10 CFOP demonstration with advanced Cross planning, multi-slot F2L lookahead, 1-Look OLL, and 1-Look PLL.',
        lessons: [
          {
            id: 'cfop-walkthrough-1',
            title: 'Sub-10 Fridrich Full Example Solve',
            explanation: 'Watch an advanced speedsolve breakdown. We inspect a 5-move cross, flow directly into 4 rotationless F2L pairs with lookahead, hit 1-Look OLL (OLL 33 T1), and execute Jb Permutation in 0.8s!',
            algorithm: "D R' D' F2 U R U' R' U' L' U L U R U' R' U' F' U F R U R' U' R' F R F' R U R' F' R U R' U' R' F R2 U' R'",
            isExampleSolve: true,
            scramble: "D L F' U' D' F D F R' U2 F U2 B2 U L B' D' F' B R F2",
            phases: [
              {
                phase: "Phase 1: Inspection & Cross",
                explanation: "In inspection, we track all 4 cross edges. We see an efficient 4-move bottom cross (D R' D' F2) that preserves the Front-Right F2L pair on top.",
                moves: "D R' D' F2"
              },
              {
                phase: "Phase 2: F2L Pair 1 & Pair 2",
                explanation: "First pair is ready in top layer. We insert it into the Front-Left slot while tracking the back-right pair without rotating.",
                moves: "U R U' R' U' L' U L"
              },
              {
                phase: "Phase 3: F2L Pair 3 & Pair 4",
                explanation: "We finish the remaining two slots using clean fingertricks, guaranteeing seamless lookahead into last layer orientation.",
                moves: "U R U' R' U' F' U F"
              },
              {
                phase: "Phase 4: 1-Look OLL (OLL 33 - T1)",
                explanation: "We recognize OLL 33 instantly from the T-shape and headlights on right. We fire R U R' U' R' F R F' to solve the entire yellow face in one rapid burst!",
                moves: "R U R' U' R' F R F'"
              },
              {
                phase: "Phase 5: 1-Look PLL (Jb Permutation)",
                explanation: "We identify Jb Permutation immediately from the 1x2x3 solved block on left. We execute the high-speed Jb algorithm to lock in the solve!",
                moves: "R U R' F' R U R' U' R' F R2 U' R'"
              }
            ]
          }
        ]
      },
      {
        id: 'cfop-f2l-cases',
        title: 'F2L Core Setups (41 Cases)',
        description: 'Advanced pairing and insertion cases for seamless lookahead.',
        lessons: [
          { id: 'f2l-01', title: 'F2L 01: Easy Case Right', explanation: 'Basic 3-move insertion for separated pair.', algorithm: "U R U' R'" },
          { id: 'f2l-02', title: 'F2L 02: Easy Case Left', explanation: 'Basic 3-move insertion on left side.', algorithm: "U' L' U L" },
          { id: 'f2l-31', title: 'F2L 31: Corner in Slot', explanation: 'Corner stuck in slot with edge in top layer. Extract and pair.', algorithm: "R U' R' U R U' R'" },
          { id: 'f2l-36', title: 'F2L 36: Connected Pair Wrong', explanation: 'Corner and edge stuck together incorrectly.', algorithm: "R U' R' U R U2 R' U R U' R'" }
        ]
      },
      {
        id: 'cfop-oll-57',
        title: 'Full OLL (57 Algorithms)',
        description: 'All 57 single-algorithm cases to orient the last layer in one look.',
        lessons: [
          { id: 'oll-01', title: 'OLL 01: Runway (Dot)', explanation: 'No edges oriented.', algorithm: "R U2 R2 F R F' U2 R' F R F'", group: 'Dot' },
          { id: 'oll-02', title: 'OLL 02: Zamboni (Dot)', explanation: 'No edges oriented.', algorithm: "F R U R' U' F' f R U R' U' f'", group: 'Dot' },
          { id: 'oll-05', title: 'OLL 05: Right Square', explanation: 'Square block on top-right.', algorithm: "r' U2 R U R' U r", group: 'Square' },
          { id: 'oll-06', title: 'OLL 06: Left Square', explanation: 'Square block on top-left.', algorithm: "r U2 R' U' R U' r'", group: 'Square' },
          { id: 'oll-09', title: 'OLL 09: Kite (Fish)', explanation: 'Fish pattern with side stickers.', algorithm: "R U R' U' R' F R F'", group: 'Fish' },
          { id: 'oll-21', title: 'OLL 21: H / Double Headlights', explanation: 'Cross with 4 headlights.', algorithm: "F R U R' U' R U R' U' R U R' F'", group: 'Cross' },
          { id: 'oll-22', title: 'OLL 22: Pi / Wheel', explanation: 'Cross with 2 headlights left, 2 outward right.', algorithm: "R U2 R2 U' R2 U' R2 U2 R", group: 'Cross' },
          { id: 'oll-27', title: 'OLL 27: Sune', explanation: '1 corner oriented.', algorithm: "R U R' U R U2 R'", group: 'Cross' },
          { id: 'oll-33', title: 'OLL 33: T1', explanation: 'T-shape with headlights on right.', algorithm: "R U R' U' R' F R F'", group: 'T-Shape' },
          { id: 'oll-45', title: 'OLL 45: T2', explanation: 'T-shape with opposite corners.', algorithm: "F R U R' U' F'", group: 'T-Shape' }
        ]
      },
      {
        id: 'cfop-pll-21',
        title: 'Full PLL (21 Algorithms)',
        description: 'All 21 permutations to solve the cube in a single algorithm.',
        lessons: [
          { id: 'pll-t', title: 'T Permutation', explanation: 'Swaps 2 adjacent corners and 2 opposite edges.', algorithm: "R U R' U' R' F R2 U' R' U' R U R' F'", group: 'Adjacent Swap' },
          { id: 'pll-ja', title: 'Ja Permutation', explanation: 'Swaps front-right corner pair and edges.', algorithm: "x R2 F R F' R U2 r' U r U2", group: 'Adjacent Swap' },
          { id: 'pll-jb', title: 'Jb Permutation', explanation: 'High-speed 1x2x3 block swap.', algorithm: "R U R' F' R U R' U' R' F R2 U' R'", group: 'Adjacent Swap' },
          { id: 'pll-y', title: 'Y Permutation', explanation: 'Swaps diagonal corners and adjacent edges.', algorithm: "F R U' R' U' R U R' F' R U R' U' R' F R F'", group: 'Diagonal Swap' },
          { id: 'pll-e', title: 'E Permutation', explanation: 'Swaps corners diagonally with zero edge movement.', algorithm: "x' R U' R' D R U R' D' R U R' D R U' R' D'", group: 'Corner Swap' },
          { id: 'pll-f', title: 'F Permutation', explanation: 'Swaps 2 corners and 2 edges on front.', algorithm: "R' U' F' R U R' U' R' F R2 U' R' U' R U R' U R", group: 'Adjacent Swap' },
          { id: 'pll-h', title: 'H Permutation', explanation: 'Swaps opposite edge pairs.', algorithm: "M2 U M2 U2 M2 U M2", group: 'Edges Only' },
          { id: 'pll-ua', title: 'Ua Permutation', explanation: 'Clockwise 3-edge cycle.', algorithm: "R U' R U R U R U' R' U' R2", group: 'Edges Only' },
          { id: 'pll-ub', title: 'Ub Permutation', explanation: 'Counter-clockwise 3-edge cycle.', algorithm: "R2 U R U R' U' R' U' R' U R'", group: 'Edges Only' },
          { id: 'pll-z', title: 'Z Permutation', explanation: 'Adjacent edge pair swap.', algorithm: "M' U M2 U M2 U M' U2 M2", group: 'Edges Only' }
        ]
      }
    ]
  },

  // =========================================================================
  // 4. ROUX METHOD
  // =========================================================================
  {
    id: 'roux',
    title: 'Roux Method',
    badge: 'Pro',
    description: 'Blockbuilding, CMLL, and M-slice mastery for low move-counts and ergonomic rotationless solving.',
    progress: 10,
    isAlgorithmic: true,
    modules: [
      {
        id: 'roux-walkthrough',
        title: 'Full Example Solve Walkthrough',
        description: 'Complete Roux speedsolve: First Block, Second Block, CMLL, and Last Six Edges (LSE).',
        lessons: [
          {
            id: 'roux-walkthrough-1',
            title: 'Complete Roux Method Example Solve',
            explanation: 'Experience the flow of Roux solving: Build a 1x2x3 on the left, build a 1x2x3 on the right using M and R moves, solve top corners with CMLL, and finish the last 6 edges using pure M/U slice flow!',
            algorithm: "L U L' U L U2 L' R U' R' U' R U2 R' r U R' U' r' F R F' M' U M' M2 U2 M2 M2 U2 M2 U2",
            isExampleSolve: true,
            scramble: "D L F' U' D' F D F R' U2 F U2 B2 U L B' D' F' B R F2",
            phases: [
              {
                phase: "Phase 1: First Block (FB)",
                explanation: "We build a 1x2x3 block on the left side (Blue/White) completely intuitively, using only 6 to 8 moves without worrying about the rest of the cube.",
                moves: "L U L' U L U2 L'"
              },
              {
                phase: "Phase 2: Second Block (SB)",
                explanation: "Now we build the matching 1x2x3 block on the right side using only R, r, and M moves, keeping the left block intact.",
                moves: "R U' R' U' R U2 R'"
              },
              {
                phase: "Phase 3: CMLL (Corners of Last Layer)",
                explanation: "We orient and permute all 4 top corners in a single algorithm without disrupting the two side blocks below!",
                moves: "r U R' U' r' F R F'"
              },
              {
                phase: "Phase 4a: LSE - Edge Orientation (EO)",
                explanation: "We orient all 6 remaining edges using simple M' U M' triggers so all yellow/white stickers face up or down.",
                moves: "M' U M'"
              },
              {
                phase: "Phase 4b: LSE - UL & UR Placement",
                explanation: "We place the Upper-Left and Upper-Right edges into their proper slots on the side layers.",
                moves: "M2 U2 M2"
              },
              {
                phase: "Phase 4c: LSE - Edge Permutation (EP)",
                explanation: "We finish the solve by permuting the remaining 4 M-slice edges into their centers!",
                moves: "M2 U2 M2 U2"
              }
            ]
          }
        ]
      },
      {
        id: 'roux-cmll-sets',
        title: 'CMLL Corner Sets (42 Cases)',
        description: 'Orient and permute top corners simultaneously across 8 core sets (O, U, T, L, S, AS, Pi, H).',
        lessons: [
          { id: 'cmll-o-adj', title: 'CMLL O: Adjacent Swap', explanation: 'Oriented corners with adjacent corner swap.', algorithm: "R U R' F' R U R' U' R' F R2 U' R'", group: 'O Set' },
          { id: 'cmll-u-fwd', title: 'CMLL U: Forward Bar', explanation: 'Headlights with forward bar.', algorithm: "R2 D' R U2 R' D R U2 R", group: 'U Set' },
          { id: 'cmll-t-left', title: 'CMLL T: Left Bar', explanation: 'Chameleon case with left bar.', algorithm: "r U R' U' r' F R F'", group: 'T Set' },
          { id: 'cmll-l-mirror', title: 'CMLL L: Mirror Bowtie', explanation: 'Bowtie pattern with mirror stickers.', algorithm: "F' r U R' U' r' F R", group: 'L Set' },
          { id: 'cmll-s-sune', title: 'CMLL S: Pure Sune', explanation: 'Sune corner orientation with solved corners.', algorithm: "R U R' U R U2 R'", group: 'S Set' },
          { id: 'cmll-as-anti', title: 'CMLL AS: Pure Anti-Sune', explanation: 'Anti-Sune corner orientation.', algorithm: "R U2 R' U' R U' R'", group: 'AS Set' },
          { id: 'cmll-pi-wheel', title: 'CMLL Pi: Pure Wheel', explanation: 'Pi pattern with triple trigger.', algorithm: "F R U R' U' R U R' U' R U R' F'", group: 'Pi Set' },
          { id: 'cmll-h-col', title: 'CMLL H: Column', explanation: 'Double headlights with matching columns.', algorithm: "F R U R' U' R U R' U' R U R' F'", group: 'H Set' }
        ]
      },
      {
        id: 'roux-lse',
        title: 'LSE (Last Six Edges Mastery)',
        description: 'Master the 3 substeps of LSE using pure M and U layer fingertricks.',
        lessons: [
          { id: 'roux-lse-eo', title: '4a. Edge Orientation (EO)', explanation: 'Orient all 6 edges so white/yellow points up or down.', algorithm: "M' U M'" },
          { id: 'roux-lse-ulur', title: '4b. UL & UR Edges', explanation: 'Insert Upper-Left and Upper-Right edges.', algorithm: "M2 U2 M2" },
          { id: 'roux-lse-ep', title: '4c. Edge Permutation (EP)', explanation: 'Permute the remaining 4 M-slice edges to solve.', algorithm: "M2 U2 M2 U2" }
        ]
      }
    ]
  },

  // =========================================================================
  // 5. ZZ METHOD
  // =========================================================================
  {
    id: 'zz',
    title: 'ZZ Method',
    badge: 'Expert',
    description: 'Completely rotationless solving via Edge Orientation Line (EOLine), high-speed ZZF2L blockbuilding, and COLL/EPLL.',
    progress: 5,
    isAlgorithmic: true,
    modules: [
      {
        id: 'zz-walkthrough',
        title: 'Full Example Solve Walkthrough',
        description: 'Complete ZZ speedsolve: EOLine, ZZF2L blockbuilding, COLL, and EPLL.',
        lessons: [
          {
            id: 'zz-walkthrough-1',
            title: 'Complete ZZ Method Example Solve',
            explanation: 'Witness the power of zero cube rotations! We orient all 12 edges and place the bottom line in EOLine, build left and right F2L blocks with only <R, U, L>, and finish with COLL and EPLL!',
            algorithm: "F B D R2 L2 D' L U L' R U R' R U R' U R U2 R' M2 U M2 U2 M2 U M2",
            isExampleSolve: true,
            scramble: "D L F' U' D' F D F R' U2 F U2 B2 U L B' D' F' B R F2",
            phases: [
              {
                phase: "Phase 1: EOLine (Edge Orientation + Line)",
                explanation: "During inspection we identify all bad edges, flip them using F/B moves, and place the DF/DB line edges. From this moment on, NO rotations and NO F/B/D moves are needed!",
                moves: "F B D R2 L2 D'"
              },
              {
                phase: "Phase 2: ZZF2L (Left & Right Blocks)",
                explanation: "Because all edges are already oriented, every F2L pair can be solved using pure <R, U, L> moves. We build the left 1x2x3 block then the right 1x2x3 block with zero cube pauses!",
                moves: "L U L' R U R'"
              },
              {
                phase: "Phase 3: COLL (Corners of Last Layer)",
                explanation: "Because EOLine pre-oriented all last layer edges into a permanent yellow cross, we can solve corner orientation and permutation simultaneously with COLL!",
                moves: "R U R' U R U2 R'"
              },
              {
                phase: "Phase 4: EPLL (Edge Permutation)",
                explanation: "All corners are solved and edges are oriented; we simply cycle the remaining edges with a rapid EPLL algorithm to solve the cube!",
                moves: "M2 U M2 U2 M2 U M2"
              }
            ]
          }
        ]
      },
      {
        id: 'zz-eoline-module',
        title: 'EOLine Setup & ZZF2L',
        description: 'Inspection planning, edge flipping, and rotation-free block building.',
        lessons: [
          { id: 'zz-eo-setup', title: 'EO + Line Setup', explanation: 'Identify bad edges during inspection, orient them with F/B moves, and align the DF/DB line.', algorithm: "F B D R2 L2 D'" },
          { id: 'zz-f2l-left', title: 'ZZF2L: Left Block Slotting', explanation: 'Solve left slots rotation-free using only L and U moves.', algorithm: "L U L'" },
          { id: 'zz-f2l-right', title: 'ZZF2L: Right Block Slotting', explanation: 'Solve right slots rotation-free using only R and U moves.', algorithm: "R U R'" }
        ]
      },
      {
        id: 'zz-coll-sets',
        title: 'COLL Last Layer (7 Sets)',
        description: 'Solve corner orientation and permutation in 1 step because edges are pre-oriented.',
        lessons: [
          { id: 'coll-sune-1', title: 'COLL Sune (Anti-Pure)', explanation: 'Sune corner case with diagonal corner swap.', algorithm: "R U R' U R U2 R'", group: 'Sune Set' },
          { id: 'coll-antisune-1', title: 'COLL Anti-Sune (Pure)', explanation: 'Anti-Sune corner orientation.', algorithm: "R U2 R' U' R U' R'", group: 'Anti-Sune Set' },
          { id: 'coll-h-1', title: 'COLL H (Columns)', explanation: 'H corner orientation with matching columns.', algorithm: "R U2 R' U' R U R' U' R U' R'", group: 'H Set' },
          { id: 'coll-pi-1', title: 'COLL Pi (Pure)', explanation: 'Pi wheel corner orientation.', algorithm: "F R U R' U' R U R' U' F'", group: 'Pi Set' },
          { id: 'coll-u-1', title: 'COLL U (Forward Bar)', explanation: 'Headlights with forward bar.', algorithm: "R2 D' R U2 R' D R U2 R", group: 'U Set' },
          { id: 'coll-t-1', title: 'COLL T (Rows)', explanation: 'Chameleon case with matching rows.', algorithm: "r U R' U' r' F R F'", group: 'T Set' },
          { id: 'coll-l-1', title: 'COLL L (Pure)', explanation: 'Bowtie corner orientation.', algorithm: "F' r U R' U' r' F R", group: 'L Set' }
        ]
      },
      {
        id: 'zz-epll',
        title: 'EPLL (Edge Permutation)',
        description: 'Finish the solve by cycling the remaining top edges.',
        lessons: [
          { id: 'zz-epll-ua', title: 'Ua Permutation', explanation: 'Clockwise 3-edge cycle.', algorithm: "R U' R U R U R U' R' U' R2" },
          { id: 'zz-epll-ub', title: 'Ub Permutation', explanation: 'Counter-clockwise 3-edge cycle.', algorithm: "R2 U R U R' U' R' U' R' U R'" },
          { id: 'zz-epll-h', title: 'H Permutation', explanation: 'Opposite edge swap.', algorithm: "M2 U M2 U2 M2 U M2" },
          { id: 'zz-epll-z', title: 'Z Permutation', explanation: 'Adjacent edge swap.', algorithm: "M' U M2 U M2 U M' U2 M2" }
        ]
      }
    ]
  }
];