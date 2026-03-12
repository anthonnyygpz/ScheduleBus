import { Employee } from "@/core/entities/employee.type";
import { EmployeeFiltersDto } from "@/application/dtos/employee.dto";

export interface EmployeeRepository {
  findAll(filters?: EmployeeFiltersDto): Promise<Employee[]>;
  findById(id: number): Promise<Employee | null>;
  save(data: Employee): Promise<void>;
  delete(id: number): Promise<void>;
}
