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
import { LayoutGrid, Users } from "lucide-react";
import { useGroups } from "../group-manager";
import { useRoutes } from "../route-manager";
import ErrorText from "../ui/error-text";
import Loading from "../ui/loading";
import GroupCards from "./components/GroupCards";
import ToolbarSchedule from "./components/ToolbarSchedule";
import { useSchedule } from "./hooks/useSchedule";
import { useScheduleDerivedData } from "./hooks/useScheduleDerivedData";
import { useEmployees } from "../employee-manager/hooks/useEmployees";
import { Input } from "../ui/input";
import { useState } from "react";
import TableEmployeeSchedule from "./components/TableEmployeeSchedule";

export function ScheduleView() {
  const [searchQuery, setSearchQuery] = useState<string>("");

  const { routeOptions: routes } = useRoutes();
  const { data: schedule, error, isLoading } = useSchedule();
  const { data: groups } = useGroups();
  const { data: employees } = useEmployees(searchQuery);
  const { startDate, days, entriesByRoute, groupsMap } = useScheduleDerivedData(
    schedule,
    groups,
  );

  const handleSearchQuery = (e: React.ChangeEvent<HTMLInputElement> | "") => {
    if (e === "") {
      setSearchQuery("");
      return;
    }
    setSearchQuery(e.target.value);
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
      <ToolbarSchedule schedule={schedule} groups={groups} />
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
          className="flex-1 overflow-auto rounded-xl border bg-card"
        >
          <div className="bg-card p-4">
            <div className="hidden print:block mb-4">
              <h1 className="text-xl font-bold">
                Horario de Rutas - ShiftFlow
              </h1>
              <p className="text-sm">
                Semana del {startDate.toLocaleDateString()} al {days[6]?.label}
              </p>
            </div>

            <div className="flex-1 overflow-auto rounded-xl border bg-card">
              <div className="p-4 bg-background text-foreground">
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
                            const dayEntries = (
                              routeData?.get(day.iso) || []
                            ).filter((e) => isTimeInRange(e.startTime));

                            const totalHours = dayEntries.reduce(
                              (sum, e) =>
                                sum + (groupsMap[e.group]?.hours || 0),
                              0,
                            );

                            // Meta original: 16.5h (5:30 AM a 10:00 PM).
                            // Meta ajustada: 16.0h (16.5h - 0.5h de descanso)
                            const targetHours = 16.0;
                            const isComplete = totalHours >= targetHours;
                            const remainingHours = Math.max(
                              0,
                              targetHours - totalHours,
                            );

                            const renderRemainingTime = () => {
                              if (isComplete) return "Cubierto";

                              if (remainingHours === 0.5) {
                                return "Faltan: 30m";
                              }

                              if (remainingHours % 1 !== 0) {
                                const h = Math.floor(remainingHours);
                                return `Faltan: ${h}h 30m`;
                              }

                              return `Faltan: ${remainingHours}h`;
                            };

                            return (
                              <TableCell
                                key={day.iso}
                                className="p-2 align-top"
                              >
                                <div className="flex flex-col gap-1.5">
                                  {dayEntries.map((e) => (
                                    <div
                                      key={e.id}
                                      style={{
                                        borderLeftColor:
                                          groupsMap[e.group]?.color,
                                      }}
                                      className="p-1.5 rounded border text-[10px] border-l-4 bg-secondary/30"
                                    >
                                      <div className="flex justify-between font-bold">
                                        <span>
                                          G.{e.group} (
                                          {groupsMap[e.group]?.hours}h)
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
                                      {renderRemainingTime()}
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
          className="flex-1 overflow-auto rounded-xl border bg-card"
        >
          <div className="bg-card p-4">
            <div className="mb-4">
              <Input
                onChange={handleSearchQuery}
                placeholder="Buscar por nombre"
                className="w-full"
              />
            </div>
            <TableEmployeeSchedule
              employees={employees}
              groupsMap={groupsMap}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
