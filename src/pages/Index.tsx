import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { categories, difficultyOptions } from '@/data/questions';
import { Button } from '@/components/ui/button';
import { Shuffle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DifficultyLevel } from '@/types/crossword';
import { getTopicCount, getWordCount } from '@/utils/wordDatabase';
import FolderCard from '@/components/FolderCard';
import ProfileModal from '@/components/ProfileModal';
import { motion } from 'framer-motion';

const Index: React.FC = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyLevel>('all');
  const [profileOpen, setProfileOpen] = useState(false);

  const handleStart = () => {
    if (!selectedCategory) return;
    const seed = Date.now();
    navigate(`/game?category=${selectedCategory}&seed=${seed}&difficulty=${selectedDifficulty}`);
  };

  const tytCategories = categories.filter(c => c.grade === 'TYT');
  const aytCategories = categories.filter(c => c.grade === 'AYT');

  const topicCount = selectedCategory ? getTopicCount(selectedCategory) : 0;

  const availableDifficulties = difficultyOptions.filter(d => {
    if (d.id === 'all') return true;
    if (d.id === 'easy') return topicCount >= 1;
    if (d.id === 'medium') return topicCount >= 2;
    if (d.id === 'hard') return topicCount >= 5;
    if (d.id === 'super-hard') return topicCount >= 10;
    return true;
  });

  return (
    <div className="min-h-screen bg-background paper-texture flex flex-col">
      {/* Editorial Header */}
      <div className="relative text-center pt-8 pb-2 px-4">
        {/* Profile notebook button */}
        <motion.button
          className="absolute top-4 right-4 text-3xl hover:scale-110 transition-transform"
          onClick={() => setProfileOpen(true)}
          whileTap={{ scale: 0.9 }}
          title="Profilim"
        >
          📓
        </motion.button>

        {/* Tape decoration */}
        <div className="tape mx-auto mb-2" style={{ transform: 'rotate(-2deg)' }} />

        <motion.h1
          className="handwriting text-5xl sm:text-6xl font-bold text-foreground tracking-tight"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Cross<span className="text-primary">Prep</span>
        </motion.h1>
        <motion.p
          className="text-muted-foreground max-w-sm mx-auto text-sm mt-1 font-body"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Oyun oynarken öğren! ✏️ TYT & AYT konularını çengel bulmacalarla pekiştir.
        </motion.p>

        {/* Decorative stickers */}
        <div className="flex justify-center gap-2 mt-3 flex-wrap">
          <span className="sticker bg-primary/15 text-primary">🎒 Okula Dönüş</span>
          <span className="sticker bg-accent/15 text-accent" style={{ transform: 'rotate(2deg)' }}>📚 Çalış & Oyna</span>
        </div>
      </div>

      {/* TYT Folders */}
      <div className="max-w-2xl mx-auto w-full px-4 mb-4 mt-4">
        <h2 className="handwriting text-2xl font-bold mb-3 flex items-center gap-2">
          🎯 TYT Dersleri
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {tytCategories.map((cat, i) => {
            const wc = getWordCount(cat.id);
            const tc = getTopicCount(cat.id);
            return (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.05 }}
              >
                <FolderCard
                  index={i}
                  icon={cat.icon}
                  title={cat.name.replace('TYT ', '')}
                  subtitle={cat.description}
                  meta={`${wc} kelime · ${tc} konu`}
                  selected={selectedCategory === cat.id}
                  onClick={() => { setSelectedCategory(cat.id); setSelectedDifficulty('all'); }}
                />
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Shuffle - special folder */}
      <div className="max-w-2xl mx-auto w-full px-4 mb-4">
        <motion.div
          className={cn(
            'folder-card flex items-center gap-3',
            selectedCategory === 'shuffle' && 'selected'
          )}
          onClick={() => { setSelectedCategory('shuffle'); setSelectedDifficulty('all'); }}
          whileHover={{ rotate: -1, y: -3 }}
        >
          <div
            className="folder-body flex items-center gap-3 w-full"
            style={{
              background: `hsl(var(--folder-yellow) / 0.4)`,
              borderColor: selectedCategory === 'shuffle' ? 'hsl(var(--foreground))' : 'transparent',
            }}
          >
            <Shuffle className="h-7 w-7 text-accent" />
            <div>
              <div className="handwriting text-xl font-bold">🔀 Karıştır</div>
              <div className="text-[10px] text-muted-foreground font-body">
                Tüm derslerden karışık · {getWordCount('shuffle')} kelime · {getTopicCount('shuffle')} konu
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* AYT Folders */}
      {aytCategories.length > 0 && (
        <div className="max-w-2xl mx-auto w-full px-4 mb-4">
          <h2 className="handwriting text-2xl font-bold mb-3 flex items-center gap-2">
            🚀 AYT Dersleri
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {aytCategories.map((cat, i) => (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.05 }}
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

      {/* Difficulty Selection */}
      {selectedCategory && (
        <motion.div
          className="max-w-2xl mx-auto w-full px-4 mb-4"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          transition={{ duration: 0.3 }}
        >
          <h2 className="handwriting text-2xl font-bold mb-2 flex items-center gap-2">
            ⚡ Zorluk Seviyesi
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {availableDifficulties.map(d => (
              <div
                key={d.id}
                className={cn('size-chip text-center text-xs py-2', selectedDifficulty === d.id && 'selected')}
                onClick={() => setSelectedDifficulty(d.id)}
              >
                <div className="text-lg">{d.icon}</div>
                <div className="font-bold" style={{ fontFamily: 'var(--font-heading)' }}>{d.name}</div>
                <div className="text-[9px] text-muted-foreground">{d.topicCount}</div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Start Button */}
      <div className="max-w-2xl mx-auto w-full px-4 pb-8 mt-auto">
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            className="w-full h-14 text-lg font-bold rounded-2xl shadow-lg transition-all hover:shadow-xl disabled:opacity-40"
            style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem' }}
            disabled={!selectedCategory}
            onClick={handleStart}
          >
            {selectedCategory ? '🎮 Bulmacayı Başlat' : 'Bir ders seçin ✏️'}
          </Button>
        </motion.div>
      </div>

      {/* Profile Modal */}
      <ProfileModal open={profileOpen} onClose={() => setProfileOpen(false)} />
    </div>
  );
};

export default Index;
