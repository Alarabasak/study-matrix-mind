/**
 * Result Screen — Shown when puzzle is completed.
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Clock, HelpCircle, XCircle, ChevronRight, ArrowLeft, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CompletionMetrics } from '@/utils/gameplayValidation';

interface ResultScreenProps {
  metrics: CompletionMetrics;
  onNextLevel: () => void;
  onBackToPack: () => void;
  hasNextLevel: boolean;
}

const ResultScreen: React.FC<ResultScreenProps> = ({
  metrics,
  onNextLevel,
  onBackToPack,
  hasNextLevel,
}) => {
  const isPerfect = metrics.completionStatus === 'perfect';

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'hsl(var(--background) / 0.95)', backdropFilter: 'blur(8px)' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <motion.div
        className="w-full max-w-sm rounded-2xl p-6 text-center"
        style={{
          background: 'hsl(var(--card))',
          border: '2px solid hsl(var(--border))',
          boxShadow: '0 20px 60px hsl(0 0% 0% / 0.15)',
        }}
        initial={{ scale: 0.8, y: 30 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20, delay: 0.1 }}
      >
        {/* Status emoji */}
        <motion.div
          className="text-6xl mb-3"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 15, delay: 0.3 }}
        >
          {isPerfect ? '🌟' : '🎊'}
        </motion.div>

        <h2 className="text-2xl font-bold mb-1" style={{ fontFamily: 'var(--font-display)', color: 'hsl(var(--foreground))' }}>
          {isPerfect ? 'Mükemmel!' : 'Tamamlandı!'}
        </h2>
        <p className="text-sm mb-5" style={{ fontFamily: 'var(--font-heading)', color: 'hsl(var(--muted-foreground))' }}>
          {isPerfect ? 'Hiç ipucu ve hata olmadan!' : 'Bulmacayı başarıyla tamamladın.'}
        </p>

        {/* Metrics grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="rounded-xl p-3" style={{ background: 'hsl(var(--muted))' }}>
            <Trophy className="w-5 h-5 mx-auto mb-1" style={{ color: 'hsl(45 80% 50%)' }} />
            <div className="text-lg font-bold" style={{ fontFamily: 'var(--font-heading)', color: 'hsl(var(--foreground))' }}>
              {metrics.score}
            </div>
            <div className="text-[10px]" style={{ color: 'hsl(var(--muted-foreground))' }}>Puan</div>
          </div>
          <div className="rounded-xl p-3" style={{ background: 'hsl(var(--muted))' }}>
            <Clock className="w-5 h-5 mx-auto mb-1" style={{ color: 'hsl(var(--accent))' }} />
            <div className="text-lg font-bold" style={{ fontFamily: 'var(--font-heading)', color: 'hsl(var(--foreground))' }}>
              {formatTime(metrics.elapsedSeconds)}
            </div>
            <div className="text-[10px]" style={{ color: 'hsl(var(--muted-foreground))' }}>Süre</div>
          </div>
          <div className="rounded-xl p-3" style={{ background: 'hsl(var(--muted))' }}>
            <HelpCircle className="w-5 h-5 mx-auto mb-1" style={{ color: 'hsl(var(--primary))' }} />
            <div className="text-lg font-bold" style={{ fontFamily: 'var(--font-heading)', color: 'hsl(var(--foreground))' }}>
              {metrics.hintsUsed}
            </div>
            <div className="text-[10px]" style={{ color: 'hsl(var(--muted-foreground))' }}>İpucu</div>
          </div>
          <div className="rounded-xl p-3" style={{ background: 'hsl(var(--muted))' }}>
            <Star className="w-5 h-5 mx-auto mb-1" style={{ color: 'hsl(142 50% 45%)' }} />
            <div className="text-lg font-bold" style={{ fontFamily: 'var(--font-heading)', color: 'hsl(var(--foreground))' }}>
              {metrics.completedClues}/{metrics.totalClues}
            </div>
            <div className="text-[10px]" style={{ color: 'hsl(var(--muted-foreground))' }}>Kelime</div>
          </div>
        </div>

        {/* Wrong checks */}
        {metrics.wrongChecks > 0 && (
          <div className="flex items-center justify-center gap-1.5 text-xs mb-4" style={{ color: 'hsl(var(--destructive))' }}>
            <XCircle className="w-3.5 h-3.5" />
            {metrics.wrongChecks} yanlış kontrol
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-2">
          {hasNextLevel && (
            <Button onClick={onNextLevel} className="w-full gap-2 rounded-xl">
              Sonraki Level
              <ChevronRight className="w-4 h-4" />
            </Button>
          )}
          <Button variant={hasNextLevel ? 'outline' : 'default'} onClick={onBackToPack} className="w-full gap-2 rounded-xl">
            <ArrowLeft className="w-4 h-4" />
            Pakete Dön
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ResultScreen;
