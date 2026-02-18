import type { Employee, Schedule, AbsenceRecord, ShiftType } from "./types"
import { generateSchedule, restructureForAbsence } from "./schedule-engine"

function generateId(): string {
  return Math.random().toString(36).substring(2, 11)
}

const SAMPLE_EMPLOYEES: Employee[] = [
  {
    id: "emp1",
    name: "Carlos Martinez",
    role: "Conductor Senior",
    email: "carlos.martinez@empresa.com",
    phone: "+52 5512345678",
    skills: ["Conduccion", "Mantenimiento"],
    maxHoursPerWeek: 48,
    availability: ["morning", "afternoon"],
  },
  {
    id: "emp2",
    name: "Maria Lopez",
    role: "Conductora",
    email: "maria.lopez@empresa.com",
    phone: "+52 5523456789",
    skills: ["Conduccion", "Atencion al cliente"],
    maxHoursPerWeek: 40,
    availability: ["morning", "afternoon"],
  },
  {
    id: "emp3",
    name: "Juan Rodriguez",
    role: "Conductor",
    email: "juan.rodriguez@empresa.com",
    phone: "+52 5534567890",
    skills: ["Conduccion"],
    maxHoursPerWeek: 48,
    availability: ["afternoon", "night"],
  },
  {
    id: "emp4",
    name: "Ana Garcia",
    role: "Supervisora",
    email: "ana.garcia@empresa.com",
    phone: "+52 5545678901",
    skills: ["Supervision", "Conduccion", "Logistica"],
    maxHoursPerWeek: 40,
    availability: ["morning", "afternoon", "night"],
  },
  {
    id: "emp5",
    name: "Pedro Sanchez",
    role: "Conductor",
    email: "pedro.sanchez@empresa.com",
    phone: "+52 5556789012",
    skills: ["Conduccion", "Primeros auxilios"],
    maxHoursPerWeek: 48,
    availability: ["morning", "night"],
  },
  {
    id: "emp6",
    name: "Laura Hernandez",
    role: "Conductora Senior",
    email: "laura.hernandez@empresa.com",
    phone: "+52 5567890123",
    skills: ["Conduccion", "Capacitacion"],
    maxHoursPerWeek: 40,
    availability: ["morning", "afternoon"],
  },
  {
    id: "emp7",
    name: "Diego Torres",
    role: "Conductor",
    email: "diego.torres@empresa.com",
    phone: "+52 5578901234",
    skills: ["Conduccion"],
    maxHoursPerWeek: 48,
    availability: ["afternoon", "night"],
  },
  {
    id: "emp8",
    name: "Sofia Ramirez",
    role: "Conductora",
    email: "sofia.ramirez@empresa.com",
    phone: "+52 5589012345",
    skills: ["Conduccion", "Atencion al cliente"],
    maxHoursPerWeek: 40,
    availability: ["morning", "afternoon", "night"],
  },
  {
    id: "emp9",
    name: "Miguel Flores",
    role: "Conductor",
    email: "miguel.flores@empresa.com",
    phone: "+52 5590123456",
    skills: ["Conduccion", "Mantenimiento"],
    maxHoursPerWeek: 48,
    availability: ["night", "morning"],
  },
  {
    id: "emp10",
    name: "Isabella Cruz",
    role: "Supervisora",
    email: "isabella.cruz@empresa.com",
    phone: "+52 5501234567",
    skills: ["Supervision", "Conduccion", "Logistica"],
    maxHoursPerWeek: 40,
    availability: ["morning", "afternoon", "night"],
  },
  {
    id: "emp11",
    name: "Roberto Diaz",
    role: "Conductor",
    email: "roberto.diaz@empresa.com",
    phone: "+52 5512340001",
    skills: ["Conduccion"],
    maxHoursPerWeek: 48,
    availability: ["morning", "afternoon"],
  },
  {
    id: "emp12",
    name: "Carmen Morales",
    role: "Conductora",
    email: "carmen.morales@empresa.com",
    phone: "+52 5512340002",
    skills: ["Conduccion", "Primeros auxilios"],
    maxHoursPerWeek: 40,
    availability: ["afternoon", "night"],
  },
]

// In-memory store (simulating database)
let employees: Employee[] = [...SAMPLE_EMPLOYEES]
let currentSchedule: Schedule | null = null
let absences: AbsenceRecord[] = []

// Initialize with a schedule for the current week
function getMonday(d: Date): Date {
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  return new Date(d.setDate(diff))
}

function initializeSchedule() {
  const monday = getMonday(new Date())
  currentSchedule = generateSchedule(employees, monday)

  // Simulate some active/completed entries for today
  const today = new Date().toISOString().split("T")[0]
  const now = new Date()
  const currentHour = now.getHours()

  currentSchedule.entries = currentSchedule.entries.map((entry) => {
    if (entry.date === today) {
      const [startH] = entry.startTime.split(":").map(Number)
      const [endH] = entry.endTime.split(":").map(Number)

      if (entry.shift === "night") {
        if (currentHour >= 22 || currentHour < 6) {
          return { ...entry, status: "active" as const, progress: Math.floor(Math.random() * 60) + 20 }
        }
        return currentHour >= 6 ? { ...entry, status: "completed" as const, progress: 100 } : entry
      }

      if (currentHour >= startH && currentHour < endH) {
        const total = endH - startH
        const elapsed = currentHour - startH
        const progress = Math.min(95, Math.round((elapsed / total) * 100) + Math.floor(Math.random() * 10))
        return { ...entry, status: "active" as const, progress }
      }

      if (currentHour >= endH) {
        return { ...entry, status: "completed" as const, progress: 100 }
      }
    }

    if (entry.date < today) {
      return { ...entry, status: "completed" as const, progress: 100 }
    }

    return entry
  })
}

initializeSchedule()

// Store API
export const store = {
  getEmployees: (): Employee[] => [...employees],

  addEmployee: (emp: Omit<Employee, "id">): Employee => {
    const newEmp = { ...emp, id: generateId() }
    employees.push(newEmp)
    return newEmp
  },

  addEmployees: (newEmployees: Omit<Employee, "id">[]): Employee[] => {
    const created = newEmployees.map((emp) => ({
      ...emp,
      id: generateId(),
    }))
    employees.push(...created)
    return created
  },

  removeEmployee: (id: string): void => {
    employees = employees.filter((e) => e.id !== id)
  },

  getSchedule: (): Schedule | null => currentSchedule,

  generateNewSchedule: (weekStart?: Date): Schedule => {
    const start = weekStart || getMonday(new Date())
    currentSchedule = generateSchedule(employees, start)
    return currentSchedule
  },

  reportAbsence: (
    employeeId: string,
    date: string,
    reason: string
  ): { absence: AbsenceRecord; replacements: Array<{ originalEntry: import("./types").ScheduleEntry; replacementId: string }> } | null => {
    if (!currentSchedule) return null

    const { updatedSchedule, replacements } = restructureForAbsence(
      currentSchedule,
      employeeId,
      date,
      employees
    )
    currentSchedule = updatedSchedule

    const absence: AbsenceRecord = {
      id: generateId(),
      employeeId,
      date,
      reason,
      replacementId: replacements[0]?.replacementId,
      originalEntryId: replacements[0]?.originalEntry.id || "",
      createdAt: new Date().toISOString(),
    }
    absences.push(absence)

    return { absence, replacements }
  },

  getAbsences: (): AbsenceRecord[] => [...absences],

  getEmployeeById: (id: string): Employee | undefined =>
    employees.find((e) => e.id === id),

  getActiveEntries: (): import("./types").ScheduleEntry[] => {
    if (!currentSchedule) return []
    const today = new Date().toISOString().split("T")[0]
    return currentSchedule.entries.filter(
      (e) => e.date === today && (e.status === "active" || e.status === "scheduled")
    )
  },

  resetToSample: (): void => {
    employees = [...SAMPLE_EMPLOYEES]
    initializeSchedule()
    absences = []
  },
}
