import { ScheduleRepository } from "@/application/repositories/schedule.repository";
import { ScheduleEntry } from "@/core/entities/schedule.type";

export class LiveScheduleUseCase {
  constructor(private readonly scheduleRepository: ScheduleRepository) {}

  async execute(): Promise<ScheduleEntry[]> {
    const currentSchedule = await this.scheduleRepository.getCurrent();

    if (!currentSchedule) return [];

    const today = new Date().toLocaleDateString("en-CA");

    const todayEntries = currentSchedule.entries.filter(
      (entry) => entry.date === today,
    );

    return todayEntries;
  }
}
