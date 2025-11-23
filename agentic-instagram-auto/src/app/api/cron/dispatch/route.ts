import { NextResponse } from "next/server";
import { scheduleRepository } from "@/lib/repository";
import { isSchedulingEnabled } from "@/lib/env";
import { publishInstagramPost, InstagramPublishingError } from "@/lib/instagram";

export async function POST() {
  if (!isSchedulingEnabled) {
    return NextResponse.json({ processed: 0, message: "Scheduling not configured." }, { status: 200 });
  }

  const due = await scheduleRepository.findDue(new Date());

  const results = [];

  for (const item of due) {
    try {
      await scheduleRepository.update(item.id, { status: "publishing" });

      const publishResult = await publishInstagramPost({
        caption: item.caption,
        imageUrl: item.imageUrl,
        publishAt: item.publishAt,
      });

      await scheduleRepository.update(item.id, {
        status: "published",
        creationId: publishResult.publishResult?.id ?? publishResult.containerId,
      });

      results.push({ id: item.id, status: "published" });
    } catch (error) {
      const message =
        error instanceof InstagramPublishingError
          ? error.message
          : error instanceof Error
          ? error.message
          : "Unknown error";

      await scheduleRepository.update(item.id, {
        status: "failed",
        errorMessage: message,
      });

      results.push({ id: item.id, status: "failed", error: message });
    }
  }

  return NextResponse.json(
    {
      processed: results.length,
      results,
    },
    { status: 200 },
  );
}
