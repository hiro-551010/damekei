"use client";

import { useState } from "react";
import { createBrowserClient } from "@supabase/ssr";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) { setError("パスワードが一致しません"); return; }
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) { setError(error.message); setLoading(false); return; }
    setDone(true);
  };

  return (
    <div className="flex min-h-screen items-center justify-center" style={{ background: "#FFFAF3" }}>
      <div className="w-full max-w-sm rounded-2xl border border-zinc-200 bg-white p-6 shadow-md">
        <div className="mb-5 text-center">
          <div className="font-sans text-2xl font-black" style={{ background: "linear-gradient(135deg,#FF6B45,#FF9E42)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            ダメけい！
          </div>
          <div className="mt-1 text-[12px] text-zinc-400">アカウント作成</div>
        </div>

        {done ? (
          <div className="text-center">
            <div className="mb-2 text-2xl">📧</div>
            <div className="mb-1 text-[13px] font-bold text-zinc-700">確認メールを送信しました</div>
            <div className="text-[11px] text-zinc-400">メール内のリンクをクリックしてアカウントを有効化してください</div>
            <a href="/auth/login" className="mt-4 block text-[12px] text-orange-500 underline">ログインへ</a>
          </div>
        ) : (
          <form onSubmit={handleSignup} className="flex flex-col gap-3">
            <input
              type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="メールアドレス" required
              className="rounded-xl border border-zinc-200 px-3 py-2.5 text-[13px] text-zinc-800 placeholder:text-zinc-900 outline-none focus:border-orange-400"
            />
            <input
              type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="パスワード（8文字以上）" required minLength={8}
              className="rounded-xl border border-zinc-200 px-3 py-2.5 text-[13px] text-zinc-800 placeholder:text-zinc-900 outline-none focus:border-orange-400"
            />
            <input
              type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)}
              placeholder="パスワード（確認）" required
              className="rounded-xl border border-zinc-200 px-3 py-2.5 text-[13px] text-zinc-800 placeholder:text-zinc-900 outline-none focus:border-orange-400"
            />
            {error && <div className="text-[11px] text-red-500">{error}</div>}
            <button
              type="submit" disabled={loading}
              className="rounded-xl bg-orange-500 py-2.5 text-[13px] font-bold text-white hover:bg-orange-600 disabled:opacity-40"
            >
              {loading ? "作成中…" : "アカウントを作成"}
            </button>
            <div className="text-center text-[11px] text-zinc-400">
              すでにアカウントをお持ちの方は{" "}
              <a href="/auth/login" className="text-orange-500 underline">ログイン</a>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
