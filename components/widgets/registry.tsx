import { ComponentType } from "react";
import { TodayWidget } from "./today-widget";
import { TasksWidget } from "./tasks-widget";
import { HabitsWidget } from "./habits-widget";
import { GymWidget } from "./gym-widget";
import { MoodWidget } from "./mood-widget";
import { CivilWidget } from "./civil-widget";
import { EmbedsWidget } from "./embeds-widget";

export type WidgetKey =
  | "today"
  | "tasks"
  | "habits"
  | "gym"
  | "mood"
  | "civil"
  | "embeds";

export interface WidgetDefinition {
  id: WidgetKey;
  name: string;
  description: string;
  component: ComponentType;
}

export const widgetRegistry: WidgetDefinition[] = [
  {
    id: "today",
    name: "Today",
    description: "Time, weather highlights, and focus for the day.",
    component: TodayWidget,
  },
  {
    id: "tasks",
    name: "Tasks",
    description: "Your actionable todos sorted by state and due date.",
    component: TasksWidget,
  },
  {
    id: "habits",
    name: "Habits",
    description: "Track daily habit completions and streaks.",
    component: HabitsWidget,
  },
  {
    id: "gym",
    name: "Training",
    description: "Recent workouts and logged sets.",
    component: GymWidget,
  },
  {
    id: "mood",
    name: "Mood",
    description: "Log and visualize your emotional state.",
    component: MoodWidget,
  },
  {
    id: "civil",
    name: "Civil",
    description: "Meetings, civic reminders, and personal admin.",
    component: CivilWidget,
  },
  {
    id: "embeds",
    name: "Embeds",
    description: "Surface external dashboards with secure embeds.",
    component: EmbedsWidget,
  },
];

export function getWidgetById(id: WidgetKey) {
  return widgetRegistry.find((widget) => widget.id === id);
}
