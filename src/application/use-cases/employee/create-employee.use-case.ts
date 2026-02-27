import { EmployeeRequestDto } from "@/application/dtos/employee.dto";
import { EmployeeRepository } from "@/application/repositories/employee.repository";
import { EmployeeMapper } from "@/infrastructure/mappers/employee.mapper";

export class CreateEmployeeUseCase {
  constructor(private readonly employeeRepository: EmployeeRepository) {}

  async execute(dto: EmployeeRequestDto, id?: number) {
    const employee = EmployeeMapper.toEntity({ data: dto });

    if (id) {
      employee.id = id;
    }

    await this.employeeRepository.save(employee);
  }
}
