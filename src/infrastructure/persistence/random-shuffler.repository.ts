import { ShufflerRepository } from "@/application/repositories/shuffler.repository";

export class RandomShuffler implements ShufflerRepository {
  public shuffle<T>(array: T[]): T[] {
    return [...array].sort(() => Math.random() - 0.5);
  }
}
