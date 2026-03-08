import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { categories, difficultyOptions } from '@/data/questions';
import { Button } from '@/components/ui/button';
import { Shuffle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DifficultyLevel } from '@/types/crossword';
import { fetchWordDatabase } from '@/utils/wordDatabase';
import BookshelfSelector from '@/components/scrapbook/BookshelfSelector';
import NotebookPage from '@/components/scrapbook/NotebookPage';
import ProfileModal from '@/components/ProfileModal';
import ExamCountdown from '@/components/ExamCountdown';
import { motion, AnimatePresence } from 'framer-motion';

/* Vintage duotone doodle animals — red/pink SVG style like the reference */
const VINTAGE_DOODLES = [
  { emoji: '🦌', style: { top: '5%', left: '3%', fontSize: '2.5rem', transform: 'rotate(-12deg)' } },
  { emoji: '🐎', style: { top: '8%', right: '5%', fontSize: '2rem', transform: 'rotate(8deg)' } },
  { emoji: '🐦', style: { top: '25%', right: '2%', fontSize: '1.8rem', transform: 'rotate(-5deg) scaleX(-1)' } },
  { emoji: '🐇', style: { bottom: '15%', left: '2%', fontSize: '2rem', transform: 'rotate(6deg)' } },
  { emoji: '🐔', style: { bottom: '8%', right: '4%', fontSize: '1.8rem', transform: 'rotate(-10deg)' } },
  { emoji: '🐟', style: { top: '45%', left: '1%', fontSize: '1.6rem', transform: 'rotate(15deg)' } },
  { emoji: '✏️', style: { top: '60%', right: '1%', fontSize: '1.5rem', transform: 'rotate(-25deg)' } },
  { emoji: '📎', style: { bottom: '35%', left: '4%', fontSize: '1.4rem', transform: 'rotate(20deg)' } },
];

/* Chaotic desk items — scattered behind content */
const DESK_CLUTTER = [
  { text: '📚', style: { bottom: '5%', left: '8%', fontSize: '3rem', transform: 'rotate(-8deg)', opacity: 0.12 } },
  { text: '🎒', style: { top: '12%', left: '8%', fontSize: '2.5rem', transform: 'rotate(5deg)', opacity: 0.08 } },
  { text: '📏', style: { bottom: '20%', right: '6%', fontSize: '2rem', transform: 'rotate(35deg)', opacity: 0.1 } },
  { text: '🖇️', style: { top: '40%', right: '8%', fontSize: '1.8rem', transform: 'rotate(-15deg)', opacity: 0.09 } },
  { text: '☕', style: { top: '70%', left: '6%', fontSize: '2.2rem', transform: 'rotate(3deg)', opacity: 0.1 } },
];

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

  const filteredCategories = selectedGrade
    ? categories.filter(c => c.grade === selectedGrade)
    : [];
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
    <div className="min-h-screen flex flex-col overflow-x-hidden relative"
      style={{
        background: 'hsl(42 42% 95%)',
        backgroundImage: `
          radial-gradient(ellipse at 20% 50%, hsl(348 62% 84% / 0.08) 0%, transparent 50%),
          radial-gradient(ellipse at 80% 30%, hsl(208 55% 80% / 0.08) 0%, transparent 50%)
        `,
      }}
    >
      {/* ── Vintage duotone doodles (red/pink filter) ── */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {VINTAGE_DOODLES.map((d, i) => (
          <motion.span
            key={`doodle-${i}`}
            className="absolute select-none"
            style={{
              ...d.style,
              filter: 'sepia(1) saturate(3) hue-rotate(-30deg) brightness(0.9)',
              opacity: 0.12,
            }}
            animate={{ y: [0, -4, 0], rotate: [0, i % 2 === 0 ? 3 : -3, 0] }}
            transition={{ duration: 6 + i * 0.8, repeat: Infinity, ease: 'easeInOut' }}
          >
            {d.emoji}
          </motion.span>
        ))}

        {/* Desk clutter background */}
        {DESK_CLUTTER.map((item, i) => (
          <span
            key={`clutter-${i}`}
            className="absolute select-none"
            style={item.style}
          >
            {item.text}
          </span>
        ))}

        {/* Wavy water line decoration (bottom, like the reference) */}
        <svg className="absolute bottom-0 left-0 w-full h-16 opacity-[0.06]" viewBox="0 0 400 40" preserveAspectRatio="none">
          <path d="M0 20 Q25 5 50 20 T100 20 T150 20 T200 20 T250 20 T300 20 T350 20 T400 20" fill="none" stroke="#c41e3a" strokeWidth="3" />
          <path d="M0 28 Q25 13 50 28 T100 28 T150 28 T200 28 T250 28 T300 28 T350 28 T400 28" fill="none" stroke="#c41e3a" strokeWidth="2.5" />
          <path d="M0 36 Q25 21 50 36 T100 36 T150 36 T200 36 T250 36 T300 36 T350 36 T400 36" fill="none" stroke="#c41e3a" strokeWidth="2" />
        </svg>
      </div>

      {/* ═══ HEADER ═══ */}
      <header className="relative text-center pt-8 pb-4 px-4 z-10">
        {/* Profile button — vintage badge style */}
        <motion.button
          className="absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center"
          style={{
            background: 'linear-gradient(135deg, #f4a6c0, #c41e3a)',
            color: '#fff',
            fontFamily: 'var(--font-display)',
            fontSize: '1rem',
            fontWeight: 'bold',
            boxShadow: '0 3px 10px rgba(196,30,58,0.25)',
            border: '2px solid rgba(255,255,255,0.4)',
          }}
          onClick={() => setProfileOpen(true)}
          whileTap={{ scale: 0.9 }}
          whileHover={{ scale: 1.1 }}
          title="Profilim"
        >
          📓
        </motion.button>

        {/* Blue cursive subtitle — like the reference handwriting */}
        <motion.p
          className="text-sm tracking-wider mb-1"
          style={{
            fontFamily: 'var(--font-display)',
            color: '#2b4a8c',
            fontWeight: 600,
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          ✦ study edition · 2025 ✦
        </motion.p>

        <motion.h1
          className="text-6xl sm:text-8xl font-bold tracking-tight"
          style={{
            fontFamily: 'var(--font-display)',
            background: 'linear-gradient(135deg, #c41e3a 30%, #e85d75 70%, #f4a6c0)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            filter: 'drop-shadow(0 2px 4px rgba(196,30,58,0.15))',
          }}
          initial={{ opacity: 0, y: -24, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, ease: [0.34, 1.56, 0.64, 1] }}
        >
          CrossPrep
        </motion.h1>

        {/* Blue cursive tagline */}
        <motion.p
          className="text-base mt-1"
          style={{
            fontFamily: 'var(--font-display)',
            color: '#2b4a8c',
            fontStyle: 'italic',
          }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          animals are made with the same basic stroke
        </motion.p>

        <ExamCountdown />
      </header>

      {/* ═══ GRADE SELECTOR ═══ */}
      <section className="max-w-2xl mx-auto w-full px-4 mb-6 z-10">
        <div className="flex items-center gap-2 mb-4">
          {/* Red duotone star accent */}
          <span className="text-lg" style={{ color: '#c41e3a' }}>★</span>
          <h2
            className="text-2xl sm:text-3xl font-bold"
            style={{ fontFamily: 'var(--font-display)', color: '#2b4a8c' }}
          >
            Sınav Türü
          </h2>
        </div>
        <div className="grid grid-cols-2 gap-5">
          {(['TYT', 'AYT'] as const).map((grade, i) => (
            <motion.div
              key={grade}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.08, type: 'spring', stiffness: 180, damping: 16 }}
            >
              <div
                className={cn(
                  'relative rounded-lg p-4 cursor-pointer transition-all overflow-hidden',
                  selectedGrade === grade && 'ring-2 ring-offset-2 ring-offset-background'
                )}
                style={{
                  background: grade === 'TYT'
                    ? 'linear-gradient(135deg, hsl(348 62% 84% / 0.3), hsl(348 62% 84% / 0.15))'
                    : 'linear-gradient(135deg, hsl(208 55% 80% / 0.3), hsl(208 55% 80% / 0.15))',
                  border: `2px solid ${selectedGrade === grade ? '#c41e3a' : 'hsl(38 22% 82%)'}`,
                  '--tw-ring-color': '#c41e3a',
                } as React.CSSProperties}
                onClick={() => {
                  setSelectedGrade(grade);
                  setSelectedCategory(null);
                  setSelectedDifficulty('all');
                }}
              >
                {/* Vintage corner decoration */}
                <svg className="absolute top-0 right-0 w-8 h-8 opacity-20" viewBox="0 0 30 30">
                  <path d="M30 0 L30 30 L0 30" fill="none" stroke="#c41e3a" strokeWidth="2" />
                  <circle cx="24" cy="24" r="2" fill="#c41e3a" />
                </svg>

                <div className="text-center py-1 relative z-10">
                  <div className="text-3xl mb-1">{grade === 'TYT' ? '🎯' : '🚀'}</div>
                  <div
                    className="text-2xl font-bold"
                    style={{ fontFamily: 'var(--font-display)', color: '#c41e3a' }}
                  >
                    {grade}
                  </div>
                  <div
                    className="text-[11px]"
                    style={{ fontFamily: 'var(--font-display)', color: '#2b4a8c' }}
                  >
                    {grade === 'TYT' ? 'Temel Yeterlilik Testi' : 'Alan Yeterlilik Testi'}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ═══ SUBJECT FOLDERS ═══ */}
      <AnimatePresence>
        {selectedGrade && (
          <motion.section
            className="max-w-2xl mx-auto w-full px-4 mb-6 z-10"
            initial={{ opacity: 0, height: 0, y: 20 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -10 }}
            transition={{ duration: 0.4, type: 'spring', stiffness: 180, damping: 20 }}
          >
            <div className="flex items-center gap-2 mb-4">
              <span className="text-lg" style={{ color: '#c41e3a' }}>★</span>
              <h2
                className="text-2xl sm:text-3xl font-bold"
                style={{ fontFamily: 'var(--font-display)', color: '#2b4a8c' }}
              >
                {selectedGrade === 'TYT' ? '🎯' : '🚀'} {selectedGrade} Dersleri
              </h2>
            </div>
            <BookshelfSelector
              items={filteredCategories.map(cat => ({
                id: cat.id,
                icon: cat.icon,
                title: cat.name.replace(`${selectedGrade} `, ''),
                subtitle: cat.description,
                meta: `${wordCounts[cat.id] || 0} kelime · ${topicCounts[cat.id] || 0} konu`,
              }))}
              selectedId={selectedCategory}
              onSelect={(id) => { setSelectedCategory(id); setSelectedDifficulty('all'); }}
            />

            {/* Shuffle option — vintage card style */}
            <motion.div
              className={cn(
                'mt-5 rounded-lg p-4 cursor-pointer transition-all relative overflow-hidden',
                selectedCategory === 'shuffle' && 'ring-2 ring-offset-2 ring-offset-background'
              )}
              style={{
                background: 'linear-gradient(135deg, hsl(46 72% 80% / 0.25), hsl(46 72% 80% / 0.1))',
                border: `2px solid ${selectedCategory === 'shuffle' ? '#c41e3a' : 'hsl(38 22% 82%)'}`,
                ringColor: '#c41e3a',
              }}
              onClick={() => { setSelectedCategory('shuffle'); setSelectedDifficulty('all'); }}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-11 h-11 rounded-full flex items-center justify-center"
                  style={{ background: 'hsl(46 72% 80% / 0.4)' }}
                >
                  <Shuffle className="h-5 w-5" style={{ color: '#c41e3a' }} />
                </div>
                <div>
                  <div className="text-xl font-bold" style={{ fontFamily: 'var(--font-display)', color: '#c41e3a' }}>
                    🔀 Karıştır
                  </div>
                  <div className="text-[11px]" style={{ fontFamily: 'var(--font-display)', color: '#2b4a8c' }}>
                    Tüm derslerden karışık · {wordCounts['shuffle'] || 0} kelime · {topicCounts['shuffle'] || 0} konu
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* ═══ DIFFICULTY ═══ */}
      <AnimatePresence>
        {selectedCategory && (
          <motion.section
            className="max-w-2xl mx-auto w-full px-4 mb-6 z-10"
            initial={{ opacity: 0, height: 0, y: 20 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -10 }}
            transition={{ duration: 0.4, type: 'spring', stiffness: 180, damping: 20 }}
          >
            <div
              className="rounded-lg p-5 relative overflow-hidden"
              style={{
                background: 'hsl(42 42% 95% / 0.9)',
                border: '2px solid hsl(38 22% 82%)',
                boxShadow: 'inset 0 1px 4px rgba(0,0,0,0.04)',
              }}
            >
              {/* Notebook lines */}
              <div className="absolute inset-0 pointer-events-none" style={{ opacity: 0.06 }}>
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} className="absolute left-0 right-0 h-px" style={{ top: `${(i + 1) * 7.5}%`, background: '#2b4a8c' }} />
                ))}
              </div>

              <h2
                className="text-2xl font-bold mb-3 flex items-center gap-2 relative z-10"
                style={{ fontFamily: 'var(--font-display)', color: '#2b4a8c' }}
              >
                <span style={{ color: '#c41e3a' }}>★</span> Zorluk Seviyesi
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 relative z-10">
                {availableDiffs.map((d, i) => (
                  <motion.div
                    key={d.id}
                    className={cn(
                      'text-center text-xs py-2.5 px-2 rounded-md cursor-pointer transition-all',
                      selectedDifficulty === d.id
                        ? 'bg-[#c41e3a]/15 border-[#c41e3a]'
                        : 'hover:bg-[#c41e3a]/5'
                    )}
                    style={{
                      border: `1.5px solid ${selectedDifficulty === d.id ? '#c41e3a' : 'hsl(38 22% 82%)'}`,
                    }}
                    onClick={() => setSelectedDifficulty(d.id)}
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.04 }}
                    whileHover={{ scale: 1.06 }}
                    whileTap={{ scale: 0.94 }}
                  >
                    <div className="text-lg">{d.icon}</div>
                    <div className="font-bold" style={{ fontFamily: 'var(--font-heading)', color: '#c41e3a' }}>{d.name}</div>
                    <div className="text-[9px]" style={{ color: '#2b4a8c' }}>{d.topicCount}</div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* ═══ START BUTTON ═══ */}
      <div className="max-w-2xl mx-auto w-full px-4 pb-8 mt-auto z-10">
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
          <Button
            className="w-full h-14 text-lg font-bold rounded-xl shadow-lg transition-all hover:shadow-xl disabled:opacity-40"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.5rem',
              background: selectedCategory
                ? 'linear-gradient(135deg, #c41e3a, #8b1a2e)'
                : undefined,
              color: selectedCategory ? '#fff' : undefined,
              boxShadow: selectedCategory ? '0 6px 28px rgba(196,30,58,0.3)' : undefined,
              border: selectedCategory ? 'none' : undefined,
            }}
            disabled={!selectedCategory}
            onClick={handleStart}
          >
            {selectedCategory ? '🎮 Bulmacayı Başlat' : 'Bir ders seçin ✏️'}
          </Button>
        </motion.div>

        {/* Bottom vintage decoration */}
        <div className="flex justify-center mt-5 gap-2 opacity-20">
          {['★', '✦', '★', '✦', '★'].map((s, i) => (
            <span key={i} style={{ color: '#c41e3a', fontSize: '10px' }}>{s}</span>
          ))}
        </div>
      </div>

      <ProfileModal open={profileOpen} onClose={() => setProfileOpen(false)} />
    </div>
  );
};

export default Index;
