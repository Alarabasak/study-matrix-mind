/**
 * Arrow Crossword Clue List
 * 
 * Renders clue list from PuzzleDefinition.clues.
 * No legacy PlacedWord dependency.
 */

import React from 'react';
import { ClueDefinition } from '@/types/puzzle';
import { cn } from '@/lib/utils';

interface ArrowClueListProps {
  clues: ClueDefinition[];
  completedClueIds: Set<string>;
  activeClueId: string | null;
  onClueClick: (clueId: string) => void;
}

const ArrowClueList: React.FC<ArrowClueListProps> = ({
  clues,
  completedClueIds,
  activeClueId,
  onClueClick,
}) => {
  const acrossClues = clues
    .filter(c => c.direction === 'right')
    .sort((a, b) => a.startCell.y - b.startCell.y || a.startCell.x - b.startCell.x);
  const downClues = clues
    .filter(c => c.direction === 'down')
    .sort((a, b) => a.startCell.y - b.startCell.y || a.startCell.x - b.startCell.x);

  const renderClue = (clue: ClueDefinition) => (
    <div
      key={clue.id}
      className={cn(
        'text-xs sm:text-sm py-1.5 px-2 rounded-lg cursor-pointer transition-all',
        completedClueIds.has(clue.id) && 'line-through opacity-50 bg-cell-correct',
        activeClueId === clue.id && 'bg-cell-highlight font-semibold',
        !completedClueIds.has(clue.id) && activeClueId !== clue.id && 'hover:bg-secondary'
      )}
      onClick={() => onClueClick(clue.id)}
    >
      <span className="text-muted-foreground mr-1 font-mono text-[10px]">
        {clue.answer.length}
      </span>
      {clue.text}
    </div>
  );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 w-full max-w-lg">
      <div>
        <h3 className="font-display font-bold text-sm mb-2 text-primary flex items-center gap-1">
          → Yatay
        </h3>
        <div className="space-y-0.5">{acrossClues.map(renderClue)}</div>
      </div>
      <div>
        <h3 className="font-display font-bold text-sm mb-2 text-primary flex items-center gap-1">
          ↓ Dikey
        </h3>
        <div className="space-y-0.5">{downClues.map(renderClue)}</div>
      </div>
    </div>
  );
};

export default ArrowClueList;
