import React from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

type NoteColor = 'yellow' | 'pink' | 'blue' | 'green' | 'purple';

const NOTE_CLASS: Record<NoteColor, string> = {
  yellow: 'sticky-note',
  pink: 'sticky-note sticky-note-pink',
  blue: 'sticky-note sticky-note-blue',
  green: 'sticky-note sticky-note-green',
  purple: 'sticky-note sticky-note-purple',
};

interface StickyNoteProps {
  color?: NoteColor;
  rotation?: number;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

const StickyNote: React.FC<StickyNoteProps> = ({
  color = 'yellow',
  rotation = -1,
  children,
  className,
  onClick,
}) => (
  <motion.div
    className={cn(NOTE_CLASS[color], 'cursor-pointer rounded-sm', className)}
    style={{ '--note-rotate': `${rotation}deg`, transform: `rotate(${rotation}deg)` } as React.CSSProperties}
    whileHover={{
      scale: 1.06,
      rotate: rotation + 1,
      transition: { type: 'spring', stiffness: 400, damping: 12 },
    }}
    whileTap={{ scale: 0.96 }}
    onClick={onClick}
  >
    {children}
  </motion.div>
);

export default StickyNote;
