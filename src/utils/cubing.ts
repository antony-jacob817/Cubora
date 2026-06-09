// --- SCRAMBLE GENERATOR ---
const MOVES = ['U', 'D', 'L', 'R', 'F', 'B'];
const MODIFIERS = ['', "'", '2'];

export function generateScramble(length = 21): string {
  const scramble: string[] = [];
  let lastMove = '';
  let secondLastMove = '';

  for (let i = 0; i < length; i++) {
    let randomMove;
    let isParallel;
    
    do {
      randomMove = MOVES[Math.floor(Math.random() * MOVES.length)];
      // Check for parallel moves (e.g., R L R) to avoid redundant sequences
      isParallel = (
        (randomMove === 'U' && lastMove === 'D') || (randomMove === 'D' && lastMove === 'U') ||
        (randomMove === 'R' && lastMove === 'L') || (randomMove === 'L' && lastMove === 'R') ||
        (randomMove === 'F' && lastMove === 'B') || (randomMove === 'B' && lastMove === 'F')
      );
    } while (
      randomMove === lastMove || 
      (isParallel && randomMove === secondLastMove)
    );

    const randomModifier = MODIFIERS[Math.floor(Math.random() * MODIFIERS.length)];
    scramble.push(randomMove + randomModifier);
    
    secondLastMove = lastMove;
    lastMove = randomMove;
  }

  return scramble.join(' ');
}

// --- STATS CALCULATOR ---
export function calculateAverage(times: number[], count: number): number | null {
  if (times.length < count) return null;
  
  // Get the most recent 'count' times
  const recentTimes = times.slice(0, count);
  
  // Sort to find best and worst
  const sorted = [...recentTimes].sort((a, b) => a - b);
  
  // Drop best (index 0) and worst (index length - 1)
  const trimmed = sorted.slice(1, sorted.length - 1);
  
  // Calculate mean
  const sum = trimmed.reduce((acc, curr) => acc + curr, 0);
  return sum / trimmed.length;
}

export function formatTime(timeMs: number): string {
    if (!timeMs || timeMs === 0) return "0.000";
    
    const totalSeconds = timeMs / 1000;
    
    // If under a minute, just show the seconds with 3 decimals (e.g. "0.770")
    if (totalSeconds < 60) {
        return totalSeconds.toFixed(3);
    }
    
    // If over a minute, format as M:SS.MMM
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = (totalSeconds % 60).toFixed(3);
    
    // padStart(6, '0') ensures single-digit seconds get a leading zero (e.g. 1:05.123)
    return `${minutes}:${seconds.padStart(6, '0')}`;
}