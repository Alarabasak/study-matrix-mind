import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Calendar } from 'lucide-react';

interface ExamDate {
  id: string;
  exam_type: string;
  exam_date: string;
}

const ExamDateManager: React.FC = () => {
  const [examDates, setExamDates] = useState<ExamDate[]>([]);
  const [tytDate, setTytDate] = useState('');
  const [aytDate, setAytDate] = useState('');
  const [loading, setLoading] = useState(false);

  const load = async () => {
    const { data } = await supabase.from('exam_dates').select('*');
    if (data) {
      setExamDates(data);
      const tyt = data.find((d) => d.exam_type === 'TYT');
      const ayt = data.find((d) => d.exam_type === 'AYT');
      if (tyt) setTytDate(tyt.exam_date.slice(0, 16)); // datetime-local format
      if (ayt) setAytDate(ayt.exam_date.slice(0, 16));
    }
  };

  useEffect(() => { load(); }, []);

  const save = async (examType: 'TYT' | 'AYT', dateStr: string) => {
    if (!dateStr) return;
    setLoading(true);
    const existing = examDates.find((d) => d.exam_type === examType);
    const isoDate = new Date(dateStr).toISOString();

    let error;
    if (existing) {
      ({ error } = await supabase
        .from('exam_dates')
        .update({ exam_date: isoDate, updated_at: new Date().toISOString() })
        .eq('id', existing.id));
    } else {
      ({ error } = await supabase
        .from('exam_dates')
        .insert({ exam_type: examType, exam_date: isoDate }));
    }

    setLoading(false);
    if (error) {
      toast.error(`Hata: ${error.message}`);
    } else {
      toast.success(`${examType} sınav tarihi güncellendi`);
      load();
    }
  };

  return (
    <div className="bg-card rounded-2xl border border-border p-4 space-y-4">
      <h2 className="font-display font-bold text-base flex items-center gap-2">
        <Calendar className="h-4 w-4 text-primary" /> Sınav Tarihleri
      </h2>
      <p className="text-sm text-muted-foreground">
        Ana sayfadaki geri sayımda gösterilecek TYT ve AYT sınav tarihlerini belirleyin.
      </p>

      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold w-10">TYT</span>
          <Input
            type="datetime-local"
            value={tytDate}
            onChange={(e) => setTytDate(e.target.value)}
            className="flex-1"
          />
          <Button size="sm" disabled={loading || !tytDate} onClick={() => save('TYT', tytDate)}>
            Kaydet
          </Button>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold w-10">AYT</span>
          <Input
            type="datetime-local"
            value={aytDate}
            onChange={(e) => setAytDate(e.target.value)}
            className="flex-1"
          />
          <Button size="sm" disabled={loading || !aytDate} onClick={() => save('AYT', aytDate)}>
            Kaydet
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ExamDateManager;
