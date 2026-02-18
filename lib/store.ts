import type { AbsenceRecord, Employee, Schedule, ScheduleEntry } from "./types";
import { generateSchedule, restructureForAbsence } from "./schedule-engine";

function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}
export function getTuesday(d: Date): Date {
  const date = new Date(d);
  const day = date.getDay();
  // Ajuste para encontrar el próximo martes (2) o el actual
  const diff = date.getDate() - day + (day <= 2 ? 2 : 9);
  const tuesday = new Date(date.setDate(diff));
  tuesday.setHours(0, 0, 0, 0);
  return tuesday;
}

const SAMPLE_EMPLOYEES: Employee[] = [
  {
    id: "emp1",
    name: "Carlos Martinez",
    group: "A",
    email: "carlos.martinez@empresa.com",
    phone: "+52 5512345678",
    preferredRoutes: ["Ruta Norte", "Ruta Este"],
    skills: ["Ruta Norte", "Ruta Este"],
    active: true,
    maxHoursPerDay: 10,
    availability: ["morning", "afternoon"],
  },
  {
    id: "emp2",
    name: "Maria Lopez",
    group: "B",
    email: "maria.lopez@empresa.com",
    phone: "+52 5523456789",
    preferredRoutes: ["Ruta Sur", "Ruta Oeste"],
    skills: ["Ruta Sur", "Ruta Oeste"],
    active: true,
    maxHoursPerDay: 8,
    availability: ["morning", "afternoon"],
  },
  {
    id: "emp3",
    name: "Juan Rodriguez",
    group: "C",
    email: "juan.rodriguez@empresa.com",
    phone: "+52 5534567890",
    preferredRoutes: ["Ruta Este"],
    skills: ["Ruta Este"],
    active: true,
    maxHoursPerDay: 6,
    availability: ["afternoon", "night"],
  },
  {
    id: "emp4",
    name: "Ana Garcia",
    group: "A",
    email: "ana.garcia@empresa.com",
    phone: "+52 5545678901",
    preferredRoutes: ["Ruta Norte", "Ruta Este", "Sur"],
    skills: ["Ruta Norte", "Ruta Este", "Sur"],
    active: true,
    maxHoursPerDay: 10,
    availability: ["morning", "afternoon", "night"],
  },
  {
    id: "emp5",
    name: "Pedro Sanchez",
    group: "B",
    email: "pedro.sanchez@empresa.com",
    phone: "+52 5556789012",
    preferredRoutes: ["Ruta Norte", "Ruta Sur"],
    skills: ["Ruta Norte", "Ruta Sur"],
    active: true,
    maxHoursPerDay: 8,
    availability: ["morning", "night"],
  },
  {
    id: "emp6",
    name: "Laura Hernandez",
    group: "B",
    email: "laura.hernandez@empresa.com",
    phone: "+52 5567890123",
    skills: ["Ruta Norte", "Ruta Sur"],
    preferredRoutes: ["Ruta Norte", "Ruta Sur"],
    active: true,
    maxHoursPerDay: 8,
    availability: ["morning", "afternoon"],
  },
  {
    id: "emp7",
    name: "Diego Torres",
    group: "C",
    email: "diego.torres@empresa.com",
    phone: "+52 5578901234",
    skills: ["Ruta Sur", "Ruta Oeste"],
    preferredRoutes: ["Ruta Sur", "Ruta Oeste"],
    active: true,
    maxHoursPerDay: 6,
    availability: ["afternoon", "night"],
  },
  {
    id: "emp8",
    name: "Sofia Ramirez",
    group: "B",
    email: "sofia.ramirez@empresa.com",
    phone: "+52 5589012345",
    skills: ["Ruta Sur", "Ruta Oeste"],
    preferredRoutes: ["Ruta Sur", "Ruta Oeste"],
    active: true,
    maxHoursPerDay: 8,
    availability: ["morning", "afternoon", "night"],
  },
  {
    id: "emp9",
    name: "Miguel Flores",
    group: "A",
    email: "miguel.flores@empresa.com",
    phone: "+52 5590123456",
    skills: ["Ruta Sur", "Ruta Oeste"],
    preferredRoutes: ["Ruta Sur", "Ruta Oeste"],
    active: true,
    maxHoursPerDay: 10,
    availability: ["night", "morning"],
  },
  {
    id: "emp10",
    name: "Isabella Cruz",
    group: "A",
    email: "isabella.cruz@empresa.com",
    phone: "+52 5501234567",
    skills: ["Ruta Sur", "Ruta Oeste"],
    preferredRoutes: ["Ruta Sur", "Ruta Oeste"],
    active: true,
    maxHoursPerDay: 10,
    availability: ["morning", "afternoon", "night"],
  },
  {
    id: "emp11",
    name: "Antonio Cruz",
    group: "A",
    email: "isabella.cruz@empresa.com",
    phone: "+52 5501234567",
    skills: ["Ruta Norte", "Ruta Este"],
    preferredRoutes: ["Ruta Norte", "Ruta Este"],
    active: true,
    maxHoursPerDay: 10,
    availability: ["morning", "afternoon", "night"],
  },
  {
    id: "emp12",
    name: "Isabella Cruz",
    group: "A",
    email: "isabella.cruz@empresa.com",
    phone: "+52 5501234567",
    skills: ["Ruta Norte", "Ruta Este"],
    preferredRoutes: ["Ruta Norte", "Ruta Este"],
    active: true,
    maxHoursPerDay: 10,
    availability: ["morning", "afternoon", "night"],
  },
];

// In-memory store (simulating database)
let employees: Employee[] = [...SAMPLE_EMPLOYEES];
let currentSchedule: Schedule | null = null;
let absences: AbsenceRecord[] = [];

// Initialize with a schedule for the current week
function getMonday(d: Date): Date {
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
}

function initializeSchedule() {
  const monday = getMonday(new Date());
  currentSchedule = generateSchedule(employees, monday);

  const todayStr = new Date().toISOString().split("T")[0];
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  currentSchedule.entries = currentSchedule.entries.map((entry) => {
    // Si la fecha es anterior a hoy, marcar como completado
    if (entry.date < todayStr) {
      return { ...entry, status: "completed" as const, progress: 100 };
    }

    // Lógica para el día de hoy
    if (entry.date === todayStr) {
      const [startH, startM] = entry.startTime.split(":").map(Number);
      const [endH, endM] = entry.endTime.split(":").map(Number);

      const startTotal = startH * 60 + startM;
      let endTotal = endH * 60 + endM;

      // Manejo de turnos que cruzan la medianoche
      if (endTotal < startTotal) endTotal += 1440;

      if (currentMinutes >= startTotal && currentMinutes < endTotal) {
        const totalDuration = endTotal - startTotal;
        const elapsed = currentMinutes - startTotal;
        const progress = Math.min(
          98,
          Math.round((elapsed / totalDuration) * 100),
        );
        return { ...entry, status: "active" as const, progress };
      }

      if (currentMinutes >= endTotal) {
        return { ...entry, status: "completed" as const, progress: 100 };
      }
    }

    return entry;
  });
}

initializeSchedule();

// Store API

export const store = {
  getEmployees: () => [...employees],

  addEmployee: (emp: Omit<Employee, "id">) => {
    const newEmp = { ...emp, id: generateId() };
    employees.push(newEmp);
    return newEmp;
  },

  removeEmployee: (id: string) => {
    employees = employees.filter((e) => e.id !== id);
  },

  getSchedule: () => currentSchedule,

  /**
   * Genera y guarda el nuevo horario en el estado global del store
   */
  generateNewSchedule: (weekStart?: Date): Schedule => {
    const start = weekStart || getMonday(new Date());
    const newSchedule = generateSchedule(employees, start);
    currentSchedule = newSchedule; // IMPORTANTE: Actualizar la referencia global
    return newSchedule;
  },

  reportAbsence: (employeeId: string, date: string, reason: string) => {
    if (!currentSchedule) return null;

    const { updatedSchedule, replacements } = restructureForAbsence(
      currentSchedule,
      employeeId,
      date,
      employees,
    );

    currentSchedule = updatedSchedule;

    const absence: AbsenceRecord = {
      id: generateId(),
      employeeId,
      date,
      reason,
      replacementId: replacements[0]?.replacementId,
      originalEntryId: replacements[0]?.originalEntry.id || "",
      createdAt: new Date().toISOString(),
    };

    absences.push(absence);
    return { absence, replacements };
  },

  setSchedule: (schedule: Schedule) => {
    currentSchedule = schedule;
  },
  getAbsences: () => [...absences],

  getActiveEntries: (): ScheduleEntry[] => {
    if (!currentSchedule) return [];
    const today = new Date().toISOString().split("T")[0];
    return currentSchedule.entries.filter((e) => e.date === today);
  },

  resetToSample: () => {
    employees = [...SAMPLE_EMPLOYEES];
    absences = [];
    initializeSchedule();
  },
};
