import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { categories, difficultyOptions } from '@/data/questions';
import { Button } from '@/components/ui/button';
import { Shuffle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DifficultyLevel } from '@/types/crossword';
import { fetchWordDatabase } from '@/utils/wordDatabase';
import FolderCard from '@/components/FolderCard';
import ProfileModal from '@/components/ProfileModal';
import { motion, AnimatePresence } from 'framer-motion';

const floatingStickers = ['📚', '✏️', '📎', '🎒', '📝', '🌸', '⭐', '💜'];

const Index: React.FC = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyLevel>('all');
  const [profileOpen, setProfileOpen] = useState(false);
  const [wordCounts, setWordCounts] = useState<Record<string, number>>({});
  const [topicCounts, setTopicCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    fetchWordDatabase().then(db => {
      const wc: Record<string, number> = {};
      const tc: Record<string, number> = {};

      for (const cat of categories) {
        const words = db[cat.id] || [];
        wc[cat.id] = words.length;
        const topics = new Set(words.map(w => w.topic));
        tc[cat.id] = topics.size;
      }

      const allWords = Object.values(db).flat();
      wc['shuffle'] = allWords.length;
      tc['shuffle'] = new Set(allWords.map(w => w.topic)).size;

      setWordCounts(wc);
      setTopicCounts(tc);
    });
  }, []);

  const handleStart = () => {
    if (!selectedCategory) return;
    const seed = Date.now();
    navigate(`/game?category=${selectedCategory}&seed=${seed}&difficulty=${selectedDifficulty}`);
  };

  const tytCategories = categories.filter(c => c.grade === 'TYT');
  const aytCategories = categories.filter(c => c.grade === 'AYT');

  const topicCount = selectedCategory ? (topicCounts[selectedCategory] || 0) : 0;

  const availableDifficulties = difficultyOptions.filter(d => {
    if (d.id === 'all') return true;
    if (d.id === 'easy') return topicCount >= 1;
    if (d.id === 'medium') return topicCount >= 2;
    if (d.id === 'hard') return topicCount >= 5;
    if (d.id === 'super-hard') return topicCount >= 10;
    return true;
  });

  return (
    <div className="min-h-screen bg-background paper-texture flex flex-col overflow-hidden">
      {/* Floating sticker decorations */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {floatingStickers.map((s, i) => (
          <motion.span
            key={i}
            className="absolute text-2xl sm:text-3xl opacity-[0.07] select-none"
            style={{
              top: `${10 + (i * 12) % 85}%`,
              left: `${5 + (i * 17) % 90}%`,
            }}
            animate={{
              y: [0, -8, 0],
              rotate: [0, i % 2 === 0 ? 5 : -5, 0],
            }}
            transition={{
              duration: 4 + i * 0.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            {s}
          </motion.span>
        ))}
      </div>

      {/* ── Header ── */}
      <div className="relative text-center pt-8 pb-3 px-4 z-10">
        {/* Profile notebook button */}
        <motion.button
          className="absolute top-4 right-4 text-3xl hover:scale-110 transition-transform"
          onClick={() => setProfileOpen(true)}
          whileTap={{ scale: 0.9 }}
          title="Profilim"
        >
          📓
        </motion.button>

        {/* Decorative washi tape */}
        <div className="washi-tape mx-auto mb-3" style={{ width: '80px', transform: 'rotate(-3deg)', position: 'relative' }} />

        <motion.h1
          className="handwriting text-5xl sm:text-7xl font-bold text-foreground tracking-tight"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
        >
          Cross<span className="text-primary">Prep</span>
        </motion.h1>

        <motion.p
          className="text-muted-foreground max-w-sm mx-auto text-sm mt-2 font-body"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
        >
          Oyun oynarken öğren! ✏️ TYT & AYT konularını çengel bulmacalarla pekiştir.
        </motion.p>

        {/* Sticker badges */}
        <div className="flex justify-center gap-3 mt-4 flex-wrap">
          <motion.span
            className="sticker bg-primary/15 text-primary"
            initial={{ scale: 0, rotate: -10 }}
            animate={{ scale: 1, rotate: -2 }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 300 }}
          >
            🎒 Okula Dönüş
          </motion.span>
          <motion.span
            className="sticker bg-accent/15 text-accent"
            style={{ transform: 'rotate(2deg)' }}
            initial={{ scale: 0, rotate: 10 }}
            animate={{ scale: 1, rotate: 2 }}
            transition={{ delay: 0.4, type: 'spring', stiffness: 300 }}
          >
            📚 Çalış & Oyna
          </motion.span>
        </div>
      </div>

      {/* ── TYT Section ── */}
      <div className="max-w-2xl mx-auto w-full px-4 mb-5 mt-4 z-10">
        <div className="flex items-center gap-2 mb-4">
          <div className="tape tape-pink" style={{ transform: 'rotate(-2deg)', position: 'relative', width: '40px', height: '18px' }} />
          <h2 className="handwriting text-2xl font-bold flex items-center gap-2">🎯 TYT Dersleri</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {tytCategories.map((cat, i) => (
            <motion.div
              key={cat.id + i}
              initial={{ opacity: 0, y: 24, rotate: i % 2 === 0 ? -2 : 2 }}
              animate={{ opacity: 1, y: 0, rotate: 0 }}
              transition={{ delay: 0.1 + i * 0.06, type: 'spring', stiffness: 200 }}
            >
              <FolderCard
                index={i}
                icon={cat.icon}
                title={cat.name.replace('TYT ', '')}
                subtitle={cat.description}
                meta={`${wordCounts[cat.id] || 0} kelime · ${topicCounts[cat.id] || 0} konu`}
                selected={selectedCategory === cat.id}
                onClick={() => { setSelectedCategory(cat.id); setSelectedDifficulty('all'); }}
              />
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── Shuffle ── */}
      <div className="max-w-2xl mx-auto w-full px-4 mb-5 z-10">
        <motion.div
          className={cn(
            'relative cursor-pointer rounded-2xl p-4 border-2 doodle-border transition-all duration-300',
            selectedCategory === 'shuffle'
              ? 'border-primary bg-primary/5 shadow-lg'
              : 'bg-card/50 hover:bg-card/80'
          )}
          onClick={() => { setSelectedCategory('shuffle'); setSelectedDifficulty('all'); }}
          whileHover={{ y: -3, rotate: -0.5 }}
          whileTap={{ scale: 0.98 }}
        >
          {/* Decorative tape */}
          <div className="tape tape-green absolute -top-2.5 left-6" style={{ transform: 'rotate(-4deg)', width: '50px', height: '16px' }} />

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
              <Shuffle className="h-6 w-6 text-accent" />
            </div>
            <div>
              <div className="handwriting text-xl font-bold">🔀 Karıştır</div>
              <div className="text-[11px] text-muted-foreground font-body">
                Tüm derslerden karışık · {wordCounts['shuffle'] || 0} kelime · {topicCounts['shuffle'] || 0} konu
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ── AYT Section ── */}
      {aytCategories.length > 0 && (
        <div className="max-w-2xl mx-auto w-full px-4 mb-5 z-10">
          <div className="flex items-center gap-2 mb-4">
            <div className="tape tape-blue" style={{ transform: 'rotate(1deg)', position: 'relative', width: '40px', height: '18px' }} />
            <h2 className="handwriting text-2xl font-bold flex items-center gap-2">🚀 AYT Dersleri</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {aytCategories.map((cat, i) => (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 24, rotate: i % 2 === 0 ? 2 : -2 }}
                animate={{ opacity: 1, y: 0, rotate: 0 }}
                transition={{ delay: 0.2 + i * 0.06, type: 'spring', stiffness: 200 }}
              >
                <FolderCard
                  index={i + tytCategories.length}
                  icon={cat.icon}
                  title={cat.name.replace('AYT ', '')}
                  subtitle={cat.description}
                  selected={selectedCategory === cat.id}
                  onClick={() => { setSelectedCategory(cat.id); setSelectedDifficulty('all'); }}
                />
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* ── Difficulty ── */}
      <AnimatePresence>
        {selectedCategory && (
          <motion.div
            className="max-w-2xl mx-auto w-full px-4 mb-5 z-10"
            initial={{ opacity: 0, height: 0, y: 20 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -10 }}
            transition={{ duration: 0.35, type: 'spring', stiffness: 200 }}
          >
            <div className="sticky-note-blue rounded-xl p-4" style={{ transform: 'rotate(0.3deg)' }}>
              <h2 className="handwriting text-2xl font-bold mb-3 flex items-center gap-2">⚡ Zorluk Seviyesi</h2>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {availableDifficulties.map(d => (
                  <motion.div
                    key={d.id}
                    className={cn('size-chip text-center text-xs py-2.5', selectedDifficulty === d.id && 'selected')}
                    onClick={() => setSelectedDifficulty(d.id)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div className="text-lg">{d.icon}</div>
                    <div className="font-bold" style={{ fontFamily: 'var(--font-heading)' }}>{d.name}</div>
                    <div className="text-[9px] text-muted-foreground">{d.topicCount}</div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Start button ── */}
      <div className="max-w-2xl mx-auto w-full px-4 pb-8 mt-auto z-10">
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
          <Button
            className="w-full h-14 text-lg font-bold rounded-2xl shadow-lg transition-all hover:shadow-xl disabled:opacity-40"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.4rem',
              boxShadow: selectedCategory ? '0 6px 24px hsl(350 55% 62% / 0.25)' : undefined,
            }}
            disabled={!selectedCategory}
            onClick={handleStart}
          >
            {selectedCategory ? '🎮 Bulmacayı Başlat' : 'Bir ders seçin ✏️'}
          </Button>
        </motion.div>

        {/* Bottom decorative tape */}
        <div className="flex justify-center mt-4 gap-3 opacity-30">
          <div className="tape" style={{ transform: 'rotate(-5deg)', position: 'relative', width: '50px', height: '16px' }} />
          <div className="tape tape-pink" style={{ transform: 'rotate(3deg)', position: 'relative', width: '60px', height: '16px' }} />
          <div className="tape tape-blue" style={{ transform: 'rotate(-2deg)', position: 'relative', width: '45px', height: '16px' }} />
        </div>
      </div>

      <ProfileModal open={profileOpen} onClose={() => setProfileOpen(false)} />
    </div>
  );
};

export default Index;
