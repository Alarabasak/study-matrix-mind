import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { categories, difficultyOptions } from '@/data/questions';
import { Button } from '@/components/ui/button';
import { Shuffle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DifficultyLevel } from '@/types/crossword';
import { fetchWordDatabase } from '@/utils/wordDatabase';
import SubjectFolder from '@/components/scrapbook/SubjectFolder';
import StickerBadge from '@/components/scrapbook/StickerBadge';
import WashiTape from '@/components/scrapbook/WashiTape';
import StickyNote from '@/components/scrapbook/StickyNote';
import NotebookPage from '@/components/scrapbook/NotebookPage';
import ProfileModal from '@/components/ProfileModal';
import { motion, AnimatePresence } from 'framer-motion';

/* Floating doodles scattered over the desk */
const DESK_DOODLES = ['📚', '✏️', '📎', '🎒', '📝', '🌸', '⭐', '💜', '🖇️', '📏', '🔖'];

const Index: React.FC = () => {
  const navigate = useNavigate();
  const [selectedGrade, setSelectedGrade] = useState<'TYT' | 'AYT' | null>(null);
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
        tc[cat.id] = new Set(words.map(w => w.topic)).size;
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
    navigate(`/game?category=${selectedCategory}&seed=${Date.now()}&difficulty=${selectedDifficulty}`);
  };

  const tyt = categories.filter(c => c.grade === 'TYT');
  const ayt = categories.filter(c => c.grade === 'AYT');
  const topicCount = selectedCategory ? (topicCounts[selectedCategory] || 0) : 0;

  const availableDiffs = difficultyOptions.filter(d => {
    if (d.id === 'all') return true;
    if (d.id === 'easy') return topicCount >= 1;
    if (d.id === 'medium') return topicCount >= 2;
    if (d.id === 'hard') return topicCount >= 5;
    if (d.id === 'super-hard') return topicCount >= 10;
    return true;
  });

  return (
    <div className="min-h-screen desk-surface flex flex-col overflow-x-hidden">

      {/* ── Floating desk doodles ── */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {DESK_DOODLES.map((emoji, i) => (
          <motion.span
            key={i}
            className="absolute text-xl sm:text-2xl select-none"
            style={{
              top: `${8 + (i * 11) % 82}%`,
              left: `${3 + (i * 13) % 92}%`,
              opacity: 0.055,
            }}
            animate={{ y: [0, -5, 0], rotate: [0, i % 2 === 0 ? 4 : -4, 0] }}
            transition={{ duration: 5 + i * 0.6, repeat: Infinity, ease: 'easeInOut' }}
          >
            {emoji}
          </motion.span>
        ))}
      </div>

      {/* ═══ HEADER ═══ */}
      <header className="relative text-center pt-8 pb-4 px-4 z-10">
        {/* Profile notebook */}
        <motion.button
          className="absolute top-4 right-4 text-3xl hover:scale-110 transition-transform"
          onClick={() => setProfileOpen(true)}
          whileTap={{ scale: 0.9 }}
          title="Profilim"
        >
          📓
        </motion.button>

        {/* Washi tape decoration */}
        <WashiTape variant="striped" width={90} rotation={-3} className="top-2 left-1/2 -translate-x-1/2" />

        <motion.h1
          className="handwriting text-6xl sm:text-8xl font-bold text-foreground tracking-tight mt-4"
          initial={{ opacity: 0, y: -24, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, ease: [0.34, 1.56, 0.64, 1] }}
        >
          Cross<span className="text-primary">Prep</span>
        </motion.h1>

        <motion.p
          className="text-muted-foreground max-w-sm mx-auto text-sm mt-1"
          style={{ fontFamily: 'var(--font-body)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          Oyun oynarken öğren! ✏️ TYT & AYT konularını çengel bulmacalarla pekiştir.
        </motion.p>

        <div className="flex justify-center gap-3 mt-4 flex-wrap">
          <StickerBadge color="pink" rotation={-3}>🎒 Okula Dönüş</StickerBadge>
          <StickerBadge color="blue" rotation={2}>📚 Çalış & Oyna</StickerBadge>
        </div>
      </header>

      {/* ═══ TYT FOLDERS ═══ */}
      <section className="max-w-2xl mx-auto w-full px-4 mb-6 z-10">
        <div className="flex items-center gap-2.5 mb-4">
          <WashiTape variant="pink" width={36} rotation={-1} className="relative" />
          <h2 className="handwriting text-2xl sm:text-3xl font-bold">🎯 TYT Dersleri</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
          {tyt.map((cat, i) => (
            <motion.div
              key={cat.id + i}
              initial={{ opacity: 0, y: 30, rotate: i % 2 === 0 ? -3 : 3 }}
              animate={{ opacity: 1, y: 0, rotate: 0 }}
              transition={{ delay: 0.08 + i * 0.05, type: 'spring', stiffness: 180, damping: 16 }}
            >
              <SubjectFolder
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
      </section>

      {/* ═══ AYT FOLDERS ═══ */}
      {ayt.length > 0 && (
        <section className="max-w-2xl mx-auto w-full px-4 mb-6 z-10">
          <div className="flex items-center gap-2.5 mb-4">
            <WashiTape variant="blue" width={36} rotation={1} className="relative" />
            <h2 className="handwriting text-2xl sm:text-3xl font-bold">🚀 AYT Dersleri</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
            {ayt.map((cat, i) => (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 30, rotate: i % 2 === 0 ? 2 : -2 }}
                animate={{ opacity: 1, y: 0, rotate: 0 }}
                transition={{ delay: 0.15 + i * 0.05, type: 'spring', stiffness: 180, damping: 16 }}
              >
                <SubjectFolder
                  index={i + tyt.length}
                  icon={cat.icon}
                  title={cat.name.replace('AYT ', '')}
                  subtitle={cat.description}
                  selected={selectedCategory === cat.id}
                  onClick={() => { setSelectedCategory(cat.id); setSelectedDifficulty('all'); }}
                />
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* ═══ SHUFFLE (Sticky note card) ═══ */}
      <section className="max-w-2xl mx-auto w-full px-4 mb-6 z-10">
        <StickyNote
          color="yellow"
          rotation={-0.5}
          onClick={() => { setSelectedCategory('shuffle'); setSelectedDifficulty('all'); }}
          className={cn(
            'rounded-lg transition-all',
            selectedCategory === 'shuffle' && 'ring-2 ring-primary ring-offset-2 ring-offset-background'
          )}
        >
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-accent/15 flex items-center justify-center">
              <Shuffle className="h-5 w-5 text-accent" />
            </div>
            <div>
              <div className="handwriting text-xl font-bold text-foreground">🔀 Karıştır</div>
              <div className="text-[11px] text-muted-foreground" style={{ fontFamily: 'var(--font-body)' }}>
                Tüm derslerden karışık · {wordCounts['shuffle'] || 0} kelime · {topicCounts['shuffle'] || 0} konu
              </div>
            </div>
          </div>
        </StickyNote>
      </section>

      {/* ═══ DIFFICULTY (Notebook page) ═══ */}
      <AnimatePresence>
        {selectedCategory && (
          <motion.section
            className="max-w-2xl mx-auto w-full px-4 mb-6 z-10"
            initial={{ opacity: 0, height: 0, y: 20 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -10 }}
            transition={{ duration: 0.4, type: 'spring', stiffness: 180, damping: 20 }}
          >
            <NotebookPage>
              <h2 className="handwriting text-2xl font-bold mb-3 flex items-center gap-2">⚡ Zorluk Seviyesi</h2>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {availableDiffs.map((d, i) => (
                  <motion.div
                    key={d.id}
                    className={cn('size-chip text-center text-xs py-2.5', selectedDifficulty === d.id && 'selected')}
                    onClick={() => setSelectedDifficulty(d.id)}
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.04 }}
                    whileHover={{ scale: 1.06 }}
                    whileTap={{ scale: 0.94 }}
                  >
                    <div className="text-lg">{d.icon}</div>
                    <div className="font-bold" style={{ fontFamily: 'var(--font-heading)' }}>{d.name}</div>
                    <div className="text-[9px] text-muted-foreground">{d.topicCount}</div>
                  </motion.div>
                ))}
              </div>
            </NotebookPage>
          </motion.section>
        )}
      </AnimatePresence>

      {/* ═══ START BUTTON ═══ */}
      <div className="max-w-2xl mx-auto w-full px-4 pb-8 mt-auto z-10">
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
          <Button
            className="w-full h-14 text-lg font-bold rounded-2xl shadow-lg transition-all hover:shadow-xl disabled:opacity-40"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.5rem',
              boxShadow: selectedCategory ? '0 6px 28px hsl(346 58% 56% / 0.3)' : undefined,
            }}
            disabled={!selectedCategory}
            onClick={handleStart}
          >
            {selectedCategory ? '🎮 Bulmacayı Başlat' : 'Bir ders seçin ✏️'}
          </Button>
        </motion.div>

        {/* Bottom tape deco */}
        <div className="flex justify-center mt-5 gap-4 opacity-25">
          <WashiTape variant="yellow" width={50} rotation={-5} className="relative" />
          <WashiTape variant="pink" width={60} rotation={3} className="relative" />
          <WashiTape variant="blue" width={45} rotation={-2} className="relative" />
        </div>
      </div>

      <ProfileModal open={profileOpen} onClose={() => setProfileOpen(false)} />
    </div>
  );
};

export default Index;
