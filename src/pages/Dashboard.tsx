import React from 'react';
import { useNavigate } from 'react-router-dom';
import { getStats } from '@/utils/gameStats';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Trophy, Clock, Zap, Eye, Gamepad2, BookOpen, Target, TrendingUp } from 'lucide-react';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const stats = getStats();

  const formatDuration = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (h > 0) return `${h}sa ${m}dk`;
    return `${m}dk`;
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')} className="rounded-xl">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-display font-bold text-foreground">📊 İstatistikler</h1>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-6">
          <StatCard icon={<Gamepad2 className="h-5 w-5" />} label="Oyun" value={stats.totalGames} />
          <StatCard icon={<Trophy className="h-5 w-5" />} label="Toplam Puan" value={stats.totalScore} />
          <StatCard icon={<BookOpen className="h-5 w-5" />} label="Bulunan Kelime" value={stats.totalWordsFound} />
          <StatCard icon={<Clock className="h-5 w-5" />} label="Toplam Süre" value={formatDuration(stats.totalDuration)} />
        </div>

        {/* Accuracy & Unknown */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mb-6">
          <StatCard icon={<Target className="h-5 w-5" />} label="Doğruluk" value={`%${stats.avgAccuracy}`} />
          <StatCard icon={<Eye className="h-5 w-5" />} label="İpucu Kullanımı" value={stats.totalAdHints} />
          <StatCard icon={<TrendingUp className="h-5 w-5" />} label="Bilinmeyen" value={stats.unknownWordsCount} />
        </div>

        {/* Ad Hints */}
        <div className="bg-card rounded-2xl border border-border p-4 mb-4">
          <h2 className="font-display font-bold text-base mb-1 flex items-center gap-2">
            <Eye className="h-4 w-4 text-accent" />
            Reklam İpuçları ({stats.totalAdHints})
          </h2>
          <p className="text-[10px] text-muted-foreground mb-3">İpucu almak için reklam izlenen kelimeler</p>

          {stats.adHints.length === 0 ? (
            <p className="text-sm text-muted-foreground italic">Henüz ipucu kullanılmadı.</p>
          ) : (
            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {stats.adHints.map((hint, i) => (
                <div key={i} className="flex items-center justify-between bg-secondary/50 rounded-xl px-3 py-2">
                  <div>
                    <span className="font-semibold text-sm">{hint.word}</span>
                    <span className="text-xs text-muted-foreground ml-2 line-clamp-1">({hint.clue})</span>
                  </div>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-lg bg-primary/10 text-primary whitespace-nowrap">
                    {hint.categoryName}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Category Breakdown */}
        {Object.keys(stats.categoryStats).length > 0 && (
          <div className="bg-card rounded-2xl border border-border p-4 mb-4">
            <h2 className="font-display font-bold text-base mb-3 flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" /> Ders Bazında
            </h2>
            <div className="space-y-1.5">
              {Object.entries(stats.categoryStats).map(([id, cat]) => (
                <div key={id} className="flex items-center justify-between bg-secondary/50 rounded-xl px-3 py-2">
                  <span className="font-semibold text-sm">{cat.name}</span>
                  <div className="flex items-center gap-3 text-xs">
                    <span>{cat.games} oyun</span>
                    <span className="text-primary font-bold">{cat.score} puan</span>
                    <span>{cat.wordsFound}/{cat.totalWords}</span>
                    <span className="text-muted-foreground">{formatDuration(cat.avgTime)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Sessions */}
        {stats.recentSessions.length > 0 && (
          <div className="bg-card rounded-2xl border border-border p-4">
            <h2 className="font-display font-bold text-base mb-3">🕐 Son Oyunlar</h2>
            <div className="space-y-1.5">
              {stats.recentSessions.map((s, i) => (
                <div key={i} className="flex items-center justify-between bg-secondary/50 rounded-xl px-3 py-2">
                  <div>
                    <span className="font-semibold text-sm">{s.categoryName}</span>
                    <span className="text-[10px] text-muted-foreground ml-1">{s.gridSize}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span>{s.wordsFound}/{s.totalWords}</span>
                    <span className="text-primary font-bold">{s.score}</span>
                    <span className="text-muted-foreground">{formatDuration(s.duration)}</span>
                    {s.adHintsUsed > 0 && <span className="text-accent font-semibold">🎬{s.adHintsUsed}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {stats.totalGames === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">Henüz oyun oynamadın. Hadi başla!</p>
            <Button onClick={() => navigate('/')} className="font-display">🎮 Oyna</Button>
          </div>
        )}
      </div>
    </div>
  );
};

const StatCard: React.FC<{ icon: React.ReactNode; label: string; value: string | number }> = ({ icon, label, value }) => (
  <div className="bg-card rounded-2xl border border-border p-3 text-center">
    <div className="flex items-center justify-center text-primary mb-1">{icon}</div>
    <div className="text-lg sm:text-xl font-display font-bold">{value}</div>
    <div className="text-[10px] text-muted-foreground">{label}</div>
  </div>
);

export default Dashboard;
