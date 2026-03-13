"use client";

import { useCallback, useState } from "react";
import Loading from "../ui/loading";
import { AddEmployeeCard } from "./components/AddEmployeeCard";
import TableEmployee from "./components/TableEmployee";
import ToolbarEmployee from "./components/ToolbarEmployee";
import { useDeleteEmployee } from "./hooks/useDeleteEmployee";
import { useEmployees } from "./hooks/useEmployees";
import { useFilterEmployee } from "./hooks/useFilterEmployee";

export function EmployeeManager() {
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const { filters, handleFilters } = useFilterEmployee();
  const {
    data: employees,
    metadata,
    isLoading,
    isSearching,
  } = useEmployees(filters);
  const { handleDelete } = useDeleteEmployee();

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
          metadata={metadata}
          filters={filters}
          handleFilters={handleFilters}
          onDelete={handleDelete}
          isSearching={isSearching}
        />
      </div>
    </div>
  );
}
