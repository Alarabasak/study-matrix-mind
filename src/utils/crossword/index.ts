/**
 * Arrow Crossword (Çengel Bulmaca) Engine - Public API
 * 
 * Re-exports all public types and functions.
 */

export { generatePuzzle, generatePuzzleDefinition } from './generator';
export { normalizeAnswer } from './normalizer';
export { SeededRandom } from './seededRandom';
export { buildSlotTopology } from './topologyBuilder';
export { assignAnswersWithCSP, checkUniqueness } from './solver';
export { validateTopology, validateAssignment } from './validator';
export { computeAnalytics } from './analytics';
export { chooseGridConfig, validateGridConfig, getTopologyConfig, getSolverConfig, GRID_FAMILIES } from './config';
export { puzzleResultToDefinition } from './puzzleConverter';

export type {
  ClueDirection,
  ClueRef,
  ClueCellData,
  InternalCellType,
  SlotIntersection,
  Slot,
  AnswerCandidate,
  SlotAssignment,
  PuzzleResult,
  PuzzleAnalyticsData,
  GridConfig,
  TopologyConfig,
  SolverConfig,
} from './types';
