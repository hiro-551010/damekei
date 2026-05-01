"use client";

import { BuildSummaryDto } from "../../application/dto";
import BuildCard from "./BuildCard";

interface Props {
  builds: BuildSummaryDto[];
  appUrl: string;
}

export default function MyBuildsPage({ builds, appUrl }: Props) {
  return (
    <div className="min-h-screen" style={{ background: "#FFFAF3" }}>
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-zinc-200 bg-white/90 px-4 py-3 backdrop-blur">
        <div className="flex items-center gap-2">
          <a href="/pokemon/damage-calc" className="font-sans text-xl font-black" style={{ background: "linear-gradient(135deg,#FF6B45,#FF9E42)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            ダメけい！
          </a>
          <span className="rounded-full bg-gradient-to-r from-orange-400 to-orange-300 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-white">β</span>
        </div>
        <a href="/pokemon/damage-calc" className="text-[11px] font-bold text-zinc-400 hover:text-zinc-600">
          ← ダメージ計算へ
        </a>
      </header>

      <main className="mx-auto max-w-2xl px-4 pb-16 pt-6">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-[18px] font-extrabold text-zinc-800">マイ構築</h1>
          <a
            href="/pokemon/damage-calc"
            className="rounded-full bg-orange-500 px-3 py-1.5 text-[11px] font-bold text-white hover:bg-orange-600"
          >
            ＋ 新しい構築を作る
          </a>
        </div>

        {builds.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-zinc-300">
            <div className="text-4xl">📭</div>
            <div className="text-[13px] font-bold">保存した構築はありません</div>
            <a href="/pokemon/damage-calc" className="text-[12px] text-orange-400 underline">
              ダメージ計算から構築を保存する
            </a>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {builds.map((b) => (
              <BuildCard key={b.id} build={b} appUrl={appUrl} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
