import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface ClueModalProps {
  open: boolean;
  onClose: () => void;
  clueText: string;
  direction: string;
  wordLength: number;
}

const ClueModal: React.FC<ClueModalProps> = ({ open, onClose, clueText, direction, wordLength }) => {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display flex items-center gap-2">
            <span className="text-primary text-lg">{direction === 'right' ? '→' : '↓'}</span>
            İpucu
          </DialogTitle>
        </DialogHeader>
        <div className="py-3">
          <p className="text-base text-foreground leading-relaxed">{clueText}</p>
          <p className="text-xs text-muted-foreground mt-3">
            {wordLength} harf {direction === 'right' ? '(Yatay)' : '(Dikey)'}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ClueModal;
