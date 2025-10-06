"use client";

import { useState } from "react";
import useSWR from "swr";
import { format } from "date-fns";
import { Button } from "../ui/button";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const moodsScale = [
  { score: 1, label: "Low" },
  { score: 2, label: "Meh" },
  { score: 3, label: "Okay" },
  { score: 4, label: "Good" },
  { score: 5, label: "Peak" },
];

export function MoodWidget() {
  const { data, mutate } = useSWR<{ moods: any[] }>("/api/moods", fetcher, {
    refreshInterval: 120_000,
  });
  const [note, setNote] = useState("");

  async function logMood(score: number) {
    await fetch("/api/moods", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ score, note }),
    });
    setNote("");
    mutate();
  }

  const moods = data?.moods ?? [];

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
            <Button key={mood.score} size="sm" onClick={() => logMood(mood.score)}>
              {mood.label}
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
