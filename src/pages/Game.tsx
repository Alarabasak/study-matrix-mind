import React, { useState, useCallback, useMemo, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { LetterCell, PlacedWord } from '@/types/crossword';
import { generateCrossword } from '@/utils/crosswordGenerator';
import { questionBank, categories } from '@/data/questions';
import { addAdHint, saveGameSession } from '@/utils/gameStats';
import CrosswordGrid from '@/components/game/CrosswordGrid';
import GameHeader from '@/components/game/GameHeader';
import ClueList from '@/components/game/ClueList';
import AdHintDialog from '@/components/game/AdHintDialog';
import { toast } from 'sonner';

const Game: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const categoryId = searchParams.get('category') || 'math';
  const gridSize = searchParams.get('size') || '12x12';

  const category = categories.find(c => c.id === categoryId) || categories[0];
  const questions = questionBank[categoryId] || questionBank.math;

  const [puzzleKey, setPuzzleKey] = useState(0);

  const { grid: initialGrid, placedWords } = useMemo(
    () => generateCrossword(questions, gridSize),
    [categoryId, gridSize, puzzleKey]
  );

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
          for (let i = 0; i < word.answer.length; i++) {
            const cell = newGrid[word.startRow + dr * i][word.startCol + dc * i];
            if (cell.type === 'letter') (cell as LetterCell).isRevealed = true;
          }
          return newGrid;
        });
      }

      toast.success('Correct! +10 points 🎉', { duration: 1500 });

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
        });
        toast('🎊 Puzzle Complete!', {
          description: `Score: ${score + 10} | Words: ${placedWords.length}`,
          duration: 5000,
        });
      }
    } else {
      toast.error('Not quite right, keep trying!', { duration: 1500 });
    }
  }, [completedWords, placedWords, score, startTime, categoryId, category.name, gridSize, adHintCount]);

  const handleAdHintRequest = useCallback(() => {
    // Find first incomplete word with an unrevealed letter
    for (const word of placedWords) {
      if (completedWords.has(word.index)) continue;
      const dr = word.direction === 'down' ? 1 : 0;
      const dc = word.direction === 'right' ? 1 : 0;
      for (let i = 0; i < word.answer.length; i++) {
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
    toast('All letters are filled!', { duration: 1500 });
  }, [grid, placedWords, completedWords]);

  const handleAdConfirm = useCallback(() => {
    const word = adTargetWord.current;
    if (!word) return;

    const dr = word.direction === 'down' ? 1 : 0;
    const dc = word.direction === 'right' ? 1 : 0;

    for (let i = 0; i < word.answer.length; i++) {
      const r = word.startRow + dr * i;
      const c = word.startCol + dc * i;
      const cell = grid[r][c] as LetterCell;
      if (!cell.userLetter) {
        setGrid(prev => {
          const ng = prev.map(r => r.map(c => ({ ...c })));
          const cl = ng[r][c] as LetterCell;
          cl.userLetter = word.answer[i];
          cl.isRevealed = true;
          return ng;
        });
        setScore(prev => Math.max(0, prev - 3));
        setAdHintCount(prev => prev + 1);

        // Record the ad hint
        addAdHint({
          word: word.answer,
          question: word.question,
          category: categoryId,
          categoryName: category.name,
          timestamp: Date.now(),
        });

        toast('💡 Letter revealed! (-3 pts)', { duration: 1500 });
        return;
      }
    }
  }, [grid, categoryId, category.name]);

  const handleNewPuzzle = useCallback(() => {
    // Save current session before starting new
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
      });
    }
    setPuzzleKey(k => k + 1);
  }, [completedWords, startTime, categoryId, category.name, gridSize, score, placedWords.length, adHintCount]);

  return (
    <div className="min-h-screen bg-background">
      <div className="game-container">
        <GameHeader
          category={category.name}
          categoryIcon={category.icon}
          gridSize={gridSize}
          score={score}
          wordsFound={completedWords.size}
          totalWords={placedWords.length}
          onBack={() => navigate('/')}
          onHint={handleAdHintRequest}
          onNewPuzzle={handleNewPuzzle}
          startTime={startTime}
        />

        <div className="flex flex-col items-center gap-4 pb-8">
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

      <AdHintDialog
        open={adDialogOpen}
        onClose={() => setAdDialogOpen(false)}
        onConfirm={handleAdConfirm}
        wordQuestion={adTargetWord.current?.question || ''}
      />
    </div>
  );
};

export default Game;
