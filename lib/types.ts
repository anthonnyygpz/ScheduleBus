export type GroupType = "A" | "B" | "C";
export type ShiftType = "morning" | "afternoon" | "night";

export const GROUP_CONFIG = {
  A: { hours: 10, label: "Grupo A" },
  B: { hours: 8, label: "Grupo B" },
  C: { hours: 6, label: "Grupo C" },
} as const;

export interface Employee {
  id: string;
  name: string;
  group: GroupType;
  email: string;
  phone: string;
  preferredRoutes: string[];
  skills: string[];
  maxHoursPerDay: number;
  active: boolean;
  availability: ShiftType[];
}

export interface ScheduleEntry {
  id: string;
  employeeId: string;
  employeeName: string;
  group: GroupType;
  date: string;
  shift: ShiftType;
  startTime: string;
  endTime: string;
  route: string;
  status: "scheduled" | "active" | "completed" | "absent";
  progress: number;
}

export interface Schedule {
  id: string;
  weekStart: string;
  weekEnd: string;
  entries: ScheduleEntry[];
  createdAt: string;
  status: "draft" | "active" | "completed";
}

export interface AbsenceRecord {
  id: string;
  employeeId: string;
  date: string;
  reason: string;
  replacementId?: string;
  originalEntryId: string;
  createdAt: string;
}

export const SHIFT_CONFIG: Record<
  ShiftType,
  { label: string; start: string; end: string; color: string }
> = {
  morning: {
    label: "Matutino",
    start: "06:00",
    end: "14:00",
    color: "chart-1",
  },
  afternoon: {
    label: "Vespertino",
    start: "14:00",
    end: "22:00",
    color: "chart-2",
  },
  night: { label: "Nocturno", start: "22:00", end: "06:00", color: "chart-5" },
};

export const ROUTES = [
  "Ruta Norte A",
  "Ruta Norte B",
  "Ruta Sur A",
  "Ruta Sur B",
  "Ruta Centro",
  "Ruta Express",
];
