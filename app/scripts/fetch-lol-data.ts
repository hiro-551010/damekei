import { writeFileSync } from "fs";
import { join } from "path";

const BASE = "https://cdn.merakianalytics.com/riot/lol/resources/latest/en-US";
const OUT = join(process.cwd(), "src/contexts/games/lol/damage-calc/infrastructure/data");

type DamageType = "physical" | "magic" | "true";
type SkillSlot = "Q" | "W" | "E" | "R";

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

function extractSkillDamage(ability: Record<string, unknown>) {
  let baseDamageByRank: number[] = [];
  let totalAdRatio = 0;
  let bonusAdRatio = 0;
  let apRatio = 0;

  const effects = (ability.effects as Array<{ leveling?: Array<{ attribute: string; modifiers: Array<{ values: number[]; units: string[] }> }> }>) ?? [];

  for (const effect of effects) {
    for (const lv of effect.leveling ?? []) {
      if (!lv.attribute.toLowerCase().includes("damage")) continue;
      for (const mod of lv.modifiers) {
        const unit = mod.units[0] ?? "";
        if (unit === "") baseDamageByRank = mod.values;
        else if (unit === "% AP") apRatio = mod.values[0] / 100;
        else if (unit === "% AD") totalAdRatio = mod.values[0] / 100;
        else if (unit.toLowerCase().includes("% bonus ad")) bonusAdRatio = mod.values[0] / 100;
      }
      break;
    }
    if (baseDamageByRank.length > 0) break;
  }

  return { baseDamageByRank, totalAdRatio, bonusAdRatio, apRatio };
}

async function buildChampionData(key: string) {
  const data = await fetchJson(`${BASE}/champions/${key}.json`) as Record<string, unknown>;
  const stats = data.stats as Record<string, { flat: number; perLevel: number }>;
  const abilities = data.abilities as Record<string, Array<Record<string, unknown>>>;

  const skills = (["Q", "W", "E", "R"] as SkillSlot[]).flatMap((slot) => {
    const ab = abilities[slot]?.[0];
    if (!ab) return [];
    const damageType = mapDamageType(ab.damageType as string);
    const { baseDamageByRank, totalAdRatio, bonusAdRatio, apRatio } = extractSkillDamage(ab);
    return [{
      slot,
      name: ab.name as string,
      damageType,
      baseDamageByRank,
      totalAdRatio,
      bonusAdRatio,
      apRatio,
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
          critChance: nullIfZero(s.criticalStrikeChance?.flat ?? 0),
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
