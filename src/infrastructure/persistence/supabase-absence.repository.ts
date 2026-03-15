import { AbsenceRepository } from "@/application/repositories/absence.repository";
import { AbsenceRecord } from "@/core/entities/absence.type";
import { createClient } from "../utils/supabase/server";

export class SupabaseAbsenceRepository implements AbsenceRepository {
  async findByDateRange(
    startDate: string,
    endDate: string,
  ): Promise<AbsenceRecord[]> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("absences")
      .select("*")
      .gte("date", startDate)
      .lte("date", endDate);

    if (error) throw new Error(`Error al obtener ausencias: ${error.message}`);

    return (data || []).map((row) => ({
      id: row.id,
      employeeId: row.employee_id.toString(),
      date: row.date,
      reason: row.reason,
      replacementId: row.replacement_id?.toString(),
      originalEntryId: row.original_entry_id,
      createdAt: row.created_at,
    }));
  }

  async save(absence: Omit<AbsenceRecord, "id" | "createdAt">): Promise<void> {
    const supabase = await createClient();

    const { error } = await supabase.from("absences").insert({
      employee_id: parseInt(absence.employeeId),
      date: absence.date,
      reason: absence.reason,
      replacement_id: absence.replacementId
        ? parseInt(absence.replacementId)
        : null,
      original_entry_id: absence.originalEntryId,
    });

    if (error) throw new Error(`Error al guardar ausencia: ${error.message}`);
  }

  async delete(id: string): Promise<void> {
    const supabase = await createClient();
    const { error } = await supabase.from("absences").delete().eq("id", id);
    if (error) throw new Error(`Error al eliminar ausencia: ${error.message}`);
  }
}
