import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { categories } from '@/data/questions';
import { getWordDatabase, addWord, removeWord, updateWord, resetToDefaults, getTopicsForCategory } from '@/utils/wordDatabase';
import { WordItem } from '@/types/crossword';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Plus, Trash2, Edit2, RotateCcw, Search } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

const WordManager: React.FC = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState(categories[0].id);
  const [searchQuery, setSearchQuery] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingWord, setEditingWord] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Form state
  const [formWord, setFormWord] = useState('');
  const [formClue, setFormClue] = useState('');
  const [formTopic, setFormTopic] = useState('');
  const [formDifficulty, setFormDifficulty] = useState(1);

  const db = useMemo(() => getWordDatabase(), [refreshKey]);
  const words = db[selectedCategory] || [];
  const topics = useMemo(() => getTopicsForCategory(selectedCategory), [selectedCategory, refreshKey]);

  const filteredWords = words.filter(w =>
    w.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
    w.clue.toLowerCase().includes(searchQuery.toLowerCase()) ||
    w.topic.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const category = categories.find(c => c.id === selectedCategory)!;

  const openAddDialog = () => {
    setEditingWord(null);
    setFormWord('');
    setFormClue('');
    setFormTopic(topics[0] || '');
    setFormDifficulty(1);
    setDialogOpen(true);
  };

  const openEditDialog = (w: WordItem) => {
    setEditingWord(w.word);
    setFormWord(w.word);
    setFormClue(w.clue);
    setFormTopic(w.topic);
    setFormDifficulty(w.difficulty);
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!formWord.trim() || !formClue.trim() || !formTopic.trim()) {
      toast.error('Tüm alanları doldurun');
      return;
    }

    const newWord: WordItem = {
      word: formWord.toUpperCase().trim(),
      clue: formClue.trim(),
      category: selectedCategory,
      topic: formTopic.trim(),
      difficulty: formDifficulty,
      grade: category.grade,
      lang: 'tr',
      frequency_score: 0.7,
    };

    if (editingWord) {
      updateWord(selectedCategory, editingWord, newWord);
      toast.success('Kelime güncellendi');
    } else {
      addWord(selectedCategory, newWord);
      toast.success('Kelime eklendi');
    }

    setDialogOpen(false);
    setRefreshKey(k => k + 1);
  };

  const handleDelete = (wordText: string) => {
    removeWord(selectedCategory, wordText);
    toast.success('Kelime silindi');
    setRefreshKey(k => k + 1);
  };

  const handleReset = () => {
    resetToDefaults();
    toast.success('Varsayılanlara sıfırlandı');
    setRefreshKey(k => k + 1);
  };

  // Group words by topic
  const wordsByTopic = useMemo(() => {
    const map: Record<string, WordItem[]> = {};
    for (const w of filteredWords) {
      if (!map[w.topic]) map[w.topic] = [];
      map[w.topic].push(w);
    }
    return map;
  }, [filteredWords]);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-4">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="font-display font-bold text-xl text-foreground">Kelime Yönetimi</h1>
        </div>

        {/* Category selector */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
          {categories.map(cat => (
            <button
              key={cat.id}
              className={cn(
                'px-3 py-1.5 rounded-xl text-xs font-display font-bold whitespace-nowrap border-2 transition-all',
                selectedCategory === cat.id
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-card text-foreground hover:border-primary'
              )}
              onClick={() => setSelectedCategory(cat.id)}
            >
              {cat.icon} {cat.name.replace(/TYT |AYT /, '')}
            </button>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-2 mb-4 flex-wrap">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Kelime, ipucu veya konu ara..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button onClick={openAddDialog} className="gap-1.5 font-display">
            <Plus className="h-4 w-4" /> Ekle
          </Button>
          <Button variant="outline" onClick={handleReset} className="gap-1.5 font-display">
            <RotateCcw className="h-4 w-4" /> Sıfırla
          </Button>
        </div>

        {/* Stats */}
        <div className="flex gap-4 mb-4 text-sm text-muted-foreground font-display">
          <span>{words.length} kelime</span>
          <span>{topics.length} konu</span>
        </div>

        {/* Word list grouped by topic */}
        {Object.entries(wordsByTopic).map(([topic, topicWords]) => (
          <div key={topic} className="mb-4">
            <h3 className="font-display font-bold text-sm text-primary mb-2 sticky top-0 bg-background py-1">
              📁 {topic} ({topicWords.length})
            </h3>
            <div className="space-y-1">
              {topicWords.map(w => (
                <div key={w.word} className="flex items-center gap-2 p-2 rounded-xl bg-card border border-border hover:border-primary/30 transition-all">
                  <div className="flex-1 min-w-0">
                    <div className="font-display font-bold text-sm text-foreground">{w.word}</div>
                    <div className="text-xs text-muted-foreground truncate">{w.clue}</div>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-display">
                    Z:{w.difficulty}
                  </span>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEditDialog(w)}>
                    <Edit2 className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDelete(w.word)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        ))}

        {filteredWords.length === 0 && (
          <div className="text-center py-12 text-muted-foreground font-display">
            Kelime bulunamadı
          </div>
        )}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display">
              {editingWord ? 'Kelime Düzenle' : 'Yeni Kelime Ekle'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-display font-bold text-muted-foreground">Kelime</label>
              <Input value={formWord} onChange={e => setFormWord(e.target.value.toUpperCase())} placeholder="ENERJI" />
            </div>
            <div>
              <label className="text-xs font-display font-bold text-muted-foreground">İpucu</label>
              <Input value={formClue} onChange={e => setFormClue(e.target.value)} placeholder="İş yapabilme yeteneği" />
            </div>
            <div>
              <label className="text-xs font-display font-bold text-muted-foreground">Konu</label>
              <Input value={formTopic} onChange={e => setFormTopic(e.target.value)} placeholder="Mekanik" list="topics-list" />
              <datalist id="topics-list">
                {topics.map(t => <option key={t} value={t} />)}
              </datalist>
            </div>
            <div>
              <label className="text-xs font-display font-bold text-muted-foreground">Zorluk (1-3)</label>
              <div className="flex gap-2 mt-1">
                {[1, 2, 3].map(d => (
                  <button
                    key={d}
                    className={cn(
                      'px-4 py-1.5 rounded-lg font-display font-bold text-sm border-2 transition-all',
                      formDifficulty === d
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border hover:border-primary'
                    )}
                    onClick={() => setFormDifficulty(d)}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>İptal</Button>
            <Button onClick={handleSave}>{editingWord ? 'Güncelle' : 'Ekle'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WordManager;
