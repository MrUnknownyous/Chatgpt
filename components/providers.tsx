"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createBrowserSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { SessionContextProvider } from "@supabase/auth-helpers-react";
import { ThemeProvider } from "next-themes";
import { ReactNode, useState } from "react";
import { Database } from "@/types/database";

export function Providers({ children }: { children: ReactNode }) {
  const [supabase] = useState(() =>
    createBrowserSupabaseClient<Database>()
  );
  const [queryClient] = useState(() => new QueryClient());

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <SessionContextProvider supabaseClient={supabase}>
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      </SessionContextProvider>
    </ThemeProvider>
  );
}
