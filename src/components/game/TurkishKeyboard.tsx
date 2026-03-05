import React from 'react';
import { cn } from '@/lib/utils';
import { Delete } from 'lucide-react';

interface TurkishKeyboardProps {
  onKey: (letter: string) => void;
  onBackspace: () => void;
}

const ROWS = [
  ['E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', 'Ğ', 'Ü'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Ş', 'İ'],
  ['Z', 'C', 'V', 'B', 'N', 'M', 'Ö', 'Ç'],
];

const TurkishKeyboard: React.FC<TurkishKeyboardProps> = ({ onKey, onBackspace }) => {
  return (
    <div className="w-full max-w-lg mx-auto px-1 py-2 select-none">
      {ROWS.map((row, ri) => (
        <div key={ri} className="flex justify-center gap-[3px] mb-[3px]">
          {row.map(letter => (
            <button
              key={letter}
              className={cn(
                'flex items-center justify-center rounded-lg font-display font-bold text-sm',
                'min-w-[28px] h-10 sm:min-w-[32px] sm:h-11',
                'bg-card border border-border text-foreground',
                'active:bg-primary active:text-primary-foreground',
                'transition-colors duration-75 touch-manipulation'
              )}
              onClick={() => onKey(letter)}
              type="button"
            >
              {letter}
            </button>
          ))}
          {ri === 2 && (
            <button
              className={cn(
                'flex items-center justify-center rounded-lg font-bold',
                'min-w-[44px] h-10 sm:h-11',
                'bg-secondary border border-border text-foreground',
                'active:bg-destructive active:text-destructive-foreground',
                'transition-colors duration-75 touch-manipulation'
              )}
              onClick={onBackspace}
              type="button"
            >
              <Delete className="h-5 w-5" />
            </button>
          )}
        </div>
      ))}
    </div>
  );
};

export default TurkishKeyboard;
