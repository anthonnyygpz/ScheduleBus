import { GetEmployeesUseCase } from "@/application/use-cases/employee/get-employees.use-case";
import { SupbaseEmployeeRepository } from "./persistence/supabase-employee.repository";
import { SupabaseRouteRepository } from "./persistence/supabase-route.repository";
import { GetRoutesUseCase } from "@/application/use-cases/get-routes/get-routes.use-case";
import { CreateEmployeeUseCase } from "@/application/use-cases/employee/create-employee.use-case";
import { SoftDeleteEmployeeUseCase } from "@/application/use-cases/employee/soft-delete-employee.use-case";

const employeeRepo = new SupbaseEmployeeRepository();
const routeRepo = new SupabaseRouteRepository();

const getEmployeesUseCase = new GetEmployeesUseCase(employeeRepo);
const getRoutesUseCase = new GetRoutesUseCase(routeRepo);
const createEmployeeUseCase = new CreateEmployeeUseCase(employeeRepo);
const deleteEmployeeUseCase = new SoftDeleteEmployeeUseCase(employeeRepo);

export const getDependencies = async () => {
  return {
    getEmployeesUseCase,
    getRoutesUseCase,
    createEmployeeUseCase,
    deleteEmployeeUseCase,
  };
};
