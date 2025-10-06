import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";
import Dashboard from "@/components/dashboard";

export const dynamic = "force-dynamic";

export default async function EmbedPage() {
  const supabase = getSupabaseServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/login");
  }

  type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
  type ProfileInsert = Database["public"]["Tables"]["profiles"]["Insert"];

  const userId = session.user.id as ProfileRow["id"];
  const upsertPayload: ProfileInsert = {
    id: userId,
    email: session.user.email ?? null,
  };

  let { data: profile } = await supabase
    .from("profiles")
    .select("widgets, tz, email")
    .match({ id: userId })
    .maybeSingle<ProfileRow>();

  if (!profile) {
    const { data: created } = await supabase
      .from("profiles")
      .upsert(upsertPayload)
      .select("widgets, tz, email")
      .single<ProfileRow>();
    profile = created ?? null;
  }

  const widgets =
    (profile?.widgets as {
      order: string[];
      hidden: string[];
      settings?: Record<string, unknown>;
    } | null) ?? {
      order: ["today", "tasks", "habits", "gym", "mood", "civil", "embeds"],
      hidden: [],
      settings: {},
    };

  return (
    <div className="min-h-screen bg-background">
      <Dashboard
        session={session}
        profile={{
          tz: profile?.tz ?? "America/New_York",
          email: profile?.email ?? session.user.email ?? "",
          widgets,
        }}
        mode="embed"
      />
    </div>
  );
}
