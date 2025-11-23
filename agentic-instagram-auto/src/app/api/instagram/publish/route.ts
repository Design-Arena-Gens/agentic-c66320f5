import { NextRequest, NextResponse } from "next/server";
import { publishInstagramPost } from "@/lib/instagram";
import { scheduleRepository } from "@/lib/repository";
import { assertInstagramCredentials, isSchedulingEnabled } from "@/lib/env";

const SCHEDULING_THRESHOLD_MINUTES = 3;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const caption = typeof body.caption === "string" ? body.caption.trim() : "";
    const imageUrl = typeof body.imageUrl === "string" ? body.imageUrl.trim() : "";
    const publishAtInput =
      typeof body.publishAt === "string" && body.publishAt.length > 0
        ? new Date(body.publishAt)
        : undefined;

    if (!caption) {
      return NextResponse.json(
        { error: "Caption is required" },
        { status: 400 },
      );
    }

    if (!imageUrl) {
      return NextResponse.json(
        { error: "Publicly accessible image URL is required" },
        { status: 400 },
      );
    }

    assertInstagramCredentials();

    const now = new Date();
    const payloadPublishAt = publishAtInput?.toISOString();

    const shouldSchedule =
      publishAtInput &&
      publishAtInput.getTime() - now.getTime() > SCHEDULING_THRESHOLD_MINUTES * 60 * 1000;

    if (shouldSchedule) {
      if (!isSchedulingEnabled) {
        return NextResponse.json(
          {
            error:
              "Scheduling requires Upstash Redis credentials (UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN).",
          },
          { status: 400 },
        );
      }

      const schedule = await scheduleRepository.create({
        caption,
        imageUrl,
        publishAt: payloadPublishAt!,
      });

      return NextResponse.json(
        {
          status: "scheduled",
          schedule,
        },
        { status: 201 },
      );
    }

    const publishResponse = await publishInstagramPost({
      caption,
      imageUrl,
      publishAt: payloadPublishAt,
    });

    return NextResponse.json(
      {
        status: "published",
        publishResponse,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Failed to handle Instagram publish request", error);

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown error",
        details: error,
      },
      { status: 500 },
    );
  }
}
