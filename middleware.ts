import { NextResponse, type NextRequest } from "next/server";
import { createMiddlewareClient } from "@supabase/ssr";
import { Database } from "@/types/database";
import { getSupabaseCredentials } from "@/lib/supabase/config";

const PUBLIC_PATHS = ["/login", "/auth/callback", "/api/health"];

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const { supabaseUrl, supabaseAnonKey } = getSupabaseCredentials();
  const supabase = createMiddlewareClient<Database>({
    req,
    res,
    supabaseUrl,
    supabaseKey: supabaseAnonKey,
  });

  await supabase.auth.getSession();

  const isPublic = PUBLIC_PATHS.some((path) => req.nextUrl.pathname.startsWith(path));

  if (!isPublic) {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      const redirectUrl = req.nextUrl.clone();
      redirectUrl.pathname = "/login";
      redirectUrl.searchParams.set("redirectedFrom", req.nextUrl.pathname);
      return NextResponse.redirect(redirectUrl);
    }
  }

  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
