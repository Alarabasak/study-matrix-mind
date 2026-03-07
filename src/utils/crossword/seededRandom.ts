/**
 * Seeded PRNG for deterministic puzzle generation.
 * Uses a linear congruential generator (Park-Miller).
 */

export class SeededRandom {
  private seed: number;

  constructor(seed: number) {
    // Ensure positive non-zero seed
    this.seed = ((seed % 2147483646) + 2147483646) % 2147483646 + 1;
  }

  next(): number {
    this.seed = (this.seed * 16807) % 2147483647;
    return this.seed / 2147483647;
  }

  nextInt(max: number): number {
    if (max <= 0) return 0;
    return Math.floor(this.next() * max);
  }

  shuffle<T>(arr: T[]): T[] {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = this.nextInt(i + 1);
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
}
