"use client";
import { useState } from "react";
import { createBrowserClient } from "@supabase/ssr";

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function AuthForm() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  async function signInEmail(e: React.FormEvent) {
    e.preventDefault();
    await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${location.origin}/` },
    });
    setSent(true);
  }

  async function signInGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${location.origin}/` },
    });
  }

  return (
    <div style={{ maxWidth: 420, margin: "40px auto" }}>
      <form onSubmit={signInEmail} style={{ display: "grid", gap: 8 }}>
        <input
          type="email"
          required
          placeholder="you@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ padding: 10, border: "1px solid #ccc", borderRadius: 8 }}
        />
        <button type="submit" style={{ padding: 10, borderRadius: 8 }}>
          {sent ? "Check your email" : "Sign in with email"}
        </button>
      </form>
      <hr style={{ margin: 16 }} />
      <button onClick={signInGoogle} style={{ padding: 10, borderRadius: 8 }}>
        Continue with Google
      </button>
    </div>
  );
}
