"use client"

import { useState } from "react"
import useSWR, { mutate } from "swr"
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  User,
  CalendarX2,
  Zap,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { Employee, ScheduleEntry, AbsenceRecord } from "@/lib/types"
import { SHIFT_CONFIG } from "@/lib/types"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

interface RestructureResult {
  absence: AbsenceRecord
  replacements: Array<{
    originalEntry: ScheduleEntry
    replacementId: string
  }>
}

export function AbsenceManager() {
  const { data: scheduleData } = useSWR("/api/schedule", fetcher)
  const { data: employees } = useSWR<Employee[]>("/api/employees", fetcher)

  const [selectedEmployee, setSelectedEmployee] = useState("")
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0])
  const [reason, setReason] = useState("")
  const [loading, setLoading] = useState(false)
  const [lastResult, setLastResult] = useState<RestructureResult | null>(null)
  const [history, setHistory] = useState<RestructureResult[]>([])

  const handleReportAbsence = async () => {
    if (!selectedEmployee || !selectedDate) return
    setLoading(true)
    try {
      const res = await fetch("/api/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "absence",
          employeeId: selectedEmployee,
          date: selectedDate,
          reason: reason || "Sin especificar",
        }),
      })
      const data = await res.json()
      if (data.error) {
        alert(data.error)
        return
      }
      setLastResult(data)
      setHistory((prev) => [data, ...prev])
      mutate("/api/schedule")
      mutate("/api/realtime")
      setSelectedEmployee("")
      setReason("")
    } finally {
      setLoading(false)
    }
  }

  const employeeMap = new Map(
    (employees || []).map((e: Employee) => [e.id, e])
  )

  const scheduledForDate =
    scheduleData?.schedule?.entries
      ?.filter((e: ScheduleEntry) => e.date === selectedDate && e.status !== "absent")
      ?.map((e: ScheduleEntry) => e.employeeId)
      ?.filter((id: string, i: number, arr: string[]) => arr.indexOf(id) === i) || []

  return (
    <div className="flex h-full flex-col gap-3">
      <h2 className="text-sm font-semibold text-foreground 2xl:text-base">Gestion de Ausencias</h2>

      <div className="grid gap-3 lg:grid-cols-2">
        {/* Report Form */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-2 pt-3">
            <CardTitle className="flex items-center gap-2 text-sm text-foreground">
              <CalendarX2 className="h-4 w-4 text-destructive" />
              Reportar Ausencia
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pb-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <Label className="text-xs text-foreground">Fecha</Label>
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="h-8 text-sm bg-secondary border-border text-foreground"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-foreground">Empleado</Label>
                <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                  <SelectTrigger className="h-8 text-sm bg-secondary border-border text-foreground">
                    <SelectValue placeholder="Selecciona empleado" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    {scheduledForDate.map((empId: string) => {
                      const emp = employeeMap.get(empId)
                      if (!emp) return null
                      return (
                        <SelectItem key={emp.id} value={emp.id}>
                          {emp.name} - {emp.role}
                        </SelectItem>
                      )
                    })}
                    {scheduledForDate.length === 0 && (
                      <SelectItem value="none" disabled>
                        No hay empleados programados
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-foreground">Motivo</Label>
              <Textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Motivo de la ausencia (opcional)"
                className="min-h-[60px] text-sm bg-secondary border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>
            <Button
              onClick={handleReportAbsence}
              disabled={loading || !selectedEmployee || selectedEmployee === "none"}
              size="sm"
              className="w-full gap-2"
            >
              <Zap className="h-3.5 w-3.5" />
              {loading ? "Reestructurando..." : "Reportar y Reestructurar"}
            </Button>
          </CardContent>
        </Card>

        {/* Last Result */}
        {lastResult ? (
          <Card className="bg-card border-primary/30 border">
            <CardHeader className="pb-2 pt-3">
              <CardTitle className="flex items-center gap-2 text-sm text-foreground">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                Reestructuracion Exitosa
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pb-4">
              <div className="rounded-md bg-primary/5 border border-primary/20 p-3">
                <p className="text-xs text-foreground">
                  <span className="font-medium">Ausencia:</span>{" "}
                  {employeeMap.get(lastResult.absence.employeeId)?.name || "Empleado"} - {lastResult.absence.date}
                </p>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  Motivo: {lastResult.absence.reason}
                </p>
              </div>

              {lastResult.replacements.length > 0 ? (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-foreground">Reemplazos:</p>
                  {lastResult.replacements.map((rep, i) => (
                    <div key={i} className="flex items-center gap-2 rounded-md bg-secondary/50 p-2 text-xs">
                      <User className="h-3.5 w-3.5 text-destructive shrink-0" />
                      <span className="text-muted-foreground line-through">
                        {employeeMap.get(lastResult.absence.employeeId)?.name}
                      </span>
                      <ArrowRight className="h-3 w-3 text-primary shrink-0" />
                      <User className="h-3.5 w-3.5 text-primary shrink-0" />
                      <span className="font-medium text-foreground">
                        {employeeMap.get(rep.replacementId)?.name || "Reemplazo"}
                      </span>
                      <Badge variant="outline" className="ml-auto text-[9px] py-0 shrink-0">
                        {SHIFT_CONFIG[rep.originalEntry.shift]?.label}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-warning">
                  <AlertTriangle className="mr-1 inline h-3.5 w-3.5" />
                  No se encontro reemplazo disponible
                </p>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-card border-border flex items-center justify-center">
            <CardContent className="py-8 text-center">
              <Zap className="mx-auto h-8 w-8 text-muted-foreground/30" />
              <p className="mt-2 text-xs text-muted-foreground">
                Reporta una ausencia para ver la reestructuracion automatica
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* History Table */}
      {history.length > 0 && (
        <div className="flex-1 overflow-auto rounded-lg border border-border bg-card">
          <Table>
            <TableHeader className="sticky top-0 z-10 bg-card">
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-[11px] font-semibold text-muted-foreground 2xl:text-xs">Empleado Ausente</TableHead>
                <TableHead className="text-[11px] font-semibold text-muted-foreground 2xl:text-xs">Fecha</TableHead>
                <TableHead className="text-[11px] font-semibold text-muted-foreground 2xl:text-xs">Motivo</TableHead>
                <TableHead className="text-[11px] font-semibold text-muted-foreground 2xl:text-xs">Reemplazo</TableHead>
                <TableHead className="text-[11px] font-semibold text-muted-foreground 2xl:text-xs">Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {history.map((item, i) => (
                <TableRow key={i} className="border-border/50">
                  <TableCell className="py-2">
                    <span className="text-xs font-medium text-foreground 2xl:text-sm">
                      {employeeMap.get(item.absence.employeeId)?.name || "Empleado"}
                    </span>
                  </TableCell>
                  <TableCell className="py-2">
                    <span className="font-mono text-xs text-muted-foreground 2xl:text-sm">{item.absence.date}</span>
                  </TableCell>
                  <TableCell className="py-2">
                    <span className="text-xs text-muted-foreground 2xl:text-sm">{item.absence.reason}</span>
                  </TableCell>
                  <TableCell className="py-2">
                    {item.replacements.length > 0 ? (
                      <span className="text-xs text-foreground 2xl:text-sm">
                        {item.replacements.map((r) => employeeMap.get(r.replacementId)?.name || "Reemplazo").join(", ")}
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">Sin reemplazo</span>
                    )}
                  </TableCell>
                  <TableCell className="py-2">
                    {item.replacements.length > 0 ? (
                      <Badge variant="outline" className="text-[10px] py-0 text-primary border-primary/30 2xl:text-xs">
                        <CheckCircle2 className="mr-1 h-3 w-3" />
                        Cubierto
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-[10px] py-0 text-destructive border-destructive/30 2xl:text-xs">
                        <AlertTriangle className="mr-1 h-3 w-3" />
                        Pendiente
                      </Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
