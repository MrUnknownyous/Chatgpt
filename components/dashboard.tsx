"use client";

import { useEffect, useMemo, useState } from "react";
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import type { Session } from "@supabase/supabase-js";
import { Button } from "./ui/button";
import { Settings, LogOut } from "lucide-react";
import { widgetRegistry, WidgetKey, getWidgetById } from "./widgets/registry";
import { SortableWidget } from "./widgets/sortable-widget";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { DashboardContext } from "./dashboard-context";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

interface DashboardProps {
  session: Session;
  profile: {
    tz: string;
    email: string;
    widgets: { order: string[]; hidden: string[]; settings?: Record<string, any> };
  };
  mode?: "app" | "embed";
}

export default function Dashboard({
  session: _session,
  profile,
  mode = "app",
}: DashboardProps) {
  const supabase = useMemo(() => createClient(), []);
  const [orderedWidgets, setOrderedWidgets] = useState<WidgetKey[]>(
    profile.widgets.order as WidgetKey[]
  );
  const [hiddenWidgets, setHiddenWidgets] = useState<WidgetKey[]>(
    profile.widgets.hidden as WidgetKey[]
  );
  const [widgetSettings, setWidgetSettings] = useState<Record<string, any>>(
    profile.widgets.settings ?? {}
  );
  const [settingsOpen, setSettingsOpen] = useState(false);
  const sensors = useSensors(useSensor(PointerSensor));

  useEffect(() => {
    setOrderedWidgets(profile.widgets.order as WidgetKey[]);
    setHiddenWidgets(profile.widgets.hidden as WidgetKey[]);
    setWidgetSettings(profile.widgets.settings ?? {});
  }, [profile.widgets]);

  const visibleWidgets = orderedWidgets.filter(
    (widget) => !hiddenWidgets.includes(widget)
  );

  async function persistWidgets(
    nextOrder: WidgetKey[],
    nextHidden: WidgetKey[],
    nextSettings = widgetSettings
  ) {
    await fetch("/api/widgets", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        order: nextOrder,
        hidden: nextHidden,
        settings: nextSettings,
      }),
    });
  }

  function handleDragEnd(event: any) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = orderedWidgets.indexOf(active.id as WidgetKey);
    const newIndex = orderedWidgets.indexOf(over.id as WidgetKey);
    if (oldIndex === -1 || newIndex === -1) return;

    const next = arrayMove(orderedWidgets, oldIndex, newIndex) as WidgetKey[];
    setOrderedWidgets(next);
    persistWidgets(next, hiddenWidgets);
  }

  function toggleWidget(id: WidgetKey) {
    const isHidden = hiddenWidgets.includes(id);
    const nextHidden = isHidden
      ? hiddenWidgets.filter((widget) => widget !== id)
      : [...hiddenWidgets, id];
    setHiddenWidgets(nextHidden);
    persistWidgets(orderedWidgets, nextHidden);
  }

  async function signOut() {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  function handleWidgetSettings(next: Record<string, any>) {
    setWidgetSettings(next);
    persistWidgets(orderedWidgets, hiddenWidgets, next);
  }

  return (
    <DashboardContext.Provider
      value={{
        tz: profile.tz,
        email: profile.email,
        widgetSettings,
        updateWidgetSettings: handleWidgetSettings,
      }}
    >
      <div
        className={cn(
          "min-h-screen",
          mode === "embed"
            ? "bg-transparent"
            : "bg-gradient-to-br from-background via-background to-muted"
        )}
      >
        {mode === "app" && (
          <header className="sticky top-0 z-20 border-b border-border bg-background/90 backdrop-blur">
            <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
              <div>
                <p className="text-sm text-muted-foreground">Signed in as</p>
                <h1 className="text-xl font-semibold">{profile.email}</h1>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  className="gap-2"
                  onClick={() => setSettingsOpen((prev) => !prev)}
                >
                  <Settings className="h-4 w-4" /> Customize
                </Button>
                <Button variant="outline" onClick={signOut} className="gap-2">
                  <LogOut className="h-4 w-4" />
                  Sign out
                </Button>
              </div>
            </div>
          </header>
        )}
        <main
          className={cn(
            "mx-auto flex w-full max-w-6xl flex-col gap-4 px-6 py-6",
            mode === "embed" && "px-0"
          )}
        >
          {settingsOpen && mode === "app" && (
            <Card className="border-dashed">
              <CardHeader className="flex flex-col gap-2">
                <CardTitle>Dashboard layout</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Drag tiles to reorder. Toggle visibility per tile. Changes
                  sync instantly to Supabase so every device stays aligned.
                </p>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {widgetRegistry.map((widget) => {
                  const hidden = hiddenWidgets.includes(widget.id);
                  return (
                    <button
                      key={widget.id}
                      onClick={() => toggleWidget(widget.id)}
                      className={cn(
                        "rounded-full border px-3 py-1 text-sm transition",
                        hidden
                          ? "border-dashed border-muted-foreground/60 text-muted-foreground"
                          : "border-border bg-secondary/40"
                      )}
                    >
                      {widget.name}
                      {hidden && <span className="ml-2 text-xs">(hidden)</span>}
                    </button>
                  );
                })}
              </CardContent>
            </Card>
          )}
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
            modifiers={[restrictToVerticalAxis]}
          >
            <SortableContext items={visibleWidgets} strategy={verticalListSortingStrategy}>
              <div className="grid gap-4 lg:grid-cols-2">
                {visibleWidgets.map((id) => {
                  const widget = getWidgetById(id);
                  if (!widget) return null;
                  const WidgetComponent = widget.component;
                  return (
                    <SortableWidget key={widget.id} id={widget.id}>
                      <Card className="h-full">
                        <CardHeader className="flex items-start justify-between">
                          <div>
                            <CardTitle>{widget.name}</CardTitle>
                            <p className="text-sm text-muted-foreground">
                              {widget.description}
                            </p>
                          </div>
                          <Badge variant="outline">Drag</Badge>
                        </CardHeader>
                        <CardContent>
                          <WidgetComponent />
                        </CardContent>
                      </Card>
                    </SortableWidget>
                  );
                })}
              </div>
            </SortableContext>
          </DndContext>
        </main>
      </div>
    </DashboardContext.Provider>
  );
}
