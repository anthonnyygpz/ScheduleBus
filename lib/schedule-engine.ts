import type { Employee, ScheduleEntry, ShiftType, Schedule } from "./types"
import { ROUTES, SHIFT_CONFIG } from "./types"

function generateId(): string {
  return Math.random().toString(36).substring(2, 11)
}

/**
 * Schedule Generation Algorithm:
 * 1. Distributes employees across shifts based on availability
 * 2. Balances workload to not exceed max hours per week
 * 3. Assigns routes evenly
 * 4. Avoids back-to-back night-to-morning shifts
 */
export function generateSchedule(
  employees: Employee[],
  weekStart: Date,
  daysCount: number = 7
): Schedule {
  const entries: ScheduleEntry[] = []
  const hoursTracker: Record<string, number> = {}
  const lastShiftTracker: Record<string, ShiftType | null> = {}

  employees.forEach((emp) => {
    hoursTracker[emp.id] = 0
    lastShiftTracker[emp.id] = null
  })

  const shifts: ShiftType[] = ["morning", "afternoon", "night"]
  let routeIndex = 0

  for (let day = 0; day < daysCount; day++) {
    const date = new Date(weekStart)
    date.setDate(date.getDate() + day)
    const dateStr = date.toISOString().split("T")[0]

    for (const shift of shifts) {
      const availableEmployees = employees
        .filter((emp) => {
          if (!emp.availability.includes(shift)) return false
          if (hoursTracker[emp.id] >= emp.maxHoursPerWeek) return false
          // Avoid night -> morning transition
          if (shift === "morning" && lastShiftTracker[emp.id] === "night") return false
          return true
        })
        .sort((a, b) => hoursTracker[a.id] - hoursTracker[b.id])

      // Assign up to 3 employees per shift per day
      const toAssign = Math.min(availableEmployees.length, 3)

      for (let i = 0; i < toAssign; i++) {
        const emp = availableEmployees[i]
        const config = SHIFT_CONFIG[shift]
        const route = ROUTES[routeIndex % ROUTES.length]
        routeIndex++

        entries.push({
          id: generateId(),
          employeeId: emp.id,
          date: dateStr,
          shift,
          startTime: config.start,
          endTime: config.end,
          route,
          status: "scheduled",
          progress: 0,
        })

        hoursTracker[emp.id] += 8
        lastShiftTracker[emp.id] = shift
      }
    }
  }

  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekEnd.getDate() + daysCount - 1)

  return {
    id: generateId(),
    weekStart: weekStart.toISOString().split("T")[0],
    weekEnd: weekEnd.toISOString().split("T")[0],
    entries,
    createdAt: new Date().toISOString(),
    status: "active",
  }
}

/**
 * Auto-restructure: when an employee is absent,
 * find the best replacement from available employees
 */
export function restructureForAbsence(
  schedule: Schedule,
  absentEmployeeId: string,
  date: string,
  employees: Employee[]
): { updatedSchedule: Schedule; replacements: Array<{ originalEntry: ScheduleEntry; replacementId: string }> } {
  const replacements: Array<{ originalEntry: ScheduleEntry; replacementId: string }> = []

  const updatedEntries = schedule.entries.map((entry) => {
    if (entry.employeeId === absentEmployeeId && entry.date === date) {
      // Find replacement
      const assignedToday = schedule.entries
        .filter((e) => e.date === date && e.shift === entry.shift && e.employeeId !== absentEmployeeId)
        .map((e) => e.employeeId)

      const candidates = employees
        .filter((emp) => {
          if (emp.id === absentEmployeeId) return false
          if (assignedToday.includes(emp.id)) return false
          if (!emp.availability.includes(entry.shift)) return false
          return true
        })
        .sort((a, b) => {
          // Prefer employees with fewer hours assigned
          const aHours = schedule.entries.filter((e) => e.employeeId === a.id).length * 8
          const bHours = schedule.entries.filter((e) => e.employeeId === b.id).length * 8
          return aHours - bHours
        })

      if (candidates.length > 0) {
        const replacement = candidates[0]
        replacements.push({ originalEntry: entry, replacementId: replacement.id })
        return {
          ...entry,
          employeeId: replacement.id,
          status: "scheduled" as const,
        }
      }

      return { ...entry, status: "absent" as const }
    }
    return entry
  })

  return {
    updatedSchedule: { ...schedule, entries: updatedEntries },
    replacements,
  }
}

/**
 * Simulate real-time progress based on current time
 */
export function calculateProgress(entry: ScheduleEntry): number {
  const now = new Date()
  const today = now.toISOString().split("T")[0]

  if (entry.date !== today) {
    return entry.date < today ? 100 : 0
  }

  const [startH, startM] = entry.startTime.split(":").map(Number)
  const [endH, endM] = entry.endTime.split(":").map(Number)

  let startMinutes = startH * 60 + startM
  let endMinutes = endH * 60 + endM
  const nowMinutes = now.getHours() * 60 + now.getMinutes()

  // Handle night shift crossing midnight
  if (endMinutes < startMinutes) {
    endMinutes += 24 * 60
    const adjustedNow = nowMinutes < startMinutes ? nowMinutes + 24 * 60 : nowMinutes
    const total = endMinutes - startMinutes
    const elapsed = adjustedNow - startMinutes
    return Math.max(0, Math.min(100, Math.round((elapsed / total) * 100)))
  }

  const total = endMinutes - startMinutes
  const elapsed = nowMinutes - startMinutes
  return Math.max(0, Math.min(100, Math.round((elapsed / total) * 100)))
}

/**
 * Parse employee list from plain text
 * Format: Name, Role, Skills (comma-separated)
 */
export function parseEmployeesFromText(text: string): Employee[] {
  const lines = text.trim().split("\n").filter((l) => l.trim())
  return lines.map((line, index) => {
    const parts = line.split("|").map((p) => p.trim())
    const name = parts[0] || `Empleado ${index + 1}`
    const role = parts[1] || "General"
    const skillsStr = parts[2] || ""
    const skills = skillsStr ? skillsStr.split(",").map((s) => s.trim()) : ["General"]

    const allShifts: ShiftType[] = ["morning", "afternoon", "night"]
    // Randomly assign 2-3 available shifts
    const shuffled = allShifts.sort(() => Math.random() - 0.5)
    const availability = shuffled.slice(0, 2 + Math.floor(Math.random() * 2))

    return {
      id: generateId(),
      name,
      role,
      email: `${name.toLowerCase().replace(/\s+/g, ".")}@empresa.com`,
      phone: `+52 ${Math.floor(1000000000 + Math.random() * 9000000000)}`,
      skills,
      maxHoursPerWeek: 48,
      availability,
    }
  })
}
