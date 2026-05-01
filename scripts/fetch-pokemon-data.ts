/**
 * PokeAPI からポケモンチャンピオンズ対象ポケモンのデータを取得し、
 * app/src/contexts/damage-calc/infrastructure/data/ に JSON として書き出す。
 *
 * 実行方法:
 *   npx tsx scripts/fetch-pokemon-data.ts
 *
 * ゲームのアップデートや対象ポケモンの変更があった場合のみ再実行する。
 */

import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";

// ────────────────────────────────────────────────────────────
// ポケモンチャンピオンズ登場ポケモン（全国図鑑番号）
// 出典: Bulbapedia + AppMedia (2026-04-29 時点)
// ────────────────────────────────────────────────────────────
const CHAMPION_POKEMON_IDS: number[] = [
  // Gen 1
  3, 6, 9, 12, 15, 18, 20, 22, 24, 25, 26, 28, 31, 34, 36, 38, 40, 45, 47, 49,
  51, 53, 55, 57, 59, 62, 65, 68, 71, 73, 76, 78, 80, 82, 83, 85, 87, 89, 91,
  94, 97, 99, 101, 103, 105, 106, 107, 110, 112, 113, 115, 119, 121, 122, 123,
  124, 125, 126, 127, 128, 130, 131, 132, 134, 135, 136, 139, 141, 142, 143,
  144, 145, 146, 149, 150, 151,
  // Gen 2
  154, 157, 160, 162, 164, 166, 168, 169, 171, 178, 181, 182, 184, 185, 186,
  189, 192, 195, 196, 197, 199, 202, 205, 208, 210, 211, 212, 214, 217, 219,
  221, 222, 224, 225, 226, 227, 229, 230, 232, 233, 234, 235, 237, 241, 242,
  243, 244, 245, 248, 249, 250, 251,
  // Gen 3
  254, 257, 260, 262, 264, 267, 269, 272, 275, 277, 279, 282, 284, 286, 288,
  289, 291, 292, 295, 297, 301, 302, 303, 306, 308, 310, 311, 312, 313, 314,
  317, 319, 321, 323, 324, 326, 327, 330, 332, 334, 335, 336, 337, 338, 340,
  342, 344, 346, 348, 350, 351, 352, 354, 356, 357, 358, 359, 362,
  // Gen 4
  389, 392, 395, 405, 407, 409, 411, 428, 442, 445, 448, 450, 454, 460, 461,
  464, 470, 471, 472, 473, 475, 478, 479,
  // Gen 5
  497, 500, 503, 505, 510, 512, 514, 516, 530, 531, 534, 547, 553, 563, 569,
  571, 579, 584, 587, 609, 614, 618, 623, 635, 637,
  // Gen 6
  652, 655, 658, 660, 663, 666, 670, 671, 675, 676, 678, 681, 683, 685, 693,
  695, 697, 699, 700, 701, 702, 706, 707, 709, 711, 713, 715,
  // Gen 7
  724, 727, 730, 733, 740, 745, 748, 750, 752, 758, 763, 765, 766, 778, 780,
  784,
  // Gen 8
  823, 841, 842, 844, 855, 858, 866, 867, 869, 877, 887, 899, 900, 902, 903,
  // Gen 9
  908, 911, 914, 925, 934, 936, 937, 939, 952, 956, 959, 964, 968, 970, 981,
  983, 1013, 1018, 1019,
];

// ────────────────────────────────────────────────────────────
// 型定義
// ────────────────────────────────────────────────────────────
interface PokemonEntry {
  id: number;
  name: string;
  nameEn: string;
  types: string[];
  baseStats: {
    hp: number;
    attack: number;
    defense: number;
    spAttack: number;
    spDefense: number;
    speed: number;
  };
  abilities: { name: string; nameEn: string }[];
  learnableMoveIds: number[];
}

interface MoveEntry {
  id: number;
  name: string;
  nameEn: string;
  power: number | null;
  type: string;
  category: "physical" | "special" | "status";
}

interface AbilityEntry {
  name: string;
  nameEn: string;
  description: string;
}

// ────────────────────────────────────────────────────────────
// ユーティリティ
// ────────────────────────────────────────────────────────────
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function fetchWithRetry(url: string, retries = 3): Promise<unknown> {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${url}`);
      return await res.json();
    } catch (e) {
      if (i === retries - 1) throw e;
      await sleep(1000 * (i + 1));
    }
  }
  throw new Error("unreachable");
}

async function fetchAll(
  urls: string[],
  batchSize = 10,
  delayMs = 150
): Promise<unknown[]> {
  const results: unknown[] = [];
  for (let i = 0; i < urls.length; i += batchSize) {
    const batch = urls.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map((u) => fetchWithRetry(u)));
    results.push(...batchResults);
    process.stdout.write(`\r  ${Math.min(i + batchSize, urls.length)}/${urls.length}`);
    if (i + batchSize < urls.length) await sleep(delayMs);
  }
  process.stdout.write("\n");
  return results;
}

function jaName(names: { name: string; language: { name: string } }[]): string {
  return names.find((n) => n.language.name === "ja")?.name ?? "";
}

// ────────────────────────────────────────────────────────────
// メイン
// ────────────────────────────────────────────────────────────
async function main() {
  const OUTPUT_DIR = join(
    process.cwd(),
    "app/src/contexts/damage-calc/infrastructure/data"
  );
  mkdirSync(OUTPUT_DIR, { recursive: true });

  // 1. ポケモン基本データ取得
  console.log(`\n[1/4] Fetching ${CHAMPION_POKEMON_IDS.length} Pokémon...`);
  const pokemonRaw = (await fetchAll(
    CHAMPION_POKEMON_IDS.map((id) => `https://pokeapi.co/api/v2/pokemon/${id}`)
  )) as any[];

  // 2. 日本語名（species）取得
  console.log(`\n[2/4] Fetching species names...`);
  const speciesRaw = (await fetchAll(
    CHAMPION_POKEMON_IDS.map((id) => `https://pokeapi.co/api/v2/pokemon-species/${id}`)
  )) as any[];

  // 3. 全ユニーク技の詳細取得
  const moveUrlToId = (url: string): number =>
    Number(url.match(/\/(\d+)\/$/)?.[1]);
  const allMoveIds = [
    ...new Set(
      pokemonRaw.flatMap((p: any) =>
        p.moves.map((m: any) => moveUrlToId(m.move.url))
      )
    ),
  ].filter((id) => id > 0);

  console.log(`\n[3/4] Fetching ${allMoveIds.length} moves...`);
  const movesRaw = (await fetchAll(
    allMoveIds.map((id) => `https://pokeapi.co/api/v2/move/${id}`)
  )) as any[];

  // 4. 特性の日本語名取得
  const abilityNameSet = new Set<string>(
    pokemonRaw.flatMap((p: any) =>
      p.abilities.map((a: any) => a.ability.name as string)
    )
  );
  const abilityNames = [...abilityNameSet];
  console.log(`\n[4/4] Fetching ${abilityNames.length} abilities...`);
  const abilitiesRaw = (await fetchAll(
    abilityNames.map((name) => `https://pokeapi.co/api/v2/ability/${name}`)
  )) as any[];

  // ────────────────────────────────────────────────────────
  // データ組み立て
  // ────────────────────────────────────────────────────────

  // moves.json
  const moves: MoveEntry[] = movesRaw.map((m: any) => ({
    id: m.id as number,
    name: jaName(m.names) || m.name,
    nameEn: m.name as string,
    power: (m.power as number | null) ?? null,
    type: m.type.name as string,
    category: m.damage_class.name as "physical" | "special" | "status",
  }));
  const moveIdByName = new Map<string, number>(
    movesRaw.map((m: any) => [m.name as string, m.id as number])
  );

  // abilities.json
  const abilityJaName = new Map<string, string>(
    abilitiesRaw.map((a: any) => [a.name as string, jaName(a.names) || a.name])
  );
  const abilities: AbilityEntry[] = abilitiesRaw.map((a: any) => ({
    name: jaName(a.names) || a.name,
    nameEn: a.name as string,
    description:
      (a.flavor_text_entries as any[])
        .filter((f) => f.language.name === "ja")
        .at(-1)?.flavor_text?.replace(/\n/g, "") ?? "",
  }));

  // pokemon.json
  const pokemon: PokemonEntry[] = pokemonRaw.map((p: any, i: number) => {
    const sp = speciesRaw[i];
    return {
      id: p.id as number,
      name: jaName(sp.names) || p.name,
      nameEn: p.name as string,
      types: (p.types as any[]).map((t) => t.type.name as string),
      baseStats: {
        hp: (p.stats as any[]).find((s) => s.stat.name === "hp").base_stat,
        attack: (p.stats as any[]).find((s) => s.stat.name === "attack").base_stat,
        defense: (p.stats as any[]).find((s) => s.stat.name === "defense").base_stat,
        spAttack: (p.stats as any[]).find((s) => s.stat.name === "special-attack").base_stat,
        spDefense: (p.stats as any[]).find((s) => s.stat.name === "special-defense").base_stat,
        speed: (p.stats as any[]).find((s) => s.stat.name === "speed").base_stat,
      },
      abilities: (p.abilities as any[]).map((a) => ({
        name: abilityJaName.get(a.ability.name) ?? a.ability.name,
        nameEn: a.ability.name as string,
      })),
      learnableMoveIds: (p.moves as any[])
        .map((m) => moveIdByName.get(m.move.name))
        .filter((id): id is number => id !== undefined),
    };
  });

  // ────────────────────────────────────────────────────────
  // 書き出し
  // ────────────────────────────────────────────────────────
  writeFileSync(join(OUTPUT_DIR, "pokemon.json"), JSON.stringify(pokemon, null, 2));
  writeFileSync(join(OUTPUT_DIR, "moves.json"), JSON.stringify(moves, null, 2));
  writeFileSync(join(OUTPUT_DIR, "abilities.json"), JSON.stringify(abilities, null, 2));

  console.log("\n✅ Done!");
  console.log(`  pokemon.json  : ${pokemon.length} entries`);
  console.log(`  moves.json    : ${moves.length} entries`);
  console.log(`  abilities.json: ${abilities.length} entries`);
  console.log(`  出力先: ${OUTPUT_DIR}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
