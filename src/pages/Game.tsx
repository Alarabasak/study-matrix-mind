import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { DifficultyLevel, WordItem } from '@/types/crossword';
import { PuzzleDefinition } from '@/types/puzzle';
import {
  GameplayState,
  CellCoord,
  CellRelationMap,
  SolutionMap,
  coordKey,
  buildCellRelationMap,
  buildSolutionMap,
  createInitialGameplayState,
} from '@/types/gameplayState';
import {
  selectClueForCell,
  getHighlightedCellKeys,
  getNextCell,
  getPrevCell,
  checkClueAnswer,
  isPuzzleComplete,
  findHintCell,
  getClueById,
} from '@/utils/gameplayUtils';
import { loadGeneratedPuzzle } from '@/utils/puzzleLoader';
import { categories } from '@/data/questions';
import { getWordsForDifficulty } from '@/utils/wordDatabase';
import { addAdHint, saveGameSession, addUnknownWord } from '@/utils/gameStats';
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
  const categoryId = searchParams.get('category') || 'tyt-mat';
  const seedParam = parseInt(searchParams.get('seed') || `${Date.now()}`, 10);
  const difficulty = (searchParams.get('difficulty') || 'all') as DifficultyLevel;

  const category = categoryId === 'shuffle'
    ? { id: 'shuffle', name: 'Karıştır', icon: '🔀', description: 'Tüm dersler', color: 'hsl(0,0%,50%)', grade: 'TYT' as const }
    : (categories.find(c => c.id === categoryId) || categories[0]);

  const [puzzleSeed, setPuzzleSeed] = useState(seedParam);
  const [loading, setLoading] = useState(true);
  const [words, setWords] = useState<WordItem[]>([]);
  const [generationError, setGenerationError] = useState<string | null>(null);

  // ─── Load words ─────────────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getWordsForDifficulty(categoryId, difficulty, puzzleSeed).then(w => {
      if (!cancelled) {
        setWords(w);
        setLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, [categoryId, difficulty, puzzleSeed]);

  // ─── Generate PuzzleDefinition ──────────────────────────────────────────────
  const puzzle = useMemo<PuzzleDefinition | null>(() => {
    if (words.length === 0) return null;
    try {
      return loadGeneratedPuzzle(words, puzzleSeed, categoryId, category.name);
    } catch (e) {
      console.error('[Game] Generation failed:', e);
      return null;
    }
  }, [words, puzzleSeed, categoryId, category.name]);

  useEffect(() => {
    setGenerationError(words.length > 0 && !puzzle ? 'Bulmaca oluşturulamadı' : null);
  }, [words, puzzle]);

  // ─── Pre-computed lookups ───────────────────────────────────────────────────
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
  const [score, setScore] = useState(0);
  const [startTime] = useState(Date.now());
  const [adHintsUsed, setAdHintsUsed] = useState(0);
  const [adDialogOpen, setAdDialogOpen] = useState(false);
  const adTargetClue = useRef<{ clueId: string; cellIndex: number } | null>(null);
  const [reactionTrigger, setReactionTrigger] = useState<{ correct: boolean; key: number } | null>(null);

  // Reset state when puzzle changes
  useEffect(() => {
    if (puzzle) {
      setUserEntries(new Map());
      setActiveCell(null);
      setActiveClueId(null);
      setCompletedClueIds(new Set());
      setRevealedCells(new Set());
      setScore(0);
      setAdHintsUsed(0);
    }
  }, [puzzle]);

  const highlightedCells = useMemo(
    () => puzzle ? getHighlightedCellKeys(puzzle, activeClueId) : new Set<string>(),
    [puzzle, activeClueId]
  );

  // ─── Cell click handler ─────────────────────────────────────────────────────
  const handleCellClick = useCallback((x: number, y: number) => {
    if (!puzzle) return;
    const result = selectClueForCell(cellRelations, x, y, activeClueId, activeCell);
    if (result) {
      setActiveCell({ x, y });
      setActiveClueId(result.clueId);
      setActiveDirection(result.direction);
    }
  }, [puzzle, cellRelations, activeClueId, activeCell]);

  // ─── Clue click handler ─────────────────────────────────────────────────────
  const handleClueClick = useCallback((clueId: string) => {
    if (!puzzle) return;
    const clue = getClueById(puzzle, clueId);
    if (clue && clue.cells.length > 0) {
      setActiveClueId(clueId);
      setActiveDirection(clue.direction);
      // Find first empty cell in this clue
      const firstEmpty = clue.cells.find(c => !userEntries.get(coordKey(c.x, c.y)));
      setActiveCell(firstEmpty || clue.cells[0]);
    }
  }, [puzzle, userEntries]);

  // ─── Check clue completion ──────────────────────────────────────────────────
  const checkAndCompleteClues = useCallback((
    entries: Map<string, string>,
    pendingEntry?: { x: number; y: number; letter: string }
  ) => {
    if (!puzzle) return;

    // Check all clues that involve the pending entry cell
    const key = pendingEntry ? coordKey(pendingEntry.x, pendingEntry.y) : null;
    const relations = key ? cellRelations.get(key) || [] : [];

    for (const rel of relations) {
      if (completedClueIds.has(rel.clueId)) continue;
      const clue = getClueById(puzzle, rel.clueId);
      if (!clue) continue;

      const { allFilled, allCorrect } = checkClueAnswer(clue, entries, pendingEntry);
      if (allFilled) {
        if (allCorrect) {
          setCompletedClueIds(prev => {
            const next = new Set(prev);
            next.add(rel.clueId);

            // Mark cells as revealed
            setRevealedCells(prevR => {
              const nextR = new Set(prevR);
              for (const c of clue.cells) nextR.add(coordKey(c.x, c.y));
              return nextR;
            });

            setScore(s => s + 10);
            toast.success('Doğru! +10 puan 🎉', { duration: 1500 });
            setReactionTrigger({ correct: true, key: Date.now() });

            // Check puzzle completion
            if (isPuzzleComplete(puzzle, next)) {
              const duration = Math.floor((Date.now() - startTime) / 1000);
              saveGameSession({
                id: `${Date.now()}`, category: categoryId, categoryName: category.name,
                gridSize: `${puzzle.gridWidth}x${puzzle.gridHeight}`,
                score: score + 10, wordsFound: next.size,
                totalWords: puzzle.clues.length, duration, timestamp: Date.now(),
                adHintsUsed, seed: puzzleSeed,
              });
              toast('🎊 Bulmaca Tamamlandı!', {
                description: `Puan: ${score + 10} | Kelime: ${puzzle.clues.length}`,
                duration: 5000,
              });
            }
            return next;
          });
        } else {
          // Wrong answer for this clue
          addUnknownWord({
            word: clue.answer, clue: clue.text, category: categoryId,
            categoryName: category.name, timestamp: Date.now(), learned: false,
          });
          toast.error('Yanlış, tekrar dene!', { duration: 1500 });
          setReactionTrigger({ correct: false, key: Date.now() });
        }
      }
    }
  }, [puzzle, cellRelations, completedClueIds, startTime, categoryId, category.name, score, adHintsUsed, puzzleSeed]);

  // ─── Letter input handler ───────────────────────────────────────────────────
  const handleLetterInput = useCallback((letter: string) => {
    if (!puzzle || !activeCell) return;

    const key = coordKey(activeCell.x, activeCell.y);

    // Don't write to revealed cells
    if (revealedCells.has(key)) {
      const next = getNextCell(puzzle, activeClueId, activeCell, revealedCells, completedClueIds);
      if (next) setActiveCell(next);
      return;
    }

    const upperLetter = letter.toUpperCase();
    const newEntries = new Map(userEntries);
    newEntries.set(key, upperLetter);
    setUserEntries(newEntries);

    // Check clue completion
    checkAndCompleteClues(newEntries, { x: activeCell.x, y: activeCell.y, letter: upperLetter });

    // Move to next cell
    const next = getNextCell(puzzle, activeClueId, activeCell, revealedCells, completedClueIds);
    if (next) setActiveCell(next);
  }, [puzzle, activeCell, activeClueId, userEntries, revealedCells, completedClueIds, checkAndCompleteClues]);

  // ─── Backspace handler ──────────────────────────────────────────────────────
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

  // ─── Hint handler ───────────────────────────────────────────────────────────
  const handleAdHintRequest = useCallback(() => {
    if (!puzzle) return;
    const hint = findHintCell(puzzle, userEntries, completedClueIds, revealedCells);
    if (hint) {
      adTargetClue.current = { clueId: hint.clue.id, cellIndex: hint.cellIndex };
      setAdDialogOpen(true);
    } else {
      toast('Tüm harfler dolu!', { duration: 1500 });
    }
  }, [puzzle, userEntries, completedClueIds, revealedCells]);

  const handleAdConfirm = useCallback(() => {
    if (!puzzle || !adTargetClue.current) return;
    const clue = getClueById(puzzle, adTargetClue.current.clueId);
    if (!clue) return;

    const cell = clue.cells[adTargetClue.current.cellIndex];
    const letter = clue.answer[adTargetClue.current.cellIndex];
    const key = coordKey(cell.x, cell.y);

    const newEntries = new Map(userEntries);
    newEntries.set(key, letter);
    setUserEntries(newEntries);

    setRevealedCells(prev => {
      const next = new Set(prev);
      next.add(key);
      return next;
    });

    setScore(prev => Math.max(0, prev - 3));
    setAdHintsUsed(prev => prev + 1);
    addAdHint({
      word: clue.answer, clue: clue.text, category: categoryId,
      categoryName: category.name, timestamp: Date.now(),
    });
    toast('💡 Harf açıldı! (-3 puan)', { duration: 1500 });

    // Check completion after hint
    checkAndCompleteClues(newEntries, { x: cell.x, y: cell.y, letter });
  }, [puzzle, userEntries, categoryId, category.name, checkAndCompleteClues]);

  // ─── New puzzle handler ─────────────────────────────────────────────────────
  const handleNewPuzzle = useCallback(() => {
    if (puzzle && completedClueIds.size > 0) {
      const duration = Math.floor((Date.now() - startTime) / 1000);
      saveGameSession({
        id: `${Date.now()}`, category: categoryId, categoryName: category.name,
        gridSize: `${puzzle.gridWidth}x${puzzle.gridHeight}`,
        score, wordsFound: completedClueIds.size, totalWords: puzzle.clues.length,
        duration, timestamp: Date.now(), adHintsUsed, seed: puzzleSeed,
      });
    }
    setPuzzleSeed(Date.now());
  }, [puzzle, completedClueIds, startTime, categoryId, category.name, score, adHintsUsed, puzzleSeed]);

  // ─── Keyboard bridge ───────────────────────────────────────────────────────
  const handleKeyboardKey = (letter: string) => {
    window.dispatchEvent(new CustomEvent('crossword-key', { detail: { type: 'letter', value: letter } }));
  };
  const handleKeyboardBackspace = () => {
    window.dispatchEvent(new CustomEvent('crossword-key', { detail: { type: 'backspace' } }));
  };

  // ─── Render states ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-2 animate-bounce">📚</div>
          <p className="font-display text-muted-foreground">Kelimeler yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (generationError || !puzzle) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="text-4xl mb-3">😔</div>
          <p className="font-display text-lg text-foreground mb-2">Bulmaca oluşturulamadı</p>
          <p className="text-sm text-muted-foreground mb-4">
            Bu kelime seti ile uygun bir bulmaca oluşturulamadı. Farklı bir kategori veya zorluk deneyin.
          </p>
          <div className="flex gap-2 justify-center">
            <button
              onClick={() => navigate('/')}
              className="px-4 py-2 rounded-lg bg-muted text-muted-foreground hover:bg-muted/80 transition"
            >
              Ana Sayfa
            </button>
            <button
              onClick={handleNewPuzzle}
              className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition"
            >
              Tekrar Dene
            </button>
          </div>
        </div>
      </div>
    );
  }

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
          adTargetClue.current && puzzle
            ? (getClueById(puzzle, adTargetClue.current.clueId)?.text || '')
            : ''
        }
      />
      <ReactionOverlay trigger={reactionTrigger} />
    </div>
  );
};

export default Game;
