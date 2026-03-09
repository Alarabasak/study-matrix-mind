/**
 * Gameplay Toolbar — Actions for check, reveal, clear, pause.
 */

import React from 'react';
import { 
  CheckCircle, Search, Eye, EyeOff, Eraser, Pause,
  HelpCircle, Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface GameToolbarProps {
  hasActiveClue: boolean;
  onCheckClue: () => void;
  onCheckPuzzle: () => void;
  onRevealCell: () => void;
  onRevealClue: () => void;
  onClearClue: () => void;
  onPause: () => void;
  onHint: () => void;
}

const GameToolbar: React.FC<GameToolbarProps> = ({
  hasActiveClue,
  onCheckClue,
  onCheckPuzzle,
  onRevealCell,
  onRevealClue,
  onClearClue,
  onPause,
  onHint,
}) => {
  return (
    <div className="flex items-center justify-center gap-1.5 py-2 px-2 flex-wrap">
      <Button
        variant="ghost"
        size="sm"
        onClick={onCheckClue}
        disabled={!hasActiveClue}
        className="rounded-xl text-xs gap-1 h-8 px-2.5"
        title="İpucunu kontrol et"
      >
        <CheckCircle className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Kontrol</span>
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={onCheckPuzzle}
        className="rounded-xl text-xs gap-1 h-8 px-2.5"
        title="Tüm bulmacayı kontrol et"
      >
        <Search className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Tümünü Kontrol</span>
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={onRevealCell}
        disabled={!hasActiveClue}
        className="rounded-xl text-xs gap-1 h-8 px-2.5"
        title="Hücre aç"
      >
        <Eye className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Hücre</span>
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={onRevealClue}
        disabled={!hasActiveClue}
        className="rounded-xl text-xs gap-1 h-8 px-2.5"
        title="Cevabı aç"
      >
        <Sparkles className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Cevap</span>
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={onClearClue}
        disabled={!hasActiveClue}
        className="rounded-xl text-xs gap-1 h-8 px-2.5"
        title="İpucunu temizle"
      >
        <Eraser className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Temizle</span>
      </Button>

      <div className="w-px h-5 bg-border mx-1" />

      <Button
        variant="ghost"
        size="sm"
        onClick={onHint}
        className="rounded-xl text-xs gap-1 h-8 px-2.5"
        title="İpucu al"
      >
        <HelpCircle className="w-3.5 h-3.5" />
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={onPause}
        className="rounded-xl text-xs gap-1 h-8 px-2.5"
        title="Duraklat"
      >
        <Pause className="w-3.5 h-3.5" />
      </Button>
    </div>
  );
};

export default GameToolbar;
