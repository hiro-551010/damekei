"use client";

import { useState } from "react";
import { deleteBuildAction } from "../actions/deleteBuild";
import { BuildSummaryDto } from "../../application/dto";

interface Props {
  build: BuildSummaryDto;
  appUrl: string;
}

export default function BuildCard({ build, appUrl }: Props) {
  const [deleting, setDeleting] = useState(false);
  const shareUrl = `${appUrl}/pokemon/damage-calc?build=${build.shareToken}`;

  const handleDelete = async () => {
    if (!confirm(`「${build.name}」を削除しますか？`)) return;
    setDeleting(true);
    try {
      await deleteBuildAction(build.id);
    } finally {
      setDeleting(false);
    }
  };

  const updatedAt = new Date(build.updatedAt).toLocaleDateString("ja-JP", {
    year: "numeric", month: "short", day: "numeric",
  });

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="mb-2 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="truncate text-[14px] font-bold text-zinc-800">{build.name}</div>
          <div className="text-[10px] text-zinc-400">{build.slotCount}/6体 · {updatedAt}</div>
        </div>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="shrink-0 rounded-lg px-2 py-1 text-[10px] font-bold text-zinc-400 hover:bg-red-50 hover:text-red-500 disabled:opacity-40"
        >
          削除
        </button>
      </div>

      <div className="flex items-center gap-2">
        <a
          href={shareUrl}
          className="flex-1 truncate rounded-lg bg-zinc-50 px-2 py-1.5 text-[11px] text-zinc-500 hover:bg-orange-50 hover:text-orange-600"
        >
          {shareUrl}
        </a>
        <button
          onClick={() => navigator.clipboard.writeText(shareUrl)}
          className="shrink-0 rounded-lg bg-orange-500 px-2 py-1.5 text-[10px] font-bold text-white hover:bg-orange-600"
        >
          コピー
        </button>
      </div>
    </div>
  );
}
