"use client";

import { useMemo } from "react";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { Button } from "../ui/button";
import { format } from "date-fns";

const HABITS_QUERY_KEY = ["habits"] as const;

interface Habit {
  id: string;
  name: string;
  goal_per_day: number;
}

interface HabitLog {
  id: string;
  habit_id: string;
  ts: string;
  qty: number;
}

async function fetchHabits() {
  const response = await fetch("/api/habits");
  if (!response.ok) {
    throw new Error("Failed to load habits");
  }

  return (await response.json()) as { habits: Habit[]; logs: HabitLog[] };
}

async function createHabitLog(payload: { habit_id: string; qty: number }) {
  const response = await fetch("/api/habits/log", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("Failed to log habit");
  }

  return response.json();
}

export function HabitsWidget() {
  const queryClient = useQueryClient();

  const habitsQuery = useQuery({
    queryKey: HABITS_QUERY_KEY,
    queryFn: fetchHabits,
    refetchInterval: 60_000,
    staleTime: 30_000,
  });

  const logHabitMutation = useMutation({
    mutationFn: createHabitLog,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: HABITS_QUERY_KEY });
    },
  });

  const habits = habitsQuery.data?.habits ?? [];
  const logs = habitsQuery.data?.logs ?? [];
  const todayKey = new Date().toISOString().slice(0, 10);

  const logsByHabit = useMemo(() => {
    return logs.reduce<Record<string, HabitLog[]>>((acc, log) => {
      const list = acc[log.habit_id] ?? [];
      list.push(log);
      acc[log.habit_id] = list;
      return acc;
    }, {});
  }, [logs]);

  async function handleLog(habitId: string) {
    await logHabitMutation.mutateAsync({ habit_id: habitId, qty: 1 });
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
          const habitLogs = logsByHabit[habit.id] ?? [];
          const todayCount = habitLogs
            .filter((log) => (log.ts ?? "").slice(0, 10) === todayKey)
            .reduce((acc, log) => acc + (log.qty ?? 1), 0);
          const completionRatio = Math.min(
            1,
            todayCount / Math.max(habit.goal_per_day || 1, 1)
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
                <Button
                  size="sm"
                  onClick={() => {
                    void handleLog(habit.id);
                  }}
                  disabled={logHabitMutation.isPending}
                >
                  {logHabitMutation.isPending ? "Logging" : "+1"}
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
