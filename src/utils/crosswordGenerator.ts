import { Cell, ClueCell, LetterCell, BlockCell, PlacedWord, QuestionItem, Direction } from '@/types/crossword';

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

  // Check clue cell position (one before the word)
  const clueRow = startRow - dr;
  const clueCol = startCol - dc;
  if (clueRow < 0 || clueCol < 0 || clueRow >= rows || clueCol >= cols) return false;

  const clueCell = grid[clueRow][clueCol];
  if (clueCell.type !== 'block') return false;

  // Check word fits
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

export function generateCrossword(
  questions: QuestionItem[],
  gridSize: string
): { grid: Cell[][]; placedWords: PlacedWord[] } {
  const { rows, cols } = parseGridSize(gridSize);

  // Initialize grid with block cells
  const grid: Cell[][] = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, (): BlockCell => ({ type: 'block' }))
  );

  const placedWords: PlacedWord[] = [];
  const shuffled = shuffleArray(questions);

  // Filter words that can fit (answer length + 1 for clue cell must fit)
  const validQuestions = shuffled.filter(q => {
    const len = q.answer.length;
    return len + 1 <= Math.max(rows, cols) && len >= 2;
  });

  // Remove duplicate answers
  const seen = new Set<string>();
  const uniqueQuestions = validQuestions.filter(q => {
    if (seen.has(q.answer)) return false;
    seen.add(q.answer);
    return true;
  });

  // Try to place words
  let wordIndex = 0;

  for (const q of uniqueQuestions) {
    const word = q.answer.toUpperCase();
    let placed = false;

    // If first word, place it near top-left
    if (placedWords.length === 0) {
      // Try horizontal first
      const startRow = 1;
      const startCol = 1;
      if (startCol + word.length <= cols && startRow < rows) {
        // Place clue cell
        const clueCell: ClueCell = {
          type: 'clue',
          clueText: q.question,
          direction: 'right',
          wordIndex,
        };
        grid[startRow][0] = clueCell;

        // Place letters
        for (let i = 0; i < word.length; i++) {
          const letterCell: LetterCell = {
            type: 'letter',
            expectedLetter: word[i],
            userLetter: '',
            wordIndices: [wordIndex],
            isRevealed: false,
          };
          grid[startRow][startCol + i] = letterCell;
        }

        placedWords.push({
          question: q.question,
          answer: word,
          startRow,
          startCol,
          clueRow: startRow,
          clueCol: 0,
          direction: 'right',
          index: wordIndex,
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
        
        // Find matching letter in new word
        for (let ni = 0; ni < word.length; ni++) {
          if (placed) break;
          if (word[ni] !== existingLetter) continue;

          // Calculate intersection
          const dr = pw.direction === 'down' ? 1 : 0;
          const dc = pw.direction === 'right' ? 1 : 0;
          const intersectRow = pw.startRow + dr * pi;
          const intersectCol = pw.startCol + dc * pi;

          // New word goes perpendicular
          const newDir: Direction = pw.direction === 'right' ? 'down' : 'right';
          const ndr = newDir === 'down' ? 1 : 0;
          const ndc = newDir === 'right' ? 1 : 0;

          const newStartRow = intersectRow - ndr * ni;
          const newStartCol = intersectCol - ndc * ni;

          if (canPlaceWord(grid, word, newStartRow, newStartCol, newDir, rows, cols)) {
            const clueRow = newStartRow - ndr;
            const clueCol = newStartCol - ndc;

            // Place clue
            grid[clueRow][clueCol] = {
              type: 'clue',
              clueText: q.question,
              direction: newDir,
              wordIndex,
            };

            // Place letters
            for (let i = 0; i < word.length; i++) {
              const r = newStartRow + ndr * i;
              const c = newStartCol + ndc * i;
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

            placedWords.push({
              question: q.question,
              answer: word,
              startRow: newStartRow,
              startCol: newStartCol,
              clueRow,
              clueCol,
              direction: newDir,
              index: wordIndex,
            });
            wordIndex++;
            placed = true;
          }
        }
      }
    }

    // Try random placement if no intersection found
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

            grid[clueRow][clueCol] = {
              type: 'clue',
              clueText: q.question,
              direction: dir,
              wordIndex,
            };

            for (let i = 0; i < word.length; i++) {
              const r = sr + dr * i;
              const c = sc + dc * i;
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

            placedWords.push({
              question: q.question,
              answer: word,
              startRow: sr,
              startCol: sc,
              clueRow,
              clueCol,
              direction: dir,
              index: wordIndex,
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

  return { grid, placedWords };
}
