import { NextResponse } from "next/server";
import { store } from "@/lib/store";
// import { generateScheduleUseCase } from "@/infrastructure/dependencies";

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

export async function POST() {
  try {
    const nextMonday = new Date();
    // const schedule = await generateScheduleUseCase.execute(nextMonday);

    // return NextResponse.json(schedule);
  } catch (error) {
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
