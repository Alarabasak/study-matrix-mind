import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Trash2, Info } from 'lucide-react';
import { clearAllData } from '@/utils/gameStats';
import { useAuth } from '@/contexts/AuthContext';
import ExamDateManager from '@/components/admin/ExamDateManager';
import { toast } from 'sonner';

const Settings: React.FC = () => {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  const handleClearData = () => {
    if (window.confirm('Tüm verileriniz silinecek. Emin misiniz?')) {
      clearAllData();
      toast.success('Tüm veriler silindi.');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')} className="rounded-xl">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-display font-bold text-foreground">⚙️ Ayarlar</h1>
        </div>

        <div className="space-y-4">
          {/* Admin: Exam Date Management */}
          {isAdmin && <ExamDateManager />}

          {/* App Info */}
          <div className="bg-card rounded-2xl border border-border p-4">
            <h2 className="font-display font-bold text-base mb-2 flex items-center gap-2">
              <Info className="h-4 w-4 text-primary" /> Uygulama Bilgisi
            </h2>
            <div className="space-y-1 text-sm text-muted-foreground">
              <p><span className="text-foreground font-semibold">CrossPrep</span> — Oyunlaştırılmış Öğrenme</p>
              <p>TYT & AYT sınavlarına hazırlık için çengel bulmaca oyunu</p>
              <p className="text-xs">Sürüm 1.0.0</p>
            </div>
          </div>

          {/* Data Management */}
          <div className="bg-card rounded-2xl border border-border p-4">
            <h2 className="font-display font-bold text-base mb-2 flex items-center gap-2">
              <Trash2 className="h-4 w-4 text-destructive" /> Veri Yönetimi
            </h2>
            <p className="text-sm text-muted-foreground mb-3">
              Tüm oyun istatistikleri, bilinmeyen kelimeler ve ipucu kayıtları silinecektir.
            </p>
            <Button variant="destructive" className="font-display gap-2" onClick={handleClearData}>
              <Trash2 className="h-4 w-4" /> Tüm Verileri Sil
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
