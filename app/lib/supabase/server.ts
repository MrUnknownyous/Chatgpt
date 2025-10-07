import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export function createClient() {
  const store = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (n: string) => store.get(n)?.value,
        set: (n: string, v: string, o: any) => store.set({ name: n, value: v, ...o }),
        remove: (n: string, o: any) =>
          store.set({ name: n, value: "", ...o, maxAge: 0 }),
      },
    }
  );
}

