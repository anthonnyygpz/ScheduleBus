import { Employee } from "../entities/employee.type";
import { ScheduleEntry } from "../entities/schedule.type";
// import { SHIFT_TIMES } from "../entities/shifts.type";
// import { ShiftType } from "../entities/types.type";

export class ScheduleEngine {
  static generateWeeklyEntries(
    employees: Employee[],
    weekStart: Date,
    idGenerator: () => string,
  ): ScheduleEntry[] {
    const entries: ScheduleEntry[] = [];

    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(weekStart);
      currentDate.setDate(weekStart.getDate() + i);
      const dateStr = currentDate.toISOString().split("T")[0];

      employees.forEach((employee) => {
        // if (!employee.active) return;
        //
        // employee.availability.forEach((avail) => {
        //   const shiftKey = avail as ShiftType;
        //   const timeConfig = SHIFT_TIMES[shiftKey];
        //
        //   // Aplicamos el principio de Snapshot:
        //   // Copiamos datos del empleado a la entrada para persistencia histórica
        //   entries.push({
        //     id: idGenerator(),
        //     employeeId: employee.id,
        //     employeeName: employee.name,
        //     group: employee.group as any,
        //     date: dateStr,
        //     shift: shiftKey,
        //     startTime: timeConfig.start,
        //     endTime: timeConfig.end,
        //     // Asignamos ruta: usamos la primera preferida o una por defecto
        //     route: employee.preferredRoutes?.[0] || "Ruta General",
        //     status: "scheduled", // Iniciamos en scheduled según tu interfaz
        //     progress: 0,
        //   });
        // });
      });
    }

    return entries;
  }
}
