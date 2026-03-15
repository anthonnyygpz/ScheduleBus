import { NextResponse } from "next/server";
import { getDependencies } from "@/infrastructure/dependencies";

export const GET = async (request: Request) => {
  try {
    const { searchParams } = new URL(request.url);

    const start = searchParams.get("start") || "2000-01-01";
    const end = searchParams.get("end") || "2100-12-31";

    const { absenceRepo } = await getDependencies();
    const history = await absenceRepo.findByDateRange(start, end);

    return NextResponse.json(history);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
};

export const POST = async (request: Request) => {
  try {
    const body = await request.json();
    const { absenceRepo } = await getDependencies();

    await absenceRepo.save({
      employeeId: body.employeeId,
      date: body.date,
      reason: body.reason,
      replacementId: body.replacementId,
      originalEntryId:
        body.originalEntryId || `gen-${body.employeeId}-${body.date}`,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
};
