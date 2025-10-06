import { NextResponse, type NextRequest } from "next/server";
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { Database } from "./types/database";

const PUBLIC_PATHS = ["/login", "/auth/callback", "/api/health"];

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient<Database>({ req, res });

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
