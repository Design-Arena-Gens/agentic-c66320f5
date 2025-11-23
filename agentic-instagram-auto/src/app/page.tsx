import { PostComposer } from "./components/PostComposer";
import { ScheduleList } from "./components/ScheduleList";
import { isSchedulingEnabled } from "@/lib/env";

export default function Home() {
  const schedulingEnabled = isSchedulingEnabled;

  return (
    <div className="bg-gradient-to-br from-zinc-100 via-white to-zinc-200">
      <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-12 px-6 py-16 sm:px-10 lg:px-16">
        <header className="flex flex-col gap-6 rounded-3xl border border-zinc-200 bg-white p-10 shadow-sm ring-1 ring-black/5">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-emerald-600">
              automation toolkit
            </p>
            <h1 className="mt-2 text-4xl font-semibold text-zinc-900 sm:text-5xl">
              Automate Instagram publishing
            </h1>
          </div>
          <p className="max-w-3xl text-base text-zinc-600 sm:text-lg">
            Compose content, deliver instantly, or schedule posts via the Instagram Graph API. This
            dashboard is production-ready for Vercel deployment with Upstash Redis-backed scheduling
            and a cron endpoint for reliable publishing.
          </p>
          <div className="flex flex-col gap-3 text-sm text-zinc-500 sm:flex-row sm:items-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-1 text-emerald-700">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              {schedulingEnabled ? "Scheduling enabled" : "Immediate publishing only"}
            </span>
            <span>
              Configure environment variables for tokens. Trigger `/api/cron/dispatch` with Vercel
              Cron to process the queue.
            </span>
          </div>
        </header>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <PostComposer schedulingEnabled={schedulingEnabled} />
          <ScheduleList schedulingEnabled={schedulingEnabled} />
        </div>
      </main>
    </div>
  );
}
