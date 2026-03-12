import {
  EmployeeFiltersDto,
  PaginatedEmployeeResponseDto,
} from "@/application/dtos/employee.dto";
import { fetcher } from "@/core/utils/fetch";
import { useDebouce } from "@/hooks/useDebounce";
import useSWR from "swr";

export const useEmployees = (filters?: EmployeeFiltersDto) => {
  const debouncedSearch = useDebouce(filters?.search, 500);

  const params = new URLSearchParams({
    search: debouncedSearch ?? "",
    limit: filters?.limit?.toString() ?? "10",
    page: filters?.page?.toString() ?? "1",
    orderBy: filters?.orderBy ?? "name",
    asending: filters?.ascending?.toString() === "true" ? "true" : "false",
    groupId: filters?.groupId?.toString() ?? "",
  });

  const { data, error, isLoading, isValidating } =
    useSWR<PaginatedEmployeeResponseDto>(`/api/employees?${params}`, fetcher, {
      revalidateOnFocus: false,
      keepPreviousData: true,
    });

  return {
    data: data?.data || [],
    medatada: data?.metadata,
    error,
    isLoading: isLoading || (isValidating && data === undefined),
    isSearching: isValidating,
  };
};
