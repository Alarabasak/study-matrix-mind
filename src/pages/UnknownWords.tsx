import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUnknownWords, markWordLearned, removeUnknownWord } from '@/utils/gameStats';
import { Button } from '@/components/ui/button';
import { ArrowLeft, BookOpen, Check, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const UnknownWords: React.FC = () => {
  const navigate = useNavigate();
  const [words, setWords] = useState(getUnknownWords());
  const [filter, setFilter] = useState<'all' | 'unlearned' | 'learned'>('unlearned');

  const filtered = words.filter(w => {
    if (filter === 'learned') return w.learned;
    if (filter === 'unlearned') return !w.learned;
    return true;
  });

  const handleLearn = (word: string, category: string) => {
    markWordLearned(word, category);
    setWords(getUnknownWords());
    toast.success('Öğrenildi olarak işaretlendi ✓');
  };

  const handleRemove = (word: string, category: string) => {
    removeUnknownWord(word, category);
    setWords(getUnknownWords());
    toast('Listeden kaldırıldı');
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')} className="rounded-xl">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-primary" /> Bilinmeyen Kelimeler
          </h1>
        </div>

        <p className="text-sm text-muted-foreground mb-4">
          Yanlış cevapladığın kelimeler burada listelenir. Tekrar çalışarak öğrenebilirsin!
        </p>

        {/* Filter */}
        <div className="flex gap-2 mb-4">
          {(['unlearned', 'learned', 'all'] as const).map(f => (
            <button
              key={f}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-display font-semibold transition-all border',
                filter === f ? 'bg-primary text-primary-foreground border-primary' : 'bg-card border-border text-foreground hover:border-primary'
              )}
              onClick={() => setFilter(f)}
            >
              {f === 'unlearned' ? 'Öğrenilmemiş' : f === 'learned' ? 'Öğrenilmiş' : 'Tümü'}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground">
              {filter === 'unlearned' ? 'Harika! Öğrenilmemiş kelime yok.' : 'Listede kelime yok.'}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((w, i) => (
              <div key={`${w.word}-${w.category}-${i}`} className={cn(
                'bg-card rounded-xl border border-border p-3 flex items-start justify-between gap-3',
                w.learned && 'opacity-60'
              )}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-display font-bold text-sm">{w.word}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-semibold">{w.categoryName}</span>
                    {w.learned && <Check className="h-3.5 w-3.5 text-primary" />}
                  </div>
                  <p className="text-xs text-muted-foreground">{w.clue}</p>
                </div>
                <div className="flex gap-1 shrink-0">
                  {!w.learned && (
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => handleLearn(w.word, w.category)}>
                      <Check className="h-4 w-4 text-primary" />
                    </Button>
                  )}
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => handleRemove(w.word, w.category)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UnknownWords;
