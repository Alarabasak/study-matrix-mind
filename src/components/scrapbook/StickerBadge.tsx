import React from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface StickerBadgeProps {
  children: React.ReactNode;
  color?: 'pink' | 'blue' | 'yellow' | 'green' | 'purple';
  rotation?: number;
  className?: string;
  animate?: boolean;
}

const BG: Record<string, string> = {
  pink: 'bg-[hsl(348_62%_84%/0.25)] text-primary',
  blue: 'bg-[hsl(208_55%_80%/0.25)] text-accent',
  yellow: 'bg-[hsl(46_72%_80%/0.3)] text-foreground',
  green: 'bg-[hsl(158_38%_75%/0.25)] text-foreground',
  purple: 'bg-[hsl(268_42%_80%/0.25)] text-foreground',
};

const StickerBadge: React.FC<StickerBadgeProps> = ({
  children,
  color = 'pink',
  rotation = -2,
  className,
  animate = true,
}) => {
  const inner = (
    <span
      className={cn('sticker-badge', BG[color], className)}
      style={{ '--sticker-rotate': `${rotation}deg`, transform: `rotate(${rotation}deg)` } as React.CSSProperties}
    >
      {children}
    </span>
  );

  if (!animate) return inner;

  return (
    <motion.span
      initial={{ scale: 0, rotate: -20 }}
      animate={{ scale: 1, rotate: rotation }}
      transition={{ type: 'spring', stiffness: 350, damping: 15 }}
    >
      {inner}
    </motion.span>
  );
};

export default StickerBadge;
