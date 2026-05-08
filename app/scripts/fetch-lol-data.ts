import { writeFileSync } from "fs";
import { join } from "path";

const BASE = "https://cdn.merakianalytics.com/riot/lol/resources/latest/en-US";
const OUT = join(process.cwd(), "src/contexts/games/lol/damage-calc/infrastructure/data");

type DamageType = "physical" | "magic" | "true";
type SkillSlot = "Q" | "W" | "E" | "R";

type StatRef =
  | "attacker.totalAd"
  | "attacker.bonusAd"
  | "attacker.ap";

type DamageFormula =
  | { kind: "const"; value: number }
  | { kind: "byRank"; values: number[] }
  | { kind: "stat"; ref: StatRef }
  | { kind: "add"; operands: DamageFormula[] }
  | { kind: "mul"; operands: DamageFormula[] };

function mapDamageType(raw: string | null | undefined): DamageType {
  if (raw === "MAGIC_DAMAGE") return "magic";
  if (raw === "TRUE_DAMAGE") return "true";
  return "physical";
}

function nullIfZero(v: number): number | null {
  return v === 0 ? null : v;
}

async function fetchJson(url: string): Promise<unknown> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`fetch failed: ${url} (${res.status})`);
  return res.json();
}

type LevelingEntry = { attribute: string; modifiers: Array<{ values: number[]; units: string[] }> };

function extractScalars(ability: Record<string, unknown>) {
  let baseDamageByRank: number[] = [];
  let totalAdRatioByRank: number[] = [];
  let bonusAdRatioByRank: number[] = [];
  let apRatioByRank: number[] = [];

  const effects = (ability.effects as Array<{ leveling?: LevelingEntry[] }>) ?? [];
  const allLeveling = effects.flatMap((e) => e.leveling ?? []);

  // "Total" / "Maximum" 属性を優先。なければ通常の damage 属性を使う
  const priority = allLeveling.filter((lv) => {
    const a = lv.attribute.toLowerCase();
    return (a.includes("total") || a.includes("maximum")) && a.includes("damage");
  });
  const candidates = priority.length > 0 ? priority : allLeveling.filter((lv) =>
    lv.attribute.toLowerCase().includes("damage")
  );

  for (const lv of candidates) {
    for (const mod of lv.modifiers) {
      const unit = mod.units[0] ?? "";
      if (unit === "") baseDamageByRank = mod.values;
      else if (unit === "% AP") apRatioByRank = mod.values.map((v) => v / 100);
      else if (unit === "% AD") totalAdRatioByRank = mod.values.map((v) => v / 100);
      else if (unit.toLowerCase().includes("% bonus ad")) bonusAdRatioByRank = mod.values.map((v) => v / 100);
    }
    if (baseDamageByRank.length > 0) break;
  }

  return { baseDamageByRank, totalAdRatioByRank, bonusAdRatioByRank, apRatioByRank };
}

function buildDamageFormula(ability: Record<string, unknown>): DamageFormula {
  const { baseDamageByRank, totalAdRatioByRank, bonusAdRatioByRank, apRatioByRank } = extractScalars(ability);

  const hasBase = baseDamageByRank.some((v) => v !== 0);
  const hasTotalAd = totalAdRatioByRank.some((v) => v !== 0);
  const hasBonusAd = bonusAdRatioByRank.some((v) => v !== 0);
  const hasAp = apRatioByRank.some((v) => v !== 0);

  const operands: DamageFormula[] = [];
  if (hasBase) operands.push({ kind: "byRank", values: baseDamageByRank });
  if (hasTotalAd) operands.push({ kind: "mul", operands: [{ kind: "stat", ref: "attacker.totalAd" }, { kind: "byRank", values: totalAdRatioByRank }] });
  if (hasBonusAd) operands.push({ kind: "mul", operands: [{ kind: "stat", ref: "attacker.bonusAd" }, { kind: "byRank", values: bonusAdRatioByRank }] });
  if (hasAp) operands.push({ kind: "mul", operands: [{ kind: "stat", ref: "attacker.ap" }, { kind: "byRank", values: apRatioByRank }] });

  if (operands.length === 0) return { kind: "const", value: 0 };
  if (operands.length === 1) return operands[0];
  return { kind: "add", operands };
}

async function buildChampionData(key: string) {
  const data = await fetchJson(`${BASE}/champions/${key}.json`) as Record<string, unknown>;
  const stats = data.stats as Record<string, { flat: number; perLevel: number }>;
  const abilities = data.abilities as Record<string, Array<Record<string, unknown>>>;

  const skills = (["Q", "W", "E", "R"] as SkillSlot[]).flatMap((slot) => {
    const ab = abilities[slot]?.[0];
    if (!ab) return [];
    const damageType = mapDamageType(ab.damageType as string);
    return [{
      slot,
      name: ab.name as string,
      damageType,
      damageFormula: buildDamageFormula(ab),
    }];
  });

  return {
    id: key,
    name: data.name as string,
    nameEn: data.name as string,
    baseStats: {
      hp: stats.health.flat,
      ad: stats.attackDamage.flat,
      armor: stats.armor.flat,
      magicResist: stats.magicResistance.flat,
      attackSpeed: stats.attackSpeed.flat,
      moveSpeed: stats.movementSpeed?.flat ?? 0,
    },
    statGrowth: {
      hp: stats.health.perLevel,
      ad: stats.attackDamage.perLevel,
      armor: stats.armor.perLevel,
      magicResist: stats.magicResistance.perLevel,
    },
    skills,
  };
}

async function fetchChampions() {
  console.log("Fetching champion list...");
  const list = await fetchJson(`${BASE}/champions.json`) as Record<string, unknown>;
  const keys = Object.keys(list);
  console.log(`Found ${keys.length} champions. Fetching details in batches...`);

  const results = [];
  const BATCH = 10;
  for (let i = 0; i < keys.length; i += BATCH) {
    const batch = keys.slice(i, i + BATCH);
    const data = await Promise.all(batch.map((k) => buildChampionData(k).catch(() => null)));
    results.push(...data.filter(Boolean));
    process.stdout.write(`  ${Math.min(i + BATCH, keys.length)}/${keys.length}\r`);
  }
  console.log("\nDone.");
  return results;
}

async function fetchItems() {
  console.log("Fetching items...");
  const raw = await fetchJson(`${BASE}/items.json`) as Record<string, Record<string, unknown>>;

  return Object.values(raw)
    .filter((item) => !item.removed && (item.tier as number) >= 2)
    .map((item) => {
      const s = item.stats as Record<string, { flat: number; percent: number }>;
      return {
        id: item.id as number,
        name: item.name as string,
        nameEn: item.name as string,
        stats: {
          ad: nullIfZero(s.attackDamage?.flat ?? 0),
          ap: nullIfZero(s.abilityPower?.flat ?? 0),
          armor: nullIfZero(s.armor?.flat ?? 0),
          magicResist: nullIfZero(s.magicResistance?.flat ?? 0),
          hp: nullIfZero(s.health?.flat ?? 0),
          lethality: nullIfZero(s.lethality?.flat ?? 0),
          armorPenPercent: nullIfZero(s.armorPenetration?.percent ?? 0),
          magicPenFlat: nullIfZero(s.magicPenetration?.flat ?? 0),
          magicPenPercent: nullIfZero(s.magicPenetration?.percent ?? 0),
          attackSpeed: nullIfZero(s.attackSpeed?.flat ?? 0),
          critChance: nullIfZero(s.criticalStrikeChance?.percent ?? 0),
          lifeSteal: nullIfZero(s.lifeSteal?.flat ?? 0),
          abilityHaste: nullIfZero(s.abilityHaste?.flat ?? 0),
        },
        passives: [],
      };
    });
}

async function main() {
  const [champions, items] = await Promise.all([fetchChampions(), fetchItems()]);
  writeFileSync(join(OUT, "champions.json"), JSON.stringify(champions, null, 2));
  writeFileSync(join(OUT, "items.json"), JSON.stringify(items, null, 2));
  console.log(`champions.json: ${champions.length} entries`);
  console.log(`items.json: ${items.length} entries`);
}

main().catch((e) => { console.error(e); process.exit(1); });
