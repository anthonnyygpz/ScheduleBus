import { createClient } from "../utils/supabase/server";
import { EmployeeMapper } from "../mappers/employee.mapper";
import { Employee } from "@/core/entities/employee.type";
import { EmployeeRepository } from "@/application/repositories/employee.repository";
import { EmployeeFiltersDto } from "@/application/dtos/employee.dto";

export class SupbaseEmployeeRepository implements EmployeeRepository {
  async findAll(filters?: EmployeeFiltersDto): Promise<Employee[]> {
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

    if (filters?.search) {
      query = query.or(`name.ilike.%${filters.search}%`);
    }

    if (filters?.status) {
      query = query.eq("status", filters.status);
    }

    if (filters?.orderBy) {
      query = query.order(filters.orderBy, {
        ascending: filters.ascending,
      });
    }

    if (filters?.page && filters?.limit) {
      const from = (filters.page - 1) * filters.limit;
      const to = from + filters.limit - 1;
      query = query.range(from, to);
    }

    const { data, error } = await query;

    if (error !== null) {
      this.handleError(error, "obtener empleados");
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
      this.handleError(error, "obtener empleado");
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
      this.handleError(error, "guardar empleado");
    }
  }

  async delete(id: number): Promise<void> {
    const supabase = await createClient();
    await supabase.from("employees").update({ status: "deleted" }).eq("id", id);
  }

  private handleError(error: any, action: string): never {
    console.error(`[Database Error during ${action}]:`, error);
    throw new Error(`Error de persistencia: No se pudo ${action}.`);
  }
}
