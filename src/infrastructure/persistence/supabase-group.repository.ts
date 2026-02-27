import { Group } from "@/core/entities/group.type";
import { createClient } from "../utils/supabase/server";
import { GroupMapper } from "../mappers/group.mapper";

export class SupabaseGroupRepository {
  constructor() {}

  async findAll(): Promise<Group[]> {
    const supabase = await createClient();

    const { data, error } = await supabase.from("groups").select("*");

    if (error) {
      console.error("[Database Error]:", error);
      throw new Error(
        "No se pudieron obtener los grupos. Inténtelo más tarde.",
      );
    }

    return (data || []).map((row) => GroupMapper.toMap(row));
  }
}
