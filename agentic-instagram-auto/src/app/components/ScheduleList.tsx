"use client";

import { formatDistanceToNow } from "date-fns";
import { useCallback, useEffect, useState } from "react";

interface ScheduleListProps {
  schedulingEnabled: boolean;
}

interface Schedule {
  id: string;
  caption: string;
  imageUrl: string;
  publishAt: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  errorMessage?: string;
}

export function ScheduleList({ schedulingEnabled }: ScheduleListProps) {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();

  const loadSchedules = useCallback(async () => {
    if (!schedulingEnabled) {
      setSchedules([]);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch("/api/schedules");
      const json = await response.json();

      if (!response.ok) {
        throw new Error(json.error ?? "Failed to load schedules.");
      }

      setSchedules(json.schedules ?? []);
      setError(undefined);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error");
    } finally {
      setLoading(false);
    }
  }, [schedulingEnabled]);

  useEffect(() => {
    void loadSchedules();
  }, [loadSchedules]);

  useEffect(() => {
    const handler = () => {
      void loadSchedules();
    };

    window.addEventListener("schedule:refresh", handler);
    return () => window.removeEventListener("schedule:refresh", handler);
  }, [loadSchedules]);

  const handleCancel = async (id: string) => {
    const confirmed = confirm("Cancel this scheduled post?");
    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(`/api/schedules/${id}`, {
        method: "DELETE",
      });
      const json = await response.json();

      if (!response.ok) {
        throw new Error(json.error ?? "Failed to cancel schedule.");
      }

      await loadSchedules();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error");
    }
  };

  if (!schedulingEnabled) {
    return (
      <section className="rounded-3xl border border-dashed border-zinc-200 bg-zinc-50 p-8 text-center text-sm text-zinc-500">
        Configure Upstash Redis credentials to enable scheduling overview.
      </section>
    );
  }

  return (
    <section className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm ring-1 ring-black/5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-zinc-900">Scheduled Posts</h2>
        <button
          type="button"
          onClick={() => loadSchedules()}
          className="text-sm font-medium text-zinc-500 hover:text-zinc-900"
        >
          Refresh
        </button>
      </div>

      {loading ? (
        <p className="mt-6 text-sm text-zinc-500">Loading scheduled posts…</p>
      ) : schedules.length === 0 ? (
        <p className="mt-6 text-sm text-zinc-500">
          No posts scheduled. Schedule one above or publish immediately.
        </p>
      ) : (
        <ul className="mt-6 space-y-4">
          {schedules.map((schedule) => (
            <li
              key={schedule.id}
              className="flex flex-col gap-2 rounded-2xl border border-zinc-200 bg-zinc-50 p-4 sm:flex-row sm:items-center sm:gap-4"
            >
              <div className="flex-1 text-left">
                <p className="text-sm font-semibold text-zinc-800 line-clamp-2">
                  {schedule.caption}
                </p>
                <p className="mt-1 text-xs text-zinc-500">
                  Publishes {new Date(schedule.publishAt).toLocaleString()} (
                  {formatDistanceToNow(new Date(schedule.publishAt), { addSuffix: true })})
                </p>
                <a
                  href={schedule.imageUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-1 inline-flex items-center text-xs font-medium text-zinc-500 hover:text-zinc-900"
                >
                  Image URL
                </a>
                <p className="mt-1 text-xs uppercase tracking-wide text-zinc-400">
                  {schedule.status}
                </p>
                {schedule.errorMessage ? (
                  <p className="mt-1 text-xs text-rose-600">{schedule.errorMessage}</p>
                ) : null}
              </div>
              {schedule.status === "pending" ? (
                <button
                  type="button"
                  className="w-full rounded-xl border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 sm:w-auto"
                  onClick={() => void handleCancel(schedule.id)}
                >
                  Cancel
                </button>
              ) : null}
            </li>
          ))}
        </ul>
      )}

      {error ? (
        <p className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
          {error}
        </p>
      ) : null}
    </section>
  );
}
