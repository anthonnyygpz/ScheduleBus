"use client";

import {
  EmployeeFiltersDto,
  EmployeeResponseDto,
} from "@/application/dtos/employee.dto";
import { Button } from "@/components/ui/button";
import ErrorText from "@/components/ui/error-text";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Metadata } from "@/application/dtos/pagination.dto";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Props {
  employees: EmployeeResponseDto[];
  groupsMap: Record<string, { hours: number; color: string }>;
  isSearching: boolean;
  metadata?: Metadata;
  handleFilters: (filters: EmployeeFiltersDto) => void;
  filters: EmployeeFiltersDto;
}

const TableEmployeeSchedule: React.FC<Props> = ({
  employees,
  groupsMap,
  isSearching,
  metadata,
  handleFilters,
  filters,
}) => {
  if (employees.length === 0) {
    return <ErrorText>No hay empleados asignados a este grupo</ErrorText>;
  }

  return (
    <div className="flex-1 h-full bg-background text-foreground">
      <Table containerClassName="h-full overflow-auto rounded-xl border bg-card shadow-sm">
        <TableHeader>
          <TableRow>
            <TableHead className="w-48 sticky top-0 left-0 z-30 bg-card border-r border-b">
              Nombre
            </TableHead>

            <TableHead className="sticky top-0 z-20 bg-card border-b text-center">
              Grupo
            </TableHead>
            <TableHead className="sticky top-0 z-20 bg-card border-b text-center">
              Horas
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {employees.map((employee) => (
            <TableRow key={employee.id}>
              {/* 5. Columna Izquierda: Fija solo a la izquierda. Z-index bajo (10) */}
              <TableCell className="font-bold text-xs sticky left-0 z-10 bg-card border-r py-4">
                {employee.name}
              </TableCell>

              <TableCell className="p-2 align-top">
                <div className="flex flex-col gap-1.5">
                  {/* 6. Uso directo de 'employee' sin el Map redundante */}
                  {employee.group && (
                    <div
                      style={{
                        borderLeftColor: groupsMap[employee.group.name]?.color,
                      }}
                      className="p-1.5 rounded border text-[10px] border-l-4 bg-secondary/30"
                    >
                      <div className="flex justify-between font-bold">
                        <span>
                          G.{employee.group.name} (
                          {groupsMap[employee.group.name]?.hours} h)
                        </span>
                        <span>{employee.group.hours} h</span>
                      </div>
                    </div>
                  )}
                </div>
              </TableCell>

              <TableCell className="p-2 align-top text-center">
                {employee.group?.hours || 0}
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
    </div>
  );
};

export default TableEmployeeSchedule;
