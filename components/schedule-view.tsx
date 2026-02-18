"use client"

import { useState } from "react"
import useSWR, { mutate } from "swr"
import { CalendarClock, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { SHIFT_CONFIG } from "@/lib/types"
import type { Employee, ScheduleEntry, ShiftType } from "@/lib/types"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

function getShiftBg(shift: ShiftType) {
  switch (shift) {
    case "morning":
      return "bg-chart-1/15 border-chart-1/30 text-chart-1"
    case "afternoon":
      return "bg-chart-2/15 border-chart-2/30 text-chart-2"
    case "night":
      return "bg-chart-5/15 border-chart-5/30 text-chart-5"
  }
}

export function ScheduleView() {
  const { data, error } = useSWR("/api/schedule", fetcher)
  const [generating, setGenerating] = useState(false)
  const [weekOffset, setWeekOffset] = useState(0)

  const handleGenerate = async () => {
    setGenerating(true)
    try {
      const monday = getMonday(new Date())
      monday.setDate(monday.getDate() + weekOffset * 7)
      await fetch("/api/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "generate", weekStart: monday.toISOString() }),
      })
      mutate("/api/schedule")
      mutate("/api/realtime")
    } finally {
      setGenerating(false)
    }
  }

  if (error) {
    return <div className="py-20 text-center text-muted-foreground">Error al cargar horario</div>
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex items-center gap-2 text-muted-foreground">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          Cargando horario...
        </div>
      </div>
    )
  }

  const schedule = data.schedule
  const employees: Employee[] = data.employees || []
  const employeeMap = new Map(employees.map((e: Employee) => [e.id, e]))

  const monday = schedule ? new Date(schedule.weekStart) : getMonday(new Date())
  const days: string[] = []
  const dayLabels: string[] = []
  const dayNames = ["Lun", "Mar", "Mie", "Jue", "Vie", "Sab", "Dom"]

  for (let i = 0; i < 7; i++) {
    const d = new Date(monday)
    d.setDate(d.getDate() + i)
    days.push(d.toISOString().split("T")[0])
    dayLabels.push(`${dayNames[i]} ${d.getDate()}/${d.getMonth() + 1}`)
  }

  const entriesByEmployee = new Map<string, ScheduleEntry[]>()
  if (schedule) {
    for (const entry of schedule.entries) {
      const existing = entriesByEmployee.get(entry.employeeId) || []
      existing.push(entry)
      entriesByEmployee.set(entry.employeeId, existing)
    }
  }

  const scheduledEmployees = Array.from(entriesByEmployee.keys())
    .map((id) => employeeMap.get(id))
    .filter(Boolean) as Employee[]

  // Count shifts for inline stats
  const morningCount = schedule?.entries.filter((e: ScheduleEntry) => e.shift === "morning").length ?? 0
  const afternoonCount = schedule?.entries.filter((e: ScheduleEntry) => e.shift === "afternoon").length ?? 0
  const nightCount = schedule?.entries.filter((e: ScheduleEntry) => e.shift === "night").length ?? 0

  return (
    <div className="flex h-full flex-col gap-3">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-sm font-semibold text-foreground 2xl:text-base">Horarios Semanales</h2>
          {schedule && (
            <div className="flex items-center gap-3 text-[10px] text-muted-foreground 2xl:text-xs">
              <span className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-chart-1" />
                Mat: {morningCount}
              </span>
              <span className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-chart-2" />
                Vesp: {afternoonCount}
              </span>
              <span className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-chart-5" />
                Noct: {nightCount}
              </span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => setWeekOffset((p) => p - 1)} className="h-7 w-7">
            <ChevronLeft className="h-3.5 w-3.5" />
          </Button>
          <span className="text-xs text-muted-foreground min-w-[80px] text-center 2xl:text-sm">
            {weekOffset === 0 ? "Esta semana" : weekOffset > 0 ? `+${weekOffset} sem` : `${weekOffset} sem`}
          </span>
          <Button variant="outline" size="icon" onClick={() => setWeekOffset((p) => p + 1)} className="h-7 w-7">
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
          <Button onClick={handleGenerate} disabled={generating} size="sm" className="gap-1.5 text-xs h-8">
            <RefreshCw className={`h-3.5 w-3.5 ${generating ? "animate-spin" : ""}`} />
            Generar
          </Button>
        </div>
      </div>

      {/* Schedule Table */}
      {!schedule || scheduledEmployees.length === 0 ? (
        <div className="flex flex-1 items-center justify-center rounded-lg border border-border bg-card">
          <div className="text-center">
            <CalendarClock className="mx-auto h-10 w-10 text-muted-foreground/30" />
            <p className="mt-3 text-sm text-muted-foreground">
              No hay horario generado. Haz clic en &quot;Generar&quot; para crear uno.
            </p>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-auto rounded-lg border border-border bg-card">
          <Table>
            <TableHeader className="sticky top-0 z-10 bg-card">
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="sticky left-0 z-20 bg-card text-[11px] font-semibold text-muted-foreground min-w-[140px] 2xl:text-xs">
                  Empleado
                </TableHead>
                {dayLabels.map((label, i) => (
                  <TableHead key={i} className="text-center text-[11px] font-semibold text-muted-foreground min-w-[90px] 2xl:text-xs">
                    {label}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {scheduledEmployees.map((emp) => {
                const empEntries = entriesByEmployee.get(emp.id) || []
                return (
                  <TableRow key={emp.id} className="border-border/50">
                    <TableCell className="sticky left-0 z-10 bg-card py-1.5">
                      <p className="text-xs font-medium text-foreground 2xl:text-sm">{emp.name}</p>
                      <p className="text-[9px] text-muted-foreground 2xl:text-[10px]">{emp.role}</p>
                    </TableCell>
                    {days.map((day) => {
                      const dayEntry = empEntries.filter((e) => e.date === day)
                      return (
                        <TableCell key={day} className="py-1.5 text-center">
                          <div className="flex flex-col items-center gap-0.5">
                            {dayEntry.length > 0 ? (
                              dayEntry.map((e) => (
                                <Badge
                                  key={e.id}
                                  variant="outline"
                                  className={`text-[9px] py-0 px-1.5 2xl:text-[10px] ${getShiftBg(e.shift)}`}
                                  title={`${e.route} | ${e.startTime}-${e.endTime}`}
                                >
                                  {SHIFT_CONFIG[e.shift].label.substring(0, 3)}
                                  <span className="ml-1 opacity-70">{e.route.replace("Ruta ", "").substring(0, 4)}</span>
                                </Badge>
                              ))
                            ) : (
                              <span className="text-[10px] text-muted-foreground/30">--</span>
                            )}
                          </div>
                        </TableCell>
                      )
                    })}
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}

function getMonday(d: Date): Date {
  const date = new Date(d)
  const day = date.getDay()
  const diff = date.getDate() - day + (day === 0 ? -6 : 1)
  return new Date(date.setDate(diff))
}
