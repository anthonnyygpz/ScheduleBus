import { useCallback, useState } from "react";
import { EmployeeFiltersDto } from "@/application/dtos/employee.dto";

export const useFilterEmployee = () => {
  const [filters, setFilters] = useState<EmployeeFiltersDto>({
    search: "",
    limit: 10000,
    page: 1,
    status: "active",
    orderBy: "name",
    ascending: true,
    groupId: 0,
  });

  const handleFilters = useCallback((filters: EmployeeFiltersDto) => {
    setFilters(filters);
  }, []);

  return { filters, handleFilters };
};
