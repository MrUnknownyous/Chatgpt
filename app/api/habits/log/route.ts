import { NextRequest, NextResponse } from "next/server";
import { getSupabaseRouteClient } from "../../../../lib/supabase/route";

export async function POST(req: NextRequest) {
  const supabase = getSupabaseRouteClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { habit_id, qty } = body;

  const { data, error } = await supabase
    .from("habit_logs")
    .insert({ habit_id, qty, user_id: user.id })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ log: data });
}
