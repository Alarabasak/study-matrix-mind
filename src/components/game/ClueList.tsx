import React from 'react';
import { PlacedWord } from '@/types/crossword';
import { cn } from '@/lib/utils';

interface ClueListProps {
  placedWords: PlacedWord[];
  completedWords: Set<number>;
  activeWordIndex: number | null;
  onClueClick: (wordIndex: number) => void;
}

const ClueList: React.FC<ClueListProps> = ({
  placedWords,
  completedWords,
  activeWordIndex,
  onClueClick,
}) => {
  const acrossWords = placedWords.filter(w => w.direction === 'right').sort((a, b) => a.clueRow - b.clueRow || a.clueCol - b.clueCol);
  const downWords = placedWords.filter(w => w.direction === 'down').sort((a, b) => a.clueRow - b.clueRow || a.clueCol - b.clueCol);

  const renderClue = (word: PlacedWord) => (
    <div
      key={word.index}
      className={cn(
        'text-xs sm:text-sm py-1.5 px-2 rounded-lg cursor-pointer transition-all',
        completedWords.has(word.index) && 'line-through opacity-50 bg-cell-correct',
        activeWordIndex === word.index && 'bg-cell-highlight font-semibold',
        !completedWords.has(word.index) && activeWordIndex !== word.index && 'hover:bg-secondary'
      )}
      onClick={() => onClueClick(word.index)}
    >
      <span className="text-muted-foreground mr-1 font-mono text-[10px]">
        {word.word.length}
      </span>
      {word.clue}
    </div>
  );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 w-full max-w-lg">
      <div>
        <h3 className="font-display font-bold text-sm mb-2 text-primary flex items-center gap-1">
          → Yatay
        </h3>
        <div className="space-y-0.5">{acrossWords.map(renderClue)}</div>
      </div>
      <div>
        <h3 className="font-display font-bold text-sm mb-2 text-primary flex items-center gap-1">
          ↓ Dikey
        </h3>
        <div className="space-y-0.5">{downWords.map(renderClue)}</div>
      </div>
    </div>
  );
};

export default ClueList;
