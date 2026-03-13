export interface RecipeProviderRepository {
  getRecipes(availableGroups: string[], defaultTeamSize?: number): string[][];
}
