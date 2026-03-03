import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { categories } from '@/data/questions';
import { Button } from '@/components/ui/button';
import { Sparkles, BookOpen, Gamepad2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const gridSizes = [
  { id: '12x12', label: '12 × 12', description: 'Classic' },
  { id: '16x12', label: '16 × 12', description: 'Wide' },
  { id: '12x16', label: '12 × 16', description: 'Tall' },
];

const Index: React.FC = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState('12x12');

  const handleStart = () => {
    if (!selectedCategory) return;
    navigate(`/game?category=${selectedCategory}&size=${selectedSize}`);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Hero */}
      <div className="text-center pt-10 pb-6 px-4">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Gamepad2 className="h-8 w-8 text-primary" />
          <h1 className="text-4xl sm:text-5xl font-display font-bold text-foreground tracking-tight">
            Cross<span className="text-primary">Prep</span>
          </h1>
        </div>
        <p className="text-muted-foreground max-w-md mx-auto text-sm sm:text-base">
          Master your subjects with fun arrow crossword puzzles. Pick a topic, choose your grid, and start solving!
        </p>
      </div>

      {/* Category Selection */}
      <div className="max-w-2xl mx-auto w-full px-4 mb-6">
        <h2 className="font-display font-bold text-lg mb-3 flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary" />
          Choose a Subject
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {categories.map(cat => (
            <div
              key={cat.id}
              className={cn('category-card', selectedCategory === cat.id && 'selected')}
              onClick={() => setSelectedCategory(cat.id)}
            >
              <div className="text-2xl mb-1">{cat.icon}</div>
              <div className="font-display font-bold text-sm">{cat.name}</div>
              <div className="text-[11px] text-muted-foreground mt-0.5">{cat.description}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Grid Size */}
      <div className="max-w-2xl mx-auto w-full px-4 mb-8">
        <h2 className="font-display font-bold text-lg mb-3 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-accent" />
          Grid Size
        </h2>
        <div className="flex gap-3">
          {gridSizes.map(size => (
            <div
              key={size.id}
              className={cn('size-chip flex-1 text-center', selectedSize === size.id && 'selected')}
              onClick={() => setSelectedSize(size.id)}
            >
              <div className="font-bold text-sm">{size.label}</div>
              <div className="text-[10px] opacity-70">{size.description}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Start Button */}
      <div className="max-w-2xl mx-auto w-full px-4 pb-10">
        <Button
          className="w-full h-14 text-lg font-display font-bold rounded-2xl shadow-lg transition-all hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-40"
          disabled={!selectedCategory}
          onClick={handleStart}
        >
          {selectedCategory ? '🎮 Start Puzzle' : 'Select a subject to begin'}
        </Button>
      </div>
    </div>
  );
};

export default Index;
