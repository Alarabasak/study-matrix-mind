import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Play, Check } from 'lucide-react';

interface AdHintDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  wordClue: string;
}

const AdHintDialog: React.FC<AdHintDialogProps> = ({ open, onClose, onConfirm, wordClue }) => {
  const [watching, setWatching] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!watching) return;
    if (countdown <= 0) {
      setDone(true);
      setWatching(false);
      return;
    }
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [watching, countdown]);

  useEffect(() => {
    if (open) { setWatching(false); setCountdown(5); setDone(false); }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">🎬 Reklam İzle, İpucu Al</DialogTitle>
          <DialogDescription>
            Kısa bir reklam izleyerek seçili kelimenin bir harfini açabilirsin. Bu işlem istatistiklerinde kaydedilecek.
          </DialogDescription>
        </DialogHeader>

        <div className="text-sm text-muted-foreground bg-secondary/50 rounded-xl p-3 mb-2">
          <span className="font-semibold text-foreground">İpucu:</span> {wordClue}
        </div>

        {!watching && !done && (
          <Button className="w-full gap-2 h-12 text-base font-display" onClick={() => setWatching(true)}>
            <Play className="h-5 w-5" />
            Reklam İzle (5 saniye)
          </Button>
        )}

        {watching && (
          <div className="text-center py-6">
            <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-3">
              <span className="text-3xl font-display font-bold text-primary">{countdown}</span>
            </div>
            <p className="text-sm text-muted-foreground">Reklam oynatılıyor...</p>
            <div className="mt-3 h-2 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-1000 ease-linear rounded-full"
                style={{ width: `${((5 - countdown) / 5) * 100}%` }}
              />
            </div>
          </div>
        )}

        {done && (
          <Button className="w-full gap-2 h-12 text-base font-display" onClick={() => { onConfirm(); onClose(); }}>
            <Check className="h-5 w-5" />
            Harfi Göster
          </Button>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AdHintDialog;
