import { EmployeeResponseDto } from "@/application/dtos/employee.dto";
import { fetcher } from "@/core/utils/fetch";
import { useDebouce } from "@/hooks/useDebounce";
import useSWR from "swr";

export const useEmployees = (searchQuery?: string) => {
  const debouncedSearch = useDebouce(searchQuery, 500);

  const endpoint = searchQuery
    ? `/api/employees?search=${debouncedSearch}`
    : "/api/employees";

  const {
    data = [],
    error,
    isLoading,
  } = useSWR<EmployeeResponseDto[]>(endpoint, fetcher);

  return { data, error, isLoading };
};
