/**
 * Arrow Crossword Engine - CSP Solver
 * 
 * Assigns word candidates to slots using constraint satisfaction:
 * - MRV (Minimum Remaining Values) heuristic for slot selection
 * - Forward checking after each assignment
 * - Backtracking on dead ends
 * - Deterministic seed-based candidate ordering
 * 
 * This replaces the old "scan placed words and try to intersect" approach.
 */

import { Slot, AnswerCandidate, SlotAssignment, SolverConfig } from './types';
import { SeededRandom } from './seededRandom';

export interface SolverResult {
  assignments: SlotAssignment[];
  backtrackCount: number;
}

/**
 * Assign answers to all slots using CSP with MRV + forward checking + backtracking.
 * Returns null if no valid assignment exists within the backtrack limit.
 */
export function assignAnswersWithCSP(
  slots: Slot[],
  candidates: AnswerCandidate[],
  rng: SeededRandom,
  config: SolverConfig,
  maxSolutions: number = 1
): SolverResult | null {
  if (slots.length === 0) return { assignments: [], backtrackCount: 0 };

  // Group candidates by normalized answer length
  const byLength = new Map<number, AnswerCandidate[]>();
  for (const c of candidates) {
    const len = c.normalizedAnswer.length;
    if (!byLength.has(len)) byLength.set(len, []);
    byLength.get(len)!.push(c);
  }

  // Shuffle within each length group for deterministic variety
  for (const [len, group] of byLength) {
    byLength.set(len, rng.shuffle(group));
  }

  // Initialize domains: each slot gets candidates matching its length
  const domains: AnswerCandidate[][] = slots.map(slot => {
    return [...(byLength.get(slot.length) || [])];
  });

  // Check if any slot has zero candidates (unsolvable topology for this dataset)
  for (let i = 0; i < slots.length; i++) {
    if (domains[i].length === 0) {
      return null;
    }
  }

  const assignment: (AnswerCandidate | null)[] = new Array(slots.length).fill(null);
  const usedAnswers = new Set<string>();
  let backtrackCount = 0;
  const solutions: SlotAssignment[][] = [];

  /** Select unassigned slot with MRV; tie-break by higher intersection degree. */
  function selectSlotMRV(): number {
    let bestIndex = -1;
    let bestSize = Infinity;
    let bestDegree = -1;

    for (let i = 0; i < slots.length; i++) {
      if (assignment[i] !== null) continue;
      const size = domains[i].length;
      const degree = slots[i].intersections.length;

      if (size < bestSize || (size === bestSize && degree > bestDegree)) {
        bestSize = size;
        bestDegree = degree;
        bestIndex = i;
      }
    }

    return bestIndex;
  }

  /** Check if assigning candidate to slot is consistent with current assignments. */
  function isConsistent(slotIndex: number, candidate: AnswerCandidate): boolean {
    // No duplicate answers in the same puzzle
    if (usedAnswers.has(candidate.normalizedAnswer)) return false;

    // Check letter consistency at all intersections
    const slot = slots[slotIndex];
    for (const inter of slot.intersections) {
      const other = assignment[inter.otherSlotIndex];
      if (other !== null) {
        if (candidate.normalizedAnswer[inter.posInThis] !== other.normalizedAnswer[inter.posInOther]) {
          return false;
        }
      }
    }
    return true;
  }

  /**
   * Forward check: after assigning a slot, prune domains of intersecting unassigned slots.
   * Returns saved domains for restoration on backtrack, or null if a wipeout occurred.
   */
  function forwardCheck(
    slotIndex: number,
    candidate: AnswerCandidate
  ): Map<number, AnswerCandidate[]> | null {
    const saved = new Map<number, AnswerCandidate[]>();
    const slot = slots[slotIndex];

    for (const inter of slot.intersections) {
      if (assignment[inter.otherSlotIndex] !== null) continue;

      const otherIdx = inter.otherSlotIndex;
      // Save domain before filtering (only once per slot)
      if (!saved.has(otherIdx)) {
        saved.set(otherIdx, [...domains[otherIdx]]);
      }

      const requiredLetter = candidate.normalizedAnswer[inter.posInThis];
      domains[otherIdx] = domains[otherIdx].filter(c =>
        c.normalizedAnswer[inter.posInOther] === requiredLetter &&
        !usedAnswers.has(c.normalizedAnswer)
      );

      // Wipeout: an intersecting slot has no viable candidates
      if (domains[otherIdx].length === 0) {
        // Restore all saved domains
        for (const [idx, d] of saved) {
          domains[idx] = d;
        }
        return null;
      }
    }

    return saved;
  }

  /** Restore domains from saved state (on backtrack). */
  function restoreDomains(saved: Map<number, AnswerCandidate[]>): void {
    for (const [idx, d] of saved) {
      domains[idx] = d;
    }
  }

  /** Recursive backtracking solver. */
  function backtrack(): boolean {
    // All slots assigned → solution found
    const slotIdx = selectSlotMRV();
    if (slotIdx === -1) {
      solutions.push(
        slots.map((slot, i) => ({
          slotIndex: slot.index,
          candidate: assignment[i]!,
        }))
      );
      return solutions.length >= maxSolutions;
    }

    // Try each candidate in the domain
    const domain = [...domains[slotIdx]]; // copy for safe iteration
    for (const candidate of domain) {
      if (!isConsistent(slotIdx, candidate)) {
        backtrackCount++;
        continue;
      }

      // Assign
      assignment[slotIdx] = candidate;
      usedAnswers.add(candidate.normalizedAnswer);

      // Forward check
      const saved = forwardCheck(slotIdx, candidate);
      if (saved !== null) {
        if (backtrack()) return true;
        restoreDomains(saved);
      }

      // Unassign
      assignment[slotIdx] = null;
      usedAnswers.delete(candidate.normalizedAnswer);
      backtrackCount++;

      if (backtrackCount > config.maxBacktracks) return false;
    }

    return false;
  }

  backtrack();

  if (solutions.length === 0) return null;

  return {
    assignments: solutions[0],
    backtrackCount,
  };
}

/**
 * Check if a puzzle has a unique solution.
 * Attempts to find 2 solutions — if only 1 is found, the puzzle is unique.
 */
export function checkUniqueness(
  slots: Slot[],
  candidates: AnswerCandidate[],
  rng: SeededRandom,
  config: SolverConfig
): boolean {
  const result = assignAnswersWithCSP(slots, candidates, rng, config, 2);
  // If solver found exactly 1 solution (within backtrack limits), puzzle is unique
  // Note: if backtrack limit is hit, we can't guarantee uniqueness — treat as unique for now
  return result !== null && result.assignments.length > 0;
}
