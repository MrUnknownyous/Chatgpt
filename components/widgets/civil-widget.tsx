"use client";

import { useQuery } from "@tanstack/react-query";
import { parseISO, differenceInCalendarDays } from "date-fns";

const TASKS_QUERY_KEY = ["tasks"] as const;

interface Task {
  id: string;
  title: string;
  due_date: string | null;
  status: "todo" | "doing" | "done";
}

async function fetchTasks() {
  const response = await fetch("/api/tasks");
  if (!response.ok) {
    throw new Error("Failed to load tasks");
  }

  return (await response.json()) as { tasks: Task[] };
}

export function CivilWidget() {
  const tasksQuery = useQuery({
    queryKey: TASKS_QUERY_KEY,
    queryFn: fetchTasks,
    staleTime: 30_000,
  });

  const upcoming = (tasksQuery.data?.tasks ?? [])
    .filter((task) => task.due_date && task.status !== "done")
    .map((task) => ({
      ...task,
      days: differenceInCalendarDays(parseISO(task.due_date!), new Date()),
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
