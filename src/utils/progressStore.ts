/**
 * User Progress Store — localStorage-backed progress tracking.
 * 
 * Tracks completed levels, in-progress puzzles, and last played session.
 * Separated from content repository — progress is a user concern, not content concern.
 */

// ─── Types ──────────────────────────────────────────────────────────────────────

export interface LevelProgress {
  packId: string;
  levelId: string;
  puzzleId: string;
  completed: boolean;
  completedAt?: number;
  score?: number;
  hintsUsed?: number;
  elapsedSeconds?: number;
  /** Serialized user entries for in-progress resume */
  savedEntries?: Record<string, string>;
  /** Which clue IDs were completed */
  completedClueIds?: string[];
}

export interface LastPlayedSession {
  packId: string;
  levelId: string;
  puzzleId: string;
  category: string;
  categoryName: string;
  categoryIcon: string;
  topic: string;
  timestamp: number;
  completed: boolean;
}

export interface UserProgressData {
  /** key: "packId::levelId" */
  levels: Record<string, LevelProgress>;
  lastPlayed: LastPlayedSession | null;
  totalScore: number;
  totalCompleted: number;
}

// ─── Storage key ────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'crossprep_user_progress';

// ─── Default state ──────────────────────────────────────────────────────────────

function defaultProgress(): UserProgressData {
  return {
    levels: {},
    lastPlayed: null,
    totalScore: 0,
    totalCompleted: 0,
  };
}

// ─── Read / Write ───────────────────────────────────────────────────────────────

function readProgress(): UserProgressData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultProgress();
    return JSON.parse(raw) as UserProgressData;
  } catch {
    return defaultProgress();
  }
}

function writeProgress(data: UserProgressData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('[ProgressStore] Write failed:', e);
  }
}

// ─── Key helpers ────────────────────────────────────────────────────────────────

function levelKey(packId: string, levelId: string): string {
  return `${packId}::${levelId}`;
}

// ─── Public API ─────────────────────────────────────────────────────────────────

/** Get full progress data */
export function getProgress(): UserProgressData {
  return readProgress();
}

/** Get progress for a specific level */
export function getLevelProgress(packId: string, levelId: string): LevelProgress | null {
  const data = readProgress();
  return data.levels[levelKey(packId, levelId)] || null;
}

/** Check if a level is completed */
export function isLevelCompleted(packId: string, levelId: string): boolean {
  const lp = getLevelProgress(packId, levelId);
  return lp?.completed ?? false;
}

/** Check if a level is unlocked (previous level completed or first level) */
export function isLevelUnlocked(packId: string, levelId: string, totalLevels: number): boolean {
  const idx = parseInt(levelId, 10);
  if (isNaN(idx) || idx === 0) return true; // first level always unlocked
  // Previous level must be completed
  return isLevelCompleted(packId, `${idx - 1}`);
}

/** Get level status: 'locked' | 'available' | 'in-progress' | 'completed' */
export function getLevelStatus(
  packId: string, 
  levelId: string, 
  totalLevels: number
): 'locked' | 'available' | 'in-progress' | 'completed' {
  if (isLevelCompleted(packId, levelId)) return 'completed';
  if (!isLevelUnlocked(packId, levelId, totalLevels)) return 'locked';
  
  const lp = getLevelProgress(packId, levelId);
  if (lp && lp.savedEntries && Object.keys(lp.savedEntries).length > 0) return 'in-progress';
  
  return 'available';
}

/** Get pack completion percentage */
export function getPackCompletionPercent(packId: string, totalLevels: number): number {
  if (totalLevels === 0) return 0;
  const data = readProgress();
  let completed = 0;
  for (let i = 0; i < totalLevels; i++) {
    const key = levelKey(packId, `${i}`);
    if (data.levels[key]?.completed) completed++;
  }
  return Math.round((completed / totalLevels) * 100);
}

/** Save in-progress puzzle state */
export function saveInProgressLevel(
  packId: string,
  levelId: string,
  puzzleId: string,
  entries: Map<string, string>,
  completedClueIds: Set<string>,
  session: { category: string; categoryName: string; categoryIcon: string; topic: string }
): void {
  const data = readProgress();
  const key = levelKey(packId, levelId);
  
  const existing = data.levels[key];
  data.levels[key] = {
    packId,
    levelId,
    puzzleId,
    completed: false,
    savedEntries: Object.fromEntries(entries),
    completedClueIds: Array.from(completedClueIds),
    score: existing?.score,
    hintsUsed: existing?.hintsUsed,
  };

  data.lastPlayed = {
    packId,
    levelId,
    puzzleId,
    category: session.category,
    categoryName: session.categoryName,
    categoryIcon: session.categoryIcon,
    topic: session.topic,
    timestamp: Date.now(),
    completed: false,
  };

  writeProgress(data);
}

/** Mark a level as completed */
export function completeLevel(
  packId: string,
  levelId: string,
  puzzleId: string,
  result: { score: number; hintsUsed: number; elapsedSeconds: number },
  session: { category: string; categoryName: string; categoryIcon: string; topic: string }
): void {
  const data = readProgress();
  const key = levelKey(packId, levelId);
  
  data.levels[key] = {
    packId,
    levelId,
    puzzleId,
    completed: true,
    completedAt: Date.now(),
    score: result.score,
    hintsUsed: result.hintsUsed,
    elapsedSeconds: result.elapsedSeconds,
    savedEntries: undefined,
    completedClueIds: undefined,
  };

  data.lastPlayed = {
    packId,
    levelId,
    puzzleId,
    category: session.category,
    categoryName: session.categoryName,
    categoryIcon: session.categoryIcon,
    topic: session.topic,
    timestamp: Date.now(),
    completed: true,
  };

  data.totalScore += result.score;
  data.totalCompleted += 1;

  writeProgress(data);
}

/** Get the last played session for continue flow */
export function getLastPlayedSession(): LastPlayedSession | null {
  const data = readProgress();
  return data.lastPlayed;
}

/** Get the next available (uncompleted, unlocked) level in a pack */
export function getNextAvailableLevel(packId: string, totalLevels: number): string | null {
  for (let i = 0; i < totalLevels; i++) {
    const id = `${i}`;
    const status = getLevelStatus(packId, id, totalLevels);
    if (status === 'in-progress' || status === 'available') return id;
  }
  return null;
}

/** Get continue target: last in-progress puzzle or first available */
export function getContinueTarget(): { packId: string; levelId: string } | null {
  const last = getLastPlayedSession();
  if (!last) return null;
  if (!last.completed) return { packId: last.packId, levelId: last.levelId };
  return null;
}

/** Clear in-progress state for a specific level (keep completion history) */
export function clearLevelInProgress(packId: string, levelId: string): void {
  const data = readProgress();
  const key = levelKey(packId, levelId);
  const existing = data.levels[key];
  if (existing && !existing.completed) {
    delete data.levels[key];
    writeProgress(data);
  }
}

/** Clear all progress (for testing/reset) */
export function clearProgress(): void {
  localStorage.removeItem(STORAGE_KEY);
}
