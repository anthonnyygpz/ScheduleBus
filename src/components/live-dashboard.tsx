"use client";

import useSWR from "swr";
import { Clock, MapPin, CheckCircle2, Timer, Route } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
// import { SHIFT_CONFIG, ShiftType } from "@/core/entities/types.type";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface RealtimeEntry {
  id: string;
  employeeId: string;
  date: string;
  // shift: ShiftType;
  startTime: string;
  endTime: string;
  route: string;
  status: string;
  progress: number;
  employeeName: string;
  employeeGroup: string;
}

// function getTimeRemaining(endTime: string, shift: ShiftType): string {
//   const now = new Date();
//   const [endH, endM] = endTime.split(":").map(Number);
//
//   const endDate = new Date(now);
//   endDate.setHours(endH, endM, 0, 0);
//
//   if (shift === "night" && endH < 12) {
//     endDate.setDate(endDate.getDate() + 1);
//   }
//
//   const diffMs = endDate.getTime() - now.getTime();
//   if (diffMs <= 0) return "Finalizado";
//
//   const hours = Math.floor(diffMs / (1000 * 60 * 60));
//   const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
//
//   if (hours > 0) return `${hours}h ${minutes}m`;
//   return `${minutes}m`;
// }

function StatusDot({ status }: { status: string }) {
  if (status === "active") {
    return (
      <span className="inline-flex items-center gap-1.5">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
        </span>
        <span className="text-xs font-medium text-primary">Activo</span>
      </span>
    );
  }
  if (status === "completed") {
    return (
      <span className="inline-flex items-center gap-1.5 text-green-500 ">
        <CheckCircle2 className="h-3.5 w-3.5" />
        <span className="text-xs ">Completado</span>
      </span>
    );
  }
  if (status === "absent") {
    return (
      <span className="inline-flex items-center gap-1.5 text-destructive">
        <span className="h-2 w-2 rounded-full bg-destructive" />
        <span className="text-xs font-medium">Ausente</span>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-muted-foreground">
      <Timer className="h-3.5 w-3.5" />
      <span className="text-xs">Programado</span>
    </span>
  );
}

// function getShiftBadgeClass(shift: ShiftType) {
//   switch (shift) {
//     case "morning":
//       return "bg-chart-1/15 text-chart-1 border-chart-1/30";
//     case "afternoon":
//       return "bg-chart-2/15 text-chart-2 border-chart-2/30";
//     case "night":
//       return "bg-chart-5/15 text-chart-5 border-chart-5/30";
//   }
// }
//
export function LiveDashboard() {
  const { data, error } = useSWR("/api/realtime", fetcher, {
    refreshInterval: 5000,
  });

  if (error) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-muted-foreground">
          Error al cargar datos en tiempo real
        </p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex items-center gap-2 text-muted-foreground">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          Cargando panel en vivo...
        </div>
      </div>
    );
  }

  const entries: RealtimeEntry[] = data.entries || [];

  const sortedEntries = [...entries].sort((a, b) => {
    const order: Record<string, number> = {
      active: 0,
      scheduled: 1,
      absent: 2,
      completed: 3,
    };
    return (order[a.status] ?? 4) - (order[b.status] ?? 4);
  });

  const activeCount = entries.filter((e) => e.status === "active").length;
  const completedCount = entries.filter((e) => e.status === "completed").length;
  const absentCount = entries.filter((e) => e.status === "absent").length;

  return (
    <div className="flex h-full flex-col gap-3">
      {/* Minimal inline stats bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-sm font-semibold text-foreground 2xl:text-base">
            Jornadas de Hoy
          </h2>
          <div className="flex items-center gap-3 text-xs text-muted-foreground 2xl:text-sm">
            <span className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              {activeCount} activos
            </span>
            <span className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground" />
              {completedCount} completados
            </span>
            {absentCount > 0 && (
              <span className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-destructive" />
                {absentCount} ausentes
              </span>
            )}
          </div>
        </div>
        {data.timestamp && (
          <span className="font-mono text-[10px] text-muted-foreground 2xl:text-xs">
            {new Date(data.timestamp).toLocaleTimeString("es-MX")}
          </span>
        )}
      </div>

      {/* Full table */}
      {entries.length === 0 ? (
        <div className="flex flex-1 items-center justify-center rounded-lg border border-border bg-card">
          <p className="text-sm text-muted-foreground">
            No hay jornadas programadas para hoy
          </p>
        </div>
      ) : (
        <div className="flex-1 overflow-auto rounded-lg border border-border bg-card">
          <Table>
            <TableHeader className="sticky top-0 z-10 bg-card">
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-[11px] font-semibold text-muted-foreground 2xl:text-xs">
                  Estado
                </TableHead>
                <TableHead className="text-[11px] font-semibold text-muted-foreground 2xl:text-xs">
                  Empleado
                </TableHead>
                <TableHead className="text-[11px] font-semibold text-muted-foreground 2xl:text-xs">
                  Grupo
                </TableHead>
                <TableHead className="text-[11px] font-semibold text-muted-foreground 2xl:text-xs">
                  Turno
                </TableHead>
                <TableHead className="text-[11px] font-semibold text-muted-foreground 2xl:text-xs">
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Horario
                  </span>
                </TableHead>
                <TableHead className="text-[11px] font-semibold text-muted-foreground 2xl:text-xs">
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    Ruta
                  </span>
                </TableHead>
                <TableHead className="text-[11px] font-semibold text-muted-foreground 2xl:text-xs">
                  Progreso
                </TableHead>
                <TableHead className="text-[11px] font-semibold text-muted-foreground 2xl:text-xs text-right">
                  <span className="inline-flex items-center gap-1">
                    <Route className="h-3 w-3" />
                    Restante
                  </span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedEntries.map((entry) => (
                <TableRow
                  key={entry.id}
                  className={`border-border/50 ${
                    entry.status === "active"
                      ? "bg-primary/3"
                      : entry.status === "absent"
                        ? "bg-destructive/3"
                        : ""
                  }`}
                >
                  <TableCell className="py-2">
                    <StatusDot status={entry.status} />
                  </TableCell>
                  <TableCell className="py-2">
                    <span className="text-xs font-medium text-foreground 2xl:text-sm">
                      {entry.employeeName}
                    </span>
                  </TableCell>
                  <TableCell className="py-2">
                    <span className="text-xs text-muted-foreground 2xl:text-sm">
                      {entry.employeeGroup}
                    </span>
                  </TableCell>
                  <TableCell className="py-2">
                    <Badge
                      variant="outline"
                      //className={`text-[10px] py-0 px-1.5 2xl:text-xs ${getShiftBadgeClass(entry.shift)}`}
                    >
                      {/* {SHIFT_CONFIG[entry.shift].label} */}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-2">
                    <span className="font-mono text-[11px] text-muted-foreground 2xl:text-xs">
                      {entry.startTime} - {entry.endTime}
                    </span>
                  </TableCell>
                  <TableCell className="py-2">
                    <span className="text-xs text-muted-foreground 2xl:text-sm">
                      {entry.route}
                    </span>
                  </TableCell>
                  <TableCell className="py-2">
                    <div className="flex items-center gap-2">
                      <Progress
                        value={entry.progress}
                        className="h-1.5 w-14 2xl:w-20"
                      />
                      <span className="font-mono text-[10px] text-muted-foreground 2xl:text-xs">
                        {entry.progress}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="py-2 text-right">
                    {entry.status === "active" ? (
                      <span className="font-mono text-[11px] font-medium text-primary 2xl:text-xs">
                        {/* {getTimeRemaining(entry.endTime, entry.shift)} */}
                      </span>
                    ) : entry.status === "completed" ? (
                      <span className="text-[11px] text-muted-foreground 2xl:text-xs">
                        --
                      </span>
                    ) : entry.status === "absent" ? (
                      <span className="text-[11px] text-destructive 2xl:text-xs">
                        Ausente
                      </span>
                    ) : (
                      <span className="text-[11px] text-muted-foreground 2xl:text-xs">
                        Pendiente
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
