import type { GroupType, ShiftType } from "./types.type.ts";

export interface ScheduleEntry {
  id: string;
  employeeId: string;
  employeeName: string; // Snapshot del nombre
  group: GroupType; // Snapshot del grupo
  date: string;
  shift: ShiftType;
  startTime: string;
  endTime: string;
  route: string; // Asignación de ruta
  status: "pending" | "scheduled" | "active" | "completed" | "absent";
  progress: number;
}

export interface Schedule {
  id: string;
  weekStart: string;
  weekEnd?: string;
  entries: ScheduleEntry[];
  createdAt?: string;
  status?: "draft" | "active" | "completed";
}
