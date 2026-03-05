import { AdHintRecord, GameSessionRecord, UnknownWordRecord } from '@/types/crossword';

const AD_HINTS_KEY = 'crossprep_ad_hints';
const SESSIONS_KEY = 'crossprep_sessions';
const UNKNOWN_WORDS_KEY = 'crossprep_unknown_words';

export function getAdHints(): AdHintRecord[] {
  try { return JSON.parse(localStorage.getItem(AD_HINTS_KEY) || '[]'); }
  catch { return []; }
}

export function addAdHint(record: AdHintRecord): void {
  const hints = getAdHints();
  hints.push(record);
  localStorage.setItem(AD_HINTS_KEY, JSON.stringify(hints));
}

export function getGameSessions(): GameSessionRecord[] {
  try { return JSON.parse(localStorage.getItem(SESSIONS_KEY) || '[]'); }
  catch { return []; }
}

export function saveGameSession(session: GameSessionRecord): void {
  const sessions = getGameSessions();
  sessions.push(session);
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
}

export function getUnknownWords(): UnknownWordRecord[] {
  try { return JSON.parse(localStorage.getItem(UNKNOWN_WORDS_KEY) || '[]'); }
  catch { return []; }
}

export function addUnknownWord(record: UnknownWordRecord): void {
  const words = getUnknownWords();
  // Don't add duplicates
  if (!words.some(w => w.word === record.word && w.category === record.category)) {
    words.push(record);
    localStorage.setItem(UNKNOWN_WORDS_KEY, JSON.stringify(words));
  }
}

export function markWordLearned(word: string, category: string): void {
  const words = getUnknownWords();
  const updated = words.map(w =>
    w.word === word && w.category === category ? { ...w, learned: true } : w
  );
  localStorage.setItem(UNKNOWN_WORDS_KEY, JSON.stringify(updated));
}

export function removeUnknownWord(word: string, category: string): void {
  const words = getUnknownWords().filter(w => !(w.word === word && w.category === category));
  localStorage.setItem(UNKNOWN_WORDS_KEY, JSON.stringify(words));
}

export function clearAllData(): void {
  localStorage.removeItem(AD_HINTS_KEY);
  localStorage.removeItem(SESSIONS_KEY);
  localStorage.removeItem(UNKNOWN_WORDS_KEY);
}

export function getStats() {
  const sessions = getGameSessions();
  const adHints = getAdHints();
  const unknownWords = getUnknownWords();

  const totalGames = sessions.length;
  const totalScore = sessions.reduce((s, g) => s + g.score, 0);
  const totalWordsFound = sessions.reduce((s, g) => s + g.wordsFound, 0);
  const totalDuration = sessions.reduce((s, g) => s + g.duration, 0);
  const totalAdHints = adHints.length;
  const avgAccuracy = totalGames > 0
    ? Math.round((sessions.reduce((s, g) => s + (g.wordsFound / Math.max(g.totalWords, 1)), 0) / totalGames) * 100)
    : 0;

  const categoryStats: Record<string, { games: number; score: number; wordsFound: number; totalWords: number; name: string; avgTime: number }> = {};
  for (const s of sessions) {
    if (!categoryStats[s.category]) {
      categoryStats[s.category] = { games: 0, score: 0, wordsFound: 0, totalWords: 0, name: s.categoryName, avgTime: 0 };
    }
    categoryStats[s.category].games++;
    categoryStats[s.category].score += s.score;
    categoryStats[s.category].wordsFound += s.wordsFound;
    categoryStats[s.category].totalWords += s.totalWords;
    categoryStats[s.category].avgTime += s.duration;
  }

  // Calculate averages
  for (const key of Object.keys(categoryStats)) {
    const cat = categoryStats[key];
    cat.avgTime = cat.games > 0 ? Math.round(cat.avgTime / cat.games) : 0;
  }

  return {
    totalGames,
    totalScore,
    totalWordsFound,
    totalDuration,
    totalAdHints,
    avgAccuracy,
    categoryStats,
    recentSessions: sessions.slice(-15).reverse(),
    adHints: adHints.slice(-50).reverse(),
    unknownWords,
    unknownWordsCount: unknownWords.filter(w => !w.learned).length,
    learnedWordsCount: unknownWords.filter(w => w.learned).length,
  };
}
