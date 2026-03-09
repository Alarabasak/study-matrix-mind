/**
 * Arrow Crossword Grid Renderer
 * 
 * Renders directly from PuzzleDefinition cells.
 * No slot/topology/generator dependencies.
 * Supports: clue cells (with arrows), letter cells (with input), block cells.
 */

import React, { useCallback, useRef, useEffect } from 'react';
import { PuzzleDefinition, GridCellDef, ClueCellDef, ArrowDirection } from '@/types/puzzle';
import { CellCoord, CellRelationMap, coordKey } from '@/types/gameplayState';
import { cn } from '@/lib/utils';
import ClueModal from './ClueModal';

interface ArrowCrosswordGridProps {
  puzzle: PuzzleDefinition;
  userEntries: Map<string, string>;
  activeCell: CellCoord | null;
  activeClueId: string | null;
  highlightedCells: Set<string>;
  completedClueIds: Set<string>;
  revealedCells: Set<string>;
  cellRelations: CellRelationMap;
  incorrectCellKeys?: Set<string>;
  onCellClick: (x: number, y: number) => void;
  onClueClick: (clueId: string) => void;
  onLetterInput: (letter: string) => void;
  onBackspace: () => void;
}

const TURKISH_LETTERS = 'ABCÇDEFGĞHIİJKLMNOÖPRSŞTUÜVYZ';

const ArrowCrosswordGrid: React.FC<ArrowCrosswordGridProps> = ({
  puzzle,
  userEntries,
  activeCell,
  activeClueId,
  highlightedCells,
  completedClueIds,
  revealedCells,
  cellRelations,
  incorrectCellKeys = new Set(),
  onCellClick,
  onClueClick,
  onLetterInput,
  onBackspace,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const { gridWidth, gridHeight, cells, clues } = puzzle;

  // Focus input when active cell changes
  useEffect(() => {
    if (activeCell) {
      setTimeout(() => inputRef.current?.focus(), 10);
    }
  }, [activeCell]);

  // Keyboard handler
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      onBackspace();
      return;
    }
    const upper = e.key.toUpperCase();
    if (TURKISH_LETTERS.includes(upper) || /^[A-Z]$/.test(upper)) {
      e.preventDefault();
      onLetterInput(upper);
    }
  }, [onLetterInput, onBackspace]);

  // On-screen keyboard support
  useEffect(() => {
    const handler = (e: CustomEvent) => {
      if (e.detail.type === 'letter') onLetterInput(e.detail.value);
      if (e.detail.type === 'backspace') onBackspace();
    };
    window.addEventListener('crossword-key' as any, handler);
    return () => window.removeEventListener('crossword-key' as any, handler);
  }, [onLetterInput, onBackspace]);

  // Cell size calculation
  const cellSize = Math.min(
    Math.floor(Math.min(window.innerWidth - 16, 560) / gridWidth),
    Math.floor(Math.min(window.innerHeight - 280, 500) / gridHeight),
    36
  );

  const handleClueCellClick = (cellDef: ClueCellDef, e: React.MouseEvent) => {
    if (cellDef.arrows.length === 0) return;

    let targetArrow = cellDef.arrows[0];
    if (cellDef.arrows.length === 2) {
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      const relY = e.clientY - rect.top;
      if (relY > rect.height / 2) {
        targetArrow = cellDef.arrows[1];
      }
    }
    onClueClick(targetArrow.clueId);
  };

  const getLetterCellStatus = (x: number, y: number): string => {
    const key = coordKey(x, y);
    const isRevealed = revealedCells.has(key);
    const userLetter = userEntries.get(key) || '';

    // Incorrect cell marking (temporary)
    if (incorrectCellKeys.has(key)) return 'cell-wrong';

    // Check if this cell belongs to any completed clue
    const relations = cellRelations.get(key) || [];
    const isInCompletedClue = relations.some(r => completedClueIds.has(r.clueId));

    if (isInCompletedClue && userLetter) return 'cell-correct';
    if (isRevealed && userLetter) return 'cell-correct';
    if (activeCell && activeCell.x === x && activeCell.y === y) return 'cell-selected';
    if (highlightedCells.has(key)) return 'cell-highlighted';
    return '';
  };

  const renderClueCell = (cellDef: ClueCellDef, x: number, y: number) => {
    const hasArrows = cellDef.arrows.length > 0;

    // Find clue texts for arrows
    const getClueText = (clueId: string) => {
      const clue = clues.find(c => c.id === clueId);
      return clue?.text || '';
    };

    return (
      <div
        key={`${y}-${x}`}
        className={cn(
          'cell-clue flex flex-col items-center justify-center overflow-hidden border border-border/50 relative',
          hasArrows && 'cursor-pointer'
        )}
        style={{ width: cellSize, height: cellSize }}
        onClick={(e) => hasArrows && handleClueCellClick(cellDef, e)}
      >
        {cellDef.arrows.length === 2 ? (
          <>
            <div className="absolute inset-0">
              <div className="absolute top-0 right-0 w-full h-1/2 flex flex-col items-center justify-center px-0.5">
                <span className="text-center leading-none text-foreground/80 line-clamp-2" style={{ fontSize: Math.max(cellSize * 0.14, 5) }}>
                  {getClueText(cellDef.arrows[0].clueId)}
                </span>
                <span className="text-primary font-bold" style={{ fontSize: Math.max(cellSize * 0.22, 7) }}>
                  {cellDef.arrows[0].direction === 'right' ? '→' : '↓'}
                </span>
              </div>
              <div className="absolute bottom-0 left-0 w-full h-1/2 flex flex-col items-center justify-center px-0.5 border-t border-border/30">
                <span className="text-center leading-none text-foreground/80 line-clamp-2" style={{ fontSize: Math.max(cellSize * 0.14, 5) }}>
                  {getClueText(cellDef.arrows[1].clueId)}
                </span>
                <span className="text-primary font-bold" style={{ fontSize: Math.max(cellSize * 0.22, 7) }}>
                  {cellDef.arrows[1].direction === 'right' ? '→' : '↓'}
                </span>
              </div>
            </div>
            <div className="absolute inset-0 pointer-events-none">
              <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                <line x1="0" y1="100" x2="100" y2="0" stroke="hsl(var(--border))" strokeWidth="1" />
              </svg>
            </div>
          </>
        ) : cellDef.arrows.length === 1 ? (
          <>
            <span className="text-center leading-none text-foreground/80 line-clamp-3 px-0.5" style={{ fontSize: Math.max(cellSize * 0.15, 5) }}>
              {getClueText(cellDef.arrows[0].clueId)}
            </span>
            <span className="text-primary font-bold leading-none" style={{ fontSize: Math.max(cellSize * 0.25, 8) }}>
              {cellDef.arrows[0].direction === 'right' ? '→' : '↓'}
            </span>
          </>
        ) : (
          <div className="w-full h-full bg-secondary/30" />
        )}
      </div>
    );
  };

  const [clueModal, setClueModal] = React.useState<{ text: string; direction: string; wordLength: number } | null>(null);

  // When a clue cell is clicked, also show modal
  const handleClueClickWithModal = (clueId: string) => {
    const clue = clues.find(c => c.id === clueId);
    if (clue) {
      setClueModal({
        text: clue.text,
        direction: clue.direction,
        wordLength: clue.answer.length,
      });
    }
    onClueClick(clueId);
  };

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
          gridTemplateColumns: `repeat(${gridWidth}, ${cellSize}px)`,
          gridTemplateRows: `repeat(${gridHeight}, ${cellSize}px)`,
        }}
      >
        {cells.map((row, y) =>
          row.map((cellDef, x) => {
            if (cellDef.type === 'clue') {
              return renderClueCell(
                cellDef,
                x,
                y
              );
            }

            if (cellDef.type === 'block') {
              return (
                <div
                  key={`${y}-${x}`}
                  className="bg-muted/20 border border-border/30"
                  style={{ width: cellSize, height: cellSize }}
                />
              );
            }

            // Letter cell
            const key = coordKey(x, y);
            const userLetter = userEntries.get(key) || '';
            const status = getLetterCellStatus(x, y);

            return (
              <div
                key={`${y}-${x}`}
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
                onClick={() => onCellClick(x, y)}
              >
                {userLetter}
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

export default ArrowCrosswordGrid;
