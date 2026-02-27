import { RouteRepository } from "@/application/repositories/route.repository";
import { Route } from "@/core/entities/route.type";
import { createClient } from "../utils/supabase/server";

export class SupabaseRouteRepository implements RouteRepository {
  async findAll(): Promise<Route[]> {
    const supabase = await createClient();

    const { data, error } = await supabase.from("routes").select("*");

    if (error) {
      console.error("[Database Error]:", error);
      throw new Error("No se pudieron obtener las rutas. Inténtelo más tarde.");
    }

    return (data as any[]).map((row) => new Route(row));
  }
}
