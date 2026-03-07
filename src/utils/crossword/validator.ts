/**
 * Arrow Crossword Engine - Validators
 * 
 * Explicit validation for topology quality and puzzle assignment correctness.
 * Do not rely only on generator luck — validate at every stage.
 */

import { Slot, SlotAssignment, AnswerCandidate, TopologyConfig } from './types';

/** Validate slot topology meets quality requirements. */
export function validateTopology(slots: Slot[], config: TopologyConfig): boolean {
  // Slot count in target range
  if (slots.length < config.targetSlotCountMin) return false;
  if (slots.length > config.targetSlotCountMax) return false;

  // All slots have valid length
  for (const slot of slots) {
    if (slot.length < config.minSlotLen) return false;
    if (slot.length > 15) return false; // hard max answer length
  }

  // No isolated slots (every slot must intersect at least one other)
  if (slots.length > 1) {
    for (const slot of slots) {
      if (slot.intersections.length === 0) return false;
    }
  }

  return true;
}

/** Validate that all slot assignments are consistent. */
export function validateAssignment(
  slots: Slot[],
  assignments: SlotAssignment[]
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Every slot must be assigned
  if (assignments.length !== slots.length) {
    errors.push(`Expected ${slots.length} assignments, got ${assignments.length}`);
  }

  // Build assignment map
  const assignMap = new Map<number, AnswerCandidate>();
  for (const a of assignments) {
    assignMap.set(a.slotIndex, a.candidate);
  }

  // Check answer lengths match slot lengths
  for (const slot of slots) {
    const candidate = assignMap.get(slot.index);
    if (!candidate) {
      errors.push(`Slot ${slot.index} has no assignment`);
      continue;
    }
    if (candidate.normalizedAnswer.length !== slot.length) {
      errors.push(
        `Slot ${slot.index}: answer "${candidate.normalizedAnswer}" length ${candidate.normalizedAnswer.length} != slot length ${slot.length}`
      );
    }
  }

  // Check no duplicate answers
  const usedAnswers = new Set<string>();
  for (const a of assignments) {
    if (usedAnswers.has(a.candidate.normalizedAnswer)) {
      errors.push(`Duplicate answer: "${a.candidate.normalizedAnswer}"`);
    }
    usedAnswers.add(a.candidate.normalizedAnswer);
  }

  // Check intersection letter consistency
  for (const slot of slots) {
    const candidate = assignMap.get(slot.index);
    if (!candidate) continue;

    for (const inter of slot.intersections) {
      const otherCandidate = assignMap.get(inter.otherSlotIndex);
      if (!otherCandidate) continue;

      const myLetter = candidate.normalizedAnswer[inter.posInThis];
      const otherLetter = otherCandidate.normalizedAnswer[inter.posInOther];
      if (myLetter !== otherLetter) {
        errors.push(
          `Intersection mismatch: slot ${slot.index}[${inter.posInThis}]='${myLetter}' vs slot ${inter.otherSlotIndex}[${inter.posInOther}]='${otherLetter}'`
        );
      }
    }
  }

  return { valid: errors.length === 0, errors };
}
