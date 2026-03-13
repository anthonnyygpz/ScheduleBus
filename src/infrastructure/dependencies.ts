import { GetEmployeesUseCase } from "@/application/use-cases/employee/get-employees.use-case";
import { SupbaseEmployeeRepository } from "./persistence/supabase-employee.repository";
import { SupabaseRouteRepository } from "./persistence/supabase-route.repository";
import { GetRoutesUseCase } from "@/application/use-cases/get-routes/get-routes.use-case";
import { CreateEmployeeUseCase } from "@/application/use-cases/employee/create-employee.use-case";
import { SoftDeleteEmployeeUseCase } from "@/application/use-cases/employee/soft-delete-employee.use-case";
import { GetGroupsUseCase } from "@/application/use-cases/group/get-groups.use-case";
import { SupabaseGroupRepository } from "./persistence/supabase-group.repository";
import { SupabaseScheduleRepository } from "./persistence/supabase-schedule.repository";
import { GenerateScheduleUseCase } from "@/application/use-cases/schedule/generate-schedule.use-case";
import { GetScheduleUseCase } from "@/application/use-cases/schedule/get-schedule.use-case";
import { LiveScheduleUseCase } from "@/application/use-cases/schedule/live-schedule.use-case";
import { ScheduleEngine } from "@/core/logic/schedule-engine";
import { DeterministicShuffler } from "./persistence/deterministic-shuffler.repository";
import { DynamicRecipeProvider } from "./persistence/dynamic-recipe-provider.repository";

const employeeRepo = new SupbaseEmployeeRepository();
const routeRepo = new SupabaseRouteRepository();
const groupRepo = new SupabaseGroupRepository();
const scheduleRepo = new SupabaseScheduleRepository();
const recipeProvider = new DynamicRecipeProvider();
const shuffler = new DeterministicShuffler();
const scheduleEngine = new ScheduleEngine(recipeProvider, shuffler);

const getEmployeesUseCase = new GetEmployeesUseCase(employeeRepo);
const getRoutesUseCase = new GetRoutesUseCase(routeRepo);
const createEmployeeUseCase = new CreateEmployeeUseCase(employeeRepo);
const deleteEmployeeUseCase = new SoftDeleteEmployeeUseCase(employeeRepo);
const getGroupsUseCase = new GetGroupsUseCase(groupRepo);
const generateScheduleUseCase = new GenerateScheduleUseCase(
  employeeRepo,
  routeRepo,
  scheduleRepo,
  scheduleEngine,
  () => crypto.randomUUID(),
);
const getScheduleUseCase = new GetScheduleUseCase(scheduleRepo);
const liveScheduleUseCase = new LiveScheduleUseCase(scheduleRepo);

export const getDependencies = async () => {
  return {
    getEmployeesUseCase,
    getRoutesUseCase,
    createEmployeeUseCase,
    deleteEmployeeUseCase,
    getGroupsUseCase,
    generateScheduleUseCase,
    getScheduleUseCase,
    liveScheduleUseCase,
  };
};
