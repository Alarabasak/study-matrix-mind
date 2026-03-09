/**
 * Arrow Crossword Engine - Configuration
 * 
 * Grid families, topology targets, and solver limits.
 * All tunables are centralized here — no magic numbers in the core algorithm.
 */

import { GridConfig, TopologyConfig, SolverConfig } from './types';

/** Supported grid families. Only 12x12, 16x12, 12x16 are valid. */
export const GRID_FAMILIES: GridConfig[] = [
  { rows: 12, cols: 12, label: '12x12' },
  { rows: 12, cols: 16, label: '16x12' },
  { rows: 16, cols: 12, label: '12x16' },
];

/**
 * Validate that a grid size is supported.
 * Returns the matching GridConfig or null.
 */
export function validateGridConfig(cols: number, rows: number): GridConfig | null {
  return GRID_FAMILIES.find(g => g.rows === rows && g.cols === cols) || null;
}

/** Deterministic grid selection from seed. */
export function chooseGridConfig(seed: number): GridConfig {
  return GRID_FAMILIES[((seed % GRID_FAMILIES.length) + GRID_FAMILIES.length) % GRID_FAMILIES.length];
}

/** Topology config derived from grid dimensions. */
export function getTopologyConfig(grid: GridConfig): TopologyConfig {
  const area = grid.rows * grid.cols;
  return {
    minSlotLen: 3,
    softMaxSlotLen: Math.min(9, Math.max(grid.rows, grid.cols) - 1),
    targetSlotCountMin: Math.max(10, Math.floor(area * 0.08)),
    targetSlotCountMax: Math.max(20, Math.floor(area * 0.20)),
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
