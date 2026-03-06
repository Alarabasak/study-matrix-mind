import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { BarChart3, BookOpen, Settings, X } from 'lucide-react';
import { getStats } from '@/utils/gameStats';

interface ProfileModalProps {
  open: boolean;
  onClose: () => void;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ open, onClose }) => {
  const navigate = useNavigate();
  const stats = getStats();

  const menuItems = [
    { icon: BarChart3, label: 'İstatistikler', emoji: '📊', path: '/dashboard' },
    { icon: BookOpen, label: 'Bilinmeyen Kelimeler', emoji: '📖', path: '/unknown-words' },
    { icon: Settings, label: 'Ayarlar', emoji: '⚙️', path: '/settings' },
  ];

  const goTo = (path: string) => {
    onClose();
    setTimeout(() => navigate(path), 200);
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 bg-foreground/30 backdrop-blur-sm z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="relative w-full max-w-sm overflow-hidden"
              initial={{ rotateY: -120, opacity: 0, transformOrigin: 'left center' }}
              animate={{ rotateY: 0, opacity: 1, transformOrigin: 'left center' }}
              exit={{ rotateY: -120, opacity: 0, transformOrigin: 'left center' }}
              transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
              style={{ perspective: 1000 }}
            >
              <div className="absolute left-0 top-0 bottom-0 w-3 bg-primary/60 rounded-l-xl z-10" />
              <div className="bg-card rounded-xl shadow-2xl border border-border ml-1.5 notebook-bg overflow-hidden">
                <div className="relative px-6 pt-6 pb-3">
                  <div className="tape top-2 right-4 z-10" />
                  <button
                    onClick={onClose}
                    className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-muted transition-colors z-20"
                  >
                    <X className="h-4 w-4 text-muted-foreground" />
                  </button>
                  <div className="text-center mb-2">
                    <div className="text-5xl mb-1">📓</div>
                    <h2 className="handwriting text-3xl font-bold text-foreground">Benim Defterim</h2>
                    <p className="text-xs text-muted-foreground mt-0.5 font-body">
                      {stats.totalGames} oyun · {stats.totalWordsFound} kelime
                    </p>
                  </div>
                </div>
                <div className="px-5 pb-5 space-y-2">
                  {menuItems.map((item, i) => (
                    <motion.button
                      key={item.path}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-secondary/50 hover:bg-secondary transition-all text-left group"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.15 + i * 0.07 }}
                      onClick={() => goTo(item.path)}
                    >
                      <span className="text-xl">{item.emoji}</span>
                      <span className="handwriting text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                        {item.label}
                      </span>
                      <item.icon className="h-4 w-4 text-muted-foreground ml-auto" />
                    </motion.button>
                  ))}
                </div>
                <div className="px-5 pb-4 text-center">
                  <p className="handwriting text-sm text-muted-foreground">~ çalışmaya devam! ✏️ ~</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ProfileModal;
