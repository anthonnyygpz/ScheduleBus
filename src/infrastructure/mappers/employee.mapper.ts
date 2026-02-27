import {
  EmployeeRequestDto,
  EmployeeResponseDto,
} from "@/application/dtos/employee.dto";
import { Employee } from "@/core/entities/employee.type";

export class EmployeeMapper {
  static toMap(raw: any): Employee {
    const rawGroup = Array.isArray(raw.groups) ? raw.groups[0] : raw.groups;

    return new Employee(
      raw.id,
      raw.name,
      raw.email || "",
      raw.phone || "",
      {
        id: rawGroup?.id || 0,
        name: rawGroup?.name || "Sin grupo",
        hours: rawGroup?.hours || 0,
      },
      raw.routes?.map((item: any) => ({
        id: item.route?.id || 0,
        name: item.route?.name || "Ruta no definida",
      })) || [],
    );
  }

  static toEntity({ data }: { data: EmployeeRequestDto }): Employee {
    const cleanRouteIds = (data.routeIds || [])
      .map((id) => Number(id))
      .filter((id) => !isNaN(id) && id > 0);

    return new Employee(
      0,
      data.name || "",
      data.email || "",
      data.phone || "",
      {
        id: Number(data.groupId) || 0,
        name: "Sin grupo",
        hours: 0,
      },
      cleanRouteIds.map((id) => ({ id, name: "" })),
    );
  }

  static toResponseDto(entity: Employee): EmployeeResponseDto {
    return new EmployeeResponseDto({
      id: entity.id,
      name: entity.name,
      email: entity.email,
      phone: entity.phone,
      group: entity.group,
      routes: entity.routes,
    });
  }
}
