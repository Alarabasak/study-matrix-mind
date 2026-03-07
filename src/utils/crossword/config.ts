/**
 * Arrow Crossword Engine - Configuration
 * 
 * Grid families, topology targets, and solver limits.
 * All tunables are centralized here — no magic numbers in the core algorithm.
 */

import { GridConfig, TopologyConfig, SolverConfig } from './types';

/** MVP grid families. Grid size is NOT tied to difficulty. */
export const GRID_FAMILIES: GridConfig[] = [
  { rows: 10, cols: 10, label: '10x10' },
  { rows: 12, cols: 10, label: '10x12' },
  { rows: 10, cols: 12, label: '12x10' },
];

/** Deterministic grid selection from seed. Strategy is decoupled for future policy changes. */
export function chooseGridConfig(seed: number): GridConfig {
  return GRID_FAMILIES[((seed % GRID_FAMILIES.length) + GRID_FAMILIES.length) % GRID_FAMILIES.length];
}

/** Topology config derived from grid dimensions. */
export function getTopologyConfig(grid: GridConfig): TopologyConfig {
  const area = grid.rows * grid.cols;
  return {
    minSlotLen: 3,
    softMaxSlotLen: Math.min(10, Math.max(grid.rows, grid.cols) - 1),
    // Relaxed targets for higher topology success rate
    targetSlotCountMin: Math.max(8, Math.floor(area * 0.08)),
    targetSlotCountMax: Math.floor(area * 0.35),
  };
}

/** Solver limits — increased for better success rates. */
export function getSolverConfig(): SolverConfig {
  return {
    maxBacktracks: 50000,
  };
}

/** Maximum orchestrator-level attempts (topology + solver combined). */
export const MAX_GENERATION_ATTEMPTS = 200;

/** Horizontal slot length range for initial topology layout. */
export const SLOT_LEN_MIN = 3;
export const SLOT_LEN_RANGE = 5; // slotLen = SLOT_LEN_MIN + rng.nextInt(SLOT_LEN_RANGE) → 3..7
