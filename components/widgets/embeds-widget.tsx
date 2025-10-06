"use client";

import { useState } from "react";
import { useDashboard } from "../dashboard-context";
import { Button } from "../ui/button";

interface EmbedConfig {
  title: string;
  url: string;
}

export function EmbedsWidget() {
  const { widgetSettings, updateWidgetSettings } = useDashboard();
  const embeds: EmbedConfig[] = widgetSettings.embeds ?? [];
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");

  function addEmbed(event: React.FormEvent) {
    event.preventDefault();
    if (!url) return;
    const nextEmbeds = [...embeds, { title: title || url, url }];
    updateWidgetSettings({ ...widgetSettings, embeds: nextEmbeds });
    setTitle("");
    setUrl("");
  }

  function removeEmbed(index: number) {
    const nextEmbeds = embeds.filter((_, idx) => idx !== index);
    updateWidgetSettings({ ...widgetSettings, embeds: nextEmbeds });
  }

  return (
    <div className="space-y-4">
      <form
        onSubmit={addEmbed}
        className="grid gap-2 md:grid-cols-[1fr_2fr_auto]"
      >
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Label"
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <input
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          placeholder="https://..."
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <Button type="submit">Add</Button>
      </form>
      <p className="text-xs text-muted-foreground">
        Embed dashboards (e.g., Linear, Fathom, Supabase) that allow iframe
        embedding. On the public site, use the `/embed` route for a clean layout.
      </p>
      <div className="space-y-4">
        {embeds.length === 0 && (
          <div className="rounded-lg border border-dashed border-muted-foreground/40 bg-background/40 p-4 text-sm text-muted-foreground">
            No embeds yet. Add secure URLs above. Only authenticated sessions can
            view them.
          </div>
        )}
        {embeds.map((embed, index) => (
          <div key={index} className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="font-medium">{embed.title}</p>
              <button
                type="button"
                className="text-xs uppercase text-destructive"
                onClick={() => removeEmbed(index)}
              >
                Remove
              </button>
            </div>
            <div className="overflow-hidden rounded-xl border border-border">
              <iframe
                src={embed.url}
                title={embed.title}
                className="h-64 w-full"
                sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
