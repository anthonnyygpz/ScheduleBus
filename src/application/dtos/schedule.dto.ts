import { ScheduleEntry } from "@/core/entities/schedule.type";

export interface GenerateScheduleRequestDto {
  id: string;
  weekStart: string;
  entries: ScheduleEntry[];
  createdAt?: string;
  status?: "draft" | "active";
}

export class ScheduleResponseDto {
  public readonly id: string;
  public readonly weekStart: string;
  public readonly weekEnd?: string;
  public readonly entries: ScheduleEntry[];
  public readonly status: string;
  public readonly progress: number;
  public readonly createdAt?: string;

  constructor(props: ScheduleResponseDto) {
    this.id = props.id;
    this.weekStart = props.weekStart;
    this.weekEnd = props.weekEnd;
    this.entries = props.entries;
    this.status = props.status;
    this.progress = props.progress;
    this.createdAt = props.createdAt;
  }
}
