/**
 * Reaction image pools for correct/wrong answers.
 * To add/remove images: just import and add to the relevant array.
 */

// --- CORRECT answer reactions ---
import correctHamster from '@/assets/reactions/correct/hamster.png';
import correctPuppy from '@/assets/reactions/correct/puppy.jpg';
import correctMonkey from '@/assets/reactions/correct/monkey-thumbsup.jpg';

// --- WRONG answer reactions ---
import wrongShocked from '@/assets/reactions/wrong/monkey-shocked.jpg';
import wrongSmile from '@/assets/reactions/wrong/monkey-smile.jpg';
import wrongWink from '@/assets/reactions/wrong/monkey-wink.jpg';

export const correctReactions: string[] = [
  correctHamster,
  correctPuppy,
  correctMonkey,
];

export const wrongReactions: string[] = [
  wrongShocked,
  wrongSmile,
  wrongWink,
];

export function getRandomReaction(correct: boolean): string {
  const pool = correct ? correctReactions : wrongReactions;
  return pool[Math.floor(Math.random() * pool.length)];
}
