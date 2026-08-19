export interface Lesson {
  id: string;
  title: string;
  explanation: string;
  algorithm: string;
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
    description: 'The universal starting point. Learn to solve layer by layer intuitively.',
    progress: 100,
    modules: [
      {
        id: 'daisy',
        title: 'The Daisy & White Cross',
        description: 'Set up your foundation.',
        lessons: [
          { id: 'b1', title: 'Forming the Daisy', explanation: 'Bring all white edge pieces to the yellow center.', algorithm: "R U R' U'" },
          { id: 'b2', title: 'Dropping the Cross', explanation: 'Match the edge colors to centers and rotate down.', algorithm: "F2 R2 L2 B2" }
        ]
      }
    ]
  },
  {
    id: 'simplified-cfop',
    title: 'Simplified CFOP',
    badge: 'Intermediate',
    description: 'An easier version of CFOP using 4-Look Last Layer (4LLL) to transition smoothly from beginner.',
    progress: 15,
    modules: [
      {
        id: 'two-look-oll',
        title: '2-Look OLL',
        description: 'Orient the last layer in two simple steps.',
        lessons: [
          { id: 'sc1', title: 'Edge Orientation', explanation: 'Orient all top edges to form a yellow cross.', algorithm: "F R U R' U' F'" },
          { id: 'sc2', title: 'Sune Corner Orientation', explanation: 'Orient corners when one corner is already oriented.', algorithm: "R U R' U R U2 R'" }
        ]
      },
      {
        id: 'two-look-pll',
        title: '2-Look PLL',
        description: 'Permute corners then permute edges.',
        lessons: [
          { id: 'sc3', title: 'T-Perm Corner Swap', explanation: 'Swap two adjacent corners on the top layer.', algorithm: "R U R' U' R' F R2 U' R' U' R U R' F'" },
          { id: 'sc4', title: 'Ub-Perm Edge Cycle', explanation: 'Cycle three top layer edges clockwise.', algorithm: "R2 U R U R' U' R' U' R' U R'" }
        ]
      }
    ]
  },
  {
    id: 'cfop',
    title: 'CFOP Mastery',
    badge: 'Advanced',
    description: 'The world\'s most popular speedcubing method (Cross, F2L, OLL, PLL).',
    progress: 34,
    modules: [
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
        id: 'roux-blocks',
        title: 'First Two Blocks',
        description: 'Build 1x2x3 blocks on the left and right sides without affecting other edges.',
        lessons: [
          { id: 'r1', title: 'Left Block Setup', explanation: 'Align the D-L edge and build around it.', algorithm: "L U L' U L U2 L'" },
          { id: 'r2', title: 'Right Block Setup', explanation: 'Build the symmetrical 1x2x3 block on the right side.', algorithm: "R U' R' U' R U2 R'" }
        ]
      },
      {
        id: 'roux-cmll',
        title: 'CMLL & M-Slice (LSE)',
        description: 'Solve top corners and permute the last six edges (LSE) using M-slice moves.',
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
        id: 'zz-eoline',
        title: 'EOLine Setup',
        description: 'Orient all edges (EO) and place the DF and DB line edges (Line).',
        lessons: [
          { id: 'z1', title: 'Edge Orientation (EO)', explanation: 'Orient bad edges to make the rest of the solve completely rotationless.', algorithm: "F R U R' U' F'" },
          { id: 'z2', title: 'Line Placement', explanation: 'Align the front-bottom and back-bottom line edges.', algorithm: "D R2 L2 D'" }
        ]
      },
      {
        id: 'zz-f2l',
        title: 'Rotationless F2L & LL',
        description: 'Complete the first two layers using only U, R, L moves, then finish the last layer.',
        lessons: [
          { id: 'z3', title: 'Right Block Slotting', explanation: 'Solve right side slots rotation-free using U/R moves.', algorithm: "R U R' U' R U R'" },
          { id: 'z4', title: 'Left Block Slotting', explanation: 'Solve left side slots rotation-free using U/L moves.', algorithm: "L U' L' U L U' L'" }
        ]
      }
    ]
  }
];