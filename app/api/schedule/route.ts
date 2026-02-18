import { NextResponse } from "next/server";
import { store } from "@/lib/store";

export async function GET() {
  try {
    const schedule = store.getSchedule();
    const employees = store.getEmployees();
    return NextResponse.json({ schedule, employees });
  } catch (error) {
    return NextResponse.json(
      { error: "Error al obtener datos" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({})); // Evita el SyntaxError si el body está vacío
    const { action } = body;

    if (action === "generate") {
      const weekStart = body.weekStart ? new Date(body.weekStart) : new Date();
      const schedule = store.generateNewSchedule(weekStart);
      return NextResponse.json(schedule);
    }

    if (action === "absence") {
      const result = store.reportAbsence(
        body.employeeId,
        body.date,
        body.reason,
      );
      if (!result)
        return NextResponse.json(
          { error: "No se pudo procesar" },
          { status: 400 },
        );
      return NextResponse.json(result);
    }

    return NextResponse.json({ error: "Acción inválida" }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
