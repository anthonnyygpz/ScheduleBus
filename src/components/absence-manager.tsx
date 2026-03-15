"use client";

import { useState } from "react";
import useSWR, { mutate } from "swr";
import { CalendarX2, Zap, UserPlus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { fetcher } from "@/core/utils/fetch";
import { useSchedule } from "./schedule-manager/hooks/useSchedule";
import { AbsenceRecord } from "@/core/entities/absence.type";
import { ScheduleEntry } from "@/core/entities/schedule.type";
import { EmployeeResponseDto } from "@/application/dtos/employee.dto";
import { useEmployees } from "./employee-manager/hooks/useEmployees";
import { useToast } from "@/hooks/use-toast";

export function AbsenceManager() {
  // 1. Carga de datos
  const { data: employeesData } = useEmployees();
  const { data: scheduleData } = useSchedule();
  const { data: history, mutate: mutateHistory } = useSWR<AbsenceRecord[]>(
    "/api/absences",
    fetcher,
  );
  const { toast } = useToast();

  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [replacementId, setReplacementId] = useState(""); // 💡 Aquí se define el estado del reemplazo
  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  });
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  // 3. Preparación de listas
  const employeeMap = new Map(
    employeesData.map((e: EmployeeResponseDto) => [e.id.toString(), e]),
  );

  const originalEmployee = employeeMap.get(selectedEmployee);
  const originalEntry = scheduleData?.entries?.find(
    (e: ScheduleEntry) =>
      e.employeeId === selectedEmployee && e.date === selectedDate,
  );

  // Empleados que tienen turno el día seleccionado (para marcar la falta)
  const scheduledForDate =
    scheduleData?.entries
      ?.filter(
        (e: ScheduleEntry) => e.date === selectedDate && e.status !== "absent",
      )
      ?.map((e: ScheduleEntry) => e.employeeId)
      .filter(
        (id: string, i: number, arr: string[]) => arr.indexOf(id) === i,
      ) || [];

  const availableForReplacement = employeesData.filter((emp: any) => {
    // No puede ser la misma persona que falta
    if (emp.id.toString() === selectedEmployee) return false;

    // REGLA 1: Debe ser del mismo grupo (A, B o C)
    const isSameGroup = emp.group?.name === originalEmployee?.group?.name;

    // REGLA 2: Debe tener asignada esa ruta en su perfil (mismo ID o nombre)
    const hasAllowedRoute = emp.routes?.some(
      (r: any) =>
        r.name === originalEntry?.route ||
        r.id.toString() === originalEntry?.route,
    );

    // Solo mostramos si cumple AMBAS condiciones
    return isSameGroup && hasAllowedRoute;
  });

  const handleReportAbsence = async () => {
    if (!selectedEmployee || !selectedDate) return;
    setLoading(true);

    try {
      const res = await fetch("/api/absences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeId: selectedEmployee,
          date: selectedDate,
          reason: reason || "Sin especificar",
          replacementId: replacementId || null,
        }),
      });

      if (res.ok) {
        mutate(
          (key) => typeof key === "string" && key.startsWith("/api/schedule"),
        );
        mutateHistory();
        setSelectedEmployee("");
        setReplacementId("");
        setReason("");

        // 3. Mostrar el Toast de éxito
        toast({
          title: "Ausencia registrada",
          description: "La ausencia se registró y el horario fue actualizado.",
          variant: "success",
        });
      }
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="flex h-full flex-col gap-3">
      <div className="grid gap-3 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-2 pt-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <CalendarX2 className="h-4 w-4 text-destructive" /> Reportar
              Ausencia
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <Label className="text-xs">Fecha de Falta</Label>
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Empleado que Falta</Label>
                <Select
                  value={selectedEmployee}
                  onValueChange={setSelectedEmployee}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione" />
                  </SelectTrigger>
                  <SelectContent>
                    {scheduledForDate.map((empId: string) => (
                      <SelectItem key={empId} value={empId}>
                        {employeeMap.get(empId)?.name || `ID: ${empId}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* 💡 Nuevo Selector de Reemplazo */}
            <div className="space-y-1">
              <Label className="text-xs flex items-center gap-1">
                <UserPlus className="h-3 w-3" /> Empleado de Reemplazo
                (Opcional)
              </Label>
              <Select value={replacementId} onValueChange={setReplacementId}>
                <SelectTrigger>
                  <SelectValue placeholder="¿Quién cubrirá el turno?" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">
                    Sin reemplazo (Dejar hueco)
                  </SelectItem>
                  {availableForReplacement.map((emp: any) => (
                    <SelectItem key={emp.id} value={emp.id.toString()}>
                      {emp.name} ({emp.group?.name})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Motivo</Label>
              <Textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Ej: Incapacidad IMSS"
                className="h-20"
              />
            </div>
            <Button
              onClick={handleReportAbsence}
              disabled={loading || !selectedEmployee}
              className="w-full"
            >
              <Zap className="h-3 w-3 mr-2" />
              {loading ? "Guardando..." : "Registrar y Asignar Reemplazo"}
            </Button>
          </CardContent>
        </Card>

        {/* Historial */}
        <Card className="overflow-hidden">
          <CardHeader className="pb-2 pt-3">
            <CardTitle className="text-sm">Registro de Ausencias</CardTitle>
          </CardHeader>
          <div className="max-h-87.5 overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Original</TableHead>
                  <TableHead className="text-xs">Reemplazo</TableHead>
                  <TableHead className="text-xs">Fecha</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history?.map((record: AbsenceRecord) => (
                  <TableRow key={record.id}>
                    <TableCell className="text-xs font-medium">
                      {employeeMap.get(record.employeeId)?.name}
                    </TableCell>
                    <TableCell className="text-xs text-primary font-bold">
                      {record.replacementId
                        ? employeeMap.get(record.replacementId)?.name
                        : "---"}
                    </TableCell>
                    <TableCell className="text-xs">{record.date}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>
    </div>
  );
}
