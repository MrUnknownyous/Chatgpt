"use client";

import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";

const WORKOUTS_QUERY_KEY = ["workouts"] as const;

interface WorkoutSet {
  lift: string;
  weight: number | null;
  reps: number;
}

interface Workout {
  id: string;
  ts: string | null;
  bodypart: string | null;
  notes: string | null;
  workout_sets?: WorkoutSet[];
}

async function fetchWorkouts() {
  const response = await fetch("/api/workouts");
  if (!response.ok) {
    throw new Error("Failed to load workouts");
  }

  return (await response.json()) as { workouts: Workout[] };
}

export function GymWidget() {
  const workoutsQuery = useQuery({
    queryKey: WORKOUTS_QUERY_KEY,
    queryFn: fetchWorkouts,
    refetchInterval: 120_000,
    staleTime: 60_000,
  });

  const workouts = workoutsQuery.data?.workouts ?? [];

  return (
    <div className="space-y-4">
      {workouts.length === 0 && (
        <p className="text-sm text-muted-foreground">
          Log your training sessions to see them here. Capture notes per body
          part and detail individual sets.
        </p>
      )}
      <div className="space-y-3">
        {workouts.map((workout) => (
          <div
            key={workout.id}
            className="space-y-2 rounded-xl border border-border bg-background/40 p-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="font-semibold">
                  {workout.bodypart || "Full body"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {format(
                    new Date(workout.ts ?? Date.now()),
                    "MMM d, yyyy 'at' h:mm a"
                  )}
                </p>
              </div>
              {workout.notes && (
                <p className="max-w-xs text-sm text-muted-foreground">
                  {workout.notes}
                </p>
              )}
            </div>
            <div className="space-y-1 text-xs">
              {(workout.workout_sets || []).map((set, idx) => (
                <div
                  key={`${workout.id}-${idx}`}
                  className="flex items-center justify-between rounded-md bg-muted/60 px-3 py-1"
                >
                  <span className="font-medium">{set.lift}</span>
                  <span>
                    {set.weight ? `${set.weight} lb` : "BW"} × {set.reps} reps
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
