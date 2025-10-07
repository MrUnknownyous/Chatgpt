"use client";

import { useMemo, useState } from "react";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import { Button } from "../ui/button";

const TASKS_QUERY_KEY = ["tasks"] as const;

interface Task {
  id: string;
  title: string;
  status: "todo" | "doing" | "done";
  due_date: string | null;
  created_at: string;
}

async function fetchTasks() {
  const response = await fetch("/api/tasks");
  if (!response.ok) {
    throw new Error("Failed to load tasks");
  }

  return (await response.json()) as { tasks: Task[] };
}

async function postTask(payload: {
  title: string;
  due_date: string | null;
  status?: Task["status"];
}) {
  const response = await fetch("/api/tasks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("Failed to create task");
  }

  return response.json();
}

async function patchTask(payload: { id: string } & Partial<Task>) {
  const response = await fetch("/api/tasks", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("Failed to update task");
  }

  return response.json();
}

export function TasksWidget() {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState<string>("");
  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null);

  const tasksQuery = useQuery({
    queryKey: TASKS_QUERY_KEY,
    queryFn: fetchTasks,
    staleTime: 60_000,
  });

  const addTaskMutation = useMutation({
    mutationFn: postTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TASKS_QUERY_KEY });
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: patchTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TASKS_QUERY_KEY });
    },
    onSettled: () => setUpdatingTaskId(null),
  });

  async function handleAddTask(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!title) return;

    await addTaskMutation.mutateAsync({
      title,
      due_date: dueDate || null,
    });
    setTitle("");
    setDueDate("");
  }

  async function handleAdvanceTask(task: Task, nextStatus: Task["status"]) {
    setUpdatingTaskId(task.id);
    await updateTaskMutation.mutateAsync({ id: task.id, status: nextStatus });
  }

  const tasks = tasksQuery.data?.tasks ?? [];

  const sections = useMemo(() => {
    return tasks.reduce(
      (acc, task) => {
        acc[task.status]?.push(task);
        return acc;
      },
      {
        todo: [] as Task[],
        doing: [] as Task[],
        done: [] as Task[],
      }
    );
  }, [tasks]);

  return (
    <div className="space-y-4">
      <form
        onSubmit={handleAddTask}
        className="grid gap-2 md:grid-cols-[1fr_auto_auto]"
      >
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
        <Button type="submit" disabled={addTaskMutation.isPending}>
          {addTaskMutation.isPending ? "Adding" : "Add"}
        </Button>
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
                <TaskRow
                  key={task.id}
                  task={task}
                  onAdvance={handleAdvanceTask}
                  isUpdating={updatingTaskId === task.id && updateTaskMutation.isPending}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TaskRow({
  task,
  onAdvance,
  isUpdating,
}: {
  task: Task;
  onAdvance: (task: Task, nextStatus: Task["status"]) => Promise<void>;
  isUpdating: boolean;
}) {
  const statusCycle: Task["status"][] = ["todo", "doing", "done"];
  const nextStatus =
    statusCycle[(statusCycle.indexOf(task.status) + 1) % statusCycle.length];

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
        onClick={() => {
          void onAdvance(task, nextStatus);
        }}
        className="text-xs uppercase text-primary underline-offset-2 hover:underline"
        disabled={isUpdating}
      >
        {isUpdating
          ? "Updating..."
          : task.status === "done"
          ? "Reset"
          : "Move to " + nextStatus}
      </button>
    </div>
  );
}
