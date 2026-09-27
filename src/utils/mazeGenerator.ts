// Graph representation of beach stones with strict physical stepping proximity
// Prevents any large jumps across the screen so every letter step is immediate and clear.

export interface StoneSpot {
  id: string;
  left: number;
  top: number;
  width: number;
  height: number;
}

export const BASE_STONE_SPOTS: StoneSpot[] = [
  // Upper cliff area
  { id: 's1', left: 27.6, top: 32.8, width: 5.4, height: 9.6 },
  { id: 's2', left: 31.6, top: 37.0, width: 5.4, height: 9.5 },
  // Upper middle shelf
  { id: 's3', left: 18.3, top: 51.2, width: 5.4, height: 9.6 },
  { id: 's4', left: 22.3, top: 48.0, width: 5.2, height: 9.2 },
  { id: 's5', left: 26.4, top: 46.5, width: 5.3, height: 9.4 },
  { id: 's6', left: 30.6, top: 44.5, width: 5.4, height: 9.5 },
  // Natural stone steps carved in the cliff between s3/s4 and s7 (closing the previous gap!)
  { id: 'st1', left: 22.5, top: 55.5, width: 5.2, height: 9.2 },
  { id: 'st2', left: 26.5, top: 59.8, width: 5.3, height: 9.4 },
  // Lower beach & shoreline path leading directly to the chest
  { id: 's7', left: 30.2, top: 64.0, width: 5.6, height: 10.0 },
  { id: 's8', left: 37.3, top: 66.0, width: 5.6, height: 10.0 },
  { id: 's9', left: 44.0, top: 63.3, width: 5.6, height: 10.0 },
  { id: 's10', left: 50.8, top: 60.6, width: 5.4, height: 9.7 },
  { id: 's11', left: 56.8, top: 60.1, width: 5.3, height: 9.4 },
  { id: 's12', left: 61.1, top: 60.4, width: 5.3, height: 9.4 }, // Front of treasure chest!
  // Upper dunes & beach cove
  { id: 's13', left: 40.0, top: 29.0, width: 5.4, height: 9.5 },
  { id: 's14', left: 46.2, top: 31.8, width: 5.2, height: 9.2 },
  { id: 's15', left: 52.3, top: 35.8, width: 5.2, height: 9.2 },
  { id: 's16', left: 58.0, top: 38.0, width: 5.2, height: 9.2 },
  { id: 's17', left: 39.8, top: 39.2, width: 5.2, height: 9.2 },
  { id: 's18', left: 47.0, top: 39.6, width: 5.0, height: 9.0 },
  { id: 's19', left: 43.8, top: 46.2, width: 5.2, height: 9.2 },
  { id: 's20', left: 50.8, top: 45.5, width: 5.2, height: 9.2 },
  { id: 's21', left: 55.4, top: 48.0, width: 5.0, height: 9.0 },
  { id: 's22', left: 36.6, top: 46.5, width: 4.8, height: 8.8 },
  { id: 's23', left: 39.4, top: 51.5, width: 5.0, height: 9.0 },
  // Bottom beach sand
  { id: 's24', left: 38.8, top: 77.2, width: 5.2, height: 9.2 },
  { id: 's25', left: 25.5, top: 76.5, width: 5.2, height: 9.2 },
  { id: 's26', left: 17.5, top: 73.0, width: 5.2, height: 9.2 },
  { id: 's27', left: 24.2, top: 88.5, width: 5.4, height: 9.5 },
  { id: 's28', left: 32.5, top: 86.8, width: 5.4, height: 9.5 },
  // Far left shoreline rocks
  { id: 's29', left: 11.2, top: 82.2, width: 5.6, height: 9.8 },
  { id: 's30', left: 5.8, top: 72.8, width: 5.6, height: 9.8 },
  { id: 's31', left: 12.8, top: 65.5, width: 5.4, height: 9.5 },
  { id: 's32', left: 5.6, top: 56.5, width: 5.4, height: 9.5 },
  { id: 's33', left: 11.6, top: 52.5, width: 5.4, height: 9.5 },
  { id: 's34', left: 6.2, top: 43.5, width: 5.5, height: 9.6 },
  { id: 's35', left: 13.0, top: 43.0, width: 5.5, height: 9.6 },
  { id: 's36', left: 18.6, top: 38.8, width: 5.4, height: 9.5 },
];

// Euclidean distance accounting for 16:9 widescreen aspect ratio
function calcDistance(a: StoneSpot, b: StoneSpot): number {
  const dx = (a.left - b.left) * (16 / 9);
  const dy = a.top - b.top;
  return Math.hypot(dx, dy);
}

// Strict maximum distance between consecutive stones (prevents large gaps)
const MAX_STEP_DISTANCE = 13.0;

// Build strict nearest-neighbor graph
const STRICT_ADJACENCY: Record<string, string[]> = {};
for (const spot of BASE_STONE_SPOTS) {
  STRICT_ADJACENCY[spot.id] = BASE_STONE_SPOTS
    .filter((other) => other.id !== spot.id && calcDistance(spot, other) <= MAX_STEP_DISTANCE)
    .sort((x, y) => calcDistance(spot, x) - calcDistance(spot, y))
    .map((o) => o.id);
}

// Good starting stones on the upper cliff and beach borders
export const START_SPOTS = ['s1', 's13', 's36', 's14', 's15', 's4', 's35'];

// Curated high-quality stepping trails with tight inter-stone spacing (distance <= 12.8 everywhere)
const CURATED_PATHS: string[][] = [
  // 1. Classic Steps Trail: down the carved stairs to the lower shoreline
  ['s1', 's2', 's6', 's5', 's4', 's3', 'st1', 'st2', 's7', 's8', 's9', 's10', 's11', 's12'],
  // 2. Upper Cliff to Dunes Trail
  ['s1', 's2', 's6', 's22', 's23', 's19', 's20', 's21', 's11', 's12'],
  // 3. Central S-Curve: upper beach through center dunes
  ['s13', 's14', 's18', 's19', 's20', 's21', 's11', 's12'],
  // 4. Middle Shelf Zigzag
  ['s36', 's4', 's5', 's6', 's22', 's23', 's19', 's20', 's21', 's11', 's12'],
  // 5. Upper Ridge Cove
  ['s15', 's16', 's21', 's20', 's19', 's23', 's22', 's6', 's2', 's1'], // will reverse to end at s12 if needed
  // 6. Direct Dune Crest to Chest
  ['s14', 's15', 's16', 's21', 's11', 's12'],
  // 7. Staircase Shorter Route
  ['s36', 's3', 'st1', 'st2', 's7', 's8', 's9', 's10', 's11', 's12'],
  // 8. Central Island Trail
  ['s13', 's17', 's19', 's18', 's20', 's21', 's11', 's12'],
];

const TURKISH_ALPHABET = [
  'A', 'B', 'C', 'Ç', 'D', 'E', 'F', 'G', 'Ğ', 'H',
  'I', 'İ', 'J', 'K', 'L', 'M', 'N', 'O', 'Ö', 'P',
  'R', 'S', 'Ş', 'T', 'U', 'Ü', 'V', 'Y', 'Z',
];

/**
 * Randomly generates a continuous connected stone-to-stone path ending at s12 (chest).
 * Every single step strictly obeys MAX_STEP_DISTANCE <= 13.0, ensuring immediate proximity.
 */
export function generateRandomConnectedPath(
  minLen: number = 9,
  maxLen: number = 13
): string[] {
  // 60% of the time, generate a brand new random tight DFS path
  // 40% of the time, pick one of the curated tight paths
  if (Math.random() < 0.65) {
    const starts = [...START_SPOTS].sort(() => Math.random() - 0.5);

    for (const start of starts) {
      const visited = new Set<string>([start]);
      const path: string[] = [start];

      const result = dfsFindPath(start, 's12', visited, path, minLen, maxLen);
      if (result && result.length >= minLen && result.length <= maxLen) {
        return result;
      }
    }
  }

  // Pick a random curated valid path ending at s12
  const validCurated = CURATED_PATHS.filter((p) => p[p.length - 1] === 's12');
  const picked = validCurated[Math.floor(Math.random() * validCurated.length)];
  return [...picked];
}

function dfsFindPath(
  current: string,
  target: string,
  visited: Set<string>,
  currentPath: string[],
  minLen: number,
  maxLen: number
): string[] | null {
  if (current === target) {
    if (currentPath.length >= minLen && currentPath.length <= maxLen) {
      return [...currentPath];
    }
    return null;
  }

  if (currentPath.length >= maxLen) {
    return null;
  }

  // Get strictly close neighbors only and shuffle for variety
  const neighbors = (STRICT_ADJACENCY[current] || []).filter((n) => !visited.has(n));
  neighbors.sort(() => Math.random() - 0.5);

  // If path is long enough, bias toward the chest (s12)
  if (currentPath.length >= minLen - 1) {
    neighbors.sort((a, b) => {
      const aIsTarget = a === target ? -1 : 0;
      const bIsTarget = b === target ? -1 : 0;
      return aIsTarget - bIsTarget;
    });
  }

  for (const next of neighbors) {
    visited.add(next);
    currentPath.push(next);

    const found = dfsFindPath(next, target, visited, currentPath, minLen, maxLen);
    if (found) {
      return found;
    }

    currentPath.pop();
    visited.delete(next);
  }

  return null;
}

/**
 * Builds nodes for a given target letter by generating a tightly connected path and
 * filling non-path stones with distinct distractor letters.
 */
export function buildRandomizedLevelNodes(targetLetter: string) {
  const path = generateRandomConnectedPath(10, 13);

  // Distractors excluding target letter
  const availableDistractors = TURKISH_ALPHABET.filter((l) => l !== targetLetter);

  return BASE_STONE_SPOTS.map((spot) => {
    const targetIdx = path.indexOf(spot.id);
    const isTarget = targetIdx !== -1;

    let letter: string;
    if (isTarget) {
      letter = targetLetter;
    } else {
      const randIdx = Math.floor(Math.random() * availableDistractors.length);
      letter = availableDistractors[randIdx];
    }

    return {
      id: `${targetLetter.toLowerCase()}-${spot.id}`,
      letter,
      left: spot.left,
      top: spot.top,
      width: spot.width,
      height: spot.height,
      isTarget,
      orderIndex: isTarget ? targetIdx + 1 : undefined,
    };
  });
}
