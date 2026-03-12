export type ScheduleStatus =
  | "pending"
  | "scheduled"
  | "active"
  | "completed"
  | "absent";

export class ScheduleEntry {
  constructor(
    public readonly id: string,
    public readonly employeeId: string,
    public readonly employeeName: string,
    public readonly group: string,
    public readonly date: string,
    public readonly startTime: string,
    public readonly endTime: string,
    public readonly route: string,
    public status: ScheduleStatus = "scheduled",
    public progress: number = 0,
  ) {}

  isActive(now: Date = new Date()): boolean {
    const today = now.toISOString().split("T")[0];
    if (this.date !== today) return false;

    const currentStr =
      now.getHours().toString().padStart(2, "0") +
      ":" +
      now.getMinutes().toString().padStart(2, "0");
    return currentStr >= this.startTime && currentStr <= this.endTime;
  }
}

export class Schedule {
  constructor(
    public readonly id: string,
    public readonly week_start: string,
    public entries: ScheduleEntry[],
    public status: "draft" | "active" | "completed" = "active",
    public readonly created_at?: string,
    public week_end?: string,
  ) {
    if (!week_end) {
      this.week_end = this.calculateWeekEnd(week_start);
    }
  }

  private calculateWeekEnd(start: string): string {
    const date = new Date(start);
    date.setDate(date.getDate() + 6);
    return date.toISOString().split("T")[0];
  }

  getTotalProgress(): number {
    if (this.entries.length === 0) return 0;
    const sum = this.entries.reduce((acc, entry) => acc + entry.progress, 0);
    return Math.round(sum / this.entries.length);
  }
}
