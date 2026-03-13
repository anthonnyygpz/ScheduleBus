"use client";

import React from "react";
import {
  EmployeeFiltersDto,
  EmployeeResponseDto,
} from "@/application/dtos/employee.dto";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "../../ui/badge";
import { DeleteEmployeeAlertDialog } from "./DeleteEmployeeAlertDialog";
import { EditEmployeeAlertDialog } from "./EditEmployeeAlertDialog";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Metadata } from "@/application/dtos/pagination.dto";

interface Props {
  employees: EmployeeResponseDto[];
  metadata?: Metadata;
  filters: EmployeeFiltersDto;
  onDelete: (id: number, name?: string) => void;
  handleFilters: (filters: EmployeeFiltersDto) => void;
  isSearching: boolean;
}

const TableEmployee: React.FC<Props> = React.memo(
  ({ employees, onDelete, handleFilters, filters, isSearching, metadata }) => {
    if (employees.length <= 0) {
      return (
        <div className="flex items-center justify-center py-20">
          <div className="flex items-center gap-2 text-muted-foreground">
            No se encontraron empleados con el nombre "{filters.search}"
          </div>
        </div>
      );
    }

    return (
      <Table containerClassName="max-h-full">
        <TableHeader className="sticky top-0 z-10 bg-card shadow-sm">
          <TableRow className="border-border hover:bg-transparent">
            <TableHead className="text-[11px] font-semibold text-muted-foreground 2xl:text-xs">
              Nombre
            </TableHead>
            <TableHead className="text-[11px] font-semibold text-muted-foreground 2xl:text-xs">
              Grupo
            </TableHead>
            <TableHead className="text-[11px] font-semibold text-muted-foreground 2xl:text-xs">
              Max h/dia
            </TableHead>
            <TableHead className="text-[11px] font-semibold text-muted-foreground 2xl:text-xs">
              Rutas
            </TableHead>
            <TableHead className="text-[11px] font-semibold text-muted-foreground 2xl:text-xs w-10">
              <span className="sr-only">Acciones</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {employees.map((emp: EmployeeResponseDto) => (
            <TableRow key={emp.id} className="border-border/50 group">
              <TableCell className="py-2">
                <span className="text-xs font-medium text-foreground 2xl:text-sm">
                  {emp.name}
                </span>
              </TableCell>
              <TableCell className="py-2">
                <span className="text-xs text-foreground 2xl:text-sm">
                  {emp.group.name}
                </span>
              </TableCell>

              <TableCell className="py-2">
                <span className="font-mono text-xs text-muted-foreground 2xl:text-sm">
                  {emp.group.hours} h/dia
                </span>
              </TableCell>
              <TableCell className="py-2">
                <div className="flex flex-wrap gap-1">
                  {emp.routes.map((route) => (
                    <Badge variant="outline" key={route.id}>
                      {route.name}
                    </Badge>
                  ))}
                </div>
              </TableCell>

              <TableCell className="flex flex-row py-2 gap-2">
                <EditEmployeeAlertDialog employee={emp} />
                <DeleteEmployeeAlertDialog
                  handleDelete={() => onDelete(emp.id, emp.name)}
                  name={emp.name}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter className="sticky bottom-0 z-20 bg-card">
          <TableRow>
            <TableCell colSpan={6}>
              <div className="flex items-center justify-end mr-4">
                <div className="flex items-center gap-2">
                  <Button
                    disabled={isSearching || !metadata!.hasPrev}
                    size="sm"
                    className="flex items-center gap-2 cursor-pointer active:opacity-50"
                    onClick={() =>
                      handleFilters({
                        ...filters,
                        page: filters.page! - 1,
                      })
                    }
                  >
                    <ChevronLeft />
                  </Button>
                  {employees.length > 0 && (
                    <span className="text-xs font-medium text-foreground 2xl:text-sm">
                      {metadata?.total} empleados
                    </span>
                  )}

                  <Button
                    disabled={isSearching || !metadata!.hasNext}
                    size="sm"
                    className="flex items-center gap-2 cursor-pointer active:opacity-50"
                    onClick={() =>
                      handleFilters({
                        ...filters,
                        page: filters.page! + 1,
                      })
                    }
                  >
                    <ChevronRight />
                  </Button>
                </div>
              </div>
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    );
  },
  (prevProps, nextProps) => {
    if (prevProps.employees !== nextProps.employees) return false;
    if (
      nextProps.employees.length === 0 &&
      prevProps.filters.search !== nextProps.filters.search
    )
      return false;
    return true;
  },
);

export default TableEmployee;
