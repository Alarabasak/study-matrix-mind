/**
 * Arrow Crossword Engine - Main Orchestrator
 *
 * Coordinates the full generation pipeline:
 * 1. Prepare answer candidates from word database
 * 2. Choose grid config from seed strategy (with deterministic fallback order)
 * 3. Build slot topology (with retries)
 * 4. Fast feasibility gate (slot-length vs candidate supply)
 * 5. Assign answers via CSP solver
 * 6. Validate puzzle
 * 7. Compute analytics
 *
 * Philosophy: topology first, answers second.
 * This is NOT a "place words then derive clues" generator.
 */

import { WordItem } from '@/types/crossword';
import { AnswerCandidate, PuzzleResult, GridConfig, Slot } from './types';
import {
  chooseGridConfig,
  GRID_FAMILIES,
  getTopologyConfig,
  getSolverConfig,
  MAX_GENERATION_ATTEMPTS,
} from './config';
import { SeededRandom } from './seededRandom';
import { normalizeAnswer } from './normalizer';
import { buildSlotTopology } from './topologyBuilder';
import { assignAnswersWithCSP } from './solver';
import { validateAssignment } from './validator';
import { computeAnalytics } from './analytics';

/**
 * Convert WordItem[] from the database into deduplicated AnswerCandidates.
 */
function prepareCandidates(words: WordItem[], rng: SeededRandom): AnswerCandidate[] {
  const seen = new Set<string>();
  const candidates: AnswerCandidate[] = [];

  // Shuffle for seed-based diversity
  const shuffled = rng.shuffle(words);

  for (const w of shuffled) {
    const normalized = normalizeAnswer(w.word);
    if (normalized.length < 3 || normalized.length > 15) continue;
    if (seen.has(normalized)) continue;
    seen.add(normalized);

    candidates.push({
      id: `${normalized}_${candidates.length}`,
      rawAnswer: w.word,
      normalizedAnswer: normalized,
      clueText: w.clue,
      clueType: 'text',
      category: w.category,
      topic: w.topic,
      difficulty: w.difficulty,
      frequencyScore: w.frequency_score,
    });
  }

  return candidates;
}

function buildLengthHistogram(candidates: AnswerCandidate[]): Map<number, number> {
  const hist = new Map<number, number>();
  for (const c of candidates) {
    const len = c.normalizedAnswer.length;
    hist.set(len, (hist.get(len) || 0) + 1);
  }
  return hist;
}

/**
 * Fast feasibility gate:
 * - Every slot length must have at least 1 candidate.
 * - Because answer reuse is forbidden, slot count per length cannot exceed
 *   candidate count for that length.
 */
function isTopologyFeasible(slots: Slot[], candidateLenHist: Map<number, number>): boolean {
  const slotLenHist = new Map<number, number>();
  for (const slot of slots) {
    slotLenHist.set(slot.length, (slotLenHist.get(slot.length) || 0) + 1);
  }

  for (const [len, slotCount] of slotLenHist) {
    const candidateCount = candidateLenHist.get(len) || 0;
    if (candidateCount === 0) return false;
    if (slotCount > candidateCount) return false;
  }

  return true;
}

/**
 * Deterministic grid traversal order:
 * start with seed-chosen grid, then rotate through remaining families.
 */
function getGridTraversalOrder(seed: number): GridConfig[] {
  const preferred = chooseGridConfig(seed);
  const startIdx = GRID_FAMILIES.findIndex(
    g => g.rows === preferred.rows && g.cols === preferred.cols
  );
  const idx = startIdx >= 0 ? startIdx : 0;

  return Array.from({ length: GRID_FAMILIES.length }, (_, k) => {
    return GRID_FAMILIES[(idx + k) % GRID_FAMILIES.length];
  });
}

/**
 * Main puzzle generation entry point.
 * Deterministic: same seed + same words = same puzzle.
 */
export function generatePuzzle(words: WordItem[], seed: number): PuzzleResult {
  const startTime = performance.now();

  // Prepare candidates
  const candidateRng = new SeededRandom(seed * 3571);
  const candidates = prepareCandidates(words, candidateRng);
  const candidateLenHist = buildLengthHistogram(candidates);

  if (candidates.length < 8) {
    throw new Error(
      `Insufficient word candidates for puzzle generation: ${candidates.length} (need at least 8). ` +
      `Check that the word database has enough valid entries for the selected category.`
    );
  }

  const solverConfig = getSolverConfig();
  const gridOrder = getGridTraversalOrder(seed);
  const attemptsPerGrid = Math.max(1, Math.floor(MAX_GENERATION_ATTEMPTS / gridOrder.length));

  let topologyAttempts = 0;
  let feasibleTopologyAttempts = 0;
  let solverAttempts = 0;
  let lastBacktrackCount = 0;
  let rejectedByFeasibility = 0;

  for (let gridIdx = 0; gridIdx < gridOrder.length; gridIdx++) {
    const gridConfig = gridOrder[gridIdx];
    const topoConfig = getTopologyConfig(gridConfig);

    for (let attempt = 0; attempt < attemptsPerGrid; attempt++) {
      // Vary topology seed per attempt for different layouts
      const topoSeed = seed * 7919 + (gridIdx + 1) * 104729 + attempt * 13007;
      const topoRng = new SeededRandom(topoSeed);

      // Phase 1: Build slot topology
      const topology = buildSlotTopology(gridConfig, topoConfig, topoRng);
      topologyAttempts++;

      if (!topology) continue; // Topology didn't meet quality constraints

      // Phase 2: Fast feasibility gate
      if (!isTopologyFeasible(topology.slots, candidateLenHist)) {
        rejectedByFeasibility++;
        continue;
      }
      feasibleTopologyAttempts++;

      // Phase 3: Assign answers via CSP solver
      const solverRng = new SeededRandom(seed * 6271 + (gridIdx + 1) * 31 + attempt * 911);
      const solverResult = assignAnswersWithCSP(
        topology.slots,
        candidates,
        solverRng,
        solverConfig
      );
      solverAttempts++;

      if (!solverResult) {
        lastBacktrackCount = solverConfig.maxBacktracks;
        continue;
      }

      lastBacktrackCount = solverResult.backtrackCount;

      // Phase 4: Validate assignment
      const validation = validateAssignment(topology.slots, solverResult.assignments);
      if (!validation.valid) {
        console.warn('[CrosswordEngine] Puzzle validation failed:', validation.errors);
        continue;
      }

      // Phase 5: Compute analytics
      const genTime = performance.now() - startTime;
      const analytics = computeAnalytics(
        topology.slots,
        solverResult.assignments,
        genTime,
        solverResult.backtrackCount,
        seed,
        gridConfig,
        topologyAttempts,
        solverAttempts
      );

      return {
        seed,
        gridWidth: gridConfig.cols,
        gridHeight: gridConfig.rows,
        cellTypes: topology.cellTypes,
        slots: topology.slots,
        assignments: solverResult.assignments,
        analytics,
      };
    }
  }

  throw new Error(
    `Failed to generate puzzle after ${topologyAttempts} topology attempts for seed ${seed}. ` +
    `candidates: ${candidates.length}, feasible topologies: ${feasibleTopologyAttempts}, ` +
    `solver attempts: ${solverAttempts}, feasibility rejects: ${rejectedByFeasibility}, ` +
    `last backtrack count: ${lastBacktrackCount}. ` +
    `This dataset likely cannot satisfy the generated slot-length profile under uniqueness constraints.`
  );
}
