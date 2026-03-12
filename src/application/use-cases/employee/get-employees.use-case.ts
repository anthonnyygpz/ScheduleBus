import {
  EmployeeFiltersDto,
  PaginatedEmployeeResponseDto,
} from "@/application/dtos/employee.dto";
import { EmployeeRepository } from "@/application/repositories/employee.repository";
import { EmployeeMapper } from "@/infrastructure/mappers/employee.mapper";

export class GetEmployeesUseCase {
  constructor(private employeeRepo: EmployeeRepository) {}

  async execute(
    filters?: EmployeeFiltersDto,
  ): Promise<PaginatedEmployeeResponseDto> {
    const employees = await this.employeeRepo.findAll(filters);

    return EmployeeMapper.toPaginatedResponseDto(employees, filters);
  }
}
