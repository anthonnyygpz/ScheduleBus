import { RecipeProviderRepository } from "@/application/repositories/recipe-provider.repository";

export class DynamicRecipeProvider implements RecipeProviderRepository {
  public getRecipes(
    availableGroups: string[],
    defaultTeamSize: number = 3,
  ): string[][] {
    if (!availableGroups || availableGroups.length === 0) return [];

    const recipes: string[][] = [];

    // Función recursiva para generar todas las permutaciones posibles con repetición
    const generatePermutations = (
      currentRecipe: string[],
      targetSize: number,
    ) => {
      if (currentRecipe.length === targetSize) {
        recipes.push([...currentRecipe]);
        return;
      }

      for (const group of availableGroups) {
        currentRecipe.push(group);
        generatePermutations(currentRecipe, targetSize);
        currentRecipe.pop(); // Backtracking
      }
    };

    // 1. GENERAMOS EQUIPOS DE TAMAÑO 2 (Ej: 10h + 6h, 8h + 8h)
    // Se evalúan primero para optimizar recursos si un día se puede cubrir con 2 personas.
    generatePermutations([], 2);

    // 2. GENERAMOS EQUIPOS DE TAMAÑO 3 (o el defaultTeamSize) (Ej: 6h + 6h + 6h)
    // Se evalúan como fallback si las combinaciones de 2 personas no cubren la jornada o generan horas extra.
    generatePermutations([], defaultTeamSize);

    return recipes;
  }
}
