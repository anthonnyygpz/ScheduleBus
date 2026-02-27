import { getDependencies } from "@/infrastructure/dependencies";
import { NextResponse } from "next/server";

export const GET = async () => {
  const { getGroupsUseCase } = await getDependencies();
  const groups = await getGroupsUseCase.execute();
  return NextResponse.json(groups);
};
