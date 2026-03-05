import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { categories } from '@/data/questions';
import { Button } from '@/components/ui/button';
import { Gamepad2, BarChart3, BookOpen, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

const Index: React.FC = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const handleStart = () => {
    if (!selectedCategory) return;
    const seed = Date.now();
    navigate(`/game?category=${selectedCategory}&seed=${seed}`);
  };

  const tytCategories = categories.filter(c => c.grade === 'TYT');
  const aytCategories = categories.filter(c => c.grade === 'AYT');

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
        <div className="flex justify-center gap-2 mt-3">
          <Button variant="ghost" size="sm" className="gap-1.5 font-display text-xs" onClick={() => navigate('/dashboard')}>
            <BarChart3 className="h-3.5 w-3.5" /> İstatistikler
          </Button>
          <Button variant="ghost" size="sm" className="gap-1.5 font-display text-xs" onClick={() => navigate('/unknown-words')}>
            <BookOpen className="h-3.5 w-3.5" /> Bilinmeyen Kelimeler
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
          {tytCategories.map(cat => (
            <div
              key={cat.id}
              className={cn('category-card', selectedCategory === cat.id && 'selected')}
              onClick={() => setSelectedCategory(cat.id)}
            >
              <div className="text-2xl mb-1">{cat.icon}</div>
              <div className="font-display font-bold text-xs">{cat.name.replace('TYT ', '')}</div>
              <div className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1">{cat.description}</div>
            </div>
          ))}
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
                onClick={() => setSelectedCategory(cat.id)}
              >
                <div className="text-2xl mb-1">{cat.icon}</div>
                <div className="font-display font-bold text-xs">{cat.name.replace('AYT ', '')}</div>
                <div className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1">{cat.description}</div>
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
