import { EmployeeResponseDto } from "@/application/dtos/employee.dto";
import { EmployeeRepository } from "@/application/repositories/employee.repository";
import { EmployeeMapper } from "@/infrastructure/mappers/employee.mapper";

export class GetEmployeesUseCase {
  constructor(private employeeRepo: EmployeeRepository) {}

  async execute(): Promise<EmployeeResponseDto[]> {
    const employees = await this.employeeRepo.findAll();

    return employees.map((employee) => EmployeeMapper.toResponseDto(employee));
  }
}
