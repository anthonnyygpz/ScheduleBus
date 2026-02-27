"use client";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScheduleEntry } from "@/core/entities/schedule.type";
import { cn } from "@/lib/utils";
import {
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  RefreshCw,
  Users,
} from "lucide-react";
import { useMemo, useState } from "react";
import { mutate } from "swr";
import { useEmployees } from "../employee-manager/hooks/useEmployees";
import { useGroups } from "../group-manager";
import { useRoutes } from "../route-manager";
import { Badge } from "../ui/badge";
import { Card, CardContent } from "../ui/card";
import { useSchedule } from "./hooks/useSchedule";

export function ScheduleView() {
  const { routeOptions: routes } = useRoutes();
  const { data: employees = [] } = useEmployees();
  const { data: schedule, error, isLoading } = useSchedule();
  const { data: groups = [] } = useGroups();

  const [generating, setGenerating] = useState(false);
  const [weekOffset, setWeekOffset] = useState(0);

  const groupsMap = useMemo(() => {
    const map: Record<string, { hours: number; color: string }> = {};
    groups.forEach((g) => {
      map[g.name] = {
        hours: g.hours,
        color: g.color || "border-l-primary bg-primary/10 text-primary",
      };
    });
    return map;
  }, [groups]);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const tuesday = getTuesday(new Date());
      tuesday.setDate(tuesday.getDate() + weekOffset * 7);

      const response = await fetch("/api/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          data: { weekStart: tuesday.toISOString() },
        }),
      });

      if (!response.ok) throw new Error("Error al generar");
      await mutate("/api/schedule");
    } catch (err) {
      console.error(err);
    } finally {
      setGenerating(false);
    }
  };

  const startDate = useMemo(
    () => (schedule ? new Date(schedule.weekStart) : getTuesday(new Date())),
    [schedule],
  );

  const days = useMemo(() => {
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(startDate);
      d.setDate(startDate.getDate() + i);
      dates.push({
        iso: d.toISOString().split("T")[0],
        label: `${["Mar", "Mie", "Jue", "Vie", "Sab", "Dom", "Lun"][i]} ${d.getDate()}/${d.getMonth() + 1}`,
      });
    }
    return dates;
  }, [startDate]);

  const entriesByRoute = useMemo(() => {
    const map = new Map<string, Map<string, ScheduleEntry[]>>();
    schedule?.entries.forEach((entry) => {
      if (!map.has(entry.route)) map.set(entry.route, new Map());
      const routeDays = map.get(entry.route)!;
      if (!routeDays.has(entry.date)) routeDays.set(entry.date, []);
      routeDays.get(entry.date)!.push(entry);
    });
    return map;
  }, [schedule]);

  if (error)
    return (
      <div className="py-20 text-center text-destructive">
        Error al cargar datos
      </div>
    );
  if (isLoading)
    return <div className="py-20 text-center">Cargando Horarios...</div>;

  return (
    <div className="flex h-full flex-col gap-4">
      {/* Controles y Resumen de Grupos (Dinámico) */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setWeekOffset((p) => p - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-xs font-medium w-28 text-center">
            {weekOffset === 0
              ? "Semana Actual"
              : `Semana ${weekOffset > 0 ? "+" : ""}${weekOffset}`}
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setWeekOffset((p) => p + 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button onClick={handleGenerate} disabled={generating} size="sm">
            <RefreshCw
              className={cn("mr-2 h-4 w-4", generating && "animate-spin")}
            />{" "}
            Re-optimizar
          </Button>
        </div>
      </div>

      {/* Cards de Grupos con colores de la base de datos */}
      <div className="grid grid-cols-3 gap-3">
        {groups.map((group) => (
          <Card
            key={group.id}
            style={{ borderLeftColor: group.color }}
            className="border-l-4"
          >
            <CardContent className="p-3 flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase font-bold text-muted-foreground">
                  Grupo {group.name}
                </p>
                <p className="text-sm font-bold">{group.hours} Horas</p>
              </div>
              <Badge variant="outline" className="text-[10px]">
                {employees.filter((e) => e.group.id === group.id).length} Emp.
              </Badge>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs
        defaultValue="routes"
        className="flex-1 flex flex-col overflow-hidden"
      >
        <TabsList className="grid w-full max-w-100 grid-cols-2 mb-2">
          <TabsTrigger value="routes" className="text-xs gap-2">
            <LayoutGrid className="h-3.5 w-3.5" /> Cobertura
          </TabsTrigger>
          <TabsTrigger value="employees" className="text-xs gap-2">
            <Users className="h-3.5 w-3.5" /> Personal
          </TabsTrigger>
        </TabsList>

        <TabsContent
          value="routes"
          className="flex-1 overflow-auto rounded-xl border bg-card"
        >
          <Table>
            <TableHeader className="sticky top-0 z-20 bg-card shadow-sm">
              <TableRow>
                <TableHead className="w-45 sticky left-0 z-30 bg-card border-r">
                  Ruta
                </TableHead>
                {days.map((day, i) => (
                  <TableHead key={i} className="text-center">
                    {day.label}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {routes.map((route) => {
                const routeData = entriesByRoute.get(route.label);
                return (
                  <TableRow key={route.value}>
                    <TableCell className="font-bold text-xs sticky left-0 bg-card z-10 border-r py-4">
                      {route.label}
                    </TableCell>
                    {days.map((day) => {
                      const dayEntries = routeData?.get(day.iso) || [];
                      // Suma de horas usando el groupsMap dinámico
                      const totalHours = dayEntries.reduce(
                        (sum, e) => sum + (groupsMap[e.group]?.hours || 0),
                        0,
                      );
                      const isComplete = totalHours >= 24;

                      return (
                        <TableCell key={day.iso} className="p-2 align-top">
                          <div className="flex flex-col gap-1.5">
                            {dayEntries.map((e) => (
                              <div
                                key={e.id}
                                style={{
                                  borderLeftColor: groupsMap[e.group]?.color,
                                }}
                                className="p-1.5 rounded border text-[10px] border-l-4 transition-all hover:scale-[1.02] bg-secondary/30"
                              >
                                <div className="flex justify-between font-bold">
                                  <span>
                                    G.{e.group} ({groupsMap[e.group]?.hours}h)
                                  </span>
                                  <span>{e.startTime}</span>
                                </div>
                                <div className="truncate opacity-90">
                                  {e.employeeName}
                                </div>
                              </div>
                            ))}
                            {dayEntries.length > 0 && (
                              <div
                                className={cn(
                                  "mt-1 py-0.5 px-2 rounded-full text-[9px] font-bold text-center border",
                                  isComplete
                                    ? "bg-primary/10 border-primary text-primary"
                                    : "bg-destructive/10 border-destructive text-destructive",
                                )}
                              >
                                {isComplete ? (
                                  <>
                                    <CheckCircle2 className="inline h-3 w-3 mr-1" />{" "}
                                    Completa
                                  </>
                                ) : (
                                  <>
                                    <AlertCircle className="inline h-3 w-3 mr-1" />{" "}
                                    Faltan {24 - totalHours}h
                                  </>
                                )}
                              </div>
                            )}
                          </div>
                        </TableCell>
                      );
                    })}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function getTuesday(d: Date): Date {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day <= 2 ? 2 : 9);
  const tuesday = new Date(date.setDate(diff));
  tuesday.setHours(0, 0, 0, 0);
  return tuesday;
}
