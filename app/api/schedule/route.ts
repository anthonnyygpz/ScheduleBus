import { NextResponse } from "next/server"
import { store } from "@/lib/store"

export async function GET() {
  const schedule = store.getSchedule()
  const employees = store.getEmployees()
  return NextResponse.json({ schedule, employees })
}

export async function POST(request: Request) {
  const body = await request.json()

  if (body.action === "generate") {
    const weekStart = body.weekStart ? new Date(body.weekStart) : undefined
    const schedule = store.generateNewSchedule(weekStart)
    return NextResponse.json(schedule)
  }

  if (body.action === "absence") {
    const result = store.reportAbsence(body.employeeId, body.date, body.reason)
    if (!result) {
      return NextResponse.json({ error: "No schedule found" }, { status: 400 })
    }
    return NextResponse.json(result)
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 })
}
