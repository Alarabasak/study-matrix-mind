import React, { useState, useEffect } from 'react';
import { ArrowLeft, Clock, Trophy, Film, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface GameHeaderProps {
  category: string;
  categoryIcon: string;
  gridSize: string;
  score: number;
  wordsFound: number;
  totalWords: number;
  onBack: () => void;
  onHint: () => void;
  onNewPuzzle: () => void;
  startTime: number;
}

const GameHeader: React.FC<GameHeaderProps> = ({
  category,
  categoryIcon,
  gridSize,
  score,
  wordsFound,
  totalWords,
  onBack,
  onHint,
  onNewPuzzle,
  startTime,
}) => {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [startTime]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 py-3">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={onBack} className="rounded-xl">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-1.5">
          <span className="text-xl">{categoryIcon}</span>
          <span className="font-display font-bold text-sm sm:text-base">{category}</span>
          <span className="text-muted-foreground text-xs">({gridSize})</span>
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-4">
        <div className="flex items-center gap-1 text-sm font-semibold">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span>{formatTime(elapsed)}</span>
        </div>
        <div className="flex items-center gap-1 text-sm font-semibold">
          <Trophy className="h-4 w-4 text-accent" />
          <span>{score}</span>
        </div>
        <div className="text-xs font-semibold px-2 py-1 rounded-lg bg-primary/10 text-primary">
          {wordsFound}/{totalWords}
        </div>
        <Button variant="ghost" size="icon" onClick={onHint} className="rounded-xl" title="Watch ad for hint">
          <Film className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={onNewPuzzle} className="rounded-xl" title="New puzzle">
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default GameHeader;
