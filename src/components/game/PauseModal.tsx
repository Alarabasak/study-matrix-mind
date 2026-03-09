/**
 * Pause Modal — Continue, restart, or exit.
 */

import React from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Play, RotateCcw, LogOut } from 'lucide-react';

interface PauseModalProps {
  open: boolean;
  onContinue: () => void;
  onRestart: () => void;
  onExit: () => void;
  elapsedFormatted: string;
  score: number;
  wordsFound: number;
  totalWords: number;
}

const PauseModal: React.FC<PauseModalProps> = ({
  open,
  onContinue,
  onRestart,
  onExit,
  elapsedFormatted,
  score,
  wordsFound,
  totalWords,
}) => {
  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onContinue(); }}>
      <DialogContent className="sm:max-w-sm text-center p-6 rounded-2xl" style={{ fontFamily: 'var(--font-heading)' }}>
        <div className="text-4xl mb-2">⏸️</div>
        <h2 className="text-xl font-bold mb-4" style={{ fontFamily: 'var(--font-display)', color: 'hsl(var(--foreground))' }}>
          Oyun Duraklatıldı
        </h2>

        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="rounded-xl p-2" style={{ background: 'hsl(var(--muted))' }}>
            <div className="text-xs" style={{ color: 'hsl(var(--muted-foreground))' }}>Süre</div>
            <div className="font-bold text-sm" style={{ color: 'hsl(var(--foreground))' }}>{elapsedFormatted}</div>
          </div>
          <div className="rounded-xl p-2" style={{ background: 'hsl(var(--muted))' }}>
            <div className="text-xs" style={{ color: 'hsl(var(--muted-foreground))' }}>Puan</div>
            <div className="font-bold text-sm" style={{ color: 'hsl(var(--foreground))' }}>{score}</div>
          </div>
          <div className="rounded-xl p-2" style={{ background: 'hsl(var(--muted))' }}>
            <div className="text-xs" style={{ color: 'hsl(var(--muted-foreground))' }}>Kelime</div>
            <div className="font-bold text-sm" style={{ color: 'hsl(var(--foreground))' }}>{wordsFound}/{totalWords}</div>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Button onClick={onContinue} className="w-full gap-2 rounded-xl">
            <Play className="w-4 h-4" />
            Devam Et
          </Button>
          <Button variant="outline" onClick={onRestart} className="w-full gap-2 rounded-xl">
            <RotateCcw className="w-4 h-4" />
            Yeniden Başla
          </Button>
          <Button variant="ghost" onClick={onExit} className="w-full gap-2 rounded-xl text-muted-foreground">
            <LogOut className="w-4 h-4" />
            Pakete Dön
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PauseModal;
