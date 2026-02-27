import { ScheduleEntry } from "@/core/entities/schedule.type";
import type { Status } from "@/core/entities/types.type";

export class ProgressService {
  calculateStatusAndProgress(
    entry: ScheduleEntry,
    now: Date,
  ): { status: Status; progress: number } {
    const todayStr = now.toISOString().split("T")[0];
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    if (entry.date < todayStr) return { status: "completed", progress: 100 };
    if (entry.date > todayStr) return { status: "pending", progress: 0 };

    const [startH, startM] = entry.startTime.split(":").map(Number);
    const [endH, endM] = entry.endTime.split(":").map(Number);
    let startTotal = startH * 60 + startM;
    let endTotal = endH * 60 + endM;
    if (endTotal < startTotal) endTotal += 1440;

    if (currentMinutes >= endTotal)
      return { status: "completed", progress: 100 };
    if (currentMinutes >= startTotal) {
      const elapsed = currentMinutes - startTotal;
      const progress = Math.min(
        98,
        Math.round((elapsed / (endTotal - startTotal)) * 100),
      );
      return { status: "active", progress };
    }

    return { status: "pending", progress: 0 };
  }
}
