/**
 * Game Settings — User preferences stored in localStorage.
 */

export interface GameSettings {
  clueFontSize: 'small' | 'medium' | 'large';
  validationMode: 'manual' | 'on-complete'; // manual = button only, on-complete = auto-check when clue filled
  soundEnabled: boolean;
  highContrastMode: boolean;
}

const SETTINGS_KEY = 'crossprep_game_settings';

const defaults: GameSettings = {
  clueFontSize: 'medium',
  validationMode: 'on-complete',
  soundEnabled: true,
  highContrastMode: false,
};

export function getSettings(): GameSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return { ...defaults };
    return { ...defaults, ...JSON.parse(raw) };
  } catch {
    return { ...defaults };
  }
}

export function updateSettings(partial: Partial<GameSettings>): GameSettings {
  const current = getSettings();
  const updated = { ...current, ...partial };
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
  return updated;
}

export function resetSettings(): GameSettings {
  localStorage.removeItem(SETTINGS_KEY);
  return { ...defaults };
}
