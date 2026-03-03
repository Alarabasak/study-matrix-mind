import { Cell, ClueCell, LetterCell, PlacedWord, QuestionItem, Direction, ClueEntry } from '@/types/crossword';

function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function parseGridSize(size: string): { rows: number; cols: number } {
  const [cols, rows] = size.split('x').map(Number);
  return { rows, cols };
}

function canPlaceWord(
  grid: Cell[][],
  word: string,
  startRow: number,
  startCol: number,
  direction: Direction,
  rows: number,
  cols: number
): boolean {
  const dr = direction === 'down' ? 1 : 0;
  const dc = direction === 'right' ? 1 : 0;

  // Clue cell position (one before the word)
  const clueRow = startRow - dr;
  const clueCol = startCol - dc;
  if (clueRow < 0 || clueCol < 0 || clueRow >= rows || clueCol >= cols) return false;

  const clueCell = grid[clueRow][clueCol];
  // Clue cell must be a block (empty) or an existing clue without this direction
  if (clueCell.type === 'letter') return false;
  if (clueCell.type === 'clue') {
    const cc = clueCell as ClueCell;
    if (cc.clues.some(c => c.direction === direction)) return false;
    if (cc.clues.length >= 2) return false;
  }

  // Check word fits in grid
  const endRow = startRow + dr * (word.length - 1);
  const endCol = startCol + dc * (word.length - 1);
  if (endRow >= rows || endCol >= cols) return false;

  // Check each letter position
  for (let i = 0; i < word.length; i++) {
    const r = startRow + dr * i;
    const c = startCol + dc * i;
    const cell = grid[r][c];

    if (cell.type === 'clue') return false;
    if (cell.type === 'letter') {
      if ((cell as LetterCell).expectedLetter !== word[i]) return false;
    }
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

export function generateCrossword(
  questions: QuestionItem[],
  gridSize: string
): { grid: Cell[][]; placedWords: PlacedWord[] } {
  const { rows, cols } = parseGridSize(gridSize);

  // Initialize grid with block cells
  const grid: Cell[][] = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, (): Cell => ({ type: 'block' }))
  );

  const placedWords: PlacedWord[] = [];
  const shuffled = shuffleArray(questions);

  // Filter valid, unique answers
  const seen = new Set<string>();
  const uniqueQuestions = shuffled.filter(q => {
    const answer = q.answer.toUpperCase();
    if (seen.has(answer)) return false;
    if (answer.length + 1 > Math.max(rows, cols) || answer.length < 2) return false;
    seen.add(answer);
    return true;
  });

  let wordIndex = 0;

  for (const q of uniqueQuestions) {
    const word = q.answer.toUpperCase();
    let placed = false;

    // First word: place near top-left
    if (placedWords.length === 0) {
      const startRow = 1;
      const startCol = 1;
      if (startCol + word.length <= cols && startRow < rows) {
        addClueToCell(grid, startRow, 0, {
          text: q.question,
          direction: 'right',
          wordIndex,
        });

        for (let i = 0; i < word.length; i++) {
          grid[startRow][startCol + i] = {
            type: 'letter',
            expectedLetter: word[i],
            userLetter: '',
            wordIndices: [wordIndex],
            isRevealed: false,
          };
        }

        placedWords.push({
          question: q.question, answer: word,
          startRow, startCol, clueRow: startRow, clueCol: 0,
          direction: 'right', index: wordIndex,
        });
        wordIndex++;
        placed = true;
      }
      if (placed) continue;
    }

    // Try to intersect with existing words
    for (const pw of shuffleArray([...placedWords])) {
      if (placed) break;
      for (let pi = 0; pi < pw.answer.length; pi++) {
        if (placed) break;
        const existingLetter = pw.answer[pi];

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

          if (canPlaceWord(grid, word, newStartRow, newStartCol, newDir, rows, cols)) {
            const clueRow = newStartRow - ndr;
            const clueCol = newStartCol - ndc;

            addClueToCell(grid, clueRow, clueCol, {
              text: q.question,
              direction: newDir,
              wordIndex,
            });

            for (let i = 0; i < word.length; i++) {
              const r = newStartRow + ndr * i;
              const c = newStartCol + ndc * i;
              const existing = grid[r][c];
              if (existing.type === 'letter') {
                (existing as LetterCell).wordIndices.push(wordIndex);
              } else {
                grid[r][c] = {
                  type: 'letter', expectedLetter: word[i],
                  userLetter: '', wordIndices: [wordIndex], isRevealed: false,
                };
              }
            }

            placedWords.push({
              question: q.question, answer: word,
              startRow: newStartRow, startCol: newStartCol,
              clueRow, clueCol, direction: newDir, index: wordIndex,
            });
            wordIndex++;
            placed = true;
          }
        }
      }
    }

    // Random placement fallback
    if (!placed && placedWords.length < 20) {
      const directions: Direction[] = shuffleArray(['right', 'down'] as Direction[]);
      for (const dir of directions) {
        if (placed) break;
        const dr = dir === 'down' ? 1 : 0;
        const dc = dir === 'right' ? 1 : 0;

        for (let attempt = 0; attempt < 50; attempt++) {
          const sr = Math.floor(Math.random() * (rows - word.length * dr - 1)) + 1;
          const sc = Math.floor(Math.random() * (cols - word.length * dc - 1)) + 1;

          if (canPlaceWord(grid, word, sr, sc, dir, rows, cols)) {
            const clueRow = sr - dr;
            const clueCol = sc - dc;

            addClueToCell(grid, clueRow, clueCol, {
              text: q.question, direction: dir, wordIndex,
            });

            for (let i = 0; i < word.length; i++) {
              const r = sr + dr * i;
              const c = sc + dc * i;
              const existing = grid[r][c];
              if (existing.type === 'letter') {
                (existing as LetterCell).wordIndices.push(wordIndex);
              } else {
                grid[r][c] = {
                  type: 'letter', expectedLetter: word[i],
                  userLetter: '', wordIndices: [wordIndex], isRevealed: false,
                };
              }
            }

            placedWords.push({
              question: q.question, answer: word,
              startRow: sr, startCol: sc,
              clueRow, clueCol, direction: dir, index: wordIndex,
            });
            wordIndex++;
            placed = true;
            break;
          }
        }
      }
    }

    if (placedWords.length >= 15) break;
  }

  // Convert remaining block cells to empty clue cells (no black squares)
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c].type === 'block') {
        grid[r][c] = { type: 'clue', clues: [] } as ClueCell;
      }
    }
  }

  return { grid, placedWords };
}
