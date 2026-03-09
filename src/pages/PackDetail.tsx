import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Lock, CheckCircle2, PlayCircle, Clock, Star, Grid3X3 } from 'lucide-react';
import { listPackLevels, listPacks } from '@/utils/puzzleLoader';
import { PuzzlePack, PuzzleLevelInfo } from '@/data/puzzleRepository';
import {
  getLevelStatus,
  getPackCompletionPercent,
  getLevelProgress,
} from '@/utils/progressStore';
import { cn } from '@/lib/utils';

const PackDetail: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const packId = searchParams.get('packId') || '';

  const [pack, setPack] = useState<PuzzlePack | null>(null);
  const [levels, setLevels] = useState<PuzzleLevelInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([listPacks(), listPackLevels(packId)]).then(([packs, lvls]) => {
      setPack(packs.find(p => p.packId === packId) || null);
      setLevels(lvls);
      setLoading(false);
    });
  }, [packId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'hsl(var(--background))' }}>
        <div className="text-4xl animate-bounce">📖</div>
      </div>
    );
  }

  if (!pack) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'hsl(var(--background))' }}>
        <div className="text-center">
          <div className="text-4xl mb-2">😔</div>
          <p style={{ fontFamily: 'var(--font-display)', color: 'hsl(var(--muted-foreground))' }}>Paket bulunamadı</p>
          <button onClick={() => navigate('/')} className="mt-4 px-4 py-2 rounded-lg" style={{ background: 'hsl(var(--primary))', color: 'hsl(var(--primary-foreground))' }}>
            Ana Sayfa
          </button>
        </div>
      </div>
    );
  }

  const completionPercent = getPackCompletionPercent(packId, levels.length);

  const handleLevelClick = (level: PuzzleLevelInfo) => {
    const status = getLevelStatus(packId, level.levelId, levels.length);
    if (status === 'locked') return;
    navigate(`/game?pack=${packId}&level=${level.levelId}&category=${pack.category}`);
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'hsl(var(--background))' }}>
      {/* Header */}
      <header className="relative px-4 pt-6 pb-4">
        <motion.button
          onClick={() => navigate('/')}
          className="flex items-center gap-1.5 mb-4"
          style={{ color: 'hsl(var(--muted-foreground))', fontFamily: 'var(--font-heading)' }}
          whileTap={{ scale: 0.95 }}
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Geri</span>
        </motion.button>

        <div className="flex items-center gap-3 mb-2">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
            style={{ background: 'hsl(var(--folder-pink) / 0.3)' }}
          >
            {pack.categoryIcon}
          </div>
          <div>
            <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-display)', color: 'hsl(var(--foreground))' }}>
              {pack.topic}
            </h1>
            <p className="text-sm" style={{ fontFamily: 'var(--font-heading)', color: 'hsl(var(--muted-foreground))' }}>
              {pack.categoryName} · {levels.length} bulmaca
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs" style={{ fontFamily: 'var(--font-heading)', color: 'hsl(var(--muted-foreground))' }}>
              İlerleme
            </span>
            <span className="text-xs font-bold" style={{ fontFamily: 'var(--font-heading)', color: 'hsl(var(--primary))' }}>
              %{completionPercent}
            </span>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ background: 'hsl(var(--muted))' }}>
            <motion.div
              className="h-full rounded-full"
              style={{ background: 'hsl(var(--primary))' }}
              initial={{ width: 0 }}
              animate={{ width: `${completionPercent}%` }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            />
          </div>
        </div>
      </header>

      {/* Level list */}
      <section className="flex-1 px-4 pb-8">
        <div className="flex flex-col gap-3">
          {levels.map((level, i) => {
            const status = getLevelStatus(packId, level.levelId, levels.length);
            const progress = getLevelProgress(packId, level.levelId);
            const isLocked = status === 'locked';
            const isCompleted = status === 'completed';
            const isInProgress = status === 'in-progress';

            return (
              <motion.div
                key={level.levelId}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06, type: 'spring', stiffness: 200, damping: 20 }}
              >
                <div
                  className={cn(
                    'relative rounded-xl p-4 transition-all overflow-hidden',
                    isLocked && 'opacity-50 cursor-not-allowed',
                    !isLocked && 'cursor-pointer active:scale-[0.98]',
                    isCompleted && 'ring-1',
                  )}
                  style={{
                    background: isCompleted
                      ? 'hsl(var(--cell-correct) / 0.4)'
                      : isInProgress
                        ? 'hsl(var(--cell-highlight) / 0.4)'
                        : 'hsl(var(--card))',
                    border: `1.5px solid ${isCompleted ? 'hsl(142 50% 70%)' : isInProgress ? 'hsl(45 80% 70%)' : 'hsl(var(--border))'}`,
                    '--tw-ring-color': 'hsl(142 50% 70%)',
                  } as React.CSSProperties}
                  onClick={() => handleLevelClick(level)}
                >
                  {/* Notebook lines */}
                  <div className="absolute inset-0 pointer-events-none" style={{ opacity: 0.04 }}>
                    {Array.from({ length: 6 }).map((_, j) => (
                      <div key={j} className="absolute left-0 right-0 h-px" style={{ top: `${(j + 1) * 14}%`, background: 'hsl(var(--foreground))' }} />
                    ))}
                  </div>

                  <div className="flex items-center gap-3 relative z-10">
                    {/* Status icon */}
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                      style={{
                        background: isCompleted
                          ? 'hsl(142 50% 45%)'
                          : isInProgress
                            ? 'hsl(45 80% 55%)'
                            : isLocked
                              ? 'hsl(var(--muted))'
                              : 'hsl(var(--primary))',
                      }}
                    >
                      {isLocked ? (
                        <Lock className="w-4 h-4" style={{ color: 'hsl(var(--muted-foreground))' }} />
                      ) : isCompleted ? (
                        <CheckCircle2 className="w-5 h-5 text-white" />
                      ) : (
                        <PlayCircle className="w-5 h-5 text-white" />
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className="font-bold text-base truncate"
                          style={{ fontFamily: 'var(--font-display)', color: 'hsl(var(--foreground))' }}
                        >
                          Level {parseInt(level.levelId) + 1}
                        </span>
                        {isInProgress && (
                          <span
                            className="text-[10px] px-1.5 py-0.5 rounded-full"
                            style={{ background: 'hsl(45 80% 55% / 0.2)', color: 'hsl(45 80% 35%)', fontFamily: 'var(--font-heading)', fontWeight: 600 }}
                          >
                            Devam
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-0.5">
                        <span className="text-xs flex items-center gap-1" style={{ color: 'hsl(var(--muted-foreground))', fontFamily: 'var(--font-heading)' }}>
                          <Clock className="w-3 h-3" /> {level.estimatedMinutes} dk
                        </span>
                        <span className="text-xs flex items-center gap-1" style={{ color: 'hsl(var(--muted-foreground))', fontFamily: 'var(--font-heading)' }}>
                          <Grid3X3 className="w-3 h-3" /> {level.gridSize}
                        </span>
                        <span className="text-xs flex items-center gap-1" style={{ color: 'hsl(var(--muted-foreground))', fontFamily: 'var(--font-heading)' }}>
                          {level.clueCount} ipucu
                        </span>
                      </div>
                    </div>

                    {/* Score badge for completed */}
                    {isCompleted && progress?.score !== undefined && (
                      <div className="flex items-center gap-1 px-2 py-1 rounded-full" style={{ background: 'hsl(142 50% 45% / 0.15)' }}>
                        <Star className="w-3.5 h-3.5" style={{ color: 'hsl(45 80% 50%)' }} />
                        <span className="text-xs font-bold" style={{ fontFamily: 'var(--font-heading)', color: 'hsl(142 50% 35%)' }}>
                          {progress.score}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default PackDetail;
