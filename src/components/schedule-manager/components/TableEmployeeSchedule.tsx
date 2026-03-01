"use client";

import { EmployeeResponseDto } from "@/application/dtos/employee.dto";
import ErrorText from "@/components/ui/error-text";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Props {
  employees: EmployeeResponseDto[];
  groupsMap: Record<string, { hours: number; color: string }>;
}

const TableEmployeeSchedule: React.FC<Props> = ({ employees, groupsMap }) => {
  const employeeById = new Map<number, EmployeeResponseDto>();
  employees.forEach((e) => {
    employeeById.set(e.id, e);
  });

  if (employees.length === 0)
    return <ErrorText>No hay empleados asignados a este grupo</ErrorText>;

  return (
    <div className="flex-1 overflow-auto rounded-xl border bg-card">
      <div className="p-4 bg-background text-foreground">
        <Table>
          <TableHeader className="sticky top-0 z-20 bg-card shadow-sm">
            <TableRow>
              <TableHead className="w-45 sticky left-0 z-30 bg-card border-r">
                Nombre
              </TableHead>
              <TableHead className="text-center">Grupo</TableHead>
              <TableHead className="text-center">Horas</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {employees.map((employee) => {
              const employeeData = employeeById.get(employee.id);
              return (
                <TableRow key={employee.id}>
                  <TableCell className="font-bold text-xs sticky left-0 bg-card z-10 border-r py-4">
                    {employee.name}
                  </TableCell>
                  <TableCell className="p-2 align-top">
                    <div className="flex flex-col gap-1.5">
                      {employeeData?.group && (
                        <div
                          key={employeeData.group.id}
                          style={{
                            borderLeftColor:
                              groupsMap[employeeData.group.name]?.color,
                          }}
                          className="p-1.5 rounded border text-[10px] border-l-4 bg-secondary/30"
                        >
                          <div className="flex justify-between font-bold">
                            <span>
                              G.{employeeData.group.name} (
                              {groupsMap[employeeData.group.name]?.hours}
                              h)
                            </span>
                            <span>{employeeData.group.hours} h</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="p-2 align-top">
                    {employeeData?.group?.hours || 0}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default TableEmployeeSchedule;
