import React from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

/* ── Book color palette (vibrant, editorial) ── */
const BOOK_STYLES = [
  { spine: '#e85d75', cover: '#d14e65', text: '#fff', thickness: 38 },
  { spine: '#4a8fe7', cover: '#3b7dd4', text: '#fff', thickness: 28 },
  { spine: '#5cb85c', cover: '#4da54d', text: '#fff', thickness: 34 },
  { spine: '#9b59b6', cover: '#8a48a5', text: '#fff', thickness: 30 },
  { spine: '#f0ad4e', cover: '#e09d3e', text: '#2a1a00', thickness: 36 },
  { spine: '#e74c3c', cover: '#d43d2d', text: '#fff', thickness: 26 },
  { spine: '#1abc9c', cover: '#16a589', text: '#fff', thickness: 32 },
  { spine: '#ff6b81', cover: '#ee5a70', text: '#fff', thickness: 40 },
  { spine: '#3498db', cover: '#2980b9', text: '#fff', thickness: 28 },
  { spine: '#e67e22', cover: '#d46b13', text: '#fff', thickness: 35 },
];

const BOOK_HEIGHTS = [180, 195, 170, 200, 185, 175, 190, 205, 168, 188];

interface BookItem {
  id: string;
  icon: string;
  title: string;
  subtitle: string;
  meta?: string;
}

interface BookshelfSelectorProps {
  items: BookItem[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

const BookshelfSelector: React.FC<BookshelfSelectorProps> = ({ items, selectedId, onSelect }) => {
  return (
    <div className="relative">
      {/* Shelf surface */}
      <div
        className="relative flex items-end justify-center gap-1 sm:gap-1.5 px-2 pb-3 pt-4 overflow-x-auto"
        style={{ perspective: '800px' }}
      >
        {items.map((item, i) => {
          const style = BOOK_STYLES[i % BOOK_STYLES.length];
          const height = BOOK_HEIGHTS[i % BOOK_HEIGHTS.length];
          const isSelected = selectedId === item.id;

          return (
            <motion.div
              key={item.id}
              className={cn(
                'relative cursor-pointer select-none flex-shrink-0 group',
              )}
              style={{
                width: style.thickness,
                height,
                transformStyle: 'preserve-3d',
              }}
              onClick={() => onSelect(item.id)}
              initial={{ opacity: 0, y: 40, rotateY: 0 }}
              animate={{
                opacity: 1,
                y: isSelected ? -16 : 0,
                rotateY: isSelected ? -50 : 0,
              }}
              transition={{
                delay: 0.05 + i * 0.04,
                type: 'spring',
                stiffness: 200,
                damping: 18,
              }}
              whileHover={{
                y: -10,
                rotateY: -50,
                transition: { duration: 0.35, ease: 'easeOut' },
              }}
              whileTap={{ scale: 0.96 }}
            >
              {/* Book body */}
              <div
                className={cn(
                  'w-full h-full rounded-sm relative overflow-hidden transition-shadow duration-300',
                  isSelected && 'ring-2 ring-primary ring-offset-1 ring-offset-background'
                )}
                style={{
                  background: `linear-gradient(135deg, ${style.spine} 0%, ${style.cover} 100%)`,
                  boxShadow: isSelected
                    ? `3px 3px 16px rgba(0,0,0,0.25), inset -2px 0 4px rgba(0,0,0,0.15)`
                    : `2px 2px 8px rgba(0,0,0,0.15), inset -2px 0 4px rgba(0,0,0,0.1)`,
                }}
              >
                {/* Spine highlight */}
                <div
                  className="absolute left-0 top-0 bottom-0 w-[3px]"
                  style={{ background: 'rgba(255,255,255,0.2)' }}
                />
                {/* Spine line */}
                <div
                  className="absolute left-[5px] top-0 bottom-0 w-[1px]"
                  style={{ background: 'rgba(0,0,0,0.1)' }}
                />

                {/* Vertical text on spine */}
                <div
                  className="absolute inset-0 flex flex-col items-center justify-center gap-1"
                  style={{
                    writingMode: 'vertical-rl',
                    textOrientation: 'mixed',
                  }}
                >
                  <span className="text-lg leading-none">{item.icon}</span>
                  <span
                    className="text-[9px] font-bold tracking-wider uppercase leading-none"
                    style={{
                      color: style.text,
                      fontFamily: 'var(--font-heading)',
                      textShadow: '0 1px 2px rgba(0,0,0,0.2)',
                    }}
                  >
                    {item.title}
                  </span>
                </div>

                {/* Top/bottom edge details */}
                <div
                  className="absolute top-0 left-0 right-0 h-[2px]"
                  style={{ background: 'rgba(255,255,255,0.15)' }}
                />
                <div
                  className="absolute bottom-0 left-0 right-0 h-[2px]"
                  style={{ background: 'rgba(0,0,0,0.1)' }}
                />

                {/* Page edges (right side) */}
                <div
                  className="absolute right-0 top-[3px] bottom-[3px] w-[4px]"
                  style={{
                    background: 'repeating-linear-gradient(to bottom, #f5f0e8 0px, #f5f0e8 1px, #ebe5d8 1px, #ebe5d8 2px)',
                    borderRadius: '0 1px 1px 0',
                  }}
                />
              </div>

              {/* Tooltip on hover */}
              <div className="absolute -top-14 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-30 whitespace-nowrap">
                <div
                  className="px-2.5 py-1.5 rounded-lg text-[10px] font-semibold shadow-lg border border-border"
                  style={{
                    background: 'hsl(var(--card))',
                    color: 'hsl(var(--foreground))',
                    fontFamily: 'var(--font-body)',
                  }}
                >
                  <div className="font-bold">{item.icon} {item.title}</div>
                  {item.meta && <div className="text-muted-foreground text-[8px]">{item.meta}</div>}
                </div>
                {/* Arrow */}
                <div
                  className="w-2 h-2 rotate-45 mx-auto -mt-1 border-r border-b border-border"
                  style={{ background: 'hsl(var(--card))' }}
                />
              </div>

              {/* Selection indicator */}
              {isSelected && (
                <motion.div
                  className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-primary"
                  layoutId="book-indicator"
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                />
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Shelf board */}
      <div
        className="h-3 rounded-sm mx-1"
        style={{
          background: 'linear-gradient(to bottom, #a08060, #8b7355, #7a6548)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.15)',
        }}
      />
      {/* Shelf shadow */}
      <div
        className="h-2 mx-3 rounded-b-lg"
        style={{
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.12), transparent)',
        }}
      />
    </div>
  );
};

export default BookshelfSelector;
