import { NextResponse } from "next/server";
import { getDependencies } from "@/infrastructure/dependencies";
import {
  EmployeeFiltersDto,
  EmployeeRequestDto,
} from "@/application/dtos/employee.dto";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || undefined;
    const groupId = searchParams.get("groupId") || undefined;
    const limit = searchParams.get("limit") || undefined;
    const page = searchParams.get("page") || undefined;
    const orderBy = searchParams.get("orderBy") || undefined;
    const status = searchParams.get("status") || undefined;
    const ascending = searchParams.get("ascending") || undefined;

    const { getEmployeesUseCase } = await getDependencies();

    const filters: EmployeeFiltersDto = {
      search: search,
      limit: parseInt(limit ?? "20"),
      page: parseInt(page ?? "1"),
      status: status,
      orderBy: orderBy,
      ascending: ascending?.toString() === "true" ? true : false,
      groupId: parseInt(groupId ?? ""),
    };

    const employees = await getEmployeesUseCase.execute(filters);

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
