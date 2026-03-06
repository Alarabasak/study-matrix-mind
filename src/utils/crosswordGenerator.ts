import { Cell, ClueCell, LetterCell, PlacedWord, WordItem, Direction, ClueEntry, PuzzleAnalytics } from '@/types/crossword';

// Normalize Turkish text for puzzle: remove spaces, punctuation, keep Turkish chars
export function normalizeWord(text: string): string {
  return text
    .toUpperCase()
    .replace(/[\s\-'.]/g, '')
    .replace(/[^A-ZÇĞİÖŞÜ]/g, '');
}

// Seeded PRNG for deterministic generation
class SeededRandom {
  private seed: number;
  constructor(seed: number) {
    this.seed = seed;
  }
  next(): number {
    this.seed = (this.seed * 16807 + 0) % 2147483647;
    return this.seed / 2147483647;
  }
  nextInt(max: number): number {
    return Math.floor(this.next() * max);
  }
  shuffle<T>(arr: T[]): T[] {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = this.nextInt(i + 1);
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
}

function parseGridSize(size: string): { rows: number; cols: number } {
  const [cols, rows] = size.split('x').map(Number);
  return { rows, cols };
}

function getGridSizeFromSeed(seed: number): string {
  const sizes = ['12x12', '12x16', '16x12'];
  return sizes[seed % 3];
}

function canPlaceWord(
  grid: Cell[][],
  word: string,
  startRow: number,
  startCol: number,
  direction: Direction,
  rows: number,
  cols: number,
  usedWords: Set<string>
): boolean {
  if (usedWords.has(word)) return false;
  if (word.length < 3 || word.length > 15) return false;

  const dr = direction === 'down' ? 1 : 0;
  const dc = direction === 'right' ? 1 : 0;

  // Clue cell position
  const clueRow = startRow - dr;
  const clueCol = startCol - dc;
  if (clueRow < 0 || clueCol < 0 || clueRow >= rows || clueCol >= cols) return false;

  const clueCell = grid[clueRow][clueCol];
  if (clueCell.type === 'letter') return false;
  if (clueCell.type === 'clue') {
    const cc = clueCell as ClueCell;
    if (cc.clues.some(c => c.direction === direction)) return false;
    if (cc.clues.length >= 2) return false;
  }

  // Word must fit in grid
  const endRow = startRow + dr * (word.length - 1);
  const endCol = startCol + dc * (word.length - 1);
  if (endRow >= rows || endCol >= cols) return false;

  // Check each letter position
  let hasIntersection = false;
  for (let i = 0; i < word.length; i++) {
    const r = startRow + dr * i;
    const c = startCol + dc * i;
    const cell = grid[r][c];

    if (cell.type === 'clue') return false;
    if (cell.type === 'letter') {
      if ((cell as LetterCell).expectedLetter !== word[i]) return false;
      hasIntersection = true;
    }
  }

  // Check cell after word end is not a letter (to prevent word merging)
  const afterRow = endRow + dr;
  const afterCol = endCol + dc;
  if (afterRow < rows && afterCol < cols && grid[afterRow][afterCol].type === 'letter') {
    return false;
  }

  return true;
}

function addClueToCell(grid: Cell[][], row: number, col: number, clue: ClueEntry): void {
  const cell = grid[row][col];
  if (cell.type === 'clue') {
    (cell as ClueCell).clues.push(clue);
  } else {
    grid[row][col] = { type: 'clue', clues: [clue] };
  }
}

function placeWord(
  grid: Cell[][],
  word: string,
  startRow: number,
  startCol: number,
  direction: Direction,
  wordIndex: number,
  clueText: string
): void {
  const dr = direction === 'down' ? 1 : 0;
  const dc = direction === 'right' ? 1 : 0;
  const clueRow = startRow - dr;
  const clueCol = startCol - dc;

  addClueToCell(grid, clueRow, clueCol, {
    text: clueText,
    direction,
    wordIndex,
  });

  for (let i = 0; i < word.length; i++) {
    const r = startRow + dr * i;
    const c = startCol + dc * i;
    const existing = grid[r][c];
    if (existing.type === 'letter') {
      (existing as LetterCell).wordIndices.push(wordIndex);
    } else {
      grid[r][c] = {
        type: 'letter',
        expectedLetter: word[i],
        userLetter: '',
        wordIndices: [wordIndex],
        isRevealed: false,
      };
    }
  }
}

// Index words by length for fast lookup
function indexByLength(words: WordItem[]): Map<number, WordItem[]> {
  const map = new Map<number, WordItem[]>();
  for (const w of words) {
    const normalized = normalizeWord(w.word);
    const len = normalized.length;
    if (len < 3 || len > 15) continue;
    if (!map.has(len)) map.set(len, []);
    map.get(len)!.push(w);
  }
  return map;
}

export interface GenerationResult {
  grid: Cell[][];
  placedWords: PlacedWord[];
  gridSize: string;
  analytics: PuzzleAnalytics;
  seed: number;
}

export function generateCrossword(
  words: WordItem[],
  seed: number
): GenerationResult {
  const startTime = performance.now();
  let backtrackCount = 0;

  const gridSize = getGridSizeFromSeed(seed);
  const { rows, cols } = parseGridSize(gridSize);
  const rng = new SeededRandom(seed);

  // Initialize grid with block cells
  const grid: Cell[][] = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, (): Cell => ({ type: 'block' }))
  );

  const placedWords: PlacedWord[] = [];
  const usedWords = new Set<string>();
  const wordsByLength = indexByLength(words);

  // Shuffle all candidates by seed
  const allCandidates = rng.shuffle(words.filter(w => {
    const n = normalizeWord(w.word);
    return n.length >= 3 && n.length <= 15;
  }));

  // Remove duplicates
  const seen = new Set<string>();
  const uniqueCandidates = allCandidates.filter(w => {
    const n = normalizeWord(w.word);
    if (seen.has(n)) return false;
    seen.add(n);
    return true;
  });

  let wordIndex = 0;

  // Place first word
  if (uniqueCandidates.length > 0) {
    const firstWord = uniqueCandidates[0];
    const word = normalizeWord(firstWord.word);
    const direction: Direction = rng.next() > 0.5 ? 'right' : 'down';
    const dr = direction === 'down' ? 1 : 0;
    const dc = direction === 'right' ? 1 : 0;
    const startRow = 1 + (direction === 'down' ? 0 : rng.nextInt(Math.max(1, rows - word.length - 2)));
    const startCol = 1 + (direction === 'right' ? 0 : rng.nextInt(Math.max(1, cols - word.length - 2)));

    if (startRow + dr * (word.length - 1) < rows && startCol + dc * (word.length - 1) < cols) {
      placeWord(grid, word, startRow, startCol, direction, wordIndex, firstWord.clue);
      placedWords.push({
        word, clue: firstWord.clue,
        startRow, startCol,
        clueRow: startRow - dr, clueCol: startCol - dc,
        direction, index: wordIndex,
        category: firstWord.category, difficulty: firstWord.difficulty,
      });
      usedWords.add(word);
      wordIndex++;
    }
  }

  // Try to place remaining words via intersection
  for (let ci = 1; ci < uniqueCandidates.length && placedWords.length < 20; ci++) {
    const candidate = uniqueCandidates[ci];
    const word = normalizeWord(candidate.word);
    if (usedWords.has(word)) continue;

    let placed = false;

    // Try intersecting with existing placed words
    const shuffledPlaced = rng.shuffle([...placedWords]);
    for (const pw of shuffledPlaced) {
      if (placed) break;
      for (let pi = 0; pi < pw.word.length; pi++) {
        if (placed) break;
        const existingLetter = pw.word[pi];

        for (let ni = 0; ni < word.length; ni++) {
          if (placed) break;
          if (word[ni] !== existingLetter) continue;

          const dr = pw.direction === 'down' ? 1 : 0;
          const dc = pw.direction === 'right' ? 1 : 0;
          const intersectRow = pw.startRow + dr * pi;
          const intersectCol = pw.startCol + dc * pi;

          const newDir: Direction = pw.direction === 'right' ? 'down' : 'right';
          const ndr = newDir === 'down' ? 1 : 0;
          const ndc = newDir === 'right' ? 1 : 0;

          const newStartRow = intersectRow - ndr * ni;
          const newStartCol = intersectCol - ndc * ni;

          if (canPlaceWord(grid, word, newStartRow, newStartCol, newDir, rows, cols, usedWords)) {
            placeWord(grid, word, newStartRow, newStartCol, newDir, wordIndex, candidate.clue);
            placedWords.push({
              word, clue: candidate.clue,
              startRow: newStartRow, startCol: newStartCol,
              clueRow: newStartRow - ndr, clueCol: newStartCol - ndc,
              direction: newDir, index: wordIndex,
              category: candidate.category, difficulty: candidate.difficulty,
            });
            usedWords.add(word);
            wordIndex++;
            placed = true;
          } else {
            backtrackCount++;
          }
        }
      }
    }

    // Random placement fallback (only if we have few words)
    if (!placed && placedWords.length < 8) {
      const directions: Direction[] = rng.shuffle(['right', 'down'] as Direction[]);
      for (const dir of directions) {
        if (placed) break;
        const dr = dir === 'down' ? 1 : 0;
        const dc = dir === 'right' ? 1 : 0;

        for (let attempt = 0; attempt < 40; attempt++) {
          const maxStartRow = rows - word.length * dr - 1;
          const maxStartCol = cols - word.length * dc - 1;
          if (maxStartRow < 1 || maxStartCol < 1) break;

          const sr = 1 + rng.nextInt(maxStartRow);
          const sc = 1 + rng.nextInt(maxStartCol);

          if (canPlaceWord(grid, word, sr, sc, dir, rows, cols, usedWords)) {
            placeWord(grid, word, sr, sc, dir, wordIndex, candidate.clue);
            placedWords.push({
              word, clue: candidate.clue,
              startRow: sr, startCol: sc,
              clueRow: sr - dr, clueCol: sc - dc,
              direction: dir, index: wordIndex,
              category: candidate.category, difficulty: candidate.difficulty,
            });
            usedWords.add(word);
            wordIndex++;
            placed = true;
            break;
          } else {
            backtrackCount++;
          }
        }
      }
    }
  }

  // Convert remaining block cells to empty clue cells
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c].type === 'block') {
        grid[r][c] = { type: 'clue', clues: [] } as ClueCell;
      }
    }
  }

  // Crop grid to content bounding box (eliminate empty outer cells)
  const cropped = cropGrid(grid, placedWords);

  // Calculate analytics
  const genTime = performance.now() - startTime;
  const totalIntersections = cropped.placedWords.reduce((sum, pw) => {
    let count = 0;
    const dr = pw.direction === 'down' ? 1 : 0;
    const dc = pw.direction === 'right' ? 1 : 0;
    for (let i = 0; i < pw.word.length; i++) {
      const cell = cropped.grid[pw.startRow + dr * i][pw.startCol + dc * i] as LetterCell;
      if (cell.wordIndices.length > 1) count++;
    }
    return sum + count;
  }, 0);

  const avgWordLength = cropped.placedWords.length > 0
    ? cropped.placedWords.reduce((s, w) => s + w.word.length, 0) / cropped.placedWords.length
    : 0;

  const avgIntersections = cropped.placedWords.length > 0
    ? totalIntersections / cropped.placedWords.length
    : 0;

  const avgDifficulty = cropped.placedWords.length > 0
    ? cropped.placedWords.reduce((s, w) => s + w.difficulty, 0) / cropped.placedWords.length
    : 0;

  const croppedGridSize = `${cropped.grid[0]?.length || 0}x${cropped.grid.length}`;

  const analytics: PuzzleAnalytics = {
    generation_time_ms: Math.round(genTime),
    slot_count: cropped.placedWords.length,
    avg_word_length: Math.round(avgWordLength * 10) / 10,
    avg_intersection_count: Math.round(avgIntersections * 10) / 10,
    backtrack_count: backtrackCount,
    puzzle_score: Math.round((avgWordLength + avgIntersections + avgDifficulty) * 10) / 10,
    seed,
    gridSize: croppedGridSize,
  };

  return { grid: cropped.grid, placedWords: cropped.placedWords, gridSize: croppedGridSize, analytics, seed };
}

function cropGrid(grid: Cell[][], placedWords: PlacedWord[]): { grid: Cell[][], placedWords: PlacedWord[], rows: number, cols: number } {
  if (placedWords.length === 0) return { grid, placedWords, rows: grid.length, cols: grid[0]?.length || 0 };

  let minRow = Infinity, maxRow = -Infinity, minCol = Infinity, maxCol = -Infinity;

  for (const pw of placedWords) {
    minRow = Math.min(minRow, pw.clueRow);
    minCol = Math.min(minCol, pw.clueCol);
    const dr = pw.direction === 'down' ? 1 : 0;
    const dc = pw.direction === 'right' ? 1 : 0;
    maxRow = Math.max(maxRow, pw.startRow + dr * (pw.word.length - 1));
    maxCol = Math.max(maxCol, pw.startCol + dc * (pw.word.length - 1));
  }

  const newGrid: Cell[][] = [];
  for (let r = minRow; r <= maxRow; r++) {
    const row: Cell[] = [];
    for (let c = minCol; c <= maxCol; c++) {
      row.push(grid[r][c]);
    }
    newGrid.push(row);
  }

  const adjustedWords = placedWords.map(pw => ({
    ...pw,
    startRow: pw.startRow - minRow,
    startCol: pw.startCol - minCol,
    clueRow: pw.clueRow - minRow,
    clueCol: pw.clueCol - minCol,
  }));

  return { grid: newGrid, placedWords: adjustedWords, rows: maxRow - minRow + 1, cols: maxCol - minCol + 1 };
}
