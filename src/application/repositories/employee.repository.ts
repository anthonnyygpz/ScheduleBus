import { Employee } from "@/core/entities/employee.type";

export interface EmployeeRepository {
  findAll(): Promise<Employee[]>;
  findById(id: number): Promise<Employee | null>;
  save(data: Employee): Promise<void>;
  delete(id: number): Promise<void>;
}
