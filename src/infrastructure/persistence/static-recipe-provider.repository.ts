import { RecipeProviderRepository } from "@/application/repositories/recipe-provider.repository";

export class StaticRecipeProvider implements RecipeProviderRepository {
  public getRecipes(): string[][] {
    return [
      ["A", "B", "C"],
      ["B", "B", "B"],
      ["C", "C", "C", "C"],
    ];
  }
}
