import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Upload, FileText, AlertCircle, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { invalidateCache } from '@/utils/wordDatabase';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

interface ImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImportComplete: () => void;
}

interface ParsedRow {
  word: string;
  clue: string;
  category: string;
  topic: string;
  difficulty: number;
  grade: string;
  lang: string;
  frequency_score: number;
}

const BATCH_SIZE = 50;

const ACCEPTED_EXTENSIONS = '.csv,.tsv,.txt,.numbers';

function detectDelimiter(firstLine: string): string {
  // Tab-separated is common in .txt exports
  if (firstLine.includes('\t')) return '\t';
  // Semicolon is common in European CSV exports
  const commaCount = (firstLine.match(/,/g) || []).length;
  const semiCount = (firstLine.match(/;/g) || []).length;
  if (semiCount > commaCount) return ';';
  return ',';
}

function parseLine(line: string, delimiter: string): string[] {
  if (delimiter === '\t' || delimiter === ';') {
    return line.split(delimiter);
  }
  // CSV with quote handling
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') { current += '"'; i++; }
      else inQuotes = !inQuotes;
    } else if (ch === delimiter && !inQuotes) {
      result.push(current); current = '';
    } else {
      current += ch;
    }
  }
  result.push(current);
  return result;
}

function parseDelimitedText(text: string): { rows: ParsedRow[]; errors: string[] } {
  const lines = text.split(/\r?\n/).filter(l => l.trim());
  if (lines.length < 2) {
    return { rows: [], errors: ['Dosya en az bir başlık ve bir veri satırı içermelidir.'] };
  }

  const delimiter = detectDelimiter(lines[0]);
  const header = parseLine(lines[0], delimiter).map(h => h.trim().toLowerCase().replace(/^["']|["']$/g, ''));

  const requiredCols = ['word', 'clue', 'category', 'topic'];
  const missing = requiredCols.filter(c => !header.includes(c));
  if (missing.length) {
    return { rows: [], errors: [`Eksik sütunlar: ${missing.join(', ')}. Gerekli: word, clue, category, topic`] };
  }

  const idx = (col: string) => header.indexOf(col);
  const parsed: ParsedRow[] = [];
  const errs: string[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = parseLine(lines[i], delimiter);
    if (cols.length < requiredCols.length) {
      errs.push(`Satır ${i + 1}: Yetersiz sütun sayısı`);
      continue;
    }
    const word = (cols[idx('word')] || '').trim().toUpperCase().replace(/^["']|["']$/g, '');
    const clue = (cols[idx('clue')] || '').trim().replace(/^["']|["']$/g, '');
    const category = (cols[idx('category')] || '').trim().replace(/^["']|["']$/g, '');
    const topic = (cols[idx('topic')] || '').trim().replace(/^["']|["']$/g, '');

    if (!word || !clue || !category || !topic) {
      errs.push(`Satır ${i + 1}: word, clue, category veya topic boş`);
      continue;
    }

    parsed.push({
      word,
      clue,
      category,
      topic,
      difficulty: parseInt(cols[idx('difficulty')]?.replace(/^["']|["']$/g, '') || '1') || 1,
      grade: (cols[idx('grade')]?.replace(/^["']|["']$/g, '') || 'TYT').trim(),
      lang: (cols[idx('lang')]?.replace(/^["']|["']$/g, '') || 'tr').trim(),
      frequency_score: parseFloat(cols[idx('frequency_score')]?.replace(/^["']|["']$/g, '') || '0.7') || 0.7,
    });
  }

  return { rows: parsed, errors: errs };
}

const ImportDialog: React.FC<ImportDialogProps> = ({ open, onOpenChange, onImportComplete }) => {
  const fileRef = useRef<HTMLInputElement>(null);
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [fileName, setFileName] = useState('');
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);

  const reset = () => {
    setRows([]); setErrors([]); setFileName('');
    setImporting(false); setProgress(0); setDone(false);
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const ext = file.name.split('.').pop()?.toLowerCase();

    if (ext === 'numbers') {
      setFileName(file.name);
      setErrors(['⚠️ .numbers dosyasını doğrudan okuyamıyoruz. Lütfen Numbers uygulamasında Dosya → Dışa Aktar → CSV olarak kaydedin ve tekrar yükleyin.']);
      setRows([]);
      return;
    }

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const result = parseDelimitedText(text);
      setRows(result.rows);
      setErrors(result.errors);
    };
    reader.readAsText(file, 'UTF-8');
  };

  const handleImport = async () => {
    if (!rows.length) return;
    setImporting(true); setProgress(0);

    let inserted = 0;
    const totalBatches = Math.ceil(rows.length / BATCH_SIZE);

    for (let b = 0; b < totalBatches; b++) {
      const batch = rows.slice(b * BATCH_SIZE, (b + 1) * BATCH_SIZE);
      const { error } = await supabase.from('words').insert(batch);
      if (error) {
        toast.error(`Batch ${b + 1} hatası: ${error.message}`);
        setImporting(false);
        return;
      }
      inserted += batch.length;
      setProgress(Math.round((inserted / rows.length) * 100));
    }

    invalidateCache();
    setDone(true); setImporting(false);
    toast.success(`${inserted} kelime başarıyla eklendi!`);
    onImportComplete();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!importing) { reset(); onOpenChange(v); } }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">Dosyadan İçe Aktar</DialogTitle>
        </DialogHeader>

        {done ? (
          <div className="flex flex-col items-center gap-3 py-6">
            <CheckCircle2 className="h-12 w-12 text-primary" />
            <p className="font-display font-bold text-foreground">{rows.length} kelime eklendi!</p>
            <Button onClick={() => { reset(); onOpenChange(false); }}>Kapat</Button>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              <input ref={fileRef} type="file" accept={ACCEPTED_EXTENSIONS} className="hidden" onChange={handleFile} />

              {!fileName ? (
                <button
                  onClick={() => fileRef.current?.click()}
                  className="w-full border-2 border-dashed border-border rounded-xl p-8 flex flex-col items-center gap-2 hover:border-primary transition-colors"
                >
                  <Upload className="h-8 w-8 text-muted-foreground" />
                  <span className="font-display text-sm text-muted-foreground">Dosya seçin</span>
                  <span className="font-display text-[10px] text-muted-foreground">CSV, TXT (tab/noktalı virgül), Numbers</span>
                </button>
              ) : (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-muted">
                  <FileText className="h-5 w-5 text-primary" />
                  <span className="font-display text-sm text-foreground flex-1 truncate">{fileName}</span>
                  <Button variant="ghost" size="sm" onClick={() => { reset(); if (fileRef.current) fileRef.current.value = ''; }}>Değiştir</Button>
                </div>
              )}

              {rows.length > 0 && (
                <div className="text-sm font-display text-foreground">
                  ✅ <strong>{rows.length}</strong> kelime okundu
                </div>
              )}

              {errors.length > 0 && (
                <div className="max-h-32 overflow-y-auto space-y-1 p-2 rounded-lg bg-destructive/10">
                  {errors.slice(0, 10).map((err, i) => (
                    <div key={i} className="flex items-start gap-1.5 text-xs text-destructive">
                      <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                      <span>{err}</span>
                    </div>
                  ))}
                  {errors.length > 10 && (
                    <p className="text-xs text-destructive">...ve {errors.length - 10} hata daha</p>
                  )}
                </div>
              )}

              {importing && (
                <div className="space-y-1">
                  <Progress value={progress} className="h-2" />
                  <p className="text-xs text-muted-foreground font-display text-center">%{progress}</p>
                </div>
              )}

              <div className="p-3 rounded-lg bg-muted text-xs text-muted-foreground font-display space-y-1">
                <p className="font-bold">Dosya Formatı:</p>
                <p>word, clue, category, topic, difficulty, grade, lang, frequency_score</p>
                <p className="text-[10px]">Ayraç: virgül, tab veya noktalı virgül otomatik algılanır.</p>
                <p className="text-[10px]">Zorunlu: word, clue, category, topic. Diğerleri opsiyonel.</p>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => { reset(); onOpenChange(false); }} disabled={importing}>İptal</Button>
              <Button onClick={handleImport} disabled={!rows.length || importing} className="gap-1.5">
                <Upload className="h-4 w-4" /> {importing ? 'Yükleniyor...' : `${rows.length} Kelime Ekle`}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ImportDialog;
