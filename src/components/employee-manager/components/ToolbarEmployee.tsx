"use client";

import { Button } from "@/components/ui/button";
import { Search, UserPlus, X } from "lucide-react";
import { Input } from "../../ui/input";
import { EmployeeResponseDto } from "@/application/dtos/employee.dto";

interface Props {
  employees: EmployeeResponseDto[];
  handleSearch: (e: React.ChangeEvent<HTMLInputElement> | "") => void;
  searchQuery: string;
  handleShowForm: (bool: boolean) => void;
}

const ToolbarEmployee: React.FC<Props> = ({
  employees,
  handleSearch,
  searchQuery,
  handleShowForm,
}) => {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <h2 className="text-sm font-semibold text-foreground 2xl:text-base">
          Empleados
        </h2>
        <span className="text-xs text-muted-foreground 2xl:text-sm whitespace-nowrap">
          {employees.length} registrados
        </span>
      </div>

      <div className="flex items-center gap-2 w-full sm:w-auto">
        <div className="flex-1 sm:w-64 md:w-80">
          <Input
            onChange={handleSearch}
            placeholder="Buscar empleado..."
            className="w-full"
            value={searchQuery}
            type="search"
            autoComplete="off"
            autoCorrect="off"
            spellCheck="false"
            startAdornment={
              <Search className="h-3.5 w-3.5 text-muted-foreground" />
            }
            endAdornment={
              searchQuery.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSearch("")}
                  className="text-xs cursor-pointer"
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              )
            }
          />
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => handleShowForm(true)}
          className="shrink-0 gap-1.5 text-xs h-8 cursor-pointer"
        >
          <UserPlus className="h-3.5 w-3.5" />
          <span className="hidden max-[380px]:hidden min-[380px]:inline">
            Agregar
          </span>
        </Button>
      </div>
    </div>
  );
};

export default ToolbarEmployee;
