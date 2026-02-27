import { Schedule } from "@/core/entities/schedule.type";

export interface ScheduleRepository {
  getCurrent(): Promise<Schedule | null>;
  save: (schedule: Schedule) => Promise<void>;
}
