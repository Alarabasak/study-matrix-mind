import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';

const pageVariants = {
  initial: {
    rotateY: -90,
    opacity: 0,
    transformOrigin: 'left center',
  },
  animate: {
    rotateY: 0,
    opacity: 1,
    transformOrigin: 'left center',
    transition: {
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
  exit: {
    rotateY: 90,
    opacity: 0,
    transformOrigin: 'right center',
    transition: {
      duration: 0.35,
      ease: [0.55, 0.06, 0.68, 0.19],
    },
  },
};

interface PageTransitionProps {
  children: React.ReactNode;
}

const PageTransition: React.FC<PageTransitionProps> = ({ children }) => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        style={{ perspective: 1200, minHeight: '100vh' }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

export default PageTransition;
