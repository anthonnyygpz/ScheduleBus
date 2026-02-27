import { ScheduleRepository } from "@/application/repositories/schedule.repository";
import { Schedule } from "@/core/entities/schedule.type";

export class InMemoryScheduleRepository implements ScheduleRepository {
  private currentSchedule: Schedule | null = null;

  async getCurrent(): Promise<Schedule | null> {
    return this.currentSchedule;
  }

  async save(schedule: Schedule) {
    this.currentSchedule = schedule;
  }
}
