"use client";

import React from "react";
import { EmployeeResponseDto } from "@/application/dtos/employee.dto";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "../../ui/badge";
import { DeleteEmployeeAlertDialog } from "./DeleteEmployeeAlertDialog";
import { EditEmployeeAlertDialog } from "./EditEmployeeAlertDialog";

interface Props {
  employees: EmployeeResponseDto[];
  searchQuery: string;
  onDelete: (id: number) => void;
}

const TableEmployee: React.FC<Props> = React.memo(
  ({ employees, searchQuery, onDelete }) => {
    if (employees.length <= 0) {
      return (
        <div className="flex items-center justify-center py-20">
          <div className="flex items-center gap-2 text-muted-foreground">
            No se encontraron empleados con el nombre "{searchQuery}"
          </div>
        </div>
      );
    }

    return (
      <Table>
        <TableHeader className="sticky top-0 z-10 bg-card">
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
                  handleDelete={() => onDelete(emp.id)}
                  name={emp.name}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  },
  (prevProps, nextProps) => {
    // Solo re-renderizar si los empleados cambian o si el estado vacío necesita actualizar searchQuery
    if (prevProps.employees !== nextProps.employees) return false;
    if (
      nextProps.employees.length === 0 &&
      prevProps.searchQuery !== nextProps.searchQuery
    )
      return false;
    return true;
  },
);

export default TableEmployee;
