import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/ssr";
import { Database } from "@/types/database";
import { getSupabaseCredentials } from "./config";

export function getSupabaseRouteClient() {
  const { supabaseUrl, supabaseAnonKey } = getSupabaseCredentials();
  return createRouteHandlerClient<Database>({
    cookies,
    supabaseUrl,
    supabaseKey: supabaseAnonKey,
  });
}
