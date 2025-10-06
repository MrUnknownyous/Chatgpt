import { NextRequest, NextResponse } from "next/server";
import { getSupabaseRouteClient } from "@/lib/supabase/route";

export async function GET() {
  const supabase = getSupabaseRouteClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: habits, error } = await supabase
    .from("habits")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  const since = new Date();
  since.setDate(since.getDate() - 7);

  const { data: logs, error: logError } = await supabase
    .from("habit_logs")
    .select("*")
    .gte("ts", since.toISOString())
    .order("ts", { ascending: false });

  if (logError) {
    return NextResponse.json({ error: logError.message }, { status: 400 });
  }

  return NextResponse.json({ habits, logs });
}

export async function POST(req: NextRequest) {
  const supabase = getSupabaseRouteClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { name, goal_per_day } = body;

  const { data, error } = await supabase
    .from("habits")
    .insert({ name, goal_per_day, user_id: user.id })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ habit: data });
}
