"use client";

import useSWR from "swr";
import { parseISO, differenceInCalendarDays } from "date-fns";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function CivilWidget() {
  const { data } = useSWR<{ tasks: any[] }>("/api/tasks", fetcher);
  const upcoming = (data?.tasks ?? [])
    .filter((task) => task.due_date && task.status !== "done")
    .map((task) => ({
      ...task,
      days: differenceInCalendarDays(parseISO(task.due_date), new Date()),
    }))
    .sort((a, b) => a.days - b.days)
    .slice(0, 5);

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-dashed border-muted-foreground/40 bg-background/40 p-4 text-sm text-muted-foreground">
        Sync this tile with civic obligations: passport renewals, taxes,
        vehicle inspections, or family admin tasks. Use the Supabase Tasks table
        to schedule reminders and they will surface here automatically.
      </div>
      <div className="space-y-2">
        {upcoming.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No upcoming admin tasks. Add due dates to tasks to populate this
            feed.
          </p>
        )}
        {upcoming.map((task) => (
          <div
            key={task.id}
            className="flex items-center justify-between rounded-lg border border-border bg-background/80 px-3 py-2 text-sm"
          >
            <span className="font-medium">{task.title}</span>
            <span className="text-xs text-muted-foreground">
              {task.days <= 0 ? "Due" : `${task.days}d`}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
