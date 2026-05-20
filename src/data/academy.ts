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
        id: 'blocks',
        title: 'First Two Blocks',
        description: 'Build 1x2x3 blocks on the left and right.',
        lessons: [
          { id: 'r1', title: 'Left Block Setup', explanation: 'Align the D-L edge and build around it.', algorithm: "L U L' U L U2 L'" }
        ]
      }
    ]
  }
];