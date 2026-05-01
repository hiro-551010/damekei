"use client";

const ITEMS = [
  { nameEn: "",              name: "なし" },
  { nameEn: "life-orb",     name: "いのちのたま" },
  { nameEn: "choice-band",  name: "こだわりハチマキ" },
  { nameEn: "choice-specs", name: "こだわりメガネ" },
  { nameEn: "choice-scarf", name: "こだわりスカーフ" },
  { nameEn: "leftovers",    name: "たべのこし" },
  { nameEn: "assault-vest", name: "とつげきチョッキ" },
  { nameEn: "focus-sash",   name: "きあいのタスキ" },
  { nameEn: "rocky-helmet", name: "ゴツゴツメット" },
  { nameEn: "sitrus-berry", name: "オボンのみ" },
  { nameEn: "lum-berry",    name: "ラムのみ" },
  { nameEn: "weakness-policy", name: "じゃくてんほけん" },
  { nameEn: "eviolite",     name: "しんかのきせき" },
  { nameEn: "air-balloon",  name: "ふうせん" },
  { nameEn: "wide-lens",    name: "ひろいレンズ" },
  { nameEn: "expert-belt",  name: "たつじんのおび" },
  { nameEn: "black-belt",   name: "くろおび" },
  { nameEn: "mystic-water", name: "しんぴのしずく" },
  { nameEn: "charcoal",     name: "もくたん" },
  { nameEn: "magnet",       name: "じしゃく" },
  { nameEn: "miracle-seed", name: "きせきのタネ" },
  { nameEn: "never-melt-ice", name: "とけないこおり" },
  { nameEn: "twisted-spoon", name: "まがったスプーン" },
  { nameEn: "dragon-fang",  name: "りゅうのキバ" },
  { nameEn: "silk-scarf",   name: "シルクのスカーフ" },
  { nameEn: "hard-stone",   name: "かたいいし" },
  { nameEn: "sharp-beak",   name: "するどいくちばし" },
  { nameEn: "poison-barb",  name: "どくバリ" },
  { nameEn: "soft-sand",    name: "やわらかいすな" },
  { nameEn: "spell-tag",    name: "のろいのおふだ" },
  { nameEn: "metal-coat",   name: "メタルコート" },
  { nameEn: "fairy-feather", name: "ようせいのはね" },
  { nameEn: "throat-spray", name: "のどスプレー" },
  { nameEn: "booster-energy", name: "ブーストエナジー" },
];

interface Props {
  value: string;
  onChange: (nameEn: string) => void;
  variant: "atk" | "def";
}

export default function ItemSelect({ value, onChange, variant }: Props) {
  const accent = variant === "atk" ? "focus:border-orange-400" : "focus:border-emerald-400";
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[10px] font-bold text-zinc-500">持ち物</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full rounded-lg border border-zinc-200 bg-white px-2 py-1.5 text-[13px] font-bold text-zinc-800 outline-none ${accent}`}
      >
        {ITEMS.map((item) => (
          <option key={item.nameEn} value={item.nameEn}>
            {item.name}
          </option>
        ))}
      </select>
    </div>
  );
}
