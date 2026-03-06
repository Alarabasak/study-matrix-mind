import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { categories, difficultyOptions } from '@/data/questions';
import { Button } from '@/components/ui/button';
import { Gamepad2, BarChart3, BookOpen, Settings, Database, Shuffle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DifficultyLevel } from '@/types/crossword';
import { getTopicCount, getWordCount } from '@/utils/wordDatabase';

const Index: React.FC = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyLevel>('all');

  const handleStart = () => {
    if (!selectedCategory) return;
    const seed = Date.now();
    navigate(`/game?category=${selectedCategory}&seed=${seed}&difficulty=${selectedDifficulty}`);
  };

  const tytCategories = categories.filter(c => c.grade === 'TYT');
  const aytCategories = categories.filter(c => c.grade === 'AYT');

  const topicCount = selectedCategory ? getTopicCount(selectedCategory) : 0;

  // Filter difficulty options based on available topics
  const availableDifficulties = difficultyOptions.filter(d => {
    if (d.id === 'all') return true;
    if (d.id === 'easy') return topicCount >= 1;
    if (d.id === 'medium') return topicCount >= 2;
    if (d.id === 'hard') return topicCount >= 5;
    if (d.id === 'super-hard') return topicCount >= 10;
    return true;
  });

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Hero */}
      <div className="text-center pt-8 pb-4 px-4">
        <div className="flex items-center justify-center gap-2 mb-1">
          <Gamepad2 className="h-7 w-7 text-primary" />
          <h1 className="text-3xl sm:text-4xl font-display font-bold text-foreground tracking-tight">
            Cross<span className="text-primary">Prep</span>
          </h1>
        </div>
        <p className="text-muted-foreground max-w-sm mx-auto text-sm">
          Oyun oynarken öğren! TYT & AYT konularını çengel bulmacalarla pekiştir.
        </p>
        <div className="flex justify-center gap-2 mt-3 flex-wrap">
          <Button variant="ghost" size="sm" className="gap-1.5 font-display text-xs" onClick={() => navigate('/dashboard')}>
            <BarChart3 className="h-3.5 w-3.5" /> İstatistikler
          </Button>
          <Button variant="ghost" size="sm" className="gap-1.5 font-display text-xs" onClick={() => navigate('/unknown-words')}>
            <BookOpen className="h-3.5 w-3.5" /> Bilinmeyen Kelimeler
          </Button>
          <Button variant="ghost" size="sm" className="gap-1.5 font-display text-xs" onClick={() => navigate('/word-manager')}>
            <Database className="h-3.5 w-3.5" /> Kelime Yönetimi
          </Button>
          <Button variant="ghost" size="sm" className="gap-1.5 font-display text-xs" onClick={() => navigate('/settings')}>
            <Settings className="h-3.5 w-3.5" /> Ayarlar
          </Button>
        </div>
      </div>

      {/* TYT Categories */}
      <div className="max-w-2xl mx-auto w-full px-4 mb-4">
        <h2 className="font-display font-bold text-base mb-2 flex items-center gap-2">
          🎯 TYT Dersleri
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {tytCategories.map(cat => {
            const wc = getWordCount(cat.id);
            const tc = getTopicCount(cat.id);
            return (
              <div
                key={cat.id}
                className={cn('category-card', selectedCategory === cat.id && 'selected')}
                onClick={() => { setSelectedCategory(cat.id); setSelectedDifficulty('all'); }}
              >
                <div className="text-2xl mb-1">{cat.icon}</div>
                <div className="font-display font-bold text-xs">{cat.name.replace('TYT ', '')}</div>
                <div className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1">{cat.description}</div>
                <div className="text-[9px] text-muted-foreground mt-1">{wc} kelime · {tc} konu</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Karıştır Category */}
      <div className="max-w-2xl mx-auto w-full px-4 mb-4">
        <div
          className={cn('category-card flex items-center gap-3 p-4', selectedCategory === 'shuffle' && 'selected')}
          onClick={() => { setSelectedCategory('shuffle'); setSelectedDifficulty('all'); }}
        >
          <Shuffle className="h-8 w-8 text-accent" />
          <div>
            <div className="font-display font-bold text-sm">🔀 Karıştır</div>
            <div className="text-[10px] text-muted-foreground">Tüm derslerden karışık bulmaca</div>
            <div className="text-[9px] text-muted-foreground">{getWordCount('shuffle')} kelime · {getTopicCount('shuffle')} konu</div>
          </div>
        </div>
      </div>

      {/* AYT Categories */}
      {aytCategories.length > 0 && (
        <div className="max-w-2xl mx-auto w-full px-4 mb-4">
          <h2 className="font-display font-bold text-base mb-2 flex items-center gap-2">
            🚀 AYT Dersleri
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {aytCategories.map(cat => (
              <div
                key={cat.id}
                className={cn('category-card', selectedCategory === cat.id && 'selected')}
                onClick={() => { setSelectedCategory(cat.id); setSelectedDifficulty('all'); }}
              >
                <div className="text-2xl mb-1">{cat.icon}</div>
                <div className="font-display font-bold text-xs">{cat.name.replace('AYT ', '')}</div>
                <div className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1">{cat.description}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Difficulty Selection */}
      {selectedCategory && (
        <div className="max-w-2xl mx-auto w-full px-4 mb-4">
          <h2 className="font-display font-bold text-base mb-2 flex items-center gap-2">
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
                <div className="font-display font-bold">{d.name}</div>
                <div className="text-[9px] text-muted-foreground">{d.topicCount}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Start Button */}
      <div className="max-w-2xl mx-auto w-full px-4 pb-8 mt-auto">
        <Button
          className="w-full h-14 text-lg font-display font-bold rounded-2xl shadow-lg transition-all hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-40"
          disabled={!selectedCategory}
          onClick={handleStart}
        >
          {selectedCategory ? '🎮 Bulmacayı Başlat' : 'Bir ders seçin'}
        </Button>
      </div>
    </div>
  );
};

export default Index;
