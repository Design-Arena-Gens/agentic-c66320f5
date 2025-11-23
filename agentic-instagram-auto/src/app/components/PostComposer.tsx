"use client";

import { FormEvent, useState } from "react";

interface PostComposerProps {
  schedulingEnabled: boolean;
}

interface SubmissionResult {
  kind: "success" | "error";
  message: string;
}

export function PostComposer({ schedulingEnabled }: PostComposerProps) {
  const [caption, setCaption] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [publishAt, setPublishAt] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<SubmissionResult | undefined>();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setResult(undefined);

    try {
      const response = await fetch("/api/instagram/publish", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          caption,
          imageUrl,
          publishAt: publishAt ? new Date(publishAt).toISOString() : undefined,
        }),
      });

      const json = await response.json();

      if (!response.ok) {
        throw new Error(json.error ?? "Failed to publish to Instagram");
      }

      setResult({
        kind: "success",
        message:
          json.status === "scheduled"
            ? "Post scheduled successfully."
            : "Post published to Instagram.",
      });

      setCaption("");
      setImageUrl("");
      setPublishAt("");
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("schedule:refresh"));
      }
    } catch (error) {
      setResult({
        kind: "error",
        message:
          error instanceof Error ? error.message : "Unexpected error while publishing.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm ring-1 ring-black/5">
      <h2 className="text-xl font-semibold text-zinc-900">Create Instagram Post</h2>
      <p className="mt-2 text-sm text-zinc-600">
        Provide caption text and a publicly accessible image URL. Instagram Content Publishing API
        requires images to be reachable from the internet (for example via S3, Cloudinary, or a
        signed CDN URL).
      </p>

      <form className="mt-6 flex flex-col gap-6" onSubmit={handleSubmit}>
        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium text-zinc-700">Caption</span>
          <textarea
            required
            value={caption}
            onChange={(event) => setCaption(event.target.value)}
            rows={5}
            placeholder="Write something compelling…"
            className="w-full resize-y rounded-xl border border-zinc-200 bg-white p-3 text-sm shadow-sm focus:border-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/10"
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium text-zinc-700">Image URL</span>
          <input
            required
            value={imageUrl}
            onChange={(event) => setImageUrl(event.target.value)}
            type="url"
            placeholder="https://cdn.yoursite.com/posts/launch.jpg"
            className="w-full rounded-xl border border-zinc-200 bg-white p-3 text-sm shadow-sm focus:border-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/10"
          />
          <span className="text-xs text-zinc-500">
            Images must be JPG or PNG, between 320px and 1440px on the shortest side, and less than
            8MB.
          </span>
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium text-zinc-700">
            Schedule (optional – UTC timezone)
          </span>
          <input
            value={publishAt}
            onChange={(event) => setPublishAt(event.target.value)}
            type="datetime-local"
            className="w-full rounded-xl border border-zinc-200 bg-white p-3 text-sm shadow-sm focus:border-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 disabled:opacity-50"
            disabled={!schedulingEnabled}
          />
          {schedulingEnabled ? (
            <span className="text-xs text-zinc-500">
              Scheduled posts within the next 3 minutes publish immediately. Configure Vercel Cron to
              trigger /api/cron/dispatch at your desired cadence.
            </span>
          ) : (
            <span className="text-xs text-amber-600">
              Scheduling requires Upstash Redis credentials (see README). Without them, posts publish
              immediately.
            </span>
          )}
        </label>

        <button
          type="submit"
          className="inline-flex h-11 items-center justify-center rounded-xl bg-zinc-900 px-6 text-sm font-medium text-white transition hover:bg-zinc-700 disabled:opacity-60"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Submitting…" : "Send to Instagram"}
        </button>

        {result ? (
          <p
            className={`rounded-lg border p-3 text-sm ${
              result.kind === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-rose-200 bg-rose-50 text-rose-700"
            }`}
          >
            {result.message}
          </p>
        ) : null}
      </form>
    </section>
  );
}
