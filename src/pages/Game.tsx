import React, { useState, useCallback, useMemo, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { LetterCell, PlacedWord, DifficultyLevel } from '@/types/crossword';
import { generateCrossword } from '@/utils/crosswordGenerator';
import { categories } from '@/data/questions';
import { getWordsForDifficulty } from '@/utils/wordDatabase';
import { addAdHint, saveGameSession, addUnknownWord } from '@/utils/gameStats';
import CrosswordGrid from '@/components/game/CrosswordGrid';
import GameHeader from '@/components/game/GameHeader';
import ClueList from '@/components/game/ClueList';
import AdHintDialog from '@/components/game/AdHintDialog';
import TurkishKeyboard from '@/components/game/TurkishKeyboard';
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

  const words = useMemo(
    () => getWordsForDifficulty(categoryId, difficulty, puzzleSeed),
    [categoryId, difficulty, puzzleSeed]
  );

  const result = useMemo(
    () => generateCrossword(words, puzzleSeed),
    [words, puzzleSeed]
  );

  const { grid: initialGrid, placedWords, gridSize } = result;

  const [grid, setGrid] = useState(initialGrid);
  const [score, setScore] = useState(0);
  const [completedWords, setCompletedWords] = useState<Set<number>>(new Set());
  const [startTime] = useState(Date.now());
  const [activeWordIndex, setActiveWordIndex] = useState<number | null>(null);
  const [adDialogOpen, setAdDialogOpen] = useState(false);
  const [adHintCount, setAdHintCount] = useState(0);
  const adTargetWord = useRef<PlacedWord | null>(null);

  React.useEffect(() => {
    setGrid(initialGrid);
    setScore(0);
    setCompletedWords(new Set());
    setAdHintCount(0);
  }, [initialGrid]);

  const handleCellChange = useCallback((row: number, col: number, letter: string) => {
    setGrid(prev => {
      const newGrid = prev.map(r => r.map(c => ({ ...c })));
      const cell = newGrid[row][col];
      if (cell.type === 'letter') {
        (cell as LetterCell).userLetter = letter;
      }
      return newGrid;
    });
  }, []);

  const handleWordComplete = useCallback((wordIndex: number, correct: boolean) => {
    if (completedWords.has(wordIndex)) return;

    if (correct) {
      setCompletedWords(prev => new Set([...prev, wordIndex]));
      setScore(prev => prev + 10);

      const word = placedWords.find(w => w.index === wordIndex);
      if (word) {
        setGrid(prev => {
          const newGrid = prev.map(r => r.map(c => ({ ...c })));
          const dr = word.direction === 'down' ? 1 : 0;
          const dc = word.direction === 'right' ? 1 : 0;
          for (let i = 0; i < word.word.length; i++) {
            const cell = newGrid[word.startRow + dr * i][word.startCol + dc * i];
            if (cell.type === 'letter') (cell as LetterCell).isRevealed = true;
          }
          return newGrid;
        });
      }

      toast.success('Doğru! +10 puan 🎉', { duration: 1500 });

      if (completedWords.size + 1 === placedWords.length) {
        const duration = Math.floor((Date.now() - startTime) / 1000);
        saveGameSession({
          id: `${Date.now()}`,
          category: categoryId,
          categoryName: category.name,
          gridSize,
          score: score + 10,
          wordsFound: completedWords.size + 1,
          totalWords: placedWords.length,
          duration,
          timestamp: Date.now(),
          adHintsUsed: adHintCount,
          seed: puzzleSeed,
        });
        toast('🎊 Bulmaca Tamamlandı!', {
          description: `Puan: ${score + 10} | Kelime: ${placedWords.length}`,
          duration: 5000,
        });
      }
    } else {
      const word = placedWords.find(w => w.index === wordIndex);
      if (word) {
        addUnknownWord({
          word: word.word,
          clue: word.clue,
          category: categoryId,
          categoryName: category.name,
          timestamp: Date.now(),
          learned: false,
        });
      }
      toast.error('Yanlış, tekrar dene!', { duration: 1500 });
    }
  }, [completedWords, placedWords, score, startTime, categoryId, category.name, gridSize, adHintCount, puzzleSeed]);

  const handleAdHintRequest = useCallback(() => {
    for (const word of placedWords) {
      if (completedWords.has(word.index)) continue;
      const dr = word.direction === 'down' ? 1 : 0;
      const dc = word.direction === 'right' ? 1 : 0;
      for (let i = 0; i < word.word.length; i++) {
        const r = word.startRow + dr * i;
        const c = word.startCol + dc * i;
        const cell = grid[r][c] as LetterCell;
        if (!cell.userLetter) {
          adTargetWord.current = word;
          setAdDialogOpen(true);
          return;
        }
      }
    }
    toast('Tüm harfler dolu!', { duration: 1500 });
  }, [grid, placedWords, completedWords]);

  const handleAdConfirm = useCallback(() => {
    const word = adTargetWord.current;
    if (!word) return;

    const dr = word.direction === 'down' ? 1 : 0;
    const dc = word.direction === 'right' ? 1 : 0;

    for (let i = 0; i < word.word.length; i++) {
      const r = word.startRow + dr * i;
      const c = word.startCol + dc * i;
      const cell = grid[r][c] as LetterCell;
      if (!cell.userLetter) {
        setGrid(prev => {
          const ng = prev.map(r => r.map(c => ({ ...c })));
          const cl = ng[r][c] as LetterCell;
          cl.userLetter = word.word[i];
          cl.isRevealed = true;
          return ng;
        });
        setScore(prev => Math.max(0, prev - 3));
        setAdHintCount(prev => prev + 1);

        addAdHint({
          word: word.word,
          clue: word.clue,
          category: categoryId,
          categoryName: category.name,
          timestamp: Date.now(),
        });

        toast('💡 Harf açıldı! (-3 puan)', { duration: 1500 });
        return;
      }
    }
  }, [grid, categoryId, category.name]);

  const handleNewPuzzle = useCallback(() => {
    if (completedWords.size > 0) {
      const duration = Math.floor((Date.now() - startTime) / 1000);
      saveGameSession({
        id: `${Date.now()}`,
        category: categoryId,
        categoryName: category.name,
        gridSize,
        score,
        wordsFound: completedWords.size,
        totalWords: placedWords.length,
        duration,
        timestamp: Date.now(),
        adHintsUsed: adHintCount,
        seed: puzzleSeed,
      });
    }
    setPuzzleSeed(Date.now());
  }, [completedWords, startTime, categoryId, category.name, gridSize, score, placedWords.length, adHintCount, puzzleSeed]);

  const handleKeyboardKey = (letter: string) => {
    window.dispatchEvent(new CustomEvent('crossword-key', { detail: { type: 'letter', value: letter } }));
  };

  const handleKeyboardBackspace = () => {
    window.dispatchEvent(new CustomEvent('crossword-key', { detail: { type: 'backspace' } }));
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="game-container flex-1">
        <GameHeader
          category={category.name}
          categoryIcon={category.icon}
          score={score}
          wordsFound={completedWords.size}
          totalWords={placedWords.length}
          onBack={() => navigate('/')}
          onHint={handleAdHintRequest}
          onNewPuzzle={handleNewPuzzle}
          startTime={startTime}
        />

        <div className="flex flex-col items-center gap-3 pb-2">
          <CrosswordGrid
            grid={grid}
            placedWords={placedWords}
            onCellChange={handleCellChange}
            onWordComplete={handleWordComplete}
          />

          <ClueList
            placedWords={placedWords}
            completedWords={completedWords}
            activeWordIndex={activeWordIndex}
            onClueClick={(idx) => setActiveWordIndex(idx)}
          />
        </div>
      </div>

      <div className="sticky bottom-0 bg-background/95 backdrop-blur border-t border-border">
        <TurkishKeyboard onKey={handleKeyboardKey} onBackspace={handleKeyboardBackspace} />
      </div>

      <AdHintDialog
        open={adDialogOpen}
        onClose={() => setAdDialogOpen(false)}
        onConfirm={handleAdConfirm}
        wordClue={adTargetWord.current?.clue || ''}
      />
    </div>
  );
};

export default Game;
