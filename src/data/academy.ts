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
  isCompleted?: boolean;
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
  // =========================================================================
  // 1. BEGINNER METHOD
  // =========================================================================
  {
    id: 'beginner',
    title: 'Beginner Method',
    badge: 'Fundamentals',
    description: 'The classic layer-by-layer intuitive methodology. Master the foundational logic of the Rubik\'s Cube step by step.',
    progress: 0,
    modules: [
      {
        id: 'beginner-walkthrough',
        title: '🎬 Full Example Solve Walkthrough',
        description: 'Watch a complete beginner solve from scramble to solved state, layer by layer with conversational YouTuber-style explanations.',
        lessons: [
          {
            id: 'beg-walkthrough-full',
            title: 'Complete Beginner Example Solve',
            explanation: 'Walk through every phase of a complete solve using the Daisy and 7-step Layer-by-Layer system.',
            algorithm: "R U' F' U R2 U F2 U' R2 U2 L2 B2 U R U R' U' U' L' U' L U R U' R' U R U' R' U' F' U F U2 U' L' U L U F U' F' F R U R' U' F' R U R' U R U2 R' U R U' L' U R' U' L R' D' R D R' D' R D U R' D' R D R' D' R D U'",
            scramble: "D L F' U' D' F D F R' U2 F U2 B2 U L B' D' F' B R F2",
            phases: [
              {
                phase: 'Step 1: The Daisy Setup',
                explanation: 'Hey cubers! First step is the Daisy. We inspect the scramble and find all 4 white edges. We easily bring each white edge up to the yellow center sticker regardless of side colors. Notice how setting up the daisy gives us total control without disturbing anything on the bottom!',
                moves: "R U' F' U R2"
              },
              {
                phase: 'Step 2: Dropping the White Cross',
                explanation: 'Now we match the outer color of each daisy edge with its matching side center (e.g. green to green, red to red) and do a 180° turn (F2, R2, etc.) to drop the edge down to the white center on the bottom. Boom—our perfect White Cross is locked!',
                moves: "U F2 U' R2 U2 L2 B2"
              },
              {
                phase: 'Step 3: First Layer Corners',
                explanation: 'Next, we look for white corner pieces in the top layer. We position each corner directly between its matching center colors and execute the Right-Hand Trigger (R U R\' U\') or Left-Hand Trigger until the corner drops cleanly into the white layer.',
                moves: "U R U R' U' U' L' U' L U R U' R'"
              },
              {
                phase: 'Step 4: Second Layer (Middle Edges)',
                explanation: 'Now we look for edges in the top layer that DO NOT have yellow. We line up the front sticker with its matching center, push it away from the target slot, and execute the edge insertion algorithm to place it smoothly into the middle layer!',
                moves: "U R U' R' U' F' U F U2 U' L' U L U F U' F'"
              },
              {
                phase: 'Step 5: Yellow Cross (Fur-U-Ruf)',
                explanation: 'We now look at the yellow top face. We have an L-shape or bar. Applying our famous FUR-U-RUF algorithm (F R U R\' U\' F\') creates a complete yellow cross without messing up the first two layers!',
                moves: "F R U R' U' F'"
              },
              {
                phase: 'Step 6: Permute Yellow Edges (Sune)',
                explanation: 'Now we align the yellow edges with their side centers. By holding matching edges at the back and right, we apply Sune (R U R\' U R U2 R\') to cycle the remaining edges so all four cross edges match the side centers.',
                moves: "R U R' U R U2 R'"
              },
              {
                phase: 'Step 7: Position Yellow Corners (Niklas)',
                explanation: 'We look for any corner that is in the correct physical position (even if twisted). Holding that corner in the Front-Right-Top spot, we apply the Niklas algorithm (U R U\' L\' U R\' U\' L) to cycle the remaining 3 corners into place!',
                moves: "U R U' L' U R' U' L"
              },
              {
                phase: 'Step 8: Orient Yellow Corners',
                explanation: 'Final stretch! Hold the unsolved corner in the bottom-right spot and repeat the reverse trigger R\' D\' R D until yellow faces UP. Crucial tip: ONLY rotate the U layer to bring the next unsolved corner into place before repeating!',
                moves: "R' D' R D R' D' R D U R' D' R D R' D' R D U'"
              }
            ]
          }
        ]
      },
      {
        id: 'beginner-step-1',
        title: 'Step 1: White Cross (Daisy Method)',
        description: 'Form a white cross on the bottom layer while aligning the adjacent edge colors with their matching center pieces.',
        lessons: [
          {
            id: 'cross_intuitive',
            title: 'Intuitive Edge Alignment',
            explanation: 'Position white edge pieces around yellow center (Daisy) and rotate 180° to white face once side colors match.',
            algorithm: 'F2'
          }
        ]
      },
      {
        id: 'beginner-step-2',
        title: 'Step 2: First Layer Corners',
        description: 'Position white corner pieces between their matching color centers in the top layer and insert them into the bottom layer.',
        lessons: [
          {
            id: 'corner_right_trigger',
            title: 'Sexy Move / Corner Insertion',
            explanation: 'Target corner piece is directly above its slot in the top right. Apply the 4-move right hand trigger.',
            algorithm: "R U R' U'"
          }
        ]
      },
      {
        id: 'beginner-step-3',
        title: 'Step 3: Second Layer (Middle Layer Edges)',
        description: 'Insert edge pieces without yellow into the middle layer slots.',
        lessons: [
          {
            id: 'edge_insert_right',
            title: 'Right Edge Insertion',
            explanation: 'The top-front edge piece needs to move into the Front-Right slot.',
            algorithm: "U R U' R' U' F' U F"
          },
          {
            id: 'edge_insert_left',
            title: 'Left Edge Insertion',
            explanation: 'The top-front edge piece needs to move into the Front-Left slot.',
            algorithm: "U' L' U L U F U' F'"
          }
        ]
      },
      {
        id: 'beginner-step-4',
        title: 'Step 4: Yellow Cross (OLL Step 1)',
        description: 'Form a yellow cross on the top layer without disturbing the bottom two layers.',
        lessons: [
          {
            id: 'yellow_cross_dot_l_line',
            title: 'FURU\'F\' (Fur-U-Ruf)',
            explanation: 'Apply once for horizontal line case, twice for "L" shape, or three times for a center dot.',
            algorithm: "F R U R' U' F'"
          }
        ]
      },
      {
        id: 'beginner-step-5',
        title: 'Step 5: Permute Yellow Edges',
        description: 'Align the top edge piece colors with their corresponding side center colors.',
        lessons: [
          {
            id: 'swap_adjacent_edges',
            title: 'Sune Edge Permutation',
            explanation: 'Swaps the front and left yellow edges so all top edges match side center colors.',
            algorithm: "R U R' U R U2 R'"
          }
        ]
      },
      {
        id: 'beginner-step-6',
        title: 'Step 6: Position Yellow Corners (Niklas)',
        description: 'Move all yellow corner pieces to their correct physical positions (regardless of rotation).',
        lessons: [
          {
            id: 'cycle_three_corners',
            title: 'Niklas / Corner Swap',
            explanation: 'Hold the correctly placed corner on the Front-Right-Top and cycle the remaining 3 corners.',
            algorithm: "U R U' L' U R' U' L"
          }
        ]
      },
      {
        id: 'beginner-step-7',
        title: 'Step 7: Orient Yellow Corners',
        description: 'Rotate the last layer corners until the yellow faces are facing upwards.',
        lessons: [
          {
            id: 'orient_corner',
            title: 'Reverse Sexy Move',
            explanation: 'Hold unoriented corner in Front-Right-Top spot and repeat until yellow faces UP, then turn top layer (U) to load next unsolved corner.',
            algorithm: "R' D' R D"
          }
        ]
      }
    ]
  },

  // =========================================================================
  // 2. SIMPLIFIED CFOP
  // =========================================================================
  {
    id: 'simplified-cfop',
    title: 'Simplified CFOP',
    badge: 'Intermediate',
    description: 'The bridge to speedcubing. Uses 4-Look Last Layer (4LLL) to simplify OLL and PLL while introducing intuitive F2L.',
    progress: 0,
    modules: [
      {
        id: 'simplified-cfop-walkthrough',
        title: '🎬 Full Example Solve Walkthrough',
        description: 'Follow an interactive Simplified CFOP solve: Cross -> Intuitive F2L -> 2-Look OLL -> 2-Look PLL.',
        lessons: [
          {
            id: 'sim-cfop-walkthrough-full',
            title: 'Complete Simplified CFOP Example Solve',
            explanation: 'See how intuitive F2L pairs and 4-Look Last Layer connect together into a smooth, fast solve.',
            algorithm: "D R' F R D2 U R U' R' U2 L' U L U R U2 R' U R U' R' U' F' U F F R U R' U' F' U R U R' U R U2 R' R U R' U' R' F R2 U' R' U' R U R' F' U M2 U M2 U2 M2 U M2",
            scramble: "R2 U B2 D2 F2 L2 U' R2 D' F2 U' L B' R2 F D' B' R' B2 R'",
            phases: [
              {
                phase: 'Phase 1: Bottom Cross',
                explanation: 'We inspect the scramble and plan our 4 white cross edges directly on the bottom layer with D R\' F R D2. Starting with the cross on the bottom saves valuable rotation time!',
                moves: "D R' F R D2"
              },
              {
                phase: 'Phase 2: F2L Pairs 1 & 2',
                explanation: 'Instead of doing corners and edges separately, we pair the corner and edge together on the top layer and insert them as a single block into their slot.',
                moves: "U R U' R' U2 L' U L"
              },
              {
                phase: 'Phase 3: F2L Pairs 3 & 4',
                explanation: 'We spot our remaining pairs, setting up the right-back and left-front slots with zero awkward regrips, completing the entire First Two Layers in record time.',
                moves: "U R U2 R' U R U' R' U' F' U F"
              },
              {
                phase: 'Phase 4: 2-Look OLL (EO + CO)',
                explanation: 'Step 1: Orient edges with Fur-U-Ruf (F R U R\' U\' F\') to form the yellow cross. Step 2: Orient corners using standard Sune (R U R\' U R U2 R\') to turn the entire top face yellow!',
                moves: "F R U R' U' F' U R U R' U R U2 R'"
              },
              {
                phase: 'Phase 5: 2-Look PLL (Corner Swap + Edge Cycle)',
                explanation: 'Step 1: Recognize headlights on the left and execute T-Perm to solve all 4 corners. Step 2: Finish the solve with an instant H-Perm (M2 U M2 U2 M2 U M2) to swap the opposite edges!',
                moves: "R U R' U' R' F R2 U' R' U' R U R' F' U M2 U M2 U2 M2 U M2"
              }
            ]
          }
        ]
      },
      {
        id: 'simplified-f2l',
        title: 'Phase 1 & 2: Intuitive Cross & F2L',
        description: 'Pair up corner and edge pieces in the top layer and insert them simultaneously into the slot.',
        lessons: [
          {
            id: 'f2l_basic_insert_right',
            title: 'Basic Right Insertion',
            explanation: 'Corner and edge are already paired in top layer; target slot is Front-Right.',
            algorithm: "U R U' R'"
          },
          {
            id: 'f2l_basic_insert_left',
            title: 'Basic Left Insertion',
            explanation: 'Corner and edge are already paired in top layer; target slot is Front-Left.',
            algorithm: "U' L' U L"
          }
        ]
      },
      {
        id: 'two-look-oll',
        title: 'Phase 3: 2-Look OLL (EO & CO)',
        description: 'Orient the last layer in two rapid sub-steps: Edge Orientation (EO) then Corner Orientation (CO).',
        lessons: [
          {
            id: 'oll_eo_dot',
            title: 'Dot Case (EO)',
            explanation: 'No top edges oriented. Execute Line alg, then L-shape alg.',
            algorithm: "F R U R' U' F' U2 F U R U' R' F'"
          },
          {
            id: 'oll_eo_l_shape',
            title: 'L-Shape (EO)',
            explanation: 'Two adjacent top edges oriented forming an L.',
            algorithm: "f R U R' U' f'"
          },
          {
            id: 'oll_eo_line',
            title: 'Bar / Line Case (EO)',
            explanation: 'Two opposite top edges oriented forming a line.',
            algorithm: "F R U R' U' F'"
          },
          {
            id: 'oll_27_sune',
            title: 'Sune (CO)',
            explanation: '1 corner oriented; top-left front corner sticker faces front.',
            algorithm: "R U R' U R U2 R'"
          },
          {
            id: 'oll_26_antisune',
            title: 'Anti-Sune (CO)',
            explanation: '1 corner oriented; top-right front corner sticker faces right.',
            algorithm: "R U2 R' U' R U' R'"
          },
          {
            id: 'oll_21_cross_h',
            title: 'H / Double Headlight (CO)',
            explanation: '0 corners oriented; two pairs of headlights facing front and back.',
            algorithm: "F R U R' U' R U R' U' R U R' F'"
          },
          {
            id: 'oll_22_cross_pi',
            title: 'Pi / Wheel (CO)',
            explanation: '0 corners oriented; one pair of headlights on left, two corners pointing away on right.',
            algorithm: "R U2 R2 U' R2 U' R2 U2 R"
          },
          {
            id: 'oll_23_headlights',
            title: 'Headlights (CO)',
            explanation: '2 corners oriented; remaining two stickers face front.',
            algorithm: "R2 D R' U2 R D' R' U2 R'"
          },
          {
            id: 'oll_24_chameleon',
            title: 'Chameleon (CO)',
            explanation: '2 corners oriented; remaining stickers face left and right.',
            algorithm: "r U R' U' r' F R F'"
          },
          {
            id: 'oll_25_bowtie',
            title: 'Bowtie (CO)',
            explanation: '2 diagonal corners oriented.',
            algorithm: "F' r U R' U' r' F R"
          }
        ]
      },
      {
        id: 'two-look-pll',
        title: 'Phase 4: 2-Look PLL (CP & EP)',
        description: 'Permute corners (CP) then permute edges (EP) to complete the cube.',
        lessons: [
          {
            id: 'pll_t_perm',
            title: 'T Permutation (CP)',
            explanation: 'One side has two matching corners (headlights). Put headlights on Left.',
            algorithm: "R U R' U' R' F R2 U' R' U' R U R' F'"
          },
          {
            id: 'pll_y_perm',
            title: 'Y Permutation (CP)',
            explanation: 'No sides have matching corners. Swaps diagonal corners.',
            algorithm: "F R U' R' U' R U R' F' R U R' U' R' F R F'"
          },
          {
            id: 'pll_ua_perm',
            title: 'Ua Perm (EP)',
            explanation: '1 solved edge bar; remaining 3 edges cycle clockwise.',
            algorithm: "R U' R U R U R U' R' U' R2"
          },
          {
            id: 'pll_ub_perm',
            title: 'Ub Perm (EP)',
            explanation: '1 solved edge bar; remaining 3 edges cycle counter-clockwise.',
            algorithm: "R2 U R U R' U' R' U' R' U R'"
          },
          {
            id: 'pll_h_perm',
            title: 'H Perm (EP)',
            explanation: 'No solved bars; opposite edges swap across center.',
            algorithm: "M2 U M2 U2 M2 U M2"
          },
          {
            id: 'pll_z_perm',
            title: 'Z Perm (EP)',
            explanation: 'No solved bars; adjacent edges swap.',
            algorithm: "M' U M2 U M2 U M' U2 M2"
          }
        ]
      }
    ]
  },

  // =========================================================================
  // 3. FULL CFOP MASTERY
  // =========================================================================
  {
    id: 'cfop',
    title: 'Full CFOP (Fridrich)',
    badge: 'Advanced',
    description: 'The gold standard of world-class speedcubing. Cross, 41 F2L setups, all 57 OLL cases, and all 21 PLL cases.',
    progress: 0,
    modules: [
      {
        id: 'cfop-walkthrough',
        title: '🎬 Full Example Solve Walkthrough',
        description: 'Experience an elite sub-10 CFOP solve breakdown with planned cross, rotationless multislotting, 1-Look OLL, and 1-Look PLL.',
        lessons: [
          {
            id: 'cfop-walkthrough-full',
            title: 'Elite CFOP Example Solve',
            explanation: 'Study full cross planning, rotationless F2L pairing, 1-Look OLL 01, and 1-Look Jb-Permutation.',
            algorithm: "R' F D R' D2 F2 U' R U R' U2 L' U' L U R U' R' U2 R' U' R U R' U' R U' L U L' R U2 R2 F R F' U2 R' F R F' R U R' F' R U R' U' R' F R2 U' R' U'",
            scramble: "F2 R2 U B2 D' F2 U L2 U2 B2 U2 L' F' D R2 F2 U' L' D2 B'",
            phases: [
              {
                phase: 'Phase 1: Full Cross Planning',
                explanation: 'During inspection, we plan all 4 cross edges to land simultaneously on the D face (R\' F D R\' D2 F2), while also tracking our first F2L pair!',
                moves: "R' F D R' D2 F2"
              },
              {
                phase: 'Phase 2: F2L Pairs 1 & 2 (Keyhole & Free Pair)',
                explanation: 'First pair tracked during inspection drops immediately into the back-left slot (U\' R U R\'), followed by an instant rotationless insertion for the front-right slot.',
                moves: "U' R U R' U2 L' U' L U R U' R'"
              },
              {
                phase: 'Phase 3: F2L Pairs 3 & 4 (Rotationless Multislotting)',
                explanation: 'We separate and solve our final two pairs with crisp finger tricks and zero cube rotations, keeping our lookahead fluid.',
                moves: "U2 R' U' R U R' U' R U' L U L'"
              },
              {
                phase: 'Phase 4: 1-Look OLL (Runway Dot)',
                explanation: 'We instantly recognize OLL Case 01 (Dot Runway) and solve all top yellow orientations in a single fluid 11-move algorithm.',
                moves: "R U2 R2 F R F' U2 R' F R F'"
              },
              {
                phase: 'Phase 5: 1-Look PLL (Jb Permutation)',
                explanation: 'Spotting the headlights on the left side, we execute a blazing-fast Jb-Perm with AUF to finish the solve in style!',
                moves: "R U R' F' R U R' U' R' F R2 U' R' U'"
              }
            ]
          }
        ]
      },
      {
        id: 'cfop-f2l',
        title: 'Phase 1 & 2: First Two Layers (F2L)',
        description: 'Advanced pairing and insertion cases.',
        lessons: [
          { id: 'f2l_01', title: 'Easy Case Right', explanation: 'Direct corner and edge insertion into right slot.', algorithm: "U R U' R'" },
          { id: 'f2l_31', title: 'Corner in slot, Edge in U layer', explanation: 'Extract corner while pairing edge on top.', algorithm: "R U' R' U R U' R'" }
        ]
      },
      {
        id: 'cfop-oll',
        title: 'Phase 3: Full OLL (All 57 Cases)',
        description: 'Orient the entire last layer in a single step.',
        lessons: [
          { id: 'oll_01', title: 'OLL 01 - Runway (Dot)', explanation: 'Dot case with two opposite bars.', algorithm: "R U2 R2 F R F' U2 R' F R F'" },
          { id: 'oll_02', title: 'OLL 02 - Zamboni (Dot)', explanation: 'Dot case with four oriented corners.', algorithm: "F R U R' U' F' f R U R' U' f'" },
          { id: 'oll_03', title: 'OLL 03 - Anti-Backslash', explanation: 'Dot case with two diagonal stickers.', algorithm: "f R U R' U' f' U' F R U R' U' F'" },
          { id: 'oll_04', title: 'OLL 04 - Backslash', explanation: 'Dot case with backslash diagonal.', algorithm: "f R U R' U' f' U F R U R' U' F'" },
          { id: 'oll_05', title: 'OLL 05 - Right Square', explanation: 'Square block on right.', algorithm: "r' U2 R U R' U r" },
          { id: 'oll_06', title: 'OLL 06 - Left Square', explanation: 'Square block on left.', algorithm: "r U2 R' U' R U' r'" },
          { id: 'oll_07', title: 'OLL 07 - Small Lightning', explanation: 'Small lightning right.', algorithm: "r U R' U R U2 r'" },
          { id: 'oll_08', title: 'OLL 08 - Small Lightning (L)', explanation: 'Small lightning left.', algorithm: "l' U' L U' L' U2 l" },
          { id: 'oll_09', title: 'OLL 09 - Kite', explanation: 'Fish kite case.', algorithm: "R U R' U' R' F R F'" },
          { id: 'oll_10', title: 'OLL 10 - Street Fighter', explanation: 'Fish kite variant.', algorithm: "R U R' U R' F R F' R U2 R'" },
          { id: 'oll_11', title: 'OLL 11 - Downstairs', explanation: 'Thunderbolt shape.', algorithm: "r U R' U R U' R' U' r'" },
          { id: 'oll_12', title: 'OLL 12 - Upstairs', explanation: 'Thunderbolt shape opposite.', algorithm: "F R U R' U' F' U F R U R' U' F'" },
          { id: 'oll_13', title: 'OLL 13 - Knight Move', explanation: 'Knight move pattern.', algorithm: "F U R U' R2 F' R U R U' R'" },
          { id: 'oll_14', title: 'OLL 14 - Knight Move (R)', explanation: 'Knight move right.', algorithm: "R U R' U R U' R' U' R' F R F'" },
          { id: 'oll_15', title: 'OLL 15 - Knight Move (L)', explanation: 'Knight move left.', algorithm: "l' U' l L' U' L U l' U l" },
          { id: 'oll_16', title: 'OLL 16 - Knight Move (Double)', explanation: 'Double knight move.', algorithm: "r U r' R U R' U' r U' r'" },
          { id: 'oll_17', title: 'OLL 17 - Slash (Dot)', explanation: 'Diagonal dot slash.', algorithm: "F R U R' U' R A R' U' F'" },
          { id: 'oll_18', title: 'OLL 18 - Crown (Dot)', explanation: 'Crown pattern.', algorithm: "r U R' U R U2 r2 U' R U' R' U2 r" },
          { id: 'oll_19', title: 'OLL 19 - Mummy (Dot)', explanation: 'Mummy pattern.', algorithm: "r' R2 U R' U r U2 r' U M'" },
          { id: 'oll_20', title: 'OLL 20 - Checkered (Dot)', explanation: 'Checkered dot case.', algorithm: "M U R U R' U' M2 U R U' r'" },
          { id: 'oll_21', title: 'OLL 21 - Cross H', explanation: 'Double headlights on cross.', algorithm: "F R U R' U' R U R' U' R U R' F'" },
          { id: 'oll_22', title: 'OLL 22 - Cross Pi', explanation: 'Wheel / Pi case on cross.', algorithm: "R U2 R2 U' R2 U' R2 U2 R" },
          { id: 'oll_23', title: 'OLL 23 - Headlights', explanation: 'Headlights case on cross.', algorithm: "R2 D R' U2 R D' R' U2 R'" },
          { id: 'oll_24', title: 'OLL 24 - Chameleon', explanation: 'Chameleon case on cross.', algorithm: "r U R' U' r' F R F'" },
          { id: 'oll_25', title: 'OLL 25 - Bowtie', explanation: 'Bowtie diagonal on cross.', algorithm: "F' r U R' U' r' F R" },
          { id: 'oll_26', title: 'OLL 26 - Anti-Sune', explanation: 'Anti-Sune on cross.', algorithm: "R U2 R' U' R U' R'" },
          { id: 'oll_27', title: 'OLL 27 - Sune', explanation: 'Sune on cross.', algorithm: "R U R' U R U2 R'" },
          { id: 'oll_28', title: 'OLL 28 - Stealth', explanation: 'All corners oriented.', algorithm: "r U R' U' M U R U' R'" },
          { id: 'oll_29', title: 'OLL 29 - Awkward Shape', explanation: 'Awkward shape 1.', algorithm: "M U R U R' U' R' F R F' M'" },
          { id: 'oll_30', title: 'OLL 30 - Awkward Shape 2', explanation: 'Awkward shape 2.', algorithm: "F R U R' U2 F' R U R' U' F'" },
          { id: 'oll_31', title: 'OLL 31 - Couch (P-Shape)', explanation: 'P-shape couch.', algorithm: "R' U' F U R U' R' F' R" },
          { id: 'oll_32', title: 'OLL 32 - Anti-Couch', explanation: 'P-shape anti-couch.', algorithm: "L U F' U' L' U L F L'" },
          { id: 'oll_33', title: 'OLL 33 - T-Shape 1', explanation: 'T-shape standard.', algorithm: "R U R' U' R' F R F'" },
          { id: 'oll_34', title: 'OLL 34 - T-Shape 2', explanation: 'T-shape variant.', algorithm: "R U R2 U' R' F R U R U' F'" },
          { id: 'oll_35', title: 'OLL 35 - Fish 1', explanation: 'Fish case.', algorithm: "R U2 R2 F R F' R U2 R'" },
          { id: 'oll_36', title: 'OLL 36 - Mounted Fish', explanation: 'Mounted fish case.', algorithm: "L' U' L U' L' U L U L F' L' F" },
          { id: 'oll_37', title: 'OLL 37 - Fish 2', explanation: 'Fish case variant.', algorithm: "F R' F' R U R U' R'" },
          { id: 'oll_38', title: 'OLL 38 - Fish 3', explanation: 'Fish case variant.', algorithm: "R U B' U' R' U R B R'" },
          { id: 'oll_39', title: 'OLL 39 - Big Lightning', explanation: 'Big lightning bolt.', algorithm: "L F' L' U' L U F U' L'" },
          { id: 'oll_40', title: 'OLL 40 - Big Lightning (R)', explanation: 'Big lightning bolt right.', algorithm: "R' F R U R' U' F' U R" },
          { id: 'oll_41', title: 'OLL 41 - Awkward Shape 3', explanation: 'Awkward shape 3.', algorithm: "R U R' U R U2 R' F R U R' U' F'" },
          { id: 'oll_42', title: 'OLL 42 - Awkward Shape 4', explanation: 'Awkward shape 4.', algorithm: "R' U' R U' R' U2 R F R U R' U' F'" },
          { id: 'oll_43', title: 'OLL 43 - P-Shape Left', explanation: 'P-shape left.', algorithm: "f' L' U' L U f" },
          { id: 'oll_44', title: 'OLL 44 - P-Shape Right', explanation: 'P-shape right.', algorithm: "f R U R' U' f'" },
          { id: 'oll_45', title: 'OLL 45 - T-Shape Clean', explanation: 'T-shape clean.', algorithm: "F R U R' U' F'" },
          { id: 'oll_46', title: 'OLL 46 - C-Shape', explanation: 'C-shape pattern.', algorithm: "R' U' R' F R F' U R" },
          { id: 'oll_47', title: 'OLL 47 - Small L 1', explanation: 'Small L shape.', algorithm: "F' L' U' L U L' U' L U F" },
          { id: 'oll_48', title: 'OLL 48 - Small L 2', explanation: 'Small L shape variant.', algorithm: "F R U R' U' R U R' U' F'" },
          { id: 'oll_49', title: 'OLL 49 - Small L 3', explanation: 'Small L shape variant.', algorithm: "r U' r2 U r2 U r2 U' r" },
          { id: 'oll_50', title: 'OLL 50 - Small L 4', explanation: 'Small L shape variant.', algorithm: "r' U r2 U' r2 U' r2 U r'" },
          { id: 'oll_51', title: 'OLL 51 - I-Shape (Line)', explanation: 'I-shape line.', algorithm: "f R U R' U' R U R' U' f'" },
          { id: 'oll_52', title: 'OLL 52 - I-Shape Variant', explanation: 'I-shape variant.', algorithm: "R U R' U R U' B U' B' R'" },
          { id: 'oll_53', title: 'OLL 53 - I-Shape 3', explanation: 'I-shape variant 3.', algorithm: "r' U' r R' U' R U r' U r" },
          { id: 'oll_54', title: 'OLL 54 - I-Shape 4', explanation: 'I-shape variant 4.', algorithm: "r U r' R U R' U' r U' r'" },
          { id: 'oll_55', title: 'OLL 55 - Highway', explanation: 'Highway I-shape.', algorithm: "R' F R U R U' R2 F' R2 U' R' U R U R'" },
          { id: 'oll_56', title: 'OLL 56 - Streetlight', explanation: 'Streetlight I-shape.', algorithm: "r U R' U R U2 r' r' U' R U' R' U2 r" },
          { id: 'oll_57', title: 'OLL 57 - H-Shape (Corners)', explanation: 'H-shape corners.', algorithm: "R U R' U' M' U R U' r'" }
        ]
      },
      {
        id: 'cfop-pll',
        title: 'Phase 4: Full PLL (All 21 Cases)',
        description: 'Permute the entire last layer in one step.',
        lessons: [
          { id: 'pll_aa', title: 'Aa Perm', explanation: 'Corner swap adjacent.', algorithm: "x R' D2 R U R' D2 R U' R'" },
          { id: 'pll_ab', title: 'Ab Perm', explanation: 'Corner swap adjacent.', algorithm: "x R U' R D2 R' U R D2 R2" },
          { id: 'pll_e', title: 'E Perm', explanation: 'Corner swap diagonal.', algorithm: "x' R U' R' D R U R' D' R U R' D R U' R' D'" },
          { id: 'pll_f', title: 'F Perm', explanation: 'Adjacent corner and edge swap.', algorithm: "R' U' F' R U R' U' R' F R2 U' R' U' R U R' U R" },
          { id: 'pll_ga', title: 'Ga Perm', explanation: 'G Permutation variant A.', algorithm: "R2 U R' U R' U' R U' R2 U' D R' U R D'" },
          { id: 'pll_gb', title: 'Gb Perm', explanation: 'G Permutation variant B.', algorithm: "R' U' R U D' R2 U R' U R U' R U' R2 D" },
          { id: 'pll_gc', title: 'Gc Perm', explanation: 'G Permutation variant C.', algorithm: "R2 U' R U' R U R' U R2 U D' R U' R' D" },
          { id: 'pll_gd', title: 'Gd Perm', explanation: 'G Permutation variant D.', algorithm: "R U R' U' D R2 U' R U' R' U R' U R2 D'" },
          { id: 'pll_h', title: 'H Perm', explanation: 'Opposite edges swap.', algorithm: "M2 U M2 U2 M2 U M2" },
          { id: 'pll_ja', title: 'Ja Perm', explanation: 'Adjacent swap with bar on left.', algorithm: "x R2 F R F' R U2 r' U r U2" },
          { id: 'pll_jb', title: 'Jb Perm', explanation: 'Adjacent swap with bar on right.', algorithm: "R U R' F' R U R' U' R' F R2 U' R'" },
          { id: 'pll_na', title: 'Na Perm', explanation: 'Diagonal corner and edge swap.', algorithm: "R U R' U R U R' F' R U R' U' R' F R2 U' R' U2 R U' R'" },
          { id: 'pll_nb', title: 'Nb Perm', explanation: 'Diagonal swap variant B.', algorithm: "R' U R U' R' F' U' F R U R' F R' F' R U' R" },
          { id: 'pll_ra', title: 'Ra Perm', explanation: 'Adjacent swap with front headlights.', algorithm: "R U R' F' R U2 R' U2 R' F R U R U2 R'" },
          { id: 'pll_rb', title: 'Rb Perm', explanation: 'Adjacent swap with left headlights.', algorithm: "R' U2 R U2 R' F R U R' U' R' F' R2" },
          { id: 'pll_t', title: 'T Perm', explanation: 'Classic T-Permutation.', algorithm: "R U R' U' R' F R2 U' R' U' R U R' F'" },
          { id: 'pll_ua', title: 'Ua Perm', explanation: '3-edge clockwise cycle.', algorithm: "R U' R U R U R U' R' U' R2" },
          { id: 'pll_ub', title: 'Ub Perm', explanation: '3-edge counter-clockwise cycle.', algorithm: "R2 U R U R' U' R' U' R' U R'" },
          { id: 'pll_v', title: 'V Perm', explanation: 'Diagonal corner swap with block.', algorithm: "R' U R' U' R D' R' D R' U D' R2 U' R2 D R2" },
          { id: 'pll_y', title: 'Y Perm', explanation: 'Diagonal corner swap.', algorithm: "F R U' R' U' R U R' F' R U R' U' R' F R F'" },
          { id: 'pll_z', title: 'Z Perm', explanation: 'Adjacent edges swap.', algorithm: "M' U M2 U M2 U M' U2 M2" }
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
    badge: 'Block Building',
    description: 'High efficiency, low move count: First Block (FB) -> Second Block (SB) -> CMLL (42 cases) -> Last Six Edges (LSE).',
    progress: 0,
    modules: [
      {
        id: 'roux-walkthrough',
        title: '🎬 Full Example Solve Walkthrough',
        description: 'Discover the power of M-slice efficiency with an interactive Roux solve walkthrough.',
        lessons: [
          {
            id: 'roux-walkthrough-full',
            title: 'Complete Roux Example Solve',
            explanation: 'Walk through 1x2x3 block building, CMLL Sune, and 3-step LSE completion.',
            algorithm: "U' F R' D' F2 L U' L' M' U' R U R' U' M2 U R U' R' R U R' U R U2 R' M' U M' U2 M' U M' U2 M2 U2 M2",
            scramble: "B2 L2 U2 R2 D B2 D' L2 B2 D2 F2 R' B' D' F2 L' U F' L2 D'",
            phases: [
              {
                phase: 'Phase 1: First Block (FB - Left 1x2x3)',
                explanation: 'We build a 1x2x3 block on the left side of the cube intuitively with minimal moves (U\' F R\' D\' F2 L U\' L\'), setting our anchor without caring about the middle slice!',
                moves: "U' F R' D' F2 L U' L'"
              },
              {
                phase: 'Phase 2: Second Block (SB - Right 1x2x3)',
                explanation: 'Using only <R, r, M, U> moves, we assemble and insert the second 1x2x3 block on the right side without disturbing our left block.',
                moves: "M' U' R U R' U' M2 U R U' R'"
              },
              {
                phase: 'Phase 3: CMLL (Corners of Last Layer)',
                explanation: 'With both 1x2x3 blocks complete, we solve corner orientation and permutation simultaneously using a single CMLL algorithm.',
                moves: "R U R' U R U2 R'"
              },
              {
                phase: 'Phase 4: LSE (Last Six Edges: 4a EO -> 4b UL/UR -> 4c EP)',
                explanation: 'We complete the solve in 3 quick M/U bursts: Step 4a (Orient all 6 edges), Step 4b (Place UL & UR), and Step 4c (Permute the M-slice)!',
                moves: "M' U M' U2 M' U M' U2 M2 U2 M2"
              }
            ]
          }
        ]
      },
      {
        id: 'roux-blocks',
        title: 'Phase 1 & 2: First & Second Block',
        description: 'Intuitive 1x2x3 block building on left and right sides.',
        lessons: [
          { id: 'roux_fb_concept', title: 'First Block (FB) Concept', explanation: 'Build 1x2x3 block on left side.', algorithm: "U' F R' D' F2" },
          { id: 'roux_sb_concept', title: 'Second Block (SB) Concept', explanation: 'Build 1x2x3 block on right side using <R, r, M, U>.', algorithm: "M' U' R U R'" }
        ]
      },
      {
        id: 'roux-cmll',
        title: 'Phase 3: CMLL (All 42 Cases across 8 Sets)',
        description: 'Solve corner orientation and permutation simultaneously.',
        lessons: [
          { id: 'cmll_o_adjacent', title: 'CMLL O - Adjacent Swap', explanation: 'Oriented corners, adjacent swap.', algorithm: "R U R' F' R U R' U' R' F R2 U' R'" },
          { id: 'cmll_o_diagonal', title: 'CMLL O - Diagonal Swap', explanation: 'Oriented corners, diagonal swap.', algorithm: "r U R' U' r' F R F'" },
          { id: 'cmll_u_forward', title: 'CMLL U - Forward Bar', explanation: 'U headlights with forward bar.', algorithm: "R2 D' R U2 R' D R U2 R" },
          { id: 'cmll_u_back', title: 'CMLL U - Back Bar', explanation: 'U headlights with back bar.', algorithm: "R2 D R' U2 R D' R' U2 R'" },
          { id: 'cmll_u_slash', title: 'CMLL U - Slash', explanation: 'U headlights with slash.', algorithm: "F R U R' U' R U R' U' F'" },
          { id: 'cmll_u_x', title: 'CMLL U - X', explanation: 'U headlights with X.', algorithm: "r U R' U' r' F R F'" },
          { id: 'cmll_u_rows', title: 'CMLL U - Rows', explanation: 'U headlights with rows.', algorithm: "R' U' R U' R' U2 R" },
          { id: 'cmll_u_columns', title: 'CMLL U - Columns', explanation: 'U headlights with columns.', algorithm: "R U R' U R U2 R'" },
          { id: 'cmll_t_left_bar', title: 'CMLL T - Left Bar', explanation: 'T chameleon left bar.', algorithm: "r U R' U' r' F R F'" },
          { id: 'cmll_t_right_bar', title: 'CMLL T - Right Bar', explanation: 'T chameleon right bar.', algorithm: "R' U' R U R' F' R U R' U' R' F R" },
          { id: 'cmll_t_row', title: 'CMLL T - Row', explanation: 'T chameleon row.', algorithm: "F R U R' U' F'" },
          { id: 'cmll_t_dots', title: 'CMLL T - Dots', explanation: 'T chameleon dots.', algorithm: "r' U' R U r U' R'" },
          { id: 'cmll_t_anti_slash', title: 'CMLL T - Anti-Slash', explanation: 'T chameleon anti-slash.', algorithm: "R U2 R' U' R U' R2 Y L' U' L U F" },
          { id: 'cmll_t_slash', title: 'CMLL T - Slash', explanation: 'T chameleon slash.', algorithm: "r U' r2 U r2 U r'" },
          { id: 'cmll_l_mirror', title: 'CMLL L - Mirror', explanation: 'L bowtie mirror.', algorithm: "F' r U R' U' r' F R" },
          { id: 'cmll_l_pure', title: 'CMLL L - Pure', explanation: 'L bowtie pure.', algorithm: "R U2 R' U' R U R' U' R U' R'" },
          { id: 'cmll_l_front_target', title: 'CMLL L - Front Target', explanation: 'L bowtie front target.', algorithm: "r' U2 R U R' U r" },
          { id: 'cmll_l_back_target', title: 'CMLL L - Back Target', explanation: 'L bowtie back target.', algorithm: "r U2 R' U' R U' r'" },
          { id: 'cmll_l_diagonals', title: 'CMLL L - Diagonals', explanation: 'L bowtie diagonals.', algorithm: "R' U2 R U R' U R" },
          { id: 'cmll_l_columns', title: 'CMLL L - Columns', explanation: 'L bowtie columns.', algorithm: "R U R' U R U2 R'" },
          { id: 'cmll_s_left_bar', title: 'CMLL S - Left Bar', explanation: 'Sune left bar.', algorithm: "R U R' U R U2 R'" },
          { id: 'cmll_s_x_check', title: 'CMLL S - X Check', explanation: 'Sune X check.', algorithm: "R U R' U' R' F R F'" },
          { id: 'cmll_s_forward_slash', title: 'CMLL S - Forward Slash', explanation: 'Sune forward slash.', algorithm: "F R U R' U' F' R U R' U R U2 R'" },
          { id: 'cmll_s_back_slash', title: 'CMLL S - Back Slash', explanation: 'Sune back slash.', algorithm: "R U R' U R' F R F' R U2 R'" },
          { id: 'cmll_s_columns', title: 'CMLL S - Columns', explanation: 'Sune columns.', algorithm: "r U R' U' r' F R F'" },
          { id: 'cmll_s_rows', title: 'CMLL S - Rows', explanation: 'Sune rows.', algorithm: "R' U' R U' R' U2 R" },
          { id: 'cmll_as_right_bar', title: 'CMLL AS - Right Bar', explanation: 'Anti-Sune right bar.', algorithm: "R U2 R' U' R U' R'" },
          { id: 'cmll_as_x_check', title: 'CMLL AS - X Check', explanation: 'Anti-Sune X check.', algorithm: "R' U' R U' R' U2 R" },
          { id: 'cmll_as_back_slash', title: 'CMLL AS - Back Slash', explanation: 'Anti-Sune back slash.', algorithm: "F R U R' U' F'" },
          { id: 'cmll_as_forward_slash', title: 'CMLL AS - Forward Slash', explanation: 'Anti-Sune forward slash.', algorithm: "r U R' U' r' F R F'" },
          { id: 'cmll_as_columns', title: 'CMLL AS - Columns', explanation: 'Anti-Sune columns.', algorithm: "R U R' U R U2 R'" },
          { id: 'cmll_as_rows', title: 'CMLL AS - Rows', explanation: 'Anti-Sune rows.', algorithm: "R2 D' R U2 R' D R U2 R" },
          { id: 'cmll_pi_right_bar', title: 'CMLL Pi - Right Bar', explanation: 'Pi wheel right bar.', algorithm: "R U2 R2 U' R2 U' R2 U2 R" },
          { id: 'cmll_pi_back_slash', title: 'CMLL Pi - Back Slash', explanation: 'Pi wheel back slash.', algorithm: "F R U R' U' R U R' U' F'" },
          { id: 'cmll_pi_x', title: 'CMLL Pi - X', explanation: 'Pi wheel X.', algorithm: "r U R' U' r' F R F'" },
          { id: 'cmll_pi_columns', title: 'CMLL Pi - Columns', explanation: 'Pi wheel columns.', algorithm: "R U R' U R U2 R'" },
          { id: 'cmll_pi_slash', title: 'CMLL Pi - Slash', explanation: 'Pi wheel slash.', algorithm: "R' U' R U' R' U2 R" },
          { id: 'cmll_pi_pure', title: 'CMLL Pi - Pure', explanation: 'Pi wheel pure.', algorithm: "F R U R' U' R U R' U' R U R' U' F'" },
          { id: 'cmll_h_column', title: 'CMLL H - Column', explanation: 'H double headlights column.', algorithm: "F R U R' U' R U R' U' R U R' F'" },
          { id: 'cmll_h_row', title: 'CMLL H - Row', explanation: 'H double headlights row.', algorithm: "R U R' U R U' R' U R U2 R'" },
          { id: 'cmll_h_slash', title: 'CMLL H - Slash', explanation: 'H double headlights slash.', algorithm: "r U R' U' r' F R F'" },
          { id: 'cmll_h_pure', title: 'CMLL H - Pure', explanation: 'H double headlights pure.', algorithm: "R U2 R' U' R U R' U' R U' R'" }
        ]
      },
      {
        id: 'roux-lse',
        title: 'Phase 4: LSE (Last Six Edges)',
        description: 'Complete the solve using M and U moves.',
        lessons: [
          { id: 'lse_4a_eo', title: '4a. Edge Orientation (EO)', explanation: 'Orient all 6 remaining edges so white/yellow faces up or down.', algorithm: "M' U M'" },
          { id: 'lse_4b_ul_ur', title: '4b. UL & UR Placement', explanation: 'Place Upper-Left and Upper-Right edges into position.', algorithm: "M2 U2 M2" },
          { id: 'lse_4c_ep', title: '4c. Edge Permutation (EP)', explanation: 'Permute the remaining 4 M-slice edges.', algorithm: "M2 U2 M2 U2" }
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
    badge: 'Rotationless',
    description: 'Zero cube rotations throughout the solve: EOline -> Rotationless ZZF2L -> COLL (42 cases) -> EPLL (4 cases).',
    progress: 0,
    modules: [
      {
        id: 'zz-walkthrough',
        title: '🎬 Full Example Solve Walkthrough',
        description: 'Watch the rotationless mastery of ZZ from EOline inspection to rapid COLL/EPLL finish.',
        lessons: [
          {
            id: 'zz-walkthrough-full',
            title: 'Complete ZZ Example Solve',
            explanation: 'See how pre-orienting all edges in inspection eliminates rotations completely for F2L and Last Layer.',
            algorithm: "F' B D L' R D2 L U L' U2 L U L' R U R' U2 R U' R' R U R' U R U2 R' R U' R U R U R U' R' U' R2 U'",
            scramble: "D2 F2 R2 U2 L2 B2 U2 F2 D' B2 R F2 U' L' D2 B' D L F' U'",
            phases: [
              {
                phase: 'Phase 1: EOline (Edge Orientation + Line)',
                explanation: 'During inspection, we find all "bad" edges and flip them with F\' B moves while placing the DF and DB line edges (F\' B D L\' R D2). All 12 edges on the cube are now oriented!',
                moves: "F' B D L' R D2"
              },
              {
                phase: 'Phase 2: ZZF2L (Left Block & Right Block)',
                explanation: 'Because every edge is pre-oriented, we can solve both F2L blocks strictly using <R, U, L> moves without a single cube rotation!',
                moves: "L U L' U2 L U L' R U R' U2 R U' R'"
              },
              {
                phase: 'Phase 3: COLL (Corners of Last Layer)',
                explanation: 'Since our top edges already form a yellow cross, COLL solves corner orientation and permutation simultaneously.',
                moves: "R U R' U R U2 R'"
              },
              {
                phase: 'Phase 4: EPLL (Edge Permutation of Last Layer)',
                explanation: 'All corners are solved! We finish the cube with a crisp Ua-Permutation (R U\' R U R U R U\' R\' U\' R2 U\') to lock in the final edges.',
                moves: "R U' R U R U R U' R' U' R2 U'"
              }
            ]
          }
        ]
      },
      {
        id: 'zz-eoline',
        title: 'Phase 1: EOline',
        description: 'Orient all 12 edges and place DF/DB line edges.',
        lessons: [
          { id: 'eoline_intuitive', title: 'EO + Line Setup', explanation: 'Flip bad edges with F/B and place DF/DB edges.', algorithm: "F B D L R" }
        ]
      },
      {
        id: 'zz-f2l',
        title: 'Phase 2: ZZF2L (Rotationless Blocks)',
        description: 'Build left and right blocks using only <R, U, L> moves.',
        lessons: [
          { id: 'zzf2l_left_block', title: 'Left Block Insertion', explanation: 'Pair and insert corner-edge pairs into left slot.', algorithm: "L U L'" },
          { id: 'zzf2l_right_block', title: 'Right Block Insertion', explanation: 'Pair and insert corner-edge pairs into right slot.', algorithm: "R U R'" }
        ]
      },
      {
        id: 'zz-coll',
        title: 'Phase 3: COLL (Corners of Last Layer)',
        description: 'Solves corner orientation and permutation simultaneously without disturbing top edges.',
        lessons: [
          { id: 'coll_sune_1', title: 'COLL Sune - Anti-Pure', explanation: 'Sune anti-pure corner permutation.', algorithm: "R U R' U R U2 R'" },
          { id: 'coll_sune_2', title: 'COLL Sune - Diagonal', explanation: 'Sune diagonal swap.', algorithm: "F R U R' U' F' R U R' U R U2 R'" },
          { id: 'coll_antisune_1', title: 'COLL Anti-Sune - Pure', explanation: 'Anti-Sune pure corner permutation.', algorithm: "R U2 R' U' R U' R'" },
          { id: 'coll_h_1', title: 'COLL H - Columns', explanation: 'H double headlights columns.', algorithm: "R U2 R' U' R U R' U' R U' R'" },
          { id: 'coll_pi_1', title: 'COLL Pi - Pure', explanation: 'Pi wheel pure.', algorithm: "F R U R' U' R U R' U' F'" },
          { id: 'coll_u_1', title: 'COLL U - Forward Bar', explanation: 'U headlights forward bar.', algorithm: "R2 D' R U2 R' D R U2 R" },
          { id: 'coll_t_1', title: 'COLL T - Rows', explanation: 'T chameleon rows.', algorithm: "r U R' U' r' F R F'" },
          { id: 'coll_l_1', title: 'COLL L - Pure', explanation: 'L bowtie pure.', algorithm: "F' r U R' U' r' F R" }
        ]
      },
      {
        id: 'zz-epll',
        title: 'Phase 4: EPLL (Edge Permutation)',
        description: 'Permute the remaining 4 edges to complete the solve.',
        lessons: [
          { id: 'epll_ua', title: 'Ua Perm', explanation: '3-edge clockwise cycle.', algorithm: "R U' R U R U R U' R' U' R2" },
          { id: 'epll_ub', title: 'Ub Perm', explanation: '3-edge counter-clockwise cycle.', algorithm: "R2 U R U R' U' R' U' R' U R'" },
          { id: 'epll_h', title: 'H Perm', explanation: 'Opposite edges swap.', algorithm: "M2 U M2 U2 M2 U M2" },
          { id: 'epll_z', title: 'Z Perm', explanation: 'Adjacent edges swap.', algorithm: "M' U M2 U M2 U M' U2 M2" }
        ]
      }
    ]
  }
];