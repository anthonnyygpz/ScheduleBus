import { NextResponse } from "next/server";
import { getDependencies } from "@/infrastructure/dependencies";

export const GET = async () => {
  try {
    const { getScheduleUseCase } = await getDependencies();
    const schedule = await getScheduleUseCase.execute();

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
    const { data } = body;
    const { weekStart } = data;

    if (!weekStart) {
      return NextResponse.json(
        { error: "Falta la propiedad 'weekStart' en el body" },
        { status: 400 },
      );
    }

    if (typeof weekStart !== "string") {
      return NextResponse.json(
        { error: "La propiedad 'weekStart' debe ser una fecha" },
        { status: 400 },
      );
    }
    const weekStartDate = new Date(weekStart);

    if (isNaN(weekStartDate.getTime())) {
      return NextResponse.json(
        { error: "La propiedad 'weekStart' debe ser una fecha válida" },
        { status: 400 },
      );
    }

    const { generateScheduleUseCase } = await getDependencies();
    const schedule = await generateScheduleUseCase.execute(weekStartDate);

    return NextResponse.json({
      message: "Horario generado exitosamente",
      data: schedule,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: "Error al generar el horario",
        details: error.message,
      },
      { status: 500 },
    );
  }
};
