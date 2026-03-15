import { ScheduleEntry } from "@/core/entities/schedule.type";
import type { Status } from "@/core/entities/types.type";

export class ProgressService {
  calculateStatusAndProgress(
    entry: ScheduleEntry,
    now: Date,
  ): { status: Status; progress: number } {
    // Reemplazamos toISOString() por métodos locales para evitar el desfasaje UTC
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const todayStr = `${year}-${month}-${day}`;

    // Obtenemos los minutos en la hora local
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    if (entry.date < todayStr) return { status: "completed", progress: 100 };
    if (entry.date > todayStr) return { status: "pending", progress: 0 };

    const [startH, startM] = entry.startTime.split(":").map(Number);
    const [endH, endM] = entry.endTime.split(":").map(Number);
    const startTotal = startH * 60 + startM;
    const endTotal = endH * 60 + endM;

    // Ya no sumamos 1440 porque el motor garantiza que endTotal <= 1320 (22:00)
    if (currentMinutes >= endTotal)
      return { status: "completed", progress: 100 };

    if (currentMinutes >= startTotal) {
      const elapsed = currentMinutes - startTotal;
      const duration = endTotal - startTotal;
      const progress = Math.min(99, Math.round((elapsed / duration) * 100));
      return { status: "active", progress };
    }

    return { status: "pending", progress: 0 };
  }
}
