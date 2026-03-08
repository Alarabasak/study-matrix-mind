import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { categories } from '@/data/questions';
import { fetchWordDatabase, addWord, removeWord, updateWord, getTopicsForCategory, removeAllWordsInCategory } from '@/utils/wordDatabase';
import { WordItem } from '@/types/crossword';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Plus, Trash2, Edit2, Search, LogOut, Upload, AlertTriangle } from 'lucide-react';
import CsvImportDialog from '@/components/admin/CsvImportDialog';
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
  const { isAdmin, isLoading, signOut } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState(categories[0].id);
  const [searchQuery, setSearchQuery] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [csvDialogOpen, setCsvDialogOpen] = useState(false);
  const [deleteAllOpen, setDeleteAllOpen] = useState(false);
  const [editingWord, setEditingWord] = useState<string | null>(null);
  const [db, setDb] = useState<Record<string, WordItem[]>>({});
  const [topics, setTopics] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const [formWord, setFormWord] = useState('');
  const [formClue, setFormClue] = useState('');
  const [formTopic, setFormTopic] = useState('');
  const [formDifficulty, setFormDifficulty] = useState(1);

  // Redirect if not admin
  useEffect(() => {
    if (!isLoading && !isAdmin) {
      navigate('/admin-login');
    }
  }, [isAdmin, isLoading, navigate]);

  // Load data
  const loadData = async () => {
    setLoading(true);
    const data = await fetchWordDatabase();
    setDb(data);
    const t = await getTopicsForCategory(selectedCategory);
    setTopics(t);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, [selectedCategory]);

  const words = db[selectedCategory] || [];
  const filteredWords = words.filter(w =>
    w.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
    w.clue.toLowerCase().includes(searchQuery.toLowerCase()) ||
    w.topic.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const category = categories.find(c => c.id === selectedCategory)!;

  const openAddDialog = () => {
    setEditingWord(null);
    setFormWord(''); setFormClue(''); setFormTopic(topics[0] || ''); setFormDifficulty(1);
    setDialogOpen(true);
  };

  const openEditDialog = (w: WordItem) => {
    setEditingWord(w.word);
    setFormWord(w.word); setFormClue(w.clue); setFormTopic(w.topic); setFormDifficulty(w.difficulty);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formWord.trim() || !formClue.trim() || !formTopic.trim()) {
      toast.error('Tüm alanları doldurun'); return;
    }
    const newWord: WordItem = {
      word: formWord.toUpperCase().trim(), clue: formClue.trim(),
      category: selectedCategory, topic: formTopic.trim(),
      difficulty: formDifficulty, grade: category.grade,
      lang: 'tr', frequency_score: 0.7,
    };
    try {
      if (editingWord) {
        await updateWord(selectedCategory, editingWord, newWord);
        toast.success('Kelime güncellendi');
      } else {
        await addWord(selectedCategory, newWord);
        toast.success('Kelime eklendi');
      }
      setDialogOpen(false);
      loadData();
    } catch (err: any) {
      toast.error('Hata: ' + err.message);
    }
  };

  const handleDelete = async (wordText: string) => {
    try {
      await removeWord(selectedCategory, wordText);
      toast.success('Kelime silindi');
      loadData();
    } catch (err: any) {
      toast.error('Hata: ' + err.message);
    }
  };

  const handleDeleteAll = async () => {
    try {
      const count = await removeAllWordsInCategory(selectedCategory);
      toast.success(`${count} kelime silindi`);
      setDeleteAllOpen(false);
      loadData();
    } catch (err: any) {
      toast.error('Hata: ' + err.message);
    }
  };

  const wordsByTopic = useMemo(() => {
    const map: Record<string, WordItem[]> = {};
    for (const w of filteredWords) {
      if (!map[w.topic]) map[w.topic] = [];
      map[w.topic].push(w);
    }
    return map;
  }, [filteredWords]);

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="font-display text-muted-foreground">Yükleniyor...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-4">
        <div className="flex items-center gap-3 mb-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="font-display font-bold text-xl text-foreground">Kelime Yönetimi (Admin)</h1>
          <Button variant="ghost" size="icon" className="ml-auto" onClick={() => { signOut(); navigate('/'); }}>
            <LogOut className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
          {categories.map(cat => (
            <button
              key={cat.id + cat.name}
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

        <div className="flex gap-2 mb-4 flex-wrap">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Kelime, ipucu veya konu ara..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-9" />
          </div>
          <Button variant="outline" onClick={() => setCsvDialogOpen(true)} className="gap-1.5 font-display"><Upload className="h-4 w-4" /> CSV</Button>
          <Button variant="destructive" onClick={() => setDeleteAllOpen(true)} className="gap-1.5 font-display" disabled={words.length === 0}><Trash2 className="h-4 w-4" /> Tümünü Sil</Button>
          <Button onClick={openAddDialog} className="gap-1.5 font-display"><Plus className="h-4 w-4" /> Ekle</Button>
        </div>

        <div className="flex gap-4 mb-4 text-sm text-muted-foreground font-display">
          <span>{words.length} kelime</span>
          <span>{topics.length} konu</span>
        </div>

        {Object.entries(wordsByTopic).map(([topic, topicWords]) => (
          <div key={topic} className="mb-4">
            <h3 className="font-display font-bold text-sm text-primary mb-2 sticky top-0 bg-background py-1">📁 {topic} ({topicWords.length})</h3>
            <div className="space-y-1">
              {topicWords.map(w => (
                <div key={w.word} className="flex items-center gap-2 p-2 rounded-xl bg-card border border-border hover:border-primary/30 transition-all">
                  <div className="flex-1 min-w-0">
                    <div className="font-display font-bold text-sm text-foreground">{w.word}</div>
                    <div className="text-xs text-muted-foreground truncate">{w.clue}</div>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-display">Z:{w.difficulty}</span>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEditDialog(w)}><Edit2 className="h-3.5 w-3.5" /></Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDelete(w.word)}><Trash2 className="h-3.5 w-3.5" /></Button>
                </div>
              ))}
            </div>
          </div>
        ))}

        {filteredWords.length === 0 && (
          <div className="text-center py-12 text-muted-foreground font-display">Kelime bulunamadı</div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display">{editingWord ? 'Kelime Düzenle' : 'Yeni Kelime Ekle'}</DialogTitle>
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
              <datalist id="topics-list">{topics.map(t => <option key={t} value={t} />)}</datalist>
            </div>
            <div>
              <label className="text-xs font-display font-bold text-muted-foreground">Zorluk (1-3)</label>
              <div className="flex gap-2 mt-1">
                {[1, 2, 3].map(d => (
                  <button key={d} className={cn(
                    'px-4 py-1.5 rounded-lg font-display font-bold text-sm border-2 transition-all',
                    formDifficulty === d ? 'border-primary bg-primary text-primary-foreground' : 'border-border hover:border-primary'
                  )} onClick={() => setFormDifficulty(d)}>{d}</button>
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
      <CsvImportDialog open={csvDialogOpen} onOpenChange={setCsvDialogOpen} onImportComplete={loadData} />

      <Dialog open={deleteAllOpen} onOpenChange={setDeleteAllOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" /> Tüm Kelimeleri Sil
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            <strong>{category.icon} {category.name}</strong> dersindeki <strong>{words.length}</strong> kelime kalıcı olarak silinecek. Bu işlem geri alınamaz.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteAllOpen(false)}>İptal</Button>
            <Button variant="destructive" onClick={handleDeleteAll}>Evet, Tümünü Sil</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WordManager;
