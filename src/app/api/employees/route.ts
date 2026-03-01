import { NextResponse } from "next/server";
import { getDependencies } from "@/infrastructure/dependencies";
import { EmployeeRequestDto } from "@/application/dtos/employee.dto";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || undefined;

    const { getEmployeesUseCase } = await getDependencies();

    const employees = await getEmployeesUseCase.execute(search);

    return NextResponse.json(employees);
  } catch (error) {
    console.error("[API GET Error]:", error);
    return NextResponse.json(
      { error: "Error al obtener empleados" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const employeeDto: EmployeeRequestDto = body.data || body;
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    const { createEmployeeUseCase } = await getDependencies();

    await createEmployeeUseCase.execute(
      employeeDto,
      id ? parseInt(id) : undefined,
    );

    return NextResponse.json(
      {
        success: true,
        message: "Empleado creado exitosamente",
      },
      { status: 201 },
    );
  } catch (error: any) {
    console.error("[API Error]:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: error.status || 500 },
    );
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (id) {
    const { deleteEmployeeUseCase } = await getDependencies();
    await deleteEmployeeUseCase.execute(parseInt(id));
    return NextResponse.json({ success: true });
  }
  return NextResponse.json({ error: "ID required" }, { status: 400 });
}
