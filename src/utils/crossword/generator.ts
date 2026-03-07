/**
 * Arrow Crossword Engine - Main Orchestrator
 * 
 * Coordinates the full generation pipeline:
 * 1. Prepare answer candidates from word database
 * 2. Choose grid config from seed
 * 3. Build slot topology (with retries)
 * 4. Assign answers via CSP solver (with retries)
 * 5. Validate puzzle
 * 6. Compute analytics
 * 
 * Philosophy: topology first, answers second.
 * This is NOT a "place words then derive clues" generator.
 */

import { WordItem } from '@/types/crossword';
import { AnswerCandidate, PuzzleResult } from './types';
import { chooseGridConfig, getTopologyConfig, getSolverConfig, MAX_GENERATION_ATTEMPTS } from './config';
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

/**
 * Main puzzle generation entry point.
 * Deterministic: same seed + same words = same puzzle.
 */
export function generatePuzzle(words: WordItem[], seed: number): PuzzleResult {
  const startTime = performance.now();

  // Prepare candidates
  const candidateRng = new SeededRandom(seed * 3571);
  const candidates = prepareCandidates(words, candidateRng);

  if (candidates.length < 8) {
    throw new Error(
      `Insufficient word candidates for puzzle generation: ${candidates.length} (need at least 8). ` +
      `Check that the word database has enough valid entries for the selected category.`
    );
  }

  // Choose grid config (deterministic from seed, decoupled from difficulty)
  const gridConfig = chooseGridConfig(seed);
  const topoConfig = getTopologyConfig(gridConfig);
  const solverConfig = getSolverConfig();

  let topologyAttempts = 0;
  let solverAttempts = 0;
  let lastBacktrackCount = 0;

  for (let attempt = 0; attempt < MAX_GENERATION_ATTEMPTS; attempt++) {
    // Vary topology seed per attempt for different layouts
    const topoSeed = seed * 7919 + attempt * 104729;
    const topoRng = new SeededRandom(topoSeed);

    // Phase 1: Build slot topology
    const topology = buildSlotTopology(gridConfig, topoConfig, topoRng);
    topologyAttempts++;

    if (!topology) continue; // Topology didn't meet quality constraints

    // Phase 2: Assign answers via CSP solver
    const solverRng = new SeededRandom(seed * 6271 + attempt * 31);
    const solverResult = assignAnswersWithCSP(
      topology.slots,
      candidates,
      solverRng,
      solverConfig
    );
    solverAttempts++;

    if (!solverResult) {
      lastBacktrackCount = solverConfig.maxBacktracks; // hit limit
      continue;
    }

    lastBacktrackCount = solverResult.backtrackCount;

    // Phase 3: Validate assignment
    const validation = validateAssignment(topology.slots, solverResult.assignments);
    if (!validation.valid) {
      console.warn(`[CrosswordEngine] Puzzle validation failed:`, validation.errors);
      continue;
    }

    // Phase 4: Compute analytics
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

    // TODO: Phase 5 (future) — Single-solution uniqueness verification
    // For pre-generation pipeline, enable uniqueness check here.
    // Skipped in MVP runtime for performance.

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

  throw new Error(
    `Failed to generate puzzle after ${MAX_GENERATION_ATTEMPTS} attempts for seed ${seed}. ` +
    `Grid: ${gridConfig.label}, candidates: ${candidates.length}, ` +
    `topology attempts: ${topologyAttempts}, solver attempts: ${solverAttempts}, ` +
    `last backtrack count: ${lastBacktrackCount}. ` +
    `This may indicate insufficient word variety for the required slot lengths.`
  );
}
