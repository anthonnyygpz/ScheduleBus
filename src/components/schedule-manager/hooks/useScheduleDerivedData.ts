import { useMemo } from "react";
import { ScheduleEntry } from "@/core/entities/schedule.type";
import { ScheduleResponseDto } from "@/application/dtos/schedule.dto";
import { GroupResponseDto } from "@/application/dtos/group.dto";

export const getTuesday = (d: Date): Date => {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day <= 2 ? 2 : 9);
  const tuesday = new Date(date.setDate(diff));
  tuesday.setHours(0, 0, 0, 0);
  return tuesday;
};

export function useScheduleDerivedData(
  schedule: ScheduleResponseDto | undefined,
  groups: GroupResponseDto[],
) {
  const startDate = useMemo(
    () => (schedule ? new Date(schedule.weekStart) : getTuesday(new Date())),
    [schedule],
  );

  const days = useMemo(() => {
    if (!startDate || isNaN(new Date(startDate).getTime())) {
      return [];
    }

    const dates = [];
    const baseDate = new Date(startDate);

    for (let i = 0; i < 7; i++) {
      const d = new Date(baseDate);
      d.setDate(baseDate.getDate() + i);

      dates.push({
        iso: d.toISOString().split("T")[0],
        label: `${["Mar", "Mie", "Jue", "Vie", "Sab", "Dom", "Lun"][i]} ${d.getDate()}/${d.getMonth() + 1}`,
      });
    }
    return dates;
  }, [startDate]);

  const timeSlots = useMemo(() => {
    const slots = [];
    const startMinutes = 5 * 60 + 30; // 330 minutos
    const endMinutes = 22 * 60; // 1320 minutos

    for (let min = startMinutes; min <= endMinutes; min += 30) {
      const hh = Math.floor(min / 60);
      const mm = min % 60;
      const timeString = `${hh.toString().padStart(2, "0")}:${mm.toString().padStart(2, "0")}`;
      slots.push(timeString);
    }
    return slots;
  }, []);

  const entriesByRoute = useMemo(() => {
    const map = new Map<string, Map<string, ScheduleEntry[]>>();

    (schedule?.entries || []).forEach((entry: ScheduleEntry) => {
      if (!map.has(entry.route)) map.set(entry.route, new Map());

      const routeDays = map.get(entry.route)!;
      if (!routeDays.has(entry.date)) routeDays.set(entry.date, []);

      routeDays.get(entry.date)!.push(entry);
    });

    return map;
  }, [schedule]);

  const groupsMap = useMemo(() => {
    const map: Record<string, { hours: number; color: string }> = {};
    groups.forEach((g) => {
      map[g.name] = {
        hours: g.hours,
        color: g.color || "border-l-primary bg-primary/10 text-primary",
      };
    });
    return map;
  }, [groups]);

  return {
    startDate,
    days,
    timeSlots,
    entriesByRoute,
    groupsMap,
  };
}
