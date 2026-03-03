import { AdHintRecord, GameSessionRecord } from '@/types/crossword';

const AD_HINTS_KEY = 'crossprep_ad_hints';
const SESSIONS_KEY = 'crossprep_sessions';

export function getAdHints(): AdHintRecord[] {
  try {
    return JSON.parse(localStorage.getItem(AD_HINTS_KEY) || '[]');
  } catch { return []; }
}

export function addAdHint(record: AdHintRecord): void {
  const hints = getAdHints();
  hints.push(record);
  localStorage.setItem(AD_HINTS_KEY, JSON.stringify(hints));
}

export function getGameSessions(): GameSessionRecord[] {
  try {
    return JSON.parse(localStorage.getItem(SESSIONS_KEY) || '[]');
  } catch { return []; }
}

export function saveGameSession(session: GameSessionRecord): void {
  const sessions = getGameSessions();
  sessions.push(session);
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
}

export function getStats() {
  const sessions = getGameSessions();
  const adHints = getAdHints();

  const totalGames = sessions.length;
  const totalScore = sessions.reduce((s, g) => s + g.score, 0);
  const totalWordsFound = sessions.reduce((s, g) => s + g.wordsFound, 0);
  const totalDuration = sessions.reduce((s, g) => s + g.duration, 0);
  const totalAdHints = adHints.length;

  const categoryStats: Record<string, { games: number; score: number; wordsFound: number; name: string }> = {};
  for (const s of sessions) {
    if (!categoryStats[s.category]) {
      categoryStats[s.category] = { games: 0, score: 0, wordsFound: 0, name: s.categoryName };
    }
    categoryStats[s.category].games++;
    categoryStats[s.category].score += s.score;
    categoryStats[s.category].wordsFound += s.wordsFound;
  }

  return {
    totalGames,
    totalScore,
    totalWordsFound,
    totalDuration,
    totalAdHints,
    categoryStats,
    recentSessions: sessions.slice(-10).reverse(),
    adHints: adHints.slice(-50).reverse(),
  };
}
