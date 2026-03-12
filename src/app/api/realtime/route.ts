import { NextResponse } from "next/server";
import { getDependencies } from "@/infrastructure/dependencies";

export async function GET() {
  try {
    const { liveScheduleUseCase } = await getDependencies();
    const todayEntries = await liveScheduleUseCase.execute();

    return NextResponse.json(todayEntries);
  } catch (error) {
    console.error("[API GET REALTIME]:", error);
    return NextResponse.json(
      { error: "Excepción en el servidor" },
      { status: 500 },
    );
  }
}
