import { EmployeeResponseDto } from "@/application/dtos/employee.dto";
import { ScheduleEntry } from "../entities/schedule.type";
import { IRoute } from "../entities/types.type";

export class ScheduleEngine {
  private static readonly RECIPES = [
    ["A", "B", "C"],
    ["B", "B", "B"],
    ["C", "C", "C", "C"],
  ];

  static generateWeeklyEntries(
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

      // Seguimiento de quién trabajó HOY (Equivalente a e.assigned_today en Python)
      const assignedToday = new Set<number>();

      // Barajamos rutas para evitar sesgos (como en Python)
      const shuffledRoutes = [...routes].sort(() => Math.random() - 0.5);

      shuffledRoutes.forEach((route) => {
        const team = this.getValidTeamForRoute(employees, route, assignedToday);

        if (team.length > 0) {
          let currentHourOffset = 0;

          team.forEach((employee) => {
            const startH = currentHourOffset;
            const endH = (startH + employee.group.hours) % 24;

            entries.push({
              id: idGenerator(),
              employeeId: employee.id.toString(),
              employeeName: employee.name,
              group: employee.group.name as any,
              date: dateStr,
              shift: this.getShiftType(startH), // Determina mañana/tarde/noche
              startTime: `${startH.toString().padStart(2, "0")}:00`,
              endTime: `${endH.toString().padStart(2, "0")}:00`,
              route: route.name,
              status: "scheduled",
              progress: 0,
            });

            assignedToday.add(employee.id);
            currentHourOffset += employee.group.hours;
          });
        }
      });
    }

    return entries;
  }

  private static getValidTeamForRoute(
    employees: EmployeeResponseDto[],
    route: IRoute,
    assignedToday: Set<number>,
  ): EmployeeResponseDto[] {
    // Barajamos recetas para rotación de personal
    const shuffledRecipes = [...this.RECIPES].sort(() => Math.random() - 0.5);

    for (const recipe of shuffledRecipes) {
      const tentativeTeam: EmployeeResponseDto[] = [];

      for (const requiredGroupName of recipe) {
        // Prioridad 1: Empleado con afinidad a la ruta (como en Python)
        let candidate = employees.find(
          (e) =>
            e.group.name === requiredGroupName &&
            !assignedToday.has(e.id) &&
            !tentativeTeam.includes(e) &&
            e.routes.some((r) => r.id === route.id),
        );

        // Prioridad 2: Cualquier empleado disponible del grupo requerido
        if (!candidate) {
          candidate = employees.find(
            (e) =>
              e.group.name === requiredGroupName &&
              !assignedToday.has(e.id) &&
              !tentativeTeam.includes(e),
          );
        }

        if (candidate) tentativeTeam.push(candidate);
        else break; // Si falta alguien de la receta, probamos con la siguiente receta
      }

      if (tentativeTeam.length === recipe.length) {
        return tentativeTeam;
      }
    }

    return []; // No se pudo cubrir la ruta hoy
  }

  private static getShiftType(startHour: number): any {
    if (startHour < 12) return "morning";
    if (startHour < 18) return "afternoon";
    return "night";
  }
}
