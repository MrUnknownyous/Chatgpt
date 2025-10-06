import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { AuthForm } from "@/components/auth-form";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const supabase = getSupabaseServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session) {
    redirect("/");
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6">
      <div className="mx-auto w-full max-w-md space-y-6 rounded-2xl border border-border bg-card p-8 shadow-lg">
        <h1 className="text-2xl font-semibold">Secure Sign In</h1>
        <p className="text-sm text-muted-foreground">
          Use your email address to receive a magic link. Supabase Auth powers
          secure passwordless access and works with Cloudflare Access.
        </p>
        <AuthForm />
      </div>
    </div>
  );
}
