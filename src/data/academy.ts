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
    description: 'The universal starting point. Learn to solve layer by layer intuitively without complex memory load.',
    progress: 0,
    modules: [
      {
        id: 'daisy',
        title: 'The Daisy & White Cross',
        description: 'Set up your foundation by aligning white edges around the yellow center.',
        lessons: [
          { 
            id: 'b1', 
            title: 'Forming the Daisy', 
            explanation: 'Bring all four white edge pieces to surround the yellow center piece.', 
            algorithm: "R U R' U'",
            difficulty: 'Beginner',
            estimatedTime: '3 min',
            fingerTrickTips: 'Use your right index finger for U moves and right thumb for R resets.'
          },
          { 
            id: 'b2', 
            title: 'Dropping the Cross', 
            explanation: 'Match the side color of each white edge to its center, then rotate down 180 degrees to form the white cross.', 
            algorithm: "F2 R2 L2 B2",
            difficulty: 'Beginner',
            estimatedTime: '4 min',
            fingerTrickTips: 'Double wrist rotations (F2/R2) ensure clean alignment without gripping too tightly.'
          }
        ]
      },
      {
        id: 'first-layer-corners',
        title: 'First Layer Corners',
        description: 'Slot the white corners to complete the first layer.',
        lessons: [
          {
            id: 'b3',
            title: 'Right Trigger Corner Slot',
            explanation: 'Position a white corner under its slot and execute the right trigger (R U R\') to insert.',
            algorithm: "R U R' U'",
            difficulty: 'Beginner',
            estimatedTime: '5 min',
            fingerTrickTips: 'Keep your palm relaxed and flick U with your right index finger.'
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
        id: 'two-look-oll',
        title: '2-Look OLL',
        description: 'Orient the last layer in two simple steps (Edges then Corners).',
        lessons: [
          { 
            id: 'sc1', 
            title: 'Edge Orientation (FURUKAWA)', 
            explanation: 'Orient all top edges to form a yellow cross.', 
            algorithm: "F R U R' U' F'",
            difficulty: 'Intermediate',
            estimatedTime: '5 min',
            fingerTrickTips: 'Push F with your right thumb and perform the sexy move (R U R\' U\') quickly before resetting F\'.'
          },
          { 
            id: 'sc2', 
            title: 'Sune Corner Orientation', 
            explanation: 'Orient corners when one corner is already oriented in the front-left.', 
            algorithm: "R U R' U R U2 R'",
            difficulty: 'Intermediate',
            estimatedTime: '6 min',
            fingerTrickTips: 'Execute R U R\' in one continuous motion, then double-flick U2 with your right index & middle fingers.'
          }
        ]
      },
      {
        id: 'two-look-pll',
        title: '2-Look PLL',
        description: 'Permute corners then permute edges.',
        lessons: [
          { 
            id: 'sc3', 
            title: 'T-Perm Corner Swap', 
            explanation: 'Swap two adjacent corners on the top layer.', 
            algorithm: "R U R' U' R' F R2 U' R' U' R U R' F'",
            difficulty: 'Intermediate',
            estimatedTime: '8 min',
            fingerTrickTips: 'Regrip right thumb on front face before executing R2 U\' R\'.'
          },
          { 
            id: 'sc4', 
            title: 'Ub-Perm Edge Cycle', 
            explanation: 'Cycle three top layer edges clockwise.', 
            algorithm: "R2 U R U R' U' R' U' R' U R'",
            difficulty: 'Intermediate',
            estimatedTime: '6 min',
            fingerTrickTips: 'R2 U can be done seamlessly by rolling your wrist smoothly upward.'
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
    progress: 0,
    modules: [
      {
        id: 'f2l-basics',
        title: 'Intuitive F2L',
        description: 'Solve the first two layers simultaneously.',
        lessons: [
          { 
            id: 'c1', 
            title: 'Basic Insertion (Right)', 
            explanation: 'Insert a paired corner and edge into the front-right slot.', 
            algorithm: "R U R'",
            difficulty: 'Intermediate',
            estimatedTime: '4 min',
            fingerTrickTips: 'Basic 3-move insertion. Execute as a single fluid right-hand stroke.'
          },
          { 
            id: 'c2', 
            title: 'Hide and Pair', 
            explanation: 'Hide the corner, move the edge, and restore to pair them up.', 
            algorithm: "R U R' U' R U R'",
            difficulty: 'Advanced',
            estimatedTime: '7 min',
            fingerTrickTips: 'Maintain homegrip on right hand during the pair sequence.'
          }
        ]
      },
      {
        id: 'pll',
        title: 'PLL Algorithms',
        description: 'Permute the last layer in a single step.',
        lessons: [
          { 
            id: 'c3', 
            title: 'T-Permutation', 
            explanation: 'Swaps two adjacent corners and two opposite edges on the top layer.', 
            algorithm: "R U R' U' R' F R2 U' R' U' R U R' F'",
            difficulty: 'Advanced',
            estimatedTime: '8 min',
            fingerTrickTips: 'Index finger flick for F\' at the end completes the algorithm.'
          },
          { 
            id: 'c4', 
            title: 'Y-Permutation', 
            explanation: 'Swaps two diagonal corners and two adjacent edges.', 
            algorithm: "F R U' R' U' R U R' F' R U R' U' R' F R F'",
            difficulty: 'Advanced',
            estimatedTime: '10 min',
            fingerTrickTips: 'Split into two halves: F (setup) + T-perm variation.'
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
          { 
            id: 'r1', 
            title: 'Left Block Setup', 
            explanation: 'Align the D-L edge and build around it.', 
            algorithm: "L U L' U L U2 L'",
            difficulty: 'Advanced',
            estimatedTime: '6 min',
            fingerTrickTips: 'Flick L moves using your left ring and middle fingers.'
          },
          { 
            id: 'r2', 
            title: 'Right Block Setup', 
            explanation: 'Build the symmetrical 1x2x3 block on the right side.', 
            algorithm: "R U' R' U' R U2 R'",
            difficulty: 'Advanced',
            estimatedTime: '6 min',
            fingerTrickTips: 'Use left index finger for U\' pushes during right block pairs.'
          }
        ]
      },
      {
        id: 'roux-cmll',
        title: 'CMLL & M-Slice (LSE)',
        description: 'Solve top corners and permute the last six edges (LSE) using M-slice moves.',
        lessons: [
          { 
            id: 'r3', 
            title: 'Corner Orientation', 
            explanation: 'Orient last layer corners without disturbing the side blocks.', 
            algorithm: "R U R' U' R' F R F'",
            difficulty: 'Pro',
            estimatedTime: '8 min',
            fingerTrickTips: 'Flick F\' with right index finger while maintaining thumb on front.'
          },
          { 
            id: 'r4', 
            title: 'M-Slice Edge Cycle', 
            explanation: 'Cycle edges using the central M-slice axis.', 
            algorithm: "M2 U M' U2 M U M2",
            difficulty: 'Pro',
            estimatedTime: '10 min',
            fingerTrickTips: 'Use middle ring finger double flick for M2 from the bottom back.'
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
          { 
            id: 'z1', 
            title: 'Edge Orientation (EO)', 
            explanation: 'Orient bad edges to make the rest of the solve completely rotationless.', 
            algorithm: "F R U R' U' F'",
            difficulty: 'Expert',
            estimatedTime: '8 min',
            fingerTrickTips: 'Count bad edges in inspection before launching EO.'
          },
          { 
            id: 'z2', 
            title: 'Line Placement', 
            explanation: 'Align the front-bottom and back-bottom line edges.', 
            algorithm: "D R2 L2 D'",
            difficulty: 'Expert',
            estimatedTime: '7 min',
            fingerTrickTips: 'Use left ring finger to flick D and D\'.'
          }
        ]
      },
      {
        id: 'zz-f2l',
        title: 'Rotationless F2L & LL',
        description: 'Complete the first two layers using only U, R, L moves, then finish the last layer.',
        lessons: [
          { 
            id: 'z3', 
            title: 'Right Block Slotting', 
            explanation: 'Solve right side slots rotation-free using U/R moves.', 
            algorithm: "R U R' U' R U R'",
            difficulty: 'Expert',
            estimatedTime: '6 min',
            fingerTrickTips: 'Maintain strict homegrip as no cube rotations are needed.'
          },
          { 
            id: 'z4', 
            title: 'Left Block Slotting', 
            explanation: 'Solve left side slots rotation-free using U/L moves.', 
            algorithm: "L U' L' U L U' L'",
            difficulty: 'Expert',
            estimatedTime: '6 min',
            fingerTrickTips: 'Left hand mirror of the right block insertion.'
          }
        ]
      }
    ]
  }
];