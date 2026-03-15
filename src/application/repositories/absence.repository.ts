import { AbsenceRecord } from "@/core/entities/absence.type";

export interface AbsenceRepository {
  findByDateRange(startDate: string, endDate: string): Promise<AbsenceRecord[]>;
  save(absence: Omit<AbsenceRecord, "id" | "createdAt">): Promise<void>;
  delete(id: string): Promise<void>;
}
