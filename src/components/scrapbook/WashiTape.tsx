import React from 'react';
import { cn } from '@/lib/utils';

type TapeVariant = 'striped' | 'dotted' | 'pink' | 'blue' | 'yellow';

interface WashiTapeProps {
  variant?: TapeVariant;
  width?: number;
  rotation?: number;
  className?: string;
  style?: React.CSSProperties;
}

const VARIANT_CLASS: Record<TapeVariant, string> = {
  striped: 'washi-striped',
  dotted: 'washi-dotted',
  pink: 'washi-solid-pink',
  blue: 'washi-solid-blue',
  yellow: 'washi-solid-yellow',
};

const WashiTape: React.FC<WashiTapeProps> = ({
  variant = 'striped',
  width = 70,
  rotation = -3,
  className = '',
  style,
}) => (
  <div
    className={cn('washi', VARIANT_CLASS[variant], className)}
    style={{
      width: `${width}px`,
      transform: `rotate(${rotation}deg)`,
      ...style,
    }}
  />
);

export default WashiTape;
