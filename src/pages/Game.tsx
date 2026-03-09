import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { PuzzleDefinition } from '@/types/puzzle';
import {
  CellCoord,
  CellRelationMap,
  SolutionMap,
  coordKey,
  buildCellRelationMap,
  buildSolutionMap,
} from '@/types/gameplayState';
import {
  selectClueForCell,
  getHighlightedCellKeys,
  getNextCell,
  getPrevCell,
  getClueById,
} from '@/utils/gameplayUtils';
import {
  checkClue,
  isPuzzleFullyComplete,
  findNextHintTarget,
  findIncorrectCells,
  buildCompletionMetrics,
  CompletionMetrics,
} from '@/utils/gameplayValidation';
import { loadPuzzleByPackLevel, loadPuzzleByCategory, loadPuzzleById } from '@/utils/puzzleLoader';
import { categories } from '@/data/questions';
import { addAdHint, saveGameSession, addUnknownWord } from '@/utils/gameStats';
import {
  completeLevel,
  saveInProgressLevel,
  getLevelProgress,
} from '@/utils/progressStore';
import ArrowCrosswordGrid from '@/components/game/ArrowCrosswordGrid';
import ArrowClueList from '@/components/game/ArrowClueList';
import GameHeader from '@/components/game/GameHeader';
import AdHintDialog from '@/components/game/AdHintDialog';
import TurkishKeyboard from '@/components/game/TurkishKeyboard';
import ReactionOverlay from '@/components/game/ReactionOverlay';
import { toast } from 'sonner';

const Game: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // ─── Route params: pack/level based OR category-based fallback ─────────────
  const packId = searchParams.get('pack');
  const levelId = searchParams.get('level') || '0';
  const puzzleId = searchParams.get('puzzleId');
  const categoryId = searchParams.get('category') || 'tyt-mat';

  const category = categoryId === 'shuffle'
    ? { id: 'shuffle', name: 'Karıştır', icon: '🔀', description: 'Tüm dersler', color: 'hsl(0,0%,50%)', grade: 'TYT' as const }
    : (categories.find(c => c.id === categoryId) || categories[0]);

  // ─── Puzzle loading state ───────────────────────────────────────────────────
  const [loading, setLoading] = useState(true);
  const [puzzle, setPuzzle] = useState<PuzzleDefinition | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loadKey, setLoadKey] = useState(0); // increment to reload

  // Load puzzle from static content repository
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setLoadError(null);

    const load = async (): Promise<PuzzleDefinition | null> => {
      // Priority 1: direct puzzle ID
      if (puzzleId) return loadPuzzleById(puzzleId);
      // Priority 2: pack + level
      if (packId) return loadPuzzleByPackLevel(packId, levelId);
      // Priority 3: category-based random
      return loadPuzzleByCategory(categoryId);
    };

    load().then(result => {
      if (cancelled) return;
      if (result) {
        setPuzzle(result);
      } else {
        setLoadError('Bu kategori için hazır bulmaca bulunamadı');
      }
      setLoading(false);
    }).catch(err => {
      if (cancelled) return;
      console.error('[Game] Puzzle load failed:', err);
      setLoadError('Bulmaca yüklenirken hata oluştu');
      setLoading(false);
    });

    return () => { cancelled = true; };
  }, [packId, levelId, puzzleId, categoryId, loadKey]);

  // ─── Pre-computed lookups (derived from puzzle, no generator deps) ──────────
  const cellRelations = useMemo<CellRelationMap>(
    () => puzzle ? buildCellRelationMap(puzzle) : new Map(),
    [puzzle]
  );
  const solutionMap = useMemo<SolutionMap>(
    () => puzzle ? buildSolutionMap(puzzle) : new Map(),
    [puzzle]
  );

  // ─── Gameplay state ─────────────────────────────────────────────────────────
  const [userEntries, setUserEntries] = useState<Map<string, string>>(new Map());
  const [activeCell, setActiveCell] = useState<CellCoord | null>(null);
  const [activeClueId, setActiveClueId] = useState<string | null>(null);
  const [activeDirection, setActiveDirection] = useState<'right' | 'down'>('right');
  const [completedClueIds, setCompletedClueIds] = useState<Set<string>>(new Set());
  const [revealedCells, setRevealedCells] = useState<Set<string>>(new Set());
  const [incorrectCellKeys, setIncorrectCellKeys] = useState<Set<string>>(new Set());
  const [score, setScore] = useState(0);
  const [startTime, setStartTime] = useState(Date.now());
  const [adHintsUsed, setAdHintsUsed] = useState(0);
  const [wrongChecks, setWrongChecks] = useState(0);
  const [adDialogOpen, setAdDialogOpen] = useState(false);
  const adTargetHint = useRef<{ clueId: string; cellIndex: number } | null>(null);
  const [reactionTrigger, setReactionTrigger] = useState<{ correct: boolean; key: number } | null>(null);
  const [completionMetrics, setCompletionMetrics] = useState<CompletionMetrics | null>(null);

  // Reset state when puzzle changes
  useEffect(() => {
    if (puzzle) {
      setUserEntries(new Map());
      setActiveCell(null);
      setActiveClueId(null);
      setCompletedClueIds(new Set());
      setRevealedCells(new Set());
      setIncorrectCellKeys(new Set());
      setScore(0);
      setStartTime(Date.now());
      setAdHintsUsed(0);
      setWrongChecks(0);
      setCompletionMetrics(null);
    }
  }, [puzzle]);

  const highlightedCells = useMemo(
    () => puzzle ? getHighlightedCellKeys(puzzle, activeClueId) : new Set<string>(),
    [puzzle, activeClueId]
  );

  // ─── Cell click ─────────────────────────────────────────────────────────────
  const handleCellClick = useCallback((x: number, y: number) => {
    if (!puzzle) return;
    // Clear incorrect markers on interaction
    setIncorrectCellKeys(new Set());

    const result = selectClueForCell(cellRelations, x, y, activeClueId, activeCell);
    if (result) {
      setActiveCell({ x, y });
      setActiveClueId(result.clueId);
      setActiveDirection(result.direction);
    }
  }, [puzzle, cellRelations, activeClueId, activeCell]);

  // ─── Clue click ─────────────────────────────────────────────────────────────
  const handleClueClick = useCallback((clueId: string) => {
    if (!puzzle) return;
    setIncorrectCellKeys(new Set());

    const clue = getClueById(puzzle, clueId);
    if (clue && clue.cells.length > 0) {
      setActiveClueId(clueId);
      setActiveDirection(clue.direction);
      const firstEmpty = clue.cells.find(c => !userEntries.get(coordKey(c.x, c.y)));
      setActiveCell(firstEmpty || clue.cells[0]);
    }
  }, [puzzle, userEntries]);

  // ─── Clue completion check ──────────────────────────────────────────────────
  const checkAndCompleteClues = useCallback((
    entries: Map<string, string>,
    pendingEntry?: { x: number; y: number; letter: string }
  ) => {
    if (!puzzle) return;

    const key = pendingEntry ? coordKey(pendingEntry.x, pendingEntry.y) : null;
    const relations = key ? cellRelations.get(key) || [] : [];

    for (const rel of relations) {
      if (completedClueIds.has(rel.clueId)) continue;
      const clue = getClueById(puzzle, rel.clueId);
      if (!clue) continue;

      const result = checkClue(clue, entries, pendingEntry);

      if (result.allFilled) {
        if (result.allCorrect) {
          setCompletedClueIds(prev => {
            const next = new Set(prev);
            next.add(rel.clueId);

            setRevealedCells(prevR => {
              const nextR = new Set(prevR);
              for (const c of clue.cells) nextR.add(coordKey(c.x, c.y));
              return nextR;
            });

            setScore(s => s + 10);
            toast.success('Doğru! +10 puan 🎉', { duration: 1500 });
            setReactionTrigger({ correct: true, key: Date.now() });

            // Puzzle completion check
            if (isPuzzleFullyComplete(puzzle, next)) {
              const metrics = buildCompletionMetrics(
                puzzle, next, adHintsUsed, startTime, score + 10, wrongChecks
              );
              setCompletionMetrics(metrics);

              saveGameSession({
                id: `${Date.now()}`, category: categoryId, categoryName: category.name,
                gridSize: `${puzzle.gridWidth}x${puzzle.gridHeight}`,
                score: score + 10, wordsFound: next.size,
                totalWords: puzzle.clues.length,
                duration: metrics.elapsedSeconds, timestamp: Date.now(),
                adHintsUsed, seed: 0,
              });

              // Save progress
              if (packId) {
                completeLevel(packId, levelId, puzzle.id, {
                  score: score + 10,
                  hintsUsed: adHintsUsed,
                  elapsedSeconds: metrics.elapsedSeconds,
                }, {
                  category: categoryId,
                  categoryName: category.name,
                  categoryIcon: category.icon,
                  topic: puzzle.topic || '',
                });
              }

              const statusEmoji = metrics.completionStatus === 'perfect' ? '🌟' : '🎊';
              toast(`${statusEmoji} Bulmaca Tamamlandı!`, {
                description: `Puan: ${score + 10} | Kelime: ${puzzle.clues.length}` +
                  (metrics.completionStatus === 'perfect' ? ' | Mükemmel!' : ''),
                duration: 5000,
              });
            }
            return next;
          });
        } else {
          // Wrong answer
          setWrongChecks(prev => prev + 1);
          addUnknownWord({
            word: clue.answer, clue: clue.text, category: categoryId,
            categoryName: category.name, timestamp: Date.now(), learned: false,
          });
          toast.error('Yanlış, tekrar dene!', { duration: 1500 });
          setReactionTrigger({ correct: false, key: Date.now() });

          // Temporarily mark incorrect cells
          const incorrectKeys = new Set(
            result.incorrectCells.map(c => coordKey(c.x, c.y))
          );
          setIncorrectCellKeys(incorrectKeys);
          setTimeout(() => setIncorrectCellKeys(new Set()), 2000);
        }
      }
    }
  }, [puzzle, cellRelations, completedClueIds, startTime, categoryId, category.name, score, adHintsUsed, wrongChecks]);

  // ─── Letter input ───────────────────────────────────────────────────────────
  const handleLetterInput = useCallback((letter: string) => {
    if (!puzzle || !activeCell) return;
    const key = coordKey(activeCell.x, activeCell.y);

    if (revealedCells.has(key)) {
      const next = getNextCell(puzzle, activeClueId, activeCell, revealedCells, completedClueIds);
      if (next) setActiveCell(next);
      return;
    }

    const upperLetter = letter.toUpperCase();
    const newEntries = new Map(userEntries);
    newEntries.set(key, upperLetter);
    setUserEntries(newEntries);

    // Clear incorrect markers
    setIncorrectCellKeys(new Set());

    checkAndCompleteClues(newEntries, { x: activeCell.x, y: activeCell.y, letter: upperLetter });

    // Auto-save progress
    if (packId && puzzle) {
      saveInProgressLevel(packId, levelId, puzzle.id, newEntries, completedClueIds, {
        category: categoryId, categoryName: category.name, categoryIcon: category.icon, topic: puzzle.topic || '',
      });
    }

    const next = getNextCell(puzzle, activeClueId, activeCell, revealedCells, completedClueIds);
    if (next) setActiveCell(next);
  }, [puzzle, activeCell, activeClueId, userEntries, revealedCells, completedClueIds, checkAndCompleteClues, packId, levelId, categoryId, category]);

  // ─── Backspace ──────────────────────────────────────────────────────────────
  const handleBackspace = useCallback(() => {
    if (!puzzle || !activeCell) return;
    const key = coordKey(activeCell.x, activeCell.y);

    if (revealedCells.has(key)) {
      const prev = getPrevCell(puzzle, activeClueId, activeCell, revealedCells);
      if (prev) setActiveCell(prev);
      return;
    }

    const currentLetter = userEntries.get(key);
    if (currentLetter) {
      const newEntries = new Map(userEntries);
      newEntries.delete(key);
      setUserEntries(newEntries);
    } else {
      const prev = getPrevCell(puzzle, activeClueId, activeCell, revealedCells);
      if (prev) {
        setActiveCell(prev);
        const prevKey = coordKey(prev.x, prev.y);
        const newEntries = new Map(userEntries);
        newEntries.delete(prevKey);
        setUserEntries(newEntries);
      }
    }
  }, [puzzle, activeCell, activeClueId, userEntries, revealedCells]);

  // ─── Hint system ────────────────────────────────────────────────────────────
  const handleAdHintRequest = useCallback(() => {
    if (!puzzle) return;
    const hint = findNextHintTarget(puzzle, userEntries, completedClueIds, revealedCells);
    if (hint) {
      adTargetHint.current = { clueId: hint.clue.id, cellIndex: hint.cellIndex };
      setAdDialogOpen(true);
    } else {
      toast('Tüm harfler dolu!', { duration: 1500 });
    }
  }, [puzzle, userEntries, completedClueIds, revealedCells]);

  const handleAdConfirm = useCallback(() => {
    if (!puzzle || !adTargetHint.current) return;
    const clue = getClueById(puzzle, adTargetHint.current.clueId);
    if (!clue) return;

    const cell = clue.cells[adTargetHint.current.cellIndex];
    const letter = clue.answer[adTargetHint.current.cellIndex];
    const key = coordKey(cell.x, cell.y);

    const newEntries = new Map(userEntries);
    newEntries.set(key, letter);
    setUserEntries(newEntries);

    setRevealedCells(prev => new Set([...prev, key]));
    setScore(prev => Math.max(0, prev - 3));
    setAdHintsUsed(prev => prev + 1);

    addAdHint({
      word: clue.answer, clue: clue.text, category: categoryId,
      categoryName: category.name, timestamp: Date.now(),
    });
    toast('💡 Harf açıldı! (-3 puan)', { duration: 1500 });

    checkAndCompleteClues(newEntries, { x: cell.x, y: cell.y, letter });
  }, [puzzle, userEntries, categoryId, category.name, checkAndCompleteClues]);

  // ─── New puzzle ─────────────────────────────────────────────────────────────
  const handleNewPuzzle = useCallback(() => {
    if (puzzle && completedClueIds.size > 0) {
      const metrics = buildCompletionMetrics(
        puzzle, completedClueIds, adHintsUsed, startTime, score, wrongChecks
      );
      saveGameSession({
        id: `${Date.now()}`, category: categoryId, categoryName: category.name,
        gridSize: `${puzzle.gridWidth}x${puzzle.gridHeight}`,
        score, wordsFound: completedClueIds.size, totalWords: puzzle.clues.length,
        duration: metrics.elapsedSeconds, timestamp: Date.now(),
        adHintsUsed, seed: 0,
      });
    }
    setLoadKey(prev => prev + 1);
  }, [puzzle, completedClueIds, startTime, categoryId, category.name, score, adHintsUsed, wrongChecks]);

  // ─── Keyboard bridge ───────────────────────────────────────────────────────
  const handleKeyboardKey = (letter: string) => {
    window.dispatchEvent(new CustomEvent('crossword-key', { detail: { type: 'letter', value: letter } }));
  };
  const handleKeyboardBackspace = () => {
    window.dispatchEvent(new CustomEvent('crossword-key', { detail: { type: 'backspace' } }));
  };

  // ─── Render: Loading ────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-2 animate-bounce">📚</div>
          <p className="font-display text-muted-foreground">Bulmaca yükleniyor...</p>
        </div>
      </div>
    );
  }

  // ─── Render: Error ──────────────────────────────────────────────────────────
  if (loadError || !puzzle) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="text-4xl mb-3">😔</div>
          <p className="font-display text-lg text-foreground mb-2">Bulmaca yüklenemedi</p>
          <p className="text-sm text-muted-foreground mb-4">
            Bu kategori için uygun bir bulmaca bulunamadı. Farklı bir kategori veya zorluk deneyin.
          </p>
          <div className="flex gap-2 justify-center">
            <button onClick={() => navigate('/')}
              className="px-4 py-2 rounded-lg bg-muted text-muted-foreground hover:bg-muted/80 transition">
              Ana Sayfa
            </button>
            <button onClick={handleNewPuzzle}
              className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition">
              Tekrar Dene
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── Render: Game ───────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="game-container flex-1">
        <GameHeader
          category={category.name} categoryIcon={category.icon} score={score}
          wordsFound={completedClueIds.size} totalWords={puzzle.clues.length}
          onBack={() => navigate('/')} onHint={handleAdHintRequest}
          onNewPuzzle={handleNewPuzzle} startTime={startTime}
        />
        <div className="flex flex-col items-center gap-3 pb-2">
          <ArrowCrosswordGrid
            puzzle={puzzle}
            userEntries={userEntries}
            activeCell={activeCell}
            activeClueId={activeClueId}
            highlightedCells={highlightedCells}
            completedClueIds={completedClueIds}
            revealedCells={revealedCells}
            cellRelations={cellRelations}
            onCellClick={handleCellClick}
            onClueClick={handleClueClick}
            onLetterInput={handleLetterInput}
            onBackspace={handleBackspace}
          />
          <ArrowClueList
            clues={puzzle.clues}
            completedClueIds={completedClueIds}
            activeClueId={activeClueId}
            onClueClick={handleClueClick}
          />
        </div>
      </div>
      <div className="sticky bottom-0 bg-background/95 backdrop-blur border-t border-border">
        <TurkishKeyboard onKey={handleKeyboardKey} onBackspace={handleKeyboardBackspace} />
      </div>
      <AdHintDialog
        open={adDialogOpen} onClose={() => setAdDialogOpen(false)}
        onConfirm={handleAdConfirm}
        wordClue={
          adTargetHint.current && puzzle
            ? (getClueById(puzzle, adTargetHint.current.clueId)?.text || '')
            : ''
        }
      />
      <ReactionOverlay trigger={reactionTrigger} />
    </div>
  );
};

export default Game;
