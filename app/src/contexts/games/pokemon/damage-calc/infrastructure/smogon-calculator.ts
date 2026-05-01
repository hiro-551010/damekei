import {
  calculate,
  Generations,
  Pokemon as SmogonPokemon,
  Move as SmogonMove,
  Field,
} from "@smogon/calc";
import { DamageCalculator, FieldCondition } from "../domain/ports";
import {
  DamageResult,
  Move,
  Pokemon,
  computeKnockoutChance,
} from "../domain/models";

const gen = Generations.get(9);

const toSmogonName = (name: string): string =>
  name.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

const capitalize = (s: string): string =>
  s.charAt(0).toUpperCase() + s.slice(1);

const WEATHER_MAP: Record<string, string> = {
  sun: "Sun", rain: "Rain", sand: "Sand", snow: "Snow",
};

const TERRAIN_MAP: Record<string, string> = {
  electric: "Electric", grassy: "Grassy", misty: "Misty", psychic: "Psychic",
};

export class SmogonDamageCalculator implements DamageCalculator {
  calculate(
    attacker: Pokemon,
    defender: Pokemon,
    move: Move,
    field?: FieldCondition,
    hitCount?: number,
  ): DamageResult {
    const sp2ev = (v: number) => v * 4;

    const mkSmogon = (p: Pokemon) =>
      new SmogonPokemon(gen, toSmogonName(p.species.nameEn), {
        level: 50,
        nature: capitalize(p.nature),
        evs: {
          hp:  sp2ev(p.statPoints.hp),
          atk: sp2ev(p.statPoints.attack),
          def: sp2ev(p.statPoints.defense),
          spa: sp2ev(p.statPoints.spAttack),
          spd: sp2ev(p.statPoints.spDefense),
          spe: sp2ev(p.statPoints.speed),
        },
        ivs: { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 },
        ability: toSmogonName(p.ability.nameEn),
        item: p.item ? toSmogonName(p.item.nameEn) : undefined,
        boosts: {
          atk: p.boosts.attack,
          def: p.boosts.defense,
          spa: p.boosts.spAttack,
          spd: p.boosts.spDefense,
          spe: p.boosts.speed,
        },
      });

    const smogonField = field
      ? new Field({
          weather: field.weather ? (WEATHER_MAP[field.weather] as any) : undefined,
          terrain: field.terrain ? (TERRAIN_MAP[field.terrain] as any) : undefined,
        })
      : undefined;

    const result = calculate(
      gen,
      mkSmogon(attacker),
      mkSmogon(defender),
      new SmogonMove(gen, toSmogonName(move.nameEn), hitCount ? { hits: hitCount } : {}),
      smogonField
    );

    const raw = result.damage;
    const isMultiHit = Array.isArray(raw) && Array.isArray((raw as unknown[])[0]);

    let rolls: number[];
    let detectedHitCount: number;

    if (isMultiHit) {
      const perHit = raw as number[][];
      detectedHitCount = perHit.length;
      // 各ヒットの同ロール位置を合算して合計ダメージ分布を作る
      rolls = perHit[0].map((_, i) => perHit.reduce((sum, hit) => sum + hit[i], 0));
    } else {
      const flat = Array.isArray(raw) ? (raw as number[]) : [raw as number];
      detectedHitCount = 1;
      rolls = flat;
    }

    const defenderMaxHp = result.defender.stats.hp;
    const percentages = rolls.map((r) =>
      Math.round((r / defenderMaxHp) * 1000) / 10
    );

    return {
      rolls,
      hitCount: detectedHitCount,
      min: rolls[0],
      max: rolls[rolls.length - 1],
      percentages,
      minPercent: percentages[0],
      maxPercent: percentages[percentages.length - 1],
      knockoutChance: computeKnockoutChance(rolls, defenderMaxHp),
    };
  }
}
