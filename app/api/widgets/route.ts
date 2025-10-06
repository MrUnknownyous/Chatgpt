import { NextRequest, NextResponse } from "next/server";
import { getSupabaseRouteClient } from "../../../lib/supabase/route";

export async function GET() {
  const supabase = getSupabaseRouteClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("widgets")
    .eq("id", user.id)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({
    widgets:
      data.widgets ?? {
        order: ["today", "tasks", "habits", "gym", "mood", "civil", "embeds"],
        hidden: [],
        settings: {},
      },
  });
}

export async function PUT(req: NextRequest) {
  const supabase = getSupabaseRouteClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = await req.json();
  const nextWidgets = {
    order: Array.isArray(payload.order) ? payload.order : [],
    hidden: Array.isArray(payload.hidden) ? payload.hidden : [],
    settings:
      typeof payload.settings === "object" && payload.settings !== null
        ? payload.settings
        : {},
  };

  const { error } = await supabase
    .from("profiles")
    .update({ widgets: nextWidgets })
    .eq("id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
