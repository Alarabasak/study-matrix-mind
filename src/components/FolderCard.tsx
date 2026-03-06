import React from 'react';
import { cn } from '@/lib/utils';

const FOLDER_COLORS = [
  'var(--folder-pink)',
  'var(--folder-blue)',
  'var(--folder-green)',
  'var(--folder-yellow)',
  'var(--folder-red)',
  'var(--folder-purple)',
  'var(--folder-orange)',
  'var(--folder-teal)',
];

const CLIP_POSITIONS = [
  { top: '-6px', right: '12px', rotate: '8deg' },
  { top: '-4px', right: '18px', rotate: '-5deg' },
  { top: '-8px', right: '10px', rotate: '12deg' },
  { top: '-5px', right: '14px', rotate: '-8deg' },
];

const STICKER_EMOJIS = ['⭐', '✨', '💫', '🌟', '📌', '🎯', '💡', '🔖'];

interface FolderCardProps {
  index: number;
  icon: string;
  title: string;
  subtitle: string;
  meta?: string;
  selected: boolean;
  onClick: () => void;
}

const FolderCard: React.FC<FolderCardProps> = ({ index, icon, title, subtitle, meta, selected, onClick }) => {
  const colorVar = FOLDER_COLORS[index % FOLDER_COLORS.length];
  const clipPos = CLIP_POSITIONS[index % CLIP_POSITIONS.length];
  const stickerEmoji = STICKER_EMOJIS[index % STICKER_EMOJIS.length];
  const bodyRotate = index % 2 === 0 ? 'rotate(0.5deg)' : 'rotate(-0.5deg)';

  return (
    <div
      className={cn('folder-card', selected && 'selected')}
      onClick={onClick}
      style={{ '--folder-color': `hsl(${colorVar})` } as React.CSSProperties}
    >
      {/* Paper clip decoration */}
      <div
        className={cn('paper-clip', index % 3 === 0 ? 'paper-clip-gold' : index % 3 === 1 ? 'paper-clip-pink' : '')}
        style={{
          top: clipPos.top,
          right: clipPos.right,
          transform: `rotate(${clipPos.rotate})`,
        }}
      />

      {/* Folder tab */}
      <div
        className="folder-tab"
        style={{ background: `hsl(${colorVar} / 0.65)` }}
      >
        {icon}
      </div>

      {/* Folder body */}
      <div
        className="folder-body"
        style={{
          background: `hsl(${colorVar} / 0.14)`,
          borderColor: selected ? `hsl(${colorVar} / 0.85)` : `hsl(${colorVar} / 0.3)`,
          transform: bodyRotate,
        }}
      >
        {/* Mini sticker decoration */}
        <span
          className="absolute -top-1 -right-1 text-sm opacity-60 select-none"
          style={{ transform: `rotate(${12 + index * 7}deg)` }}
        >
          {stickerEmoji}
        </span>

        <div className="handwriting text-xl font-bold leading-tight mb-0.5">{title}</div>
        <div className="text-[10px] text-muted-foreground line-clamp-1 font-body">{subtitle}</div>
        {meta && (
          <div className="text-[9px] text-muted-foreground mt-1.5 font-body px-1.5 py-0.5 rounded-full bg-background/50 inline-block">
            {meta}
          </div>
        )}
      </div>
    </div>
  );
};

export default FolderCard;
