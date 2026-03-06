import React from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import PaperClip from './PaperClip';

const FOLDER_COLORS = [
  'var(--folder-pink)',
  'var(--folder-blue)',
  'var(--folder-green)',
  'var(--folder-yellow)',
  'var(--folder-red)',
  'var(--folder-purple)',
  'var(--folder-orange)',
  'var(--folder-teal)',
  'var(--folder-lavender)',
  'var(--folder-mint)',
];

const CLIP_COLORS: Array<'silver' | 'gold' | 'pink' | 'blue' | 'green'> = [
  'pink', 'blue', 'gold', 'green', 'silver',
];

const MINI_STICKERS = ['⭐', '✨', '💫', '🌟', '📌', '🎯', '💡', '🔖', '🌈', '🦋'];

interface SubjectFolderProps {
  index: number;
  icon: string;
  title: string;
  subtitle: string;
  meta?: string;
  selected: boolean;
  onClick: () => void;
}

const SubjectFolder: React.FC<SubjectFolderProps> = ({
  index,
  icon,
  title,
  subtitle,
  meta,
  selected,
  onClick,
}) => {
  const colorVar = FOLDER_COLORS[index % FOLDER_COLORS.length];
  const clipColor = CLIP_COLORS[index % CLIP_COLORS.length];
  const sticker = MINI_STICKERS[index % MINI_STICKERS.length];
  const bodyTilt = index % 3 === 0 ? 0.6 : index % 3 === 1 ? -0.4 : 0;

  return (
    <motion.div
      className={cn('subject-folder', selected && 'selected')}
      onClick={onClick}
      layout
    >
      {/* Paper clip */}
      <div className="absolute -top-3 -right-1 z-20" style={{ transform: `rotate(${8 + (index % 4) * 5}deg)` }}>
        <PaperClip color={clipColor} />
      </div>

      {/* Folder tab */}
      <div
        className="folder-tab-shape z-10"
        style={{
          background: `hsl(${colorVar} / 0.7)`,
          boxShadow: `inset 0 2px 4px hsl(0 0% 100% / 0.35)`,
        }}
      >
        <span className="absolute inset-0 flex items-center justify-center text-sm font-bold select-none pt-0.5"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          {icon}
        </span>
      </div>

      {/* Folder body */}
      <div
        className="folder-body-shape"
        style={{
          background: `hsl(${colorVar} / 0.15)`,
          borderColor: selected ? `hsl(${colorVar} / 0.9)` : `hsl(${colorVar} / 0.3)`,
          transform: `rotate(${bodyTilt}deg)`,
          boxShadow: selected
            ? undefined
            : `0 4px 16px hsl(0 0% 0% / 0.06), inset 0 1px 2px hsl(0 0% 100% / 0.4)`,
        }}
      >
        {/* Mini sticker */}
        <span
          className="absolute -top-1 -right-1 text-sm opacity-50 select-none"
          style={{ transform: `rotate(${15 + index * 8}deg)` }}
        >
          {sticker}
        </span>

        <div className="handwriting text-lg sm:text-xl font-bold leading-tight mb-0.5 text-foreground">
          {title}
        </div>
        <div className="text-[10px] text-muted-foreground line-clamp-1" style={{ fontFamily: 'var(--font-body)' }}>
          {subtitle}
        </div>
        {meta && (
          <div
            className="text-[9px] text-muted-foreground mt-1.5 px-2 py-0.5 rounded-full inline-block"
            style={{
              background: `hsl(${colorVar} / 0.12)`,
              fontFamily: 'var(--font-body)',
            }}
          >
            {meta}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default SubjectFolder;
