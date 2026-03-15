import { ScheduleResponseDto } from "@/application/dtos/schedule.dto";
import { RouteRepository } from "@/application/repositories/route.repository";
import { ScheduleMapper } from "@/infrastructure/mappers/schedule.mapper";
import { ScheduleEngine } from "@/core/logic/schedule-engine";
import { EmployeeRepository } from "@/application/repositories/employee.repository";
import { AbsenceRepository } from "@/application/repositories/absence.repository";
import { Schedule, ScheduleEntry } from "@/core/entities/schedule.type";
import { Employee } from "@/core/entities/employee.type";
import { AbsenceRecord } from "@/core/entities/absence.type";

export class GetScheduleUseCase {
  constructor(
    private readonly employeeRepo: EmployeeRepository,
    private readonly routeRepo: RouteRepository,
    private readonly absenceRepo: AbsenceRepository,
    private readonly scheduleEngine: ScheduleEngine,
    private readonly idGenerator: () => string,
  ) {}

  async execute(weekStart: Date): Promise<ScheduleResponseDto | null> {
    const weekStartStr = weekStart.toISOString().split("T")[0];

    const weekEnd = new Date(weekStart);
    weekEnd.setUTCDate(weekStart.getUTCDate() + 6);
    const weekEndStr = weekEnd.toISOString().split("T")[0];

    const [employeesResult, routes, absences] = await Promise.all([
      this.employeeRepo.findAll({ page: 1, limit: 10000 }),
      this.routeRepo.findAll(),
      this.absenceRepo.findByDateRange(weekStartStr, weekEndStr),
    ]);

    if (!employeesResult.employees.length || !routes.length) return null;

    // Ordenamiento estable para garantizar que la semilla genere siempre lo mismo
    const sortedEmployees = [...employeesResult.employees].sort(
      (a, b) => a.id - b.id,
    );
    const sortedRoutes = [...routes].sort((a, b) => a.id - b.id);

    const baseEntries = this.scheduleEngine.generateWeeklyEntries(
      sortedEmployees,
      sortedRoutes,
      weekStart,
      () => "temp",
    );

    const stableEntries = baseEntries.map((entry) => {
      const uniqueId = Buffer.from(
        `${entry.date}-${entry.employeeId}-${entry.route}`,
      ).toString("base64");
      return { ...entry, id: uniqueId };
    }) as ScheduleEntry[];

    const finalEntries = this.applyAbsencesAndStatus(
      stableEntries,
      absences,
      sortedEmployees,
    );
    const scheduleDomainEntity = new Schedule(
      weekStartStr,
      weekStartStr,
      finalEntries,
    );

    return ScheduleMapper.toResponseDto(scheduleDomainEntity);
  }

  /**
   * Transforma las entradas base basándose en las ausencias registradas.
   * Crucial: Devuelve siempre instancias de 'new ScheduleEntry' para conservar métodos.
   */

  private applyAbsencesAndStatus(
    entries: ScheduleEntry[],
    absences: AbsenceRecord[],
    allEmployees: Employee[],
  ): ScheduleEntry[] {
    return entries.map((entry) => {
      // 1. Buscar si hay una ausencia para este empleado en esta fecha
      const absence = absences.find(
        (a) => a.employeeId === entry.employeeId && a.date === entry.date,
      );

      if (!absence) return entry;

      // 2. CASO: Existe un reemplazo registrado
      if (absence.replacementId) {
        const replacement = allEmployees.find(
          (e) => e.id.toString() === absence.replacementId,
        );

        if (replacement) {
          // Retornamos una nueva entrada con el nombre combinado
          return new ScheduleEntry(
            entry.id,
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
      }

      // 3. CASO: Ausencia sin reemplazo
      return new ScheduleEntry(
        entry.id,
        entry.employeeId,
        `(Faltó) ${entry.employeeName}`,
        entry.group,
        entry.date,
        entry.startTime,
        entry.endTime,
        entry.route,
        "absent",
        0,
      );
    });
  }
}
