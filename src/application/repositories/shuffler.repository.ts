export interface ShufflerRepository {
  shuffle<T>(array: T[]): T[];
}
