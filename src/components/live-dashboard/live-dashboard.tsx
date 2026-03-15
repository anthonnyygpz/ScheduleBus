"use client";

import { Clock, MapPin, CheckCircle2, Timer, User } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useLiveTodaySchedule } from "./hooks/useLiveTodaySchedule";
import { cn } from "@/core/utils/tw";

export function LiveDashboard() {
  const { data: entries, error, isLoading } = useLiveTodaySchedule();

  if (isLoading)
    return <div className="p-10 text-center">Cargando panel en vivo...</div>;
  if (error)
    return (
      <div className="p-10 text-center text-destructive">Error de conexión</div>
    );

  return (
    <div className="flex h-full flex-col gap-3">
      <div className="flex-1 overflow-auto rounded-lg border bg-card">
        <Table>
          <TableHeader className="sticky top-0 bg-card z-10">
            <TableRow>
              <TableHead>Estado</TableHead>
              <TableHead>Personal</TableHead>
              <TableHead>
                <Clock className="h-3 w-3 inline mr-1" />
                Horario
              </TableHead>
              <TableHead>
                <MapPin className="h-3 w-3 inline mr-1" />
                Ruta
              </TableHead>
              <TableHead>Progreso</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.map((entry) => (
              <TableRow
                key={entry.id}
                className={cn(entry.status === "active" && "bg-primary/5")}
              >
                <TableCell>
                  <StatusBadge status={entry.status} />
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">
                      {entry.employeeName.includes("->") ? (
                        <span className="flex items-center gap-1">
                          <span className="line-through opacity-40">
                            {entry.employeeName.split(" -> ")[0]}
                          </span>
                          <User className="h-3 w-3 text-primary" />
                          <span className="text-primary">
                            {entry.employeeName.split(" -> ")[1]}
                          </span>
                        </span>
                      ) : (
                        entry.employeeName
                      )}
                    </span>
                    <span className="text-[10px] text-muted-foreground uppercase">
                      {entry.group}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="font-mono text-xs">
                  {entry.startTime} - {entry.endTime}
                </TableCell>
                <TableCell className="text-xs">{entry.route}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Progress value={entry.progress} className="h-1.5 w-20" />
                    <span className="text-[10px]">{entry.progress}%</span>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const configs: any = {
    active: {
      label: "En Ruta",
      class: "text-primary animate-pulse",
      icon: <span className="h-2 w-2 rounded-full bg-primary" />,
    },
    completed: {
      label: "Finalizado",
      class: "text-green-500",
      icon: <CheckCircle2 className="h-3 w-3" />,
    },
    absent: {
      label: "Falta",
      class: "text-destructive",
      icon: <span className="h-2 w-2 rounded-full bg-destructive" />,
    },
    pending: {
      label: "Pendiente",
      class: "text-muted-foreground",
      icon: <Timer className="h-3 w-3" />,
    },
  };
  const config = configs[status] || configs.pending;
  return (
    <div
      className={cn(
        "flex items-center gap-2 text-[10px] font-bold uppercase",
        config.class,
      )}
    >
      {config.icon} {config.label}
    </div>
  );
}
