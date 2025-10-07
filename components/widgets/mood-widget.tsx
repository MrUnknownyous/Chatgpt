"use client";

import { useState } from "react";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { format } from "date-fns";
import { Button } from "../ui/button";

interface MoodEntry {
  id: string;
  ts: string;
  score: number;
  note: string | null;
}

const MOODS_QUERY_KEY = ["moods"] as const;

async function fetchMoods() {
  const response = await fetch("/api/moods");
  if (!response.ok) {
    throw new Error("Failed to load moods");
  }

  return (await response.json()) as { moods: MoodEntry[] };
}

async function postMood(payload: { score: number; note: string }) {
  const response = await fetch("/api/moods", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("Failed to log mood");
  }

  return response.json();
}

const moodsScale = [
  { score: 1, label: "Low" },
  { score: 2, label: "Meh" },
  { score: 3, label: "Okay" },
  { score: 4, label: "Good" },
  { score: 5, label: "Peak" },
];

export function MoodWidget() {
  const [note, setNote] = useState("");
  const queryClient = useQueryClient();

  const moodsQuery = useQuery({
    queryKey: MOODS_QUERY_KEY,
    queryFn: fetchMoods,
    refetchInterval: 120_000,
    staleTime: 60_000,
  });

  const logMoodMutation = useMutation({
    mutationFn: postMood,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MOODS_QUERY_KEY });
    },
  });

  async function logMood(score: number) {
    await logMoodMutation.mutateAsync({ score, note });
    setNote("");
  }

  const moods = moodsQuery.data?.moods ?? [];

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <textarea
          value={note}
          onChange={(event) => setNote(event.target.value)}
          placeholder="Add a quick reflection"
          rows={2}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <div className="flex flex-wrap gap-2">
          {moodsScale.map((mood) => (
            <Button
              key={mood.score}
              size="sm"
              onClick={() => {
                void logMood(mood.score);
              }}
              disabled={logMoodMutation.isPending}
            >
              {logMoodMutation.isPending ? "Logging" : mood.label}
            </Button>
          ))}
        </div>
      </div>
      <div className="space-y-2">
        {moods.slice(0, 7).map((entry) => (
          <div
            key={entry.id}
            className="flex items-center justify-between rounded-lg border border-border bg-background/60 px-3 py-2 text-sm"
          >
            <div>
              <p className="font-medium">Score {entry.score}</p>
              {entry.note && (
                <p className="text-xs text-muted-foreground">{entry.note}</p>
              )}
            </div>
            <span className="text-xs text-muted-foreground">
              {format(new Date(entry.ts ?? Date.now()), "MMM d, h:mma")}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
