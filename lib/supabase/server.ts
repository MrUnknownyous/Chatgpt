import { cookies } from "next/headers";
import { createServerComponentClient } from "@supabase/ssr";
import { Database } from "@/types/database";
import { getSupabaseCredentials } from "./config";

export function getSupabaseServerClient() {
  const { supabaseUrl, supabaseAnonKey } = getSupabaseCredentials();
  return createServerComponentClient<Database>({
    cookies,
    supabaseUrl,
    supabaseKey: supabaseAnonKey,
  });
}
