"use client";

import { Button } from "@/components/ui/button";
import { Search, UserPlus, X, Filter } from "lucide-react";
import { Input } from "../../ui/input";
import {
  EmployeeFiltersDto,
  EmployeeResponseDto,
} from "@/application/dtos/employee.dto";
import { Loader2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import { DropdownMenuLabel } from "@radix-ui/react-dropdown-menu";

interface Props {
  employees: EmployeeResponseDto[];
  handleShowForm: (bool: boolean) => void;
  isSearching: boolean;
  handleFilters: (filters: EmployeeFiltersDto) => void;
  filters: EmployeeFiltersDto;
}

const ToolbarEmployee: React.FC<Props> = ({
  employees,
  handleShowForm,
  isSearching,
  filters,
  handleFilters,
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
        <div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Filter className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Estado</DropdownMenuLabel>
              <DropdownMenuSeparator />

              <DropdownMenuCheckboxItem
                checked={filters.status === "active"}
                onCheckedChange={(checked) =>
                  handleFilters({
                    ...filters,
                    status: checked ? "active" : "inactive",
                  })
                }
              >
                Activos
              </DropdownMenuCheckboxItem>

              <DropdownMenuCheckboxItem
                checked={filters.status === "inactive"}
                onCheckedChange={(checked) =>
                  handleFilters({
                    ...filters,
                    status: checked ? "inactive" : "active",
                  })
                }
              >
                Inactivos
              </DropdownMenuCheckboxItem>

              <DropdownMenuSeparator />
              <DropdownMenuLabel>Ordenar por</DropdownMenuLabel>
              <DropdownMenuSeparator />

              <DropdownMenuRadioGroup
                value={filters.orderBy}
                onValueChange={(value) =>
                  handleFilters({ ...filters, orderBy: value })
                }
              >
                <DropdownMenuRadioItem value="name">
                  Nombre
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="id">
                  Numero de empleado
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="flex-1 sm:w-64 md:w-80">
          <Input
            onChange={(e) =>
              handleFilters({ ...filters, search: e.target.value })
            }
            placeholder="Buscar empleado..."
            className="w-full"
            value={filters.search}
            type="search"
            autoComplete="off"
            autoCorrect="off"
            spellCheck="false"
            startAdornment={
              isSearching ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
              ) : (
                <Search className="h-3.5 w-3.5 text-muted-foreground" />
              )
            }
            endAdornment={
              filters?.search!.length > 0 &&
              !isSearching && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleFilters({ ...filters, search: "" })}
                  className="text-xs cursor-pointer h-7 w-7 p-0"
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
