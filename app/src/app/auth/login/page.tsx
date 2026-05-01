"use client";

import { useState } from "react";
import { createBrowserClient } from "@supabase/ssr";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { setError(error.message); setLoading(false); return; }
    window.location.href = "/my-builds";
  };

  const handleGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${location.origin}/my-builds` },
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center" style={{ background: "#FFFAF3" }}>
      <div className="w-full max-w-sm rounded-2xl border border-zinc-200 bg-white p-6 shadow-md">
        <div className="mb-5 text-center">
          <div className="font-sans text-2xl font-black" style={{ background: "linear-gradient(135deg,#FF6B45,#FF9E42)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            ダメけい！
          </div>
          <div className="mt-1 text-[12px] text-zinc-400">ログイン</div>
        </div>

        <form onSubmit={handleLogin} className="flex flex-col gap-3">
          <input
            type="email" value={email} onChange={(e) => setEmail(e.target.value)}
            placeholder="メールアドレス" required
            className="rounded-xl border border-zinc-200 px-3 py-2.5 text-[13px] text-zinc-800 placeholder:text-zinc-900 outline-none focus:border-orange-400"
          />
          <input
            type="password" value={password} onChange={(e) => setPassword(e.target.value)}
            placeholder="パスワード" required
            className="rounded-xl border border-zinc-200 px-3 py-2.5 text-[13px] text-zinc-800 placeholder:text-zinc-900 outline-none focus:border-orange-400"
          />
          {error && <div className="text-[11px] text-red-500">{error}</div>}
          <button
            type="submit" disabled={loading}
            className="rounded-xl bg-orange-500 py-2.5 text-[13px] font-bold text-white hover:bg-orange-600 disabled:opacity-40"
          >
            {loading ? "ログイン中…" : "ログイン"}
          </button>
        </form>

        <div className="my-4 flex items-center gap-2">
          <div className="h-px flex-1 bg-zinc-200" />
          <span className="text-[10px] text-zinc-400">または</span>
          <div className="h-px flex-1 bg-zinc-200" />
        </div>

        <button
          onClick={handleGoogle}
          className="w-full rounded-xl border border-zinc-200 py-2.5 text-[13px] font-bold text-zinc-600 hover:bg-zinc-50"
        >
          Google でログイン
        </button>

        <div className="mt-4 text-center text-[11px] text-zinc-400">
          アカウントをお持ちでない方は{" "}
          <a href="/auth/signup" className="text-orange-500 underline">サインアップ</a>
        </div>
      </div>
    </div>
  );
}
