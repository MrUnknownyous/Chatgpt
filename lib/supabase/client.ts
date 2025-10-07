"use client";

import { createBrowserClient } from "@supabase/ssr";
import { Database } from "@/types/database";
import { getSupabaseCredentials } from "./config";

export function createClient() {
  const { supabaseUrl, supabaseAnonKey } = getSupabaseCredentials();
  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);
}
