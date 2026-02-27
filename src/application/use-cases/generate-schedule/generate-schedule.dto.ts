import { ScheduleEntry } from "@/core/entities/schedule.type";

export interface GenerateScheduleRequestDto {
  id: string;
  weekStart: string;
  entries: ScheduleEntry[];
}
