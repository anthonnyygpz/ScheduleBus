import { EmployeeRepository } from "@/application/repositories/employee.repository";
import { RouteRepository } from "@/application/repositories/route.repository";
import { AbsenceRepository } from "@/application/repositories/absence.repository";
import { ScheduleEngine } from "@/core/logic/schedule-engine";
import { ProgressService } from "@/application/services/ProgressService";
import { ScheduleEntry } from "@/core/entities/schedule.type";
import { getTuesday } from "@/components/schedule-manager/hooks/useScheduleDerivedData";

export class LiveScheduleUseCase {
  constructor(
    private readonly employeeRepo: EmployeeRepository,
    private readonly routeRepo: RouteRepository,
    private readonly absenceRepo: AbsenceRepository,
    private readonly scheduleEngine: ScheduleEngine,
    private readonly progressService: ProgressService,
  ) {}
  async execute(): Promise<ScheduleEntry[]> {
    const now = new Date();
    // Fecha local para el filtrado de "Hoy"
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

    // Obtenemos el inicio de la semana (Martes) para que el motor genere el mismo pool
    const weekStart = getTuesday(now);

    const [employeesResult, routes, absences] = await Promise.all([
      this.employeeRepo.findAll({ page: 1, limit: 10000 }),
      this.routeRepo.findAll(),
      this.absenceRepo.findByDateRange(todayStr, todayStr),
    ]);

    // Ordenamiento determinista (Crucial)
    const sortedEmployees = [...employeesResult.employees].sort((a, b) =>
      a.id.toString().localeCompare(b.id.toString()),
    );
    const sortedRoutes = [...routes].sort((a, b) =>
      a.id.toString().localeCompare(b.id.toString()),
    );

    // 1. Generamos TODA la semana con la fecha de inicio correcta (weekStart)
    // Esto garantiza que el horario en vivo sea un reflejo EXACTO del horario estático.
    const allEntries = this.scheduleEngine.generateWeeklyEntries(
      sortedEmployees,
      sortedRoutes,
      weekStart,
      () => "temp-id",
    );

    // 2. Filtramos SOLO los de hoy
    const rawEntries = allEntries.filter((e) => e.date === todayStr);

    // 3. Aplicar ausencias y progreso
    return rawEntries.map((entry) => {
      const stableId = Buffer.from(
        `${entry.date}-${entry.employeeId}-${entry.route}`,
      ).toString("base64");

      const absence = absences.find(
        (a) => a.employeeId === entry.employeeId && a.date === entry.date,
      );

      // Unificamos la declaración en "finalEntry" instanciando correctamente
      let finalEntry = new ScheduleEntry(
        stableId,
        entry.employeeId,
        entry.employeeName,
        entry.group,
        entry.date,
        entry.startTime,
        entry.endTime,
        entry.route,
        entry.status,
        entry.progress,
      );

      if (absence?.replacementId) {
        const replacement = sortedEmployees.find(
          (e) => e.id.toString() === absence.replacementId,
        );
        if (replacement) {
          finalEntry = new ScheduleEntry(
            stableId,
            replacement.id.toString(),
            `${entry.employeeName} -> ${replacement.name}`,
            replacement.group.name,
            entry.date,
            entry.startTime,
            entry.endTime,
            entry.route,
            "scheduled",
            0,
          );
        }
      } else if (absence) {
        finalEntry.status = "absent";
      }

      if (finalEntry.status !== "absent") {
        const result = this.progressService.calculateStatusAndProgress(
          finalEntry,
          now,
        );
        finalEntry.status = result.status;
        finalEntry.progress = result.progress;
      }

      return finalEntry;
    });
  }
}
