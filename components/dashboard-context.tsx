"use client";

import { createContext, useContext } from "react";

interface DashboardContextValue {
  tz: string;
  email: string;
  widgetSettings: Record<string, any>;
  updateWidgetSettings: (next: Record<string, any>) => void;
}

export const DashboardContext = createContext<DashboardContextValue | null>(
  null
);

export function useDashboard() {
  const ctx = useContext(DashboardContext);
  if (!ctx) {
    throw new Error("useDashboard must be used inside DashboardContext");
  }
  return ctx;
}
