import {
  GenerateScheduleRequestDto,
  ScheduleResponseDto,
} from "@/application/dtos/schedule.dto";
import { Schedule, ScheduleEntry } from "@/core/entities/schedule.type";

export class ScheduleMapper {
  static toDomain(rawSchedule: any, rawEntries: any[] = []): Schedule {
    const entries = rawEntries.map(
      (entry) =>
        new ScheduleEntry(
          entry.id,
          entry.employee_id.toString(),
          entry.employee_name,
          entry.group_snapshot,
          entry.date,
          entry.start_time,
          entry.end_time,
          entry.route_name,
          entry.status,
          entry.progress || 0,
        ),
    );

    return new Schedule(
      rawSchedule.id,
      rawSchedule.week_start,
      entries,
      rawSchedule.created_at,
      rawSchedule.status,
      rawSchedule.week_end,
    );
  }

  static toPersistence(entity: GenerateScheduleRequestDto): Schedule {
    return new Schedule(
      entity.id,
      entity.weekStart,
      entity.entries,
      entity.status,
      entity.createdAt,
    );
  }
  static toResponseDto(entity: Schedule): ScheduleResponseDto {
    return new ScheduleResponseDto({
      id: entity.id,
      weekStart: entity.week_start,
      weekEnd: entity.week_end,
      entries: entity.entries,
      status: entity.status,
      progress: entity.getTotalProgress(),
      createdAt: entity.created_at,
    });
  }

  static toPersistenceEntries(scheduleId: string, entries: ScheduleEntry[]) {
    return entries.map((entry) => ({
      schedule_id: scheduleId,
      employee_id: parseInt(entry.employeeId),
      employee_name: entry.employeeName,
      group_snapshot: entry.group,
      date: entry.date,
      start_time: entry.startTime,
      end_time: entry.endTime,
      route_name: entry.route,
      status: entry.status,
      progress: entry.progress,
    }));
  }

  static toPersistenceEntry(entry: ScheduleEntry) {
    return {
      schedule_id: entry.id,
      employee_id: parseInt(entry.employeeId),
      employee_name: entry.employeeName,
      group_snapshot: entry.group,
      date: entry.date,
      start_time: entry.startTime,
      end_time: entry.endTime,
      route_name: entry.route,
      status: entry.status,
      progress: entry.progress,
    };
  }

  static toPersistenceSchedule(schedule: Schedule): any {
    return {
      id: schedule.id,
      week_start: schedule.week_start,
      week_end: schedule.week_end,
      status: schedule.status || "active",
      created_at: schedule.created_at || new Date().toISOString(),
    };
  }
}
