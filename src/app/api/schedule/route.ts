import { NextResponse } from "next/server";
import { getDependencies } from "@/infrastructure/dependencies";

export const GET = async (request: Request) => {
  try {
    const { searchParams } = new URL(request.url);
    const weekStartParam = searchParams.get("weekStart");

    const targetDate = weekStartParam ? new Date(weekStartParam) : new Date();

    const { getScheduleUseCase } = await getDependencies();
    const schedule = await getScheduleUseCase.execute(targetDate);

    if (!schedule) {
      return NextResponse.json(
        { message: "No hay horarios generados" },
        { status: 404 },
      );
    }

    return NextResponse.json(schedule);
  } catch (error: any) {
    console.error("[API GET SCHEDULE]:", error);
    return NextResponse.json(
      { error: "Error interno al obtener el horario" },
      { status: 500 },
    );
  }
};

export const POST = async (request: Request) => {
  try {
    const body = await request.json();

    if (body.data && body.data.weekStart) {
      const { generateScheduleUseCase } = await getDependencies();
      const targetDate = new Date(body.data.weekStart);

      const newSchedule = await generateScheduleUseCase.execute(targetDate);

      return NextResponse.json({
        message: "Horario generado correctamente",
        schedule: newSchedule,
      });
    }

    // 2. LÓGICA DE AUSENCIAS (Existente)
    const { action, employeeId, date, reason, replacementId } = body;

    if (action === "absence") {
      const { absenceRepo } = await getDependencies();

      await absenceRepo.save({
        employeeId,
        date,
        reason: reason || "Sin especificar",
        replacementId,
        // Generamos un ID de entrada original para vincularlo si es necesario
        originalEntryId: `base-${employeeId}-${date}`,
      });

      return NextResponse.json({
        message: "Ausencia registrada correctamente",
      });
    }

    // Si no coincide con ninguna de las acciones soportadas, bloqueamos
    return NextResponse.json({ error: "Acción no permitida" }, { status: 400 });
  } catch (error: any) {
    console.error("[API POST SCHEDULE]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
};
