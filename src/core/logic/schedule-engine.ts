import { RecipeProviderRepository } from "@/application/repositories/recipe-provider.repository";
import { ShufflerRepository } from "@/application/repositories/shuffler.repository";
import { ScheduleEntry } from "../entities/schedule.type";
import { IRoute } from "../entities/types.type";
import { Employee } from "../entities/employee.type";

export class ScheduleEngine {
  // Constantes de reglas de negocio para evitar "Magic Numbers"
  private readonly DAY_START_MINUTES = 5 * 60 + 30; // 05:30 AM en minutos (330)
  private readonly DAY_END_MINUTES = 22 * 60; // 10:00 PM en minutos (1320)

  constructor(
    private readonly recipeProvider: RecipeProviderRepository,
    private readonly shuffler: ShufflerRepository,
  ) {}

  public generateWeeklyEntries(
    employees: Employee[],
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
      const shuffledRoutes = this.shuffler.shuffle([...routes], dateStr);

      shuffledRoutes.forEach((route) => {
        const team = this.getValidTeamForRoute(
          employees,
          route,
          assignedToday,
          dateStr,
        );

        if (team.length > 0) {
          // Iniciamos el contador estrictamente a las 05:30 AM (330 minutos)
          let currentMinutes = this.DAY_START_MINUTES;

          for (let i = 0; i < team.length; i++) {
            const employee = team[i];

            // Si ya se cubrió hasta las 10:00 PM, detenemos la asignación
            if (currentMinutes >= this.DAY_END_MINUTES) break;

            const startMins = currentMinutes;
            let endMins = startMins + employee.group.hours * 60;

            const isLastInTeam = i === team.length - 1;
            const remainingMins = this.DAY_END_MINUTES - endMins;

            // 👇 REGLA DE ORO: Ajuste dinámico de cierre
            // Si falta poco tiempo para cerrar (ej. 90 mins o menos), o si el cálculo
            // matemático excede las 10:00 PM, forzamos la hora de salida a las 10:00 PM exactas.
            if (
              isLastInTeam ||
              remainingMins <= 90 ||
              endMins > this.DAY_END_MINUTES
            ) {
              endMins = this.DAY_END_MINUTES;
            }

            entries.push(
              new ScheduleEntry(
                idGenerator(),
                employee.id.toString(),
                employee.name,
                employee.group.name,
                dateStr,
                this.formatTime(startMins),
                this.formatTime(endMins),
                route.name,
                "scheduled",
                0,
              ),
            );

            assignedToday.add(employee.id);
            currentMinutes = endMins; // El siguiente empleado (si lo hay) empieza donde terminó este
          }
        }
      });
    }

    return entries;
  }

  // Utilidad privada para formatear minutos totales a "HH:mm"
  private formatTime(totalMinutes: number): string {
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
  }

  private getValidTeamForRoute(
    employees: Employee[],
    route: IRoute,
    assignedToday: Set<number>,
    dateStr: string,
  ): Employee[] {
    // Para hacer la validación dinámica de grupos como vimos anteriormente:
    const availableGroups = Array.from(
      new Set(employees.map((e) => e.group.name)),
    );
    const recipes = this.recipeProvider.getRecipes(availableGroups);

    const shuffledRecipes = this.shuffler.shuffle(
      [...recipes],
      `${dateStr}-${route.id}`,
    );

    for (const recipe of shuffledRecipes) {
      const tentativeTeam: Employee[] = [];

      for (const requiredGroupName of recipe) {
        let candidate = employees.find(
          (e) =>
            e.group.name === requiredGroupName &&
            !assignedToday.has(e.id) &&
            !tentativeTeam.some((t) => t.id === e.id) &&
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
          break;
        }
      }

      if (tentativeTeam.length === recipe.length) {
        return tentativeTeam;
      }
    }

    return [];
  }
}
