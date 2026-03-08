import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface LockerRevealProps {
  displayName: string;
  onComplete: () => void;
}

const LockerReveal: React.FC<LockerRevealProps> = ({ displayName, onComplete }) => {
  const [doorOpen, setDoorOpen] = useState(false);

  const handleClick = () => {
    if (doorOpen) return;
    setDoorOpen(true);
    setTimeout(onComplete, 1200);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center cursor-pointer"
      style={{ background: 'linear-gradient(180deg, #1a1520 0%, #2a1f2e 50%, #1a1520 100%)' }}
      onClick={handleClick}
    >
      {/* Ambient glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 50% 40%, rgba(240,180,204,0.15) 0%, transparent 60%)',
        }}
      />

      {/* Title */}
      <motion.div
        className="text-center mb-8 z-10"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h2
          className="text-xl sm:text-2xl font-bold tracking-wider"
          style={{ fontFamily: 'var(--font-heading)', color: '#f0b4cc' }}
        >
          Dolabın Hazır! 🎒
        </h2>
        <motion.p
          className="text-xs mt-2 tracking-widest uppercase"
          style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--font-body)' }}
          animate={{ opacity: [0.3, 0.8, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          Açmak için dokun
        </motion.p>
      </motion.div>

      {/* Locker body */}
      <div className="relative w-[220px] h-[340px] z-10" style={{ perspective: '800px' }}>
        {/* Locker inside (revealed when door opens) */}
        <div
          className="absolute inset-0 rounded-md overflow-hidden"
          style={{
            background: '#3a2f20',
            boxShadow: 'inset 0 0 40px rgba(0,0,0,0.6)',
          }}
        >
          {/* Shelf lines */}
          <div className="absolute top-[30%] left-0 right-0 h-[2px]" style={{ background: 'rgba(255,255,255,0.08)' }} />
          <div className="absolute top-[60%] left-0 right-0 h-[2px]" style={{ background: 'rgba(255,255,255,0.08)' }} />
          {/* Interior items hint */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-4xl">📚</span>
          </div>
        </div>

        {/* Locker door — swings open on click */}
        <motion.div
          className="absolute inset-0 rounded-md overflow-hidden"
          style={{
            transformOrigin: 'left center',
            transformStyle: 'preserve-3d',
            backfaceVisibility: 'hidden',
          }}
          animate={doorOpen ? { rotateY: -120 } : { rotateY: 0 }}
          transition={{ duration: 1, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          {/* Door surface */}
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(180deg, #d4a44a 0%, #c49540 30%, #b8883a 100%)',
              boxShadow: 'inset 0 2px 0 rgba(255,255,255,0.2), inset 0 -2px 4px rgba(0,0,0,0.15)',
              border: '2px solid rgba(0,0,0,0.12)',
            }}
          />

          {/* Vent slots at top */}
          <div className="absolute top-4 left-6 right-6 flex flex-col gap-[6px]">
            {[0, 1, 2, 3].map(i => (
              <div key={i} className="h-[3px] rounded-full" style={{ background: 'rgba(0,0,0,0.15)' }} />
            ))}
          </div>

          {/* Name plate */}
          <div
            className="absolute top-20 left-1/2 -translate-x-1/2 px-6 py-2 rounded-sm"
            style={{
              background: 'rgba(255,255,255,0.75)',
              boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
              border: '1px solid rgba(0,0,0,0.08)',
            }}
          >
            <span
              className="text-base font-bold whitespace-nowrap"
              style={{ fontFamily: 'var(--font-display)', color: '#5a3d2a' }}
            >
              {displayName || 'Öğrenci'}
            </span>
          </div>

          {/* Decorative stickers */}
          <span className="absolute top-14 right-4 text-lg" style={{ transform: 'rotate(15deg)' }}>⭐</span>
          <span className="absolute bottom-24 left-5 text-xl" style={{ transform: 'rotate(-8deg)' }}>🎵</span>
          <span className="absolute top-36 right-6 text-sm" style={{ transform: 'rotate(5deg)' }}>💖</span>

          {/* Handle */}
          <div
            className="absolute right-5 top-1/2 -translate-y-1/2 w-3 h-12 rounded-full"
            style={{
              background: 'linear-gradient(180deg, #e8d5a8 0%, #c4a870 100%)',
              boxShadow: '2px 2px 6px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.4)',
            }}
          />

          {/* Lock area */}
          <div
            className="absolute right-[14px] top-[calc(50%+30px)] w-5 h-5 rounded-full flex items-center justify-center"
            style={{
              background: '#222',
              boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.4)',
            }}
          >
            <div className="w-1.5 h-2 rounded-sm" style={{ background: '#444' }} />
          </div>

          {/* Bottom vent slots */}
          <div className="absolute bottom-6 left-6 right-6 flex flex-col gap-[6px]">
            {[0, 1, 2, 3].map(i => (
              <div key={i} className="h-[3px] rounded-full" style={{ background: 'rgba(0,0,0,0.12)' }} />
            ))}
          </div>

          {/* Pink badge / pin */}
          <div
            className="absolute bottom-16 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, #ff9ed8, #f0b4cc)',
              boxShadow: '0 2px 8px rgba(255,158,216,0.3)',
              fontSize: '14px',
              fontFamily: 'var(--font-display)',
              color: '#fff',
              fontWeight: 'bold',
            }}
          >
            CP
          </div>
        </motion.div>

        {/* Subtle idle wobble */}
        {!doorOpen && (
          <motion.div
            className="absolute -bottom-8 left-0 right-0 text-center"
            animate={{ y: [0, 5, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <span className="text-2xl">👆</span>
          </motion.div>
        )}
      </div>

      {/* Fade out overlay when door opens */}
      <AnimatePresence>
        {doorOpen && (
          <motion.div
            className="absolute inset-0 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            style={{ background: '#fff' }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default LockerReveal;
