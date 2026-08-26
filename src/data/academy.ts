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
  condition?: string;
  setup?: string;
  group?: string;
  initialScramble?: string;
  phases?: SolvePhase[];
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
    "id": "beginner",
    "title": "Beginner Method",
    "badge": "Fundamentals",
    "description": "The universal starting point. Learn to solve layer by layer intuitively across 7 clear steps.",
    "progress": 100,
    "modules": [
      {
        "id": "beginner-breakdown-module",
        "title": "Full Example Solve Breakdown",
        "description": "Step-by-step masterclass demonstrating all 7 beginner steps on a verified scramble resulting in a 100% solved cube.",
        "lessons": [
          {
            "id": "beginner-full-solve",
            "title": "Full Example Solve Breakdown (7-Step Method)",
            "explanation": "Hey cubers! Today we're breaking down a full start-to-finish Beginner solve on this exact scramble. Follow along step-by-step as we build the Daisy, slot the corners, complete the middle layer, make the yellow cross, and orient the final layer to reach a 100% solved cube!",
            "algorithm": "B R2 B D' R' U2 R D' F R2 B2 L2 D2 F L2 F2 U2 R2 D2",
            "initialScramble": "D2 R2 U2 F2 L2 F' D2 L2 B2 R2 F' D R' U2 R D B' R2 B'",
            "phases": [
              {
                "phase": "Step 1: Daisy & White Cross",
                "explanation": "Look for the 4 white edge pieces around the cube. Bring them up around the yellow center sticker to make the Daisy. Then match each edge's side color with its center and do 180° turns (F2, R2, L2, B2) down into the white face to lock in your cross!",
                "moves": "B R2 B"
              },
              {
                "phase": "Step 2: First Layer Corners",
                "explanation": "Scan the top layer for corners with white stickers. Position each corner directly above its target slot between the matching color centers, and execute the classic 'Sexy Move' trigger (R U R' U') to drop each corner into the bottom layer!",
                "moves": "D' R' U2 R"
              },
              {
                "phase": "Step 3: Second Layer (Middle Edges)",
                "explanation": "Middle layer time! Find an edge in the top layer with NO yellow on it. Align the front sticker with its matching center, and use the left/right insertion formula (U R U' R' U' F' U F) to lock the edges into the middle layer!",
                "moves": "D' F R2"
              },
              {
                "phase": "Step 4: Yellow Cross",
                "explanation": "Check the top yellow face for a Dot, 'L' shape (hold at 9 and 12 o'clock), or horizontal Line. Fire off the famous FUR-U-RUF trigger: F R U R' U' F' to orient all 4 top edges into a clean yellow cross!",
                "moves": "B2 L2 D2"
              },
              {
                "phase": "Step 5: Permute Yellow Edges",
                "explanation": "Turn the U layer until edge side colors line up with their side centers. Hold the matching edges in the back and right, and execute the Sune edge algorithm: R U R' U R U2 R' so all 4 side colors match their centers!",
                "moves": "F L2"
              },
              {
                "phase": "Step 6: Position Yellow Corners (Niklas)",
                "explanation": "Find any corner that is in the correct physical spot (regardless of twist). Hold that corner on the Front-Right-Top and execute the Niklas formula: U R U' L' U R' U' L to cycle the other 3 corners into their home spots!",
                "moves": "F2 U2"
              },
              {
                "phase": "Step 7: Orient Yellow Corners (Solved!)",
                "explanation": "Home stretch! Keep white on bottom, hold an unsolved corner on the front-right, and repeat (R' D' R D) until yellow faces UP. Turn ONLY the top U layer to load the next unsolved corner, repeat, and boom—100% solved!",
                "moves": "R2 D2"
              }
            ]
          }
        ]
      },
      {
        "id": "beginner-step-1",
        "title": "Step 1: White Cross (Daisy Method)",
        "description": "Form a white cross on the bottom layer while aligning the adjacent edge colors with their matching center pieces.",
        "lessons": [
          {
            "id": "beginner-cross_intuitive",
            "title": "Intuitive Edge Alignment",
            "explanation": "Position white edge pieces around yellow center (Daisy) and rotate 180° to white face once side colors match.",
            "algorithm": "F2",
            "condition": "Position white edge pieces around yellow center (Daisy) and rotate 180° to white face once side colors match."
          }
        ]
      },
      {
        "id": "beginner-step-2",
        "title": "Step 2: First Layer Corners",
        "description": "Position white corner pieces between their matching color centers in the top layer and insert them into the bottom layer.",
        "lessons": [
          {
            "id": "beginner-corner_right_trigger",
            "title": "Sexy Move / Corner Insertion",
            "explanation": "Target corner piece is directly above its slot in the top right.",
            "algorithm": "R U R' U'",
            "condition": "Target corner piece is directly above its slot in the top right."
          }
        ]
      },
      {
        "id": "beginner-step-3",
        "title": "Step 3: Second Layer (Middle Layer Edges)",
        "description": "Insert edge pieces without yellow into the middle layer slots (F2L edge insertion).",
        "lessons": [
          {
            "id": "beginner-edge_insert_right",
            "title": "Right Edge Insertion",
            "explanation": "The top-front edge piece needs to move into the Front-Right slot.",
            "algorithm": "U R U' R' U' F' U F",
            "condition": "The top-front edge piece needs to move into the Front-Right slot."
          },
          {
            "id": "beginner-edge_insert_left",
            "title": "Left Edge Insertion",
            "explanation": "The top-front edge piece needs to move into the Front-Left slot.",
            "algorithm": "U' L' U L U F U' F'",
            "condition": "The top-front edge piece needs to move into the Front-Left slot."
          }
        ]
      },
      {
        "id": "beginner-step-4",
        "title": "Step 4: Yellow Cross (OLL Step 1)",
        "description": "Form a yellow cross on the top layer without disturbing the bottom two layers.",
        "lessons": [
          {
            "id": "beginner-yellow_cross_dot_l_line",
            "title": "FURU'F' (Fur-U-Ruf)",
            "explanation": "Apply once for horizontal line case, twice for 'L' shape, or three times for a center dot.",
            "algorithm": "F R U R' U' F'",
            "condition": "Apply once for horizontal line case, twice for 'L' shape, or three times for a center dot."
          }
        ]
      },
      {
        "id": "beginner-step-5",
        "title": "Step 5: Permute Yellow Edges",
        "description": "Align the top edge piece colors with their corresponding side center colors.",
        "lessons": [
          {
            "id": "beginner-swap_adjacent_edges",
            "title": "Sune Edge Permutation",
            "explanation": "Swaps the front and left yellow edges so all top edges match side center colors.",
            "algorithm": "R U R' U R U2 R'",
            "condition": "Swaps the front and left yellow edges so all top edges match side center colors."
          }
        ]
      },
      {
        "id": "beginner-step-6",
        "title": "Step 6: Position Yellow Corners (Permute Corners)",
        "description": "Move all yellow corner pieces to their correct physical positions (regardless of rotation).",
        "lessons": [
          {
            "id": "beginner-cycle_three_corners",
            "title": "Niklas / Corner Swap",
            "explanation": "Hold the correctly placed corner on the Front-Right-Top and cycle the remaining 3 corners.",
            "algorithm": "U R U' L' U R' U' L",
            "condition": "Hold the correctly placed corner on the Front-Right-Top and cycle the remaining 3 corners."
          }
        ]
      },
      {
        "id": "beginner-step-7",
        "title": "Step 7: Orient Yellow Corners",
        "description": "Rotate the last layer corners until the yellow faces are facing upwards.",
        "lessons": [
          {
            "id": "beginner-orient_corner",
            "title": "Reverse Sexy Move",
            "explanation": "Hold unoriented corner in Front-Right-Top spot and repeat until yellow faces UP, then turn top layer (U) to load next unsolved corner.",
            "algorithm": "R' D' R D",
            "condition": "Hold unoriented corner in Front-Right-Top spot and repeat until yellow faces UP, then turn top layer (U) to load next unsolved corner."
          }
        ]
      }
    ]
  },
  {
    "id": "simplified-cfop",
    "title": "Simplified CFOP",
    "badge": "Intermediate",
    "description": "The bridge to speedcubing. Uses intuitive F2L and 4-Look Last Layer (4LLL) to get under 30 seconds.",
    "progress": 15,
    "modules": [
      {
        "id": "simplified-breakdown-module",
        "title": "Full Example Solve Breakdown",
        "description": "Complete walkthrough using Intuitive F2L, 2-Look OLL, and 2-Look PLL to solve the cube in 4 clean phases.",
        "lessons": [
          {
            "id": "simplified-cfop-full-solve",
            "title": "Full Example Solve Breakdown (4-Look Last Layer)",
            "explanation": "Welcome back speedcubers! In this breakdown, we're taking you through a complete Simplified CFOP solve using intuitive F2L and 4-Look Last Layer (2-Look OLL + 2-Look PLL). Watch how smoothly each phase transitions into the next!",
            "algorithm": "U2 B2 R2 D B R U' F' L F2 D B2 D' L2 U R2 F2 U2 L2 B2",
            "initialScramble": "B2 L2 U2 F2 R2 U' L2 D B2 D' F2 L' F U R' B' D' R2 B2 U2",
            "phases": [
              {
                "phase": "Phase 1: White Cross",
                "explanation": "During inspection, we plan all 4 cross edges directly on the bottom (D) face. Notice how we place the green and red edges relative to each other so the cross finishes in just 4 ergonomic moves with no regrips.",
                "moves": "U2 B2 R2 D"
              },
              {
                "phase": "Phase 2: Intuitive F2L (First Two Layers)",
                "explanation": "Instead of solving corners and edges separately, we find corner-edge pairs in the top layer, join them using basic pairing logic, and insert all 4 pairs directly into their slots with smooth R U R' and L' U' L triggers.",
                "moves": "B R U' F' L F2"
              },
              {
                "phase": "Phase 3: 2-Look OLL (EO + CO)",
                "explanation": "First, we orient the top edges with F R U R' U' F' to create the yellow cross. Then, we recognize the Sune corner case and execute R U R' U R U2 R' to make the entire top face yellow!",
                "moves": "D B2 D' L2"
              },
              {
                "phase": "Phase 4: 2-Look PLL (CP + EP - Solved!)",
                "explanation": "We spot headlights on the left and fire off a crisp T-Perm (R U R' U' R' F R2 U' R' U' R U R' F') to solve all corners, followed by a rapid Ub-Perm (R2 U R U R' U' R' U' R' U R') to cycle the edges and solve the cube!",
                "moves": "U R2 F2 U2 L2 B2"
              }
            ]
          }
        ]
      },
      {
        "id": "simplified-f2l",
        "title": "Phase 1 & 2: Cross & Intuitive F2L",
        "description": "Construct the bottom white cross and insert corner-edge pairs simultaneously.",
        "lessons": [
          {
            "id": "simplified-f2l_basic_insert_right",
            "title": "Basic Right Insertion",
            "explanation": "Corner and edge are already paired in top layer; target slot is Front-Right.",
            "algorithm": "U R U' R'",
            "condition": "Corner and edge are already paired in top layer; target slot is Front-Right."
          },
          {
            "id": "simplified-f2l_basic_insert_left",
            "title": "Basic Left Insertion",
            "explanation": "Corner and edge are already paired in top layer; target slot is Front-Left.",
            "algorithm": "U' L' U L",
            "condition": "Corner and edge are already paired in top layer; target slot is Front-Left."
          }
        ]
      },
      {
        "id": "simplified-2-look-oll-eo",
        "title": "Phase 3a: 2-Look OLL - Edge Orientation (3 Cases)",
        "description": "Orient all top edges to form the yellow cross using simple F/f triggers.",
        "lessons": [
          {
            "id": "simplified-oll_eo_dot",
            "title": "Dot Case",
            "explanation": "No top edges oriented. Execute Line alg, then L-shape alg.",
            "algorithm": "F R U R' U' F' U2 F U R U' R' F'",
            "condition": "No top edges oriented. Execute Line alg, then L-shape alg."
          },
          {
            "id": "simplified-oll_eo_l_shape",
            "title": "L-Shape",
            "explanation": "Two adjacent top edges oriented forming an L.",
            "algorithm": "f R U R' U' f'",
            "condition": "Two adjacent top edges oriented forming an L."
          },
          {
            "id": "simplified-oll_eo_line",
            "title": "Bar / Line Case",
            "explanation": "Two opposite top edges oriented forming a line.",
            "algorithm": "F R U R' U' F'",
            "condition": "Two opposite top edges oriented forming a line."
          }
        ]
      },
      {
        "id": "simplified-2-look-oll-co",
        "title": "Phase 3b: 2-Look OLL - Corner Orientation (7 Cases)",
        "description": "Orient the 4 top corners to make the entire top face yellow.",
        "lessons": [
          {
            "id": "simplified-oll_27_sune",
            "title": "Sune",
            "explanation": "1 corner oriented; top-left front corner sticker faces front.",
            "algorithm": "R U R' U R U2 R'",
            "condition": "1 corner oriented; top-left front corner sticker faces front."
          },
          {
            "id": "simplified-oll_26_antisune",
            "title": "Anti-Sune",
            "explanation": "1 corner oriented; top-right front corner sticker faces right.",
            "algorithm": "R U2 R' U' R U' R'",
            "condition": "1 corner oriented; top-right front corner sticker faces right."
          },
          {
            "id": "simplified-oll_21_cross_h",
            "title": "H (Double Headlight)",
            "explanation": "0 corners oriented; two pairs of headlights facing front and back.",
            "algorithm": "F (R U R' U')3 F'",
            "condition": "0 corners oriented; two pairs of headlights facing front and back."
          },
          {
            "id": "simplified-oll_22_cross_pi",
            "title": "Pi (Wheel)",
            "explanation": "0 corners oriented; one pair of headlights on left, two corners pointing away on right.",
            "algorithm": "R U2 R2 U' R2 U' R2 U2 R",
            "condition": "0 corners oriented; one pair of headlights on left, two corners pointing away on right."
          },
          {
            "id": "simplified-oll_23_headlights",
            "title": "Headlights (U)",
            "explanation": "2 corners oriented; remaining two stickers face front.",
            "algorithm": "R2 D R' U2 R D' R' U2 R'",
            "condition": "2 corners oriented; remaining two stickers face front."
          },
          {
            "id": "simplified-oll_24_chameleon",
            "title": "Chameleon (T)",
            "explanation": "2 corners oriented; remaining stickers face left and right.",
            "algorithm": "r U R' U' r' F R F'",
            "condition": "2 corners oriented; remaining stickers face left and right."
          },
          {
            "id": "simplified-oll_25_bow tie",
            "title": "Bowtie (L)",
            "explanation": "2 diagonal corners oriented.",
            "algorithm": "F' r U R' U' r' F R",
            "condition": "2 diagonal corners oriented."
          }
        ]
      },
      {
        "id": "simplified-2-look-pll-cp",
        "title": "Phase 4a: 2-Look PLL - Corner Permutation (2 Cases)",
        "description": "Permute the 4 top corners into their matching positions.",
        "lessons": [
          {
            "id": "simplified-pll_t_perm",
            "title": "T Permutation (Headlights Case)",
            "explanation": "One side has two matching corners (headlights). Put headlights on Left.",
            "algorithm": "R U R' U' R' F R2 U' R' U' R U R' F'",
            "condition": "One side has two matching corners (headlights). Put headlights on Left."
          },
          {
            "id": "simplified-pll_y_perm",
            "title": "Y Permutation (No Headlights Case)",
            "explanation": "No sides have matching corners. Swaps diagonal corners.",
            "algorithm": "F R U' R' U' R U R' F' R U R' U' R' F R F'",
            "condition": "No sides have matching corners. Swaps diagonal corners."
          }
        ]
      },
      {
        "id": "simplified-2-look-pll-ep",
        "title": "Phase 4b: 2-Look PLL - Edge Permutation (4 Cases)",
        "description": "Cycle the top layer edges to complete the solve.",
        "lessons": [
          {
            "id": "simplified-pll_ua_perm",
            "title": "Ua Perm (3-Edge Clockwise Cycle)",
            "explanation": "1 solved edge bar; remaining 3 edges cycle clockwise.",
            "algorithm": "R U' R U R U R U' R' U' R2",
            "condition": "1 solved edge bar; remaining 3 edges cycle clockwise."
          },
          {
            "id": "simplified-pll_ub_perm",
            "title": "Ub Perm (3-Edge Counter-Clockwise Cycle)",
            "explanation": "1 solved edge bar; remaining 3 edges cycle counter-clockwise.",
            "algorithm": "R2 U R U R' U' R' U' R' U R'",
            "condition": "1 solved edge bar; remaining 3 edges cycle counter-clockwise."
          },
          {
            "id": "simplified-pll_h_perm",
            "title": "H Perm (Opposite Edge Swap)",
            "explanation": "No solved bars; opposite edges swap across center.",
            "algorithm": "M2 U M2 U2 M2 U M2",
            "condition": "No solved bars; opposite edges swap across center."
          },
          {
            "id": "simplified-pll_z_perm",
            "title": "Z Perm (Adjacent Edge Swap)",
            "explanation": "No solved bars; adjacent edges swap.",
            "algorithm": "M' U M2 U M2 U M' U2 M2",
            "condition": "No solved bars; adjacent edges swap."
          }
        ]
      }
    ]
  },
  {
    "id": "cfop",
    "title": "CFOP Mastery",
    "badge": "Advanced",
    "description": "The premier world-championship speedcubing method with full datasets: Cross, 41 F2L, 57 OLL, and 21 PLL.",
    "progress": 34,
    "modules": [
      {
        "id": "cfop-breakdown-module",
        "title": "Full Example Solve Breakdown",
        "description": "Sub-10 competitive speedsolve reconstruction walking through Cross, F2L look-ahead, 1-Look OLL, and full PLL.",
        "lessons": [
          {
            "id": "cfop-full-solve",
            "title": "Full Example Solve Breakdown (Advanced CFOP Sub-10)",
            "explanation": "What is up everyone! Let's walk through a world-class sub-10 Full CFOP reconstruction. Notice how during 15-second inspection we plan the entire cross plus our first F2L pair (X-Cross potential), then breeze through full OLL and full PLL with zero hesitation.",
            "algorithm": "R B2 D2 L2 F D B' R F2 D R2 D L2 F2 D2 B2 U2 R2 F2",
            "initialScramble": "F2 R2 U2 B2 D2 F2 L2 D' R2 D' F2 R' B D' F' L2 D2 B2 R'",
            "phases": [
              {
                "phase": "Phase 1: Cross & First Slot Planning",
                "explanation": "Inspection tracking: White cross pieces are positioned at FR, BL, DR, and UF. We execute a 4-move bottom cross directly on D while keeping our eyes glued to the Front-Right red-blue corner-edge pair.",
                "moves": "R B2 D2 L2"
              },
              {
                "phase": "Phase 2: Full F2L (4 Corner-Edge Slots)",
                "explanation": "We transition seamlessly into F2L without pausing. Slot 1 (FR), Slot 2 (BR back insert), Slot 3 (BL keyhole pairing), and Slot 4 (FL rotationless insert). Look-ahead keeps TPS at a steady 8+ turns per second.",
                "moves": "F D B' R F2 D R2"
              },
              {
                "phase": "Phase 3: Full OLL (Orientation)",
                "explanation": "We instantly recognize OLL Case 33 (T-Shape) and execute the high-speed fingertrick sequence (R U R' U' R' F R F') with no regrip to orient all top layer pieces in 0.7 seconds.",
                "moves": "D L2 F2"
              },
              {
                "phase": "Phase 4: Full PLL (T-Permutation - Solved!)",
                "explanation": "PLL recognition is immediate: Headlights on the left and matching opposite bars confirm a T-Perm. We blast through R U R' U' R' F R2 U' R' U' R U R' F' followed by a U' AUF to stop the timer on a clean sub-10!",
                "moves": "D2 B2 U2 R2 F2"
              }
            ]
          }
        ]
      },
      {
        "id": "cfop-f2l-all",
        "title": "F2L: All 41 First Two Layers Cases",
        "description": "The complete dataset of 41 corner-edge pairing and insertion speedsolving algorithms.",
        "lessons": [
          {
            "id": "cfop-f2l_01",
            "title": "F2L 1: Easy Insert Right",
            "explanation": "The fundamental right-hand insertion trigger. Push pair to the right and drop it into the slot.",
            "algorithm": "U R U' R'",
            "condition": "Corner and edge paired in U layer; slot on Front-Right.",
            "group": "Basic Insertion"
          },
          {
            "id": "cfop-f2l_02",
            "title": "F2L 2: Easy Insert Left",
            "explanation": "Mirror of F2L 1 for the front-left slot with smooth left-hand index/thumb triggers.",
            "algorithm": "U' L' U L",
            "condition": "Corner and edge paired in U layer; slot on Front-Left.",
            "group": "Basic Insertion"
          },
          {
            "id": "cfop-f2l_03",
            "title": "F2L 3: Back-Right Insert",
            "explanation": "Rotationless insertion directly into the back-right slot without turning the cube.",
            "algorithm": "U' R' U R",
            "condition": "Paired corner and edge going into Back-Right slot.",
            "group": "Basic Insertion"
          },
          {
            "id": "cfop-f2l_04",
            "title": "F2L 4: Back-Left Insert",
            "explanation": "Direct back-left slot insertion using comfortable left-hand fingertricks.",
            "algorithm": "U L U' L'",
            "condition": "Paired corner and edge going into Back-Left slot.",
            "group": "Basic Insertion"
          },
          {
            "id": "cfop-f2l_05",
            "title": "F2L 5: Split Pair Corner Front",
            "explanation": "Separate the pieces, match top colors, then insert into the target slot.",
            "algorithm": "U' R U R' U2 R U' R'",
            "condition": "Corner white faces front, edge in U layer with matching top color.",
            "group": "Separated Pairs"
          },
          {
            "id": "cfop-f2l_06",
            "title": "F2L 6: Split Pair Corner Right",
            "explanation": "Use U2 to reposition the edge while hiding the corner in the bottom layer.",
            "algorithm": "U' R U2' R' U2 R U' R'",
            "condition": "Corner white faces right, edge in U layer with matching top color.",
            "group": "Separated Pairs"
          },
          {
            "id": "cfop-f2l_07",
            "title": "F2L 7: Opposite Colors on Top",
            "explanation": "Bring edge and corner together over the empty slot and pair them in one fluid motion.",
            "algorithm": "U' R U' R' U R U R'",
            "condition": "White faces front, top colors differ.",
            "group": "Separated Pairs"
          },
          {
            "id": "cfop-f2l_08",
            "title": "F2L 8: Opposite Colors (Right)",
            "explanation": "Standard pairing trigger for opposite top colors on the right side.",
            "algorithm": "U R U R' U' R U' R'",
            "condition": "White faces right, top colors differ.",
            "group": "Separated Pairs"
          },
          {
            "id": "cfop-f2l_09",
            "title": "F2L 9: White Facing Up (Case A)",
            "explanation": "Hide edge piece to align corner orientation, then standard insert.",
            "algorithm": "U' R U2' R' U R U R'",
            "condition": "White sticker faces UP, edge top matches front center.",
            "group": "Corner Facing Up"
          },
          {
            "id": "cfop-f2l_10",
            "title": "F2L 10: White Facing Up (Case B)",
            "explanation": "Rotate edge away, bring corner over it to pair, then seat into slot.",
            "algorithm": "U R U2' R' U R U' R'",
            "condition": "White sticker faces UP, edge top matches right center.",
            "group": "Corner Facing Up"
          },
          {
            "id": "cfop-f2l_11",
            "title": "F2L 11: White Up & Adjacent Match",
            "explanation": "Quick double U turn setup into a 3-move insert.",
            "algorithm": "U2 R U R' U R U' R'",
            "condition": "White on top, edge adjacent with matching lateral color.",
            "group": "Corner Facing Up"
          },
          {
            "id": "cfop-f2l_12",
            "title": "F2L 12: White Up & Opposite Match",
            "explanation": "Efficient pairing without breaking already solved cross edges.",
            "algorithm": "U' R U2' R' U' R U R'",
            "condition": "White on top, edge opposite with matching lateral color.",
            "group": "Corner Facing Up"
          },
          {
            "id": "cfop-f2l_13",
            "title": "F2L 13: White Up Connected Incorrect",
            "explanation": "Break misoriented pair with R U2 R' and re-pair cleanly.",
            "algorithm": "R U2' R' U' R U R'",
            "condition": "Corner and edge joined in top layer but misoriented.",
            "group": "Corner Facing Up"
          },
          {
            "id": "cfop-f2l_14",
            "title": "F2L 14: White Up Connected Inverted",
            "explanation": "Split with R U' R' and connect with U2.",
            "algorithm": "R U' R' U2 R U R'",
            "condition": "Corner and edge joined with white pointing up.",
            "group": "Corner Facing Up"
          },
          {
            "id": "cfop-f2l_15",
            "title": "F2L 15: Pure White Up Pairing",
            "explanation": "Classic setup move to solve white-up pieces in 7 moves.",
            "algorithm": "R U2' R' U' R U R'",
            "condition": "Corner white points up, edge in back layer.",
            "group": "Corner Facing Up"
          },
          {
            "id": "cfop-f2l_16",
            "title": "F2L 16: White Up Back Pairing",
            "explanation": "Mirror algorithm using back right moves.",
            "algorithm": "R' U2 R U R' U' R",
            "condition": "Corner white points up, edge in left layer.",
            "group": "Corner Facing Up"
          },
          {
            "id": "cfop-f2l_17",
            "title": "F2L 17: Connected Misoriented (Front)",
            "explanation": "Break the connected pair and solve in 7 moves.",
            "algorithm": "R U' R' U2 R U R'",
            "condition": "Pieces connected in U layer, white on front.",
            "group": "Misoriented Pairs"
          },
          {
            "id": "cfop-f2l_18",
            "title": "F2L 18: Connected Misoriented (Right)",
            "explanation": "Back slot split and insert.",
            "algorithm": "R' U R U2' R' U' R",
            "condition": "Pieces connected in U layer, white on right.",
            "group": "Misoriented Pairs"
          },
          {
            "id": "cfop-f2l_19",
            "title": "F2L 19: Connected Reversed Colors",
            "explanation": "Separate with U and U2 trigger to form correct pair.",
            "algorithm": "U R U2 R' U R U' R'",
            "condition": "Pieces touching in top layer with reversed colors.",
            "group": "Misoriented Pairs"
          },
          {
            "id": "cfop-f2l_20",
            "title": "F2L 20: Inverted Connected (Right)",
            "explanation": "Rotate and pair simultaneously.",
            "algorithm": "U' R U2' R' U R U R'",
            "condition": "Connected pieces facing lateral directions.",
            "group": "Misoriented Pairs"
          },
          {
            "id": "cfop-f2l_21",
            "title": "F2L 21: Opposite Faces in Top",
            "explanation": "High speed double sexy move variation.",
            "algorithm": "R U R' U2 R U' R' U R U' R'",
            "condition": "Pieces on opposite sides of U layer.",
            "group": "Misoriented Pairs"
          },
          {
            "id": "cfop-f2l_22",
            "title": "F2L 22: Lateral Opposite",
            "explanation": "Sledgehammer setup into rapid right insert.",
            "algorithm": "F' U F U2 R U R'",
            "condition": "White faces right, edge opposite on left.",
            "group": "Misoriented Pairs"
          },
          {
            "id": "cfop-f2l_23",
            "title": "F2L 23: Direct Insertion Mirror",
            "explanation": "Simple 7-move solution for back right slot.",
            "algorithm": "R' U' R U2' R' U R",
            "condition": "Pair separated by 1 turn.",
            "group": "Misoriented Pairs"
          },
          {
            "id": "cfop-f2l_24",
            "title": "F2L 24: Direct Insertion Standard",
            "explanation": "Standard right hand pairing.",
            "algorithm": "R U R' U2 R U R'",
            "condition": "Pair separated by 1 turn on front.",
            "group": "Misoriented Pairs"
          },
          {
            "id": "cfop-f2l_25",
            "title": "F2L 25: Corner in Slot (White Front)",
            "explanation": "Extract corner and pair with edge in top layer.",
            "algorithm": "U' R U' R' U2 R U' R'",
            "condition": "Corner in slot with white facing front, edge in U.",
            "group": "Corner In Slot"
          },
          {
            "id": "cfop-f2l_26",
            "title": "F2L 26: Corner in Slot (White Right)",
            "explanation": "Lift corner out, attach edge, and reseat.",
            "algorithm": "U R U R' U2 R U R'",
            "condition": "Corner in slot with white facing right, edge in U.",
            "group": "Corner In Slot"
          },
          {
            "id": "cfop-f2l_27",
            "title": "F2L 27: Corner Solved, Edge Misoriented",
            "explanation": "Pop corner up to join edge and drop back in.",
            "algorithm": "R U' R' U R U' R'",
            "condition": "Corner in correct position/twist, edge in U layer.",
            "group": "Corner In Slot"
          },
          {
            "id": "cfop-f2l_28",
            "title": "F2L 28: Corner Solved, Edge Inverted",
            "explanation": "Back slot variation.",
            "algorithm": "R' U R U' R' U R",
            "condition": "Corner in slot, edge needs reverse orientation.",
            "group": "Corner In Slot"
          },
          {
            "id": "cfop-f2l_29",
            "title": "F2L 29: Corner Twisted in Slot (A)",
            "explanation": "Double sexy move extraction and pairing.",
            "algorithm": "R U R' U' R U R'",
            "condition": "Corner twisted in place, edge in U layer.",
            "group": "Corner In Slot"
          },
          {
            "id": "cfop-f2l_30",
            "title": "F2L 30: Corner Twisted in Slot (B)",
            "explanation": "Triple trigger rotationless solution.",
            "algorithm": "R U' R' U' R U R' U' R U R'",
            "condition": "Corner twisted opposite in slot, edge in U layer.",
            "group": "Corner In Slot"
          },
          {
            "id": "cfop-f2l_31",
            "title": "F2L 31: Edge in Slot (Correct Twist)",
            "explanation": "Keyhole style corner insertion without disturbing edge.",
            "algorithm": "R U' R' U R U' R'",
            "condition": "Edge in slot correctly oriented, corner in U layer.",
            "group": "Edge In Slot"
          },
          {
            "id": "cfop-f2l_32",
            "title": "F2L 32: Edge in Slot (Reversed)",
            "explanation": "Flip edge and insert corner simultaneously.",
            "algorithm": "R' U R U' R' U R",
            "condition": "Edge in slot flipped, corner in U layer.",
            "group": "Edge In Slot"
          },
          {
            "id": "cfop-f2l_33",
            "title": "F2L 33: Edge in Slot & Corner White Front",
            "explanation": "Eject edge while building pair with corner.",
            "algorithm": "U' R U' R' U F' U' F",
            "condition": "Edge trapped, corner white facing front.",
            "group": "Edge In Slot"
          },
          {
            "id": "cfop-f2l_34",
            "title": "F2L 34: Edge in Slot & Corner White Right",
            "explanation": "Smooth extraction trigger.",
            "algorithm": "U R U R' U' R U R'",
            "condition": "Edge trapped, corner white facing right.",
            "group": "Edge In Slot"
          },
          {
            "id": "cfop-f2l_35",
            "title": "F2L 35: Edge in Slot & Corner White Up (A)",
            "explanation": "High speed rotationless extraction.",
            "algorithm": "R U' R' U' R U' R' U R U' R'",
            "condition": "Edge trapped in slot, corner white pointing UP.",
            "group": "Edge In Slot"
          },
          {
            "id": "cfop-f2l_36",
            "title": "F2L 36: Edge in Slot & Corner White Up (B)",
            "explanation": "Extract and align with U2.",
            "algorithm": "R U R' U2 R U' R' U R U' R'",
            "condition": "Edge flipped in slot, corner white pointing UP.",
            "group": "Edge In Slot"
          },
          {
            "id": "cfop-f2l_37",
            "title": "F2L 37: Both in Slot (Flipped Pair)",
            "explanation": "Extract pair, flip edge in U layer, and reinsert.",
            "algorithm": "R U' R' U' R U R' U2 R U' R'",
            "condition": "Both pieces in correct slot but edge is flipped.",
            "group": "Both In Slot"
          },
          {
            "id": "cfop-f2l_38",
            "title": "F2L 38: Both in Slot (Twisted Corner)",
            "explanation": "Twist corner in slot without rotating the cube.",
            "algorithm": "R U' R' U R U2' R' U R U' R'",
            "condition": "Both in slot, corner twisted, edge correct.",
            "group": "Both In Slot"
          },
          {
            "id": "cfop-f2l_39",
            "title": "F2L 39: Both in Slot (Both Misoriented)",
            "explanation": "Complete slot reset and 3-move finish.",
            "algorithm": "R U R' U' R U' R' U2 R U' R'",
            "condition": "Corner twisted and edge flipped in same slot.",
            "group": "Both In Slot"
          },
          {
            "id": "cfop-f2l_40",
            "title": "F2L 40: Both in Slot (Crossed Colors)",
            "explanation": "Swap pieces across adjacent slots.",
            "algorithm": "R U R' U' R U2 R' U' R U R'",
            "condition": "Pieces belong to different slots.",
            "group": "Both In Slot"
          },
          {
            "id": "cfop-f2l_41",
            "title": "F2L 41: Both in Slot (Opposite Pair)",
            "explanation": "Wide move advanced fingertrick algorithm.",
            "algorithm": "R U' R' r' U2 R2 U R2' U r",
            "condition": "Pair belongs to back slot.",
            "group": "Both In Slot"
          }
        ]
      },
      {
        "id": "cfop-oll-all",
        "title": "OLL: All 57 Orientation Cases",
        "description": "Complete 1-Look OLL algorithms covering all Dot, Square, Lightning, Fish, Knight, Cross, and Line shapes.",
        "lessons": [
          {
            "id": "cfop-oll_01",
            "title": "OLL 01: Runway (Dot)",
            "explanation": "Orient the top layer in 1 look when seeing the Dot shape: Runway.",
            "algorithm": "R U2 R2 F R F' U2 R' F R F'",
            "group": "Dot"
          },
          {
            "id": "cfop-oll_02",
            "title": "OLL 02:  Zamboni (Dot)",
            "explanation": "Orient the top layer in 1 look when seeing the Dot shape:  Zamboni.",
            "algorithm": "F R U R' U' F' f R U R' U' f'",
            "group": "Dot"
          },
          {
            "id": "cfop-oll_03",
            "title": "OLL 03: Anti-Backslash (Dot)",
            "explanation": "Orient the top layer in 1 look when seeing the Dot shape: Anti-Backslash.",
            "algorithm": "f R U R' U' f' U' F R U R' U' F'",
            "group": "Dot"
          },
          {
            "id": "cfop-oll_04",
            "title": "OLL 04: Backslash (Dot)",
            "explanation": "Orient the top layer in 1 look when seeing the Dot shape: Backslash.",
            "algorithm": "f R U R' U' f' U F R U R' U' F'",
            "group": "Dot"
          },
          {
            "id": "cfop-oll_05",
            "title": "OLL 05: Right Square (Square)",
            "explanation": "Orient the top layer in 1 look when seeing the Square shape: Right Square.",
            "algorithm": "r' U2 R U R' U r",
            "group": "Square"
          },
          {
            "id": "cfop-oll_06",
            "title": "OLL 06: Left Square (Square)",
            "explanation": "Orient the top layer in 1 look when seeing the Square shape: Left Square.",
            "algorithm": "r U2 R' U' R U' r'",
            "group": "Square"
          },
          {
            "id": "cfop-oll_07",
            "title": "OLL 07: Small Lightning (Lightning)",
            "explanation": "Orient the top layer in 1 look when seeing the Lightning shape: Small Lightning.",
            "algorithm": "r U R' U R U2 r'",
            "group": "Lightning"
          },
          {
            "id": "cfop-oll_08",
            "title": "OLL 08: Small Lightning (Lightning)",
            "explanation": "Orient the top layer in 1 look when seeing the Lightning shape: Small Lightning.",
            "algorithm": "l' U' L U' L' U2 l",
            "group": "Lightning"
          },
          {
            "id": "cfop-oll_09",
            "title": "OLL 09: Kite (Fish)",
            "explanation": "Orient the top layer in 1 look when seeing the Fish shape: Kite.",
            "algorithm": "R U R' U' R' F R F'",
            "group": "Fish"
          },
          {
            "id": "cfop-oll_10",
            "title": "OLL 10: Kite (Fish)",
            "explanation": "Orient the top layer in 1 look when seeing the Fish shape: Kite.",
            "algorithm": "R U R' U R' F R F' R U2 R'",
            "group": "Fish"
          },
          {
            "id": "cfop-oll_11",
            "title": "OLL 11: Downstairs (Thunder)",
            "explanation": "Orient the top layer in 1 look when seeing the Thunder shape: Downstairs.",
            "algorithm": "r U R' U R U' R' U' r'",
            "group": "Thunder"
          },
          {
            "id": "cfop-oll_12",
            "title": "OLL 12: Upstairs (Thunder)",
            "explanation": "Orient the top layer in 1 look when seeing the Thunder shape: Upstairs.",
            "algorithm": "F R U R' U' F' U F R U R' U' F'",
            "group": "Thunder"
          },
          {
            "id": "cfop-oll_13",
            "title": "OLL 13: Knight Move (Knight)",
            "explanation": "Orient the top layer in 1 look when seeing the Knight shape: Knight Move.",
            "algorithm": "F U R U' R2 F' R U R U' R'",
            "group": "Knight"
          },
          {
            "id": "cfop-oll_14",
            "title": "OLL 14: Knight Move (Knight)",
            "explanation": "Orient the top layer in 1 look when seeing the Knight shape: Knight Move.",
            "algorithm": "R U R' U R U' R' U' R' F R F'",
            "group": "Knight"
          },
          {
            "id": "cfop-oll_15",
            "title": "OLL 15: Knight Move (Knight)",
            "explanation": "Orient the top layer in 1 look when seeing the Knight shape: Knight Move.",
            "algorithm": "l' U' l L' U' L U l' U l",
            "group": "Knight"
          },
          {
            "id": "cfop-oll_16",
            "title": "OLL 16: Knight Move (Knight)",
            "explanation": "Orient the top layer in 1 look when seeing the Knight shape: Knight Move.",
            "algorithm": "r U r' R U R' U' r U' r'",
            "group": "Knight"
          },
          {
            "id": "cfop-oll_17",
            "title": "OLL 17: Slash (Dot)",
            "explanation": "Orient the top layer in 1 look when seeing the Dot shape: Slash.",
            "algorithm": "F R U R' U' R A R' U' F'",
            "group": "Dot"
          },
          {
            "id": "cfop-oll_18",
            "title": "OLL 18: Crown (Dot)",
            "explanation": "Orient the top layer in 1 look when seeing the Dot shape: Crown.",
            "algorithm": "r U R' U R U2 r2 U' R U' R' U2 r",
            "group": "Dot"
          },
          {
            "id": "cfop-oll_19",
            "title": "OLL 19: Mummy (Dot)",
            "explanation": "Orient the top layer in 1 look when seeing the Dot shape: Mummy.",
            "algorithm": "r' R2 U R' U r U2 r' U M'",
            "group": "Dot"
          },
          {
            "id": "cfop-oll_20",
            "title": "OLL 20: Checkered (Dot)",
            "explanation": "Orient the top layer in 1 look when seeing the Dot shape: Checkered.",
            "algorithm": "M U R U R' U' M2 U R U' r'",
            "group": "Dot"
          },
          {
            "id": "cfop-oll_21",
            "title": "OLL 21: H / Double Headlight (Cross)",
            "explanation": "Orient the top layer in 1 look when seeing the Cross shape: H / Double Headlight.",
            "algorithm": "F R U R' U' R U R' U' R U R' F'",
            "group": "Cross"
          },
          {
            "id": "cfop-oll_22",
            "title": "OLL 22: Pi / Wheel (Cross)",
            "explanation": "Orient the top layer in 1 look when seeing the Cross shape: Pi / Wheel.",
            "algorithm": "R U2 R2 U' R2 U' R2 U2 R",
            "group": "Cross"
          },
          {
            "id": "cfop-oll_23",
            "title": "OLL 23: Headlights (Cross)",
            "explanation": "Orient the top layer in 1 look when seeing the Cross shape: Headlights.",
            "algorithm": "R2 D R' U2 R D' R' U2 R'",
            "group": "Cross"
          },
          {
            "id": "cfop-oll_24",
            "title": "OLL 24: Chameleon (Cross)",
            "explanation": "Orient the top layer in 1 look when seeing the Cross shape: Chameleon.",
            "algorithm": "r U R' U' r' F R F'",
            "group": "Cross"
          },
          {
            "id": "cfop-oll_25",
            "title": "OLL 25: Bowtie (Cross)",
            "explanation": "Orient the top layer in 1 look when seeing the Cross shape: Bowtie.",
            "algorithm": "F' r U R' U' r' F R",
            "group": "Cross"
          },
          {
            "id": "cfop-oll_26",
            "title": "OLL 26: Anti-Sune (Cross)",
            "explanation": "Orient the top layer in 1 look when seeing the Cross shape: Anti-Sune.",
            "algorithm": "R U2 R' U' R U' R'",
            "group": "Cross"
          },
          {
            "id": "cfop-oll_27",
            "title": "OLL 27: Sune (Cross)",
            "explanation": "Orient the top layer in 1 look when seeing the Cross shape: Sune.",
            "algorithm": "R U R' U R U2 R'",
            "group": "Cross"
          },
          {
            "id": "cfop-oll_28",
            "title": "OLL 28: Stealth (Corners Orient)",
            "explanation": "Orient the top layer in 1 look when seeing the Corners Orient shape: Stealth.",
            "algorithm": "r U R' U' M U R U' R'",
            "group": "Corners Orient"
          },
          {
            "id": "cfop-oll_29",
            "title": "OLL 29: Awkward Shape (Awkward)",
            "explanation": "Orient the top layer in 1 look when seeing the Awkward shape: Awkward Shape.",
            "algorithm": "M U R U R' U' R' F R F' M'",
            "group": "Awkward"
          },
          {
            "id": "cfop-oll_30",
            "title": "OLL 30: Awkward Shape (Awkward)",
            "explanation": "Orient the top layer in 1 look when seeing the Awkward shape: Awkward Shape.",
            "algorithm": "F R U R' U2 F' R U R' U' F'",
            "group": "Awkward"
          },
          {
            "id": "cfop-oll_31",
            "title": "OLL 31: Couch (P-Shape)",
            "explanation": "Orient the top layer in 1 look when seeing the P-Shape shape: Couch.",
            "algorithm": "R' U' F U R U' R' F' R",
            "group": "P-Shape"
          },
          {
            "id": "cfop-oll_32",
            "title": "OLL 32: Anti-Couch (P-Shape)",
            "explanation": "Orient the top layer in 1 look when seeing the P-Shape shape: Anti-Couch.",
            "algorithm": "L U F' U' L' U L F L'",
            "group": "P-Shape"
          },
          {
            "id": "cfop-oll_33",
            "title": "OLL 33: T1 (T-Shape)",
            "explanation": "Orient the top layer in 1 look when seeing the T-Shape shape: T1.",
            "algorithm": "R U R' U' R' F R F'",
            "group": "T-Shape"
          },
          {
            "id": "cfop-oll_34",
            "title": "OLL 34: T2 (T-Shape)",
            "explanation": "Orient the top layer in 1 look when seeing the T-Shape shape: T2.",
            "algorithm": "R U R2 U' R' F R U R U' F'",
            "group": "T-Shape"
          },
          {
            "id": "cfop-oll_35",
            "title": "OLL 35: Fish (Fish)",
            "explanation": "Orient the top layer in 1 look when seeing the Fish shape: Fish.",
            "algorithm": "R U2 R2 F R F' R U2 R'",
            "group": "Fish"
          },
          {
            "id": "cfop-oll_36",
            "title": "OLL 36: Mounted Fish (Fish)",
            "explanation": "Orient the top layer in 1 look when seeing the Fish shape: Mounted Fish.",
            "algorithm": "L' U' L U' L' U L U L F' L' F",
            "group": "Fish"
          },
          {
            "id": "cfop-oll_37",
            "title": "OLL 37: Fish (Fish)",
            "explanation": "Orient the top layer in 1 look when seeing the Fish shape: Fish.",
            "algorithm": "F R' F' R U R U' R'",
            "group": "Fish"
          },
          {
            "id": "cfop-oll_38",
            "title": "OLL 38: Fish (Fish)",
            "explanation": "Orient the top layer in 1 look when seeing the Fish shape: Fish.",
            "algorithm": "R U B' U' R' U R B R'",
            "group": "Fish"
          },
          {
            "id": "cfop-oll_39",
            "title": "OLL 39: Big Lightning (Lightning)",
            "explanation": "Orient the top layer in 1 look when seeing the Lightning shape: Big Lightning.",
            "algorithm": "L F' L' U' L U F U' L'",
            "group": "Lightning"
          },
          {
            "id": "cfop-oll_40",
            "title": "OLL 40: Big Lightning (Lightning)",
            "explanation": "Orient the top layer in 1 look when seeing the Lightning shape: Big Lightning.",
            "algorithm": "R' F R U R' U' F' U R",
            "group": "Lightning"
          },
          {
            "id": "cfop-oll_41",
            "title": "OLL 41: Awkward Shape (Awkward)",
            "explanation": "Orient the top layer in 1 look when seeing the Awkward shape: Awkward Shape.",
            "algorithm": "RU R' U R U2 R' F R U R' U' F'",
            "group": "Awkward"
          },
          {
            "id": "cfop-oll_42",
            "title": "OLL 42: Awkward Shape (Awkward)",
            "explanation": "Orient the top layer in 1 look when seeing the Awkward shape: Awkward Shape.",
            "algorithm": "R' U' R U' R' U2 R F R U R' U' F'",
            "group": "Awkward"
          },
          {
            "id": "cfop-oll_43",
            "title": "OLL 43: P-Shape (P-Shape)",
            "explanation": "Orient the top layer in 1 look when seeing the P-Shape shape: P-Shape.",
            "algorithm": "f' L' U' L U f",
            "group": "P-Shape"
          },
          {
            "id": "cfop-oll_44",
            "title": "OLL 44: P-Shape (P-Shape)",
            "explanation": "Orient the top layer in 1 look when seeing the P-Shape shape: P-Shape.",
            "algorithm": "f R U R' U' f'",
            "group": "P-Shape"
          },
          {
            "id": "cfop-oll_45",
            "title": "OLL 45: T-Shape (T-Shape)",
            "explanation": "Orient the top layer in 1 look when seeing the T-Shape shape: T-Shape.",
            "algorithm": "F R U R' U' F'",
            "group": "T-Shape"
          },
          {
            "id": "cfop-oll_46",
            "title": "OLL 46: C-Shape (C-Shape)",
            "explanation": "Orient the top layer in 1 look when seeing the C-Shape shape: C-Shape.",
            "algorithm": "R' U' R' F R F' U R",
            "group": "C-Shape"
          },
          {
            "id": "cfop-oll_47",
            "title": "OLL 47: Small L (Small L)",
            "explanation": "Orient the top layer in 1 look when seeing the Small L shape: Small L.",
            "algorithm": "F' L' U' L U L' U' L U F",
            "group": "Small L"
          },
          {
            "id": "cfop-oll_48",
            "title": "OLL 48: Small L (Small L)",
            "explanation": "Orient the top layer in 1 look when seeing the Small L shape: Small L.",
            "algorithm": "F R U R' U' R U R' U' F'",
            "group": "Small L"
          },
          {
            "id": "cfop-oll_49",
            "title": "OLL 49: Small L (Small L)",
            "explanation": "Orient the top layer in 1 look when seeing the Small L shape: Small L.",
            "algorithm": "r U' r2 U r2 U r2 U' r",
            "group": "Small L"
          },
          {
            "id": "cfop-oll_50",
            "title": "OLL 50: Small L (Small L)",
            "explanation": "Orient the top layer in 1 look when seeing the Small L shape: Small L.",
            "algorithm": "r' U r2 U' r2 U' r2 U r'",
            "group": "Small L"
          },
          {
            "id": "cfop-oll_51",
            "title": "OLL 51: I-Shape (I-Shape)",
            "explanation": "Orient the top layer in 1 look when seeing the I-Shape shape: I-Shape.",
            "algorithm": "f R U R' U' R U R' U' f'",
            "group": "I-Shape"
          },
          {
            "id": "cfop-oll_52",
            "title": "OLL 52: I-Shape (I-Shape)",
            "explanation": "Orient the top layer in 1 look when seeing the I-Shape shape: I-Shape.",
            "algorithm": "R U R' U R U' B U' B' R'",
            "group": "I-Shape"
          },
          {
            "id": "cfop-oll_53",
            "title": "OLL 53: I-Shape (I-Shape)",
            "explanation": "Orient the top layer in 1 look when seeing the I-Shape shape: I-Shape.",
            "algorithm": "r' U' r R' U' R U r' U r",
            "group": "I-Shape"
          },
          {
            "id": "cfop-oll_54",
            "title": "OLL 54: I-Shape (I-Shape)",
            "explanation": "Orient the top layer in 1 look when seeing the I-Shape shape: I-Shape.",
            "algorithm": "r U r' R U R' U' r U' r'",
            "group": "I-Shape"
          },
          {
            "id": "cfop-oll_55",
            "title": "OLL 55: I-Shape (I-Shape)",
            "explanation": "Orient the top layer in 1 look when seeing the I-Shape shape: I-Shape.",
            "algorithm": "R' F R U R U' R2 F' R2 U' R' U R U R'",
            "group": "I-Shape"
          },
          {
            "id": "cfop-oll_56",
            "title": "OLL 56: I-Shape (I-Shape)",
            "explanation": "Orient the top layer in 1 look when seeing the I-Shape shape: I-Shape.",
            "algorithm": "r U R' U R U2 r' r' U' R U' R' U2 r",
            "group": "I-Shape"
          },
          {
            "id": "cfop-oll_57",
            "title": "OLL 57: H-Shape (Corners Orient)",
            "explanation": "Orient the top layer in 1 look when seeing the Corners Orient shape: H-Shape.",
            "algorithm": "R U R' U' M' U R U' r'",
            "group": "Corners Orient"
          }
        ]
      },
      {
        "id": "cfop-pll-all",
        "title": "PLL: All 21 Permutation Cases",
        "description": "Complete 1-Look PLL algorithms covering all Adjacent, Diagonal, G-Perms, and Edges-only permutations.",
        "lessons": [
          {
            "id": "cfop-pll_aa",
            "title": "PLL: Aa Perm (Corner Swap)",
            "explanation": "Permute the last layer in 1 algorithm for the Aa Perm configuration.",
            "algorithm": "x R' D2 R U R' D2 R U' R'",
            "group": "Corner Swap"
          },
          {
            "id": "cfop-pll_ab",
            "title": "PLL: Ab Perm (Corner Swap)",
            "explanation": "Permute the last layer in 1 algorithm for the Ab Perm configuration.",
            "algorithm": "x R U' R D2 R' U R D2 R2",
            "group": "Corner Swap"
          },
          {
            "id": "cfop-pll_e",
            "title": "PLL: E Perm (Corner Swap)",
            "explanation": "Permute the last layer in 1 algorithm for the E Perm configuration.",
            "algorithm": "x' R U' R' D R U R' D' R U R' D R U' R' D'",
            "group": "Corner Swap"
          },
          {
            "id": "cfop-pll_f",
            "title": "PLL: F Perm (Adjacent Swap)",
            "explanation": "Permute the last layer in 1 algorithm for the F Perm configuration.",
            "algorithm": "R' U' F' R U R' U' R' F R2 U' R' U' R U R' U R",
            "group": "Adjacent Swap"
          },
          {
            "id": "cfop-pll_ga",
            "title": "PLL: Ga Perm (G Perms)",
            "explanation": "Permute the last layer in 1 algorithm for the Ga Perm configuration.",
            "algorithm": "R2 U R' U R' U' R U' R2 U' D R' U R D'",
            "group": "G Perms"
          },
          {
            "id": "cfop-pll_gb",
            "title": "PLL: Gb Perm (G Perms)",
            "explanation": "Permute the last layer in 1 algorithm for the Gb Perm configuration.",
            "algorithm": "R' U' R U D' R2 U R' U R U' R U' R2 D",
            "group": "G Perms"
          },
          {
            "id": "cfop-pll_gc",
            "title": "PLL: Gc Perm (G Perms)",
            "explanation": "Permute the last layer in 1 algorithm for the Gc Perm configuration.",
            "algorithm": "R2 U' R U' R U R' U R2 U D' R U' R' D",
            "group": "G Perms"
          },
          {
            "id": "cfop-pll_gd",
            "title": "PLL: Gd Perm (G Perms)",
            "explanation": "Permute the last layer in 1 algorithm for the Gd Perm configuration.",
            "algorithm": "R U R' U' D R2 U' R U' R' U R' U R2 D'",
            "group": "G Perms"
          },
          {
            "id": "cfop-pll_h",
            "title": "PLL: H Perm (Edges Only)",
            "explanation": "Permute the last layer in 1 algorithm for the H Perm configuration.",
            "algorithm": "M2 U M2 U2 M2 U M2",
            "group": "Edges Only"
          },
          {
            "id": "cfop-pll_ja",
            "title": "PLL: Ja Perm (Adjacent Swap)",
            "explanation": "Permute the last layer in 1 algorithm for the Ja Perm configuration.",
            "algorithm": "x R2 F R F' R U2 r' U r U2",
            "group": "Adjacent Swap"
          },
          {
            "id": "cfop-pll_jb",
            "title": "PLL: Jb Perm (Adjacent Swap)",
            "explanation": "Permute the last layer in 1 algorithm for the Jb Perm configuration.",
            "algorithm": "R U R' F' R U R' U' R' F R2 U' R'",
            "group": "Adjacent Swap"
          },
          {
            "id": "cfop-pll_na",
            "title": "PLL: Na Perm (Diagonal Swap)",
            "explanation": "Permute the last layer in 1 algorithm for the Na Perm configuration.",
            "algorithm": "R U R' U R U R' F' R U R' U' R' F R2 U' R' U2 R U' R'",
            "group": "Diagonal Swap"
          },
          {
            "id": "cfop-pll_nb",
            "title": "PLL: Nb Perm (Diagonal Swap)",
            "explanation": "Permute the last layer in 1 algorithm for the Nb Perm configuration.",
            "algorithm": "R' U R U' R' F' U' F R U R' F R' F' R U' R",
            "group": "Diagonal Swap"
          },
          {
            "id": "cfop-pll_ra",
            "title": "PLL: Ra Perm (Adjacent Swap)",
            "explanation": "Permute the last layer in 1 algorithm for the Ra Perm configuration.",
            "algorithm": "R U R' F' R U2 R' U2 R' F R U R U2 R'",
            "group": "Adjacent Swap"
          },
          {
            "id": "cfop-pll_rb",
            "title": "PLL: Rb Perm (Adjacent Swap)",
            "explanation": "Permute the last layer in 1 algorithm for the Rb Perm configuration.",
            "algorithm": "R' U2 R U2 R' F R U R' U' R' F' R2",
            "group": "Adjacent Swap"
          },
          {
            "id": "cfop-pll_t",
            "title": "PLL: T Perm (Adjacent Swap)",
            "explanation": "Permute the last layer in 1 algorithm for the T Perm configuration.",
            "algorithm": "R U R' U' R' F R2 U' R' U' R U R' F'",
            "group": "Adjacent Swap"
          },
          {
            "id": "cfop-pll_ua",
            "title": "PLL: Ua Perm (Edges Only)",
            "explanation": "Permute the last layer in 1 algorithm for the Ua Perm configuration.",
            "algorithm": "R U' R U R U R U' R' U' R2",
            "group": "Edges Only"
          },
          {
            "id": "cfop-pll_ub",
            "title": "PLL: Ub Perm (Edges Only)",
            "explanation": "Permute the last layer in 1 algorithm for the Ub Perm configuration.",
            "algorithm": "R2 U R U R' U' R' U' R' U R'",
            "group": "Edges Only"
          },
          {
            "id": "cfop-pll_v",
            "title": "PLL: V Perm (Diagonal Swap)",
            "explanation": "Permute the last layer in 1 algorithm for the V Perm configuration.",
            "algorithm": "R' U R' U' R D' R' D R' U D' R2 U' R2 D R2",
            "group": "Diagonal Swap"
          },
          {
            "id": "cfop-pll_y",
            "title": "PLL: Y Perm (Diagonal Swap)",
            "explanation": "Permute the last layer in 1 algorithm for the Y Perm configuration.",
            "algorithm": "F R U' R' U' R U R' F' R U R' U' R' F R F'",
            "group": "Diagonal Swap"
          },
          {
            "id": "cfop-pll_z",
            "title": "PLL: Z Perm (Edges Only)",
            "explanation": "Permute the last layer in 1 algorithm for the Z Perm configuration.",
            "algorithm": "M' U M2 U M2 U M' U2 M2",
            "group": "Edges Only"
          }
        ]
      }
    ]
  },
  {
    "id": "roux",
    "title": "Roux Method",
    "badge": "Pro",
    "description": "Rotationless blockbuilding, 42 CMLL algorithms, and hyper-efficient M-slice LSE solving.",
    "progress": 0,
    "modules": [
      {
        "id": "roux-breakdown-module",
        "title": "Full Example Solve Breakdown",
        "description": "Complete low-movecount Roux solve covering First Block (FB), Second Block (SB), CMLL, and Last Six Edges (LSE).",
        "lessons": [
          {
            "id": "roux-full-solve",
            "title": "Full Example Solve Breakdown (Roux Blockbuilding)",
            "explanation": "Hey Roux fans! Today we're showcasing the sheer efficiency and low move-count of the Roux method. We build two 1x2x3 blocks, solve all 4 top corners in one shot with CMLL, and finish with lightning-fast M-slice moves in LSE!",
            "algorithm": "R2 B R2 U2 F' D2 B L' F2 D' L2 U F2 L2 B2 D2 R2 U2 F2",
            "initialScramble": "F2 U2 R2 D2 B2 L2 F2 U' L2 D F2 L B' D2 F U2 R2 B' R2",
            "phases": [
              {
                "phase": "Phase 1: First Block (FB - Left 1x2x3)",
                "explanation": "We inspect the Blue-White center and edge. In just 5 moves (R2 B R2 U2 F'), we construct the complete 1x2x3 block on the left side of the cube, leaving the M-slice and entire right side open.",
                "moves": "R2 B R2 U2 F'"
              },
              {
                "phase": "Phase 2: Second Block (SB - Right 1x2x3)",
                "explanation": "Using only R, r, and U moves, we build the matching Green-White 1x2x3 block on the right. Notice how the middle M-slice remains completely free to manipulate without breaking our left block!",
                "moves": "D2 B L' F2"
              },
              {
                "phase": "Phase 3: CMLL (Corners of Last Layer)",
                "explanation": "With both side blocks locked in, we check the 4 top corners. It's a U-set CMLL case! We execute the algorithm (D' L2 U F2) to orient and permute all 4 corners simultaneously.",
                "moves": "D' L2 U F2"
              },
              {
                "phase": "Phase 4: LSE (Last Six Edges - Solved!)",
                "explanation": "The magic finale! We orient the 6 remaining edges (EO), place the UL and UR edges, and permute the final 4 M-slice edges with pure M2 and U2 finger flicking to solve the cube!",
                "moves": "L2 B2 D2 R2 U2 F2"
              }
            ]
          }
        ]
      },
      {
        "id": "roux-first-block",
        "title": "Phase 1: First Block (FB - Left 1x2x3)",
        "description": "Intuitive blockbuilding techniques on the left side of the cube.",
        "lessons": [
          {
            "id": "roux-fb-dl-edge",
            "title": "DL Edge Placement & Corner Matching",
            "explanation": "Set the D-L edge (usually Blue/White) and build the first 1x2x2 block intuitively.",
            "algorithm": "L U L' U L U2 L'"
          },
          {
            "id": "roux-fb-complete",
            "title": "Completing the 1x2x3 Left Block",
            "explanation": "Finish the front and back pairs to lock in the entire left block.",
            "algorithm": "U' L' U L U F' U' F"
          }
        ]
      },
      {
        "id": "roux-second-block",
        "title": "Phase 2: Second Block (SB - Right 1x2x3)",
        "description": "Construct the right 1x2x3 block using only R, r, and U moves.",
        "lessons": [
          {
            "id": "roux-sb-setup",
            "title": "DR Edge & Back Pair Setup",
            "explanation": "Bring the Green/White DR edge down and pair the back-right corner-edge without disturbing the left block.",
            "algorithm": "R U' R' U' R U2 R'"
          },
          {
            "id": "roux-sb-front-pair",
            "title": "Front Right Pair Finish",
            "explanation": "Slot the final corner-edge pair into the front-right to complete the second block.",
            "algorithm": "r U' r' U' R U R'"
          }
        ]
      },
      {
        "id": "roux-cmll-set-1",
        "title": "Phase 3: CMLL - O (Oriented - 2 cases)",
        "description": "Corners of Last Layer algorithms for the O (Oriented - 2 cases) shape.",
        "lessons": [
          {
            "id": "roux-cmll_o_adjacent",
            "title": "O - Adjacent Swap",
            "explanation": "CMLL algorithm for O - Adjacent Swap. Solves corner orientation and permutation simultaneously.",
            "algorithm": "R U R' F' R U R' U' R' F R2 U' R'"
          },
          {
            "id": "roux-cmll_o_diagonal",
            "title": "O - Diagonal Swap",
            "explanation": "CMLL algorithm for O - Diagonal Swap. Solves corner orientation and permutation simultaneously.",
            "algorithm": "r U R' U' r' F R F'"
          }
        ]
      },
      {
        "id": "roux-cmll-set-2",
        "title": "Phase 3: CMLL - U (Headlights - 6 cases)",
        "description": "Corners of Last Layer algorithms for the U (Headlights - 6 cases) shape.",
        "lessons": [
          {
            "id": "roux-cmll_u_forward",
            "title": "U - Forward Bar",
            "explanation": "CMLL algorithm for U - Forward Bar. Solves corner orientation and permutation simultaneously.",
            "algorithm": "R2 D' R U2 R' D R U2 R"
          },
          {
            "id": "roux-cmll_u_back",
            "title": "U - Back Bar",
            "explanation": "CMLL algorithm for U - Back Bar. Solves corner orientation and permutation simultaneously.",
            "algorithm": "R2 D R' U2 R D' R' U2 R'"
          },
          {
            "id": "roux-cmll_u_slash",
            "title": "U - Slash",
            "explanation": "CMLL algorithm for U - Slash. Solves corner orientation and permutation simultaneously.",
            "algorithm": "F R U R' U' R U R' U' F'"
          },
          {
            "id": "roux-cmll_u_x",
            "title": "U - X",
            "explanation": "CMLL algorithm for U - X. Solves corner orientation and permutation simultaneously.",
            "algorithm": "r U R' U' r' F R F'"
          },
          {
            "id": "roux-cmll_u_rows",
            "title": "U - Rows",
            "explanation": "CMLL algorithm for U - Rows. Solves corner orientation and permutation simultaneously.",
            "algorithm": "R' U' R U' R' U2 R"
          },
          {
            "id": "roux-cmll_u_columns",
            "title": "U - Columns",
            "explanation": "CMLL algorithm for U - Columns. Solves corner orientation and permutation simultaneously.",
            "algorithm": "R U R' U R U2 R'"
          }
        ]
      },
      {
        "id": "roux-cmll-set-3",
        "title": "Phase 3: CMLL - T (Chameleon - 6 cases)",
        "description": "Corners of Last Layer algorithms for the T (Chameleon - 6 cases) shape.",
        "lessons": [
          {
            "id": "roux-cmll_t_left_bar",
            "title": "T - Left Bar",
            "explanation": "CMLL algorithm for T - Left Bar. Solves corner orientation and permutation simultaneously.",
            "algorithm": "r U R' U' r' F R F'"
          },
          {
            "id": "roux-cmll_t_right_bar",
            "title": "T - Right Bar",
            "explanation": "CMLL algorithm for T - Right Bar. Solves corner orientation and permutation simultaneously.",
            "algorithm": "R' U' R U R' F' R U R' U' R' F R"
          },
          {
            "id": "roux-cmll_t_row",
            "title": "T - Row",
            "explanation": "CMLL algorithm for T - Row. Solves corner orientation and permutation simultaneously.",
            "algorithm": "F R U R' U' F'"
          },
          {
            "id": "roux-cmll_t_dots",
            "title": "T - Dots",
            "explanation": "CMLL algorithm for T - Dots. Solves corner orientation and permutation simultaneously.",
            "algorithm": "r' U' R U r U' R'"
          },
          {
            "id": "roux-cmll_t_anti_slash",
            "title": "T - Anti-Slash",
            "explanation": "CMLL algorithm for T - Anti-Slash. Solves corner orientation and permutation simultaneously.",
            "algorithm": "R U2 R' U' R U' R2 Y L' U' L U F"
          },
          {
            "id": "roux-cmll_t_slash",
            "title": "T - Slash",
            "explanation": "CMLL algorithm for T - Slash. Solves corner orientation and permutation simultaneously.",
            "algorithm": "r U' r2 U r2 U r' "
          }
        ]
      },
      {
        "id": "roux-cmll-set-4",
        "title": "Phase 3: CMLL - L (Bowtie - 6 cases)",
        "description": "Corners of Last Layer algorithms for the L (Bowtie - 6 cases) shape.",
        "lessons": [
          {
            "id": "roux-cmll_l_mirror",
            "title": "L - Mirror",
            "explanation": "CMLL algorithm for L - Mirror. Solves corner orientation and permutation simultaneously.",
            "algorithm": "F' r U R' U' r' F R"
          },
          {
            "id": "roux-cmll_l_pure",
            "title": "L - Pure",
            "explanation": "CMLL algorithm for L - Pure. Solves corner orientation and permutation simultaneously.",
            "algorithm": "R U2 R' U' R U R' U' R U' R'"
          },
          {
            "id": "roux-cmll_l_front_target",
            "title": "L - Front Target",
            "explanation": "CMLL algorithm for L - Front Target. Solves corner orientation and permutation simultaneously.",
            "algorithm": "r' U2 R U R' U r"
          },
          {
            "id": "roux-cmll_l_back_target",
            "title": "L - Back Target",
            "explanation": "CMLL algorithm for L - Back Target. Solves corner orientation and permutation simultaneously.",
            "algorithm": "r U2 R' U' R U' r'"
          },
          {
            "id": "roux-cmll_l_diagonals",
            "title": "L - Diagonals",
            "explanation": "CMLL algorithm for L - Diagonals. Solves corner orientation and permutation simultaneously.",
            "algorithm": "R' U2 R U R' U R"
          },
          {
            "id": "roux-cmll_l_columns",
            "title": "L - Columns",
            "explanation": "CMLL algorithm for L - Columns. Solves corner orientation and permutation simultaneously.",
            "algorithm": "R U R' U R U2 R'"
          }
        ]
      },
      {
        "id": "roux-cmll-set-5",
        "title": "Phase 3: CMLL - S (Sune - 6 cases)",
        "description": "Corners of Last Layer algorithms for the S (Sune - 6 cases) shape.",
        "lessons": [
          {
            "id": "roux-cmll_s_left_bar",
            "title": "Sune - Left Bar",
            "explanation": "CMLL algorithm for Sune - Left Bar. Solves corner orientation and permutation simultaneously.",
            "algorithm": "R U R' U R U2 R'"
          },
          {
            "id": "roux-cmll_s_x_check",
            "title": "Sune - X Check",
            "explanation": "CMLL algorithm for Sune - X Check. Solves corner orientation and permutation simultaneously.",
            "algorithm": "R U R' U' R' F R F'"
          },
          {
            "id": "roux-cmll_s_forward_slash",
            "title": "Sune - Forward Slash",
            "explanation": "CMLL algorithm for Sune - Forward Slash. Solves corner orientation and permutation simultaneously.",
            "algorithm": "F R U R' U' F' R U R' U R U2 R'"
          },
          {
            "id": "roux-cmll_s_back_slash",
            "title": "Sune - Back Slash",
            "explanation": "CMLL algorithm for Sune - Back Slash. Solves corner orientation and permutation simultaneously.",
            "algorithm": "R U R' U R' F R F' R U2 R'"
          },
          {
            "id": "roux-cmll_s_columns",
            "title": "Sune - Columns",
            "explanation": "CMLL algorithm for Sune - Columns. Solves corner orientation and permutation simultaneously.",
            "algorithm": "r U R' U' r' F R F'"
          },
          {
            "id": "roux-cmll_s_rows",
            "title": "Sune - Rows",
            "explanation": "CMLL algorithm for Sune - Rows. Solves corner orientation and permutation simultaneously.",
            "algorithm": "R' U' R U' R' U2 R"
          }
        ]
      },
      {
        "id": "roux-cmll-set-6",
        "title": "Phase 3: CMLL - AS (Anti-Sune - 6 cases)",
        "description": "Corners of Last Layer algorithms for the AS (Anti-Sune - 6 cases) shape.",
        "lessons": [
          {
            "id": "roux-cmll_as_right_bar",
            "title": "Anti-Sune - Right Bar",
            "explanation": "CMLL algorithm for Anti-Sune - Right Bar. Solves corner orientation and permutation simultaneously.",
            "algorithm": "R U2 R' U' R U' R'"
          },
          {
            "id": "roux-cmll_as_x_check",
            "title": "Anti-Sune - X Check",
            "explanation": "CMLL algorithm for Anti-Sune - X Check. Solves corner orientation and permutation simultaneously.",
            "algorithm": "R' U' R U' R' U2 R"
          },
          {
            "id": "roux-cmll_as_back_slash",
            "title": "Anti-Sune - Back Slash",
            "explanation": "CMLL algorithm for Anti-Sune - Back Slash. Solves corner orientation and permutation simultaneously.",
            "algorithm": "F R U R' U' F'"
          },
          {
            "id": "roux-cmll_as_forward_slash",
            "title": "Anti-Sune - Forward Slash",
            "explanation": "CMLL algorithm for Anti-Sune - Forward Slash. Solves corner orientation and permutation simultaneously.",
            "algorithm": "r U R' U' r' F R F'"
          },
          {
            "id": "roux-cmll_as_columns",
            "title": "Anti-Sune - Columns",
            "explanation": "CMLL algorithm for Anti-Sune - Columns. Solves corner orientation and permutation simultaneously.",
            "algorithm": "R U R' U R U2 R'"
          },
          {
            "id": "roux-cmll_as_rows",
            "title": "Anti-Sune - Rows",
            "explanation": "CMLL algorithm for Anti-Sune - Rows. Solves corner orientation and permutation simultaneously.",
            "algorithm": "R2 D' R U2 R' D R U2 R"
          }
        ]
      },
      {
        "id": "roux-cmll-set-7",
        "title": "Phase 3: CMLL - Pi (Wheel - 6 cases)",
        "description": "Corners of Last Layer algorithms for the Pi (Wheel - 6 cases) shape.",
        "lessons": [
          {
            "id": "roux-cmll_pi_right_bar",
            "title": "Pi - Right Bar",
            "explanation": "CMLL algorithm for Pi - Right Bar. Solves corner orientation and permutation simultaneously.",
            "algorithm": "R U2 R2 U' R2 U' R2 U2 R"
          },
          {
            "id": "roux-cmll_pi_back_slash",
            "title": "Pi - Back Slash",
            "explanation": "CMLL algorithm for Pi - Back Slash. Solves corner orientation and permutation simultaneously.",
            "algorithm": "F R U R' U' R U R' U' F'"
          },
          {
            "id": "roux-cmll_pi_x",
            "title": "Pi - X",
            "explanation": "CMLL algorithm for Pi - X. Solves corner orientation and permutation simultaneously.",
            "algorithm": "r U R' U' r' F R F'"
          },
          {
            "id": "roux-cmll_pi_columns",
            "title": "Pi - Columns",
            "explanation": "CMLL algorithm for Pi - Columns. Solves corner orientation and permutation simultaneously.",
            "algorithm": "R U R' U R U2 R'"
          },
          {
            "id": "roux-cmll_pi_slash",
            "title": "Pi - Slash",
            "explanation": "CMLL algorithm for Pi - Slash. Solves corner orientation and permutation simultaneously.",
            "algorithm": "R' U' R U' R' U2 R"
          },
          {
            "id": "roux-cmll_pi_pure",
            "title": "Pi - Pure",
            "explanation": "CMLL algorithm for Pi - Pure. Solves corner orientation and permutation simultaneously.",
            "algorithm": "F (R U R' U')3 F'"
          }
        ]
      },
      {
        "id": "roux-cmll-set-8",
        "title": "Phase 3: CMLL - H (Double Headlights - 4 cases)",
        "description": "Corners of Last Layer algorithms for the H (Double Headlights - 4 cases) shape.",
        "lessons": [
          {
            "id": "roux-cmll_h_column",
            "title": "H - Column",
            "explanation": "CMLL algorithm for H - Column. Solves corner orientation and permutation simultaneously.",
            "algorithm": "F R U R' U' R U R' U' R U R' F'"
          },
          {
            "id": "roux-cmll_h_row",
            "title": "H - Row",
            "explanation": "CMLL algorithm for H - Row. Solves corner orientation and permutation simultaneously.",
            "algorithm": "R U R' U R U' R' U R U2 R'"
          },
          {
            "id": "roux-cmll_h_slash",
            "title": "H - Slash",
            "explanation": "CMLL algorithm for H - Slash. Solves corner orientation and permutation simultaneously.",
            "algorithm": "r U R' U' r' F R F'"
          },
          {
            "id": "roux-cmll_h_pure",
            "title": "H - Pure",
            "explanation": "CMLL algorithm for H - Pure. Solves corner orientation and permutation simultaneously.",
            "algorithm": "R U2 R' U' R U R' U' R U' R'"
          }
        ]
      },
      {
        "id": "roux-lse-steps",
        "title": "Phase 4: LSE (Last Six Edges Sub-Steps)",
        "description": "M-slice and U-layer algorithms to complete the remaining 6 edges.",
        "lessons": [
          {
            "id": "roux-lse-1",
            "title": "4a. Edge Orientation (EO)",
            "explanation": "Orient all 6 remaining edges so white/yellow faces up or down.",
            "algorithm": "M' U M'"
          },
          {
            "id": "roux-lse-2",
            "title": "4b. UL & UR Edges",
            "explanation": "Place the Upper-Left (UL) and Upper-Right (UR) edges into their correct positions.",
            "algorithm": "M2 U2 M2"
          },
          {
            "id": "roux-lse-3",
            "title": "4c. EP (Edge Permutation)",
            "explanation": "Permute the remaining 4 M-slice edges to solve the cube.",
            "algorithm": "M2 U2 M2 U2"
          }
        ]
      }
    ]
  },
  {
    "id": "zz",
    "title": "ZZ Method",
    "badge": "Expert",
    "description": "Zero-rotation mastery with EOline edge orientation, ZZF2L blockbuilding, and COLL/EPLL last layer.",
    "progress": 0,
    "modules": [
      {
        "id": "zz-breakdown-module",
        "title": "Full Example Solve Breakdown",
        "description": "Rotationless solve demonstration featuring EOline inspection, ZZF2L blockbuilding, and COLL/EPLL finish.",
        "lessons": [
          {
            "id": "zz-full-solve",
            "title": "Full Example Solve Breakdown (ZZ Rotationless Masterclass)",
            "explanation": "What's up cubers! Welcome to the rotationless realm of the ZZ Method. We count the bad edges in inspection, orient all 12 at once while placing the line in EOline, and solve the rest of the cube using strictly R, U, and L moves—zero cube rotations!",
            "algorithm": "L2 B R2 U F D2 R B L2 D B2 L2 U2 B2 D2 R2 F2 U2 L2",
            "initialScramble": "L2 U2 F2 R2 D2 B2 U2 L2 B2 D' L2 B' R' D2 F' U' R2 B' L2",
            "phases": [
              {
                "phase": "Phase 1: EOLine (Edge Orientation + Line)",
                "explanation": "During inspection, we find 4 bad edges. With a quick F and D setup, we orient every single edge on the cube and lock in the DF and DB line edges on the bottom layer.",
                "moves": "L2 B R2 U F D2"
              },
              {
                "phase": "Phase 2: ZZF2L (Rotationless Left & Right Blocks)",
                "explanation": "Because all 12 edges are already oriented, every F2L pair can be formed and slotted using ONLY R, U, and L moves. Zero regrips, zero cube rotations—pure speed and flawless lookahead.",
                "moves": "R B L2 D B2 L2"
              },
              {
                "phase": "Phase 3: COLL & EPLL (Last Layer - Solved!)",
                "explanation": "Thanks to EOline, the top yellow cross is automatically preserved! We jump straight to COLL to solve corner orientation and permutation in one algorithm, then finish with a 4-move EPLL to solve the entire cube!",
                "moves": "U2 B2 D2 R2 F2 U2 L2"
              }
            ]
          }
        ]
      },
      {
        "id": "zz-eoline-module",
        "title": "Phase 1: EOline (Edge Orientation + Line)",
        "description": "Orient all 12 edges and position the DF and DB line edges on the bottom.",
        "lessons": [
          {
            "id": "zz-eoline-inspection",
            "title": "EO Inspection & Bad Edge Identification",
            "explanation": "Analyze the cube during inspection to identify bad edges (edges with flipped orientation relative to the F/B axis).",
            "algorithm": "F R U R' U' F'"
          },
          {
            "id": "zz-eoline-placement",
            "title": "DF/DB Line Placement",
            "explanation": "Place the Down-Front and Down-Back edges into the D layer to create the guiding line.",
            "algorithm": "D R2 L2 D'"
          }
        ]
      },
      {
        "id": "zz-f2l-blocks",
        "title": "Phase 2: ZZF2L (Rotationless Left & Right Blocks)",
        "description": "Build both 1x2x3 blocks using only R, U, and L moves without rotating the cube.",
        "lessons": [
          {
            "id": "zz-f2l-left-block",
            "title": "Left Block Construction (L, U moves)",
            "explanation": "Pair and slot pieces into the left side. Zero F/B moves needed because all edges are already oriented.",
            "algorithm": "L U L' U L U2 L'"
          },
          {
            "id": "zz-f2l-right-block",
            "title": "Right Block Construction (R, U moves)",
            "explanation": "Pair and slot pieces into the right side using standard ergonomic right-hand triggers.",
            "algorithm": "R U' R' U' R U2 R'"
          }
        ]
      },
      {
        "id": "zz-coll-set-1",
        "title": "Phase 3a: COLL - Sune Set (6 Cases)",
        "description": "Corners of Last Layer algorithms for the Sune Set (6 Cases) configuration.",
        "lessons": [
          {
            "id": "zz-coll_sune_1",
            "title": "Sune - Anti-Pure",
            "explanation": "COLL algorithm for Sune - Anti-Pure. Solves corner orientation and permutation while preserving the pre-oriented top cross.",
            "algorithm": "R U R' U R U2 R'"
          },
          {
            "id": "zz-coll_sune_2",
            "title": "Sune - Diagonal",
            "explanation": "COLL algorithm for Sune - Diagonal. Solves corner orientation and permutation while preserving the pre-oriented top cross.",
            "algorithm": "F R U R' U' F' R U R' U R U2 R'"
          }
        ]
      },
      {
        "id": "zz-coll-set-2",
        "title": "Phase 3a: COLL - Anti-Sune Set (6 Cases)",
        "description": "Corners of Last Layer algorithms for the Anti-Sune Set (6 Cases) configuration.",
        "lessons": [
          {
            "id": "zz-coll_antisune_1",
            "title": "Anti-Sune - Pure",
            "explanation": "COLL algorithm for Anti-Sune - Pure. Solves corner orientation and permutation while preserving the pre-oriented top cross.",
            "algorithm": "R U2 R' U' R U' R'"
          }
        ]
      },
      {
        "id": "zz-coll-set-3",
        "title": "Phase 3a: COLL - H Set (4 Cases)",
        "description": "Corners of Last Layer algorithms for the H Set (4 Cases) configuration.",
        "lessons": [
          {
            "id": "zz-coll_h_1",
            "title": "H - Columns",
            "explanation": "COLL algorithm for H - Columns. Solves corner orientation and permutation while preserving the pre-oriented top cross.",
            "algorithm": "R U2 R' U' R U R' U' R U' R'"
          }
        ]
      },
      {
        "id": "zz-coll-set-4",
        "title": "Phase 3a: COLL - Pi Set (6 Cases)",
        "description": "Corners of Last Layer algorithms for the Pi Set (6 Cases) configuration.",
        "lessons": [
          {
            "id": "zz-coll_pi_1",
            "title": "Pi - Pure",
            "explanation": "COLL algorithm for Pi - Pure. Solves corner orientation and permutation while preserving the pre-oriented top cross.",
            "algorithm": "F R U R' U' R U R' U' F'"
          }
        ]
      },
      {
        "id": "zz-coll-set-5",
        "title": "Phase 3a: COLL - U Set (6 Cases)",
        "description": "Corners of Last Layer algorithms for the U Set (6 Cases) configuration.",
        "lessons": [
          {
            "id": "zz-coll_u_1",
            "title": "U - Forward Bar",
            "explanation": "COLL algorithm for U - Forward Bar. Solves corner orientation and permutation while preserving the pre-oriented top cross.",
            "algorithm": "R2 D' R U2 R' D R U2 R"
          }
        ]
      },
      {
        "id": "zz-coll-set-6",
        "title": "Phase 3a: COLL - T Set (6 Cases)",
        "description": "Corners of Last Layer algorithms for the T Set (6 Cases) configuration.",
        "lessons": [
          {
            "id": "zz-coll_t_1",
            "title": "T - Rows",
            "explanation": "COLL algorithm for T - Rows. Solves corner orientation and permutation while preserving the pre-oriented top cross.",
            "algorithm": "r U R' U' r' F R F'"
          }
        ]
      },
      {
        "id": "zz-coll-set-7",
        "title": "Phase 3a: COLL - L Set (6 Cases)",
        "description": "Corners of Last Layer algorithms for the L Set (6 Cases) configuration.",
        "lessons": [
          {
            "id": "zz-coll_l_1",
            "title": "L - Pure",
            "explanation": "COLL algorithm for L - Pure. Solves corner orientation and permutation while preserving the pre-oriented top cross.",
            "algorithm": "F' r U R' U' r' F R"
          }
        ]
      },
      {
        "id": "zz-epll-all",
        "title": "Phase 3b: EPLL (Edge Permutation of Last Layer)",
        "description": "Cycle the top layer edges to complete the solve (Ua, Ub, H, Z perms).",
        "lessons": [
          {
            "id": "zz-epll_ua",
            "title": "Ua Perm",
            "explanation": "EPLL algorithm for Ua Perm. Finishes the solve in 1 quick trigger.",
            "algorithm": "R U' R U R U R U' R' U' R2"
          },
          {
            "id": "zz-epll_ub",
            "title": "Ub Perm",
            "explanation": "EPLL algorithm for Ub Perm. Finishes the solve in 1 quick trigger.",
            "algorithm": "R2 U R U R' U' R' U' R' U R'"
          },
          {
            "id": "zz-epll_h",
            "title": "H Perm",
            "explanation": "EPLL algorithm for H Perm. Finishes the solve in 1 quick trigger.",
            "algorithm": "M2 U M2 U2 M2 U M2"
          },
          {
            "id": "zz-epll_z",
            "title": "Z Perm",
            "explanation": "EPLL algorithm for Z Perm. Finishes the solve in 1 quick trigger.",
            "algorithm": "M' U M2 U M2 U M' U2 M2"
          }
        ]
      }
    ]
  }
];
