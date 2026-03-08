import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getRandomReaction } from '@/data/reactionImages';

interface ReactionOverlayProps {
  trigger: { correct: boolean; key: number } | null;
}

const ReactionOverlay: React.FC<ReactionOverlayProps> = ({ trigger }) => {
  const [reaction, setReaction] = useState<{ src: string; side: 'left' | 'right'; key: number } | null>(null);

  useEffect(() => {
    if (!trigger) return;
    const src = getRandomReaction(trigger.correct);
    const side = Math.random() > 0.5 ? 'right' : 'left';
    setReaction({ src, side, key: trigger.key });

    const timeout = setTimeout(() => setReaction(null), 2200);
    return () => clearTimeout(timeout);
  }, [trigger]);

  return (
    <AnimatePresence>
      {reaction && (
        <motion.div
          key={reaction.key}
          initial={{
            opacity: 0,
            x: reaction.side === 'left' ? -200 : 200,
            y: 40,
            scale: 0.6,
            rotate: reaction.side === 'left' ? -15 : 15,
          }}
          animate={{
            opacity: 1,
            x: 0,
            y: 0,
            scale: 1,
            rotate: reaction.side === 'left' ? -4 : 4,
          }}
          exit={{
            opacity: 0,
            y: 60,
            scale: 0.5,
          }}
          transition={{ type: 'spring', damping: 14, stiffness: 180 }}
          className="fixed z-50 pointer-events-none"
          style={{
            top: '35%',
            [reaction.side]: '2%',
          }}
        >
          <img
            src={reaction.src}
            alt=""
            className="rounded-2xl shadow-2xl border-4 border-white/80"
            style={{ width: 'min(180px, 40vw)', height: 'auto', objectFit: 'cover' }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ReactionOverlay;
