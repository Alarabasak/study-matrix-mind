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
  checkPuzzle,
  isPuzzleFullyComplete,
  findNextHintTarget,
  findIncorrectCells,
  revealCell,
  revealClue,
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
  getNextAvailableLevel,
  clearLevelInProgress,
} from '@/utils/progressStore';
import { getSettings } from '@/utils/gameSettings';
import ArrowCrosswordGrid from '@/components/game/ArrowCrosswordGrid';
import ArrowClueList from '@/components/game/ArrowClueList';
import GameHeader from '@/components/game/GameHeader';
import GameToolbar from '@/components/game/GameToolbar';
import PauseModal from '@/components/game/PauseModal';
import ResultScreen from '@/components/game/ResultScreen';
import AdHintDialog from '@/components/game/AdHintDialog';
import TurkishKeyboard from '@/components/game/TurkishKeyboard';
import ReactionOverlay from '@/components/game/ReactionOverlay';
import { toast } from 'sonner';

const Game: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const packId = searchParams.get('pack');
  const levelId = searchParams.get('level') || '0';
  const puzzleId = searchParams.get('puzzleId');
  const categoryId = searchParams.get('category') || 'tyt-mat';

  const category = useMemo(() => categoryId === 'shuffle'
    ? { id: 'shuffle', name: 'Karıştır', icon: '🔀', description: 'Tüm dersler', color: 'hsl(0,0%,50%)', grade: 'TYT' as const }
    : (categories.find(c => c.id === categoryId) || categories[0]), [categoryId]);

  // ─── Puzzle loading ─────────────────────────────────────────────────────────
  const [loading, setLoading] = useState(true);
  const [puzzle, setPuzzle] = useState<PuzzleDefinition | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loadKey, setLoadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setLoadError(null);

    const load = async (): Promise<PuzzleDefinition | null> => {
      if (puzzleId) return loadPuzzleById(puzzleId);
      if (packId) return loadPuzzleByPackLevel(packId, levelId);
      return loadPuzzleByCategory(categoryId);
    };

    load().then(result => {
      if (cancelled) return;
      if (result) setPuzzle(result);
      else setLoadError('Bu kategori için hazır bulmaca bulunamadı');
      setLoading(false);
    }).catch(err => {
      if (cancelled) return;
      console.error('[Game] Puzzle load failed:', err);
      setLoadError('Bulmaca yüklenirken hata oluştu');
      setLoading(false);
    });

    return () => { cancelled = true; };
  }, [packId, levelId, puzzleId, categoryId, loadKey]);

  // ─── Derived lookups ────────────────────────────────────────────────────────
  const cellRelations = useMemo<CellRelationMap>(
    () => puzzle ? buildCellRelationMap(puzzle) : new Map(), [puzzle]
  );
  const solutionMap = useMemo<SolutionMap>(
    () => puzzle ? buildSolutionMap(puzzle) : new Map(), [puzzle]
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
  const [pauseOpen, setPauseOpen] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [pausedElapsed, setPausedElapsed] = useState(0);

  // Settings
  const settings = useMemo(() => getSettings(), []);

  // Reset state on puzzle change; restore saved progress
  useEffect(() => {
    if (puzzle) {
      if (packId) {
        const saved = getLevelProgress(packId, levelId);
        if (saved && saved.savedEntries && !saved.completed) {
          setUserEntries(new Map(Object.entries(saved.savedEntries)));
          setCompletedClueIds(new Set(saved.completedClueIds || []));
        } else {
          setUserEntries(new Map());
          setCompletedClueIds(new Set());
        }
      } else {
        setUserEntries(new Map());
        setCompletedClueIds(new Set());
      }
      setActiveCell(null);
      setActiveClueId(null);
      setRevealedCells(new Set());
      setIncorrectCellKeys(new Set());
      setScore(0);
      setStartTime(Date.now());
      setAdHintsUsed(0);
      setWrongChecks(0);
      setCompletionMetrics(null);
      setPauseOpen(false);
      setIsPaused(false);
      setPausedElapsed(0);
    }
  }, [puzzle, packId, levelId]);

  const highlightedCells = useMemo(
    () => puzzle ? getHighlightedCellKeys(puzzle, activeClueId) : new Set<string>(),
    [puzzle, activeClueId]
  );

  // ─── Elapsed time helper ───────────────────────────────────────────────────
  const getElapsedSeconds = useCallback(() => {
    return Math.floor((Date.now() - startTime) / 1000);
  }, [startTime]);

  const formatElapsed = useCallback((s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  }, []);

  // ─── Puzzle completion handler ──────────────────────────────────────────────
  const handlePuzzleComplete = useCallback((nextCompletedIds: Set<string>, currentScore: number) => {
    if (!puzzle) return;
    const metrics = buildCompletionMetrics(
      puzzle, nextCompletedIds, adHintsUsed, startTime, currentScore, wrongChecks
    );
    setCompletionMetrics(metrics);

    saveGameSession({
      id: `${Date.now()}`, category: categoryId, categoryName: category.name,
      gridSize: `${puzzle.gridWidth}x${puzzle.gridHeight}`,
      score: currentScore, wordsFound: nextCompletedIds.size,
      totalWords: puzzle.clues.length,
      duration: metrics.elapsedSeconds, timestamp: Date.now(),
      adHintsUsed, seed: 0,
    });

    if (packId) {
      completeLevel(packId, levelId, puzzle.id, {
        score: currentScore, hintsUsed: adHintsUsed, elapsedSeconds: metrics.elapsedSeconds,
      }, {
        category: categoryId, categoryName: category.name,
        categoryIcon: category.icon, topic: puzzle.topic || '',
      });
    }
  }, [puzzle, adHintsUsed, startTime, wrongChecks, categoryId, category, packId, levelId]);

  // ─── Cell click ─────────────────────────────────────────────────────────────
  const handleCellClick = useCallback((x: number, y: number) => {
    if (!puzzle) return;
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
    // Only auto-check if validation mode is on-complete
    if (settings.validationMode !== 'on-complete') return;

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

            const newScore = score + 10;
            setScore(newScore);
            toast.success('Doğru! +10 puan 🎉', { duration: 1500 });
            setReactionTrigger({ correct: true, key: Date.now() });

            if (isPuzzleFullyComplete(puzzle, next)) {
              handlePuzzleComplete(next, newScore);
            }
            return next;
          });
        } else {
          setWrongChecks(prev => prev + 1);
          addUnknownWord({
            word: clue.answer, clue: clue.text, category: categoryId,
            categoryName: category.name, timestamp: Date.now(), learned: false,
          });
          toast.error('Yanlış, tekrar dene!', { duration: 1500 });
          setReactionTrigger({ correct: false, key: Date.now() });
          const incorrectKeys = new Set(result.incorrectCells.map(c => coordKey(c.x, c.y)));
          setIncorrectCellKeys(incorrectKeys);
          setTimeout(() => setIncorrectCellKeys(new Set()), 2000);
        }
      }
    }
  }, [puzzle, cellRelations, completedClueIds, score, settings.validationMode, categoryId, category.name, handlePuzzleComplete]);

  // ─── Letter input ───────────────────────────────────────────────────────────
  const handleLetterInput = useCallback((letter: string) => {
    if (!puzzle || !activeCell || completionMetrics) return;
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
    setIncorrectCellKeys(new Set());

    checkAndCompleteClues(newEntries, { x: activeCell.x, y: activeCell.y, letter: upperLetter });

    if (packId && puzzle) {
      saveInProgressLevel(packId, levelId, puzzle.id, newEntries, completedClueIds, {
        category: categoryId, categoryName: category.name, categoryIcon: category.icon, topic: puzzle.topic || '',
      });
    }

    const next = getNextCell(puzzle, activeClueId, activeCell, revealedCells, completedClueIds);
    if (next) setActiveCell(next);
  }, [puzzle, activeCell, activeClueId, userEntries, revealedCells, completedClueIds, completionMetrics, checkAndCompleteClues, packId, levelId, categoryId, category]);

  // ─── Backspace ──────────────────────────────────────────────────────────────
  const handleBackspace = useCallback(() => {
    if (!puzzle || !activeCell || completionMetrics) return;
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
  }, [puzzle, activeCell, activeClueId, userEntries, revealedCells, completionMetrics]);

  // ─── Toolbar: Check active clue ────────────────────────────────────────────
  const handleCheckClue = useCallback(() => {
    if (!puzzle || !activeClueId) return;
    const clue = getClueById(puzzle, activeClueId);
    if (!clue) return;

    const result = checkClue(clue, userEntries);
    if (!result.allFilled) {
      toast('Önce tüm harfleri doldur', { duration: 1500 });
      return;
    }
    if (result.allCorrect) {
      // Mark as completed
      setCompletedClueIds(prev => {
        const next = new Set(prev);
        next.add(activeClueId);
        setRevealedCells(prevR => {
          const nextR = new Set(prevR);
          for (const c of clue.cells) nextR.add(coordKey(c.x, c.y));
          return nextR;
        });
        const newScore = score + 10;
        setScore(newScore);
        toast.success('Doğru! +10 puan 🎉', { duration: 1500 });
        setReactionTrigger({ correct: true, key: Date.now() });
        if (isPuzzleFullyComplete(puzzle, next)) {
          handlePuzzleComplete(next, newScore);
        }
        return next;
      });
    } else {
      setWrongChecks(prev => prev + 1);
      toast.error('Yanlış harfler var!', { duration: 1500 });
      setReactionTrigger({ correct: false, key: Date.now() });
      const incorrectKeys = new Set(result.incorrectCells.map(c => coordKey(c.x, c.y)));
      setIncorrectCellKeys(incorrectKeys);
      setTimeout(() => setIncorrectCellKeys(new Set()), 2000);
    }
  }, [puzzle, activeClueId, userEntries, score, handlePuzzleComplete]);

  // ─── Toolbar: Check puzzle ─────────────────────────────────────────────────
  const handleCheckPuzzle = useCallback(() => {
    if (!puzzle) return;
    const result = checkPuzzle(puzzle, userEntries);
    if (result.isComplete) {
      toast.success('Bulmaca tamamen doğru!', { duration: 2000 });
    } else {
      if (result.incorrectCells.length > 0) {
        const keys = new Set(result.incorrectCells.map(c => coordKey(c.x, c.y)));
        setIncorrectCellKeys(keys);
        setTimeout(() => setIncorrectCellKeys(new Set()), 3000);
        toast.error(`${result.incorrectCells.length} yanlış hücre bulundu`, { duration: 2000 });
      } else {
        toast(`${result.unfilledClues} ipucu henüz doldurulmadı`, { duration: 2000 });
      }
    }
  }, [puzzle, userEntries]);

  // ─── Toolbar: Reveal cell ──────────────────────────────────────────────────
  const handleRevealCell = useCallback(() => {
    if (!puzzle || !activeCell) return;
    const key = coordKey(activeCell.x, activeCell.y);
    if (revealedCells.has(key)) return;

    const result = revealCell(activeCell.x, activeCell.y, solutionMap);
    if (!result) return;

    const newEntries = new Map(userEntries);
    newEntries.set(result.cellKey, result.letter);
    setUserEntries(newEntries);
    setRevealedCells(prev => new Set([...prev, result.cellKey]));
    setAdHintsUsed(prev => prev + 1);
    setScore(prev => Math.max(0, prev - 3));
    toast('💡 Hücre açıldı (-3 puan)', { duration: 1500 });

    checkAndCompleteClues(newEntries, { x: activeCell.x, y: activeCell.y, letter: result.letter });
  }, [puzzle, activeCell, solutionMap, userEntries, revealedCells, checkAndCompleteClues]);

  // ─── Toolbar: Reveal clue ─────────────────────────────────────────────────
  const handleRevealClue = useCallback(() => {
    if (!puzzle || !activeClueId) return;
    const clue = getClueById(puzzle, activeClueId);
    if (!clue) return;

    const results = revealClue(clue);
    const newEntries = new Map(userEntries);
    const newRevealed = new Set(revealedCells);

    for (const r of results) {
      newEntries.set(r.cellKey, r.letter);
      newRevealed.add(r.cellKey);
    }

    setUserEntries(newEntries);
    setRevealedCells(newRevealed);
    setAdHintsUsed(prev => prev + results.length);
    setScore(prev => Math.max(0, prev - results.length * 2));

    // Auto-complete the clue
    setCompletedClueIds(prev => {
      const next = new Set(prev);
      next.add(activeClueId);
      toast('💡 Cevap açıldı', { duration: 1500 });
      if (isPuzzleFullyComplete(puzzle, next)) {
        handlePuzzleComplete(next, Math.max(0, score - results.length * 2));
      }
      return next;
    });
  }, [puzzle, activeClueId, userEntries, revealedCells, score, handlePuzzleComplete]);

  // ─── Toolbar: Clear active clue ────────────────────────────────────────────
  const handleClearClue = useCallback(() => {
    if (!puzzle || !activeClueId) return;
    const clue = getClueById(puzzle, activeClueId);
    if (!clue) return;

    const newEntries = new Map(userEntries);
    for (const c of clue.cells) {
      const key = coordKey(c.x, c.y);
      if (!revealedCells.has(key)) {
        newEntries.delete(key);
      }
    }
    setUserEntries(newEntries);
    setIncorrectCellKeys(new Set());
    toast('🧹 Temizlendi', { duration: 1000 });
  }, [puzzle, activeClueId, userEntries, revealedCells]);

  // ─── Pause ──────────────────────────────────────────────────────────────────
  const handlePause = useCallback(() => {
    setPausedElapsed(getElapsedSeconds());
    setPauseOpen(true);
  }, [getElapsedSeconds]);

  const handleContinue = useCallback(() => {
    setPauseOpen(false);
  }, []);

  // ─── Restart ────────────────────────────────────────────────────────────────
  const handleRestart = useCallback(() => {
    if (!puzzle) return;
    // Don't clear completion history — only reset current progress
    if (packId) {
      clearLevelInProgress(packId, levelId);
    }
    setUserEntries(new Map());
    setCompletedClueIds(new Set());
    setRevealedCells(new Set());
    setIncorrectCellKeys(new Set());
    setActiveCell(null);
    setActiveClueId(null);
    setScore(0);
    setStartTime(Date.now());
    setAdHintsUsed(0);
    setWrongChecks(0);
    setCompletionMetrics(null);
    setPauseOpen(false);
    toast('🔄 Yeniden başlatıldı', { duration: 1500 });
  }, [puzzle, packId, levelId]);

  // ─── Exit ───────────────────────────────────────────────────────────────────
  const handleExit = useCallback(() => {
    if (packId) {
      navigate(`/pack?packId=${packId}`);
    } else {
      navigate('/');
    }
  }, [packId, navigate]);

  // ─── Next level ─────────────────────────────────────────────────────────────
  const handleNextLevel = useCallback(() => {
    if (!packId) return;
    const nextIdx = parseInt(levelId) + 1;
    // Navigate to next level
    const newParams = new URLSearchParams(searchParams);
    newParams.set('level', `${nextIdx}`);
    setSearchParams(newParams);
  }, [packId, levelId, searchParams, setSearchParams]);

  const hasNextLevel = useMemo(() => {
    if (!packId) return false;
    // Simple check: next level index exists (will be validated by loader)
    return true; // loader will handle if it doesn't exist
  }, [packId]);

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

  // ─── Keyboard bridge ───────────────────────────────────────────────────────
  const handleKeyboardKey = (letter: string) => {
    window.dispatchEvent(new CustomEvent('crossword-key', { detail: { type: 'letter', value: letter } }));
  };
  const handleKeyboardBackspace = () => {
    window.dispatchEvent(new CustomEvent('crossword-key', { detail: { type: 'backspace' } }));
  };

  // ─── Loading ────────────────────────────────────────────────────────────────
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

  if (loadError || !puzzle) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="text-4xl mb-3">😔</div>
          <p className="font-display text-lg text-foreground mb-2">Bulmaca yüklenemedi</p>
          <p className="text-sm text-muted-foreground mb-4">{loadError || 'Bilinmeyen hata'}</p>
          <div className="flex gap-2 justify-center">
            <button onClick={() => navigate('/')} className="px-4 py-2 rounded-lg bg-muted text-muted-foreground hover:bg-muted/80 transition">
              Ana Sayfa
            </button>
            <button onClick={() => setLoadKey(k => k + 1)} className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition">
              Tekrar Dene
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── Active clue info ───────────────────────────────────────────────────────
  const activeClue = activeClueId ? getClueById(puzzle, activeClueId) : null;

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="game-container flex-1">
        <GameHeader
          category={category.name} categoryIcon={category.icon} score={score}
          wordsFound={completedClueIds.size} totalWords={puzzle.clues.length}
          onBack={handleExit} onHint={handleAdHintRequest}
          onNewPuzzle={handleRestart} startTime={startTime}
        />

        {/* Active clue display */}
        {activeClue && (
          <div
            className="rounded-xl px-3 py-2 mb-2 text-sm flex items-center gap-2"
            style={{
              background: 'hsl(var(--cell-highlight) / 0.4)',
              border: '1px solid hsl(var(--border))',
              fontFamily: 'var(--font-heading)',
            }}
          >
            <span className="font-bold text-primary text-xs">
              {activeClue.direction === 'right' ? '→' : '↓'}
            </span>
            <span className="text-foreground flex-1 truncate">{activeClue.text}</span>
            <span className="text-muted-foreground text-xs">{activeClue.answer.length} harf</span>
          </div>
        )}

        <div className="flex flex-col items-center gap-2 pb-2">
          <ArrowCrosswordGrid
            puzzle={puzzle}
            userEntries={userEntries}
            activeCell={activeCell}
            activeClueId={activeClueId}
            highlightedCells={highlightedCells}
            completedClueIds={completedClueIds}
            revealedCells={revealedCells}
            cellRelations={cellRelations}
            incorrectCellKeys={incorrectCellKeys}
            onCellClick={handleCellClick}
            onClueClick={handleClueClick}
            onLetterInput={handleLetterInput}
            onBackspace={handleBackspace}
          />

          {/* Toolbar */}
          <GameToolbar
            hasActiveClue={!!activeClueId}
            onCheckClue={handleCheckClue}
            onCheckPuzzle={handleCheckPuzzle}
            onRevealCell={handleRevealCell}
            onRevealClue={handleRevealClue}
            onClearClue={handleClearClue}
            onPause={handlePause}
            onHint={handleAdHintRequest}
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

      {/* Modals */}
      <PauseModal
        open={pauseOpen}
        onContinue={handleContinue}
        onRestart={handleRestart}
        onExit={handleExit}
        elapsedFormatted={formatElapsed(pausedElapsed)}
        score={score}
        wordsFound={completedClueIds.size}
        totalWords={puzzle.clues.length}
      />

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

      {/* Result screen */}
      {completionMetrics && (
        <ResultScreen
          metrics={completionMetrics}
          onNextLevel={handleNextLevel}
          onBackToPack={handleExit}
          hasNextLevel={hasNextLevel}
        />
      )}
    </div>
  );
};

export default Game;
