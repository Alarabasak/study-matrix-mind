import { WordItem } from '@/types/crossword';
import { supabase } from '@/integrations/supabase/client';

// Cache for word data fetched from the database
let wordCache: Record<string, WordItem[]> | null = null;
let cacheTimestamp = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export async function fetchWordDatabase(): Promise<Record<string, WordItem[]>> {
  const now = Date.now();
  if (wordCache && (now - cacheTimestamp) < CACHE_TTL) {
    return wordCache;
  }

  // Fetch all words with pagination (Supabase returns max 1000 per query)
  const allData: any[] = [];
  const PAGE_SIZE = 1000;
  let from = 0;
  let hasMore = true;

  while (hasMore) {
    const { data, error } = await supabase
      .from('words')
      .select('word, clue, category, topic, difficulty, grade, lang, frequency_score')
      .range(from, from + PAGE_SIZE - 1);

    if (error || !data) {
      console.error('Error fetching words:', error);
      return wordCache || {};
    }

    allData.push(...data);
    hasMore = data.length === PAGE_SIZE;
    from += PAGE_SIZE;
  }

  const db: Record<string, WordItem[]> = {};
  for (const row of allData) {
    const item: WordItem = {
      word: row.word,
      clue: row.clue,
      category: row.category,
      topic: row.topic,
      difficulty: row.difficulty,
      grade: row.grade as 'TYT' | 'AYT',
      lang: row.lang as 'tr',
      frequency_score: Number(row.frequency_score),
    };
    if (!db[row.category]) db[row.category] = [];
    db[row.category].push(item);
  }

  // Don't cache empty results
  const totalWords = Object.values(db).reduce((sum, words) => sum + words.length, 0);
  if (totalWords > 0) {
    wordCache = db;
    cacheTimestamp = now;
  }
  console.log(`[WordDB] Fetched ${totalWords} words across ${Object.keys(db).length} categories`);
  return db;
}

// Synchronous getter for cached data (used during game after initial fetch)
export function getWordDatabaseSync(): Record<string, WordItem[]> {
  return wordCache || {};
}

export function invalidateCache(): void {
  wordCache = null;
  cacheTimestamp = 0;
}

export async function getWordsForDifficulty(
  categoryId: string,
  difficulty: 'easy' | 'medium' | 'hard' | 'super-hard' | 'all',
  seed: number
): Promise<WordItem[]> {
  const db = await fetchWordDatabase();

  if (categoryId === 'shuffle') {
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

  const topics = Array.from(new Set(words.map(w => w.topic)));
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

export async function getWordCount(categoryId: string): Promise<number> {
  const db = await fetchWordDatabase();
  if (categoryId === 'shuffle') {
    return Object.values(db).reduce((sum, words) => sum + words.length, 0);
  }
  return (db[categoryId] || []).length;
}

export async function getTopicCount(categoryId: string): Promise<number> {
  const db = await fetchWordDatabase();
  let words: WordItem[];
  if (categoryId === 'shuffle') {
    words = Object.values(db).flat();
  } else {
    words = db[categoryId] || [];
  }
  return new Set(words.map(w => w.topic)).size;
}

export async function getTopicsForCategory(categoryId: string): Promise<string[]> {
  const db = await fetchWordDatabase();
  const words = db[categoryId] || [];
  const topics = new Set(words.map(w => w.topic));
  return Array.from(topics).sort();
}

// Admin functions
export async function addWord(categoryId: string, word: WordItem): Promise<void> {
  const { error } = await supabase.from('words').insert({
    word: word.word,
    clue: word.clue,
    category: categoryId,
    topic: word.topic,
    difficulty: word.difficulty,
    grade: word.grade,
    lang: word.lang,
    frequency_score: word.frequency_score,
  });
  if (error) throw error;
  invalidateCache();
}

export async function removeWord(categoryId: string, wordText: string): Promise<void> {
  const { error } = await supabase
    .from('words')
    .delete()
    .eq('category', categoryId)
    .eq('word', wordText);
  if (error) throw error;
  invalidateCache();
}

export async function updateWord(categoryId: string, oldWordText: string, updated: WordItem): Promise<void> {
  const { error } = await supabase
    .from('words')
    .update({
      word: updated.word,
      clue: updated.clue,
      topic: updated.topic,
      difficulty: updated.difficulty,
      frequency_score: updated.frequency_score,
    })
    .eq('category', categoryId)
    .eq('word', oldWordText);
  if (error) throw error;
  invalidateCache();
}
