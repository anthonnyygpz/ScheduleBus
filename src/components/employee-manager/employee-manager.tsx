"use client";

import { useState } from "react";
import { AddEmployeeCard } from "./components/AddEmployeeCard";
import { useDeleteEmployee } from "./hooks/useDeleteEmployee";
import { useEmployees } from "./hooks/useEmployees";
import TableEmployee from "./components/TableEmployee";
import ToolbarEmployee from "./components/ToolbarEmployee";
import Loading from "../ui/loading";
import ErrorText from "../ui/error-text";

export function EmployeeManager() {
  const [searchQuery, setSearch] = useState<string>("");
  const [showAddForm, setShowAddForm] = useState<boolean>(false);

  const { handleDelete } = useDeleteEmployee();
  const { data: employees, isLoading, error } = useEmployees(searchQuery);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement> | "") => {
    if (e === "") {
      setSearch("");
      return;
    }
    setSearch(e.target.value);
  };

  const handleShowForm = (bool: boolean) => {
    setShowAddForm(bool);
  };

  if (error) {
    return (
      <ErrorText>
        <p>Error al cargar empleados</p>
      </ErrorText>
    );
  }

  if (isLoading) {
    return <Loading>Cargando empleados...</Loading>;
  }

  return (
    <div className="flex h-full flex-col gap-3">
      {/* Toolbar */}
      <ToolbarEmployee
        employees={employees}
        handleSearch={handleSearch}
        searchQuery={searchQuery}
        handleShowForm={handleShowForm}
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
