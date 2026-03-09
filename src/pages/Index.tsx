import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { categories } from '@/data/questions';
import { Button } from '@/components/ui/button';
import { PlayCircle, ArrowRight, Star, Clock, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { listPacks } from '@/utils/puzzleLoader';
import { PuzzlePack } from '@/data/puzzleRepository';
import { getPacksForCategory } from '@/data/staticPuzzleRepository';
import {
  getProgress,
  getLastPlayedSession,
  getContinueTarget,
  getPackCompletionPercent,
  LastPlayedSession,
} from '@/utils/progressStore';
import BookshelfSelector from '@/components/scrapbook/BookshelfSelector';
import ProfileModal from '@/components/ProfileModal';
import ExamCountdown from '@/components/ExamCountdown';
import { motion, AnimatePresence } from 'framer-motion';

// Sticker imports
import stickerSwan from '@/assets/stickers/swan.png';
import stickerOtter from '@/assets/stickers/otter.png';
import stickerHeadphones from '@/assets/stickers/headphones.png';
import stickerBooks from '@/assets/stickers/books.png';
import stickerCandle from '@/assets/stickers/candle.png';
import stickerCamera from '@/assets/stickers/camera.png';
import stickerPalette from '@/assets/stickers/palette.png';
import stickerCar from '@/assets/stickers/car.png';
import stickerPajamas from '@/assets/stickers/pajamas.png';
import stickerComputer from '@/assets/stickers/computer.png';

const DECO_STICKERS = [
  { src: stickerSwan, style: { top: '5%', left: '2%', width: '70px', transform: 'rotate(-8deg)' } },
  { src: stickerHeadphones, style: { top: '6%', right: '3%', width: '60px', transform: 'rotate(10deg)' } },
  { src: stickerOtter, style: { top: '30%', right: '1%', width: '55px', transform: 'rotate(-5deg)' } },
  { src: stickerBooks, style: { bottom: '18%', left: '1%', width: '75px', transform: 'rotate(4deg)' } },
  { src: stickerCandle, style: { bottom: '8%', right: '3%', width: '45px', transform: 'rotate(-6deg)' } },
  { src: stickerCamera, style: { top: '50%', left: '1%', width: '50px', transform: 'rotate(12deg)' } },
  { src: stickerPalette, style: { top: '65%', right: '1%', width: '60px', transform: 'rotate(-15deg)' } },
  { src: stickerCar, style: { bottom: '35%', left: '3%', width: '65px', transform: 'rotate(3deg)' } },
];

const DESK_CLUTTER = [
  { src: stickerPajamas, style: { bottom: '5%', left: '8%', width: '80px', transform: 'rotate(-8deg)', opacity: 0.07 } },
  { src: stickerComputer, style: { top: '12%', left: '10%', width: '90px', transform: 'rotate(5deg)', opacity: 0.06 } },
];

const Index: React.FC = () => {
  const navigate = useNavigate();
  const [selectedGrade, setSelectedGrade] = useState<'TYT' | 'AYT' | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [packs, setPacks] = useState<PuzzlePack[]>([]);
  const [lastPlayed, setLastPlayed] = useState<LastPlayedSession | null>(null);
  const [continueTarget, setContinueTarget] = useState<{ packId: string; levelId: string } | null>(null);
  const [progress, setProgress] = useState(() => getProgress());

  useEffect(() => {
    listPacks().then(setPacks);
    setLastPlayed(getLastPlayedSession());
    setContinueTarget(getContinueTarget());
    setProgress(getProgress());
  }, []);

  const handleContinue = () => {
    if (continueTarget) {
      const pack = packs.find(p => p.packId === continueTarget.packId);
      navigate(`/game?pack=${continueTarget.packId}&level=${continueTarget.levelId}&category=${pack?.category || ''}`);
    } else if (lastPlayed) {
      navigate(`/pack?packId=${lastPlayed.packId}`);
    }
  };

  const handlePackClick = (packId: string) => {
    navigate(`/pack?packId=${packId}`);
  };

  // Group packs by grade
  const tytCategories = categories.filter(c => c.grade === 'TYT');
  const aytCategories = categories.filter(c => c.grade === 'AYT');

  const getPacksForCat = (catId: string) => packs.filter(p => p.category === catId);

  const filteredCategories = selectedGrade === 'TYT' ? tytCategories : selectedGrade === 'AYT' ? aytCategories : [];

  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden relative"
      style={{
        background: 'hsl(var(--background))',
        backgroundImage: `
          radial-gradient(ellipse at 20% 50%, hsl(var(--folder-pink) / 0.08) 0%, transparent 50%),
          radial-gradient(ellipse at 80% 30%, hsl(var(--folder-blue) / 0.08) 0%, transparent 50%)
        `,
      }}
    >
      {/* Decorative stickers */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {DECO_STICKERS.map((s, i) => (
          <motion.img
            key={`sticker-${i}`}
            src={s.src}
            className="absolute select-none"
            style={{ ...s.style, opacity: 0.15 }}
            alt="" draggable={false}
            animate={{ y: [0, -4, 0], rotate: [0, i % 2 === 0 ? 3 : -3, 0] }}
            transition={{ duration: 6 + i * 0.8, repeat: Infinity, ease: 'easeInOut' }}
          />
        ))}
        {DESK_CLUTTER.map((item, i) => (
          <img key={`clutter-${i}`} src={item.src} className="absolute select-none" style={item.style} alt="" draggable={false} />
        ))}
        <svg className="absolute bottom-0 left-0 w-full h-16 opacity-[0.06]" viewBox="0 0 400 40" preserveAspectRatio="none">
          <path d="M0 20 Q25 5 50 20 T100 20 T150 20 T200 20 T250 20 T300 20 T350 20 T400 20" fill="none" stroke="hsl(var(--primary))" strokeWidth="3" />
        </svg>
      </div>

      {/* HEADER */}
      <header className="relative text-center pt-8 pb-4 px-4 z-10">
        <motion.button
          className="absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, hsl(var(--folder-pink)), hsl(var(--primary)))',
            boxShadow: '0 3px 10px hsl(var(--primary) / 0.25)',
            border: '2px solid hsl(0 0% 100% / 0.4)',
          }}
          onClick={() => setProfileOpen(true)}
          whileTap={{ scale: 0.9 }}
          whileHover={{ scale: 1.1 }}
          title="Profilim"
        >
          <img src={stickerSwan} alt="Profil" className="w-6 h-6 object-contain" />
        </motion.button>

        <motion.p
          className="text-sm tracking-wider mb-1"
          style={{ fontFamily: 'var(--font-display)', color: 'hsl(var(--accent))', fontWeight: 600 }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
        >
          ✦ study edition · 2025 ✦
        </motion.p>

        <motion.h1
          className="text-6xl sm:text-8xl font-bold tracking-tight"
          style={{
            fontFamily: 'var(--font-display)',
            background: 'linear-gradient(135deg, hsl(var(--primary)) 30%, hsl(var(--folder-pink)) 70%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            filter: 'drop-shadow(0 2px 4px hsl(var(--primary) / 0.15))',
          }}
          initial={{ opacity: 0, y: -24, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, ease: [0.34, 1.56, 0.64, 1] }}
        >
          CrossPrep
        </motion.h1>

        <ExamCountdown />
      </header>

      {/* CONTINUE BUTTON */}
      {(continueTarget || lastPlayed) && (
        <motion.section
          className="max-w-2xl mx-auto w-full px-4 mb-5 z-10"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
        >
          <motion.div
            className="rounded-xl p-4 cursor-pointer relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, hsl(var(--primary) / 0.12), hsl(var(--folder-pink) / 0.15))',
              border: '2px solid hsl(var(--primary) / 0.3)',
              boxShadow: '0 4px 20px hsl(var(--primary) / 0.1)',
            }}
            onClick={handleContinue}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center shrink-0"
                style={{ background: 'hsl(var(--primary))', boxShadow: '0 3px 12px hsl(var(--primary) / 0.3)' }}
              >
                <PlayCircle className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-lg" style={{ fontFamily: 'var(--font-display)', color: 'hsl(var(--primary))' }}>
                  {continueTarget ? 'Devam Et' : 'Son Oynanan'}
                </div>
                {lastPlayed && (
                  <div className="text-xs truncate" style={{ fontFamily: 'var(--font-heading)', color: 'hsl(var(--muted-foreground))' }}>
                    {lastPlayed.categoryIcon} {lastPlayed.categoryName} · {lastPlayed.topic}
                  </div>
                )}
              </div>
              <ArrowRight className="w-5 h-5 shrink-0" style={{ color: 'hsl(var(--primary))' }} />
            </div>
          </motion.div>
        </motion.section>
      )}

      {/* PROGRESS SUMMARY */}
      {progress.totalCompleted > 0 && (
        <motion.section
          className="max-w-2xl mx-auto w-full px-4 mb-5 z-10"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
        >
          <div className="flex gap-3">
            <div className="flex-1 rounded-lg p-3 text-center" style={{ background: 'hsl(var(--card))', border: '1.5px solid hsl(var(--border))' }}>
              <div className="text-2xl font-bold" style={{ fontFamily: 'var(--font-display)', color: 'hsl(var(--primary))' }}>
                {progress.totalCompleted}
              </div>
              <div className="text-[10px]" style={{ fontFamily: 'var(--font-heading)', color: 'hsl(var(--muted-foreground))' }}>Tamamlanan</div>
            </div>
            <div className="flex-1 rounded-lg p-3 text-center" style={{ background: 'hsl(var(--card))', border: '1.5px solid hsl(var(--border))' }}>
              <div className="text-2xl font-bold" style={{ fontFamily: 'var(--font-display)', color: 'hsl(45 80% 50%)' }}>
                {progress.totalScore}
              </div>
              <div className="text-[10px]" style={{ fontFamily: 'var(--font-heading)', color: 'hsl(var(--muted-foreground))' }}>Toplam Puan</div>
            </div>
          </div>
        </motion.section>
      )}

      {/* GRADE SELECTOR */}
      <section className="max-w-2xl mx-auto w-full px-4 mb-6 z-10">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-lg" style={{ color: 'hsl(var(--primary))' }}>★</span>
          <h2 className="text-2xl sm:text-3xl font-bold" style={{ fontFamily: 'var(--font-display)', color: 'hsl(var(--accent))' }}>
            Sınav Türü
          </h2>
        </div>
        <div className="grid grid-cols-2 gap-5">
          {(['TYT', 'AYT'] as const).map((grade, i) => (
            <motion.div
              key={grade}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.08, type: 'spring', stiffness: 180, damping: 16 }}
            >
              <div
                className={cn(
                  'relative rounded-lg p-4 cursor-pointer transition-all overflow-hidden',
                  selectedGrade === grade && 'ring-2 ring-offset-2 ring-offset-background'
                )}
                style={{
                  background: grade === 'TYT'
                    ? 'linear-gradient(135deg, hsl(var(--folder-pink) / 0.3), hsl(var(--folder-pink) / 0.15))'
                    : 'linear-gradient(135deg, hsl(var(--folder-blue) / 0.3), hsl(var(--folder-blue) / 0.15))',
                  border: `2px solid ${selectedGrade === grade ? 'hsl(var(--primary))' : 'hsl(var(--border))'}`,
                  '--tw-ring-color': 'hsl(var(--primary))',
                } as React.CSSProperties}
                onClick={() => setSelectedGrade(grade)}
              >
                <svg className="absolute top-0 right-0 w-8 h-8 opacity-20" viewBox="0 0 30 30">
                  <path d="M30 0 L30 30 L0 30" fill="none" stroke="hsl(var(--primary))" strokeWidth="2" />
                  <circle cx="24" cy="24" r="2" fill="hsl(var(--primary))" />
                </svg>
                <div className="text-center py-1 relative z-10">
                  <img src={grade === 'TYT' ? stickerOtter : stickerSwan} alt={grade} className="w-10 h-10 mx-auto mb-1 object-contain" />
                  <div className="text-2xl font-bold" style={{ fontFamily: 'var(--font-display)', color: 'hsl(var(--primary))' }}>
                    {grade}
                  </div>
                  <div className="text-[11px]" style={{ fontFamily: 'var(--font-display)', color: 'hsl(var(--accent))' }}>
                    {grade === 'TYT' ? 'Temel Yeterlilik Testi' : 'Alan Yeterlilik Testi'}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CATEGORY → PACK LIST */}
      <AnimatePresence>
        {selectedGrade && (
          <motion.section
            className="max-w-2xl mx-auto w-full px-4 mb-6 z-10"
            initial={{ opacity: 0, height: 0, y: 20 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -10 }}
            transition={{ duration: 0.4, type: 'spring', stiffness: 180, damping: 20 }}
          >
            <div className="flex items-center gap-2 mb-4">
              <span className="text-lg" style={{ color: 'hsl(var(--primary))' }}>★</span>
              <h2 className="text-2xl sm:text-3xl font-bold" style={{ fontFamily: 'var(--font-display)', color: 'hsl(var(--accent))' }}>
                {selectedGrade} Dersleri
              </h2>
            </div>

            {filteredCategories.map((cat) => {
              const catPacks = getPacksForCat(cat.id);
              if (catPacks.length === 0) return null;

              return (
                <div key={cat.id} className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">{cat.icon}</span>
                    <span className="text-lg font-bold" style={{ fontFamily: 'var(--font-display)', color: 'hsl(var(--foreground))' }}>
                      {cat.name.replace(`${selectedGrade} `, '')}
                    </span>
                  </div>
                  <div className="flex flex-col gap-2">
                    {catPacks.map((pack) => {
                      const completion = getPackCompletionPercent(pack.packId, pack.levelCount);

                      return (
                        <motion.div
                          key={pack.packId}
                          className="rounded-lg p-3.5 cursor-pointer transition-all relative overflow-hidden"
                          style={{
                            background: 'hsl(var(--card))',
                            border: '1.5px solid hsl(var(--border))',
                          }}
                          onClick={() => handlePackClick(pack.packId)}
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          {/* Notebook lines */}
                          <div className="absolute inset-0 pointer-events-none" style={{ opacity: 0.03 }}>
                            {Array.from({ length: 4 }).map((_, j) => (
                              <div key={j} className="absolute left-0 right-0 h-px" style={{ top: `${(j + 1) * 20}%`, background: 'hsl(var(--foreground))' }} />
                            ))}
                          </div>

                          <div className="flex items-center gap-3 relative z-10">
                            <div className="flex-1 min-w-0">
                              <div className="font-bold text-sm" style={{ fontFamily: 'var(--font-display)', color: 'hsl(var(--foreground))' }}>
                                {pack.topic}
                              </div>
                              <div className="text-[11px] mt-0.5" style={{ fontFamily: 'var(--font-heading)', color: 'hsl(var(--muted-foreground))' }}>
                                {pack.levelCount} bulmaca · Zorluk {pack.difficulty}/5
                              </div>
                            </div>

                            {completion > 0 && (
                              <div className="flex items-center gap-1.5">
                                {completion === 100 ? (
                                  <CheckCircle2 className="w-5 h-5" style={{ color: 'hsl(142 50% 45%)' }} />
                                ) : (
                                  <span className="text-xs font-bold" style={{ fontFamily: 'var(--font-heading)', color: 'hsl(var(--primary))' }}>
                                    %{completion}
                                  </span>
                                )}
                              </div>
                            )}

                            <ArrowRight className="w-4 h-4 shrink-0" style={{ color: 'hsl(var(--muted-foreground))' }} />
                          </div>

                          {/* Mini progress bar */}
                          {completion > 0 && completion < 100 && (
                            <div className="mt-2 h-1 rounded-full overflow-hidden relative z-10" style={{ background: 'hsl(var(--muted))' }}>
                              <div className="h-full rounded-full" style={{ width: `${completion}%`, background: 'hsl(var(--primary))' }} />
                            </div>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {filteredCategories.every(c => getPacksForCat(c.id).length === 0) && (
              <div className="text-center py-8">
                <div className="text-3xl mb-2">📚</div>
                <p className="text-sm" style={{ fontFamily: 'var(--font-heading)', color: 'hsl(var(--muted-foreground))' }}>
                  Bu sınav türü için henüz bulmaca paketi eklenmedi.
                </p>
              </div>
            )}
          </motion.section>
        )}
      </AnimatePresence>

      {/* Footer space */}
      <div className="h-8 z-10" />

      <ProfileModal open={profileOpen} onOpenChange={setProfileOpen} />
    </div>
  );
};

export default Index;
