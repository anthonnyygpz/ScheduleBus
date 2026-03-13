import { RecipeProviderRepository } from "@/application/repositories/recipe-provider.repository";

export class DynamicRecipeProvider implements RecipeProviderRepository {
  public getRecipes(
    availableGroups: string[],
    defaultTeamSize: number = 3,
  ): string[][] {
    if (!availableGroups || availableGroups.length === 0) return [];

    const recipes: string[][] = [];

    availableGroups.forEach((group) => {
      recipes.push(Array(defaultTeamSize).fill(group));
    });

    if (availableGroups.length >= 2) {
      const mixedTeam = [];
      for (let i = 0; i < defaultTeamSize; i++) {
        mixedTeam.push(availableGroups[i % availableGroups.length]);
      }
      recipes.push(mixedTeam);
    }

    return recipes;
  }
}
