"use client";

import { createBrowserSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { Database } from "@/types/database";

export function createClient() {
  return createBrowserSupabaseClient<Database>();
}
