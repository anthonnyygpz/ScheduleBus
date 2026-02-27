import { EmployeeRepository } from "@/application/repositories/employee.repository";
import { EmployeeResponseDto } from "./get-employees.dto";
import { EmployeeMapper } from "@/infrastructure/mappers/employee.mapper";

export class GetEmployeesUseCase {
  constructor(private employeeRepo: EmployeeRepository) {}

  async execute(): Promise<EmployeeResponseDto[]> {
    // Obtenemos Entidades puras del repositorio
    const employees = await this.employeeRepo.findAll();

    // Las transformamos a DTOs listos para el frontend usando el Mapper
    return employees.map((employee) => EmployeeMapper.toResponseDto(employee));
  }
}
