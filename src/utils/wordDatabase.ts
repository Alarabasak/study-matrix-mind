import { WordItem } from '@/types/crossword';
import { wordBank as defaultWordBank } from '@/data/questions';

const STORAGE_KEY = 'crossprep-word-database';

export function getWordDatabase(): Record<string, WordItem[]> {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return { ...defaultWordBank };
    }
  }
  return { ...defaultWordBank };
}

export function saveWordDatabase(db: Record<string, WordItem[]>): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
}

export function addWord(categoryId: string, word: WordItem): void {
  const db = getWordDatabase();
  if (!db[categoryId]) db[categoryId] = [];
  db[categoryId].push(word);
  saveWordDatabase(db);
}

export function removeWord(categoryId: string, wordText: string): void {
  const db = getWordDatabase();
  if (!db[categoryId]) return;
  db[categoryId] = db[categoryId].filter(w => w.word !== wordText);
  saveWordDatabase(db);
}

export function updateWord(categoryId: string, oldWordText: string, updated: WordItem): void {
  const db = getWordDatabase();
  if (!db[categoryId]) return;
  const idx = db[categoryId].findIndex(w => w.word === oldWordText);
  if (idx !== -1) db[categoryId][idx] = updated;
  saveWordDatabase(db);
}

export function resetToDefaults(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function getTopicsForCategory(categoryId: string): string[] {
  const db = getWordDatabase();
  const words = db[categoryId] || [];
  const topics = new Set(words.map(w => w.topic));
  return Array.from(topics).sort();
}

export function getWordsForDifficulty(
  categoryId: string,
  difficulty: 'easy' | 'medium' | 'hard' | 'super-hard' | 'all',
  seed: number
): WordItem[] {
  const db = getWordDatabase();

  if (categoryId === 'shuffle') {
    // Combine all categories
    const allWords: WordItem[] = [];
    for (const key in db) {
      allWords.push(...db[key]);
    }
    return filterByDifficulty(allWords, difficulty, seed);
  }

  const words = db[categoryId] || [];
  return filterByDifficulty(words, difficulty, seed);
}

function filterByDifficulty(
  words: WordItem[],
  difficulty: 'easy' | 'medium' | 'hard' | 'super-hard' | 'all',
  seed: number
): WordItem[] {
  if (difficulty === 'all') return words;

  // Get unique topics
  const topics = Array.from(new Set(words.map(w => w.topic)));

  // Seeded shuffle for topics
  const shuffled = [...topics];
  let s = seed;
  for (let i = shuffled.length - 1; i > 0; i--) {
    s = (s * 16807) % 2147483647;
    const j = Math.floor((s / 2147483647) * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  let topicCount: number;
  switch (difficulty) {
    case 'easy': topicCount = 1; break;
    case 'medium': topicCount = Math.min(4, Math.max(2, 2 + (seed % 3))); break;
    case 'hard': topicCount = Math.min(9, Math.max(5, 5 + (seed % 5))); break;
    case 'super-hard': topicCount = Math.min(shuffled.length, Math.max(10, 10 + (seed % 5))); break;
    default: topicCount = shuffled.length;
  }

  const selectedTopics = new Set(shuffled.slice(0, topicCount));
  return words.filter(w => selectedTopics.has(w.topic));
}

export function getWordCount(categoryId: string): number {
  const db = getWordDatabase();
  if (categoryId === 'shuffle') {
    return Object.values(db).reduce((sum, words) => sum + words.length, 0);
  }
  return (db[categoryId] || []).length;
}

export function getTopicCount(categoryId: string): number {
  const db = getWordDatabase();
  let words: WordItem[];
  if (categoryId === 'shuffle') {
    words = Object.values(db).flat();
  } else {
    words = db[categoryId] || [];
  }
  return new Set(words.map(w => w.topic)).size;
}
