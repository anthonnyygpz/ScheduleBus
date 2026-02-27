import { EmployeeRepository } from "@/application/repositories/employee.repository";

export class InMemoryEmployeeRepository implements EmployeeRepository {
  async findAll(): Promise<any> {
    return [];
  }

  async save(employee: any): Promise<any> {
    return employee;
  }

  async delete(id: string): Promise<void> {
    return;
  }
}
