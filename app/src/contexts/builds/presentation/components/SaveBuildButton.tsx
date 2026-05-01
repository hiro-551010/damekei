"use client";

import { useState } from "react";
import { saveBuildAction } from "../actions/saveBuild";
import { BuildSlotDto } from "../../application/dto";

interface Props {
  slots: BuildSlotDto[];
  isLoggedIn: boolean;
  appUrl: string;
}

export default function SaveBuildButton({ slots, isLoggedIn, appUrl }: Props) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await saveBuildAction({ name, slots });
      setShareUrl(`${appUrl}/pokemon/damage-calc?build=${result.shareToken}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "保存に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = () => {
    if (!isLoggedIn) {
      window.location.href = "/auth/login";
      return;
    }
    setOpen(true);
    setName("");
    setShareUrl(null);
    setError(null);
  };

  return (
    <>
      <button
        onClick={handleOpen}
        className="rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-[11px] font-bold text-zinc-600 shadow-sm hover:border-orange-400 hover:text-orange-500 transition-colors"
      >
        💾 保存
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[30vh] bg-black/30 backdrop-blur-sm">
          <div className="w-80 rounded-2xl border border-zinc-200 bg-white p-5 shadow-xl">
            <div className="mb-3 text-[13px] font-extrabold text-zinc-700">構築を保存</div>

            {shareUrl ? (
              <>
                <div className="mb-3 text-[11px] text-zinc-500">共有URLが発行されました</div>
                <div className="mb-3 flex items-center gap-2 rounded-lg bg-zinc-50 px-3 py-2">
                  <span className="flex-1 truncate text-[11px] text-zinc-600">{shareUrl}</span>
                  <button
                    onClick={() => navigator.clipboard.writeText(shareUrl)}
                    className="shrink-0 rounded-md bg-orange-500 px-2 py-1 text-[10px] font-bold text-white hover:bg-orange-600"
                  >
                    コピー
                  </button>
                </div>
                <div className="mb-3 text-[11px] text-zinc-400">
                  <a href="/my-builds" className="text-orange-500 underline">構築一覧</a> でも確認できます
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="w-full rounded-xl border border-zinc-200 py-2 text-[12px] font-bold text-zinc-600 hover:bg-zinc-50"
                >
                  閉じる
                </button>
              </>
            ) : (
              <>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="構築名（例：リザードン軸）"
                  maxLength={50}
                  className="mb-3 w-full rounded-xl border border-zinc-200 px-3 py-2 text-[13px] text-zinc-800 placeholder:text-zinc-900 outline-none focus:border-orange-400"
                />
                {error && <div className="mb-2 text-[11px] text-red-500">{error}</div>}
                <div className="flex gap-2">
                  <button
                    onClick={() => setOpen(false)}
                    className="flex-1 rounded-xl border border-zinc-200 py-2 text-[12px] font-bold text-zinc-500 hover:bg-zinc-50"
                  >
                    キャンセル
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={loading || !name.trim()}
                    className="flex-1 rounded-xl bg-orange-500 py-2 text-[12px] font-bold text-white hover:bg-orange-600 disabled:opacity-40"
                  >
                    {loading ? "保存中…" : "保存する"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
