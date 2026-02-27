import { EmployeeRepository } from "@/application/repositories/employee.repository";
import { ScheduleRepository } from "@/application/repositories/schedule.repository";
import { RouteRepository } from "../../repositories/route.repository";
import { ScheduleEngine } from "@/core/logic/schedule-engine";
import { ScheduleMapper } from "@/infrastructure/mappers/schedule.mapper";
import { GenerateScheduleRequestDto } from "../../dtos/schedule.dto";

export class GenerateScheduleUseCase {
  constructor(
    private employeeRepo: EmployeeRepository,
    private routeRepo: RouteRepository,
    private scheduleRepo: ScheduleRepository,
    private idGenerator: () => string,
  ) {}

  async execute(weekStart: Date) {
    const [employees, routes] = await Promise.all([
      this.employeeRepo.findAll(),
      this.routeRepo.findAll(),
    ]);

    const newEntries = ScheduleEngine.generateWeeklyEntries(
      employees,
      routes,
      weekStart,
      this.idGenerator,
    );

    const scheduleEntity: GenerateScheduleRequestDto = {
      id: this.idGenerator(),
      weekStart: weekStart.toISOString().split("T")[0],
      entries: newEntries,
    };

    const schedule = ScheduleMapper.toPersistence(scheduleEntity);

    await this.scheduleRepo.save(schedule);

    return schedule;
  }
}
