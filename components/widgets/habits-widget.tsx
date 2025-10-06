"use client";

import useSWR from "swr";
import { Button } from "../ui/button";
import { format } from "date-fns";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function HabitsWidget() {
  const { data, mutate } = useSWR<{ habits: any[]; logs: any[] }>(
    "/api/habits",
    fetcher,
    { refreshInterval: 60_000 }
  );

  const habits = data?.habits ?? [];
  const logs = data?.logs ?? [];
  const todayKey = new Date().toISOString().slice(0, 10);

  async function logHabit(habitId: string) {
    await fetch("/api/habits/log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ habit_id: habitId, qty: 1 }),
    });
    mutate();
  }

  return (
    <div className="space-y-4">
      {habits.length === 0 && (
        <p className="text-sm text-muted-foreground">
          Create habits from Supabase directly or via admin UI. Once added, you
          can track progress from here.
        </p>
      )}
      <div className="space-y-3">
        {habits.map((habit) => {
          const habitLogs = logs.filter((log) => log.habit_id === habit.id);
          const todayCount = habitLogs
            .filter((log) => (log.ts ?? "").slice(0, 10) === todayKey)
            .reduce((acc, log) => acc + (log.qty ?? 1), 0);
          const completionRatio = Math.min(
            1,
            todayCount / (habit.goal_per_day || 1)
          );
          return (
            <div
              key={habit.id}
              className="space-y-2 rounded-lg border border-border bg-background/50 p-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">{habit.name}</p>
                  <p className="text-xs text-muted-foreground">
                    Goal: {habit.goal_per_day} per day • Today: {todayCount}
                  </p>
                </div>
                <Button size="sm" onClick={() => logHabit(habit.id)}>
                  +1
                </Button>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${completionRatio * 100}%` }}
                />
              </div>
              <div className="flex gap-2 text-xs text-muted-foreground">
                {habitLogs.slice(0, 5).map((log) => (
                  <span key={log.id} className="rounded-full bg-secondary px-2 py-1">
                    {format(new Date(log.ts ?? Date.now()), "EEE")}: +{log.qty}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
