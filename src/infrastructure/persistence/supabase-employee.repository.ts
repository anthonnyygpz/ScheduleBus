import { createClient } from "../utils/supabase/server";
import { EmployeeMapper } from "../mappers/employee.mapper";
import { Employee } from "@/core/entities/employee.type";
import { EmployeeRepository } from "@/application/repositories/employee.repository";

export class SupbaseEmployeeRepository implements EmployeeRepository {
  async findAll(search?: string): Promise<Employee[]> {
    const supabase = await createClient();

    let query = supabase
      .from("employees")
      .select(
        `
      id,
      name,
      email,
      phone,
      groups (id, name, hours ),
      routes:employee_routes ( route:routes ( id, name ))
    `,
      )
      .neq("status", "deleted");

    if (search) {
      query = query.or(`name.ilike.%${search}%`);
    }

    const { data, error } = await query;

    if (error !== null) {
      console.error("[Database Error]:", error);
      throw new Error(
        "No se pudieron obtener los empleados. Inténtelo más tarde.",
      );
    }

    return (data || []).map((row) => EmployeeMapper.toMap(row));
  }

  async findById(id: number): Promise<Employee | null> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("employees")
      .select(
        `
      id,
      name,
      email,
      phone,
      groups (id, name, hours ),
      routes:employee_routes ( route:routes ( id, name ))
    `,
      )
      .eq("id", id)
      .neq("status", "deleted");

    if (error) {
      console.error("[Database Error]:", error);
      throw new Error("No se pudo obtener el empleado.");
    }

    if (!data || data.length === 0) {
      return null;
    }

    return EmployeeMapper.toMap(data[0]);
  }

  async save(employee: Employee): Promise<void> {
    const supabase = await createClient();

    const { error } = await supabase.rpc("save_employee_full", {
      p_id: employee.id > 0 ? employee.id : null,
      p_name: employee.name,
      p_email: employee.email,
      p_phone: employee.phone,
      p_group_id: employee.group.id,
      p_route_ids: employee.routes.map((r) => r.id),
    });

    if (error) {
      console.error("[Database Error]:", error);
      throw new Error("No se pudo guardar el empleado con sus rutas.");
    }
  }

  async delete(id: number): Promise<void> {
    const supabase = await createClient();
    await supabase.from("employees").update({ status: "deleted" }).eq("id", id);
  }
}
