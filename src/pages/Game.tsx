import React, { useState, useCallback, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { LetterCell, PlacedWord } from '@/types/crossword';
import { generateCrossword } from '@/utils/crosswordGenerator';
import { questionBank, categories } from '@/data/questions';
import CrosswordGrid from '@/components/game/CrosswordGrid';
import GameHeader from '@/components/game/GameHeader';
import ClueList from '@/components/game/ClueList';
import { toast } from 'sonner';
import { PartyPopper } from 'lucide-react';

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

  // Reset when puzzle changes
  React.useEffect(() => {
    setGrid(initialGrid);
    setScore(0);
    setCompletedWords(new Set());
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
      
      // Mark cells as revealed
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

      // Check if all words found
      if (completedWords.size + 1 === placedWords.length) {
        toast('🎊 Puzzle Complete!', {
          description: `Score: ${score + 10} | Words: ${placedWords.length}`,
          duration: 5000,
        });
      }
    } else {
      toast.error('Not quite right, keep trying!', { duration: 1500 });
    }
  }, [completedWords, placedWords, score]);

  const handleHint = useCallback(() => {
    // Find first incomplete word and reveal a letter
    for (const word of placedWords) {
      if (completedWords.has(word.index)) continue;
      const dr = word.direction === 'down' ? 1 : 0;
      const dc = word.direction === 'right' ? 1 : 0;
      
      for (let i = 0; i < word.answer.length; i++) {
        const r = word.startRow + dr * i;
        const c = word.startCol + dc * i;
        const cell = grid[r][c] as LetterCell;
        if (!cell.userLetter) {
          handleCellChange(r, c, word.answer[i]);
          setGrid(prev => {
            const ng = prev.map(r => r.map(c => ({ ...c })));
            const cl = ng[r][c] as LetterCell;
            cl.userLetter = word.answer[i];
            cl.isRevealed = true;
            return ng;
          });
          setScore(prev => Math.max(0, prev - 3));
          toast('💡 Hint used (-3 pts)', { duration: 1500 });
          return;
        }
      }
    }
  }, [grid, placedWords, completedWords, handleCellChange]);

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
          onHint={handleHint}
          onNewPuzzle={() => setPuzzleKey(k => k + 1)}
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
    </div>
  );
};

export default Game;
