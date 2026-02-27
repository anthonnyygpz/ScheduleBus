import { EmployeeResponseDto } from "@/application/dtos/employee.dto";
import { fetcher } from "@/core/utils/fetch";
import useSWR from "swr";

export const useEmployees = () => {
  const { data, error, isLoading } = useSWR<EmployeeResponseDto[]>(
    "/api/employees",
    fetcher,
  );

  return { data, error, isLoading };
};
