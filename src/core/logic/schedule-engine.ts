import { EmployeeResponseDto } from "@/application/dtos/employee.dto";
import { RecipeProviderRepository } from "@/application/repositories/recipe-provider.repository";
import { ShufflerRepository } from "@/application/repositories/shuffler.repository";
import { ScheduleEntry } from "../entities/schedule.type";
import { IRoute } from "../entities/types.type";

export class ScheduleEngine {
  constructor(
    private readonly recipeProvider: RecipeProviderRepository,
    private readonly shuffler: ShufflerRepository,
  ) {}

  public generateWeeklyEntries(
    employees: EmployeeResponseDto[],
    routes: IRoute[],
    weekStart: Date,
    idGenerator: () => string,
  ): ScheduleEntry[] {
    const entries: ScheduleEntry[] = [];

    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(weekStart);
      currentDate.setDate(weekStart.getDate() + i);
      const dateStr = currentDate.toISOString().split("T")[0];

      const assignedToday = new Set<number>();

      const shuffledRoutes = this.shuffler.shuffle([...routes]);

      shuffledRoutes.forEach((route) => {
        const team = this.getValidTeamForRoute(employees, route, assignedToday);

        if (team.length > 0) {
          let currentHourOffset = 0;

          team.forEach((employee) => {
            const startH = currentHourOffset;
            const endH = (startH + employee.group.hours) % 16;

            entries.push(
              new ScheduleEntry(
                idGenerator(),
                employee.id.toString(),
                employee.name,
                employee.group.name,
                dateStr,
                `${startH.toString().padStart(2, "0")}:00`,
                `${endH.toString().padStart(2, "0")}:00`,
                route.name,
                "scheduled",
                0,
              ),
            );

            assignedToday.add(employee.id);
            currentHourOffset += employee.group.hours;
          });
        }
      });
    }

    return entries;
  }

  private getValidTeamForRoute(
    employees: EmployeeResponseDto[],
    route: IRoute,
    assignedToday: Set<number>,
  ): EmployeeResponseDto[] {
    const recipes = this.recipeProvider.getRecipes();
    const shuffledRecipes = this.shuffler.shuffle([...recipes]);

    for (const recipe of shuffledRecipes) {
      const tentativeTeam: EmployeeResponseDto[] = [];

      for (const requiredGroupName of recipe) {
        let candidate = employees.find(
          (e) =>
            e.group.name === requiredGroupName &&
            !assignedToday.has(e.id) &&
            !tentativeTeam.some((t) => t.id === e.id) && // Comparación más segura por ID
            e.routes.some((r) => r.id === route.id),
        );

        if (!candidate) {
          candidate = employees.find(
            (e) =>
              e.group.name === requiredGroupName &&
              !assignedToday.has(e.id) &&
              !tentativeTeam.some((t) => t.id === e.id),
          );
        }

        if (candidate) {
          tentativeTeam.push(candidate);
        } else {
          break; // Rompe temprano si falta un eslabón de la receta
        }
      }

      if (tentativeTeam.length === recipe.length) {
        return tentativeTeam;
      }
    }

    return [];
  }
}
