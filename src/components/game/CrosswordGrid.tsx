import React, { useState, useCallback, useRef } from 'react';
import { Cell, LetterCell, ClueCell, PlacedWord, Direction } from '@/types/crossword';
import { cn } from '@/lib/utils';
import ClueModal from './ClueModal';

interface CrosswordGridProps {
  grid: Cell[][];
  placedWords: PlacedWord[];
  onCellChange: (row: number, col: number, letter: string) => void;
  onWordComplete: (wordIndex: number, correct: boolean) => void;
  onKeyboardLetter?: (letter: string) => void;
}

const TURKISH_LETTERS = 'ABCÇDEFGĞHIİJKLMNOÖPRSŞTUÜVYZ';

const CrosswordGrid: React.FC<CrosswordGridProps> = ({
  grid,
  placedWords,
  onCellChange,
  onWordComplete,
}) => {
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);
  const [activeWordIndex, setActiveWordIndex] = useState<number | null>(null);
  const [activeDirection, setActiveDirection] = useState<Direction>('right');
  const [clueModal, setClueModal] = useState<{ text: string; direction: string; wordLength: number } | null>(null);
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
    for (let i = 0; i < word.word.length; i++) {
      cells.add(`${word.startRow + dr * i},${word.startCol + dc * i}`);
    }
    return cells;
  }, [activeWordIndex, placedWords]);

  const highlightedCells = getHighlightedCells();

  const selectWordFromCell = (row: number, col: number, toggleIfSame: boolean) => {
    const cell = grid[row][col];
    if (cell.type !== 'letter') return;
    const letterCell = cell as LetterCell;

    if (toggleIfSame && selectedCell?.row === row && selectedCell?.col === col && letterCell.wordIndices.length > 1) {
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

  const handleCellClick = (row: number, col: number) => {
    selectWordFromCell(row, col, true);
  };

  const handleClueClick = (clue: ClueCell, event: React.MouseEvent) => {
    if (clue.clues.length === 0) return;

    // If dual clue, determine which half was clicked
    let targetClue = clue.clues[0];
    if (clue.clues.length === 2) {
      const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
      const relY = event.clientY - rect.top;
      if (relY > rect.height / 2) {
        targetClue = clue.clues[1];
      }
    }

    const word = placedWords.find(w => w.index === targetClue.wordIndex);
    if (word) {
      setSelectedCell({ row: word.startRow, col: word.startCol });
      setActiveWordIndex(word.index);
      setActiveDirection(word.direction);
      // Open modal with full clue
      setClueModal({
        text: targetClue.text,
        direction: targetClue.direction,
        wordLength: word.word.length,
      });
      setTimeout(() => inputRef.current?.focus(), 10);
    }
  };

  const moveToNextCell = useCallback((row: number, col: number, dir: Direction) => {
    const dr = dir === 'down' ? 1 : 0;
    const dc = dir === 'right' ? 1 : 0;
    let nr = row + dr;
    let nc = col + dc;
    // Skip revealed (completed) cells
    while (nr < rows && nc < cols && grid[nr][nc].type === 'letter') {
      if (!(grid[nr][nc] as LetterCell).isRevealed) {
        setSelectedCell({ row: nr, col: nc });
        return;
      }
      nr += dr;
      nc += dc;
    }
  }, [grid, rows, cols]);

  const moveToPrevCell = useCallback((row: number, col: number, dir: Direction) => {
    const dr = dir === 'down' ? 1 : 0;
    const dc = dir === 'right' ? 1 : 0;
    let nr = row - dr;
    let nc = col - dc;
    // Skip revealed (completed) cells
    while (nr >= 0 && nc >= 0 && grid[nr][nc].type === 'letter') {
      if (!(grid[nr][nc] as LetterCell).isRevealed) {
        setSelectedCell({ row: nr, col: nc });
        return;
      }
      nr -= dr;
      nc -= dc;
    }
  }, [grid]);

  const processLetter = useCallback((letter: string) => {
    if (!selectedCell) return;
    const { row, col } = selectedCell;
    const cell = grid[row][col];
    // Don't allow typing into revealed (completed word) cells
    if (cell.type === 'letter' && (cell as LetterCell).isRevealed) {
      moveToNextCell(row, col, activeDirection);
      return;
    }
    const upperLetter = letter.toUpperCase();

    onCellChange(row, col, upperLetter);
    moveToNextCell(row, col, activeDirection);

    if (activeWordIndex !== null) {
      const word = placedWords.find(w => w.index === activeWordIndex);
      if (word) {
        const dr = word.direction === 'down' ? 1 : 0;
        const dc = word.direction === 'right' ? 1 : 0;
        let allFilled = true;
        let allCorrect = true;
        for (let i = 0; i < word.word.length; i++) {
          const r = word.startRow + dr * i;
          const c = word.startCol + dc * i;
          const cell = grid[r][c] as LetterCell;
          const currentLetter = (r === row && c === col) ? upperLetter : cell.userLetter;
          if (!currentLetter) allFilled = false;
          if (currentLetter !== word.word[i]) allCorrect = false;
        }
        if (allFilled) {
          onWordComplete(activeWordIndex, allCorrect);
        }
      }
    }
  }, [selectedCell, activeDirection, activeWordIndex, grid, placedWords, onCellChange, onWordComplete, moveToNextCell]);

  const processBackspace = useCallback(() => {
    if (!selectedCell) return;
    const { row, col } = selectedCell;
    const cell = grid[row][col];
    // Don't allow deleting revealed (completed word) cells
    if (cell.type === 'letter' && (cell as LetterCell).isRevealed) {
      moveToPrevCell(row, col, activeDirection);
      return;
    }
    if (cell.type === 'letter' && (cell as LetterCell).userLetter) {
      onCellChange(row, col, '');
    } else {
      moveToPrevCell(row, col, activeDirection);
    }
  }, [selectedCell, grid, onCellChange, moveToPrevCell, activeDirection]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!selectedCell) return;
    const { row, col } = selectedCell;

    if (e.key === 'Backspace') {
      e.preventDefault();
      processBackspace();
      return;
    }

    if (e.key === 'ArrowRight') { setSelectedCell({ row, col: Math.min(col + 1, cols - 1) }); return; }
    if (e.key === 'ArrowLeft') { setSelectedCell({ row, col: Math.max(col - 1, 0) }); return; }
    if (e.key === 'ArrowDown') { setSelectedCell({ row: Math.min(row + 1, rows - 1), col }); return; }
    if (e.key === 'ArrowUp') { setSelectedCell({ row: Math.max(row - 1, 0), col }); return; }

    const upper = e.key.toUpperCase();
    if (TURKISH_LETTERS.includes(upper) || /^[A-Z]$/.test(upper)) {
      e.preventDefault();
      processLetter(upper);
    }
  }, [selectedCell, processLetter, processBackspace, rows, cols]);

  // Exposed for on-screen keyboard
  React.useEffect(() => {
    const handler = (e: CustomEvent) => {
      if (e.detail.type === 'letter') processLetter(e.detail.value);
      if (e.detail.type === 'backspace') processBackspace();
    };
    window.addEventListener('crossword-key' as any, handler);
    return () => window.removeEventListener('crossword-key' as any, handler);
  }, [processLetter, processBackspace]);

  const getCellStatus = (row: number, col: number, cell: LetterCell): string => {
    if (cell.isRevealed && cell.userLetter === cell.expectedLetter) return 'cell-correct';
    if (cell.isRevealed && cell.userLetter && cell.userLetter !== cell.expectedLetter) return 'cell-wrong';
    if (selectedCell?.row === row && selectedCell?.col === col) return 'cell-selected';
    if (highlightedCells.has(`${row},${col}`)) return 'cell-highlighted';
    return '';
  };

  const cellSize = Math.min(
    Math.floor(Math.min(window.innerWidth - 16, 500) / cols),
    Math.floor(Math.min(window.innerHeight - 280, 450) / rows),
    36
  );

  return (
    <div className="relative">
      <input
        ref={inputRef}
        className="absolute opacity-0 w-0 h-0"
        onKeyDown={handleKeyDown}
        autoFocus
        inputMode="none"
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
                  onClick={(e) => hasClues && handleClueClick(clue, e)}
                >
                  {clue.clues.length === 2 ? (
                    <>
                      <div className="absolute inset-0">
                        <div className="absolute top-0 right-0 w-full h-1/2 flex flex-col items-center justify-center px-0.5">
                          <span className="text-center leading-none text-foreground/80 line-clamp-2" style={{ fontSize: Math.max(cellSize * 0.14, 5) }}>
                            {clue.clues[0].text}
                          </span>
                          <span className="text-primary font-bold" style={{ fontSize: Math.max(cellSize * 0.22, 7) }}>
                            {clue.clues[0].direction === 'right' ? '→' : '↓'}
                          </span>
                        </div>
                        <div className="absolute bottom-0 left-0 w-full h-1/2 flex flex-col items-center justify-center px-0.5 border-t border-border/30">
                          <span className="text-center leading-none text-foreground/80 line-clamp-2" style={{ fontSize: Math.max(cellSize * 0.14, 5) }}>
                            {clue.clues[1].text}
                          </span>
                          <span className="text-primary font-bold" style={{ fontSize: Math.max(cellSize * 0.22, 7) }}>
                            {clue.clues[1].direction === 'right' ? '→' : '↓'}
                          </span>
                        </div>
                      </div>
                      <div className="absolute inset-0 pointer-events-none">
                        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                          <line x1="0" y1="100" x2="100" y2="0" stroke="hsl(var(--border))" strokeWidth="1" />
                        </svg>
                      </div>
                    </>
                  ) : clue.clues.length === 1 ? (
                    <>
                      <span className="text-center leading-none text-foreground/80 line-clamp-3 px-0.5" style={{ fontSize: Math.max(cellSize * 0.15, 5) }}>
                        {clue.clues[0].text}
                      </span>
                      <span className="text-primary font-bold leading-none" style={{ fontSize: Math.max(cellSize * 0.25, 8) }}>
                        {clue.clues[0].direction === 'right' ? '→' : '↓'}
                      </span>
                    </>
                  ) : (
                    <div className="w-full h-full bg-secondary/30" />
                  )}
                </div>
              );
            }

            if (cell.type === 'block') {
              return (
                <div
                  key={`${ri}-${ci}`}
                  className="bg-muted/20 border border-border/30"
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
                  'active:scale-95 transition-transform'
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

      {clueModal && (
        <ClueModal
          open={!!clueModal}
          onClose={() => setClueModal(null)}
          clueText={clueModal.text}
          direction={clueModal.direction}
          wordLength={clueModal.wordLength}
        />
      )}
    </div>
  );
};

export default CrosswordGrid;
