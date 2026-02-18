import { NextResponse } from "next/server"
import { store } from "@/lib/store"
import { calculateProgress } from "@/lib/schedule-engine"

export async function GET() {
  const schedule = store.getSchedule()
  const employees = store.getEmployees()

  if (!schedule) {
    return NextResponse.json({ entries: [], employees: [] })
  }

  const today = new Date().toISOString().split("T")[0]
  const todayEntries = schedule.entries
    .filter((e) => e.date === today)
    .map((entry) => {
      const progress = calculateProgress(entry)
      const employee = employees.find((emp) => emp.id === entry.employeeId)
      return {
        ...entry,
        progress,
        employeeName: employee?.name || "Desconocido",
        employeeRole: employee?.role || "",
      }
    })

  return NextResponse.json({
    entries: todayEntries,
    timestamp: new Date().toISOString(),
  })
}
