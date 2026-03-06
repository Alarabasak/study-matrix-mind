import React from 'react';

type ClipColor = 'silver' | 'gold' | 'pink' | 'blue' | 'green';

const COLORS: Record<ClipColor, string> = {
  silver: '#a8a8a8',
  gold: '#c9a84c',
  pink: '#d4829a',
  blue: '#7ba7cc',
  green: '#7fb89e',
};

interface PaperClipProps {
  color?: ClipColor;
  className?: string;
  style?: React.CSSProperties;
}

const PaperClip: React.FC<PaperClipProps> = ({ color = 'silver', className = '', style }) => {
  const c = COLORS[color];
  return (
    <svg
      className={`pointer-events-none select-none ${className}`}
      width="20"
      height="50"
      viewBox="0 0 20 50"
      fill="none"
      style={style}
    >
      <path
        d="M6 2 C6 2 3 2 3 6 L3 38 C3 42 7 44 10 44 C13 44 17 42 17 38 L17 12 C17 9 14 7 12 7 C10 7 7 9 7 12 L7 34"
        stroke={c}
        strokeWidth="2.2"
        strokeLinecap="round"
        fill="none"
        opacity="0.75"
      />
    </svg>
  );
};

export default PaperClip;
