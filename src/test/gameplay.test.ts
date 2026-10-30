import { describe, it, expect } from 'vitest';
import { checkCell, checkClue } from '@/utils/gameplayValidation';
import { normalizeAnswer } from '@/utils/crossword/normalizer';
import { coordKey } from '@/types/gameplayState';
import type { ClueDefinition } from '@/types/puzzle';

const clue: ClueDefinition = {
  id: 'cay', text: 'Bir içecek', startCell: { x: 0, y: 0 },
  direction: 'right', answer: 'ÇAY',
  cells: [{ x: 1, y: 0 }, { x: 2, y: 0 }, { x: 3, y: 0 }],
};

describe('answer normalization', () => {
  it.each([
    ['KARA DELİK', 'KARADELİK'],
    ["d’Alembert", 'DALEMBERT'],
    ['ÇĞİIÖŞÜ-12/3', 'ÇĞİIÖŞÜ123'],
  ])('normalizes %s without losing Turkish characters', (input, expected) => {
    expect(normalizeAnswer(input)).toBe(expected);
  });
});

describe('gameplay answer checks', () => {
  it('does not accept an empty cell as a correct answer', () => {
    expect(checkCell(1, 0, new Map(), new Map([[coordKey(1, 0), 'Ç']])).correct).toBe(false);
  });

  it('distinguishes an incomplete answer from an incorrect letter', () => {
    const result = checkClue(clue, new Map([[coordKey(1, 0), 'C']]));
    expect(result.allFilled).toBe(false);
    expect(result.allCorrect).toBe(false);
    expect(result.incorrectCells).toEqual([{ x: 1, y: 0, expected: 'Ç', actual: 'C' }]);
  });

  it('recognizes completion immediately when the final letter is pending', () => {
    const entries = new Map([[coordKey(1, 0), 'Ç'], [coordKey(2, 0), 'A']]);
    expect(checkClue(clue, entries, { x: 3, y: 0, letter: 'Y' })).toMatchObject({
      allFilled: true, allCorrect: true, incorrectCells: [],
    });
    expect(entries.has(coordKey(3, 0))).toBe(false);
  });
});
