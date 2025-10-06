"use client";

import { useState } from "react";
import useSWR from "swr";
import { format, parseISO } from "date-fns";
import { Button } from "../ui/button";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function TasksWidget() {
  const { data, mutate } = useSWR<{ tasks: any[] }>("/api/tasks", fetcher);
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState<string>("");

  async function addTask(event: React.FormEvent) {
    event.preventDefault();
    if (!title) return;
    await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, due_date: dueDate || null }),
    });
    setTitle("");
    setDueDate("");
    mutate();
  }

  const tasks = data?.tasks ?? [];
  const sections: Record<string, any[]> = {
    todo: [],
    doing: [],
    done: [],
  };
  tasks.forEach((task) => {
    sections[task.status]?.push(task);
  });

  return (
    <div className="space-y-4">
      <form onSubmit={addTask} className="grid gap-2 md:grid-cols-[1fr_auto_auto]">
        <input
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          placeholder="Capture a new task"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
        />
        <input
          type="date"
          value={dueDate}
          onChange={(event) => setDueDate(event.target.value)}
          className="rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <Button type="submit">Add</Button>
      </form>
      <div className="grid gap-4 md:grid-cols-3">
        {Object.entries(sections).map(([status, list]) => (
          <div key={status} className="space-y-3">
            <div>
              <h3 className="text-sm font-semibold uppercase text-muted-foreground">
                {status}
              </h3>
              <p className="text-xs text-muted-foreground">{list.length} items</p>
            </div>
            <div className="space-y-2">
              {list.length === 0 && (
                <p className="text-xs text-muted-foreground">Nothing here yet.</p>
              )}
              {list.map((task) => (
                <TaskRow key={task.id} task={task} onUpdate={() => mutate()} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TaskRow({ task, onUpdate }: { task: any; onUpdate: () => void }) {
  const statusCycle = ["todo", "doing", "done"] as const;
  const nextStatus = statusCycle[(statusCycle.indexOf(task.status) + 1) % statusCycle.length];

  async function advance() {
    await fetch("/api/tasks", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: task.id, status: nextStatus }),
    });
    onUpdate();
  }

  return (
    <div className="flex items-center justify-between rounded-lg border border-border bg-background/60 px-3 py-2 text-sm shadow-sm">
      <div>
        <p className="font-medium">{task.title}</p>
        {task.due_date && (
          <p className="text-xs text-muted-foreground">
            due {format(parseISO(task.due_date), "MMM d")}
          </p>
        )}
      </div>
      <button
        onClick={advance}
        className="text-xs uppercase text-primary underline-offset-2 hover:underline"
      >
        {task.status === "done" ? "Reset" : "Move to " + nextStatus}
      </button>
    </div>
  );
}
