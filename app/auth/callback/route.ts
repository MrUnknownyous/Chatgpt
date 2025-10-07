import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/ssr";
import { Database } from "@/types/database";
import { cookies } from "next/headers";
import { getSupabaseCredentials } from "@/lib/supabase/config";

export async function GET(req: NextRequest) {
  const requestUrl = new URL(req.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") ?? "/";
  const redirectTo = new URL(next, requestUrl.origin);
  const { supabaseUrl, supabaseAnonKey } = getSupabaseCredentials();
  const supabase = createRouteHandlerClient<Database>({
    cookies,
    supabaseUrl,
    supabaseKey: supabaseAnonKey,
  });

  if (code) {
    await supabase.auth.exchangeCodeForSession(code);
  }

  return NextResponse.redirect(redirectTo);
}
