import { EmployeeRepository } from "@/application/repositories/employee.repository";
import { ScheduleRepository } from "@/application/repositories/schedule.repository";
import { ScheduleEngine } from "@/core/logic/schedule-engine";
import { GenerateScheduleRequestDto } from "./generate-schedule.dto";

export class GenerateScheduleUseCase {
  constructor(
    private employeeRepo: EmployeeRepository,
    private scheduleRepo: ScheduleRepository,
    private idGenerator: () => string,
  ) {}

  async execute(weekStart: Date) {
    const employees = await this.employeeRepo.findAll();

    const newEntries = ScheduleEngine.generateWeeklyEntries(
      employees,
      weekStart,
      this.idGenerator,
    );

    const schedule: GenerateScheduleRequestDto = {
      id: this.idGenerator(),
      weekStart: weekStart.toISOString().split("T")[0],
      entries: newEntries as any,
    };

    await this.scheduleRepo.save(schedule);
    return schedule;
  }
}
