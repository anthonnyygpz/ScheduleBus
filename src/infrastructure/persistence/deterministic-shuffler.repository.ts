import { ShufflerRepository } from "@/application/repositories/shuffler.repository";

export class DeterministicShuffler implements ShufflerRepository {
  public shuffle<T>(array: T[], seed: string = "default-seed"): T[] {
    let seedValue = this.hashString(seed);
    const result = [...array];

    for (let i = result.length - 1; i > 0; i--) {
      seedValue = (seedValue * 9301 + 49297) % 233280;
      const rnd = seedValue / 233280;
      const j = Math.floor(rnd * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }

  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash);
  }
}
