"use client";

const NATURES: { nameEn: string; name: string; up: string | null; down: string | null }[] = [
  { nameEn: "hardy",   name: "がんばりや", up: null,    down: null },
  { nameEn: "lonely",  name: "さみしがり", up: "こう",  down: "ぼう" },
  { nameEn: "brave",   name: "いじっぱり", up: "こう",  down: "すば" },
  { nameEn: "adamant", name: "やんちゃ",   up: "こう",  down: "とく" },
  { nameEn: "naughty", name: "わんぱく",   up: "こう",  down: "とぼ" },
  { nameEn: "bold",    name: "ずぶとい",   up: "ぼう",  down: "こう" },
  { nameEn: "docile",  name: "すなおな",   up: null,    down: null },
  { nameEn: "relaxed", name: "のんき",     up: "ぼう",  down: "すば" },
  { nameEn: "impish",  name: "わんぱく",   up: "ぼう",  down: "とく" },
  { nameEn: "lax",     name: "のうてんき", up: "ぼう",  down: "とぼ" },
  { nameEn: "timid",   name: "おくびょう", up: "すば",  down: "こう" },
  { nameEn: "hasty",   name: "せっかち",   up: "すば",  down: "ぼう" },
  { nameEn: "serious", name: "まじめ",     up: null,    down: null },
  { nameEn: "jolly",   name: "ようき",     up: "すば",  down: "とく" },
  { nameEn: "naive",   name: "むじゃき",   up: "すば",  down: "とぼ" },
  { nameEn: "modest",  name: "ひかえめ",   up: "とく",  down: "こう" },
  { nameEn: "mild",    name: "おっとり",   up: "とく",  down: "ぼう" },
  { nameEn: "quiet",   name: "れいせい",   up: "とく",  down: "すば" },
  { nameEn: "bashful", name: "てれや",     up: null,    down: null },
  { nameEn: "rash",    name: "うっかりや", up: "とく",  down: "とぼ" },
  { nameEn: "calm",    name: "おだやか",   up: "とぼ",  down: "こう" },
  { nameEn: "gentle",  name: "おとなしい", up: "とぼ",  down: "ぼう" },
  { nameEn: "sassy",   name: "なまいき",   up: "とぼ",  down: "すば" },
  { nameEn: "careful", name: "しんちょう", up: "とぼ",  down: "とく" },
  { nameEn: "quirky",  name: "きまぐれ",   up: null,    down: null },
];

interface Props {
  value: string;
  onChange: (natureEn: string) => void;
  variant: "atk" | "def";
}

export default function NatureSelect({ value, onChange, variant }: Props) {
  const accent = variant === "atk" ? "focus:border-orange-400" : "focus:border-emerald-400";
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[10px] font-bold text-zinc-500">性格</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full rounded-lg border border-zinc-200 bg-white px-2 py-1.5 text-[13px] font-bold text-zinc-800 outline-none focus:ring-2 focus:ring-offset-0 ${accent}`}
      >
        {NATURES.map((n) => (
          <option key={n.nameEn} value={n.nameEn}>
            {n.name}
            {n.up ? ` ↑${n.up} ↓${n.down}` : "（補正なし）"}
          </option>
        ))}
      </select>
    </div>
  );
}
