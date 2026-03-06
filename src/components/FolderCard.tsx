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

  return (
    <div
      className={cn('folder-card', selected && 'selected')}
      onClick={onClick}
      style={{ '--folder-color': `hsl(${colorVar})` } as React.CSSProperties}
    >
      {/* Tab */}
      <div
        className="folder-tab-glass"
        style={{ background: `hsl(${colorVar} / 0.6)` }}
      >
        {icon}
      </div>
      {/* Body */}
      <div
        className="folder-body-glass"
        style={{
          background: `hsl(${colorVar} / 0.12)`,
          borderColor: selected ? `hsl(${colorVar} / 0.8)` : `hsl(${colorVar} / 0.3)`,
        }}
      >
        <div className="handwriting text-xl font-bold leading-tight mb-0.5">{title}</div>
        <div className="text-[10px] text-muted-foreground line-clamp-1 font-body">{subtitle}</div>
        {meta && <div className="text-[9px] text-muted-foreground mt-1 font-body">{meta}</div>}
      </div>
    </div>
  );
};

export default FolderCard;
