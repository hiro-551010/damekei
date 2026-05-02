"use client";

import {
  useEffect,
  useRef,
  useState,
  ReactNode,
} from "react";

export interface SelectOption<T> {
  value: T;
  searchText: string;
}

interface Props<T> {
  options: SelectOption<T>[];
  value: T | null;
  onChange: (value: T | null) => void;
  placeholder?: string;
  disabled?: boolean;
  renderOption: (option: SelectOption<T>, isHighlighted: boolean) => ReactNode;
  renderSelected: (option: SelectOption<T>) => ReactNode;
  variant?: "atk" | "def" | "neutral";
}

export default function SearchableSelect<T>({
  options,
  value,
  onChange,
  placeholder = "検索…",
  disabled = false,
  renderOption,
  renderSelected,
  variant = "neutral",
}: Props<T>) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const selected = options.find((o) => o.value === value) ?? null;

  const filtered = query.trim()
    ? options.filter((o) =>
        o.searchText.toLowerCase().includes(query.trim().toLowerCase())
      )
    : options;

  const focusRing =
    variant === "atk"
      ? "focus-within:border-orange-400"
      : variant === "def"
      ? "focus-within:border-emerald-400"
      : "focus-within:border-blue-400";

  // click outside で閉じる
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ハイライト位置をリセット
  useEffect(() => {
    setHighlighted(0);
  }, [query]);

  // ハイライト行をスクロール
  useEffect(() => {
    if (!listRef.current) return;
    const item = listRef.current.children[highlighted] as HTMLElement | undefined;
    item?.scrollIntoView({ block: "nearest" });
  }, [highlighted]);

  const select = (opt: SelectOption<T>) => {
    onChange(opt.value);
    setOpen(false);
    setQuery("");
  };

  const clear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(null);
    setQuery("");
    setOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlighted((h) => Math.min(h + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlighted((h) => Math.max(h - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filtered[highlighted]) select(filtered[highlighted]);
    } else if (e.key === "Escape") {
      setOpen(false);
      setQuery("");
    }
  };

  return (
    <div ref={containerRef} className="relative w-full" onKeyDown={handleKeyDown}>
      {/* トリガー */}
      <div
        className={`flex cursor-pointer items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 py-2 transition-colors ${focusRing} ${disabled ? "opacity-40 pointer-events-none" : "hover:border-zinc-300"}`}
        onClick={() => {
          if (disabled) return;
          setOpen((o) => !o);
          if (!open) setTimeout(() => inputRef.current?.focus(), 50);
        }}
      >
        <div className="flex-1 min-w-0">
          {open ? (
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={placeholder}
              className="w-full bg-transparent text-[13px] font-bold text-zinc-800 outline-none placeholder:text-zinc-900 placeholder:font-normal"
              onClick={(e) => e.stopPropagation()}
            />
          ) : selected ? (
            <div className="truncate">{renderSelected(selected)}</div>
          ) : (
            <span className="text-[13px] text-black">{placeholder}</span>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-1">
          {selected && !open && (
            <button
              onClick={clear}
              className="rounded-full p-0.5 text-zinc-600 hover:bg-zinc-100 hover:text-zinc-800 text-xs leading-none"
            >
              ✕
            </button>
          )}
          <span className="text-[10px] text-zinc-600">{open ? "▴" : "▾"}</span>
        </div>
      </div>

      {/* ドロップダウン */}
      {open && (
        <ul
          ref={listRef}
          className="absolute z-50 mt-1 max-h-64 w-full overflow-y-auto rounded-xl border border-zinc-200 bg-white shadow-lg"
        >
          {filtered.length === 0 ? (
            <li className="px-3 py-2 text-[12px] text-zinc-400">見つかりません</li>
          ) : (
            filtered.map((opt, i) => (
              <li
                key={String(opt.value)}
                onMouseDown={() => select(opt)}
                onMouseEnter={() => setHighlighted(i)}
                className={`cursor-pointer px-2 py-1.5 transition-colors ${
                  i === highlighted ? "bg-orange-50" : "hover:bg-zinc-50"
                }`}
              >
                {renderOption(opt, i === highlighted)}
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
