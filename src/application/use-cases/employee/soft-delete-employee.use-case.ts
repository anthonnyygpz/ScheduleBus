import { EmployeeRepository } from "@/application/repositories/employee.repository";

export class SoftDeleteEmployeeUseCase {
  constructor(private readonly employeeRepository: EmployeeRepository) {}

  async execute(id: number) {
    const employee = await this.employeeRepository.findById(id);
    if (!employee) {
      throw new Error("No se pudo encontrar el empleado.");
    }

    await this.employeeRepository.delete(id);
  }
}
