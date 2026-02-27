export type Status = "active" | "completed" | "pending" | "absent";
export type GroupType = "A" | "B" | "C";
export type ShiftType = "morning" | "afternoon" | "night";

export interface IRoute {
  id: number;
  name: string;
}

export interface IGroup {
  id: number;
  name: string;
  hours: number;
}
