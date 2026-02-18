import { NextResponse } from "next/server"
import { store } from "@/lib/store"
import { parseEmployeesFromText } from "@/lib/schedule-engine"

export async function GET() {
  return NextResponse.json(store.getEmployees())
}

export async function POST(request: Request) {
  const body = await request.json()

  if (body.type === "text") {
    const parsed = parseEmployeesFromText(body.data)
    const created = store.addEmployees(parsed)
    return NextResponse.json(created)
  }

  if (body.type === "single") {
    const emp = store.addEmployee(body.data)
    return NextResponse.json(emp)
  }

  if (body.type === "bulk") {
    const created = store.addEmployees(body.data)
    return NextResponse.json(created)
  }

  return NextResponse.json({ error: "Invalid type" }, { status: 400 })
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get("id")
  if (id) {
    store.removeEmployee(id)
    return NextResponse.json({ success: true })
  }
  return NextResponse.json({ error: "ID required" }, { status: 400 })
}
