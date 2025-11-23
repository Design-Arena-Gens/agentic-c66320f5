import { NextRequest, NextResponse } from "next/server";
import { scheduleRepository } from "@/lib/repository";
import { isSchedulingEnabled } from "@/lib/env";

export async function GET() {
  if (!isSchedulingEnabled) {
    return NextResponse.json({ schedules: [] }, { status: 200 });
  }

  const schedules = await scheduleRepository.listUpcoming();
  return NextResponse.json({ schedules }, { status: 200 });
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  if (!isSchedulingEnabled) {
    return NextResponse.json(
      {
        error:
          "Scheduling requires UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN environment variables.",
      },
      { status: 400 },
    );
  }

  const caption = typeof body.caption === "string" ? body.caption.trim() : "";
  const imageUrl = typeof body.imageUrl === "string" ? body.imageUrl.trim() : "";
  const publishAt =
    typeof body.publishAt === "string" && body.publishAt.length > 0
      ? new Date(body.publishAt).toISOString()
      : undefined;

  if (!caption || !imageUrl || !publishAt) {
    return NextResponse.json(
      { error: "Caption, imageUrl, and publishAt are required to create a schedule." },
      { status: 400 },
    );
  }

  const schedule = await scheduleRepository.create({
    caption,
    imageUrl,
    publishAt,
  });

  return NextResponse.json({ schedule }, { status: 201 });
}
