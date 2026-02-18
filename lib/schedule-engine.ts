import type {
  Employee,
  ScheduleEntry,
  ShiftType,
  Schedule,
  GroupType,
} from "./types";
import { ROUTES, SHIFT_CONFIG, GROUP_CONFIG } from "./types";

export function obtenerFechaStr(baseDate: Date, offsetDays: number): string {
  const d = new Date(baseDate);
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split("T")[0];
}

/**
 * Verifica si un empleado ya tiene una asignación en una fecha específica.
 */
function estaAsignadoEseDia(
  entries: ScheduleEntry[],
  employeeId: string,
  date: string,
): boolean {
  return entries.some((e) => e.employeeId === employeeId && e.date === date);
}
function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}

export function generateSchedule(
  employees: Employee[],
  weekStart: Date,
): Schedule {
  const entries: ScheduleEntry[] = [];
  const daysCount = 7;
  const hoursTracker: Record<string, number> = {};

  employees.forEach((emp) => (hoursTracker[emp.id] = 0));

  // Definimos los turnos para referencia interna si es necesario
  const shifts: ShiftType[] = ["morning", "afternoon", "night"]; // <-- FIX: Aquí se define la variable

  for (let day = 0; day < daysCount; day++) {
    const dateStr = obtenerFechaStr(weekStart, day);

    ROUTES.forEach((route) => {
      let horasCubiertasEnRuta = 0;
      // Combinación matemática perfecta: 10h (A) + 8h (B) + 6h (C) = 24h exactas
      const combinacionPiezas: GroupType[] = ["A", "B", "C"];

      combinacionPiezas.forEach((grupoNecesario) => {
        // Buscamos candidatos que tengan esta ruta como preferida y sean del grupo correcto
        const candidato = employees.find(
          (emp) =>
            emp.group === grupoNecesario &&
            emp.active &&
            (emp.preferredRoutes?.includes(route) || true) && // Prioriza ruta, pero permite otros para evitar huecos
            !estaAsignadoEseDia(entries, emp.id, dateStr),
        );

        if (candidato) {
          const configGrupo = GROUP_CONFIG[grupoNecesario];
          const horaInicio = horasCubiertasEnRuta;
          const horaFin = (horaInicio + configGrupo.hours) % 24;

          // Determinamos el shift (turno) basado en la hora de inicio
          const shiftType: ShiftType =
            horaInicio < 12
              ? "morning"
              : horaInicio < 18
                ? "afternoon"
                : "night";

          entries.push({
            id: Math.random().toString(36).substring(2, 11),
            employeeId: candidato.id,
            employeeName: candidato.name,
            group: candidato.group,
            date: dateStr,
            shift: shiftType,
            startTime: `${horaInicio.toString().padStart(2, "0")}:00`,
            endTime: `${horaFin.toString().padStart(2, "0")}:00`,
            route: route,
            status: "scheduled",
            progress: 0,
          });

          horasCubiertasEnRuta += configGrupo.hours;
          hoursTracker[candidato.id] += configGrupo.hours;
        }
      });
    });
  }

  return {
    id: Math.random().toString(36).substring(2, 11),
    weekStart: weekStart.toISOString().split("T")[0],
    weekEnd: obtenerFechaStr(weekStart, 6),
    entries,
    createdAt: new Date().toISOString(),
    status: "active",
  };
}

export function parseEmployeesFromText(text: string): Employee[] {
  const lines = text
    .trim()
    .split("\n")
    .filter((l) => l.trim());
  const groupOptions: GroupType[] = ["A", "B", "C"];

  return lines.map((line, index) => {
    const parts = line.split("|").map((p) => p.trim());
    const name = parts[0] || `Empleado ${index + 1}`;

    // Asignación de grupo aleatoria o basada en la entrada si existiera
    const group = groupOptions[Math.floor(Math.random() * groupOptions.length)];

    return {
      id: generateId(),
      name,
      group, // Sustituido role por group
      email: `${name.toLowerCase().replace(/\s+/g, ".")}@empresa.com`,
      phone: `+52 ${Math.floor(1000000000 + Math.random() * 9000000000)}`,
      preferredRoutes: "gene",
      skills: ["General"],
      active: true,
      availability: ["morning", "afternoon", "night"],
      maxHoursPerWeek: 48,
    };
  });
}

export function restructureForAbsence(
  schedule: Schedule,
  absentId: string,
  date: string,
  employees: Employee[],
): {
  updatedSchedule: Schedule;
  replacements: Array<{ originalEntry: ScheduleEntry; replacementId: string }>;
} {
  const replacements: Array<{
    originalEntry: ScheduleEntry;
    replacementId: string;
  }> = [];
  const originalEntry = schedule.entries.find(
    (e) => e.employeeId === absentId && e.date === date,
  );

  if (!originalEntry) return { updatedSchedule: schedule, replacements: [] };

  // Buscamos a alguien del MISMO grupo (mismas horas) que esté libre
  const replacement = employees.find(
    (emp) =>
      emp.group === originalEntry.group &&
      emp.active &&
      !estaAsignadoEseDia(schedule.entries, emp.id, date),
  );

  const updatedEntries = schedule.entries.map((entry) => {
    if (entry.employeeId === absentId && entry.date === date && replacement) {
      replacements.push({
        originalEntry: entry,
        replacementId: replacement.id,
      });
      return {
        ...entry,
        employeeId: replacement.id,
        employeeName: replacement.name,
        status: "scheduled" as const,
      };
    }
    return entry;
  });

  return {
    updatedSchedule: { ...schedule, entries: updatedEntries },
    replacements,
  };
}

export function calculateProgress(entry: ScheduleEntry): number {
  const now = new Date();
  const today = now.toISOString().split("T")[0];
  if (entry.date !== today) return entry.date < today ? 100 : 0;

  const [sH, sM] = entry.startTime.split(":").map(Number);
  const [eH, eM] = entry.endTime.split(":").map(Number);
  const start = sH * 60 + sM;
  let end = eH * 60 + eM;
  if (end <= start) end += 1440; // Ajuste para 24h

  const nowM = now.getHours() * 60 + now.getMinutes();
  return Math.max(
    0,
    Math.min(100, Math.round(((nowM - start) / (end - start)) * 100)),
  );
}
