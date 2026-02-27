"use client";

import { useState } from "react";
import useSWR, { mutate } from "swr";
import {
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  Users,
  Clock,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { ScheduleEntry } from "@/core/entities/schedule.type";
// import { GROUP_CONFIG, ROUTES } from "@/core/entities/types.type";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

// Colores específicos para visualizar el "Tetris" de piezas A, B y C
const GROUP_COLORS = {
  A: "bg-blue-500/10 border-blue-500/50 text-blue-400", // 10h
  B: "bg-emerald-500/10 border-emerald-500/50 text-emerald-400", // 8h
  C: "bg-amber-500/10 border-amber-500/50 text-amber-400", // 6h
};

export function ScheduleView() {
  const { data, error, isLoading } = useSWR("/api/schedule", fetcher);
  const [generating, setGenerating] = useState(false);
  const [weekOffset, setWeekOffset] = useState(0);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const tuesday = getTuesday(new Date());
      tuesday.setDate(tuesday.getDate() + weekOffset * 7);

      const response = await fetch("/api/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "generate",
          weekStart: tuesday.toISOString(),
        }),
      });

      if (!response.ok) throw new Error("Error al generar");

      await mutate("/api/schedule");
      await mutate("/api/realtime");
    } catch (err) {
      console.error(err);
    } finally {
      setGenerating(false);
    }
  };

  if (error)
    return (
      <div className="py-20 text-center text-destructive">
        Error al cargar el sistema de rutas
      </div>
    );
  if (isLoading)
    return (
      <div className="py-20 text-center">Cargando Tetris de Horarios...</div>
    );

  const { schedule, employees = [] } = data;
  const startDate = schedule
    ? new Date(schedule.weekStart)
    : getTuesday(new Date());

  // Generar etiquetas de Martes a Martes
  const days: string[] = [];
  const dayLabels: string[] = [];
  const dayNames = ["Mar", "Mie", "Jue", "Vie", "Sab", "Dom", "Lun"];
  for (let i = 0; i < 7; i++) {
    const d = new Date(startDate);
    d.setDate(d.getDate() + i);
    days.push(d.toISOString().split("T")[0]);
    dayLabels.push(`${dayNames[i]} ${d.getDate()}/${d.getMonth() + 1}`);
  }

  // Agrupar por Ruta para verificar cobertura de 24h
  const entriesByRoute = new Map<string, Map<string, ScheduleEntry[]>>();
  schedule?.entries.forEach((entry: ScheduleEntry) => {
    if (!entriesByRoute.has(entry.route))
      entriesByRoute.set(entry.route, new Map());
    const routeDays = entriesByRoute.get(entry.route)!;
    if (!routeDays.has(entry.date)) routeDays.set(entry.date, []);
    routeDays.get(entry.date)!.push(entry);
  });

  return (
    <div className="flex h-full flex-col gap-4">
      {/* Encabezado de Control */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Control de Cobertura (Martes a Martes)
          </h2>
          <p className="text-xs text-muted-foreground">
            Sistema de optimización de 24 horas por ruta
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center border rounded-md p-1 bg-card">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setWeekOffset((p) => p - 1)}
              className="h-7 w-7"
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
              className="h-7 w-7"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <Button
            onClick={handleGenerate}
            disabled={generating}
            size="sm"
            className="shadow-lg"
          >
            <RefreshCw
              className={cn("mr-2 h-4 w-4", generating && "animate-spin")}
            />
            Re-optimizar Rutas
          </Button>
        </div>
      </div>

      {/* Resumen de Categorías (Piezas del Tetris) */}
      <div className="grid grid-cols-3 gap-3">
        {/* {Object.entries(GROUP_CONFIG).map(([key, config]: [string, any]) => ( */}
        {/*   <Card */}
        {/*     key={key} */}
        {/*     className={cn( */}
        {/*       "border-l-4", */}
        {/*       key === "A" */}
        {/*         ? "border-l-blue-500" */}
        {/*         : key === "B" */}
        {/*           ? "border-l-emerald-500" */}
        {/*           : "border-l-amber-500", */}
        {/*     )} */}
        {/*   > */}
        {/*     <CardContent className="p-3 flex items-center justify-between"> */}
        {/*       <div> */}
        {/*         <p className="text-[10px] uppercase font-bold text-muted-foreground"> */}
        {/*           Grupo {key} */}
        {/*         </p> */}
        {/*         <p className="text-sm font-bold">{config.hours} Horas</p> */}
        {/*       </div> */}
        {/*       <Badge variant="outline" className="text-[10px]"> */}
        {/*         {employees.filter((e: any) => e.group === key).length} Emp. */}
        {/*       </Badge> */}
        {/*     </CardContent> */}
        {/*   </Card> */}
        {/* ))} */}
      </div>

      <Tabs
        defaultValue="routes"
        className="flex-1 flex flex-col overflow-hidden"
      >
        <TabsList className="grid w-full max-w-100 grid-cols-2 mb-2">
          <TabsTrigger value="routes" className="text-xs gap-2">
            <LayoutGrid className="h-3.5 w-3.5" /> Cobertura por Ruta
          </TabsTrigger>
          <TabsTrigger value="employees" className="text-xs gap-2">
            <Users className="h-3.5 w-3.5" /> Vista de Personal
          </TabsTrigger>
        </TabsList>

        {/* VISTA PRINCIPAL: TETRIS POR RUTA */}
        <TabsContent
          value="routes"
          className="flex-1 overflow-auto rounded-xl border bg-card"
        >
          <Table>
            <TableHeader className="sticky top-0 z-20 bg-card shadow-sm">
              <TableRow>
                <TableHead className="w-45 bg-card sticky left-0 z-30 border-r">
                  Ruta / Cobertura
                </TableHead>
                {dayLabels.map((label, i) => (
                  <TableHead key={i} className="text-center min-w-30">
                    {label}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* {ROUTES.map((route) => { */}
              {/*   const routeData = entriesByRoute.get(route); */}
              {/*   return ( */}
              {/*     <TableRow key={route} className="hover:bg-transparent"> */}
              {/*       <TableCell className="font-bold text-xs sticky left-0 bg-card z-10 border-r py-4"> */}
              {/*         {route} */}
              {/*         <div className="mt-1 flex gap-1 items-center"> */}
              {/*           <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" /> */}
              {/*           <span className="text-[10px] text-muted-foreground font-normal"> */}
              {/*             24h Monitoreadas */}
              {/*           </span> */}
              {/*         </div> */}
              {/*       </TableCell> */}
              {/*       {days.map((day) => { */}
              {/*         const dayEntries = routeData?.get(day) || []; */}
              {/*         const totalHours = dayEntries.reduce( */}
              {/*           (sum, e) => sum + GROUP_CONFIG[e.group].hours, */}
              {/*           0, */}
              {/*         ); */}
              {/*         const hasGap = totalHours < 24 && dayEntries.length > 0; */}
              {/**/}
              {/*         return ( */}
              {/*           <TableCell key={day} className="p-2 align-top"> */}
              {/*             <div className="flex flex-col gap-1.5"> */}
              {/*               {dayEntries.length > 0 ? ( */}
              {/*                 <> */}
              {/*                   {dayEntries */}
              {/*                     .sort((a, b) => */}
              {/*                       a.startTime.localeCompare(b.startTime), */}
              {/*                     ) */}
              {/*                     .map((e) => ( */}
              {/*                       <div */}
              {/*                         key={e.id} */}
              {/*                         className={cn( */}
              {/*                           "p-1.5 rounded border text-[10px] flex flex-col gap-0.5 transition-all hover:scale-[1.02]", */}
              {/*                           GROUP_COLORS[e.group], */}
              {/*                         )} */}
              {/*                       > */}
              {/*                         <div className="flex justify-between font-bold"> */}
              {/*                           <span> */}
              {/*                             Grupo. {e.group} ( */}
              {/*                             {GROUP_CONFIG[e.group].hours}h) */}
              {/*                           </span> */}
              {/*                           <span>{e.startTime}</span> */}
              {/*                         </div> */}
              {/*                         <div className="truncate opacity-90"> */}
              {/*                           {e.employeeName} */}
              {/*                         </div> */}
              {/*                       </div> */}
              {/*                     ))} */}
              {/*                   {/* Indicador de Hueco / Tetris Completo */}
              {/*                   <div */}
              {/*                     className={cn( */}
              {/*                       "mt-1 py-0.5 px-2 rounded-full text-[9px] font-bold text-center border", */}
              {/*                       hasGap */}
              {/*                         ? "bg-destructive/10 border-destructive text-destructive" */}
              {/*                         : "bg-primary/10 border-primary text-primary", */}
              {/*                     )} */}
              {/*                   > */}
              {/*                     {hasGap ? ( */}
              {/*                       <span className="flex items-center justify-center gap-1"> */}
              {/*                         <AlertCircle className="h-3 w-3" /> Faltan{" "} */}
              {/*                         {24 - totalHours}h */}
              {/*                       </span> */}
              {/*                     ) : ( */}
              {/*                       <span className="flex items-center justify-center gap-1"> */}
              {/*                         <CheckCircle2 className="h-3 w-3" /> Ruta */}
              {/*                         Completa (24h) */}
              {/*                       </span> */}
              {/*                     )} */}
              {/*                   </div> */}
              {/*                 </> */}
              {/*               ) : ( */}
              {/*                 <div className="py-8 text-center opacity-20 italic text-[10px]"> */}
              {/*                   Sin asignar */}
              {/*                 </div> */}
              {/*               )} */}
              {/*             </div> */}
              {/*           </TableCell> */}
              {/*         ); */}
              {/*       })} */}
              {/*     </TableRow> */}
              {/*   ); */}
              {/* })} */}
            </TableBody>
          </Table>
        </TabsContent>

        <TabsContent
          value="employees"
          className="flex-1 text-center py-20 border rounded-xl bg-card/50 italic text-muted-foreground"
        >
          Utiliza esta vista para buscar a uno de los 189 empleados específicos
          y sus rutas asignadas.
        </TabsContent>
      </Tabs>
    </div>
  );
}

function getTuesday(d: Date): Date {
  const date = new Date(d);
  const day = date.getDay();
  // Ajuste para encontrar el martes (2)
  const diff = date.getDate() - day + (day <= 2 ? 2 : 9);
  const tuesday = new Date(date.setDate(diff));
  tuesday.setHours(0, 0, 0, 0);
  return tuesday;
}
