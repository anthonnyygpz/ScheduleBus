import { EmployeeRepository } from "@/application/repositories/employee.repository";
import { RouteRepository } from "@/application/repositories/route.repository";
import { ScheduleRepository } from "@/application/repositories/schedule.repository";
import { ScheduleEngine } from "@/core/logic/schedule-engine";
import { ScheduleMapper } from "@/infrastructure/mappers/schedule.mapper";

export class GenerateScheduleUseCase {
  constructor(
    private readonly employeeRepo: EmployeeRepository,
    private readonly routeRepo: RouteRepository,
    private readonly scheduleRepo: ScheduleRepository,
    private readonly scheduleEngine: ScheduleEngine,
    private readonly idGenerator: () => string,
  ) {}

  async execute(weekStart: Date) {
    const [employees, routes] = await Promise.all([
      this.employeeRepo.findAll({ status: "active", page: 1, limit: 10000 }),
      this.routeRepo.findAll(),
    ]);

    const activeEmployees = employees.employees;

    if (!employees.employees.length) throw new Error("No hay empleados.");
    if (!routes.length) throw new Error("No hay rutas.");

    const weekStartStr = weekStart.toISOString().split("T")[0];

    const existingSchedule =
      await this.scheduleRepo.findByWeekStart(weekStartStr);

    const scheduleId = existingSchedule
      ? existingSchedule.id
      : this.idGenerator();

    const newEntries = this.scheduleEngine.generateWeeklyEntries(
      activeEmployees,
      routes,
      weekStart,
      this.idGenerator,
    );

    const scheduleDomainEntity = {
      id: scheduleId,
      weekStart: weekStartStr,
      entries: newEntries,
    };

    const scheduleRecord = ScheduleMapper.toPersistence(scheduleDomainEntity);

    await this.scheduleRepo.save(scheduleRecord);

    return scheduleRecord;
  }
}
