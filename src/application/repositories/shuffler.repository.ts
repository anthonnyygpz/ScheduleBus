export interface ShufflerRepository {
  shuffle<T>(array: T[], seed?: string): T[];
}
