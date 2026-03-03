import React, { useState, useCallback, useRef } from 'react';
import { Cell, LetterCell, ClueCell, PlacedWord, Direction } from '@/types/crossword';
import { cn } from '@/lib/utils';

interface CrosswordGridProps {
  grid: Cell[][];
  placedWords: PlacedWord[];
  onCellChange: (row: number, col: number, letter: string) => void;
  onWordComplete: (wordIndex: number, correct: boolean) => void;
}

const CrosswordGrid: React.FC<CrosswordGridProps> = ({
  grid,
  placedWords,
  onCellChange,
  onWordComplete,
}) => {
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);
  const [activeWordIndex, setActiveWordIndex] = useState<number | null>(null);
  const [activeDirection, setActiveDirection] = useState<Direction>('right');
  const inputRef = useRef<HTMLInputElement>(null);
  const rows = grid.length;
  const cols = grid[0]?.length || 0;

  const getHighlightedCells = useCallback((): Set<string> => {
    if (activeWordIndex === null) return new Set();
    const word = placedWords.find(w => w.index === activeWordIndex);
    if (!word) return new Set();
    const cells = new Set<string>();
    const dr = word.direction === 'down' ? 1 : 0;
    const dc = word.direction === 'right' ? 1 : 0;
    for (let i = 0; i < word.answer.length; i++) {
      cells.add(`${word.startRow + dr * i},${word.startCol + dc * i}`);
    }
    return cells;
  }, [activeWordIndex, placedWords]);

  const highlightedCells = getHighlightedCells();

  const handleCellClick = (row: number, col: number) => {
    const cell = grid[row][col];
    if (cell.type !== 'letter') return;

    const letterCell = cell as LetterCell;

    if (selectedCell?.row === row && selectedCell?.col === col && letterCell.wordIndices.length > 1) {
      const currentIdx = letterCell.wordIndices.indexOf(activeWordIndex!);
      const nextIdx = (currentIdx + 1) % letterCell.wordIndices.length;
      const nextWord = placedWords.find(w => w.index === letterCell.wordIndices[nextIdx]);
      if (nextWord) {
        setActiveWordIndex(nextWord.index);
        setActiveDirection(nextWord.direction);
      }
    } else {
      setSelectedCell({ row, col });
      const wordIdx = letterCell.wordIndices[0];
      const word = placedWords.find(w => w.index === wordIdx);
      if (word) {
        setActiveWordIndex(word.index);
        setActiveDirection(word.direction);
      }
    }

    setTimeout(() => inputRef.current?.focus(), 10);
  };

  const handleClueClick = (clue: ClueCell) => {
    if (clue.clues.length === 0) return;
    const entry = clue.clues[0];
    const word = placedWords.find(w => w.index === entry.wordIndex);
    if (word) {
      setSelectedCell({ row: word.startRow, col: word.startCol });
      setActiveWordIndex(word.index);
      setActiveDirection(word.direction);
      setTimeout(() => inputRef.current?.focus(), 10);
    }
  };

  const moveToNextCell = useCallback((row: number, col: number, dir: Direction) => {
    const dr = dir === 'down' ? 1 : 0;
    const dc = dir === 'right' ? 1 : 0;
    const nr = row + dr;
    const nc = col + dc;
    if (nr < rows && nc < cols && grid[nr][nc].type === 'letter') {
      setSelectedCell({ row: nr, col: nc });
    }
  }, [grid, rows, cols]);

  const moveToPrevCell = useCallback((row: number, col: number, dir: Direction) => {
    const dr = dir === 'down' ? 1 : 0;
    const dc = dir === 'right' ? 1 : 0;
    const nr = row - dr;
    const nc = col - dc;
    if (nr >= 0 && nc >= 0 && grid[nr][nc].type === 'letter') {
      setSelectedCell({ row: nr, col: nc });
    }
  }, [grid]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!selectedCell) return;
    const { row, col } = selectedCell;

    if (e.key === 'Backspace') {
      e.preventDefault();
      const cell = grid[row][col] as LetterCell;
      if (cell.userLetter) {
        onCellChange(row, col, '');
      } else {
        moveToPrevCell(row, col, activeDirection);
      }
      return;
    }

    if (e.key === 'ArrowRight') { setSelectedCell({ row, col: Math.min(col + 1, cols - 1) }); return; }
    if (e.key === 'ArrowLeft') { setSelectedCell({ row, col: Math.max(col - 1, 0) }); return; }
    if (e.key === 'ArrowDown') { setSelectedCell({ row: Math.min(row + 1, rows - 1), col }); return; }
    if (e.key === 'ArrowUp') { setSelectedCell({ row: Math.max(row - 1, 0), col }); return; }

    if (/^[a-zA-Z]$/.test(e.key)) {
      e.preventDefault();
      const letter = e.key.toUpperCase();
      onCellChange(row, col, letter);
      moveToNextCell(row, col, activeDirection);

      if (activeWordIndex !== null) {
        const word = placedWords.find(w => w.index === activeWordIndex);
        if (word) {
          const dr = word.direction === 'down' ? 1 : 0;
          const dc = word.direction === 'right' ? 1 : 0;
          let allFilled = true;
          let allCorrect = true;
          for (let i = 0; i < word.answer.length; i++) {
            const r = word.startRow + dr * i;
            const c = word.startCol + dc * i;
            const cell = grid[r][c] as LetterCell;
            const currentLetter = (r === row && c === col) ? letter : cell.userLetter;
            if (!currentLetter) allFilled = false;
            if (currentLetter !== word.answer[i]) allCorrect = false;
          }
          if (allFilled) {
            onWordComplete(activeWordIndex, allCorrect);
          }
        }
      }
    }
  }, [selectedCell, activeDirection, activeWordIndex, grid, placedWords, onCellChange, onWordComplete, moveToNextCell, moveToPrevCell, rows, cols]);

  const getCellStatus = (row: number, col: number, cell: LetterCell): string => {
    if (cell.isRevealed && cell.userLetter === cell.expectedLetter) return 'cell-correct';
    if (cell.isRevealed && cell.userLetter && cell.userLetter !== cell.expectedLetter) return 'cell-wrong';
    if (selectedCell?.row === row && selectedCell?.col === col) return 'cell-selected';
    if (highlightedCells.has(`${row},${col}`)) return 'cell-highlighted';
    return '';
  };

  const cellSize = Math.min(
    Math.floor(Math.min(window.innerWidth - 32, 600) / cols),
    Math.floor(Math.min(window.innerHeight - 200, 500) / rows),
    40
  );

  return (
    <div className="relative">
      <input
        ref={inputRef}
        className="absolute opacity-0 w-0 h-0"
        onKeyDown={handleKeyDown}
        autoFocus
      />
      <div
        className="inline-grid border-2 border-foreground/20 rounded-lg overflow-hidden shadow-lg"
        style={{
          gridTemplateColumns: `repeat(${cols}, ${cellSize}px)`,
          gridTemplateRows: `repeat(${rows}, ${cellSize}px)`,
        }}
      >
        {grid.map((row, ri) =>
          row.map((cell, ci) => {
            if (cell.type === 'clue') {
              const clue = cell as ClueCell;
              const hasClues = clue.clues.length > 0;
              return (
                <div
                  key={`${ri}-${ci}`}
                  className={cn(
                    'cell-clue flex flex-col items-center justify-center overflow-hidden border border-border/50 relative',
                    hasClues && 'cursor-pointer'
                  )}
                  style={{ width: cellSize, height: cellSize }}
                  onClick={() => hasClues && handleClueClick(clue)}
                  title={clue.clues.map(c => c.text).join(' | ')}
                >
                  {clue.clues.length === 2 ? (
                    // Dual clue: split diagonally
                    <>
                      <div className="absolute inset-0">
                        <div className="absolute top-0 right-0 w-full h-1/2 flex flex-col items-center justify-center px-0.5">
                          <span className="text-center leading-none text-foreground/80 line-clamp-2 text-[5px] sm:text-[6px]">
                            {clue.clues[0].text}
                          </span>
                          <span className="text-primary font-bold text-[7px] sm:text-[8px]">
                            {clue.clues[0].direction === 'right' ? '→' : '↓'}
                          </span>
                        </div>
                        <div className="absolute bottom-0 left-0 w-full h-1/2 flex flex-col items-center justify-center px-0.5 border-t border-border/30">
                          <span className="text-center leading-none text-foreground/80 line-clamp-2 text-[5px] sm:text-[6px]">
                            {clue.clues[1].text}
                          </span>
                          <span className="text-primary font-bold text-[7px] sm:text-[8px]">
                            {clue.clues[1].direction === 'right' ? '→' : '↓'}
                          </span>
                        </div>
                      </div>
                      {/* Diagonal separator */}
                      <div className="absolute inset-0 pointer-events-none">
                        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                          <line x1="0" y1="100" x2="100" y2="0" stroke="hsl(var(--border))" strokeWidth="1" />
                        </svg>
                      </div>
                    </>
                  ) : clue.clues.length === 1 ? (
                    <>
                      <span className="text-center leading-none text-foreground/80 line-clamp-3 text-[5px] sm:text-[6px]">
                        {clue.clues[0].text}
                      </span>
                      <span className="text-primary font-bold text-[8px] sm:text-[10px] leading-none">
                        {clue.clues[0].direction === 'right' ? '→' : '↓'}
                      </span>
                    </>
                  ) : (
                    // Empty clue cell (filler)
                    <div className="w-full h-full bg-secondary/30" />
                  )}
                </div>
              );
            }

            if (cell.type === 'block') {
              return (
                <div
                  key={`${ri}-${ci}`}
                  className="bg-secondary/50 border border-border/50"
                  style={{ width: cellSize, height: cellSize }}
                />
              );
            }

            const letterCell = cell as LetterCell;
            const status = getCellStatus(ri, ci, letterCell);

            return (
              <div
                key={`${ri}-${ci}`}
                className={cn(
                  'cell-base cursor-pointer font-display font-bold text-foreground select-none',
                  status,
                  'hover:bg-accent/20'
                )}
                style={{
                  width: cellSize,
                  height: cellSize,
                  fontSize: Math.max(cellSize * 0.45, 12),
                }}
                onClick={() => handleCellClick(ri, ci)}
              >
                {letterCell.userLetter}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default CrosswordGrid;
