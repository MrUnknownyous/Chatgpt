"use client";

import useSWR from "swr";
import { parseISO } from "date-fns";
import { useDashboard } from "../dashboard-context";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function TodayWidget() {
  const { tz } = useDashboard();
  const now = new Date();
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    weekday: "long",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const { data: tasksData } = useSWR<{ tasks: any[] }>("/api/tasks", fetcher, {
    refreshInterval: 60_000,
  });

  const openTasks = tasksData?.tasks ?? [];
  const dueToday = openTasks.filter((task) => {
    if (!task.due_date) return false;
    const due = parseISO(task.due_date);
    const today = new Date();
    return (
      due.getFullYear() === today.getFullYear() &&
      due.getMonth() === today.getMonth() &&
      due.getDate() === today.getDate()
    );
  });
  const overdue = openTasks.filter((task) => {
    if (!task.due_date || task.status === "done") return false;
    const due = parseISO(task.due_date);
    const today = new Date();
    return due < today && !isSameDay(due, today);
  });

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm uppercase text-muted-foreground">Local time</p>
        <h2 className="text-3xl font-semibold">{formatter.format(now)}</h2>
        <p className="text-sm text-muted-foreground">Timezone: {tz}</p>
      </div>
      <div className="grid grid-cols-3 gap-3 text-center">
        <StatCard label="Open" value={openTasks.length} tone="default" />
        <StatCard label="Due today" value={dueToday.length} tone="accent" />
        <StatCard label="Overdue" value={overdue.length} tone="alert" />
      </div>
    </div>
  );
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function StatCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "default" | "accent" | "alert";
}) {
  const toneClass =
    tone === "accent"
      ? "bg-primary/10 text-primary"
      : tone === "alert"
      ? "bg-destructive/10 text-destructive"
      : "bg-secondary/60 text-foreground";
  return (
    <div className={`rounded-lg ${toneClass} px-4 py-3`}
    >
      <p className="text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="text-2xl font-semibold">{value}</p>
    </div>
  );
}
