export type Direction = 'right' | 'down';

export type GridSize = '12x12' | '16x12' | '12x16';

export interface QuestionItem {
  question: string;
  answer: string;
  category: string;
}

export interface ClueEntry {
  text: string;
  direction: Direction;
  wordIndex: number;
}

export interface ClueCell {
  type: 'clue';
  clues: ClueEntry[];
}

export interface LetterCell {
  type: 'letter';
  expectedLetter: string;
  userLetter: string;
  wordIndices: number[];
  isRevealed: boolean;
}

export interface BlockCell {
  type: 'block';
}

export type Cell = ClueCell | LetterCell | BlockCell;

export interface PlacedWord {
  question: string;
  answer: string;
  startRow: number;
  startCol: number;
  clueRow: number;
  clueCol: number;
  direction: Direction;
  index: number;
}

export interface GameState {
  grid: Cell[][];
  placedWords: PlacedWord[];
  rows: number;
  cols: number;
  selectedCell: { row: number; col: number } | null;
  activeDirection: Direction;
  activeWordIndex: number | null;
  isComplete: boolean;
  score: number;
  startTime: number;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  description: string;
  color: string;
}

export interface AdHintRecord {
  word: string;
  question: string;
  category: string;
  categoryName: string;
  timestamp: number;
}

export interface GameSessionRecord {
  id: string;
  category: string;
  categoryName: string;
  gridSize: string;
  score: number;
  wordsFound: number;
  totalWords: number;
  duration: number;
  timestamp: number;
  adHintsUsed: number;
}
