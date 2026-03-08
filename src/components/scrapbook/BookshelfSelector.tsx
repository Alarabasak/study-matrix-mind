import React from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

/* 
  Realistic book styles inspired by art/design book photography.
  Each book has unique visual characteristics: spine bands, 
  accent stripes, page edge colors, and typography treatments.
*/
const BOOK_STYLES: Array<{
  spine: string;
  cover: string;
  text: string;
  thickness: number;
  accentBand?: { color: string; position: 'top' | 'bottom' | 'center'; size: number };
  pageEdgeColor?: string;
  spineTexture?: 'cloth' | 'matte' | 'glossy' | 'linen';
  hasPublisherMark?: boolean;
  secondaryText?: string;
}> = [
  {
    spine: '#2c2c2c', cover: '#1a1a1a', text: '#ffffff', thickness: 34,
    accentBand: { color: '#e74c3c', position: 'bottom', size: 8 },
    spineTexture: 'cloth', pageEdgeColor: '#f5f0e8',
  },
  {
    spine: '#f5f0e4', cover: '#ece7d9', text: '#1a1a1a', thickness: 22,
    spineTexture: 'matte', pageEdgeColor: '#fff',
    hasPublisherMark: true,
  },
  {
    spine: '#cc3333', cover: '#b82828', text: '#ffffff', thickness: 40,
    accentBand: { color: '#ff6600', position: 'center', size: 20 },
    spineTexture: 'glossy', pageEdgeColor: '#ff4400',
  },
  {
    spine: '#e8d44d', cover: '#d4c040', text: '#1a1a1a', thickness: 28,
    spineTexture: 'matte', pageEdgeColor: '#f5f0e8',
  },
  {
    spine: '#1a5276', cover: '#154360', text: '#ffffff', thickness: 36,
    accentBand: { color: '#2ecc71', position: 'bottom', size: 6 },
    spineTexture: 'cloth', pageEdgeColor: '#e8e4dc',
  },
  {
    spine: '#d4a0a0', cover: '#c89090', text: '#2c1010', thickness: 30,
    spineTexture: 'linen', pageEdgeColor: '#f8f4f0',
  },
  {
    spine: '#2ecc71', cover: '#27ae60', text: '#ffffff', thickness: 26,
    accentBand: { color: '#1a5c34', position: 'top', size: 4 },
    spineTexture: 'glossy', pageEdgeColor: '#f0ece4',
  },
  {
    spine: '#f0ece4', cover: '#e8e4dc', text: '#333', thickness: 32,
    accentBand: { color: '#c0a060', position: 'center', size: 3 },
    spineTexture: 'matte', pageEdgeColor: '#fff',
    hasPublisherMark: true, secondaryText: '···',
  },
  {
    spine: '#34495e', cover: '#2c3e50', text: '#ecf0f1', thickness: 38,
    spineTexture: 'cloth', pageEdgeColor: '#e0dcd4',
    accentBand: { color: '#f39c12', position: 'top', size: 5 },
  },
  {
    spine: '#e67e22', cover: '#d35400', text: '#fff', thickness: 24,
    spineTexture: 'glossy', pageEdgeColor: '#f5f0e8',
  },
];

const BOOK_HEIGHTS = [190, 205, 175, 210, 195, 180, 200, 215, 172, 198];

/* Natural lean angles — like books resting against each other on a shelf */
const BOOK_LEANS = [0, -2, -1, 3, 0, -3, 2, -1, 1, -2];

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

/* Spine texture overlay */
const getTextureStyle = (texture?: string): React.CSSProperties => {
  switch (texture) {
    case 'cloth':
      return {
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='4' height='4' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='4' height='4' fill='none'/%3E%3Cpath d='M0 0h1v1H0zm2 2h1v1H2z' fill='rgba(255,255,255,0.04)'/%3E%3C/svg%3E")`,
      };
    case 'linen':
      return {
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='6' height='6' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h6v1H0zm0 3h6v1H0z' fill='rgba(0,0,0,0.03)'/%3E%3C/svg%3E")`,
      };
    case 'glossy':
      return {
        backgroundImage: `linear-gradient(135deg, rgba(255,255,255,0.12) 0%, transparent 40%, transparent 60%, rgba(255,255,255,0.06) 100%)`,
      };
    default:
      return {};
  }
};

const BookshelfSelector: React.FC<BookshelfSelectorProps> = ({ items, selectedId, onSelect }) => {
  return (
    <div className="relative">
      <div
        className="relative flex items-end justify-center gap-[3px] sm:gap-1 px-2 pb-3 pt-4 overflow-x-auto"
        style={{ perspective: '900px' }}
      >
        {items.map((item, i) => {
          const style = BOOK_STYLES[i % BOOK_STYLES.length];
          const height = BOOK_HEIGHTS[i % BOOK_HEIGHTS.length];
          const isSelected = selectedId === item.id;
          const textureStyle = getTextureStyle(style.spineTexture);

          return (
            <motion.div
              key={item.id}
              className="relative cursor-pointer select-none flex-shrink-0 group"
              style={{
                width: style.thickness,
                height,
                transformStyle: 'preserve-3d',
                transformOrigin: 'left center',
              }}
              onClick={() => onSelect(item.id)}
              initial={{ opacity: 0, y: 40 }}
              animate={{
                opacity: 1,
                y: isSelected ? -18 : 0,
                rotateY: isSelected ? -45 : 0,
              }}
              transition={{
                delay: 0.05 + i * 0.04,
                type: 'spring',
                stiffness: 200,
                damping: 18,
              }}
              whileHover={{
                y: -12,
                rotateY: -45,
                transition: { duration: 0.35, ease: 'easeOut' },
              }}
              whileTap={{ scale: 0.97 }}
            >
              {/* ── SPINE (front face) ── */}
              <div
                className={cn(
                  'absolute inset-0 rounded-[2px] overflow-hidden',
                  isSelected && 'ring-2 ring-primary ring-offset-1 ring-offset-background'
                )}
                style={{
                  background: style.spine,
                  boxShadow: isSelected
                    ? `4px 4px 20px rgba(0,0,0,0.35), inset -1px 0 3px rgba(0,0,0,0.15)`
                    : `1px 2px 6px rgba(0,0,0,0.2), inset -1px 0 3px rgba(0,0,0,0.1)`,
                  ...textureStyle,
                }}
              >
                {/* Left edge highlight (spine crease) */}
                <div className="absolute left-0 top-0 bottom-0 w-[2px]"
                  style={{ background: 'rgba(255,255,255,0.15)' }} />
                <div className="absolute left-[3px] top-0 bottom-0 w-px"
                  style={{ background: 'rgba(0,0,0,0.08)' }} />

                {/* Accent band */}
                {style.accentBand && (
                  <div
                    className="absolute left-0 right-0"
                    style={{
                      background: style.accentBand.color,
                      height: style.accentBand.size,
                      ...(style.accentBand.position === 'top' && { top: 0 }),
                      ...(style.accentBand.position === 'bottom' && { bottom: 0 }),
                      ...(style.accentBand.position === 'center' && {
                        top: '50%',
                        transform: 'translateY(-50%)',
                      }),
                    }}
                  />
                )}

                {/* Vertical text */}
                <div
                  className="absolute inset-0 flex flex-col items-center justify-center gap-0.5 px-px"
                  style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}
                >
                  <span className="text-base leading-none drop-shadow-sm">{item.icon}</span>
                  <span
                    className="font-bold tracking-[0.08em] uppercase leading-none"
                    style={{
                      color: style.text,
                      fontFamily: 'var(--font-heading)',
                      fontSize: Math.min(10, style.thickness * 0.28) + 'px',
                      textShadow: style.text === '#ffffff' || style.text === '#fff' || style.text === '#ecf0f1'
                        ? '0 1px 3px rgba(0,0,0,0.4)'
                        : 'none',
                    }}
                  >
                    {item.title}
                  </span>
                  {style.secondaryText && (
                    <span style={{ color: style.text, fontSize: '7px', opacity: 0.5, letterSpacing: '0.15em' }}>
                      {style.secondaryText}
                    </span>
                  )}
                </div>

                {/* Publisher mark */}
                {style.hasPublisherMark && (
                  <div
                    className="absolute bottom-2 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full border"
                    style={{ borderColor: style.text, opacity: 0.3 }}
                  />
                )}

                {/* Top light edge */}
                <div className="absolute top-0 left-0 right-0 h-px"
                  style={{ background: 'rgba(255,255,255,0.12)' }} />
                {/* Bottom shadow edge */}
                <div className="absolute bottom-0 left-0 right-0 h-px"
                  style={{ background: 'rgba(0,0,0,0.15)' }} />
              </div>

              {/* ── COVER FACE (visible when rotated) ── */}
              <div
                className="absolute top-0 bottom-0 overflow-hidden rounded-r-[2px]"
                style={{
                  width: height * 0.65,
                  left: style.thickness,
                  background: style.cover,
                  transformOrigin: 'left center',
                  transform: 'rotateY(90deg)',
                  boxShadow: 'inset 2px 0 6px rgba(0,0,0,0.2)',
                }}
              >
                {/* Cover content */}
                <div className="absolute inset-0 p-3 flex flex-col justify-between">
                  <div>
                    <span className="text-2xl block mb-2">{item.icon}</span>
                    <h3
                      className="font-bold leading-tight mb-1"
                      style={{
                        color: style.text,
                        fontFamily: 'var(--font-heading)',
                        fontSize: '13px',
                      }}
                    >
                      {item.title}
                    </h3>
                    <p
                      className="leading-tight opacity-70"
                      style={{
                        color: style.text,
                        fontFamily: 'var(--font-body)',
                        fontSize: '9px',
                      }}
                    >
                      {item.subtitle}
                    </p>
                  </div>
                  {item.meta && (
                    <p
                      className="opacity-50"
                      style={{
                        color: style.text,
                        fontFamily: 'var(--font-body)',
                        fontSize: '8px',
                      }}
                    >
                      {item.meta}
                    </p>
                  )}
                </div>
                {/* Cover texture overlay */}
                <div className="absolute inset-0" style={textureStyle} />
              </div>

              {/* ── PAGE EDGES (right side, visible from front) ── */}
              <div
                className="absolute top-[2px] bottom-[2px] w-[5px]"
                style={{
                  right: -1,
                  background: `
                    linear-gradient(to right, 
                      ${style.pageEdgeColor || '#f5f0e8'} 0%, 
                      ${style.pageEdgeColor || '#ebe5d8'} 60%, 
                      #d8d3cb 100%
                    )`,
                  backgroundSize: '100% 100%',
                  borderRadius: '0 1px 1px 0',
                  boxShadow: 'inset 0 0 2px rgba(0,0,0,0.05)',
                }}
              >
                {/* Individual page lines */}
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundImage: `repeating-linear-gradient(to bottom, 
                      transparent 0px, transparent 1.5px, 
                      rgba(0,0,0,0.04) 1.5px, rgba(0,0,0,0.04) 2px)`,
                  }}
                />
              </div>

              {/* Tooltip */}
              <div className="absolute -top-16 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-30 whitespace-nowrap">
                <div
                  className="px-3 py-2 rounded-lg text-[10px] font-semibold shadow-xl border border-border"
                  style={{
                    background: 'hsl(var(--card))',
                    color: 'hsl(var(--foreground))',
                    fontFamily: 'var(--font-body)',
                  }}
                >
                  <div className="font-bold text-[11px]">{item.icon} {item.title}</div>
                  <div className="text-muted-foreground text-[9px]">{item.subtitle}</div>
                  {item.meta && <div className="text-muted-foreground text-[8px] mt-0.5">{item.meta}</div>}
                </div>
                <div
                  className="w-2 h-2 rotate-45 mx-auto -mt-1 border-r border-b border-border"
                  style={{ background: 'hsl(var(--card))' }}
                />
              </div>

              {/* Selection dot */}
              {isSelected && (
                <motion.div
                  className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-primary"
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
        className="h-[14px] rounded-[2px] mx-1 relative overflow-hidden"
        style={{
          background: 'linear-gradient(to bottom, #b89970, #a08060, #8b7355)',
          boxShadow: '0 4px 14px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.2)',
        }}
      >
        {/* Wood grain */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='200' height='14' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 3c30-2 50 4 80 2s40-4 70-2 30 3 50 1' fill='none' stroke='rgba(0,0,0,0.06)' stroke-width='0.5'/%3E%3Cpath d='M0 8c25-1 45 3 75 1s35-3 65-1 25 2 60 0' fill='none' stroke='rgba(0,0,0,0.04)' stroke-width='0.5'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'repeat-x',
          }}
        />
        {/* Front edge bevel */}
        <div className="absolute bottom-0 left-0 right-0 h-[3px]"
          style={{ background: 'linear-gradient(to bottom, transparent, rgba(0,0,0,0.12))' }} />
      </div>
      {/* Shelf shadow */}
      <div
        className="h-3 mx-4 rounded-b-lg"
        style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.1), transparent)' }}
      />
    </div>
  );
};

export default BookshelfSelector;
