export type Status = "active" | "completed" | "pending" | "absent";

export interface IRoute {
  id: number;
  name: string;
}

export interface IGroup {
  id: number;
  name: string;
  hours: number;
}
