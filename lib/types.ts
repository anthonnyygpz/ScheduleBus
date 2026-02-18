export type ShiftType = "morning" | "afternoon" | "night"

export interface Employee {
  id: string
  name: string
  role: string
  email: string
  phone: string
  skills: string[]
  maxHoursPerWeek: number
  availability: ShiftType[]
}

export interface ScheduleEntry {
  id: string
  employeeId: string
  date: string
  shift: ShiftType
  startTime: string
  endTime: string
  route: string
  status: "scheduled" | "active" | "completed" | "absent"
  progress: number
}

export interface Schedule {
  id: string
  weekStart: string
  weekEnd: string
  entries: ScheduleEntry[]
  createdAt: string
  status: "draft" | "active" | "completed"
}

export interface AbsenceRecord {
  id: string
  employeeId: string
  date: string
  reason: string
  replacementId?: string
  originalEntryId: string
  createdAt: string
}

export const SHIFT_CONFIG: Record<ShiftType, { label: string; start: string; end: string; color: string }> = {
  morning: { label: "Matutino", start: "06:00", end: "14:00", color: "chart-1" },
  afternoon: { label: "Vespertino", start: "14:00", end: "22:00", color: "chart-2" },
  night: { label: "Nocturno", start: "22:00", end: "06:00", color: "chart-5" },
}

export const ROUTES = [
  "Ruta Norte A",
  "Ruta Norte B",
  "Ruta Sur A",
  "Ruta Sur B",
  "Ruta Centro",
  "Ruta Este",
  "Ruta Oeste",
  "Ruta Express 1",
  "Ruta Express 2",
]
