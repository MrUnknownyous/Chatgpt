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

  const { data, error } = await supabase
    .from("workouts")
    .select("*, workout_sets(*)")
    .order("ts", { ascending: false })
    .limit(10);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ workouts: data });
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
  const { ts, bodypart, notes, sets } = body;

  const { data: workout, error } = await supabase
    .from("workouts")
    .insert({
      ts,
      bodypart,
      notes,
      user_id: user.id,
    })
    .select()
    .single();

  if (error || !workout) {
    return NextResponse.json({ error: error?.message ?? "Unknown error" }, { status: 400 });
  }

  if (Array.isArray(sets) && sets.length > 0) {
    const { error: setError } = await supabase.from("workout_sets").insert(
      sets.map((set: any) => ({ ...set, workout_id: workout.id }))
    );

    if (setError) {
      return NextResponse.json({ error: setError.message }, { status: 400 });
    }
  }

  const { data: enriched } = await supabase
    .from("workouts")
    .select("*, workout_sets(*)")
    .eq("id", workout.id)
    .single();

  return NextResponse.json({ workout: enriched ?? workout });
}
