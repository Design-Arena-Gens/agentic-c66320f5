import { NextRequest, NextResponse } from "next/server";
import { scheduleRepository } from "@/lib/repository";
import { isSchedulingEnabled } from "@/lib/env";

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  if (!isSchedulingEnabled) {
    return NextResponse.json({ error: "Scheduling is not configured." }, { status: 400 });
  }

  const { id } = await context.params;
  const schedule = await scheduleRepository.update(id, { status: "cancelled" });

  if (!schedule) {
    return NextResponse.json({ error: "Schedule not found." }, { status: 404 });
  }

  return NextResponse.json({ schedule }, { status: 200 });
}
