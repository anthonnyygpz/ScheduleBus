"use client";

import { useCallback, useState } from "react";
import Loading from "../ui/loading";
import { AddEmployeeCard } from "./components/AddEmployeeCard";
import TableEmployee from "./components/TableEmployee";
import ToolbarEmployee from "./components/ToolbarEmployee";
import { useDeleteEmployee } from "./hooks/useDeleteEmployee";
import { useEmployees } from "./hooks/useEmployees";
import { EmployeeFiltersDto } from "@/application/dtos/employee.dto";

export function EmployeeManager() {
  const [searchQuery, setSearch] = useState<string>("");
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [filters, setFilters] = useState<EmployeeFiltersDto>({
    search: "",
    limit: 20,
    page: 1,
    status: "active",
    orderBy: "name",
    ascending: false,
    groupId: 0,
  });

  const { data: employees, isLoading, isSearching } = useEmployees(filters);
  const { handleDelete } = useDeleteEmployee();

  const handleFilters = useCallback((filters: EmployeeFiltersDto) => {
    setFilters(filters);
  }, []);

  const handleSearch = useCallback(
    (e: React.ChangeEvent<HTMLInputElement> | "") => {
      setSearch(e === "" ? "" : e.target.value);
    },
    [],
  );

  const handleShowForm = useCallback((bool: boolean) => {
    setShowAddForm(bool);
  }, []);

  if (isLoading && employees.length === 0) {
    return <Loading>Cargando empleados...</Loading>;
  }

  return (
    <div className="flex h-full flex-col gap-3">
      {/* Toolbar */}
      <ToolbarEmployee
        employees={employees}
        handleShowForm={handleShowForm}
        isSearching={isSearching}
        handleFilters={handleFilters}
        filters={filters}
      />

      {/* Add Employee Form */}
      {showAddForm && (
        <AddEmployeeCard onCloseForm={() => setShowAddForm(false)} />
      )}

      {/* Employees Table */}
      <div className="flex-1 overflow-auto rounded-lg border border-border bg-card">
        <TableEmployee
          employees={employees}
          searchQuery={searchQuery}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
}
