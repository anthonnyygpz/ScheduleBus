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
      this.employeeRepo.findAll(),
      this.routeRepo.findAll(),
    ]);

    if (!employees.length) {
      throw new Error("Cannot generate schedule: No employees found.");
    }
    if (!routes.length) {
      throw new Error("Cannot generate schedule: No routes found.");
    }

    const newEntries = this.scheduleEngine.generateWeeklyEntries(
      employees,
      routes,
      weekStart,
      this.idGenerator,
    );

    if (!newEntries.length) {
      throw new Error(
        "Schedule Engine could not generate any valid entries for the given parameters.",
      );
    }

    const scheduleDomainEntity = {
      id: this.idGenerator(),
      weekStart: weekStart.toISOString().split("T")[0],
      entries: newEntries,
    };

    const scheduleRecord = ScheduleMapper.toPersistence(scheduleDomainEntity);
    await this.scheduleRepo.save(scheduleRecord);

    return scheduleRecord;
  }
}
