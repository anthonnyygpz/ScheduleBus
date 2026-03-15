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
      currentDate.setUTCDate(weekStart.getUTCDate() + i);
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
          let currentMinutes = this.DAY_START_MINUTES;

          for (let idx = 0; idx < team.length; idx++) {
            const employee = team[idx];

            // 1. Calculamos el fin de jornada real basado en las horas del grupo
            const shiftDurationMinutes = employee.group.hours * 60;
            const startMins = currentMinutes;
            const endMins = startMins + shiftDurationMinutes;

            // 2. VALIDACIÓN ESTRICTA:
            // Si el turno completo excede las 10:00 PM (1320 min), NO se asigna.
            // Así respetamos que el empleado trabaje sus horas completas "ni más ni menos".
            if (endMins > this.DAY_END_MINUTES) {
              break;
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
                // Hemos removido "scheduled" y 0, el constructor los asignará automáticamente.
              ),
            );

            assignedToday.add(employee.id);
            currentMinutes = endMins; // El siguiente comienza exactamente donde terminó el anterior
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
    const availableGroups = Array.from(
      new Set(employees.map((e) => e.group.name)),
    );
    const recipes = this.recipeProvider.getRecipes(availableGroups);

    // Mezclamos para asegurar rotación justa de grupos
    const shuffledRecipes = this.shuffler.shuffle(
      [...recipes],
      `${dateStr}-${route.id}`,
    );

    let bestTeam: Employee[] = [];
    let bestDurationMinutes = 0;

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
          break; // Rompemos solo este intento de receta si falta un empleado
        }
      }

      // Si logramos armar el equipo completo dictado por la receta
      if (tentativeTeam.length === recipe.length) {
        // Responsabilidad del Engine: Validar la duración en minutos
        const teamDurationMinutes = tentativeTeam.reduce(
          (acc, emp) => acc + emp.group.hours * 60,
          0,
        );
        const endMins = this.DAY_START_MINUTES + teamDurationMinutes;

        // Regla 1: El equipo NUNCA debe exceder el límite de cierre (22:00 / 1320 min)
        if (endMins <= this.DAY_END_MINUTES) {
          // Regla 2: Si el equipo cubre 16 horas (960 min) exactas, es perfecto.
          // Lo retornamos de inmediato para optimizar la velocidad del algoritmo.
          if (teamDurationMinutes >= 16 * 60) {
            return tentativeTeam;
          }

          // Regla 3: Si no cubre las 16h pero no se pasa del límite, lo guardamos
          // temporalmente por si termina siendo la mejor combinación posible del día.
          if (teamDurationMinutes > bestDurationMinutes) {
            bestTeam = [...tentativeTeam];
            bestDurationMinutes = teamDurationMinutes;
          }
        }
      }
    }

    // Si iteró todas las recetas y ninguna fue perfecta, retorna la que más se acercó
    return bestTeam;
  }
}
