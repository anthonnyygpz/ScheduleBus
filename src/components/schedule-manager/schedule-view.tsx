"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/core/utils/tw";
import {
  LayoutGrid,
  Users,
  Loader2,
  Search,
  X,
  AlertTriangle,
} from "lucide-react";
import { useEmployees } from "../employee-manager/hooks/useEmployees";
import { useFilterEmployee } from "../employee-manager/hooks/useFilterEmployee";
import { useGroups } from "../group-manager";
import { useRoutes } from "../route-manager";
import ErrorText from "../ui/error-text";
import { Input } from "../ui/input";
import Loading from "../ui/loading";
import GroupCards from "./components/GroupCards";
import TableEmployeeSchedule from "./components/TableEmployeeSchedule";
import ToolbarSchedule from "./components/ToolbarSchedule";
import { useSchedule } from "./hooks/useSchedule";
import {
  getTuesday,
  useScheduleDerivedData,
} from "./hooks/useScheduleDerivedData";
import { Button } from "@/components/ui/button";
import { useMemo, useState } from "react";

export function ScheduleView() {
  const [weekOffset, setWeekOffset] = useState<number>(0);

  const weekStartDate = useMemo(() => {
    const tuesday = getTuesday(new Date());
    tuesday.setDate(tuesday.getDate() + weekOffset * 7);
    return tuesday;
  }, [weekOffset]);

  const { routeOptions: routes } = useRoutes();
  const { filters, handleFilters } = useFilterEmployee();
  const { data: schedule, error, isLoading } = useSchedule(weekStartDate);
  const { data: groups } = useGroups();
  const { data: employees, metadata, isSearching } = useEmployees(filters);
  const { startDate, days, entriesByRoute, groupsMap } = useScheduleDerivedData(
    schedule,
    groups,
  );

  const handleWeekOffset = (offset: number | ((prev: number) => number)) => {
    setWeekOffset(offset);
  };

  const isTimeInRange = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(":").map(Number);
    const totalMinutes = hours * 60 + minutes;
    const startRange = 5 * 60 + 30; // 05:30
    const endRange = 22 * 60; // 22:00
    return totalMinutes >= startRange && totalMinutes <= endRange;
  };

  if (error) return <ErrorText>Error al cargar datos</ErrorText>;
  if (isLoading) return <Loading>Cargando Horarios...</Loading>;

  return (
    <div className="flex h-full flex-col gap-4">
      <ToolbarSchedule
        schedule={schedule}
        groups={groups}
        weekOffset={weekOffset}
        handleWeekOffset={handleWeekOffset}
      />
      <GroupCards />

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
          className="flex-1 flex flex-col rounded-xl border bg-card overflow-hidden"
        >
          <div className="flex flex-col h-full">
            <div className="bg-card p-2 pb-0">
              <div className="hidden print:block mb-4">
                <h1 className="text-xl font-bold">Horario de Rutas</h1>
                <p className="text-sm">
                  Semana del {startDate.toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="flex-1 px-2 pb-2 overflow-hidden">
              <div className="h-full border rounded-xl overflow-auto border-border">
                <Table containerClassName="h-full">
                  <TableHeader>
                    <TableRow className="border-b-0 hover:bg-transparent">
                      <TableHead isSticky className="w-45 left-0 z-40 border-r">
                        Ruta
                      </TableHead>
                      {days.map((day, i) => (
                        <TableHead
                          key={i}
                          isSticky
                          className="text-center z-20"
                        >
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
                          <TableCell className="font-bold text-xs sticky left-0 bg-card z-10 border-r py-4 shadow-[1px_0_0_var(--color-border)]">
                            {route.label}
                          </TableCell>
                          {days.map((day) => {
                            const dayEntries = (
                              routeData?.get(day.iso) || []
                            ).filter((e) => isTimeInRange(e.startTime));

                            const totalHours = dayEntries
                              .filter((e) => e.status !== "absent")
                              .reduce((sum, e) => {
                                // Calculamos la duración real en minutos de esta entrada específica
                                const [startH, startM] = e.startTime
                                  .split(":")
                                  .map(Number);
                                const [endH, endM] = e.endTime
                                  .split(":")
                                  .map(Number);

                                const durationMinutes =
                                  endH * 60 + endM - (startH * 60 + startM);
                                return sum + durationMinutes / 60; // Convertimos a horas reales
                              }, 0);

                            const targetWorkHours = 16.0;
                            const isComplete = totalHours >= targetWorkHours;

                            const remainingWorkHours = Math.max(
                              0,
                              targetWorkHours - totalHours,
                            );

                            const renderRemainingTime = () => {
                              if (isComplete) return "Cubierto";

                              if (remainingWorkHours % 1 !== 0) {
                                const h = Math.floor(remainingWorkHours);
                                return h > 0
                                  ? `Faltan: ${h}h 30m`
                                  : `Faltan: 30m`;
                              }

                              return `Faltan: ${remainingWorkHours}h`;
                            };
                            return (
                              <TableCell
                                key={day.iso}
                                // Añadimos un fondo rojizo muy sutil a toda la celda si faltan horas
                                className={cn(
                                  "p-2 align-top min-w-35 transition-colors",
                                  !isComplete && "bg-destructive/5",
                                )}
                              >
                                <div className="flex flex-col gap-1.5 h-full">
                                  {dayEntries.map((e) => (
                                    <div
                                      key={e.id}
                                      style={{
                                        borderLeftColor:
                                          groupsMap[e.group]?.color,
                                      }}
                                      className={cn(
                                        "p-1.5 rounded border text-[10px] border-l-4 transition-colors",
                                        e.status === "absent"
                                          ? "bg-red-500/20 border-red-500/50"
                                          : e.employeeName.includes("->")
                                            ? "bg-amber-500/20 border-amber-500/50"
                                            : "bg-secondary/30 border-transparent",
                                      )}
                                    >
                                      <div className="flex justify-between font-bold mb-1">
                                        <span className="truncate">
                                          G.{e.group}
                                        </span>
                                        <span className="text-muted-foreground">
                                          {e.startTime}
                                        </span>
                                      </div>

                                      <div className="truncate opacity-90 font-medium">
                                        {e.employeeName.includes("->") ? (
                                          <span className="flex flex-col gap-0.5">
                                            <span className="line-through text-muted-foreground/60 text-[9px]">
                                              {e.employeeName.split(" -> ")[0]}
                                            </span>
                                            <span className="text-amber-200 flex items-center gap-1">
                                              →{" "}
                                              {e.employeeName.split(" -> ")[1]}
                                            </span>
                                          </span>
                                        ) : e.status === "absent" ? (
                                          <span className="text-red-400 italic">
                                            ⚠️ {e.employeeName}
                                          </span>
                                        ) : (
                                          e.employeeName
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                  {!isComplete && (
                                    <div className="mt-auto pt-1">
                                      <div
                                        className="flex w-full items-center justify-center gap-1.5 rounded border border-destructive/30 bg-destructive/10 py-1.5 px-2 text-[10px] font-bold text-destructive shadow-sm"
                                        title="Horas no cubiertas en esta jornada"
                                      >
                                        <AlertTriangle className="h-3 w-3" />
                                        <span>{renderRemainingTime()}</span>
                                      </div>
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
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent
          value="employees"
          className="flex-1 flex flex-col min-h-0 rounded-xl border bg-card overflow-hidden"
        >
          <div className="flex flex-col flex-1 p-4 gap-4 bg-card min-h-0">
            <div className="w-full shrink-0">
              <Input
                onChange={(e) =>
                  handleFilters({ ...filters, search: e.target.value })
                }
                autoFocus
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

            <div className="flex-1 min-h-0 overflow-hidden">
              <TableEmployeeSchedule
                employees={employees}
                groupsMap={groupsMap}
                isSearching={isSearching}
                metadata={metadata}
                handleFilters={handleFilters}
                filters={filters}
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
