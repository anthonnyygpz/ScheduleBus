import { ScheduleRepository } from "@/application/repositories/schedule.repository";
import { createClient } from "../utils/supabase/server";
import { Schedule } from "@/core/entities/schedule.type";
import { ScheduleMapper } from "../mappers/schedule.mapper";

export class SupabaseScheduleRepository implements ScheduleRepository {
  async getCurrent(): Promise<Schedule | null> {
    const supabase = await createClient();

    const { data: scheduleData, error: scheduleError } = await supabase
      .from("schedules")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (scheduleError) {
      console.error("[Database Error]:", scheduleError);
      throw new Error("Error al obtener el horario actual.");
    }

    if (!scheduleData) return null;

    // 2. Obtenemos sus entradas (entries)
    const { data: entriesData, error: entriesError } = await supabase
      .from("schedule_entries")
      .select("*")
      .eq("schedule_id", scheduleData.id);

    if (entriesError) {
      console.error("[Database Error]:", entriesError);
      throw new Error("Error al obtener las entradas del horario.");
    }

    return ScheduleMapper.toDomain(scheduleData, entriesData);
  }

  async findByWeekStart(weekStart: string): Promise<Schedule | null> {
    const supabase = await createClient();

    const { data: scheduleData, error: scheduleError } = await supabase
      .from("schedules")
      .select("*")
      .eq("week_start", weekStart)
      .limit(1)
      .maybeSingle();

    if (scheduleError)
      throw new Error("Error al obtener el horario por fecha.");

    if (!scheduleData) return null;

    const { data: entriesData } = await supabase
      .from("schedule_entries")
      .select("*")
      .eq("schedule_id", scheduleData.id);

    return ScheduleMapper.toDomain(scheduleData, entriesData || []);
  }

  async save(schedule: Schedule): Promise<void> {
    const supabase = await createClient();

    const { error: scheduleError } = await supabase.from("schedules").upsert({
      id: schedule.id,
      week_start: schedule.week_start,
      week_end: schedule.week_end,
      status: schedule.status || "active",
      created_at: schedule.created_at || new Date().toISOString(),
    });

    if (scheduleError)
      throw new Error(`Error al guardar cabecera: ${scheduleError.message}`);

    const entriesToSave = schedule.entries.map((entry) => ({
      id: entry.id,
      schedule_id: schedule.id,
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

    await supabase
      .from("schedule_entries")
      .delete()
      .eq("schedule_id", schedule.id);

    const { error: entriesError } = await supabase
      .from("schedule_entries")
      .insert(entriesToSave);

    if (entriesError) {
      console.error("[Database Error]:", entriesError);
      throw new Error("No se pudieron guardar las entradas del horario.");
    }
  }
}
