import { getDependencies } from "@/infrastructure/dependencies";
import { NextResponse } from "next/server";

export async function GET() {
  const { getRoutesUseCase } = await getDependencies();
  const routes = await getRoutesUseCase.execute();
  return NextResponse.json(routes);
}
