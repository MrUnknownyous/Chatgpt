"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SessionContextProvider } from "@supabase/auth-helpers-react";
import { ThemeProvider } from "next-themes";
import { ReactNode, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function Providers({ children }: { children: ReactNode }) {
  const [supabase, setSupabase] = useState(() =>
    typeof window === "undefined" ? null : createClient()
  );
  const [queryClient] = useState(() => new QueryClient());

  useEffect(() => {
    if (!supabase) {
      setSupabase(createClient());
    }
  }, [supabase]);

  const content = (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      {supabase ? (
        <SessionContextProvider supabaseClient={supabase}>
          {content}
        </SessionContextProvider>
      ) : (
        content
      )}
    </ThemeProvider>
  );
}
